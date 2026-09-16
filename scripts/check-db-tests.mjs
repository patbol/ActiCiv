import { readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
if (!readdirSync("supabase/tests").some((name) => name.endsWith(".sql"))) {
  throw new Error("Aucun test SQL réel : validation bloquée.");
}
const result = spawnSync("pnpm", ["exec", "supabase", "test", "db"], {
  stdio: "inherit",
});
process.exit(result.status ?? 1);
