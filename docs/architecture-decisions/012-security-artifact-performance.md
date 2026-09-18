# ADR-012 — Security Assurance, artefacts PROD et gouvernance performance

Statut : **proposée pour revue 2bis-E**. A/B/C/D et ADR-008 à 011 approuvés par Patrick ; baseline d'entrée D `ced9d07e7f929c8dfdfff236f95c8b6300d6503d`. Aucune garantie des ADR acceptées n'est retirée.

## Contexte et impact map

Sources/tests → builds PROD et DEMO distincts → scans et mesures → rapports minimisés → snapshot v1 existant → policy E → CI/preuves/KB. Seule évolution visible : retrait du dialogue de démonstration de PROD ; la page d'attente et les parcours Auth restent disponibles. Aucun changement DB/RLS/RBAC/audit métier, aucun Analytics/Logs F ni Quality Center.

## Décision

Semgrep CE 1.177.0 et ZAP 2.17.0 sont figés par digest d'image dans `tooling/security/tools.json`. Semgrep travaille sans réseau sur une copie des seules sources produit TS/TSX ; sept règles locales couvrent des motifs génériques dangereux et deux conventions ActiCiv. Des contrôles positifs prouvent chaque règle. Aucun ruleset distant mouvant, aucune suppression inline `nosemgrep`, aucune télémétrie. Erreurs ou couverture incomplète des fichiers attendus échouent. Ce périmètre n'est ni une preuve SQL ni une analyse exhaustive interprocédurale.

ZAP baseline utilise seulement le spider court et le scan passif, sans authentification, sur les deux serveurs DEMO locaux qu'instancie la CLI. Les cibles sont codées et limitées à localhost/host.docker.internal, ports 3100/3101. Aucun scan cloud/PROD, aucun pentest. Les rapports natifs potentiellement sensibles restent sous `.quality/assurance/`, hors upload. L'agrégat ne conserve que IDs/catégories/sévérités/cibles sans query, ni requête/réponse/DOM/exploit. Un outil non exécuté ne peut donner PASS. Medium/low restent visibles ; aucune acceptation de risque implicite.

Build PROD par défaut dans `.next`. `ACTICIV_BUILD_TARGET=demo` produit `.next-demo`, activé par `build:demo`/`start:demo`/`dev`. Alias de compilation Next vers le composant DEMO ; l'entrée PROD est vide et n'importe pas ce composant. Les traductions et CSS du dialogue ne sont plus importés par le graphe PROD. Pas de condition runtime NODE_ENV. Les 38 tests historiques tournent sur DEMO ; une suite distincte exerce PROD, axe, en-têtes et erreurs. Les fichiers `next-env.d.ts` sont générés et non versionnés, car Next y inscrit le chemin du build sélectionné. Aucun nettoyage du source tree pendant un build.

Le scanner analyse les fichiers compilés JS/CSS/HTML/RSC, manifests/routes, traces NFT et sources maps publiques. Il utilise TypeScript pour les appels console et les maps serveur pour l'attribution de code tiers. Quatre exceptions console sont limitées au fichier tiers exact ET à son hash source ; aucune exemption de tous les fichiers Next/Supabase. La mise à jour d'une dépendance invalide l'exception si le contenu change. Le scanner échoue sur artefact absent ou mauvais target. Les résultats portent BUILD_ID et digest des fichiers scannés.

Les maps serveur restent des diagnostics restreints de build ; aucune map navigateur publique autorisée. Gitleaks inspecte aussi les arbres compilés. Les seuls matches génériques qualifiés automatiquement sont les identifiants publics d'actions Next enregistrés dans le manifest et la clé de chiffrement de build Next dans son manifest **serveur uniquement**. Cette clé nécessaire au runtime n'est ni une clé métier ni une autorisation de fuite client ; ses valeurs ne sont pas publiées. Pas de suppression globale des détecteurs. Aucun ZIP de build serveur ni rapport natif sensible uploadé par la CI E.

Performance : JS brut/gzip niveau 9, chunks et top 5, CSS/assets statiques, composants client déclarés, latences loopback warm séquentielles sur routes existantes. Ces latences ne sont ni un load test ni une promesse réseau mobile. Requêtes DB/N+1 restent non mesurées, sans instrumentation F anticipée. Comparaison via le snapshot canonique et son contrôle d'acceptation de baseline ; variations observées seulement. Aucun seuil numérique bloquant.

## Contrat de preuve et gates

Le schéma v1 permet déjà des checks nommés et métriques extensibles. E ajoute `sast`, `dast`, `artifact`, `performance`, `e2e-prod` et leurs rapports ; pas de changement incompatible, pas de migration DB. Le lecteur continue de lire D. La policy D reste conservée ; `policy-e.json` est versionnée `2bis-E.v1`, advisory. Les CLI de sécurité et d'artefact échouent sur preuve absente/invalide ou finding high non accepté/critical. La CI applique les contrôles stables ; la performance reste sans budget. ZAP local est optionnel et DEFERRED lorsqu'absent, jamais faussement exécuté en CI.

Les risques high exigent propriétaire, approbateur, raison, date, échéance future, mitigation, scope et retest. Aucun critical accepté. Le registre réel est vide. Le modèle et ses tests ne constituent pas une acceptation de risque par Patrick. Tout pentest réel reste à commander avant première vraie PROD/pilote significatif ; aucune échéance de phase ne vaut preuve de préparation PROD.

## Alternatives et conséquences

- Masquer le dialogue côté navigateur : conserve le coût/code DEMO ; rejeté.
- Supprimer les tests historiques : rejeté, la cible DEMO conserve leur couverture.
- Exclure tous les logs vendor : trop large ; attribution par source et empreinte retenue.
- Ajouter un scanner supply-chain supplémentaire : inutile avec pnpm audit, lockfile, lifecycle allowlist et Gitleaks existants.
- Supprimer toutes les maps serveur : perd les diagnostics et l'attribution ; elles restent privées, jamais servies comme assets.
- CSP stricte improvisée avec `unsafe-inline` : ne résout pas complètement XSS ; chantier de nonce/compatibilité à traiter avec revue dédiée, dette visible du scan.

Coût : deux builds par application et contrôles additionnels. `@jridgewell/trace-mapping` 0.3.31 devient devDependency directe, déjà transitive, pour lire les maps compilées sans écrire un décodeur maison. Aucune dépendance runtime produit ajoutée.

## Validation, récupération et références

Tests négatifs avant scanners/validateurs, controles Semgrep réels, E2E DEMO conservés, E2E PROD et axe, scan builds réels, Gitleaks des bundles, audit, snapshot et CI. Retirer E rétablit les builds D et sa policy sans migration de données ; conserver les preuves historiques et ne pas promouvoir un artefact reconstruit sans validation.

- [Security Assurance](../kb/technical/security-assurance.md), [catalogue](../quality/security-scenarios.md).
- [Artefacts](../kb/technical/artifact-hygiene.md), [performance](../kb/technical/performance-hygiene.md), [dépendances](../kb/technical/dependency-governance.md).
- [Rapport E](../quality/phase-2bis-e-report.md), [contrat qualité](../quality/quality-evidence.md).
- Sources outils : [Semgrep CLI](https://semgrep.dev/docs/cli-reference), [ZAP baseline](https://www.zaproxy.org/docs/docker/baseline-scan/).

## Décision ultérieure — lancement F

Patrick approuve explicitement ADR-012 et le checkpoint E sur `70e145da43d246a0452b371dd4da7cf12e0078b3`. Statut courant : **acceptée**. Le texte de proposition et ses limites historiques sont conservés.
