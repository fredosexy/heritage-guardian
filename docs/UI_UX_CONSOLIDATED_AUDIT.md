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
