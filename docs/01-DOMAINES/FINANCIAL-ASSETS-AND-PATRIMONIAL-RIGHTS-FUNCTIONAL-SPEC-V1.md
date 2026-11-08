# Spécification fonctionnelle — Biens financiers et droits patrimoniaux V1

**Produit :** Heritis  
**Domaine :** Patrimoine et gestion des biens  
**Sous-domaine :** Biens financiers et droits patrimoniaux  
**Version :** V1 — Cameroun  
**Statut :** proposition fonctionnelle rédigée après validation du périmètre par l'utilisateur

## 1. Finalité

Ce sous-domaine permet à une personne ou à une famille de déclarer, identifier, documenter, sécuriser et suivre les actifs financiers et droits patrimoniaux auxquels elle indique être liée.

Heritis constitue un référentiel déclaratif et documentaire. Il organise les informations, les personnes associées, les relations et droits déclarés, les pièces, les événements et l'historique. Il ne fournit pas de service bancaire ou d'investissement, ne détient pas les actifs et ne confirme pas leur existence, leur solde, leur disponibilité, leur valeur ou leur titularité.

## 2. Principes directeurs

1. Toute information financière est attribuable à une source et, lorsque possible, datée.
2. Un actif, une personne, une relation déclarée, un document et un dossier sont des objets distincts.
3. Les rôles déclarés ne constituent pas automatiquement des droits juridiquement établis.
4. Une valeur déclarée reste distincte d'une estimation tierce et d'une valeur confirmée par un organisme compétent.
5. Les données financières sont confidentielles par défaut et accessibles selon des permissions explicites.
6. Heritis ne collecte jamais les secrets d'authentification permettant d'accéder à un compte ou à un service financier.
7. Les fiches sont réutilisées entre les domaines sans duplication injustifiée.

## 3. Catégories couvertes par la V1

### 3.1 Comptes et produits d'épargne déclarés
Comptes bancaires, comptes d'épargne, dépôts à terme et autres produits de dépôt déclarés. Les informations peuvent inclure l'établissement, le type de compte, une désignation partiellement masquée, la devise et les références documentaires disponibles.

### 3.2 Placements et titres
Actions, obligations, titres, parts de fonds et autres placements déclarés. La fiche peut décrire l'émetteur, l'intermédiaire ou le dépositaire, la nature du placement, la quantité déclarée et les documents associés.

### 3.3 Participations et parts
Parts sociales, participations dans une entreprise ou une structure, intérêts déclarés dans une société ou une organisation. Les informations peuvent inclure la structure concernée, la nature de la participation, la quantité ou proportion déclarée si connue, la date et la source.

### 3.4 Créances et sommes dues
Créances déclarées, prêts accordés, sommes dues à une personne, remboursements attendus et obligations financières documentées. La fiche distingue le créancier déclaré, le débiteur déclaré, le montant initial, les montants remboursés déclarés, le solde calculé à partir des seules données saisies et les justificatifs.

### 3.5 Droits patrimoniaux et contractuels
Droits économiques ou patrimoniaux issus d'un contrat, d'un accord ou d'une situation documentée, lorsque leur description et leur suivi relèvent du référentiel patrimonial. Leur enregistrement ne vaut pas qualification juridique du droit.

### 3.6 Autres actifs financiers
Autres actifs financiers déclarés qui ne relèvent pas clairement des catégories précédentes. Leur nature doit être précisée pour éviter une catégorie fourre-tout.

## 4. Hors périmètre et règles de non-duplication

La V1 ne couvre pas :
- la connexion directe aux banques, établissements de paiement, courtiers ou plateformes d'investissement ;
- les opérations, virements, paiements, retraits, ordres de bourse ou transferts ;
- la gestion active de portefeuille, les recommandations ou conseils d'investissement ;
- la comptabilité, la fiscalité avancée ou le calcul automatique de rendement ;
- l'évaluation financière automatique ou l'expertise ;
- la conservation de mots de passe, codes PIN, CVV, codes à usage unique, clés privées, phrases de récupération ou identifiants secrets ;
- la conservation ou la gestion de fonds par Heritis ;
- les produits d'assurance gérés comme contrats opérationnels, sauf référence documentaire utile à un actif ou dossier, sans gestion intégrée ;
- les cryptoactifs et clés privées dans un portefeuille connecté.

