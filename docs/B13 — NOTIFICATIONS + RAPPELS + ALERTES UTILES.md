# B13 — NOTIFICATIONS + RAPPELS + ALERTES UTILES

**AUDIT FIRST — REUSE FIRST — DELTA ONLY — PRODUCTION ONLY**

B1 à B12 sont terminés.

Ne reconstruis rien.

## 1. AUDIT OBLIGATOIRE

Inspecte avant toute modification :

- système de notifications existant ;
- notifications push ;
- préférences utilisateur ;
- éventuelles tables `notifications` ;
- service worker ;
- push subscriptions ;
- événements métier B11 ;
- messages système B9 ;
- rappels existants ;
- composants UI de notification ;
- badge/unread count ;
- éventuelles Edge Functions.

Réutilise ce qui existe.

Ne crée pas un deuxième système de notifications.

---

# 2. OBJECTIF B13

Finaliser uniquement :

1. notifications applicatives ;
2. préférences de notification ;
3. rappels ;
4. push si déjà prévu/supporté ;
5. dérivation depuis événements métier ;
6. unread/read ;
7. deep links vers le bon contexte ;
8. compatibilité offline ;
9. RLS ;
10. tests.

Ne touche pas encore :

- Back-office complet B14 ;
- nouvelles features métier.

---

# 3. PRINCIPE

Une notification doit provenir d'un événement métier ou d'une règle de rappel claire.

Exemples :

```text id="fwh5pl"
ACCESS_REQUESTED
→ notifier titulaire

ACCESS_GRANTED
→ notifier demandeur

STEP_COMPLETED
→ proposer prochaine étape

DOCUMENT_REQUESTED
→ notifier participant concerné

MESSAGE_SENT
→ notifier membre concerné

SIGNALEMENT_STATUS_CHANGED
→ notifier auteur

SYNC_FAILED
→ alerte locale utilisateur
```

Ne crée pas des notifications directement dans des composants.

---

# 4. TABLE `notifications`

Créer ou compléter.

Champs minimum :

```text id="qpypmd"
id
user_id
type
title
body
entity_type nullable
entity_id nullable
route nullable
priority
status
created_at
read_at nullable
archived_at nullable
```

Statuts :

```text id="eb27hj"
unread
read
archived
```

Priorités :

```text id="j3r6a4"
low
normal
high
critical
```

Utiliser `critical` avec parcimonie.

---

# 5. TYPE DE NOTIFICATION

Utiliser des codes contrôlés.

Minimum :

```text id="vvxtwm"
access_request
access_granted
access_refused
step_update
document_request
document_verified
intervention_request
intervention_update
message
signalement_update
sync_error
system
```

Éviter des chaînes arbitraires dispersées.

---

# 6. PREFERENCES

Créer ou compléter les préférences utilisateur.

Prévoir au minimum :

```text id="qbf16d"
push_enabled
in_app_enabled
audio_reminders_enabled
quiet_hours_enabled
quiet_hours_start nullable
quiet_hours_end nullable
```

Si l'architecture existante possède déjà une table de préférences, complète-la.

Ne crée pas une deuxième source de vérité.

---

# 7. CATÉGORIES CONFIGURABLES

Permettre à l'utilisateur de contrôler au minimum :

- messages ;
- accès/interventions ;
- documents ;
- parcours ;
- signalements ;
- rappels de synchronisation.

Ne pas autoriser la désactivation de certaines alertes de sécurité critiques si le produit exige leur affichage.

---

# 8. PUSH

Si le projet possède déjà une PWA/push infrastructure :

réutilise-la.

Ne crée pas une deuxième implémentation push.

Supporter :

```text id="xufgxt"
permission utilisateur
subscription
expiration/rotation
désinscription
```

Ne demander la permission push qu'au moment pertinent.

Pas dès le premier écran sans contexte.

---

# 9. TABLE `push_subscriptions`

Créer uniquement si nécessaire et inexistante.

Champs minimum :

