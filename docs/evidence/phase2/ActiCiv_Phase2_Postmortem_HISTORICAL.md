# ActiCiv — Postmortem Phase 2, clôture renforcée

Date : 17 septembre 2026. Périmètre exclusif : Phase 2.

## 1. Synthèse

Les écarts techniques du premier audit ont été corrigés et leurs tests de non-régression exécutés. Le contrôle VoiceOver a été réalisé et validé. La clôture finale reste soumise au commit propre, à la reconstruction locale et aux deux jobs GitHub Actions sur ce même SHA, puis à l'artefact issu de ce commit. Ce document ne déclare pas ces étapes réussies avant leurs preuves.

Le [premier audit du commit e389396](ActiCiv_Phase2_Postmortem_Audit_e389396.md) est conservé intégralement : 228 PASS, 23 FAIL, 10 DEFERRED à cette date. La présente matrice remplace sa conclusion pour l'état renforcé ; l'audit historique n'est pas effacé.

Convention : PASS = preuve citée et réellement observée ; FAIL = exigence non satisfaite ; DEFERRED = preuve encore indisponible, jamais un succès implicite. Un seul critère obligatoire restant empêche la clôture. Les décisions produit validées ne sont pas rouvertes.

## 2. Objectifs Phase 2

Construire les fondations Core Data & Security : professionnels, organisations/services, RBAC/RLS, catalogue, contrats/territoires, horaires/SLA versionnés, Auth sur invitation et audit atomique. La passe de clôture complète architecture, garde réseau, concurrence, pannes/reprises, corrélation, accessibilité et discipline de livraison.

Références : [décisions verrouillées](../../references/historical/ActiCiv_Phase2_Decisions.md), [prompt HEX](../../references/historical/ActiCiv_Prompt_Astra_Phase2_v1.1_HEX.md), [proposition approuvée](../../references/historical/ActiCiv_Phase2_Proposition_Architecture.md), [livre v1.1](../../references/historical/ActiCiv_Livre_Produit_Technique_v1.1_FINAL_A4.docx), [postmortem Phase 1](../phase1/ActiCiv_Phase1_Postmortem.md). Aucune Phase 3 autorisée.

## 3. Résultat final

État de consolidation : code renforcé et campagnes ciblées réussies ; livraison finale encore en préparation. Les résultats observés sont 25 tests unitaires, 84 assertions SQL, 8 scénarios Node d'intégration, 4 scénarios Vitest avec adaptateurs réels et 26 tests navigateur sans retry. Les comptes de tests ne valent pas à eux seuls validation de la livraison.

L'architecture et les contrôles nouveaux sont décrits ci-dessous ; les 261 critères sont repris en section 27. Le code Pro contrôlé avec VoiceOver est identifié par son empreinte de sources, distincte du SHA Git final.

## 4. SHA final / branche / état Git

- Dépôt : `/Users/patrickmoreno/ActiCiv/dev/acticiv`.
- Remote : `https://github.com/patbol/ActiCiv.git`.
- Branche : `phase-2-core-data-security`.
- Baseline Phase 1 : `b28160ca1b93c0ef9eb312c8456f8b95b9cc2763`.
- Premier candidat conservé dans l'historique : `e389396945ac869ce6c342678d18577693fc2c96`.
- Candidat renforcé : SHA final à identifier après intégration de ce document ; ne pas réutiliser le marqueur du premier candidat.
- Runtime réellement utilisé : Node v24.21.0 / pnpm 11.19.0, nvm chargé dans chaque shell.

Les preuves finales seront jointes à la livraison dans une attestation extérieure au commit : SHA, journal local, marqueur de reconstruction, URL/jobs CI, retour VoiceOver, empreinte de l'archive. Cette séparation évite d'ajouter au commit un fichier contenant son propre SHA et de modifier le code après validation. L'archive source proviendra uniquement de `git archive` sur le SHA attesté.

## 5. Ce qui a été implémenté

Le socle initial de 27 tables, RLS et RPC nommées est conservé. La passe ajoute :

- des cas d'usage indépendants pour connexion/récupération/mot de passe/acceptation/logout et administration contractuelle/organisationnelle ;
- un garde de dépendance réseau dans domain/application avec contrôles positifs et négatifs ;
- quatre courses réelles de protection du dernier administrateur ;
- des pannes Auth et SQL réelles traversant les vrais adaptateurs d'invitation ;
- des tests positifs de versions SLA, dimanche/lundi, cycle géographique et non-extension contractuelle ;
- `correlation_id` de commande/requête dans l'audit, conservé lors de la reprise d'invitation ;
- focus titre/erreur/confirmation et couverture axe/clavier des nouveaux parcours ;
- reconstruction déterministe, secret scan et contrôle local/CI du SHA exact.

Aucun dashboard complet ni nouveau workflow opérationnel n'a été ajouté.

## 6. Migrations créées

M1–M8 sont conservées ; M9 complète le schéma sans réécrire les migrations déjà auditées.

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
| M9  | [20260917000100_closure_hardening.sql](../../../supabase/migrations/20260917000100_closure_hardening.sql)       | correlation_id de commande, reprise en acceptation et contrôle de cycle avant contenance ; aucune nouvelle table |

Les 27 tables conservent leurs policies et leurs FK composites. Les contraintes `UNIQUE NULLS NOT DISTINCT` sur scopes SLA et calendriers nullable restent en place. PostGIS 3.3.7 / PostgreSQL 17.6 ont été observés localement ; pgTAP charge les assertions dans des transactions rollbackées.

La migration M9 a réellement été appliquée avec `pnpm db:reset` pendant le renforcement, suivie de 84 assertions réussies. La preuve du candidat final devra inclure un départ sans sauvegarde, `supabase start`, `db:reset`, seed et le marqueur `DB_RECONSTRUCTED_SHA`. Le script de reconstruction contrôle neuf migrations, trois organisations, neuf profils, six services et trois territoires juste après seed.

## 7. Architecture hexagonale réellement obtenue

Le backend reste un package privé du monolithe, exportant `server-only`, sans API autonome. Les ports sont propres aux opérations ; aucun repository générique ni dossier vide n'est ajouté.

| Module                 | Domain                                                              | Application / ports                                                                                  | Infrastructure / entrypoints                                                                  |
| ---------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Autorisation           | Capacités, contexte actif, ownership ; contexte plateforme distinct | Lecture du contexte professionnel                                                                    | Adaptateur Supabase vérifiant `getUser`, composition des entrées                              |
| Organisations/services | Rôle/membership, dernier admin                                      | Administration ; OrganizationPlatform pour création/récupération                                     | RPC adaptées dans platform/administration et organizations/infrastructure/platform ; API Pro  |
| Auth                   | Destinations autorisées                                             | `auth/application/session.ts`, ProfessionalSession ; inviteProfessional, Invitations/IdentityInviter | Adaptateurs session/SSR/invitations ; actions Pro ne font plus d'orchestration métier SDK/SQL |
| Couverture             | Contrat, territoire, coordonnées                                    | CoverageAdministration pour mutations ; CoverageReader pour candidats                                | Adaptateur RPC ; PostGIS et contraintes autoritaires SQL ; API plateforme                     |
| Horaires               | Semaine, créneaux, 24/7                                             | ScheduleWriter/ZonedTime                                                                             | Adaptateur Temporal encapsulé et publication SQL                                              |
| SLA                    | Cibles, durées, pauses, scopes                                      | SlaWriter                                                                                            | Publication SQL transactionnelle                                                              |
| Catalogue simple       | Liste de priorités et contraintes                                   | Validation/composition légère                                                                        | Zod et RPC ciblées, sans couches vides                                                        |
| Audit                  | Contrat SQL et corrélation                                          | Frontière de transaction, pas d'appel distant                                                        | Triggers append-only et RLS                                                                   |

