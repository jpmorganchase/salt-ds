import { defineConfig } from "vitest/config";
import browserConfig from "../../vitest.browser.config.mts";

export default defineConfig({
  ...browserConfig,
  test: {
    ...browserConfig.test,
    include: ["test/performance/list-controls.browser.test.tsx"],
    maxWorkers: 1,
    reporters: ["default"],
    silent: false,
    testTimeout: 120_000,
  },
});
