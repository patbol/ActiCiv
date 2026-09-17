# Phase 2 bis — checkpoint 2bis-C

Verdict : **READY FOR PATRICK REVIEW**. C-VO-01 à C-VO-05 sont validés manuellement par Patrick le 18 septembre 2026. Les contrôles automatiques finaux passent, sans retry. TalkBack reste DEFERRED faute d’appareil Android connecté. Aucun 2bis-D ni Phase 3 commencé. La validation VoiceOver ne vaut pas approbation globale ni clôture du checkpoint.

## 1–2. HEAD et état Git initiaux

HEAD `7d43c1b8b3ece14cb6df03f4a445030cbbec326b`, branche `phase-2bis-engineering-foundations`, origin fetch/push `https://github.com/patbol/ActiCiv.git`. Dossier `/Users/patrickmoreno/ActiCiv/dev/acticiv`. Arbre, diff et diff-check initialement propres. Runtime effectivement chargé par nvm dans les shells : Node `v24.21.0`, pnpm `11.19.0`.

A/B et ADR-008/009 approuvés par Patrick. Livre v1.4, prompt/checklist v1.2, AGENTS, gouvernance, ADR et KB testing relus. La décision explicite C remplace la précédente borne B. La baseline Phase 2 CLOSED `fac0fc8663d1f32b09b720fddffd46f0829c8a6a` reste historique.

Le candidat C est actuellement dans l’arbre de travail, sur ce parent ; ni commit final C ni preuve GitHub Actions C n’est revendiqué. Les résultats ci-dessous concernent réellement cet arbre local. Les scripts `verify`, `verify:full` et `release:verify --rebuild-db` sont conservés ; une release ultérieure exigera son propre SHA propre/local/CI.

## 3–6. Dépendances, ADR, politique et catalogues

| Élément                            | Résultat                                                                                                                                                |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dépendance directe                 | `next-intl` **4.14.5**, runtime Citizen/Pro, version exacte                                                                                             |
| Compatibilité vérifiée avant ajout | peers Next 12–16 et React jusqu’à 19 ; dépôt réel Next **16.3.5**, React **19.3.0**, Node **24.21.0**                                                   |
| Justification                      | Intl existant couvre les formats, pas les catalogues ni l’intégration SSR App Router                                                                    |
| Autres dépendances directes        | aucune externe ; backend référence le workspace shared pour la politique pure                                                                           |
| Transitifs                         | lockfile conservé ; +25 paquets installés ; scripts SWC/watcher optionnels explicitement refusés, extraction non activée ; builds réels réussis         |
| Décision                           | [ADR-010](../architecture-decisions/010-internationalisation-locales.md), proposée pour revue C ; ADR-009 non réécrite, approbation tracée dans l’index |
| Citizen                            | explicite cookie → navigateur négocié → contexte territoire disponible → `fr-FR` ; aucun contexte Citizen fabriqué                                      |
| Pro                                | profil → organisation → cookie → navigateur → `fr-FR` ; NULL rétablit l’héritage                                                                        |
| Séparation                         | langue ≠ locale ≠ timezone ; formats Intl avec fuseau explicite ; règles SLA/DST inchangées                                                             |
| Catalogues                         | `packages/shared/src/messages/{fr-FR,en-GB}/{common,foundation,dialog,auth}.json`, clés sémantiques et parité testée                                    |

[KB technique](../kb/technical/internationalisation.md) et [fiche métier du choix de langue](../kb/business/language-preferences.md) décrivent le comportement réellement implémenté et les droits. Impact map : préférence → règles pures → identité/contexte → use cases/ports → DB/RLS/RPC → SSR/UI → tests → audit atomique → KB/ADR. Aucun nouvel analytics ni chantier logger.

## 7–10. Migration, schéma, droits et backfill

Nouvelle migration **`20260918000100_locales.sql`**. Les neuf migrations SQL déjà publiées sont inchangées, comparaison binaire avec HEAD effectuée.

