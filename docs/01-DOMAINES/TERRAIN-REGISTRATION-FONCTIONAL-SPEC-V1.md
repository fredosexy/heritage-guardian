# Fiche Terrain — spécification fonctionnelle et géospatiale V1

**Produit :** Heritis  
**Domaine :** Patrimoine et gestion des biens  
**Catégorie :** Terrains et biens fonciers  
**Pays de lancement :** Cameroun  
**Statut :** spécification de travail à implémenter et à valider  
**Branche :** feat/terrain-registration-geospatial

## 1. Objectif

La fiche Terrain permet d'identifier un terrain déclaré, de décrire sa situation, de documenter son origine et les personnes qui déclarent un lien avec lui, de situer le terrain sur une carte et, lorsque des points de contour sont disponibles, d'estimer des distances, un périmètre et une superficie.

La fiche est un enregistrement patrimonial Heritis. Elle ne constitue ni un titre foncier, ni un bornage, ni un plan cadastral, ni un levé topographique certifié. Les mesures issues d'un téléphone, d'une carte ou de coordonnées saisies sont des estimations documentaires dont la méthode, la source et la précision doivent être visibles.

## 2. Parcours d'enregistrement

1. **Identifier le terrain** : nom usuel, désignation, catégorie et sous-catégorie, description, usage actuel, statut d'occupation déclaré.
2. **Localiser** : pays, région, département, arrondissement/commune, localité/quartier/village, repères, adresse ou indications d'accès.
3. **Positionner** : saisir latitude/longitude, utiliser la position GPS de l'appareil après action explicite, ou placer un point sur une carte lorsque le fond cartographique est disponible.
4. **Délimiter** : enregistrer les sommets du contour dans leur ordre, par GPS, sélection cartographique ou saisie manuelle de coordonnées. Chaque sommet conserve sa source et, si disponible, sa précision.
5. **Mesurer** : calculer les distances entre sommets, le périmètre et la superficie estimée lorsque le contour est exploitable.
6. **Décrire les caractéristiques** : superficie déclarée, dimensions connues, forme, relief ou particularités utiles, accès, voisinage et limites connues.
7. **Documenter** : joindre titres et références, actes, reçus, plans, croquis, attestations, photographies des lieux et bornes, correspondances et autres pièces utiles.
8. **Associer les personnes** : propriétaire déclaré, copropriétaire déclaré, détenteur/possesseur, occupant, bénéficiaire d'un droit ou représentant. Les personnes, leurs rôles, les droits déclarés et les preuves restent distincts.
9. **Relire et enregistrer** : afficher les données saisies, les sources, les valeurs calculées et leurs limites avant sauvegarde.
10. **Compléter ultérieurement** : modifier la fiche, ajouter des points ou pièces, corriger les informations et conserver la traçabilité.

La saisie doit pouvoir être progressive. Une fiche peut être enregistrée sans coordonnées, sans contour ou sans document ; ces absences sont signalées comme informations à compléter et ne bloquent pas une déclaration initiale.

## 3. Données d'identification du terrain

Champs communs :
- identifiant Heritis permanent ;
- nom ou désignation du terrain ;
- description libre ;
- catégorie : terrain urbain, terrain rural, parcelle/lot, terrain familial, terrain agricole, terrain nu/non bâti, terrain occupé, terrain faisant l'objet d'une revendication déclarée, autre ;
- usage déclaré : habitation, agricole, commercial, industriel, mixte, réserve/foncier non aménagé, autre, inconnu ;
- situation déclarée : libre, occupé par le déclarant, occupé par un tiers, loué, exploité, contesté, inconnue, autre ;
- dates de déclaration et de mise à jour ;
- déclarant et source des informations.

Références externes facultatives :
- numéro/référence de titre foncier ;
- référence cadastrale ou parcellaire ;
- numéro de lot ou de bloc ;
- référence d'un plan, procès-verbal ou dossier administratif ;
- autorité/service émetteur, date et lieu d'émission ;
- observations sur la référence.

