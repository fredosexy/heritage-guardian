# Spécification fonctionnelle V1 — Biens mobiliers

**Domaine :** Patrimoine et gestion des biens  
**Sous-domaine :** Biens mobiliers  
**Version :** V1  
**Pays de lancement :** Cameroun  
**Statut :** spécification fonctionnelle proposée, périmètre validé par l'utilisateur  
**Nature de cette livraison :** documentation uniquement

## 1. Finalité

Permettre à une personne ou à une famille de déclarer, identifier, documenter, sécuriser et suivre les biens mobiliers corporels auxquels elle indique être liée. La fiche doit rendre compréhensibles l'identité du bien, ses caractéristiques utiles, son état déclaré, son lieu connu de conservation, les personnes associées, les pièces disponibles et les événements de son historique.

Le périmètre porte sur les objets et équipements matériels. Les biens financiers et droits patrimoniaux relèvent du sous-domaine correspondant ; les exploitations, élevages et équipements déjà suivis dans le sous-domaine agricole et rural doivent y rester référencés sans créer de fiche concurrente. Les animaux vivants ne sont pas enregistrés dans ce sous-domaine.

Heritis constitue un référentiel d'information et de traçabilité. Il ne certifie pas la propriété, l'authenticité d'un objet, la valeur d'un bien ni la validité juridique d'une transaction.

## 2. Périmètre des familles de biens

La classification V1 couvre notamment :

1. **Véhicules et moyens de transport :** voitures, motos, tricycles, camions, remorques, embarcations et autres moyens de transport déclarés.
2. **Mobilier :** meubles domestiques, mobiliers de bureau, de commerce ou d'établissement.
3. **Équipements domestiques :** appareils électroménagers, équipements électroniques et matériels d'usage courant.
4. **Matériels et équipements professionnels :** machines, outils, matériels techniques et équipements de travail.
5. **Objets de valeur :** bijoux, montres, œuvres d'art, objets précieux ou singuliers.
6. **Collections et biens personnels :** collections, objets de famille, souvenirs et autres biens personnels présentant un intérêt patrimonial.
7. **Autres biens mobiliers :** catégorie de repli motivée, avec description obligatoire de la nature du bien.

Cette classification est fonctionnelle. Elle ne constitue pas une qualification juridique, fiscale, douanière ou assurantielle. Les biens incorporels, créances, participations et autres droits patrimoniaux ne relèvent pas de cette fiche. Les animaux et élevages relèvent du sous-domaine agricole et rural, et non de l'inventaire des biens mobiliers.

## 3. Principes d'identification et d'unicité

### 3.1 Identifiant Heritis

Chaque bien mobilier dispose d'un identifiant interne unique et permanent. Cet identifiant :
- reste stable pendant toute la vie de la fiche ;
- ne change pas lors d'un changement de détenteur, d'utilisateur, de lieu de conservation ou de situation déclarée ;
- n'est jamais réattribué à un autre bien ;
- ne remplace aucun numéro officiel, numéro de série constructeur, immatriculation ou référence externe.

### 3.2 Distinguer les biens proches

Lorsque plusieurs biens sont semblables, la fiche doit permettre de les distinguer par une combinaison adaptée de désignation, marque, modèle, numéro de série, caractéristiques, photographie, quantité ou autre élément descriptif.

Un lot ou un ensemble peut être enregistré comme un ensemble lorsque son suivi global est pertinent. Les composants qui nécessitent une identité ou un historique autonomes doivent pouvoir être référencés séparément et reliés à l'ensemble. Cette relation ne présume pas leur indépendance juridique.

### 3.3 Prévention des doublons

Avant de créer une fiche, l'interface peut aider à rechercher un bien déjà enregistré à partir des informations disponibles. Une correspondance possible doit être présentée comme une suggestion à vérifier, jamais comme une fusion automatique.

