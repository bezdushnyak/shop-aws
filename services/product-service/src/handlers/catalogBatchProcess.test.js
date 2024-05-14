import { it, expect, vi } from "vitest";

import { createProductsAndNotifyUsersUseCase } from "./catalogBatchProcess.js";
import NotifyService from "@services/NotifyService";

it("should create products and notify users without errors", async () => {
  const products = [{ price: 2 }, { price: 3 }, { price: 2 }];
  const notifyService = new NotifyService();
  const publishProductsSuccessCreateMessageSpy = vi
    .spyOn(notifyService, "publishProductsSuccessCreateMessage")
    .mockImplementation(() => Promise.resolve());
  const createProduct = vi.fn().mockImplementation((product) => product);

  await createProductsAndNotifyUsersUseCase({
    products,
    createProduct,
    notifyService,
  });

  expect(createProduct).toBeCalled();
  expect(createProduct).toBeCalledTimes(products.length);
  expect(publishProductsSuccessCreateMessageSpy).toBeCalled();
});
