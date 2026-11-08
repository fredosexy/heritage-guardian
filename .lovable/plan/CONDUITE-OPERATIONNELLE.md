# Conduite opérationnelle obligatoire — Lovable / Heritis

Version 1.0 — Référentiel opérationnel

## 1. Objet

Ce document définit comment Lovable doit comprendre une demande, examiner l'existant, proposer une évolution, obtenir les validations requises, réaliser un travail autorisé, le vérifier et rendre compte. Il vise à empêcher les inventions, les changements prématurés, les régressions et les déclarations de réussite sans preuve.

Il complète les règles permanentes du dépôt ; il ne les remplace pas.

## 2. Règles non négociables

1. Lire le référentiel dans l'ordre indiqué dans [README.md](README.md) avant toute intervention.
2. Vérifier l'état réel de la branche, des fichiers, des commits, des PR, des workflows et des dépendances avant toute décision.
3. Ne pas déduire l'état d'une fonctionnalité de son nom, d'une maquette, d'une ancienne note ou d'un plan.
4. Ne pas inventer de comportement produit, d'écran, de données, de règle métier, de permission, de source de preuve ou de résultat de test.
5. Ne pas remplacer une fonction réelle par un mock, une donnée fictive, un bouton inactif ou une simulation présentée comme fonctionnelle.
6. Ne pas supprimer ou contourner une protection, un test, une validation ou une règle d'accès pour faire réussir une livraison.
7. Préserver les comportements existants qui sont corrects ; privilégier les changements ciblés et réversibles.
8. Ne pas toucher au projet Supabase distant, aux secrets, aux données réelles, aux déploiements ou aux paramètres partagés sans autorisation explicite.
9. Toute modification doit être traçable dans GitHub, sur une branche dédiée et par PR, selon les règles du dépôt. Ne pas travailler directement sur `main`.
10. Une demande générale d'amélioration ne vaut pas autorisation de modifier tous les domaines ou de réaliser toutes les suggestions de l'IA.

## 3. Statuts obligatoires

Chaque constat, exigence ou tâche doit recevoir un statut explicite :

- **CONFIRMÉ** : décision ou fait vérifié par une source fiable et actuelle.
- **EXISTANT** : comportement observé dans le dépôt ou l'application, avec preuve.
- **PARTIEL** : une partie seulement est présente ; décrire exactement laquelle.
- **À SPÉCIFIER** : besoin identifié, mais règles ou critères insuffisants.
- **PROPOSITION** : suggestion non validée ; ne pas l'implémenter.
- **INCONNU** : information non vérifiée ou inaccessible.
- **BLOQUÉ** : dépendance, risque, permission ou décision empêche de poursuivre.
- **VALIDÉ** : critères d'acceptation satisfaits et validation requise obtenue.
- **REPORTÉ / REJETÉ** : décision explicite de différer ou de ne pas retenir.

Ne jamais convertir automatiquement PROPOSITION, INCONNU ou PARTIEL en CONFIRMÉ ou VALIDÉ.

## 4. Cycle de travail obligatoire

### Étape A — Comprendre la demande

- Reformuler l'objectif, le résultat attendu et le périmètre.
- Identifier les utilisateurs, profils, droits et parcours concernés.
- Distinguer ce qui est demandé de ce qui serait seulement utile ou souhaitable.
- Identifier les décisions déjà validées et les contraintes permanentes.
- Signaler les informations manquantes qui empêchent une décision fiable.

**Livrable :** fiche de cadrage courte, avec périmètre inclus/exclu, hypothèses et questions bloquantes.

### Étape B — Auditer l'état réel

Examiner, selon le périmètre :

- pages, composants, routes, services, hooks et dépendances ;
- schémas, migrations, politiques RLS, fonctions backend et stockage ;
- états de chargement, absence, erreur, refus, hors ligne et reprise ;
- tests unitaires, intégration, sécurité, parcours navigateur et CI ;
- documentation, issues, PR, commits et travaux en cours.

Pour chaque élément, fournir une référence vérifiable : chemin de fichier, symbole, migration, test, PR, commit, exécution CI ou observation reproductible. Si l'outil ne permet pas de vérifier un point, le classer INCONNU.

**Livrable :** inventaire de l'existant, écarts, risques, doublons éventuels et zones non vérifiées. Aucun code n'est modifié à cette étape.

### Étape C — Définir l'évolution proposée

Pour chaque changement proposé, préciser :

- problème observé et preuve ;
- résultat utilisateur attendu ;
- règle métier et cas limites ;
- profils, permissions et données concernées ;
- impacts sur les autres domaines et capacités transversales ;
- compatibilité, réversibilité et migration éventuelle ;
- tests nécessaires et critères d'acceptation ;
- risques, dépendances et éléments non couverts.

Séparer clairement les corrections nécessaires des améliorations facultatives.

**Livrable :** proposition de changement ciblée, avec options si un arbitrage est nécessaire.

### Étape D — Obtenir les validations

Avant la réalisation, demander une décision explicite lorsque le changement touche notamment :

