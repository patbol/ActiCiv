# Phase 2 — contrôle manuel VoiceOver / Safari

Ce contrôle couvre les nouveaux écrans Auth et l'espace professionnel. Il complète les tests axe/clavier automatiques ; seul le retour d'une personne utilisant réellement VoiceOver permet de le valider.

La commande `node scripts/voiceover-session.mjs` prépare les fixtures locales, écrit les identifiants et le lien d'invitation dans `/private/tmp/acticiv-phase2-voiceover-session.md`, puis démarre le build Pro sur 3001. Ce fichier privé n'est jamais ajouté à Git. La session relève l'empreinte SHA-256 des sources Auth/Pro pour vérifier leur stabilité jusqu'à la livraison. Supabase doit être démarré et le build Pro déjà réalisé.

Utiliser Safari sur le Mac, activer VoiceOver, et relever la version de macOS/Safari. La navigation doit rester possible au clavier et avec les commandes VoiceOver, sans dépendre d'une souris. Relever toute différence entre le texte visible et les annonces.

| ID    | Parcours                                                                                                                         | Résultat attendu                                                                                                                            |
| ----- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| VO-01 | Ouvrir `/auth/login`, parcourir titre, email, mot de passe, bouton et liens                                                      | Langue française, titre compréhensible, labels et rôle des champs annoncés ; le mot de passe reste protégé                                  |
| VO-02 | Essayer une connexion avec une adresse inexistante et un mot de passe incorrect                                                  | Message d'erreur annoncé, focus sur l'erreur, retour au formulaire possible au clavier, aucun accès métier                                  |
| VO-03 | Se connecter avec le compte fictif fourni, puis se déconnecter                                                                   | Titre de l'espace et état actif annoncés ; bouton de déconnexion identifié ; retour au login                                                |
| VO-04 | Ouvrir `/auth/recover`, remplir le compte fourni, demander le lien                                                               | Label email, bouton, puis confirmation générique annoncée avec focus ; aucune divulgation de l'existence du compte                          |
| VO-05 | Dans la boîte locale indiquée, ouvrir le dernier lien recovery reçu ; définir un mot de passe d'au moins 12 caractères           | Titre, label, aide et erreurs de validation perceptibles ; après succès, espace actif, puis connexion possible avec le nouveau mot de passe |
| VO-06 | Dans une nouvelle fenêtre privée Safari, ouvrir le lien d'invitation fourni ; définir un mot de passe, puis accepter avec un nom | Chaque changement de page annonce le titre ; nom/bouton identifiés ; accès actif seulement après acceptation                                |
| VO-07 | Ouvrir `/auth/accept?error=1` sans session/invitation utilisable                                                                 | Erreur et absence d'invitation annoncées, lien vers l'espace utilisable ; aucun accès actif accordé                                         |
| VO-08 | Ouvrir `/auth/callback?code=invalid&next=https://example.invalid`                                                                | Reste sur Pro, erreur de connexion annoncée et focalisée, aucune redirection externe                                                        |

Pour le lien recovery, prendre **le dernier message reçu après la demande** ; un ancien lien peut avoir été invalidé. Les pages utiles sont toutes sur `http://127.0.0.1:3001`. La boîte mail locale sert uniquement aux fixtures DEV.

Retour attendu : date, version macOS/Safari, empreinte de session, PASS/FAIL pour VO-01 à VO-08, et description de toute difficulté de focus, annonce, champ ou navigation. Ne pas recopier les mots de passe ni les tokens dans le postmortem. En cas de défaut, le corriger et rejouer le parcours concerné avant clôture. TalkBack reste séparé et ne peut pas être déduit de ce test.
