# Modèle documentaire de futur Skill

Statut : template de préparation 2bis-A ; aucun Skill chargé automatiquement depuis ce fichier.

Un futur `SKILL.md` comportera un frontmatter `name` / `description` correspondant à son entrée du [catalogue](README.md). Son nom de dossier et son nom déclaré resteront cohérents. La convention d'intégration à l'outil sera vérifiée avant activation en 2bis-G.

## Contenu requis

1. Objectif et situations où utiliser/ne pas utiliser ce workflow.
2. Entrées : demande explicite, checkpoint autorisé, sources/KB/ADR, état Git/runtime et critères d'acceptation.
3. Impact map avant modification lorsque le comportement existe déjà.
4. Étapes concrètes, test-first pour les risques critiques ; commandes contextualisées, sans secret incorporé.
5. Résultats attendus : code/docs/preuves selon le scope, pas de promesse de réussite sans observation.
6. Contrôles finaux proportionnés, régression, sécurité/a11y/i18n et mise à jour des liens/documents pertinents.
7. Conditions d'arrêt : conflit de sources, permission manquante, scope dépassé, preuve obligatoire absente ; préserver le travail utilisateur.
8. Retour : résultat, changements, validations réellement exécutées, limites et STOP au prochain jalon soumis à validation.

Une procédure de release ne peut pas transformer un ancien journal en preuve d'un nouveau SHA. Une procédure de bug ne modifie pas le contrat pour justifier après coup le défaut. Une procédure de migration examine audit atomique, RLS et reconstruction réelle.
