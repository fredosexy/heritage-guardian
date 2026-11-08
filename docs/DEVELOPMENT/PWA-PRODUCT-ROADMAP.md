# PWA Heritis — trajectoire produit et parcours professionnel

**Statut :** document directeur de référence pour l'évolution de la PWA Heritis  
**Version de référence :** PWA intégrée dans `main` par la PR #71  
**Périmètre :** expérience utilisateur, installation, continuité, synchronisation, sécurité locale, mises à jour, qualité, exploitation et évolutions  
**Règle :** ce document distingue les capacités intégrées, les contrôles automatisés et les validations qui restent à effectuer sur navigateurs/appareils réels.

Documents complémentaires :
- [Fonctionnement, sécurité et validation](./PWA-OPERATIONS.md)
- [Revue documentaire des huit parcours](./PWA-REVIEW-8-PARCOURS.md)

---

## 1. Vision produit

La PWA Heritis doit offrir une expérience web installable, fiable et cohérente sur mobile, tablette et ordinateur, tout en restant sûre lorsque la connexion est instable.

Elle ne doit pas être présentée comme une application entièrement hors ligne tant que chaque fonctionnalité n'a pas été conçue, stockée et testée pour ce mode.

Les principes directeurs sont :

1. **Clarté :** l'utilisateur sait s'il est en ligne, hors ligne, en synchronisation ou en erreur.
2. **Continuité :** une interruption réseau ne doit pas faire perdre silencieusement un brouillon ou une opération locale prise en charge.
3. **Sécurité :** aucune donnée locale d'un compte ne doit être présentée ou rejouée sous un autre compte.
4. **Maîtrise :** les mises à jour importantes ne doivent pas interrompre silencieusement le travail.
5. **Transparence :** les limites hors ligne, les opérations en attente et les conflits sont expliqués.
6. **Progressivité :** chaque capacité hors ligne est annoncée uniquement après validation de son parcours complet.
7. **Accessibilité :** les états et actions restent compréhensibles au clavier, au lecteur d'écran et sur petits écrans.
8. **Mesurabilité :** les régressions de performance, de disponibilité et de synchronisation doivent être détectables sans collecter de données personnelles inutiles.

## 2. État de référence : ce qui est déjà intégré

| Domaine | Capacité intégrée dans la PR #71 | Limite ou preuve restante |
|---|---|---|
| Installation Android | Capture de `beforeinstallprompt`, invite déclenchée par action explicite, état après installation | Installation réelle à vérifier sur Chrome et sur le déploiement HTTPS |
| Installation iOS | Instructions Safari, métadonnées Apple et détection `navigator.standalone` | Vérifier sur iPhone/iPad et versions iOS ciblées |
| Détection d'environnement | Détection standalone/minimal-ui et contexte iOS | Matrice réelle des navigateurs à maintenir |
| Assistant PWA | Présentation de l'installation, des ressources hors ligne, des mises à jour et des erreurs ; indicateur hors ligne explicite et refermable temporairement | Vérifier lisibilité, accessibilité et comportement sur appareils réels |
| Service worker | Enregistrement en production, mise à jour contrôlée en mode prompt, contrôle au retour au premier plan | Recette multi-onglets et déploiement réel |
| Cache applicatif | Précache du shell et cache runtime limité à des ressources publiques autorisées | Mesurer les ressources réellement nécessaires par parcours |
| Cache privé historique | Suppression de la règle générique Supabase Storage ; purge du cache historique au démarrage et à l'activation du nouveau worker avec attente via `event.waitUntil()` | Recette de migration depuis un ancien worker réellement installé, y compris plusieurs onglets |
| Stockage local | Dexie/IndexedDB pour les brouillons, opérations en attente, conflits et certains instantanés | Définir la rétention, les quotas, l'espace disque et les procédures de récupération |
| Cloisonnement des comptes | Attribution au compte lecteur, migrations Dexie v4/v5, isolement des éléments attribuables et mise à l'écart des éléments ambigus | Essai réel A → déconnexion → B hors ligne sur appareil partagé |
| Reprise et conflits | Vérification de la session et des droits lors du rejeu ; conflits conservés pour résolution explicite | Recette terrain sur chaque famille d'opérations supportées |
| CI | Tests, lint, build, vérification du worker, migrations locales, tests DB et Edge, Terrain CI | Conserver ces contrôles obligatoires sur chaque évolution PWA |

