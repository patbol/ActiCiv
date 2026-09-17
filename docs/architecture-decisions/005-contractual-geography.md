# Géographie contractuelle

Statut : approuvé le 16 septembre 2026 ; remplace la réserve PostGIS de l'ADR 002.

PostGIS, MultiPolygon 4326, longitude/latitude, index GiST. ST_Covers inclut les frontières. Refus des géométries invalides/vides et des mauvais SRID, sans réparation silencieuse.

Le parent représente une inclusion réelle stricte. Le verrou de mutation géographique évite les cycles/parents incohérents sous concurrence. Les enfants sont revérifiés lorsqu'un parent change. Les chevauchements non emboîtés produisent plusieurs candidats ; aucun gagnant ni service de routage n'est inventé.

La plateforme contrôle contrats, territoires et autorisations explicites de catégories/services. La configuration client n'accorde aucun droit commercial. Les requêtes de candidats gardent la RLS de lecture des contrats.

## Renforcement de clôture Phase 2

Le contrôle de cycle précède désormais le contrôle de contenance ; un test exige le message exact Territory cycle et un autre maintient le refus géométrique sans cycle. La création d’une catégorie est testée sans extension des contrats ni des candidats existants.
