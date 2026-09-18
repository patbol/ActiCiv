---
id: feature.quality-center
title: "Consulter les preuves qualité plateforme"
domain: quality
type: business-feature
status: active
introduced_in: phase-2bis-h
roles: [platform_admin]
requirements: ["Patrick — checkpoint 2bis-H uniquement"]
related_adrs: [ADR-004, ADR-011, ADR-015]
related_code:
  [
    apps/pro/src/app/quality/page.tsx,
    packages/backend/src/modules/quality/application/read.ts,
    supabase/migrations/20260918000300_quality_read.sql,
  ]
related_tests:
  [
    packages/backend/src/modules/quality/application/read.test.ts,
    packages/backend/integration/quality.integration.ts,
    e2e/quality.spec.ts,
  ]
related_docs:
  [docs/kb/technical/quality-center.md, docs/kb/business/authorization-roles.md]
---

# Consulter les preuves qualité plateforme

Objectif : savoir ce qu’un run prouve selon sa policy, retrouver SHA/provenance et examiner les preuves manquantes. Aucun score de qualité synthétique, nouvelle règle métier ni fonctionnalité Phase 3.

## Acteur, droit et préconditions

Auth vérifiée, administrateur plateforme actif et capacité `quality.read` explicitement attribuée. Aucun droit implicite client_admin, supervisor, agent ni metadata Auth. Un administrateur sans cette capacité est refusé. Le contrôle protège chaque accès au détail, pas seulement le lien dans Espace Pro. Les attributions sont opérateur/DB et auditables, aucune UI de gestion de droit ajoutée.

## Parcours nominal et variantes

Ouvrir Centre qualité depuis Espace Pro, lire historique et verdict, sélectionner un run, consulter d’abord gates FAIL/DEFERRED et findings ouverts. Descendre vers suites/tests, coverage, artefacts/performance, accessibilité et documents. Les quatre statuts restent distincts. Une preuve manuelle historique garde sa portée, indépendamment du PASS axe.

Filtrer environnement/statut ou tags de tests ; comparer deux runs de même policy/environnement. Candidate ≠ accepted ; sélectionner un candidat ne l’accepte pas. Les valeurs non mesurées ne deviennent pas zéro ; les 0 % réels restent visibles. Advisory reste affiché sans seuil coverage/performance approuvé.

## Erreurs, données et effets

Accès refusé avant lecture, source non configurée, aucun run, run invalide/corrompu/partiel, preuve manquante, référence artefact expirée, baseline absente, comparaison incompatible : message explicite, aucun PASS par défaut. Un échec n’est pas dissimulé par un ancien run réussi. L’UI ne modifie ni données qualité, gates, waivers, baselines ni CI.

Les seules données sont preuves d’ingénierie minimisées ; aucun signalement/tenant métier. Aucune analytics ou audit de lecture ajouté. L’audit des droits plateforme existant reste transactionnel ; erreurs techniques sans payload sensible. URLs GitHub contrôlées, aucune ouverture de chemin local depuis le navigateur.

## Accessibilité et tests critiques

FR/EN, clavier, focus, titres et tables sémantiques, statuts lisibles sans couleur, axe et protocole VoiceOver H. Tests vérifient vrais JWT/RLS, rôles clients, metadata forgées, lecture historique/corruption, erreurs et états UI. TalkBack constitue une preuve distincte. Voir [architecture et exploitation](../technical/quality-center.md).