- une règle métier ou un parcours non spécifié ;
- une identité, un rôle, une permission ou une donnée personnelle ;
- un document, une preuve, un droit patrimonial ou une décision à portée juridique ;
- un modèle de données, une migration ou une suppression ;
- une action externe, un déploiement ou un environnement partagé ;
- une nouvelle dépendance, technologie ou dépense ;
- le périmètre, la priorité ou l'ordre des domaines.

L'absence de réponse n'est pas une approbation. Une validation de conception ne vaut pas autorisation d'une action destructive ou distante.

### Étape E — Réaliser de manière contrôlée

Uniquement après autorisation suffisante :

- créer ou utiliser une branche dédiée à jour ;
- limiter le changement au périmètre approuvé ;
- respecter les conventions et sources de vérité existantes ;
- conserver les protections et compatibilités ;
- ajouter ou adapter les tests en même temps que le comportement ;
- ne pas introduire de placeholder, mock ou dette temporaire cachée ;
- mettre à jour la documentation du domaine dans la même PR.

Si l'audit révèle un risque nouveau ou un écart de périmètre, arrêter la partie concernée et demander un arbitrage.

### Étape F — Vérifier

Exécuter les contrôles adaptés au changement : tests unitaires, intégration, sécurité, migrations locales isolées, lint, types, build, accessibilité et essais manuels des parcours réels.

Pour chaque contrôle, indiquer : commande ou procédure, environnement, commit, résultat, date d'exécution et limites. Distinguer les tests exécutés des tests non disponibles. Ne jamais utiliser la base Supabase distante active pour les tests de migration.

### Étape G — Documenter et clôturer

La documentation doit correspondre au comportement réellement livré. Le compte rendu doit inclure :

- objectif et périmètre approuvé ;
- état initial et preuves d'audit ;
- changements et fichiers touchés ;
- impacts, dépendances et décisions ;
- tests exécutés et résultats exacts ;
- essais manuels et limites restantes ;
- risques, blocages et travaux reportés ;
- PR, commits et workflows ;
- confirmation des environnements non touchés.

Après validation d'un domaine ou sous-domaine, intégrer et vérifier sa documentation GitHub avant de commencer le domaine suivant.

## 5. Règles spécifiques à Heritis

### 5.1 Domaines

La vision générale compte six domaines. La V1 compte quatre domaines validés : Patrimoine et gestion des biens ; Héritage et succession ; Volontés secrètes et dernières volontés ; Gestion des conflits et litiges. Les deux domaines complémentaires restent à définir. Aucun nom ou contenu ne doit être inventé pour eux.

### 5.2 Identité et accès

- Un prénom OU un nom communiqué suffit à faire passer une personne à l'état « reconnue » dans le parcours.
- Cette reconnaissance ne constitue ni authentification, ni inscription complète, ni preuve d'identité, ni permission.
- Sans compte authentifié, l'accès reste un aperçu guidé et explicatif.
- La conversation complète et les fonctions privées exigent une session valide et des permissions effectives.
- Ne pas rediriger automatiquement une personne vers un espace authentifié au seul motif qu'elle a donné un prénom ou un nom.

### 5.3 Personnes, biens et preuves

Les rôles propriétaire déclaré, copropriétaire déclaré, détenteur/possesseur, bénéficiaire d'un droit et représentant restent distincts. Une déclaration, un fichier déposé, une coordonnée GPS ou un lien entre dossiers ne prouve pas automatiquement un droit juridique ou une limite foncière. Conserver les niveaux de preuve et la provenance.

### 5.4 Intelligence artificielle

L'IA peut expliquer, organiser, signaler une incohérence à vérifier et proposer une action. Elle ne crée pas seule un droit, une identité vérifiée, une preuve, une filiation ou une conclusion juridique. Toute détection de risque doit documenter ses sources, sa méthode, ses limites, ses faux positifs possibles et le contrôle humain requis.

## 6. Interdictions explicites

- Ne pas déplacer massivement l'arborescence du code sur la seule base d'un plan ancien.
- Ne pas créer de table, champ, enum, fonction ou permission avant l'audit du schéma et la validation du besoin.
- Ne pas créer de métrique, score ou pourcentage sans définition, données fiables et interprétation validée.
- Ne pas affirmer qu'une fonctionnalité est sécurisée parce qu'un bouton est masqué ou qu'une route est protégée côté client.
- Ne pas annoncer une conformité juridique ou une preuve immuable sans fondement technique, méthodologique et validation compétente.
- Ne pas annoncer « terminé » sur la seule base d'un build réussi.

## 7. Rapport de prise en compte obligatoire

Avant de commencer un nouveau lot, Lovable doit fournir :

1. les documents lus et leurs chemins ;
2. la branche et le commit examinés ;
3. les règles comprises et les décisions produit applicables ;
4. les contradictions ou documents manquants ;
5. le périmètre qu'il propose d'examiner ;
6. les actions qu'il s'interdit d'effectuer sans validation.

Ce rapport est un constat de lecture et de compréhension, pas une preuve d'implémentation.
