# Biens agricoles et ruraux — spécification fonctionnelle V1

**Produit :** Heritis  
**Domaine :** 1 — Patrimoine et gestion des biens  
**Sous-domaine :** 3 — Biens agricoles et ruraux  
**Marché initial :** Cameroun  
**Statut :** spécification fonctionnelle V1 — proposition détaillée issue du périmètre validé  
**Branche documentaire :** `docs/agricultural-rural-functional-spec-v1`

## 1. Finalité

Ce sous-domaine permet à une personne ou à une famille de déclarer, identifier, documenter et suivre les actifs agricoles et ruraux auxquels elle indique être liée. Il constitue une partie du référentiel patrimonial commun de Heritis.

La V1 porte sur le patrimoine agricole et rural, et non sur la conduite quotidienne d'une exploitation. Elle aide à conserver une description intelligible des actifs, des personnes associées, des pièces disponibles, des événements patrimoniaux et des éléments utiles à une future transmission.

Une déclaration dans Heritis ne certifie ni la propriété, ni la titularité d'un droit, ni la validité d'une pièce, ni la conformité d'une activité agricole.

## 2. Périmètre fonctionnel V1

La catégorie « Biens agricoles et ruraux » peut regrouper les familles d'actifs suivantes, selon les informations effectivement disponibles :

1. **Exploitations et unités agricoles déclarées** : ensemble d'actifs présentés par le déclarant comme une exploitation ou une unité patrimoniale agricole. L'exploitation sert de fiche de regroupement ; elle ne remplace pas les fiches des actifs qui la composent.
2. **Plantations et cultures pérennes** : plantations, vergers et cultures pérennes déclarés, avec leur désignation, leur localisation, leur description et les informations patrimoniales utiles.
3. **Élevages et cheptels** : élevages et groupes d'animaux déclarés comme actifs patrimoniaux. La V1 permet une description et un inventaire sommaire, sans devenir un registre vétérinaire ou un outil de suivi zootechnique.
4. **Équipements et matériels agricoles** : machines, outils, matériels et équipements identifiables, qui peuvent être rattachés à une exploitation sans perdre leur identité propre lorsque leur suivi séparé est pertinent.
5. **Installations, infrastructures et ressources rurales** : installations de stockage, d'irrigation, bâtiments techniques, points d'eau, puits, forages, retenues d'eau et autres ressources ou infrastructures rurales déclarées. Leur nature, leur localisation et leurs relations éventuelles à un terrain ou à un bâtiment déjà référencé sont décrites sans présumer d'un droit sur l'eau, le sol ou l'installation.
6. **Autres actifs ruraux liés à une activité agricole** : ressources ou actifs particuliers qui ne trouvent pas leur place dans les familles précédentes. Leur nature doit être explicitement décrite pour éviter une catégorie fourre-tout.

Le choix de la famille classe l'actif dans Heritis ; il ne constitue pas une qualification administrative, foncière, agricole ou juridique.

## 3. Relations avec les autres fiches patrimoniales

Le sous-domaine réutilise le référentiel patrimonial commun. Il ne crée pas une copie d'un terrain, d'un bâtiment ou d'un équipement déjà enregistré.

- Une exploitation peut référencer un ou plusieurs terrains déjà enregistrés, sous réserve des permissions.
- Une plantation peut être reliée à une fiche Terrain ; la relation ne prouve pas que le déclarant possède le terrain.
- Une installation rurale peut référencer un bâtiment ou un terrain distinct.
- Un équipement peut disposer de sa propre fiche lorsqu'il est identifiable et suivi séparément, puis être associé à une exploitation.
- Un même actif peut être lié à plusieurs personnes et à plusieurs dossiers, avec des rôles déclarés distincts.

Les relations entre actifs décrivent l'organisation patrimoniale dans Heritis. Elles ne prouvent ni une dépendance juridique, ni une propriété commune, ni une autorisation d'exploitation.

## 4. Fiche d'un actif agricole ou rural

La fiche adapte ses rubriques à la famille choisie. Elle ne doit pas imposer les mêmes champs à une plantation, un cheptel, une machine et une infrastructure.

