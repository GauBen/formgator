import { defineConfig, devices } from "@playwright/test";

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: "http://127.0.0.1:4173",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: devices["Desktop Chrome"],
    },
    {
      name: "firefox",
      use: devices["Desktop Firefox"],
    },
  ],

  webServer: {
    command: "yarn preview",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
  },
});
