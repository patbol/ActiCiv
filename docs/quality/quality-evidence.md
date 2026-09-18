# Quality evidence — contrat v1 et procédures courantes

## Exécuter et lire

Charger nvm puis `nvm use` dans chaque nouveau shell. Supabase local et ports 3000/3001 libres sont nécessaires pour les contrôles complets.

```sh
pnpm test:coverage
pnpm quality:collect
# Option explicite pour reconstruire la base DEV locale et son seed :
pnpm quality:collect --rebuild-db
pnpm quality:snapshot .quality/work/<run-id>
pnpm quality:report .quality/snapshots/<run-id>/snapshot.json
pnpm quality:evaluate .quality/snapshots/<run-id>/snapshot.json
pnpm quality:compare .quality/snapshots/<run-id>/snapshot.json
pnpm quality:flakiness 3
```

`collect` produit déjà le snapshot ; `snapshot` sert à finaliser une collecte séparée/interrompue, pas à écraser un snapshot existant. Une preuve partielle produit un verdict incomplet/échoué, jamais PASS. `evaluate` retourne un code non nul si le verdict requis échoue ; la CI D n’en fait pas encore un nouveau blocage. `verify`, `verify:full`, `release:verify --rebuild-db` restent disponibles.

## Contrat canonique

Contrat typé : [model.ts](../../tooling/quality/model.ts). Validation d’entrée et lecture : [snapshot.ts](../../tooling/quality/snapshot.ts), [storage.ts](../../tooling/quality/storage.ts). Version `schema_version: 1`.

| Champ             | Sens et validation                                                                                                                                 |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `identity`        | Projet ActiCiv, SHA Git 40 hex, environnement local/ci-local, date ISO, run unique, producteur/versions, branche, état dirty et digest des sources |
| `checks`          | Map par famille : statut, pass/fail/skip, retries/flaky, suites, durée, tests avec tags, métriques propres et raison                               |
| `coverage`        | Quatre métriques globales et par modules : total, covered, pct ; `null` si aucun dénominateur, pas de faux 100 %                                   |
| `provenance`      | Références relatives contrôlées et SHA-256 du rapport minimisé, liées au même run/SHA/environnement                                                |
| `manual_evidence` | VoiceOver/TalkBack séparés, portée et référence datée ; confirmation humaine nécessaire                                                            |
| `gate_evaluation` | Policy version/digest, mode consultatif, résultat global et par règle avec raison et référence                                                     |

Les axes sont explicitement identifiés dans `checks` : `unit`, `architecture`, `integration-node`, `integration-adapters`, `sql`, `e2e`, `e2e-critical`, `axe`, `dependency-audit`, `secret-scan`, `build-citizen`, `build-pro`, `bundles`, `db-reset` si exécuté. `source-integrity` relie les preuves à l’état réellement testé. Dans la policy D historique, les contrôles alors futurs étaient NOT_APPLICABLE. Les policies E/F/G et leurs preuves propres définissent les exigences actuelles.

Les rapports JSON/LCOV sont sous `reports/`. Les rapports Vitest/Playwright minimisés conservent les champs natifs nécessaires, sans logs/erreurs/HTML/variables d’environnement. Les rapports natifs et logs complets sont uniquement sous `.quality/work/<run>/private/`, accès local restreint, jamais uploadés par la nouvelle étape CI. Les fichiers `.quality/` sont ignorés par Git ; exemples sélectionnés, minimisés et relus sous `docs/evidence/` seulement.

## Coverage : périmètre et exclusions

Provider V8 4.1.11, devDependency alignée exactement sur Vitest. JSON détaillé, JSON-summary, LCOV, texte. Mesure **unitaire uniquement** : l’exécution des adaptateurs et du navigateur dans d’autres processus n’ajoute pas magiquement de couverture V8. Les zéros des adapters/UI restent visibles, avec preuve E2E/intégration séparée.

Inclusions explicites : `packages/*/src/**/*.{ts,tsx}`, `apps/*/src/**/*.{ts,tsx}`, `tooling/**/*.{ts,mjs}`, `scripts/**/*.{ts,mjs}`. Fichiers non importés inclus. Exclusions : `**/*.test.ts` (tests, pas code cible) et `**/*.d.ts` (déclarations non exécutables). Les sorties générées, dépendances, données JSON/CSS/SQL, configs racine et fixtures E2E ne font pas partie de ces globs. Les entrypoints applicatifs et scripts sont inclus, même à zéro.

Modules : backend critique, auth, authorization/RBAC, organisations/services, coverage/geography, schedules, SLA, audit, i18n, shared/UI, Citizen, Pro, tooling/conventions. Certains groupes se recouvrent : leurs pourcentages ne s’additionnent pas. Aucun module JS audit dédié n’existe : valeur null, audit SQL prouvé par pgTAP et intégration. Les seuils proposés dans le rapport restent à valider par Patrick ; aucun seuil ni budget bloquant dans la configuration.

