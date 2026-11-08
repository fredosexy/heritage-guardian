# Revue documentaire PWA Heritis — 8 parcours

**Périmètre :** revue statique de la branche `feat/pwa-intelligent-complete` de la PR #71.  
**Référence de code initiale :** commit `d99e04e4d43bfc9dfd447809d9ce174f867bfdcc`.  
**Correction iOS intégrée ensuite :** commit `21629706864a73320a3021032ff90a3cabf3563c`.  
**Dernière mise à jour documentaire de cette revue :** commit `7f1c7988eca8107cb515e7ef251bc2a92ed863b4`.  
**Méthode :** comparaison du code, des tests et de la documentation opérationnelle avec les recommandations officielles consultées le 8 novembre 2026.  
**Limite :** aucun appareil physique ni déploiement HTTPS n'a été utilisé. Les résultats ci-dessous ne constituent donc pas une recette d'exécution réelle.

## Synthèse

| # | Parcours | Revue du code et des exigences | Statut |
|---|---|---|---|
| 1 | HTTPS, portée du service worker et routes profondes | Manifest et enregistrement prévus à la racine en production ; HTTPS, portée effective, en-têtes et réécritures du serveur non démontrés | À confirmer sur déploiement |
| 2 | Installation Android / Chrome | Membres essentiels du manifest présents ; capture précoce de `beforeinstallprompt` et invite déclenchée par action utilisateur ; éligibilité réelle et icônes non validées sur appareil | Conforme au niveau du code, terrain requis |
| 3 | Installation iOS / Safari | Icône Apple, métadonnées et détection `navigator.standalone` présentes ; consigne de l'assistant actualisée pour « Ouvrir comme app web » lorsque l'option est proposée | Code corrigé, terrain requis |
| 4 | Première visite et mode hors ligne | Précache et cache runtime restreint ; les documents Storage ne sont pas mis en cache ; message « ressources essentielles » nuancé ; page hors ligne dédiée et disponibilité réelle de chaque route non prouvées | Partiellement couvert |
| 5 | Perte réseau et reprise | Écouteurs `online/offline`, file Dexie et contrôle de session/droits avant rejeu ; `navigator.onLine` ne prouve pas l'accès au serveur | Conforme au principe, terrain requis |
| 6 | Deux comptes sur un appareil | Instantanés, opérations et conflits attribués au compte lecteur ; migration v4/v5 et tests d'isolation présents ; test réel multi-compte non effectué | Couverture automatisée présente, terrain requis |
| 7 | Mise à jour du service worker | Mode `prompt`, notification de mise à jour, action explicite et contrôle au retour au premier plan ; conservation des saisies et parcours OAuth doivent être vérifiés sur déploiement | Conforme au niveau du code, terrain requis |
| 8 | Upgrade et purge de l'ancien cache | Purge au démarrage conservée ; nouveau hook Workbox importé qui attend la suppression de `supabase-storage` pendant `activate` ; tests unitaires du hook ajoutés | Correction de code engagée, intégration navigateur et recette migration restantes |

## 1. HTTPS, portée et navigation profonde

**Constats du code**
- Le manifest déclare `start_url: /`, `scope: /` et `display: standalone`.
- L'enregistrement est réservé à la production et évité dans les iframes/aperçus.
- Le service worker généré par Vite PWA est prévu à la racine ; la portée réellement servie dépend toutefois du déploiement et des en-têtes HTTP.
- La configuration Workbox exclut certains chemins (`/~oauth`, `/api`, `/auth`) du fallback de navigation.

**Exigences à prouver**
- Déploiement HTTPS valide (ou environnement local sécurisé pour les essais).
- Réponse correcte du manifest, du script de service worker et des icônes, avec MIME types corrects.
- Service worker effectivement enregistré avec portée `/`.
- Les routes profondes et les retours d'authentification/OAuth doivent aboutir à la bonne page sans être interceptés à tort.
- Le serveur d'hébergement doit réécrire les navigations SPA vers l'application lorsque nécessaire ; le fallback Workbox ne remplace pas la configuration du serveur pour une première navigation sans contrôle du worker.

**Conclusion :** aucun résultat de déploiement n'est revendiqué. La configuration de l'hébergeur et les réécritures restent à confirmer.

## 2. Installation Android / Chrome

**Constats du code**
- Le manifest contient `name`, `short_name`, `start_url`, `scope`, `display`, une icône 192×192 et une icône 512×512.
- Les formats déclarés sont contrôlés par test (PNG et JPEG).
- `beforeinstallprompt` est capturé avant le montage React et conservé jusqu'à l'action explicite d'installation.
- L'absence de cet événement conduit à une instruction de menu navigateur, pas à une affirmation d'incompatibilité.