Les domaines et dossiers qui concernent un bien déjà enregistré doivent référencer sa fiche patrimoniale. Un équipement agricole ou professionnel déjà enregistré dans un autre sous-domaine ne doit pas être recréé uniquement pour apparaître dans un nouveau dossier. Les fiches du sous-domaine agricole et rural restent les références pour les équipements et installations qui y sont déjà gérés ; la présente fiche ne crée pas de doublon.

## 4. Informations de la fiche

Les champs sont progressifs et adaptés à la famille du bien. La V1 ne doit pas imposer toutes les rubriques à chaque catégorie.

### 4.1 Informations communes

Selon les informations disponibles, la fiche peut contenir :
- identifiant Heritis ;
- désignation ou nom usuel ;
- famille et sous-catégorie ;
- description libre et caractéristiques distinctives ;
- marque, fabricant, modèle ou référence, si pertinents ;
- numéro de série, immatriculation ou autre référence externe, si disponible ;
- quantité ou composition, lorsque le bien est un lot ;
- date ou période d'acquisition déclarée ;
- mode d'entrée déclaré : achat, don, héritage, fabrication, échange, prêt, autre ou inconnu ;
- état matériel déclaré ;
- situation d'utilisation ou de détention ;
- lieu de conservation connu ;
- personnes et relations déclarées ;
- documents, photographies et autres pièces ;
- provenance des informations ;
- événements et historique ;
- liens vers d'autres biens et dossiers Heritis.

### 4.2 Caractéristiques par famille

Les champs spécifiques sont facultatifs et pertinents uniquement pour la famille choisie.

- **Véhicules :** type, marque, modèle, année ou période, immatriculation, numéro de châssis ou de série, énergie ou motorisation déclarée, kilométrage déclaré avec date de relevé, documents disponibles.
- **Mobilier :** type, matière déclarée, dimensions si utiles, fabricant ou artisan connu, quantité, particularités d'identification.
- **Équipements domestiques :** type, marque, modèle, numéro de série, caractéristiques utiles, accessoires associés.
- **Matériels professionnels :** fonction, marque, modèle, numéro de série, accessoires, lieu d'utilisation ou de stockage.
- **Objets de valeur :** description distinctive, matière ou caractéristiques déclarées, marque ou signature si connue, photographie et documents de provenance disponibles.
- **Collections :** nature de la collection, description de l'ensemble, nombre d'éléments déclaré, inventaire sommaire et possibilité de fiches liées pour les éléments suivis séparément.

Heritis ne doit pas présenter ces caractéristiques déclarées comme une expertise technique ou une certification.

## 5. État, situation et localisation

### 5.1 État matériel déclaré

L'état matériel doit être distinct du statut documentaire. Valeurs indicatives possibles : neuf, très bon état, bon état, usagé, endommagé, hors d'usage, détruit ou inconnu. L'utilisateur peut préciser une observation, sa date et son auteur.

### 5.2 Situation déclarée

La situation du bien peut notamment être : utilisé, conservé, prêté, loué, confié à un tiers, immobilisé, perdu, signalé comme volé, faisant l'objet d'une suspicion déclarée de vol, vendu, donné, détruit ou situation inconnue. Ces valeurs décrivent exclusivement une déclaration attribuée à son auteur ; elles ne constituent ni un constat de vol, ni une qualification officielle, ni une conclusion sur la responsabilité d'une personne.

La fin d'une situation ou un changement doit être historisé plutôt que remplacer silencieusement l'état antérieur.

### 5.3 Lieu de conservation

La fiche peut indiquer un lieu connu de conservation ou d'utilisation : domicile, local, atelier, entrepôt, véhicule, autre lieu décrit ou lieu inconnu. La précision est limitée à ce qui est nécessaire et autorisé.

La V1 ne prévoit pas de suivi GPS permanent, de surveillance en temps réel ni de partage public de la localisation. Les coordonnées ou adresses précises, lorsqu'elles sont réellement nécessaires, sont soumises aux permissions et protections applicables.

## 6. Valeur déclarée et limites d'évaluation

