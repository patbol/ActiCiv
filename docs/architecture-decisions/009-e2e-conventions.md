# ADR-009 — Page Objects, fixtures et conventions E2E

Statut : **proposée pour revue du checkpoint 2bis-B**. Formalise les choix d'implémentation des exigences POM/tagging déjà verrouillées. Ne supersède aucune ADR.

## Contexte

2bis-A est approuvé sur `be191f56109ea6380ccbd520ed49eb8a6074a9c0`. Les deux specs de Phase 2 contiennent 13 scénarios, soit 26 exécutions desktop/mobile, avec UI, préparation Supabase et locators mêlés. Patrick autorise uniquement leur refactor et les premières conventions exécutables, sans changement produit.

## Décision

Six Page Objects suivent les surfaces existantes : foundation, login, recovery, password, invitation et espace Pro. Un Component Object représente le dialogue partagé Citizen/Pro. Aucun héritage ou classe de base n'est nécessaire. Les locators/actions UI sont dans ces objets ; les assertions métier, sécurité et focus restent dans les specs.

Les fixtures Playwright sont à portée test. La préparation Auth/RPC est dans `e2e/fixtures/supabase.ts`, exclusivement côté Node, avec refus de toute URL non locale. Les confirmations utilisent le contexte HTTP du navigateur et les écritures de configuration gardent un vrai fetch depuis la page pour exercer cookies/CSRF. Les comptes seed, la séparation desktop/mobile et les emails d'invitation uniques sont conservés.

Les tags sont des chaînes statiques dans `{ tag: ... }`. Chaque test déclare une criticité ; les suites portent route/composant et les enfants les héritent. Les titres restent inchangés et sans tags. Toutes les surfaces actuelles ont une route logique et un composant pertinent : les deux dimensions sont donc requises dans les specs actuelles.

Trois règles ESLint locales, chargées par la configuration existante, contrôlent metadata, hygiène d'exécution et frontières de production. Elles sont testées via ESLint sur des programmes invalides/valides avant intégration. `pnpm lint`, donc `verify` et la CI existante, les exécutent. Pas de nouveau système de gates, reporter ou dépendance.

## Exceptions et limites

Aucun skip/fixme ni attente arbitraire n'est approuvé. Ils échouent au lint ; les directives inline sont désactivées dans E2E. Une future exception nécessite une décision explicite de Patrick, une justification, un propriétaire, une expiration et une adaptation ciblée/testée de la règle. Il n'y a pas de registre de waivers vide ou fictif. `forbidOnly: true` agit aussi hors CI ; `retries: 0` est inchangé.

Les providers analytics sont interdits dans les sources de production : aucun adaptateur n'existe encore. Une future exception sera limitée à l'adaptateur réellement approuvé en 2bis-F. Les logs debug sont interdits ; warn/error bas niveau restent disponibles selon AGENTS, sans création anticipée de logger.

Ces contrôles analysent la syntaxe et les imports connus ; ils ne prétendent pas analyser tous les flux dynamiques ni inspecter un artefact PROD complet. Le contrôle des bundles clients existant est conservé. Le scanner d'artefact reste 2bis-E.

## Alternatives

- Garder les specs monolithiques : duplication des locators et de la préparation technique.
- God Page Object / héritage de pages : responsabilités artificiellement couplées.
- Reporter seul pour les tags : feedback plus tardif, doublons et portée des déclarations difficiles à vérifier après normalisation.
- Nouveau plugin tiers ou parseur supplémentaire : inutile, ESLint/TypeScript existants suffisent.

## Conséquences, sécurité et tests

Aucun import runtime de fixtures, Playwright ou Vitest dans le produit ; garde-fou d'import en complément. Aucune modification Auth/RLS/DB/audit. Les erreurs de setup échouent sans afficher de token/mot de passe. Les données restent fictives et locales. Les comptes ne sont pas partagés entre profils ; les scénarios qui utilisent les mêmes admins d'un profil conservent le même mot de passe du run, comme avant. Deux runs qui mutent la même base ne doivent pas être lancés simultanément.

Conserver 13 scénarios / 26 exécutions, toutes les assertions, les 20 analyses axe par profil et les parcours clavier. Les erreurs de réponse API précédemment vérifiées par `expect(response.ok)` deviennent des erreurs de fixture bloquantes. Les assertions 307/cookie sont désormais explicites dans les deux specs concernées.

## Migration et références

Migration des tests seulement ; aucune migration de données ni nouveau package. Un retour arrière rétablit specs et configuration de lint sans effet sur les schémas.

- [KB testing](../kb/technical/testing.md), [bilan et inventaire des assertions](../quality/phase-2bis-b-report.md).
- [Règles exécutables](../../tooling/eslint/conventions.mjs), [tests de règles](../../packages/types/src/conventions.test.ts), [tests d'architecture conservés](../../packages/types/src/architecture.test.ts).
- [Fixtures](../../e2e/fixtures/test.ts), [Auth](../../e2e/auth.spec.ts), [foundation](../../e2e/foundation.spec.ts).
