import { execFileSync, spawnSync } from "node:child_process";
function git(...args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}
if (git("status", "--porcelain"))
  throw new Error("Validation de release bloquée : arbre non propre.");
const sha = git("rev-parse", "HEAD");
console.log(`Validation locale du commit ${sha}`);
console.log(
  JSON.stringify({
    node: process.version,
    icu: process.versions.icu,
    tz: process.versions.tz,
  }),
);
if (process.argv.includes("--rebuild-db")) {
  const rebuilt = spawnSync("node", ["scripts/reconstruct-db.mjs"], {
    stdio: "inherit",
  });
  if (rebuilt.status !== 0) process.exit(rebuilt.status ?? 1);
}
const result = spawnSync("pnpm", ["verify:full"], { stdio: "inherit" });
if (result.status !== 0) process.exit(result.status ?? 1);
if (git("rev-parse", "HEAD") !== sha || git("status", "--porcelain"))
  throw new Error("État Git modifié pendant la validation.");
console.log(`LOCAL_VALIDATED_SHA=${sha}`);
console.log(
  "La clôture requiert aussi les deux jobs CI sur ce SHA et les contrôles manuels applicables.",
);
