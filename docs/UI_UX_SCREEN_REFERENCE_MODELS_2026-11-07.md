# Heritis — modèles de référence des écrans UI/UX

> **Version :** proposition de composition UI/UX — 7 novembre 2026  
> **Base documentaire :** audit UI/UX courant et documentation fonctionnelle Heritis V1  
> **Référence visuelle :** système de design « Héritage premium »  
> **Statut :** modèles de référence à valider avant toute modification du code applicatif.

## 1. Objet et limites

Ce document traduit les constats de l'audit UI/UX en modèles d'écran cohérents. Il définit la hiérarchie de l'information, le rôle des cartes et les actions attendues, sans inventer de fonctionnalité métier.

Ces modèles ne sont ni des maquettes pixel-perfect, ni une spécification technique de composants, ni une autorisation de refondre immédiatement toutes les pages. Les comportements existants, les permissions, les données, les règles de synchronisation et les validations métier restent prioritaires.

Toute information affichée doit servir au moins un objectif :
- comprendre le contexte ou le rôle de l'écran ;
- connaître l'état réel d'un objet ou d'une opération ;
- prendre une décision permise ;
- effectuer une action disponible ;
- comprendre ce qui manque ou ce qui va se passer ensuite.

Une information qui ne sert aucun de ces objectifs doit être retirée, regroupée ou déplacée après vérification qu'elle n'est pas nécessaire.

## 2. Principes de composition communs

### 2.1 Hiérarchie d'un écran

Ordre de lecture recommandé, à adapter à la tâche :
1. **Contexte :** où suis-je et quel objet ou domaine est concerné ?
2. **État :** quelle est la situation actuelle, sans confondre état local, synchronisé, déclaré, documenté ou vérifié ?
3. **Action principale :** quelle est l'action la plus utile et réellement autorisée ici ?
4. **Informations utiles :** quelles données sont nécessaires pour comprendre ou réaliser cette action ?
5. **Détails secondaires :** historique, métadonnées et actions moins fréquentes, accessibles sans concurrencer l'action principale.

Ne pas afficher artificiellement les cinq niveaux lorsqu'un écran simple n'en a besoin que de deux ou trois.

### 2.2 Rôle des cartes et surfaces

| Type de surface | Rôle | Interaction |
|---|---|---|
| Carte de domaine | Identifier un domaine et ouvrir son aperçu | Cliquable uniquement si toute la surface ouvre le même aperçu |
| Carte résumé d'objet | Identifier un dossier, un bien ou un fichier et montrer son état essentiel | Ouvre l'objet si l'accès est autorisé |
| Carte d'état | Expliquer une situation : brouillon, synchronisation en attente, conflit, vérification requise | Non cliquable, sauf action explicitement incluse |
| Carte prochaine action | Présenter une seule tâche prioritaire | Bouton ou lien avec libellé explicite |
| Carte informative | Expliquer un principe, une limite ou un contexte | Non cliquable |
| Carte de choix | Présenter des options mutuellement distinctes | Chaque choix est une commande accessible |
| Confirmation | Expliquer la conséquence d'une opération sensible | Confirmer ou annuler explicitement |

Une carte ne doit pas être cliquable simplement parce qu'elle ressemble à un bouton. Les actions secondaires restent des boutons ou menus identifiables. Les badges décrivent un état ; ils ne remplacent ni une explication ni une action.

### 2.3 Direction visuelle et adaptation

- Utiliser les tokens du système de design Héritage premium : vert forêt, ivoire et or patiné.
- Préserver les thèmes clair et sombre à partir des mêmes rôles sémantiques.
- Réserver l'accent or aux éléments qui méritent une attention réelle ; ne pas colorer chaque carte.
- Garder une typographie lisible : DM Sans pour le contenu et Fraunces pour les titres selon la charte existante.
- Mobile-first : une colonne de lecture principale, actions tactiles confortables, libellés courts et absence de débordement horizontal.
- Utiliser les espaces et séparateurs pour organiser avant d'ajouter des cartes.
- Les animations ne doivent jamais être nécessaires à la compréhension ; respecter la préférence de réduction des mouvements.
- Ne pas affirmer que les contrastes ou l'accessibilité sont validés sans mesure et test réels.

