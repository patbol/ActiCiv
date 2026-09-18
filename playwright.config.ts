import { qualitySource } from "./e2e/fixtures/quality-source";
import { defineConfig, devices } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
const local = JSON.parse(
  execFileSync("pnpm", ["exec", "supabase", "status", "-o", "json"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }),
) as Record<string, string>;
if (!local.API_URL || new URL(local.API_URL).hostname !== "127.0.0.1")
  throw new Error("E2E require real local Supabase");
process.env.SUPABASE_URL = local.API_URL;
process.env.SUPABASE_PUBLISHABLE_KEY = local.ANON_KEY!;
process.env.SUPABASE_SERVICE_ROLE_KEY = local.SERVICE_ROLE_KEY!;
process.env.ACTICIV_E2E_PASSWORD ??= randomUUID() + "aA!";
process.env.PRO_APP_ORIGIN = "http://127.0.0.1:3001";
process.env.ACTICIV_QUALITY_ROOT = await qualitySource();
export default defineConfig({
  testDir: "./e2e",
  testIgnore: "artifact-prod.spec.ts",
  fullyParallel: true,
  forbidOnly: true,
  retries: 0,
  workers: process.env.CI ? 2 : 2,
  reporter: [
    ["list"],
    ["html", { open: "never" }],
    ...(process.env.ACTICIV_PLAYWRIGHT_JSON
      ? [
          ["json", { outputFile: process.env.ACTICIV_PLAYWRIGHT_JSON }] as [
            string,
            { outputFile: string },
          ],
        ]
      : []),
  ],
  use: {
    locale: "fr-FR",
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? {
          launchOptions: {
            executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
            args: ["--no-sandbox", "--disable-dev-shm-usage", "--no-zygote"],
          },
        }
      : {}),
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    {
      name: "mobile",
      use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" },
    },
  ],
  webServer: [
    {
      command: "pnpm --filter @acticiv/citizen start:demo",
      url: "http://127.0.0.1:3000",
      reuseExistingServer: false,
    },
    {
      command: "pnpm --filter @acticiv/pro start:demo",
      url: "http://127.0.0.1:3001",
      reuseExistingServer: false,
    },
  ],
});
