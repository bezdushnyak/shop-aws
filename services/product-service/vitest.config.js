import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    alias: {
      "@data": path.resolve(__dirname, "./src/data/"),
      "@config": path.resolve(__dirname, "./src/config/"),
      "@services": path.resolve(__dirname, "./src/services/"),
    },
  },
});
