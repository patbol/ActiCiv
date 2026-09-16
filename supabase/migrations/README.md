# Migrations Phase 2

Huit migrations ordonnées, appliquées via `pnpm db:reset` en DEV. Chaque table reçoit immédiatement sa RLS et ses grants ; les mutations métier sont auditées dans la même transaction. Aucun changement manuel de schéma hors migrations.

Les fichiers de cette phase restent en préparation jusqu'à leur premier commit de livraison validé. Après livraison, toute évolution utilise une nouvelle migration.
