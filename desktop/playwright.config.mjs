import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  reporter: [["list"]],
  outputDir: "../test-results/desktop-playwright",
  timeout: 60_000,
  use: {
    baseURL: "http://127.0.0.1:5174",
    // Assumes windows-latest ships Microsoft Edge (true as of this writing);
    // if GitHub ever changes that, fall back to `npx playwright install msedge`.
    channel: "msedge",
    viewport: { width: 1400, height: 1200 },
    trace: "retain-on-failure",
    screenshot: "only-on-failure"
  },
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 5174",
    url: "http://127.0.0.1:5174",
    // Always start fresh in CI (a hosted runner has no leftover dev server to
    // reuse); locally, reuse one already running instead of hard-failing on
    // "port already in use" -- a common state for a developer mid-`npm run dev`.
    reuseExistingServer: !process.env.CI,
    timeout: 60_000
  }
});