Les biens matériels, véhicules, terrains, bâtiments et actifs agricoles restent dans leurs sous-domaines respectifs. Une créance ou un droit financier associé à un bien peut être relié à sa fiche sans dupliquer l'identité du bien. Les droits immatériels spécialisés non financiers nécessitant un référentiel propre pourront être traités ultérieurement.

## 5. Identité et fiche patrimoniale

Chaque actif ou droit enregistré reçoit une référence interne Heritis unique et stable. Cette référence :
- identifie la fiche dans Heritis ;
- ne constitue pas une référence bancaire, boursière, fiscale ou officielle ;
- reste stable pendant les corrections et changements d'information ;
- ne doit pas être réutilisée pour un autre actif ;
- permet de relier l'actif à des dossiers et à d'autres fiches sans dupliquer son identité.

La fiche comprend, selon la catégorie et les données disponibles :
- identifiant Heritis ;
- désignation et catégorie ;
- description et caractéristiques ;
- établissement, émetteur, débiteur ou structure concernée, si applicable ;
- référence externe non secrète, éventuellement partiellement masquée ;
- devise et informations de montant pertinentes ;
- déclarant, source et date de déclaration ;
- personnes associées et relations déclarées ;
- documents et provenance ;
- statut documentaire et vérifications effectuées ;
- événements, échéances et historique ;
- liens vers d'autres biens ou dossiers.

Les champs sont adaptés à la catégorie. Un compte ne doit pas recevoir des champs de créance sans pertinence, et une participation ne doit pas être décrite comme un compte bancaire.

## 6. Montants, devises et valeurs

Heritis distingue explicitement :
1. le montant déclaré par un utilisateur ;
2. le montant figurant dans une pièce fournie ;
3. le montant communiqué ou confirmé par un tiers identifié ;
4. une estimation externe, avec son auteur, sa date et sa méthode lorsqu'elles sont connues ;
5. un montant calculé par Heritis à partir d'informations saisies.

Tout montant doit être accompagné, lorsque pertinent, de sa devise, de sa date de référence, de sa source et de son statut. Un montant ancien ne doit pas être présenté comme une valeur actuelle. Une conversion monétaire éventuelle doit conserver le montant et la devise d'origine, la devise cible, le taux, la date et la source du taux ; aucune conversion indicative ne doit être présentée comme une valeur officielle.

Pour une créance, un solde arithmétique peut être présenté comme un calcul basé sur les montants saisis, avec son détail et ses limites. Il ne confirme pas que le débiteur reconnaît la dette ou que les paiements déclarés ont été reçus.

## 7. Personnes, titulaires et relations déclarées

Un actif peut être associé à plusieurs personnes et à plusieurs relations simultanées ou successives. Selon la catégorie, la V1 peut notamment enregistrer :
- titulaire déclaré ou cotitulaire déclaré ;
- associé ou participant déclaré ;
- créancier déclaré et débiteur déclaré ;
- bénéficiaire déclaré ;
- mandataire ou représentant déclaré ;
- gestionnaire ou personne chargée du suivi ;
- personne disposant d'un intérêt ou droit patrimonial déclaré.

Pour chaque relation, conserver la personne, la qualité déclarée, la portée, l'auteur de la déclaration, la date, la source, les pièces, le statut de vérification et l'historique. Les pourcentages ou parts ne sont enregistrés que comme informations déclarées ou documentées, sans calculer automatiquement une titularité légale.

Les relations entre personnes et actifs sont distinctes des permissions d'accès à l'application. Une personne déclarée comme titulaire n'obtient pas automatiquement un accès au dossier ; inversement, un participant autorisé à consulter un dossier n'est pas automatiquement titulaire d'un droit financier.

## 8. Documents et provenance

Les documents possibles comprennent, selon la catégorie : relevés, attestations, contrats, conventions, certificats, actes, registres de parts, reconnaissances de dette, échéanciers, reçus, correspondances et autres pièces pertinentes.

Pour chaque document, conserver autant que possible :
- son auteur ou fournisseur ;
- la date de dépôt et la date du document ;
- l'actif et la relation auxquels il se rapporte ;
- sa nature et sa provenance déclarée ;
- les personnes autorisées à le consulter ;
- les contrôles réalisés, leur portée et leur résultat ;
- les versions, remplacements ou corrections.

Le dépôt d'une pièce ne prouve pas automatiquement son authenticité, son actualité, sa validité ou sa portée juridique. Les documents contenant des numéros de compte ou autres références sensibles doivent être masqués ou minimisés lorsque leur identification complète n'est pas nécessaire.

## 9. Confidentialité et sécurité renforcées