## 3. Modèles d'écran de référence

### Modèle A — Accueil public et découverte

**But :** faire comprendre Heritis avant l'entrée dans l'application et conduire vers une première action adaptée au visiteur.

Ordre de composition :
1. Présentation concise de Heritis : organiser, documenter, préserver et accompagner le patrimoine des personnes et des familles.
2. Vue synthétique des quatre domaines métier V1.
3. Aperçu de ce que chaque domaine permet de comprendre ou de préparer, sans simuler une fonctionnalité non disponible.
4. Explication courte des limites : Heritis accompagne et organise ; il ne remplace pas les autorités ou professionnels compétents et ne certifie pas les droits.
5. Conversation d'accueil guidée avec choix prédéfinis et indication claire que le service est prêt à communiquer.
6. Première étape d'identification, sans rendre la découverte inaccessible.

**Quatre domaines à présenter :**
- Patrimoine et gestion des biens.
- Héritage et succession.
- Volontés secrètes et dernières volontés.
- Gestion des conflits et litiges.

**Actions possibles selon l'état :**
- Explorer un domaine.
- Choisir une réponse prédéfinie dans l'accueil guidé.
- Indiquer un prénom ou un nom pour être reconnu dans le parcours.
- Après cette première information, choisir de poursuivre l'inscription ou de découvrir Heritis.

**Limites d'accès :**
- Sans compte : découverte et aperçus seulement.
- Avec compte : conversation complète et accès aux fonctions selon les permissions.
- Ne pas proposer au visiteur un CTA qui mène directement à une route protégée sans expliquer la transition vers l'authentification.
- Ne pas afficher une création de dossier comme disponible au visiteur si le parcours réel ne le permet pas.

**À ne pas faire :** présenter Terrain comme l'unique porte d'entrée de Heritis ; ajouter « savoir » comme cinquième domaine V1 ; afficher un formulaire de gestion ou un compositeur de conversation complète au visiteur.

### Modèle B — Aperçu d'un domaine

**But :** présenter un domaine, sa finalité, son périmètre et les possibilités réellement disponibles.

Composition :
1. Nom du domaine et description courte fidèle à sa documentation.
2. Sous-domaines regroupés par fonction, sans reproduire toute la documentation en blocs lourds.
3. Fonctionnalités V1, distinguées des capacités en préparation.
4. Limites et responsabilités de Heritis, visibles avant toute action engageante.
5. Action disponible : poursuivre la découverte ou accéder au parcours si l'utilisateur possède le droit nécessaire.

**Règle de contenu :** chaque étape ou fonctionnalité décrite doit provenir du document détaillé du domaine. Éviter les formulations qui suggèrent une certification, une décision juridique ou une validation officielle que Heritis ne réalise pas.

**Distinction essentielle :**
- Domaine métier : finalité et ensemble fonctionnel.
- Type de dossier : catégorie technique ou opérationnelle de dossier.
- Catégorie de bien : classification d'un actif.
- Terrain : catégorie de bien foncier et parcours actuellement implémenté, pas un cinquième domaine métier.

### Modèle C — Accueil connecté

**But :** aider la personne à reprendre son activité sans transformer l'accueil en tableau de bord surchargé.

Ordre de composition :
1. Salutation et contexte minimal.
2. Une seule prochaine action prioritaire, uniquement si elle est calculée à partir d'une situation réelle.
3. Dossiers ou espaces récents, avec identité et état essentiel.
4. Alertes qui nécessitent réellement une attention, séparées des simples informations.
5. Accès secondaires aux domaines et aux services transversaux.

**Données à afficher si elles changent une décision :**
- titre et type du dossier ;
- état réel et éventuel statut de synchronisation ;
- personne ou participation pertinente pour comprendre l'accès ;
- prochaine étape existante, si elle est déterminée par le parcours réel.