### 4.1 Informations d'identification

- identifiant interne permanent Heritis ;
- nom ou désignation de l'actif ;
- famille et nature de l'actif ;
- description libre et caractéristiques distinctives utiles ;
- localisation déclarée ou lieu de conservation, selon la nature de l'actif ;
- mode de localisation : adresse ou description, repère géographique, coordonnées ponctuelles ou référence à une fiche Terrain existante, selon les informations disponibles ;
- source, date et précision annoncée des coordonnées, lorsqu'elles existent ;
- exploitation ou unité de regroupement associée, si pertinente ;
- terrains, bâtiments ou équipements liés, s'ils existent déjà dans le référentiel ;
- déclarant, source des informations et dates de déclaration / mise à jour.

L'identifiant Heritis est une référence interne et ne remplace aucune référence officielle.

### 4.2 Informations descriptives adaptées

Exemples de rubriques facultatives selon la famille :

- plantation : nature déclarée, désignation, emplacement, description générale et informations de superficie si connues ;
- élevage : type d'élevage, description du cheptel ou du groupe, quantité déclarée si connue et date de référence de l'inventaire ;
- équipement : type, marque ou modèle si connus, identifiant visible éventuel, état déclaré et lieu de conservation ;
- infrastructure : nature, description, localisation et actif foncier ou immobilier auquel elle est associée ;
- exploitation : nom d'usage, description générale et liste de ses actifs liés.

Les quantités, superficies, états et caractéristiques restent des informations déclarées, datées et attribuées à leur source. Les champs non pertinents restent facultatifs ou absents.

### 4.3 Localisation et données géographiques

La localisation doit être adaptée à la nature de l'actif : une plantation ou une infrastructure fixe peut être rattachée à un Terrain existant ; un équipement peut être décrit par son lieu de conservation ; un cheptel peut être associé à un lieu d'élevage déclaré et daté, sans supposer qu'il y reste en permanence.

Lorsque des coordonnées sont utiles, elles peuvent être saisies manuellement, capturées par GPS après action explicite de l'utilisateur ou reprises d'une source identifiée. Conserver, si disponibles, la méthode, la date de capture, la précision annoncée et la source. Une position ponctuelle est un repère et ne constitue pas une limite foncière.

Lorsqu'un actif est situé sur un Terrain déjà enregistré, privilégier le lien vers cette fiche et réutiliser ses informations géographiques autorisées. Ne pas dupliquer son contour, ses sommets ou son identité. Si un actif occupe seulement une partie d'un terrain, cette emprise peut être décrite comme indicative et distincte du contour foncier ; elle ne vaut ni bornage ni reconnaissance d'un droit.

Les calculs de distance, de périmètre ou de superficie ne sont pas automatiquement requis pour chaque actif. Lorsqu'une mesure indicative est utile et disponible, conserver séparément sa valeur, son unité, sa méthode, sa source, sa date et ses limites. Une superficie déclarée, une superficie issue d'un document et une estimation géographique ne doivent jamais être fusionnées en une seule valeur.

## 5. Personnes, relations et droits déclarés

Une fiche peut associer plusieurs personnes, simultanément ou successivement. Les qualités possibles comprennent notamment :

- propriétaire déclaré ou copropriétaire déclaré ;
- détenteur ou possesseur déclaré ;
- exploitant ou gestionnaire déclaré ;
- bénéficiaire d'un droit déclaré ;
- représentant ;
- occupant ou autre personne ayant un lien pertinent, lorsque la situation le justifie.

La relation avec l'actif est distincte du rôle d'accès dans Heritis. Une personne qui gère une exploitation n'est pas automatiquement propriétaire ; une personne qui fournit un document n'est pas automatiquement titulaire d'un droit.

Chaque association conserve son auteur, sa source, ses dates déclarées, son statut de vérification éventuel et son historique. Lorsque cela est pertinent, la nature et la portée de la relation, les dates d'effet déclarées et les conditions de mise à disposition, de location ou d'usage sont précisées. Les conflits entre déclarations ne sont pas résolus automatiquement.

