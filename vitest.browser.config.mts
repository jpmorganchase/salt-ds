import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { isCI } from "ci-info";
import { cssInline } from "css-inline-plugin";
import { defineConfig } from "vitest/config";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const browserDependencies = [
  "clipboard-copy",
  "deepmerge",
  "mockdate",
  "react-color",
  "react-window",
  "rifm",
  "storybook/test",
  "tinycolor2",
];

const distAliases: Record<string, string> = isCI
  ? {
      "@salt-ds/core": path.resolve(rootDir, "./dist/salt-ds-core"),
      "@salt-ds/countries": path.resolve(rootDir, "./dist/salt-ds-countries"),
      "@salt-ds/date-components": path.resolve(
        rootDir,
        "./dist/salt-ds-date-components",
      ),
      "@salt-ds/icons": path.resolve(rootDir, "./dist/salt-ds-icons"),
      "@salt-ds/lab": path.resolve(rootDir, "./dist/salt-ds-lab"),
      "@salt-ds/styles": path.resolve(rootDir, "./dist/salt-ds-styles"),
      "@salt-ds/window": path.resolve(rootDir, "./dist/salt-ds-window"),
    }
  : {};

export default defineConfig({
  plugins: [react(), cssInline()],
  define: {
    "process.env": {},
  },
  server: {
    watch: {
      ignored: ["**/coverage"],
    },
  },
  build: {
    sourcemap: !isCI,
  },
  resolve: {
    tsconfigPaths: true,
    alias: distAliases,
  },
  optimizeDeps: {
    include: [
      ...browserDependencies,
      ...(isCI
        ? [
            "@salt-ds/core",
            "@salt-ds/date-components",
            "@salt-ds/lab",
            "@salt-ds/icons",
            "@salt-ds/window",
          ]
        : []),
    ],
  },
  test: {
    fileParallelism: false,
    include: ["vitest-browser/**/*.browser.test.tsx"],
    setupFiles: ["./vitest-browser/setup.ts"],
    browser: {
      enabled: true,
      provider: playwright({
        launchOptions: {
          channel: "chrome",
        },
      }),
      instances: [{ browser: "chromium" }],
      viewport: { width: 1280, height: 1024 },
      screenshotDirectory: "vitest-browser/screenshots",
      screenshotFailures: true,
    },
  },
});
