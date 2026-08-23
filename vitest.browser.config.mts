import { createRequire } from "node:module";
import { availableParallelism } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { isCI } from "ci-info";
import { cssInline } from "css-inline-plugin";
import { defineConfig } from "vitest/config";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const reactMajorVersion = Number.parseInt(
  (require("react/package.json") as { version: string }).version,
  10,
);
const browserDependencies = [
  "@floating-ui/dom",
  "clipboard-copy",
  "deepmerge",
  "embla-carousel-class-names",
  "mockdate",
  "react-color",
  "react-hotkeys-hook",
  "react-resizable-panels",
  "react-router",
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

const legacyReactAliases: Record<string, string> =
  reactMajorVersion < 18
    ? {
        // vitest-browser-react uses react-dom/client, which only exists in
        // React 18+. Keep the same small render contract for Salt's 16/17 lane.
        "vitest-browser-react": path.resolve(
          rootDir,
          "./vitest-browser/legacy-react-renderer.tsx",
        ),
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
    alias: {
      ...distAliases,
      ...legacyReactAliases,
    },
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
    expect: {
      // Match Cypress's retry window closely enough for animations to settle
      // when several browser files are competing for CPU.
      poll: {
        timeout: 5_000,
      },
    },
    fileParallelism: true,
    // Each worker drives a full browser. Six retains parallel throughput without
    // the CPU saturation observed at eight; the CLI can still override it.
    maxWorkers: Math.min(6, availableParallelism()),
    include: ["vitest-browser/**/*.browser.test.tsx"],
    setupFiles: ["./vitest-browser/setup.ts"],
    coverage: {
      provider: "v8",
      include: [
        "packages/{core,countries,date-adapters,date-components,embla-carousel,icons,lab,styles,window}/src/**/*.{ts,tsx}",
      ],
      exclude: [
        "**/*.d.ts",
        "**/__tests__/**",
        "packages/icons/src/components/**",
        "packages/countries/src/components/**",
        "packages/countries/src/{countryComponentMap,countryMetaMap}.ts",
        "packages/countries/src/lazy-country-symbol/lazyMap.ts",
      ],
    },
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
