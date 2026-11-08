# PWA Heritis — fonctionnement, sécurité et validation

**Statut :** référentiel opérationnel de la PWA V1  
**Périmètre :** installation, détection du mode installé, service worker, cache, continuité hors ligne et mises à jour  
**Principe :** le mode hors ligne améliore la continuité ; il ne contourne jamais l'authentification, les autorisations serveur ou les limites des fonctions non disponibles sans réseau.

## 1. Comportement attendu

### Installation et détection

- Sur les navigateurs qui exposent `beforeinstallprompt`, Heritis conserve l'événement et ne déclenche l'invite qu'après une action explicite de l'utilisateur.
- Sur iPhone/iPad, où cette invite n'est pas disponible, l'assistant explique le parcours Safari « Partager » puis « Sur l'écran d'accueil ».
- L'état installé est détecté par `display-mode: standalone`, `display-mode: minimal-ui` et, sur les versions iOS concernées, `navigator.standalone`.
- L'événement `appinstalled` actualise l'état après installation confirmée par le navigateur.
- L'absence de `beforeinstallprompt` n'est pas interprétée comme une preuve d'incompatibilité : l'éligibilité réelle dépend aussi du navigateur, de son contexte et du déploiement HTTPS.

### Service worker et mises à jour

- L'enregistrement est réservé à la production et exclu des aperçus Lovable intégrés.
- Le mode de mise à jour est contrôlé (`registerType: prompt`) : une nouvelle version déclenche une proposition explicite dans l'assistant PWA.
- L'utilisateur peut demander l'activation de la version en attente ; la page est rechargée par le mécanisme du plugin après activation.
- Un contrôle de mise à jour est relancé lorsque l'application revient au premier plan et que le navigateur indique une connexion.
- Les états « ressources hors ligne prêtes » et « erreur d'enregistrement/mise à jour » sont communiqués sans prétendre que toutes les fonctionnalités métier sont hors ligne.

## 2. Politique de cache et confidentialité

- Le précache Workbox est réservé aux ressources statiques de l'application.
- Le cache runtime est limité aux bibliothèques cartographiques publiques et aux icônes.
- Les réponses Supabase Storage ne sont plus mises en cache par une règle générique : les URL de stockage peuvent représenter des documents privés ou des URL signées.
- Au démarrage de la PWA, le cache historique `supabase-storage` est supprimé afin de retirer les réponses enregistrées par les versions précédentes.
- Les dossiers mis en cache dans IndexedDB sont associés à l'identité du compte qui avait obtenu le droit de les consulter (`viewer_user_id`). Le propriétaire métier reste conservé séparément dans `user_id`.
- Le schéma Dexie version 4 supprime les anciens instantanés qui ne portent pas l'identité du lecteur. Ils ne sont donc jamais réutilisés comme cache hors ligne pour un autre compte.
- Les brouillons et opérations non synchronisés ne sont pas supprimés automatiquement lors d'une déconnexion : leur suppression silencieuse ferait perdre du travail. Leur rejeu doit continuer à revérifier la session et les droits côté serveur.

Aucun cache navigateur ne constitue un contrôle d'accès. Toute donnée locale reste exposée aux risques propres à un appareil partagé, compromis ou accessible à un autre script ; la minimisation et la durée de conservation restent obligatoires.

## 3. Continuité hors ligne

Le socle existant utilise Dexie/IndexedDB pour les brouillons, les opérations en attente, les conflits et certains instantanés de dossiers. La file de synchronisation est indépendante de la disponibilité du service worker.

- Une perte de réseau ne doit pas être présentée comme une sauvegarde serveur.
- Les opérations nécessitant Supabase attendent le retour du réseau.
- Le rejeu vérifie à nouveau la session active et la propriété/autorisations de la ressource.
- Les conflits doivent rester visibles et être résolus explicitement ; ne pas écraser automatiquement une version distante.
- `navigator.onLine` est un indice de connectivité locale, pas une preuve que Supabase ou le serveur est joignable.

**Limite fonctionnelle :** cette configuration ne garantit pas que toutes les pages, conversations, recherches, cartes ou actions métier fonctionnent intégralement hors ligne. Seuls les parcours réellement couverts par le stockage local et la file de synchronisation peuvent être annoncés comme disponibles.

## 4. Tests automatisés attendus

La suite PWA doit couvrir au minimum :

- capture et utilisation de `beforeinstallprompt` ;
- confirmation via `appinstalled` ;
- détection du parcours manuel iOS ;
- transitions réseau `online/offline` ;
- activation contrôlée d'une mise à jour en attente ;
- suppression du cache historique Supabase Storage ;
- isolation des instantanés IndexedDB par compte lecteur ;
- migration Dexie et préservation des brouillons/opérations en attente ;
- build de production et génération effective du service worker/manifest.

Les tests unitaires ne remplacent pas les essais sur appareils réels.

## 5. Recette manuelle avant publication

| Environnement | Scénarios obligatoires |
|---|---|
| Android / Chrome récent | HTTPS, manifest et icônes, invite d'installation, installation, lancement autonome, détection installé |
| iPhone / iPad / Safari | ajout à l'écran d'accueil, lancement autonome, détection `navigator.standalone` |
| Tous navigateurs ciblés | première visite en ligne, ressources précachées, coupure réseau, retour réseau, mise à jour en attente |
| Appareil partagé | compte A consulte un dossier, déconnexion, compte B ouvre la même route hors ligne : aucune donnée de A ne doit apparaître |
| Migration | anciennes entrées IndexedDB et ancien cache runtime : aucune donnée privée ne doit être réutilisée par un autre compte |

Consigner pour chaque essai : appareil, OS, navigateur/version, URL HTTPS, commit déployé, compte de test, étapes, résultat observé et preuve non sensible.

## 6. Limites et critères de publication

Ne pas déclarer la PWA « complètement validée » tant que les points suivants ne sont pas prouvés sur le déploiement réel :

- HTTPS et portée effective du service worker ;
- validité réelle des fichiers PNG et zone de sécurité des icônes maskable ;
- installabilité Android et parcours iOS ;
- absence de fuite entre comptes sur appareil partagé ;
- navigation et synchronisation après perte puis retour du réseau ;
- activation de mise à jour sans perte de saisie ;
- comportement des routes d'authentification et de retour OAuth ;
- absence d'erreurs runtime et de régressions sur les fonctionnalités existantes.

Les essais réels Android/iOS et les contrôles de déploiement doivent être consignés séparément des résultats CI.