## 6. Documents et sécurisation patrimoniale

La fiche peut référencer et conserver, selon les permissions :

- pièces d'identification de l'actif ou de l'équipement ;
- documents d'acquisition, de cession, de donation, de location ou de mise à disposition, lorsqu'ils sont fournis ;
- documents administratifs ou professionnels pertinents ;
- factures, reçus, attestations et inventaires fournis ;
- photographies et descriptions datées ;
- documents relatifs à l'exploitation, à la gestion ou à la transmission ;
- correspondances et éléments utiles en cas de désaccord.

Pour chaque pièce, Heritis doit conserver autant que possible son auteur ou déposant, sa date de dépôt, son type déclaré, l'actif ou la relation concernés et son historique. Le dépôt ne vaut pas authentification ni validation juridique.

Les statuts « déclaré », « documenté » et « vérifié » doivent rester distincts. Une vérification interne doit indiquer ce qui a été examiné, par qui, quand et avec quel résultat ; elle ne doit jamais être présentée comme une décision officielle.

## 7. Gestion patrimoniale et événements

La V1 permet de consigner les événements qui changent la compréhension patrimoniale de l'actif, par exemple :

- acquisition ou entrée déclarée dans le patrimoine ;
- cession, vente, achat ou mise à disposition déclarée ;
- création, extension, remplacement ou cessation d'une plantation ou installation ;
- changement de détenteur, d'exploitant ou de gestionnaire déclaré ;
- inventaire ou mise à jour descriptive ;
- dommage, perte, dégradation ou indisponibilité signalée ;
- transmission ou préparation d'une transmission ;
- correction d'une information antérieure.

Un événement conserve sa date déclarée, sa date d'enregistrement, son auteur, sa description et les pièces associées. Les événements n'écrasent pas silencieusement les informations antérieures.

La fiche distingue également la situation déclarée de l'actif (par exemple : en activité, temporairement inutilisé, loué ou mis à disposition, cédé, perdu, détruit, dégradé ou activité/plantation cessée) de son statut documentaire. Ces états sont adaptés à la famille de l'actif, datés et attribués à leur source ; ils ne constituent pas une qualification juridique ou un contrôle technique.

La V1 ne met pas en place un suivi de production, de rendement, de dépenses, de ventes agricoles ou de planification des travaux.

## 8. Transmission et ayant droit

La fiche patrimoniale peut être référencée par un dossier de succession ou de transmission. Les personnes liées à l'actif peuvent être identifiées avec leurs qualités déclarées, sans préjuger de leur qualité juridique d'héritier ou de bénéficiaire.

La préparation à la transmission peut inclure :

- repérage des actifs agricoles et ruraux concernés ;
- identification des personnes à contacter ou à examiner ;
- regroupement des documents disponibles ;
- conservation des volontés ou indications fournies dans les espaces appropriés de Heritis ;
- historique des événements et des changements déclarés.

Heritis ne calcule pas les parts successorales, ne désigne pas automatiquement les héritiers et ne transfère pas les biens.

## 9. Désaccords, contestations et voisinage

Lorsqu'un désaccord concerne un actif agricole ou rural, la fiche peut être reliée à un dossier du domaine « Gestion des conflits et litiges ».

Peuvent être conservés dans ce dossier distinct :

- personnes et actifs concernés ;
- chronologie des faits rapportés ;
- déclarations séparées de chaque partie ;
- échanges, courriers, photographies et pièces communiquées ;
- démarches déjà entreprises et suites indiquées.

Les informations de chaque partie doivent rester attribuables à leur auteur. Une contestation ne modifie pas automatiquement la fiche patrimoniale de référence. Heritis facilite la documentation et l'orientation vers des personnes ou services compétents ; la plateforme n'arbitre pas le désaccord.

## 10. Parcours utilisateur V1

### 10.1 Découvrir et commencer

Depuis le domaine Patrimoine, l'utilisateur ouvre le sous-domaine « Biens agricoles et ruraux ». Un visiteur sans compte ne voit qu'une présentation et un aperçu des possibilités ; les actions sur des dossiers réels exigent une session et des permissions appropriées.

