import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";
import { cssVariableDocgen } from "css-variable-docgen-plugin";
import { typescriptTurbosnap } from "vite-plugin-typescript-turbosnap";
import remarkGfm from "remark-gfm";
const config: StorybookConfig = {
  framework: "@storybook/react-vite",
  stories: ["../packages/*/stories/**/*.@(mdx|stories.@(js|jsx|ts|tsx|mdx))"],
  staticDirs: ["../docs/public"],
  addons: [
    {
      name: "@storybook/addon-essentials",
      options: {
        // We don't want the backgrounds addon as our own withThemeBackground works with theme switch to apply background
        backgrounds: false,
        docs: false,
      },
    },
    {
      name: "@storybook/addon-docs",
      options: {
        mdxCompileOptions: {
          remarkPlugins: [remarkGfm],
        },
      },
    },
    "@storybook/addon-links",
    "@storybook/addon-a11y",
    "@storybook/addon-storysource",
    // Keep in mind this is not v1 yet. Might encounter bugs. It's from atlassian labs, so not too much concern.
    // Temporarily disable this due to run time error "Cannot read property 'context' of undefined" from Topbar
    // 'storybook-addon-performance/register',
  ],

  async viteFinal(config, { configType }) {
    // customize the Vite config here

    const customConfig = {
      plugins: [cssVariableDocgen()],
    };
    if (configType === "PRODUCTION") {
      customConfig.plugins!.push(
        typescriptTurbosnap({
          rootDir: config.root!,
        })
      );
    }
    return mergeConfig(customConfig, config);
  },
};
export default config;
