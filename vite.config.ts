import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, "playwright/**"],
    include: ["**/*.spec.[jt]s?(x)"],
  },
  resolve: {
    tsconfigPaths: true,
  },
});