Les données financières sont privées par défaut. La conception V1 doit appliquer :
- accès au moindre privilège et permissions explicites par dossier, actif et document ;
- authentification et réauthentification adaptées aux opérations sensibles, selon les capacités transversales disponibles ;
- partage limité à un destinataire, un contenu et une durée ou finalité déterminés lorsque cela est possible ;
- révocation des accès et journalisation des partages ;
- masquage des références sensibles dans les listes, notifications et aperçus ;
- absence de données financières confidentielles dans les notifications non protégées ;
- journalisation des consultations et modifications sensibles selon les règles de confidentialité ;
- chiffrement en transit et au repos selon les garanties de l'architecture technique à auditer ;
- prévention de l'exposition des données dans les journaux techniques, erreurs, exports ou outils analytiques ;
- collecte minimale : aucun secret bancaire ou secret d'accès ne doit être demandé.

La présente spécification définit des exigences fonctionnelles et ne prétend pas certifier la sécurité technique. Les contrôles devront être vérifiés lors de l'audit d'architecture et des tests dédiés avant toute mise en production.

## 10. Statuts et vérifications

Les statuts doivent indiquer précisément ce qui a été fait :
- **Déclaré :** information saisie par un utilisateur.
- **Documenté :** une ou plusieurs pièces sont rattachées.
- **Examiné en interne :** un contrôle identifié a été effectué par une personne autorisée, avec une portée limitée et traçable.
- **Information confirmée par un tiers :** une source tierce identifiée a communiqué ou confirmé une information, avec date et référence disponibles.
- **Contesté :** une ou plusieurs personnes contestent l'information ; leurs positions restent distinctes.

Aucun statut ne doit laisser entendre que Heritis garantit l'existence d'un actif, l'exactitude d'un solde, la propriété, la solvabilité d'un débiteur ou l'opposabilité d'un droit. Les décisions et confirmations officielles restent du ressort des organismes et professionnels compétents.

## 11. Événements, échéances et historique

La fiche peut conserver :
- ouverture, clôture ou changement déclaré d'un compte ou produit ;
- acquisition, cession ou changement déclaré d'un placement ;
- entrée, sortie ou changement de participation ;
- création, modification, remboursement partiel ou total déclaré d'une créance ;
- paiement, échéance ou retard déclaré ;
- changement d'établissement, d'émetteur, de débiteur ou de représentant ;
- dépôt, remplacement ou correction d'un document ;
- contestation, vérification ou information reçue d'un tiers ;
- événement de transmission ou rattachement à une succession.

Distinguer la date de l'événement, la date de saisie, l'auteur, la source et les pièces associées. Une échéance ou un rappel est une aide de suivi et ne déclenche aucune opération financière.

## 12. Corrections et contestations

Les utilisateurs autorisés peuvent demander ou effectuer des corrections selon les permissions. Chaque correction doit conserver l'auteur, la date, le motif ou la source lorsque disponible et la trace antérieure nécessaire.

Les désaccords sur un solde, une créance, une participation ou une titularité doivent pouvoir être enregistrés séparément, avec attribution de chaque position à son auteur et rattachement des pièces correspondantes. Heritis ne tranche pas la contestation et ne transforme pas automatiquement une position en vérité établie.

## 13. Transmission et liens entre domaines

Une fiche peut être référencée dans un dossier de succession, de volontés ou de conflit. Les domaines réutilisent la même référence patrimoniale et appliquent leurs propres permissions.

La préparation d'une transmission peut documenter les informations, les personnes concernées, les pièces et les événements connus. Elle ne réalise aucun transfert, paiement, changement de bénéficiaire auprès d'un établissement, partage automatique ou mutation juridique.

La désignation d'un bénéficiaire dans Heritis ne crée pas automatiquement un droit financier ou successoral. Les procédures des établissements, contrats et autorités compétentes restent nécessaires.

## 14. Parcours fonctionnels V1

### 14.1 Déclarer un actif
Choisir une catégorie, renseigner les informations essentielles, identifier la source et la date, associer les personnes et enregistrer la déclaration avec son statut.

### 14.2 Compléter et documenter
Ajouter des pièces, préciser les montants et devises, renseigner les références non secrètes et compléter les relations déclarées.

### 14.3 Consulter et suivre
Afficher une synthèse adaptée à la catégorie, les montants avec leurs dates et sources, les documents accessibles, les événements et les échéances.

### 14.4 Partager de façon contrôlée
Sélectionner les informations et documents à partager, vérifier le destinataire et la permission, confirmer le partage et permettre sa révocation.

