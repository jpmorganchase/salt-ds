import { defineConfig } from "cypress";

export default defineConfig({
  allowCypressEnv: false,
  e2e: {
    supportFile: "examples/apps/cypress/support.ts",
    specPattern: "examples/apps/**/cypress/*.cy.ts",
    video: false,
  },
});
