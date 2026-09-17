import { readdirSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { parseTap } from "./parsers.ts";
export function sqlReport() {
  const suites = [];
  let passed = true;
  for (const file of readdirSync("supabase/tests")
    .filter((f) => f.endsWith(".sql"))
    .sort()) {
    const result = spawnSync(
      "docker",
      [
        "exec",
        "-i",
        "supabase_db_acticiv",
        "psql",
        "-X",
        "-qAt",
        "-U",
        "postgres",
        "-d",
        "postgres",
        "-v",
        "ON_ERROR_STOP=1",
      ],
      {
        input:
          "create extension if not exists pgtap with schema extensions;\n" +
          readFileSync("supabase/tests/" + file, "utf8"),
        encoding: "utf8",
        maxBuffer: 8 * 1024 * 1024,
      },
    );
    // Keep TAP only. psql set_config results may contain fixture identities.
    const tap = (result.stdout ?? "")
      .split(/\r?\n/)
      .filter((l) => /^(?:1\.\.|ok\s|not ok\s|Bail out!)/i.test(l.trim()))
      .join("\n");
    try {
      if (parseTap(tap).status !== "PASS") passed = false;
    } catch {
      passed = false;
    }
    if (result.status !== 0) passed = false;
    suites.push({ file, tap });
  }
  return { passed: passed && suites.length > 0, suites };
}
