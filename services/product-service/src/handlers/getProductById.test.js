import { it, expect, vi } from "vitest";

import {
  getProductByIdUseCase,
  generateProductNotFoundError,
} from "./getProductById.js";
import ProductsGateway from "@data/dynamodb/ProductsGateway.js";

it("should return the product for valid product id", async () => {
  const productId = "ID";
  const expectedResult = {
    id: productId,
  };
  const productsGateway = new ProductsGateway();
  const getProductByIdSpy = vi
    .spyOn(productsGateway, "getProductById")
    .mockImplementation(() => expectedResult);

  const result = await getProductByIdUseCase({
    productId,
    productsGateway,
  });

  expect(getProductByIdSpy).toBeCalled();
  expect(getProductByIdSpy).toBeCalledWith(productId);
  expect(result).toEqual(expectedResult);
});

it("should throw not found error if product with specified productId doesn't exist", async () => {
  const notExistingProductId = "NOT_EXISTING_ID";
  const productsGateway = new ProductsGateway();
  const getProductByIdSpy = vi
    .spyOn(productsGateway, "getProductById")
    .mockImplementation(() => null);

  await expect(
    getProductByIdUseCase({ productId: notExistingProductId, productsGateway })
  ).rejects.toThrow(generateProductNotFoundError(notExistingProductId));
  expect(getProductByIdSpy).toBeCalled();
  expect(getProductByIdSpy).toBeCalledWith(notExistingProductId);
});
