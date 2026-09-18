---
id: "technical.auth"
title: "Auth, invitation et reprise des adaptateurs"
domain: "auth"
type: "technical-topic"
status: "active"
introduced_in: "phase-2"
roles: ["developer", "reviewer"]
requirements: ["ADR-004", "ADR-007", "ADR-010", "ADR-013"]
related_adrs: ["ADR-004", "ADR-007", "ADR-010", "ADR-013"]
related_code:
  [
    "packages/backend/src/modules/auth/",
    "packages/backend/src/platform/correlation.ts",
    "apps/pro/src/app/auth/",
    "supabase/config.toml",
  ]
related_tests:
  [
    "packages/backend/integration/invitations.integration.ts",
    "packages/backend/src/modules/auth/application/session.test.ts",
    "e2e/auth.spec.ts",
  ]
related_docs:
  [
    "docs/kb/business/professional-authentication.md",
    "docs/kb/business/invitations.md",
    "docs/kb/technical/correlation-errors.md",
  ]
---

# Auth, invitation et reprise des adaptateurs

## Chaîne et composition

Les entrypoints valident la requête et composent les ports de session/invitation ; `session.ts` et `invite.ts` orchestrent sans SDK/HTTP. `@supabase/ssr` transporte la session vérifiée et les cookies côté serveur. L'accès métier relève ensuite du contexte d'autorisation, pas du simple résultat signIn.

Le bridge privilégié d'invitation est étroit : création/recherche d'identité Auth uniquement après réservation métier autorisée. Les RPC métier ordinaires utilisent le JWT utilisateur. Les tests d'adaptateurs réels couvrent les frontières où des mocks ne prouveraient pas la reprise.

## Échecs et corrélation

SQL réserve l'invitation idempotente et sa corrélation ; Auth peut échouer avant ou après création. Le rattachement et l'acceptation sont rejouables selon état/destinataire sans attribuer des droits à l'avance. La projection pending_invitation_context est readonly et filtrée par identité vérifiée ; l'acceptation SQL reste l'autorité. Voir [contrat métier](../business/invitations.md).

Callbacks et URLs autorisées visent Pro, avec validation de redirection locale. Le chemin mot de passe conserve la session recovery/invitation nécessaire et distingue professionnel actif d'invité. Ne jamais journaliser cookies, corps provider, tokens URL ou mots de passe. La corrélation traverse les adaptateurs et reste distincte d'un identifiant analytics.

## Validation et limites

Tests unitaires pour orchestration, JWT et SQL pour autorisation, adaptateurs Supabase réels pour échec/reprise, E2E pour parcours et axe. Aucun compte utilisable ni credential ne figure dans cette fiche. Les emails Auth restent français ; interface fr/en disponible. Les évolutions nécessitent régression, revue sécurité, KB et preuve proportionnée ; pas de nouvel Auth provider prévu en G.
