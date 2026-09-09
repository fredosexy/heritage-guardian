# B9 — COMMUNICATIONS CONTEXTUELLES + MESSAGES

**AUDIT FIRST — REUSE FIRST — DELTA ONLY — PRODUCTION ONLY**

B1 à B8 sont terminés.

Ne reconstruis rien.

## 1. AUDIT OBLIGATOIRE

Inspecte avant toute modification :

- messagerie existante ;
- notifications/messages ;
- conversations liées aux dossiers ;
- composants Chat/Message/Thread ;
- audio/voice notes ;
- pièces jointes ;
- tables/messages existantes ;
- realtime éventuel ;
- Storage audio ;
- RLS ;
- logique offline déjà présente.

Réutilise ce qui existe.

Ne crée pas un deuxième système de messagerie.

---

# 2. OBJECTIF B9

Finaliser uniquement :

1. conversations contextuelles ;
2. membres d'une conversation ;
3. messages texte ;
4. notes vocales ;
5. pièces jointes ;
6. messages système ;
7. rattachement métier ;
8. RLS ;
9. UI conversation ;
10. compatibilité offline future.

Ne touche pas encore :

- Signalements complets B10 ;
- Audit global B11 ;
- Offline Sync complet B12 ;
- Notifications avancées B13.

---

# 3. PRINCIPE PRODUIT

Il n'existe pas de chat libre global.

Toute conversation doit être rattachée à un contexte métier.

Contextes autorisés :

```text id="0q7r6s"
dossier
dossier_step
access_request
intervention
signalement
```

Une conversation doit toujours permettre de comprendre :

```text id="y4l86g"
Pourquoi cette conversation existe ?
À quel dossier appartient-elle ?
Qui y participe ?
Quel est l'objet de l'échange ?
```

---

# 4. TABLE `conversations`

Créer ou compléter.

Champs minimum :

```text id="l3g1ya"
id
conversation_type
dossier_id nullable
step_id nullable
access_request_id nullable
intervention_id nullable
signalement_id nullable
created_by
status
created_at
closed_at nullable
```

Statuts :

```text id="sbsgoy"
active
closed
archived
```

Une conversation ne doit pas exister sans contexte valide.

---

# 5. TABLE `conversation_members`

Relation :

```text id="5rhm9o"
conversations 1 → N conversation_members
```

Champs minimum :

```text id="fhe6l4"
id
conversation_id
member_user_id
member_actor_id nullable
role
joined_at
left_at nullable
status
```

Statuts :

```text id="lymnqj"
active
left
removed
```

Le rôle dans une conversation ne remplace pas :

- rôle Dossier ;
- rôle Acteur ;
- Access Grant.

---

# 6. TABLE `messages`

Créer ou compléter.

Champs minimum :

```text id="u2wzq7"
id
conversation_id
sender_user_id
sender_actor_id nullable
message_type
text_content nullable
audio_path nullable
attachment_document_id nullable
client_message_id
reply_to_message_id nullable
created_at
server_received_at
edited_at nullable
deleted_at nullable
```

Types :

```text id="oeb3dq"
text
audio
document
system
```

---

# 7. `client_message_id`

Obligatoire pour préparer l'offline.

Chaque message créé côté client doit posséder un identifiant stable permettant :

- retry ;
- idempotence ;
- prévention des doublons.

Ne génère pas un nouvel identifiant à chaque tentative de synchronisation.

---

# 8. MESSAGE TEXTE

Supporter :

- texte court ;
- réponses simples ;
- lien au contexte métier.

En mode Rural essentiel :

éviter les gros blocs de texte.

Privilégier :

- phrases courtes ;
- réponses guidées ;
- boutons rapides lorsque pertinent.

---

# 9. NOTE VOCALE

La note vocale est une fonctionnalité importante.

Permettre :

- enregistrer ;
- écouter avant envoi ;
- supprimer avant envoi ;
- envoyer ;
- réécouter après envoi.

Le fichier audio doit utiliser le Storage privé existant.

La transcription :

- facultative ;
- jamais bloquante ;
- ne remplace pas l'audio original.

---

# 10. PIÈCE JOINTE

Ne crée pas un deuxième système de fichiers.

Réutilise B6 Documents.

Pour joindre un document :

```text id="yl6zp7"
message
→ attachment_document_id
→ document existant
```

Si un nouveau document doit être ajouté, il passe d'abord par le workflow B6.

