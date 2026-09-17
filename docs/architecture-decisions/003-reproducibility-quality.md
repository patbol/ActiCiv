# Reproductibilité et validation

Statut : accepté par Patrick le 15 septembre 2026.

Contexte : monorepo vierge, livraison par phases et preuves de validation réelles.

Options : npm workspaces ou pnpm ; Supabase cloud partagé ou local ; tests simulés ou instance réelle pour la base.

Décision : pnpm workspaces, Node 24, lockfile versionné, Supabase local via CLI et moteur Docker compatible. Vitest pour les unités, Playwright et axe pour les navigateurs. GitHub Actions prépare les jobs app et base. Seuls les scripts natifs esbuild, sharp, supabase et unrs-resolver sont autorisés à l'installation ; ce dernier sert au résolveur de lint. Aucune autorisation générale.

Conséquences : Docker et GitHub sont requis pour certaines preuves. Un job écrit n'est pas un job exécuté. Un test avec valeurs fictives n'est pas une preuve RLS. Seeds phase 1 : point d'entrée exécutable sans schéma métier ; jeu riche progressif à partir de la phase 2. Aucun échec critique masqué, aucun retry Playwright pour cacher un défaut.

## Complément Phase 2 approuvé

Phase 1 clôturée selon son postmortem. Node 24.21.0 est figé dans .nvmrc, utilisé par nvm et CI. verify compose format/lint/types/unitaires/builds ; verify:full ajoute pgTAP, Auth/RLS réel, E2E/axe et audit de dépendances. Aucun succès global si Supabase est indisponible. Les ports E2E doivent être libres.

La livraison est liée à un commit propre, testé localement et dans les deux jobs GitHub Actions. Archiver depuis ce SHA uniquement. Toute modification après validation impose une nouvelle validation. Les captures/rapports historiques ne valent pas preuve du nouveau SHA.

## Renforcement de clôture Phase 2

release:verify --rebuild-db reconstruit les données DEV locales depuis zéro, rejoue reset/seed et vérifie le résultat avant la validation complète. verify:full inclut Gitleaks 8.30.1 à empreintes de téléchargement figées, un contrôle positif/négatif de son détecteur et le scan de l’historique de HEAD. La CI utilise le même script et conserve son journal, sans exporter les clés de connexion Supabase. Les preuves finales sont jointes hors commit ; l’archive source reste strictement issue du SHA testé.
