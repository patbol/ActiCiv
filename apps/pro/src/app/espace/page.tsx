import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { getProfessionalContext, supabaseContext } from "@acticiv/backend";
import { professionalClient } from "../../lib/auth";
import { logout } from "../auth/actions";
import { AuthHeading } from "../../components/auth-feedback";
export default async function Space() {
  const t = await getTranslations("auth");
  const context = await getProfessionalContext(
    supabaseContext(await professionalClient()),
  );
  return (
    <main id="main" className="shell">
      <AuthHeading>{t("spaceTitle")}</AuthHeading>
      {context ? (
        <>
          <p>{t("spaceActive")} </p>
          <p>{t("spaceFuture")} </p>
        </>
      ) : (
        <p>
          {t("spaceInactive")}{" "}
          <Link href="/auth/accept">{t("checkInvite")} </Link> {t("or")}{" "}
          <Link href="/auth/login">{t("signInLink")} </Link>.
        </p>
      )}
      <form action={logout}>
        <button type="submit">{t("logout")} </button>
      </form>
    </main>
  );
}