**Important :** l'existence d'un stockage local ou d'un service worker ne signifie pas que toutes les pages, conversations, recherches, cartes, documents ou opérations Heritis sont utilisables hors ligne. La disponibilité doit être définie fonctionnalité par fonctionnalité.

## 3. Parcours utilisateur professionnel cible

### Parcours A — Découverte et installation

1. L'utilisateur arrive sur Heritis depuis un lien web.
2. L'application se charge normalement dans le navigateur, sans imposer l'installation.
3. L'assistant explique la valeur de l'installation au moment opportun.
4. Sur Android/Chrome, l'invite native est proposée uniquement après une action explicite et lorsque le navigateur la rend disponible.
5. Sur iOS/Safari, l'assistant présente le chemin réel « Partager » puis « Ajouter à l'écran d'accueil », et l'option « Ouvrir comme app web » si elle est proposée.
6. Après installation, l'application détecte le mode autonome et adapte son aide.
7. Si l'installation n'est pas possible, le parcours web reste complet et compréhensible.

**Critères d'acceptation :** aucune invite répétitive ou trompeuse ; aucune affirmation d'incompatibilité fondée uniquement sur l'absence de `beforeinstallprompt` ; installation non obligatoire ; retour correct vers le contenu initial.

### Parcours B — Premier lancement et authentification

1. L'utilisateur ouvre Heritis depuis le navigateur ou l'icône installée.
2. Le shell et les ressources essentielles se chargent.
3. L'état de connexion et les éventuelles limites réseau sont visibles.
4. L'authentification et les retours OAuth restent sur leurs routes prévues.
5. Les données privées ne sont affichées qu'après contrôle des droits par les services autorisés.
6. Une session expirée déclenche une reprise d'authentification claire, sans rejouer une opération sous une autre identité.

**Critères d'acceptation :** routes profondes et OAuth fonctionnels ; aucun écran privé servi comme s'il était autorisé par le seul cache local ; aucune perte de contexte après authentification.

### Parcours C — Travail connecté

1. Les opérations métier sont exécutées normalement avec contrôle serveur.
2. Les éléments pris en charge peuvent être conservés localement selon leur politique de données.
3. L'utilisateur distingue l'enregistrement local de la confirmation serveur.
4. L'application ne signale « synchronisé » qu'après confirmation réelle du serveur.

**Critères d'acceptation :** statuts non ambigus ; pas de succès fictif ; gestion idempotente des opérations pouvant être rejouées.

### Parcours D — Perte de réseau

1. L'application détecte le changement réseau et affiche un état hors ligne.
2. Elle conserve les brouillons et opérations locales explicitement pris en charge.
3. Les actions qui nécessitent le serveur sont désactivées, mises en attente ou expliquées selon leur nature.
4. Les pages non disponibles hors ligne affichent une limite compréhensible plutôt qu'une erreur générique.
5. L'utilisateur peut identifier ce qui est enregistré localement et ce qui ne l'est pas.

**Critères d'acceptation :** aucune perte silencieuse ; aucune promesse générale « fonctionne hors ligne » ; aucune écriture serveur simulée localement.

### Parcours E — Retour du réseau et synchronisation

