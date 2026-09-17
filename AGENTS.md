# ActiCiv — AGENTS.md

## 0. Statut du projet

Projet : **ActiCiv**

Phase courante :
**Phase 2 bis — Engineering Quality, Internationalisation & Knowledge Foundations**

Checkpoint actif et seul autorisé : **2bis-A — baseline documentaire, Rules et gouvernance**. Les sections ci-dessous décrivent aussi des cibles futures ; elles n'autorisent pas leur implémentation maintenant. **STOP après 2bis-A pour revue de Patrick ; aucun 2bis-B sans validation explicite.**

Entrées de gouvernance : [index](docs/README.md), [politique documentaire](docs/quality/documentation-policy.md), [DoD](docs/quality/definition-of-done.md), [checklist PR](docs/quality/pr-checklist.md), [traçabilité](docs/quality/traceability.md), [KB](docs/kb/README.md), [catalogue Skills](docs/skills/README.md).

Phase précédente :
**Phase 2 — Core Data & Security — CLOSED**

Baseline officielle Phase 2 :
`fac0fc8663d1f32b09b720fddffd46f0829c8a6a`

Phase 3 :
**NOT STARTED**

Aucun agent ne doit démarrer une fonctionnalité Phase 3 sans validation explicite de Patrick.

---

## 1. Sources de vérité

Avant toute modification, lire les sources applicables.

### Références courantes

Dans `docs/references/current/` :

- `ActiCiv_Livre_Produit_Technique_v1.4_FINAL_A4.docx`
- `ActiCiv_Prompt_Astra_Phase2bis_v1.2_Engineering_Quality_i18n_Knowledge.md`
- `ActiCiv_Phase2bis_Exhaustiveness_Checklist_v1.2.md`
- `ActiCiv_Phase2bis_Launch_Index.md`

### Preuves et historique

- `docs/evidence/` contient les postmortems, attestations et preuves.
- `docs/references/historical/` contient les anciennes références.
- Les documents historiques ne sont jamais utilisés comme contrat courant sauf pour comprendre l'origine d'une décision.
- Les ADR 001–007 conservent leur statut accepté et leurs garanties applicables ; leur ancienneté ne les rend pas obsolètes. Les décisions Phase 2 clôturées ne sont pas rouvertes.

### Ordre de priorité en cas de conflit

1. décision explicite récente validée par Patrick ;
2. référence courante applicable ;
3. KB métier / KB technique ;
4. ADR acceptées ;
5. code et tests existants ;
6. références historiques.

En cas de contradiction :
**STOP. Ne jamais arbitrer silencieusement. Signaler le conflit avant de modifier le comportement.**

---

## 2. Règle de phase

Toute tâche doit appartenir explicitement à la phase courante.

Phase 2 bis autorise les fondations d'ingénierie, qualité, i18n, sécurité, gouvernance documentaire, observabilité, Quality Center minimal et hygiène de production.

Phase 2 bis n'autorise pas le démarrage des fonctionnalités métier Phase 3, notamment :

- création de signalement citoyen ;
- upload photo métier ;
- tracking citoyen ;
- routage final ;
- smart queue ;
- claim ;
- intervention opérationnelle ;
- transfert opérationnel ;
- notification métier ;
- moteur anti-abus complet ;
- détection/fusion de doublons ;
- analytics métier de signalement.

Si une tâche risque de franchir cette frontière :
**STOP et demander validation.**

---

## 3. Architecture

ActiCiv reste un **monolithe modulaire TypeScript**, avec architecture hexagonale pragmatique sur les modules critiques.

Principes obligatoires :

- `domain` ne dépend pas de Next.js, Supabase, HTTP, réseau ou infrastructure ;
- `application` orchestre les cas d'usage via ports ;
- `infrastructure` contient les adaptateurs techniques ;
- les entrypoints valident les entrées, récupèrent l'identité/contexte, puis appellent les cas d'usage ;
- aucune règle métier critique uniquement dans l'UI ;
- aucune dépendance privilégiée accessible depuis le navigateur ;
- aucun repository générique artificiel ;
- aucune couche vide créée uniquement pour “faire hexagonal” ;
- pas de microservices, queues, caches, ORM ou infrastructure supplémentaire sans besoin démontré.