Une référence saisie reste une référence déclarée tant qu'elle n'a pas été examinée dans un processus traçable.

## 4. Localisation géographique

### 4.1 Localisation descriptive
Enregistrer séparément les niveaux administratifs disponibles : pays, région, département, arrondissement/commune, localité, quartier ou village, lieu-dit, adresse et indications d'accès. Ne pas rendre obligatoires les niveaux qui ne sont pas connus ou pertinents.

Conserver le texte fourni par l'utilisateur. Les propositions issues d'un service de géocodage sont des suggestions et doivent être confirmées avant remplacement d'une valeur.

### 4.2 Position ponctuelle
Une position de repère peut être enregistrée avec :
- latitude en degrés décimaux ;
- longitude en degrés décimaux ;
- altitude si fournie par l'appareil, avec source et précision ;
- méthode : GPS appareil, point choisi sur carte, coordonnées saisies, géocodage confirmé, import ;
- date de capture ;
- précision horizontale annoncée par l'appareil, en mètres, si disponible ;
- source et commentaire.

Validation : latitude entre -90 et 90, longitude entre -180 et 180. Une coordonnée absente n'est pas remplacée par zéro. La position ponctuelle sert de repère ; elle ne représente pas le contour ni le centre certifié de la parcelle.

### 4.3 Méthodes de localisation
- **GPS de l'appareil** : déclenché uniquement par une action explicite ; demander l'autorisation du navigateur ; afficher la précision annoncée, l'heure et l'échec éventuel. Ne pas suivre l'utilisateur en continu.
- **Carte interactive** : sélectionner un repère ou ajouter des sommets si le fond cartographique est disponible. Le fond de carte peut être indisponible hors ligne ; la saisie manuelle doit rester possible.
- **Coordonnées manuelles** : saisir latitude et longitude en degrés décimaux, avec indication du format et validation.
- **Recherche d'un lieu** : si un service de géocodage est intégré ultérieurement, afficher le fournisseur et demander confirmation. Ne pas envoyer une adresse ou des coordonnées à un tiers sans information et base de traitement appropriées.
- **Import de données géographiques** : GeoJSON/KML/GPX pourra être ajouté après validation d'un format, d'une limite de taille et d'une stratégie de contrôle. Ne pas annoncer l'import comme disponible tant qu'il n'est pas implémenté et testé.

## 4.4 Moteur cartographique et fournisseur initial

MapLibre GL JS est le moteur d’affichage et d’interaction ; il ne fournit pas lui-même les données cartographiques. Le fournisseur de tuiles et son style restent configurables via `VITE_TERRAIN_MAP_STYLE_URL`.

Le fond initial est OpenFreeMap Liberty (`https://tiles.openfreemap.org/styles/liberty`) :
- usage commercial autorisé selon les conditions publiées par OpenFreeMap ;
- aucune clé API ni compte requis pour l’instance publique ;
- attribution affichée par le contrôle MapLibre et le style ;
- données cartographiques issues d’OpenStreetMap/OpenMapTiles ;
- service fourni sans garantie SLA : Heritis doit pouvoir remplacer le style ou utiliser une instance auto-hébergée.

Les requêtes de tuiles nécessitent une connexion. Le code de MapLibre peut être mis en cache par l’application après un premier chargement, mais cela ne signifie pas que les cartes sont disponibles hors ligne. OpenFreeMap autorise des téléchargements hors ligne limités à 3 000 tuiles ou 50 Mo par téléchargement, avec au plus quatre requêtes parallèles et un User-Agent identifiant l’application. Heritis ne met pas encore en œuvre cette fonction de téléchargement ; ne pas précharger ni mettre en cache les tuiles du fournisseur par un mécanisme générique.

