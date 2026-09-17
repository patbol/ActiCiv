import { randomUUID, createHash } from "node:crypto";
import { writeFileSync, readFileSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { localConfig, request, id } from "../integration/helpers.mjs";
const config = localConfig();
const password = randomUUID() + "aA!";
const email = "agent1@example.test";
const adminEmail = "client_admin1@example.test";
for (const uid of [id("user-1-agent"), id("user-1-client_admin")]) {
  const result = await request(config, `/auth/v1/admin/users/${uid}`, {
    token: config.SERVICE_ROLE_KEY,
    method: "PUT",
    body: { password },
  });
  if (!result.ok) throw new Error("VoiceOver fixture provisioning failed");
}
const login = await request(config, "/auth/v1/token?grant_type=password", {
  method: "POST",
  body: { email: adminEmail, password },
});
if (!login.ok) throw new Error("VoiceOver administrator login failed");
const inviteEmail = `voiceover-${randomUUID()}@example.test`;
const reservation = await request(config, "/rest/v1/rpc/reserve_invitation", {
  token: login.data.access_token,
  method: "POST",
  body: {
    p_org: id("org-1"),
    p_email: inviteEmail,
    p_role: "agent",
    p_services: [id("service-1")],
    p_key: randomUUID(),
  },
});
if (!reservation.ok) throw new Error("VoiceOver reservation failed");
const identity = await request(config, "/auth/v1/invite", {
  token: config.SERVICE_ROLE_KEY,
  method: "POST",
  body: { email: inviteEmail },
});
if (!identity.ok) throw new Error("VoiceOver invitation failed");
const bound = await request(config, "/rest/v1/rpc/mark_invitation_sent", {
  token: config.SERVICE_ROLE_KEY,
  method: "POST",
  body: { p_invitation: reservation.data.id, p_user: identity.data.id },
});
if (!bound.ok) throw new Error("VoiceOver binding failed");
const link = await request(config, "/auth/v1/admin/generate_link", {
  token: config.SERVICE_ROLE_KEY,
  method: "POST",
  body: { type: "invite", email: inviteEmail },
});
if (!link.ok) throw new Error("VoiceOver link preparation failed");
const files = execFileSync(
  "git",
  [
    "ls-files",
    "--cached",
    "--others",
    "--exclude-standard",
    "--",
    "apps/pro/src",
    "packages/backend/src/modules/auth",
  ],
  { encoding: "utf8" },
)
  .trim()
  .split("\n")
  .sort();
const hash = createHash("sha256");
for (const file of files) {
  hash.update(file + "\0");
  hash.update(readFileSync(file));
}
const fingerprint = hash.digest("hex");
const file = "/private/tmp/acticiv-phase2-voiceover-session.md";
writeFileSync(
  file,
  `# Session VoiceOver Phase 2 — données DEV privées\n\nDate : ${new Date().toISOString()}\nEmpreinte des sources Auth/Pro : ${fingerprint}\n\n- Application : http://127.0.0.1:3001/auth/login\n- Compte existant : ${email}\n- Mot de passe initial : ${password}\n- Boîte mail locale : ${config.INBUCKET_URL ?? "http://127.0.0.1:54324"}\n- Compte invité : ${inviteEmail}\n- Invitation (fenêtre privée distincte) : http://127.0.0.1:3001/auth/confirm?token_hash=${encodeURIComponent(link.data.hashed_token)}&type=invite\n\nSuivre le protocole doc/ActiCiv_Phase2_VoiceOver.md. Ne pas versionner ce fichier.\n`,
  { mode: 0o600 },
);
console.log(`VOICEOVER_SOURCE_SHA256=${fingerprint}`);
console.log(`Session privée : ${file}`);
const server = spawnSync("pnpm", ["--filter", "@acticiv/pro", "start"], {
  stdio: "inherit",
  env: {
    ...process.env,
    SUPABASE_URL: config.API_URL,
    SUPABASE_PUBLISHABLE_KEY: config.ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: config.SERVICE_ROLE_KEY,
    PRO_APP_ORIGIN: "http://127.0.0.1:3001",
  },
});
process.exit(server.status ?? 1);
