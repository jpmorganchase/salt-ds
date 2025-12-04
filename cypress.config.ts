import path from "node:path";
import installCoverageTask from "@cypress/code-coverage/task.js";
import react from "@vitejs/plugin-react";
import { isCI } from "ci-info";
import { cssInline } from "css-inline-plugin";
import { defineConfig } from "cypress";
import { version as reactVersion } from "react";
import type { UserConfig } from "vite";
import IstanbulPlugin from "vite-plugin-istanbul";
import tsconfigPaths from "vite-tsconfig-paths";

async function getViteConfig(config: UserConfig) {
  const { mergeConfig } = await import("vite");
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
        "cypress/react": !(
          reactVersion.startsWith("16") || reactVersion.startsWith("17")
        )
          ? "cypress/react"
          : "@cypress/react",
      },
    },
  };

  if (reactVersion.startsWith("16") || reactVersion.startsWith("17")) {
    viteConfig = mergeConfig(viteConfig, {
      resolve: {
        alias: {
          "@storybook/react-dom-shim":
            "@storybook/react-dom-shim/dist/react-16",
        },
      },
    });
  }

  if (isCI) {
    viteConfig = mergeConfig(viteConfig, {
      resolve: {
        alias: {
          "@salt-ds/core": path.resolve(__dirname, "./dist/salt-ds-core"),
          "@salt-ds/countries": path.resolve(
            __dirname,
            "./dist/salt-ds-countries",
          ),
          "@salt-ds/data-grid": path.resolve(
            __dirname,
            "./dist/salt-ds-data-grid",
          ),
          "@salt-ds/icons": path.resolve(__dirname, "./dist/salt-ds-icons"),
          "@salt-ds/lab": path.resolve(__dirname, "./dist/salt-ds-lab"),
          "@salt-ds/styles": path.resolve(__dirname, "./dist/salt-ds-styles"),
          "@salt-ds/window": path.resolve(__dirname, "./dist/salt-ds-window"),
        },
      },
      optimizeDeps: {
        include: [
          "@salt-ds/core",
          "@salt-ds/data-grid",
          "@salt-ds/lab",
          "@salt-ds/icons",
          "@salt-ds/window",
        ],
      },
    } as UserConfig);
  }

  return mergeConfig(config, viteConfig);
}

export default defineConfig({
  viewportWidth: 1280,
  viewportHeight: 1024,
  video: false,
  component: {
    setupNodeEvents(on, config) {
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
      viteConfig: getViteConfig,
    },
    specPattern: "packages/**/src/**/*.cy.{js,ts,jsx,tsx}",
  },
});
