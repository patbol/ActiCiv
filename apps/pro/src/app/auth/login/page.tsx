import { getTranslations } from "next-intl/server";
import { AuthHeading, AuthMessage } from "../../../components/auth-feedback";
import Link from "next/link";
import { login } from "../actions";
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const t = await getTranslations();
  return (
    <main id="main" className="shell">
      <AuthHeading>{t("auth.loginTitle")}</AuthHeading>
      <p>{t("auth.loginIntro")} </p>
      {params.error && <AuthMessage error>{t("auth.loginError")} </AuthMessage>}
      <form action={login}>
        <label htmlFor="email">{t("auth.email")} </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          aria-invalid={params.error ? true : undefined}
          aria-describedby={params.error ? "auth-error" : undefined}
          required
        />
        <label htmlFor="password">{t("auth.password")} </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={params.error ? true : undefined}
          aria-describedby={params.error ? "auth-error" : undefined}
          required
        />
        <button type="submit">{t("auth.loginSubmit")} </button>
      </form>
      <p>
        <Link href="/auth/recover">{t("auth.forgot")} </Link>
      </p>
      <Link href="/">{t("common.home")} </Link>
    </main>
  );
}
