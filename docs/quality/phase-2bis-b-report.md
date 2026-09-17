# Phase 2 bis — checkpoint 2bis-B

Verdict : **READY FOR PATRICK REVIEW**. Périmètre : POM, fixtures, tagging et premières conventions exécutables uniquement. Aucun 2bis-C ni Phase 3 commencé.

## État Git initial et impact map

- Dépôt `/Users/patrickmoreno/ActiCiv/dev/acticiv`, origin fetch/push `https://github.com/patbol/ActiCiv.git`.
- Branche conservée : `phase-2bis-engineering-foundations`.
- HEAD initial : `be191f56109ea6380ccbd520ed49eb8a6074a9c0`, checkpoint 2bis-A approuvé par Patrick.
- Parent/baseline Phase 2 CLOSED : `fac0fc8663d1f32b09b720fddffd46f0829c8a6a`.
- Arbre initial propre ; diff et `git diff --check` vides.
- Runtime effectivement chargé par nvm dans les shells : Node `v24.21.0`, pnpm `11.19.0`.

Impact map : scénarios E2E existants → locators/POM et fixtures → Auth/RPC réels inchangés → tests de conventions/architecture et E2E → KB/ADR/règles. Aucun code produit, droit, migration, schéma, RLS, contrat API, audit ou observabilité modifié. Aucun nouveau package.

Les sources courantes, AGENTS, ADR-008 et la gouvernance A ont été relus. La nouvelle autorisation de Patrick remplace la borne A ; la documentation courante indique désormais B seul autorisé, STOP avant C. L'acceptation d'ADR-008 est tracée comme décision ultérieure sans réécriture de sa proposition initiale.

## Inventaire avant/après et conservation des assertions

Avant : 7 scénarios Auth + 3 scénarios foundation déclinés sur les ports 3000 et 3001 = **13 scénarios**, chacun sur desktop et mobile = **26 exécutions**.

Après : **mêmes 13 titres et mêmes 26 couples profil/scénario**. Comparaison réelle des sorties Playwright `--list` avant/après : identité des ensembles. Seuls les regroupements en suites et les metadata changent.

| Scénario existant (titre conservé)                                        | Assertions conservées par profil                                                                                          | Axe avant → après | Criticité |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ----------------- | --------- |
| recovery validates errors, keyboard focus, new password and a fresh login | 10 focus, message succès, 2 URLs, confirmation 307 + cookie, login avec nouveau mot de passe ; 2 réponses setup vérifiées | 6 → 6             | critical  |
| login rejects wrong credentials and exposes a focused accessible error    | 5 focus et message de connexion refusée                                                                                   | 1 → 1             | high      |
| unavailable invitation remains accessible without granting any membership | 2 focus, message/absence d'invitation, absence de droits, URL espace, count actif = 0, HTTP 403                           | 2 → 2             | critical  |
| professional login, accessible form and logout use real Supabase          | 2 URLs, accès actif puis refus configuration après logout ; provisionnement vérifié                                       | 2 → 2             | critical  |
| invalid callbacks cannot redirect off site                                | URL login locale, focus et contenu de l'alerte                                                                            | 1 → 1             | critical  |
| invited professional sets a password and activates membership             | 7 focus, 3 visibilités, erreur nom vide, activation, confirmation 307 + cookie ; 6 réponses setup vérifiées               | 4 → 4             | critical  |
| client administrator uses the protected configuration entrypoint          | URL espace puis résultats écriture propre organisation/autre organisation = [200, 400] ; provisionnement vérifié          | 0 → 0             | critical  |
| surface 3000: renders and passes automatic accessibility checks           | heading, avertissement DEV, capture, largeur sans débordement                                                             | 1 → 1             | medium    |
| surface 3000: keyboard dialog focus and persistent labels                 | dialogue visible, 3 focus, saisie, Shift+Tab, Escape et retour au trigger                                                 | 1 → 1             | high      |
| surface 3000: skip link and reduced motion                                | focus lien d'évitement, URL #main, transition 0s                                                                          | 0 → 0             | medium    |
| surface 3001: renders and passes automatic accessibility checks           | heading, avertissement DEV, capture, largeur sans débordement                                                             | 1 → 1             | medium    |
| surface 3001: keyboard dialog focus and persistent labels                 | dialogue visible, 3 focus, saisie, Shift+Tab, Escape et retour au trigger                                                 | 1 → 1             | high      |
| surface 3001: skip link and reduced motion                                | focus lien d'évitement, URL #main, transition 0s                                                                          | 0 → 0             | medium    |

