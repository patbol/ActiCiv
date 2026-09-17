import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
export default defineConfig({
  resolve: {
    alias: {
      "server-only": fileURLToPath(
        new URL("./integration/server-only.ts", import.meta.url),
      ),
    },
  },
  test: {
    environment: "node",
    include: ["packages/backend/integration/*.integration.ts"],
    fileParallelism: false,
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});