Les frontières existantes doivent rester protégées par ESLint et/ou tests d'architecture.

---

## 4. Sécurité, tenancy, RBAC et RLS

Le principe est : **deny by default**.

Chaîne professionnelle attendue :

`Auth vérifiée → profil actif → membership actif → organisation active → rôle/capacité → service si requis → tenant et ownership réels de la ressource`

La plateforme conserve son identité de droits distincte : Auth vérifiée, administrateur plateforme actif et capacité explicite. `client_admin` n'hérite pas de la supervision ; `service_memberships` porte les périmètres agent et supervisor.

Règles :

- l'autorisation est côté serveur ;
- les invariants critiques sont protégés également en SQL/DB lorsque pertinent ;
- RLS reste une barrière réelle, pas décorative ;
- les RPC `SECURITY DEFINER` doivent refaire les contrôles métier nécessaires ;
- aucun `service_role` dans le chemin métier ordinaire ;
- toute mutation cross-tenant doit être explicitement empêchée ;
- les metadata Auth ne donnent jamais de privilège métier ;
- les tests négatifs sont obligatoires sur les changements de droits ;
- les changements de sécurité critiques doivent inclure tests réels, pas uniquement mocks.

Toute modification Auth/RBAC/RLS/tenant est considérée **risque élevé**.

---

## 5. Base de données et migrations

Règles obligatoires :

- ne jamais modifier une migration déjà publiée/auditée ;
- créer une nouvelle migration versionnée ;
- préserver les IDs/codes métier stables ;
- protéger les contraintes tenant avec FK/contraintes adaptées ;
- traiter correctement les dimensions nullable (`NULLS NOT DISTINCT` ou index partiels lorsque nécessaire) ;
- auditer les mutations lorsqu'elles entrent dans le périmètre d'audit ;
- conserver l'atomicité mutation + audit ;
- ajouter/adapter pgTAP et tests d'intégration ;
- prouver `db reset` depuis une base reconstruite ;
- préserver compatibilité des données existantes ;
- documenter stratégie de migration/backfill/rollback ou récupération.

---

## 6. TDD et non-régression

Règle centrale :

**No critical business rule without a failing test first. No fixed bug without a regression test. No release without passing quality gates.**

Pour logique métier, sécurité, concurrence, RBAC/RLS, SLA, DST, routing, contrats, audit, invitations et migrations :

`Red → Green → Refactor`

Exceptions possibles uniquement si test-first n'est pas raisonnablement applicable ; elles doivent être justifiées.

Toujours :

- tester le comportement observable ;
- ne jamais supprimer, affaiblir ou skipper un test valide pour rendre la CI verte ;
- un bug corrigé reçoit un test de non-régression qui échoue avant correction lorsque faisable ;
- un test qui passe après retry n'est pas considéré comme un PASS propre de release.

---

## 7. Tests E2E Playwright

Architecture cible pragmatique :

- Page Objects pour les pages réellement réutilisées ;
- Component Objects pour les composants réellement réutilisés ;
- fixtures pour la mécanique technique réutilisable ;
- specs centrées sur le scénario et les assertions métier.

Locators :

1. `getByRole`
2. `getByLabel`
3. texte sémantique
4. hooks de test seulement si nécessaire

Éviter les sélecteurs fragiles et les dépendances inutiles au texte traduit.

Chaque test Playwright porte exactement une criticité :

- `@critical`
- `@high`
- `@medium`
- `@low`

Les suites portent lorsque applicable :

- `@route:*`
- `@component:*`

Tags optionnels :

- `@type:security`
- `@type:a11y`
- `@type:smoke`
- `@type:regression`

Interdits en code commité :

- `test.only`
- `describe.only`
- focus temporaire équivalent
- `waitForTimeout` arbitraire sans justification

Release Playwright :
**`retries: 0`**.

---

## 8. Conventions exécutables

Principe officiel :

**Toute convention importante, objectivement vérifiable et raisonnablement automatisable doit devenir un garde-fou exécutable si cela reste simple, maintenable et proportionné au risque.**

Ordre privilégié :

`Prettier → TypeScript strict → ESLint/custom rules → architecture tests/scripts → Quality Gates`

Exemples à automatiser lorsque pertinent :

