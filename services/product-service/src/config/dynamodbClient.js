import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const getDynamodbClient = () => {
  let configuration = {
    region: process.env.AWS_REGION,
  };

  if (process.env.IS_OFFLINE) {
    configuration = {
      endpoint: "http://localhost:8000",
      region: "localhost",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    };
  }

  return new DynamoDBClient(configuration);
};

export default getDynamodbClient();
