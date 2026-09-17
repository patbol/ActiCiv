# ActiCiv — Proposition Phase 2 : Core Data & Security

Statut : proposition soumise à validation, pas une autorisation d'implémentation.

Ce document reprend la proposition A–J présentée dans la conversation, avec une mise à jour explicite du contexte de reprise. Les décisions proposées restent à distinguer des exigences produit déjà verrouillées. Aucun développement de Phase 2 n'a été autorisé par le simple transfert de ce document.

## Instructions pour Codex dans VS Code

1. Lire ce document, le prompt maître Phase 2, le postmortem Phase 1, le livre produit et le prompt de développement initial.
2. Si un document manque, le signaler ; ne pas reconstruire ses exigences par supposition.
3. Auditer le dépôt réel en lecture seule et confronter la proposition à son état.
4. Distinguer les décisions produit verrouillées des propositions techniques et arbitrages encore ouverts.
5. Ne modifier aucun fichier, ne créer aucune migration, ne rien installer avant approbation explicite.
6. Ne pas commencer la Phase 3.

Hiérarchie des exigences : dernières décisions produit explicitement validées, puis livre produit, puis prompt maître de développement. Le postmortem impose les garde-fous de qualité et de livraison. Cette proposition ne remplace aucun de ces documents.

## Contexte de reprise mis à jour

- Dossier Mac : `/Users/patrickmoreno/ActiCiv/dev/acticiv`.
- Dépôt : `https://github.com/patbol/ActiCiv.git`.
- Commit Phase 1 validé : `b28160ca1b93c0ef9eb312c8456f8b95b9cc2763`.
- GitHub Actions vert sur ce commit : confirmé par Patrick, sans observation indépendante du run dans la conversation d'origine.
- Supabase local et VoiceOver sur Citizen et Pro : confirmés par Patrick.
- TalkBack : différé jusqu'à disponibilité d'un environnement compatible.
- Archive Phase 1 reçue : intègre ce même SHA dans son commentaire Git ; intégrité ZIP vérifiée.
- Codex dans VS Code a ensuite confirmé le bon dossier, le remote, ce SHA et un arbre de travail propre.
- Son premier shell utilisait Node 20. Après chargement de nvm et `nvm use`, il a confirmé Node `v24.21.0` et pnpm `11.19.0`.
- Charger nvm et activer `.nvmrc` dans chaque nouveau shell lorsque nécessaire. Aucun changement de gestionnaire Node, aucune réinstallation de pnpm requise.
- La Phase 2 n'a pas commencé. La proposition ci-dessous n'est pas encore approuvée.

## A. Vérification de la baseline Phase 1

Lors du premier audit, la copie de travail distante ne contenait aucun commit ni remote. Cette limite a été résolue pour la reprise locale par les vérifications ci-dessus. Ne pas confondre cette ancienne copie avec le dépôt Mac validé.

Constats sur l'archive validée :

| Élément | État |
| --- | --- |
| Architecture | Monorepo pnpm, applications Next.js Citizen et Pro |
| Packages | backend, ui, shared, types |
| Backend | Module interne du monolithe, aucune application autonome |
| Runtime déclaré | Node 24, pnpm 11.19.0 |
| Commandes verify / verify:full | Absentes du package.json inspecté |
| CI | Jobs app et database-foundation présents |
| Schéma métier | Aucune migration métier ; seed limité à select 1 |
| Correctif Playwright | testInfo présent uniquement dans le test qui l'utilise |
| Auth | Inscription publique désactivée ; intégration métier non réalisée |

Préparation obligatoire après approbation :