Total : **20 analyses axe par profil, 40 sur le run complet**, avec les mêmes tags WCAG 2/2.1/2.2 A/AA. Chaque analyse exige toujours zéro violation. Les matchers ont aussi été recensés via AST TypeScript avant/après puis confrontés au diff.

Deux déplacements d'assertions sont explicites :

- `expect(response.ok).toBe(true)` de la préparation Auth devient une erreur bloquante dans `SupabaseFixture.request` sur tout HTTP non-2xx ; les appels, identités et payloads restent équivalents.
- Les deux assertions de `expectConfirmationSession` (307 et cookie Supabase) sont maintenant visibles dans chacun des scénarios recovery/invitation.

Les assertions axe anciennement inline ou via helper passent par un seul helper équivalent. Aucune assertion métier/sécurité/a11y supprimée ; aucun skip, suppression de scénario, délai arbitraire ou retry ajouté.

## Objets et préparation

Six Page Objects : FoundationPage, LoginPage, RecoveryPage, PasswordPage, InvitationPage, ProSpacePage. Un Component Object : Dialog, partagé Citizen/Pro. Aucun héritage ni objet global.

Fixtures à portée test : objets UI, fabrique foundation par port, préparation Supabase, comptes recovery/login/admin. Les cookies du contexte Playwright sont isolés par test ; les comptes sont les mêmes lanes seed qu'avant ; chaque invitation utilise UUID/email unique. Aucun service_role ne traverse le navigateur ni le chemin métier ordinaire. La configuration est toujours écrite par fetch navigateur authentifié.

Les erreurs/status utilisent désormais les rôles dans `main`, les champs des rôles/labels et le dialogue une portée sémantique. Aucun hook de test ni texte utilisateur ajouté. Les noms français sont centralisés dans les POM pour préparer C, sans infrastructure i18n anticipée.

## Tags et contrôles exécutables

Metadata statique `tag` : criticité au test, route/composant en suites, types optionnels contrôlés. Les titres des 13 scénarios restent lisibles et identiques.

Trois règles locales dans `tooling/eslint/conventions.mjs` :

1. `e2e-metadata` : une criticité, tags valides, portée suite/test, dimensions requises, callback explicite, pas de metadata dynamique/spread ou d'alias de déclaration cachant les tags.
2. `e2e-execution` : focus et équivalents usuels, skip/fixme, waitForTimeout refusés ; aucune exception actuellement approuvée, désactivation inline interdite.
3. `production-boundaries` : debug log/debug/trace, gtag/dataLayer/providers connus et imports de tests/fixtures interdits dans le produit ; diagnostics outillage et warn/error bas niveau restent possibles.

`forbidOnly: true` fonctionne aussi en local ; `retries: 0` et deux workers/profils sont conservés. Les garde-fous d'architecture existants n'ont pas été remplacés ni affaiblis. La CI existante passe déjà par `pnpm lint` et les tests unitaires ; aucun nouveau workflow ni système de gates créé.

Les contrôles sont syntaxiques et proportionnés, pas une preuve exhaustive contre toute indirection dynamique. Pas d'adaptateur analytics vide, pas de logger anticipé, pas de scanner d'artefact complet.

## Inventaire des fichiers

Créés :

- `e2e/pages/foundation.page.ts`
- `e2e/pages/login.page.ts`
- `e2e/pages/recovery.page.ts`
- `e2e/pages/password.page.ts`
- `e2e/pages/invitation.page.ts`
- `e2e/pages/pro-space.page.ts`
- `e2e/components/dialog.ts`
- `e2e/fixtures/test.ts`
- `e2e/fixtures/supabase.ts`
- `e2e/helpers/ui.ts`
- `e2e/helpers/session.ts`
- `tooling/eslint/conventions.mjs`
- `packages/types/src/conventions.test.ts`
- `docs/architecture-decisions/009-e2e-conventions.md`
- `docs/kb/technical/testing.md`
- `docs/quality/phase-2bis-b-report.md`

Modifiés :

