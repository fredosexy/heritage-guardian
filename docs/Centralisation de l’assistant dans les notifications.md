## REFONTE UX — Centraliser Notifications, Assistant et Conversations dans la cloche du Header

### OBJECTIF

Réduire fortement la charge visuelle de l’application.

Il ne doit plus y avoir d’Assistant flottant sur les pages.

Toute la communication utilisateur doit être centralisée dans UNE SEULE icône : la cloche de notifications située dans le Header.

Conserver la BottomNav actuelle sans modification :

Home / Cas / + / Aide / Procédure

---

# 1. HEADER

Conserver uniquement l’icône cloche en haut à droite.

Supprimer toute icône ou bouton flottant lié à l’Assistant.

La cloche affiche un badge rouge correspondant au nombre TOTAL d’éléments non lus :

- notifications système
- notifications Assistant
- nouveaux messages / conversations

Exemple :

Notifications : 10  
Assistant : 1  
Conversations : 4  

Badge Header : 15

Si le total dépasse 99, afficher `99+`.

Au clic sur la cloche, ouvrir une **BottomSheet**, jamais un Drawer latéral.

---

# 2. BOTTOMSHEET PRINCIPALE

Créer un composant centralisé, par exemple :

`NotificationCenterSheet.tsx`

Caractéristiques :

- hauteur maximale : environ 85vh
- ouverture depuis le bas
- fond blanc
- coins supérieurs arrondis : 24px
- handle centré en haut
- animation fluide
- fermeture par swipe vers le bas
- fermeture en touchant l’overlay
- conserver un comportement mobile-first
- respecter les safe areas mobiles

Le Header de la BottomSheet contient un segmented control avec trois onglets :

`Notifications (10) | Assistant (1) | Conversations (4)`

Le compteur de chaque onglet représente uniquement ses éléments non lus.

Permettre :

- clic sur un onglet
- swipe horizontal entre les onglets

Ne pas recharger toute la BottomSheet lors du changement d’onglet.

---

# 3. ONGLET NOTIFICATIONS

Afficher uniquement les notifications de type `system`.

Exemples :

- Ton dossier est arrivé à Mbalmayo
- Paiement validé
- Document manquant
- Statut du dossier modifié

Chaque ligne contient :

- icône
- titre
- texte secondaire si nécessaire
- temps relatif : `Il y a 5 min`, `Hier`, etc.
- point bleu si non lu

Au clic :

1. marquer la notification comme lue ;
2. fermer la BottomSheet si nécessaire ;
3. naviguer vers le dossier concerné si `dossier_id` existe.

Prévoir aussi une action discrète :

`Tout marquer comme lu`

---

# 4. ONGLET ASSISTANT

L’Assistant vit désormais EXCLUSIVEMENT dans cet onglet.

Supprimer de toute l’application :

`<AssistantFAB />`

`<AssistantWidget />`

ainsi que toute autre version flottante de l’Assistant.

Il ne doit plus apparaître sur :

- dashboard
- `/cas/[id]`
- formulaires
- pages procédure
- autres écrans

## État d’accueil

L’Assistant doit afficher une carte contextuelle utile.

Exemple :

`Bonjour Serge. Ton dossier TITRE 123 est en attente à Yaoundé depuis 3 jours. Veux-tu que je prépare une relance ?`

Ne pas afficher de message générique si un contexte utile est disponible.

## Assistant contextuel

L’Assistant doit connaître :

- la route actuelle
- le dossier actuellement consulté
- son statut
- son étape actuelle
- les documents éventuellement manquants
- les actions récemment effectuées

Créer un système de contexte partagé, par exemple :

`AssistantContext`

ou utiliser les données du router + les hooks métier existants.

Le hook :

`hooks/useAssistant.ts`

doit permettre à l’interface Assistant de récupérer ce contexte.

Éviter de créer automatiquement une nouvelle notification à chaque rendu React.

Les notifications Assistant doivent être créées uniquement lorsqu’un événement ou une condition pertinente apparaît.

Exemples :

- dossier bloqué
- document manquant
- délai anormal
- prochaine action pertinente
- changement important de statut

Éviter absolument les doublons.

---

# 5. CHAT ASSISTANT

Dans l’onglet Assistant, ajouter une vraie zone de conversation.

En bas :

Input sticky :

`Pose une question...`

Suggestions rapides contextuelles au-dessus.

Exemples :

`Où en est mon dossier ?`

`Quels papiers manquent ?`

`Que dois-je faire maintenant ?`

`Préparer une relance`

Les suggestions doivent changer en fonction du contexte.

Exemple :

Si l’utilisateur est sur `/cas/123`, les suggestions concernent prioritairement le dossier 123.

Si l’utilisateur est sur la page Procédure, l’Assistant peut expliquer l’étape consultée.

La conversation doit rester contenue dans la BottomSheet.

