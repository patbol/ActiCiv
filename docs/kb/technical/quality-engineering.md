---
id: technical.quality-engineering
title: "Engineering quality — preuves communes"
introduced_in: phase-2bis-d
domain: engineering-quality
type: technical-topic
status: active
roles: [developer, reviewer]
requirements:
  - "Patrick — checkpoint 2bis-D §§1–32"
  - "Livre v1.4 §§56–60"
related_adrs: [ADR-003, ADR-009, ADR-011]
related_code:
  - tooling/quality/model.ts
  - tooling/quality/collect.ts
  - tooling/quality/parsers.ts
  - tooling/quality/snapshot.ts
  - tooling/quality/policy.json
related_tests:
  - tooling/quality/i2.test.ts
  - tooling/quality/core.test.ts
  - tooling/quality/privacy.test.ts
  - tooling/quality/flakiness.test.ts
  - tooling/quality/reconstruction.test.ts
related_docs:
  - docs/quality/quality-evidence.md
  - docs/quality/phase-2bis-d-report.md
---

# Engineering quality — preuves communes

## Contrat et responsabilités

Les producteurs exécutent les contrôles, les normalisateurs réduisent les résultats, le snapshot fige une identité/provenance, l’évaluateur applique une policy versionnée. La CLI compose ces éléments. Le Quality Center H consomme ces mêmes preuves via sa capacité serveur dédiée, sans évaluateur navigateur. Le noyau qualité ne modifie pas les données métier.

Une collecte locale est autorisée uniquement sur les services locaux prévus par les tests existants. Ne pas lancer deux campagnes mutantes simultanément. Le snapshot signale `dirty` et une empreinte des sources : un run de développement n’est pas une attestation de release sur un SHA propre. Le contrôle final de provenance détecte une modification pendant le run.

## Sémantique de preuve

- Unitaires : tests Vitest ; architecture/conventions = sous-ensemble nommé, pas un total supplémentaire.
- Coverage : V8 unitaire avec fichiers non exécutés inclus ; zéro n’est pas masqué. Aucun seuil activé. SQL/audit SQL ne sont pas transformés en couverture JS.
- Intégration : Node et Vitest conservent leurs tests réels de sécurité/adaptateurs.
- pgTAP : assertions séquentielles et plan complet requis ; bailout, plan absent ou incomplet échouent.
- Playwright : statut final, tags, durée, retries/flakiness par test. Toute reprise est visible ; une campagne ayant besoin d’un retry échoue au verdict de release.
- Axe : pièces minimisées des analyses effectivement réalisées ; jamais une preuve de VoiceOver/TalkBack.
- Build/format/lint/typecheck : sortie complète de processus, code retour. Erreur de lancement = échec.
- Audit/secrets : findings/statistiques existants ; absence de rapport ou erreur réseau = échec de preuve.

## Erreurs et exploitation

Le rapport invalide devient FAIL avec une raison stable ; les données brutes restent dans les logs restreints du run. Une identité absente ou discordante empêche l’assemblage. La finalisation refuse un identifiant de run déjà présent. Les lecteurs vérifient le digest ; une modification de policy demande un nouveau snapshot.

La policy reste consultative dans D. Les contrôles historiquement bloquants restent bloquants dans `verify`/`verify:full`/`release:verify`. Une baseline n’est jamais acceptée automatiquement. Les répétitions critiques ont leur propre rapport, leurs tentatives et dates, sans remplacer la campagne principale.

Procédures, schema, exclusions et limites : [Quality evidence](../../quality/quality-evidence.md). Décision et alternatives : [ADR-011](../../architecture-decisions/011-quality-evidence.md). Valeurs réellement observées : [rapport D](../../quality/phase-2bis-d-report.md).

## Extension F

Policy `tooling/quality/policy-f.json` advisory : preuve observability dérivée des suites privacy/registry/logger unitaires, même rapport/provenance. SQL et adaptateurs continuent à prouver l'audit réel ; aucune métrique d'usage produit transformée en gate. Lecteurs D/E conservés. [Rapport F](../../quality/phase-2bis-f-report.md).

## Complément G

`docs:validate` vérifie KB, ADR, Skills, liens et vue dérivée ; son rapport minimisé est une source `docs` du snapshot canonique v1. La policy `2bis-G.v1` ajoute cette preuve requise, sans seuil numérique. Les évaluations D/E/F conservent leurs policies versionnées. [Contrat documentaire](knowledge-governance.md).

## Extension H

Le [Quality Center](quality-center.md) lit désormais ces résultats sans nouveau calcul de gate. Les modules canoniques sont partagés dans packages/quality ; les anciens chemins tooling réexportent leur contrat. Policy G.v1 inchangée, aucun seuil ajouté.

## Complément I2 — contrat canonique version 2

Les nouveaux producteurs portent `identity.schema_version=2`. Le lecteur conserve v1 et les policies D/E/F/G à leur digest d’origine. La policy `2bis-I.v1` ajoute flakiness, revue axe et dette historique ; elle ne contient aucun budget numérique actif. Les règles et budgets refusent les champs inconnus. Aucun second format de snapshot ni nouvel évaluateur UI.

Un budget référence une mesure dans `checks[source].metrics`, un opérateur min/max, une valeur configurable et un mode advisory/blocking. Un budget blocking exige approbateur, date et référence de décision. Un dépassement advisory est visible mais ne bloque pas le verdict ; un dépassement blocking ou sa mesure absente bloque. Les exemples numériques des tests sont synthétiques, pas des décisions produit.

`quality:flakiness` conserve sa campagne manuelle séparée. `quality:collect --flakiness <flakiness.json>` ingère uniquement une mesure du même SHA/source_digest/environnement ; le producteur normalise STABLE / OBSERVED_FLAKY / UNKNOWN / NOT_RUN. Aucun rapprochement par branche ni copie automatique d’un ancien run. Sans option : NOT_RUN, DEFERRED. Les répétitions ne deviennent jamais des retries de release. La gate de mesure reste facultative/advisory dans I ; un run de release repris échoue toujours aux contrôles existants.

Axe conserve les comptes et IDs de règles incompletes associés au test, sans DOM/texte de page. Le check automatique violations reste distinct du check `axe-review` : REVIEW_REQUIRED/DEFERRED tant que des incomplete existent. La présentation affiche état, nombre et empreinte de provenance ; une validation VoiceOver historique ne les clôture pas.
