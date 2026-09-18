---
id: "technical.postgis-coverage"
title: "PostGIS et couverture contractuelle"
domain: "coverage"
type: "technical-topic"
status: "active"
introduced_in: "phase-2"
roles: ["developer", "reviewer"]
requirements: ["ADR-002", "ADR-005", "ADR-007"]
related_adrs: ["ADR-002", "ADR-005", "ADR-007"]
related_code: ["packages/backend/src/modules/coverage/", "supabase/migrations/"]
related_tests:
  [
    "packages/backend/src/modules/coverage/application/administration.test.ts",
    "supabase/tests/phase2.sql",
    "supabase/tests/phase2_closure.sql",
  ]
related_docs:
  [
    "docs/kb/business/contractual-coverage.md",
    "docs/kb/business/territories.md",
    "docs/kb/technical/audit.md",
  ]
---

# PostGIS et couverture contractuelle

## Répartition des garanties

Application : permissions plateforme et validation DTO/coordonnées. SQL/PostGIS : type MultiPolygon 4326, validité/non-vide, inclusion parent, cycles et contraintes des scopes de contrat. La représentation des points est longitude/latitude ; aucune conversion implicite depuis un autre SRID.

`ST_Covers` inclut les bords. Les contrats actifs/valides filtrent catégories et services explicitement associés. Le résultat est une liste de candidats, pas un moteur de routing. Ajouter une catégorie n'ajoute aucune ligne contract_scope_categories ; les anciens contrats ne s'étendent pas automatiquement.

## Concurrence, confidentialité et preuve

La hiérarchie territoriale se verrouille pour empêcher des cycles concurrentiels ; le test anti-cycle utilise des géométries compatibles afin d'atteindre ce garde précisément. Les fixtures SQL couvrent limites et chevauchements. L'audit conserve seulement sa whitelist, sans géométrie complète. Les coordonnées sensibles ne deviennent pas propriétés analytics/log.

ADR-005 complète ADR-002 en validant PostGIS ; aucune autre garantie de persistance n'est supersédée. Les [fiches métier](../business/contractual-coverage.md) définissent les droits et limites.