La V1 peut conserver une valeur indiquée par un utilisateur ou portée par un document, avec :
- montant et devise tels que déclarés ;
- nature de la valeur : prix d'acquisition, valeur déclarée, estimation externe ou montant figurant sur une pièce ;
- auteur ou source ;
- date de référence ;
- document associé, le cas échéant ;
- réserves ou contexte utiles.

Ces notions doivent être affichées distinctement. Une valeur déclarée n'est pas une estimation Heritis. Une estimation externe n'est pas une expertise réalisée par Heritis. Le système ne calcule pas automatiquement une valeur marchande, une indemnité, une valeur fiscale ou une valeur de succession.

## 7. Personnes, rôles et relations déclarées

Un même bien peut être associé à plusieurs personnes, simultanément ou successivement. La fiche ne doit pas imposer un propriétaire unique.

Selon le cas, les qualités déclarées peuvent comprendre :
- propriétaire ou copropriétaire déclaré ;
- détenteur ou possesseur ;
- utilisateur ;
- dépositaire ou gardien ;
- locataire ou occupant ;
- prêteur ou emprunteur, selon le contexte ;
- bénéficiaire d'un droit déclaré ;
- représentant ;
- gestionnaire ou autre personne concernée.

Pour chaque relation, conserver selon disponibilité : personne, qualité déclarée, description, auteur de la déclaration, source, date de saisie, dates d'effet déclarées, pièces associées, statut de vérification, éventuelle date de fin et historique des corrections.

Les rôles dans l'application et les permissions d'accès sont distincts des qualités patrimoniales déclarées. Être détenteur, utilisateur, dépositaire ou propriétaire déclaré ne donne pas automatiquement un droit d'accès ou de modification dans Heritis.

Une association ou une pièce jointe ne prouve pas à elle seule la propriété ou l'existence d'un droit.

## 8. Documents, photographies et provenance

La fiche peut recevoir, selon la nature du bien :
- factures, reçus et preuves d'achat ;
- contrats de vente, de don, de prêt, de location ou de dépôt ;
- certificats, garanties et notices ;
- documents d'immatriculation ou d'identification disponibles ;
- attestations, inventaires et correspondances ;
- photographies du bien, de ses marques distinctives ou de ses accessoires ;
- documents de provenance ou d'estimation établis par des tiers.

Pour chaque pièce, conserver autant que possible son auteur ou fournisseur, sa date de dépôt, sa catégorie, le bien ou la relation concernés, sa source et les éventuels contrôles réalisés.

Les statuts doivent distinguer :
1. information déclarée ;
2. pièce déposée ;
3. pièce examinée dans un contrôle interne identifié ;
4. résultat d'une vérification externe ou décision d'une autorité compétente, lorsque documenté.

Le dépôt d'un document ou d'une photographie ne garantit ni son authenticité, ni sa validité, ni sa suffisance. Les pièces privées ne sont accessibles qu'aux personnes autorisées.

## 9. Événements et historique

La fiche peut retracer notamment :
- déclaration et création de la fiche ;
- acquisition ou entrée déclarée dans le patrimoine ;
- changement de détenteur, d'utilisateur, de dépositaire ou de lieu ;
- prêt, dépôt, location ou restitution ;
- entretien ou réparation simplement signalé ;
- détérioration, perte, signalement de vol ou suspicion déclarée de vol, récupération ou destruction ;
- vente, don, échange ou transmission déclarée ;
- ajout ou remplacement d'un document ;
- vérification, contestation ou correction ;
- rattachement à un dossier de succession ou de conflit.

Pour les événements importants, distinguer la date de l'événement déclarée et la date d'enregistrement dans Heritis. Conserver l'auteur, la source, les observations et les pièces associées lorsque disponibles.

Un événement déclaré ne doit pas être présenté comme une transaction juridiquement confirmée. Les corrections ne doivent pas effacer silencieusement les informations antérieures nécessaires à la traçabilité.

## 10. Transmission et dossiers liés

Un bien mobilier peut être référencé depuis un dossier de succession, de volontés ou de conflit. Le dossier lié réutilise l'identifiant patrimonial et ne crée pas une copie concurrente du bien.

