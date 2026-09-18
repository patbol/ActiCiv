# Phase 2 bis — checkpoint 2bis-E

État : implémentation E prête pour gel et validation distante. La campagne locale complète passe ; la clôture reste conditionnée au SHA propre et à la CI réelle. Aucun 2bis-F ni Phase 3 commencé. L’ADR-012 et les budgets candidats restent soumis à revue de Patrick.

## 1–3. Entrée, Git et dépendances

HEAD initial `ced9d07e7f929c8dfdfff236f95c8b6300d6503d`, branche `phase-2bis-engineering-foundations`, origin `https://github.com/patbol/ActiCiv.git`. Arbre propre, diff et diff-check vides. Node v24.21.0 via nvm dans chaque shell, pnpm 11.19.0. Patrick approuve A/B/C/D et ADR-008 à 011. Références actuelles, AGENTS, ADR, KB testing/i18n/quality relues ; instruction E récente prioritaire. Pas de migration DB.

Outils : Semgrep CE 1.177.0, ZAP 2.17.0, images figées par digest dans tools.json. DevDependency directe trace-mapping 0.3.31 (déjà transitive) pour l'attribution des logs compilés aux sources ; aucune dépendance produit ajoutée. Radix dialog et lucide deviennent devDependencies UI, car uniquement utilisés en DEMO après E. Lockfile et allowlist lifecycle conservés. next-env.d.ts générés et non versionnés pour éviter une mutation des sources lors d'un changement de target de build.

## 4–7. SAST, DAST et catalogue

Semgrep : sept règles locales déterministes, contrôles positifs de chaque règle et scan réel sans réseau sur toutes les sources produit TS/TSX hors tests. Premier scan : 92/92 fichiers, zéro finding. Rapports natifs privés, rapport minimisé sans source/metavars/secrets. Aucun `nosemgrep` autorisé ni règles désactivées pour passer.

ZAP : scan baseline passif non authentifié des deux DEMO locales, images figées. Premier essai échoué sur permission du home conteneur, corrigé avant vraie exécution ; pas de PASS prétendu sur cet essai. Le premier vrai scan révèle medium/low (CSP, clickjacking, MIME, isolation navigateur, permissions, observation anti-CSRF). Les en-têtes X-Frame-Options DENY, nosniff et Referrer-Policy sont ajoutés après quatre tests échouants ; retest réel PASS : alertes clickjacking et MIME disparues. Le scan du 18 septembre conserve 3 medium (CSP sur les deux apps et observation anti-CSRF Pro), 6 low et 6 info, sans high/critical. Les variations de découverte passive ne sont pas une couverture exhaustive. CSP stricte/nonce reste dette explicite, pas une policy unsafe-inline improvisée. Le finding anti-CSRF passif n'est ni automatiquement accepté ni qualifié de faux positif.

[Catalogue sécurité](security-scenarios.md) : surfaces existantes reliées aux tests Auth/RBAC/RLS/tenant/contrats/audit/invitations/locale. Storage/photo/reports Phase 3 et SSRF d'URL arbitraire absents : NOT_APPLICABLE.

## 8–11. Artefact, maps et erreurs

Le scan initial des builds D détecte réellement le dialogue dans JS/CSS/manifests. E le retire du graphe PROD par alias de compilation, sans condition runtime NODE_ENV ; build DEMO séparé et tous les tests historiques conservés. Les catalogues et styles du dialogue suivent la même frontière.

Scanner compilé : fixtures, fake users, mocks/tests, debug routes, bypass, console, secrets reconnaissables, hooks, maps publiques, traces de dépendances test, frontières client/serveur, BUILD_ID et digest. Les quatre exceptions console vendor exigent source exacte + hash du contenu ; elles ne couvrent pas le code produit. Gitleaks complète les motifs du scanner dans les deux arbres PROD static/server. Les identifiants d'actions Next et la clé de chiffrement générée exclusivement serveur sont qualifiés par correspondance exacte au manifest. Aucune valeur secrète publiée ; les artefacts CI ne contiennent ni build serveur ni rapport natif sensible.

Source maps navigateur désactivées, maps serveur privées. Les erreurs sur routes existantes /api/locale, /api/configuration et /api/platform, requêtes malformées et fichiers absents sont vérifiées en HTTP réel. Aucun endpoint debug créé. Logger minimal existant conservé ; aucune refonte F.

## 12–16. Performance et coûts

Première mesure PROD E avant gel (BUILD_ID dans les JSON privés) :

| Application | JS octets | Gzip niveau 9 | Chunks | Plus gros JS |  CSS | Assets statiques |
| ----------- | --------: | ------------: | -----: | -----------: | ---: | ---------------: |
| Citizen     |    686412 |        212092 |     15 |       228918 | 8251 |           694663 |
| Pro         |    696773 |        216429 |     17 |       228918 | 8251 |           705024 |

D mesurait Citizen 726645 / 225927 gzip / 16 chunks et Pro 737006 / 230263 / 18. Variation observée : −40233 octets JS pour chaque app ; gzip −13835 / −13834 ; un chunk retiré. Pas un verdict de régression/amélioration contractualisée : le contenu DEMO a été retiré. Mesures B→C conservées dans leurs rapports, pas recalculées avec un autre environnement.

15 requêtes loopback warm par route après 3 warmups ; premier échantillon : Citizen health médiane 1,93 ms / p95 5,86 ms, accueil 5,33 / 11,62 ; Pro health 1,72 / 3,00, login 6,60 / 14,51. Non authentifié, séquentiel, sans charge : aucune promesse de latence PROD. DB query count/duration non instrumentés : DEFERRED explicite. Revue code : préférences dédupliquées par React cache à portée requête, pas de polling applicatif recensé ; aucune suppression d'appel Auth sans preuve de sûreté.

