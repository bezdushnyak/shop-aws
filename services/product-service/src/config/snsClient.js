import { SNSClient } from "@aws-sdk/client-sns";

const configureSNSClient = () => {
  if (process.env.IS_OFFLINE) return {};

  return new SNSClient({
    region: process.env.AWS_REGION,
  });
};

export default configureSNSClient();
