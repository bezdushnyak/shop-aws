import middy from "@middy/core";
import errorLogger from "@middy/error-logger";
import httpCors from "@middy/http-cors";
import httpEventNormalizer from "@middy/http-event-normalizer";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";
import httpErrorHandler from "@middy/http-error-handler";
import createError from "http-errors";

import { CORS_ORIGINS_WHITE_LIST } from "../cors.js";
import ProductsGateway from "@data/dynamodb/ProductsGateway.js";

export const generateProductNotFoundError = (productId) =>
  new createError.NotFound(`Product with id '${productId}' is not found`);

export const getProductByIdUseCase = async ({ productId, productsGateway }) => {
  const product = await productsGateway.getProductById(productId);
  if (!product) {
    throw generateProductNotFoundError(productId);
  }
  return product;
};

export const lambdaHandler = async (event) => {
  console.log("getProductById Lambda");
  console.log(`getProductById request - ${event}`);
  console.log(`getProductById pathParameters - ${event.pathParameters}`);

  const { productId } = event.pathParameters;
  const productsGateway = new ProductsGateway();

  const product = await getProductByIdUseCase({
    productId,
    productsGateway,
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      product,
    }),
  };
};

const schema = {
  type: "object",
  required: ["pathParameters"],
  properties: {
    pathParameters: {
      type: "object",
      required: ["productId"],
      properties: {
        productId: {
          type: "string",
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
  .use(
    validator({
      eventSchema: transpileSchema(schema),
    })
  )
  .use(httpErrorHandler())
  .handler(lambdaHandler);
