import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    testTimeout: 15000,
    logHeapUsage: true,
    fileParallelism: true,
    expect: {
      poll: {
        timeout: 2000,
      }
    },
    include: ["**/*.spec.[jt]s?(x)"],
  },
});
