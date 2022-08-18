import { defineConfig } from "cypress";
import { addMatchImageSnapshotPlugin } from "cypress-image-snapshot/plugin";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import PkgConfig from "vite-plugin-package-config";
import OptimizationPersist from "vite-plugin-optimize-persist";
import IstanbulPlugin from "vite-plugin-istanbul";
import { isCI } from "ci-info";
import path from "path";
import { mergeConfig, UserConfig } from "vite";
// @ts-ignore
import installCoverageTask from "@cypress/code-coverage/task";

let viteConfig: UserConfig = {
  plugins: [
    react(),
    tsconfigPaths(),
    IstanbulPlugin(),
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
  build: {
    sourcemap: true,
  },
  resolve: {
    alias: {
      "cypress/react":
        process.env.REACT_VERSION === "18"
          ? "cypress/react18"
          : "cypress/react",
    },
  },
};
if (isCI) {
  viteConfig = mergeConfig(viteConfig, {
    resolve: {
      alias: {
        "@jpmorganchase/uitk-core": path.resolve(
          __dirname,
          "./dist/jpmorganchase-uitk-core"
        ),
        "@jpmorganchase/uitk-lab": path.resolve(
          __dirname,
          "./dist/jpmorganchase-uitk-lab"
        ),
        "@jpmorganchase/uitk-icons": path.resolve(
          __dirname,
          "./dist/jpmorganchase-uitk-icons"
        ),
      },
    },
    optimizeDeps: {
      include: [
        "@jpmorganchase/uitk-core",
        "@jpmorganchase/uitk-lab",
        "@jpmorganchase/uitk-icons",
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
      installCoverageTask(on, config);
      //Setting up a log task to allow logging to the console during an axe test because console.log() does not work directly in a test
      on("task", {
        log(message: string) {
          console.log(message);

          return null;
        },
      });
      addMatchImageSnapshotPlugin(on, config);
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