1. Le retour réseau déclenche une tentative de vérification de connectivité réelle.
2. La disponibilité de Supabase est confirmée par les réponses de service, pas uniquement par `navigator.onLine`.
3. Les opérations sont rejouées dans un ordre défini, avec contrôle de session et droits.
4. Les doublons sont empêchés par des identifiants/idempotency keys adaptés.
5. Les erreurs persistantes sont conservées et expliquées.
6. Les conflits nécessitant une décision humaine restent visibles et ne sont pas écrasés automatiquement.

**Critères d'acceptation :** reprise sans doublon, sans changement d'identité, avec preuve de résultat ; ordre et dépendances documentés ; possibilité de reprendre après fermeture/réouverture.

### Parcours F — Appareil partagé et changement de compte

1. Le compte A travaille et peut laisser des opérations locales.
2. A se déconnecte explicitement.
3. B ouvre Heritis, y compris hors ligne.
4. B ne voit ni les instantanés, ni brouillons, ni opérations, ni conflits, ni diagnostics privés de A.
5. A retrouve uniquement ses éléments après authentification et vérification de ses droits.

**Critères d'acceptation :** tests multi-comptes couvrant tous les magasins IndexedDB et toutes les vues ; aucun rejeu inter-compte ; politique de nettoyage et de rétention définie ; aucun secret d'authentification stocké dans un cache partagé.

### Parcours G — Mise à jour de l'application

1. Une nouvelle version est détectée.
2. L'assistant annonce la mise à jour et ses éventuelles conséquences.
3. L'utilisateur peut terminer son action en cours ou sauvegarder son brouillon.
4. L'utilisateur accepte l'activation.
5. Le nouveau worker s'active, les migrations prévues sont exécutées et la page se recharge de manière maîtrisée.
6. En cas d'échec, un message exploitable et une procédure de reprise sont proposés.

**Critères d'acceptation :** aucune perte de saisie ; comportement multi-onglets défini ; migration réversible ou stratégie de récupération documentée ; absence de mélange entre ressources de versions différentes.

### Parcours H — Récupération et assistance

1. L'application détecte les erreurs persistantes de cache, de stockage, de synchronisation ou de mise à jour.
2. Elle présente la cause compréhensible et les actions sûres disponibles.
3. Elle ne supprime jamais silencieusement un brouillon ou une opération non synchronisée.
4. Elle permet de consulter un diagnostic non sensible et de transmettre une preuve volontaire.
5. Toute procédure de nettoyage explique ses conséquences et demande confirmation lorsqu'elle peut supprimer du travail.

**Critères d'acceptation :** diagnostics expurgés des données personnelles et jetons ; actions de récupération testées ; aucune suppression irréversible sans consentement explicite.

## 4. Feuille de route des ajustements

Les priorités sont ordonnées selon le risque utilisateur et la sécurité, pas uniquement selon la visibilité de l'interface.

### P0 — Avant de déclarer la PWA prête à la production

- [ ] Exécuter la recette Android Chrome sur HTTPS : installation, lancement autonome, retour, navigation profonde.
- [ ] Exécuter la recette iOS Safari : ajout à l'écran d'accueil, ouverture comme app web si disponible, lancement autonome.
- [ ] Tester la migration depuis l'ancien service worker avec un cache `supabase-storage` déjà présent.
- [ ] Tester l'activation avec plusieurs onglets et vérifier l'absence de recréation du cache privé après transfert de contrôle.
- [ ] Réaliser le scénario complet compte A → déconnexion → compte B hors ligne sur le même appareil.
- [ ] Tester perte réseau, reprise, doublons, erreurs persistantes et conflits pour chaque type d'opération officiellement pris en charge.
- [ ] Vérifier HTTPS, MIME types, portée réelle du worker, manifest, icônes et réécritures SPA sur l'hébergement cible.
- [ ] Vérifier visuellement la zone de sécurité des icônes maskable 192 et 512.
- [ ] Vérifier authentification, expiration de session et retour OAuth depuis navigateur et mode installé.
- [ ] Consigner les preuves de recette avec appareil, OS, navigateur, commit, étapes et résultat, sans données sensibles.

