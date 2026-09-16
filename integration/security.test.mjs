import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { localConfig, request, id, sql } from "./helpers.mjs";
const config = localConfig();
const password = randomUUID() + "aA!";
async function login(role, n = 1) {
  const uid = id(`user-${n}-${role}`);
  const update = await request(config, `/auth/v1/admin/users/${uid}`, {
    token: config.SERVICE_ROLE_KEY,
    method: "PUT",
    body: { password },
  });
  assert.equal(update.ok, true, "local fixture password provisioning");
  const signed = await request(config, "/auth/v1/token?grant_type=password", {
    method: "POST",
    body: { email: `${role}${n}@example.test`, password },
  });
  assert.equal(signed.ok, true, "real password authentication");
  return signed.data;
}
test("real JWTs enforce tenant/service access and stale identity revocation", async () => {
  const agent = await login("agent"),
    admin = await login("client_admin"),
    supervisor = await login("supervisor");
  const read = await request(config, "/rest/v1/services?select=id", {
    token: agent.access_token,
  });
  assert.equal(read.ok, true);
  assert.deepEqual(
    read.data.map((r) => r.id),
    [id("service-1")],
  );
  const members = await request(
    config,
    "/rest/v1/organization_memberships?select=id",
    { token: supervisor.access_token },
  );
  assert.equal(members.data.length, 2);
  const own = await request(config, "/rest/v1/services?select=id", {
    token: admin.access_token,
  });
  assert.equal(own.data.length, 2);
  const cross = await request(config, "/rest/v1/rpc/save_service", {
    token: admin.access_token,
    method: "POST",
    body: { p_org: id("org-2"), p_code: "intrusion", p_name: "intrusion" },
  });
  assert.equal(cross.ok, false);
  const forged = await request(config, "/auth/v1/user", {
    token: agent.access_token,
    method: "PUT",
    body: { data: { role: "platform_admin", organization_id: id("org-2") } },
  });
  assert.equal(forged.ok, true);
  const audit = await request(config, "/rest/v1/audit_events?select=id", {
    token: agent.access_token,
  });
  assert.deepEqual(audit.data, []);
  try {
    const deactivate = await request(config, "/rest/v1/rpc/change_member", {
      token: admin.access_token,
      method: "POST",
      body: {
        p_member: id("member-1-agent"),
        p_role: "agent",
        p_active: false,
      },
    });
    assert.equal(deactivate.ok, true);
    const revoked = await request(config, "/rest/v1/services?select=id", {
      token: agent.access_token,
    });
    assert.deepEqual(revoked.data, []);
  } finally {
    sql(
      `update public.organization_memberships set status='active' where id='${id("member-1-agent")}'`,
    );
  }
  const refresh = await request(
    config,
    "/auth/v1/token?grant_type=refresh_token",
    { method: "POST", body: { refresh_token: admin.refresh_token } },
  );
  assert.equal(refresh.ok, true);
  const logout = await request(config, "/auth/v1/logout", {
    token: refresh.data.access_token,
    method: "POST",
  });
  assert.equal(logout.ok, true);
  const reuse = await request(
    config,
    "/auth/v1/token?grant_type=refresh_token",
    { method: "POST", body: { refresh_token: refresh.data.refresh_token } },
  );
  assert.equal(reuse.ok, false);
});
test("signup is disabled and unauthenticated data is inaccessible", async () => {
  const result = await request(config, "/auth/v1/signup", {
    method: "POST",
    body: { email: `${randomUUID()}@example.test`, password },
  });
  assert.equal(result.ok, false);
  const services = await request(config, "/rest/v1/services?select=id");
  assert.equal(services.ok, false);
});
test("concurrent demotions cannot remove every administrator", async () => {
  const admin = await login("client_admin");
  const agentId = id("member-1-agent");
  let promote = await request(config, "/rest/v1/rpc/change_member", {
    token: admin.access_token,
    method: "POST",
    body: { p_member: agentId, p_role: "client_admin", p_active: true },
  });
  assert.equal(promote.ok, true);
  try {
    const results = await Promise.all(
      [id("member-1-client_admin"), agentId].map((member) =>
        request(config, "/rest/v1/rpc/change_member", {
          token: admin.access_token,
          method: "POST",
          body: { p_member: member, p_role: "agent", p_active: true },
        }),
      ),
    );
    assert.equal(results.filter((r) => r.ok).length, 1);
    assert.equal(
      sql(
        `select count(*) from public.organization_memberships where organization_id='${id("org-1")}' and role='client_admin' and status='active'`,
      ),
      "1",
    );
  } finally {
    sql(
      `update public.organization_memberships set role='client_admin' where id='${id("member-1-client_admin")}'; update public.organization_memberships set role='agent' where id='${agentId}';`,
    );
  }
});
test("invitations survive partial failure, are idempotent, and grant rights only after acceptance", async () => {
  const admin = await login("client_admin");
  const key = randomUUID();
  const email = `invite-${randomUUID()}@example.test`;
  const body = {
    p_org: id("org-1"),
    p_email: email,
    p_role: "agent",
    p_services: [id("service-1")],
    p_key: key,
  };
  const reservations = await Promise.all(
    [1, 2].map(() =>
      request(config, "/rest/v1/rpc/reserve_invitation", {
        token: admin.access_token,
        method: "POST",
        body,
      }),
    ),
  );
  assert.equal(reservations[0].ok, true);
  assert.equal(reservations[1].ok, true);
  assert.equal(reservations[0].data.id, reservations[1].data.id);
  const invitation = reservations[0].data.id;
  const conflict = await request(config, "/rest/v1/rpc/reserve_invitation", {
    token: admin.access_token,
    method: "POST",
    body: { ...body, p_role: "client_admin" },
  });
  assert.equal(conflict.ok, false);
  const cross = await request(config, "/rest/v1/rpc/reserve_invitation", {
    token: admin.access_token,
    method: "POST",
    body: { ...body, p_org: id("org-2"), p_key: randomUUID() },
  });
  assert.equal(cross.ok, false);
  const invited = await request(config, "/auth/v1/invite", {
    token: config.SERVICE_ROLE_KEY,
    method: "POST",
    body: { email },
  });
  assert.equal(invited.ok, true, "real Auth invite");
  const uid = invited.data.id;
  assert.equal(
    sql(
      `select count(*) from public.organization_memberships where user_id='${uid}'`,
    ),
    "0",
  );
  // Resume the business half after the external identity exists.
  const bound = await request(config, "/rest/v1/rpc/mark_invitation_sent", {
    token: config.SERVICE_ROLE_KEY,
    method: "POST",
    body: { p_invitation: invitation, p_user: uid },
  });
  assert.equal(bound.ok, true);
  const generated = await request(config, "/auth/v1/admin/generate_link", {
    token: config.SERVICE_ROLE_KEY,
    method: "POST",
    body: { type: "invite", email },
  });
  assert.equal(generated.ok, true);
  const verified = await request(config, "/auth/v1/verify", {
    method: "POST",
    body: { token_hash: generated.data.hashed_token, type: "invite" },
  });
  assert.equal(verified.ok, true);
  const token = verified.data.access_token;
  const denied = await request(config, "/rest/v1/services?select=id", {
    token,
  });
  assert.deepEqual(denied.data, []);
  const replay = await request(config, "/auth/v1/verify", {
    method: "POST",
    body: { token_hash: generated.data.hashed_token, type: "invite" },
  });
  assert.equal(replay.ok, false);
  sql(
    `update public.professional_invitations set expires_at=now()-interval '1 minute' where id='${invitation}'`,
  );
  const expired = await request(config, "/rest/v1/rpc/accept_invitation", {
    token,
    method: "POST",
    body: { p_invitation: invitation, p_name: "Expired" },
  });
  assert.equal(expired.ok, false);
  sql(
    `update public.professional_invitations set expires_at=now()+interval '1 day' where id='${invitation}'`,
  );
  const accepted = await request(config, "/rest/v1/rpc/accept_invitation", {
    token,
    method: "POST",
    body: { p_invitation: invitation, p_name: "Invité fictif" },
  });
  assert.equal(accepted.ok, true);
  const duplicate = await request(config, "/rest/v1/rpc/accept_invitation", {
    token,
    method: "POST",
    body: { p_invitation: invitation, p_name: "Invité fictif" },
  });
  assert.equal(duplicate.ok, false);
  const services = await request(config, "/rest/v1/services?select=id", {
    token,
  });
  assert.deepEqual(
    services.data.map((s) => s.id),
    [id("service-1")],
  );
  const reset = await request(config, "/auth/v1/recover", {
    method: "POST",
    body: { email },
  });
  assert.equal(reset.ok, true, "password recovery available");
  const recoveryLink = await request(config, "/auth/v1/admin/generate_link", {
    token: config.SERVICE_ROLE_KEY,
    method: "POST",
    body: { type: "recovery", email },
  });
  assert.equal(recoveryLink.ok, true);
  sql(
    `update auth.users set recovery_sent_at=now()-interval '2 hours' where id='${uid}'`,
  );
  const expiredToken = await request(config, "/auth/v1/verify", {
    method: "POST",
    body: { token_hash: recoveryLink.data.hashed_token, type: "recovery" },
  });
  assert.equal(expiredToken.ok, false, "expired Auth recovery token denied");
  // Keep repeated verification runs independent without deleting historical audit data.
  sql(
    `delete from public.service_memberships where membership_id in (select id from public.organization_memberships where user_id='${uid}'); delete from public.organization_memberships where user_id='${uid}'; delete from public.professional_profiles where id='${uid}';`,
  );
});
