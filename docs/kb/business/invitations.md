---
id: "feature.invitations"
title: "Inviter et activer un professionnel"
domain: "auth"
type: "business-feature"
status: "active"
introduced_in: "phase-2"
roles: ["client_admin", "invited_identity"]
requirements: ["ADR-004", "ADR-007", "ADR-013"]
related_adrs: ["ADR-004", "ADR-007", "ADR-013"]
related_code:
  [
    "packages/backend/src/modules/auth/application/invite.ts",
    "packages/backend/src/modules/auth/infrastructure/invitations.ts",
    "supabase/migrations/20260918000200_observability_context.sql",
  ]
related_tests:
  [
    "packages/backend/src/modules/auth/application/invite.test.ts",
    "packages/backend/integration/invitations.integration.ts",
    "supabase/tests/phase2bis_observability.sql",
    "e2e/auth.spec.ts",
  ]
related_docs:
  [
    "docs/kb/technical/auth.md",
    "docs/kb/technical/audit.md",
    "docs/kb/technical/analytics.md",
    "docs/kb/technical/logging.md",
  ]
---

# Inviter et activer un professionnel

## Objectif et acteurs

Un `client_admin` actif invite un professionnel dans son organisation avec rôle et services autorisés. L'invité possède une identité Auth vérifiée ; il ne devient professionnel qu'à l'acceptation SQL. Agent et supervisor ne peuvent pas inviter.

## Parcours et états

Réserver avec clé d'idempotence → inviter via Auth → rattacher l'identité → accepter avec nom valide. Les états persistés sont `pending`, `sent`, `accepted`, `cancelled` ; l'expiration est une date, pas un cinquième état stocké. La reprise conserve la réservation et son `correlation_id`. Une invitation déjà `sent` retourne son ID sans nouvel envoi. Expirée, annulée ou acceptée, elle est refusée par la commande d'envoi.

Un échec provider laisse la réservation reprenable. Un échec de rattachement après création Auth n'accorde aucun membership ; la reprise retrouve l'identité existante. Il n'existe pas de transaction distribuée entre Auth et SQL. Le SQL d'acceptation revérifie destinataire, identité, expiration, services et unicité du membership ; l'application exige exactement une invitation disponible pour le parcours d'acceptation.

## Permissions, données et invariants

Email, rôle demandé, IDs organisation/services et clé d'idempotence sont validés dans leur périmètre réel. Metadata Auth falsifiées n'accordent rien. La projection readonly de contexte ne rend que l'ID et la corrélation de l'invitation envoyée, non expirée, appartenant à l'identité vérifiée. Elle n'autorise pas l'acceptation à elle seule.

## Effets, privacy et UX

L'activation métier et son audit sont atomiques ; les logs d'échec Auth sont séparés et ne contiennent ni email, ni nom, ni payload provider. Il n'existe pas d'événement analytics d'invitation dans le registre F. Le contexte de réservation relie diagnostic et audit. Les formulaires existants annoncent absence/erreur/succès et utilisent les locales de l'interface ; pas de console nouvelle d'envoi.

## Tests, décisions et limites

Les adaptateurs réels couvrent échec avant/après Auth, reprise, absence de privilège anticipé et corrélation. pgTAP couvre confidentialité/ownership du contexte. E2E couvre invitation et mot de passe ; les unitaires isolent idempotence et états terminaux. ADR-004/007/013 restent applicables. L'email Auth demeure français ; aucune garantie de livraison ni nettoyage distribué automatique n'est inventé.
