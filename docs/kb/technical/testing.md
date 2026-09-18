---
id: technical.testing
domain: engineering-quality
type: technical-topic
status: active
roles: [developer, reviewer]
requirements:
  - "Phase 2 bis Master Prompt v1.2 §§6–14, 63, 109–110"
  - "Patrick — autorisation du checkpoint 2bis-B uniquement"
related_adrs: [ADR-003, ADR-009]
related_code:
  - e2e/fixtures/test.ts
  - e2e/fixtures/supabase.ts
  - e2e/helpers/session.ts
  - e2e/helpers/ui.ts
  - tooling/eslint/conventions.mjs
  - eslint.config.mjs
  - playwright.config.ts
related_tests:
  - e2e/auth.spec.ts
  - e2e/foundation.spec.ts
  - packages/types/src/conventions.test.ts
  - packages/types/src/architecture.test.ts
related_docs:
  - docs/quality/phase-2bis-b-report.md
  - docs/quality/definition-of-done.md
---

# Tests E2E et conventions exécutables

## État et responsabilités

2bis-B conserve les 13 scénarios de Phase 2, soit 26 exécutions desktop/mobile. POM et tagging sont implémentés. 2bis-C ajoute les scénarios de locale décrits dans la [KB i18n](internationalisation.md) ; couverture et snapshots/gates complets restent hors périmètre.

- `e2e/pages/` : six objets sans classe de base ; navigation, locators et actions réutilisables.
- `e2e/components/dialog.ts` : dialogue réellement partagé par Citizen/Pro.
- `e2e/fixtures/test.ts` : fournit pages et comptes à portée test ; aucun contexte navigateur global ni storageState partagé.
- `e2e/fixtures/supabase.ts` : préparation Node-side sur Supabase local ; jamais appelée depuis le bundle ni le navigateur.
- `e2e/helpers/ui.ts` : analyse axe, activation clavier et désactivation explicite de validation HTML pour tester le serveur.
- `e2e/helpers/session.ts` : confirmation via cookies du contexte, lecture HTTP et écriture de configuration depuis le navigateur.
- Specs : scénario et assertions observables ; aucune assertion métier cachée dans un POM.

Les anciens IDs de messages sont remplacés par `getByRole("main").getByRole("alert" | "status")`. Le scope main distingue le message Auth de l'annonceur de route Next.js. Les champs password utilisent `getByLabel` car ils n'ont pas de rôle textbox implicite. Le formulaire est atteint via `input.form` uniquement pour déclencher la validation serveur. Aucun testid ajouté.

Les textes accessibles restent français, centralisés dans les objets de page ; les assertions de contenu significatives restent dans les specs. 2bis-C pourra adapter ces points à la locale sans ajouter maintenant de catalogue/traduction ni importer les chaînes de l'application comme oracle.

## Métadonnées et sélection

Forme requise :

```ts
test.describe("session", { tag: ["@route:auth", "@component:login"] }, () => {
  test(
    "professional can sign in",
    { tag: ["@critical", "@type:security"] },
    async ({ login }) => {
      // scénario et assertions
    },
  );
});
```

Une seule criticité par test, même en cas de doublon identique ; aucune criticité héritée de la suite. Format lowercase kebab-case pour les noms route/composant. Types autorisés : security/a11y/smoke/regression. Les tags dans les titres, les valeurs dynamiques et les tags d'état broken/flaky/todo sont refusés. Les suites imbriquées héritent route/composant ; toutes les specs actuelles ont ces deux dimensions.

Après chargement nvm et `nvm use`, Supabase local démarré et builds disponibles :

```sh
pnpm exec playwright test --list
pnpm test:e2e --grep '@critical'
pnpm test:e2e --grep '@route:auth'
pnpm test:e2e --grep '@component:dialog'
pnpm test:e2e --grep '(?=.*@critical)(?=.*@route:auth)'
pnpm test:e2e --grep '@type:smoke'
```

`--list` peut être ajouté pour contrôler une sélection sans exécuter les tests. Aucun grep n'est fixé dans la configuration : la commande E2E normale lance les 26 tests. Ces sélections ne remplacent pas la suite complète de validation.

## Garde-fous et exceptions

`pnpm lint` exécute les trois règles de `tooling/eslint/conventions.mjs` ; la CI les obtient via `verify`. Les tests de règles sont dans `packages/types/src/conventions.test.ts`.

