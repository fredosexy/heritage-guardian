# Biens agricoles et ruraux — suivi de l'implémentation UI/UX

> **Branche :** `feat/patrimoine-agricultural-rural-ui-ux`
> **Référence fonctionnelle :** `docs/01-DOMAINES/AGRICULTURAL-AND-RURAL-ASSETS-FUNCTIONAL-SPEC-V1.md`
> **Statut :** première tranche d'interface en cours — non validée pour livraison V1 complète.

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
- Persistance via le dossier commun Heritis et son mécanisme de création en ligne / brouillon local / synchronisation existant.
- Libellés français et anglais.
- Tests de base de la liste, du filtre par famille, de la création et de la persistance des champs structurés, ainsi que de l’affichage de l’assistant contextuel.

## Modèle de données utilisé dans cette première tranche

Le dossier Heritis reste l'identité canonique et la frontière de sécurité. Les champs spécifiques à cette première déclaration sont conservés dans `dossiers.metadata.agriculturalRural` avec une version de payload, la famille, les précisions déclarées et la source déclarative.

Cette solution réutilise les contrôles d'accès du dossier et la file hors ligne existante. Elle ne doit pas être interprétée comme un modèle relationnel complet des actifs agricoles. Une évolution vers des tables dédiées ne sera proposée qu'après audit des relations communes et des contraintes de synchronisation.

## Limites explicites — non implémentées dans cette tranche

- édition spécialisée et historique détaillé des corrections ;
- liens contrôlés vers les fiches Terrain, Bâtiment ou autres actifs sans duplication ;
- associations structurées de personnes et de rôles patrimoniaux ;
- rattachement de pièces à l'actif ou à une relation avec provenance ;
- événements patrimoniaux structurés ;
- statuts documentaires distincts et vérifications internes ;
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