- Ajouter `verify` : format check, lint, typecheck, tests unitaires, builds de production.
- Ajouter `verify:full` : composition de verify, E2E Playwright, axe, audit de dépendances et tests d'intégration réels Phase 2. Ne pas dupliquer inutilement la logique des commandes.
- Conserver la dette ESLint visible ; réévaluer avant PROD sans casser les peer dependencies.
- Documenter l'activation Node dans chaque nouveau terminal.
- Garder Playwright standard en CI ; @sparticuz/chromium reste un dépannage historique extérieur au projet.
- Mettre à jour les décisions ouvertes désormais arbitrées.
- Adapter les URLs Auth aux parcours Pro : la configuration initiale pointe encore vers Citizen, port 3000.
- Livrer depuis un arbre propre et un commit identifié, testé localement et dans GitHub Actions. Produire l'archive avec git archive depuis ce commit. Toute modification ultérieure impose une nouvelle validation.

## B. Schéma proposé

### Principes communs

- UUID pour les identifiants.
- organization_id explicite sur les tables tenant.
- FK composites empêchant les associations inter-organisations.
- Horodatages timestamptz et échanges applicatifs UTC.
- Actif/inactif/archivé selon l'entité, pas de deleted_at universel.
- Tables pour les référentiels configurables ; texte contraint pour les valeurs structurelles.
- Aucune table de signalement, intervention, transfert ou notification en Phase 2.

### Organisations, identités et services

| Table | Contenu et relations |
| --- | --- |
| organizations | Identité, code stable, statut ; création et cycle de vie contrôlés par la plateforme |
| organization_settings | Configuration interne du client, notamment fuseau par défaut |
| professional_profiles | Lien auth.users, nom d'affichage minimal, statut ; aucun mot de passe dupliqué |
| organization_memberships | Utilisateur, organisation, rôle principal, statut ; utilisateur unique pour garantir une seule organisation |
| services | Organisation, code, nom, statut |
| service_memberships | Appartenance professionnelle vers service ; organisation commune garantie par FK composites |
| platform_admins | Administration plateforme séparée des rôles clients |
| professional_invitations | Organisation, rôle prévu, initiateur, état, expiration, identifiant d'idempotence |
| invitation_services | Services prévus pour une invitation, dans la même organisation |

Une identité Auth sans appartenance métier active ne dispose d'aucun accès professionnel. La table platform_admins ne peut pas être modifiée par un client ou par édition de ses métadonnées Auth.

### Territoires, contrats et catégories

| Table | Contenu et relations |
| --- | --- |
| territories | Code, nom, type, géométrie, parent facultatif, statut ; référentiel plateforme |
| contracts | Organisation, référence, statut, validité, code de plan descriptif ; aucune facturation |
| contract_scopes | Contrat vers territoire : couverture commerciale |
| contract_scope_categories | Catégories explicitement autorisées pour un périmètre |
| contract_scope_services | Services explicitement inclus dans le périmètre contractuel conformément au livre produit |
| verticals | Code, libellé, état actif/inactif |
| categories | Verticale, code, libellé, priorité par défaut, état |
| organization_categories | Activation et configuration interne d'une catégorie pour une organisation |

Une configuration interne n'accorde jamais de droits contractuels. La couverture effective exige contrat et autorisations explicites.

Proposition : autorisations par catégorie, sans joker implicite « toutes les futures catégories de cette verticale ». Une nouvelle catégorie n'est pas commercialement autorisée du seul fait de sa création.

Les sous-catégories pourront être ajoutées ultérieurement par relation à une catégorie. Aucun modèle générique de taxonomie ni colonne spécifique au stationnement PMR n'est nécessaire maintenant. Le moteur catégorie vers service de routage reste hors Phase 2.

### Horaires, SLA et audit

| Tables | Rôle |
| --- | --- |
| service_schedules | Identité d'un calendrier d'organisation ou de service |
| service_schedule_versions | Versions publiées immuables, avec fuseau applicable |
| service_schedule_days | Sept jours explicitement ouverts ou fermés |
| service_schedule_windows | Créneaux d'ouverture |
| sla_policies | Identité d'une politique, organisation et portée facultative service/catégorie |
| sla_policy_versions | Versions publiées immuables |
| sla_targets | Prise en charge, intervention ou résolution ; durée et mode de comptage |
| hold_reasons | Référentiel des motifs d'attente |
| sla_pause_rules | Motifs autorisant explicitement la pause d'une cible dans une version |
| audit_events | Audit serveur append-only : acteur, objet, action, changements autorisés |

