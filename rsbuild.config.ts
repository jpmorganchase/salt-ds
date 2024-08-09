import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";

export default defineConfig({
  plugins: [pluginReact()],
  tools: {
    rspack(config) {
      config.experiments = {
        ...config.experiments,
        lazyCompilation: config.mode === "development",
      };
    },
  },
});
