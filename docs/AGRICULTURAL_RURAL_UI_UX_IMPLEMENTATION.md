# Biens agricoles et ruraux — suivi de l'implémentation UI/UX

> **Branche :** `feat/agricultural-premium-interface`
> **Référence fonctionnelle :** `docs/01-DOMAINES/AGRICULTURAL-AND-RURAL-ASSETS-FUNCTIONAL-SPEC-V1.md`
> **Statut :** parcours de déclaration, enrichissement et gestion progressive implémentés sur la branche — validation V1 complète encore conditionnée aux essais et aux contrôles listés ci-dessous.

## Objectif de cette tranche

Ouvrir un parcours authentifié pour les biens agricoles et ruraux sans présenter comme disponibles les fonctions qui ne sont pas encore construites. Le visiteur reste limité à la découverte publique ; toute consultation ou création de données réelles passe par la route protégée `/agricultural`.

## Éléments ajoutés

- Type de dossier `agricole`, ajouté par migration additive.
- Page dédiée `/agricultural`, protégée par `ProtectedRoute`.
- Liste des actifs agricoles et ruraux, recherche par désignation/localisation et filtre par famille.
- Déclaration progressive initiale avec les six familles prévues par la spécification : exploitation, plantation, élevage, équipement, infrastructure et autre actif rural.
- Champs structurés facultatifs par famille : activités et date de début pour une exploitation ; culture, variété, superficie/unité et période de plantation ; espèce, quantité et date d’inventaire pour un élevage ; nature, marque, modèle, identifiant et état déclaré pour un équipement ; nature, usage et état observé pour une infrastructure ; nature et caractéristiques pour les autres actifs.
- Les quantités et superficies sont conservées comme valeurs numériques déclarées ; les champs absents restent absents. Les champs ne constituent ni un inventaire confirmé ni une mesure certifiée.
- Assistant contextuel de déclaration : calcule la progression des informations recommandées selon la famille, identifie les champs encore vides et propose des raccourcis qui déplacent le focus vers le prochain champ à renseigner. Cette aide est déterministe et locale à l’interface ; elle ne prétend pas être une décision IA ni une validation juridique ou technique.
- Affichage de la famille et des précisions déclarées dans la fiche de dossier existante.
- Édition spécialisée accessible depuis la fiche : informations principales, famille, champs structurés et précisions. Les métadonnées agricoles sont envoyées via la file de synchronisation hors ligne existante, sans écrire directement dans une nouvelle table.
- Capture GPS facultative déclenchée explicitement par l'utilisateur lors de la déclaration. Le point conserve latitude, longitude, précision annoncée, horodatage et source GPS ; les coordonnées canoniques sont également renseignées sur le dossier pour les usages géographiques communs.
- Affichage du repère GPS et de ses limites. Un point GPS est un repère indicatif, pas une limite foncière, un bornage ou une mesure certifiée.
- Personnes associées sous forme de qualités patrimoniales déclarées (propriétaire, copropriétaire, détenteur/possesseur, bénéficiaire, représentant, exploitant, gestionnaire, occupant). Ces qualités sont séparées des rôles d'accès Heritis et ne confèrent aucun droit applicatif.
- Historique initial d'événements patrimoniaux déclarés, datés et attribués à la source déclarative ; l'ajout d'un événement n'efface pas les précédents.
- Liens vers les dossiers Terrain, Bâtiment et agricoles déjà accessibles par l'utilisateur. Les relations stockent des identifiants de dossier et un type de lien ; elles ne dupliquent pas les fiches liées.
- Actions contextuelles déterministes dans le détail : compléter les champs recommandés manquants, préciser la localisation et joindre une première pièce. Chaque action mène à un formulaire ou à une section réellement disponible ; aucune validation IA/juridique n'est revendiquée.
- Persistance via le dossier commun Heritis et son mécanisme de création en ligne / brouillon local / synchronisation existant.
- Libellés français et anglais.
- Tests de base de la liste, du filtre par famille, de la création et de la persistance des champs structurés, ainsi que de l’affichage de l’assistant contextuel.

## Modèle de données utilisé dans cette première tranche

Le dossier Heritis reste l'identité canonique et la frontière de sécurité. Les champs spécifiques à cette première déclaration sont conservés dans `dossiers.metadata.agriculturalRural` avec une version de payload, la famille, les précisions déclarées et la source déclarative.

Cette solution réutilise les contrôles d'accès du dossier et la file hors ligne existante. Elle ne doit pas être interprétée comme un modèle relationnel complet des actifs agricoles. Une évolution vers des tables dédiées ne sera proposée qu'après audit des relations communes et des contraintes de synchronisation.

## Limites explicites — non implémentées dans cette tranche