Contraintes SQL : unicité des codes dans leur portée, cohérence organisation/service/appartenance, durées positives, absence de créneaux contradictoires, immutabilité des versions publiées et protection des références historiques.

## C. Stratégie PostGIS

PostGIS est maintenant approuvé par les décisions produit Phase 2. L'ancienne réserve de Phase 1 est donc levée.

- Territoires : geometry(MultiPolygon, 4326).
- Positions en entrée des fonctions géographiques : points SRID 4326.
- Ordre des coordonnées explicite : longitude, latitude.
- Index GiST sur les géométries ; index relationnels sur contrat/territoire/catégorie.
- Distances futures en mètres via geography ou projection appropriée, pas en degrés. Aucun algorithme de distance métier maintenant.

Rejeter les géométries vides, invalides, de type/SRID incorrect et les coordonnées hors limites. Convertir un Polygon valide en MultiPolygon est acceptable. Pas de réparation silencieuse par ST_MakeValid, qui pourrait modifier une frontière contractuelle.

Proposition à approuver : ST_Covers inclut les points sur une frontière. La frontière n'attribue pas automatiquement un destinataire lorsqu'il existe plusieurs candidats.

Le parent facultatif représente une inclusion connue : containment réel, absence de cycles, contrôle des enfants lors de la modification du parent. Les chevauchements sans parent commun sont autorisés.

La spécificité repose sur l'inclusion géographique stricte, pas seulement sur la surface ou la profondeur déclarée. Deux territoires qui se chevauchent sans inclusion restent deux candidats. Un ordre stable de résultats n'est pas une règle « premier arrivé, premier choisi ».

Les fonctions Phase 2 fournissent les candidats géographiques et contractuels ; elles ne sélectionnent pas le service destinataire. La séparation couverture contractuelle/configuration interne doit préserver la distinction future entre absence de couverture et échec de routage. Aucune table de signalement ni workflow de routage anticipé.

## D. RBAC, Auth et RLS

### Authentification

Supabase Auth : invitation, définition du mot de passe, connexion, récupération du mot de passe, renouvellement et fermeture de session. Inscription publique fermée. MFA et SSO futurs non implémentés.

Intégration SSR Next.js avec @supabase/ssr. Vérifier l'identité côté serveur ; le contenu brut de getSession() ne constitue pas une preuve suffisante. URLs de retour explicitement autorisées ; redirections externes arbitraires refusées.

### Autorisation

Chaque opération sensible vérifie identité, organisation active, appartenance active, capacité, appartenance au service si nécessaire et organisation réelle de la ressource. Les IDs du navigateur ne font pas autorité. Les droits métier sont lus en base, pas dans des métadonnées utilisateur modifiables ou des claims métier périmés.

| Action Phase 2 | Agent | Superviseur | Admin client | Admin plateforme |
| --- | --- | --- | --- | --- |
| Lire son contexte professionnel | Oui | Oui | Oui | Contexte plateforme |
| Lire configuration des services | Ses services | Ses services | Son organisation | Capacité explicite |
| Modifier services, horaires, SLA | Non | Non | Son organisation | Capacité explicite |
| Gérer utilisateurs et rôles clients | Non | Non | Son organisation | Capacité explicite |
| Lire périmètre contractuel | Non par défaut | Non par défaut | Son organisation | Oui |
| Modifier contrats et territoires | Non | Non | Non | Oui |
| Modifier administrateurs plateforme | Non | Non | Non | Procédure privilégiée distincte |
| Lire audit de configuration | Non | Non par défaut | Son organisation | Audit global |

Cette matrice est proposée pour validation, pas déjà verrouillée. Aucun héritage opérationnel client_admin vers supervisor, aucune capacité report.* anticipée.

