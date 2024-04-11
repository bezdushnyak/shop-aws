import { it, expect, vi } from "vitest";

import { getProductsUseCase } from "./getProductsList.js";
import ProductsGateway from "../data/dynamodb/ProductsGateway.js";

it("should return all products without errors", async () => {
  const expectedResult = Symbol("Result");
  const productsGateway = new ProductsGateway();
  const getAllProductsSpy = vi
    .spyOn(productsGateway, "getAllProducts")
    .mockImplementation(() => expectedResult);

  const result = await getProductsUseCase({ productsGateway });

  expect(getAllProductsSpy).toBeCalled();
  expect(result).toEqual(expectedResult);
});
