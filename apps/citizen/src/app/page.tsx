import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import { brand } from "@acticiv/shared";
import { FoundationPreview } from "@acticiv/ui/foundation-preview";
export default async function Page() {
  const t = await getTranslations();
  return (
    <div className="shell">
      <header>
        <Link className="brand" href="/" aria-label={t("common.homeLabel")}>
          <Image src={brand.logo} width={36} height={36} alt="" />
          {brand.name}
        </Link>
        <span className="status">{t("foundation.citizenStatus")} </span>
      </header>
      <main id="main">
        <section className="hero">
          <div>
            <p className="eyebrow">{t("common.tagline")}</p>
            <h1>
              {t("foundation.citizenTitle")} <br />
              <em>{t("foundation.citizenEmphasis")} </em>
            </h1>
            <p className="lead">{t("foundation.citizenLead")} </p>
            <div className="actions">
              <FoundationPreview />
            </div>
            <p className="small">{t("foundation.notice")} </p>
          </div>
          <div className="scene" aria-hidden="true">
            <span className="scene-label">{t("foundation.sceneLabel")} </span>
            <div className="path" />
            <div className="scene-card">
              <strong>{t("foundation.sceneTitle")} </strong>
              <span className="small">{t("foundation.sceneBody")} </span>
            </div>
          </div>
        </section>
        <section className="principles" aria-label={t("foundation.principles")}>
          <article>
            <h2>{t("foundation.simpleTitle")} </h2>
            <p>{t("foundation.simpleBody")} </p>
          </article>
          <article>
            <h2>{t("foundation.safetyTitle")} </h2>
            <p>{t("foundation.safetyBody")} </p>
          </article>
          <article>
            <h2>{t("foundation.accessibleTitle")} </h2>
            <p>{t("foundation.accessibleBody")} </p>
          </article>
        </section>
      </main>
      <footer>
        {brand.name} · {t("common.description")}
      </footer>
    </div>
  );
}
