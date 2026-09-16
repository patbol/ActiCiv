# Persistance et sécurité serveur

Statut : accepté pour les fondations ; détails métier différés.

Contexte : PostgreSQL/Supabase, RLS, contraintes et transactions sont imposés. Un client service_role général contournerait cette défense.

Options : ORM supplémentaire ou client Supabase typé ; plusieurs appels pour une commande ou transaction SQL.

Décision : client officiel avec clé publique uniquement dans le socle. Aucun fallback privilégié. Les futures sessions pro transmettront leur identité vérifiée. Les futures commandes atomiques devront s'exécuter dans une transaction SQL et écrire leur audit dans la même transaction. Grants et RLS seront testés directement. Aucun schéma métier ni policy provisoire en phase 1.

Conséquences : les cas anonymes et les tâches de plateforme nécessiteront une conception explicite avant leur phase. Les clés élevées ne seront pas utilisées pour simplifier la démo. Réserve historique levée : PostGIS est approuvé pour la Phase 2, voir ADR 005. Aucun choix implicite sur le propriétaire des signalements hors couverture, les transferts ou les chevauchements.
