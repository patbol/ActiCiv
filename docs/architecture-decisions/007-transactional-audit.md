# Audit transactionnel obligatoire

Statut : approuvé le 16 septembre 2026.

Toute mutation métier auditable écrit un événement dans sa transaction SQL. L'échec de l'audit annule la mutation ; le rollback métier annule aussi l'audit. Des triggers couvrent également les écritures SQL directes. Aucun catch ne transforme un défaut d'audit en succès.

Acteur dérivé de l'identité serveur ; opérations privilégiées de bootstrap identifiées système. Append-only, liste blanche de champs, aucune copie aveugle de ligne, token, mot de passe ou email. Les modifications géographiques sont identifiées par empreinte. Lecture client limitée à son organisation ; lecture globale exige audit.read.

Les logs techniques d'observabilité restent indépendants et ne constituent pas une preuve d'audit métier.
