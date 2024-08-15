import path from "node:path";
import { defineConfig } from "@rspack/cli";
import { version as reactVersion } from "react";

const prod = true;

export default defineConfig({
  target: "browserslist",
  module: {
    rules: [
      {
        test: /\.png$/,
        type: "asset",
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
      {
        test: /packages\/.*\/src\/.*\.[tj]sx?$/,
        use: ["babel-loader"],
      },
      {
        test: /\.(j|t)s$/,
        exclude: [/[\\/]node_modules[\\/]/],
        loader: "builtin:swc-loader",
        options: {
          jsc: {
            parser: {
              syntax: "typescript",
            },
            externalHelpers: true,
            transform: {
              react: {
                runtime: "automatic",
                development: !prod,
                refresh: !prod,
              },
            },
          },
        },
      },
      {
        test: /\.(j|t)sx$/,
        loader: "builtin:swc-loader",
        exclude: [/[\\/]node_modules[\\/]/],
        options: {
          jsc: {
            parser: {
              syntax: "typescript",
              tsx: true,
            },
            transform: {
              react: {
                runtime: "automatic",
                development: !prod,
                refresh: !prod,
              },
            },
            externalHelpers: true,
          },
        },
      },
    ],
  },
  resolve: {
    tsConfig: {
      configFile: path.resolve(__dirname, "./tsconfig.json"),
      references: "auto",
    },
    alias: {
      react: path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
      "cypress/react18":
        reactVersion.startsWith("16") || reactVersion.startsWith("17")
          ? "cypress/react"
          : "cypress/react18",
      "@storybook/react-dom-shim":
        reactVersion.startsWith("16") || reactVersion.startsWith("17")
          ? "@storybook/react-dom-shim/dist/react-16"
          : "@storybook/react-dom-shim",
    },
    extensions: ["...", ".ts", ".tsx", ".js", ".jsx", ".css"],
  },
});
