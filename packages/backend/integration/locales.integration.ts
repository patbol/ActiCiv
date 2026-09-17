import { expect, it, afterEach } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { localConfig, sql, id } from "../../../integration/helpers.mjs";
import { changeLocalePreference } from "../src/platform/locale-preference";
import { configure } from "../src/platform/configuration";
import { platformAdministration } from "../src/platform/platform-administration";
import { readLocalePreferences } from "../src/modules/locales/infrastructure/preferences";
const config = localConfig();
const admin = createClient(config.API_URL!, config.SERVICE_ROLE_KEY!, {
  auth: { persistSession: false, autoRefreshToken: false },
});
async function professional(role = "agent", org = 1) {
  const password = randomUUID() + "aA!";
  expect(
    (
      await admin.auth.admin.updateUserById(id(`user-${org}-${role}`), {
        password,
        user_metadata: {
          role: "client_admin",
          organization_id: id("org-2"),
          preferred_locale: "en-GB",
        },
      })
    ).error,
  ).toBeNull();
  const correlation = randomUUID();
  const client = createClient(config.API_URL!, config.ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "x-acticiv-command-id": correlation } },
  });
  expect(
    (
      await client.auth.signInWithPassword({
        email: `${role}${org}@example.test`,
        password,
      })
    ).error,
  ).toBeNull();
  return { client, correlation };
}
afterEach(() => {
  sql(
    "drop trigger if exists fail_locale_audit on public.audit_events; drop function if exists public.fail_locale_audit(); update public.professional_profiles set preferred_locale=null; update public.organization_settings set default_locale='fr-FR'; update public.professional_profiles set status='active' where id=md5('user-1-agent')::uuid; delete from public.platform_admins where id=md5('user-1-agent')::uuid;",
  );
});
it("real own-preference adapter derives identity, supports null, rejects targeting and preserves tenant", async () => {
  const { client, correlation } = await professional();
  expect(await readLocalePreferences(client)).toEqual({
    preferred: null,
    organization: "fr-FR",
  });
  await changeLocalePreference(client, { locale: "en-GB" });
  expect(await readLocalePreferences(client)).toEqual({
    preferred: "en-GB",
    organization: "fr-FR",
  });
  expect(
    sql(
      `select count(*) from audit_events where correlation_id='${correlation}' and actor_id=md5('user-1-agent')::uuid and changes->'preferred_locale'->>'new'='en-GB'`,
    ),
  ).toBe("1");
  await expect(
    changeLocalePreference(client, {
      locale: "fr-FR",
      userId: id("user-2-agent"),
    }),
  ).rejects.toThrow();
  await expect(
    changeLocalePreference(client, {
      locale: "fr-FR",
      organizationId: id("org-2"),
    }),
  ).rejects.toThrow();
  await expect(
    changeLocalePreference(client, { locale: "de-DE" }),
  ).rejects.toThrow();
  expect(
    (
      await client
        .from("professional_profiles")
        .update({ preferred_locale: "en-GB" })
        .eq("id", id("user-2-agent"))
    ).error,
  ).not.toBeNull();
  expect(
    sql(
      "select preferred_locale is null from professional_profiles where id=md5('user-2-agent')::uuid",
    ),
  ).toBe("t");
  await changeLocalePreference(client, { locale: null });
  expect((await readLocalePreferences(client))?.preferred).toBeNull();
  sql(
    "update professional_profiles set status='inactive' where id=md5('user-1-agent')::uuid",
  );
  expect(await readLocalePreferences(client)).toBeNull();
  await expect(
    changeLocalePreference(client, { locale: "en-GB" }),
  ).rejects.toThrow();
});
it("organization use case and SQL enforce tenant, role and ignore forged metadata", async () => {
  for (const role of ["agent", "supervisor"]) {
    const { client } = await professional(role);
    await expect(
      configure(
        client,
        {
          action: "locale.organization",
          organizationId: id("org-1"),
          locale: "en-GB",
        },
        {},
        "http://127.0.0.1:3001",
      ),
    ).rejects.toThrow();
    expect(
      (
        await client.rpc("set_organization_locale", {
          p_org: id("org-1"),
          p_locale: "en-GB",
        })
      ).error,
    ).not.toBeNull();
    expect(
      (await client.from("organization_settings").select("*")).data,
    ).toEqual([]);
  }
  const { client } = await professional("client_admin");
  await configure(
    client,
    {
      action: "locale.organization",
      organizationId: id("org-1"),
      locale: "en-GB",
    },
    {},
    "http://127.0.0.1:3001",
  );
  expect((await readLocalePreferences(client))?.organization).toBe("en-GB");
  await expect(
    configure(
      client,
      {
        action: "locale.organization",
        organizationId: id("org-2"),
        locale: "en-GB",
      },
      {},
      "http://127.0.0.1:3001",
    ),
  ).rejects.toThrow();
});
it("real translation adapters enforce capabilities, hold ownership and French consistency", async () => {
  const { client } = await professional("client_admin");
  const own = sql(
    "select id from hold_reasons where organization_id=md5('org-1')::uuid limit 1",
  );
  const other = sql(
    "select id from hold_reasons where organization_id=md5('org-2')::uuid limit 1",
  );
  const command = {
    action: "translation.hold",
    organizationId: id("org-1"),
    entityId: own,
    locale: "en-GB",
    label: "Awaiting a third party",
  };
  await configure(client, command, {}, "http://127.0.0.1:3001");
  await expect(
    configure(
      client,
      { ...command, entityId: other },
      {},
      "http://127.0.0.1:3001",
    ),
  ).rejects.toThrow();
  expect(
    (
      await client.rpc("save_reference_translation", {
        p_kind: "hold_reason",
        p_entity: other,
        p_locale: "en-GB",
        p_label: "Forged",
      })
    ).error,
  ).not.toBeNull();
  const category = sql("select id from categories where code='blocked_access'");
  const global = {
    action: "translation.catalog",
    kind: "category",
    entityId: category,
    locale: "en-GB",
    label: "Blocked access or ramp",
  };
  await expect(platformAdministration(client, global)).rejects.toThrow();
  const platform = await professional();
  sql(
    "insert into platform_admins(id,capabilities) values(md5('user-1-agent')::uuid,array['catalog.manage'])",
  );
  await platformAdministration(platform.client, global);
  const french = sql(`select name from categories where id='${category}'`);
  await platformAdministration(platform.client, {
    ...global,
    locale: "fr-FR",
    label: french,
  });
  expect(
    sql(
      `select label=name from category_translations t join categories c on c.id=t.category_id where c.id='${category}' and locale='fr-FR'`,
    ),
  ).toBe("t");
});
it("a real adapter mutation rolls back when transactional audit fails", async () => {
  const { client } = await professional();
  sql(
    "create function public.fail_locale_audit() returns trigger language plpgsql as $$begin raise exception 'Injected audit failure'; end$$; create trigger fail_locale_audit before insert on audit_events for each row execute function public.fail_locale_audit();",
  );
  await expect(
    changeLocalePreference(client, { locale: "en-GB" }),
  ).rejects.toBeDefined();
  expect((await readLocalePreferences(client))?.preferred).toBeNull();
});
