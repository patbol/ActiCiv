# Monolithe modulaire et frontières

Statut : accepté par Patrick le 15 septembre 2026.

Contexte : deux interfaces Next.js et un backend autoritaire commun sont imposés. Le livre propose ui/shared/types mais ne localise pas explicitement le métier serveur.

Options : dupliquer le serveur dans chaque app ; créer une API indépendante ; partager un package interne.

Décision : packages/backend est un module interne, sans port, serveur ni déploiement autonome. Les handlers Next.js sont ses adaptateurs HTTP. packages/types contient les contrats publics ; les types SQL restent privés au backend. ui/shared/types ne peuvent importer backend ou Supabase. server-only protège le graphe client. Aucun métier anticipé en phase 1.

Conséquences : deux builds consomment la même logique. Les modules auth, organizations, territories, services, reports, routing, assignments, sla, notifications, analytics, audit seront ajoutés uniquement au moment utile. Pas de couches vides par module. La protection des routes et sessions sera implémentée en phase 2.

## Complément Phase 2 approuvé

Architecture hexagonale pragmatique pour authorization, organizations, auth/invitations, coverage, schedules et SLA. Domaine indépendant des frameworks ; cas d'usage et ports uniquement aux frontières utiles ; adaptateurs Supabase/PostGIS/Temporal. Composition serveur dans packages/backend. La [cartographie concrète](../phase-2.md) décrit les entrées. Pas de couches vides pour le catalogue, les réglages ou la marque. Les imports de domaine/application sont contrôlés par ESLint et tests.
