# Skills — structure et catalogue initial

Statut 2bis-A : catalogue et contrat de playbook seulement. **Aucun des 15 Skills ci-dessous n'est déclaré implémenté ou automatiquement découvert.** Les procédures détaillées relèvent de 2bis-G ou d'une autorisation ciblée ultérieure. Un Skill ne donne jamais l'autorisation de franchir un checkpoint.

Chemin documentaire canonique prévu : `docs/skills/<name>/SKILL.md`. Ne créer ce dossier que lorsqu'un playbook réel est écrit. En attendant, [AGENTS.md](../../AGENTS.md) pointe explicitement ici ; la lecture est manuelle. Aucun mécanisme d'autodiscovery, symlink, dossier `.agents/skills` ou copie concurrente n'est installé en 2bis-A. L'intégration de découverte sera vérifiée et documentée au checkpoint concerné, sans prétendre que `/docs` est découvert automatiquement.

## Catalogue requis

Tous les statuts suivants sont **PLANNED**, pas des workflows exécutables disponibles.

Mise à jour 2bis-B pour les futurs Skills `add-e2e-test`, `fix-bug`, `change-existing-feature`, `security-review` et `prepare-release` : utiliser la [KB testing](../kb/technical/testing.md) pour les objets/fixtures existants, metadata statique, contrôles ESLint, sélection par tags et validation sans retries. Les mécanismes sont disponibles ; les playbooks complets et leur découverte restent prévus en G.

| Nom                       | Déclencheur et résultat attendu                            | Garde-fou central                                           |
| ------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------- |
| `implement-feature`       | Besoin autorisé → fonctionnalité et preuves proportionnées | Scope, critères et test-first critique                      |
| `change-existing-feature` | Comportement existant → impact map avant edits             | Règles/droits/DB/RLS/API/UI/tests/i18n/observabilité/KB/ADR |
| `fix-bug`                 | Défaut reproductible → correction et non-régression        | Reproduire → test → fix → régression → validations          |
| `add-business-rule`       | Invariant autorisé → règle serveur/SQL et preuve           | Backend source de vérité, cas limites                       |
| `add-e2e-test`            | Parcours réel → scénario lisible et isolé                  | POM/tags selon fondation installée, locators accessibles    |
| `add-rbac-rule`           | Droit approuvé → autorisation et tests négatifs            | Tenant, service, ownership, refus par défaut                |
| `database-migration`      | Changement schéma → migration et reprise prouvées          | Append-only, FK/unique nullable, RLS/audit/seeds/reset      |
| `add-analytics-event`     | Usage justifié → événement typé/documenté                  | Taxonomie et minimisation, aucun provider dispersé          |
| `add-audit-event`         | Mutation auditable → preuve transactionnelle               | Échec audit = rollback métier                               |
| `add-logging`             | Besoin diagnostic → contexte structuré sûr                 | Niveaux, corrélation, aucune fuite de payload               |
| `i18n`                    | Texte/format/préférence → comportement locale-aware        | Codes stables, locale distincte de timezone                 |
| `create-adr`              | Décision structurante → ADR avec alternatives              | Succession explicite, pas de réécriture de l'histoire       |
| `update-kb`               | Contrat modifié → connaissances et liens actuels           | Pas de comportement futur fictif                            |
| `security-review`         | Surface/risque réel → constats et preuves                  | Scénarios pertinents, gravité, remédiation/retest           |
| `prepare-release`         | Candidat autorisé → preuves de readiness                   | SHA/artefact exacts, gates réels, contrôle humain requis    |

## Contrat d'un futur playbook

Voir le [modèle](template.md). Chaque Skill définira nom/description, déclencheurs, contexte et entrées, étapes, sorties, contrôles finaux et conditions d'arrêt/escalade. Les chemins cités devront exister ; les commandes respecteront le runtime nvm et la phase autorisée.

Les procédures sont proportionnées : pas de DB reset pour corriger un lien ; intégration réelle pour un changement RLS ; preuve d'accessibilité pour une interaction nouvelle. La [DoD](../quality/definition-of-done.md) et la [traçabilité](../quality/traceability.md) portent le contrat commun, sans le dupliquer dans quinze fichiers vides.
