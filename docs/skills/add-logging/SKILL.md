---
name: add-logging
description: "Ajouter un diagnostic structuré à code et propriétés autorisés dans l’adaptateur serveur."
---

# add-logging

## Objectif et déclencheur

Ajouter un diagnostic structuré à code et propriétés autorisés dans l’adaptateur serveur.

## Préconditions et lectures

Un besoin d’investigation justifie le message/niveau ; ne pas ajouter un log pour chaque fonction. Lire les [Rules](../../../AGENTS.md), l’[index courant](../../references/current/ActiCiv_Phase2bis_Launch_Index.md), puis [logging](../../kb/technical/logging.md) ; [correlation-errors](../../kb/technical/correlation-errors.md).

## Impact map

Diagnostic → code/niveau → propriétés sûres → contexte/corrélation → adapter → volume → tests/KB.

## Procédure

1. Choisir un code stable existant ou nouveau et un niveau pertinent ; définir la liste blanche.
2. Écrire RED anti-PII, token/password, cause/message/stack brute, niveaux et contexte forgé.
3. Composer logger côté serveur ; utiliser logger.info/warn/error. Debug reste désactivé PROD ; aucun console.log/debug/trace applicatif.
4. Propager le contexte interne vérifié ; ne pas faire confiance à un header navigateur. Tester que panne de sink ne modifie pas la mutation métier.
5. Mesurer volume/coût et documenter diagnostic, propriétés et limites ; ne pas doubler les événements sans besoin.

## Tests et preuves

Tests de sérialisation/redaction, input hostile, mode PROD et sink défaillant ; architecture/bundle.

## Documentation

KB logging/correlation et fiche feature si nouveau contrat diagnostic significatif.

## Sécurité et arrêt

Ne pas sérialiser Error arbitraire, request ou response ; STOP si données libres indispensables sans décision de minimisation.

## Definition of Done

Diagnostic utile et borné, contexte fiable, aucune donnée sensible, coût justifié. La [DoD commune](../../quality/definition-of-done.md) reste applicable.

## Erreurs à éviter

Confondre log et audit, propager une stack brute, exposer sink/server code au client.
