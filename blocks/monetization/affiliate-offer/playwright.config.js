import { defineConfig } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const vtcRoot = path.resolve(here, "..", "..", "..", "..", "vtc-block-affiliate-extract-001");

export default defineConfig({
  testDir: "./tests/browser",
  testMatch: /.*\.spec\.js$/,
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: [["list"]],
  use: {
    headless: true,
  },
  webServer: [
    {
      command: "node tests/browser/serve.mjs",
      url: "http://127.0.0.1:4178",
      timeout: 15_000,
      reuseExistingServer: false,
    },
    {
      command: "npx vite --config tests/disclosure/vite.config.js --host 127.0.0.1 --port 4188 --strictPort",
      cwd: vtcRoot,
      url: "http://127.0.0.1:4188",
      timeout: 60_000,
      reuseExistingServer: false,
    },
  ],
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
