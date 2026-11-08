# Modèle de données — Bâtiments et immobilier V1

Statut : première tranche technique et UI en cours sur une branche dédiée, non fusionnée et non déployée.

## Principes

- Les données immobilières sont séparées des dossiers Terrain existants.
- Un bâtiment est porté par un dossier Heritis de type `batiment`.
- Un bâtiment peut être relié à zéro ou un dossier Terrain connu en V1.
- Les unités (appartement, boutique, bureau, local ou autre) restent rattachées à leur bâtiment ; leur indépendance juridique n'est jamais présumée.
- Les rôles de personnes sont des relations déclarées, indépendantes des permissions de l'application.
- Les informations déclarées, les pièces associées et les décisions officielles restent distinctes.
- Heritis organise les déclarations et éléments de suivi ; il ne certifie pas la propriété et ne tranche pas les différends.

## Tables ajoutées

| Table | Responsabilité |
|---|---|
| `building_properties` | Nature du bien, localité, adresse descriptive, surface déclarée, unité, références administratives et métadonnées |
| `building_units` | Unités suivies séparément et rattachées à un bâtiment |
| `building_person_relations` | Personnes concernées, rôle déclaré, statut déclaratif et lien facultatif vers une unité |
| `building_events` | Chronologie de gestion, occupation, vente, achat, location, transmission et différends ; déclarations des parties attribuées |

Les documents et preuves continuent d'utiliser le système existant `proofs` et le stockage privé, rattachés au dossier parent.

## Sécurité

- RLS activée sur les quatre nouvelles tables.
- Le propriétaire du dossier peut lire et gérer les données.
- Un participant dont l'accès est accepté peut lire ; il ne peut pas créer, modifier ou supprimer ces données.
- Un tiers non associé n'obtient aucune ligne.
- Des triggers vérifient le type du dossier bâtiment, le type et le propriétaire du Terrain parent, ainsi que l'appartenance d'une unité au même bâtiment.
- Les fonctions de trigger restent SECURITY INVOKER ; aucun nouveau chemin SECURITY DEFINER n'est ajouté.
- Les changements de type d'un dossier déjà utilisé comme bâtiment ou Terrain parent sont refusés.

## Hors ligne et synchronisation

Le brouillon conserve les informations bâtiment dans ses métadonnées locales existantes. Lors de la reprise réseau, le dossier distant est créé en premier, son identifiant est persisté localement avant la création de la fiche bâtiment, puis la fiche est enregistrée de manière idempotente. Une reprise après échec ne doit donc pas créer un deuxième dossier.

Aucune nouvelle version Dexie n'est requise à ce stade : la structure de brouillon existante accepte déjà le type et les métadonnées génériques. Le formulaire progressif de déclaration est présent sur la branche ; le détail peut relire les métadonnées locales si la lecture distante échoue. Cette chaîne reste à confirmer par les tests d'intégration hors ligne avant fusion et déploiement.

## Migrations

1. `20261108000100_add_batiment_dossier_type.sql` ajoute le type enum dans une migration distincte, afin que sa valeur soit validée avant son utilisation par les tables suivantes.
2. `20261108000200_building_real_estate_v1.sql` crée les tables, index, contraintes, triggers et politiques RLS.

Ces migrations sont seulement versionnées sur cette branche. Elles n'ont pas été appliquées à un projet Supabase distant.

## UI/UX déjà présente sur la branche

- Sous-domaine Bâtiments présenté depuis le parcours Patrimoine, sans créer un cinquième domaine public.
- Formulaire progressif de déclaration en deux étapes, avec localisation et surface facultatives.
- Fiche de détail affichant les informations principales et utilisant les métadonnées du dossier comme repli hors ligne.
- L'écran de liste dédié, l'édition, les unités, les personnes, les documents, les événements et le suivi des différends restent à réaliser.

## Interface de liste des biens — première tranche

La branche ajoute une page dédiée `/buildings`, accessible depuis le sous-domaine Bâtiments du domaine Patrimoine.

- La page réutilise la liste des dossiers déjà filtrée par les permissions RLS ; elle ne crée pas une seconde source de données.
- Seuls les dossiers de type `batiment` sont affichés.
- Recherche sur le nom du bien et la localité.
- Filtres par état existant du dossier : tous, incomplets, sécurisés/avancés et à surveiller. Ces filtres décrivent l'état du dossier Heritis, pas la validité juridique du bien.
- Chaque ligne présente le nom, la localité lorsqu'elle est renseignée, l'état du dossier et l'état local le cas échéant.
- L'ouverture d'un dossier distant conduit à sa fiche ; un brouillon local non synchronisé n'est pas présenté comme une fiche distante.
- Les états de chargement, d'erreur avec relance, de liste vide et de recherche sans résultat sont distingués.
- Le parcours Patrimoine donne deux actions distinctes : consulter les biens déclarés ou en déclarer un nouveau. Les visiteurs sont orientés vers l'accès au compte.

