# B10 ACCEPTED — Signalements, contestations et historique des faits

**Date :** 27 septembre 2026  
**Périmètre :** B10 uniquement  
**Décision :** implémentation à certifier avant fusion volontaire.

## Existant réutilisé

Dossiers/participants B3, étapes B4, acteurs B5, documents B6, permissions B7, interventions B8 et communications B9. Aucun ancien système concurrent n’existait.

## Modèle et responsabilité

`signalements` conserve le créateur, la personne représentée, son rôle, le bien, le dossier, l’étape, l’intervention ou l’acteur concerné et le résultat souhaité. Le langage reste neutre et ne conclut jamais automatiquement à une faute.

`signalement_events` est append-only. Les documents sont référencés via B6 et les témoins via les participants/acteurs existants. Aucun élément original n’est réécrit.

## Workflow et sécurité

Le parcours va de `brouillon` à `clos`. Un utilisateur ordinaire peut documenter et transmettre, mais les états `en_examen`, `resolu` et `clos` exigent un vérificateur autorisé.

La RLS limite les données à l’auteur, au propriétaire du dossier et aux rôles de traitement autorisés. Mentionner un acteur concerné ne lui donne aucun accès automatique. Le backend vérifie le rôle déclaré, la représentation, les références et la neutralité.

## Application et interface

Le moteur de workflow, le repository et la section « Signalements et points contestés » sont séparés de React/Supabase. L’utilisateur choisit le fait, décrit la situation, lie éventuellement une étape, intervention ou pièce, indique le résultat souhaité puis suit le statut et la prochaine action.

Une conversation liée utilise B9 ; aucune messagerie parallèle n’est créée.

## Tests

La CI couvre les règles unitaires et 16 scénarios SQL : accompagnement pour titulaire, documents, témoins, neutralité, soumission, auto-résolution refusée, conversation B9, confidentialité, examen autorisé, conservation de l’intervention et événements append-only.

## Frontière

Aucun audit global B11, offline complet B12, notification avancée B13 ou back-office B14 n’est implémenté.