La fiche peut conserver les informations et pièces utiles à la préparation d'une transmission : personnes concernées, relations déclarées, historique, documents de provenance et indications reçues. Heritis ne détermine pas automatiquement les héritiers, les quotes-parts, la validité d'un testament ou l'attribution finale du bien.

Un changement de détenteur ou une transmission déclarée doit être tracé comme événement, sans effacer les relations antérieures et sans être présenté comme un transfert juridiquement établi en l'absence de preuve ou décision compétente.

## 11. Désaccords et contestations

Lorsque plusieurs personnes déclarent des informations contradictoires sur un bien, Heritis doit permettre de :
- conserver chaque déclaration avec son auteur et sa date ;
- distinguer les positions des différentes personnes ;
- rattacher les pièces et échanges pertinents ;
- relier la fiche à un dossier de conflit ;
- préserver la déclaration initiale et les modifications ultérieures ;
- limiter l'accès selon les permissions.

La contestation ne modifie pas automatiquement la fiche de référence et ne donne pas à Heritis un pouvoir d'arbitrage. La plateforme organise les informations et peut orienter vers des services ou professionnels compétents.

## 12. Parcours fonctionnels V1

1. **Découvrir :** présenter le rôle du sous-domaine et des exemples de familles de biens. Un visiteur non connecté ne voit qu'un aperçu explicatif.
2. **Commencer une déclaration :** après authentification et contrôle des permissions, choisir une famille et saisir progressivement les informations essentielles.
3. **Identifier :** attribuer un identifiant interne et proposer une recherche de doublons à confirmer par l'utilisateur.
4. **Compléter :** ajouter caractéristiques, état, situation, lieu, personnes associées et pièces pertinentes.
5. **Consulter :** afficher une fiche structurée, son statut documentaire, ses relations, ses pièces et son historique selon les droits.
6. **Mettre à jour :** corriger ou compléter les informations en conservant l'auteur, la date et la trace du changement.
7. **Relier :** référencer le bien depuis les dossiers et domaines autorisés, sans duplication.
8. **Préparer une transmission ou suivre une contestation :** relier les dossiers concernés et conserver les informations utiles, sans décision automatique.

Les formulaires doivent être progressifs, adaptés à la catégorie et permettre de différer les informations non disponibles sans inventer de données.

## 13. Confidentialité, permissions et fonctionnement hors connexion

- L'accès à la fiche, aux documents, à la localisation et à l'historique dépend des permissions applicables.
- Les qualités patrimoniales déclarées ne confèrent pas automatiquement des permissions applicatives.
- Aucun document privé ni renseignement sensible ne doit être rendu public par défaut.
- Les actions protégées nécessitent une session et les autorisations requises ; le visiteur dispose uniquement d'un aperçu.
- Les saisies hors connexion doivent pouvoir être identifiées comme locales ou en attente de synchronisation.
- Une synchronisation ne doit pas écraser silencieusement une modification concurrente. Les conflits doivent être présentés et résolus selon les règles transversales de Heritis.
- Les suppressions, corrections et révocations doivent respecter les règles communes de traçabilité, de conservation et de confidentialité.

Cette spécification ne définit pas le schéma technique, les politiques RLS ni les mécanismes de synchronisation. Ceux-ci nécessitent un audit séparé de l'architecture existante avant toute implémentation.

## 14. Principes UI/UX

L'interface suit le système visuel global Heritis « Héritage premium » : vert forêt, ivoire et or patiné utilisé avec retenue, avec prise en charge du mode clair et du mode sombre.

