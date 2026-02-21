import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    include: [
      "tests/systems/**/*.test.js",
      "tests/config/**/*.test.js",
      "tests/scenes/**/*.test.js",
    ],
  },
  resolve: {
    alias: {
      phaser: path.resolve("./tests/__mocks__/phaser.js"),
    },
  },
});
