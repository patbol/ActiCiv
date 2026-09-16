import { localConfig, request, id } from "../integration/helpers.mjs";
const config = localConfig();
const password = process.env.ACTICIV_DEV_PASSWORD;
if (!password || password.length < 12)
  throw new Error(
    "Définir ACTICIV_DEV_PASSWORD (au moins 12 caractères), sans le versionner.",
  );
for (let n = 1; n <= 3; n++)
  for (const role of ["client_admin", "supervisor", "agent"]) {
    const result = await request(
      config,
      `/auth/v1/admin/users/${id(`user-${n}-${role}`)}`,
      { token: config.SERVICE_ROLE_KEY, method: "PUT", body: { password } },
    );
    if (!result.ok)
      throw new Error(
        "Provisionnement DEV impossible : appliquer le seed local.",
      );
  }
console.log("Neuf comptes fictifs provisionnés. Aucun mot de passe affiché.");