### 10.2 Déclarer un actif

1. Choisir « Déclarer un actif agricole ou rural ».
2. Choisir la famille de l'actif.
3. Saisir le nom ou la désignation et les informations essentielles.
4. Ajouter la localisation ou le lieu de conservation si pertinent.
5. Relier un terrain, un bâtiment, un équipement ou une exploitation déjà enregistré, si cela est utile et autorisé.
6. Ajouter les personnes et qualités déclarées, maintenant ou plus tard.
7. Joindre les pièces disponibles, maintenant ou plus tard.
8. Relire les informations, confirmer leur caractère déclaratif et enregistrer.

Le formulaire est progressif : seules les informations indispensables à l'identification initiale sont demandées au départ. Les détails facultatifs peuvent être complétés ensuite.

### 10.3 Consulter et gérer

L'utilisateur retrouve ses actifs dans une liste avec recherche et filtres simples par famille, situation déclarée et état documentaire, ces filtres restant distincts. L'ouverture affiche une fiche structurée : résumé, localisation et liens, personnes, documents, événements et transmission. Les sections non renseignées ne doivent pas donner l'impression que l'information a été vérifiée ou qu'elle n'existe pas.

### 10.4 Mettre à jour et conserver l'historique

Les modifications sont attribuées à leur auteur et datées. Les corrections importantes et événements patrimoniaux conservent l'information antérieure utile. Les accès aux pièces et aux données suivent les permissions de la fiche et du dossier associé.

## 11. Règles d'accès, confidentialité et fonctionnement

- Le propriétaire du dossier conserve les droits prévus par le modèle commun.
- Les participants ne voient que les informations permises par leur accès explicite.
- Les rôles patrimoniaux déclarés ne confèrent pas automatiquement une permission applicative.
- Les tiers non autorisés ne peuvent pas consulter les fiches ni les pièces privées.
- Les documents et données sensibles ne doivent pas être exposés par des liens publics.
- Les opérations hors connexion doivent être clairement signalées comme locales ou en attente de synchronisation.
- La synchronisation ne doit pas écraser silencieusement une modification concurrente ; les conflits doivent être signalés et conservés pour résolution.
- Les journaux d'activité et les notifications respectent les permissions et la minimisation des données.

Cette spécification ne décide pas du schéma SQL, des politiques RLS ou de la stratégie de stockage. Ces choix nécessitent un audit technique séparé avant toute implémentation.

## 12. UI/UX — règles de présentation

L'interface applique le système visuel global Heritis « Héritage premium » : vert forêt, ivoire et or patiné utilisé avec parcimonie, avec prise en charge du mode clair et du mode sombre.

Principes :

- une page d'entrée claire avec une description courte du sous-domaine et une action principale ;
- des cartes de grande taille pour les grandes familles uniquement, une ou deux par rangée sur mobile ;
- des listes et sections sobres pour les données détaillées, plutôt qu'une multiplication de cartes ;
- un formulaire progressif qui adapte les champs à la famille choisie ;
- des libellés compréhensibles et des unités explicites ;
- distinction visuelle nette entre information déclarée, pièce déposée, vérification interne et décision externe ;
- états visibles de chargement, vide, erreur, brouillon local, synchronisation en attente et conflit ;
- confirmations pour les actions sensibles, sans suppression silencieuse de l'historique ;
- navigation mobile-first, cibles tactiles confortables, focus clavier visible, libellés accessibles et contraste WCAG AA visé.

Aucune conformité d'accessibilité ou de fonctionnement sur appareil ne doit être affirmée sans tests correspondants.

## 13. Exclusions explicites de la V1

Ne sont pas inclus dans ce sous-domaine V1 :