### Protection base de données

- RLS sur tables métier exposées et tables tenant ; grants minimaux.
- Aucun accès anonyme professionnel.
- Policies de lecture et écriture distinctes ; USING et WITH CHECK.
- Interdire le déplacement d'une ressource vers une autre organisation.
- Protéger les colonnes sensibles en complément de RLS.
- Fonctions transactionnelles ciblées pour les mutations multi-tables.
- Helpers de sécurité non exposés, search_path maîtrisé, EXECUTE restreint.
- Requêtes ordinaires dans le contexte utilisateur, jamais avec une clé administrateur par défaut.
- Cohérence entre contrôle backend et SQL testée : aucune règle critique dépendant uniquement d'un bouton masqué.

### Invitations privilégiées

Chemin serveur dédié pour l'API Auth d'invitation, avec contrôle de l'initiateur, de l'organisation, des rôles et des services demandés. Secret serveur jamais exposé au navigateur.

La création Auth et l'écriture métier ne sont pas une transaction distribuée atomique : prévoir états explicites, reprise idempotente et absence de droits en cas d'échec partiel. Le bootstrap des administrateurs plateforme doit être distinct de l'administration client et auditable.

## E. Modèle SLA

| Cible | Début futur | Fin future |
| --- | --- | --- |
| Prise en charge | Réception | Prise en charge |
| Intervention | Prise en charge | Début d'intervention |
| Résolution | Réception | Clôture |

Aucun horodatage de signalement créé maintenant.

Horaires proposés : plusieurs fenêtres par jour, jour fermé explicite, intervalles semi-ouverts [ouverture, fermeture), passage de minuit en deux segments, représentation du 24/7, fuseau IANA dans la version du calendrier, aucun jour férié en Phase 2.

Le calcul compte le temps effectivement écoulé dans les fenêtres ouvertes. Les heures locales ambiguës ou inexistantes lors du changement d'heure exigent une règle explicite. Proposition encore à approuver : refuser les conversions ambiguës non résolues plutôt que laisser une bibliothèque décider silencieusement. Ne pas présenter ce point comme déjà tranché.

### Non-rétroactivité

Versionner uniquement les durées SLA ne suffit pas : horaires et fuseau influencent aussi les échéances. Le futur signalement référencera la version SLA, la version des horaires et les règles de pause correspondantes. Une évolution produit une nouvelle version immuable.

Sans règle explicite pour le motif et la cible : aucune pause. on_hold ne suspend donc pas automatiquement les compteurs.

Portées prévues : organisation, service, catégorie. La priorité entre surcharge service et surcharge catégorie reste à approuver avant tout résolveur. Ne pas la déduire implicitement du stockage.

## F. Migrations et ordre d'implémentation

Migrations proposées, non exécutées :

| Ordre | Contenu |
| --- | --- |
| 001 | PostGIS, schémas internes, révocation des droits par défaut nécessaires |
| 002 | Organisations, profils, appartenances, administrateurs plateforme |
| 003 | Services, appartenances de service, invitations |
| 004 | Verticales, catégories, configuration par organisation |
| 005 | Territoires, validation géométrique, contrats et périmètres |
| 006 | Calendriers, versions, jours et fenêtres |
| 007 | Politiques SLA, versions, cibles, pauses |
| 008 | Audit, triggers, fonctions transactionnelles de mutation |
| 009 | Fonctions de consultation géographique, index complémentaires justifiés |

Les protections RLS accompagnent chaque table, sans attente de la dernière migration. Ne pas exposer de mutations applicatives avant leur audit et leurs protections.

Après approbation :

1. Reconfirmer dépôt, SHA et état propre.
2. Appliquer les mesures du postmortem : verify, verify:full, Node, livraison liée au SHA.
3. Installer le banc de tests Supabase réel.
4. Identités, organisations, services et isolation.
5. Catalogue, territoires et droits contractuels.
6. Horaires et versions SLA.
7. Invitations et UI Auth minimale.
8. Audit complet, tests négatifs et revue de sécurité.
9. Vérifier le même commit localement et en CI.
10. Archiver depuis ce commit.

