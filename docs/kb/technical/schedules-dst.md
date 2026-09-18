---
id: "technical.schedules-dst"
title: "Calendriers et résolution DST déterministe"
domain: "schedules"
type: "technical-topic"
status: "active"
introduced_in: "phase-2"
roles: ["developer", "reviewer"]
requirements: ["ADR-006"]
related_adrs: ["ADR-006"]
related_code:
  [
    "packages/backend/src/modules/schedules/domain/schedule.ts",
    "packages/backend/src/modules/schedules/application/schedules.ts",
    "packages/backend/src/modules/schedules/infrastructure/temporal.ts",
  ]
related_tests:
  [
    "packages/backend/src/modules/schedules/domain/schedule.test.ts",
    "supabase/tests/phase2_edge_cases.sql",
  ]
related_docs:
  ["docs/kb/business/service-schedules.md", "docs/kb/technical/sla.md"]
---

# Calendriers et résolution DST déterministe

## Modèle et port temps

Le domaine valide sept jours explicites, créneaux disjoints en secondes, fermé et 24/7. L'application résout les fenêtres via `ZonedTime`. L'adaptateur Temporal valide le fuseau IANA et transforme date/secondes locales en instants ; le domaine ne dépend pas du polyfill.

Pour une heure ambiguë en automne : occurrence la plus ancienne. Pour une heure inexistante au printemps : premier instant local valide, sans inventer une durée fixe de décalage. Une fenêtre devenue vide après résolution est éliminée. Le jour local ne vaut pas nécessairement 24 heures UTC. `end=86400` désigne le lendemain local et permet la continuité dimanche→lundi.

## Dépendance et tests

Node 24.21 n'offrait pas le support natif requis lors de l'évaluation approuvée Phase 2 ; `@js-temporal/polyfill` reste côté serveur. Ne pas le retirer au seul motif du numéro majeur Node. Revalider les sémantiques si runtime changé.

Les tests couvrent Paris printemps/automne, Lord Howe et son décalage partiel, minuit, semaine et 24/7. Aucun calendrier de jours fériés. Le calcul de fenêtres est disponible ; aucune échéance de report ne doit être revendiquée. Voir [contrat horaire](../business/service-schedules.md).
