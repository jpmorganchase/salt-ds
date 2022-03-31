const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const { ProvidePlugin } = require("webpack");

module.exports = [
  new ForkTsCheckerWebpackPlugin(),
  new ProvidePlugin({
    React: "react",
  }),
];
