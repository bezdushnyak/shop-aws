import { it, expect, vi } from "vitest";

import { createProductUseCase } from "./createProduct.js";
import ProductsGateway from "@data/dynamodb/ProductsGateway.js";

it("should create product without errors", async () => {
  const productId = "ID";
  const product = {
    id: productId,
  };
  const productsGateway = new ProductsGateway();
  const createProductSpy = vi
    .spyOn(productsGateway, "createProduct")
    .mockImplementation(() => product);
  const generateId = vi.fn().mockImplementation(() => productId);

  const result = await createProductUseCase({
    product: {},
    productsGateway,
    generateId,
  });

  expect(generateId).toBeCalled();
  expect(createProductSpy).toBeCalled();
  expect(createProductSpy).toBeCalledWith(product);
  expect(result).toEqual(product);
});
