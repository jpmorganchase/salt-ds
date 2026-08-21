import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { isCI } from "ci-info";
import { cssInline } from "css-inline-plugin";
import { defineConfig } from "vite";

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
  resolve: {
    alias: distAliases,
    tsconfigPaths: true,
  },
  optimizeDeps: {
    include: [
      ...browserDependencies,
      ...(isCI
        ? [
            "@salt-ds/core",
            "@salt-ds/date-components",
            "@salt-ds/icons",
            "@salt-ds/lab",
            "@salt-ds/window",
          ]
        : []),
    ],
  },
  server: {
    host: "127.0.0.1",
    port: 4174,
    strictPort: true,
    watch: {
      ignored: ["**/coverage", "**/playwright-report", "**/test-results"],
    },
  },
});
