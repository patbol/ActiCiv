# ADR-014 — Knowledge Architecture, Traceability and Agent Skills Governance

Statut : **proposée pour revue 2bis-G**. Complète ADR-008 et ADR-011, sans supersession. Patrick autorise G uniquement, après approbation A–F et ADR-008 à 013 sur la baseline F `ebab16c5c5c3133dda5afa5061263da5c3bcf25e`.

## Contexte

La structure documentaire A et les fiches B–F existent, mais la lecture des domaines Phase 2 reste dispersée. Les quinze Skills sont encore des intentions. L'objectif est de retrouver contrat, droits, code, tests et effets avant modification, sans copier le code ni inventer des parcours futurs.

## Décision proposée

Conserver les sources dans leur hiérarchie : décision récente Patrick → références courantes → KB → ADR acceptées → code/tests → historique. Une contradiction arrête le changement concerné. Les preuves historiques restent datées ; les rectifications de statuts déjà approuvés sont des décisions ultérieures explicites.

Conserver `docs/kb/business`, `technical`, `templates` et les IDs existants. Une fiche par comportement/domaine significatif ; titres explicites, sections applicables, frontmatter léger : id/title/domain/type/status/introduced_in, roles/requirements et related_adrs/code/tests/docs. Les chemins machine sont relatifs à la racine. Les fiches ne donnent pas un PASS aux tests simplement cités.

Dériver une vue navigable unique de ces métadonnées, avec retour ADR→KB. Le validateur vérifie YAML, ID unique, types/statuts/phases, présence de code/tests, existence des ADR, liens Markdown/ancres et fraîcheur de la vue. Il ne prétend pas analyser la sémantique de chaque phrase ni détecter automatiquement tout oubli de documentation métier.

Finaliser quinze playbooks canoniques dans `docs/skills/<name>/SKILL.md`, avec name/description et procédures courtes spécialisées. AGENTS conserve les règles non négociables et pointe vers le catalogue. Lecture manuelle explicite ; aucune découverte automatique de `/docs` non démontrée, aucun framework, symlink ou copie locale concurrente. Fichiers ciblés et liens stables rendent la consultation humaine et IA directe, sans RAG/vector DB.

Toute modification de comportement, droit, DB, contrat API, audit, analytics, logs ou architecture met à jour sa KB dans la même PR. L'impact map et la revue portent cette obligation ; les checks déterministes de structure/liens passent dans `verify`/CI et dans le snapshot canonique `docs` de la policy G advisory.

## Alternatives et conséquences

- Wiki/SaaS/RAG : rejetés, double source, coût et sécurité non justifiés.
- Matrices manuelles par dossier : rejetées, divergence probable ; une vue dérivée suffit.
- Génération exhaustive depuis fonctions/classes : rejetée, duplique le code sans expliquer le métier.
- Parseur YAML maison : rejeté ; `yaml` 2.9.1 dev-only apporte syntaxe standard, détection des clés dupliquées et rejet d'alias.
- Autodiscovery supposé : rejeté ; chemin manuel documenté reflète l'outillage réel.

Le coût est quelques fiches ciblées, un validateur court et la maintenance des liens dans la PR. Pas de schéma documentaire extensible complexe ni d'ADR par détail. Les seuils coverage/performance restent advisory sans nouvelle acceptation numérique.

## Sécurité, tests et artefacts

Aucune donnée réelle, credential de test utilisable ou payload sensible dans la KB. Les Skills ne s'accordent aucune permission, ne franchissent aucune phase et signalent les opérations destructrices. Les outils restent dev-only ; Artifact Hygiene inspecte chemins/IDs KB et Skills dans le vrai build PROD et ses traces. Détection syntaxique, complétée par revue des imports.

Tests RED→GREEN du validateur : valide, ID absent/dupliqué, YAML invalide, types/statuts, ADR inconnue, code/test absent, liens/ancres/références, historique autorisé, active Phase 3 refusée, déterminisme de la génération et contrat des quinze Skills. Régression du contrôle artefact ; tests du check canonique docs manquant/échoué.

## Migration et exploitation

Pas de migration DB, backfill, nouvelle UI ou reset. Ajout titre/phase aux fiches sans changer leurs IDs, puis génération de la vue et validation. Les ADR acceptées conservent leur texte ; les statuts ultérieurs approuvés sont ajoutés et l'index audité. Aucun H/Quality Center/Phase 3.

## Références

- [KB gouvernance](../kb/technical/knowledge-governance.md), [traçabilité](../kb/traceability.md), [Skills](../skills/README.md).
- [Validateur](../../tooling/quality/knowledge.ts), [CLI](../../tooling/quality/knowledge-cli.ts), [tests](../../tooling/quality/knowledge.test.ts).
- [Politique](../quality/documentation-policy.md), [rapport G](../quality/phase-2bis-g-report.md).

## Décision ultérieure — finalisation G

Patrick approuve explicitement l’architecture G et ADR-014 et demande sa finalisation sur commit propre, validations locales et GitHub Actions au même SHA, avec téléchargement/vérification des artefacts. Statut courant : **acceptée**. Le texte de proposition est conservé ; aucune autorisation de H/Quality Center/Phase 3.
