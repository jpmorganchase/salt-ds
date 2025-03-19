import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    testTimeout: 15_000,
    logHeapUsage: true,
    expect: {
      poll: {
        timeout: 2000,
      }
    },
    poolOptions: {
      threads: {
        useAtomics: true, // Set to true or false as needed
      },
    },
    include: ["**/*.spec.[jt]s?(x)"],
  },
});