- comptabilité agricole, caisse, paie et gestion financière de l'exploitation ;
- suivi quotidien des travaux, calendriers agricoles et planification des équipes ;
- calculs de rendement, prévisions de récolte et optimisation agronomique ;
- gestion détaillée des intrants, stocks, traitements ou achats ;
- suivi vétérinaire, sanitaire, reproduction ou traçabilité alimentaire ;
- vente de récoltes, place de marché, facturation ou gestion commerciale ;
- télémétrie, capteurs, automatisation d'irrigation ou cartographie agronomique avancée ;
- expertise, estimation de valeur ou diagnostic technique ;
- certification automatique de propriété, de conformité ou de droits ;
- arbitrage des conflits ou remplacement des autorités et professionnels compétents.

Ces sujets pourront être réévalués dans une version ultérieure, par décision explicite.

## 14. Critères d'acceptation fonctionnels

La V1 sera considérée comme fonctionnellement couverte lorsque :

1. Un utilisateur autorisé peut déclarer un actif de chacune des familles retenues avec les seuls champs pertinents.
2. Chaque actif possède une référence Heritis stable et peut être retrouvé dans sa liste.
3. Un actif peut être relié à un terrain, bâtiment ou équipement existant sans dupliquer la fiche liée ni ses données géographiques de référence.
4. La localisation peut être descriptive ou géographique ; les coordonnées conservent leur source, leur méthode et leur date lorsqu'elles sont disponibles.
5. Plusieurs personnes peuvent être associées avec des qualités et relations déclarées distinctes.
6. Les rôles patrimoniaux déclarés restent séparés des permissions applicatives.
7. Les documents peuvent être rattachés à l'actif ou à une relation, avec provenance et accès contrôlé.
8. Les événements patrimoniaux, situations déclarées et corrections conservent leur auteur et leur historique, sans les confondre avec le statut documentaire.
9. Les fiches peuvent être référencées dans les parcours de transmission et de conflit sans dupliquer l'actif.
10. Les visiteurs n'accèdent qu'à l'aperçu public ; les données privées restent protégées.
11. Les états hors ligne, de synchronisation et de conflit sont compréhensibles et testables.
12. Les états UI essentiels, la navigation clavier et les contrastes sont vérifiés avant validation.
13. Les fonctions exclues de la V1 ne sont pas présentées comme disponibles.

## 15. Dépendances et ordre de réalisation proposé

1. Audit de l'architecture patrimoniale existante et des fiches Terrain / Bâtiment.
2. Validation du modèle fonctionnel et des liens entre actifs avant tout schéma technique.
3. Déclaration progressive et liste des actifs agricoles et ruraux.
4. Fiche détail, édition et historique.
5. Personnes, relations déclarées et permissions.
6. Documents, références et événements patrimoniaux.
7. Liens vers succession et conflits.
8. Tests de sécurité, synchronisation, accessibilité et parcours mobile.

Chaque étape devra être auditée et documentée avant d'étendre le périmètre. Aucune migration ou modification Supabase ne découle automatiquement de ce document.

## 16. Limites de la spécification

Cette spécification décrit un périmètre fonctionnel V1. Elle n'est ni un avis juridique ou agronomique, ni un schéma de données, ni une API, ni une autorisation d'implémentation. Les informations déclarées par les utilisateurs doivent rester distinguées des faits établis par une autorité compétente.

## 17. Compléments détaillés par famille d'actifs

### 17.1 Exploitation ou unité agricole de regroupement

Une exploitation sert à organiser plusieurs actifs et ne remplace pas leurs fiches individuelles. Elle peut comporter une désignation usuelle, une description, une localisation générale, une période d'activité déclarée, un exploitant ou gestionnaire déclaré, ainsi que des liens vers les terrains, plantations, cheptels, équipements et installations concernés.

La fiche de regroupement doit distinguer les actifs présents, les actifs temporairement associés et les actifs dont le lien a pris fin. Elle ne doit pas agréger automatiquement les surfaces, valeurs, quantités ou droits des fiches liées. Une relation à l'exploitation ne vaut pas relation de propriété à chacun de ses composants.

### 17.2 Plantations et cultures pérennes

Selon les informations disponibles, une plantation peut être décrite par : type de culture ou d'essence, variété déclarée, date ou période de mise en place, localisation ou terrain associé, emprise indicative, nombre de plants ou densité déclarée, âge approximatif, état général observé, source et date de l'observation. Les superficies et quantités doivent toujours préciser leur méthode et leur date de référence.

