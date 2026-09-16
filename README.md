# ActiCiv — fondations et Core Data & Security

Phase 1 clôturée. Phase 2 en cours : identités professionnelles, organisations, services, contrats, territoires PostGIS, horaires/SLA versionnés et audit. Aucun workflow de signalement ni Phase 3. Voir [documentation Phase 2](docs/phase-2.md).

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

Reset est destructif pour la base DEV locale uniquement. Ne pas utiliser sur un environnement contenant des données à conserver. La CLI doit appliquer config.toml et seed.sql. Le seed crée trois organisations et neuf identités fictives sans mot de passe utilisable ; les migrations activent PostGIS. Voir la procédure de provisionnement DEV dans docs/phase-2.md.
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

Les E2E démarrent les builds locaux sur 3000/3001. Libérer ces ports avant une validation indépendante. CI exécute les mêmes contrôles et un job Supabase sur un runner Docker. Les jobs Phase 1 ont été validés selon le postmortem. La validation Phase 2 doit porter sur son propre SHA. Activer secret scanning/push protection lorsqu'ils sont disponibles sur ce dépôt ; aucun réglage distant n'a été effectué.

## Architecture et périmètre

apps/citizen et apps/pro consomment packages/ui, shared, types et, exclusivement côté serveur, backend. Backend n'est pas un service déployable. SQL et les modèles Core Data & Security sont implémentés en Phase 2. Voir docs/architecture-decisions, docs/product-decisions/open-questions.md et docs/quality/phase-1-report.md.

Hébergement cible : Vercel, deux projets liés au même monorepo ; aucun déploiement créé. Les sources de référence sont dans docs/references. Elles priment sur l'implémentation.

## Navigateur de vérification alternatif

Si un Chromium existe déjà localement, `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` permet d'utiliser son chemin pour les E2E. L'exécution de cette livraison utilise Chromium 153.0.8010.0 fourni par un outil QA temporaire hors monorepo, le CDN Playwright ayant expiré. Ce navigateur est réel ; il ne remplace pas la validation Safari/Firefox. La CI conserve l'installation standard Playwright.