- `organization_settings.default_locale` NOT NULL, défaut `fr-FR`, CHECK des deux locales.
- `professional_profiles.preferred_locale` nullable, CHECK ; NULL = héritage.
- `vertical_translations`, `category_translations`, `hold_reason_translations` : FK entité, locale et label requis, unicité entité+locale (dimensions non nullables), FK composite organisation/motif.
- `get_locale_preferences()` expose uniquement les deux préférences du professionnel actif. Aucun élargissement SELECT des settings.
- `set_preferred_locale` dérive son seul utilisateur d’Auth ; DTO strict sans cible user/tenant. `set_organization_locale` exige un client admin du tenant réel.
- `save_reference_translation` exige `catalog.manage` pour le catalogue global, ou configuration du tenant réel du motif. RLS des traductions alignée sur celle des référentiels parents.
- Chemins applicatifs `setOwnLocale`, `setOrganizationLocale`, `saveHoldTranslation`, `saveCatalogTranslation` via ports/adaptateurs. Les RPC refont leurs contrôles ; metadata Auth falsifiée sans effet.

Backfill français exact depuis les historiques ; champs `name`/`label` conservés et autoritaires pendant la transition. Trigger de synchronisation, contrôle anti-divergence, même contrat via RPC historique ou nouvelle RPC. Anglais du seed : une verticale, cinq catégories, motif synthétique des trois organisations. Aucune traduction arbitraire de contenu personnalisé, aucun changement d’ID/code/contrat/scope.

Les whitelists d’audit incluent préférences et traductions ; acteur réel et corrélation conservés. Échecs d’audit testés en SQL et via adaptateur réel : rollback de la préférence et des effets de synchronisation.

**Upgrade réel avant reset : PASS.** Snapshot JSON déterministe des verticales/catégories/motifs/liens de catégories contractuelles avant puis après `supabase migration up --local` : identiques. Tests SQL du backfill sur cette base : 33 assertions initiales PASS. **Reconstruction depuis zéro + seed : PASS**, dix migrations appliquées. Les tests renforcés après reconstruction comprennent aussi anglais du seed, membership/organisation inactifs, default NOT NULL et compatibilité de longueur des labels. La migration finale a aussi été réappliquée sur le schéma B reconstruit, avec seed B et libellé historique de 250 caractères : données historiques inchangées et traduction française exacte, puis reset final + seed C.

Ordre de déploiement : DB additive puis applications. Retour applicatif B compatible ; récupération DB par correctif forward/sauvegarde, sans supprimer audits ni traductions. Voir ADR-010.

## 11–14. UI, SSR et emails

Citizen et Pro disposent du même sélecteur natif avec label, autonymes, focus visible, cible de 44 px, état et confirmation/échec annoncés. Citizen et Pro anonyme persistent un cookie HttpOnly, SameSite=Lax, Secure en HTTPS ; Pro actif persiste uniquement son profil et propose le retour au défaut organisation.

URLs et deep links inchangés, aucun préfixe locale. Sessions/cookies Auth conservés ; saisies de connexion et focus conservés lors du changement. Le montage tardif d’un titre Auth ne vole plus le focus au sélecteur. L’échec de sauvegarde conserve l’ancienne préférence et permet une nouvelle tentative.

Le SSR connaît la locale : `html.lang`, métadonnées, pages de fondation, Auth/espace, loading, erreurs/404, dialogue et erreurs API sont localisés. Tests de requêtes concurrentes fr/en, cookie invalide, absence, wildcard, fallback et absence de fuite entre requête authentifiée/visiteur. Résolution Pro dédupliquée seulement dans la requête React. Rendu privé/no-store, aucun cache global de préférences.

Le streaming séparé des métadonnées avait produit une violation axe de titre absent ; il est désactivé pour rendre le titre avec l’écran. Les assertions historiques axe sont conservées et passent après correction.

**Emails : limite documentée, pas une preuve de localisation réalisée.** Templates et sujets Supabase invite/recovery restent français. `.Data` contient les metadata Auth, pas la politique profil/organisation ; récupération anonyme et invitation sans profil empêchent une sélection fiable du destinataire avec le seul template existant. Point futur proposé : envoi serveur/hook approuvé, résolution destinataire/organisation et tests sujet+corps. Aucun service email artificiel ajouté, conformément au §24 de l’autorisation C.

