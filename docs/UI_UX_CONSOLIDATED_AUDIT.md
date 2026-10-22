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