Seeds : au moins trois organisations fictives, rôles, services, territoires emboîtés/chevauchants, configurations horaires et SLA. Aucun signalement fictif. Provisionnement des identités de test explicite et local, sans secret versionné ni donnée réelle. Le dataset de 50–100 signalements appartient aux phases suivantes.

## G. Dépendances

| Ajout proposé | Justification |
| --- | --- |
| @supabase/ssr | Sessions et cookies Next.js |
| @js-temporal/polyfill | Dates zonées et changements d'heure côté backend, usage encapsulé |
| Extension postgis | Géométries, inclusion et index spatiaux |
| pgTAP pour tests locaux/CI | Contraintes, privilèges, fonctions et policies SQL |

Réutiliser Supabase JS, Zod, Vitest, Playwright et axe. Versions exactes à vérifier avec le lockfile validé avant installation, puis figées dans le lockfile.

Pas d'ORM, Redis, moteur de permissions externe, MapLibre à cette phase, fournisseur email supplémentaire ou composants UI « au cas où ».

packages/backend reste strictement interne au monolithe. Les apps utilisent ses points d'entrée serveur ; aucun import privilégié côté client. Maintenir les tests de frontières.

## H. ADR structurantes

1. Tenancy et sécurité : mono-organisation, rôles exclusifs, plateforme distincte, backend/RLS/SQL, exceptions privilégiées.
2. Géographie contractuelle : PostGIS, SRID, frontières, inclusion, validation, candidats versus routage.
3. SLA non rétroactifs : règles et horaires immuables, fuseaux, pauses.
4. Audit transactionnel : append-only, acteur, minimisation, lecture.

Mettre à jour l'ADR qualité existante pour les releases. Pas d'ADR pour les conventions triviales.

## I. Plan de tests

### Unitaires

- Capacités de chaque rôle ; capacité inconnue refusée.
- Aucun héritage opérationnel client_admin.
- Appartenance inactive refusée ; services autorisés contrôlés.
- Validation des priorités et catégories.
- Durées SLA nulles/négatives/incohérentes refusées.
- Horaires inversés, chevauchants, jours fermés et 24/7.
- Même journée, hors ouverture, week-end, fuseaux, heure été/hiver.
- Absence de pause implicite ; pause limitée à la cible configurée.

### Intégration Supabase / RLS réelles

- Agent A lit son service autorisé.
- Agent A ne lit ni service B ni appartenance B.
- Absence d'appartenance au service : refus.
- Admin A modifie une configuration A autorisée.
- Admin A ne modifie ni configuration B ni périmètre contractuel A.
- organization_id falsifié : refus.
- Membre A associé au service B : refus SQL.
- Deux appartenances organisationnelles d'un même utilisateur : refus.
- Rôle illégal et auto-promotion plateforme : refus.
- Métadonnées Auth falsifiées sans effet.
- Désactivation effective malgré JWT encore valide.
- Administrateur plateforme limité aux opérations prévues.
- Accès anonyme refusé.
- UPDATE interdit : données inchangées.

Un SELECT interdit peut retourner zéro ligne : vérifier l'absence de fuite, pas uniquement le code HTTP. Utiliser de vrais utilisateurs et JWT ; un compte de préparation privilégié ne doit pas jouer le rôle de l'acteur testé. Aucun mock comme preuve RLS.

### Auth et invitations

- Inscription publique refusée.
- Invitation autorisée, définition du mot de passe.
- Invitation inter-tenant refusée.
- Répétition/concurrence sans double appartenance.
- Échec intermédiaire sans droits accordés.
- Lien expiré ou réutilisé refusé.
- Récupération, renouvellement, déconnexion.
- Redirection malveillante refusée.

### PostGIS

