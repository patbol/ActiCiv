---
id: technical.performance-hygiene
domain: engineering-quality
type: technical-topic
status: active
roles: [developer, reviewer]
requirements: ["Patrick — checkpoint 2bis-E uniquement"]
related_adrs: [ADR-011, ADR-012]
related_code: [tooling/quality/performance.ts, tooling/quality/local-server.ts]
related_tests: [tooling/quality/assurance.test.ts]
related_docs: [docs/quality/phase-2bis-e-report.md]
---

# Performance : mesurer avant budgets

`pnpm performance:measure` lit les builds PROD et mesure les routes locales existantes. JSON : JS brut/gzip niveau 9, nombre de chunks/top 5, CSS/assets statiques, nombre de fichiers source client dans chaque app, BUILD_ID, quinze requêtes warm séquentielles après trois warmups. Échantillon loopback non authentifié : pas un benchmark mobile/charge, pas une preuve de performance DB ou de p95 PROD.

`pnpm performance:compare <snapshot> [<baseline>]` utilise le même comparateur canonique que D ; baseline acceptée et compatible requise, sinon NO_BASELINE ou refus explicite. Deltas positifs/négatifs/inconnus préservés, aucun verdict « régression » sans policy validée. Métrique inconnue = null, jamais zéro inventé. Les snapshots D restent lisibles ; un autre target/environnement/policy ne devient pas comparable par simple renommage.

La suppression du dialogue réduit le JS PROD ; la comparaison avec D est une observation de changement de contenu, pas un gain mesuré sur un parcours équivalent. Les mesures B/C et D restent historiques. App client-heavy : locale selector et boundary d'erreur ; AuthFeedback sur Pro. Le dialogue/Radix/lucide reste dans DEMO. Catalogues traduits chargés côté serveur ; seuls messages d'erreur et props utiles traversent la frontière client.

Pas de polling applicatif recensé. Le proxy Auth et la résolution de locale vérifient la session à des frontières distinctes ; React cache déduplique les préférences dans une requête, sans cache inter-utilisateurs. Aucun N+1 DB affirmé sans mesure ; trace de requêtes/latence DB DEFERRED. Ne pas supprimer Temporal : Node 24.21 ne fournit pas le support approuvé nécessaire aux règles horaires déterministes.

Budgets candidats : plafond initial égal aux mesures PROD E de taille/chunks, à arrondir/revoir avec Patrick ; ils ne sont pas activés. Aucun budget latence proposé à partir de quinze requêtes locales. Le rapport donne les valeurs exactes, le coût et les limites.
