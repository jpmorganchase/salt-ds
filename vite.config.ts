import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["**/*.spec.[jt]s?(x)", "scripts/**/*.spec.mjs"],
  },
  resolve: {
    tsconfigPaths: true,
  },
});
