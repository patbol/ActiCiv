import { getTranslations } from "next-intl/server";
import { AuthHeading, AuthMessage } from "../../../components/auth-feedback";
import Link from "next/link";
import { accept } from "../actions";
import { professionalClient } from "../../../lib/auth";
export default async function Accept({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const client = await professionalClient();
  const { data } = await client.rpc("pending_invitation");
  const params = await searchParams;
  const t = await getTranslations();
  return (
    <main id="main" className="shell">
      <AuthHeading>{t("auth.acceptTitle")}</AuthHeading>
      {params.error ? (
        <AuthMessage error>{t("auth.acceptError")} </AuthMessage>
      ) : data?.length !== 1 ? (
        <AuthMessage>{t("auth.acceptEmpty")} </AuthMessage>
      ) : null}
      {data?.length === 1 ? (
        <form action={accept}>
          <label htmlFor="name">{t("auth.displayName")} </label>
          <input
            id="name"
            name="name"
            autoComplete="name"
            maxLength={200}
            aria-invalid={params.error ? true : undefined}
            aria-describedby={params.error ? "auth-error" : undefined}
            required
          />
          <button type="submit">{t("auth.acceptSubmit")} </button>
        </form>
      ) : null}
      <Link href="/espace">{t("auth.spaceLink")} </Link>
    </main>
  );
}
