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
      <h1>Activer mon accès professionnel</h1>
      {params.error && (
        <p role="alert">
          Invitation indisponible ou expirée. Contactez votre administrateur.
        </p>
      )}
      {data?.length === 1 ? (
        <form action={accept}>
          <label htmlFor="name">Nom d’affichage</label>
          <input id="name" name="name" autoComplete="name" required />
          <button type="submit">Accepter l’invitation</button>
        </form>
      ) : (
        <p>Aucune invitation à activer.</p>
      )}
      <Link href="/espace">Accéder à mon espace</Link>
    </main>
  );
}
