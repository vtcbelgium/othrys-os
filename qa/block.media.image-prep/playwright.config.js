import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: /adversarial\.spec\.js$/,
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: [["list"]],
  use: { baseURL: "http://127.0.0.1:4177", headless: true },
  webServer: {
    command: "node ../../tests/browser/serve.mjs",
    url: "http://127.0.0.1:4177",
    reuseExistingServer: false,
    timeout: 15_000,
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
