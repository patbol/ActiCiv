---
id: "feature.contractual-coverage"
title: "Périmètres contractuels et candidats géographiques"
domain: "coverage"
type: "business-feature"
status: "active"
introduced_in: "phase-2"
roles: ["platform_admin", "client_admin"]
requirements: ["ADR-005", "ADR-007"]
related_adrs: ["ADR-005", "ADR-007"]
related_code:
  [
    "packages/backend/src/modules/coverage/application/administration.ts",
    "packages/backend/src/modules/coverage/application/candidates.ts",
    "packages/backend/src/modules/coverage/infrastructure/supabase.ts",
  ]
related_tests:
  [
    "packages/backend/src/modules/coverage/application/administration.test.ts",
    "supabase/tests/phase2.sql",
    "supabase/tests/phase2_closure.sql",
  ]
related_docs:
  [
    "docs/kb/business/territories.md",
    "docs/kb/technical/postgis-coverage.md",
    "docs/kb/technical/audit.md",
    "docs/kb/technical/analytics.md",
    "docs/kb/technical/logging.md",
  ]
---

# Périmètres contractuels et candidats géographiques

## Objet et permissions

Les contrats relient organisation, territoires, catégories et services explicitement sélectionnés. La capacité plateforme `contracts.manage` autorise l'édition. `client_admin` lit le périmètre de son organisation ; il ne l'étend pas. Le calcul de candidats est une fondation de couverture, pas un routage de signalement.

## Règles, données et variantes

Un périmètre est explicite : ajouter une catégorie au catalogue n'élargit aucun ancien contrat. Validité temporelle, activité et catégories/services rattachés filtrent les candidats. Les bornes temporelles suivent les contraintes du contrat SQL. Les services doivent appartenir à l'organisation du contrat ; aucune affectation cross-tenant via UUID arbitraire.

Le point est exprimé longitude puis latitude ; valeurs non finies/hors bornes rejetées. `ST_Covers` inclut les frontières. Plusieurs contrats/territoires peuvent couvrir un même point : la liste conserve plusieurs candidats, sans gagnant implicite. Voir les [territoires](territories.md) pour la géométrie et les cycles.

## Effets et privacy

Éditer un contrat/périmètre produit un audit SQL transactionnel whitelisté. La recherche de candidats ne crée pas un signalement, une notification ou un événement analytics. Les coordonnées exactes ne sont pas envoyées dans les diagnostics ordinaires ; aucune géométrie brute dans l'audit. Les erreurs de validation sont retournées sans payload technique.

## Tests et limites

Les tests de couverture prouvent intérieur/frontière/extérieur et chevauchements ; `phase2_closure.sql` prouve qu'une nouvelle catégorie n'étend pas les anciens contrats et que l'ancienne conserve ses candidats. Administration testée par capacités avant adaptateur. ADR-005/007 verrouillent ces choix. Pas de carte/écran de gestion nouveau ni de moteur routing : a11y UI de ces parcours non applicable. Catégories ont des traductions, IDs et codes restent stables.
