---
name: add-rbac-rule
description: "Implémenter un droit approuvé avec chaîne professionnelle, capacités plateforme et tests JWT/RLS négatifs."
---

# add-rbac-rule

## Objectif et déclencheur

Implémenter un droit approuvé avec chaîne professionnelle, capacités plateforme et tests JWT/RLS négatifs.

## Préconditions et lectures

Une décision explicite décrit acteur, action, ressource et refus ; lire la matrice avant de modifier la policy. Lire les [Rules](../../../AGENTS.md), l’[index courant](../../references/current/ActiCiv_Phase2bis_Launch_Index.md), puis [authorization-roles](../../kb/business/authorization-roles.md) ; [authorization](../../kb/technical/authorization.md) ; [audit](../../kb/technical/audit.md).

## Impact map

Actor → Auth → profile → membership → organization → role/capability → service → ownership → tenant → RLS/RPC → audit.

## Procédure

1. Tracer la capacité demandée ; distinguer chaîne professionnelle et administrateur plateforme actif/capacité explicite.
2. Écrire RED pour nominal et refus : Auth seule, profil/membership/org inactif, mauvais rôle, service étranger, ownership et cross-tenant.
3. Tester également JWT réel, metadata Auth forgées, IDOR et capacité plateforme absente ; aucun héritage client_admin/supervisor.
4. Modifier policy/contexte serveur puis RLS/grants/RPC via migration additive si nécessaire ; revérifier en SECURITY DEFINER.
5. Valider adaptateurs réels/SQL, régression des autres rôles et audit atomique ; documenter le droit dans la même PR.

## Tests et preuves

Unitaires de policy plus pgTAP et JWT réels ; concurrence si invariant dernier admin touché.

## Documentation

Matrice métier, KB technique, contrat API/audit et ADR si modèle de permission change.

## Sécurité et arrêt

Refus par défaut, ressource réellement chargée, pas de service_role ordinaire ; STOP si privilege non autorisé ou absence de preuve négative.

## Definition of Done

Chaque maillon et refus attendu prouvé, permissions documentées et aucun accès cross-tenant. La [DoD commune](../../quality/definition-of-done.md) reste applicable.

## Erreurs à éviter

Se fier au rôle UI/metadata, à l’UUID fourni ou aux mocks seuls ; accorder plateforme implicitement.
