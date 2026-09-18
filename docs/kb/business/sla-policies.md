---
id: "feature.sla-policies"
title: "Politiques SLA versionnées"
domain: "sla"
type: "business-feature"
status: "active"
introduced_in: "phase-2"
roles: ["client_admin"]
requirements: ["ADR-006", "ADR-007"]
related_adrs: ["ADR-006", "ADR-007"]
related_code:
  [
    "packages/backend/src/modules/sla/application/publish.ts",
    "packages/backend/src/modules/sla/domain/policy.ts",
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
    "docs/kb/technical/sla.md",
    "docs/kb/business/service-schedules.md",
    "docs/kb/technical/audit.md",
    "docs/kb/technical/analytics.md",
    "docs/kb/technical/logging.md",
  ]
---

# Politiques SLA versionnées

## Objet et permissions

Le modèle permet de publier des politiques SLA au niveau organisation, service, catégorie, ou service+catégorie. `client_admin` configure celles de sa propre organisation ; supervisor n'administre pas les SLA. Il n'existe pas de moteur SLA appliqué à des reports en Phase 2.

## Données et invariants

Chaque scope possède une identité de politique unique, même lorsque service/catégorie valent NULL : l'unicité PostgreSQL utilise NULLS NOT DISTINCT. La version publiée référence un calendrier compatible et trois cibles distinctes : acknowledgment, intervention, resolution. Durées entières strictement positives dans la capacité SQL, mode elapsed ou business_hours, motifs de pause explicites sans doublons. L'absence d'un motif ne signifie jamais pause autorisée.

Une publication successive crée une nouvelle version ; elle ne réécrit ni les cibles ni la version antérieure. Le scope d'une politique publiée reste immuable. La future spécificité est verrouillée service+catégorie > catégorie > service > organisation, mais aucun resolver report n'est implémenté.

## Erreurs et effets

Refus de scope/service/calendrier incompatible, cible absente/dupliquée ou durée invalide avant publication complète. Politique, version et cibles sont écrites avec leur audit dans la transaction ; échec audit = rollback. Aucun analytics SLA ; diagnostic de commande uniquement, sans données métier arbitraires.

## Preuves et limites

Unitaires de validation et pauses ; pgTAP des quatre scopes nullable, changements interdits et publications successives. `phase2_closure.sql` vérifie IDs distincts et conservation de l'ancien JSON/version/cibles. ADR-006/007 actives. Aucun écran SLA ni nouveau parcours a11y ; codes indépendants des traductions. Le calcul d'échéances et les jours fériés restent absents, sans décision ouverte sur les règles déjà verrouillées.
