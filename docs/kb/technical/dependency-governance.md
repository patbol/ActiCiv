---
id: technical.dependency-governance
title: "Coût et supply chain des dépendances"
introduced_in: phase-2bis-e
domain: engineering-quality
type: technical-topic
status: active
roles: [developer, reviewer]
requirements: ["Patrick — checkpoint 2bis-E uniquement"]
related_adrs: [ADR-011, ADR-012]
related_code: [package.json, pnpm-lock.yaml, pnpm-workspace.yaml]
related_tests: [tooling/quality/assurance.test.ts]
related_docs: [docs/quality/phase-2bis-e-report.md]
---

# Coût et supply chain des dépendances

Toute nouvelle dépendance runtime significative doit expliquer besoin, client/server, coût mesuré/attendu, tree-shaking, alternative plus légère, maintenance/sécurité et référence de revue. Préférer devDependency lorsque le produit n'en a pas besoin au runtime. Pas de fiche par micro-package transitif.

| Dépendance                                  | Besoin / emplacement / coût                                        | Alternative et vigilance                                                                                                                                   |
| ------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Next / React                                | SSR/Auth/navigation ; client et serveur, principaux chunks mesurés | Changer de framework dépasse E ; pin Next exact, lock React, audit et mises à jour revues                                                                  |
| next-intl 4.14.5                            | résolution/catalogues serveur ; petit provider erreur client       | Intl seul pour formats mais pas App Router/catalogues ; props au lieu de provider complet ; mesures C/D/E, pas d'attribution de tout le bundle à cette lib |
| Supabase SSR/client                         | Auth et RPC côté serveur, aucune clé privilégiée client            | client direct ad hoc moins sûr ; audit, absence runtime public contrôlée                                                                                   |
| Temporal polyfill 0.5.1                     | calculs calendaires déterministes côté serveur                     | support natif Node24.21 insuffisant constaté en Phase2 ; pas de suppression non prouvée                                                                    |
| Zod                                         | validation DTO serveur, contrats stricts                           | validation manuelle dispersée ; tree-shaking et séparation serveur                                                                                         |
| Radix dialog / lucide                       | dialogue DEMO seulement après E                                    | retirés du graphe PROD compilé ; coût observé par comparaison de builds                                                                                    |
| Radix label/slot, clsx, CVA, tailwind-merge | composants réutilisés actuels                                      | natif possible mais refactor non justifié sans mesure et revue a11y                                                                                        |
| trace-mapping 0.3.31                        | devDependency pour attribuer le code compilé ; déjà transitive     | éviter un décodeur sourcemap maison ; aucun import produit                                                                                                 |
| Semgrep / ZAP                               | images outils figées, jamais runtime app                           | pas de nouvel outil supply-chain lourd                                                                                                                     |

`pnpm install --frozen-lockfile` et `pnpm audit --audit-level high` conservés. Lifecycle allowlist existante : esbuild, sharp, supabase, unrs-resolver ; watcher/SWC désactivés explicitement. Pas d'ouverture globale des scripts d'installation. Aucun nouvel outil runtime produit ajouté.

CI : contents read-only, actions épinglées par SHA, checkout sans credential persistant, pas de secrets cloud injectés, pas de pull_request_target. Rétention qualité/journal 14 jours. Les traces/DOM bruts d'échec ne sont plus uploadés automatiquement ; rapports minimisés du collecteur à privilégier. Revue GitHub réelle E : rulesets `[]`, main `protected:false` ; endpoint détaillé de protection interdit au connecteur (403), plan/droits administratifs non déduits. Protection de branche à décider/appliquer par Patrick avant promotion réelle, pas un PASS fabriqué.

Complément G : `yaml` 2.9.1 dev-only (Node >=14.6, ISC) parse le frontmatter standard et rejette doublons/alias ; alternative parseur maison rejetée pour risque et maintenance. Aucun import application, aucun coût client/serveur produit ; garde Artifact Hygiene documentaire sur le build compilé. L’audit de dépendances reste obligatoire.
