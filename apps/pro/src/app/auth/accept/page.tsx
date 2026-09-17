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
  return (
    <main id="main" className="shell">
      <AuthHeading>Activer mon accès professionnel</AuthHeading>
      {params.error && (
        <AuthMessage error>
          Invitation indisponible ou expirée. Contactez votre administrateur.
        </AuthMessage>
      )}
      {data?.length === 1 ? (
        <form action={accept}>
          <label htmlFor="name">Nom d’affichage</label>
          <input
            id="name"
            name="name"
            autoComplete="name"
            maxLength={200}
            aria-invalid={params.error ? true : undefined}
            aria-describedby={params.error ? "auth-error" : undefined}
            required
          />
          <button type="submit">Accepter l’invitation</button>
        </form>
      ) : (
        <p>Aucune invitation à activer.</p>
      )}
      <Link href="/espace">Accéder à mon espace</Link>
    </main>
  );
}