---

# 11. MESSAGE SYSTÈME

Les événements importants peuvent créer un message système lisible.

Exemples :

```text id="1qgxuo"
Paul a été ajouté comme accompagnateur.

L'accès du Géomètre X a été accordé.

L'étape Arrondissement a été terminée.

Le document Y a été ajouté.
```

Ne mets pas la logique d'événements dans les composants.

---

# 12. CONTEXTE DOSSIER

Une conversation Dossier peut concerner :

```text id="pf23i7"
accompagnement général
question sur le dossier
coordination
```

Seuls les membres autorisés du Dossier peuvent y accéder selon les règles backend.

---

# 13. CONTEXTE ÉTAPE

Une conversation liée à une étape doit afficher clairement :

```text id="ncp8u1"
Dossier : ...
Étape : ...
Niveau : ...
Objet : ...
```

L'intervenant ne doit voir que les informations nécessaires.

---

# 14. CONTEXTE ACCESS REQUEST

Permettre un échange limité autour d'une demande d'accès.

Exemple :

```text id="jk3igs"
Pourquoi demandez-vous l'accès ?
Pouvez-vous préciser quels documents sont nécessaires ?
```

Une demande refusée ou expirée peut fermer automatiquement la conversation si le workflow produit le prévoit.

---

# 15. CONTEXTE INTERVENTION

Permettre un fil de discussion autour d'une intervention :

- précision ;
- demande de document ;
- complément d'information.

Ne pas modifier l'intervention originale via les messages.

---

# 16. MEMBRES AUTORISÉS

Un utilisateur peut rejoindre une conversation seulement si :

- il possède une relation légitime au contexte ;
- ou un Access Grant valide ;
- ou un rôle backend autorisé.

Être membre d'une conversation ne donne pas automatiquement accès à tout le Dossier.

---

# 17. PORTÉE DES INFORMATIONS

Lorsqu'un Acteur possède seulement :

```text id="7skxl7"
voir_resume
intervenir
```

la conversation ne doit pas lui révéler :

- documents non autorisés ;
- autres participants privés ;
- données non couvertes par son Grant.

Les permissions de B7 restent applicables.

---

# 18. REPOSITORY / SERVICE

Réutiliser l'architecture existante.

Exposer conceptuellement :

```ts id="f2h0hf"
createConversation(...)
getConversation(...)
getConversationsForUser(...)

getMessages(...)
sendTextMessage(...)
sendAudioMessage(...)
sendDocumentMessage(...)

addConversationMember(...)
removeConversationMember(...)
closeConversation(...)
```

Les composants ne parlent pas directement à Supabase.

---

# 19. REALTIME

Si Supabase Realtime existe déjà et est approprié :

réutilise-le.

Ne rajoute pas un deuxième mécanisme websocket.

Realtime doit uniquement améliorer l'expérience.

La persistance backend reste la source de vérité.

L'application doit continuer à fonctionner sans realtime.

---

# 20. UI — DOSSIER

Réutilise le détail Dossier.

Ajouter/compléter une section :

**Échanges**

Afficher les conversations pertinentes.

Ne crée pas une énorme boîte de réception générale si elle n'existe pas déjà comme besoin produit.

---

# 21. UI — CONVERSATION

Écran ou Sheet selon l'architecture existante.

Afficher :

- contexte métier ;
- participants ;
- messages ;
- zone de réponse ;
- bouton texte ;
- bouton vocal ;
- pièce jointe.

Toujours garder visible :

```text id="40fik7"
Dossier / Étape concernée
```

pour éviter de perdre le contexte.

---

# 22. MODE RURAL ESSENTIEL

Priorités :

```text id="p74qw9"
🔊 Écouter
🎙️ Répondre avec ma voix
⌨️ Écrire
```

Afficher peu d'informations à la fois.

Prévoir des réponses rapides simples lorsque pertinent :

```text id="g4j0yn"
Oui
Non
J'ai compris
Je vais envoyer le document
J'ai besoin d'aide
```

---

# 23. STATUT DU MESSAGE

Préparer des états cohérents :

```text id="noqel4"
local
pending
sent
failed
```

Ne pas afficher :

`Envoyé`

avant confirmation backend.

Les états de sync complets seront finalisés en B12.

---

# 24. ÉDITION

Si l'édition des messages est autorisée :

conserver au minimum :

