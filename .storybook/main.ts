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
    "@storybook/addon-storysource",
  ],
  async viteFinal(config, { configType }) {
    // https://github.com/storybookjs/storybook/issues/26532 - package-deduplication breaks ag-grid-react.
    const fixedConfig = {
      ...config,
      plugins: config.plugins?.filter(
        // @ts-ignore
        (plugin) => plugin?.name !== "storybook:package-deduplication"
      ),
    };

    const customConfig: UserConfig = {
      plugins: [cssInline(), cssVariableDocgen()],
    };

    if (configType === "PRODUCTION") {
      customConfig.plugins!.push(
        typescriptTurbosnap({ rootDir: config.root! })
      );
    }

    return mergeConfig(customConfig, fixedConfig);
  },
};

module.exports = config;

function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, "package.json")));
}
