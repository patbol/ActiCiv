import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
const forbidden = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "invitationAdapters",
  "platformAdministration",
];
if (process.env.SUPABASE_SERVICE_ROLE_KEY)
  forbidden.push(process.env.SUPABASE_SERVICE_ROLE_KEY);
function inspect(directory) {
  let count = 0;
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) count += inspect(path);
    else if (entry.name.endsWith(".js")) {
      const source = readFileSync(path, "utf8");
      if (forbidden.some((value) => source.includes(value)))
        throw new Error("Contenu serveur interdit dans un bundle client");
      count++;
    }
  }
  return count;
}
for (const app of ["citizen", "pro"])
  if (!inspect(`apps/${app}/.next/static`))
    throw new Error("Build client absent");
console.log("Frontières des bundles clients vérifiées.");
