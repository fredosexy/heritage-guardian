# Heritis — consolidation des audits UI/UX

**Référence :** `main` au commit `26dca74ff76a21ebd67cf73c03860bf222c8d6d5`. Dépôt GitHub uniquement ; aucun changement direct dans Lovable.

## Sources documentaires
- Inventaire : [PR #36](https://github.com/fredosexy/heritage-guardian/pull/36)
- Cohérence visuelle : [PR #37](https://github.com/fredosexy/heritage-guardian/pull/37)
- Parcours fonctionnels : [PR #38](https://github.com/fredosexy/heritage-guardian/pull/38)
- Responsive/accessibilité : [PR #39](https://github.com/fredosexy/heritage-guardian/pull/39)

Les quatre PR étaient ouvertes et fusionnables au moment de la vérification du 22 octobre 2026. Elles sont documentaires. Aucun test navigateur, lecteur d’écran ou rapport automatisé de contraste n'a été produit.

## Backlog consolidé et ordre de correction

| Priorité | Zone | Constat statique | Action et validation attendue |
|---|---|---|---|
| P1 | `useDossierDetail.tsx` | Si une requête de dossier/preuves/participants échoue, `loading` peut rester vrai. | Ajouter un état d'erreur, terminer le chargement même en échec et permettre de réessayer ; tester le rejet de chaque requête. |
| P1 | `useAlerts.tsx`, `AlertsPage.tsx` | Le marquage lu est optimiste, sans rollback si la persistance échoue. | Restaurer l'état précédent et afficher un retour contrôlé ; tester succès et échec. |
| P1 | `SyncCenterPage.tsx` | « Ma version » paraît choisie mais `choice` reste vide tant que l'utilisateur n'interagit pas. | Initialiser explicitement la valeur ou imposer un choix ; vérifier les données effectivement soumises. |
| P1 | `AssistantPage.tsx` | `h-screen` et scroll JS peuvent mal réagir au clavier virtuel et à la préférence de mouvement réduit. | Améliorer la hauteur dynamique et respecter `prefers-reduced-motion` ; tester appareil réel. |
| P1 | `AuthPage.tsx` | Connexion/inscription ne publient pas explicitement leur état sélectionné ; focus/cible tactile non uniformes. | Exposer l'état accessible, focus visible et cible tactile cohérente ; test clavier/lecteur d'écran. |
| P1 | CTA Auth/Onboarding/Module | Texte ou icônes blancs sur gradients pastel très clairs : contraste potentiellement insuffisant. | Mesurer le contraste réel avant de changer les couleurs ; corriger seulement les échecs mesurés. |
| P2 | Hooks dossiers/alertes | Certains échecs sont absorbés et peuvent ressembler à une liste vide. | Distinguer erreur et état vide, avec relance ; tester panne réseau vs réponse vide. |
| P2 | Filtre urgent | Le filtre compare `type`, alors que le style repose sur `severity`. | Confirmer le modèle de domaine puis ajouter des tests sur type/gravité avant de changer le filtre. |
| P2 | Navigation et composants partagés | Badge non lu, focus clavier, tailles tactiles, zoom, langues longues et thèmes restent à valider. | Tests responsive, clavier seul, lecteur d'écran et contrastes. |
| P2 | Typographie et surfaces | Quelques écrans ont des styles locaux ; thème clair/sombre pas validé visuellement. | Réutiliser les tokens pertinents sans altérer la direction pastel lavande/bleu/rose/menthe. |

## Séquence approuvée
1. Corriger les risques fonctionnels P1.
2. Corriger l'accessibilité des contrôles principaux.
3. Valider contraste, typographie et responsive.
4. Exécuter `npm run lint`, `npm test`, `npm run build`, puis vérifier la CI GitHub.
5. Rapporter les résultats et les risques restant à tester manuellement.

## Garde-fous
- Les constats sont issus d'une lecture statique et doivent être confirmés par les tests adaptés.
- Ne pas renommer/remplacer globalement `gradient-earth` ou `gradient-warm` : leurs définitions actuelles sont pastel.
- Ne pas changer les règles métier, les permissions ou la stratégie de conservation sans tests ciblés.
- Aucun travail dans Lovable et aucune fusion sans demande explicite.


## Vérification de suivi — 22 octobre 2026

La revue source complémentaire de la partie 4 est consignée dans [PR #39](https://github.com/fredosexy/heritage-guardian/pull/39). Elle confirme notamment le scroll JS sans respect explicite de `prefers-reduced-motion` dans l'assistant, le bouton retour de 40 px, l'absence d'état accessible explicite pour le choix connexion/inscription et le badge d'alertes sans annonce dédiée du nombre non lu. La palette déclarée reste pastel (lavande, bleu ciel, rose poudré, menthe) ; aucun changement global de couleurs n'est recommandé sans mesure de contraste.

### État des PR de la séquence

- PR #36 — inventaire : ouverte, non fusionnée.
- PR #37 — cohérence visuelle : ouverte, non fusionnée.
- PR #38 — parcours fonctionnels : ouverte, non fusionnée.
- PR #39 — responsive/accessibilité : ouverte, non fusionnée ; revue source approfondie ajoutée.
- PR #40 — consolidation : ouverte, non fusionnée.
- PR #41 — corrections prioritaires proposées : ouverte, non fusionnée.

Toutes sont déclarées fusionnables par les métadonnées consultées, mais cela ne vaut pas validation fonctionnelle complète et aucune fusion n'a été effectuée.

### État CI vérifié pour la branche de corrections PR #41

Pour le commit `fa72672ce88fad98b4ba4ea15785d93571dd94e8` :
- `Terrain CI` : succès.
- `Quality` : échec sur le job `database-migrations`, à l'étape de démarrage du stack Supabase local.
- Le journal indique une limite de téléchargement du registre (`toomanyrequests` lors du pull de `ghcr.io/supabase/postgres:17.6.1.095`). L'étape d'application des migrations et les tests DB sont donc ignorés ; ce résultat ne prouve pas une erreur SQL.
- Le job `test` est réussi ; les tests, lint et build exécutés par ce job sont au vert. `edge-integration` est ignoré.

**Conclusion de validation :** les contrôles applicatifs ordinaires passent sur ce commit, mais la validation complète reste bloquée par l'accès à l'image du registre pour les tests de migrations. Il faut relancer ce job lorsque la limite de téléchargement sera levée ou adapter la stratégie de pull/cache, puis exécuter les tests manuels responsive et accessibilité. Les scripts présents dans `package.json` ne constituent pas, à eux seuls, une preuve d'exécution ; les résultats ci-dessus proviennent des jobs CI consultés.


## Suivi opérationnel — 22 octobre 2026 (mise à jour)

### Correctif du workflow Supabase — PR #42
La PR [#42](https://github.com/fredosexy/heritage-guardian/pull/42) conserve tous les contrôles et rend les téléchargements d'images Supabase résilients aux limites de registre. Sur son commit de tête `a4bf6bf9ce639fe8519bed0311360853dae5e868`, les résultats observés sont :
- `Terrain CI` : succès.
- `Quality / test` : succès (tests, lint et build).
- `Quality / database-migrations` : succès ; le stack local a démarré, les migrations se sont appliquées et les tests DB ont été exécutés.
- `Quality / edge-integration` : succès ; le stack local a démarré et les tests d'intégration Edge ont été exécutés.

Cela valide le correctif CI sur la branche #42. La PR reste ouverte et non fusionnée ; ce résultat ne met pas automatiquement à jour la branche #41.

### Revue statique de la PR #41
La revue du diff confirme les changements ciblés sur les erreurs de chargement des dossiers, le rollback de marquage des alertes, les contrôles d'authentification, les mouvements réduits et la cible tactile du bouton retour de l'assistant. Deux vérifications restent requises avant approbation :
- **Conflits hors ligne :** l'état initial est désormais explicitement `mine` pour chaque champ en conflit. Confirmer par test que le choix transmis à `resolve` correspond à la stratégie métier attendue et que les champs sont persistés correctement.
- **Filtre urgent :** le filtre utilise désormais `severity === "high"`, ce qui est cohérent avec la bordure visuelle, mais le modèle de domaine et les cas de données doivent confirmer que « urgent » signifie bien gravité haute.

La navigation après clic sur une alerte reste immédiate alors que `markRead` est asynchrone ; cela n'empêche pas l'affichage du toast d'erreur, mais doit être couvert par un test de persistance en échec. Aucun test navigateur ou lecteur d'écran n'a été exécuté par cette revue statique.

### État de validation des PR
- #36–#40 : ouvertes et non fusionnées.
- #41 : ouverte, non fusionnée ; son dernier run consulté est antérieur au correctif CI et échoue au démarrage Supabase. Les tests applicatifs ordinaires passent, mais la validation complète de cette branche doit être rejouée après que le correctif du workflow y soit disponible.
- #42 : ouverte, non fusionnée ; les trois jobs Quality et Terrain CI réussissent sur sa branche.

### Ordre prudent de suite
1. Intégrer le correctif CI #42 après décision explicite de fusion, puis relancer les contrôles sur les branches de travail concernées.
2. Exécuter/ajouter les tests ciblés de résolution de conflit et de filtre urgent.
3. Mettre à jour les audits et seulement ensuite décider de l'ordre de fusion des PR documentaires et de correction.
4. Effectuer les validations manuelles responsive, clavier, lecteur d'écran et contraste mesuré avant de déclarer l'audit UI/UX terminé.

Aucune fusion n'a été effectuée et aucun changement Lovable n'a été réalisé.