La carte peut transmettre au fournisseur les requêtes de tuiles correspondant à la zone affichée. La position GPS exacte, les sommets et les informations du dossier ne sont pas envoyés intentionnellement comme données de dossier par le composant cartographique ; ils sont dessinés localement dans le navigateur. La politique de confidentialité doit expliquer les requêtes de carte et le fournisseur utilisé.
## 5. Délimitation du terrain

Le contour est une liste ordonnée de sommets géographiques. Chaque sommet peut contenir :
- numéro d'ordre ;
- latitude et longitude ;
- méthode/source de capture ;
- précision horizontale si disponible ;
- date de capture ;
- note descriptive (borne, angle, repère, point approximatif).

Règles :
- au moins trois sommets distincts sont nécessaires pour calculer une surface ;
- le système ferme le polygone pour le calcul, sans dupliquer inutilement le premier point dans la saisie ;
- les points sont conservés dans l'ordre de parcours ;
- les coordonnées invalides, les sommets consécutifs identiques et les contours manifestement dégénérés doivent être signalés ;
- l'utilisateur peut ajouter, déplacer, supprimer ou réordonner un sommet, avec confirmation pour suppression ;
- les limites contestées, inconnues ou approximatives doivent pouvoir être décrites sans forcer un contour ;
- plusieurs contours (parcelle multipartie, trous, exclusions) ne sont pas considérés comme pris en charge tant qu'un modèle et des tests spécifiques ne sont pas ajoutés.

Un contour GPS ou dessiné sur une carte est une représentation indicative. Il ne remplace pas le bornage ou le plan établi par un professionnel compétent.

## 6. Distances, périmètre et superficie

### 6.1 Distances
Calculer la distance horizontale approximative entre deux coordonnées valides avec une formule géodésique adaptée (Haversine sur sphère moyenne ou méthode ellipsoïdale). Afficher les résultats en mètres et kilomètres selon l'échelle, avec un arrondi explicite.

Pour un contour ordonné, le périmètre estimé est la somme des distances entre chaque sommet et le suivant, y compris le dernier vers le premier.

### 6.2 Superficie
La superficie estimée est calculée à partir du polygone fermé sur la surface terrestre, avec une méthode géodésique documentée. Si une projection plane est utilisée pour une zone locale, le système doit sélectionner une projection adaptée à la zone et éviter d'appliquer une projection métrique inappropriée aux coordonnées longitude/latitude brutes.

Conversions :
- 1 hectare = 10 000 m² ;
- 1 km² = 1 000 000 m² ;
- 1 are = 100 m².

Présenter au minimum la superficie estimée en m² et en hectares. La conversion d'une superficie déclarée saisie par l'utilisateur est distincte de la superficie calculée à partir du contour.

### 6.3 Comparaison des mesures
Lorsque les deux valeurs existent, afficher séparément :
- superficie déclarée par l'utilisateur ou reprise d'un document ;
- superficie estimée à partir du contour ;
- écart absolu et écart relatif, sans conclure automatiquement à une anomalie juridique ;
- unité d'origine, méthode, date et source de chaque valeur.

Ne pas remplacer automatiquement la superficie déclarée par la valeur calculée. Un écart peut provenir d'un contour approximatif, de la précision GPS, d'une méthode différente ou d'une pièce ancienne.

### 6.4 Précision et avertissements
- Ne pas afficher une précision supérieure à celle des données d'entrée.
- Afficher « estimation » ou « mesure indicative » à côté des résultats.
- Si la précision GPS est faible ou inconnue, le signaler.
- Ne pas calculer de surface avec moins de trois sommets valides.
- Ne pas interpréter une mesure comme une confirmation de limites ou de propriété.
- Les mesures professionnelles ou officielles doivent être enregistrées comme des valeurs documentées distinctes, avec auteur, date, méthode et pièce associée.

## 7. Dimensions et caractéristiques complémentaires

