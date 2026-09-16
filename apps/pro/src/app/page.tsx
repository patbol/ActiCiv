import Image from "next/image";
import Link from "next/link";
import { brand } from "@acticiv/shared";
import { FoundationDialog } from "@acticiv/ui";
export default function Page() {
  return (
    <div className="shell">
      <header>
        <Link className="brand" href="/" aria-label={brand.name + " — accueil"}>
          <Image src={brand.logo} width={36} height={36} alt="" />
          {brand.name}
        </Link>
        <span className="status">Espace professionnel · En préparation</span>
      </header>
      <main id="main">
        <section className="hero">
          <div>
            <p className="eyebrow">{brand.tagline}</p>
            <h1>
              Sur le terrain.
              <br />
              <em>Du côté de l’action.</em>
            </h1>
            <p className="lead">
              Un espace commun pour les équipes qui rendent les lieux plus
              accessibles. Les outils de traitement seront disponibles dans les
              prochaines étapes.
            </p>
            <div className="actions">
              <FoundationDialog />
            </div>
            <p className="small">
              Aperçu de développement · Aucun signalement envoyé
            </p>
          </div>
          <div className="scene" aria-hidden="true">
            <span className="scene-label">L’accessibilité commence ici</span>
            <div className="path" />
            <div className="scene-card">
              <strong>Des lieux ouverts à chacun.</strong>
              <span className="small">
                Une attention. Un geste. Un passage libéré.
              </span>
            </div>
          </div>
        </section>
        <section className="principles" aria-label="Nos engagements">
          <article>
            <h2>Simple, dès le départ</h2>
            <p>
              Une expérience pensée pour le quotidien, sur mobile et sur le
              terrain.
            </p>
          </article>
          <article>
            <h2>Votre sécurité d’abord</h2>
            <p>Aucun signalement ne mérite de vous mettre en danger.</p>
          </article>
          <article>
            <h2>Accessible par conception</h2>
            <p>
              Des interfaces lisibles, utilisables au clavier et attentives à
              chacun.
            </p>
          </article>
        </section>
      </main>
      <footer>
        {brand.name} · {brand.description}
      </footer>
    </div>
  );
}