- `e2e/auth.spec.ts`, `e2e/foundation.spec.ts` : extraction, regroupement, tags, assertions conservées.
- `eslint.config.mjs` : branchement des trois règles sans remplacer les règles d'architecture.
- `playwright.config.ts` : forbidOnly toujours actif.
- `AGENTS.md`, `README.md`, `docs/README.md` : statut A approuvé/B actif et liens.
- `docs/architecture-decisions/008-knowledge-governance.md`, `docs/architecture-decisions/README.md` : acceptation A tracée et ADR-009 proposée.
- `docs/kb/README.md`, `docs/kb/technical/README.md` : première fiche technique active.
- `docs/quality/documentation-policy.md` : état d'implémentation des conventions B.
- `docs/references/current/ActiCiv_Phase2bis_Launch_Index.md` : autorisation B explicite.
- `docs/skills/README.md` : mécanismes disponibles pour les Skills concernés ; playbooks complets toujours prévus en G.

Aucun déplacement, suppression, migration, fichier applicatif, lockfile, dépendance ou workflow CI modifié. DoD et checklist PR restent adaptées et inchangées ; pas de modification cosmétique inutile.

## Validations réellement exécutées

- Test-first : 42 cas invalides échouaient avant les règles, 3 cas positifs passaient ; après implémentation, 45/45 PASS. Revue complémentaire : 5 contournements supplémentaires exposés par tests rouges avant correction.
- Première exécution E2E : 16 PASS / 10 FAIL. Cause : locator alert trop large, incluant l'annonceur Next.js. Correction limitée au scope main des POM ; nouvelle exécution complète : **26 PASS**, aucun retry, en 19,5 s.
- `pnpm verify` : format, lint, typecheck, 70 unités alors présentes, builds Citizen/Pro et garde-fou bundles clients PASS avant ajout des cinq tests complémentaires. Contrôles finaux sur ces ajouts à compléter ci-dessous.
- `pnpm test:integration` : **8 tests Node + 4 tests avec vrais adaptateurs PASS**, zéro skip.
- Supabase local réel : Docker arrêté initialement, démarré puis stack existante reprise. Aucun db reset/rebuild, aucune suppression de volumes. Échec initial sous sandbox dû à la télémétrie CLI puis daemon absent ; corrigé par l'accès autorisé et le démarrage local, pas par un mock.
- Validation finale `pnpm verify` : **PASS**, format/lint/types, **75 unités dont 50 cas de conventions**, builds Citizen/Pro et contrôle existant des bundles clients. Les 25 unités préexistantes restent présentes.
- Gitleaks 8.30.1 sur le candidat : **PASS**, 243 fichiers et contenu XML/texte des deux DOCX, aucune nouvelle exception de scan. Le scan de l'historique sera confirmé sur le commit local de revue dans le retour de livraison.
- Documentation : **PASS**, 50 fichiers Markdown, 240 liens locaux valides et aucun doublon de référence/preuve détecté. Frontmatter de la fiche testing et chemins code/tests relus.
- `git diff --check` : **PASS** ; inventaire et diff revus, aucun changement applicatif/DB/dépendance.
- Inspection ponctuelle de 307 fichiers JS/JSON compilés serveur/client : aucun marqueur des nouvelles fixtures/POM ; ce contrôle ciblé ne prétend pas remplacer le futur scanner d'artefact complet.
- Sélections Playwright réellement vérifiées avec `--list --grep` : critical = 12, auth = 12, dialog = 4, critical + auth = 10, smoke = 6. Aucun filtre appliqué au run complet.

Matrice finale : contrôles applicables **PASS**, aucun **FAIL** ni **DEFERRED** restant dans le périmètre de B. Reconstruction DB, i18n, couverture, nouveaux contrôles lecteur d'écran et CI distante de clôture : **NOT APPLICABLE** à ce checkpoint et non présentés comme réalisés. Les essais rouges et l'échec initial E2E restent tracés ci-dessus ; le succès final ne provient pas de retries.

## Limites et suite

Aucun nouveau résultat VoiceOver/TalkBack prétendu : UI produit inchangée, preuves manuelles Phase 2 conservées. Les 40 analyses axe et les assertions clavier ne remplacent pas un contrôle lecteur d'écran sur une future évolution UI.

Ce checkpoint n'est pas une release complète de Phase 2 bis : aucune nouvelle CI distante, promotion PROD, reconstruction DB ou preuve de pentest revendiquée. Un commit local de revue, s'il est créé, sera identifié dans le retour de livraison sans auto-référence dans son propre contenu.

ADR-009 et 2bis-B attendent la revue explicite de Patrick. **STOP : aucune 2bis-C commencée, aucune Phase 3 commencée.**