Principes :
- privilégier une présentation sobre, lisible, mobile-first et cohérente ;
- afficher les familles de biens avec des cartes suffisamment grandes, un titre clair et une description courte ;
- limiter le nombre de cartes visibles et éviter les éléments décoratifs sans fonction ;
- adapter les champs à la famille sélectionnée ;
- distinguer visuellement les informations déclarées, les pièces déposées, les vérifications et les décisions externes ;
- rendre visibles l'état matériel et la situation du bien sans les confondre avec le statut documentaire ;
- présenter les personnes et leurs qualités de manière distincte des permissions ;
- rendre l'historique compréhensible et attribuable ;
- prévoir les états vide, chargement, erreur, hors connexion, en attente et conflit de synchronisation ;
- respecter les exigences d'accessibilité du système global, notamment le contraste, la navigation clavier, les libellés et les zones tactiles.

Aucune conformité d'accessibilité ou compatibilité réelle ne doit être revendiquée sans tests correspondants.

## 15. Exclusions explicites de la V1

Sont hors périmètre :
- gestion commerciale, comptabilité, caisse ou facturation d'activité ;
- gestion avancée de stocks commerciaux et inventaire logistique professionnel ;
- maintenance préventive ou corrective détaillée et planification des réparations ;
- expertise technique, authentification d'œuvres ou certification d'objets ;
- estimation automatique de valeur, calcul d'indemnité ou évaluation fiscale ;
- gestion intégrée de contrats d'assurance et de sinistres ;
- géolocalisation permanente, GPS embarqué et suivi en temps réel ;
- vente en ligne, marketplace et mise en relation commerciale intégrée ;
- arbitrage juridique, certification de propriété ou transfert automatique de droits ;
- automatisation des règles successorales et attribution des biens.

Ces besoins pourront être réévalués dans une version ultérieure après décision explicite.

## 16. Critères d'acceptation fonctionnels

La V1 sera considérée comme fonctionnellement couverte lorsque :
1. les familles de biens prévues peuvent être choisies et décrites sans champs inadaptés ;
2. chaque fiche dispose d'un identifiant Heritis stable ;
3. les biens similaires peuvent être distingués et les doublons potentiels signalés sans fusion automatique ;
4. les caractéristiques spécifiques sont facultatives et adaptées à la famille ;
5. l'état matériel, la situation et le statut documentaire sont distincts ;
6. plusieurs personnes et qualités déclarées peuvent être associées à un même bien ;
7. les qualités déclarées restent distinctes des permissions applicatives ;
8. les documents, photographies et leur provenance peuvent être associés à la fiche ;
9. les événements, corrections et changements sont historisés ;
10. les valeurs déclarées ou issues de tiers ne sont pas présentées comme des expertises Heritis ;
11. les fiches peuvent être référencées depuis les dossiers autorisés sans duplication ;
12. les contestations conservent les positions et pièces attribuables sans arbitrage automatique ;
13. les permissions protègent les fiches, documents et localisations ;
14. les états hors connexion, attente et conflit sont prévus dans le parcours ;
15. le visiteur ne peut consulter que l'aperçu public ;
16. les écrans sont cohérents avec le système UI/UX global et les critères d'accessibilité à vérifier par tests.

Ces critères décrivent les résultats attendus. Ils ne signifient pas que les fonctionnalités sont déjà implémentées ou testées.

## 17. Ordre recommandé pour une future implémentation

1. Auditer les modèles, composants, routes, permissions et services transversaux déjà présents.
2. Vérifier les fiches et équipements existants afin de prévenir les doublons avec les autres sous-domaines.
3. Définir le modèle de données et les règles d'accès après audit, sans présumer des migrations nécessaires.
4. Réaliser les parcours de déclaration et de recherche de biens.
5. Réaliser les vues de liste, détail et mise à jour avec historique.
6. Ajouter les personnes, relations, documents et événements.
7. Relier les fiches aux dossiers de succession et de conflit.
8. Vérifier sécurité, permissions, synchronisation, accessibilité et comportement mobile par des tests adaptés.

## 18. Limites de la spécification

Ce document formalise le périmètre fonctionnel V1. Il ne constitue ni un avis juridique, ni une expertise, ni un schéma de base de données, ni une spécification d'API, ni une autorisation de modifier le code applicatif ou une configuration Supabase.