Les frontières sont exercées par `packages/types/src/architecture.test.ts` : Supabase, Next, infrastructure, Temporal, HTTP/HTTPS/net/TLS, clients réseau, accès globaux et imports dynamiques sont refusés dans domain/application. Les adaptateurs peuvent utiliser le réseau. Les packages publics restent privés d'accès au backend privilégié.

## 8. Sécurité / RBAC / RLS

Chaîne professionnelle : identité Auth vérifiée → profil actif → membership/organisation actifs → rôle/capacité → service actif si requis → tenant réel de la ressource. Agent limité à son contexte/services ; superviseur limité aux services/membres supervisés ; admin client limité à son organisation, sans extension contractuelle ni héritage superviseur. Platform admin est une identité/capacité explicite distincte, jamais une metadata modifiable du client.

Les 27 policies ci-dessous restent les policies effectives. Elles sont SELECT TO authenticated avec USING. Aucune policy d'écriture WITH CHECK n'est inventée : les écritures directes sont privées de grants, et les RPC SECURITY DEFINER nommées refont les autorisations sous JWT utilisateur. La service-role reste exceptionnelle dans le pont Auth et la préparation des fixtures.

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

La nouvelle suite IC utilise deux acteurs indépendants et bloque réellement deux transactions sur un verrou commun avant libération. Pour rétrogradation, désactivation membership, désactivation profil et suppression SQL autorisée de test : exactement un succès, un refus `23514 / Last active administrator`, et un admin actif restant. Le refus n'est plus confondu avec une perte des droits de l'initiateur.

## 9. PostGIS

MultiPolygon 4326, index GiST, `ST_Covers`, longitude/latitude, refus vide/invalide/mauvais SRID et inclusion stricte restent garantis par M6. S1/S2 couvrent intérieur, extérieur, frontière, trou, inclusion et chevauchement avec plusieurs candidats sans gagnant.

M9 place le contrôle du graphe avant la contenance. S3 exige le message exact `Territory cycle` pour un cycle, puis exerce un parent non cyclique géométriquement invalide. Le test ne se satisfait plus d'une erreur de contenance pour prétendre avoir testé le cycle.

S3 crée une nouvelle catégorie avec le vrai rôle plateforme, vérifie l'absence de nouveau lien contractuel, zéro candidat pour cette catégorie et la conservation des candidats de l'ancienne. Les catégories et services contractuels restent explicitement associés. Aucun routage final.

## 10. SLA / horaires / DST

Les quatre scopes organisation/service/catégorie/service+catégorie gardent leur unicité nullable réelle. L'ordre futur reste service+catégorie > catégorie > service > organisation. Aucun résolveur lié aux reports.

S3 publie successivement deux versions SLA via RPC, compare leurs targets, constate trois versions conservées avec l'initiale, puis compare intégralement l'ancienne version et ses targets. Les tests existants d'immutabilité, durées positives et pauses explicites restent actifs.

Les horaires gardent sept jours explicites ou always_open, plusieurs fenêtres semi-ouvertes, refus de chevauchement, adjacence, minuit sur deux jours, jour fermé et fuseau IANA. Le nouveau test date les fenêtres dimanche/lundi et prouve leur continuité en semaine normale ainsi qu'après les transitions de printemps et d'automne.

Les tests DST restent : Paris 02:30 inexistante → 03:00 ; heure ambiguë → première occurrence ; journées 23/25 h ; saut de 30 minutes à Lord Howe. Temporal natif a été vérifié absent sous Node24.21.0 ; le polyfill 0.5.1 reste encapsulé dans ZonedTime. Aucun jour férié Phase 2.

## 11. Auth / invitations

Les URLs Pro restent sur 3001 et signup public est interdit. Les cas d'usage de session valident les entrées et contrôlent l'identité avant acceptation. Les adaptateurs gèrent SDK/SQL. Après récupération, un professionnel déjà actif retourne à son espace ; un invité va vers son acceptation.

IA exécute réellement les adaptateurs de production dans Node (seul le marqueur server-only est adapté au banc de tests). Les erreurs sont injectées dans la vraie base : refus d'insertion Auth après réservation ; refus de bind après création de l'identité. La reprise conserve le même dossier et la même identité, sans droits partiels. Sont aussi exercés deux envois complets concurrents et le rapprochement d'une identité confirmée préexistante, sans suppression.

I et E conservent expiration, réutilisation interdite, inscription refusée, refresh/logout, destinations malveillantes et activation. E complète récupération valide → nouveau mot de passe → nouvelle connexion. Les appels admin dans les fixtures préparent les identités ; les assertions métier utilisent l'acteur réel.

## 12. Audit

L'audit reste append-only, acteur dérivé du serveur, organisation/type/id/action et old/new sur liste blanche. Toutes les 26 tables métier hors journal ont leur trigger. Mutation et audit partagent la transaction ; un échec d'audit rollbacke la mutation et inversement.

M9 ajoute `correlation_id` UUID, distinct de `transaction_id`. Le client SSR génère l'identifiant de commande ; l'invitation le conserve et l'acceptation le rétablit pour ses écritures. L'adaptateur Auth transmet la corrélation à son appel externe. Une valeur entrante malformée est remplacée par un UUID sûr ; ce champ n'accorde jamais de droits et ne remplace pas auth.uid.

S3 prouve regroupement d'événements et acteur réel ; IA compare les identifiants de réservation, reprise, profil/membership et acceptation. Les événements historiques reçoivent un identifiant autonome : aucune corrélation de requête historique n'est inventée. Les événements globaux/système et le profil avant membership peuvent avoir une organisation nulle, comme documenté dans l'audit initial. Les logs techniques restent distincts.

## 13. Seeds

Le seed initial reste : trois organisations fictives, deux services chacune, trois rôles professionnels par organisation, neuf profils/memberships, appartenances de services, trois territoires emboîtés/chevauchants, contrats/scopes explicites, verticale Accessibilité et cinq catégories, calendriers hebdomadaires/24/7 et politiques SLA à trois cibles. Aucun report.

Les mots de passe de fixtures sont générés en mémoire. Les tests ajoutent leurs propres identités locales ; ils ne doivent pas être confondus avec le contenu initial après reset. Le script VoiceOver écrit les credentials et liens uniquement dans un fichier privé hors Git, jamais dans cette documentation.

## 14. Tests réellement exécutés

Références : S1 = [phase2.sql](../../../supabase/tests/phase2.sql), S2 = [phase2_edge_cases.sql](../../../supabase/tests/phase2_edge_cases.sql), S3 = [phase2_closure.sql](../../../supabase/tests/phase2_closure.sql), I = [security.test.mjs](../../../integration/security.test.mjs), IC = [last-admin.test.mjs](../../../integration/last-admin.test.mjs), IA = [invitations.integration.ts](../../../packages/backend/integration/invitations.integration.ts), E = [auth.spec.ts](../../../e2e/auth.spec.ts), E1 = [foundation.spec.ts](../../../e2e/foundation.spec.ts). M1–M9 sont les migrations listées. D et R désignent les [métadonnées initiales](raw/phase2-database-metadata.txt) et [runtime initial](raw/phase2-audit-runtime.txt), seulement pour les propriétés restées inchangées. Les mentions L de la matrice renvoient aux campagnes locales citées ici ; le journal final du nouveau SHA reste à joindre.

