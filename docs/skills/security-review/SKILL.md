---
name: security-review
description: "Examiner une surface autorisée avec preuves négatives, scanners et findings sans fabriquer de pentest."
---

# security-review

## Objectif et déclencheur

Examiner une surface autorisée avec preuves négatives, scanners et findings sans fabriquer de pentest.

## Préconditions et lectures

Cible/environnement et surface changée connus ; un test actif de réseau exige autorisation de la cible. Lire les [Rules](../../../AGENTS.md), l’[index courant](../../references/current/ActiCiv_Phase2bis_Launch_Index.md), puis [security-assurance](../../kb/technical/security-assurance.md) ; [authorization](../../kb/technical/authorization.md) ; [artifact-hygiene](../../kb/technical/artifact-hygiene.md).

## Impact map

Surface → menace → contrôle serveur/DB → scénario négatif → scanner → findings/retest → evidence.

## Procédure

1. Lire KB, ADR, routes/RPC, droits et données ; sélectionner scénarios pertinents (IDOR, privilege, injection, XSS/CSRF/SSRF, redirect).
2. Tester chaîne JWT réelle, metadata forgées, cross-tenant et ownership quand concernés ; mocks seuls insuffisants.
3. Exécuter scans applicables Gitleaks, dependency audit, Semgrep et artefact PROD compilé ; DAST seulement sur DEMO autorisée.
4. Qualifier findings et preuves sans payload sensible ; critical bloque, high exige acceptation explicite possédée/expirante selon policy.
5. Corriger via test de régression et retester ; documenter limites/pentest indépendant avant vraie PROD ou pilote significatif.

## Tests et preuves

Unitaires ciblés, SQL/RLS et intégrations réelles, scanners déterministes ; pas de faux PASS pour outil non exécuté.

## Documentation

KB sécurité/droit impactée, findings minimisés avec statut, risque accepté uniquement si décision réelle.

## Sécurité et arrêt

Ne pas uploader token/source sensible ni cibler tiers ; STOP cible incertaine, permission manquante ou fuite potentielle.

## Definition of Done

Preuves et FAIL/DEFERRED/N/A explicites, remédiations testées, aucun risque accepté par défaut. La [DoD commune](../../quality/definition-of-done.md) reste applicable.

## Erreurs à éviter

Assimiler scan statique et pentest ; rendre toute vulnérabilité medium acceptable sans analyse ; cacher un scanner cassé.
