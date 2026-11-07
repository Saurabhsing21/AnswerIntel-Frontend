import { defineConfig } from "@playwright/test";

// Runs against a production build (`npm run build` first). The sign-up journey also needs the API: set
// E2E_BACKEND_URL to a running backend with a throwaway database; without it, only the public pages are checked.
const PORT = 3100;

export default defineConfig({
  testDir: "tests/e2e",
  retries: process.env.CI ? 1 : 0,
  use: { baseURL: `http://localhost:${PORT}`, trace: "retain-on-failure" },
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    env: {
      BACKEND_URL: process.env.E2E_BACKEND_URL ?? "http://localhost:8000",
      NEXT_PUBLIC_APP_URL: `http://localhost:${PORT}`,
      NEXT_PUBLIC_SITE_URL: `http://localhost:${PORT}`,
      SITE_URL: `http://localhost:${PORT}`,
    },
  },
});
