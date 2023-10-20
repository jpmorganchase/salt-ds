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
      // let's increase the browser window size when running headlessly
      // this will produce higher resolution images and videos
      // https://on.cypress.io/browser-launch-api
      on(
        "before:browser:launch",
        (
          browser = {
            name: "",
            family: "chromium",
            channel: "",
            displayName: "",
            version: "",
            majorVersion: "",
            path: "",
            isHeaded: false,
            isHeadless: false,
          },
          launchOptions
        ) => {
          console.log(
            "launching browser %s is headless? %s",
            browser.name,
            browser.isHeadless
          );

          // the browser width and height we want to get
          // our screenshots and videos will be of that resolution
          const width = 1280;
          const height = 1024;

          console.log(
            "setting the browser window size to %d x %d",
            width,
            height
          );

          if (browser.name === "chrome" && browser.isHeadless) {
            launchOptions.args.push(`--window-size=${width},${height}`);

            // force screen to be non-retina and just use our given resolution
            launchOptions.args.push("--force-device-scale-factor=1");
          }

          if (browser.name === "electron" && browser.isHeadless) {
            // might not work on CI for some reason
            launchOptions.preferences.width = width;
            launchOptions.preferences.height = height;
            launchOptions.preferences.resizable = false;
          }

          if (browser.name === "firefox" && browser.isHeadless) {
            launchOptions.args.push(`--width=${width}`);
            launchOptions.args.push(`--height=${height}`);
          }

          // IMPORTANT: return the updated browser launch options
          return launchOptions;
        }
      );
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