- tagging Playwright valide ;
- absence de `.only` ;
- skips gouvernés ;
- absence d'attentes arbitraires ;
- interdiction des imports framework/réseau dans domain/application ;
- interdiction d'accès direct aux providers analytics hors adaptateur ;
- interdiction d'importer le backend privilégié depuis le navigateur ;
- contrôle des usages `any` / `@ts-ignore` ;
- contrôle des patterns debug en production.

Ne pas transformer une convention en usine à gaz si son coût dépasse son bénéfice.

---

## 9. TypeScript, lint et format

- TypeScript strict.
- Préférer les types explicites et étroits.
- Éviter `any`, `@ts-ignore`, casts larges.
- Toute exception doit être étroite et justifiée.
- Prettier gère le formatage.
- ESLint gère les conventions structurelles.
- `git diff --check` doit rester propre.

Production :

- `console.log` interdit ;
- `console.debug` interdit ;
- `console.trace` interdit ;
- utiliser le logger structuré ;
- `console.error` / `console.warn` bas niveau ne sont tolérés que si techniquement justifiés dans un adaptateur/outillage et ne remplacent pas le logger applicatif.

---

## 10. Internationalisation

Principes :

**langue ≠ locale ≠ timezone**

Locales Phase 2 bis :

- `fr-FR`
- `en-GB`

Timezone :
IANA, indépendante de la locale.

Aucun nouveau texte utilisateur ne doit être intrinsèquement lié à une seule langue.

Les codes métier restent stables et indépendants des traductions.

Utiliser `Intl` pour :

- dates ;
- nombres ;
- temps relatifs ;
- pluralisation lorsque pertinente.

Priorité Citizen :

1. préférence explicite persistée navigateur ;
2. locale/langue navigateur ;
3. défaut organisation/territoire si disponible ;
4. fallback ActiCiv `fr-FR`.

Priorité Pro :

1. préférence utilisateur ;
2. défaut organisation ;
3. préférence locale persistée (cookie), puis négociation navigateur pour l'amorçage ;
4. fallback `fr-FR`.

Le changement de langue ne doit pas casser :

- session ;
- cookies ;
- deep links ;
- focus ;
- formulaires ;
- hydratation SSR.

---

## 11. Observabilité

Trois flux distincts :

### Analytics

Usage produit agrégé/minimisé.

### Audit

Preuve métier et sécurité.

### Logs

Diagnostic technique.

Règle :

**Analytics, Audit and Logs are separated by design.**

Ils ne se substituent jamais les uns aux autres.

Interfaces cibles :

- `analytics.track(...)`
- mécanisme SQL transactionnel d'audit existant (une interface `audit.record(...)` ne doit pas le remplacer par une écriture séparée)
- `logger.info/warn/error(...)`

Ne jamais envoyer dans analytics/logs :

- secrets ;
- tokens ;
- mots de passe ;
- plaque brute ;
- texte libre sensible ;
- GPS exact sans nécessité explicite ;
- données personnelles inutiles.

Le `correlation_id` peut relier techniquement les flux lorsque justifié, mais ne doit pas devenir un identifiant analytics personnel par défaut.

---

## 12. Audit

L'audit métier/sécurité reste :

- append-only ;
- acteur dérivé côté serveur ;
- transactionnel lorsque requis ;
- liste blanche old/new ;
- corrélé ;
- non modifiable par un utilisateur métier.

L'audit n'est pas un log technique.

Toute modification d'un comportement audité doit inclure :

- mise à jour du contrat d'audit ;
- tests ;
- documentation.

---

## 13. Quality Evidence et Quality Center

Le pipeline et le Quality Center doivent consommer **la même source canonique de vérité**.

Schéma conceptuel :

`tests/scans → quality snapshot canonique → gates + Quality Center`

Le Quality Center ne doit jamais recalculer une vérité différente de la CI.

Chaque snapshot doit pouvoir identifier au minimum :

- SHA ;
- environnement ;
- outils/versions ;
- suites/tests ;
- métriques ;
- résultats de gates ;
- artefacts/références ;
- provenance ;
- état incomplet/échoué si preuve absente.

Une preuve obligatoire absente = gate non satisfait.

Le Quality Center Phase 2 bis reste minimal, protégé et en lecture seule côté utilisateur.

