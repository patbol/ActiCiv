> Rapport initial historique. La Phase 1 est désormais clôturée : voir le postmortem du 16 septembre 2026. Les mentions « non vérifié » ci-dessous décrivent uniquement la livraison initiale.

# ActiCiv rapport de livraison de phase 1

Date : 15 septembre 2026. Périmètre : Foundation uniquement.

## Résultat

Les fondations sont implémentées et les vérifications applicatives locales passent. La phase 1 n'est pas déclarée entièrement validée : Supabase local n'a pas pu démarrer sans Docker/Podman, GitHub Actions n'a pas été exécuté, et les contrôles manuels VoiceOver/TalkBack restent à faire. Aucun mock n'est utilisé comme preuve équivalente.

Aucune phase 2 commencée. Aucun schéma métier, aucune policy RLS provisoire, aucune extension PostGIS, aucun compte professionnel ni signalement créé. Aucun déploiement Vercel ou provisionnement cloud.

## Fonctionnalités et fondations livrées

- Monorepo pnpm : deux applications Next.js et quatre packages internes.
- Deux pages de fondation différenciées, citoyen et professionnel, adaptées desktop/mobile. Elles annoncent explicitement que le service est en préparation.
- Backend partagé strictement interne : validation de configuration, accès Supabase sans clé privilégiée, journalisation structurée limitée à des champs autorisés.
- Endpoint `/api/health` dans chaque app : santé du processus uniquement, `database: not_checked` explicitement retourné.
- TypeScript strict, contrôle des imports interdits et protection server-only.
- Primitives Button/Input/Label/Dialog suivant les patterns shadcn et Radix ; seules les primitives utilisées sont installées.
- Marque, couleurs et SVG provisoire centralisés ; tokens de surface, focus, état, mouvement et espacement.
- Manifeste citoyen initial. Aucun service worker ou cache de données sensibles ; la PWA complète reste à préciser.
- États loading/error, lien d'évitement, focus visible, labels persistants et reduced-motion.
- Supabase CLI initialisée, configuration DEV, inscriptions publiques désactivées, `.env.example` sans secrets et seed d'amorçage.
- Vitest, Playwright, axe, formatage, lint, workflows CI et Dependabot.
- Trois ADR, décisions métier laissées ouvertes, documentation de démarrage et références source.

## Fichiers et modules

| Emplacement      | Contenu                                                              |
| ---------------- | -------------------------------------------------------------------- |
| apps/citizen     | App Next.js citoyenne, manifeste, pages et routes de fondation       |
| apps/pro         | App Next.js professionnelle, pages et routes de fondation            |
| packages/backend | Configuration Zod, client Supabase, logs, tests                      |
| packages/ui      | Button, Input, Label, Dialog, styles et tokens                       |
| packages/shared  | Configuration de marque, SVG central, flag public dormant            |
| packages/types   | Contrat public minimal et test des frontières                        |
| e2e              | 6 cas paramétrés exécutés sur 2 profils, soit 12 tests               |
| supabase         | Config DEV, seed, emplacements migrations/functions/tests documentés |
| .github          | Workflow qualité/app, job base locale et Dependabot                  |
| docs             | ADR, ambiguïtés, sources, QA, journaux et captures                   |

L'archive contient les sources et les preuves utiles, sans node_modules, caches, builds, secrets ni outil Chromium temporaire. Le dépôt Git local a été initialisé avec la branche main ; aucun remote ou push effectué.

## Migrations et seeds

Migrations créées : **0**, conformément au périmètre. PostGIS : **absent**.

`supabase/seed.sql` contient une instruction SQL d'amorçage (`select 1`) sans donnée métier. C'est un point d'entrée pour les phases suivantes, pas le jeu de démonstration de 50–100 signalements. Son exécution sur Supabase est **non vérifiée**. Aucun test RLS ou de concurrence n'est prétendu exécuté.

## Commandes exécutées et résultats

Les journaux disponibles sont dans `docs/quality/commands`. Les commandes d'installation ont été exécutées progressivement ; la liste exacte des versions résolues est conservée dans `dependencies.txt` et le lockfile.

