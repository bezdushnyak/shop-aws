import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const getDynamodbClient = () => {
  if (process.env.IS_OFFLINE) {
    return new DynamoDBClient({
      region: "localhost",
      endpoint: "http://localhost:8000",
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
    });
  }

  return new DynamoDBClient();
};

const dynamodbClient = getDynamodbClient();
export default dynamodbClient;