La V1 peut documenter les événements patrimoniaux de création, extension, remplacement, dégradation importante, perte, abandon ou cessation d'une plantation. Elle ne calcule pas les rendements, ne planifie pas les travaux agricoles et ne fournit pas de conseil agronomique.

### 17.3 Élevages et cheptels

Un élevage ou cheptel peut être décrit par l'espèce ou le type d'animaux, le groupe ou lot concerné, une quantité déclarée, une date d'inventaire, une localisation ou un lieu d'élevage déclaré, le détenteur ou exploitant déclaré et les documents d'inventaire disponibles. La V1 privilégie le suivi patrimonial d'un groupe ou lot ; elle ne doit pas se présenter comme un registre vétérinaire individuel ou une traçabilité sanitaire.

Les entrées, sorties, naissances, ventes, dons, pertes, décès ou changements de détenteur peuvent être consignés comme événements déclarés, avec quantité concernée, date, auteur et pièce éventuelle. Le nombre courant affiché, s'il est calculé, doit être explicitement présenté comme le résultat arithmétique des mouvements saisis, et non comme un inventaire physique confirmé.

### 17.4 Équipements agricoles et matériels

Les équipements peuvent être décrits par leur nature, marque, modèle, référence ou numéro de série visible, année ou période, état matériel déclaré, lieu de conservation, accessoires et documents disponibles. Lorsqu'un équipement est déjà enregistré dans le sous-domaine des biens mobiliers, la fiche existante doit être réutilisée ; la fiche d'exploitation peut uniquement créer un lien de regroupement.

Les événements possibles incluent acquisition déclarée, affectation à une exploitation, déplacement, prêt, mise à disposition, changement de détenteur, panne ou dommage signalé, cession et retrait d'usage. La maintenance technique détaillée reste hors V1.

### 17.5 Infrastructures et ressources rurales

Les infrastructures peuvent inclure bâtiments d'exploitation, hangars, clôtures, installations d'irrigation, bassins, puits, forages, réservoirs, voies ou autres aménagements ruraux. Leur description peut préciser la nature, la fonction déclarée, le lieu, le terrain ou bâtiment associé, l'état observé, la période de réalisation si connue et les documents disponibles.

Pour les ressources ou installations partagées, consigner séparément les personnes qui déclarent les utiliser, les gérer ou bénéficier d'un droit, la portée et la période de cette relation. La fiche ne conclut pas à l'existence d'une servitude, d'un droit d'eau ou d'un droit foncier juridiquement établi.

## 18. Cycle de vie, relations et traçabilité approfondis

### 18.1 États distincts

Ne pas confondre : état matériel observé, situation d'utilisation, statut documentaire, statut de synchronisation et éventuelle contestation. Un actif peut être en bon état mais insuffisamment documenté, ou être documenté tout en faisant l'objet d'un désaccord. Chaque état doit avoir son propre libellé et sa source.

### 18.2 Relations et portée

Une personne peut être propriétaire déclarée, copropriétaire déclarée, détenteur/possesseur déclaré, exploitant, gestionnaire, représentant, occupant ou bénéficiaire d'un droit déclaré. La relation doit préciser si elle porte sur une exploitation, une plantation, un lot de cheptel, un équipement ou une infrastructure. Les rôles ne sont pas hérités automatiquement entre une exploitation et ses actifs liés.

Les liens entre fiches doivent être typés : composant de, regroupé dans, situé sur, installé dans, utilisé par, conservé dans, remplace ou est issu de. Chaque lien conserve sa source, sa période et son auteur lorsque ces informations sont disponibles. Une relation de regroupement ne fusionne pas les identités.

### 18.3 Documents, contrôles et corrections

Une pièce doit être rattachée à l'actif ou à l'événement qu'elle concerne. Conserver son type déclaré, son intitulé, son émetteur ou auteur indiqué, son déposant, ses dates, sa provenance, les personnes autorisées, les contrôles internes et l'historique de remplacement. Les références administratives ou professionnelles sont retranscrites fidèlement ; aucun format ni statut juridique ne doit être inventé.

