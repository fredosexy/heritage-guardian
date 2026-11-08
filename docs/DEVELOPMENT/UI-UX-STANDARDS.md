# Standards permanents UI/UX — Heritis

> **Statut :** référentiel permanent de conception et de construction des interfaces Heritis.  
> **Portée :** tous les domaines métier, sous-domaines, parcours, pages, composants, actions, états, applications clientes et services transversaux.  
> **Direction artistique approuvée :** Héritage premium — vert forêt, ivoire et or patiné ; thèmes clair et sombre.  
> **Référence d'observation initiale :** branche `docs/heritis-development-governance-agents`, commit `e1bc12fdd57394beaf450f890a6ebd870f71aa79`, 8 novembre 2026.  
> **Périmètre d'intervention documentaire :** GitHub uniquement ; aucune modification Lovable, aucun changement du code applicatif ni de Supabase distant dans la rédaction de ce référentiel.

---

## 1. Objet, autorité et portée

Ce document fixe les exigences qui doivent guider toute conception, création, refonte, correction ou évolution de l'expérience utilisateur et des interfaces de Heritis. Il s'applique aux développeurs, designers, architectes, prestataires, agents IA, générateurs de code et mainteneurs.

Il couvre notamment :
- l'expérience globale, la découverte et l'accueil ;
- les quatre domaines métier et tous leurs sous-domaines ;
- les parcours, pages, sous-pages, vues, formulaires et actions ;
- la navigation, les composants partagés et le système visuel ;
- les profils visiteur, personne reconnue et utilisateur disposant d'un compte ;
- les usages mobile, tablette, desktop, PWA et hors ligne ;
- les états métier, erreurs, permissions, synchronisation et notifications ;
- l'accessibilité, la performance, la sobriété et la qualité d'interaction ;
- l'assistant adaptatif, les recommandations IA et les interactions automatisées.

Ce référentiel complète, sans les remplacer :
- `docs/DESIGN_SYSTEM_UI_UX.md` — direction artistique, palette, tokens et composants visuels ;
- `docs/UX-PRINCIPLES.md` — langage utilisateur et présentation de la progression ;
- les audits UI/UX et inventaires de pages — constats datés, à revalider ;
- les spécifications V1 des quatre domaines et de leurs services transversaux ;
- `GOVERNANCE.md`, `ARCHITECTURE-RULES.md`, `SECURITY-RULES.md` et les futurs référentiels de données, tests et IA.