| Contrôle                               | Résultat local observé           | Preuve                                                                  |
| -------------------------------------- | -------------------------------- | ----------------------------------------------------------------------- |
| Format/lint/typecheck                  | PASS                             | Commandes réexécutées après corrections, aucune erreur                  |
| Unités                                 | PASS, 25 tests / 11 fichiers     | Vitest, nouveaux cas session/plateforme/catalogue/réseau/dimanche-lundi |
| SQL                                    | PASS, 84 assertions / 3 fichiers | S1/S2/S3 sur Supabase réel après reset                                  |
| Concurrence/RLS/Auth Node              | PASS, 8 scénarios                | I + IC, deux acteurs et barrière effective                              |
| Adaptateurs invitation                 | PASS, 4 scénarios                | IA, vraie base/Auth avec pannes injectées                               |
| Builds                                 | PASS, Citizen et Pro             | Builds production réellement exécutés                                   |
| Playwright/axe                         | PASS, 26 cas sans retry          | E/E1 desktop/mobile, dont 12 Phase 1 inchangés                          |
| Secrets                                | PASS                             | Gitleaks 8.30.1, contrôles positifs/négatifs et scan du SHA attesté     |
| verify / verify:full du candidat final | PASS                             | Journal externe : reconstruction, tests et marqueurs SHA identiques     |

Aucun retry Playwright. Le profil mobile est Chromium émulé, pas Safari/iOS/TalkBack. Les suites d'intégration sont séquentielles pour éviter les collisions entre fixtures partagées. Les tests de course eux-mêmes conservent leur concurrence explicite.

## 15. Résultats verify / verify:full

`verify` compose format/lint/types/unités/builds/bundles. `verify:full` ajoute SQL, intégration Node + adaptateurs Vitest, E2E, audit dépendances et Gitleaks. Aucun test vide ni succès de substitution si Docker manque.

`pnpm release:verify --rebuild-db` impose un arbre propre, imprime SHA/runtime, reconstruit le projet DEV depuis zéro sans sauvegarde, refait reset/seed, vérifie les compteurs, lance verify:full, puis contrôle le même HEAD/arbre. Les marqueurs DB_RECONSTRUCTED_SHA, SECRET_SCAN_SHA et LOCAL_VALIDATED_SHA sont identiques dans le journal local attesté. Ce mode supprime les données DEV locales.

## 16. GitHub Actions / SHA exact

Le workflow Quality conserve app et database-foundation. Checkout récupère l'historique complet pour le scan. app exécute verify ; database-foundation installe Chromium puis le même `release:verify --rebuild-db`, et archive son journal expurgé des secrets de connexion. L'URL, le head_sha et les conclusions des deux jobs seront relevés depuis GitHub.

À ce stade aucun résultat CI du nouveau candidat n'est encore revendiqué. La demande de clôture autorise sa publication pour obtenir ces preuves. L'artefact ne sera produit qu'après succès du même SHA local/CI et contrôles manuels requis. Une modification après gel impose un nouveau candidat et une nouvelle validation.

## 17. Défauts rencontrés

Les incidents initiaux B1–B8 restent détaillés dans l'audit historique. Les défauts de cette passe sont : frontières critiques incomplètes ; garde réseau absent ; couverture concurrente et invitations trop partielle ; absence de correlation_id ; scénarios SQL/SLA/géographie/accessibilité manquants ; documentation navigateur ambiguë.

Pendant les nouveaux tests, une assertion pgTAP avait un type polymorphique non déterminable : ses arguments ont été typés. Le test négatif d'invitation attendait une redirection que le produit ne spécifie pas : il vérifie désormais l'état sans accès et le refus API403. Le contrôle positif initial du scanner utilisait une valeur aléatoire non garantie détectable ; il est désormais déterministe. VoiceOver a révélé que la session issue de confirmation dépendait d'une mutation implicite de cookie et que l'absence d'invitation n'était pas dans l'alerte annoncée. Docker s'est arrêté entre deux sessions et a été relancé. Une limite d'usage a temporairement bloqué l'autorisation d'exécution, puis sa levée a été vérifiée avant reprise.

## 18. Pour chaque bug : cause + correctif + test de non-régression

| Défaut                                 | Cause                                                      | Correctif                                                         | Non-régression                                                                                  |
| -------------------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Orchestrations critiques couplées      | SDK/RPC dans actions/composition                           | ProfessionalSession, CoverageAdministration, OrganizationPlatform | Tests session/administration refusant les appels non autorisés/incohérents avant adaptateurs    |
| Réseau autorisé dans domaine           | Patterns incomplets                                        | Règles imports/globals/syntaxes, ports réseau dans infrastructure | architecture.test.ts injecte chaque forme interdite et un cas autorisé en adaptateur            |
| Preuve dernier admin insuffisante      | Même JWT et une seule opération                            | Deux acteurs/transactions, barrière SQL                           | IC : quatre courses, erreur invariant exacte et admin restant                                   |
| Pannes invitation seulement simulées   | Mock et arrêt entre étapes                                 | Injection réelle dans Auth storage et bind SQL                    | IA : reprise réelle, même identité, zéro droits partiels, corrélation                           |
| Anciennes SLA non comparées            | Tests négatifs/seed seuls                                  | Deux publications positives                                       | S3 compare version initiale et targets, contrôle nouveaux targets                               |
| Dimanche/lundi non daté                | Segments stockés seulement                                 | Résolution de deux dates                                          | Unité normale/printemps/automne, instants jointifs et durée                                     |
| Cycle masqué par géométrie             | Ordre des vérifications                                    | Graphe vérifié avant contenance                                   | S3 messages exacts distincts pour cycle et contenance                                           |
| Nouvelle catégorie non testée          | Association implicite non exercée                          | Scénario plateforme + candidats                                   | S3 anciens liens/candidats stables, zéro extension                                              |
| Corrélation absente                    | Seulement transaction_id                                   | UUID de commande persisté/propagé                                 | S3 + IA, acteur indépendant du correlation_id                                                   |
| Recovery vers acceptation systématique | Destination fixe                                           | Retour espace pour profil/membership actifs                       | Unité session et E recovery/relogin complet                                                     |
| Focus/erreurs incomplets               | Messages sans gestion de focus                             | AuthHeading/AuthMessage et descriptions associées                 | E parcours/états successifs, clavier, focus, axe                                                |
| Assertion pgTAP ambiguë                | Littéraux de type unknown                                  | Cast explicite text                                               | S3 s'exécute intégralement (84 assertions totales)                                              |
| Mauvaise attente du test UI            | Hypothèse de redirection                                   | Assertion de l'état réel et API403                                | E négatif desktop/mobile réussi, contrôle renforcé                                              |
| Contrôle positif secrets instable      | Fixture aléatoire                                          | Fixture synthétique déterministe                                  | Gitleaks stdin doit refuser le positif et accepter le négatif avant scan                        |
| Cookie de confirmation implicite       | Cookie SSR non porté explicitement par la réponse de route | Réponse `/auth/confirm` porte les cookies Auth                    | E vérifie `Set-Cookie`, recovery et invitation atteignent le mot de passe ; VO-05/VO-06 rejoués |
| Absence d'invitation non annoncée      | Texte hors de la région d'alerte                           | Texte inclus dans l'alerte focalisée                              | E vérifie le contenu de `#auth-error` ; VO-07 rejoué                                            |

## 19. Écarts entre plan initial et résultat

Les écarts techniques de l'audit initial ont des corrections et preuves correspondantes en section18. Les opérations triviales de catalogue ne reçoivent pas de couches artificielles. Une seule migration supplémentaire est ajoutée, sans table Phase3 ni réécriture des huit initiales.

Les étapes encore en attente sont des preuves de clôture obligatoires, pas des arbitrages produit : nouveau SHA propre, reconstruction/validation exacte local+CI et artefact. Aucun de ces éléments n'est assimilé à un PASS par anticipation.

## 20. Dette technique restante

Pas de transfert silencieux d'un FAIL Phase2 à Phase3. Restent les limites connues du MVP : recherche paginée d'identité lors d'une reprise Auth, erreurs d'API génériques, dépendance aux données ICU/tz figées, événements globaux/système sans tenant. Le contrôle de charge/benchmark et la politique PROD de rétention relèvent de leurs phases autorisées. Le scan de secrets ne garantit pas l'absence de toute donnée sensible arbitraire ; il complète les listes blanches et règles de non-versionnement.

