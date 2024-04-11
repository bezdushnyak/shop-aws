import {
  ScanCommand,
  TransactGetItemsCommand,
  TransactWriteItemsCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

import dynamodbClient from "./dynamodbClientInstance";

class ProductsGateway {
  productsTableName = "products";
  stocksTableName = "stocks";

  async scanItems(tableName) {
    const command = new ScanCommand({ TableName: tableName });
    return dynamodbClient.send(command);
  }

  unmarshallItems(items) {
    return items.map((item) => unmarshall(item));
  }

  async getAllProducts() {
    const productsPromise = this.scanItems(this.productsTableName);
    const stocksPromise = this.scanItems(this.stocksTableName);

    const productsResponse = await productsPromise;
    const stocksResponse = await stocksPromise;

    const products = this.unmarshallItems(productsResponse.Items);
    const stocks = this.unmarshallItems(stocksResponse.Items);

    return products.map((product) => ({
      ...product,
      count: stocks.find((stock) => stock.productId === product.id).count,
    }));
  }

  async getProductById(id) {
    const command = new TransactGetItemsCommand({
      TransactItems: [
        {
          Get: {
            TableName: this.productsTableName,
            Key: marshall({ id }),
          },
        },
        {
          Get: {
            TableName: this.stocksTableName,
            Key: marshall({ productId: id }),
          },
        },
      ],
    });
    const response = await dynamodbClient.send(command);
    const [productResponse, stockResponse] = response.Responses;

    if (!productResponse.Item || !stockResponse.Item) return null;

    const product = unmarshall(productResponse.Item);
    const stock = unmarshall(stockResponse.Item);
    product.count = stock.count;

    return product;
  }

  async createProduct(product) {
    const command = new TransactWriteItemsCommand({
      TransactItems: [
        {
          Put: {
            TableName: this.productsTableName,
            Item: marshall({
              id: product.id,
              title: product.title,
              description: product.description,
              price: product.price,
            }),
          },
        },
        {
          Put: {
            TableName: this.stocksTableName,
            Item: marshall({
              productId: product.id,
              count: product.count,
            }),
          },
        },
      ],
    });
    await dynamodbClient.send(command);
    return product;
  }
}

export default ProductsGateway;
