import { defineConfig } from "cypress";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import IstanbulPlugin from "vite-plugin-istanbul";
import { UserConfig } from "vite";
// @ts-ignore
import installCoverageTask from "@cypress/code-coverage/task";

const viteConfig: UserConfig = {
  plugins: [
    react(),
    tsconfigPaths(),
    // IstanbulPlugin({ include: "packages/*", cypress: true }),
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
      viteConfig,
    },
    specPattern: "packages/**/src/**/*.cy.{js,ts,jsx,tsx}",
  },
});
