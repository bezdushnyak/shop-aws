import middy from "@middy/core";
import errorLogger from "@middy/error-logger";
import httpCors from "@middy/http-cors";
import httpEventNormalizer from "@middy/http-event-normalizer";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";
import httpErrorHandler from "@middy/http-error-handler";
import { v4 as uuidv4 } from "uuid";

import { CORS_ORIGINS_WHITE_LIST } from "../cors.js";
import ProductsGateway from "@data/dynamodb/ProductsGateway.js";

export const createProductUseCase = async ({
  product,
  productsGateway,
  generateId,
}) => {
  product.id = generateId();
  return productsGateway.createProduct(product);
};

export const lambdaHandler = async (event) => {
  console.log("createProduct Lambda");
  console.log(`createProduct request - ${event}`);
  console.log(`createProduct body - ${event.body}`);

  const productsGateway = new ProductsGateway();
  const generateId = uuidv4;

  const product = await createProductUseCase({
    product: {
      title: event.body.title,
      description: event.body.description,
      price: event.body.price,
      count: event.body.count,
    },
    productsGateway,
    generateId,
  });

  return {
    statusCode: 201,
    body: JSON.stringify({
      product,
    }),
  };
};

const schema = {
  type: "object",
  required: ["body"],
  properties: {
    body: {
      type: "object",
      required: ["title", "description", "price", "count"],
      properties: {
        title: {
          type: "string",
        },
        description: {
          type: "string",
        },
        price: {
          type: "number",
        },
        count: {
          type: "number",
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
  .use(httpJsonBodyParser())
  .use(
    validator({
      eventSchema: transpileSchema(schema),
    })
  )
  .use(httpErrorHandler())
  .handler(lambdaHandler);