## 15–18. Tests ajoutés et accessibilité

| Suite              | Ajout C / preuve                                                                                                                                                                                                      |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unitaires          | **23 nouveaux**, total **98** : négociation/priorités/fallback/Intl/labels stables, parité catalogues, droits des use cases                                                                                           |
| Test-first         | RED import manquant pour résolution/préférences/traductions, puis GREEN ; SQL RED colonne absente avant migration ; focus et titre reproduits par E2E avant correction                                                |
| SQL/RLS            | **42 nouvelles assertions**, total **126** : backfill, contraintes, tenant/roles, profil propre, héritage, moindre privilège, identité active, audit/rollback                                                         |
| Intégration réelle | **4 nouvelles**, total **16** (8 Node + 8 Vitest) : Auth réelle, DTO/cross-user/tenant, metadata forgée, projection, adaptateurs de traduction, audit atomique ; tests de concurrence/invitations existants conservés |
| E2E historiques    | 13 scénarios / **26 exécutions conservées** ; fichiers `auth.spec.ts` et `foundation.spec.ts` inchangés ; POM français identique par défaut, locale test explicite                                                    |
| E2E i18n           | **6 scénarios / 12 exécutions nouvelles** ; total **38**, desktop + mobile, retries **0**, aucun skip                                                                                                                 |
| Axe                | **58 analyses réussies** dans ce rejeu (40 historiques + 18 nouvelles), clavier/focus/labels/état et reprise après échec                                                                                              |
| VoiceOver          | **PASS** : C-VO-01 à C-VO-05 validés par Patrick le 18 septembre 2026 ; précondition Pro connecté clarifiée pour C-VO-05                                                                                              |
| TalkBack           | **DEFERRED distinct** : `adb devices -l` ne retourne aucun appareil ; aucune preuve Android inventée                                                                                                                  |

Les nouveaux scénarios couvrent Citizen/persistance/clavier, échec-reprise, SSR/métadonnées/404/API locale, Pro anonyme/formulaire/navigation Auth, professionnel/session/reconnexion/héritage et invité Auth sans profil actif (cookie seul, aucun accès métier accordé). Ils utilisent le Component Object locale et les POM existants étendus par locale, sans importer les traductions de production comme oracle d’assertion. Les comptes préférences sont isolés et remis à NULL avant/après test.

[Protocole et résultat manuel](phase-2bis-c-voiceover.md). La session locale du 18 septembre conserve une empreinte des sources et les BUILD_ID hors Git ; les identifiants du compte fictif dédié ne sont pas versionnés.

## 19. Delta des bundles/builds

Mesure avant modification sur les `.next/static` de B, puis après le build C final. Somme des fichiers JS, sans double comptage au sein d’une application ; gzip calculé fichier par fichier avec mtime zéro. Ce n’est ni le transfert d’une route unique ni une mesure de performance utilisateur.

| Application | JS B → C (octets) | Delta JS | Gzip B → C (octets) | Delta gzip        |
| ----------- | ----------------- | -------- | ------------------- | ----------------- |
| Citizen     | 662 213 → 726 645 | +64 432  | 205 805 → 225 534   | +19 729 (+9,59 %) |
| Pro         | 673 008 → 737 006 | +63 998  | 210 092 → 229 842   | +19 750 (+9,40 %) |

13 → 16 chunks Citizen, 15 → 18 Pro. Coût attendu du runtime client i18n pour la boundary d’erreur et du contrôle React ; les catalogues complets restent serveur, le provider client reçoit seulement trois messages d’erreur. Les pages dépendant de la locale passent en rendu dynamique ; résolution Pro ajoute une projection privée et sa vérification Auth. Aucun budget bloquant, instrumentation coverage ou scanner complet ajouté.

## 20. Validations réellement exécutées

