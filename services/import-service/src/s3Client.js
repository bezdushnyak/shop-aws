import { S3Client } from "@aws-sdk/client-s3";

const configureS3Client = () => {
  let configuration = {
    region: process.env.AWS_REGION,
  };

  if (process.env.IS_OFFLINE) {
    configuration.forcePathStyle = true;
    configuration.credentials = {
      accessKeyId: "S3RVER",
      secretAccessKey: "S3RVER",
    };
    configuration.endpoint = "http://localhost:7777";
  }

  return new S3Client(configuration);
};

export default configureS3Client();