```text id="9fwx8k"
id
user_id
endpoint
p256dh
auth
user_agent nullable
created_at
last_used_at nullable
revoked_at nullable
```

Sécuriser strictement.

---

# 10. GÉNÉRATION DES NOTIFICATIONS

Créer une couche métier unique.

Conceptuellement :

```text id="kqr4dz"
Domain Event
↓
Notification Rules
↓
Notification
↓
In-app / Push
```

Ne code pas les règles dans plusieurs features.

---

# 11. APPLICATION LAYER

Créer/compléter si nécessaire :

```text id="25bzt1"
application/notifications/
```

Responsabilités :

- transformer événement métier en notification ;
- appliquer préférences ;
- déterminer priorité ;
- déterminer route/deep link ;
- éviter doublons.

---

# 12. DEEP LINKS

Chaque notification pertinente doit ouvrir directement le bon contexte.

Exemples :

```text id="1xh27f"
access_request
→ dossier / accès

message
→ conversation

step_update
→ dossier / parcours

signalement_update
→ détail signalement
```

Réutilise le router existant.

Ne crée pas de routes parallèles.

---

# 13. RÈGLES DE DÉDUPLICATION

Éviter les notifications en double lors de :

- retry offline ;
- realtime + refresh ;
- plusieurs triggers pour le même event.

Utiliser un identifiant de source ou événement stable si nécessaire.

---

# 14. RAPPELS

Les rappels ne doivent pas spammer.

Cas utiles :

- dossier bloqué depuis un certain temps ;
- document demandé non fourni ;
- access request en attente ;
- étape non terminée ;
- synchronisation échouée.

Chaque règle doit avoir :

- déclencheur ;
- délai ;
- fréquence max ;
- condition d'arrêt.

---

# 15. PAS DE RAPPEL INUTILE

Ne notifier pas l'utilisateur si :

- aucune action n'est requise ;
- l'information est déjà visible ;
- le rappel a déjà été acquitté ;
- la condition n'existe plus.

---

# 16. QUIET HOURS

Si activé :

respecter les heures silencieuses pour les notifications non critiques.

Les alertes réellement critiques peuvent suivre une politique spécifique documentée.

---

# 17. MODE RURAL ESSENTIEL

Notifications très simples.

Exemples :

```text id="ye4x3o"
Un service vous a répondu.
```

```text id="maoj1t"
Votre dossier a une nouvelle étape.
```

```text id="z6r1qf"
3 éléments attendent Internet.
```

Une seule action claire :

`Voir`

---

# 18. AUDIO

Si `audio_reminders_enabled` :

permettre lecture vocale locale ou assistée lorsque l'app est ouverte.

Ne déclenche pas automatiquement un audio intrusif sans interaction utilisateur si la plateforme ne le permet pas ou si cela nuit à l'UX.

---

# 19. UI — CENTRE DE NOTIFICATIONS

Réutilise la page/composant existant.

Afficher :

- non lues ;
- récentes ;
- archivées si prévu.

Chaque notification doit montrer :

```text id="btx95k"
quoi
contexte
date
action
```

Pas de détail sensible excessif dans la liste.

---

# 20. BADGE

Le compteur global doit provenir d'une seule source de vérité.

Ne recalcule pas localement un compteur différent dans plusieurs composants.

---

# 21. SÉCURITÉ ET CONFIDENTIALITÉ

Le contenu push doit être minimal.

Éviter d'afficher sur écran verrouillé :

- contenu d'un document ;
- détails sensibles ;
- nom d'une personne signalée ;
- information patrimoniale privée.

Préférer :

```text id="28j06j"
Vous avez une nouvelle mise à jour.
```

avec détail après ouverture/authentification.

---

# 22. RLS — `notifications`

**DENY BY DEFAULT**

SELECT :

uniquement `user_id = auth.uid()`.

UPDATE :

utilisateur peut modifier uniquement ses propres champs autorisés, ex. :

```text id="6sqwfz"
read_at
archived_at
```

INSERT :

généré par backend/service autorisé.

DELETE physique :

éviter.

---