Prévoir des champs structurés, lorsqu'ils sont connus :
- superficie déclarée et unité (m², ha, are, km²) ;
- longueurs de côtés connues, avec unité ;
- largeur/longueur déclarées ;
- forme et relief ;
- pente ou dénivelé uniquement si mesuré et sourcé ;
- nature du sol, végétation et occupation ;
- accès routier ou piéton, servitudes ou passages déclarés ;
- voisinage et limites décrites par côté (Nord, Sud, Est, Ouest), sans présumer d'une orientation officielle ;
- bornes ou repères visibles, état et photographie ;
- eau, électricité, drainage et autres équipements, si pertinents.

Les dimensions libres historiques déjà enregistrées dans les sections de texte doivent être conservées et affichées jusqu'à migration explicite et testée.

## 8. Documents, photos et pièces

Types utiles :
- titre foncier ou référence de titre ;
- certificat, acte ou attestation ;
- contrat, reçu ou preuve de transaction déclarée ;
- plan, extrait cadastral, plan de bornage ou croquis ;
- procès-verbal, document administratif ou correspondance ;
- photographie générale du terrain ;
- photographie de chaque borne ou repère ;
- photographie d'accès, voisinage ou occupation ;
- document de mesure ou rapport professionnel.

Chaque pièce doit pouvoir être rattachée au terrain et, si utile, à une section, un sommet, une limite, une relation déclarée ou un événement. Conserver auteur du dépôt, date, type, provenance et état de vérification. Un document déposé n'est pas automatiquement authentifié.

## 9. Personnes, relations et droits déclarés

La fiche doit permettre plusieurs personnes et plusieurs relations simultanées ou successives :
- propriétaire déclaré ;
- copropriétaire déclaré ;
- détenteur/possesseur ;
- occupant ;
- bénéficiaire d'un droit ou d'un usage ;
- représentant.

Pour chaque relation : personne, qualité déclarée, nature et portée du droit/intérêt, auteur de la déclaration, dates d'effet déclarées, date d'enregistrement, source, pièces, statut de vérification, observations et historique.

Ne pas utiliser le participant d'un dossier comme équivalent automatique d'un titulaire de droit sur le terrain. Les rôles d'accès au dossier restent distincts des relations patrimoniales.

## 10. Vérifications, statuts et traçabilité

Statuts de fiche :
- **déclaré** : information fournie par un utilisateur ;
- **documenté** : une ou plusieurs pièces sont présentes ;
- **vérifié** : un contrôle interne défini et tracé a été réalisé, en précisant strictement son objet et ses limites.

Un contrôle de coordonnées, une photo de borne, un plan déposé ou une checklist complétée ne constitue pas une vérification de propriété. Toute vérification doit enregistrer l'objet contrôlé, les éléments examinés, l'auteur, la date, la méthode, le résultat, les réserves et la référence de la pièce ou du service compétent.

Conserver l'historique des modifications de localisation, coordonnées, contour, mesures, superficie déclarée, personnes, relations et documents. Distinguer date d'un événement déclarée et date d'enregistrement.

## 11. Fonctionnement mobile et hors connexion

- La saisie textuelle, les coordonnées manuelles et les points déjà capturés doivent pouvoir être conservés localement.
- Les données de géolocalisation obtenues doivent être sauvegardées immédiatement dans le brouillon local après confirmation de l'utilisateur.
- Les pièces jointes restent soumises aux mécanismes existants de file d'attente et de synchronisation.
- La carte et le géocodage en ligne peuvent ne pas fonctionner hors connexion ; afficher un état explicite et ne pas bloquer la saisie.
- Les modifications synchronisées doivent fusionner les sections et données géographiques sans écraser des changements distants ; les conflits doivent être signalés.
- Les permissions du navigateur, l'absence de GPS, l'expiration ou la faible précision ne doivent pas empêcher de sauvegarder les autres informations.

## 12. Confidentialité et sécurité

