# ActiCiv — Engineering Quality, Internationalisation & Knowledge Foundations

**Phase 2 = CLOSED** — baseline officielle : `fac0fc8663d1f32b09b720fddffd46f0829c8a6a`.

**Phase 2 bis = CURRENT** — **2bis-A et 2bis-B CLOSED / APPROVED** ; checkpoint actif : **2bis-C**, internationalisation, locales, préférences et traductions uniquement. **Phase 3 = NOT STARTED**. Aucun 2bis-D sans validation explicite de Patrick.

La [clôture Phase 2](docs/evidence/phase2/ActiCiv_Phase2_Closure_Attestation_fac0fc8.md) atteste 260 PASS, 0 FAIL et 1 DEFERRED (TalkBack). Les garanties métier et sécurité de Phase 2 restent acquises.

Entrées : [documentation](docs/README.md), [règles persistantes](AGENTS.md), [contrat de lancement](docs/references/current/ActiCiv_Phase2bis_Launch_Index.md), [bilan 2bis-A](docs/quality/phase-2bis-a-report.md).

- CURRENT : [docs/references/current/](docs/references/current/ActiCiv_Phase2bis_Launch_Index.md), livre v1.4, prompt et checklist v1.2.
- HISTORICAL : [docs/references/historical/](docs/references/historical/README.md), références antérieures conservées.
- EVIDENCE : [docs/evidence/](docs/evidence/README.md), postmortems, attestations et preuves datées.

## Démarrage

Pré requis : Node 24.21.0 via nvm, pnpm 11.19.0. Dans chaque nouveau shell, charger nvm puis activer .nvmrc :

```sh
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"
nvm use
pnpm install --frozen-lockfile
pnpm dev
```

Citoyen : http://127.0.0.1:3000 — Professionnel : http://127.0.0.1:3001.
Les pages de fondation démarrent sans Supabase. /api/health atteste uniquement du processus et retourne database: not_checked.

## Base locale

Installer un moteur compatible Docker, puis :

```sh
pnpm db:start
pnpm db:status
pnpm db:reset
pnpm db:stop
```

Reset est destructif pour la base DEV locale uniquement. Ne pas utiliser sur un environnement contenant des données à conserver. La CLI doit appliquer config.toml et seed.sql. Le seed crée trois organisations et neuf identités fictives sans mot de passe utilisable ; les migrations activent PostGIS. La [référence d'implémentation Phase 2](docs/references/historical/ActiCiv_Phase2_Implementation_Reference_HISTORICAL.md) conserve la procédure de provisionnement DEV correspondant à la baseline clôturée. Aucun reset n'est nécessaire pour le checkpoint documentaire 2bis-A.
Copier apps/citizen/.env.example et apps/pro/.env.example vers .env.local dans les dossiers respectifs ; renseigner la clé publique de votre instance locale. Ne pas versionner les .env.local ni recopier leurs valeurs dans les logs. Aucun secret cloud requis.

## Qualité

```sh
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
pnpm audit --audit-level high
```

Les E2E démarrent les builds locaux sur 3000/3001. Libérer ces ports avant une validation indépendante. CI exécute les mêmes contrôles et un job Supabase sur un runner Docker. Les preuves Phase 2 portent sur sa baseline officielle ; elles ne prouvent pas les futurs changements Phase 2 bis. Les contrôles de checkpoint suivent la [Definition of Done](docs/quality/definition-of-done.md). Les scripts `verify`, `verify:full` et `release:verify --rebuild-db` sont conservés. Aucun réglage distant de secret scanning/push protection n'est modifié par 2bis-A.

## Architecture et périmètre

apps/citizen et apps/pro consomment packages/ui, shared, types et, exclusivement côté serveur, backend. Backend n'est pas un service déployable. SQL et les modèles Core Data & Security sont implémentés en Phase 2. Voir docs/architecture-decisions, docs/product-decisions/open-questions.md et docs/quality/phase-1-report.md.

Hébergement cible : Vercel, deux projets liés au même monorepo ; aucun déploiement créé. Les références courantes sont dans `docs/references/current/`. La [politique documentaire](docs/quality/documentation-policy.md) définit leur articulation avec les ADR actives, l'historique et les preuves.

## Navigateur et clôture Phase 2

La validation Phase 2 utilise Chromium installé par Playwright, en desktop et émulation mobile. Le navigateur temporaire documenté au postmortem Phase 1 était propre à cette livraison historique. VoiceOver/Safari fait l’objet d’un contrôle manuel distinct ; TalkBack n’est pas assimilé au profil mobile Chromium.

La passe de clôture et ses preuves sont décrites dans [le postmortem Phase 2](docs/evidence/phase2/ActiCiv_Phase2_Postmortem_HISTORICAL.md). La commande `pnpm release:verify --rebuild-db` exige un arbre propre, reconstruit la base DEV locale depuis zéro (données DEV supprimées), rejoue reset/seed puis tous les contrôles. Elle enregistre le SHA et refuse toute modification Git pendant la validation. Ne jamais l’utiliser sur des données à conserver. Les preuves finales et l’archive doivent désigner ce même SHA.

`pnpm secrets:check` utilise Gitleaks 8.30.1, téléchargé hors du dépôt et vérifié par une empreinte officielle figée. Il vérifie son détecteur puis scanne tout l’historique accessible depuis HEAD avec résultats expurgés. Le scanner est un outil de qualité ; aucune dépendance runtime de l’application n’est ajoutée.