### 14.5 Corriger ou contester
Enregistrer une correction ou une position contradictoire sans effacer les informations historiques et sans arbitrage automatique.

### 14.6 Préparer une transmission
Référencer l'actif dans le dossier concerné et organiser les informations utiles, sans exécuter le transfert.

## 15. Interface et expérience utilisateur

L'interface applique le système global « Héritage premium » : vert forêt, ivoire et or patiné avec sobriété, modes clair et sombre, hiérarchie lisible et composants cohérents.

Principes :
- présentation synthétique des actifs, sans afficher les données sensibles dans les listes ;
- cartes ou lignes adaptées à la catégorie, avec désignation, type, statut documentaire et dernière mise à jour ;
- détail structuré en sections : résumé, personnes et relations, montants, documents, événements, accès et historique ;
- formulaires progressifs qui ne demandent que les champs pertinents ;
- masquage par défaut des références sensibles et affichage contrôlé ;
- états vides, erreurs, chargement, hors connexion et synchronisation explicites ;
- accessibilité, navigation clavier, contraste et cibles tactiles conformes aux standards retenus pour l'application.

Aucune interface ne doit suggérer que Heritis détient, contrôle ou garantit l'actif.

## 16. Fonctionnement hors connexion et synchronisation

Les brouillons et informations autorisées peuvent être préparés hors connexion selon les règles transversales. La synchronisation doit préserver l'auteur, la date, la provenance et l'historique.

Les conflits de modification sur des montants, titulaires déclarés, pièces ou permissions ne doivent pas être résolus par écrasement silencieux. Une réconciliation explicite est nécessaire. Les données financières mises en cache sur un appareil doivent respecter les règles de protection et d'effacement prévues par l'architecture.

## 17. Critères d'acceptation V1

La spécification sera considérée correctement traduite dans les futurs travaux lorsque :
1. Les catégories couvertes sont sélectionnables et les catégories hors périmètre sont exclues ou explicitement reportées.
2. Chaque actif possède une référence interne stable et une catégorie identifiable.
3. Les champs et formulaires sont adaptés à chaque type d'actif.
4. Les montants affichent leur devise, leur date et leur provenance lorsqu'elles sont disponibles.
5. Les montants déclarés, issus de documents, communiqués par un tiers et calculés restent distincts.
6. Plusieurs personnes et relations déclarées peuvent être associées à un actif.
7. Les rôles déclarés ne donnent pas automatiquement accès aux données.
8. Les documents conservent leur provenance et leurs contrôles sans être réputés authentifiés par défaut.
9. Les références sensibles sont masquées dans les vues non détaillées et les notifications.
10. Aucun secret d'authentification financière n'est demandé ou stocké.
11. Les accès et partages sont explicites, traçables et révocables.
12. Les événements, corrections et contestations préservent l'historique.
13. Les liens avec succession, volontés et conflits réutilisent la même fiche patrimoniale.
14. Aucun transfert ou ordre financier n'est exécuté par Heritis.
15. Les comportements hors connexion et les conflits de synchronisation respectent les exigences de confidentialité et de traçabilité.
16. Les tests de sécurité, permissions et confidentialité sont réalisés avant toute mise en production.

## 18. Ordre de réalisation ultérieur

Après validation documentaire et audit de l'existant :
1. auditer le modèle patrimonial commun, les permissions, les documents et la traçabilité ;
2. définir le modèle de données spécifique sans dupliquer les entités transversales ;
3. concevoir les parcours de déclaration et de consultation ;
4. implémenter les protections et les tests d'accès avant l'exposition des données ;
5. ajouter le suivi des événements, corrections et contestations ;
6. vérifier les liens avec les autres domaines et les scénarios hors connexion ;
7. réaliser les tests fonctionnels, de sécurité, d'accessibilité et de synchronisation.

## 19. Limites de cette spécification

Ce document décrit le périmètre fonctionnel V1. Il ne constitue ni un schéma de base de données, ni une API, ni une décision de migration, ni une validation juridique ou financière. Toute implémentation devra être précédée d'un audit de l'architecture existante et d'une validation des exigences de sécurité.

---

**Statut :** périmètre fonctionnel V1 validé par l'utilisateur le 8 novembre 2026 ; revue documentaire effectuée et lien vérifié dans l'index.  
**Portée de cette livraison :** documentation uniquement ; aucun code applicatif, aucune migration, aucun changement Supabase distant et aucun changement Lovable.