Une correction conserve la valeur antérieure, la nouvelle valeur, l'auteur, la date, le motif et la source. Une contestation peut porter sur l'existence d'un actif, sa localisation, sa quantité, son détenteur ou son rattachement. Les versions contradictoires restent attribuées à leurs auteurs et ne sont pas arbitrées par Heritis.

## 19. Parcours détaillés et actions V1

### 19.1 Recherche, classement et prévention des doublons

Avant création, rechercher une fiche existante par désignation, famille, identifiant Heritis, localisation ou référence non sensible. Présenter les correspondances possibles sans fusion automatique. Si l'actif relève déjà de Terrain, Bâtiments ou Biens mobiliers, proposer de le relier plutôt que de créer une copie. Une exploitation peut regrouper plusieurs fiches, mais ne devient pas leur identité commune.

### 19.2 Création et complétion progressive

Le parcours commence par la famille, la désignation et les informations minimales d'identification. Les champs spécifiques apparaissent ensuite selon la famille. L'utilisateur peut enregistrer un brouillon lorsque certaines informations sont inconnues, puis compléter les personnes, la localisation, les documents et les événements. Les valeurs inconnues ne sont pas remplacées par des valeurs par défaut trompeuses.

### 19.3 Mise à jour, mouvements et archivage

Une mise à jour descriptive ne crée pas nécessairement un nouvel actif. En revanche, un actif réellement distinct reçoit sa propre fiche et un lien de filiation ou de regroupement. Les mouvements d'animaux, changements de détenteur, déplacements d'équipement, transformations de plantation et changements d'usage d'une infrastructure sont consignés comme événements datés. L'archivage conserve l'historique et les liens.

### 19.4 Partage et révocation

Le partage porte sur une fiche, une section ou des documents sélectionnés. Il exige un destinataire et une permission explicites, un récapitulatif avant confirmation et une trace de l'opération. Les coordonnées précises, documents privés et informations sur les personnes ne sont pas inclus dans les aperçus publics ou les notifications non protégées. L'accès peut être révoqué selon les règles transversales.

### 19.5 Hors connexion et conflits

Un brouillon local doit indiquer son état de synchronisation. Les modifications concurrentes sur la localisation, la quantité d'un cheptel, les personnes, les pièces ou les liens entre actifs ne sont pas écrasées silencieusement. La résolution conserve les valeurs antérieures et identifie la personne ayant effectué chaque changement.

## 20. Scénarios d'acceptation complémentaires

1. créer une exploitation et y relier des fiches Terrain, Bâtiment, Plantation et Équipement existantes sans dupliquer ces actifs ;
2. distinguer une plantation d'une parcelle et conserver les sources différentes de leur localisation et superficie ;
3. enregistrer un inventaire de cheptel daté puis plusieurs mouvements, sans présenter le calcul comme un comptage confirmé ;
4. relier un équipement agricole déjà enregistré comme bien mobilier sans créer de deuxième fiche ;
5. documenter un puits ou une installation partagée sans déduire un droit d'eau ou une servitude ;
6. associer plusieurs personnes à des actifs différents d'une même exploitation, sans propagation automatique des rôles ;
7. remplacer un document tout en conservant sa version antérieure et sa provenance ;
8. enregistrer une contestation de quantité ou de localisation sans modifier automatiquement la fiche de référence ;
9. partager une seule fiche ou pièce avec un participant autorisé, puis révoquer cet accès ;
10. synchroniser un mouvement saisi hors connexion sans perdre les événements concurrents.

Ces scénarios sont des critères à tester ultérieurement ; ils ne constituent pas des résultats de tests déjà exécutés.

---

**Statut :** périmètre V1 approuvé par l'utilisateur ; spécification détaillée mise à jour après revue de cohérence, à valider avant clôture du sous-domaine.  
**Périmètre technique :** documentation uniquement ; aucune modification du code applicatif, de Supabase distant ou de Lovable.
