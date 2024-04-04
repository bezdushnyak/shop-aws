import middy from "@middy/core";
import errorLogger from "@middy/error-logger";
import httpErrorHandler from "@middy/http-error-handler";
import httpCors from "@middy/http-cors";

import { CORS_ORIGINS_WHITE_LIST } from "../cors.js";
import ProductsGateway from "@data/dynamodb/ProductsGateway.js";

export const getProductsUseCase = async ({ productsGateway }) => {
  return productsGateway.getAllProducts();
};

export const lambdaHandler = async (event) => {
  console.log("getProducts Lambda");
  console.log(`createProduct request - ${event}`);

  const productsGateway = new ProductsGateway();
  const products = await getProductsUseCase({ productsGateway });

  return {
    statusCode: 200,
    body: JSON.stringify(products),
  };
};

export default middy()
  .use(errorLogger())
  .use(
    httpCors({
      origins: CORS_ORIGINS_WHITE_LIST,
    })
  )
  .use(httpErrorHandler())
  .handler(lambdaHandler);
