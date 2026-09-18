---
name: create-adr
description: "Documenter une décision structurante avec alternatives, conséquences et succession explicite."
---

# create-adr

## Objectif et déclencheur

Documenter une décision structurante avec alternatives, conséquences et succession explicite.

## Préconditions et lectures

Le changement engage architecture/contrat durable ; aucun ADR pour un simple détail local. Lire les [Rules](../../../AGENTS.md), l’[index courant](../../references/current/ActiCiv_Phase2bis_Launch_Index.md), puis [architecture](../../kb/technical/architecture.md) ; [knowledge-governance](../../kb/technical/knowledge-governance.md).

## Impact map

Décision → exigences → ADR antérieures → KB/code/tests → sécurité/migration → statut/revue.

## Procédure

1. Lire l’index ADR et vérifier le prochain numéro libre ; ne jamais réserver un numéro sans document réel.
2. Rédiger contexte, décision proposée, alternatives, conséquences, sécurité, tests, migration/exploitation et références réelles.
3. Identifier explicitement si complète ou supersède une décision ; conserver texte et provenance de l’ancienne.
4. Lier la KB et le code/test pertinents, actualiser index, générer traceability et valider liens/statuts.
5. Présenter pour décision ; ne marquer acceptée qu’après accord explicite traçable.

## Tests et preuves

docs:validate, régénération déterministe, liens locaux ; preuves techniques du choix séparées du statut éditorial.

## Documentation

ADR, index des statuts et KB concernées dans la même PR.

## Sécurité et arrêt

Aucun secret/exploit sensible dans une ADR ; STOP contradiction ou décision hors périmètre.

## Definition of Done

Décision compréhensible sans conversation, alternatives et impacts explicites, statut honnête. La [DoD commune](../../quality/definition-of-done.md) reste applicable.

## Erreurs à éviter

Réécrire une ADR acceptée pour effacer l’histoire ; auto-approuver ; dupliquer une décision existante.