| Commande réellement exécutée                                                                                                                                                                                                                   | Résultat                                                                                                                |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `pnpm --version`                                                                                                                                                                                                                               | 11.19.0                                                                                                                 |
| `node --version`                                                                                                                                                                                                                               | 24.19.0                                                                                                                 |
| `npm view next version --fetch-retries=0 --fetch-timeout=15000`                                                                                                                                                                                | 16.3.5                                                                                                                  |
| `git init acticiv` puis `git branch -m main`                                                                                                                                                                                                   | Dépôt local initialisé                                                                                                  |
| `pnpm --filter @acticiv/citizen --filter @acticiv/pro add next@16.3.5 react react-dom`                                                                                                                                                         | Dépendances des apps installées                                                                                         |
| `pnpm add -Dw typescript @types/node @types/react @types/react-dom tailwindcss @tailwindcss/postcss postcss eslint eslint-config-next typescript-eslint prettier eslint-config-prettier vitest @playwright/test @axe-core/playwright supabase` | Première résolution ; versions majeures incompatibles détectées et script natif bloqué                                  |
| `pnpm peers check`                                                                                                                                                                                                                             | A identifié les incompatibilités ESLint 10 et TypeScript 7 avec les plugins installés ; contrôle ultérieur sans conflit |
| `pnpm add -Dw typescript@5.9.3 eslint@9 @types/node@24 vitest@4`                                                                                                                                                                               | Versions compatibles retenues ; finalisation après configuration explicite des scripts natifs                           |
| `pnpm install`                                                                                                                                                                                                                                 | Réussite après autorisation ciblée d'unrs-resolver, sans autorisation générale                                          |
| `pnpm --filter @acticiv/ui add @radix-ui/react-dialog @radix-ui/react-label @radix-ui/react-slot class-variance-authority clsx tailwind-merge lucide-react react`                                                                              | Réussite                                                                                                                |
| `pnpm --filter @acticiv/backend add server-only zod @supabase/supabase-js`                                                                                                                                                                     | Réussite                                                                                                                |
| `pnpm install --frozen-lockfile`                                                                                                                                                                                                               | Réussite, lockfile à jour                                                                                               |
| `pnpm exec supabase init`                                                                                                                                                                                                                      | Réussite, config générée puis ajustée                                                                                   |
| `pnpm db:start`                                                                                                                                                                                                                                | Échec environnement : Docker et Podman absents                                                                          |
| `pnpm format`                                                                                                                                                                                                                                  | Formatage appliqué                                                                                                      |
| `pnpm lint`                                                                                                                                                                                                                                    | Réussite après corrections, zéro warning                                                                                |
| `pnpm typecheck`                                                                                                                                                                                                                               | Réussite pour apps, packages et outillage E2E                                                                           |
| `pnpm test`                                                                                                                                                                                                                                    | 6 tests réussis, 3 fichiers                                                                                             |
| `pnpm build`                                                                                                                                                                                                                                   | Les deux builds de production réussissent                                                                               |
| `pnpm exec playwright install chromium`                                                                                                                                                                                                        | Échec du téléchargement CDN par timeouts                                                                                |
| `npm install --prefix /workspace/scratch/28aa7e1fbf85/browser-qa --no-audit --no-fund @sparticuz/chromium`                                                                                                                                     | Outil QA temporaire installé hors monorepo                                                                              |
| `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/workspace/scratch/28aa7e1fbf85/browser-qa/bin/chromium pnpm test:e2e`                                                                                                                                    | 12 tests réussis en 29,9 secondes, sans retry                                                                           |
| `pnpm audit --audit-level high`                                                                                                                                                                                                                | Aucune vulnérabilité connue signalée                                                                                    |
| `pnpm list -r --depth 0`                                                                                                                                                                                                                       | Inventaire des versions enregistré                                                                                      |

Les commandes d'E2E lancent réellement `next start` sur les deux builds, sur les ports 3000 et 3001. Chromium utilisé : **153.0.8010.0**, fourni par @sparticuz/chromium 153.0.0 ; extraction adaptée à ce runtime sans changement du produit. Il s'agit d'un navigateur réel. Ce résultat ne prouve pas la compatibilité Safari iOS, Firefox ou les lecteurs d'écran mobiles. La CI conserve le téléchargement Playwright standard.

Les vérifications de formatage et de diff finales sont enregistrées dans leurs journaux. Les scripts GitHub Actions sont livrés mais aucune exécution GitHub n'est revendiquée.

## Tests créés

### Unitaires et architecture

1. Configuration absente/invalide : erreur explicite sans fuite de valeur.
2. Clé publique vide : rejet.
3. Configuration locale valide : acceptée, secrets non déclarés écartés.
4. Journalisation : objets d'erreur, URL, email et token supplémentaires non sérialisés.
5. Journalisation : valeurs opérationnelles et durée nulle préservées.
6. Frontières : imports backend interdits dans ui/shared/types par la configuration ESLint réelle.

Ces tests utilisent des valeurs fictives pour tester du code pur, pas pour prétendre tester la base.

### E2E et accessibilité

Pour chacune des deux surfaces et chacun des deux profils desktop/mobile : rendu, absence de débordement horizontal, axe sur page et dialogue, activation clavier, saisie avec label, confinement du focus, fermeture Escape, restitution du focus, lien d'évitement et reduced-motion.

Résultat final : **12/12**. Les scans axe sur les pages et dialogues n'ont détecté aucune violation des règles sélectionnées. Cela ne constitue pas une certification WCAG 2.2 AA.

Captures desktop/mobile des deux surfaces inspectées visuellement : pas de chevauchement ou de texte coupé observé. Elles sont dans `screenshots/`.

## Défauts rencontrés et corrections

