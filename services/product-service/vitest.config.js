import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    alias: {
      "@data": path.resolve(__dirname, "./src/data/"),
    },
  },
});