**Sortie P0 :** rapport de recette signé, anomalies bloquantes corrigées, limites hors ligne publiées et procédure de retour arrière disponible.

### P1 — Fiabilité et qualité d'usage

- [ ] Créer une matrice de compatibilité des navigateurs et versions réellement supportés.
- [ ] Ajouter des tests d'intégration navigateur pour cycle du service worker, cache legacy et multi-onglets.
- [ ] Formaliser les états de synchronisation : local uniquement, en attente, en cours, confirmé, conflit, échec récupérable.
- [ ] Définir l'idempotence, l'ordre des opérations, les dépendances et la stratégie de reprise après interruption.
- [ ] Définir des politiques de rétention et de quota pour IndexedDB, brouillons, journaux et conflits.
- [ ] Ajouter des tests de quota saturé, stockage indisponible, navigation privée et éviction de stockage.
- [ ] Vérifier accessibilité clavier/lecteur d'écran, contrastes, focus, zoom et zones tactiles de l'assistant.
- [ ] Garantir que les mises à jour ne perdent pas les saisies et que les erreurs sont récupérables.

**Sortie P1 :** scénarios de reprise et de migration automatisés ; aucune anomalie critique de confidentialité ou de perte de données.

### P2 — Performance et expérience mobile

- [ ] Découper le bundle initial par routes et fonctionnalités ; le build observé pendant la revue signalait un bundle principal de 970,81 Ko avant compression (287,15 Ko gzip).
- [ ] Mesurer les Core Web Vitals et le temps de première interaction sur appareils Android de gamme basse et réseau mobile.
- [ ] Charger à la demande les fonctionnalités lourdes qui ne sont pas nécessaires au premier écran.
- [ ] Réduire le précache au shell et aux ressources réellement utiles ; mesurer le coût de stockage.
- [ ] Tester les transitions portrait/paysage, clavier virtuel, safe areas, petites hauteurs d'écran et mode standalone.
- [ ] Vérifier la cohérence visuelle des états en ligne/hors ligne, mise à jour, erreur et synchronisation.

**Sortie P2 :** budgets de performance définis et respectés sur appareils de référence ; expérience mobile stable sur réseau lent.

### P3 — Capacités hors ligne métier maîtrisées

- [ ] Construire un inventaire des fonctionnalités Heritis avec une classification explicite : hors ligne complet, lecture locale limitée, brouillon local, en ligne obligatoire.
- [ ] Définir pour chaque fonctionnalité les données autorisées en local, leur durée de conservation et leur suppression.
- [ ] Définir les règles de conflits par domaine métier, sans résolution automatique risquée.
- [ ] Définir les limites de pièces jointes et de documents hors ligne, sans mettre en cache globalement Supabase Storage.
- [ ] Ajouter un indicateur de disponibilité hors ligne par espace/fonction, fondé sur les ressources réellement présentes.
- [ ] Documenter les cas où la première visite hors ligne est impossible.
- [ ] Étendre la couverture uniquement après tests de sécurité, de migration et de reprise.

**Sortie P3 :** matrice de disponibilité hors ligne publiée et validée domaine par domaine ; aucune promesse globale non prouvée.

### P4 — Exploitation et amélioration continue

- [ ] Définir une politique de versionnement et de compatibilité des données locales entre versions.
- [ ] Définir un protocole de déploiement progressif et de rollback du service worker.
- [ ] Mettre en place des indicateurs agrégés et respectueux de la vie privée : taux d'échec d'installation, activation worker, erreurs de synchronisation, conflits et échecs de migration.
- [ ] Ne collecter aucune donnée personnelle, contenu de dossier, document ou jeton dans les télémétries.
- [ ] Définir les alertes, seuils, responsables et procédures d'incident.
- [ ] Réaliser périodiquement des tests de récupération, de mise à jour et de migration.
- [ ] Maintenir les références navigateur/OS et les instructions d'installation à jour.