- historique détaillé et versionné des corrections (les événements de correction peuvent être déclarés, mais l'ancien contenu n'est pas encore conservé comme version restaurable) ;
- gestion avancée des relations entre actifs (édition du type de lien disponible, mais pas encore de workflow d'approbation ou de révocation) ;
- invitations et gestion des personnes associées comme profils Heritis : les personnes enregistrées ici sont des déclarations de nom et de qualité, pas des invitations ni des comptes ;
- rattachement des pièces à une personne ou à une relation précise avec provenance détaillée : la pièce jointe générique au dossier est disponible, mais le lien fin vers une relation reste à construire ;
- workflow complet de vérification documentaire interne (les déclarations et pièces restent distinctes, mais l'interface de vérification détaillée n'est pas encore dédiée au sous-domaine) ;
- préparation de transmission et liens vers les dossiers de succession/conflit ;
- contrôles d'accès spécifiques par section et tests RLS propres à de futures tables.

Ces éléments restent requis par la spécification fonctionnelle. Ils ne doivent pas être annoncés comme disponibles avant leur implémentation et leurs tests.

## Contrôles à effectuer avant validation

1. Migrations locales : reset complet, ordre des migrations et tests SQL.
2. Création en ligne et hors ligne, reprise après reconnexion et conservation du payload.
3. Accès propriétaire, participant accepté, participant en attente et tiers.
4. Tests de recherche, filtre, liste vide, erreur, chargement et navigation vers le détail.
5. Contrôle du mode clair/sombre, mobile étroit, tablette et desktop.
6. Clavier, focus, libellés, cibles tactiles et contraste.
7. Tests Vitest, lint, build et CI.
8. Vérification de la documentation et des limites avant fusion.

Aucune migration distante ni modification Lovable n'est prévue dans cette tranche.


## Deuxième tranche — enrichissement et actions contextuelles

### Fonctions ajoutées
- Modification des champs généraux et spécifiques des dossiers agricoles via la route commune d'édition.
- Sauvegarde des métadonnées agricoles via `enqueueUpdateDossierMetadata`, avec vérification du propriétaire avant mise en file et reprise par la synchronisation existante.
- Capture GPS uniquement sur demande explicite ; refus, indisponibilité et erreurs de géolocalisation sont présentés à l'utilisateur.
- Associations patrimoniales déclarées et événements datés stockés sous `metadata.agriculturalRural`. Les liens enregistrés peuvent être terminés sans supprimer leur trace ; les événements déjà enregistrés sont conservés et ne sont pas supprimables depuis le formulaire.
- Références croisées vers des dossiers existants, sans copie des données du dossier cible.
- Suggestions contextuelles calculées à partir des champs recommandés, de la localisation et du nombre de pièces jointes.

### Garde-fous
- Les personnes et événements sont explicitement étiquetés « déclarés » et « non vérifiés ».
- Une qualité patrimoniale déclarée ne donne pas de permission dans Heritis et ne prouve pas un droit.
- Un lien entre deux dossiers ne prouve pas une propriété, une dépendance juridique ou une autorisation d'usage.
- Les coordonnées GPS sont un repère indicatif ; elles ne sont ni un bornage ni un contour de parcelle.
- Les recommandations sont des règles déterministes et locales à l'interface, pas une expertise IA ou une validation juridique.
- Les pièces jointes utilisent le mécanisme de preuve existant ; aucun nouveau bucket public ou accès élargi n'est créé.

### Vérifications encore nécessaires
- Vérifier que la file de synchronisation conserve correctement les changements agricoles lors d'éditions concurrentes, notamment sur le même sous-objet `agriculturalRural`.
- Essais manuels de capture GPS autorisée, refusée, indisponible et précision faible.
- Essais manuels d'ajout/retrait de personnes, d'événements et de liens, en ligne et hors ligne.
- Vérifier les droits du propriétaire, d'un participant accepté et d'un tiers non autorisé.
- Confirmer les migrations locales et tests SQL de sécurité ; aucune migration distante n'est autorisée par cette tranche.


## Troisième tranche — présentation premium et conseils contextuels

### Améliorations d'interface
- Remplacement de la liste compacte par une grille de cartes de grande taille : une colonne sur mobile, deux colonnes sur grand écran.
- Chaque carte hiérarchise clairement le nom du bien, sa description, sa famille, sa localisation et son statut.
- Ajout d'une jauge des informations recommandées, calculée selon la famille de l'actif ; cette jauge mesure uniquement la complétude de la déclaration.
- Ajout d'une vue d'ensemble avec le nombre de biens déclarés et le nombre de fiches qui méritent un enrichissement.
- Ajout d'un conseil contextuel qui ouvre directement la première fiche à enrichir.
- Ajout des traductions françaises et anglaises et d'un test ciblé de l'action contextuelle.

### Limites et garde-fous
- La progression ne mesure ni la qualité juridique, ni l'authenticité des pièces, ni la réalité matérielle du bien.
- Le conseil ne choisit qu'une fiche selon les champs recommandés manquants ou l'absence de localisation ; il ne constitue pas une IA autonome.
- Les cartes réutilisent les données déjà disponibles et n'ajoutent aucun accès ni permission.
- Le contrôle responsive doit encore être confirmé par essais visuels sur téléphone, tablette et écran large, en modes clair et sombre.


## Quatrième tranche — fiche agricole premium

### Présentation de la fiche
- En-tête visuel dédié à l'actif : nom, famille, description et localisation.
- Bandeau synthétique : champs recommandés renseignés, personnes actives et événements déclarés.
- Indicateur de complétude calculé selon les champs recommandés de la famille.
- Grille adaptative pour les informations spécifiques, avec des cartes mieux espacées.
- Sections séparées pour la géolocalisation, les actifs liés, les personnes et les événements.
- Traductions FR/EN des indicateurs de synthèse.

### Intelligence contextuelle et limites
- La complétude reste un indicateur de saisie et ne constitue aucune validation juridique, foncière, agronomique ou matérielle.
- Les personnes et événements restent des déclarations ; les liens entre dossiers ne prouvent pas des droits.
- La position GPS reste indicative, avec sa précision et sa date de capture affichées.
- Les actions existantes restent soumises aux droits d'édition du dossier.
- Les essais visuels sur appareils réels et la validation CI sont requis avant intégration.
