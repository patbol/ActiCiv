import { AuthHeading, AuthMessage } from "../../../components/auth-feedback";
import { recover } from "../actions";
export default async function Recover({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const params = await searchParams;
  return (
    <main id="main" className="shell">
      <AuthHeading>Récupérer mon accès</AuthHeading>
      {params.error && (
        <AuthMessage error>
          Le lien n’a pas pu être envoyé. Vérifiez l’adresse et réessayez.
        </AuthMessage>
      )}
      {params.sent ? (
        <AuthMessage>
          Si cette adresse correspond à un compte, un lien de récupération sera
          envoyé.
        </AuthMessage>
      ) : (
        <form action={recover}>
          <label htmlFor="email">Adresse email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            aria-invalid={params.error ? true : undefined}
            aria-describedby={params.error ? "auth-error" : undefined}
            required
          />
          <button type="submit">Recevoir un lien</button>
        </form>
      )}
    </main>
  );
}
