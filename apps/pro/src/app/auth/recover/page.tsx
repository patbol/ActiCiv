import { getTranslations } from "next-intl/server";
import { AuthHeading, AuthMessage } from "../../../components/auth-feedback";
import { recover } from "../actions";
export default async function Recover({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const params = await searchParams;
  const t = await getTranslations();
  return (
    <main id="main" className="shell">
      <AuthHeading>{t("auth.recoverTitle")}</AuthHeading>
      {params.error && (
        <AuthMessage error>{t("auth.recoverError")} </AuthMessage>
      )}
      {params.sent ? (
        <AuthMessage>{t("auth.recoverSent")} </AuthMessage>
      ) : (
        <form action={recover}>
          <label htmlFor="email">{t("auth.email")} </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            aria-invalid={params.error ? true : undefined}
            aria-describedby={params.error ? "auth-error" : undefined}
            required
          />
          <button type="submit">{t("auth.recoverSubmit")} </button>
        </form>
      )}
    </main>
  );
}
