import middy from "@middy/core";
import errorLogger from "@middy/error-logger";
import httpCors from "@middy/http-cors";
import httpEventNormalizer from "@middy/http-event-normalizer";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";
import httpErrorHandler from "@middy/http-error-handler";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { CORS_ORIGINS_WHITE_LIST } from "../cors.js";
import s3Client from "../s3Client.js";

const getFilePath = (fileName) => `uploaded/${fileName}`;

const lambdaHandler = async (event) => {
  const { name } = event.queryStringParameters;

  const s3Params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: getFilePath(name),
    ContentType: "text/csv",
  };
  const command = new PutObjectCommand(s3Params);
  const signedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 60,
  });

  return {
    statusCode: 200,
    body: JSON.stringify(signedUrl),
  };
};

const schema = {
  type: "object",
  required: ["queryStringParameters"],
  properties: {
    queryStringParameters: {
      type: "object",
      required: ["name"],
      properties: {
        name: {
          type: "string",
        },
      },
    },
  },
};

export default middy()
  .use(errorLogger())
  .use(
    httpCors({
      origins: CORS_ORIGINS_WHITE_LIST,
    })
  )
  .use(httpEventNormalizer())
  .use(
    validator({
      eventSchema: transpileSchema(schema),
    })
  )
  .use(httpErrorHandler())
  .handler(lambdaHandler);
