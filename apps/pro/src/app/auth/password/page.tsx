import { getTranslations } from "next-intl/server";
import { AuthHeading, AuthMessage } from "../../../components/auth-feedback";
import { password } from "../actions";
export default async function Password({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const t = await getTranslations();
  return (
    <main id="main" className="shell">
      <AuthHeading>{t("auth.passwordTitle")}</AuthHeading>
      {params.error && (
        <AuthMessage error>{t("auth.passwordError")} </AuthMessage>
      )}
      <form action={password}>
        <label htmlFor="password">{t("auth.newPassword")} </label>
        <p id="hint">{t("auth.passwordHint")} </p>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          aria-describedby={params.error ? "hint auth-error" : "hint"}
          aria-invalid={params.error ? true : undefined}
          minLength={12}
          required
        />
        <button type="submit">{t("auth.passwordSubmit")} </button>
      </form>
    </main>
  );
}