## Policy et immutabilité

[Policy D](../../tooling/quality/policy.json), version `2bis-D.v1`, advisory. Preuve requise absente/invalide/partielle → FAIL. Option explicitement différée → DEFERRED. Hors périmètre justifié → NOT_APPLICABLE. Aucun booléen de bypass/waiver. Un skip/retry/flaky n’est pas un PASS propre.

La création exclusive d’un répertoire de snapshot refuse un doublon. `snapshot.sha256` détecte une modification ; les rapports ont leurs propres digests. Si sources, preuve ou policy changent, utiliser un nouveau run. L’immuabilité reste une discipline avec contrôle d’intégrité ; aucun stockage WORM ni signature cryptographique d’une autorité indépendante n’est prétendu. Limiter l’accès CI, conserver les artefacts 14 jours par défaut, archiver les snapshots acceptés avec la release.

## Baselines et comparaison

Chaque snapshot génère un `baseline-candidate.json`, jamais une baseline acceptée. Il référence run, digest, SHA, date, environnement et policy. Pour accepter : revue explicite de Patrick, décision documentaire datée, puis enregistrement distinct `baseline-accepted.json` reprenant ces références avec `status: ACCEPTED`, `accepted_by`, `accepted_at`, `decision_ref`. Ne jamais modifier le snapshot source ni écraser le candidat. Ne pas accepter une campagne échouée ou un arbre dirty comme baseline de release.

```sh
pnpm quality:compare .quality/snapshots/<current>/snapshot.json .quality/snapshots/<accepted>/snapshot.json
```

Sans baseline : NO_BASELINE. Candidat non accepté, digest/identité/policy/environnement incompatibles : refus. Les deltas explicitent les différences ; sans seuil approuvé, ils ne sont pas nommés régressions. Aucun snapshot D n’est accepté automatiquement.

## Flakiness et release

`quality:flakiness N` répète les tests `@critical` dans N campagnes séquentielles, chacune à zéro retry. Rapports par tentative et résumé par test : tentatives, passes, échecs, taux d’échec, mix pass/fail, tags, dates première/dernière observation. Liste différente entre répétitions = rapport incomplet rejeté. Cette commande n’a pas de fréquence CI inventée et ne remplace pas le run principal.

Chaîne de release : sources stables → contrôles natifs → rapports minimisés → snapshot → même évaluateur → revue / baseline explicitement acceptée. L’identité de release reste le SHA propre et son artefact, avec CI sur le même SHA. Un résultat local dirty ou une CI seulement écrite ne vaut pas release. Le futur Quality Center lira les snapshots et leurs gates ; aucune UI ou DB qualité n’est construite dans D.

## Extension compatible E

Le schéma v1 reste inchangé : nouveaux checks `sast`, `dast`, `artifact`, `performance`, `e2e-prod` dans les maps déjà extensibles. Les normalisateurs valident le producteur et son exécution. `policy.json` D est conservée ; Lors de E, `policy-e.json` devenait la policy de collecte, toujours advisory et sans seuil numérique. `quality:evaluate` sélectionne la policy historique D pour ses snapshots ; les digests historiques ne changent pas. Aucune migration de données.

`ACTICIV_RUN_DAST=1 pnpm quality:collect` inclut ZAP local ; sinon sa preuve est DEFERRED. Les CLI sécurité/artefact et leurs contrôles CI stables restent bloquants en cas d’échec. `verify:full` conserve les étapes anciennes et ajoute E2E PROD, SAST, artefact et scan secrets compilés. Les résultats bruts privés ne sont pas uploadés. Comparer une baseline à une autre policy nécessite une décision explicite, pas une compatibilité silencieuse.

## Policy courante G

`policy-g.json` version 2bis-G.v1 est désormais la policy de collecte, advisory. Elle conserve F (dont observability) et ajoute `knowledge-governance` via la source `docs` : exécution réelle de `pnpm docs:validate`, métriques minimisées KB/ADR/Skills/liens et fraîcheur de la trace. Échec ou absence de cette preuve = FAIL. Les policies D/E/F restent inchangées et sélectionnées pour réévaluer leurs snapshots.

Pas de nouveau seuil numérique ni de migration. `verify` inclut le check documentaire, donc CI aussi. Pour G sans DB changée, ne pas passer `--rebuild-db` ; la policy générique conserve une reconstruction manquante DEFERRED, dont la non-applicabilité à ce checkpoint est justifiée dans le rapport G. Aucun override de gate ne fabrique une reconstruction.