# 23. RLS — `push_subscriptions`

Utilisateur peut :

- lire ses propres subscriptions ;
- créer pour lui-même ;
- révoquer les siennes.

Aucun utilisateur ne lit les subscriptions d'un autre.

---

# 24. PUSH BACKEND

Les notifications push doivent être envoyées côté backend.

Ne mets jamais :

- secret VAPID privé ;
- credential push sensible ;
- logique privileged ;

dans le frontend.

---

# 25. LIEN AVEC B11 AUDIT

La notification n'est pas la source de vérité d'une action.

Exemple :

```text id="modhq4"
Access Grant créé
→ Audit Event
→ Notification
```

Si la notification échoue, l'action métier reste valide.

---

# 26. LIEN AVEC B12 OFFLINE

Quand l'utilisateur est offline :

- notifications in-app déjà synchronisées peuvent rester visibles ;
- les nouvelles notifications backend arrivent au retour réseau ;
- les erreurs sync locales peuvent produire une alerte locale.

Ne crée pas de faux événement serveur offline.

---

# 27. REALTIME

Si Supabase Realtime est déjà utilisé :

réutilise-le pour actualiser le centre de notifications.

Ne dépend pas uniquement de Realtime.

Le fetch standard doit fonctionner.

---

# 28. SERVICE / REPOSITORY

Exposer conceptuellement :

```ts id="tuxgz6"
getNotifications(...)
getUnreadCount(...)
markAsRead(...)
markAllAsRead(...)
archiveNotification(...)
updateNotificationPreferences(...)
```

Pas d'appel Supabase direct depuis UI.

---

# 29. INDEXES

Prévoir :

```text id="tcyjj3"
notifications.user_id
notifications.status
notifications.created_at
notifications.type

push_subscriptions.user_id
push_subscriptions.revoked_at
```

---

# 30. PAGINATION

Paginer les notifications.

Ne charge pas l'historique complet à chaque ouverture.

---

# 31. TESTS UNITAIRES

Tester :

- génération depuis événement métier ;
- préférence utilisateur ;
- priorité ;
- deep link ;
- déduplication ;
- quiet hours ;
- rappel arrêté après résolution.

---

# 32. TESTS RLS / INTÉGRATION

Scénarios minimum :

1. utilisateur A ne lit pas notifications B ;
2. notification créée par backend ;
3. utilisateur peut mark read ;
4. utilisateur ne modifie pas `user_id/type` ;
5. push subscription privée ;
6. event retry ne crée pas notification double ;
7. deep link ouvre le bon contexte.

---

# 33. TESTS UX

Tester :

- mode essentiel ;
- réseau faible ;
- notifications nombreuses ;
- écran verrouillé ;
- permission push refusée ;
- push désactivé ;
- notification après sync.

---

# 34. COMPATIBILITÉ EXISTANTE

Si le projet possède :

```text id="1kk4ve"
alerts
toasts
notifications
push
```

distinguer :

```text id="3qiabo"
Toast = feedback immédiat UI
Notification = événement persistant utilisateur
Push = canal de livraison
```

Ne transforme pas tous les toasts en notifications persistantes.

---

# 35. VALIDATION B13

Avant de terminer :

- build réussi ;
- TypeScript sans erreur ;
- migrations valides ;
- notifications in-app fonctionnent ;
- unread count correct ;
- préférences fonctionnent ;
- push sécurisé si activé ;
- deep links fonctionnent ;
- déduplication fonctionne ;
- quiet hours respectées ;
- contenu sensible minimisé ;
- RLS validée ;
- aucun secret push frontend ;
- aucun domaine B14+ implémenté.

---

# 36. LIVRABLE

Rapporte uniquement :

1. existant réutilisé ;
2. ancien système notification adapté ;
3. fichiers créés ;
4. fichiers modifiés ;
5. migrations ;
6. RLS ;
7. push infrastructure utilisée ;
8. règles de notification ;
9. UI adaptée ;
10. tests ;
11. écarts éventuels.

**Ne commence pas B14.**