Aucune popup Assistant flottante.

---

# 6. ONGLET CONVERSATIONS

Cet onglet centralise les conversations et nouveaux commentaires liés aux dossiers.

IMPORTANT :

Ne pas remplacer la table métier des commentaires/messages par la table `notifications`.

Les commentaires/messages restent stockés dans leur système actuel.

La table `notifications` sert uniquement à signaler qu’un nouveau message existe.

Exemple :

`Dossier Ngomedzap`

`2 nouveaux messages`

Chaque conversation affiche :

- nom ou titre du dossier
- dernier message
- interlocuteur si disponible
- heure/date
- nombre de messages non lus

Regrouper les notifications appartenant au même thread.

Ne pas afficher cinq lignes distinctes si cinq nouveaux messages appartiennent à la même conversation.

Au clic :

Option privilégiée :

ouvrir le thread directement dans la BottomSheet.

Si l’architecture actuelle rend cela trop complexe, naviguer vers :

`/cas/[id]#commentaires`

et marquer les notifications correspondantes comme lues.

---

# 7. MODÈLE SUPABASE

Créer une table :

`notifications`

Champs minimum :

- `id`
- `user_id`
- `type`
- `title`
- `body`
- `dossier_id`
- `is_read`
- `created_at`

`type` accepte :

- `system`
- `assistant`
- `message`

Ajouter si nécessaire :

- `source_id`
- `metadata jsonb`

`source_id` permet par exemple de référencer un commentaire ou un événement métier précis.

`metadata` peut contenir des informations complémentaires sans multiplier les colonnes.

Créer les index utiles notamment sur :

- `user_id`
- `user_id + is_read`
- `user_id + type`
- `created_at`
- `dossier_id`

Activer les politiques RLS afin qu’un utilisateur ne puisse lire et modifier que ses propres notifications.

---

# 8. TEMPS RÉEL

Si Supabase Realtime est déjà utilisé dans le projet, connecter le Notification Center aux nouvelles notifications en temps réel.

Le badge de la cloche et les compteurs des trois onglets doivent se mettre à jour sans refresh manuel.

Éviter les doubles subscriptions.

Centraliser la récupération des notifications dans un hook dédié, par exemple :

`useNotifications()`

Il doit exposer au minimum :

- notifications
- unreadTotal
- unreadSystem
- unreadAssistant
- unreadMessages
- markAsRead()
- markAllAsRead()
- loading

---

# 9. HIÉRARCHIE DES COMPOSANTS

Privilégier une architecture similaire à :

`Header`
→ `NotificationBell`
→ `NotificationCenterSheet`

Dans la BottomSheet :

`NotificationTabs`

puis :

`SystemNotificationsTab`

`AssistantTab`

`ConversationsTab`

Hooks :

`useNotifications.ts`

`useAssistant.ts`

Ne pas dupliquer la logique de notification dans plusieurs pages.

---

# 10. RÈGLE ABSOLUE ANTI-SURCHARGE

ZÉRO Assistant flottant.

ZÉRO popup Assistant automatique.

ZÉRO bouton Assistant ajouté dans les pages.

ZÉRO widget Assistant fixe au-dessus de la BottomNav.

Toute l’expérience Assistant passe par :

Header → Cloche → Assistant.

Exception unique :

Si un dossier nécessite réellement l’attention immédiate de l’utilisateur, autoriser un toast très discret.

Exemple de condition critique :

dossier bloqué depuis plus de 7 jours.

Le toast ne doit pas ouvrir une nouvelle interface Assistant.

Au clic, il ouvre directement :

Cloche → onglet Assistant.

---

# 11. DESIGN

Direction visuelle :

- très épuré
- beaucoup d’espace blanc
- densité faible
- inspiration Google Maps / Google notifications
- interactions mobiles naturelles
- typographie existante de l’application
- couleurs existantes du design system
- séparateurs très légers
- pas de grosses cartes partout
- pas de gradients décoratifs
- pas d’ombres lourdes
- pas de composants supplémentaires sans nécessité

Les éléments non lus doivent être visibles sans rendre l’interface agressive.

Utiliser principalement :

- point bleu
- texte légèrement renforcé
- badge numérique

---

# 12. IMPORTANT — NE PAS CASSER L’EXISTANT

Avant modification :

1. identifier tous les endroits où `AssistantFAB` et `AssistantWidget` sont utilisés ;
2. identifier la logique actuelle des commentaires ;
3. identifier le composant Header actuel ;
4. identifier la logique de badge actuelle ;
5. réutiliser autant que possible les composants et hooks existants.

Ne pas recréer une deuxième architecture parallèle.

Ne pas modifier la BottomNav.

Ne pas supprimer les commentaires existants.

Ne pas casser les routes `/cas/[id]`.

Effectuer la refonte de manière progressive en conservant le comportement métier existant.