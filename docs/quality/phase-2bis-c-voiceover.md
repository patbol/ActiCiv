# 2bis-C — contrôle VoiceOver du choix de langue

Statut : **PASS — C-VO-01 à C-VO-05 validés manuellement par Patrick le 18 septembre 2026**. Aucun résultat VoiceOver n’est déduit des tests axe/Playwright. La validation Phase 2 ne couvre pas ce nouveau contrôle.

Utiliser Safari avec VoiceOver sur macOS. Les deux builds sont servis sur `http://127.0.0.1:3000` (Citizen) et `http://127.0.0.1:3001` (Pro). Les identifiants fictifs sont fournis dans un fichier privé temporaire, jamais dans Git. Relever date, versions macOS/Safari et résultat par ligne.

| ID      | Manipulation                                                                             | Attendu                                                                                                                    |
| ------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| C-VO-01 | Citizen : atteindre « Langue de l’interface », parcourir les options, choisir English    | Label et valeur annoncés ; Français/English identifiables ; confirmation ; textes anglais ; focus conservé sur le contrôle |
| C-VO-02 | Recharger Citizen puis revenir au français au clavier                                    | Anglais conservé au rechargement ; retour français annoncé ; aucune URL préfixée                                           |
| C-VO-03 | Pro déconnecté : saisir l’email sur `/auth/login`, changer de langue                     | Nom du sélecteur et valeur annoncés ; saisie conservée ; focus ne saute pas au titre ; labels du formulaire traduits       |
| C-VO-04 | Se connecter avec le compte fictif ; choisir English, se déconnecter puis se reconnecter | Session active après choix ; confirmation accessible ; anglais retrouvé à la reconnexion ; aucun droit nouveau             |
| C-VO-05 | Pro connecté sur `/espace` : choisir « Organisation default »                            | Retour au français de l’organisation de test, option d’héritage identifiable et confirmation annoncée ; focus conservé     |

Le changement `html.lang` ne garantit pas à lui seul un changement de voix si la voix anglaise est absente/désactivée sur macOS. Distinguer configuration du lecteur et défaut de label/focus/annonce. Signaler tout message non annoncé, contrôle inaccessible ou donnée perdue.

TalkBack : **DEFERRED**, aucune preuve Android fournie pour ce checkpoint. Ce résultat est distinct de VoiceOver.

## Candidat proposé au contrôle manuel

Préparation : 2026-09-17T21:43:06.966Z. Parent Git : `7d43c1b8b3ece14cb6df03f4a445030cbbec326b`, modifications C non commitées.

Empreinte SHA-256 des sources UI/locale contrôlées : `5d89a8a2b45175b7df0e348215dce550d97f749984aea56dfef810a4632c1010`. BUILD_ID Citizen : `K70XPqsoZS_FHe3yRbGV2` ; Pro : `rbuHOAWwjyQaCsiV4MgLI`. Le manifeste exact des chemins est conservé avec la session privée temporaire.

Retour manuel de Patrick reçu le 18 septembre 2026 :

- **PASS : C-VO-01, C-VO-02, C-VO-03, C-VO-04, C-VO-05.**
- C-VO-05 initialement signalé en échec : la disparition concernait la déconnexion. Après clarification du comportement attendu, Patrick confirme explicitement : « ok alors C-VO-05 ok ». Le protocole précise désormais de rester connecté sur Pro pour vérifier l’héritage.
- Versions macOS/Safari non communiquées.

Le candidat a passé 38 E2E sans retry et 58 analyses axe ; cela ne remplace pas ce retour humain. La validation des cinq contrôles repose sur les confirmations explicites de Patrick.

## Diagnostic du signalement C-VO-05

Le 18 septembre, contrôle local du même build avec le compte fictif dédié : profil, membership et organisation actifs ; préférence `en-GB`, défaut organisation `fr-FR`. Trois cycles de connexion/déconnexion dans un contexte Chromium neuf montrent systématiquement l’option après connexion sur `/espace`, et son absence après déconnexion. Aucune préférence n’a été modifiée pendant ce diagnostic. Le moteur WebKit Playwright n’est pas installé ; ce contrôle ne reproduit pas Safari/VoiceOver.

Le signalement est résolu après clarification avec Patrick : l’héritage est proposé uniquement au professionnel actif ; son absence après déconnexion est attendue. Le libellé français est « Défaut de l’organisation ». Le PASS repose sur la confirmation manuelle de Patrick, et non sur le diagnostic Chromium. Aucun changement de code applicatif n’a été nécessaire ; seule la précondition du protocole a été précisée.
