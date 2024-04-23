import path from "path";
import middy from "@middy/core";
import errorLogger from "@middy/error-logger";
import httpErrorHandler from "@middy/http-error-handler";
import {
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import csvParser from "csv-parser";

import s3ClientInstance from "../s3ClientInstance";

const lambdaHandler = async (event) => {
  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = record.s3.object.key;
    const getObjectCommand = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const response = await s3ClientInstance.send(getObjectCommand);

    console.info("Object: ", key);
    let rowCount = 0;

    await new Promise((resolve, reject) => {
      response.Body.pipe(csvParser())
        .on("data", (row) => {
          rowCount++;
          console.info("Row number: ", rowCount);
          console.info("Row: ", row);
        })
        .on("end", () => {
          console.info("Logged rows: ", rowCount);
          console.info("\n\n");
          resolve();
        })
        .on("error", (error) => reject(error));
    });

    // make a copy in 'parsed' folder
    const filename = path.basename(key);
    const copyDestination = `parsed/${filename}`;
    const copyObjectCommand = new CopyObjectCommand({
      Bucket: bucket,
      CopySource: `${bucket}/${key}`,
      Key: copyDestination,
    });
    await s3ClientInstance.send(copyObjectCommand);

    // remove the object from 'uploaded' folder
    const deleteObjectCommand = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    await s3ClientInstance.send(deleteObjectCommand);
  }
};

export default middy()
  .use(errorLogger())
  .use(httpErrorHandler())
  .handler(lambdaHandler);
