# Phase 2 — rapport d'implémentation

Date : 16 septembre 2026. Baseline Phase 1 : `b28160ca1b93c0ef9eb312c8456f8b95b9cc2763`.

La proposition A–I et ses trois précisions finales sont approuvées. Ce rapport décrit le contenu ; la preuve finale doit nommer le SHA exact, le résultat de `release:verify` et l'URL du run CI correspondant. Aucune validation d'un état antérieur ne vaut clôture de ce commit.

## Livré

- Neuf migrations PostgreSQL 17 : organisations, profils, memberships, services, invitations, catalogue, contrats/territoires PostGIS, calendriers/SLA versionnés, audit.
- Unicités NULLS NOT DISTINCT ; FK composites ; dernier administrateur actif protégé sous concurrence ; supervision portée par service_memberships.
- RLS/grants et RPC contrôlées ; pont Auth privilégié isolé ; audit atomique obligatoire, append-only et minimisé.
- Modules hexagonaux critiques, règles de dépendance et tests ; adaptateurs Supabase, PostGIS et Temporal.
- Connexion Pro, invitations, mot de passe, récupération, renouvellement, déconnexion, activation ; configuration Auth port 3001.
- Entrées serveur de configuration et de plateforme, sans dashboards opérationnels ni Phase 3.
- Seeds fictifs : trois organisations, neuf identités sans mot de passe versionné, services, cinq catégories Accessibilité, territoires emboîtés/chevauchants, calendriers hebdomadaires/24h et SLA.
- verify, verify:full, release:verify, contrôle des bundles, workflow CI et procédure de bootstrap/provisionnement local.
- Références v1.1, postmortem, décisions, ADR et questions ouvertes actualisés ; sources documentaires ajoutées par Patrick conservées.

## Vérification

La suite contient tests unitaires/domaine/frontières, 84 assertions pgTAP, huit scénarios Node et quatre scénarios avec adaptateurs réels utilisant de vrais JWT/Auth (dont concurrence et reprise d'invitation), les 12 cas navigateur Phase 1 et les nouveaux parcours Auth/configuration desktop/mobile. Les résultats définitifs sont ceux du journal `release:verify` du SHA livré. Aucun test critique supprimé, aucun retry Playwright.

Les contrôles SQL démontrent notamment : unicité effective des quatre scopes SLA, refus inter-tenant, refus d'auto-promotion, protection du dernier administrateur, versions immuables, DST via unités, inclusion/frontières/trous/chevauchements, rollback métier si audit échoue et rollback commun de l'audit.

Le navigateur standard Playwright Chromium est utilisé. Les tests axe/clavier ne constituent pas une certification WCAG ni une validation VoiceOver/TalkBack. VoiceOver Phase 1 est acquis ; les nouveaux parcours Phase 2 demandent leur contrôle manuel. TalkBack reste différé faute d'environnement compatible.

## Défauts trouvés et corrigés

- La configuration initiale désactivait le fournisseur email et bloquait les connexions. Activation du fournisseur en conservant l'interdiction globale d'inscription ; tests réels des deux comportements.
- Révocation EXECUTE limitée au schéma insuffisante face au défaut global PUBLIC PostgreSQL. Révocation globale avant création, grants explicites, tests négatifs des privilèges effectifs du pont Auth.
- Cache Turbopack conservant un échec d'ouverture de port du sandbox. Cache généré mis de côté, reconstruction avec accès local autorisé ; aucun contournement de contrôle produit.
- Fixtures navigateur : une RPC void renvoie un corps vide ; l'annonceur Next crée un second rôle alert. Décodage HTTP correct et ciblage de l'alerte attendue, assertions conservées.

## Limites et dette

- Clôture subordonnée au même SHA validé localement/en CI et aux contrôles manuels applicables. Ne pas considérer l'existence du workflow comme une preuve d'exécution.
- Aucun déploiement PROD ni configuration cloud. Les secrets d'invitation et URLs de production seront fournis dans leur environnement, jamais versionnés.
- ESLint 9 conservé pour les peer dependencies ; réévaluation cohérente avant PROD.
- Données de fuseaux liées au runtime ICU/tz ; enregistrées lors de release:verify. Les futurs reports conserveront les versions et instants calculés.
- Pas de moteur de SLA lié aux reports, routage complet, workflow citoyen, intervention, notification métier, billing ou Phase 3.

## Passe de clôture renforcée du 17 septembre 2026

Le rapport de référence est désormais [le postmortem complet et sa matrice](../../doc/ActiCiv_Phase2_Postmortem.md). Les scénarios supplémentaires et leurs résultats sont décrits là : 25 unités, 84 assertions SQL, 8 intégrations Node, 4 intégrations avec vrais adaptateurs et 26 E2E sans retry. Les résultats exacts du candidat final restent soumis à release:verify, CI et au contrôle VoiceOver. L’existence de ces tests ne vaut pas une clôture anticipée.
