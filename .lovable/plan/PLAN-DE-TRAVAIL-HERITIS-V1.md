# Plan de travail Heritis V1 — Référentiel Lovable

Version 1.0 — Plan de méthode et d'ordonnancement

## 1. Statut et portée

Ce plan fixe une méthode de progression. Il ne prétend pas décrire l'état actuel de chaque fonctionnalité. **L'état réel de chaque lot reste à auditer.**

Aucun lot ne peut commencer sa réalisation avant les portes 0 à 2 de [PORTES-ACCEPTATION.md](PORTES-ACCEPTATION.md). Les portes 3 à 6 encadrent la réalisation, la validation et la clôture.

## 2. Périmètre produit de référence

Vision générale : six domaines métier.

Périmètre V1 validé :
1. Patrimoine et gestion des biens.
2. Héritage et succession.
3. Volontés secrètes et dernières volontés.
4. Gestion des conflits et litiges.

Les deux autres domaines de la vision générale restent à définir. Ils ne constituent pas des lots V1 tant que leur périmètre n'a pas fait l'objet d'une décision formelle. Ne pas leur attribuer de nom ou de fonctionnalité.

Les services transversaux (identité, profils, documents, preuves, notifications, assistant, synchronisation, sécurité, etc.) ne doivent pas être transformés en domaines métier autonomes sans décision produit.

## 3. Ordre de progression

### Lot 0 — Prise en compte du référentiel et état initial
- Lire les règles du dépôt et les documents de ce dossier.
- Vérifier la branche, le commit, les PR et les workflows.
- Produire le rapport de prise en compte.
- Établir un inventaire des parcours et composants concernés.
- Classer les éléments CONFIRMÉ, EXISTANT, PARTIEL, À SPÉCIFIER, PROPOSITION, INCONNU ou BLOQUÉ.

**Sortie attendue :** rapport d'audit de référence. Aucun changement applicatif.

### Lot 1 — Cartographie des domaines, parcours et accès
- Vérifier les spécifications présentes pour les quatre domaines V1.
- Cartographier les parcours, pages, sous-pages, actions, états et dépendances réellement existants.
- Vérifier les différences visiteur, personne reconnue et utilisateur authentifié.
- Identifier les capacités transversales réellement partagées.
- Relever les écarts entre spécifications, interface, logique backend et documentation.

**Sortie attendue :** cartographie factuelle et registre des écarts. Ne pas combler les zones inconnues par invention.

### Lot 2 — Socle commun et intégrité des données
- Auditer les modèles de personnes, profils, biens, dossiers, relations, documents, preuves et événements.
- Vérifier les sources de vérité, provenance, historique, statuts et niveaux de preuve.
- Auditer migrations, contraintes, index, RLS, stockage et fonctions backend.
- Examiner synchronisation, fonctionnement hors ligne, reprise et résolution des conflits.
- Proposer uniquement les corrections nécessaires, avec stratégie de compatibilité.

**Sortie attendue :** diagnostic des données et de la sécurité, puis décisions validées avant toute migration.

### Lot 3 — Identité, accueil et conversation
- Vérifier l'accueil visiteur et le parcours guidé réellement présent.
- Préserver la règle : un prénom OU un nom suffit pour l'état « personne reconnue ».
- Ne pas confondre reconnaissance, inscription, authentification, vérification et permission.
- Sans compte, maintenir un aperçu guidé ; la conversation complète requiert une session valide.
- Vérifier les transitions, consentements, erreurs et reprises sans redirection injustifiée.

**Sortie attendue :** parcours vérifié, spécification des écarts et corrections ciblées validées.

### Lot 4 — Patrimoine et gestion des biens
- Auditer les parcours de création, consultation, mise à jour et archivage des biens.
- Vérifier les personnes associées, rôles déclarés, documents, preuves, événements et historique.
- Vérifier les états incomplets, les autorisations et les scénarios multi-personnes.
- Ne jamais présenter une déclaration ou une coordonnée GPS comme preuve juridique ou bornage.

**Sortie attendue :** domaine audité, corrections validées, tests et documentation intégrés.

### Lot 5 — Héritage et succession
- Auditer les parcours et règles réellement spécifiés.
- Vérifier les personnes, relations, événements, documents, preuves, accès et historiques.
- Distinguer déclarations, pièces fournies, faits vérifiés et décisions officielles.
- Identifier les décisions métier ou juridiques manquantes et les bloquer au lieu de les inventer.

**Sortie attendue :** domaine audité, règles clarifiées et validation des évolutions proposées.

### Lot 6 — Volontés secrètes et dernières volontés
- Auditer les parcours, niveaux de confidentialité, accès, consentements et mécanismes de restitution réellement définis.
- Examiner les risques de divulgation, accès non autorisé, perte, indisponibilité et mauvaise interprétation.
- Définir les confirmations renforcées et conditions de partage uniquement après validation.
- Ne pas inventer de mécanisme légal, de garantie de conservation ou de déclenchement automatique.

**Sortie attendue :** spécification de sécurité et parcours validés avant toute réalisation.

### Lot 7 — Gestion des conflits et litiges
- Auditer les parcours de déclaration, pièces, parties, échanges, statuts et historique existants.
- Préserver neutralité, traçabilité, confidentialité et distinction entre allégations et faits établis.
- Ne pas produire de décision juridique automatique ni attribuer une responsabilité sans procédure compétente.
- Vérifier les permissions des parties et les risques de divulgation.

