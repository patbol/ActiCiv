# ActiCiv — Postmortem Phase 2

Audit et rédaction : 16–17 septembre 2026. État du code : commit conservé localement, rapport non commité.

## 1. Synthèse

**État : Phase 2 implémentée, validation locale réussie, clôture non acquise.** Le commit conservé est `e389396945ac869ce6c342678d18577693fc2c96`. Il reste local, sans publication ni modification de son contenu pendant cet audit. Aucune Phase 3 n'a été commencée.

Ce rapport confronte la checklist transmise par Patrick, les décisions versionnées et les fichiers/tests réellement présents. Il corrige la portée trop générale de certaines affirmations du [rapport d'implémentation](../../quality/phase-2-report.md). Les 17 tests unitaires, 69 assertions SQL, quatre scénarios d'intégration et 20 tests Playwright ont réussi sur ce SHA ; ils ne couvrent pas tous les critères demandés.

Les écarts principaux sont : protection du dernier administrateur insuffisamment éprouvée sous concurrence ; contrôle automatique des dépendances HTTP absent ; séparation hexagonale incomplète de certaines opérations critiques ; absence d'identifiant de corrélation de requête dans l'audit ; tests incomplets des pannes d'invitation, de récupération du mot de passe et de publication successive des SLA ; accessibilité partiellement vérifiée. Les preuves CI, reconstruction complète rattachée au SHA et livraison finale restent à obtenir.

**Convention de lecture :** PASS signifie que la preuve citée démontre exactement le critère formulé. Une lecture de migration démontre une structure, pas tous ses comportements concurrents. FAIL signifie exigence non satisfaite ou test requis absent. DEFERRED signifie validation extérieure/manuelle ou preuve de livraison encore en attente ; cela ne vaut jamais succès.

Les trois pièces suivantes accompagnent ce document sans modifier le commit audité :

| Référence | Preuve et limites                                                                                                                                                                                                                                                                                                                                                                    |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| L         | [Journal intégral `release:verify`](raw/phase2-e389396-release-verify.log), copie textuelle normalisée de `/private/tmp/acticiv-phase2-e389396-local.log`, avec marqueur `LOCAL_VALIDATED_SHA`. SHA-256 du journal brut original : `5d63953556511208c32e8feeb34727b93284cf665d9f96728377ea9823309566`. Le journal ne contient pas de démarrage depuis une base vide ni de reset. |
| D         | [Métadonnées de la base locale](raw/phase2-database-metadata.txt), relevées en lecture seule pendant l'audit : versions, migrations appliquées, policies, RLS, unicités, présence des triggers. Elles décrivent la base observée, sans remplacer une reconstruction.                                                                                                             |
| R         | [Runtime, Git et sondes ESLint](raw/phase2-audit-runtime.txt), relevés avant création du rapport. Les sondes utilisent `ESLint.lintText` en mémoire, sans ajouter de fichier source.                                                                                                                                                                                             |

Les sorties jointes ont uniquement leurs fins de ligne et espaces terminaux normalisés pour éviter les défauts de whitespace Git ; aucun résultat ni valeur n’a été retiré. SHA-256 du journal L joint après cette normalisation : `aecd1564f6ac2a2c73a57f12fa558932b47f57a29b99edda536c20c719cb8da5`. Le journal brut original reste inchangé hors dépôt.

Les preuves de tests citées plus bas sont les sources au SHA audité, avec leur succès d'exécution dans L : [SQL principal](../../../supabase/tests/phase2.sql) (« S1 »), [SQL limites](../../../supabase/tests/phase2_edge_cases.sql) (« S2 »), [intégration réelle](../../../integration/security.test.mjs) (« I »), [E2E Auth](../../../e2e/auth.spec.ts) (« E »), [E2E Phase 1](../../../e2e/foundation.spec.ts) (« E1 »). Les chemins indiqués dans les tableaux sont relatifs à la racine du dépôt. Les migrations M1 à M8 sont identifiées en section 6.

## 2. Objectifs Phase 2

La Phase 2 construit les fondations Core Data & Security du monolithe : professionnels, organisations, services, autorisations, catalogue, contrats et territoires, horaires/SLA versionnés, Auth sur invitation et audit transactionnel. Elle ne construit aucun workflow de signalement.

Les arbitrages de [ActiCiv_Phase2_Decisions.md](../../references/historical/ActiCiv_Phase2_Decisions.md) restent verrouillés : un professionnel appartient à une organisation, plusieurs services possibles, rôles distincts, supervision portée par `service_memberships`, contrats contrôlés par la plateforme, quatre scopes SLA et ordre de spécificité futur, horaires explicites et conventions DST. Il n'est pas demandé de réarbitrer ces règles.

Les précisions finales approuvées imposent l'unicité réelle des scopes nullable, l'absence de table de supervision séparée et l'atomicité mutation/audit. La discipline du [postmortem Phase 1](../phase1/ActiCiv_Phase1_Postmortem.md) exige le même commit propre validé localement, dans les deux jobs CI et utilisé pour l'artefact.

## 3. Résultat final

Le résultat est un **candidat de clôture**, pas une Phase 2 entièrement acceptée. Le socle existe et la chaîne locale complète est verte. La section 27 détaille chaque critère et ne transforme ni les tests manquants ni la CI non observée en PASS.

Cet audit n'a changé aucun code métier, migration, test, dépendance ou configuration. Il ajoute seulement ce postmortem et ses preuves sous `doc/`, sans commit. Le SHA existant reste conservé. Toute correction ultérieure devra produire un nouveau candidat, puis une nouvelle validation complète.

## 4. SHA final / branche / état Git

| Élément                            | Constat vérifié                                                                                           |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Dossier                            | `/Users/patrickmoreno/ActiCiv/dev/acticiv`                                                                |
| Remote fetch/push                  | `https://github.com/patbol/ActiCiv.git`                                                                   |
| Baseline Phase 1                   | `b28160ca1b93c0ef9eb312c8456f8b95b9cc2763`                                                                |
| SHA candidat Phase 2 conservé      | `e389396945ac869ce6c342678d18577693fc2c96`                                                                |
| Branche                            | `phase-2-core-data-security`                                                                              |
| Sujet du commit                    | `Implement Phase 2 core data, professional auth and tenant security`                                      |
| Runtime                            | Node `v24.21.0`, pnpm `11.19.0`, ICU `78.3`, tz `2026c`                                                   |
| Arbre lors de la validation locale | Propre avant et après `release:verify`, condition vérifiée par le script et marqueur final présent dans L |
| Arbre au début de cet audit        | `git status --short` vide ; `git diff --check` sans sortie                                                |
| Arbre après rédaction              | Ajouts documentaires non commités sous `doc/` ; l'arbre de travail complet n'est donc plus propre         |
| Publication / livraison            | Aucun push effectué ; aucune archive finale validée localement et en CI                                   |

Commandes réellement exécutées : `pwd`, `git remote -v`, `git rev-parse HEAD`, `git branch --show-current`, `git status --short`, `git diff --check`, `node --version`, `pnpm --version`. Dans chaque shell : chargement de `$HOME/.nvm/nvm.sh`, puis `nvm use`. Aucun pnpm réinstallé.

Le marqueur de L atteste le code du commit, **pas** ce rapport ajouté ensuite. Pour une future livraison contenant ce rapport, l'ensemble devra être commité puis validé à nouveau. Il serait incorrect d'affirmer qu'aucun fichier n'a été ajouté après la validation locale.

## 5. Ce qui a été implémenté

| Ensemble               | Contenu réel / emplacement                                                                                                                                    |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Identités et tenancy   | Profils, appartenance unique à une organisation, rôle principal, statuts actifs, services et appartenances multiples ; M2/M4                                  |
| Autorisation           | Contexte vérifié, capacités, contrôle des ressources ; `packages/backend/src/modules/authorization`, RPC et helpers SQL                                       |
| Auth Pro               | Connexion, récupération, définition de mot de passe, activation, callbacks, logout, renouvellement cookies ; `apps/pro/src/app/auth`, `apps/pro/src/proxy.ts` |
| Invitations            | Réservation idempotente, fournisseur Auth, association puis acceptation atomique ; module `auth` et M4                                                        |
| Configuration          | `POST /api/configuration` et `POST /api/platform`, DTO Zod, contrôle d'origine, session utilisateur, RPC nommées                                              |
| Catalogue              | Verticales, catégories, priorités `normal`, `important`, `urgent`, configuration par organisation ; M5                                                        |
| Contrats et géographie | Territoires PostGIS, hiérarchie, contrats/scopes, catégories/services explicites, lecture de candidats ; M6                                                   |
| Calendriers            | Scopes organisation/service, versions publiées, sept jours explicites ou 24/7, fenêtres, adaptateur DST ; M7 et module `schedules`                            |
| SLA                    | Quatre scopes, versions, trois cibles, motifs d'attente et pauses explicites ; M8 et module `sla`                                                             |
| Audit                  | Triggers sur les 26 tables métier hors journal, journal append-only avec liste blanche et atomicité ; M3 et rattachements M4–M8                               |
| Qualité                | `verify`, `verify:full`, `release:verify`, tests domaine/SQL/JWT/navigateur, frontières et bundles ; scripts et workflow                                      |
| Documentation          | Livre v1.1, décisions, références historiques, quatre ADR Phase 2 et compléments qualité                                                                      |

Les API de configuration existent ; aucun écran complet d'administration de configuration n'a été construit. Le scénario navigateur de configuration fait un appel HTTP depuis une session connectée, ce n'est pas un test d'un tableau de bord inexistant.

## 6. Migrations créées

Liste exacte, dans l'ordre observé dans `supabase_migrations.schema_migrations` (D) :

| ID  | Fichier                                                                                                   | Tables créées / responsabilité                                                                                   |
| --- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| M1  | [20260916000100_security.sql](../../../supabase/migrations/20260916000100_security.sql)                         | Schéma privé, PostGIS, révocation des privilèges par défaut, helper de sécurisation                              |
| M2  | [20260916000200_organizations.sql](../../../supabase/migrations/20260916000200_organizations.sql)               | `organizations`, `organization_settings`, `professional_profiles`, `organization_memberships`, `platform_admins` |
| M3  | [20260916000300_audit.sql](../../../supabase/migrations/20260916000300_audit.sql)                               | `audit_events`, immutabilité, fonction d'audit et premiers triggers                                              |
| M4  | [20260916000400_services_invitations.sql](../../../supabase/migrations/20260916000400_services_invitations.sql) | `services`, `service_memberships`, `professional_invitations`, `invitation_services`, garde dernier admin, RPC   |
| M5  | [20260916000500_catalog.sql](../../../supabase/migrations/20260916000500_catalog.sql)                           | `verticals`, `categories`, `organization_categories`                                                             |
| M6  | [20260916000600_coverage.sql](../../../supabase/migrations/20260916000600_coverage.sql)                         | `territories`, `contracts`, `contract_scopes`, `contract_scope_categories`, `contract_scope_services`            |
| M7  | [20260916000700_schedules.sql](../../../supabase/migrations/20260916000700_schedules.sql)                       | `service_schedules`, `service_schedule_versions`, `service_schedule_days`, `service_schedule_windows`            |
| M8  | [20260916000800_sla.sql](../../../supabase/migrations/20260916000800_sla.sql)                                   | `sla_policies`, `sla_policy_versions`, `sla_targets`, `hold_reasons`, `sla_pause_rules`                          |

Total : **27 tables métier dans `public`**, chacune avec RLS. PostGIS installé : `3.3.7` ; PostgreSQL observé : `17.6`. pgTAP est chargé par le banc de tests ; son absence du relevé persistant des extensions après rollback des tests ne constitue pas un échec des 69 assertions exécutées.

Les contraintes majeures comprennent les FK composites `(organization_id, id)`, `UNIQUE(user_id)` sur les memberships, `UNIQUE(membership_id, service_id)`, les checks de rôles/états/durées, l'immutabilité des versions publiées et de leur portée, les contrôles géométriques et de publication. Les invitations ont une unicité `(organization_id, idempotency_key)` et un index unique partiel organisation/email pour les états ouverts.

`service_schedules` utilise `UNIQUE NULLS NOT DISTINCT(organization_id, service_id)` ; `sla_policies` utilise `UNIQUE NULLS NOT DISTINCT(organization_id, service_id, category_id)`. Ces contraintes sont présentes dans la base observée, pas seulement dans les fichiers. S1 exerce les quatre scopes SLA et l'unicité du calendrier organisationnel. Les autres contraintes uniques relevées portent sur des colonnes obligatoires ; `auth_user_id` nullable d'invitation n'est pas présenté comme une unicité.

La base courante atteste l'application des huit migrations et des données de seed. Elle ne prouve pas à elle seule une reconstruction depuis zéro. Le log local de démarrage retrouvé mentionne `Starting database from backup...` ; aucune copie de ce log, susceptible de contenir les clés locales, n'est jointe. Le journal L ne contient pas `db:reset`. **La preuve autonome de reconstruction/reset du SHA candidat est donc DEFERRED**, sans prétendre qu'une simple procédure écrite suffit.

## 7. Architecture hexagonale réellement obtenue

Le monolithe modulaire est conservé : deux applications Next.js et un package backend `private`, exportant une entrée `server-only`, sans processus autonome. Les fichiers de domaine actuels ne contiennent pas d'import Next, Supabase ou HTTP d'après la lecture et la recherche ciblée. Aucun repository générique ni dossier hexagonal vide n'a été trouvé.

| Module critique              | Domain                                     | Application / ports utiles                                      | Infrastructure / composition                                              | Entrypoints et limite réelle                                                                                                   |
| ---------------------------- | ------------------------------------------ | --------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Authorization                | `authorization/domain/policy.ts`           | `application/context.ts`, port de lecture du contexte           | `infrastructure/supabase-context.ts`                                      | API configuration et pages Pro ; identité vérifiée par `getUser`                                                               |
| Organizations / services     | `organizations/domain/membership.ts`       | `application/administration.ts`, port `Administration`          | `platform/administration.ts`, RPC M4                                      | `api/configuration` via `platform/configuration.ts` ; invariant concurrent autoritaire en SQL                                  |
| Auth / invitations           | `auth/domain/redirect.ts`                  | `application/invite.ts`, ports `Invitations`, `IdentityInviter` | `infrastructure/invitations.ts`, `ssr.ts`                                 | Invitation orchestrée par cas d'usage ; login/reset/logout/acceptation dans `auth/actions.ts` appellent directement le SDK/RPC |
| Coverage                     | `coverage/domain/coverage.ts`, coordonnées | `application/candidates.ts`, `CoverageReader`                   | `infrastructure/supabase.ts`, PostGIS M6                                  | `api/platform` ; lecture des candidats via cas d'usage, écritures contrats/territoires directement dans composition + RPC      |
| Schedules                    | `schedules/domain/schedule.ts`             | `application/schedules.ts`, ports `ScheduleWriter`, `ZonedTime` | `infrastructure/temporal.ts`, `platform/commands.ts`, M7                  | API configuration : publication via cas d'usage ; conversion des fenêtres datées indépendante de Next                          |
| SLA                          | `sla/domain/policy.ts`                     | `application/publish.ts`, `SlaWriter`                           | `platform/commands.ts`, M8                                                | API configuration via cas d'usage ; aucun résolveur de report                                                                  |
| Catalogue / réglages simples | Validation Zod et contraintes SQL          | Pas de couches supplémentaires                                  | `platform/configuration.ts`, `platform/platform-administration.ts`, M5/M8 | RPC ciblées ; absence de couches artificielles adaptée à ces opérations simples                                                |
| Audit                        | Contrat de données SQL, champs autorisés   | Atomicité à la frontière de transaction, sans port distant      | M3, triggers et RLS                                                       | Automatique à chaque mutation des tables métier ; lecture via RLS                                                              |

**Écart HEX-1 :** la règle « entrypoint → validation/auth/mapping → use-case » n'est pas systématiquement appliquée aux opérations critiques d'acceptation d'invitation et d'administration contractuelle. Les garanties SQL existent, mais elles ne constituent pas une séparation applicative complète. Le cas d'usage `coverage` ne couvre que les candidats, pas toutes les mutations de ce module.

**Écart HEX-2 :** les règles et tests empêchent Next, Supabase, l'infrastructure et Temporal dans domain/application, ainsi que le backend dans les packages publics. En revanche, les sondes R acceptent `node:http`, `node:https`, `http`, `https`, `axios` et `fetch` global sans erreur ESLint. Les contrôles Next/Supabase dans la même sonde sont bien rejetés. L'absence actuelle d'import HTTP dans les sources ne remplace pas le test automatique demandé.

## 8. Sécurité / RBAC / RLS

Pour les professionnels clients, `private.member` exige l'identité `auth.uid()`, un profil actif, un membership actif, une organisation active et le rôle attendu. `private.service_access` ajoute l'appartenance active au service et l'activité du service. Les RPC vérifient le tenant réel de la ressource ou s'appuient sur les FK composites. Le contexte serveur utilise `getUser`, pas une simple lecture de metadata.

La plateforme suit une branche distincte et explicite : identité Auth + ligne `platform_admins` active + capacité nommée. Elle n'est pas un rôle de membership client et ne nécessite pas de fabriquer une appartenance à une organisation cliente. L'activation d'une capacité plateforme n'est pas possible via `user_metadata`.

| Acteur         | Périmètre démontré                                                                                                                  | Preuves                                                                                  |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Agent          | Son profil/membership et services actifs autorisés ; pas de contrats, audit ou administration                                       | S1, I, `authorization/domain/policy.test.ts`                                             |
| Supervisor     | Ses services et les membres de ces services ; aucune administration organisationnelle                                               | S1, I et tests de capacités                                                              |
| Client admin   | Membres, services/configurations de sa propre organisation ; lecture contrats/audit ; aucune extension contractuelle                | M4–M8, S1, E ; pas de rôle superviseur implicite                                         |
| Platform admin | Capacités `organizations.manage`, `organizations.recover`, `contracts.manage`, `territories.manage`, `catalog.manage`, `audit.read` | M2, `platform-administration.ts`, S2 : `contracts.manage` ne permet pas `catalog.manage` |

Le catalogue global est lisible par un professionnel actif comme référentiel commun (`catalog_read`). Les configurations d'organisation restent réservées à l'administration correspondante. Il ne faut pas confondre cette lecture de référentiel avec une lecture de données d'une autre organisation.

Voici **les 27 policies réellement présentes**, relevées dans `pg_policies` (D). Toutes sont `SELECT TO authenticated`, avec `USING` et sans `WITH CHECK` :

| Table                       | Policy                     | Filtrage principal                                                      |
| --------------------------- | -------------------------- | ----------------------------------------------------------------------- |
| `organizations`             | `organization_read`        | Organisation de l'acteur ou capacités plateforme organisations/contrats |
| `organization_settings`     | `settings_read`            | Admin du tenant ou capacité plateforme organisations                    |
| `professional_profiles`     | `profile_read`             | Membership visible selon `can_read_member`                              |
| `organization_memberships`  | `membership_read`          | Soi, admin du tenant, ou membre d'un service supervisé                  |
| `platform_admins`           | `platform_self`            | Sa propre ligne active                                                  |
| `audit_events`              | `audit_read`               | Admin du tenant ou capacité globale `audit.read`                        |
| `services`                  | `services_read`            | Admin du tenant, service autorisé ou capacité contrats                  |
| `service_memberships`       | `service_memberships_read` | Admin du tenant, superviseur concerné ou propre membership              |
| `professional_invitations`  | `invitations_read`         | Admin du tenant                                                         |
| `invitation_services`       | `invitation_services_read` | Admin du tenant                                                         |
| `verticals`                 | `catalog_read`             | Professionnel actif ou capacités catalogue/contrats                     |
| `categories`                | `catalog_read`             | Idem                                                                    |
| `organization_categories`   | `config_read`              | Admin du tenant                                                         |
| `territories`               | `territory_read`           | Capacités territoires/contrats ou périmètre contractuel de son tenant   |
| `contracts`                 | `contract_read`            | Admin du tenant ou capacité contrats                                    |
| `contract_scopes`           | `contract_read`            | Idem                                                                    |
| `contract_scope_categories` | `contract_read`            | Idem                                                                    |
| `contract_scope_services`   | `contract_read`            | Idem                                                                    |
| `service_schedules`         | `schedule_read`            | Admin du tenant                                                         |
| `service_schedule_versions` | `schedule_read`            | Admin du tenant                                                         |
| `service_schedule_days`     | `schedule_read`            | Admin du tenant                                                         |
| `service_schedule_windows`  | `schedule_read`            | Admin du tenant                                                         |
| `sla_policies`              | `sla_read`                 | Admin du tenant                                                         |
| `sla_policy_versions`       | `sla_read`                 | Admin du tenant                                                         |
| `sla_targets`               | `sla_read`                 | Admin du tenant                                                         |
| `hold_reasons`              | `sla_read`                 | Admin du tenant                                                         |
| `sla_pause_rules`           | `sla_read`                 | Admin du tenant                                                         |

Les écritures directes anon/authenticated sont privées de grants. Les écritures ordinaires utilisent le JWT utilisateur pour appeler des RPC `SECURITY DEFINER` nommées. Ces fonctions exécutent avec les privilèges de leur propriétaire et refont les contrôles ; **leur sécurité d'écriture ne résulte pas d'une policy RLS `WITH CHECK` inexistante**. Les helpers ont un `search_path` contrôlé et des droits EXECUTE restreints. Les lectures usuelles restent sous RLS ; `coverage_candidates` est `SECURITY INVOKER`.

La clé service-role est isolée dans l'adaptateur d'invitation pour Auth admin et `mark_invitation_sent`, et dans le provisionnement de fixtures. Elle n'est pas le client ordinaire des API de configuration. Cette clé reste techniquement privilégiée : « pont ciblé » décrit son utilisation par le code, pas une réduction cryptographique de ses pouvoirs. Les tests S1 vérifient que le pont est inexécutable par anon/authenticated et accessible à service_role.

**Dernier administrateur :** M4 possède un trigger UPDATE/DELETE sur membership et profil, avec verrou commun d'organisation ; les RPC de rôle/profil prennent ce verrou. S1 refuse une rétrogradation et une désactivation de profil séquentielles. I émet deux rétrogradations concurrentes et vérifie qu'un admin subsiste. Cependant, les deux requêtes utilisent le même acteur : le refus peut aussi provenir de la perte de ses droits. Il manque des scénarios indépendants à deux acteurs/transactions pour suppression, désactivation de membership, désactivation de profil et rétrogradation. La garantie concurrente complète demandée est **FAIL de couverture**, sans démonstration dans cet audit d'une violation réelle de l'invariant.

L'expression « cross-tenant impossible » s'applique aux chemins professionnels et contraintes vérifiés ; elle n'est pas une promesse sur des accès superutilisateur ou plateforme explicitement autorisés.

## 9. PostGIS

M1 active PostGIS ; M6 impose `geometry(MultiPolygon,4326)`, non vide, valide, bornée, avec index `territories_geometry_gist`. L'ordre des coordonnées est longitude/latitude. Aucun `ST_MakeValid` silencieux ne répare une frontière contractuelle. Le parent doit couvrir strictement l'enfant ; le changement de parent/géométrie est contrôlé et la hiérarchie dispose d'un contrôle de cycle.

S1 vérifie extension/index, frontière `(0,0)`, extérieur `(-1,-1)`, géométrie vide, mauvais SRID et modification de parent invalide. S2 vérifie un trou, sa frontière, une géométrie auto-intersectée, deux candidats sur chevauchement non emboîté et deux candidats sur emboîtement. Ces points à l'intérieur des territoires fournissent aussi une preuve d'intérieur couvert.

La lecture `coverage_candidates` renvoie une liste, sans gagnant imposé ni routage final. Elle tient compte des contrats actifs, de leur validité, des organisations actives et des catégories explicitement associées. Les tables `contract_scope_categories` et `contract_scope_services` imposent des associations positives ; une catégorie nouvellement créée n'est pas automatiquement associée. Aucun test n'effectue encore explicitement « créer une nouvelle catégorie, puis vérifier les anciens contrats » : structure conforme, scénario de non-régression absent.

Le test nommé `invalid parent/cycle denied` rejette un parent géométriquement invalide avant de démontrer isolément la branche récursive anti-cycle. La règle existe ; sa couverture de branche et sa concurrence ne sont pas établies par ce seul test.

## 10. SLA / horaires / DST

Les quatre scopes sont matérialisés par les deux colonnes optionnelles service/catégorie, avec unicité effective sous PostgreSQL 17. `scopeOrder` documente l'ordre croissant organisation, service, catégorie, service+catégorie ; donc la priorité future validée reste `service + catégorie > catégorie > service > organisation`. Aucun moteur de report ne résout ces scopes en Phase 2.

Les trois targets sont `acknowledgment`, `intervention`, `resolution`, avec durées entières strictement positives et comptage `elapsed` ou `business_hours`. Une pause exige une règle explicite par cible/motif. Les versions SLA publiées, leurs targets/pauses et leurs scopes sont protégés. Une version référence un calendrier publié du même tenant et de portée compatible. Les reports futurs devront conserver ces références ; aucune non-rétroactivité de report n'est testable tant que ces reports sont hors scope.

S1/S2 prouvent unicités, refus de modification/suppression publiée et stabilité des scopes. Les unités valident cibles, durées et pauses. **L'appel réussi de `publish_sla` créant une deuxième version, puis la comparaison complète de l'ancienne, n'est pas testé.** Les seeds créent une version initiale ; cela ne remplace pas ce scénario.

Les horaires utilisent des secondes depuis minuit, `0 <= start < end <= 86400`, des intervalles semi-ouverts, sept jours explicites en mode hebdomadaire ou `always_open` explicite. M7 interdit chevauchements, créneaux d'un jour fermé et modifications de versions publiées. Les journées traversant minuit se représentent par deux journées ; aucune fenêtre inversée n'est acceptée. Pas de jours fériés.

S2 publie réellement des segments dimanche/lundi avec adjacence ; les tests domaine vérifient plusieurs créneaux, jours fermés et bornes. **Il manque un test calculant les fenêtres datées de part et d'autre d'un dimanche→lundi et comparant leur continuité.** Le stockage de ces segments est prouvé, leur résolution hebdomadaire à cette frontière ne l'est pas.

Le runtime R retourne `typeof globalThis.Temporal === "undefined"` sous Node `v24.21.0`. `@js-temporal/polyfill@0.5.1` est donc justifié pour l'adaptateur `ZonedTime`, encapsulé dans `schedules/infrastructure/temporal.ts`. Les modules domain/application ne l'importent pas. Les tests [schedule.test.ts](../../../packages/backend/src/modules/schedules/domain/schedule.test.ts), réussis dans L, prouvent :

- Paris, 29 mars 2026 : 02:30 inexistante → `01:00Z`, donc 03:00 locale, pas 03:30 ;
- Paris, 25 octobre 2026 : 02:30 ambiguë → `00:30Z`, première occurrence ;
- durée réelle 24/7 de 23 h au printemps et 25 h en automne ;
- Australia/Lord_Howe, transition de 30 minutes : 02:15 inexistante → premier instant valide, 02:30 locale.

Le déterminisme dépend du runtime/ICU/tz figé et relevé. Un changement de données de fuseaux demandera une nouvelle validation, sans réouvrir les conventions produit.

## 11. Auth / invitations

`supabase/config.toml` cible Pro `3001`, et autorise les callbacks Pro. L'inscription publique globale est désactivée ; le fournisseur email local reste activé pour permettre la connexion. I vérifie réellement login, refus signup, refresh, logout et refus de réutilisation du refresh token après logout. E vérifie la connexion/logout via UI et un callback malveillant rejeté.

L'activation d'une invitation suit : réservation métier sous JWT de l'admin → fournisseur Auth privilégié → association → identité vérifiée → acceptation transactionnelle. Ni Auth seul ni le simple état `sent` n'accordent de membership. `accept_invitation` revérifie expiration, identité/email confirmé, organisation, initiateur encore admin et services actifs, puis crée profil/membership/services et audit dans la même transaction.

| Scénario                                    | Preuve réelle                                                                    | Limite                                                                                |
| ------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Deux réservations concurrentes, même clé    | I : même ID, payload différent rejeté                                            | Ne teste pas deux appels concurrents de tout le provider d'envoi                      |
| Invitation inter-tenant                     | I : réservation autre organisation refusée                                       | Couverture négative réelle                                                            |
| Identité existante avant association métier | I : aucun membership ; association ultérieure réussie                            | Arrêt entre étapes, sans panne SQL injectée                                           |
| Échec d'association puis reprise            | `auth/application/invite.test.ts`, mock de `bind` échouant une fois              | Preuve unitaire, pas panne réelle PostgreSQL                                          |
| Échec Auth après réservation réussie        | Aucun scénario dédié                                                             | FAIL de couverture                                                                    |
| Expiration / réutilisation                  | I : expiration métier, token invite rejoué, acceptation répétée, recovery expiré | Succès du recovery complet non vérifié                                                |
| Définition mot de passe + acceptation       | E : vrai Auth, formulaire password, formulaire accept, accès actif               | Préparation par API de test, pas par le parcours `invitation.send` applicatif complet |
| Réutilisation d'une identité Auth existante | Adaptateur : recherche email exact puis recovery, sans `deleteUser`              | Fallback non couvert en intégration de bout en bout                                   |

Le flux de récupération est présent et son endpoint est appelé avec succès par I, mais aucun test ne suit un lien recovery valide jusqu'au changement de mot de passe puis à une nouvelle connexion. L'action `password` redirige toujours vers `/auth/accept`, même pour un professionnel déjà actif ; cette page permet ensuite d'aller à `/espace`. Ce comportement doit être éprouvé et clarifié lors du complément de test, sans le présenter ici comme un échec d'authentification démontré.

Le fournisseur parcourt au maximum 100 pages de 100 identités lors de la reprise par email. Cette limite et le traitement d'erreurs Auth ambiguës sont une dette concrète ; ils n'autorisent aucune suppression arbitraire d'identité. Aucun appel de suppression Auth n'existe dans cet adaptateur.

## 12. Audit

M3 crée un journal append-only : ID, `actor_id`, `actor_kind`, `organization_id`, timestamp, `entity_type`, `entity_id`, action, changements old/new autorisés et `transaction_id`. L'acteur est dérivé de `auth.uid()`, jamais d'un paramètre utilisateur. Les opérations SQL d'amorçage et le pont sans sujet utilisateur sont marqués système ; l'initiateur métier d'invitation reste enregistré dans la ligne d'invitation.

Les 26 autres tables publiques ont un trigger `audit_mutation` dans la base relevée (D). L'audit est inséré par un trigger AFTER dans la transaction de la mutation, sans capture d'erreur qui permettrait à celle-ci de réussir seule. S1 injecte un échec d'insertion d'audit et vérifie l'absence de service créé. S2 rollbacke une mutation et vérifie le retour simultané du compteur d'audit. S1 vérifie l'acteur utilisateur d'une écriture autorisée et le refus de suppression du journal.

La liste blanche exclut email, secrets et tokens ; les géométries produisent une empreinte, pas une copie intégrale. S2 contrôle les payloads du jeu testé contre les signatures email/password/token/secret. Cela démontre les payloads testés et le mécanisme de whitelist, pas l'absence absolue de toute information sensible dans toutes les valeurs textuelles futures.

**Écart AUD-1 : aucun `correlation_id` de requête ni propagation de contexte de corrélation n'est implémenté.** `transaction_id` regroupe les événements d'une transaction SQL, mais ne relie pas l'envoi Auth externe et les différentes transactions d'invitation à une même demande. Le critère explicite de correlation id est FAIL. Le champ organisation est nullable pour les événements globaux/système ; l'insertion d'un profil avant son membership peut également produire un événement sans organisation, suivi d'un événement de membership correctement rattaché. Ce comportement est décrit, pas assimilé à un rattachement exhaustif de tout événement.

Les logs techniques de `platform/logger.ts` sont distincts de l'audit métier et ne sont pas soumis à l'atomicité transactionnelle de la base.

## 13. Seeds

[supabase/seed.sql](../../../supabase/seed.sql) contient uniquement des fixtures fictives locales/CI :

| Contenu                       | Quantité / preuve                                                                                 |
| ----------------------------- | ------------------------------------------------------------------------------------------------- |
| Organisations                 | Trois, IDs déterministes ; S1 et D confirment le nombre                                           |
| Services                      | Deux par organisation dans le seed                                                                |
| Identités/profils/memberships | Trois rôles par organisation, donc neuf identités initiales `@example.test`                       |
| Service memberships           | Agent et superviseur affectés au service Accessibilité de leur organisation                       |
| Catalogue                     | Verticale `accessibility`, cinq catégories prévues                                                |
| Géographie                    | Trois territoires : un parent, un enfant inclus et un territoire chevauchant le parent            |
| Contrats                      | Un contrat actif et un scope par organisation, catégorie et service explicitement associés        |
| Calendriers                   | Un calendrier par organisation ; un hebdomadaire à deux créneaux par jour ouvré, deux 24/7        |
| SLA                           | Une politique/version publiée par organisation, trois targets chacune, motif d'attente `external` |
| Signalements                  | Aucun, aucune table correspondante                                                                |

Le seed n'attribue aucun mot de passe utilisable versionné. Les mots de passe de test sont générés/provisionnés localement. Les tests E2E peuvent ajouter leurs propres fixtures ; la base après campagne n'est pas promise identique ligne pour ligne au seed initial. Aucun admin plateforme permanent n'est secrètement accordé à un compte client dans le seed ; le bootstrap privilégié est explicite et les fixtures plateforme SQL sont rollbackées.

## 14. Tests réellement exécutés

La campagne L est celle de `pnpm release:verify` au SHA conservé. L'audit documentaire ne l'a pas relancée et ne présente pas ses nouvelles sondes comme une nouvelle campagne complète. Les tests SQL manipulent de vraies tables et sont rollbackés ; les tests I utilisent de vrais JWT obtenus auprès de Supabase. La service-role prépare les fixtures et effectue le pont Auth explicite, mais ne remplace pas l'acteur testé pour les contrôles RLS.

| Contrôle demandé      | Résultat réel               | Preuve / portée                                                                                                   |
| --------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Format                | PASS                        | `pnpm format:check` dans L, tous les fichiers correspondants conformes au SHA testé                               |
| Lint                  | PASS                        | `pnpm lint`, zéro avertissement autorisé ; garde HTTP absente signalée séparément                                 |
| Typecheck             | PASS                        | `pnpm -r typecheck && tsc -p tsconfig.tools.json` dans L                                                          |
| Unit tests            | PASS                        | Vitest : 8 fichiers, 17 tests ; pas 17 scénarios exhaustifs par module                                            |
| SQL tests             | PASS                        | pgTAP : 2 fichiers, 69 assertions                                                                                 |
| RLS                   | PASS sur scénarios présents | S1/S2 + I : rôles, lecture limitée, écriture inter-tenant refusée, JWT révoqué métier, anonyme                    |
| Auth                  | PASS sur scénarios présents | I : login, signup interdit, refresh/logout, invitation, expiration ; E : parcours UI ; trous détaillés section 11 |
| PostGIS               | PASS sur scénarios présents | S1/S2 : extension, GiST, géométries, candidats ; branche anti-cycle isolée non démontrée                          |
| SLA                   | PASS sur scénarios présents | Unités + S1/S2 ; publication successive réussie encore non testée                                                 |
| DST                   | PASS                        | Paris printemps/automne, 23/25 h, Lord Howe dans `schedule.test.ts`                                               |
| Audit                 | PASS sur atomicité testée   | S1 échec audit → rollback métier ; S2 rollback commun, whitelist ; correlation id absent                          |
| Builds                | PASS                        | Builds production Citizen et Pro dans L                                                                           |
| Bundles               | PASS                        | `scripts/check-client-bundles.mjs` dans L                                                                         |
| Playwright            | PASS                        | 20/20 : 12 cas Phase 1 et 8 cas Phase 2, desktop/mobile Chromium                                                  |
| axe                   | PASS sur écrans scannés     | Surfaces Phase 1, login et espace Pro ; absence de scan complet password/recover/accept                           |
| Dependency audit      | PASS à la date de L         | `pnpm audit --audit-level high`, « No known vulnerabilities found »                                               |
| Secret scan SHA exact | DEFERRED                    | Aucun résultat CI de ce SHA fourni ; aucun job de scan dédié dans le workflow courant                             |
| verify                | PASS                        | Inclus et achevé dans L                                                                                           |
| verify:full           | PASS                        | Inclus et achevé dans L                                                                                           |

`playwright.config.ts` impose `retries: 0`, `reuseExistingServer: false` et démarre les builds sur 3000/3001. Les anciens serveurs ont été arrêtés avec l'autorisation de Patrick avant validation. Aucun retry Playwright ne masque un échec. Le résultat mobile utilise Chromium avec émulation iPhone ; ce n'est pas une exécution Safari/iOS ou TalkBack.

La commande `git diff b28160ca1b93c0ef9eb312c8456f8b95b9cc2763 HEAD -- e2e/foundation.spec.ts` est sans sortie. Les 12 E2E Phase 1 restent présents, inchangés et réussis. Leurs anciennes validations manuelles ne sont pas présentées comme couvrant les écrans créés ensuite.

## 15. Résultats verify / verify:full

Les scripts réels de [package.json](../../../package.json) sont :

```text
verify = format:check → lint → typecheck → test → build → verify:bundles
verify:full = verify → db:test → test:integration → test:e2e → audit --audit-level high
release:verify = arbre propre → SHA/runtime → verify:full → même SHA/arbre propre
```

Les commandes sont enchaînées avec arrêt sur erreur. `db:test` refuse l'absence de fichiers SQL, puis exécute `supabase test db`. Un environnement Supabase manquant ne produit pas un succès factice.

Le [script de release](../../../scripts/verify-release.mjs) n'affiche `LOCAL_VALIDATED_SHA=e389396945ac869ce6c342678d18577693fc2c96` qu'après succès complet et contrôle Git final. Ce marqueur figure dans L. Il ne vérifie pas lui-même un run GitHub ni ne crée une archive ; sa dernière ligne rappelle ces exigences.

Le relevé complémentaire R prouve Node/pnpm et le défaut HTTP sans modifier les sources. La mise en forme du présent rapport et son contrôle documentaire sont distincts de `verify:full`. Une nouvelle exécution de `release:verify` sur l'arbre actuel serait bloquée par les ajouts documentaires non commités, conformément à sa règle.

## 16. GitHub Actions / SHA exact

Le workflow [Quality](../../../.github/workflows/ci.yml) contient deux jobs : `app` exécute `verify` ; `database-foundation` démarre Supabase, fait `db:reset`, installe Chromium et exécute `verify:full`, puis arrête Supabase. Le runtime vient de `.nvmrc`, l'installation utilise `--frozen-lockfile`.

**Aucun succès CI n'est attesté pour `e389396945ac869ce6c342678d18577693fc2c96`.** Le connecteur GitHub a retourné `workflow_runs: []` pour ce SHA pendant l'audit. Ce wrapper ne remonte que la première page des runs déclenchés par pull request : ce résultat seul ne prouverait pas l'absence de tous les runs push. Ici, aucune publication de ce commit n'a été effectuée et aucune URL de run réussi n'est disponible. L'existence du workflow ne vaut donc pas exécution.

Le commit est conservé localement selon la consigne de Patrick. Une tentative de publication antérieure avait été rejetée par le contrôle automatique d'autorisation sur le dépôt public ; elle n'a pas été relancée. La clôture reste DEFERRED pour cette étape, sans nouvelle demande de publication dans ce rapport.

Il faudra consigner les URL, SHA des runs, résultats des deux jobs et origine de l'archive finale. Les validations CI de Phase 1 ne peuvent pas être réutilisées comme preuve de Phase 2. Le workflow courant ne contient pas d'étape dédiée de secret scanning ; son éventuelle activation au niveau GitHub n'est pas attestée ici.

## 17. Défauts rencontrés

Les incidents documentés pendant l'implémentation sont distincts des lacunes découvertes pendant l'audit :

| ID  | Défaut / impact                                                                             | État                                                                          |
| --- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| B1  | Fournisseur email local désactivé : login professionnel bloqué                              | Corrigé et exercé avec vrai Auth                                              |
| B2  | Révocation EXECUTE seulement par schéma : héritage du privilège PUBLIC global sur fonctions | Corrigé ; privilèges effectifs testés                                         |
| B3  | Cache Turbopack conservant un échec d'ouverture de port dans le sandbox                     | Cache généré déplacé hors dépôt ; builds exacts réussis                       |
| B4  | Helper E2E tentant de parser du JSON sur une réponse RPC void vide                          | Corrigé ; scénario navigateur réussi                                          |
| B5  | Deux éléments `role=alert`, dont l'annonceur Next : sélecteur E2E ambigu                    | Sélecteur ciblé sur le texte attendu ; assertion conservée                    |
| B6  | Règle `.gitignore` `coverage/` trop large, pouvant cacher le module backend homonyme        | Règle ancrée à la racine ; module présent dans le commit                      |
| B7  | Identifiant `module` dans le test de frontières rejeté par le lint                          | Renommé `importedModule` ; lint et test réussis                               |
| B8  | Espaces finaux des références Markdown importées                                            | Retours de ligne intentionnels préservés, espaces retirés ; diff-check propre |

Les problèmes HEX-1/HEX-2, AUD-1 et les scénarios manquants ci-dessous restent ouverts. Le passage de `verify:full` ne les détecte pas tous : c'est précisément une limite de la couverture actuelle.

## 18. Pour chaque bug : cause + correctif + test de non-régression

| ID         | Cause                                                                                                 | Correctif réel                                                                         | Non-régression réellement présente                                                                |
| ---------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| B1         | Confusion entre arrêt du fournisseur email et interdiction de signup                                  | Fournisseur email actif, signup global interdit dans config Supabase                   | I : login réussi et signup refusé dans la même suite ; E login                                    |
| B2         | Les privilèges par défaut PostgreSQL globaux ne sont pas annulés par une révocation limitée au schéma | M1 : révocation globale PUBLIC EXECUTE avant création des fonctions, grants explicites | Quatre assertions initiales S1 sur `has_function_privilege` pour pont/helpers                     |
| B3         | Cache `.next` lié à un build interrompu par les restrictions réseau/ports du sandbox                  | Mise de côté des caches générés, reconstruction dans l'environnement autorisé          | Deux builds production dans L ; aucun test unitaire spécifique du sandbox                         |
| B4         | Hypothèse « toute réponse RPC réussie est JSON non vide »                                             | Lecture texte puis parsing conditionnel dans helper E2E                                | E : scénario invitation passe par RPC void puis poursuit jusqu'à l'activation                     |
| B5         | Sélecteur `alert` trop large face à l'annonceur de routage Next                                       | Filtrage par message d'erreur attendu                                                  | E : callback invalide, erreur métier visible et URL locale vérifiées                              |
| B6         | Pattern Git non ancré appliqué aussi aux sous-dossiers métier                                         | `/coverage/` dans `.gitignore`                                                         | Présence des fichiers `modules/coverage` dans le SHA ; pas de test automatisé dédié               |
| B7         | Nom de variable incompatible avec la règle de lint                                                    | Renommage ciblé                                                                        | Lint + test de frontières Vitest de la suite L                                                    |
| B8         | Format de sources documentaires importées                                                             | Normalisation Markdown                                                                 | `git diff --check` et format check ; pas de test métier nécessaire                                |
| HEX-1      | Certaines orchestrations critiques restent couplées aux entrypoints/SDK                               | Aucun correctif pendant cet audit                                                      | FAIL : manque de tests de cas d'usage indépendants pour ces opérations                            |
| HEX-2      | Patterns ESLint incomplets et tests de frontière sans module HTTP                                     | Aucun correctif pendant cet audit                                                      | Sonde R reproduit l'acceptation HTTP ; FAIL du garde-fou demandé                                  |
| AUD-1      | Journal limité à la corrélation par transaction SQL                                                   | Aucun correctif pendant cet audit                                                      | Lecture M3 établit l'absence d'identifiant de requête ; test de propagation absent                |
| TEST-ADMIN | Une seule course de rétrogradations, même initiateur                                                  | Aucun correctif pendant cet audit                                                      | FAIL : suppressions/désactivations concurrentes et acteurs indépendants absents                   |
| TEST-AUTH  | Mock d'échec SQL et arrêt entre deux étapes pris pour preuve générale de panne                        | Aucun correctif pendant cet audit                                                      | FAIL : échec Auth après réserve, échec SQL réel après Auth, reprise provider complet non couverts |
| TEST-SLA   | Tests négatifs et seed initial sans scénario positif de versions successives                          | Aucun correctif pendant cet audit                                                      | FAIL : publier deux versions SLA via RPC et comparer l'ancienne absent                            |
| TEST-A11Y  | Scan de quelques pages pris pour couverture des nouveaux parcours                                     | Aucun correctif pendant cet audit                                                      | FAIL automatique partiel ; contrôles manuels DEFERRED                                             |

Les preuves d'incident conservées sont le rapport d'implémentation, les corrections visibles et les tests actuels. Les traces brutes de chaque tentative échouée ne sont pas toutes archivées ; ce tableau ne prétend pas les reconstituer. Pour B3/B6/B8, le contrôle pertinent est build/Git/format, et l'absence de test dédié est explicite.

## 19. Écarts entre plan initial et résultat

| Exigence                                              | Résultat / écart                                                                                               | Conséquence                                                                                          |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Hexagonal concret sur modules critiques               | Satisfait sur plusieurs modules, partiel sur acceptation Auth et mutations contractuelles                      | Complément de séparation applicative à réaliser sans couches artificielles                           |
| Interdiction automatique domain → HTTP                | Absente, reproduite en mémoire                                                                                 | Renforcer règles et tests, incluant les primitives réseau pertinentes                                |
| Dernier admin protégé sous trois types de concurrence | Garde SQL présente, preuve concurrente partielle                                                               | Tester deux acteurs/transactions, opérations de rôle et de statut, suppression SQL autorisée de test |
| Pannes Auth/SQL et reprise intégrale                  | Cas unitaires et intégration partielle seulement                                                               | Tester les adaptateurs réels, erreurs injectées et absence de droits partiels                        |
| Audit avec correlation id                             | `transaction_id` seulement                                                                                     | Introduire la corrélation de requête/commande si conforme au contrat, avec propagation et tests      |
| Publication SLA successive sans altérer le passé      | Modèle présent, succès RPC successif non exercé                                                                | Compléter le test positif et les comparaisons historiques                                            |
| Dimanche→lundi                                        | Segments stockés, pas de test de résolution datée sur la frontière                                             | Ajouter le scénario ciblé                                                                            |
| Cycles géographiques                                  | Garde présente, test mêlé à un défaut d'inclusion                                                              | Isoler autant que possible le contrôle et ses limites                                                |
| Catalogue/contrats                                    | Associations explicites ; pas de scénario ajout de catégorie sans extension                                    | Ajouter la non-régression requise                                                                    |
| Accessibilité de tous les nouveaux écrans             | Login/espace scannés ; autres écrans partiellement parcourus                                                   | Couvrir états succès/erreur, focus et clavier, puis VoiceOver                                        |
| Reproductibilité complète, même SHA en CI et artefact | Validation locale exacte seule                                                                                 | Rassembler preuves DB et CI puis produire l'artefact du SHA validé                                   |
| Documentation actuelle                                | Références Phase 1/v1.1 correctes ; README garde une mention du navigateur temporaire de la livraison initiale | Clarifier cette mention historique à la prochaine révision documentaire                              |

L'ordre des huit migrations place l'audit avant les autres tables métier afin d'attacher immédiatement leurs triggers. Cette organisation concrète respecte la dépendance des composants. L'inventaire M1–M8 prévaut pour décrire ce qui est appliqué, sans prétendre que les numéros d'une proposition antérieure sont les noms de migrations finales.

## 20. Dette technique restante

La dette prioritaire est celle des lignes FAIL de ce rapport : frontières applicatives/HTTP, corrélation d'audit et scénarios de tests manquants. Elle appartient à la clôture Phase 2 ; elle ne doit pas être silencieusement transférée à la Phase 3.

Autres limites identifiées : recherche paginée d'identité pour reprise d'invitation ; contrat d'erreurs d'API assez générique (`400` pour différentes causes) ; événements système/profil initial parfois sans tenant ; absence de benchmark de contention des verrous d'organisation ; absence de campagne de concurrence sur toutes les configurations ; duplication de certaines règles entre TypeScript et SQL à maintenir cohérente. Il ne s'agit pas de preuves de fuite, mais de points de maintenance et de test.

Le gel Node/ICU/tz assure un environnement connu, mais ses mises à jour devront être intentionnelles. ESLint 9 reste utilisé selon les dépendances compatibles du dépôt. Aucun ORM, Redis, microservice, moteur de permissions externe ou outil cartographique n'a été ajouté pour contourner ces sujets.

## 21. Questions encore ouvertes

Les rôles, service memberships, scopes/précédence SLA, PostGIS/ST_Covers, conventions DST, immutabilité et audit atomique sont décidés. Les écarts d'implémentation/tests ne sont pas des arbitrages produit à rouvrir.

Les questions futures de [open-questions.md](../../product-decisions/open-questions.md) concernent le routage de candidats non départageables, le payload public et la rétention, les seuils anti-abus, la fusion des doublons, la réouverture, les anciens signalements lors d'une nouvelle couverture et les comportements PWA. Les transferts inter-organisations restent hors MVP. Aucun de ces sujets n'autorise une implémentation Phase 3 maintenant.

Les étapes de clôture encore à organiser sont la correction des FAIL, la validation VoiceOver des nouvelles pages, la preuve de reconstruction et la publication/CI du candidat final lorsqu'elle sera autorisée. TalkBack reste différé faute d'environnement. L'identifiant de corrélation demandé ne doit pas être remplacé sans justification par le seul identifiant de transaction existant.

## 22. Ce qui a bien fonctionné

Les contraintes SQL sont effectives dans la base réelle, notamment les unicités nullable que de simples modèles TypeScript ne garantiraient pas. Les tests utilisent des identités réelles et distinguent l'acteur du compte de préparation. Les scénarios d'audit prouvent les deux sens du rollback. L'adaptateur DST teste des résultats précis au lieu de se fier au comportement par défaut d'une bibliothèque.

`release:verify` lie le résultat local au SHA et à un arbre propre. Playwright démarre les builds sans réutiliser silencieusement des serveurs existants. Les tests Phase 1 sont conservés. Les décisions produit verrouillées sont regroupées et les sujets futurs restent explicitement séparés.

L'audit de clôture a mis au jour les écarts avant toute nouvelle phase. La conservation du commit permet de discuter ces écarts sur un état stable.

## 23. Ce qui aurait dû être mieux fait

La checklist d'acceptation aurait dû être traduite en cas nommés avant d'annoncer la couverture. Un test intitulé « partial failure » ne démontre pas à lui seul toutes les pannes Auth/SQL ; un test de concurrence ne couvre pas toutes les opérations ; une architecture sans import HTTP aujourd'hui n'est pas protégée contre l'ajout de cet import demain.

Il aurait fallu archiver dès l'exécution les preuves de démarrage depuis zéro/reset avec le SHA, et expliciter plus tôt les éléments de clôture dépendant de la CI et de l'accessibilité manuelle. Le rapport initial aurait dû limiter ses affirmations à la portée exacte des assertions. Les contrôles d'accessibilité auraient dû accompagner chaque écran ajouté, y compris ses états d'erreur.

La revue architecturale aurait dû comparer chaque chemin critique réel à la cartographie, notamment l'acceptation et l'administration contractuelle. Les contraintes métier SQL et la séparation des cas d'usage sont complémentaires ; le succès de l'une ne démontre pas automatiquement l'autre.

## 24. Actions préventives Phase 3

Ces actions préparent la méthode ; elles ne constituent pas un démarrage de Phase 3.

1. Résoudre d'abord les FAIL Phase 2, avec preuve attachée à chaque critère et revue explicite de Patrick.
2. Pour tout invariant concurrent, décrire acteurs, transactions, ordre possible et état final ; exercer toutes les opérations pouvant le rompre.
3. Pour chaque pont externe/SQL, tester chaque intervalle de panne et la reprise réelle, sans confondre mock, interruption et défaillance du service.
4. Tester les règles architecturales par injections en mémoire positives/négatives, y compris accès réseau et couplages internes critiques.
5. Livrer une matrice par page et par état pour axe/clavier/focus/lecteur d'écran.
6. Capturer les preuves DB/local/CI au moment de leur exécution et inscrire le SHA partout ; ne pas reconstruire les preuves a posteriori à partir d'une base déjà active.
7. Finaliser les documents avant le gel ; après toute correction ou ajout livré, recommencer la validation du nouveau SHA. Produire l'archive uniquement depuis ce SHA.
8. Garder l'audit métier transactionnel et son contexte serveur lors des futures mutations ; ne jamais le remplacer par un log technique asynchrone.

## 25. Validation accessibilité

| Surface / contrôle             | État                                                                                   | Preuve et limite                                                                                |
| ------------------------------ | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Fondations Citizen/Pro Phase 1 | PASS                                                                                   | E1 : 12 cas desktop/mobile inchangés ; axe, dialogue/focus, skip-link et réduction de mouvement |
| VoiceOver Phase 1              | PASS historique                                                                        | Postmortem Phase 1 et validation de Patrick ; ne couvre pas les nouvelles pages                 |
| Login Pro                      | PASS pour axe/labels et activation clavier testée                                      | E : labels accessibles, axe sans violation, bouton focalisé puis Enter                          |
| Espace Pro                     | PASS pour axe                                                                          | E : scan après login et activation                                                              |
| Erreur callback invalide       | PASS pour présence du message accessible                                               | E : `role=alert` et texte attendu ; focus et lecture VoiceOver non validés                      |
| Mot de passe                   | PASS pour labels et parcours nominal ; FAIL pour couverture axe/clavier/focus complète | E remplit/soumet le formulaire mais ne le scanne pas avec axe et ne couvre pas ses erreurs      |
| Acceptation invitation         | PASS pour label et parcours nominal ; FAIL pour couverture complète                    | E soumet le formulaire ; scan seulement après arrivée dans l'espace                             |
| Récupération                   | FAIL de couverture automatique                                                         | Écran existant, pas de scénario E2E complet ni scan dédié                                       |
| Configuration                  | Pas d'écran complet ajouté                                                             | E exerce l'API authentifiée ; aucun PASS d'accessibilité UI de configuration revendiqué         |
| VoiceOver nouveaux parcours    | DEFERRED                                                                               | Aucun procès-verbal manuel Phase 2 disponible                                                   |
| TalkBack                       | DEFERRED                                                                               | Environnement compatible toujours non validé ; aucun résultat vert revendiqué                   |

Les formulaires possèdent des labels et certains messages `role=alert` à la lecture du code. Cela ne prouve pas le parcours clavier complet, l'ordre du focus, le focus après erreur ni la qualité des annonces d'un lecteur d'écran. Axe ne remplace pas ces vérifications.

## 26. Vulnérabilités / audit dépendances

Le journal L termine par `No known vulnerabilities found` après `pnpm audit --audit-level high`. C'est une preuve datée de l'audit des dépendances de ce commit ; aucune absence permanente de vulnérabilité n'est garantie. Aucun nouvel audit réseau n'a été nécessaire pour rédiger ce rapport historique.

| Dépendance Phase 2                        | Nécessité / preuve                                                                                   |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| PostGIS                                   | Validé ; activé en M1, version `3.3.7` réellement observée, tests spatiaux S1/S2                     |
| `@supabase/ssr` `0.12.7`                  | Validé ; client professionnel SSR/cookies dans `auth/infrastructure/ssr.ts`                          |
| pgTAP                                     | Validé pour les contraintes/privilèges/RLS ; 69 assertions exécutées via CLI locale                  |
| `@js-temporal/polyfill` `0.5.1`           | Nécessité démontrée par Temporal natif absent dans R ; conversions DST derrière `ZonedTime`          |
| Supabase JS, Zod, Vitest, Playwright, axe | Réutilisés ; versions résolues dans `pnpm-lock.yaml`, pas de second stack de persistance/permissions |

Le scan de bundles est réussi. Les fixtures n'introduisent pas de mot de passe utilisable versionné et le payload d'audit est testé contre des signatures sensibles. Ce ne sont pas des scans de secrets de l'historique Git. **La preuve de secret scanning sur le SHA final reste DEFERRED**, et aucune configuration distante de protection n'est présentée comme effectuée.

## 27. Critères d’acceptation Phase 2, un par un : PASS / FAIL / DEFERRED

Cette matrice évalue la checklist au SHA conservé, puis signale les conditions de livraison actuelles. Les références L/D/R/S1/S2/I/E/E1 sont définies en section 1, les migrations M1–M8 en section 6. Une ligne PASS de structure n'annule pas une ligne FAIL sur sa couverture comportementale. Les actions mentionnées dans les lignes FAIL/DEFERRED restent à réaliser.

La matrice ci-dessous contient **261 points de contrôle : 228 PASS, 23 FAIL et 10 DEFERRED**. Il ne s’agit pas d’un taux de conformité : un seul critère obligatoire non satisfait suffit à empêcher la clôture. Les résultats globaux de suites et les cas manquants sont volontairement distingués.

**Git, release et architecture**

| ID     | Critère                                                                       | Statut   | Preuve / constat                                                                                                           |
| ------ | ----------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| REL-01 | `verify` existe et passe                                                      | PASS     | `package.json` et L                                                                                                        |
| REL-02 | `verify:full` existe et passe                                                 | PASS     | `package.json` et L                                                                                                        |
| REL-03 | Arbre du candidat propre lors de sa validation                                | PASS     | `verify-release.mjs` et marqueur final L ; status vide au début de l'audit                                                 |
| REL-04 | Arbre courant prêt pour une livraison propre                                  | FAIL     | Présent rapport et preuves ajoutés après validation, non commités sous `doc/`                                              |
| REL-05 | SHA candidat identifié                                                        | PASS     | R et L : `e389396945ac869ce6c342678d18577693fc2c96`                                                                        |
| REL-06 | Même SHA réussi localement et dans les deux jobs GitHub Actions               | DEFERRED | Local prouvé par L ; aucune URL/succès CI exact disponible                                                                 |
| REL-07 | Aucun changement entre validation finale complète et livraison                | DEFERRED | Validation finale locale+CI non acquise ; ajouts documentaires à intégrer avant futur gel                                  |
| REL-08 | Artefact construit depuis le SHA validé                                       | DEFERRED | Aucune archive finale créée/attestée                                                                                       |
| REL-09 | `git diff --check` propre pour le code audité                                 | PASS     | Commande réelle sans sortie au début de l'audit ; rapport contrôlé séparément                                              |
| REL-10 | Node 24 et pnpm 11.19.0 utilisés                                              | PASS     | R : Node v24.21.0, pnpm 11.19.0, nvm chargé par shell                                                                      |
| HEX-01 | Monolithe modulaire                                                           | PASS     | Workspaces et deux applications ; `packages/backend/package.json`                                                          |
| HEX-02 | Backend interne                                                               | PASS     | Package `private`, entrée `server-only`, règles de frontières et scan bundles dans L                                       |
| HEX-03 | Aucune API autonome / microservice                                            | PASS     | Inventaire apps et scripts ; API hébergées dans l'application Pro                                                          |
| HEX-04 | Séparation hexagonale complète des modules critiques                          | FAIL     | Cartographie section 7 : acceptation et écritures contractuelles sans cas d'usage applicatif dédié                         |
| HEX-05 | Domaine actuel sans Next.js                                                   | PASS     | Lecture domain, règle ESLint et test de frontière exécuté dans L                                                           |
| HEX-06 | Domaine actuel sans Supabase                                                  | PASS     | Même preuve ; import interdit dans `architecture.test.ts`                                                                  |
| HEX-07 | Domaine actuel sans HTTP                                                      | PASS     | Recherche ciblée dans `modules/*/domain` sans occurrence et lecture des fichiers ; garde futur traitée séparément          |
| HEX-08 | Entrypoints validation/auth/mapping puis use-cases sur tous chemins critiques | FAIL     | `auth/actions.ts` appelle SDK/RPC directement ; `platform-administration.ts` orchestre des mutations critiques directement |
| HEX-09 | Aucun repository générique artificiel                                         | PASS     | Ports métier ciblés inventoriés section 7                                                                                  |
| HEX-10 | Aucun dossier hexagonal vide                                                  | PASS     | `find packages/backend/src/modules -type d -empty` sans résultat                                                           |

**Schéma attendu, table par table**

| ID    | Critère                                                                | Statut   | Preuve / constat                                                                                   |
| ----- | ---------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------- |
| DB-01 | PostGIS activé par migration                                           | PASS     | M1, extension réelle D et S1                                                                       |
| DB-02 | Organisations                                                          | PASS     | M2, `organizations` dans D                                                                         |
| DB-03 | Paramètres organisation                                                | PASS     | M2, `organization_settings` dans D                                                                 |
| DB-04 | Profils professionnels                                                 | PASS     | M2, `professional_profiles` dans D                                                                 |
| DB-05 | Memberships organisation                                               | PASS     | M2, `organization_memberships` dans D                                                              |
| DB-06 | Services                                                               | PASS     | M4, `services` dans D                                                                              |
| DB-07 | Memberships service                                                    | PASS     | M4, `service_memberships` dans D                                                                   |
| DB-08 | Platform admins                                                        | PASS     | M2, `platform_admins` dans D                                                                       |
| DB-09 | Invitations                                                            | PASS     | M4, `professional_invitations` dans D                                                              |
| DB-10 | Services des invitations                                               | PASS     | M4, `invitation_services` dans D                                                                   |
| DB-11 | Verticales                                                             | PASS     | M5, `verticals` dans D                                                                             |
| DB-12 | Catégories                                                             | PASS     | M5, `categories` dans D                                                                            |
| DB-13 | Configuration catégories/organisation                                  | PASS     | M5, `organization_categories` dans D                                                               |
| DB-14 | Territoires                                                            | PASS     | M6, `territories` dans D                                                                           |
| DB-15 | Contrats                                                               | PASS     | M6, `contracts` dans D                                                                             |
| DB-16 | Contract scopes                                                        | PASS     | M6, `contract_scopes` dans D                                                                       |
| DB-17 | Catégories contractuellement autorisées                                | PASS     | M6, `contract_scope_categories` dans D                                                             |
| DB-18 | Services contractuellement autorisables                                | PASS     | M6, `contract_scope_services` dans D                                                               |
| DB-19 | Calendriers                                                            | PASS     | M7, `service_schedules` dans D                                                                     |
| DB-20 | Versions de calendriers                                                | PASS     | M7, `service_schedule_versions` dans D                                                             |
| DB-21 | Jours explicites                                                       | PASS     | M7, `service_schedule_days` dans D                                                                 |
| DB-22 | Créneaux                                                               | PASS     | M7, `service_schedule_windows` dans D                                                              |
| DB-23 | Politiques SLA                                                         | PASS     | M8, `sla_policies` dans D                                                                          |
| DB-24 | Versions SLA                                                           | PASS     | M8, `sla_policy_versions` dans D                                                                   |
| DB-25 | Targets                                                                | PASS     | M8, `sla_targets` dans D                                                                           |
| DB-26 | Hold reasons                                                           | PASS     | M8, `hold_reasons` dans D                                                                          |
| DB-27 | Pause rules                                                            | PASS     | M8, `sla_pause_rules` dans D                                                                       |
| DB-28 | Audit events                                                           | PASS     | M3, `audit_events` dans D                                                                          |
| DB-29 | Aucune table report/intervention/transfert/notification métier         | PASS     | Inventaire exhaustif des 27 tables dans D et des huit migrations                                   |
| DB-30 | Supabase local accessible réellement                                   | PASS     | Requêtes D, SQL/I/E réussis dans L                                                                 |
| DB-31 | Preuve complète de `supabase start` pour la reconstruction du candidat | DEFERRED | Trace disponible : démarrage depuis backup ; pas de journal de reconstruction complet relié au SHA |
| DB-32 | Migrations appliquées dans la base observée                            | PASS     | Huit lignes dans `schema_migrations`, D                                                            |
| DB-33 | Migrations depuis base vide prouvées sur candidat final                | DEFERRED | Métadonnées d'une base existante insuffisantes ; L n'exécute pas cette préparation                 |
| DB-34 | `db reset` + seed prouvés par journal exact du candidat                | DEFERRED | Commande configurée, mais preuve autonome finale non conservée dans L                              |
| DB-35 | Tests SQL réels réussis                                                | PASS     | L : 69 assertions dans S1/S2                                                                       |
| DB-36 | Même reconstruction/résultat en CI                                     | DEFERRED | Workflow prévu, aucun résultat exactSHA attesté                                                    |

**Seeds, tenancy et permissions**

| ID      | Critère                                                                    | Statut | Preuve / constat                                                                                                 |
| ------- | -------------------------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------- |
| SEED-01 | Trois organisations fictives                                               | PASS   | `seed.sql`, S1 et D : 3                                                                                          |
| SEED-02 | Services                                                                   | PASS   | Seed : deux par organisation                                                                                     |
| SEED-03 | Users et rôles fictifs                                                     | PASS   | Seed : agent/supervisor/client_admin pour les trois organisations                                                |
| SEED-04 | Memberships organisation/service                                           | PASS   | Seed et lectures S1/I                                                                                            |
| SEED-05 | Territoires imbriqués                                                      | PASS   | Seed parent de territoire 2 ; S2 deux candidats imbriqués                                                        |
| SEED-06 | Territoires chevauchants                                                   | PASS   | Seed territoire 3 ; S2 chevauchement non imbriqué                                                                |
| SEED-07 | Contrats                                                                   | PASS   | Seed : trois contrats et scopes explicites                                                                       |
| SEED-08 | Horaires                                                                   | PASS   | Seed hebdomadaire et 24/7, versions publiées                                                                     |
| SEED-09 | SLA                                                                        | PASS   | Seed : trois politiques, trois targets chacune                                                                   |
| SEED-10 | Verticales/catégories                                                      | PASS   | Seed : Accessibilité et cinq catégories                                                                          |
| SEED-11 | Aucun signalement fictif                                                   | PASS   | Seed intégral et absence de table de report                                                                      |
| TEN-01  | Un professionnel, une seule organisation                                   | PASS   | M2 `UNIQUE(user_id)` ; S1 tentative deuxième organisation refusée                                                |
| TEN-02  | Plusieurs services possibles                                               | PASS   | M4 : clé unique membership/service, aucun UNIQUE membership seul                                                 |
| TEN-03  | Liens inter-organisations empêchés                                         | PASS   | FK composites M4/M6/M7/M8 ; S1 rejet service autre tenant                                                        |
| TEN-04  | `organization_id` là où nécessaire                                         | PASS   | Migrations : relations tenant composites ; profil rattaché via membership unique, référentiels globaux distincts |
| TEN-05  | Profil actif obligatoire pour accès client                                 | PASS   | `private.member`, unités policy ; S1 garde profil admin                                                          |
| TEN-06  | Membership actif obligatoire                                               | PASS   | `private.member`, I désactivation sans remplacer JWT                                                             |
| TEN-07  | Auth seul sans droits métier                                               | PASS   | I : utilisateur invité authentifié, services vides avant acceptation                                             |
| TEN-08  | Chaîne capacité/service/ownership                                          | PASS   | Unités policy, `service_access`, administration use-cases, S1/I ; portée professionnelle décrite section 8       |
| RBAC-01 | Agent voit son contexte                                                    | PASS   | S1 : son profil/membership uniquement ; E espace actif                                                           |
| RBAC-02 | Agent voit ses services autorisés                                          | PASS   | S1/I : seul ID service attendu                                                                                   |
| RBAC-03 | Agent sans administration                                                  | PASS   | S1 refuse `save_service`, contrats/audit invisibles                                                              |
| RBAC-04 | Supervisor voit ses services supervisés                                    | PASS   | S1 services limités ; modèle M4                                                                                  |
| RBAC-05 | Supervisor voit les membres nécessaires                                    | PASS   | S1/I : deux membres du service concerné                                                                          |
| RBAC-06 | Supervisor sans administration organisationnelle                           | PASS   | S1 et unités policy : mutation configuration refusée                                                             |
| RBAC-07 | Client admin gère utilisateurs/services/configurations de son tenant       | PASS   | RPC M4/M5/M7/M8 et cas d'usage ; I changements de membre, S1 calendrier/service, E service                       |
| RBAC-08 | Client admin lit le périmètre contractuel                                  | PASS   | S1 : un contrat visible ; policies M6                                                                            |
| RBAC-09 | Client admin lit l'audit organisation                                      | PASS   | S1 voit son événement avec acteur ; policy `audit_read`                                                          |
| RBAC-10 | Client admin ne peut élargir le contrat                                    | PASS   | S1 `save_contract` refusé, M6 `set_contract_scope` exige capacité plateforme                                     |
| RBAC-11 | Client admin n'hérite pas du rôle supervisor                               | PASS   | Rôle principal unique M2 ; `service_access` rôles agent/supervisor ; unités refus `report.claim`                 |
| RBAC-12 | Platform admin séparé des rôles clients                                    | PASS   | M2 table distincte ; S1 rôle client `platform_admin` rejeté                                                      |
| RBAC-13 | Capacités plateforme explicites                                            | PASS   | Check de liste M2 ; S2 capacité contrats insuffisante pour catalogue                                             |
| RBAC-14 | Pas de pouvoir via metadata Auth                                           | PASS   | I falsifie metadata ; audit toujours inaccessible                                                                |
| RBAC-15 | `service_memberships` porte agent et supervisor, sans table de supervision | PASS   | M4, policies et inventaire D                                                                                     |
| ADM-01  | Garde SQL du dernier admin active                                          | PASS   | Triggers M4 ; S1 refus séquentiel rétrogradation/profil inactif                                                  |
| ADM-02  | Deux rétrogradations concurrentes testées dans le scénario existant        | PASS   | I : deux requêtes, un succès, un admin restant ; même initiateur                                                 |
| ADM-03  | Preuve concurrente de rétrogradation indépendante à deux acteurs           | FAIL   | Scénario I utilise un seul JWT, ne distingue pas refus d'autorisation et refus invariant                         |
| ADM-04  | Suppression concurrente du dernier admin testée                            | FAIL   | Aucun scénario de suppression concurrente dans S1/S2/I                                                           |
| ADM-05  | Désactivation concurrente membership/profil du dernier admin testée        | FAIL   | Aucun scénario concurrent de désactivation dans I ; test profil S1 séquentiel                                    |

**RLS et contraintes SQL**

| ID     | Critère                                                  | Statut | Preuve / constat                                                                                  |
| ------ | -------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------- |
| RLS-01 | Policies réellement créées listées                       | PASS   | 27 policies dans D et section 8                                                                   |
| RLS-02 | Organisation A ne lit pas les données professionnelles B | PASS   | S1/I : lectures services/memberships exactes et limitées au tenant/périmètre                      |
| RLS-03 | Organisation A ne modifie pas B                          | PASS   | S1/I : mutation sur org-2 refusée ; E API renvoie 400 pour autre organisation                     |
| RLS-04 | Falsifier `organization_id` n'ouvre pas le tenant        | PASS   | Tentatives RPC inter-tenant S1/I/E ; FK composite et grants ; metadata I sans effet               |
| RLS-05 | Absence de service membership refuse l'accès au service  | PASS   | Unité service `other` refusé ; I lit uniquement le service attribué malgré autre service existant |
| RLS-06 | Membership désactivé bloque le JWT existant              | PASS   | I conserve le token, désactive le membre, lecture devient vide                                    |
| RLS-07 | Anonyme refusé                                           | PASS   | S1/I refus des données et du pont                                                                 |
| RLS-08 | Admin client ne modifie pas son contract scope           | PASS   | M6 `require_platform`, absence de droits DML ; S1 refus de modification contractuelle             |
| RLS-09 | Metadata Auth falsifiées sans effet                      | PASS   | I modifie role/org dans metadata ; aucun accès audit gagné                                        |
| RLS-10 | Platform admin limité à sa capacité                      | PASS   | S2 `contracts.manage` puis `save_vertical` refusé                                                 |
| RLS-11 | Service-role hors chemin métier ordinaire                | PASS   | SSR/session publique + JWT ; adaptateur invitation privilégié isolé ; code section 8              |
| RLS-12 | Grants minimaux et pont interdit aux clients             | PASS   | M1/M4 et quatre assertions privilèges effectifs S1                                                |
| SQL-01 | FK composites tenant                                     | PASS   | M4/M6/M7/M8 ; S1 rejet FK inter-tenant                                                            |
| SQL-02 | Membership organisation unique                           | PASS   | D contrainte et S1                                                                                |
| SQL-03 | Service membership unique                                | PASS   | D `UNIQUE(membership_id, service_id)`                                                             |
| SQL-04 | Rôles valides                                            | PASS   | Check M2/M4, S1 rôle plateforme refusé                                                            |
| SQL-05 | Invitation idempotente                                   | PASS   | M4 contraintes/verrou ; I même clé, même ID, conflit de payload refusé                            |
| SQL-06 | Géométries valides                                       | PASS   | M6, S1/S2 vide/SRID/auto-intersection refusés                                                     |
| SQL-07 | Horaires cohérents                                       | PASS   | M7, unités, S1/S2 publication et refus                                                            |
| SQL-08 | Versions publiées immuables                              | PASS   | Triggers M7/M8 ; S1/S2 modifications/suppression/scopes refusés                                   |
| SQL-09 | SLA positifs                                             | PASS   | M8 check `duration_seconds>0`, unités `validateTargets`                                           |
| SQL-10 | Audit append-only                                        | PASS   | M3 trigger et grants ; S1 refus de suppression                                                    |
| SQL-11 | Aucun UNIQUE nullable naïf pour quatre scopes SLA        | PASS   | D `UNIQUE NULLS NOT DISTINCT` ; quatre essais S1                                                  |
| SQL-12 | Même vigilance calendrier organisationnel nullable       | PASS   | D contrainte dédiée et S1 doublon rejeté                                                          |

**PostGIS, contrats, SLA et horaires**

| ID          | Critère                                                            | Statut | Preuve / constat                                                                      |
| ----------- | ------------------------------------------------------------------ | ------ | ------------------------------------------------------------------------------------- |
| GEO-01      | MultiPolygon 4326                                                  | PASS   | Type M6, geometries réelles seed, S1 SRID incorrect refusé                            |
| GEO-02      | Index GiST                                                         | PASS   | M6 et assertion S1                                                                    |
| GEO-03      | `ST_Covers` pour les frontières                                    | PASS   | Fonction candidats M6, S1/S2                                                          |
| GEO-04      | Intérieur couvert                                                  | PASS   | S2 points intérieurs dans tests de territoires imbriqués et chevauchants              |
| GEO-05      | Extérieur non couvert                                              | PASS   | S1 point `(-1,-1)` : zéro candidat                                                    |
| GEO-06      | Frontière incluse                                                  | PASS   | S1 `(0,0)` ; S2 bord de trou                                                          |
| GEO-07      | Trou exclu                                                         | PASS   | S2 point `(11.5,11.5)` non couvert                                                    |
| GEO-08      | Territoires emboîtés                                               | PASS   | Seed et S2 deux candidats                                                             |
| GEO-09      | Chevauchement sans inclusion                                       | PASS   | Seed et S2 deux candidats au point `(3.5,3.5)`                                        |
| GEO-10      | Plusieurs candidats sans gagnant artificiel                        | PASS   | RPC renvoie ensemble ; S2 cardinalité 2                                               |
| GEO-11      | Géométrie invalide rejetée                                         | PASS   | S2 auto-intersection refusée                                                          |
| GEO-12      | Mauvais SRID rejeté                                                | PASS   | S1 géométrie 3857 refusée                                                             |
| GEO-13      | Garde anti-cycle présente                                          | PASS   | M6 contrôle hiérarchie, S1 lien parent inversé refusé                                 |
| GEO-14      | Test isolant le contrôle récursif de cycle                         | FAIL   | Cas S1 déjà invalide géométriquement ; branche spécifique non isolée                  |
| CONTRACT-01 | Contrat distinct de l'organisation                                 | PASS   | M6 table/FK séparées                                                                  |
| CONTRACT-02 | Scopes distincts des contrats                                      | PASS   | M6 `contract_scopes`                                                                  |
| CONTRACT-03 | Client incapable de modifier contrats/scopes                       | PASS   | Grants/policies et RPC M6 ; refus S1                                                  |
| CONTRACT-04 | Catégories autorisées explicitement                                | PASS   | M6 association, candidats exigent catégorie liée                                      |
| CONTRACT-05 | Services autorisables explicitement                                | PASS   | M6 association composite et seed                                                      |
| CONTRACT-06 | Nouvelle catégorie non ajoutée automatiquement aux contrats        | PASS   | M5 création catégorie sans écriture scope ; M6 association explicite, pas de wildcard |
| CONTRACT-07 | Non-régression dynamique ajout catégorie / anciens contrats        | FAIL   | Aucun test créant la catégorie puis contrôlant les anciens scopes/candidats           |
| SLA-01      | Scope organisation                                                 | PASS   | M8 et doublon `(org,NULL,NULL)` refusé S1                                             |
| SLA-02      | Scope service                                                      | PASS   | M8 et doublon `(org,service,NULL)` refusé S1                                          |
| SLA-03      | Scope catégorie                                                    | PASS   | M8 et doublon `(org,NULL,category)` refusé S1                                         |
| SLA-04      | Scope service + catégorie                                          | PASS   | M8 et doublon combiné refusé S1                                                       |
| SLA-05      | Ordre futur service+catégorie > catégorie > service > organisation | PASS   | `sla/domain/policy.ts` et décisions versionnées                                       |
| SLA-06      | Pas de moteur SLA lié aux reports                                  | PASS   | Module limité à validation/publication ; aucune table report                          |
| SLA-07      | Trois targets attendues                                            | PASS   | M8 check kind et publication à trois cibles, unités, seed                             |
| SLA-08      | Durées > 0                                                         | PASS   | M8 et unités de validation                                                            |
| SLA-09      | Versions SLA publiées immuables                                    | PASS   | S1 cible modifiée et version supprimée refusées ; S2 scope                            |
| SLA-10      | Modèle conservant les anciennes versions                           | PASS   | M8 insertion d'une nouvelle version, pas d'écrasement, suppression publiée interdite  |
| SLA-11      | Publication successive SLA réussie et ancien contenu comparé       | FAIL   | S2 teste seulement `publish_sla` invalide ; seed ne teste pas deux publications RPC   |
| SLA-12      | Pause uniquement explicite par cible                               | PASS   | `sla/domain/policy.test.ts`, M8 associations de pause                                 |
| HOURS-01    | Plusieurs créneaux par jour                                        | PASS   | Seed, unités et publication S2                                                        |
| HOURS-02    | Chevauchement refusé                                               | PASS   | Unités et S2                                                                          |
| HOURS-03    | Adjacence acceptée                                                 | PASS   | Unités et S2 `[0,3600)` puis `[3600,86400)`                                           |
| HOURS-04    | Intervalles semi-ouverts                                           | PASS   | Validateurs M7/domain : contact autorisé, chevauchement strict refusé                 |
| HOURS-05    | Jour fermé explicite                                               | PASS   | Seed, unités et S2 refus de fenêtre sur jour fermé                                    |
| HOURS-06    | 24/7 explicite                                                     | PASS   | `always_open`, seed, S1 publication et unités DST                                     |
| HOURS-07    | Passage minuit représenté sur deux jours                           | PASS   | Publication S2 : dimanche `[82800,86400)`, lundi débutant à zéro                      |
| HOURS-08    | Fuseau IANA                                                        | PASS   | M7 validation `pg_timezone_names`, adaptateur, S1 mauvais fuseau refusé               |
| HOURS-09    | Résolution datée dimanche → lundi testée                           | FAIL   | Représentation testée, mais pas `windowsForDate` sur ces deux dates successives       |
| HOURS-10    | Pas de jours fériés Phase 2                                        | PASS   | Modèle M7 et application limités à semaine/fuseau/24/7                                |
| HOURS-11    | Nouvelle version calendrier conserve l'ancienne                    | PASS   | S1 publication suivie du compte à 2 ; immutabilité testée séparément                  |
| DST-01      | Heure ambiguë → première occurrence                                | PASS   | Unité Paris automne : `2026-10-25T00:30:00Z`                                          |
| DST-02      | Paris 02:30 inexistante → 03:00                                    | PASS   | Unité printemps : `2026-03-29T01:00:00Z`                                              |
| DST-03      | Journées réelles 23 h et 25 h                                      | PASS   | `windowsForDate` testé en 24/7                                                        |
| DST-04      | Transition non entière                                             | PASS   | Unité Australia/Lord_Howe, saut de 30 minutes                                         |
| DST-05      | Polyfill nécessaire dans runtime réel                              | PASS   | R : Temporal undefined sous Node24.21.0                                               |
| DST-06      | Adaptateur encapsulé backend                                       | PASS   | `schedules/infrastructure/temporal.ts`, port ZonedTime, règle/tests frontières        |

**Auth, invitations, audit et frontières automatiques**

| ID       | Critère                                                     | Statut | Preuve / constat                                                                    |
| -------- | ----------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------- |
| AUTH-01  | URLs professionnelles sur 3001                              | PASS   | `supabase/config.toml`, templates Auth, E                                           |
| AUTH-02  | Inscription publique désactivée                             | PASS   | Config globale et refus réel I                                                      |
| AUTH-03  | Login                                                       | PASS   | I et E avec vrai Auth                                                               |
| AUTH-04  | Invitation puis activation                                  | PASS   | I et E ; limite provider complet détaillée section 11                               |
| AUTH-05  | Définition mot de passe                                     | PASS   | E formulaire puis activation réussie                                                |
| AUTH-06  | Demande de récupération et expiration                       | PASS   | I endpoint recover, token recovery expiré refusé                                    |
| AUTH-07  | Recovery valide jusqu'au nouveau mot de passe et relogin    | FAIL   | Aucun scénario complet présent                                                      |
| AUTH-08  | Logout                                                      | PASS   | I et E                                                                              |
| AUTH-09  | Refresh session réel                                        | PASS   | I renouvellement réussi puis refus après logout ; proxy SSR présent                 |
| AUTH-10  | Callbacks contrôlés                                         | PASS   | Routes confirm/callback, unités allowlist, E callback invalide                      |
| AUTH-11  | Redirection externe malveillante refusée                    | PASS   | Unités différentes destinations dangereuses, E `next=https://evil.example`          |
| INV-01   | Clé d'idempotence                                           | PASS   | M4 contrainte et validation payload I                                               |
| INV-02   | Répétition sans doublon de réservation                      | PASS   | I deux mêmes clés, même ID                                                          |
| INV-03   | Concurrence de réservation                                  | PASS   | I `Promise.all` de deux requêtes réelles                                            |
| INV-04   | Concurrence de l'envoi applicatif complet                   | FAIL   | I n'exerce pas simultanément deux `invitation.send` via l'adaptateur réel           |
| INV-05   | Expiration métier                                           | PASS   | I force expires_at passé, acceptation refusée                                       |
| INV-06   | Réutilisation token/acceptation refusée                     | PASS   | I vérification token rejouée et deuxième acceptation refusées                       |
| INV-07   | Échec Auth après réservation métier testé                   | FAIL   | Unité teste refus avant provider, pas provider échouant après réserve réussie       |
| INV-08   | Échec SQL après Auth testé en unité                         | PASS   | Mock bind échoue une fois puis reprend dans `invite.test.ts`                        |
| INV-09   | Échec SQL réel après Auth puis reprise réelle               | FAIL   | I s'arrête entre étapes, sans provoquer un échec de bind réel                       |
| INV-10   | Reprise contrôlée des étapes séparées                       | PASS   | I identité déjà créée sans membership, puis association/acceptation réussies        |
| INV-11   | Aucun droit métier avant acceptation                        | PASS   | I zéro membership et lecture services vide avec JWT invité ; transaction M4         |
| INV-12   | Pas de suppression arbitraire d'identité préexistante       | PASS   | Adaptateur ne contient aucun deleteUser ; reprend par email exact                   |
| INV-13   | Fallback vers identité existante éprouvé avec provider réel | FAIL   | Pas de scénario de reprise complet via `invitationAdapters`                         |
| AUD-01   | Append-only                                                 | PASS   | M3 trigger d'immutabilité et grants ; S1                                            |
| AUD-02   | Acteur serveur réel                                         | PASS   | M3 auth.uid/system ; S1 acteur réel vérifié                                         |
| AUD-03   | Champ organisation                                          | PASS   | M3 champ et policy ; nullable pour global/système, profil initial décrit section 12 |
| AUD-04   | Type/id entité                                              | PASS   | M3 trigger TG_TABLE_NAME et ID de ligne                                             |
| AUD-05   | Action                                                      | PASS   | M3 TG_OP ; S1 INSERT service                                                        |
| AUD-06   | Old/new whitelist                                           | PASS   | M3 et champs déclarés M4–M8 ; S2 payload filtré                                     |
| AUD-07   | Correlation id de requête/commande                          | FAIL   | Aucun champ/propagation ; transaction_id seulement                                  |
| AUD-08   | Pas de secrets dans payload d'audit testé                   | PASS   | S2 regex et whitelist ; limite aux valeurs/champs testés                            |
| AUD-09   | Utilisateur ne peut modifier/supprimer le journal           | PASS   | Grants refusent UPDATE/DELETE, trigger immuable ; S1 DELETE refusé                  |
| AUD-10   | Toute table métier auditée                                  | PASS   | D : seul `audit_events` sans trigger `audit_mutation`                               |
| AUD-11   | Mutation et audit dans même transaction                     | PASS   | Triggers M3 ; S1/S2 rollback dans les deux sens                                     |
| AUD-12   | Échec d'audit rollbacke la mutation                         | PASS   | S1 injection de failure audit puis service absent                                   |
| AUD-13   | Logs techniques séparés                                     | PASS   | `platform/logger.ts` distinct des triggers SQL                                      |
| BOUND-01 | Test automatique domain → Supabase interdit                 | PASS   | `packages/types/src/architecture.test.ts`, L, contrôle R                            |
| BOUND-02 | Test automatique domain → Next interdit                     | PASS   | Même preuve                                                                         |
| BOUND-03 | Test automatique domain → HTTP interdit                     | FAIL   | R accepte http/https/node:http/node:https/axios/fetch ; règle et test absents       |
| BOUND-04 | Packages publics → backend privilégié interdit              | PASS   | Règle ESLint et test Phase 1 conservé, L                                            |

**Résultats de qualité, accessibilité et documentation**

| ID      | Critère                                                        | Statut   | Preuve / constat                                                                                          |
| ------- | -------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------- |
| QA-01   | Format                                                         | PASS     | L `prettier --check .` au SHA audité                                                                      |
| QA-02   | Lint                                                           | PASS     | L `eslint . --max-warnings 0`                                                                             |
| QA-03   | Typecheck                                                      | PASS     | L packages/apps/outils                                                                                    |
| QA-04   | Unit tests                                                     | PASS     | L 17/17                                                                                                   |
| QA-05   | SQL tests                                                      | PASS     | L 69 assertions                                                                                           |
| QA-06   | RLS tests réels                                                | PASS     | S1/S2/I dans L ; limites recensées individuellement                                                       |
| QA-07   | Auth tests présents                                            | PASS     | I/E dans L ; parcours manquants gardent FAIL ci-dessus                                                    |
| QA-08   | PostGIS tests présents                                         | PASS     | S1/S2 dans L                                                                                              |
| QA-09   | SLA tests présents                                             | PASS     | Unités et S1/S2 dans L                                                                                    |
| QA-10   | DST tests                                                      | PASS     | Unités horaires dans L                                                                                    |
| QA-11   | Audit tests                                                    | PASS     | S1/S2 dans L                                                                                              |
| QA-12   | Builds                                                         | PASS     | Citizen et Pro production dans L                                                                          |
| QA-13   | Playwright                                                     | PASS     | L 20/20 desktop/mobile                                                                                    |
| QA-14   | axe sur périmètre effectivement scanné                         | PASS     | E/E1 et L ; autres pages non couvertes ci-dessous                                                         |
| QA-15   | Audit dépendances                                              | PASS     | L « No known vulnerabilities found »                                                                      |
| QA-16   | Secret scan final exactSHA                                     | DEFERRED | Pas de preuve GitHub/exécution dédiée au SHA                                                              |
| QA-17   | Aucun retry masquant un défaut                                 | PASS     | Config `retries:0`, L aucun retry                                                                         |
| QA-18   | Phase 1 reste verte                                            | PASS     | E1 inchangé selon git diff, 12 E2E réussis et contrôles workspace L                                       |
| QA-19   | Tests unitaires dédiés priorités/catégories annoncés au plan   | FAIL     | Contraintes/DTO présents, pas de fichier de test métier dédié parmi les huit fichiers Vitest              |
| A11Y-01 | Axe login et espace                                            | PASS     | E scans explicites sans violations                                                                        |
| A11Y-02 | Axe de tous les nouveaux formulaires/états                     | FAIL     | Password/accept/recover non scannés exhaustivement                                                        |
| A11Y-03 | Activation clavier du login                                    | PASS     | E focus bouton puis Enter                                                                                 |
| A11Y-04 | Parcours clavier complet des nouveaux écrans                   | FAIL     | Absence de couverture dédiée de chaque parcours/état                                                      |
| A11Y-05 | Focus et retours d'erreur de chaque nouvel écran               | FAIL     | Focus de dialogue Phase 1 testé ; nouveaux états incomplets                                               |
| A11Y-06 | Labels des formulaires password/accept/login                   | PASS     | E `getByLabel`, code des formulaires                                                                      |
| A11Y-07 | Erreur callback annoncée par un alert                          | PASS     | E vérifie rôle et texte ; pas de validation lecteur d'écran                                               |
| A11Y-08 | Toutes les erreurs des nouveaux formulaires accessibles        | FAIL     | Aucune campagne complète des erreurs recovery/password/accept                                             |
| A11Y-09 | VoiceOver Phase 2                                              | DEFERRED | Aucun résultat manuel disponible                                                                          |
| A11Y-10 | TalkBack                                                       | DEFERRED | Absence d'environnement compatible validé                                                                 |
| DOC-01  | Livre Produit & Technique v1.1 courant                         | PASS     | Fichier `docs/references/ActiCiv_Livre_Produit_Technique_v1.1_FINAL_A4.docx`, lien `docs/README.md`       |
| DOC-02  | Master prompt conservé/référencé                               | PASS     | `docs/references/master-development-prompt.md`, index documentaire                                        |
| DOC-03  | Postmortem Phase 1 conservé                                    | PASS     | `docs/references/ActiCiv_Phase1_Postmortem.md`, lien index                                                |
| DOC-04  | Prompt Phase 2 HEX conservé/référencé                          | PASS     | `docs/references/ActiCiv_Prompt_Astra_Phase2_v1.1_HEX.md` et index                                        |
| DOC-05  | Proposition architecture Phase 2 conservée/référencée          | PASS     | `docs/references/ActiCiv_Phase2_Proposition_Architecture.md`, lien historique                             |
| DOC-06  | Décisions Phase 2 tracées                                      | PASS     | `ActiCiv_Phase2_Decisions.md`, précisions finales et approbation section 27 de ce document de référence   |
| DOC-07  | ADR structurantes mises à jour                                 | PASS     | ADR 004 tenancy, 005 géographie, 006 SLA, 007 audit ; complément ADR 003 qualité                          |
| DOC-08  | open-questions nettoyé des décisions arbitrées                 | PASS     | Liste réservée aux phases futures, décisions verrouillées explicitement nommées                           |
| DOC-09  | README/docs reconnaissent la clôture Phase 1                   | PASS     | README et index actualisés ; postmortem fait foi sur les anciens rapports historiques                     |
| DOC-10  | Mention du navigateur historique clairement séparée de Phase 2 | FAIL     | README dit encore « cette livraison » pour le navigateur temporaire de Phase 1 ; formulation à actualiser |

**Périmètre : aucune Phase 3**

| ID       | Critère                              | Statut | Preuve / constat                                                                       |
| -------- | ------------------------------------ | ------ | -------------------------------------------------------------------------------------- |
| SCOPE-01 | Pas de report citoyen                | PASS   | Aucune table ni route de création, inventaire migrations/apps                          |
| SCOPE-02 | Pas d'upload photo métier            | PASS   | Pas d'entrypoint ni adaptateur d'upload dans apps/modules                              |
| SCOPE-03 | Pas de tracking citoyen              | PASS   | Routes Citizen limitées aux fondations, build L                                        |
| SCOPE-04 | Pas de smart queue                   | PASS   | Aucun module/file d'opérations métier correspondant                                    |
| SCOPE-05 | Pas de claim                         | PASS   | Aucun cas d'usage ; chaîne `report.claim` seulement dans un test de refus              |
| SCOPE-06 | Pas d'intervention opérationnelle    | PASS   | Aucun modèle/route d'intervention ; `intervention` est uniquement un type de cible SLA |
| SCOPE-07 | Pas de transfert opérationnel        | PASS   | Aucune table ni use-case de transfert                                                  |
| SCOPE-08 | Pas de notification métier           | PASS   | Aucun workflow de notification ; emails invite/recovery limités à Auth                 |
| SCOPE-09 | Pas d'analytics produit              | PASS   | Aucun module d'analytics ; logs techniques distincts                                   |
| SCOPE-10 | Pas de moteur complet de routage     | PASS   | `coverage_candidates` retourne plusieurs candidats ; aucun gagnant/dispatch            |
| SCOPE-11 | Pas d'anti-abus complet              | PASS   | Aucun moteur ajouté ; protections de base Auth/origine restent des fondations          |
| SCOPE-12 | Pas de détection/fusion des doublons | PASS   | Aucune table ni use-case ; sujet futur dans open-questions                             |

## 28. Confirmation explicite : aucune Phase 3 commencée

**Aucune fonctionnalité de Phase 3 n'a été commencée dans le dépôt audité, ni pendant la production de ce rapport.** Les inventaires de tables, routes et modules ainsi que la sortie des builds appuient cette confirmation.

Les mots qui pourraient prêter à confusion ont une portée précise : `intervention` nomme une cible SLA, `report.claim` apparaît dans un test qui doit le refuser, les emails sont uniquement des invitations/récupérations Auth, et les candidats géographiques ne constituent pas un moteur de routage. Les écrans Citizen de fondation préexistants n'offrent aucun parcours de signalement.

## 29. Conclusion et condition de passage Phase 3

**La Phase 2 ne peut pas être déclarée terminée selon la checklist actuelle.** Son candidat conservé est valide pour les tests locaux effectivement présents, mais plusieurs critères obligatoires restent FAIL et des preuves de clôture restent DEFERRED.

Avant toute proposition de passage Phase 3, il faut traiter les écarts techniques et de couverture détaillés, compléter l'accessibilité, réunir la preuve de reconstruction de la base, intégrer les documents à la livraison, puis valider un commit propre identique en local et dans les deux jobs GitHub Actions. L'artefact devra provenir de ce commit et être identifié par son SHA. Toute modification ultérieure impose de refaire les validations concernées et la validation finale du nouveau SHA.

Patrick conserve la décision explicite de clôture et de passage à la phase suivante. La publication reste suspendue selon sa consigne. Ce rapport fournit les éléments de revue ; il n'autorise ni le démarrage de Phase 3 ni la présentation des éléments différés comme acquis.
