---
id: "feature.service-schedules"
title: "Calendriers de service et heures ouvrées"
domain: "schedules"
type: "business-feature"
status: "active"
introduced_in: "phase-2"
roles: ["client_admin"]
requirements: ["ADR-006", "ADR-007"]
related_adrs: ["ADR-006", "ADR-007"]
related_code:
  [
    "packages/backend/src/modules/schedules/application/schedules.ts",
    "packages/backend/src/modules/schedules/domain/schedule.ts",
    "packages/backend/src/modules/schedules/infrastructure/temporal.ts",
  ]
related_tests:
  [
    "packages/backend/src/modules/schedules/domain/schedule.test.ts",
    "supabase/tests/phase2.sql",
    "supabase/tests/phase2_edge_cases.sql",
  ]
related_docs:
  [
    "docs/kb/technical/schedules-dst.md",
    "docs/kb/technical/audit.md",
    "docs/kb/technical/analytics.md",
    "docs/kb/technical/logging.md",
  ]
---

# Calendriers de service et heures ouvrées

## Objectif et droits

Un `client_admin` publie la configuration horaire de son organisation ou d'un service du même tenant. Les versions publiées fournissent une référence stable aux SLA ; cette fondation ne calcule pas encore d'échéance sur un signalement.

## Règles et états

Deux modes explicites : `weekly` avec sept jours (lundi 1 à dimanche 7), ou `always_open` pour 24/7 sans jours hebdomadaires. Un jour fermé est explicite et sans créneau. Un jour ouvert contient au moins un créneau. Plusieurs créneaux disjoints sont possibles ; des créneaux adjacents sont permis.

Les intervalles sont semi-ouverts `[start,end)`, en secondes locales de 0 à 86400, start strictement inférieur à end. Un passage de minuit se représente par deux jours, y compris dimanche→lundi. Fuseau IANA obligatoire, indépendant de la locale. Aucun calendrier de jours fériés implémenté.

## Erreurs, effets et observabilité

Chevauchement, jour manquant/dupliqué, fuseau invalide ou service étranger sont rejetés. La publication SQL est versionnée et auditée atomiquement ; une version référencée conserve son identité. Pas d'événement analytics horaire ; logs de commande configuration sans payload calendrier. Les règles DST sont détaillées dans [schedules-dst](../technical/schedules-dst.md).

## Tests, décisions et limites

Unitaires : multi-créneaux, adjacency, fermé, 24/7, minuit, continuité dimanche/lundi, DST Paris et Lord Howe. SQL : contraintes tenant, publication et immutabilité. ADR-006/007 restent verrouillées. Pas d'éditeur horaire UI nouveau ; les heures restent liées au fuseau configuré même si l'interface change de langue.