La page n'ajoute ni filtre juridique, ni classement de propriété, ni indicateur de certification.

## Vérifications requises avant fusion et déploiement

- Exécuter `supabase db reset` sur une base locale jetable, puis `supabase test db`.
- Vérifier les accès propriétaire, participant accepté, participant en attente et tiers.
- Vérifier les relations Terrain/bâtiment et bâtiment/unité.
- Vérifier la reprise de synchronisation après échec entre la création du dossier et de la fiche bâtiment.
- Exécuter typecheck, lint, tests applicatifs et build.
- Ne pas fusionner ni déployer cette première tranche tant que ces contrôles ne sont pas verts.

## Détail du schéma effectivement présent sur cette branche

Cette section décrit les migrations versionnées dans cette branche au moment de la revue. Elle ne constitue pas une recommandation de schéma définitif et ne signifie pas que les migrations ont été appliquées à une base distante.

### `building_properties`

- `dossier_id` : clé primaire et référence au dossier parent, supprimée en cascade avec celui-ci.
- `parent_terrain_dossier_id` : lien facultatif vers un dossier Terrain ; mis à NULL si le Terrain parent est supprimé.
- `property_kind` : catégorie contrainte aux valeurs `immeuble`, `maison`, `commerce`, `bureau`, `autre`.
- `locality`, `address_description` : localisation descriptive.
- `declared_surface`, `surface_unit` : surface facultative non négative et unité parmi `m2`, `are`, `hectare`.
- `administrative_references` : tableau JSONB ; `metadata` : objet JSONB.
- `created_at`, `updated_at` : horodatages.

Un index partiel facilite la recherche des bâtiments rattachés à un Terrain. Un trigger vérifie que le dossier parent est de type `batiment` et que le Terrain lié est bien un dossier de type `terrain` appartenant au même propriétaire.

### `building_units`

- `id` : identifiant UUID.
- `building_dossier_id` : bâtiment parent obligatoire, avec suppression en cascade.
- `designation` : texte obligatoire, entre 1 et 160 caractères après suppression des espaces périphériques.
- `unit_kind` : `appartement`, `boutique`, `bureau`, `local` ou `autre`.
- `declared_surface`, `surface_unit` : surface facultative non négative et unité contrôlée.
- `occupancy_status` : `occupe`, `vacant` ou `inconnu`.
- `description`, `metadata`, `created_at`, `updated_at`.

Un index référence les unités par bâtiment. La suppression du bâtiment supprime ses unités.

### `building_person_relations`

