# Checkpoint 2bis-H — protocole VoiceOver Quality Center

Statut : **PASS — H-VO-01 à H-VO-09 validés manuellement par Patrick le 18 septembre 2026**. Résultat fondé sur son retour explicite, distinct des tests axe/Playwright et des validations historiques C/G. TalkBack : **DEFERRED**, aucun appareil Android connecté pour ce contrôle.

## Préparation

Utiliser le candidat H réellement construit sur Pro (port 3001), une identité locale plateforme active dotée explicitement de quality.read et un magasin privé contenant les vrais runs D–G. Les identifiants de test sont fournis séparément, jamais dans cette fiche. Une identité client ne donne pas accès. Les échecs/différés réels des anciennes campagnes restent visibles ; ne pas modifier un snapshot pour simuler un état manuel.

Activer VoiceOver sur macOS (Commande-F5). Naviguer aussi avec Tab/Maj-Tab, Entrée/Espace, rotor des titres et liens ; noter navigateur/version, date et run_id/SHA affichés. Conserver seulement des observations minimisées, sans compte/token/capture sensible.

| ID      | Parcours                                        | Résultat attendu                                                                                                               | Verdict |
| ------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------- |
| H-VO-01 | Connexion, Espace Pro → Centre qualité          | Lien et titre annoncés ; focus sur le titre à l’entrée ; navigation clavier possible                                           | PASS    |
| H-VO-02 | Vue readiness du run G                          | SHA, environnement, policy advisory, verdict et quatre compteurs compréhensibles ; états sans dépendance à la couleur          | PASS    |
| H-VO-03 | Runs avec échec/différé, gates                  | Raisons et statuts annoncés, risques prioritaires ; tables/captions/entêtes utilisables et zones scrollables au clavier        | PASS    |
| H-VO-04 | Suites et filtre tag                            | Summary annoncé, ouverture Entrée/Espace, test/statut/durée lisibles ; filtre labellisé, pas de piège de focus                 | PASS    |
| H-VO-05 | Coverage, comparaison, artefacts/performance    | 0 % et non mesuré distingués ; aucun seuil fictif ; baseline candidate non acceptée ; sélection et comparaison accessibles     | PASS    |
| H-VO-06 | Accessibilité et provenance                     | Axe séparé de VoiceOver/TalkBack ; portée historique audible ; références/digests lisibles ; expiration ou lien absent annoncé | PASS    |
| H-VO-07 | Historique et filtres environnement/statut      | Labels/options annoncés, navigation détails/pagination possible ; aucun changement de session                                  | PASS    |
| H-VO-08 | Langue EN puis FR                               | Titres, labels et textes UI traduits, langue document correcte, focus conservé au changement de langue                         | PASS    |
| H-VO-09 | URL d’un run absent puis identité non autorisée | Messages compréhensibles, aucun contenu de preuve ni écran blanc ; retour possible                                             | PASS    |

## Consignation

Patrick indique PASS/KO par ID et le problème concret si KO. Réparer et retester chaque régression ; ne pas transformer axe en validation VoiceOver. Cette table sera actualisée uniquement depuis ses résultats explicites.

## Attestation manuelle du 18 septembre 2026

Après transmission du protocole H-VO-01 à H-VO-09 et accès confirmé au Centre qualité, Patrick confirme : « ok pour les tes VO ». Ce retour valide l’ensemble des neuf parcours proposés. Aucun défaut résiduel n’est signalé. Versions macOS et navigateur non communiquées ; aucune version n’est supposée.

Candidat local Pro sur le port 3001, modifications H non commitées au-dessus du HEAD G `11d6f94d4f4a7790bd22588847b0bb8aecd1703e`. Référence de la campagne ayant produit le build proposé : run `2026-09-18T07-43-48-986Z-40a7f6dd`, source_digest `e8b4302deff2cf11ff45eb1849d2cbae1d3d800a9976f8e2caf8041ae1b4a79f` ; BUILD_ID Pro `cb_hN-N_QosuXI5ezpDfh`. La capture fournie par Patrick confirme l’accès à la vue historique filtrée ; le PASS VoiceOver repose sur sa confirmation, pas sur la capture.

Cette consignation documentaire intervient après la campagne automatisée : elle ne réécrit aucun snapshot historique et ne transforme pas cette preuve en release sur SHA H propre. Aucun code applicatif modifié pour cette validation. TalkBack reste DEFERRED. Cette validation manuelle seule ne clôture pas H et n’approuve pas implicitement ADR-015 ; aucun 2bis-I ni Phase 3 commencé.
