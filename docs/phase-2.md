# Phase 2 — Core Data & Security

Implémentation de la proposition A–I approuvée par Patrick le 16 septembre 2026. La Phase 1 est clôturée sur `b28160ca1b93c0ef9eb312c8456f8b95b9cc2763`. La Phase 2 doit encore obtenir les preuves de clôture décrites plus bas. Aucune Phase 3 n'est autorisée.

## Références

Décisions explicites récentes > [Livre v1.1](references/ActiCiv_Livre_Produit_Technique_v1.1_FINAL_A4.docx) > [prompt Phase 2](references/ActiCiv_Prompt_Astra_Phase2_v1.1_HEX.md) > prompt initial. Les [décisions](references/ActiCiv_Phase2_Decisions.md) précisent les arbitrages. Le [postmortem](references/ActiCiv_Phase1_Postmortem.md) impose les règles de livraison. L'ancienne proposition est historique là où les décisions l'ont remplacée.

## Base et invariants

Les huit migrations initiales sont ordonnées : sécurité/PostGIS ; organisations/identités ; audit ; services/invitations ; catalogue ; couverture ; horaires ; SLA. PostgreSQL 17 permet `UNIQUE NULLS NOT DISTINCT` pour les calendriers organisationnels et les quatre portées SLA. Les FK composites imposent le même tenant.

`service_memberships` porte les services d'opération de l'agent et de supervision du superviseur. Aucun héritage des permissions superviseur par l'administrateur client. Une identité Auth seule ne donne aucun droit métier.

Les tables sont protégées par RLS et grants minimaux. Les lectures sont effectuées avec le JWT utilisateur. Les écritures passent par des RPC nommées, appelées avec ce même JWT. Ces fonctions `SECURITY DEFINER`, à search_path vide et EXECUTE limité, refont les vérifications d'acteur et de ressource avant mutation. Aucun accès service-role général dans le chemin professionnel ordinaire. Les helpers privés lisent les appartenances sans récursion de policies.

Tout INSERT/UPDATE/DELETE métier déclenche l'audit dans la même transaction. Aucun bloc EXCEPTION ne masque un échec d'audit. L'audit est append-only, avec liste blanche de champs ; les changements de géométrie conservent des empreintes, pas une copie complète de la géométrie. Les logs techniques ne sont pas des événements d'audit. Les opérations d'amorçage SQL sont marquées système.

La dernière administration active est protégée aussi lors d'une désactivation de profil. Les commandes prennent un verrou commun d'organisation ; une vérification pure côté application apporte un refus explicite, et la contrainte SQL reste autoritaire sous concurrence.

## Frontières hexagonales

| Module                | Domaine / application                                                                                | Adaptateurs / entrées                                               |
| --------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| authorization         | Capacités, contexte actif, ressource et service ; port de lecture du contexte                        | SupabaseContext, appelé par chaque entrée Pro                       |
| organizations         | Transition du dernier admin ; cas d'usage membres/services ; port Administration                     | Adaptateur SQL/RPC dans platform/administration ; API configuration |
| auth                  | Rôles et redirections autorisées ; orchestration d'invitation avec ports Invitations/IdentityInviter | Supabase SSR/Auth et bridge privilégié ; actions et routes auth Pro |
| coverage              | Coordonnées ; cas d'usage candidats et port CoverageReader                                           | PostGIS via RPC ; API plateforme                                    |
| schedules             | Créneaux, jours, 24/7 ; publication et fenêtres datées ; ports ScheduleWriter/ZonedTime              | SQL et Temporal encapsulé ; API configuration                       |
| sla                   | Cibles, durées, pauses ; publication via SlaWriter                                                   | SQL transactionnel ; API configuration                              |
| catalogue et réglages | Modules simples avec validation d'entrée et autorisation                                             | RPC ciblées, sans couches vides                                     |
| audit                 | Contrat SQL et champs autorisés                                                                      | Triggers transactionnels, RLS de lecture                            |

Les règles ESLint empêchent domaine et application d'importer Next.js, Supabase, Temporal ou l'infrastructure. Les tests de frontières exercent la configuration réelle. `platform/` contient les adaptateurs/compositions partagés, jamais des imports vers le frontend.

## SLA et horaires

Portées : organisation, service, catégorie, service + catégorie. Spécificité future validée : service + catégorie > catégorie > service > organisation. Aucun moteur de résolution lié aux reports.

Trois cibles publiées : acknowledgment, intervention, resolution. Chaque version SLA référence un calendrier publié compatible. Calendriers, cibles et pauses publiés sont immuables. Un changement crée une nouvelle version. Les identités de portée publiées ne peuvent pas être déplacées.

Horaires : sept jours explicites, fenêtres en secondes depuis minuit, `[start,end)`, adjacence permise, minuit découpé sur deux jours, mode always_open explicite. Aucun jour férié. Les fuseaux IANA sont vérifiés côté backend et SQL.

Node 24.21.0 ne fournit pas Temporal par défaut. Le polyfill 0.5.1 est encapsulé dans l'adaptateur ZonedTime. Règles : première occurrence en automne ; premier instant valide après le saut au printemps. Exemple Paris : 02:30 inexistante devient 03:00, jamais 03:30. La bibliothèque seule ne choisit pas la règle produit. Versions du runtime/ICU/tz à enregistrer dans la preuve de livraison ; aucun calcul métier ne dépend du fuseau du navigateur.

## Auth et invitations