**Sortie P4 :** exploitation documentée, alertes utiles, procédures de support testées et revue périodique planifiée.

## 5. Matrice de qualité à appliquer à chaque évolution

| Dimension | Exigence non négociable | Preuve attendue |
|---|---|---|
| Sécurité | Authentification et autorisations serveur restent la source de vérité | Tests d'accès et multi-comptes |
| Confidentialité | Pas de cache privé partagé ni de rejeu sous une autre identité | Tests IndexedDB, Cache Storage et déconnexion |
| Intégrité | Pas de perte ou duplication silencieuse | Tests d'interruption, idempotence et conflits |
| Résilience | Reprise contrôlée après réseau, fermeture ou crash | Tests de reprise |
| Compatibilité | Navigateurs et appareils cibles définis | Matrice de tests réels |
| Performance | Budgets mesurés sur réseau/appareil représentatifs | Rapports Core Web Vitals et build |
| Accessibilité | États et actions utilisables par tous | Tests clavier, lecteur d'écran et contraste |
| Exploitabilité | Diagnostic non sensible et récupération documentée | Procédure et tests d'incident |
| Maintenabilité | Migrations locales versionnées et testées | CI migrations et tests de compatibilité |
| Documentation | Code, tests, limitations et procédure évoluent ensemble | Revue documentaire à chaque PR |

## 6. Garde-fous de développement

Toute PR touchant au manifest, au service worker, Workbox, IndexedDB, à la synchronisation ou aux parcours d'installation doit :

1. Décrire le comportement utilisateur avant/après.
2. Déclarer les données concernées et leur classification.
3. Décrire les conséquences sur les anciennes versions et les migrations.
4. Ajouter des tests unitaires et d'intégration adaptés.
5. Passer tests, lint, build et vérification du worker généré.
6. Passer les tests DB/Edge lorsqu'une autorisation, une migration ou une API est touchée.
7. Mettre à jour ce document et le référentiel opérationnel.
8. Distinguer clairement les tests automatisés des essais physiques.
9. Ne jamais annoncer une fonctionnalité hors ligne non testée.
10. Ne jamais supprimer automatiquement des opérations locales non synchronisées.

## 7. Critères de maturité

- **Niveau 1 — Installable :** manifest, HTTPS, installation et lancement autonome validés.
- **Niveau 2 — Fiable :** mises à jour contrôlées, shell hors ligne, erreurs compréhensibles et reprise testée.
- **Niveau 3 — Sûr sur appareil partagé :** séparation des comptes, migrations et purge legacy validées en conditions réelles.
- **Niveau 4 — Continuité métier :** fonctionnalités hors ligne explicitement classifiées, synchronisation idempotente et conflits maîtrisés.
- **Niveau 5 — Exploitable à l'échelle :** performance mesurée, observabilité respectueuse de la vie privée, procédures d'incident et compatibilité suivies.

La PWA ne doit recevoir un niveau que lorsque toutes les preuves correspondantes sont disponibles. Les niveaux ne sont pas des labels marketing.

## 8. Décision et prochaine étape

La PR #71 fournit un socle technique sérieux : installation guidée, assistant PWA, mises à jour contrôlées, cache limité, cloisonnement des données locales et tests automatisés.

La prochaine étape recommandée n'est pas d'ajouter immédiatement davantage de fonctions hors ligne. Elle consiste à terminer la recette P0 sur les appareils et le déploiement réels, à produire les preuves, puis à traiter les améliorations P1 et P2. Les capacités hors ligne métier supplémentaires viendront ensuite, domaine par domaine.

**Règle de validation :** tant que la recette physique et la migration navigateur ne sont pas consignées, le statut reste « socle PWA intégré — validation terrain en attente », et non « PWA entièrement certifiée en production ».
