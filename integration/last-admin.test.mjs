import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";
import { localConfig, request, id, sql } from "./helpers.mjs";
const config = localConfig();
const org = id("org-1");
const users = [id("user-1-client_admin"), id("user-1-agent")];
const members = [id("member-1-client_admin"), id("member-1-agent")];
const dockerArgs = [
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
];
async function tokens() {
  const password = randomUUID() + "aA!";
  return Promise.all(
    users.map(async (uid, i) => {
      assert.equal(
        (
          await request(config, `/auth/v1/admin/users/${uid}`, {
            token: config.SERVICE_ROLE_KEY,
            method: "PUT",
            body: { password },
          })
        ).ok,
        true,
      );
      const result = await request(
        config,
        "/auth/v1/token?grant_type=password",
        {
          method: "POST",
          body: {
            email: `${i === 0 ? "client_admin" : "agent"}1@example.test`,
            password,
          },
        },
      );
      assert.equal(result.ok, true);
      return result.data.access_token;
    }),
  );
}
function sqlTransaction(query) {
  return new Promise((resolve) => {
    const child = spawn("docker", dockerArgs);
    let stderr = "";
    child.stderr.on("data", (data) => {
      stderr += data;
    });
    child.on("close", (code) => resolve({ ok: code === 0, error: stderr }));
    child.stdin.end(query);
  });
}
async function withBlockedContenders(work) {
  const gate = spawn("docker", dockerArgs);
  let output = "";
  const ready = new Promise((resolve, reject) => {
    gate.stdout.on("data", (data) => {
      output += data;
      if (output.includes("GATE_READY")) resolve();
    });
    gate.on("error", reject);
    gate.on("exit", (code) => {
      if (!output.includes("GATE_READY"))
        reject(new Error(`gate failed ${code}`));
    });
  });
  const closed = new Promise((resolve) => gate.on("close", resolve));
  gate.stdin.write(
    `begin; select id from public.organizations where id='${org}' for update; select 'GATE_READY';\n`,
  );
  await ready;
  let pending;
  try {
    pending = work();
    const deadline = Date.now() + 10000;
    let waiting = 0;
    while (Date.now() < deadline) {
      waiting = Number(
        sql(
          "select count(distinct pid) from pg_locks where not granted and locktype in ('tuple','transactionid')",
        ),
      );
      if (waiting >= 2) break;
      await delay(30);
    }
    assert.ok(
      waiting >= 2,
      "both independent transactions are blocked concurrently before releasing organization lock",
    );
  } finally {
    gate.stdin.end("commit;\n");
    await closed;
  }
  return await pending;
}
for (const operation of [
  "demote",
  "membership_inactive",
  "profile_inactive",
  "delete",
]) {
  test(`last active administrator: real concurrent ${operation} with independent actors`, async () => {
    const jwt = await tokens();
    sql(
      `update public.organization_memberships set role='client_admin' where id='${members[1]}';`,
    );
    try {
      if (operation === "delete")
        sql(
          `delete from public.service_memberships where membership_id='${members[1]}'`,
        );
      const results = await withBlockedContenders(() =>
        Promise.all(
          users.map((user, i) => {
            if (operation === "delete")
              return sqlTransaction(
                `begin; set local statement_timeout='15s'; select set_config('request.jwt.claim.sub','${user}',true); delete from public.organization_memberships where id='${members[i]}'; commit;`,
              );
            return request(
              config,
              `/rest/v1/rpc/${operation === "profile_inactive" ? "set_profile_active" : "change_member"}`,
              {
                token: jwt[i],
                method: "POST",
                body:
                  operation === "profile_inactive"
                    ? { p_user: user, p_active: false }
                    : {
                        p_member: members[i],
                        p_role:
                          operation === "demote" ? "agent" : "client_admin",
                        p_active: operation !== "membership_inactive",
                      },
              },
            );
          }),
        ),
      );
      assert.equal(results.filter((r) => r.ok).length, 1);
      const denied = results.find((r) => !r.ok);
      if (operation === "delete")
        assert.match(denied.error, /Last active administrator/);
      else {
        assert.equal(denied.data.code, "23514");
        assert.equal(denied.data.message, "Last active administrator");
      }
      assert.equal(
        sql(
          `select count(*) from public.organization_memberships m join public.professional_profiles p on p.id=m.user_id where m.organization_id='${org}' and m.role='client_admin' and m.status='active' and p.status='active'`,
        ),
        "1",
      );
    } finally {
      // Restore each original identity independently; preserve audit history.
      sql(`update public.professional_profiles set status='active' where id in ('${users[0]}','${users[1]}');
        insert into public.organization_memberships(id,organization_id,user_id,role) values('${members[0]}','${org}','${users[0]}','client_admin') on conflict(id) do update set role='client_admin',status='active';
        insert into public.organization_memberships(id,organization_id,user_id,role) values('${members[1]}','${org}','${users[1]}','agent') on conflict(id) do update set role='agent',status='active';
        insert into public.service_memberships(organization_id,membership_id,service_id) values('${org}','${members[1]}','${id("service-1")}') on conflict(membership_id,service_id) do update set active=true;`);
    }
  });
}
