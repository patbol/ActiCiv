import { password } from "../actions";
export default async function Password({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return (
    <main id="main" className="shell">
      <h1>Définir mon mot de passe</h1>
      {params.error && (
        <p role="alert">Le mot de passe n’a pas pu être enregistré.</p>
      )}
      <form action={password}>
        <label htmlFor="password">Nouveau mot de passe</label>
        <p id="hint">Au moins 12 caractères.</p>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          aria-describedby="hint"
          minLength={12}
          required
        />
        <button type="submit">Enregistrer</button>
      </form>
    </main>
  );
}