**À réduire :**
- répétition de l'assistant dans l'en-tête, les conseils et les actions de bas de page ;
- compteurs redondants entre cartes ;
- indicateurs de progression qui n'ont pas de définition vérifiable.

**Règle :** ne pas inventer de score de complétion ni de priorité. La prochaine action doit correspondre à une action existante et autorisée.

### Modèle D — Liste de dossiers

**But :** retrouver rapidement un dossier et comprendre son état avant de l'ouvrir.

Ordre de composition :
1. Titre de page et action de création si autorisée.
2. Recherche et filtres réellement supportés.
3. Éléments de liste compacts.
4. États particuliers : brouillons locaux, opérations en attente, erreur de chargement, liste vide.
5. Aide secondaire uniquement si elle apporte une information nouvelle.

**Chaque ligne de dossier doit privilégier :**
- titre ou identité du dossier ;
- type ;
- statut compréhensible ;
- indicateur local/en attente de synchronisation si pertinent ;
- ouverture, seulement si elle est possible.

Ne pas présenter un dossier local non synchronisé comme un dossier serveur déjà disponible. Ne pas ajouter de filtres non supportés par la logique actuelle.

### Modèle E — Détail d'un dossier

**But :** comprendre le dossier, agir sur les informations autorisées et suivre son évolution.

Ordre de composition :
1. Identité du dossier : titre, type, localisation si pertinente.
2. État réel : brouillon, enregistré, synchronisation en attente, ou autre statut existant.
3. Action principale permise selon les droits.
4. Sections métier, groupées par tâche et non par accumulation de cartes.
5. Personnes, preuves et documents, avec les droits d'accès associés.
6. Étapes ou parcours lorsqu'ils existent réellement.
7. Historique et événements utiles.
8. Actions sensibles dans une zone distincte, avec confirmation et conséquences explicites.

**Cas Terrain :** conserver les neuf sections existantes et leur logique de sauvegarde, de lecture des métadonnées et de mise en attente hors ligne. La réorganisation peut améliorer leur regroupement et leur lisibilité, mais ne doit pas perdre de données ni modifier les règles de synchronisation.

**Cas multi-domaines :** les biens, personnes et documents référencés doivent conserver leur identité commune ; ne pas créer de copies indépendantes uniquement pour l'affichage d'un dossier.

**Assistant :** une suggestion contextuelle ne doit jamais masquer le contenu, répéter l'action principale ou être présentée comme une décision métier.

### Modèle F — Création et modification

**But :** aider à saisir des informations compréhensibles, avec un retour explicite sur les champs nécessaires et les conséquences de l'enregistrement.

Ordre de composition :
1. Finalité du formulaire et objet concerné.
2. Champs nécessaires à l'identification.
3. Informations complémentaires, clairement séparées.
4. Sections progressives si le volume le justifie.
5. Résumé de ce qui sera enregistré et action explicite de sauvegarde.
6. Retour clair : enregistré, sauvegarde en attente, erreur ou accès refusé.

**Règles :**
- Ne pas marquer comme obligatoire un champ qui ne l'est pas dans le modèle métier.
- Ne pas confondre absence de valeur et erreur.
- Conserver les valeurs déjà saisies en cas d'erreur ou de perte temporaire de réseau selon les mécanismes existants.
- Présenter clairement les champs en lecture seule et la raison d'une permission insuffisante.
- Ne pas prétendre qu'une sauvegarde locale équivaut à une confirmation serveur.
- Ne pas ouvrir la création aux visiteurs avant décision explicite sur les permissions et le parcours.

### Modèle G — Alertes, suivi et synchronisation

**But :** expliquer ce qui nécessite une attention et permettre une action sûre.

Pour une alerte :
1. Message et objet concerné.
2. Gravité ou catégorie selon le modèle de données réel.
3. État lu/non lu.
4. Action associée, si elle existe et si l'accès est autorisé.