- metadata : tags statiques, portée, criticité unique, dimensions, callback explicite.
- exécution E2E : focus direct/brackets/alias par propriété/déstructuration, formes fit/fdescribe, skip/fixme, waitForTimeout interdits dans specs/pages/helpers/fixtures ; commentaires de désactivation inline refusés.
- production : log/debug/trace et leurs références usuelles, accès gtag/dataLayer, imports/re-exports/providers connus et imports de tests/fixtures interdits dans apps/packages sources, hors fichiers de test. Warn/error restent soumis à justification dans les adaptateurs ; diagnostics outillage permis.
- protections antérieures : domain/application sans framework/réseau ; UI publique sans backend privilégié. Tests d'architecture inchangés.

Aucun skip ni timeout arbitraire approuvé pour B. Une exception exige validation de Patrick, responsable, raison et expiration, plus adaptation testée du garde-fou. Aucun mécanisme inline ne permet de s'auto-autoriser. L'arrivée d'un provider/adaptateur ou d'une surface sans dimension pertinente sera traitée au checkpoint autorisé ; pas d'exemption générale créée à l'avance.

Ce sont des contrôles syntaxiques proportionnés, pas une analyse exhaustive de tous les alias ou flux dynamiques. Ils ne remplacent pas la revue ni le futur scanner d'artefact compilé.

## Auth, isolation et données

Les identités seed restent réparties comme avant : recovery agent1/supervisor1, login agent3/supervisor3, admins client_admin2/client_admin3. Leur mot de passe éphémère est provisionné par fixture ; chaque test dépend uniquement de sa propre préparation. Les invitations utilisent UUID/email uniques. Un nouveau profil doit recevoir un périmètre seed distinct ; un profil inconnu est refusé.

Les secrets de préparation restent côté Node, issus de la CLI locale. Aucun token/mot de passe n'est incorporé aux sources ou aux messages d'erreur de setup. Les requêtes admin restent des préparations de test ; les écritures métier de configuration sont exécutées avec les cookies de l'utilisateur dans le navigateur. Réponse API non-2xx = échec immédiat de fixture, pas de succès silencieux.

Aucun reset nécessaire pour ce refactor. Les invitations synthétiques créées persistent dans la base DEV comme auparavant ; le reset explicite reste réservé à une opération de reconstruction autorisée. Ne pas lancer deux campagnes mutantes sur la même base simultanément. Audit métier, analytics et logs du produit ne changent pas.

## Validation et limites

`pnpm verify` couvre format/lint/types/unit/builds/bundles ; `pnpm test:integration` couvre les adaptateurs réels ; `pnpm test:e2e` couvre les deux profils, axe et clavier avec retries zéro. Voir [preuves 2bis-B](../../quality/phase-2bis-b-report.md) pour les résultats réellement obtenus.

Le nombre d'analyses axe et les matchers par scénario ont été comparés à la baseline A. L'automatisation ne remplace pas VoiceOver/TalkBack ; aucun changement UI produit n'est introduit ici. Aucun nouveau résultat manuel n'est prétendu. Aucun Quality Snapshot, coverage, scanner PROD complet ou logger ajouté.

Références : [ADR-009](../../architecture-decisions/009-e2e-conventions.md), [DoD](../../quality/definition-of-done.md), [traçabilité](../../quality/traceability.md), [règles persistantes](../../../AGENTS.md).

## Complément 2bis-C

La locale des 13 scénarios historiques est explicitement `fr-FR`. Le Component Object `e2e/components/locale-control.ts` porte les actions du sélecteur partagé ; `e2e/locale.spec.ts` exerce aussi l’anglais, SSR, persistance, focus et erreurs. Les comptes dédiés au test de préférence sont remis à NULL avant/après usage, sans modifier les droits ni les assertions des scénarios historiques.

## Complément 2bis-D

Les 38 exécutions issues de C conservent leurs assertions. Le helper axe attache seulement les comptes de violations/incomplete et IDs de règles au rapport JSON, sans HTML ni données de page. La couverture unitaire V8 et les preuves canoniques sont décrites dans la [KB qualité](quality-engineering.md) ; les mentions de hors-périmètre ci-dessus concernent B/C.

## Complément 2bis-E

Les 38 tests historiques conservent leurs assertions sur les builds DEMO séparés (`pnpm test:e2e` les construit). La suite `playwright.prod.config.ts` sélectionne seulement `artifact-prod.spec.ts` contre PROD : absence du dialogue, axe, headers et erreurs réelles. Aucun retry ni skip ajouté. `pnpm build` est requis avant la suite PROD. Les sélections `pnpm exec playwright test` requièrent `pnpm build:demo` préparé. Les traces brutes restent privées, hors upload CI.
