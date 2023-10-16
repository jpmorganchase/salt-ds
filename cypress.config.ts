import { defineConfig } from "cypress";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import IstanbulPlugin from "vite-plugin-istanbul";
import { isCI } from "ci-info";
import path from "path";
import { mergeConfig, UserConfig } from "vite";
import { version as reactVersion } from "react";
// @ts-ignore
import installCoverageTask from "@cypress/code-coverage/task";
import { cssInline } from "css-inline-plugin";
import { initPlugin } from "@frsource/cypress-plugin-visual-regression-diff/plugins";

let viteConfig: UserConfig = {
  plugins: [react(), tsconfigPaths(), IstanbulPlugin(), cssInline()],
  define: {
    "process.env": {},
  },
  server: {
    watch: {
      ignored: ["**/coverage"],
    },
  },
  build: {
    sourcemap: true,
  },
  resolve: {
    alias: {
      "cypress/react18": reactVersion.startsWith("18")
        ? "cypress/react18"
        : "cypress/react",
    },
  },
};
if (isCI) {
  viteConfig = mergeConfig(viteConfig, {
    resolve: {
      alias: {
        "@salt-ds/core": path.resolve(__dirname, "./dist/salt-ds-core"),
        "@salt-ds/data-grid": path.resolve(
          __dirname,
          "./dist/salt-ds-data-grid"
        ),
        "@salt-ds/lab": path.resolve(__dirname, "./dist/salt-ds-lab"),
        "@salt-ds/icons": path.resolve(__dirname, "./dist/salt-ds-icons"),
      },
    },
    optimizeDeps: {
      include: [
        "@salt-ds/core",
        "@salt-ds/data-grid",
        "@salt-ds/lab",
        "@salt-ds/icons",
      ],
    },
  } as UserConfig);
}

export default defineConfig({
  viewportWidth: 1280,
  viewportHeight: 1024,
  video: false,
  e2e: {
    setupNodeEvents(on, config) {
      initPlugin(on, config);
    },
  },
  component: {
    setupNodeEvents(on, config) {
      initPlugin(on, config);
      installCoverageTask(on, config);
      //Setting up a log task to allow logging to the console during an axe test because console.log() does not work directly in a test
      on("task", {
        log(message: string) {
          console.log(message);

          return null;
        },
      });
      return config;
    },
    devServer: {
      framework: "react",
      bundler: "vite",
      viteConfig,
    },
    specPattern: "packages/**/src/**/*.cy.{js,ts,jsx,tsx}",
  },
});