Pro : `http://127.0.0.1:3001`. Connexion `/auth/login`, récupération `/auth/recover`, définition du mot de passe `/auth/password`, activation `/auth/accept`, contexte `/espace`. Le proxy renouvelle les cookies ; l'identité est vérifiée via getUser côté serveur. Les callbacks utilisent une destination exacte autorisée, jamais une origine transmise par le navigateur.

`auth.enable_signup=false` bloque l'inscription publique. `auth.email.enable_signup=true` maintient le fournisseur email utilisable dans la CLI locale ; son arrêt bloquait aussi les connexions par mot de passe. Les tests réels vérifient simultanément refus d'inscription et connexion autorisée. Après modification de config.toml, arrêter puis démarrer Supabase pour appliquer sa configuration.

Les templates locaux envoient vers `/auth/confirm` avec un token hash et un type invite/recovery. Les liens expirés/réutilisés sont refusés par Auth. Un token Auth valide ne remplace jamais un membership actif.

Invitation : réserve auditable/idempotente sous JWT utilisateur → API Auth serveur → association de l'identité au dossier d'invitation → acceptation authentifiée → profil/membership/services dans une transaction auditée. Une panne entre Auth et SQL laisse zéro accès métier. La reprise rapproche uniquement l'email exact ; l'acceptation recontrôle l'initiateur, l'organisation, l'expiration et les services. Le secret `SUPABASE_SERVICE_ROLE_KEY` n'est utilisé que dans l'adaptateur d'invitation.

## Entrées de configuration

`POST /api/configuration` accepte les actions service.save, member.change, service.member, invitation.send, schedule.publish, sla.publish, category.configure et hold.save. Zod contrôle les DTO ; les cas d'usage et SQL contrôlent les droits. L'origine exacte Pro est requise. Aucun dashboard complet.

`POST /api/platform` expose uniquement les capacités explicites : organisation, récupération, catalogue, territoires, contrats et candidats. L'audit global est une lecture RLS réservée à audit.read. Le bootstrap plateforme est distinct : `ACTICIV_PLATFORM_AUTH_USER_ID=<UUID local existant> node scripts/bootstrap-platform.mjs`. Il requiert l'accès privilégié au conteneur local et produit un événement système. Aucun utilisateur client ne peut modifier platform_admins.

## DEV, tests et livraison

Dans chaque nouveau terminal :

```sh
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"
nvm use
pnpm install --frozen-lockfile
pnpm db:start
pnpm db:reset
```

Reset est destructif pour la base DEV locale. Le seed crée trois organisations fictives et neuf identités sans mot de passe utilisable. Pour une session manuelle, fournir un mot de passe temporaire par variable `ACTICIV_DEV_PASSWORD`, puis `pnpm db:provision`. Emails : agent1@example.test, supervisor1@example.test, client_admin1@example.test, et mêmes rôles pour 2/3. Ne jamais utiliser ces fixtures en PROD.

```sh
pnpm verify
pnpm db:test
pnpm test:integration
pnpm exec playwright install chromium
pnpm verify:full
```

Les tests SQL se déroulent dans des transactions rollbackées. L'intégration utilise de vrais JWT/Auth et des identités fictives ; les mots de passe sont générés en mémoire. Playwright démarre les builds exacts sur des ports libres ; aucune réutilisation silencieuse d'un serveur existant. Le manque de Supabase bloque les tests, sans mock de substitution.

`verify:full` inclut verify, pgTAP, intégration Auth/RLS, E2E/axe et audit de dépendances. La CI exécute la même commande après reset. `pnpm release:verify` exige un arbre propre, affiche le SHA/runtime, exécute verify:full puis vérifie que l’état Git est resté identique. Clôture : arbre propre, SHA testé localement et dans les deux jobs CI, URL du run, archive `git archive` depuis ce SHA. Une modification ultérieure invalide la validation. Ne pas déclarer la phase clôturée avec une CI non observée ou un contrôle manuel présenté comme automatique.

## Complément de clôture Phase 2

La migration 20260917000100_closure_hardening.sql ajoute correlation_id, conserve les identifiants de commande sur réservation/reprise/acceptation et vérifie les cycles avant la géométrie pour permettre un test isolé. Les événements historiques reçoivent des identifiants autonomes ; aucune corrélation historique de requête n’est inventée.

Les actions Auth passent désormais par les cas d’usage `auth/application/session.ts` et le port ProfessionalSession. Les mutations de territoires/contrats/scopes passent par CoverageAdministration ; la création/récupération d’organisation passe par OrganizationPlatform. La composition gère DTO, session et adaptateurs ; les cas d’usage restent indépendants de Next, Supabase et du réseau.

Le garde automatique domain/application interdit imports réseau, primitives globales et imports dynamiques. Des tests positifs/négatifs exercent la configuration ESLint effective.

Les scénarios complémentaires couvrent les quatre courses du dernier administrateur avec acteurs indépendants et barrière SQL, les erreurs réelles Auth/SQL et la reprise via invitationAdapters, les deux publications SLA successives, dimanche/lundi, cycle exact, nouvelle catégorie sans extension contractuelle, audit corrélé et parcours Auth accessibles. Les suites Node et Vitest d’intégration sont séquentielles pour leurs fixtures communes.

Les pages Auth donnent le focus au titre à l’arrivée et aux erreurs/confirmations après action. La récupération d’un professionnel déjà actif aboutit à son espace. Le protocole VoiceOver et le rapport de clôture distinguent les tests automatiques et la validation humaine.

La commande de validation finale est `pnpm release:verify --rebuild-db`. Le même script est exécuté en CI. Il inclut la reconstruction locale, verify:full et Gitleaks à version/empreinte figées. Les preuves de livraison portent le SHA dans une attestation externe au commit afin de ne pas modifier le code après validation.
