# EVIDENCE — preuves et provenance

Les preuves décrivent un état daté et un périmètre effectivement vérifié. Elles ne sont pas le contrat courant ; une preuve Phase 2 ne prouve pas les futurs checkpoints Phase 2 bis.

- [Phase 1](phase1/README.md) : postmortem de clôture et manifeste historique.
- [Phase 2](phase2/README.md) : audit initial, postmortem renforcé, contrôle VoiceOver et attestation finale.
- [Bilan documentaire 2bis-A](../quality/phase-2bis-a-report.md) : inventaire et contrôles du checkpoint courant.

Le rangement manuel approuvé est conservé. Les journaux/captures Phase 1 déjà présents dans [quality/commands](../quality/commands/) et [quality/screenshots](../quality/screenshots/) restent à leur place. Leur caractère historique est explicite dans les index.

Les résultats des postmortems ne sont pas réécrits pour refléter une clôture ultérieure. Les destinations de liens peuvent être corrigées après un déplacement, avec inventaire. Les documents originaux restent consultables au SHA de leur époque ; les journaux bruts, livres et manifestes conservent leurs octets.

Une preuve contient commande/contexte, SHA, environnement, résultat réel et limites. Aucun secret, token ou credential de session. Une absence environnementale reste DEFERRED, jamais PASS implicite. Voir la [politique documentaire](../quality/documentation-policy.md).

- [Rapport 2bis-C](../quality/phase-2bis-c-report.md) : arbre local d’implémentation, résultats et limites ; [journal verify:full](phase2bis/2bis-c-validation.txt), [reconstruction DB](phase2bis/2bis-c-db-reset.txt). Ces fichiers ne constituent pas une attestation de release ou de validation manuelle.

2bis-D : [rapport et identité des campagnes locales](../quality/phase-2bis-d-report.md). Les snapshots/rapports machine-readable restent des artefacts minimisés sous `.quality/snapshots/<run-id>/`, avec SHA, digest et baseline candidate ; aucune baseline acceptée ni preuve CI distante inventée.
