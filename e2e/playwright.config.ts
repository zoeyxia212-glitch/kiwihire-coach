import { defineConfig } from "@playwright/test";

// The stack must already be running, for example: docker compose up --build
// from the repository root, which serves the app on http://localhost:8080.
export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  retries: 0,
  workers: 1,
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:8080",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
});