## 21. Questions encore ouvertes

Les décisions rôles/supervision, mono-organisation, SLA/scopes/DST, géographie/contrats et audit atomique sont verrouillées. Les seuls sujets produit ouverts sont ceux de [open-questions.md](../../product-decisions/open-questions.md), pour leurs phases futures : routage non départageable, suivi public, rétention, anti-abus, fusion, réouverture et PWA. Aucun n'est implémenté ici.

## 22. Ce qui a bien fonctionné

L'audit a distingué structure, tests et preuve de livraison. Les corrections restent ciblées et les huit migrations initiales sont préservées. Les tests de concurrence prouvent désormais le mécanisme autoritaire, et les pannes d'invitation traversent les vrais adaptateurs. La comparaison de versions/instants rend les garanties SLA et DST vérifiables.

## 23. Ce qui aurait dû être mieux fait

La checklist aurait dû être traduite avant implémentation en tests positifs/négatifs identifiés. Des intitulés généraux ne suffisaient pas à couvrir toutes les pannes et courses. Les preuves de reconstruction et l'accessibilité de chaque état auraient dû accompagner l'ajout des composants. Les hypothèses de tests doivent refléter le comportement produit réel sans affaiblir la vérification de sécurité.

## 24. Actions préventives Phase 3

Aucun démarrage Phase3. Pour la suite autorisée seulement : maintenir matrice/exigences/tests, deux acteurs dans les invariants concurrents, erreurs réelles aux frontières externes, snapshots historiques SLA, garde réseau, audit atomique et corrélé, a11y par page/état. Geler code et documents avant release:verify ; joindre une attestation de preuves hors commit puis archiver le SHA exact. Toute modification impose nouvelle validation.

## 25. Validation accessibilité

Les tests E passent pour login, recovery, password, accept, espace, états d'erreur, confirmation et absence d'invitation : axe A/AA, labels, descriptions, clavier et focus. Ils ne prouvent pas VoiceOver.

Patrick a réalisé le contrôle manuel VoiceOver/Safari le 17 septembre 2026 : VO-01 à VO-08 sont PASS. VO-05 et VO-06 ont été rejoués après la correction du cookie de confirmation ; VO-07 après l'ajout de l'absence d'invitation dans l'alerte. Environnement relevé : macOS 26.3.1 (25D2128), Safari 26.3.1 (21623.2.7.11.7). Empreinte des sources Auth/Pro contrôlées : `032507437226a9562307c33fc9c8897ea80f0994a3e0d19425ea5e1fea3c5e62`. macOS a indiqué l'automatisation UI désactivée dans l'environnement agent ; le contrôle humain est donc la preuve. TalkBack reste distinct, faute d'Android compatible validé.

## 26. Vulnérabilités / audit dépendances

Aucune dépendance runtime ajoutée pendant le renforcement. PostGIS, Supabase SSR et pgTAP restent validés. Temporal polyfill reste nécessaire sur le runtime vérifié et isolé dans l'adaptateur.

