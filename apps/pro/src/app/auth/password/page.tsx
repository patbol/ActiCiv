import { AuthHeading, AuthMessage } from "../../../components/auth-feedback";
import { password } from "../actions";
export default async function Password({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return (
    <main id="main" className="shell">
      <AuthHeading>Définir mon mot de passe</AuthHeading>
      {params.error && (
        <AuthMessage error>
          Le mot de passe n’a pas pu être enregistré.
        </AuthMessage>
      )}
      <form action={password}>
        <label htmlFor="password">Nouveau mot de passe</label>
        <p id="hint">Au moins 12 caractères.</p>
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
        <button type="submit">Enregistrer</button>
      </form>
    </main>
  );
}
