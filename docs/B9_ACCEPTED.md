# B9 ACCEPTED — Communications contextuelles et messages

**Date :** 27 septembre 2026  
**Périmètre :** B9 uniquement  
**Décision :** implémentation à certifier avant fusion volontaire.

## 1. Existant réutilisé

B9 réutilise les dossiers et participants B3, les étapes B4, les acteurs B5, les documents et le Storage privé B6, les Access Grants B7 et les interventions B8. Aucun ancien système de chat, conversation ou message n’existait.

## 2. Modèle

La migration `20260927000200_b9_contextual_communications.sql` ajoute :

- `conversations` avec contexte métier obligatoire ;
- `conversation_members` avec appartenance active, quittée ou retirée ;
- `messages` texte, audio, document ou système ;
- `client_message_id` unique par expéditeur pour l’idempotence.

Il n’existe aucun chat global.

## 3. Sécurité

L’accès exige une appartenance active et une relation Dossier ou un Grant encore valide. Le backend impose l’expéditeur courant, protège les messages système, contrôle les acteurs et empêche une pièce jointe de contourner les permissions documentaires B7.

Les tables sont en lecture contrôlée et les écritures passent par RPC. Les membres retirés perdent immédiatement l’accès.

## 4. Audio et documents

Les notes vocales sont stockées dans le bucket privé B6 sous `conversations/{conversation}/{clientMessageId}`. Leur lecture utilise une URL signée courte. Les navigateurs peuvent envoyer `audio/webm`.

Une pièce jointe référence toujours un document B6 existant. Aucun second système de fichiers n’a été créé.

## 5. Application et interface

- règles pures dans `communication-rules.ts` ;
- repository centralisé avec pagination par 30 messages ;
- section « Échanges » sur le détail Dossier ;
- texte, réponses rapides, enregistrement, écoute avant envoi, suppression avant envoi, audio et document ;
- contexte visible et traductions français/anglais ;
- aucun appel Supabase dans les composants.

Realtime n’est pas requis pour fonctionner et aucun mécanisme websocket parallèle n’a été ajouté.

## 6. Offline

Les états `local`, `pending`, `sent` et `failed` sont définis. `client_message_id` permet les retries sans doublon. L’outbox complète reste réservée à B12.

## 7. Tests

La CI couvre les règles unitaires et 17 scénarios SQL B9 : création, membres légitimes, texte, audio privé, document B6, idempotence, usurpation d’identité, isolation externe, retrait et perte immédiate d’accès.

## 8. Frontière

Aucun signalement B10, audit global B11, offline complet B12 ou notification avancée B13 n’est implémenté.
