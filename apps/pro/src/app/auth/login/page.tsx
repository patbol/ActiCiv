import Link from "next/link";
import { login } from "../actions";
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return (
    <main id="main" className="shell">
      <h1>Connexion professionnelle</h1>
      <p>Accès réservé aux professionnels invités.</p>
      {params.error && (
        <p role="alert">Connexion impossible. Vérifiez vos identifiants.</p>
      )}
      <form action={login}>
        <label htmlFor="email">Adresse email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
        />
        <label htmlFor="password">Mot de passe</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
        <button type="submit">Se connecter</button>
      </form>
      <p>
        <Link href="/auth/recover">Mot de passe oublié</Link>
      </p>
      <Link href="/">Accueil</Link>
    </main>
  );
}
