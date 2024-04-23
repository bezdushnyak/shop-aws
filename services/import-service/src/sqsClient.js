import { SQSClient } from "@aws-sdk/client-sqs";

const configureSQSClient = () => {
  if (process.env.IS_OFFLINE) return {};

  return new SQSClient({
    region: process.env.AWS_REGION,
  });
};

export default configureSQSClient();