- `id`, `building_dossier_id` et `unit_id` : identifiant, bâtiment obligatoire et unité facultative.
- `person_name` : nom saisi, obligatoire, entre 1 et 180 caractères après trim.
- `contact_phone`, `contact_email` : coordonnées facultatives.
- `declared_role` : rôle contrôlé par une liste de valeurs (propriétaire/copropriétaire déclaré, détenteur, possesseur, bénéficiaire d'un droit déclaré, représentant, gestionnaire, occupant, locataire, acheteur, vendeur, héritier potentiel, ayant droit déclaré, voisin, autre).
- `declaration_status` : `declare`, `piece_associee` ou `a_verifier`.
- `relation_notes`, `metadata`, horodatages.

**Limite actuelle à conserver visible :** cette table stocke actuellement le nom et les coordonnées de la personne sous forme de texte ; la migration ne crée pas de clé étrangère vers un référentiel d'identité/personnes partagé. Il ne faut donc pas présenter cette première tranche comme une intégration complète à l'identité centrale ni créer de doublon silencieux lors d'une future évolution. La liaison au référentiel commun devra être étudiée séparément avant extension.

### `building_events`

- `id`, `building_dossier_id` et `unit_id` : identifiant, bâtiment obligatoire et unité facultative.
- `event_type` : valeur contrôlée couvrant déclaration, gestion, occupation, vente, achat, location, transmission, entretien, désaccord de voisinage, limite, accès, occupation contestée, désaccord vente/achat/location et autre.
- `occurred_on`, `title`, `description` : date d'événement, titre obligatoire et description.
- `parties_statements` : tableau JSONB pour les déclarations attribuées des parties.
- `metadata`, horodatages.

L'index bâtiment/date permet de retrouver la chronologie. Le schéma ne constitue pas encore un journal métier exhaustif : les champs structurés d'auteur, de provenance, de version, de pièce et de traitement devront être vérifiés par rapport aux services transversaux existants avant toute extension.

## Contraintes, triggers et comportement de suppression

- Les références vers un dossier bâtiment et ses unités sont contraintes par des clés étrangères.
- Le lien Terrain est facultatif et limité à un seul dossier parent dans cette version.
- Un trigger refuse le changement de type d'un dossier déjà utilisé comme bâtiment ou Terrain lié.
- Les relations de personnes et événements ne peuvent référencer qu'une unité appartenant au même bâtiment ; un trigger vérifie cette cohérence.
- Les unités, relations et événements sont supprimés en cascade avec le bâtiment parent. Le lien vers une unité est mis à NULL lorsque l'unité est supprimée.
- Les fonctions de trigger sont définies en `SECURITY INVOKER`, avec un `search_path` borné et des droits d'exécution révoqués à `PUBLIC`, `anon` et `authenticated`.
- Les horodatages `updated_at` sont maintenus par le trigger partagé `update_updated_at_column()`.

La suppression en cascade du dossier parent doit rester un point de vigilance de revue : avant toute décision de suppression ou d'archivage métier, vérifier les règles communes de conservation des preuves, événements et historiques. La spécification fonctionnelle privilégie l'archivage et la traçabilité plutôt que l'effacement silencieux.

## Matrice RLS actuellement définie

| Table | Propriétaire du dossier | Participant reconnu | Tiers non associé |
|---|---|---|---|
| `building_properties` | lecture et gestion (CRUD) | lecture | aucun accès |
| `building_units` | lecture et gestion (CRUD) | lecture | aucun accès |
| `building_person_relations` | lecture et gestion (CRUD) | lecture | aucun accès |
| `building_events` | lecture et gestion (CRUD) | lecture | aucun accès |

Les privilèges SQL sont accordés au rôle `authenticated`, puis limités par les politiques RLS. Les politiques d'écriture vérifient la propriété du dossier ; les politiques de lecture autorisent le propriétaire ou le participant reconnu par le helper transversal. La signification exacte de « participant accepté » dépend de l'implémentation actuelle de `is_dossier_participant` et doit être confirmée par les tests sur une base locale jetable. Les personnes enregistrées dans `building_person_relations` ne reçoivent pas automatiquement un accès.

## Correspondance entre modèle, interface et périmètre fonctionnel

À la date de cette revue, la première tranche de l'interface prend en charge :
- la création progressive d'un dossier bâtiment avec titre, catégorie, description, localité, adresse descriptive et surface déclarée ;
- la sauvegarde en ligne ou en brouillon local via le flux de création existant ;
- la lecture de la fiche bâtiment et le repli sur les métadonnées locales lorsque nécessaire ;
- une liste dédiée filtrée sur les dossiers de type `batiment`, avec recherche par nom/localité et filtres d'état du dossier.

Ne sont pas encore implémentés dans cette tranche : édition complète des champs bâtiment, CRUD des unités, association structurée des personnes, gestion des documents spécifiques, CRUD des événements, gestion des partages au niveau de la section et parcours complet des différends. Ces capacités figurent dans la spécification fonctionnelle, mais ne doivent pas être présentées comme disponibles dans l'interface actuelle.

## Limites et vérifications avant toute évolution

1. Confirmer sur une base locale jetable l'ordre des migrations et l'exécution des tests pgTAP.
2. Tester propriétaire, participant accepté, participant en attente et tiers non associé sur chacune des quatre tables.
3. Tester les liens Terrain/bâtiment et bâtiment/unité, y compris les tentatives de rattachement croisé entre propriétaires.
4. Tester les suppressions en cascade et la conservation attendue des preuves/historiques.
5. Tester la reprise hors ligne entre la création du dossier et l'upsert de `building_properties`.
6. Vérifier les limites de l'actuelle relation personne stockée en texte et décider ultérieurement de son raccordement au référentiel partagé.
7. Vérifier typecheck, lint, tests applicatifs, tests SQL et build.

Les contrôles ci-dessus sont des vérifications requises, pas des résultats déjà obtenus. Aucune migration n'a été appliquée à Supabase distant et cette documentation n'autorise ni fusion ni déploiement.
