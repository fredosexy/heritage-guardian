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

## Vérifications requises avant fusion et déploiement

- Exécuter `supabase db reset` sur une base locale jetable, puis `supabase test db`.
- Vérifier les accès propriétaire, participant accepté, participant en attente et tiers.
- Vérifier les relations Terrain/bâtiment et bâtiment/unité.
- Vérifier la reprise de synchronisation après échec entre la création du dossier et de la fiche bâtiment.
- Exécuter typecheck, lint, tests applicatifs et build.
- Ne pas fusionner ni déployer cette première tranche tant que ces contrôles ne sont pas verts.
