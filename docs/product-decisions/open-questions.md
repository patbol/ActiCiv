# Décisions produit ouvertes — phases futures

Les décisions Phase 2 sont verrouillées dans [Phase 2 Decisions](../references/historical/ActiCiv_Phase2_Decisions.md) et complétées par les précisions d'implémentation approuvées. Mono-organisation, multi-services, rôles exclusifs, périmètre de supervision, PostGIS/frontières, contrats, scopes SLA, pauses, versionnement et DST ne sont plus ouverts.

| Sujet                                                        | Échéance                |
| ------------------------------------------------------------ | ----------------------- |
| Routage complet et candidats non départageables              | Phase 3                 |
| Payload public de suivi et rétention                         | Phase 3 / avant PROD    |
| Anti-abus : rayon précis et modalités techniques appareil/IP | Phase 3                 |
| Fusion : permissions, médias, tokens, SLA, statistiques      | Avant fusion            |
| Réouverture et conséquences SLA                              | Avant workflow concerné |
| Anciens signalements lors de l'ouverture d'une zone          | Phase 6                 |
| PWA : installation, hors ligne, brouillons, envoi différé    | Phase 3                 |
| Rétention détaillée PROD                                     | Avant PROD              |

Transferts inter-organisations hors MVP. Aucun report ni moteur de routage en Phase 2. TalkBack reste une validation manuelle différée, pas un arbitrage produit.

Décision anti-abus MVP déjà verrouillée par le livre v1.4 : 10 signalements en moins de 2 minutes depuis le même appareil/IP dans une zone très proche, blocage de 15 minutes par défaut, seuils configurables. Cette règle n’est pas rouverte ; son implémentation n’appartient pas à I2.
