# VoiceOver ciblé I2 — protocole de validation I3

Statut initial : À EXÉCUTER par Patrick. Cette fiche définit le protocole, pas un PASS. Le résultat sera une attestation distincte liée au SHA candidat et au BUILD_ID réellement proposés. La preuve VoiceOver H demeure historique et inchangée. TalkBack reste DEFERRED_ENV sans appareil Android.

## Préparation

Après reconstruction et tests automatiques, utiliser Pro local sur 3001, une identité plateforme de revue dotée de quality.read et le magasin privé préparé pour cette session. Identifiants transmis séparément, jamais versionnés. Les quatre runs de présentation sont explicitement synthétiques, ne représentent pas des mesures réelles, ne sont pas une baseline et ne seront pas uploadés. Le vrai snapshot final reste séparé.

Activer VoiceOver avec Commande-F5. Utiliser rotor/titres, Tab/Maj-Tab et lecture des contenus. Noter navigateur/version, date, BUILD_ID et SHA indiqués dans la fiche d’accès privée. Ne pas rejouer les neuf parcours H.

| ID       | Contrôle nouveau                                                   | Attendu                                                                                                                                             |
| -------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| I2-VO-01 | `/quality?run=i2-review-stable`, bloc Stabilité mesurée séparément | Stable sur l’échantillon ; répétitions, période, taux et provenance lisibles                                                                        |
| I2-VO-02 | `/quality?run=i2-review-flaky`                                     | Instabilité observée, tentatives et taux distincts d’un PASS après retry                                                                            |
| I2-VO-03 | `/quality?run=i2-review-unknown`                                   | Échantillon insuffisant/indéterminé clairement annoncé, pas stable par défaut                                                                       |
| I2-VO-04 | `/quality?run=i2-review-not-run`                                   | Mesure non exécutée, absence de mesure distinguée de zéro échec                                                                                     |
| I2-VO-05 | Bloc Accessibilité du run stable                                   | Revue humaine requise, compteur incomplete, règle et provenance lisibles ; séparés de zéro violation automatique et de la preuve VoiceOver manuelle |
| I2-VO-06 | Passer en EN et relire ces blocs, puis revenir en FR               | Mêmes informations, langue correcte, ordre cohérent et focus conservé au changement                                                                 |

Réponse attendue : PASS/KO par ID, détail du KO éventuel, navigateur/version. Seul un retour explicite de Patrick constitue la preuve manuelle. Aucune déduction à partir d’axe ou d’un screenshot.