En cas de contradiction, respecter la hiérarchie documentaire de `AGENTS.md` et `GOVERNANCE.md). Une règle d'interface ne peut jamais affaiblir une permission, une exigence de sécurité, une limite métier ou une obligation légale. Une maquette, une suggestion IA ou un composant généré ne constitue pas une décision produit.

## 2. Principes non négociables

1. **L'humain avant l'interface :** partir des situations réelles, des capacités, des contraintes et du vocabulaire des personnes.
2. **Moins, mais mieux :** réduire les éléments, les choix, les répétitions et les étapes qui n'apportent pas de valeur.
3. **Comprendre avant d'agir :** expliquer le contexte, les conséquences et les limites avant une action importante.
4. **Découverte sans contrainte :** l'entrée et la découverte de Heritis ne doivent pas imposer la création d'un compte.
5. **Mobile-first :** concevoir d'abord les petits écrans et les usages tactiles, puis enrichir les mises en page.
6. **Offline-first :** considérer les coupures réseau comme une situation normale, particulièrement dans les zones de connectivité limitée.
7. **Rapidité perçue et réelle :** réduire les attentes, les transferts, les traitements inutiles et les interactions superflues.
8. **Cohérence globale :** une même intention doit produire une interaction familière dans tous les domaines.
9. **Actions honnêtes :** aucun contrôle ne doit promettre un résultat qu'il ne réalise pas.
10. **Accessibilité :** rendre les parcours compréhensibles et utilisables par des personnes et des appareils variés.
11. **Confiance et confidentialité :** ne jamais sacrifier la protection des informations pour simplifier artificiellement l'interface.
12. **Progressivité :** montrer l'essentiel maintenant et les options avancées au moment où elles deviennent utiles.
13. **Continuité :** préserver le contexte, les saisies et les opérations en attente lorsque l'utilisateur change d'écran ou perd le réseau.
14. **Traçabilité compréhensible :** faire comprendre ce qui a été déclaré, enregistré localement, transmis, reçu, vérifié ou refusé.

Toute nouvelle interface doit démontrer son utilité au regard de ces principes. Si un élément ne permet ni de comprendre, ni de décider, ni d'agir, ni de se repérer, il doit être supprimé ou justifié.

## 3. Règle « moins, mais mieux » et maîtrise de la charge mentale

### 3.1 Une intention principale par écran

Chaque écran doit avoir :
- un objectif principal clairement formulé ;
- un titre qui annonce ce que la personne peut faire ou comprendre ;
- une action principale identifiable lorsqu'une action est attendue ;
- un contenu limité à ce qui est nécessaire à cette étape ;
- une prochaine étape compréhensible, sans obligation d'enchaîner.

Ne pas afficher plusieurs appels à l'action de même importance dans une même zone. Les actions secondaires doivent être visuellement secondaires et les actions rares ou avancées peuvent être rangées dans un menu explicite.

### 3.2 Réduire les décisions simultanées

- Ne pas présenter tout le catalogue d'options au premier écran.
- Préférer des choix courts, concrets et contextualisés.
- Regrouper les options liées et différer les réglages avancés.
- Ne pas demander deux fois une information déjà connue et utilisable légalement.
- Ne pas demander une donnée « au cas où » sans besoin explicite.
- Éviter les longs formulaires monolithiques ; les découper par étapes cohérentes lorsque cela réduit réellement l'effort.
- Afficher les champs conditionnels uniquement lorsque leur condition est satisfaite.
- Conserver les valeurs saisies lors d'une erreur, d'un retour ou d'une reprise, dans les limites de sécurité et de confidentialité.
- Éviter les interruptions, fenêtres modales et demandes de confirmation répétitives.

### 3.3 Réduire le bruit visuel et informationnel

Éviter :
- les cartes décoratives sans fonction ;
- les répétitions d'une même information sur plusieurs blocs ;
- les badges, scores, pourcentages et compteurs sans utilité décisionnelle ;
- les icônes sans libellé lorsque leur sens n'est pas évident ;
- les paragraphes denses, les termes techniques non expliqués et les alertes permanentes ;
- les animations, gradients, ombres et bordures décoratives en accumulation.

La progression utilisateur doit être décrite en langage humain et par des états concrets : « à préciser », « informations réunies », « en vérification », « en attente », « bloqué », « prêt pour la suite ». Appliquer `UX-PRINCIPLES.md` : les pourcentages et scores ne sont pas le langage principal de l'expérience.

### 3.4 Règle de suppression

Avant d'ajouter un composant, une carte, une étape ou une option, vérifier :
1. quel besoin précis il résout ;
2. si une surface existante peut déjà le résoudre ;
3. s'il crée une répétition ;
4. s'il augmente le nombre de décisions ou la charge de lecture ;
5. s'il est utile sur mobile ;
6. s'il a un comportement réel et des états définis.

En l'absence de bénéfice démontrable, ne pas l'ajouter.

## 4. Accès, découverte et absence de compte obligatoire

### 4.1 Entrée libre

La consultation de la page d'accueil, la compréhension de la mission, la découverte des domaines et la lecture des aperçus publics ne doivent pas exiger la création d'un compte.

Ne jamais afficher une inscription obligatoire comme condition pour :
- comprendre ce qu'est Heritis ;
- parcourir la présentation générale ;
- découvrir les quatre domaines et leurs objectifs ;
- consulter les explications publiques ;
- comprendre les types de démarches possibles et leurs limites.

La création de compte est proposée lorsqu'elle apporte une capacité nécessaire à l'action demandée, à la protection des données ou à la continuité personnelle. Elle ne doit pas être une barrière artificielle à la découverte.

### 4.2 États d'identité distincts

L'interface distingue clairement :
- **Visiteur :** personne qui découvre Heritis sans identité persistante ou compte. Accès à la présentation et aux aperçus publics uniquement.
- **Personne reconnue :** personne ayant communiqué un premier élément d'identification, par exemple un prénom ou un nom, selon le parcours défini. Cette reconnaissance ne prouve pas une identité vérifiée et ne vaut pas création de compte.
- **Utilisateur disposant d'un compte :** personne authentifiée, dont les accès restent limités par ses permissions réelles.
- **Identité vérifiée, si le domaine le prévoit :** statut distinct, fondé sur un processus explicite ; ne pas le déduire d'un simple compte ou d'une déclaration.

Le vocabulaire et les badges ne doivent jamais laisser croire qu'une personne est juridiquement identifiée, propriétaire, héritière ou titulaire d'un droit sur la seule base d'un nom saisi.

### 4.3 Transition progressive

Le parcours d'entrée doit expliquer avant de demander :
1. accueil et explication claire de Heritis ;
2. découverte libre des quatre domaines ;
3. conversation de bienvenue guidée avec choix prédéfinis, si disponible ;
4. possibilité de communiquer un premier élément d'identification sans imposer immédiatement la création d'un compte ;
5. explication du bénéfice et des conditions d'un compte lorsque la personne souhaite poursuivre une action nécessitant une identité persistante, une sauvegarde distante ou une permission ;
6. possibilité de continuer à découvrir Heritis sans compte.

La personne doit comprendre pourquoi une connexion, une identification complémentaire ou une permission est demandée à cet instant.

### 4.4 Limites du visiteur

Le mode visiteur est un mode de découverte, pas un accès caché aux fonctions privées. Il ne doit pas exposer les données personnelles, dossiers, fichiers, conversations privées, alertes, invitations, participants ou espaces d'un utilisateur.

Les aperçus publics doivent utiliser des contenus éditoriaux ou exemples explicitement fictifs et signalés comme tels. Ils ne doivent pas exposer de vraies données privées.

Si une action n'est pas accessible au visiteur, l'interface explique la raison et propose une suite honnête. Ne pas présenter un bouton actif qui échoue seulement après le clic.

### 4.5 Assistant de bienvenue

L'accueil peut présenter un indicateur discret signalant que Heritis est disponible pour échanger, sans prétendre qu'un agent humain est présent ou qu'une IA est en ligne si ce n'est pas vérifié. Le visiteur dispose d'un accueil guidé et de choix prédéfinis ; la conversation complète est soumise à l'état d'identité, aux règles de sécurité et à la disponibilité réelle du service.

## 5. Architecture de l'expérience par domaines

Heritis V1 comporte quatre domaines métier. Ils doivent rester compréhensibles comme quatre espaces complémentaires, et non être fusionnés dans un catalogue indistinct.

### 5.1 Domaine 1 — Patrimoine et gestion des biens

L'interface doit accompagner l'identification, la déclaration, l'inventaire, la documentation, la sécurisation, la gestion et la transmission déclarative des biens, selon le périmètre V1 validé.

Sous-domaines à prendre en compte :
- terrains et biens fonciers ;
- bâtiments et biens immobiliers ;
- biens agricoles et ruraux ;
- biens mobiliers ;
- biens financiers et droits patrimoniaux ;
- autres biens et actifs particuliers.

Règles UX :
- distinguer clairement une déclaration, une pièce déposée, un élément examiné et un élément vérifié ;
- rendre visible la provenance des informations lorsque c'est nécessaire ;
- distinguer les rôles associés à un bien : propriétaire déclaré, copropriétaire, détenteur/possesseur, bénéficiaire d'un droit et représentant ;
- ne jamais présenter un rôle déclaré comme un titre de propriété juridiquement établi ;
- permettre de comprendre la fiche d'un bien sans multiplier les formulaires et doublons ;
- réutiliser la même identité de bien dans les dossiers de succession, de volontés ou de conflit au lieu de demander une nouvelle déclaration identique.

### 5.2 Domaine 2 — Héritage et succession

L'expérience doit aider à organiser une situation successorale sans préjuger des droits juridiques des personnes.

Sous-domaines :
- déclaration et ouverture d'une succession ;
- identification des personnes concernées ;
- inventaire patrimonial ;
- documents et éléments justificatifs ;
- participation et gouvernance du dossier ;
- confirmations, contestations et suivi.

Règles UX :
- permettre de comprendre qui déclare, qui participe, qui confirme et qui conteste ;
- séparer relation familiale, qualité déclarée, rôle dans le dossier et permission technique ;
- présenter les demandes d'accès, invitations, délégations, suspensions et révocations avec leur portée et leurs conséquences ;
- ne jamais transformer un statut de dossier ou une majorité de confirmations en décision juridique ;
- conserver une lecture claire des événements et versions.

### 5.3 Domaine 3 — Volontés secrètes et dernières volontés

La confidentialité et la compréhension des conséquences priment sur la commodité.

Règles UX :
- expliquer la confidentialité, les conditions d'accès et les limites avant la saisie ou le dépôt ;
- distinguer préparation, dépôt, conservation, vérification, conditions de déclenchement et transmission ;
- rendre les destinataires, mandataires, conditions et événements déclencheurs compréhensibles ;
- ne pas révéler le contenu d'une volonté dans une notification, un aperçu, une recherche ou un écran non autorisé ;
- présenter les confirmations et étapes de vérification sans suggérer qu'une transmission conditionnelle a eu lieu avant sa réalisation effective ;
- demander une confirmation explicite avant toute opération sensible, sans faire reposer la protection uniquement sur un dialogue de confirmation.

### 5.4 Domaine 4 — Gestion des conflits et litiges

L'expérience doit aider à signaler, documenter, organiser et suivre une situation, puis orienter vers les voies et services compétents.

Règles UX :
- langage neutre, non accusatoire et compréhensible ;
- distinguer faits déclarés, pièces déposées, observations, contestations et éléments vérifiés ;
- éviter de présenter une accusation comme un fait établi ;
- rendre visibles les étapes, les demandes de complément et les possibilités d'accompagnement ;
- expliquer les limites de Heritis et ne pas simuler un conseil juridique, une médiation ou une décision d'autorité ;
- protéger les contenus sensibles et les échanges des personnes autorisées.

### 5.5 Services transversaux

Identité, profils, permissions, documents, journal, notifications, assistant adaptatif et synchronisation doivent offrir des comportements communs. Ils ne doivent pas créer de parcours parallèles ni dupliquer les mêmes données dans chaque domaine.

## 6. Secteurs, modules, dossiers et navigation progressive

- Tous les secteurs principaux doivent rester repérables dans l'architecture globale.
- L'assistant peut mettre en évidence les secteurs pertinents au contexte, mais ne doit pas masquer arbitrairement les autres ni décider à la place de la personne.
- Un secteur nouvellement ouvert commence par une présentation courte, adaptée au contexte, avec une possibilité de commencer immédiatement.
- Les dossiers, sous-domaines, activités, interactions et évolutions doivent être rattachés à un secteur principal clairement identifiable.
- Un dossier ou dossier thématique peut être relié à d'autres secteurs lorsque la logique métier le justifie ; chaque lien conserve ses permissions propres.
- La navigation entre secteurs et profils doit conserver le contexte et rendre explicite le changement d'espace.
- Les vues « à venir » doivent être clairement distinguées des fonctions disponibles ; elles ne doivent pas imiter une fonctionnalité active.
- Ne pas multiplier les menus imbriqués ; privilégier une architecture visible, progressive et prévisible.

## 7. Système visuel et identité de marque

### 7.1 Direction artistique

Appliquer exclusivement la direction approuvée **Héritage premium** :
- vert forêt pour les actions principales, repères et éléments de confiance ;
- ivoire pour les surfaces de lecture claires ;
- or patiné pour les accents ponctuels ;
- neutres chauds pour les textes secondaires et séparations ;
- couleurs sémantiques indépendantes pour succès, information, avertissement et erreur.

Le caractère premium vient de la retenue, de la typographie, de la composition, de la qualité des détails et de la cohérence. Ne pas réintroduire l'ancienne palette pastel.

### 7.2 Thèmes clair et sombre

Les deux thèmes font partie du système dès sa fondation.
- Le thème initial respecte la préférence système.
- L'utilisateur peut choisir manuellement clair ou sombre.
- Le choix manuel est conservé.
- Tous les composants et états doivent fonctionner dans les deux thèmes.
- Utiliser des tokens sémantiques, pas des couleurs codées directement dans les pages.
- Vérifier les états de focus, désactivation, erreur, avertissement et contraste dans chaque thème.

### 7.3 Typographie

Respecter le système défini dans `DESIGN_SYSTEM_UI_UX.md` :
- DM Sans pour les textes et l'interface ;
- Fraunces pour les titres éditoriaux et accents de marque ;
- échelle typographique partagée ;
- interlignage et longueur de ligne confortables ;
- taille minimale lisible sur mobile ;
- éviter la multiplication des polices, graisses et tailles.

Les titres doivent annoncer le sujet ou l'action. Les descriptions sont assez courtes pour être lues rapidement, sans omettre une information essentielle.

### 7.4 Couleurs, contrastes et états

- Le texte courant doit viser un contraste WCAG 2.2 AA d'au moins 4,5:1 ; le grand texte et les composants graphiques concernés au moins 3:1.
- Les couleurs d'état ne doivent pas être les seuls moyens de communiquer une information.
- Ne pas utiliser l'or patiné pour de longs textes ou des informations essentielles si le contraste est insuffisant.
- Tester les vrais rendus, pas seulement les valeurs CSS ou les noms de tokens.
- Ne pas utiliser une couleur de marque comme substitut à une couleur de gravité ou de statut.

### 7.5 Espacement, surfaces et iconographie

- Utiliser les tokens et primitives partagés.
- Préférer les bordures discrètes, les surfaces lisibles et les ombres légères.
- Ne pas empiler les ombres, rayons, gradients ou effets de survol.
- Utiliser une iconographie cohérente, compréhensible et accompagnée d'un libellé lorsque le sens n'est pas universel.
- Respecter les zones sûres des appareils et les espacements autour des contrôles.

## 8. Cartes et densité d'information

Les cartes sont des surfaces d'information ou d'action, pas des décorations.

### 8.1 Cartes de domaines et de grands secteurs

- Elles doivent avoir une taille suffisante pour présenter clairement un titre important, une description concise et un repère d'action.
- Sur téléphone, privilégier une carte par ligne ; deux cartes uniquement si le contenu est réellement compact et reste confortable.
- Sur tablette, deux cartes par ligne lorsque l'espace le permet.
- Sur desktop, trois ou quatre cartes par ligne seulement si la largeur, le titre, la description et les actions restent lisibles ; sinon deux colonnes.
- Pour les grands domaines qui nécessitent une présentation, préférer une ou deux cartes majeures par écran plutôt qu'une mosaïque dense.
- Ne pas réduire les titres et descriptions pour faire entrer davantage de cartes.
- Les cartes de domaine peuvent être cliquables dans leur ensemble, mais leur affordance doit être claire et leur comportement unique.

### 8.2 Cartes de données et cartes d'action

Une carte doit avoir une fonction claire : résumé, élément de liste, prochaine action, état, pièce ou choix. Ne pas mélanger plusieurs fonctions sans hiérarchie.

Chaque carte d'action doit préciser :
- ce que l'action permet ;
- si elle est disponible pour le profil courant ;
- ce qui se passera après activation ;
- son état en cours, si pertinent.

Une carte purement informative n'a pas besoin d'un faux bouton ou d'une flèche qui laisse croire qu'elle est interactive.

### 8.3 Contenu des cartes

- Titre visible et précis.
- Description courte et concrète.
- Métadonnées limitées à ce qui aide réellement.
- Statut exprimé en langage utilisateur.
- Une action principale au maximum.
- Pas de compteurs, pourcentages ou badges superflus.
- Pas de contenu tronqué qui cache une information nécessaire à la décision.

## 9. Mobile-first, responsive et usages réels

### 9.1 Stratégie mobile-first

La première conception doit être pensée pour un téléphone courant, avec largeur réduite, tactile, clavier virtuel, mémoire limitée, connexion instable et sessions interrompues.

Le responsive ne consiste pas à rétrécir une interface desktop. Il adapte la hiérarchie, les contrôles, les cartes, les menus, les formulaires et les parcours à chaque espace disponible.

### 9.2 Adaptation par taille

- **Mobile étroit :** une colonne, navigation simple, actions principales accessibles, formulaires courts, pas de défilement horizontal non essentiel.
- **Mobile courant :** une colonne principale, cartes adaptées, contenu hiérarchisé et navigation stable.
- **Tablette :** deux colonnes lorsque cela améliore réellement la lecture ou la comparaison.
- **Desktop :** largeur de lecture contrôlée, colonnes supplémentaires uniquement si elles améliorent la compréhension ; éviter les lignes de texte trop longues.

Les points de rupture doivent être choisis selon le contenu et non selon des modèles d'appareils arbitraires.

### 9.3 Tactile et ergonomie

- Cible tactile recommandée d'au moins 44 × 44 CSS px ; viser 48 × 48 lorsque possible.
- Espacement suffisant entre les actions concurrentes.
- Ne pas dépendre du survol pour révéler une action.
- Ne pas placer une action destructive à côté d'une action fréquente sans séparation.
- Respecter les zones sûres, les barres système et le clavier virtuel.
- Les actions principales doivent rester accessibles sans acrobatie du pouce ou défilement excessif.
- Prévoir le retour, l'annulation et la conservation du contexte.

### 9.4 Rotation, zoom et contenu variable

Tester portrait/paysage, zoom, tailles de texte système, libellés longs, traductions, noms de personnes, documents et contenus sans espace. Aucun contenu important ne doit disparaître ou être rendu inaccessible.

## 10. Offline-first et continuité d'usage

### 10.1 Principe

Heritis doit être conçu pour continuer à rendre les services locaux autorisés lorsque le réseau est absent, intermittent, lent ou instable. L'état hors ligne ne doit pas être traité comme une anomalie exceptionnelle.

La disponibilité hors ligne dépend du type de donnée, de sa sensibilité, des permissions, du chiffrement et de la capacité locale réellement implémentée. Ne jamais promettre que toutes les données ou toutes les fonctions sont disponibles sans réseau.

### 10.2 Comportements d'interface requis

Lorsque le parcours le permet :
- afficher les données locales disponibles avec leur fraîcheur ou leur état connu ;
- permettre de préparer une saisie ou un brouillon local ;
- conserver les changements non encore transmis ;
- présenter clairement les opérations en attente ;
- distinguer enregistré sur cet appareil, en attente de synchronisation, transmis, confirmé par le serveur et en échec ;
- indiquer si une action nécessite une connexion ;
- permettre une reprise explicite et compréhensible ;
- préserver les saisies lors d'une coupure réseau ;
- expliquer les conflits et demander un choix lorsque la résolution ne peut être automatique sans risque.

### 10.3 États et vocabulaire obligatoires

Ne pas utiliser un simple voyant « hors ligne » pour représenter toute la situation. Distinguer au minimum :
- appareil hors ligne ;
- contenu local disponible ;
- brouillon enregistré localement ;
- opération en attente ;
- synchronisation en cours ;
- synchronisation confirmée ;
- échec nécessitant une action ;
- conflit à résoudre ;
- opération abandonnée après confirmation.

Ne jamais afficher « enregistré », « envoyé », « partagé », « supprimé » ou « terminé » si le système n'a pas confirmé l'état correspondant. Utiliser des formulations précises : « enregistré sur cet appareil », « en attente d'envoi », « envoyé, confirmation en attente », « synchronisé ».

### 10.4 Reprise et conflits

- Éviter les doubles soumissions et les opérations dupliquées.
- Donner une explication compréhensible du conflit, des versions et des conséquences du choix.
- Ne pas écraser silencieusement une donnée plus récente.
- Préserver les opérations en attente après redémarrage lorsque la conception technique le permet.
- Les suppressions, abandons et résolutions de conflits doivent être explicites, traçables et confirmés selon leur risque.
- Le traitement d'une file doit rester idempotent et protégé par les règles serveur ; l'interface ne fait jamais office d'autorité.

### 10.5 Confidentialité locale

Ne pas conserver hors ligne une donnée sensible simplement parce que c'est techniquement possible. La mise en cache, la durée de conservation, la protection de l'appareil, le verrouillage, la déconnexion et l'effacement suivent `SECURITY-RULES.md` et les règles de données.

## 11. Rapidité, performance et sobriété

### 11.1 Expérience rapide

- Afficher rapidement le cadre, le titre et le contenu utile.
- Utiliser des états de chargement sobres lorsque l'attente est réelle.
- Éviter les écrans blancs, les spinners sans explication et les blocages silencieux.
- Préférer l'affichage progressif aux chargements bloquants de données indépendantes.
- Ne pas attendre le chargement de données non nécessaires pour afficher une section déjà disponible.
- Réduire les re-rendus, appels réseau, calculs et téléchargements non nécessaires.
- Éviter les animations longues ou qui retardent l'action.
- Ne pas recharger toute une page pour un changement local simple.

### 11.2 Performance technique à mesurer

Les objectifs de performance doivent être définis et mesurés par route et appareil de référence. Viser les Core Web Vitals « bons » lorsque mesurés sur données terrain :
- LCP ≤ 2,5 s ;
- INP ≤ 200 ms ;
- CLS ≤ 0,1.

Ces seuils sont des objectifs de qualité, pas une affirmation sur les résultats actuels. Mesurer au 75e percentile lorsque des données terrain suffisantes existent et distinguer laboratoire et terrain.

### 11.3 Ressources et réseau

- Optimiser les images, polices, icônes et bundles.
- Charger à la demande les fonctions lourdes et les zones non nécessaires au premier écran.
- Préférer les formats modernes et dimensions adaptées pour les images.
- Ne pas télécharger des documents confidentiels ou des médias avant qu'ils soient nécessaires et autorisés.
- Limiter les requêtes répétitives ; utiliser le cache avec une politique cohérente et sûre.
- Prévoir timeouts, annulation et retours d'erreur.
- Ne pas multiplier les bibliothèques pour un besoin déjà couvert par le socle.

### 11.4 Sobriété énergétique et matérielle

Limiter les animations continues, traitements en arrière-plan, synchronisations agressives et calculs répétés. Respecter les appareils modestes, les forfaits de données et les connexions limitées.

## 12. Navigation et structure commune

- La navigation principale doit rester stable, prévisible et adaptée au profil.
- Le nombre d'entrées visibles doit rester limité aux destinations réellement fréquentes.
- Le libellé doit être compréhensible sans devoir mémoriser une icône.
- La destination active doit être identifiable autrement que par la couleur seule.
- Le bouton retour doit respecter l'historique de navigation et ne pas perdre une saisie sans avertissement.
- Les liens profonds doivent aboutir à un écran cohérent, avec traitement des sessions expirées et permissions insuffisantes.
- Les en-têtes de page présentent le titre, le contexte et les actions nécessaires sans répétition.
- Les menus ne doivent pas contenir des fonctions indisponibles présentées comme actives.
- Les changements d'espace ou de profil doivent être explicitement signalés.

## 13. Actions et contrats d'interaction

Toute action visible doit avoir un contrat explicite avant son implémentation.

Pour chaque bouton, lien, carte interactive, menu, geste ou commande, documenter :
1. son intention ;
2. les profils qui peuvent l'utiliser ;
3. les préconditions et permissions ;
4. les données utilisées ;
5. le résultat attendu ;
6. le caractère réversible ou non ;
7. l'état pendant l'exécution ;
8. le retour de succès ;
9. les erreurs possibles et la récupération ;
10. le comportement hors ligne ;
11. la traçabilité nécessaire ;
12. les tests attendus.

### 13.1 Règles d'activation

- Un bouton doit exécuter une action réelle, pas seulement changer d'apparence.
- Un lien navigue vers une destination identifiable.
- Un élément non interactif ne doit pas sembler cliquable.
- Désactiver un contrôle lorsque ses préconditions ne sont pas réunies, avec une explication accessible si cela n'est pas évident.
- Prévenir les doubles clics et doubles soumissions.
- Afficher l'état occupé et éviter les actions concurrentes contradictoires.
- Conserver le contexte après une erreur.
- Ne pas considérer la fermeture d'un dialogue comme une validation.

### 13.2 Retours d'action

Le retour doit être proportionné :
- confirmation discrète pour une action simple ;
- résumé du résultat pour une action importante ;
- avertissement explicite pour une conséquence risquée ;
- état persistant dans la page pour une opération en attente ou un conflit ;
- annonce accessible pour les changements dynamiques importants.

Un toast ne doit pas être le seul endroit où apparaît une information essentielle ou durable.

### 13.3 Actions sensibles et destructrices

- Décrire la conséquence en termes concrets.
- Nommer clairement l'objet concerné.
- Expliquer si l'action est réversible.
- Demander une confirmation adaptée au risque.
- Prévoir une annulation lorsque techniquement et métier possible.
- Ne jamais utiliser des libellés vagues comme « OK » ou « Continuer » pour confirmer une suppression ou un partage sensible.
- La confirmation visuelle ne remplace jamais l'autorisation côté serveur.

## 14. Formulaires, saisies et documents

- Demander uniquement les champs nécessaires à l'étape.
- Expliquer pourquoi une donnée est demandée lorsqu'elle est sensible ou inhabituelle.
- Distinguer champ obligatoire, facultatif et conditionnel.
- Utiliser le clavier adapté sur mobile (téléphone, nombre, e-mail, date, texte).
- Fournir exemples et formats attendus sans surcharger le champ.
- Valider au bon moment, sans attendre inutilement la soumission pour signaler une erreur simple.
- Associer les erreurs au champ et proposer une correction.
- Préserver les valeurs non sensibles après erreur.
- Ne pas effacer silencieusement une saisie.
- Prévoir les textes longs, noms composés, accents, langues et formats locaux.
- Pour les documents, expliquer les types, limites, taille, confidentialité, état d'envoi et résultat réel.
- L'aperçu d'un document ne doit pas divulguer un contenu au-delà des permissions.
- Les étapes longues doivent permettre de revenir en arrière sans perdre le travail.

## 15. États universels de l'interface

Chaque écran ou composant qui dépend de données ou d'un service doit traiter explicitement les états pertinents :

- initial / non encore consulté ;
- chargement ;
- contenu disponible ;
- contenu partiel ;
- aucun contenu ;
- erreur de lecture ;
- erreur d'enregistrement ;
- hors ligne ;
- contenu local seulement ;
- opération en attente ;
- synchronisation ;
- conflit ;
- accès refusé ;
- session expirée ;
- fonctionnalité indisponible ;
- succès confirmé ;
- action annulée.

Un état vide explique pourquoi il n'y a rien et propose une prochaine action utile, sans inventer de contenu. Un état d'erreur indique ce qui est arrivé, ce qui est préservé et ce que la personne peut faire. Un refus d'accès ne doit pas révéler l'existence ou le contenu d'une ressource privée si cette information est elle-même confidentielle.

## 16. Accessibilité et inclusion

Viser WCAG 2.2 niveau AA et tester les parcours essentiels avec les technologies d'assistance.

Exigences :
- structure sémantique correcte et hiérarchie de titres logique ;
- navigation complète au clavier ;
- focus visible, non masqué et ordre de tabulation prévisible ;
- noms accessibles pour boutons, champs, icônes et contrôles ;
- libellés explicites et instructions associées aux formulaires ;
- annonces de chargement, erreurs et changements de statut pertinents ;
- contraste conforme ;
- cibles tactiles suffisamment grandes et espacées ;
- aucune information communiquée uniquement par couleur, forme, son ou mouvement ;
- zoom et agrandissement du texte sans perte de contenu ou d'action ;
- respect de `prefers-reduced-motion` ;
- alternatives textuelles pertinentes pour les images informatives ;
- sous-titres ou transcriptions lorsque du contenu audio/vidéo informatif est introduit ;
- prise en charge de lecteurs d'écran et de technologies d'assistance courantes.

Ne pas créer de piège clavier dans les dialogues, menus, panneaux ou conversations. À l'ouverture d'un dialogue, gérer le focus ; à sa fermeture, le restituer à l'élément déclencheur lorsque cela est possible.

## 17. Langue, contenu et adaptation locale

- Le français doit être cohérent et naturel dans l'expérience française.
- L'anglais ne doit pas apparaître accidentellement dans les écrans français, sauf terme technique nécessaire et expliqué.
- Toute nouvelle chaîne doit passer par le système de traduction existant.
- Ne pas concaténer des fragments de phrases qui produisent des accords ou formulations incorrects.
- Prévoir les textes plus longs selon la langue.
- Utiliser des formats locaux de date, heure, nombre, téléphone et devise selon le contexte et les préférences explicites.
- Concevoir pour les réalités du Cameroun et les usages de connectivité variables sans présumer de l'appareil, du niveau de lecture, du réseau ou de la situation économique de la personne.
- Éviter les métaphores culturelles ambiguës, les termes juridiques approximatifs et le jargon métier non expliqué.
- Les traductions ne doivent jamais modifier le sens des permissions, statuts ou limites juridiques.

## 18. Confidentialité, sécurité et confiance dans l'interface

L'interface est une couche de présentation, pas une frontière de sécurité.

- Le serveur et la base restent les autorités pour les permissions.
- Masquer un bouton ne suffit pas à empêcher une action non autorisée.
- Ne pas placer des données privées dans le DOM, les attributs, les caches publics, les journaux ou les aperçus non autorisés.
- Respecter les rôles et permissions par ressource et par action.
- Afficher uniquement les informations nécessaires au profil courant.
- Éviter le contenu sensible dans les notifications d'écran verrouillé.
- Expliquer les accès, partages, délégations et révocations avec leur portée.
- Ne pas présenter une déclaration, une preuve déposée, un contrôle automatique ou un statut interne comme une certification juridique.
- Les états d'erreur ne doivent pas exposer de détails techniques, secrets ou informations sur un autre utilisateur.
- Les écrans de volontés secrètes appliquent les protections renforcées du domaine.
- Les aperçus visiteur ne doivent contenir aucune donnée réelle privée.

Toute évolution qui touche l'identité, les permissions, les documents ou les données sensibles doit être revue avec `SECURITY-RULES.md`.

## 19. Assistant adaptatif et intelligence intégrée à l'UX

L'assistant fait partie de l'expérience globale, mais ne doit pas devenir une couche intrusive ou une navigation parallèle.

### 19.1 Présence adaptative

- Accueil guidé pour les nouveaux visiteurs.
- Aide contextuelle discrète pendant l'exploration.
- Suggestions liées à l'écran, au domaine et aux permissions réelles.
- Mise en évidence des secteurs utiles sans cacher les autres.
- Possibilité de commencer directement une action sans devoir converser avec l'assistant.
- Contrôle clair permettant d'ignorer, fermer ou désactiver les aides non essentielles.

### 19.2 Transparence

Distinguer clairement :
- une réponse de l'assistant ;
- une information issue des données Heritis ;
- une suggestion ou hypothèse ;
- une opération préparée ;
- une action effectivement exécutée et confirmée.

L'assistant doit signaler ses incertitudes, ses limites, les données manquantes et l'indisponibilité du service. Il ne doit jamais simuler une réponse en cas d'échec réseau ou modèle.

### 19.3 Contrôle utilisateur

- Les suggestions ne modifient pas les permissions, la navigation persistante ou les données sans autorisation.
- L'assistant ne doit pas forcer un parcours conversationnel si une interface directe est plus simple.
- L'utilisateur peut corriger une information, refuser une proposition et revenir à l'interface standard.
- Les recommandations doivent respecter les préférences et les données accessibles.
- L'IA ne doit pas inventer des dossiers, étapes, personnes, droits, résultats ou confirmations.
- Toute action sensible reste soumise aux règles de gouvernance IA et à une validation humaine explicite.

### 19.4 Modes dégradés

Lorsque l'IA est indisponible, l'interface conserve les fonctions déterministes disponibles : navigation, formulaires, consultation autorisée, explications statiques et aide non générative. La panne IA ne doit pas bloquer l'ensemble de Heritis.

## 20. Notifications, alertes et sollicitations

- Distinguer information, action requise, avertissement et urgence réelle.
- Limiter les notifications à ce qui est utile et autorisé.
- Grouper les événements similaires et éviter les répétitions.
- Afficher l'origine, la date et l'action attendue lorsque nécessaire.
- Respecter les préférences de notification.
- Ne pas révéler de contenu confidentiel dans un canal non protégé.
- Une notification n'est pas une preuve de lecture, de consentement ou de réception.
- Ne pas employer « urgent » comme décoration ou pour attirer artificiellement l'attention.

## 21. Mouvement, animations et micro-interactions

- Les animations servent à comprendre une transition, un état ou une relation spatiale.
- Elles doivent être courtes, discrètes et non bloquantes.
- Éviter les animations continues, les effets de parallaxe et les mouvements décoratifs.
- Respecter systématiquement `prefers-reduced-motion`.
- Ne jamais faire dépendre la compréhension d'un effet animé.
- Ne pas retarder l'interaction ou la navigation pour terminer une animation.
- Les changements d'état doivent rester visibles même lorsque le mouvement est désactivé.

## 22. Cohérence des composants et réutilisation

- Réutiliser les primitives de `src/components/ui` et les composants métier partagés après vérification de leur comportement.
- Centraliser les tokens et variantes.
- Ne pas créer une variante locale qui reproduit un composant existant sans raison.
- Ne pas transformer un composant partagé en composant métier trop spécifique.
- Les composants partagés doivent documenter leurs variantes, états, propriétés accessibles et limites.
- Une correction de composant partagé doit être vérifiée sur toutes les surfaces qui l'utilisent.
- Les composants ne doivent pas embarquer de logique d'autorisation métier dupliquée.
- Les textes, statuts et règles métier doivent provenir de sources de vérité cohérentes.

## 23. Qualité éditoriale et microcopie

- Utiliser des phrases courtes, concrètes, respectueuses et non culpabilisantes.
- Préférer les verbes qui décrivent l'action : « Ajouter un document », « Examiner les informations », « Reprendre l'envoi ».
- Éviter les messages vagues : « Une erreur est survenue » sans explication ni suite.
- Ne pas utiliser « sécurisé », « vérifié », « validé » ou « officiel » sans définition et preuve correspondantes.
- Expliquer les termes juridiques et patrimoniaux sans les déformer.
- Éviter les formulations qui attribuent une faute à l'utilisateur.
- Décrire ce qui est préservé après un échec.
- Les boutons doivent nommer le résultat attendu, pas seulement « OK ».

## 24. Écrans professionnels, données denses et tableaux

Les écrans destinés aux usages avancés peuvent présenter davantage de données, mais doivent conserver une hiérarchie claire.

- Mettre en avant les éléments qui nécessitent une décision ou une action.
- Permettre recherche, tri et filtres uniquement lorsqu'ils répondent à un besoin réel.
- Expliquer les filtres actifs et permettre de les retirer facilement.
- Sur mobile, transformer les tableaux denses en listes ou fiches lisibles lorsque nécessaire.
- Ne pas cacher une information essentielle derrière un survol.
- Garder les colonnes, libellés et actions compréhensibles.
- Éviter les tableaux trop larges qui imposent un défilement horizontal pour chaque consultation.
- Préserver la distinction entre données déclarées, documents et états de vérification.

## 25. Tests et validation UX obligatoires

Une interface ne peut pas être déclarée terminée sur la seule base d'une compilation ou d'une capture d'écran.

Pour toute nouvelle page ou refonte, vérifier selon le périmètre :
- objectif et hiérarchie de l'écran ;
- parcours visiteur, personne reconnue et utilisateur connecté ;
- permissions, refus d'accès et accès direct par URL ;
- mobile étroit, mobile courant, tablette et desktop ;
- thème clair et thème sombre ;
- clavier, lecteur d'écran et focus ;
- chargement, vide, erreur, succès et indisponibilité ;
- hors ligne, reprise, file en attente et conflits si concernés ;
- formulaire, validation, conservation de saisie et double soumission ;
- action réelle de chaque bouton, lien, menu et carte interactive ;
- absence de données sensibles dans les aperçus non autorisés ;
- traductions et contenus longs ;
- performance et comportement sur appareil modeste.

Les tests automatisés doivent couvrir les interactions déterministes et les régressions. Les essais manuels doivent couvrir les scénarios qui ne peuvent être correctement validés par les tests automatisés. Toute limite doit être signalée.

## 26. Méthode obligatoire de conception et de réalisation

Avant de construire ou refondre une interface :

1. Lire ce référentiel, `AGENTS.md`, les règles d'architecture et de sécurité pertinentes.
2. Lire la spécification du domaine et des services transversaux concernés.
3. Examiner les routes, composants, styles, données, permissions et tests réellement existants.
4. Identifier les profils, appareils, contextes réseau et états concernés.
5. Décrire le parcours actuel et le parcours cible.
6. Établir les actions, préconditions, résultats, erreurs et effets secondaires.
7. Définir le contenu minimum et les éléments qui peuvent être supprimés.
8. Vérifier la cohérence avec les composants et tokens existants.
9. Définir les critères d'acceptation visuels, fonctionnels, accessibilité, performance et hors ligne.
10. Obtenir les décisions produit nécessaires avant toute modification à impact.
11. Construire par évolution ciblée, sans réécrire ce qui fonctionne.
12. Tester les états et les profils concernés.
13. Mettre à jour la documentation et les inventaires.
14. Présenter les résultats réels, les limites et les preuves.

Ne pas transformer une demande de design en refonte générale non autorisée. Ne pas modifier Lovable ni un environnement distant dans le cadre d'un travail GitHub documentaire ou de code.

## 27. État du dépôt observé et limites de l'audit initial

Cette section décrit uniquement les éléments effectivement repérés dans le dépôt à la référence indiquée en tête. Elle ne certifie ni le rendu navigateur, ni la disponibilité de chaque parcours, ni la conformité complète.

### 27.1 Socle visuel et composants

Le dépôt contient :
- `docs/DESIGN_SYSTEM_UI_UX.md` et `docs/UX-PRINCIPLES.md` ;
- `src/index.css` et `tailwind.config.ts` avec des tokens et variantes visuelles ;
- une bibliothèque de primitives dans `src/components/ui/` ;
- un composant de bascule de thème ;
- les thèmes clair et sombre déclarés dans le système de styles.

La présence de tokens ou de composants ne prouve pas que chaque écran les utilise de manière cohérente, ni que le rendu respecte les contrastes attendus. Le thème et les composants doivent être vérifiés visuellement sur les routes concernées.

### 27.2 Routes et parcours repérés

Le routeur contient notamment les surfaces suivantes :
- accueil et découverte `/` ;
- présentation de module `/modules/:moduleId` ;
- authentification et onboarding ;
- assistant `/assistant` ;
- profil `/profile` ;
- dossiers, création, détail, modification et bâtiments ;
- alertes, fichiers et centre de synchronisation ;
- page introuvable.

Les protections d'accès sont différentes selon les routes. Une route publique n'implique pas que toutes ses actions ou données soient publiques. Les autorisations doivent être vérifiées pour chaque action et chaque ressource.

### 27.3 Composants transversaux repérés

Le dépôt contient notamment `AppLayout`, `BottomNav`, `OfflineIndicator`, `PageHeader`, `EmptyState`, `NextActionCard`, `AssistantTip`, `VisitorBanner`, `FirstStepDialog` et les primitives UI. Les usages, états, accessibilité et cohérence doivent être évalués sur toutes les pages concernées.

### 27.4 Hors ligne et synchronisation repérés

Le dépôt contient une base locale Dexie, des mécanismes de file d'opérations et de synchronisation, un indicateur hors ligne, un centre de synchronisation, des tests de continuité et des tests de synchronisation. Leur présence n'établit pas que chaque parcours métier est entièrement utilisable hors ligne ni que toutes les données sont disponibles localement.

### 27.5 Identité et accès visiteur repérés

Le routeur permet la consultation de certaines pages sans authentification et protège plusieurs pages métier. Des composants et services de reconnaissance visiteur existent. Des audits antérieurs ont signalé des écarts possibles entre l'intention de découverte, les actions affichées et les routes protégées. Ces audits historiques ne sont pas une preuve de l'état actuel ; chaque parcours doit être revérifié sur le code courant avant correction.

### 27.6 Langues et tests repérés

Le dépôt contient des ressources françaises et anglaises, ainsi que des tests Vitest, Testing Library et des tests spécifiques aux parcours, à la navigation, à l'identité, aux données et à la synchronisation. La présence de tests ne prouve pas la couverture visuelle, l'accessibilité réelle, la performance terrain ou le fonctionnement sur appareils physiques.

### 27.7 Limites explicites

Aucun rendu navigateur, essai sur appareil physique, test utilisateur, mesure terrain des Core Web Vitals ou audit complet WCAG n'est revendiqué par la rédaction de ce document. Les exigences ci-dessus constituent le standard cible ; elles ne doivent pas être présentées comme déjà satisfaites par le code.

## 28. Critères de sortie d'une interface

Une interface est prête à être proposée à la revue lorsque :
- son besoin et son objectif sont explicites ;
- son contenu est limité à ce qui aide à comprendre ou agir ;
- les parcours et permissions sont cohérents ;
- aucune création de compte n'est imposée à la simple découverte ;
- ses actions sont réelles, testées et honnêtes ;
- les états utiles sont traités ;
- elle fonctionne sur les tailles d'écran et thèmes concernés ;
- l'accessibilité essentielle est vérifiée ;
- ses comportements hors ligne sont exacts et transparents ;
- les performances et limites sont mesurées ou signalées ;
- les tests et la documentation sont mis à jour ;
- les éléments non vérifiés sont déclarés.

## 29. Checklist de revue UI/UX

- [ ] L'écran répond à un besoin utilisateur identifiable.
- [ ] Une intention principale et une action dominante sont évidentes.
- [ ] Les informations et choix inutiles ont été supprimés.
- [ ] La découverte de Heritis reste possible sans compte.
- [ ] Les statuts visiteur, personne reconnue, compte et identité vérifiée ne sont pas confondus.
- [ ] Les quatre domaines et leurs sous-domaines sont représentés conformément aux spécifications.
- [ ] Les cartes ont une taille et une densité adaptées au viewport.
- [ ] Le mobile a été conçu en premier et testé.
- [ ] Les thèmes clair et sombre ont été vérifiés.
- [ ] Les tokens et composants partagés sont utilisés de manière cohérente.
- [ ] Les actions ont des préconditions, résultats, erreurs et retours définis.
- [ ] Aucun bouton ou élément interactif n'est factice.
- [ ] Les états de chargement, vide, erreur, refus, succès et indisponibilité sont traités.
- [ ] Le mode hors ligne et les états de synchronisation sont honnêtes.
- [ ] Les saisies et brouillons sont préservés lorsque cela est prévu.
- [ ] Les permissions sont appliquées côté serveur et non seulement dans l'interface.
- [ ] Les contenus sensibles ne sont pas exposés dans les aperçus ou notifications.
- [ ] L'assistant reste facultatif, transparent et non intrusif.
- [ ] Les recommandations IA ne changent pas les droits ou données sans autorisation.
- [ ] Les contrastes, focus, clavier, lecteur d'écran et cibles tactiles sont vérifiés.
- [ ] Les animations respectent la préférence de réduction du mouvement.
- [ ] Les textes sont clairs, traduits et adaptés aux formats locaux.
- [ ] Les tests automatisés et manuels pertinents ont été exécutés.
- [ ] Les limites et éléments non vérifiés sont clairement signalés.\n- [ ] La solution choisie privilégie le natif, le gratuit ou l'open source avant toute option payante.\n- [ ] Les requêtes, transferts et appels externes sont limités au strict nécessaire.\n- [ ] Aucun dépassement facturable ou abonnement tiers n'est activé sans validation explicite.\n- [ ] Une solution de repli existe pour tout service externe non essentiel.

## 30. Économie des ressources, requêtes et coûts d'exploitation

### 30.1 Principe « gratuit d'abord, coût minimal ensuite »

La V1 doit être conçue pour offrir les fonctionnalités prévues sans imposer à l'utilisateur final un abonnement payant à un service tiers. Pour chaque besoin, rechercher dans cet ordre :
1. une capacité native déjà présente dans la plateforme ou le socle technique ;
2. une méthode simple, gratuite, maintenue et suffisamment fiable ;
3. une bibliothèque open source légère, déjà compatible avec le projet ;
4. un service gratuit ou un palier gratuit, après vérification de ses limites, conditions, quotas, confidentialité et pérennité ;
5. seulement si les solutions précédentes sont insuffisantes, une solution payante ou une architecture plus complexe, avec comparaison du coût total, justification et validation préalable.

Un palier gratuit ne doit pas être considéré comme gratuit à vie : documenter les quotas, les conditions de dépassement, les limites de stockage, les appels, la rétention, la possibilité d'export et le risque de verrouillage fournisseur. Ne jamais activer silencieusement une consommation payante ou un dépassement facturable.

### 30.2 Requêtes et transferts minimaux

- Ne charger que les données nécessaires à l'écran et à l'action en cours.
- Éviter les requêtes en cascade, les appels identiques répétés et les rafraîchissements complets inutiles.
- Regrouper les lectures compatibles, utiliser pagination ou chargement progressif pour les listes, et limiter les colonnes et relations demandées.
- Mettre en place debounce pour la recherche et les saisies qui déclenchent des appels ; annuler les requêtes devenues obsolètes.
- Dédupliquer les demandes concurrentes et réutiliser les données en cache lorsque la fraîcheur et la confidentialité le permettent.
- Éviter le polling fréquent ; préférer une mise à jour à la demande, une stratégie de rafraîchissement raisonnable ou un mécanisme temps réel uniquement lorsqu'il apporte une valeur démontrable.
- Ne pas télécharger de gros fichiers, images ou historiques avant qu'ils soient nécessaires.
- Compresser et adapter les médias, et éviter de retransmettre des contenus inchangés.
- Prévoir des limites, timeouts, annulations, reprises et protections contre les boucles de requêtes.
- Mesurer le nombre d'appels, le volume transféré, la latence et les coûts avant et après une évolution.

### 30.3 Sobriété des services externes et de l'intelligence

- Ne pas appeler un service externe pour une opération que le client ou le serveur peut effectuer simplement et sûrement localement.
- Ne pas solliciter l'IA pour une validation déterministe, un calcul simple, une recherche SQL ou une règle métier qui doit être explicite et testable.
- Pour l'IA, limiter le contexte, la longueur des échanges, les répétitions, la taille des documents et les appels au modèle ; réutiliser les résultats uniquement lorsque la confidentialité, la fraîcheur et le contexte le permettent.
- Prévoir quotas, limites par utilisateur, budgets, alertes et arrêt contrôlé pour les services facturables.
- Proposer un mode dégradé fonctionnel lorsque l'IA, un fournisseur ou un service payant est indisponible.
- Ne pas faire dépendre une fonction essentielle V1 d'un service payant sans décision produit explicite et solution de repli.

### 30.4 Validation avant adoption d'une solution coûteuse

Avant d'ajouter une dépendance, un fournisseur, un abonnement ou une API facturée, comparer au minimum : solution native, solution open source, solution gratuite, coût d'exploitation réel, coût à l'échelle, limites de quota, confidentialité, maintenance, réversibilité, dépendance fournisseur et effort d'intégration. Documenter le choix et obtenir l'autorisation requise selon la gouvernance. La solution la moins chère n'est pas acceptable si elle compromet la sécurité, la fiabilité, la conformité ou l'expérience utilisateur.

## 31. Références et règle finale

Références complémentaires :
- `/AGENTS.md` — instructions générales obligatoires ;
- `/CONTRIBUTING.md` — contribution et revue ;
- `GOVERNANCE.md` — autorité, décisions et responsabilités ;
- `ARCHITECTURE-RULES.md` — architecture, résilience et séparation des responsabilités ;
- `SECURITY-RULES.md` — identité, accès, confidentialité et sécurité ;\n- `DATA-AND-DATABASE-RULES.md` — structure, requêtes, stockage, synchronisation et maîtrise des coûts de données ;
- `DESIGN_SYSTEM_UI_UX.md` — direction artistique et tokens ;
- `UX-PRINCIPLES.md` — langage utilisateur et progression ;
- `UI_UX_CURRENT_STATE_AUDIT_2026-11-07.md` — audit statique daté, à revalider ;
- `UI_UX_PAGE_INVENTORY.md`, `UI_UX_FUNCTIONAL_AUDIT.md`, `UI_UX_VISUAL_AUDIT.md`, `UI_UX_ACCESSIBILITY_AUDIT.md` et `UI_UX_CONSOLIDATED_AUDIT.md` — inventaires et audits historiques à confronter à l'état courant ;
- spécifications V1 des quatre domaines et `SERVICES_TRANSVERSAUX_V1.md`.

**Règle finale : Heritis doit être puissant par ce qu'il permet, simple par ce qu'il montre, rapide par sa construction, fiable dans ses actions et accessible dans les conditions réelles d'utilisation. Une interface réussie ne demande pas à l'utilisateur de comprendre la complexité interne du système ; elle l'aide à avancer avec confiance, sans lui imposer un compte, une décision, une action ou une charge mentale qui ne sont pas nécessaires.**

---

## Référentiel permanent complémentaire

Les règles de modélisation, de qualité, de protection, de synchronisation, de conservation et de sobriété des données sont définies dans [DATA-AND-DATABASE-RULES.md](DATA-AND-DATABASE-RULES.md). Ce référentiel doit être consulté pour toute évolution touchant aux données ou à leur stockage.

---

## Exigences permanentes de tests et de qualité

Les règles de validation du comportement réel, de qualité du code de production, de sécurité, de maintenabilité, de scalabilité, de résilience, d'accessibilité et de modernisation progressive sont définies dans [TESTING-REQUIREMENTS.md](TESTING-REQUIREMENTS.md). Les techniques éprouvées et déjà maîtrisées doivent être privilégiées ; toute nouvelle technologie doit démontrer son bénéfice, sa maturité, sa sécurité et son coût total avant adoption.