Toute implémentation devra être précédée d'une vérification de l'état réel du dépôt et de l'architecture. Aucun changement Lovable ou Supabase distant n'est autorisé par cette spécification.

## 19. Compléments de précision sur l'identité et les familles

### 19.1 Bien individuel, lot et collection

La fiche doit distinguer un objet individuel, un lot homogène et une collection. Un lot peut être suivi comme un ensemble lorsque ses éléments ne nécessitent pas de suivi individuel ; sa composition et sa quantité déclarée doivent être datées. Si certains éléments doivent ensuite être suivis séparément, créer des fiches propres et conserver le lien « élément de » avec le lot d'origine. Ne pas créer automatiquement une fiche par unité pour les biens de faible valeur ou non individualisés.

Une collection peut être représentée par une fiche d'ensemble et, lorsque cela est utile, des fiches individuelles liées. Le nombre d'éléments, la composition et l'état général restent des informations déclarées et datées. La création ou le retrait d'une fiche enfant ne doit pas effacer l'historique de l'ensemble.

### 19.2 Distinction avec les autres sous-domaines

Les animaux d'élevage et les cheptels relèvent des biens agricoles et ruraux ; ils ne doivent pas être dupliqués dans les biens mobiliers. Les équipements agricoles ou ruraux déjà gérés dans leur sous-domaine sont réutilisés par lien. Les comptes, placements, créances et droits financiers relèvent des biens financiers. Les droits intellectuels, licences et actifs numériques non financiers relèvent des autres actifs particuliers. En cas de classement incertain, conserver une proposition de classement ou une déclaration à examiner plutôt que créer plusieurs fiches.

### 19.3 Caractéristiques et références spécifiques

