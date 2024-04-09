import { dirname, join } from "path";
import type { StorybookConfig } from "@storybook/react-vite";
import type { UserConfig } from "vite";
import { cssVariableDocgen } from "css-variable-docgen-plugin";
import { typescriptTurbosnap } from "vite-plugin-typescript-turbosnap";
import { cssInline } from "../tooling/css-inline-plugin";

const config: StorybookConfig = {
  framework: {
    name: getAbsolutePath("@storybook/react-vite"),
    options: {},
  },
  stories: ["../packages/*/stories/**/*.stories.@(js|jsx|ts|tsx|mdx)"],
  staticDirs: ["../docs/public"],

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
    "@storybook/addon-storysource",
  ],
  async viteFinal(config, { configType }) {
    const { mergeConfig } = await import("vite");
    // customize the Vite config here

    const customConfig: UserConfig = {
      plugins: [cssInline(), cssVariableDocgen()],
    };

    if (configType === "PRODUCTION") {
      customConfig.plugins!.push(
        typescriptTurbosnap({ rootDir: config.root! })
      );
    }

    return mergeConfig(customConfig, config);
  },
};

module.exports = config;

function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, "package.json")));
}
