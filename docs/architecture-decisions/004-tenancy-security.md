# Tenancy, autorisation et invitations

Statut : proposition consolidée et précisions approuvées par Patrick le 16 septembre 2026.

Un professionnel appartient à une organisation et possède un rôle principal. service_memberships porte le périmètre agent ou superviseur. L'administration client ne cumule pas implicitement la supervision. La plateforme dispose d'une identité de droits distincte et de capacités nommées.

La chaîne vérifie Auth, profil actif, organisation/membership actifs, capacité, service et ressource réelle. RLS protège les lectures ; les écritures ordinaires utilisent des RPC ciblées avec JWT utilisateur, contrôles SQL et grants minimaux. Les clés privilégiées ne servent qu'au pont Auth d'invitation. Metadata utilisateur et rôle principal ne permettent jamais une auto-promotion plateforme.

Les invitations ont des états explicites et une clé d'idempotence. Auth et SQL ne constituent pas une transaction distribuée. Seule l'acceptation valide crée le membership métier. Le dernier administrateur actif est protégé par verrou et contrôle SQL, y compris désactivation de profil. Tests directs, JWT réels et concurrence sont requis.

Les droits EXECUTE par défaut sont révoqués globalement pour PUBLIC avant création des fonctions : une révocation limitée au schéma n'annule pas le défaut global PostgreSQL. Les tests contrôlent les privilèges effectifs du pont Auth pour anon/authenticated/service_role, pas seulement la présence d'un GRANT dans une migration.
