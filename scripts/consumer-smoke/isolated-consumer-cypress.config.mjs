import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "cypress";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);

export default defineConfig({
  allowCypressEnv: false,
  video: false,
  viewportWidth: 1280,
  viewportHeight: 720,
  e2e: {
    setupNodeEvents(on, config) {
      on("task", {
        readAxeSource() {
          return fs.readFileSync(
            path.join(repoRoot, "node_modules", "axe-core", "axe.min.js"),
            "utf8",
          );
        },
      });
      return config;
    },
    supportFile: "scripts/consumer-smoke/isolated-consumer-cypress-support.mjs",
    specPattern: "scripts/consumer-smoke/isolated-consumer-artifact.cy.mjs",
  },
});
