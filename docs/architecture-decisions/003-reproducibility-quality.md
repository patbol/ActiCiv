# Reproductibilité et validation

Statut : accepté par Patrick le 15 septembre 2026.

Contexte : monorepo vierge, livraison par phases et preuves de validation réelles.

Options : npm workspaces ou pnpm ; Supabase cloud partagé ou local ; tests simulés ou instance réelle pour la base.

Décision : pnpm workspaces, Node 24, lockfile versionné, Supabase local via CLI et moteur Docker compatible. Vitest pour les unités, Playwright et axe pour les navigateurs. GitHub Actions prépare les jobs app et base. Seuls les scripts natifs esbuild, sharp, supabase et unrs-resolver sont autorisés à l'installation ; ce dernier sert au résolveur de lint. Aucune autorisation générale.

Conséquences : Docker et GitHub sont requis pour certaines preuves. Un job écrit n'est pas un job exécuté. Un test avec valeurs fictives n'est pas une preuve RLS. Seeds phase 1 : point d'entrée exécutable sans schéma métier ; jeu riche progressif à partir de la phase 2. Aucun échec critique masqué, aucun retry Playwright pour cacher un défaut.
