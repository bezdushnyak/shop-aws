import middy from "@middy/core";
import errorLogger from "@middy/error-logger";
import httpErrorHandler from "@middy/http-error-handler";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";
import { v4 as uuidv4 } from "uuid";

import ProductsGateway from "@data/dynamodb/ProductsGateway";
import NotifyService from "@services/NotifyService";
import { createProductUseCase } from "./createProduct";

const sum = (nums) => nums.reduce((acc, num) => acc + num, 0);

const generateMessage = (products, sumPrice) => {
  let message = "";
  message += "New products were added to the store!\n\n";
  message += JSON.stringify(products);
  message += "\n\n";
  message += `Sum price = ${sumPrice}`;
  return message;
};

export const createProductsAndNotifyUsersUseCase = async ({
  products,
  createProduct,
  notifyService,
}) => {
  const createProductPromises = products.map((product) =>
    createProduct(product)
  );
  await Promise.all(createProductPromises);
  const sumPrice = sum(products.map((product) => product.price));
  const message = generateMessage(products, sumPrice);
  await notifyService.publishProductsSuccessCreateMessage({
    message,
    sumPrice,
  });
};

const parseProducts = (event) =>
  event.Records.map((record) => JSON.parse(record.body)).map((product) => ({
    title: product.title,
    description: product.description,
    price: Number(product.price),
    count: Number(product.count),
  }));

export const lambdaHandler = async (event) => {
  const productsGateway = new ProductsGateway();
  const notifyService = new NotifyService();
  const products = parseProducts(event);

  const createProduct = (product) =>
    createProductUseCase({ product, productsGateway, generateId: uuidv4 });

  await createProductsAndNotifyUsersUseCase({
    products,
    createProduct,
    notifyService,
  });
};

const schema = {
  type: "object",
  required: ["Records"],
  properties: {
    Records: {
      type: "array",
      items: {
        type: "object",
        required: ["body"],
        properties: {
          body: {
            type: "string",
          },
        },
      },
    },
  },
};

export default middy()
  .use(errorLogger())
  .use(
    validator({
      eventSchema: transpileSchema(schema),
    })
  )
  .use(httpErrorHandler())
  .handler(lambdaHandler);
