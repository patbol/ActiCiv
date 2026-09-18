---
id: "feature.territories"
title: "Territoires et hiérarchie géographique"
domain: "coverage"
type: "business-feature"
status: "active"
introduced_in: "phase-2"
roles: ["platform_admin"]
requirements: ["ADR-005", "ADR-007"]
related_adrs: ["ADR-005", "ADR-007"]
related_code:
  [
    "packages/backend/src/modules/coverage/domain/administration.ts",
    "packages/backend/src/modules/coverage/infrastructure/administration.ts",
    "supabase/migrations/",
  ]
related_tests:
  [
    "packages/backend/src/modules/coverage/application/administration.test.ts",
    "supabase/tests/phase2_closure.sql",
    "supabase/tests/phase2.sql",
  ]
related_docs:
  [
    "docs/kb/technical/postgis-coverage.md",
    "docs/kb/technical/audit.md",
    "docs/kb/technical/analytics.md",
    "docs/kb/technical/logging.md",
  ]
---

# Territoires et hiérarchie géographique

## Objet et préconditions

La capacité plateforme `territories.manage` maintient les territoires géographiques utilisés par les contrats. Un client admin ne modifie pas les territoires globaux. Les données sont des MultiPolygon valides, non vides, en SRID 4326 ; longitude puis latitude.

## Règles et erreurs

Aucune réparation automatique silencieuse d'une géométrie invalide. Le territoire enfant doit être inclus dans son parent et la hiérarchie ne peut former un cycle. Le verrouillage SQL protège les mutations concurrentes de hiérarchie. Les chevauchements entre territoires sont possibles et ne créent pas une priorité de traitement.

Créer/modifier valide les entrées puis délègue à la transaction SQL. Mauvais SRID, forme invalide, parent incohérent ou cycle sont refusés. Le contrat utilise les IDs stables des territoires ; les labels sont des noms propres, pas des clés traduites.

## Effets et preuves

L'audit conserve les métadonnées autorisées, sans géométrie brute, et échoue avec la mutation si l'écriture d'audit échoue. Aucun analytics dédié ; diagnostics minimisés de commande plateforme. Le test anti-cycle isolé dans `phase2_closure.sql` atteint le rejet de cycle avant la validation d'inclusion, pour ne pas attribuer un PASS à la mauvaise contrainte. Les cas géométriques sont couverts par pgTAP.

## Décisions et limites

ADR-005 lève la réserve PostGIS d'ADR-002 ; ADR-007 fixe l'audit. Ces fondations ne constituent ni une UI cartographique complète, ni la géolocalisation citoyenne Phase 3. A11y d'une carte nouvelle non applicable.