La localisation précise d'un bien est une donnée sensible. Elle ne doit pas être rendue publique par défaut. L'accès aux coordonnées, contours, documents et relations suit les permissions du dossier/bien. Toute fonction de partage doit respecter le principe du moindre privilège.

Ne pas lancer de géolocalisation sans action claire et consentement du navigateur. Ne pas activer le suivi continu. Ne pas transmettre automatiquement les coordonnées à un fournisseur de carte ou de géocodage. Les clés de fournisseur, si nécessaires, ne doivent jamais être exposées dans le code client.

## 13. Interface et actions attendues

La fiche est organisée en sections progressives, lisibles sur mobile :
1. Identification ;
2. Localisation et carte ;
3. Limites et mesures ;
4. Caractéristiques ;
5. Personnes et relations ;
6. Documents et photos ;
7. Vérifications et historique.

Actions explicites :
- enregistrer un brouillon ;
- modifier les informations ;
- obtenir ma position (à la demande) ;
- saisir ou corriger les coordonnées ;
- placer/déplacer un repère sur la carte ;
- ajouter un sommet GPS ou manuel ;
- modifier l'ordre ou supprimer un sommet ;
- calculer/actualiser les mesures ;
- joindre une pièce ou une photo ;
- comparer les superficies ;
- consulter l'historique ;
- synchroniser lorsque disponible.

Une action principale doit rester clairement identifiable. Les valeurs calculées ne doivent jamais se faire passer pour des champs déclaratifs.

## 14. Découpage d'implémentation et critères d'acceptation

### Étape A — socle sûr
- Définir des types explicites pour localisation, sommets, mesures et provenance.
- Préserver les neuf sections Terrain historiques et leur sauvegarde incrémentale.
- Ajouter des fonctions géodésiques pures et testées : validation de coordonnées, distance, périmètre, surface, conversions.
- Ajouter la saisie manuelle de position et de sommets, puis la capture GPS déclenchée par l'utilisateur.
- Stocker les données géographiques dans un espace versionné de metadata sans écraser les champs historiques.
- Mettre à jour les types offline et vérifier la fusion/synchronisation.

### Étape B — carte et enrichissement
- Intégrer un composant cartographique après choix et vérification du fournisseur, des licences, de la confidentialité, des conditions hors ligne et de la disponibilité des tuiles.
- Ajouter le positionnement cartographique, le dessin/édition du contour et l'affichage des mesures.
- Ajouter recherche de lieu/géocodage uniquement après sélection du fournisseur et politique de confidentialité.
- Ajouter import GeoJSON/KML/GPX après spécification et tests.

### Critères d'acceptation
- Une fiche peut être créée sans GPS ni carte.
- Une position GPS n'est obtenue qu'après action explicite et son niveau de précision est visible.
- Les coordonnées invalides sont refusées avec un message compréhensible.
- Deux points valides donnent une distance reproductible ; un polygone de trois points valides donne périmètre et surface.
- Les conversions d'unités sont exactes.
- Les surfaces déclarées et calculées restent séparées.
- Les données historiques Terrain restent lisibles et modifiables.
- Les données de localisation et de contour sont préservées hors ligne et synchronisées sans écrasement silencieux.
- Les accès restent protégés par les règles existantes et la localisation n'est pas publique par défaut.
- Les tests unitaires, lint, build, migrations locales et tests de sécurité applicables passent.
- Les essais GPS/carte sur appareils réels sont consignés séparément des tests automatisés.

## 15. Limites explicites

La V1 n'effectue pas de certification de propriété, de bornage officiel, de levé topographique certifié, de validation cadastrale, de détection juridique automatique des chevauchements, ni de résolution des conflits de limites. Les calculs sont des outils d'estimation et de documentation. Les imports géographiques, le géocodage et les cartes hors ligne ne sont pas considérés comme disponibles avant implémentation et validation spécifiques.