**Sortie attendue :** domaine audité, limites explicites et évolutions validées.

### Lot 8 — Assistant et capacités intelligentes transversales
- Auditer les fonctions IA existantes, leurs sources de contexte, accès et journaux.
- Vérifier les permissions appliquées au contexte transmis.
- Définir les limites, sources, coûts, erreurs, incertitudes et approbations humaines.
- Distinguer suggestion, préremplissage, action demandée et action réellement exécutée.
- Tester les refus d'accès et les tentatives d'injection ou de détournement pertinentes.

**Sortie attendue :** inventaire des capacités IA et matrice de contrôle/validation.

### Lot 9 — Expérience, accessibilité et performance
- Auditer la cohérence globale avec le design system validé.
- Vérifier mobile, responsive, lisibilité, accessibilité, états vides et erreurs.
- Mesurer les performances réelles avant toute optimisation.
- Évaluer les usages réseau limité, appareils modestes et navigation hors ligne lorsque concernés.
- Ne pas imposer de refonte ou de budget chiffré sans mesure de référence.

**Sortie attendue :** audit mesuré, priorisation justifiée et corrections approuvées.

### Lot 10 — Validation transversale et stabilisation V1
- Vérifier les interactions entre domaines et services transversaux.
- Exécuter les tests de régression, sécurité, migrations locales, Edge, synchronisation et parcours.
- Vérifier les droits propriétaire, participant autorisé, utilisateur non accepté et tiers selon les cas.
- Examiner les erreurs persistantes, opérations en attente, conflits et reprise après rechargement.
- Vérifier documentation, CI, dépendances et procédures de reprise.

**Sortie attendue :** rapport de stabilisation V1 avec preuves, réserves et décisions restantes.

## 4. Registre de suivi obligatoire

Pour chaque tâche, conserver les champs suivants :

| Champ | Contenu attendu |
|---|---|
| ID | Identifiant stable de la tâche |
| Lot / domaine | Lot concerné |
| Objectif | Résultat utilisateur attendu |
| Statut | Un des statuts définis dans la conduite opérationnelle |
| État observé | Description factuelle de l'existant |
| Preuve | Fichier, symbole, test, PR, commit ou essai |
| Dépendances | Prérequis et tâches liées |
| Risque | Sécurité, données, UX, compatibilité, exploitation |
| Décision | Décision attendue ou obtenue, auteur et référence |
| Critères | Conditions observables d'acceptation |
| Tests | Tests requis, exécutés, résultat et commit |
| Documentation | Fichier mis à jour et référence PR |
| Suite | Prochaine action autorisée |

Ne pas préremplir les statuts d'implémentation sans audit.

## 5. Règles d'ordonnancement

- Le Lot 0 est obligatoire avant toute réalisation.
- Le Lot 1 établit les faits et dépendances avant les évolutions par domaine.
- Les lots 2 et 3 constituent des prérequis aux parcours qui dépendent des données et de l'identité ; leurs dépendances exactes doivent être confirmées par audit.
- Les lots métier 4 à 7 sont traités séparément, avec validation et documentation de chaque domaine avant le suivant.
- Les lots transversaux 8 à 10 s'appuient sur les règles communes et les domaines audités ; ils ne justifient pas de réécrire ce qui fonctionne.
- L'ordre peut être ajusté uniquement sur preuve d'une dépendance ou d'un risque, avec décision documentée.
- Un lot bloqué n'autorise pas à contourner sa dépendance.

## 6. Critère de clôture d'un lot

Un lot est clos uniquement lorsque :
1. son périmètre réel est défini ;
2. l'audit et les décisions sont traçables ;
3. les critères d'acceptation sont satisfaits ;
4. les tests applicables sont exécutés et réussis ;
5. les essais manuels requis sont réalisés ;
6. les limites et risques restants sont documentés ;
7. la PR et les contrôles CI sont vérifiés ;
8. la documentation est intégrée et vérifiée sur GitHub ;
9. la validation requise est obtenue.

La clôture d'un lot ne vaut pas validation automatique de la V1 entière.

## 7. Interdiction de transformer les idées historiques en exigences

Le plan historique en 13 parties contient des idées et hypothèses qui ne sont pas toutes validées. Elles ne deviennent pas des exigences par leur simple présence dans le fichier. Chaque idée doit être :
- confirmée par l'état actuel et une décision produit ;
- reformulée en proposition à valider ;
- ou écartée avec justification.

En particulier, ne pas appliquer automatiquement un déplacement massif de l'arborescence, une navigation visiteur sans limite, une collecte systématique de localisation, un rattachement automatique de données, des scores de protection, une détection de risques fonciers, une conservation ou une immutabilité prétendument garanties.

## 8. Rapport périodique

À chaque point de contrôle, fournir :
- lots examinés et statuts factuels ;
- tâches terminées avec preuves ;
- travaux en cours et leur branche/PR ;
- blocages et décisions attendues ;
- résultats CI exacts ;
- risques et impacts ;
- documentation intégrée ;
- prochaine étape autorisée.

Ne jamais annoncer une progression en pourcentage si la méthode de mesure n'a pas été définie et validée.