L'ingestion qualité doit être de confiance, via pipeline/CLI restreint, jamais par un endpoint navigateur ouvert.

---

## 14. Coverage

Coverage = indicateur, jamais preuve suffisante de qualité.

Mesurer :

- statements ;
- branches ;
- functions ;
- lines ;
- modules métier critiques ;
- SQL/RLS ;
- routes/API/RPC ;
- scénarios critiques.

Règle :

**aucun seuil bloquant arbitraire.**

Procédure :

1. mesurer baseline réelle ;
2. analyser ;
3. proposer budgets/seuils ;
4. obtenir validation explicite de Patrick ;
5. seulement ensuite les rendre bloquants.

---

## 15. Quality Gates

DEV → DEMO/STAGING doit pouvoir couvrir selon applicabilité :

- format ;
- lint ;
- typecheck ;
- unit ;
- SQL/pgTAP ;
- RLS ;
- integration ;
- critical E2E ;
- build ;
- accessibility automatisée ;
- dependency audit ;
- secret scan ;
- coverage ;
- architecture checks ;
- artifact hygiene.

DEMO/STAGING → PROD ajoute selon maturité :

- même SHA/artefact ;
- sécurité ;
- absence de vulnérabilité critique ;
- high uniquement avec acceptation explicite ;
- migrations ;
- smoke ;
- release evidence ;
- performance budgets ;
- DAST/pentest lorsque la phase le permet.

Les gates sont versionnés/configurables.

Les waivers sont :

- explicites ;
- possédés ;
- justifiés ;
- expirants ;
- auditables.

---

## 16. Security Assurance

Conserver et compléter :

- Gitleaks ;
- dependency audit ;
- SAST ;
- contrôles config ;
- tests RBAC/RLS ;
- tests IDOR/privilege ;
- injection/XSS/CSRF/SSRF selon surface ;
- callbacks/redirects ;
- rate limit lorsque concerné ;
- storage/photo plus tard ;
- DAST sur environnement autorisé.

Phase 2 bis :

- Semgrep approuvé pour SAST ;
- préparation ZAP/DAST sur DEMO autorisée ;
- pentest indépendant avant la première vraie PROD ou tout pilote significatif avec utilisateurs/données réels ; retest ciblé après correction de findings critiques/high, sans attendre un numéro de phase.

Ne jamais fabriquer une preuve de pentest/PROD inexistante.

---

## 17. Production Artifact Hygiene

Règle :

**Tout élément uniquement destiné au test, au debug ou au développement doit être absent du bundle/artefact PROD, sauf justification explicite.**

Et :

**Production hygiene is verified on the compiled artifact, not inferred from the source tree.**

Contrôler notamment :

- fixtures ;
- mocks ;
- fake users ;
- test helpers ;
- debug routes ;
- dev panels ;
- modes `MOCK_AUTH`, `DEBUG`, bypass ;
- credentials de test ;
- dépendances de test au runtime ;
- hooks de test purement dédiés aux tests ;
- source maps publiquement accessibles ;
- logs debug ;
- séparation client/serveur.

Les `data-testid` ne sont pas interdits dogmatiquement :

- privilégier les locators accessibles ;
- utiliser un hook de test uniquement lorsque nécessaire ;
- ne pas introduire de transformation fragile juste pour les supprimer ;
- évaluer leur utilité future pour monitoring synthétique/post-déploiement.

Les pages/composants DEV/DEMO-only doivent être absents de l'artefact PROD si classés comme tels.

---

## 18. Production Performance Hygiene

Règle :

**Tout coût runtime sans valeur PROD doit être supprimé, désactivé ou justifié.**

Surveiller notamment :

- dépendances lourdes ;
- JS/CSS/assets inutiles ;
- hydratation inutile ;
- client components inutiles ;
- N+1 ;
- payloads surdimensionnés ;
- polling ;
- retries excessifs ;
- appels réseau redondants ;
- instrumentation trop bavarde ;
- gros chunks ;
- routes lentes.

Principe :

**Every production dependency must justify its runtime cost.**

Pour une dépendance runtime significative, documenter :

- pourquoi elle est nécessaire ;
- client/server ;
- coût attendu ;
- tree-shaking ;
- alternative plus légère ;
- maintenance/sécurité.