| Défaut                                                    | Correction                                    | Protection de non-régression                                  |
| --------------------------------------------------------- | --------------------------------------------- | ------------------------------------------------------------- |
| Versions ESLint/TypeScript incompatibles avec les plugins | Versions compatibles figées par lockfile      | Installation frozen, peers check, lint et typecheck           |
| Script natif du résolveur non autorisé par pnpm           | Allowlist ciblée, aucun mode permissif global | Installation frozen réussie                                   |
| Liens internes HTML et exports PostCSS anonymes           | Composant Link et export nommé localement     | Règles ESLint conservées                                      |
| Erreur JSX temporaire pendant conversion des liens        | Balises ouvrantes/fermantes corrigées         | Typecheck et builds des deux apps                             |
| Test de frontière expirant au chargement d'ESLint         | Délai ciblé 15 s pour ce test d'outillage     | Assertions inchangées, test exécuté avec succès               |
| Chromium alternatif instable en mode single-process       | Retrait de ce mode de lancement               | Même suite de 12 tests, isolation des contextes et zéro retry |
| Paramètre testInfo oublié lors d'ajout des captures       | Signature de fixture corrigée                 | Typecheck outillage et E2E conservés                          |

Aucun test critique supprimé ou ignoré ; aucune assertion affaiblie. Les erreurs transitoires de configuration et compilation sont couvertes par les contrôles correspondants. Les deux échecs intermédiaires E2E sont conservés dans les journaux avec le résultat final.

## Sécurité

Backend server-only et règle d'import vérifiés ; aucune clé privilégiée dans le client Supabase. Configuration personnelle exclue de Git. Les fichiers `.env.example` contiennent uniquement noms, URL locale et valeur de clé vide. Aucun secret réel requis pour les pages de fondation. Logs limités à des événements opérationnels et identifiants de requête générés côté serveur. Inscription publique Supabase désactivée dans la configuration.

RLS, RBAC, Auth, Storage privé et commandes transactionnelles : non implémentés à ce stade, à vérifier avec le schéma de phase 2. Secret scanning GitHub/push protection : non configurés et non vérifiés faute de dépôt distant associé. Le contrôle local de signatures de secrets est limité et ne remplace pas ces mécanismes.

## Critères d'acceptation

| Critère                                 | Statut                                                             |
| --------------------------------------- | ------------------------------------------------------------------ |
| Installation monorepo à lockfile figé   | Vérifié                                                            |
| Citizen démarre                         | Vérifié via serveur de production et E2E                           |
| Pro démarre                             | Vérifié via serveur de production et E2E                           |
| TypeScript strict                       | Vérifié                                                            |
| Lint                                    | Vérifié                                                            |
| Unitaires                               | Vérifié                                                            |
| Builds des deux apps                    | Vérifié                                                            |
| E2E et axe                              | Vérifié dans Chromium, limites ci-dessus                           |
| Design tokens et marque centralisée     | Implémentés, rendu inspecté                                        |
| Primitives accessibles                  | Tests automatiques/clavier réussis ; lecteurs d'écran non vérifiés |
| Configuration Supabase documentée       | Livrée                                                             |
| Supabase local opérationnel             | Non vérifié : Docker/Podman absents                                |
| Seed réellement exécuté                 | Non vérifié : dépend de Supabase                                   |
| CI GitHub exécutée                      | Non vérifié : aucun dépôt distant associé                          |
| Architecture et ADR                     | Livrées                                                            |
| Aucune infrastructure PROD provisionnée | Respecté                                                           |
| Validation totale de phase              | Non acquise : critères externes restants                           |

## Dette et limites

- ESLint 9.39.5 est signalé déprécié par le registre. Il est conservé pour la compatibilité déclarée des plugins Next/React ; aucune vulnérabilité connue détectée par l'audit. Réévaluer ensemble la chaîne lint avant production, sans ignorer les peer dependencies.
- Les couleurs actuelles passent les scans ; l'éditeur et la validation automatique de palettes client appartiennent à la phase 5.
- Le manifeste est une fondation, pas une promesse d'usage hors ligne ou d'installabilité universelle.
- Aucun test métier, RLS ou de concurrence ne peut être revendiqué sans fonctionnalités et base correspondantes.
- Les données riches de démonstration restent différées.
- Les ambiguïtés du livre sont toutes conservées dans open-questions.md.

## ADR et documentation

Trois ADR : monolithe et frontières ; persistance et sécurité ; reproductibilité et qualité. Les conventions triviales restent dans le README ou la documentation UI. Références originales du livre et du prompt jointes sans altération.

## Prochaine étape recommandée

Avant de déclarer la phase 1 acceptée : exécuter db:start/db:reset/db:status sur une machine Docker compatible, associer le dépôt GitHub et observer les deux jobs, puis compléter les validations manuelles d'accessibilité. Les commandes sont documentées et les échecs doivent rester bloquants.

Après cette clôture et validation explicite : préparer la phase 2, résoudre les questions de tenancy/rôles/territoires et confirmer ou écarter PostGIS avec le modèle réel. Aucun passage automatique à la phase 2.
