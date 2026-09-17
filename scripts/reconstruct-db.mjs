import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { validReconstruction } from "../tooling/quality/reconstruction.ts";
if (
  !/^project_id\s*=\s*"acticiv"/m.test(
    readFileSync("supabase/config.toml", "utf8"),
  )
)
  throw new Error("Reconstruction restricted to the ActiCiv local DEV project");
const sha = execFileSync("git", ["rev-parse", "HEAD"], {
  encoding: "utf8",
}).trim();
console.log(`Reconstruction locale depuis zéro, candidat ${sha}`);
for (const args of [
  ["exec", "supabase", "stop", "--no-backup"],
  ["exec", "supabase", "start"],
]) {
  const result = spawnSync("pnpm", args, {
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
    env: { ...process.env, NO_COLOR: "1" },
  });
  // Supabase prints local secrets in its connection summary; retain only operation evidence.
  for (const line of (result.stdout + result.stderr).split(/\r?\n/)) {
    if (
      /^(Starting|Stopping|Stopped|Started|Initialising|Applying migration|Seeding|Waiting for|Finished)/.test(
        line,
      )
    )
      console.log(line);
  }
  console.log(`pnpm ${args.join(" ")}: exit ${result.status}`);
  if (result.status !== 0)
    throw new Error(
      "Local Supabase reconstruction failed (connection summary withheld)",
    );
}
const reset = spawnSync("pnpm", ["db:reset"], { stdio: "inherit" });
if (reset.status !== 0) throw new Error("Local database reset failed");
const raw = execFileSync(
  "docker",
  [
    "exec",
    "-i",
    "supabase_db_acticiv",
    "psql",
    "-U",
    "postgres",
    "-d",
    "postgres",
    "-At",
    "-v",
    "ON_ERROR_STOP=1",
  ],
  {
    input:
      "select json_build_object('versions',(select json_agg(version order by version) from supabase_migrations.schema_migrations),'organizations',(select count(*) from public.organizations),'profiles',(select count(*) from public.professional_profiles),'services',(select count(*) from public.services),'territories',(select count(*) from public.territories),'postgis',(select extversion from pg_extension where extname='postgis'));",
    encoding: "utf8",
  },
);
const actual = JSON.parse(raw);
const expectedVersions = readdirSync("supabase/migrations")
  .filter((f) => f.endsWith(".sql"))
  .map((f) => f.split("_")[0]);
if (!validReconstruction(actual, expectedVersions))
  throw new Error(
    "Rebuilt schema/seed differs from expected Phase 2 foundation",
  );
console.log(JSON.stringify(actual));
console.log(`DB_RECONSTRUCTED_SHA=${sha}`);
