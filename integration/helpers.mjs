import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
export function id(value) {
  const h = createHash("md5").update(value).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
export function localConfig() {
  const config = JSON.parse(
    execFileSync("pnpm", ["exec", "supabase", "status", "-o", "json"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }),
  );
  if (new URL(config.API_URL).hostname !== "127.0.0.1")
    throw new Error("Tests restricted to local Supabase");
  return config;
}
export function sql(query) {
  return execFileSync(
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
      "-v",
      "ON_ERROR_STOP=1",
      "-At",
    ],
    { input: query, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] },
  ).trim();
}
export async function request(
  config,
  path,
  { token = config.ANON_KEY, method = "GET", body } = {},
) {
  const response = await fetch(config.API_URL + path, {
    method,
    headers: {
      apikey: config.ANON_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const raw = await response.text();
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    data = raw;
  }
  return { status: response.status, ok: response.ok, data };
}
