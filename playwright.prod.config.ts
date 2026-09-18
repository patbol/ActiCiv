import { defineConfig } from "@playwright/test";
import base from "./playwright.config";
export default defineConfig({
  ...base,
  testIgnore: [],
  testMatch: ["artifact-prod.spec.ts", "quality.spec.ts"],
  webServer: [
    {
      command: "pnpm --filter @acticiv/citizen start",
      url: "http://127.0.0.1:3000",
      reuseExistingServer: false,
    },
    {
      command: "pnpm --filter @acticiv/pro start",
      url: "http://127.0.0.1:3001",
      reuseExistingServer: false,
    },
  ],
});
