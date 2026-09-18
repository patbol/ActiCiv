# ADR-010 — Internationalisation, locales et traductions

Statut : proposée pour revue de 2bis-C. Implémente les principes déjà approuvés par Patrick ; ne supersède aucune ADR. ADR-008 et ADR-009 sont approuvées par son autorisation de C.

## Contexte et impact

Baseline C : `7d43c1b8b3ece14cb6df03f4a445030cbbec326b`, branche `phase-2bis-engineering-foundations`, arbre propre. La UI était française, sans catalogue, préférence ou traduction des référentiels. Langue d’interface, locale BCP 47 et timezone IANA sont distinctes. Les garanties tenancy, SLA/DST et audit des ADR 004, 006 et 007 restent applicables.

Impact map : choix de langue → résolution pure → Auth professionnelle et configuration existante → colonnes/RLS/RPC → use cases/adaptateurs → SSR et catalogues → tests SQL/intégration/E2E → KB et preuves. Aucun signalement, routage ou parcours Phase 3.

## Décision

`next-intl` **4.14.5**, dépendance runtime des deux applications, est compatible avec les versions réellement installées Next **16.3.5**, React **19.3.0**, Node **24.21.0**. Les peerDependencies du registre ont été vérifiées avant installation. Aucun outil existant ne gérait catalogues et résolution App Router ; `Intl` seul couvre les formats. Installation exacte, lockfile versionné, aucune autre dépendance directe externe.

