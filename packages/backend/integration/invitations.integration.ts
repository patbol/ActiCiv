import { expect, it, afterEach } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { localConfig, sql, id } from "../../../integration/helpers.mjs";
import { invitationAdapters } from "../src/modules/auth/infrastructure/invitations";
import { inviteProfessional } from "../src/modules/auth/application/invite";
import { professionalSession } from "../src/modules/auth/infrastructure/session";
import { acceptProfessionalInvitation } from "../src/modules/auth/application/session";
import { createObservability, authObserver } from "../src/platform/telemetry";
import { commandContext, persistedContext } from "../src/platform/correlation";
const config = localConfig();
const env = {
  SUPABASE_URL: config.API_URL!,
  SUPABASE_SERVICE_ROLE_KEY: config.SERVICE_ROLE_KEY!,
};
const origin = "http://127.0.0.1:3001";
const admin = createClient(config.API_URL!, config.SERVICE_ROLE_KEY!, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const context = {
  userId: id("user-1-client_admin"),
  organizationId: id("org-1"),
  profileActive: true,
  membershipActive: true,
  organizationActive: true,
  role: "client_admin" as const,
  services: [],
};
async function client(correlationId: string) {
  const password = randomUUID() + "aA!";
  const provision = await admin.auth.admin.updateUserById(context.userId, {
    password,
  });
  expect(provision.error).toBeNull();
  const user = createClient(config.API_URL!, config.ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "x-acticiv-command-id": correlationId } },
  });
  expect(
    (
      await user.auth.signInWithPassword({
        email: "client_admin1@example.test",
        password,
      })
    ).error,
  ).toBeNull();
  return user;
}
function invitation(email: string) {
  return JSON.parse(
    sql(
      `select row_to_json(i) from public.professional_invitations i where email='${email}'`,
    ),
  ) as {
    id: string;
    auth_user_id: string | null;
    state: string;
    correlation_id: string;
  };
}
function noMembership(email: string) {
  expect(
    sql(
      `select count(*) from public.organization_memberships m join auth.users u on u.id=m.user_id where u.email='${email}'`,
    ),
  ).toBe("0");
}
async function harness(prefix: string) {
  const correlationId = randomUUID();
  const user = await client(correlationId);
  const email = `${prefix}-${randomUUID()}@example.test`,
    key = randomUUID();
  const adapters = invitationAdapters(user, env, origin);
  const logs: string[] = [];
  const telemetry = createObservability(
    { NODE_ENV: "test", ACTICIV_ANALYTICS_MODE: "local" },
    (line) => logs.push(line),
  );
  const send = () =>
    inviteProfessional(
      context,
      context.organizationId,
      email,
      "agent",
      [id("service-1")],
      key,
      adapters.repository,
      adapters.provider,
      Date.now,
      authObserver(telemetry, commandContext()),
    );
  return { correlationId, user, email, key, send, adapters, logs, telemetry };
}
afterEach(() => {
  sql(
    `drop trigger if exists closure_auth_failure on auth.users; drop function if exists public.closure_auth_failure(); drop trigger if exists closure_bind_failure on public.professional_invitations; drop function if exists public.closure_bind_failure();`,
  );
});
it("real Auth failure after reservation leaves no rights and resumes through the actual adapter", async () => {
  const h = await harness("auth-failure");
  sql(
    `create function public.closure_auth_failure() returns trigger language plpgsql as $$begin if new.email='${h.email}' then raise exception 'Injected Auth storage failure'; end if; return new; end$$; create trigger closure_auth_failure before insert on auth.users for each row execute function public.closure_auth_failure();`,
  );
  await expect(h.send()).rejects.toThrow();
  const before = invitation(h.email);
  expect(before.state).toBe("pending");
  noMembership(h.email);
  expect(h.logs.map((line) => JSON.parse(line).error_code)).toEqual([
    "INVITATION_RESERVED",
    "INVITATION_PROVIDER_FAILED",
  ]);
  expect(sql(`select count(*) from auth.users where email='${h.email}'`)).toBe(
    "0",
  );
  sql(
    "drop trigger closure_auth_failure on auth.users; drop function public.closure_auth_failure();",
  );
  expect(await h.send()).toBe(before.id);
  expect(invitation(h.email).state).toBe("sent");
  noMembership(h.email);
});
it("real SQL bind failure preserves Auth identity, retries safely and correlates acceptance events", async () => {
  const h = await harness("sql-failure");
  sql(
    `create function public.closure_bind_failure() returns trigger language plpgsql as $$begin if new.email='${h.email}' and new.state='sent' then raise exception 'Injected bind failure'; end if; return new; end$$; create trigger closure_bind_failure before update on public.professional_invitations for each row execute function public.closure_bind_failure();`,
  );
  await expect(h.send()).rejects.toThrow("reprendre");
  const before = invitation(h.email);
  expect(before.state).toBe("pending");
  noMembership(h.email);
  const uid = sql(`select id from auth.users where email='${h.email}'`);
  expect(uid).not.toBe("");
  sql(
    "drop trigger closure_bind_failure on public.professional_invitations; drop function public.closure_bind_failure();",
  );
  expect(await h.send()).toBe(before.id);
  expect(invitation(h.email).auth_user_id).toBe(uid);
  noMembership(h.email);
  const link = await admin.auth.admin.generateLink({
    type: "invite",
    email: h.email,
  });
  expect(link.error).toBeNull();
  const invited = createClient(config.API_URL!, config.ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "x-acticiv-command-id": randomUUID() } },
  });
  const verified = await invited.auth.verifyOtp({
    token_hash: link.data.properties!.hashed_token,
    type: "invite",
  });
  expect(verified.error).toBeNull();
  expect((await h.user.rpc("pending_invitation_context")).data).toEqual([]);
  expect((await invited.rpc("pending_invitation_context")).data).toEqual([
    { id: before.id, correlation_id: h.correlationId },
  ]);
  const acceptanceContext = commandContext();
  expect(acceptanceContext.correlationId).not.toBe(h.correlationId);
  await acceptProfessionalInvitation(
    "Invité reprise",
    professionalSession(invited, origin),
    authObserver(h.telemetry, acceptanceContext),
  );
  expect(invitation(h.email).state).toBe("accepted");
  expect((await invited.rpc("pending_invitation_context")).data).toEqual([]);
  const records = h.logs.map((line) => JSON.parse(line));
  expect(records.map((r) => r.error_code)).toEqual([
    "INVITATION_RESERVED",
    "INVITATION_BIND_FAILED",
    "INVITATION_RESERVED",
    "INVITATION_SENT",
    "INVITATION_ACCEPTED",
  ]);
  expect(
    records.every(
      (r) =>
        r.correlation_id === persistedContext(h.correlationId).correlationId,
    ),
  ).toBe(true);
  expect(h.logs.join()).not.toMatch(
    /@example|Invité|password|token|stack|Injected/,
  );
  expect(h.telemetry.local.events()).toEqual([]);
  expect(
    sql(
      `select count(*) from public.organization_memberships where user_id='${uid}'`,
    ),
  ).toBe("1");
  expect(invitation(h.email).correlation_id).toBe(h.correlationId);
  const membership = sql(
    `select id from public.organization_memberships where user_id='${uid}'`,
  );
  expect(
    sql(
      `select count(distinct correlation_id) from public.audit_events where entity_id in ('${before.id}','${uid}','${membership}')`,
    ),
  ).toBe("1");
  expect(
    sql(
      `select bool_and(correlation_id='${h.correlationId}'::uuid) from public.audit_events where entity_id in ('${before.id}','${uid}','${membership}')`,
    ),
  ).toBe("t");
  await expect(h.send()).rejects.toThrow("terminée");
  expect((await admin.auth.admin.getUserById(uid)).data.user?.id).toBe(uid);
  sql(
    `delete from public.service_memberships where membership_id='${membership}'; delete from public.organization_memberships where id='${membership}'; delete from public.professional_profiles where id='${uid}';`,
  );
});
it("concurrent complete adapter sends and repeats converge on one invitation and identity", async () => {
  const h = await harness("concurrent");
  const results = await Promise.all([h.send(), h.send()]);
  expect(results[0]).toBe(results[1]);
  expect(await h.send()).toBe(results[0]);
  expect(
    sql(
      `select count(*) from public.professional_invitations where email='${h.email}'`,
    ),
  ).toBe("1");
  expect(sql(`select count(*) from auth.users where email='${h.email}'`)).toBe(
    "1",
  );
  expect(invitation(h.email).state).toBe("sent");
  noMembership(h.email);
});
it("reuses a preexisting confirmed Auth identity without deletion or partial membership", async () => {
  const h = await harness("existing");
  const existing = await admin.auth.admin.createUser({
    email: h.email,
    email_confirm: true,
    password: randomUUID() + "aA!",
  });
  expect(existing.error).toBeNull();
  const uid = existing.data.user!.id;
  await h.send();
  expect(invitation(h.email).auth_user_id).toBe(uid);
  expect((await admin.auth.admin.getUserById(uid)).data.user?.id).toBe(uid);
  noMembership(h.email);
});