Comme pour coverage :
mesurer d'abord, fixer les budgets ensuite avec validation.

---

## 19. Documentation-as-Code

Toute nouvelle documentation versionnée vit sous `/docs`, sauf `AGENTS.md`, le README racine et les fichiers racine explicitement prévus. Maintenir l'organisation approuvée `references/current`, `references/historical`, `evidence/phase1`, `evidence/phase2/raw` ; aucun déplacement arbitraire. Les README techniques de proximité préexistants restent en place pendant 2bis-A.

Une fonctionnalité importante doit pouvoir être tracée :

`Requirement ↔ KB ↔ droits ↔ code ↔ tests ↔ observabilité ↔ ADR`

Si changent :

- comportement ;
- droit ;
- contrat API ;
- audit ;
- analytics ;
- logging ;
- règle métier ;
- architecture ;

alors la documentation associée doit changer dans la même PR.

Un changement de comportement non documenté est une régression documentaire.

---

## 20. Knowledge Base

Structure :

- `docs/kb/business/`
- `docs/kb/technical/`
- templates associés

Une fiche métier doit pouvoir préciser :

- objectif ;
- acteurs ;
- préconditions ;
- nominal ;
- alternatives ;
- erreurs ;
- règles métier ;
- droits ;
- données ;
- statuts ;
- effets de bord ;
- audit ;
- analytics ;
- logs ;
- edge cases ;
- tests critiques ;
- ADR ;
- code ;
- questions ouvertes.

Ne jamais documenter comme existante une fonctionnalité Phase 3 non implémentée.

---

## 21. ADR

Créer une ADR uniquement pour une décision structurante.

Une ADR comprend au minimum :

- contexte ;
- décision ;
- alternatives ;
- conséquences ;
- sécurité ;
- testing ;
- migration si applicable ;
- références KB/code.

Une ADR acceptée n'est pas réécrite silencieusement.
Une nouvelle ADR la supersède si nécessaire.

Pas d'ADR pour un détail trivial.

---

## 22. Rules et Skills

### Rules

Règles persistantes non négociables.

### Skills

Procédures réutilisables orientées tâche.

Catalogue cible Phase 2 bis :

- `implement-feature`
- `change-existing-feature`
- `fix-bug`
- `add-business-rule`
- `add-e2e-test`
- `add-rbac-rule`
- `database-migration`
- `add-analytics-event`
- `add-audit-event`
- `add-logging`
- `i18n`
- `create-adr`
- `update-kb`
- `security-review`
- `prepare-release`

Éviter des dizaines de micro-skills artificielles.

---

## 23. Workflow de changement existant

Avant de modifier une fonctionnalité existante :

1. lire KB métier ;
2. lire KB technique ;
3. lire ADR ;
4. identifier règles métier ;
5. identifier rôles/droits ;
6. identifier DB/RLS ;
7. identifier APIs/RPC ;
8. identifier tests ;
9. identifier analytics/audit/logs ;
10. établir une impact map.

Impact map minimale :

`Feature → rules → roles → DB → RLS → APIs → tests → analytics → audit → logs → docs`

Puis seulement modifier.

---

## 24. Workflow bug

1. reproduire ;
2. vérifier le comportement attendu dans KB/ADR ;
3. écrire le test de régression échouant si faisable ;
4. corriger ;
5. faire passer le test ;
6. exécuter la régression ciblée ;
7. mettre à jour la KB si le comportement attendu a réellement changé ;
8. ne jamais changer la documentation pour justifier a posteriori un bug.

---

## 25. Accessibilité

WCAG 2.2 AA reste non négociable.

À couvrir selon pertinence :

- axe ;
- labels ;
- rôles ;
- ordre clavier ;
- focus ;
- erreurs annoncées ;
- reduced motion ;
- contrastes ;
- lecteur d'écran manuel sur parcours importants.

L'automatisation ne remplace pas VoiceOver/TalkBack.

Un nouveau composant interactif important nécessite une preuve a11y adaptée.

---

## 26. Dépendances

Ne pas ajouter une dépendance sans besoin démontré.

Avant ajout :

- vérifier qu'une dépendance existante ne couvre pas déjà le besoin ;
- vérifier compatibilité runtime ;
- vérifier maintenance ;
- vérifier vulnérabilités ;
- vérifier coût client/server ;
- préférer devDependency si runtime inutile.

