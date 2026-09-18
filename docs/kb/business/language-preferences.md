---
id: feature.language-preferences
title: "Choisir sa langue d’interface"
introduced_in: phase-2bis-c
domain: preferences
type: business-feature
status: active
roles: [citizen, agent, supervisor, client_admin]
requirements:
  - "Livre v1.4 §51"
  - "Patrick — checkpoint 2bis-C §§3–6, 10–16"
related_adrs: [ADR-004, ADR-007, ADR-010]
related_code:
  - packages/ui/src/components/locale-selector.tsx
  - packages/shared/src/locale.ts
  - apps/pro/src/app/api/locale/route.ts
  - apps/citizen/src/app/api/locale/route.ts
related_tests:
  - e2e/locale.spec.ts
  - packages/shared/src/locale.test.ts
  - packages/backend/integration/locales.integration.ts
  - supabase/tests/phase2bis_locale.sql
related_docs:
  - docs/kb/technical/internationalisation.md
  - docs/quality/phase-2bis-c-report.md
---

# Choisir sa langue d’interface

## Objectif, acteurs et préconditions

Citizen et Pro présentent les écrans existants en français ou anglais. Un sélecteur nommé « Langue de l’interface » / « Interface language » affiche Français et English, sans drapeau. La langue ne change ni le fuseau, ni le rôle, ni le contrat, ni les codes métier.

Sans connexion, le choix est mémorisé dans le navigateur. Un professionnel actif mémorise sa préférence sur son profil. Une identité Auth seule n’autorise pas une écriture de profil professionnel.

## Nominal et alternatives

Choisir une langue sauvegarde la préférence puis rafraîchit les textes dans la même URL. La session reste active, le focus reste sur le contrôle et les champs d’un formulaire en cours restent remplis lorsque le composant est conservé. La confirmation est annoncée. Le choix d’un professionnel est retrouvé lors d’une nouvelle connexion.

Pro propose « Défaut de l’organisation » : la préférence devient NULL, sans modifier le défaut de l’organisation. L’utilisateur hérite alors de celui-ci. Un choix explicite reste prioritaire sur le défaut organisation. Avant connexion, cookie explicite puis préférence navigateur ; après connexion, profil puis organisation.

Citizen applique choix explicite → navigateur → contexte organisation/territoire si disponible → français. Le produit actuel n’a pas de contexte territoire Citizen ; aucun parcours n’est créé pour le simuler.

En cas d’échec, le choix précédemment sauvegardé reste applicable et un message invite à réessayer. Une valeur inconnue n’est pas enregistrée. Une préférence invalide reçue du navigateur est ignorée au rendu. Le fallback est toujours déterministe.

## Droits, données et effets

Chaque professionnel actif peut seulement modifier sa propre préférence, avec tous les contrôles profil/membership/organisation. Agent et supervisor n’obtiennent aucun droit d’administration. `client_admin` peut changer le défaut de sa propre organisation via l’API de configuration existante ; aucune console d’administration supplémentaire n’est créée.

Les libellés de catégories, verticales et motifs disposent de traductions, sinon le français historique sert de fallback. Les IDs/codes et les périmètres contractuels restent identiques. Les noms propres d’organisation/service ne sont pas traduits automatiquement.

Les changements DB sont audités atomiquement, avec acteur et corrélation ; si l’audit échoue, l’écriture échoue. Les choix anonymes du navigateur n’écrivent aucun événement métier en base. Depuis F, les événements pro_locale_changed/citizen_locale_changed et le diagnostic technique minimisé suivent le [registre analytics](../technical/analytics.md) et le [logger](../technical/logging.md), sans données personnelles. Le mode analytics reste off par défaut.

## Erreurs, edge cases et limites

Langue navigateur non prise en charge : fallback. Retour à l’héritage : org, sans écrire la préférence navigateur en DB. Déconnexion : les textes publics suivent le navigateur, sans conserver implicitement la langue du dernier professionnel. En DEV, les deux ports d’un même hôte partagent les cookies ; en production, les domaines distincts gardent leurs cookies host-only.

Les emails d’invitation/récupération restent français actuellement : leur localisation par destinataire nécessitera un traitement serveur cohérent avec profil et organisation. Les écrans atteints depuis leurs liens sont déjà localisés.

Tests critiques : priorité/héritage, refus cross-user/tenant et droits falsifiés, transaction audit, persistance/reconnexion, SSR fr/en, URL/session/formulaire/focus, axe et contrôle VoiceOver distinct. Voir la [KB technique](../technical/internationalisation.md) et les [preuves](../../quality/phase-2bis-c-report.md). Aucun parcours Phase 3 n’est décrit comme existant.

Une identité invitée Auth sans profil actif utilise seulement le cookie d’interface, comme le visiteur. Elle ne peut écrire de préférence DB ni obtenir un accès professionnel avant activation.
