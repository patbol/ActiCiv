# ADR-008 — Gouvernance documentaire, KB et playbooks

Statut : **proposée pour revue du checkpoint 2bis-A**. Formalise l'organisation et les principes approuvés par Patrick ; les conventions nouvelles de frontmatter et chemins de playbooks restent soumises à sa revue. Date : 17 septembre 2026.

## Contexte

La Phase 2 est clôturée sur `fac0fc8663d1f32b09b720fddffd46f0829c8a6a`. Patrick a rangé les références/preuves et imposé la structure CURRENT / HISTORICAL / EVIDENCE. La Phase 2 bis requiert une connaissance exploitable et traçable avant la multiplication des parcours. 2bis-A autorise la gouvernance, pas les mécanismes des checkpoints suivants.

## Décision proposée et formalisation

Conserver l'organisation approuvée ; `docs/README.md` est l'index documentaire et `AGENTS.md` l'entrée persistante. Références courantes dans `docs/references/current/`, archives dans `historical/`, preuves datées dans `docs/evidence/`. Les ADR acceptées restent applicables ; cette ADR ne supersède aucune ADR 001–007.

La KB sépare métier et technique, avec IDs stables et frontmatter machine-readable. Les liens vers code/tests/droits/observabilité/ADR permettent une impact map avant modification. Les changements de contrat documentaire accompagnent les changements de comportement dans la même PR.

Les playbooks ont leur emplacement canonique sous `docs/skills/`, conformément à la règle de documentation sous `/docs`. En 2bis-A, seuls structure, catalogue et template existent ; pas de Skill fictivement actif ni de promesse d'autodiscovery. La configuration d'intégration éventuelle sera étudiée dans le checkpoint autorisé.

## Alternatives

- Un seul livre monolithique : conservé comme référence transverse, insuffisant pour la navigation quotidienne dans le code.
- Copies concurrentes des contrats dans plusieurs arborescences : rejetées, risque de divergence.
- Quinze dossiers/SKILL.md vides immédiatement : rejetés, ne constituent pas des procédures utiles.
- Nouvelle arborescence documentaire : rejetée, Patrick a déjà approuvé le rangement actuel.

## Conséquences et qualité

Les index distinguent cibles, état implémenté et preuves historiques. Les corrections de liens sont tracées sans réécriture des résultats passés. DoD et checklist PR graduent la validation selon le risque. Les conventions objectivement automatisables deviennent des contrôles exécutables dans leurs checkpoints, pas dans une plateforme qualité anticipée.

Coût : maintenir les liens et les contrats de fiches ; bénéfice : retrouver l'impact d'un changement sans dupliquer les sources. Les contrôles ponctuels de 2bis-A ne sont pas présentés comme des gates CI installés.

## Sécurité et exploitation

Ne versionner ni secrets ni sessions. Les preuves sont minimisées et datées ; elles ne donnent aucun droit métier. Aucune migration, dépendance, modification de CI ou configuration cloud. Les originaux Phase 1/2 restent dans Git ; les journaux bruts et livres sont préservés.

## Références et validation

- [Index de lancement](../references/current/ActiCiv_Phase2bis_Launch_Index.md).
- [Politique documentaire](../quality/documentation-policy.md), [DoD](../quality/definition-of-done.md), [PR](../quality/pr-checklist.md), [traçabilité](../quality/traceability.md).
- [KB](../kb/README.md), [Skills](../skills/README.md), [bilan 2bis-A](../quality/phase-2bis-a-report.md).

Validation adaptée : cohérence des sources, liens/ancres, format, absence de secrets, inventaire des mouvements et diff limité à la documentation. Aucun test métier ajouté pour un changement documentaire sans comportement.