| Contrôle                                  | Résultat                                                                                           |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `pnpm verify:full` (inclut `pnpm verify`) | **PASS**, code sortie 0                                                                            |
| Prettier / ESLint / TypeScript strict     | **PASS**                                                                                           |
| Unitaires / architecture / conventions    | **PASS**, 98                                                                                       |
| Upgrade existant / backfill / comparaison | **PASS**                                                                                           |
| `pnpm db:reset` + seed                    | **PASS**                                                                                           |
| pgTAP/RLS                                 | **PASS**, 126                                                                                      |
| Intégration Auth/RPC/adaptateurs          | **PASS**, 16                                                                                       |
| Builds Citizen/Pro et `verify:bundles`    | **PASS**                                                                                           |
| Playwright complet / axe                  | **PASS**, 38 exécutions, 58 analyses axe, zéro retry                                               |
| `pnpm audit --audit-level high`           | **PASS**, aucune vulnérabilité connue renvoyée                                                     |
| Gitleaks de `verify:full`                 | **PASS**, historique des 9 commits du HEAD initial, contrôles positif/négatif du détecteur réussis |
| Liens documentation                       | **PASS**, aucun lien local cassé lors du contrôle                                                  |
| `git diff --check`                        | **PASS**                                                                                           |

Journaux : [verify:full](../evidence/phase2bis/2bis-c-validation.txt), [reconstruction DB](../evidence/phase2bis/2bis-c-db-reset.txt), [upgrade et compatibilité des labels](../evidence/phase2bis/2bis-c-upgrade.txt). Ils décrivent un arbre local non commité ; `SECRET_SCAN_SHA` dans le journal identifie l’historique scanné, pas une release du candidat C. Un scan distinct des fichiers candidats a détecté uniquement ce même SHA Git sous la clé `SECRET_SCAN_SHA` : faux positif confirmé par `git rev-parse HEAD`. Une allowlist de la seule règle `generic-api-key`, limitée à ce SHA exact et à ce fichier exact, conserve le journal brut sans neutraliser les autres détecteurs. Le scan des fichiers candidats a ensuite été rejoué sans finding. Un contrôle positif injecté uniquement dans un fichier temporaire au même chemin a confirmé qu’une autre clé API synthétique reste détectée.

Échecs intermédiaires expliqués : Turbopack a conservé l’échec d’ouverture de port sandboxé (résolu en reconstruisant les caches générés dans l’environnement autorisé) ; le test FK heurtait d’abord l’unicité d’une traduction seed (fixture isolée pour exercer réellement la FK) ; focus Auth lors du switch et titre transitoirement absent (corrections produit + régression). La relecture a aussi reproduit puis corrigé le choix de langue d’une identité invitée sans profil actif et le rejet indu d’un label historique long. Aucun échec n’a été masqué par retry ou suppression de test.

## 21–25. FAIL, DEFERRED, limites et arrêt

- **FAIL automatique restant : 0.**
- **FAIL manuel restant : 0.** VoiceOver C-VO-01 à C-VO-05 validés par Patrick. Le signalement C-VO-05 concernait l’absence attendue de l’héritage après déconnexion ; clarification du protocole et confirmation explicite, sans changement de code applicatif.
- **DEFERRED environnement : TalkBack**, aucun Android connecté.
- **Limite autorisée : emails localisés par destinataire non réalisés**, traitement futur documenté et aucun résultat inventé.
- **NOT APPLICABLE à C :** UI d’administration linguistique complète, nouveau contexte territorial Citizen, changements SLA/DST/routage, coverage/snapshots/gates complets, Semgrep/ZAP, analytics/logger, Quality Center, budget performance bloquant.
- **NOT APPLICABLE à cette validation locale :** déploiement PROD, promotion du même artefact, preuve CI d’un nouveau SHA. Une release ne peut pas être déduite de ce checkpoint.

Dette explicite : fallback français pour référentiel sans anglais ; source historique française conservée ; politique linguistique des emails à traiter ; coût du rendu dynamique et du provider à surveiller. Aucun comportement métier Phase 3 créé. **STOP avant 2bis-D ; aucune Phase 3 commencée.**
