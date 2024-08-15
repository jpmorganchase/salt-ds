// @ts-ignore
import { defineConfig } from "cypress";
import { devServer } from "cypress-rspack-dev-server";
import { merge } from "webpack-merge";
// import installCoverageTask from "@cypress/code-coverage/task";

export default defineConfig({
  viewportWidth: 1280,
  viewportHeight: 1024,
  video: false,
  component: {
    setupNodeEvents(on, config) {
      // installCoverageTask(on, config);
      //Setting up a log task to allow logging to the console during an axe test because console.log() does not work directly in a test
      on("task", {
        log(message: string) {
          console.log(message);

          return null;
        },
      });

      return config;
    },
    devServer(devServerConfig) {
      return devServer({
        ...devServerConfig,
        framework: "react",
        rspackConfig: merge(require("./rspack.config").default, {
          experiments: {
            incremental: !devServerConfig.cypressConfig.isTextTerminal,
          },
        }),
      });
    },
    specPattern: "packages/**/src/**/*.cy.{js,ts,jsx,tsx}",
  },
});
