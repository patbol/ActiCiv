import Link from "next/link";
import { getProfessionalContext, supabaseContext } from "@acticiv/backend";
import { professionalClient } from "../../lib/auth";
import { logout } from "../auth/actions";
import { AuthHeading } from "../../components/auth-feedback";
export default async function Space() {
  const context = await getProfessionalContext(
    supabaseContext(await professionalClient()),
  );
  return (
    <main id="main" className="shell">
      <AuthHeading>Mon espace professionnel</AuthHeading>
      {context ? (
        <>
          <p>Votre accès professionnel est actif.</p>
          <p>
            Les outils de traitement seront disponibles dans les prochaines
            étapes.
          </p>
        </>
      ) : (
        <p>
          Aucun accès professionnel actif.{" "}
          <Link href="/auth/accept">Vérifier mon invitation</Link> ou{" "}
          <Link href="/auth/login">me connecter</Link>.
        </p>
      )}
      <form action={logout}>
        <button type="submit">Se déconnecter</button>
      </form>
    </main>
  );
}