Intégration [App Router](https://next-intl.dev/docs/getting-started/app-router), sans middleware de routage ni préfixe. `/`, `/auth/*`, `/espace`, API et liens profonds restent inchangés. Résolution par requête via `getRequestConfig` ; React `cache` déduplique la projection Pro dans une seule requête. Aucun cache global ou `unstable_cache` de préférence utilisateur. Rendu dynamique, privé et non stockable ; `html.lang` vaut la locale effective.

Deux locales : `fr-FR`, `en-GB` ; fallback `fr-FR`. Le module pur `packages/shared/src/locale.ts` expose les politiques et formats indépendamment de Next/HTTP :

- Citizen : cookie explicite valide → négociation navigateur → contexte territoire réellement fourni → fallback. Aucun territoire Citizen n’existe actuellement : l’adaptateur ne l’invente pas.
- Pro : profil explicite → organisation → cookie explicite → négociation navigateur → fallback. `NULL` rétablit l’héritage ; aucune négociation navigateur n’écrit implicitement en DB.
- `Accept-Language` : qualité numérique, ordre stable, langues supportées uniquement ; variantes régionales fr/en vers les deux locales prises en charge. Wildcard sans préférence laisse agir le fallback. Entrées malformées et qualités nulles ignorées.
- Cookie `acticiv-locale`, un an, host-only, HttpOnly, SameSite=Lax, Secure en HTTPS. Une origine hôte commune en DEV partage ce cookie entre ports ; la priorité DB Pro reste indépendante.
- Pro authentifié avec contexte actif : préférence en DB exclusivement. Une identité invitée Auth sans profil actif ne peut changer que son cookie d’interface, sans écriture métier. Déconnexion : aucun transfert implicite de cette préférence vers le cookie public. Le professionnel peut choisir le défaut organisation.

Le sélecteur partagé est un `select` natif, options autonymes avec `lang`, label traduit, option d’héritage Pro, retour de sauvegarde annoncé. L’API de même origine met à jour la préférence puis `router.refresh` conserve l’URL, le composant client et les saisies. Le focus initial Auth dépend de l’entrée dans l’écran ou du type de message, pas de sa traduction.

## Catalogues et coût

Quatre domaines (`common`, `foundation`, `dialog`, `auth`) par locale dans `packages/shared/src/messages/`. Clés sémantiques, même inventaire contrôlé par test. Chargement côté serveur. Les composants client reçoivent des libellés traduits ; le provider client ne reçoit que les trois messages de la boundary d’erreur. Aucun catalogue complet transmis au navigateur. C’est l’approche de [composition serveur/client recommandée](https://next-intl.dev/docs/environments/server-client-components).

Le coût attendu comprend le runtime client next-intl pour la boundary d’erreur et le sélecteur React ; le delta effectif est consigné dans le rapport C, sans budget bloquant. Les dépendances transitives SWC/watcher servent notamment aux outils d’extraction non utilisés : leurs scripts d’installation sont explicitement refusés dans `pnpm-workspace.yaml`. Aucun extracteur ni watcher de traductions n’est activé. Les builds réels vérifient ce choix. Préférer des props seules partout aurait évité le provider client, mais n’aurait pas donné accès aux traductions à une boundary `error.tsx` instanciée par Next.

`Intl.DateTimeFormat` exige une timezone explicite dans notre helper ; nombres, temps relatifs et catégories plurielles dépendent de la locale. Aucun calcul SLA/DST n’est modifié. Les noms propres d’organisations/services ne sont pas traduits.

## Données, écriture et audit

Migration additive `20260918000100_locales.sql` :

- `organization_settings.default_locale` NOT NULL, défaut `fr-FR`, CHECK ;
- `professional_profiles.preferred_locale` nullable, CHECK ;
- `vertical_translations`, `category_translations`, `hold_reason_translations` avec ID technique, FK, locale/label requis et unicité entité + locale ; dimensions non nullables ; FK composite tenant/motif pour les motifs d’attente.

Les champs historiques français `name`/`label` restent **la source d’écriture française** pendant la transition. Un trigger synchronise la ligne `fr-FR` dans la transaction de chaque création/modification, y compris les RPC historiques. Une écriture française via la nouvelle RPC modifie la source ; une tentative de divergence directe est refusée. Les traductions anglaises ont leur propre écriture contrôlée. Fallback d’affichage : traduction demandée puis champ historique ; le code/ID ne change jamais.

Backfill français exact lors de la migration, sans ajouter de limite de longueur aux labels historiques (la contrainte non vide reste). Le seed ajoute l’anglais des seuls référentiels synthétiques actuels. Les données existantes hors seed restent inchangées, sans traduction inventée. Aucune extension de contrat/catégorie couverte.

Audit SQL transactionnel existant étendu par liste blanche aux deux préférences et aux traductions ; acteur serveur et `correlation_id` conservés. Un échec d’audit annule l’écriture et les effets des triggers. Aucun log/analytics ajouté, aucune interface d’audit séparée.

## Sécurité et architecture

- `get_locale_preferences()` : projection de deux valeurs du professionnel actif, identité dérivée d’Auth, sans paramètre de cible. Ne donne aucun SELECT supplémentaire sur les settings.
- `set_preferred_locale(locale)` : profil/membership/organisation actifs ; aucune cible utilisateur/tenant fournie. RLS interdit les UPDATE directs.
- `set_organization_locale(org,locale)` : `client_admin` actif de l’organisation, rôle existant de configuration. Ni agent ni supervisor ni metadata Auth ne deviennent administrateurs.
- `save_reference_translation` : `catalog.manage` plateforme pour vertical/catégorie ; administrateur du tenant réel du motif. Lectures RLS identiques au référentiel parent, aucune exposition Citizen inventée.
- DTO strict pour la préférence propre et les nouvelles commandes ; contrôle Origin sur les écritures HTTP ; erreurs techniques non exposées par ces endpoints.
- Module locales : application via ports `LocalePreferences`/`TranslationWriter`, adaptateurs Supabase/RPC ; composition et DTO dans `platform/`. Le domaine de résolution est partagé pur. Aucune dépendance Next/Supabase/HTTP dans domain/application.

## Emails : limite explicite

Les templates Supabase invite/recovery et sujets actuels restent français. Les [variables officielles](https://supabase.com/docs/guides/auth/auth-email-templates) donnent `.Data` (metadata Auth), pas la projection profil/organisation de notre politique. La récupération anonyme n’a pas de contexte professionnel fiable ; une invitation précède le profil. Ajouter un flag arbitraire au lien ou recopier une préférence asynchrone dans Auth ne garantirait pas la langue du destinataire et créerait une deuxième vérité.

Point futur : un mécanisme d’envoi serveur approuvé (par exemple Send Email Hook) résolvant le destinataire et son organisation, avec contrat explicite avant activation du profil, sujet et corps cohérents, tests réels. Aucun service email ni synchronisation Auth ad hoc n’est ajouté dans C. La navigation ouverte depuis l’email, elle, utilise la politique UI.

## Alternatives et conséquences

- Préfixes URL : rejetés par décision produit explicite.
- Locale dans localStorage seul : invisible au SSR, flash initial et hydratation possibles.
- Tout dans metadata Auth : non conforme à l’héritage organisation et à l’écriture transactionnelle auditée.
- Ouvrir tous les settings aux agents : excès de droits ; projection ciblée retenue.
- Doubler les sources françaises : risque de divergence ; source historique et trigger retenus jusqu’à une future migration approuvée.
- Tables de traduction pour tous les noms propres : sans besoin ; limité aux trois référentiels existants.

Les métadonnées localisées sont rendues avant le contenu via [htmlLimitedBots](https://nextjs.org/docs/app/api-reference/config/next-config-js/htmlLimitedBots) appliqué à tous les user agents : le streaming séparé avait exposé un document sans titre lors des parcours Auth (régression axe réellement reproduite). Le délai inclut la résolution déjà nécessaire au layout, dédupliquée par requête.

La page d’accueil auparavant statique devient dynamique pour respecter cookie/négociation dès le premier HTML. Coût serveur à surveiller ; mesure initiale seulement, aucun chantier performance/gates de D/E.

## Tests, migration et récupération

Tests RED puis GREEN sur résolution, droits applicatifs, SQL absent avant migration ; régressions navigateur pour focus, persistance et SSR. PgTAP, vrais JWT/adaptateurs, refus cross-user/tenant, données Auth forgées, rollback d’audit, conservation des référentiels/contrats, reconstruction complète + seed. Les 13 scénarios historiques et leurs assertions sont conservés, avec locale de test française explicite ; nouveaux scénarios exercés aussi sur mobile, retries zéro.

Déploiement : migration d’abord, puis applications. Ancienne application compatible avec les colonnes/tables additives. Retour applicatif possible vers B sans supprimer les nouvelles données. En cas de problème de données : conserver sauvegarde et audit, corriger par migration forward ; ne pas effacer traductions/préférences via un down destructif. Les anciennes migrations restent immuables.

Références : [KB technique](../kb/technical/internationalisation.md), [KB métier](../kb/business/language-preferences.md), [rapport C](../quality/phase-2bis-c-report.md).

## Décision ultérieure — statut courant

Acceptée explicitement par Patrick au lancement de D. Le texte de proposition demeure historique ; aucune décision acceptée n’est réécrite. Voir l’[audit des statuts](README.md).
