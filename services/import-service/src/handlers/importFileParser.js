import path from "path";
import middy from "@middy/core";
import errorLogger from "@middy/error-logger";
import httpErrorHandler from "@middy/http-error-handler";
import {
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { GetQueueUrlCommand, SendMessageCommand } from "@aws-sdk/client-sqs";
import csvParser from "csv-parser";

import s3Client from "../s3Client";
import sqsClient from "../sqsClient";

const isOffline = process.env.IS_OFFLINE;

const getCSVObject = async (bucket, key) => {
  const getObjectCommand = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  return await s3Client.send(getObjectCommand);
};

const getSQSQueueUrl = async () => {
  if (isOffline) return;

  const getQueueUrlCommand = new GetQueueUrlCommand({
    QueueName: process.env.AWS_SQS_QUEUE_NAME,
  });
  const getUrlResponse = await sqsClient.send(getQueueUrlCommand);
  return getUrlResponse.QueueUrl;
};

const sendSQSEvent = (queueUrl, product) => {
  if (isOffline) return;

  const sendMessageCommand = new SendMessageCommand({
    QueueUrl: queueUrl,
    MessageBody: JSON.stringify(product),
  });
  sqsClient.send(sendMessageCommand);
};

const copyObjectToFolder = async (folder, bucket, key) => {
  const filename = path.basename(key);
  const copyDestination = `${folder}/${filename}`;
  const copyObjectCommand = new CopyObjectCommand({
    Bucket: bucket,
    CopySource: `${bucket}/${key}`,
    Key: copyDestination,
  });
  await s3Client.send(copyObjectCommand);
};

const deleteObject = async (bucket, key) => {
  const deleteObjectCommand = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  await s3Client.send(deleteObjectCommand);
};

const lambdaHandler = async (event) => {
  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = record.s3.object.key;

    const csvObjectPromise = getCSVObject(bucket, key);
    const queueUrlPromise = getSQSQueueUrl();

    const csvObject = await csvObjectPromise;
    const queueUrl = await queueUrlPromise;

    await new Promise((resolve, reject) => {
      csvObject.Body.pipe(csvParser())
        .on("data", (product) => sendSQSEvent(queueUrl, product))
        .on("end", () => {
          resolve();
        })
        .on("error", (error) => reject(error));
    });

    await copyObjectToFolder("parsed", bucket, key);
    await deleteObject(bucket, key);
  }
};

export default middy()
  .use(errorLogger())
  .use(httpErrorHandler())
  .handler(lambdaHandler);
