import { defineConfig } from "@rslib/core";
import { pluginReact } from "@rsbuild/plugin-react";

export default defineConfig({
  plugins: [pluginReact()],
  tools: {
    bundlerChain(chain) {
      // remove rsbuild builtin css rules
      chain.module.rules.delete("css");
    },
    lightningcssLoader: false,
    rspack: {
      module: {
        rules: [
          {
            test: /\.css$/,
            use: ["style-loader", "css-loader", "postcss-loader"],
          },
        ],
      },
      optimization: {
        concatenateModules: false,
      },
    },
  },
  lib: [
    {
      dts: {
        bundle: false,
      },
      bundle: false,
      format: "esm",
      syntax: ["es2021"],
      output: {
        cleanDistPath: true,
        distPath: {
          root: "../../dist/salt-ds-core/dist-esm",
        },
      },
    },
    {
      dts: {
        bundle: false,
      },
      bundle: false,
      format: "cjs",
      syntax: ["es2021"],
      output: {
        cleanDistPath: true,
        distPath: {
          root: "../../dist/salt-ds-core/dist-cjs",
        },
      },
    },
  ],
  source: {
    entry: {
      index: [
        "./src/?!(__tests__)/*.ts",
        "./src/?!(__tests__)/*.tsx",
        "./src/index.ts",
      ],
    },
    tsconfigPath: "./tsconfig.json",
  },
  output: {
    target: "web",
  },
});
