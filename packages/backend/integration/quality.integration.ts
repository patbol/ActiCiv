import { it, expect } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { localConfig, sql } from "../../../integration/helpers.mjs";
import { platformIdentity } from "../src/modules/quality/infrastructure/identity";
import { readQuality } from "../src/modules/quality/application/read";
it("real JWT: active explicit capability only, no self escalation or forged metadata", async () => {
  const cfg = localConfig(),
    options = { auth: { persistSession: false, autoRefreshToken: false } };
  const admin = createClient(cfg.API_URL!, cfg.SERVICE_ROLE_KEY!, options);
  const email = `quality-${randomUUID()}@example.test`,
    password = randomUUID() + "aA!";
  const created = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: "platform_admin", capabilities: ["quality.read"] },
  });
  expect(created.error).toBeNull();
  const id = created.data.user!.id;
  const client = createClient(cfg.API_URL!, cfg.ANON_KEY!, options);
  try {
    expect(
      (await client.auth.signInWithPassword({ email, password })).error,
    ).toBeNull();
    const read = () =>
      readQuality(
        platformIdentity(client),
        { list: async () => "allowed" },
        {},
      );
    await expect(read()).rejects.toThrow("QUALITY_FORBIDDEN");
    sql(`insert into platform_admins(id,capabilities) values('${id}', '{}');`);
    await expect(read()).rejects.toThrow("QUALITY_FORBIDDEN");
    expect(
      (
        await client
          .from("platform_admins")
          .update({ capabilities: ["quality.read"] })
          .eq("id", id)
      ).error,
    ).not.toBeNull();
    sql(
      `update platform_admins set capabilities=array['quality.read'] where id='${id}';`,
    );
    expect(await read()).toBe("allowed");
    sql(`update platform_admins set active=false where id='${id}';`);
    await expect(read()).rejects.toThrow("QUALITY_FORBIDDEN");
    sql(
      `delete from platform_admins where id='${id}';insert into professional_profiles(id,display_name) values('${id}','Quality test');`,
    );
    for (const role of ["agent", "supervisor", "client_admin"]) {
      sql(
        `insert into organization_memberships(organization_id,user_id,role) values(md5('org-1')::uuid,'${id}','${role}') on conflict(user_id) do update set role=excluded.role;`,
      );
      await expect(read()).rejects.toThrow("QUALITY_FORBIDDEN");
    }
  } finally {
    // Keep synthetic Auth rows referenced by append-only audit. Remove rights and membership.
    sql(
      `delete from platform_admins where id='${id}';delete from organization_memberships where user_id='${id}';delete from professional_profiles where id='${id}';`,
    );
  }
});
