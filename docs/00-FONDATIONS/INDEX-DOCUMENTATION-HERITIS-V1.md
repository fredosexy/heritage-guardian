# Index de la documentation Heritis — V1

**Référentiel :** Heritis  
**Version :** V1 — Fondation  
**Pays de lancement :** Cameroun  

## 1. Comment lire cette documentation

Cette documentation présente les fondations stratégiques, la cartographie générale, les quatre domaines métier de la V1 et les services transversaux qui les soutiennent.

Ordre de lecture recommandé :

1. Comprendre la vision, la mission, les objectifs et les principes.
2. Consulter la cartographie générale pour avoir une vue d'ensemble.
3. Lire les documents détaillés des quatre domaines.
4. Lire les services transversaux pour comprendre les capacités communes.

## 2. Fondations et vue d'ensemble

| Document | Contenu |
|---|---|
| [Vision, mission, objectifs et principes fondateurs](VISION-MISSION-OBJECTIFS-PRINCIPES-HERITIS.md) | Référence stratégique, positionnement, publics, périmètre et stratégie V1 à V4. |
| [Cartographie générale des domaines et fonctionnalités V1](CARTOGRAPHIE-GENERALE-DOMAINES-FONCTIONNALITES-V1.md) | Vue d'ensemble des quatre domaines, sous-domaines, fonctionnalités et limites de la V1. |

## 3. Domaines métier V1

| Domaine | Document | Finalité |
|---|---|---|
| 1. Patrimoine et gestion des biens | [Document détaillé](../01-DOMAINES/PATRIMOINE-ET-GESTION-DES-BIENS-V1.md) | Identifier, déclarer, inventorier, documenter et suivre les biens et les relations déclarées. |
| ↳ Bâtiments et biens immobiliers | [Spécification fonctionnelle](../01-DOMAINES/BUILDINGS-AND-REAL-ESTATE-FUNCTIONAL-SPEC-V1.md) | Parcours de déclaration, localisation, surfaces, relations, preuves, historique et critères d'acceptation. |
| 2. Héritage et succession | [Document détaillé](../02-DOMAINES/HERITAGE-ET-SUCCESSION-V1.md) | Organiser les personnes, biens, documents, participations et étapes d'une succession. |
| 3. Volontés secrètes et dernières volontés | [Document détaillé](../03-DOMAINES/VOLONTES-SECRETES-ET-DERNIERES-VOLONTES-V1.md) | Préserver des volontés confidentielles et organiser leur transmission après vérifications. |
| 4. Gestion des conflits et litiges | [Document détaillé](../04-DOMAINES/GESTION-DES-CONFLITS-ET-LITIGES-V1.md) | Constituer un dossier de conflit et orienter vers les méthodes et services compétents. |

## 4. Services transversaux

| Document | Contenu |
|---|---|
| [Services transversaux V1](../SERVICES_TRANSVERSAUX_V1.md) | Identité, comptes et profils ; permissions ; documents ; journal et traçabilité ; notifications ; assistant adaptatif ; synchronisation et mode hors connexion. |

## 5. Règles de lecture et de cohérence

- La cartographie générale résume les domaines ; les documents détaillés décrivent leur périmètre fonctionnel.
- Les services transversaux soutiennent les quatre domaines et ne constituent pas des domaines métier autonomes.
- Le périmètre V1 ne doit pas être confondu avec la vision de long terme ou les extensions envisagées pour V2, V3 et V4.
- Une déclaration, une pièce déposée, un statut interne et une décision officielle doivent rester distincts.
- Les rôles et droits déclarés ne valent pas automatiquement reconnaissance juridique.
- Les références croisées entre domaines doivent éviter la duplication des personnes, biens, documents et dossiers.
- Toute évolution de périmètre doit être explicitement documentée et validée.

## 6. Audits et modèles UI/UX

| Document | Contenu |
|---|---|
| [Audit de l’état UI/UX actuel — 7 novembre 2026](../UI_UX_CURRENT_STATE_AUDIT_2026-11-07.md) | Vérification statique des routes, pages, accès visiteur, cartes, navigation et système visuel sur le main de référence. |
| [Modèles de référence des écrans UI/UX — 7 novembre 2026](../UI_UX_SCREEN_REFERENCE_MODELS_2026-11-07.md) | Hiérarchie des écrans, rôles des cartes, modèles de composition, correspondance avec les pages actuelles et ordre proposé des lots. |

Les audits UI/UX antérieurs sont des instantanés historiques. Vérifier leur commit de référence et les confronter à l’audit courant avant d’utiliser leurs constats.

## 7. Périmètre de cette livraison documentaire

Cette livraison décrit les références stratégiques, fonctionnelles et UI/UX de Heritis V1. Les modèles d'écran sont des propositions de composition et ne constituent pas une autorisation de modifier le code applicatif. Aucun schéma de données, migration, fonction Supabase ou projet Lovable n'est modifié.

**Statut :** index de navigation de la documentation stratégique, fonctionnelle et UI/UX de Heritis V1.
