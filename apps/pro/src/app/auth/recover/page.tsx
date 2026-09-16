import { recover } from "../actions";
export default async function Recover({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const params = await searchParams;
  return (
    <main id="main" className="shell">
      <h1>Récupérer mon accès</h1>
      {params.sent ? (
        <p role="status">
          Si cette adresse correspond à un compte, un lien de récupération sera
          envoyé.
        </p>
      ) : (
        <form action={recover}>
          <label htmlFor="email">Adresse email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
          <button type="submit">Recevoir un lien</button>
        </form>
      )}
    </main>
  );
}
