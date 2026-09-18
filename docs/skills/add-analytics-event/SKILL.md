---
name: add-analytics-event
description: "Ajouter un événement produit minimisé dans le registre canonique et ses adaptateurs sans confondre audit et analytics."
---

# add-analytics-event

## Objectif et déclencheur

Ajouter un événement produit minimisé dans le registre canonique et ses adaptateurs sans confondre audit et analytics.

## Préconditions et lectures

Un parcours existant et une finalité mesurable justifient l’événement ; G ne donne pas permission d’activer un fournisseur. Lire les [Rules](../../../AGENTS.md), l’[index courant](../../references/current/ActiCiv_Phase2bis_Launch_Index.md), puis [analytics](../../kb/technical/analytics.md) ; [correlation-errors](../../kb/technical/correlation-errors.md).

## Impact map

Finalité → événement/propriétés → contexte autorisé → adaptateur/off/local → privacy → tests → KB.

## Procédure

1. Chercher un événement existant pour éviter doublon ; nommer une action réellement observable et définir les seules propriétés nécessaires.
2. Écrire RED des clés inconnues, valeurs invalides, PII/tokens/texte libre et contexte interdit.
3. Étendre le registre typé et brancher au succès/échec réel via le port/adaptateur existant ; aucune requête provider dans domain/application.
4. Tester no-op/off et local borné, absence d’effet métier lors d’échec, comportement PROD explicitement off actuel.
5. Documenter finalité, source, properties allowlist et non-identifiants ; toute nouvelle activation PROD/provider demande décision.

## Tests et preuves

Registre, anti-PII, adapter off/local, frontière architecture et point d’émission observable.

## Documentation

KB analytics et fiche métier ; ADR si fournisseur/consentement/rétention change.

## Sécurité et arrêt

Ni email/ID personnel/correlation_id par défaut, ni GPS exact ; STOP si finalité ou autorisation collecte absente.

## Definition of Done

Contrat typé testé, données minimisées, coût nul off, aucun changement métier caché. La [DoD commune](../../quality/definition-of-done.md) reste applicable.

## Erreurs à éviter

Utiliser analytics comme audit, journaliser un payload entier, appeler directement un SaaS.