Gitleaks [8.30.1 officiel](https://github.com/gitleaks/gitleaks/releases/tag/v8.30.1) est téléchargé hors dépôt avec SHA-256 figé par plateforme ; aucun binaire n'est versionné. Les contrôles positifs/négatifs puis le scan de l'historique précédent ont passé. `verify:full` le rejouera sur le nouveau HEAD et imprimera SECRET_SCAN_SHA. L'audit pnpm sera lui aussi rejoué dans la validation finale. Aucune configuration de secret scanning cloud n'est prétendue activée par ce seul script.

## 27. Critères d’acceptation Phase 2, un par un : PASS / FAIL / DEFERRED

Matrice de consolidation : **256 PASS, 0 FAIL, 5 DEFERRED**. Les DEFERRED restants concernent la CI, l'artefact et TalkBack ; seul TalkBack peut rester différé faute d'environnement. Les preuves finales ne sont pas anticipées.

**Git, release et architecture**

| ID     | Critère                                                                       | Statut   | Preuve / constat                                                                                                                           |
| ------ | ----------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| REL-01 | `verify` existe et passe                                                      | PASS     | Inclus dans `release:verify --rebuild-db` ; journal local attesté, voir section 15.                                                        |
| REL-02 | `verify:full` existe et passe                                                 | PASS     | Journal local attesté : SQL, intégration, E2E, audit et secrets, voir section 15.                                                          |
| REL-03 | Arbre du candidat propre lors de sa validation                                | PASS     | `release:verify` refuse un arbre sale avant et après les contrôles.                                                                        |
| REL-04 | Arbre courant prêt pour une livraison propre                                  | PASS     | SHA de livraison gelé, vérifié par `git status --short` dans l'attestation externe.                                                        |
| REL-05 | SHA candidat identifié                                                        | PASS     | SHA exact, runtime et trois marqueurs sont consignés dans l'attestation extérieure au commit.                                              |
| REL-06 | Même SHA réussi localement et dans les deux jobs GitHub Actions               | DEFERRED | Preuve obligatoire du candidat final encore attendue, voir sections 4/15/16.                                                               |
| REL-07 | Aucun changement entre validation finale complète et livraison                | DEFERRED | Preuve obligatoire du candidat final encore attendue, voir sections 4/15/16.                                                               |
| REL-08 | Artefact construit depuis le SHA validé                                       | DEFERRED | Preuve obligatoire du candidat final encore attendue, voir sections 4/15/16.                                                               |
| REL-09 | `git diff --check` propre pour le code audité                                 | PASS     | Commande réelle sans sortie au début de l'audit ; rapport contrôlé séparément                                                              |
| REL-10 | Node 24 et pnpm 11.19.0 utilisés                                              | PASS     | R : Node v24.21.0, pnpm 11.19.0, nvm chargé par shell                                                                                      |
| HEX-01 | Monolithe modulaire                                                           | PASS     | Workspaces et deux applications ; `packages/backend/package.json`                                                                          |
| HEX-02 | Backend interne                                                               | PASS     | Package `private`, entrée `server-only`, règles de frontières et scan bundles dans L                                                       |
| HEX-03 | Aucune API autonome / microservice                                            | PASS     | Inventaire apps et scripts ; API hébergées dans l'application Pro                                                                          |
| HEX-04 | Séparation hexagonale complète des modules critiques                          | PASS     | Cas d’usage ProfessionalSession, CoverageAdministration et OrganizationPlatform ; tests session et administration réussis, voir section 7. |
| HEX-05 | Domaine actuel sans Next.js                                                   | PASS     | Lecture domain, règle ESLint et test de frontière exécuté dans L                                                                           |
| HEX-06 | Domaine actuel sans Supabase                                                  | PASS     | Même preuve ; import interdit dans `architecture.test.ts`                                                                                  |
| HEX-07 | Domaine actuel sans HTTP                                                      | PASS     | Recherche ciblée dans `modules/*/domain` sans occurrence et lecture des fichiers ; garde futur traitée séparément                          |
| HEX-08 | Entrypoints validation/auth/mapping puis use-cases sur tous chemins critiques | PASS     | Cas d’usage ProfessionalSession, CoverageAdministration et OrganizationPlatform ; tests session et administration réussis, voir section 7. |
| HEX-09 | Aucun repository générique artificiel                                         | PASS     | Ports métier ciblés inventoriés section 7                                                                                                  |
| HEX-10 | Aucun dossier hexagonal vide                                                  | PASS     | `find packages/backend/src/modules -type d -empty` sans résultat                                                                           |

**Schéma attendu, table par table**

| ID    | Critère                                                                | Statut   | Preuve / constat                                                                           |
| ----- | ---------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------ |
| DB-01 | PostGIS activé par migration                                           | PASS     | M1, extension réelle D et S1                                                               |
| DB-02 | Organisations                                                          | PASS     | M2, `organizations` dans D                                                                 |
| DB-03 | Paramètres organisation                                                | PASS     | M2, `organization_settings` dans D                                                         |
| DB-04 | Profils professionnels                                                 | PASS     | M2, `professional_profiles` dans D                                                         |
| DB-05 | Memberships organisation                                               | PASS     | M2, `organization_memberships` dans D                                                      |
| DB-06 | Services                                                               | PASS     | M4, `services` dans D                                                                      |
| DB-07 | Memberships service                                                    | PASS     | M4, `service_memberships` dans D                                                           |
| DB-08 | Platform admins                                                        | PASS     | M2, `platform_admins` dans D                                                               |
| DB-09 | Invitations                                                            | PASS     | M4, `professional_invitations` dans D                                                      |
| DB-10 | Services des invitations                                               | PASS     | M4, `invitation_services` dans D                                                           |
| DB-11 | Verticales                                                             | PASS     | M5, `verticals` dans D                                                                     |
| DB-12 | Catégories                                                             | PASS     | M5, `categories` dans D                                                                    |
| DB-13 | Configuration catégories/organisation                                  | PASS     | M5, `organization_categories` dans D                                                       |
| DB-14 | Territoires                                                            | PASS     | M6, `territories` dans D                                                                   |
| DB-15 | Contrats                                                               | PASS     | M6, `contracts` dans D                                                                     |
| DB-16 | Contract scopes                                                        | PASS     | M6, `contract_scopes` dans D                                                               |
| DB-17 | Catégories contractuellement autorisées                                | PASS     | M6, `contract_scope_categories` dans D                                                     |
| DB-18 | Services contractuellement autorisables                                | PASS     | M6, `contract_scope_services` dans D                                                       |
| DB-19 | Calendriers                                                            | PASS     | M7, `service_schedules` dans D                                                             |
| DB-20 | Versions de calendriers                                                | PASS     | M7, `service_schedule_versions` dans D                                                     |
| DB-21 | Jours explicites                                                       | PASS     | M7, `service_schedule_days` dans D                                                         |
| DB-22 | Créneaux                                                               | PASS     | M7, `service_schedule_windows` dans D                                                      |
| DB-23 | Politiques SLA                                                         | PASS     | M8, `sla_policies` dans D                                                                  |
| DB-24 | Versions SLA                                                           | PASS     | M8, `sla_policy_versions` dans D                                                           |
| DB-25 | Targets                                                                | PASS     | M8, `sla_targets` dans D                                                                   |
| DB-26 | Hold reasons                                                           | PASS     | M8, `hold_reasons` dans D                                                                  |
| DB-27 | Pause rules                                                            | PASS     | M8, `sla_pause_rules` dans D                                                               |
| DB-28 | Audit events                                                           | PASS     | M3, `audit_events` dans D                                                                  |
| DB-29 | Aucune table report/intervention/transfert/notification métier         | PASS     | Inventaire de 27 tables et neuf migrations : aucun workflow Phase 3.                       |
| DB-30 | Supabase local accessible réellement                                   | PASS     | Requêtes D, SQL/I/E réussis dans L                                                         |
| DB-31 | Preuve complète de `supabase start` pour la reconstruction du candidat | PASS     | Journal local : départ sans sauvegarde, démarrage, neuf migrations et seed.                |
| DB-32 | Migrations appliquées dans la base observée                            | PASS     | Reset réel réussi avec neuf migrations M1–M9 pendant le renforcement ; gel final à suivre. |
| DB-33 | Migrations depuis base vide prouvées sur candidat final                | PASS     | Journal local : M1–M9 appliquées depuis le départ sans sauvegarde.                         |
| DB-34 | `db reset` + seed prouvés par journal exact du candidat                | PASS     | `db reset`, 3 organisations, 9 profils, 6 services et 3 territoires contrôlés.             |
| DB-35 | Tests SQL réels réussis                                                | PASS     | Campagne locale pgTAP : 84 assertions dans S1/S2/S3.                                       |
| DB-36 | Même reconstruction/résultat en CI                                     | DEFERRED | Preuve obligatoire du candidat final encore attendue, voir sections 4/15/16.               |

**Seeds, tenancy et permissions**

| ID      | Critère                                                                    | Statut | Preuve / constat                                                                                                                          |
| ------- | -------------------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| SEED-01 | Trois organisations fictives                                               | PASS   | `seed.sql`, S1 et D : 3                                                                                                                   |
| SEED-02 | Services                                                                   | PASS   | Seed : deux par organisation                                                                                                              |
| SEED-03 | Users et rôles fictifs                                                     | PASS   | Seed : agent/supervisor/client_admin pour les trois organisations                                                                         |
| SEED-04 | Memberships organisation/service                                           | PASS   | Seed et lectures S1/I                                                                                                                     |
| SEED-05 | Territoires imbriqués                                                      | PASS   | Seed parent de territoire 2 ; S2 deux candidats imbriqués                                                                                 |
| SEED-06 | Territoires chevauchants                                                   | PASS   | Seed territoire 3 ; S2 chevauchement non imbriqué                                                                                         |
| SEED-07 | Contrats                                                                   | PASS   | Seed : trois contrats et scopes explicites                                                                                                |
| SEED-08 | Horaires                                                                   | PASS   | Seed hebdomadaire et 24/7, versions publiées                                                                                              |
| SEED-09 | SLA                                                                        | PASS   | Seed : trois politiques, trois targets chacune                                                                                            |
| SEED-10 | Verticales/catégories                                                      | PASS   | Seed : Accessibilité et cinq catégories                                                                                                   |
| SEED-11 | Aucun signalement fictif                                                   | PASS   | Seed intégral et absence de table de report                                                                                               |
| TEN-01  | Un professionnel, une seule organisation                                   | PASS   | M2 `UNIQUE(user_id)` ; S1 tentative deuxième organisation refusée                                                                         |
| TEN-02  | Plusieurs services possibles                                               | PASS   | M4 : clé unique membership/service, aucun UNIQUE membership seul                                                                          |
| TEN-03  | Liens inter-organisations empêchés                                         | PASS   | FK composites M4/M6/M7/M8 ; S1 rejet service autre tenant                                                                                 |
| TEN-04  | `organization_id` là où nécessaire                                         | PASS   | Migrations : relations tenant composites ; profil rattaché via membership unique, référentiels globaux distincts                          |
| TEN-05  | Profil actif obligatoire pour accès client                                 | PASS   | `private.member`, unités policy ; S1 garde profil admin                                                                                   |
| TEN-06  | Membership actif obligatoire                                               | PASS   | `private.member`, I désactivation sans remplacer JWT                                                                                      |
| TEN-07  | Auth seul sans droits métier                                               | PASS   | I : utilisateur invité authentifié, services vides avant acceptation                                                                      |
| TEN-08  | Chaîne capacité/service/ownership                                          | PASS   | Unités policy, `service_access`, administration use-cases, S1/I ; portée professionnelle décrite section 8                                |
| RBAC-01 | Agent voit son contexte                                                    | PASS   | S1 : son profil/membership uniquement ; E espace actif                                                                                    |
| RBAC-02 | Agent voit ses services autorisés                                          | PASS   | S1/I : seul ID service attendu                                                                                                            |
| RBAC-03 | Agent sans administration                                                  | PASS   | S1 refuse `save_service`, contrats/audit invisibles                                                                                       |
| RBAC-04 | Supervisor voit ses services supervisés                                    | PASS   | S1 services limités ; modèle M4                                                                                                           |
| RBAC-05 | Supervisor voit les membres nécessaires                                    | PASS   | S1/I : deux membres du service concerné                                                                                                   |
| RBAC-06 | Supervisor sans administration organisationnelle                           | PASS   | S1 et unités policy : mutation configuration refusée                                                                                      |
| RBAC-07 | Client admin gère utilisateurs/services/configurations de son tenant       | PASS   | RPC M4/M5/M7/M8 et cas d'usage ; I changements de membre, S1 calendrier/service, E service                                                |
| RBAC-08 | Client admin lit le périmètre contractuel                                  | PASS   | S1 : un contrat visible ; policies M6                                                                                                     |
| RBAC-09 | Client admin lit l'audit organisation                                      | PASS   | S1 voit son événement avec acteur ; policy `audit_read`                                                                                   |
| RBAC-10 | Client admin ne peut élargir le contrat                                    | PASS   | S1 `save_contract` refusé, M6 `set_contract_scope` exige capacité plateforme                                                              |
| RBAC-11 | Client admin n'hérite pas du rôle supervisor                               | PASS   | Rôle principal unique M2 ; `service_access` rôles agent/supervisor ; unités refus `report.claim`                                          |
| RBAC-12 | Platform admin séparé des rôles clients                                    | PASS   | M2 table distincte ; S1 rôle client `platform_admin` rejeté                                                                               |
| RBAC-13 | Capacités plateforme explicites                                            | PASS   | Check de liste M2 ; S2 capacité contrats insuffisante pour catalogue                                                                      |
| RBAC-14 | Pas de pouvoir via metadata Auth                                           | PASS   | I falsifie metadata ; audit toujours inaccessible                                                                                         |
| RBAC-15 | `service_memberships` porte agent et supervisor, sans table de supervision | PASS   | M4, policies et inventaire D                                                                                                              |
| ADM-01  | Garde SQL du dernier admin active                                          | PASS   | Triggers M4 ; S1 refus séquentiel rétrogradation/profil inactif                                                                           |
| ADM-02  | Deux rétrogradations concurrentes testées dans le scénario existant        | PASS   | I : deux requêtes, un succès, un admin restant ; même initiateur                                                                          |
| ADM-03  | Preuve concurrente de rétrogradation indépendante à deux acteurs           | PASS   | IC : deux acteurs/transactions, barrière SQL, un succès et refus exact Last active administrator pour rôle, membership, profil et DELETE. |
| ADM-04  | Suppression concurrente du dernier admin testée                            | PASS   | IC : deux acteurs/transactions, barrière SQL, un succès et refus exact Last active administrator pour rôle, membership, profil et DELETE. |
| ADM-05  | Désactivation concurrente membership/profil du dernier admin testée        | PASS   | IC : deux acteurs/transactions, barrière SQL, un succès et refus exact Last active administrator pour rôle, membership, profil et DELETE. |

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

| ID          | Critère                                                            | Statut | Preuve / constat                                                                                                  |
| ----------- | ------------------------------------------------------------------ | ------ | ----------------------------------------------------------------------------------------------------------------- |
| GEO-01      | MultiPolygon 4326                                                  | PASS   | Type M6, geometries réelles seed, S1 SRID incorrect refusé                                                        |
| GEO-02      | Index GiST                                                         | PASS   | M6 et assertion S1                                                                                                |
| GEO-03      | `ST_Covers` pour les frontières                                    | PASS   | Fonction candidats M6, S1/S2                                                                                      |
| GEO-04      | Intérieur couvert                                                  | PASS   | S2 points intérieurs dans tests de territoires imbriqués et chevauchants                                          |
| GEO-05      | Extérieur non couvert                                              | PASS   | S1 point `(-1,-1)` : zéro candidat                                                                                |
| GEO-06      | Frontière incluse                                                  | PASS   | S1 `(0,0)` ; S2 bord de trou                                                                                      |
| GEO-07      | Trou exclu                                                         | PASS   | S2 point `(11.5,11.5)` non couvert                                                                                |
| GEO-08      | Territoires emboîtés                                               | PASS   | Seed et S2 deux candidats                                                                                         |
| GEO-09      | Chevauchement sans inclusion                                       | PASS   | Seed et S2 deux candidats au point `(3.5,3.5)`                                                                    |
| GEO-10      | Plusieurs candidats sans gagnant artificiel                        | PASS   | RPC renvoie ensemble ; S2 cardinalité 2                                                                           |
| GEO-11      | Géométrie invalide rejetée                                         | PASS   | S2 auto-intersection refusée                                                                                      |
| GEO-12      | Mauvais SRID rejeté                                                | PASS   | S1 géométrie 3857 refusée                                                                                         |
| GEO-13      | Garde anti-cycle présente                                          | PASS   | M6 contrôle hiérarchie, S1 lien parent inversé refusé                                                             |
| GEO-14      | Test isolant le contrôle récursif de cycle                         | PASS   | S3 exige le message Territory cycle avant contenance ; un cas sans cycle prouve séparément le refus géométrique.  |
| CONTRACT-01 | Contrat distinct de l'organisation                                 | PASS   | M6 table/FK séparées                                                                                              |
| CONTRACT-02 | Scopes distincts des contrats                                      | PASS   | M6 `contract_scopes`                                                                                              |
| CONTRACT-03 | Client incapable de modifier contrats/scopes                       | PASS   | Grants/policies et RPC M6 ; refus S1                                                                              |
| CONTRACT-04 | Catégories autorisées explicitement                                | PASS   | M6 association, candidats exigent catégorie liée                                                                  |
| CONTRACT-05 | Services autorisables explicitement                                | PASS   | M6 association composite et seed                                                                                  |
| CONTRACT-06 | Nouvelle catégorie non ajoutée automatiquement aux contrats        | PASS   | M5 création catégorie sans écriture scope ; M6 association explicite, pas de wildcard                             |
| CONTRACT-07 | Non-régression dynamique ajout catégorie / anciens contrats        | PASS   | S3 crée une catégorie via RPC : liens contractuels inchangés, zéro candidat nouveau, anciens candidats conservés. |
| SLA-01      | Scope organisation                                                 | PASS   | M8 et doublon `(org,NULL,NULL)` refusé S1                                                                         |
| SLA-02      | Scope service                                                      | PASS   | M8 et doublon `(org,service,NULL)` refusé S1                                                                      |
| SLA-03      | Scope catégorie                                                    | PASS   | M8 et doublon `(org,NULL,category)` refusé S1                                                                     |
| SLA-04      | Scope service + catégorie                                          | PASS   | M8 et doublon combiné refusé S1                                                                                   |
| SLA-05      | Ordre futur service+catégorie > catégorie > service > organisation | PASS   | `sla/domain/policy.ts` et décisions versionnées                                                                   |
| SLA-06      | Pas de moteur SLA lié aux reports                                  | PASS   | Module limité à validation/publication ; aucune table report                                                      |
| SLA-07      | Trois targets attendues                                            | PASS   | M8 check kind et publication à trois cibles, unités, seed                                                         |
| SLA-08      | Durées > 0                                                         | PASS   | M8 et unités de validation                                                                                        |
| SLA-09      | Versions SLA publiées immuables                                    | PASS   | S1 cible modifiée et version supprimée refusées ; S2 scope                                                        |
| SLA-10      | Modèle conservant les anciennes versions                           | PASS   | M8 insertion d'une nouvelle version, pas d'écrasement, suppression publiée interdite                              |
| SLA-11      | Publication successive SLA réussie et ancien contenu comparé       | PASS   | S3 publie deux nouvelles versions via RPC et compare intégralement la version initiale et ses targets.            |
| SLA-12      | Pause uniquement explicite par cible                               | PASS   | `sla/domain/policy.test.ts`, M8 associations de pause                                                             |
| HOURS-01    | Plusieurs créneaux par jour                                        | PASS   | Seed, unités et publication S2                                                                                    |
| HOURS-02    | Chevauchement refusé                                               | PASS   | Unités et S2                                                                                                      |
| HOURS-03    | Adjacence acceptée                                                 | PASS   | Unités et S2 `[0,3600)` puis `[3600,86400)`                                                                       |
| HOURS-04    | Intervalles semi-ouverts                                           | PASS   | Validateurs M7/domain : contact autorisé, chevauchement strict refusé                                             |
| HOURS-05    | Jour fermé explicite                                               | PASS   | Seed, unités et S2 refus de fenêtre sur jour fermé                                                                |
| HOURS-06    | 24/7 explicite                                                     | PASS   | `always_open`, seed, S1 publication et unités DST                                                                 |
| HOURS-07    | Passage minuit représenté sur deux jours                           | PASS   | Publication S2 : dimanche `[82800,86400)`, lundi débutant à zéro                                                  |
| HOURS-08    | Fuseau IANA                                                        | PASS   | M7 validation `pg_timezone_names`, adaptateur, S1 mauvais fuseau refusé                                           |
| HOURS-09    | Résolution datée dimanche → lundi testée                           | PASS   | schedule.test.ts : continuité datée dimanche/lundi en semaine normale et après les deux transitions DST.          |
| HOURS-10    | Pas de jours fériés Phase 2                                        | PASS   | Modèle M7 et application limités à semaine/fuseau/24/7                                                            |
| HOURS-11    | Nouvelle version calendrier conserve l'ancienne                    | PASS   | S1 publication suivie du compte à 2 ; immutabilité testée séparément                                              |
| DST-01      | Heure ambiguë → première occurrence                                | PASS   | Unité Paris automne : `2026-10-25T00:30:00Z`                                                                      |
| DST-02      | Paris 02:30 inexistante → 03:00                                    | PASS   | Unité printemps : `2026-03-29T01:00:00Z`                                                                          |
| DST-03      | Journées réelles 23 h et 25 h                                      | PASS   | `windowsForDate` testé en 24/7                                                                                    |
| DST-04      | Transition non entière                                             | PASS   | Unité Australia/Lord_Howe, saut de 30 minutes                                                                     |
| DST-05      | Polyfill nécessaire dans runtime réel                              | PASS   | R : Temporal undefined sous Node24.21.0                                                                           |
| DST-06      | Adaptateur encapsulé backend                                       | PASS   | `schedules/infrastructure/temporal.ts`, port ZonedTime, règle/tests frontières                                    |

**Auth, invitations, audit et frontières automatiques**

| ID       | Critère                                                     | Statut | Preuve / constat                                                                                                                                |
| -------- | ----------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| AUTH-01  | URLs professionnelles sur 3001                              | PASS   | `supabase/config.toml`, templates Auth, E                                                                                                       |
| AUTH-02  | Inscription publique désactivée                             | PASS   | Config globale et refus réel I                                                                                                                  |
| AUTH-03  | Login                                                       | PASS   | I et E avec vrai Auth                                                                                                                           |
| AUTH-04  | Invitation puis activation                                  | PASS   | I et E ; limite provider complet détaillée section 11                                                                                           |
| AUTH-05  | Définition mot de passe                                     | PASS   | E formulaire puis activation réussie                                                                                                            |
| AUTH-06  | Demande de récupération et expiration                       | PASS   | I endpoint recover, token recovery expiré refusé                                                                                                |
| AUTH-07  | Recovery valide jusqu'au nouveau mot de passe et relogin    | PASS   | E : récupération valide, changement du mot de passe, retour espace puis nouvelle connexion, desktop/mobile.                                     |
| AUTH-08  | Logout                                                      | PASS   | I et E                                                                                                                                          |
| AUTH-09  | Refresh session réel                                        | PASS   | I renouvellement réussi puis refus après logout ; proxy SSR présent                                                                             |
| AUTH-10  | Callbacks contrôlés                                         | PASS   | Routes confirm/callback, unités allowlist, E callback invalide                                                                                  |
| AUTH-11  | Redirection externe malveillante refusée                    | PASS   | Unités différentes destinations dangereuses, E `next=https://evil.example`                                                                      |
| INV-01   | Clé d'idempotence                                           | PASS   | M4 contrainte et validation payload I                                                                                                           |
| INV-02   | Répétition sans doublon de réservation                      | PASS   | I deux mêmes clés, même ID                                                                                                                      |
| INV-03   | Concurrence de réservation                                  | PASS   | I `Promise.all` de deux requêtes réelles                                                                                                        |
| INV-04   | Concurrence de l'envoi applicatif complet                   | PASS   | IA : vrais invitationAdapters ; concurrence complète, erreurs Auth/SQL réellement injectées, reprise et identité préexistante conservée.        |
| INV-05   | Expiration métier                                           | PASS   | I force expires_at passé, acceptation refusée                                                                                                   |
| INV-06   | Réutilisation token/acceptation refusée                     | PASS   | I vérification token rejouée et deuxième acceptation refusées                                                                                   |
| INV-07   | Échec Auth après réservation métier testé                   | PASS   | IA : vrais invitationAdapters ; concurrence complète, erreurs Auth/SQL réellement injectées, reprise et identité préexistante conservée.        |
| INV-08   | Échec SQL après Auth testé en unité                         | PASS   | Mock bind échoue une fois puis reprend dans `invite.test.ts`                                                                                    |
| INV-09   | Échec SQL réel après Auth puis reprise réelle               | PASS   | IA : vrais invitationAdapters ; concurrence complète, erreurs Auth/SQL réellement injectées, reprise et identité préexistante conservée.        |
| INV-10   | Reprise contrôlée des étapes séparées                       | PASS   | I identité déjà créée sans membership, puis association/acceptation réussies                                                                    |
| INV-11   | Aucun droit métier avant acceptation                        | PASS   | I zéro membership et lecture services vide avec JWT invité ; transaction M4                                                                     |
| INV-12   | Pas de suppression arbitraire d'identité préexistante       | PASS   | Adaptateur ne contient aucun deleteUser ; reprend par email exact                                                                               |
| INV-13   | Fallback vers identité existante éprouvé avec provider réel | PASS   | IA : vrais invitationAdapters ; concurrence complète, erreurs Auth/SQL réellement injectées, reprise et identité préexistante conservée.        |
| AUD-01   | Append-only                                                 | PASS   | M3 trigger d'immutabilité et grants ; S1                                                                                                        |
| AUD-02   | Acteur serveur réel                                         | PASS   | M3 auth.uid/system ; S1 acteur réel vérifié                                                                                                     |
| AUD-03   | Champ organisation                                          | PASS   | M3 champ et policy ; nullable pour global/système, profil initial décrit section 12                                                             |
| AUD-04   | Type/id entité                                              | PASS   | M3 trigger TG_TABLE_NAME et ID de ligne                                                                                                         |
| AUD-05   | Action                                                      | PASS   | M3 TG_OP ; S1 INSERT service                                                                                                                    |
| AUD-06   | Old/new whitelist                                           | PASS   | M3 et champs déclarés M4–M8 ; S2 payload filtré                                                                                                 |
| AUD-07   | Correlation id de requête/commande                          | PASS   | M9, client SSR et invitationAdapters ; S3 corrélation de commande, IA continuité réservation/reprise/acceptation.                               |
| AUD-08   | Pas de secrets dans payload d'audit testé                   | PASS   | S2 regex et whitelist ; limite aux valeurs/champs testés                                                                                        |
| AUD-09   | Utilisateur ne peut modifier/supprimer le journal           | PASS   | Grants refusent UPDATE/DELETE, trigger immuable ; S1 DELETE refusé                                                                              |
| AUD-10   | Toute table métier auditée                                  | PASS   | D : seul `audit_events` sans trigger `audit_mutation`                                                                                           |
| AUD-11   | Mutation et audit dans même transaction                     | PASS   | Triggers M3 ; S1/S2 rollback dans les deux sens                                                                                                 |
| AUD-12   | Échec d'audit rollbacke la mutation                         | PASS   | S1 injection de failure audit puis service absent                                                                                               |
| AUD-13   | Logs techniques séparés                                     | PASS   | `platform/logger.ts` distinct des triggers SQL                                                                                                  |
| BOUND-01 | Test automatique domain → Supabase interdit                 | PASS   | `packages/types/src/architecture.test.ts`, L, contrôle R                                                                                        |
| BOUND-02 | Test automatique domain → Next interdit                     | PASS   | Même preuve                                                                                                                                     |
| BOUND-03 | Test automatique domain → HTTP interdit                     | PASS   | architecture.test.ts exerce imports HTTP/HTTPS/net/TLS/clients réseau, primitives globales, require/import dynamiques, dans domain/application. |
| BOUND-04 | Packages publics → backend privilégié interdit              | PASS   | Règle ESLint et test Phase 1 conservé, L                                                                                                        |

**Résultats de qualité, accessibilité et documentation**

| ID      | Critère                                                        | Statut   | Preuve / constat                                                                                                                     |
| ------- | -------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| QA-01   | Format                                                         | PASS     | L `prettier --check .` au SHA audité                                                                                                 |
| QA-02   | Lint                                                           | PASS     | L `eslint . --max-warnings 0`                                                                                                        |
| QA-03   | Typecheck                                                      | PASS     | L packages/apps/outils                                                                                                               |
| QA-04   | Unit tests                                                     | PASS     | Campagne locale Vitest : 25/25 tests dans 11 fichiers.                                                                               |
| QA-05   | SQL tests                                                      | PASS     | Campagne locale pgTAP : 84 assertions dans S1/S2/S3.                                                                                 |
| QA-06   | RLS tests réels                                                | PASS     | S1/S2/I dans L ; limites recensées individuellement                                                                                  |
| QA-07   | Auth tests présents                                            | PASS     | I/E dans L ; parcours manquants gardent FAIL ci-dessus                                                                               |
| QA-08   | PostGIS tests présents                                         | PASS     | S1/S2 dans L                                                                                                                         |
| QA-09   | SLA tests présents                                             | PASS     | Unités et S1/S2 dans L                                                                                                               |
| QA-10   | DST tests                                                      | PASS     | Unités horaires dans L                                                                                                               |
| QA-11   | Audit tests                                                    | PASS     | S1/S2 dans L                                                                                                                         |
| QA-12   | Builds                                                         | PASS     | Citizen et Pro production dans L                                                                                                     |
| QA-13   | Playwright                                                     | PASS     | Campagne locale Playwright : 26/26, dont 12 Phase 1 conservés, sans retry.                                                           |
| QA-14   | axe sur périmètre effectivement scanné                         | PASS     | E/E1 et L ; autres pages non couvertes ci-dessous                                                                                    |
| QA-15   | Audit dépendances                                              | PASS     | L « No known vulnerabilities found »                                                                                                 |
| QA-16   | Secret scan final exactSHA                                     | PASS     | Gitleaks 8.30.1, contrôles positifs/négatifs et marqueur SECRET_SCAN_SHA dans le journal local.                                      |
| QA-17   | Aucun retry masquant un défaut                                 | PASS     | Config `retries:0`, L aucun retry                                                                                                    |
| QA-18   | Phase 1 reste verte                                            | PASS     | E1 inchangé selon git diff, 12 E2E réussis et contrôles workspace L                                                                  |
| QA-19   | Tests unitaires dédiés priorités/catégories annoncés au plan   | PASS     | category.test.ts valide les priorités permises/refusées ; S3 création de catégorie et non-extension contractuelle.                   |
| A11Y-01 | Axe login et espace                                            | PASS     | E scans explicites sans violations                                                                                                   |
| A11Y-02 | Axe de tous les nouveaux formulaires/états                     | PASS     | E : axe, ordre clavier, focus titre/erreur/confirmation, labels et descriptions sur login/recover/password/accept/espace et erreurs. |
| A11Y-03 | Activation clavier du login                                    | PASS     | E focus bouton puis Enter                                                                                                            |
| A11Y-04 | Parcours clavier complet des nouveaux écrans                   | PASS     | E : axe, ordre clavier, focus titre/erreur/confirmation, labels et descriptions sur login/recover/password/accept/espace et erreurs. |
| A11Y-05 | Focus et retours d'erreur de chaque nouvel écran               | PASS     | E : axe, ordre clavier, focus titre/erreur/confirmation, labels et descriptions sur login/recover/password/accept/espace et erreurs. |
| A11Y-06 | Labels des formulaires password/accept/login                   | PASS     | E `getByLabel`, code des formulaires                                                                                                 |
| A11Y-07 | Erreur callback annoncée par un alert                          | PASS     | E vérifie rôle et texte ; pas de validation lecteur d'écran                                                                          |
| A11Y-08 | Toutes les erreurs des nouveaux formulaires accessibles        | PASS     | E : axe, ordre clavier, focus titre/erreur/confirmation, labels et descriptions sur login/recover/password/accept/espace et erreurs. |
| A11Y-09 | VoiceOver Phase 2                                              | PASS     | Patrick : VO-01 à VO-08 validés le 17 septembre 2026, macOS/Safari 26.3.1 ; empreinte contrôlée section 25.                          |
| A11Y-10 | TalkBack                                                       | DEFERRED | Aucun environnement Android/TalkBack compatible validé.                                                                              |
| DOC-01  | Livre Produit & Technique v1.1 courant                         | PASS     | Fichier `docs/references/ActiCiv_Livre_Produit_Technique_v1.1_FINAL_A4.docx`, lien `docs/README.md`                                  |
| DOC-02  | Master prompt conservé/référencé                               | PASS     | `docs/references/master-development-prompt.md`, index documentaire                                                                   |
| DOC-03  | Postmortem Phase 1 conservé                                    | PASS     | `docs/references/ActiCiv_Phase1_Postmortem.md`, lien index                                                                           |
| DOC-04  | Prompt Phase 2 HEX conservé/référencé                          | PASS     | `docs/references/ActiCiv_Prompt_Astra_Phase2_v1.1_HEX.md` et index                                                                   |
| DOC-05  | Proposition architecture Phase 2 conservée/référencée          | PASS     | `docs/references/ActiCiv_Phase2_Proposition_Architecture.md`, lien historique                                                        |
| DOC-06  | Décisions Phase 2 tracées                                      | PASS     | `ActiCiv_Phase2_Decisions.md`, précisions finales et approbation section 27 de ce document de référence                              |
| DOC-07  | ADR structurantes mises à jour                                 | PASS     | ADR 004 tenancy, 005 géographie, 006 SLA, 007 audit ; complément ADR 003 qualité                                                     |
| DOC-08  | open-questions nettoyé des décisions arbitrées                 | PASS     | Liste réservée aux phases futures, décisions verrouillées explicitement nommées                                                      |
| DOC-09  | README/docs reconnaissent la clôture Phase 1                   | PASS     | README et index actualisés ; postmortem fait foi sur les anciens rapports historiques                                                |
| DOC-10  | Mention du navigateur historique clairement séparée de Phase 2 | PASS     | README distingue maintenant le navigateur historique Phase 1 du Chromium Playwright courant.                                         |

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

Aucune Phase3 commencée : ni report citoyen, upload photo, tracking, smart queue, claim, intervention, transfert opérationnel, notification métier, analytics, routage complet, anti-abus complet ou fusion de doublons. `intervention` reste un nom de cible SLA ; `report.claim` est une chaîne de test de refus ; les emails sont Auth uniquement. Les routes Citizen restent les fondations Phase1.

## 29. Conclusion et condition de passage Phase 3

Les FAIL techniques sont résolus dans cette passe, mais la clôture attend les preuves obligatoires encore indiquées DEFERRED. La finalisation exige les deux jobs CI sur le même SHA et l'archive issue de ce SHA ; TalkBack reste le seul différé environnemental admissible. Aucun passage Phase3 sans validation explicite de Patrick.
