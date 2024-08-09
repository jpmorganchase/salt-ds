import { dirname, join } from "node:path";
import type { StorybookConfig } from "storybook-react-rsbuild";

const config: StorybookConfig = {
  framework: {
    name: getAbsolutePath("storybook-react-rsbuild"),
    options: {},
  },
  stories: ["../packages/*/stories/**/*.@(mdx|stories.@(js|jsx|ts|tsx))"],
  staticDirs: ["../docs/public"],
  typescript: {
    reactDocgen: "react-docgen-typescript",
  },
  addons: [
    {
      name: "@storybook/addon-essentials",
      options: {
        // We don't want the backgrounds addon as our own withThemeBackground works with theme switch to apply background
        backgrounds: false,
      },
    },
    getAbsolutePath("@storybook/addon-links"),
    getAbsolutePath("@storybook/addon-a11y"),
    getAbsolutePath("@storybook/addon-mdx-gfm"),
    getAbsolutePath("@storybook/addon-interactions"),
    getAbsolutePath("@storybook/addon-storysource"),
  ],
};

module.exports = config;

function getAbsolutePath<Value>(value: string): Value {
  return dirname(
    require.resolve(join(value, "package.json")),
  ) as unknown as Value;
}