- Point intérieur, extérieur, sur frontière et dans trou de polygone.
- Commune contenant site hospitalier.
- Chevauchement sans inclusion : plusieurs candidats, aucun gagnant inventé.
- Géométrie invalide/vide/mauvais SRID refusée.
- Parent incorrect et cycle refusés.
- Résultats déterministes, index présent.

### SLA, audit, reproductibilité

- Publication puis refus de mutation d'une version SLA/horaires.
- Nouvelle version sans altération de l'ancienne.
- Références SLA/calendrier cohérentes avec le tenant.
- Mutation autorisée auditée avec acteur réel.
- Rollback annulant mutation et événement associé.
- Modification/suppression directe de l'audit refusée.
- Aucun secret dans les payloads.
- Reconstruction depuis base vide, reset et seeds reproductibles.

### Non-régression et clôture

- Conserver les tests Phase 1, sans les affaiblir.
- E2E Auth minimaux, axe, clavier et contrôle manuel des nouveaux parcours.
- Vérification bundles, frontières d'import, variables publiques/serveur.
- Audit de dépendances et recherche de secrets.
- Chaque bug corrigé exige un test reproduisant le vrai défaut.
- verify:full doit échouer ou signaler le prérequis manquant si Supabase est indisponible ; pas de succès global avec intégration ignorée.
- Aucun résultat mocké assimilé à Supabase réel ou à une CI exécutée.
- Rapport final : implémentation, migrations, commandes et résultats réels, accessibilité, sécurité, limites, dette, ADR, docs et SHA local/CI.

## J. Risques et arbitrages

| Sujet | Traitement proposé |
| --- | --- |
| Baseline divergente | Utiliser exclusivement le dépôt Mac identifié et recontrôler son état |
| Récursion des policies | Helpers restreints, tests explicites |
| Escalade via colonnes/fonctions | Grants, contrôles serveur/SQL, tests directs |
| Invitation partiellement réussie | États, idempotence, reprise |
| Historique SLA altéré par horaires | Versionner règles et horaires |
| Chevauchement non emboîté | Conserver candidats ; arbitrage du routage plus tard |
| Mutations concurrentes de configuration | Transactions et contrôle de version |
| Audit trop bavard | Liste blanche de champs, aucune copie aveugle des lignes |
| Environnement sans conteneurs | Marquer non vérifié, jamais remplacer par une preuve mockée |

Choix explicitement encore soumis à approbation :

- Frontières incluses par ST_Covers.
- Droits précis de lecture de la matrice Phase 2.
- Qui peut créer/promouvoir un client_admin ; protection du dernier administrateur actif.
- Priorité des surcharges SLA service/catégorie.
- Convention sur heures locales ambiguës ou inexistantes.

Ne pas rouvrir les décisions verrouillées : utilisateur mono-organisation, multi-services explicites, un rôle principal, plateforme séparée, client_admin sans héritage de superviseur, PostGIS approuvé, contrats contrôlés plateforme, pas de pause automatique, SLA non rétroactifs.

Hors implémentation : fusion de doublons, payload public de suivi, rayon anti-abus, anciens signalements lors d'activation de couverture, PWA hors ligne, routage complet. Transferts inter-organisations hors MVP. Aucun workflow citoyen, médias, claim, interventions, notifications métier, analytics, dashboards complets, CRM, facturation, déploiement PROD ou IA.

## Références techniques consultées dans la proposition initiale

- https://supabase.com/docs/guides/auth/server-side/creating-a-client
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/reference/javascript/auth-admin-inviteuserbyemail
- https://postgis.net/docs/using_postgis_dbmanagement.html
- https://postgis.net/docs/ST_IsValid.html
- https://postgis.net/docs/ST_Covers.html
- https://github.com/js-temporal/temporal-polyfill

## Point d'arrêt

Relire, auditer, relever les écarts et présenter les arbitrages. Aucune modification de code, migration ou installation avant accord explicite de Patrick sur la proposition et les choix nécessaires.
