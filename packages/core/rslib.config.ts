import { pluginReact } from "@rsbuild/plugin-react";
import { defineConfig, type LibConfig } from "@rslib/core";
import type { ExternalItem } from "@rspack/core";

const common: LibConfig = {
  dts: {
    bundle: false,
    tsgo: true,
  },
  bundle: false,
  syntax: ["es2021"],
};

const externalizeCss: ExternalItem = ({ request }, callback) => {
  if (request?.endsWith(".css?inline") || request?.endsWith(".css?raw")) {
    return callback(undefined, false);
  }

  callback();
};

export default defineConfig({
  plugins: [pluginReact()],
  tools: {
    lightningcssLoader: false,
    bundlerChain: (chain, { CHAIN_ID }) => {
      const rule = chain.module.rules.get(CHAIN_ID.RULE.CSS_INLINE);
      if (rule) {
        // remove css-loader
        rule.uses.delete(CHAIN_ID.USE.CSS);
        rule.type("asset/source");
      }
    },
  },
  lib: [
    {
      ...common,
      format: "esm",
      experiments: {
        advancedEsm: true,
      },
      output: {
        cleanDistPath: true,
        distPath: {
          root: "../../dist/salt-ds-core/dist-esm",
        },
        externals: [externalizeCss],
      },
    },
    {
      ...common,
      format: "cjs",
      output: {
        cleanDistPath: true,
        distPath: {
          root: "../../dist/salt-ds-core/dist-cjs",
        },
        externals: [externalizeCss],
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
