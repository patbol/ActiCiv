# Vérification de phase 1

Les unités couvrent les comportements de configuration et la non-divulgation des logs. Playwright vérifie les deux surfaces desktop/mobile, le dialogue, le focus, les labels, le lien d'évitement et reduced-motion. axe recherche les violations WCAG A/AA détectables.

Les commandes E2E s'exécutent après build sur les serveurs de production locaux. Le profil iPhone utilise Chromium avec viewport mobile : il ne prouve ni Safari iOS, ni VoiceOver, ni TalkBack.

À vérifier manuellement avant acceptation a11y complète : VoiceOver sur Safari, TalkBack sur Android, zoom 200/400 %, navigation sans souris et absence d'information par couleur seule. Statut initial : non vérifié.

Chaque bug doit avoir un test qui échoue avant et réussit après correction. Les défauts de configuration/build sont protégés par le contrôle correspondant (typecheck, lint, build, install frozen). Les tests métier A/B RLS et concurrence viendront avec les fonctions correspondantes ; aucun test vide ne les remplace.

Aucun seuil de couverture global artificiel. CI ne passe pas si un contrôle obligatoire échoue. Les preuves sont dans phase-1-report.md et les journaux commands/.

Le test des frontières charge la configuration ESLint complète et dispose de 15 secondes, car son chargement à froid dépasse les cinq secondes par défaut sur ce runtime. Les assertions restent inchangées. Les tests de navigation sont exécutés sans retry.