Phase 2 bis déjà approuvé en principe :

- `next-intl` pour i18n ;
- `@vitest/coverage-v8` aligné sur Vitest ;
- Semgrep CE pour SAST ;
- ZAP pour préparation DAST DEMO ;
- parseur YAML de développement si utile pour validation frontmatter.

L'intégration réelle doit toujours être prouvée.

---

## 27. Release

Commandes existantes à préserver :

- `pnpm verify`
- `pnpm verify:full`
- `pnpm release:verify --rebuild-db`

Une release valide exige :

- arbre propre ;
- SHA identifié ;
- validations exécutées réellement ;
- même SHA local/CI ;
- aucune modification après validation ;
- artefact rattaché au SHA ;
- aucun retry masquant un défaut ;
- preuves externes si nécessaire.

Une branche mouvante n'est jamais une identité de release.

---

## 28. Git et fichiers

Ne jamais :

- écraser des modifications utilisateur non comprises ;
- supprimer un fichier non identifié ;
- réécrire l'historique sans demande ;
- modifier une migration publiée ;
- force-push sans autorisation explicite ;
- inclure secrets/tokens/credentials ;
- versionner artefacts temporaires inutiles.

Avant commit :

- `git status`
- `git diff`
- `git diff --check`
- vérifications ciblées applicables.

---

## 29. Rigueur proportionnée au risque

Le niveau de preuve dépend du risque.

Exemples :

### Faible

CSS local / wording purement présentation :

- lint/format ;
- vérification visuelle/a11y pertinente ;
- pas d'ADR artificielle.

### Moyen

Composant partagé / comportement UI :

- tests ;
- a11y ;
- KB si comportement contractuel.

### Élevé

Auth, RBAC, RLS, migration, tenant, SLA, audit, concurrence :

- test-first ;
- tests négatifs ;
- intégration réelle ;
- DB/security checks ;
- documentation ;
- ADR si structure modifiée ;
- reconstruction/validation adaptée.

Objectif :
**maturité élevée sans bureaucratie inutile.**

---

## 30. Definition of Done minimale

Une tâche n'est DONE que lorsque les éléments applicables ont été traités :

- code ;
- tests ;
- régression ;
- typecheck/lint/format ;
- sécurité ;
- a11y ;
- i18n ;
- analytics ;
- audit ;
- logs ;
- KB ;
- ADR ;
- migrations ;
- quality gates ;
- preuves.

Si un élément applicable manque :
ne pas déclarer DONE.

Toujours distinguer :

- PASS
- FAIL
- DEFERRED
- NOT APPLICABLE

et expliquer les exceptions.

---

## 31. Phase 2 bis — checkpoints

Ordre de travail recommandé :

- **2bis-A** — baseline documentaire, Rules, gouvernance
- **2bis-B** — POM, fixtures, tagging, conventions exécutables
- **2bis-C** — i18n, locales, données/traductions
- **2bis-D** — coverage, reports, snapshots, quality gates
- **2bis-E** — Security Assurance, Artifact/Performance Hygiene
- **2bis-F** — Analytics / Audit / Logs
- **2bis-G** — KB, Skills, gouvernance
- **2bis-H** — Quality Center
- **2bis-I** — hardening et clôture

Ne jamais démarrer le checkpoint suivant sans validation explicite de Patrick lorsque le plan de travail le demande.

En 2bis-A, seuls les index, règles, DoD/checklist/traçabilité, structures/templates KB et catalogue Skills sont réalisés. POM, tagging, i18n, migrations, coverage, snapshots/gates, scanners, analytics/logger et Quality Center restent non commencés. Les playbooks Skills complets relèvent de 2bis-G, sauf autorisation ultérieure ciblée.

---

## 32. Règle finale

En cas de doute :

1. préserver les garanties existantes ;
2. choisir l'option la plus simple et réversible ;
3. ne pas inventer de comportement produit ;
4. ne pas contourner sécurité/tests/docs ;
5. signaler les ambiguïtés importantes ;
6. ne jamais masquer un échec.

**ActiCiv privilégie la preuve réelle, la maintenabilité et la simplicité contrôlée.**
