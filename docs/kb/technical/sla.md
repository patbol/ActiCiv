---
id: "technical.sla"
title: "Publication et invariants SLA"
domain: "sla"
type: "technical-topic"
status: "active"
introduced_in: "phase-2"
roles: ["developer", "reviewer"]
requirements: ["ADR-006", "ADR-007"]
related_adrs: ["ADR-006", "ADR-007"]
related_code:
  [
    "packages/backend/src/modules/sla/",
    "packages/backend/src/platform/configuration.ts",
    "supabase/migrations/",
  ]
related_tests:
  [
    "packages/backend/src/modules/sla/domain/policy.test.ts",
    "supabase/tests/phase2_closure.sql",
    "supabase/tests/phase2_edge_cases.sql",
  ]
related_docs:
  [
    "docs/kb/business/sla-policies.md",
    "docs/kb/technical/schedules-dst.md",
    "docs/kb/technical/audit.md",
  ]
---

# Publication et invariants SLA

## Contrat technique

Le cas d'usage exige `configuration.write` et valide trois cibles avant le port `SlaWriter`. SQL publie politique/version/cibles de façon atomique avec audit. L'unicité du scope inclut les NULL ; les références service/catégorie/calendrier sont validées dans leur tenant et compatibilité de scope.

Le versionnement conserve les publications et références antérieures ; une nouvelle publication ne transforme pas l'ancien snapshot de configuration. Les motifs de pause sont une liste explicite. La constante de spécificité documente l'ordre futur, sans brancher un resolver sur des reports inexistants.

## Non-régression

Vérifier quatre scopes uniques, cibles invalides et bornes SQL, calendrier incompatible, immutabilité après publication, deux publications successives et conservation de la version initiale. Les assertions sont dans les tests SQL référencés. Les métriques de coverage TypeScript ne remplacent pas ces preuves SQL.

Cette fiche ne duplique pas les règles de DST : voir [calendriers](schedules-dst.md) et [contrat métier](../business/sla-policies.md). Aucun moteur SLA Phase 3 ajouté.
