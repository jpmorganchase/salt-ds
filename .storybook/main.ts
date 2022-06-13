import type { StorybookConfig } from "@storybook/react/types";
import type { UserConfig } from "vite";
import { mergeConfig } from "vite";
import PkgConfig from "vite-plugin-package-config";
import OptimizationPersist from "vite-plugin-optimize-persist";
import { cssVariableDocgen } from "css-variable-docgen-plugin";
import { typescriptTurbosnap } from "vite-plugin-typescript-turbosnap";

type ViteFinalOptions = {
  configType: "DEVELOPMENT" | "PRODUCTION";
};

interface ExtendedConfig extends StorybookConfig {
  viteFinal?: (
    config: UserConfig,
    options: ViteFinalOptions
  ) => Promise<UserConfig>;
}

const config: ExtendedConfig = {
  framework: "@storybook/react",
  stories: ["../packages/*/stories/**/*.stories.@(js|jsx|ts|tsx|mdx)"],
  staticDirs: ["../docs/public"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-a11y",
    {
      name: "@storybook/addon-essentials",
      options: {
        // We don't want the backgrounds addon as our own withThemeBackground works with theme switch to apply background
        backgrounds: false,
      },
    },
    "./theme-switch/preset", //👈 Custom theme switch on the toolbar
    // Keep in mind this is not v1 yet. Might encounter bugs. It's from atlassian labs, so not too much concern.
    // Temporarily disable this due to run time error "Cannot read property 'context' of undefined" from Topbar
    // 'storybook-addon-performance/register',
  ],
  core: {
    builder: "@storybook/builder-vite",
  },
  features: {
    postcss: false,
    // modernInlineRender: true,
    storyStoreV7: true,
    buildStoriesJson: true,
    // babelModeV7: true,
  },
  async viteFinal(config, { configType }) {
    // customize the Vite config here

    const customConfig: UserConfig = {
      plugins: [
        PkgConfig({
          packageJsonPath: "optimizedDeps.json",
        }),
        OptimizationPersist(),
        cssVariableDocgen(),
      ],
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