Pour le centre de synchronisation :
1. État global réel : opérations en attente, erreurs et conflits.
2. Conflits à résoudre avant les informations secondaires.
3. Pour chaque conflit : dossier concerné, différence utile, version distante connue et choix explicites.
4. File d'attente : nombre de tentatives, dernière erreur compréhensible et possibilité de relance si disponible.
5. Abandon ou suppression d'une opération dans une confirmation séparée, avec conséquence clairement annoncée.

**Règles de sécurité :**
- Ne jamais pré-sélectionner silencieusement une résolution qui pourrait écraser des données ; si un choix est requis, demander une décision explicite.
- Ne pas confondre gravité et type d'alerte.
- Ne pas présenter un badge comme unique signal d'une erreur urgente.
- Conserver l'historique des opérations et des décisions.
- Les libellés techniques peuvent être proposés en détail secondaire, mais l'explication principale doit être compréhensible.

### Modèle H — Conversation et assistant

**But :** offrir une conversation adaptée au niveau d'accès et au contexte, sans promettre de décision ou de service non documenté.

**Visiteur :**
- accueil guidé ;
- choix prédéfinis ;
- réponses de découverte et aperçus ;
- invitation claire à créer un compte pour accéder à la conversation complète.

**Compte connecté :**
- contexte de conversation ;
- historique de l'échange ;
- zone de saisie ;
- état d'envoi et de réponse ;
- message clair en cas d'absence de réseau, de permission ou d'authentification.

**Règles :**
- distinguer conseil, information déclarative et validation officielle ;
- ne pas présenter une réponse IA comme une preuve ou une décision juridique ;
- ne pas proposer une action qui n'existe pas ou que l'utilisateur ne peut pas effectuer ;
- conserver le shell plein écran existant lorsque cela améliore l'espace de conversation ;
- éviter les accès redondants à l'assistant sur un même écran.

### Modèle I — Profil, identité et préférences

**But :** séparer les informations personnelles, les préférences et les contrôles de compte.

Regroupement :
1. Identité et informations du profil.
2. Préférences d'affichage : langue et thème.
3. Notifications et préférences de communication.
4. Sécurité et gestion de session.
5. Actions de compte, selon les fonctionnalités réellement disponibles.

**Règles :**
- masquer les contrôles qui ne peuvent pas être enregistrés pour un visiteur ;
- indiquer si une modification est enregistrée localement ou côté serveur ;
- utiliser une seule source de vérité pour le thème et synchroniser les composants existants ;
- ne pas afficher les actions de sécurité ou de compte sans authentification requise.

## 4. Correspondance des modèles avec les pages actuelles

| Page actuelle | Modèle de référence | Priorité de réorganisation |
|---|---|---|
| Accueil public `/` | A | P1 — découverte V1 et parcours visiteur |
| Page module `/modules/:moduleId` | B | P1 — descriptions métier et disponibilité |
| Accueil connecté `/` | C | P2 — prochaine action et réduction des répétitions |
| Liste `/dossiers` | D | P2 — recherche, états et liste |
| Détail `/dossiers/:id` | E | P2 — densité, sections, droits et historique |
| Création `/create` | F | P1 — accès réel et distinction domaines/types |
| Modification `/dossiers/:id/edit` | F | P2 — lecture seule et sauvegarde |
| Alertes `/alerts` | G | P1 — modèle type/gravité et actions |
| Synchronisation `/sync` | G | P1 — choix explicites et prévention de perte |
| Assistant `/assistant` | H | P1 — séparation visiteur/compte |
| Profil `/profile` | I | P2 — identité, préférences et droits |
| Authentification `/auth` | F adapté | P2 — simplicité des choix et erreurs |
| Onboarding `/onboarding` | F adapté | P2 — progression et utilité des questions |
| Fichiers `/files` | D adapté | P2 — ligne de fichier, droits et actions |
| Page introuvable `*` | État simple | P3 — une action de retour cohérente avec l'accès |

## 5. Ordre de travail recommandé

