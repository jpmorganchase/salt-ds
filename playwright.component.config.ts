import { defineConfig, devices } from "@playwright/test";

const galleryUrl = "http://127.0.0.1:4174/playwright/gallery/index.html";

export default defineConfig({
  testDir: "./playwright/tests",
  testMatch: "**/*.spec.ts",
  fullyParallel: false,
  workers: 3,
  reporter: "line",
  outputDir: "test-results/playwright-components",
  projects: [
    {
      name: "components",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: galleryUrl,
        channel: "chrome",
        reuseContext: true,
        screenshot: "only-on-failure",
        serviceWorkers: "block",
        trace: "retain-on-failure",
        viewport: { width: 1280, height: 1024 },
      },
    },
  ],
  webServer: {
    command: "yarn playwright:components:serve",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    url: galleryUrl,
  },
});
