# Skills ActiCiv — procédures canoniques

Quinze playbooks rédigés et approuvés en G. Ils utilisent le format `SKILL.md` avec frontmatter `name`/`description` ; ils ne sont pas une autorisation d’exécuter une tâche ni de franchir une phase.

## Découverte réelle

Lire [AGENTS.md](../../AGENTS.md) → cet index → le `SKILL.md` correspondant. Le catalogue est une aide au choix manuel pour humains/agents, sans prétendre que `/docs` est automatiquement découvert par l’outil. Aucun mécanisme local simple de découverte des playbooks n’était configuré dans le dépôt ; pas de framework/symlink ni copie supplémentaire installée. Les lectures complémentaires sont liées depuis chaque procédure.

## Catalogue

- [add-analytics-event](add-analytics-event/SKILL.md) — Ajouter un événement produit minimisé dans le registre canonique et ses adaptateurs sans confondre audit et analytics.
- [add-audit-event](add-audit-event/SKILL.md) — Étendre l’audit SQL transactionnel d’une mutation auditable sans double écriture applicative.
- [add-business-rule](add-business-rule/SKILL.md) — Ajouter un invariant métier approuvé côté domaine/serveur et SQL lorsque nécessaire.
- [add-e2e-test](add-e2e-test/SKILL.md) — Ajouter un scénario Playwright d’un parcours existant avec objets réutilisables, isolation, tags et locators accessibles.
- [add-logging](add-logging/SKILL.md) — Ajouter un diagnostic structuré à code et propriétés autorisés dans l’adaptateur serveur.
- [add-rbac-rule](add-rbac-rule/SKILL.md) — Implémenter un droit approuvé avec chaîne professionnelle, capacités plateforme et tests JWT/RLS négatifs.
- [change-existing-feature](change-existing-feature/SKILL.md) — Modifier un comportement existant après lecture des contrats et impact map complète.
- [create-adr](create-adr/SKILL.md) — Documenter une décision structurante avec alternatives, conséquences et succession explicite.
- [database-migration](database-migration/SKILL.md) — Faire évoluer le schéma par migration additive avec upgrade, reprise, seed et reconstruction prouvés.
- [fix-bug](fix-bug/SKILL.md) — Reproduire et corriger un défaut avec test de non-régression, sans réécrire le contrat pour justifier le bug.
- [i18n](i18n/SKILL.md) — Ajouter textes, formats ou préférences fr-FR/en-GB en conservant SSR, session, focus et fallback.
- [implement-feature](implement-feature/SKILL.md) — Implémenter un besoin explicitement autorisé avec preuves proportionnées, KB et limites de phase respectées.
- [prepare-release](prepare-release/SKILL.md) — Préparer les preuves du SHA exact avec gates, CI et artefacts vérifiés sans auto-accepter la release.
- [security-review](security-review/SKILL.md) — Examiner une surface autorisée avec preuves négatives, scanners et findings sans fabriquer de pentest.
- [update-kb](update-kb/SKILL.md) — Mettre à jour une fiche KB réelle et sa traçabilité dans la même PR que le contrat changé.

## Contrat commun

AGENTS porte les règles non négociables ; les Skills portent les étapes spécialisées. Objectif/déclencheur, préconditions/lectures, impact map, procédure ordonnée, tests/preuves, documentation, sécurité/arrêt, DoD et erreurs à éviter sont présents. Runtime : charger nvm et `nvm use` dans chaque shell ; ne pas réinstaller pnpm.

`pnpm docs:validate` contrôle les quinze chemins, métadonnées, sections et liens ; la revue contrôle leur pertinence. [Modèle](template.md), [DoD](../quality/definition-of-done.md) et [KB gouvernance](../kb/technical/knowledge-governance.md). Pas de reset DB pour une fiche seule, pas de nouveau parcours UI/VoiceOver artificiel. A–H approuvés ; I2 seul autorisé. STOP avant I3 et Phase 3.