L'ordre tient compte des risques d'accès et de cohérence métier, avant les ajustements purement visuels.

### Lot 1 — Découverte et accès
- Accueil public.
- Aperçus des quatre domaines.
- Séparation visiteur / compte dans l'assistant.
- Cohérence entre CTA, routes protégées et première identification.
- Présentation des limites et des disponibilités réelles.

### Lot 2 — Cohérence des domaines et formulaires
- Cartes de domaines.
- Distinction domaine / type de dossier / catégorie de bien.
- Clarification de la présence de `savoir` hors V1.
- Création et modification, sans changer les règles de données.

### Lot 3 — Accueil connecté et listes
- Prochaine action.
- Dossiers récents et états réels.
- Alertes utiles.
- Recherche, filtres existants et états vides/erreurs.

### Lot 4 — Détail et preuves
- Détail du dossier.
- Sections Terrain.
- Personnes, documents, preuves et historique.
- Actions sensibles et permissions.

### Lot 5 — Suivi et services transversaux
- Alertes.
- Synchronisation et conflits.
- Fichiers.
- Profil et préférences.

### Lot 6 — Finitions et vérifications
- Authentification et onboarding.
- Page introuvable.
- Responsive, thème clair/sombre, clavier, focus et lecteurs d'écran.
- Vérifications visuelles et tests sur appareils réels.

Chaque lot doit être audité, implémenté sur une branche GitHub dédiée, testé, documenté et revu avant le lot suivant. Ne pas commencer un lot dépendant tant que la documentation et la validation du lot courant ne sont pas terminées.

## 6. Points qui exigent une vérification ou une décision avant implémentation

| Point | Traitement requis |
|---|---|
| Type `savoir` | Auditer toutes les références, données, traductions, tests et migrations ; ne pas le supprimer sans décision explicite. |
| Brouillons visiteurs | Clarifier la cohérence entre brouillon local et route de création protégée ; préserver les données et mécanismes existants. |
| Première identification | Aligner le composant actuel, qui demande un prénom facultatif, avec la règle validée de reconnaissance dès saisie d'un prénom ou d'un nom. |
| Assistant visiteur | Définir la découverte guidée sans exposer le compositeur de conversation complète. |
| Alertes | Vérifier le schéma réel des champs `type` et `severity` avant de modifier les filtres. |
| Conflits de synchronisation | Vérifier les mécanismes de comparaison de versions et supprimer tout choix implicite risquant un écrasement. |
| Thème | Identifier la source de vérité entre `next-themes` et le changement direct de classe dans le profil. |
| Cartes et navigation | Vérifier chaque cible et permission dans le code avant de changer un CTA ou une route. |

## 7. Critères de validation de chaque lot

Un lot UI/UX ne peut être considéré comme terminé que lorsque :
- la page respecte le modèle validé et les documents métier concernés ;
- chaque information affichée a une fonction compréhensible ;
- chaque action est réelle, disponible et autorisée ;
- les états de chargement, vide, erreur, hors ligne et accès restreint sont traités ;
- les règles de données, de permissions, de synchronisation et d'historique sont préservées ;
- les tests automatisés, lint et build passent ;
- le rendu mobile et desktop a été contrôlé ;
- les contrôles clavier, focus et lecteurs d'écran pertinents ont été réalisés ;
- les vérifications manuelles non exécutées restent explicitement signalées ;
- la documentation du lot est intégrée et vérifiée sur GitHub avant le lot suivant.

## 8. Hors périmètre de ce document

Ce document ne valide pas :
- une refonte du code ou des composants ;
- l'ouverture de fonctions réservées au compte aux visiteurs ;
- la suppression du type `savoir` ;
- la modification de données, de schémas, de migrations ou de fonctions Supabase ;
- la modification du projet Lovable ;
- une certification juridique, une validation officielle ou une nouvelle fonctionnalité métier.

**Statut final :** modèles de référence proposés pour revue. L'implémentation ne commence qu'après validation de ces modèles et fusion de la documentation préalable.
