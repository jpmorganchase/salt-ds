import { startDevServer } from "@cypress/vite-dev-server";
import react from "@vitejs/plugin-react";
// import IstanbulPlugin from "vite-plugin-istanbul";
import { addMatchImageSnapshotPlugin } from "cypress-image-snapshot/plugin";
// import installCoverageTask from "@cypress/code-coverage/task";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";
import isCi from "is-ci";
import OptimizationPersist from "vite-plugin-optimize-persist";
import PkgConfig from "vite-plugin-package-config";

// TODO re-enable code coverage when https://github.com/iFaxity/vite-plugin-istanbul/issues/8 is fixed

module.exports = (on, config) => {
  // installCoverageTask(on, config);

  on("dev-server:start", async (options) => {
    const viteConfig = {
      plugins: [
        react(),
        tsconfigPaths(),
        // IstanbulPlugin(),
        PkgConfig({
          packageJsonPath: "optimizedDeps.json",
        }),
        OptimizationPersist(),
      ],
      server: {
        watch: {
          ignored: ["**/coverage"],
        },
      },
    };

    if (isCi) {
      viteConfig.resolve = {
        alias: {
          "@brandname/core": path.resolve(
            __dirname,
            "../../dist/brandname-core"
          ),
          "@brandname/lab": path.resolve(__dirname, "../../dist/brandname-lab"),
          "@brandname/icons": path.resolve(
            __dirname,
            "../../dist/brandname-icons"
          ),
        },
      };
      viteConfig.optimizeDeps = {
        include: ["@brandname/core", "@brandname/lab", "@brandname/icons"],
      };
    }

    return startDevServer({
      options,
      viteConfig,
    });
  });

  //Setting up a log task to allow logging to the console during an axe test because console.log() does not work directly in a test
  on("task", {
    log(message) {
      console.log(message);

      return null;
    },
  });
  addMatchImageSnapshotPlugin(on, config);

  return config;
};
