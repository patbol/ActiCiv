# Versions SLA, calendriers et DST

Statut : approuvé le 16 septembre 2026.

Quatre portées, unicité NULLS NOT DISTINCT sur PostgreSQL 17. Ordre futur : service + catégorie > catégorie > service > organisation. Aucun résolveur report en Phase 2.

Les versions publiées de calendrier et SLA, leurs cibles et pauses sont immuables. La version SLA référence un calendrier publié de portée compatible. Une absence de règle de pause signifie aucune pause.

Calendriers : sept jours explicites, plusieurs fenêtres [start,end), minuit découpé, 24/7 explicite, IANA, aucun calendrier férié. DST : première occurrence ; premier instant valide après le saut. Temporal absent par défaut sur Node 24.21.0 : polyfill encapsulé derrière ZonedTime, aucune dépendance du domaine. Les tests incluent Paris, journées 23/25 heures et transition de trente minutes de Lord Howe.

## Renforcement de clôture Phase 2

Deux publications SLA réelles sont exercées avec vérification de l’ancienne version/targets inchangés. La continuité des fenêtres datées dimanche/lundi est testée en semaine normale et après les transitions DST.
