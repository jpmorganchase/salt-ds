import { dirname, join } from "node:path";
import type { StorybookConfig } from "@storybook/react-vite";
import { cssVariableDocgen } from "css-variable-docgen-plugin";
import type { UserConfig } from "vite";
import { typescriptTurbosnap } from "vite-plugin-typescript-turbosnap";
import { cssInline } from "../tooling/css-inline-plugin";

const config: StorybookConfig = {
  framework: {
    name: getAbsolutePath("@storybook/react-vite"),
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
  async viteFinal(config, { configType }) {
    const { mergeConfig } = await import("vite");

    const customConfig: UserConfig = {
      plugins: [cssInline(), cssVariableDocgen()],
    };

    if (configType === "PRODUCTION" && config.root) {
      config.plugins = config.plugins?.filter(
        (p) =>
          !p ||
          !("name" in p) ||
          p?.name !== "storybook:rollup-plugin-webpack-stats",
      );
      customConfig.plugins?.push(typescriptTurbosnap({ rootDir: config.root }));
    }

    return mergeConfig(customConfig, config);
  },
};

module.exports = config;

function getAbsolutePath<Value>(value: string): Value {
  return dirname(
    require.resolve(join(value, "package.json")),
  ) as unknown as Value;
}
