import AWS from "aws-sdk";

import products from "./seedData/products.json";
import stocks from "./seedData/stocks.json";

const dynamodbClient = new AWS.DynamoDB.DocumentClient({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

const chunkArray = (array, chunkSize) => {
  let results = [];
  while (array.length) {
    results.push(array.splice(0, chunkSize));
  }
  return results;
};

const seedData = (items, tableName, chunkSize = 25) => {
  const requests = items.map((item) => {
    return { PutRequest: { Item: item } };
  });

  const chunks = chunkArray(requests, chunkSize);

  chunks.forEach(async (chunk, chunkIndex) => {
    try {
      await dynamodbClient
        .batchWrite({ RequestItems: { [tableName]: chunk } })
        .promise();

      console.log(
        `Table - ${tableName}: Chunk #${chunkIndex} has written successfully`
      );
    } catch (err) {
      console.error(err);
    }
  });
};

seedData(products, "products");
seedData(stocks, "stocks");