```text id="12wmgh"
edited_at
```

Pour les messages sensibles ou officiels, préférer append/correction plutôt qu'effacement destructif.

Ne laisse pas un utilisateur modifier un message système.

---

# 25. SUPPRESSION

Éviter les suppressions physiques.

Utiliser :

```text id="ud266r"
deleted_at
```

si le produit autorise la suppression utilisateur.

Les données nécessaires à l'audit ne doivent pas disparaître silencieusement.

---

# 26. RLS — `conversations`

**DENY BY DEFAULT**

SELECT :

uniquement membres autorisés + contexte accessible.

INSERT :

utilisateur autorisé à créer une conversation pour ce contexte.

UPDATE :

très restreint.

---

# 27. RLS — `conversation_members`

Un utilisateur ne peut pas ajouter arbitrairement quelqu'un à une conversation privée.

L'ajout doit respecter :

- rôle Dossier ;
- Access Grant ;
- workflow autorisé.

---

# 28. RLS — `messages`

SELECT :

membre actif + accès valide au contexte.

INSERT :

membre actif autorisé.

UPDATE :

uniquement auteur et uniquement champs autorisés si édition permise.

DELETE logique :

auteur selon règles produit.

Un utilisateur ne peut jamais envoyer un message au nom d'un autre utilisateur.

---

# 29. AUDIO STORAGE

Les notes vocales doivent être privées.

Tester :

- upload autorisé ;
- lecture par membres autorisés ;
- accès refusé aux autres utilisateurs ;
- aucune URL publique permanente.

---

# 30. INDEXES

Prévoir selon requêtes réelles :

```text id="kyozz8"
conversations.dossier_id
conversations.step_id
conversations.signalement_id

conversation_members.conversation_id
conversation_members.member_user_id

messages.conversation_id
messages.created_at
messages.client_message_id
```

`client_message_id` doit être unique dans la portée appropriée.

---

# 31. PAGINATION

Les messages doivent être paginés.

Ne charge pas tout l'historique à chaque ouverture.

Supporter :

- derniers messages ;
- chargement progressif vers le passé.

---

# 32. TESTS UNITAIRES

Tester :

- création conversation ;
- ajout membre ;
- envoi texte ;
- note vocale ;
- document joint ;
- fermeture conversation ;
- client_message_id idempotent ;
- contexte correctement conservé.

---

# 33. TESTS RLS / INTÉGRATION

Scénarios minimum :

1. membre autorisé lit la conversation ;
2. utilisateur externe ne la lit pas ;
3. Acteur avec Grant limité ne voit pas plus que sa portée ;
4. utilisateur ne peut pas envoyer au nom d'un autre ;
5. membre retiré perd l'accès ;
6. note vocale privée reste protégée ;
7. document non autorisé n'est pas exposé via message ;
8. doublon de message offline évité avec `client_message_id`.

---

# 34. COMPATIBILITÉ EXISTANTE

Si l'ancien code possède :

```text id="sekxhk"
chat
messages
inbox
notifications conversationnelles
```

ne supprime pas brutalement.

Identifier :

- ce qui est réutilisable ;
- ce qui est sans contexte ;
- ce qui doit être migré ;
- ce qui doit être déprécié.

Ne conserve pas deux systèmes actifs.

---

# 35. FRONTIÈRES

Ne mets pas dans Communications :

- logique Dossier ;
- validation d'étapes ;
- permissions principales ;
- gestion Documents ;
- logique Signalement.

Communications transporte les échanges.

Les autres domaines restent source de vérité.

---

# 36. VALIDATION B9

Avant de terminer :

- build réussi ;
- TypeScript sans erreur ;
- migrations valides ;
- conversations contextuelles fonctionnent ;
- texte fonctionne ;
- audio fonctionne ;
- documents B6 réutilisés ;
- RLS appliquée ;
- pagination fonctionne ;
- contexte toujours visible ;
- aucun chat global non contrôlé créé ;
- aucun appel Supabase dans composants ;
- aucun domaine B10+ implémenté.

---

# 37. LIVRABLE

Rapporte uniquement :

1. existant réutilisé ;
2. ancien système de messagerie adapté ;
3. fichiers créés ;
4. fichiers modifiés ;
5. migrations ;
6. RLS/Storage policies ;
7. services/repositories ;
8. UI adaptée ;
9. tests ;
10. écarts éventuels.

**Ne commence pas B10.**