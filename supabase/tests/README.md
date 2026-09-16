# Tests réels de la base

`pnpm db:test` lance pgTAP sur Supabase local et échoue s'il n'y a aucun test SQL ou si la base est indisponible. Les fixtures viennent de seed.sql ; chaque fichier SQL s'exécute en transaction puis rollback.

`pnpm test:integration` complète les tests SQL par de vrais JWT, Auth, invitations et concurrence HTTP. Aucun service-role ne joue le rôle d'un utilisateur testé : il ne sert qu'à préparer les identités fictives et à exercer le pont Auth privilégié prévu.