**Exigences à prouver**
- HTTPS et critères d'éligibilité propres au navigateur.
- Disponibilité réelle de l'invite sur une version Chrome prise en charge.
- Installation, ouverture depuis l'écran d'accueil et détection du mode autonome.
- Vérifier le rendu des deux icônes et leur cadrage selon les masques Android.

**Conclusion :** les propriétés statiques essentielles du manifest sont présentes. La disponibilité de l'invite et l'installation ne peuvent pas être attestées sans navigateur réel.

## 3. Installation iOS / Safari

**Constats du code**
- `index.html` fournit `apple-touch-icon`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style` et `apple-mobile-web-app-title`.
- La détection inclut `navigator.standalone`, les modes d'affichage et le cas iPadOS signalé comme Mac tactile.
- L'assistant explique le parcours Safari de partage puis ajout à l'écran d'accueil.

**Correction appliquée dans la PR #71**
- La documentation Apple actuelle décrit également l'option **« Ouvrir comme app web »** lors de l'ajout à l'écran d'accueil. Le texte de l'assistant a été actualisé pour recommander de l'activer lorsqu'elle est proposée, sans supposer que toutes les versions d'iOS affichent exactement la même interface.

**À prouver sur appareil**
- Ajout à l'écran d'accueil, lancement depuis l'icône, comportement autonome et valeur effective de `navigator.standalone` sur les versions ciblées.

## 4. Première visite et expérience hors ligne

**Constats du code**
- Le cache runtime est limité à une version épinglée de MapLibre et aux icônes de même origine.
- Aucune règle générique de cache Supabase Storage n'est présente dans la nouvelle configuration.
- L'assistant précise que seules les ressources essentielles sont préparées et que les actions serveur attendent le réseau.
- Le texte ne revendique pas une disponibilité hors ligne complète des fonctionnalités métier.

**Points à vérifier**
- Confirmer dans le build de production que le shell nécessaire est bien précaché et que le fallback de navigation fonctionne pour les routes prévues.
- Déterminer si une page hors ligne dédiée est nécessaire : la recommandation MDN est de présenter une expérience hors ligne explicite plutôt qu'une erreur générique du navigateur.
- Vérifier qu'une première visite hors ligne n'est pas présentée comme possible si les ressources n'ont jamais été téléchargées.
- Vérifier l'affichage d'un état hors ligne lorsque l'assistant est fermé ou non affiché. Le composant PWA actuel peut ne rien rendre si aucune notification n'est active.

**Conclusion :** la politique de cache est prudente ; la qualité de l'expérience hors ligne complète n'est pas prouvée par la seule configuration.

## 5. Perte réseau et reprise de synchronisation

**Constats du code**
- Les événements `online` et `offline` mettent à jour l'état réseau.
- La file Dexie conserve les opérations et leurs erreurs/compteurs.
- Le rejeu vérifie la session active et l'identité du compte ; les opérations d'un autre compte ou sans attribution ne sont pas rejouées.
- Les écritures vérifient à nouveau l'autorisation du propriétaire et les conflits sont conservés pour résolution explicite.

**Exigence importante**
- `navigator.onLine` et l'événement `online` signalent un accès réseau selon les heuristiques du navigateur, pas la disponibilité de Supabase. Les erreurs réelles de requête doivent rester la source de vérité pour la synchronisation.

**À prouver sur déploiement**
- Couper le réseau pendant chaque type d'opération supporté, relancer le réseau, vérifier l'absence de doublons, l'ordre des dépendances, les erreurs persistantes et la résolution des conflits.
- Vérifier que l'interface ne confond jamais « réseau disponible » et « synchronisation terminée ».

## 6. Isolation entre deux comptes

**Constats du code**
- Les instantanés de dossiers portent `viewer_user_id`.
- Les files d'attente et conflits portent également `viewer_user_id`, et le centre de synchronisation filtre par compte actif.
- La migration Dexie v4 supprime les anciens instantanés dont l'identité de lecteur n'est pas connue.
- La migration v5 attribue seulement les opérations historiques dont l'identité peut être déduite sans ambiguïté ; les autres restent non attribuées et ne sont pas rejouées automatiquement.
- Des tests vérifient l'invisibilité des opérations/conflits d'un autre compte.

**À prouver sur appareil partagé**
- Compte A consulte et modifie des données hors ligne, se déconnecte ; compte B ouvre les mêmes routes hors ligne.
- Aucun contenu, brouillon, document, opération, conflit ou diagnostic de A ne doit être affiché ou rejoué sous B.
- Reconnexion de A : ses données conservées doivent redevenir accessibles sans migration implicite vers B.

**Conclusion :** les garde-fous et tests automatisés sont présents ; le scénario complet multi-compte réel reste obligatoire.

## 7. Mise à jour du service worker

**Constats du code**
- `registerType: prompt` et l'enregistrement manuel permettent de proposer la mise à jour plutôt que de l'imposer silencieusement.
- L'assistant expose une action explicite pour appliquer la mise à jour.
- Une vérification est demandée lorsque l'application revient au premier plan et que le navigateur indique une connexion.

**À prouver**
- Une mise à jour disponible est annoncée sans interrompre une saisie.
- L'activation et le rechargement ne perdent ni brouillon ni opération locale.
- Plusieurs onglets ouverts ne provoquent pas de mélange de versions ou de comportement incohérent.
- Les routes d'authentification et le retour OAuth fonctionnent après mise à jour.
- Les erreurs de téléchargement/activation sont visibles et récupérables.

## 8. Migration depuis l'ancien service worker et purge du cache privé

**Constat historique**
- La branche `main` précédente contenait une règle Workbox `StaleWhileRevalidate` sur les URL Supabase Storage, avec le cache `supabase-storage`.
- La PR #71 retire cette règle et supprime ce cache au démarrage de l'application.

**Correction de code ajoutée dans la PR #71**
- La purge au démarrage est conservée comme défense complémentaire.
- Le script `public/pwa-legacy-cache-cleanup.js` est ajouté via l'option Workbox `importScripts`. Il enregistre un gestionnaire `activate` qui passe `caches.delete("supabase-storage")` à `event.waitUntil()`.
- Le cycle de vie documenté par MDN prévoit l'activation du nouveau worker après la fin du précédent (ou après acceptation de `skipWaiting`). L'événement `activate` est le point prévu pour nettoyer les ressources des versions antérieures ; `waitUntil` fait attendre la fin du nettoyage avant que l'activation soit achevée.
- Le mode `registerType: "prompt"` est conservé : aucun basculement silencieux ou automatique n'est introduit. Tant que l'utilisateur n'a pas accepté la mise à jour, l'ancien worker peut continuer à fonctionner et le cache legacy peut encore exister ou être recréé. La correction vise la purge au moment de la migration effective, pas une suppression rétroactive avant consentement à la mise à jour.
- Deux tests unitaires couvrent l'enregistrement du gestionnaire d'activation, l'appel à la suppression et l'attente de sa promesse. Ils ne simulent pas encore un navigateur complet ni plusieurs onglets.

**Vérifications restantes avant de déclarer la migration sûre**
- Le script `scripts/verify-pwa-worker.mjs` est désormais exécuté à la fin du build de production : il vérifie que `dist/sw.js` référence le hook de migration, que le fichier importé est copié dans `dist/` et que le hook attend la suppression du cache privé.
- Le nouveau contrôle post-build doit réussir dans la CI sur la tête courante de la PR.
- Ajouter ou exécuter un test d'intégration navigateur représentant ancien worker actif → nouveau worker en attente → acceptation → activation/purge → transfert de contrôle, avec vérification qu'aucune requête post-activation ne recrée le cache.
- Effectuer la recette de mise à niveau sur une installation ayant réellement utilisé la version précédente, y compris plusieurs onglets.

**Conclusion :** le point de nettoyage à l'activation est implémenté et couvert au niveau unitaire ; le scénario complet de migration reste ouvert. La PR #71 n'est pas encore déclarée prête à fusionner.

## Icônes : contrôle transversal

Les tests contrôlent l'existence, le type MIME déclaré et les dimensions. Ils ne contrôlent pas la composition graphique. Pour une icône déclarée `maskable`, le contenu essentiel doit rester dans la zone de sécurité circulaire centrale (rayon égal à 40 % de la plus petite dimension, soit un diamètre de 80 %). La zone sûre et le fond opaque doivent être inspectés visuellement pour les icônes 192 et 512.

## Références officielles consultées

- MDN — [Rendre une PWA installable](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable)
- MDN — [Bonnes pratiques PWA](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Best_practices)
- MDN — [Opérations hors ligne et en arrière-plan](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation)
- MDN — [Cycle de vie et utilisation des service workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers)
- MDN — [Événement online et limites de `navigator.onLine`](https://developer.mozilla.org/en-US/docs/Web/API/Window/online_event)
- Apple Support — [Ouvrir un site comme app web dans Safari sur iPhone](https://support.apple.com/guide/iphone/open-as-web-app-iphea86e5236/27/ios/27)
- WebKit — [Fonctionnalités Safari 26](https://webkit.org/blog/17333/webkit-features-in-safari-26-0/)
- W3C — [Web App Manifest : zone de sécurité des icônes maskable](https://w3c.github.io/manifest/#icon-masks)

## Décision de revue

- Les contrôles automatisés CI de la PR #71 sont réussis sur le commit vérifié.
- Les essais physiques sont explicitement non réalisés.
- La PR ne doit pas être déclarée prête à fusionner tant que le risque de transition du cache privé n'est pas traité et que les contrôles de déploiement/recette sont consignés.
- Les résultats de cette revue sont documentaires et ne doivent pas être présentés comme des preuves d'exécution Android/iOS.