Les références visibles (immatriculation, numéro de série, fabricant, modèle, signature, référence d'inventaire) doivent être retranscrites sans normalisation destructive, avec leur source et leur date de constat. Une référence peut être absente, inconnue, illisible ou contestée. Elle ne doit pas être inventée pour satisfaire un formulaire.

Pour les véhicules, distinguer immatriculation, numéro de châssis, numéro de série et référence de carte grise. Pour les objets de valeur, distinguer description, marque/signature observée, document de provenance et expertise tierce. Pour les matériels, distinguer accessoires inclus, pièces séparées et consommables. Ces informations ne constituent pas une authentification.

## 20. Cycle de vie, garde et mouvements

### 20.1 Acquisition et modes d'entrée

La fiche peut conserver le mode d'entrée déclaré : achat, don, héritage, fabrication, création, échange, prêt, dépôt, mise à disposition ou origine inconnue. La date peut être exacte, approximative ou inconnue. Une pièce peut être associée, mais son absence n'empêche pas nécessairement la création d'un brouillon. L'enregistrement ne confirme ni la transaction ni la propriété.

### 20.2 Détention, garde et utilisation

Distinguer le propriétaire déclaré, le détenteur ou possesseur déclaré, le gardien, l'emprunteur, le dépositaire, le locataire, l'utilisateur et le lieu de conservation. Ces qualités peuvent concerner des personnes différentes et changer dans le temps. La personne qui conserve physiquement un bien n'est pas automatiquement son propriétaire. La permission d'accès à la fiche reste indépendante de toutes ces relations.

Pour chaque période de garde ou d'utilisation, conserver la personne ou l'organisation, la nature de la relation, les dates connues, le lieu utile, la source et les documents associés. Une remise ou restitution peut être consignée comme événement.

### 20.3 Changements, incidents et fin de cycle

Événements possibles : déplacement, prêt, dépôt, restitution, réparation signalée, dommage, perte déclarée, suspicion de vol déclarée, récupération déclarée, vente ou cession déclarée, don, transmission, destruction ou retrait d'usage. Les situations sensibles restent attribuées à leur auteur : Heritis n'affirme pas qu'un vol a eu lieu et ne désigne pas de responsable.

Un événement conserve sa date d'effet déclarée, sa date de saisie, son auteur, sa source, les personnes concernées et les pièces disponibles. La situation courante est une synthèse des événements déclarés et doit rester corrigible.

### 20.4 Valeur et évolution

Distinguer valeur d'acquisition déclarée, valeur actuelle déclarée, estimation externe et montant figurant dans un document. Chaque valeur conserve devise, date, source, méthode et auteur lorsqu'ils sont disponibles. Une valeur ancienne ne doit pas être présentée comme actuelle. Heritis ne calcule pas une valeur de marché et ne fournit pas d'expertise.

## 21. Relations, documents et accès détaillés

### 21.1 Personnes et portée des relations

Un même bien peut avoir plusieurs personnes associées simultanément ou successivement : propriétaire déclaré, copropriétaire déclaré, détenteur/possesseur, bénéficiaire d'un droit déclaré, représentant, gardien, dépositaire, emprunteur, locataire, utilisateur ou personne concernée par une contestation. Pour chaque relation, préciser si elle concerne un objet individuel, un lot ou une collection. Ne pas propager automatiquement une relation de l'ensemble à chaque élément, ni inversement.

### 21.2 Documents et provenance

Les pièces peuvent inclure factures, reçus, contrats, certificats, cartes grises, inventaires, attestations, photographies, rapports d'expertise externes et correspondances. Conserver déposant, auteur/émetteur déclaré, date de dépôt, date du document, objet concerné, provenance, visibilité et historique de remplacement. Un rapport externe doit afficher son auteur et sa date ; Heritis ne reprend pas son expertise à son compte.

### 21.3 Partage, révocation et confidentialité

Le partage doit être limité à un destinataire et à un contenu explicitement sélectionné. La localisation précise, les numéros de série, les documents d'acquisition et les informations susceptibles d'accroître le risque de vol ou de fraude ne doivent pas être exposés dans les listes publiques, aperçus visiteurs ou notifications non protégées. Prévoir une confirmation avant partage et une révocation traçable. Un rôle déclaré sur le bien ne donne pas automatiquement accès à la fiche.

## 22. Parcours détaillés et cas limites

1. rechercher un bien existant avant toute création, y compris dans les autres sous-domaines ;
2. choisir entre objet individuel, lot ou collection et expliquer les conséquences de ce choix ;
3. enregistrer un brouillon avec des références inconnues ou illisibles ;
4. associer plusieurs personnes avec des rôles et périodes distincts ;
5. documenter un prêt ou une garde par un tiers sans modifier le propriétaire déclaré ;
6. enregistrer une suspicion de vol comme déclaration attribuée, sans la transformer en fait confirmé ;
7. corriger une référence ou une caractéristique en conservant l'ancienne valeur ;
8. scinder un lot en fiches enfants sans perdre la fiche d'ensemble ni sa composition historique ;
9. relier une fiche à une succession ou à un différend sans duplication ni élargissement d'accès ;
10. partager une pièce précise, puis révoquer l'accès ;
11. reprendre une modification hors connexion et résoudre un conflit de situation ou de personne sans écrasement silencieux.

## 23. Scénarios d'acceptation complémentaires

- Un véhicule peut être identifié par plusieurs références distinctes, chacune avec sa source.
- Un objet peut être conservé par une personne qui n'est pas le propriétaire déclaré.
- Un lot peut évoluer en plusieurs fiches liées, avec conservation de l'historique.
- Un élément agricole ou financier est orienté vers son sous-domaine de référence sans doublon.
- Une suspicion de vol demeure une déclaration attribuée et contestable.
- Une valeur d'expertise tierce n'est pas affichée comme une estimation Heritis.
- Les données sensibles ne sont visibles que par les personnes autorisées.
- Les changements de garde, de lieu, de situation et les corrections sont historisés.
- Les états de synchronisation et les conflits sont visibles et réconciliables.

Ces scénarios doivent être couverts par des tests lors de l'implémentation ; ils ne signifient pas que des tests techniques ont déjà été exécutés.

---

**Statut :** périmètre V1 validé par l'utilisateur ; spécification fonctionnelle revue et précisée sur GitHub.  
