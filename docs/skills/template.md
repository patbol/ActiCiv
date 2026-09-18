# Modèle de Skill

Copier la structure d’un [playbook existant](update-kb/SKILL.md) et adapter son contrat, sans créer de micro-skill vide. Frontmatter `name` (kebab-case identique au dossier) et `description` (déclencheur/action spécifique).

Sections : Objectif et déclencheur ; Préconditions et lectures ; Impact map ; Procédure ordonnée ; Tests et preuves ; Documentation ; Sécurité et arrêt ; Definition of Done ; Erreurs à éviter. Référencer AGENTS au lieu de recopier ses règles. Aucune commande destructrice par défaut.

Modifier le catalogue/validateur et leurs tests si le nombre de Skills évolue après décision explicite. Les quinze procédures actuelles sont canoniques sous `docs/skills/<name>/SKILL.md` ; découverte manuelle documentée dans [l’index](README.md).