Composants client sources des apps : 2 Citizen, 3 Pro ; ce compteur ne prétend pas mesurer toutes les dépendances hydratées. Coûts structurants analysés dans [Dependency Governance](../kb/technical/dependency-governance.md). Catalogues chargés serveur, petit provider erreur seulement ; next-intl conservé pour son besoin réel. Temporal conservé, pas de polyfill supprimé sans preuve.

Budgets candidats, **non activés** : plafonds de maintien correspondant à la mesure E (JS/gzip/chunks/plus gros chunk ci-dessus), à revoir avec Patrick. Aucun seuil de latence proposé sur ce petit échantillon. Comparateur canonique actuel vs baseline acceptée ; absence, valeurs inconnues, deltas ± et mode advisory testés.

## 17–22. Findings, risques, CI, snapshot et docs

Modèle minimal : id stable, outil, catégorie, severity, status open, cible sûre, résumé code de règle, accepted_risk, retest pending. Acceptation high : propriétaire/approbateur/raison/date/expiry/mitigation/scope/retest, jamais critical. Le registre réel est vide ; les acceptations de fixtures de tests ne sont pas des décisions de Patrick. Alertes medium/low restent visibles sans devenir un PASS de « zéro dette ».

GitHub réellement lu : rulesets `[]`, main `protected:false`. Lecture détaillée des protections refusée au connecteur (403), aucune déduction sur plan GitHub. Écart avant promotion : protection de branche/reviews/checks à configurer par propriétaire ; E audite sans modifier l'administration distante. CI contents:read, pas de secrets cloud, pas de pull_request_target, checkout sans credentials persistants, quatre actions épinglées à des SHA officiels résolus (tag annoté pnpm déréférencé). Rétention qualité/journal 14 jours ; traces/DOM bruts d'échec retirés des uploads.

Snapshot D enrichi par checks extensibles v1 ; ancienne policy D conservée et lecteur historique maintenu. Policy E advisory, aucun seuil coverage/performance activé. Les CLI/tests stables SAST/artefact/erreurs et secrets échouent réellement ; ZAP reste campagne locale optionnelle. Aucune seconde source de vérité ni UI/DB Quality Center.

[ADR-012](../architecture-decisions/012-security-artifact-performance.md) proposée ; KB [sécurité](../kb/technical/security-assurance.md), [artefacts](../kb/technical/artifact-hygiene.md), [performance](../kb/technical/performance-hygiene.md), [dépendances](../kb/technical/dependency-governance.md). Catalogue cyber inclut backup/restore/rotation/incident/rétention/ownership, explicitement préparation seulement. AGENTS/index/traçabilité/KB testing/i18n actualisés, historique intact.

## 23–28. Validation, dette et arrêt

Campagne complète locale du 18 septembre : run `2026-09-18T00-04-43-037Z-4fe84981`, snapshot sous `.quality/snapshots/`, source candidate non commise déclarée `dirty:true` (pas une identité de release). Verdict advisory PASS : 23 gates PASS, 1 DEFERRED (reset non demandé), 2 NOT_APPLICABLE. Format/lint/types/architecture/conventions PASS ; 160 unitaires, 126 assertions SQL, 8 intégrations Node + 8 adaptateurs, 38 E2E DEMO + 14 E2E PROD, sans échec/skip/retry. Axe, deux builds PROD et DEMO, sept contrôles positifs Semgrep + 92 sources scannées, artefact, audit dépendances, Gitleaks source/historique/compilé PASS. Aucune vulnérabilité connue signalée par pnpm audit.

Compatibilité réelle : snapshot D relu et évalué avec sa policy d’origine ; comparateur sans acceptation retourne NO_BASELINE. Revue finale : un test RED a montré que les nouveaux E2E PROD n’étaient pas comptés dans les totaux de comparaison ; ajout au comparateur, sans changer les snapshots D. Le compteur unitaire final attendu est 161, à confirmer dans la validation du SHA figé.

Échecs intermédiaires conservés comme tels : montage ZAP initial ; quatre tests headers RED avant correction ; deux credentials synthétiques de test détectés par Gitleaks source, désormais construits à l’exécution sans exclusion ; tests RED scanners/acceptations/métriques/compteur avant implémentation. Aucun test valide supprimé ou affaibli pour rendre la campagne verte. Liens docs : 66 fichiers Markdown, 331 liens locaux, zéro cassé ; git diff --check propre.

La preuve de release du SHA E sera produite après ce gel : `release:verify --rebuild-db`, snapshot final sur arbre propre, vraie CI distante avec jobs historiques et collecte E. Ces résultats ne sont pas anticipés dans ce document versionné ; l’attestation rattachée au SHA les identifiera. Aucun snapshot n’est marqué ACCEPTED automatiquement.

DEFERRED : CI distante jusqu’à exécution, protections de branche à décider par le propriétaire, instrumentation DB et préparation opérationnelle backup/restore/RTO/RPO. Hors périmètre E et non exécutés : pentest indépendant, DAST PROD et restore drill PROD. NOT_APPLICABLE : migration, fonctionnalités Phase3, Analytics/Logs F, UI Quality Center. Les contrôles manuels C restent historiques ; aucun VoiceOver/TalkBack E fabriqué. Retrait du dialogue PROD vérifié au clavier/axe par les parcours conservés et suite PROD, sans nouveau composant interactif.

**STOP après E pour revue Patrick. Aucun 2bis-F et aucune Phase 3 commencés.**
