---
id: "feature.professional-authentication"
title: "Accéder à son espace professionnel"
domain: "auth"
type: "business-feature"
status: "active"
introduced_in: "phase-2"
roles: ["agent", "supervisor", "client_admin"]
requirements: ["ADR-004", "ADR-010", "ADR-013"]
related_adrs: ["ADR-004", "ADR-010", "ADR-013"]
related_code:
  [
    "packages/backend/src/modules/auth/application/session.ts",
    "apps/pro/src/app/auth/",
  ]
related_tests:
  [
    "e2e/auth.spec.ts",
    "packages/backend/src/modules/auth/application/session.test.ts",
    "integration/security.test.mjs",
  ]
related_docs:
  [
    "docs/kb/technical/auth.md",
    "docs/kb/technical/audit.md",
    "docs/kb/technical/analytics.md",
    "docs/kb/technical/logging.md",
  ]
---

# Accéder à son espace professionnel

## Objectif et préconditions

Les parcours Pro permettent connexion, récupération, définition de mot de passe et déconnexion. Une session Auth seule ne donne aucun accès métier : l'espace vérifie profil, membership et organisation actifs. Les URLs professionnelles utilisent Pro (3001 en DEV), jamais Citizen 3000.

## Parcours, erreurs et données

La connexion normalise l'email puis délègue la vérification du mot de passe à Auth. La récupération donne un retour neutre ; elle ne prouve ni l'existence d'un compte ni la réception d'un email. Une session vérifiée est nécessaire pour définir un mot de passe d'au moins douze caractères. Après définition, un professionnel actif rejoint `/espace`, sinon `/auth/accept`. Sans invitation disponible, ce dernier écran l'annonce et ne crée aucun membership.

Callbacks/confirmation vérifient les jetons côté serveur ; les redirections acceptées restent locales selon l'allowlist. La déconnexion supprime la session. Cookies et identité Auth ne sont pas un rôle métier. Aucun mot de passe ou token n'entre dans la KB, l'audit métier, les analytics ou les logs.

## Effets et observabilité

Les événements login success/failure, recovery requested, password updated et logout sont ceux du [registre analytics](../technical/analytics.md), désactivé par défaut et sans identifiant personnel. Les diagnostics Auth ont un contexte de commande et des codes autorisés. Les changements Auth ne sont pas présentés comme une mutation SQL métier transactionnelle ; l'activation par invitation est décrite séparément dans [invitations](invitations.md).

## Accessibilité, i18n et preuves

Labels, focus sur erreur et annonces sont couverts par `e2e/auth.spec.ts`. Les contrôles VoiceOver Phase 2 puis C sont des preuves historiques validées, pas une nouvelle campagne G. Les écrans sont fr-FR/en-GB sans préfixe URL ; les emails restent français. Les tests de session prouvent identité requise, validation et destinations ; les tests de sécurité prouvent le refus de l'identité sans droits.

## Décisions et limites

ADR-004 porte l'accès professionnel, ADR-010 sa localisation et ADR-013 ses diagnostics. Aucune inscription citoyenne ni nouvelle UI métier. Localiser les emails reste une limite connue, sans décision métier réouverte.
