---
id: template.business-feature
domain: governance
type: business-feature-template
status: template
roles: []
requirements: []
related_adrs: []
related_code: []
related_tests: []
related_docs: []
---

# Modèle de fiche métier

Modèle uniquement, pas une fonctionnalité active. Lors de la création d'une fiche, définir un ID `feature.*`, son domaine, ses acteurs et sources ; remplacer `status: template` par un statut documenté dans la [traçabilité](../../quality/traceability.md). Les listes vides doivent être renseignées ou leur non-applicabilité expliquée avant activation.

## Objectif et périmètre

Besoin, source/section, phase autorisée, critères d'acceptation, état réel d'implémentation et exclusions.

## Acteurs et droits

Rôles/capacités explicites, périmètre organisation/service, ownership réel, préconditions Auth/profil/membership/organisation actifs et refus attendus. Séparer les capacités plateforme des rôles clients.

## Parcours et règles

Flux nominal, variantes, erreurs, cas limites, invariants, statuts/transitions, concurrence et idempotence. N'inventer aucun comportement absent ou non validé.

## Données et contrats

Données lues/écrites, IDs/codes, API/RPC, contraintes, transaction, RLS/grants, tenant et effets de bord. Préciser rétention/limitations lorsqu'elles sont réellement décidées.

## Accessibilité et i18n

Clavier, focus, labels, annonces d'erreurs ; langues/locales supportées, formats et timezone indépendante. Décrire uniquement les mécanismes effectivement disponibles.

## Observabilité

Analytics : événements et propriétés minimisées. Audit : acteur, mutation atomique, whitelist, corrélation. Logs : diagnostic/niveau/contexte sûr. Distinguer les trois ; indiquer N/A si un flux n'existe pas.

## Preuves et traçabilité

Associer chaque invariant/erreur critique à un scénario de test précis et un chemin réel. Lier les ADR, le code et les preuves datées avec leur SHA/environnement. Ne pas attribuer un PASS à un test seulement prévu.

## Limites et décisions

Questions réellement ouvertes, sujet/propriétaire/échéance lorsque connus, historique des arbitrages et liens de succession. Ne pas rouvrir une décision verrouillée.
