import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { availableParallelism } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { isCI } from "ci-info";
import { cssInline } from "css-inline-plugin";
import type { Plugin } from "vite";
import { defineConfig } from "vitest/config";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const rootTsconfig = JSON.parse(
  readFileSync(path.join(rootDir, "tsconfig.json"), "utf8"),
) as {
  compilerOptions?: {
    paths?: Record<string, string[]>;
  };
};
const rootDevelopmentPaths = Object.entries(
  rootTsconfig.compilerOptions?.paths ?? {},
).filter(
  ([alias]) =>
    alias.startsWith("~") || (!isCI && alias.startsWith("@salt-ds/")),
);
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

type Alias = {
  find: string | RegExp;
  replacement: string;
};

const rootDevelopmentPathsPlugin = (): Plugin => ({
  name: "salt-root-development-paths",
  enforce: "pre",
  async resolveId(source, importer, options) {
    for (const [pattern, replacements] of rootDevelopmentPaths) {
      const wildcardIndex = pattern.indexOf("*");
      if (wildcardIndex === -1 && source !== pattern) {
        continue;
      }

      const [prefix, suffix = ""] = pattern.split("*");
      if (!source.startsWith(prefix) || !source.endsWith(suffix)) {
        continue;
      }

      const wildcard = source.slice(
        prefix.length,
        source.length - suffix.length,
      );
      for (const replacement of replacements) {
        const candidate = path.resolve(
          rootDir,
          replacement.replace("*", wildcard),
        );
        const resolved = await this.resolve(candidate, importer, {
          ...options,
          skipSelf: true,
        });
        if (resolved) {
          return resolved;
        }
      }
    }
  },
});

const distAliases: Alias[] = isCI
  ? [
      ["core", "core/dist-es/index.js"],
      ["countries", "countries/dist-es/index.js"],
      ["date-adapters", "date-adapters/dist-es/types/index.js"],
      ["date-components", "date-components/dist-es/index.js"],
      ["embla-carousel", "embla-carousel/dist-es/index.js"],
      ["icons", "icons/dist-es/index.js"],
      ["lab", "lab/dist-es/index.js"],
      ["styles", "styles/dist-es/index.js"],
      ["window", "window/dist-es/index.js"],
    ]
      .map(([packageName, outputPath]) => ({
        find: new RegExp(`^@salt-ds/${packageName}$`),
        replacement: path.resolve(rootDir, `./packages/${outputPath}`),
      }))
      .concat(
        ["date-fns-tz", "date-fns", "dayjs", "luxon", "moment"].map(
          (adapterName) => ({
            find: new RegExp(`^@salt-ds/date-adapters/${adapterName}$`),
            replacement: path.resolve(
              rootDir,
              `./packages/date-adapters/dist-es/${adapterName}/index.js`,
            ),
          }),
        ),
      )
  : [];

const legacyReactAliases: Alias[] =
  reactMajorVersion < 18
    ? [
        {
          // vitest-browser-react uses react-dom/client, which only exists in
          // React 18+. Keep the same small render contract for Salt's 16/17 lane.
          find: "vitest-browser-react",
          replacement: path.resolve(
            rootDir,
            "./test/browser/legacy-react-renderer.tsx",
          ),
        },
      ]
    : [];

export default defineConfig({
  plugins: [rootDevelopmentPathsPlugin(), react(), cssInline()],
  define: {
    "process.env": {},
  },
  build: {
    sourcemap: !isCI,
  },
  resolve: {
    tsconfigPaths: !isCI,
    alias: [...distAliases, ...legacyReactAliases],
  },
  optimizeDeps: {
    include: [
      ...browserDependencies,
      ...(isCI
        ? [
            "@salt-ds/core",
            "@salt-ds/date-adapters",
            "@salt-ds/date-components",
            "@salt-ds/embla-carousel",
            "@salt-ds/lab",
            "@salt-ds/icons",
            "@salt-ds/window",
          ]
        : []),
    ],
  },
  test: {
    expect: {
      // Allow enough time for animations to settle when several browser files
      // are competing for CPU.
      poll: {
        timeout: 5_000,
      },
    },
    fileParallelism: true,
    // Each worker drives a full browser. Six retains parallel throughput without
    // the CPU saturation observed at eight; the CLI can still override it.
    maxWorkers: Math.min(6, availableParallelism()),
    include: [
      "test/browser/**/*.browser.test.tsx",
      "packages/*/src/__tests__/__e2e__/**/*.browser.test.tsx",
    ],
    setupFiles: ["./test/browser/setup.ts"],
    browser: {
      enabled: true,
      provider: playwright({
        launchOptions: {
          channel: "chrome",
        },
      }),
      instances: [{ browser: "chromium" }],
      viewport: { width: 1280, height: 1024 },
      screenshotDirectory: "test/browser/screenshots",
      screenshotFailures: true,
    },
  },
});
