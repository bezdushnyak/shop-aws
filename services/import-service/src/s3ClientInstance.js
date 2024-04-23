import { S3Client } from "@aws-sdk/client-s3";

const configureS3Client = () => {
  let configuration = {
    region: process.env.AWS_REGION,
  };

  if (process.env.IS_OFFLINE) {
    configuration.forcePathStyle = true;
    configuration.credentials = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    };
    configuration.endpoint = "http://localhost:7777";
  }

  return new S3Client(configuration);
};

export default configureS3Client();
