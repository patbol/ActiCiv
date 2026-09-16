import { localConfig, sql } from "../integration/helpers.mjs";
localConfig();
const uid = process.env.ACTICIV_PLATFORM_AUTH_USER_ID;
if (
  !uid ||
  !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uid)
)
  throw new Error(
    "ACTICIV_PLATFORM_AUTH_USER_ID doit identifier un utilisateur Auth local existant.",
  );
sql(
  `insert into public.platform_admins(id,capabilities) values('${uid}',array['organizations.manage','contracts.manage','territories.manage','catalog.manage','organizations.recover','audit.read']) on conflict(id) do update set active=true,capabilities=excluded.capabilities;`,
);
console.log("Administration plateforme locale activée et auditée.");
