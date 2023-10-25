import { defineConfig, Options } from "tsup";

const commonOptions: Options = {
  entry: ["src/**/*.ts"],
  esbuildOptions: (options) => {
    options.assetNames = "[dir]/[name]";
  },
  skipNodeModulesBundle: true,
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: true,
  external: ["*.css"],
  injectStyle: false,
  loader: {
    ".css": "text",
  },
};

export default defineConfig([
  {
    format: "cjs",
    outDir: "dist/cjs",
    ...commonOptions,
  },
  {
    format: "esm",
    outDir: "dist/esm",
    ...commonOptions,
  },
]);
