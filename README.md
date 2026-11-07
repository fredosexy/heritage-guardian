# Heritis

**Heritis est une plateforme numérique d'organisation, de documentation, de préservation et d'accompagnement du patrimoine des personnes et des familles.**

Heritis aide les personnes et les familles à mieux organiser leurs informations patrimoniales, documenter les biens et les événements importants, préparer les transmissions, conserver leurs volontés et s'orienter lorsqu'une difficulté ou un conflit survient.

La plateforme facilite la compréhension, la participation maîtrisée des personnes concernées et l'accès aux accompagnements compétents. Elle ne remplace pas les autorités, les professionnels qualifiés ni les procédures officielles.

## Mission

Rendre la gestion, la documentation, la préservation et la transmission du patrimoine des personnes et des familles plus accessibles, mieux organisées, plus sécurisées et plus transparentes, en facilitant leur accompagnement et leur accès aux services compétents.

## Les quatre domaines métier de la V1

La première version de Heritis se concentre sur quatre domaines. L'enregistrement des biens et la documentation sont transversaux : ils soutiennent les domaines sans constituer un domaine métier supplémentaire.

### 1. Patrimoine et gestion des biens

Déclarer, inventorier, décrire, documenter et suivre les biens et les intérêts qui leur sont associés. Les rôles des personnes, les droits déclarés, les pièces et les résultats de vérification restent distincts.

### 2. Héritage et succession

Constituer et suivre un dossier de succession, identifier les personnes concernées, relier les biens, réunir les documents et permettre aux participants autorisés de contribuer, confirmer ou contester des informations.

### 3. Volontés secrètes et dernières volontés

Enregistrer et préserver des volontés personnelles ou patrimoniales, gérer leur confidentialité, leurs destinataires et leurs conditions de transmission, avec une vérification documentée avant toute transmission.

### 4. Gestion des conflits et litiges

Permettre à une personne de signaler un conflit, de constituer son dossier, puis de comprendre les voies possibles et d'accéder à des professionnels ou services compétents. Heritis n'arbitre pas le litige et ne décide pas des droits des parties.

## Publics concernés

- Les personnes et les familles qui souhaitent organiser et préserver leur patrimoine.
- Les personnes concernées par une succession.
- Les personnes confrontées à un différend familial, patrimonial, successoral ou documentaire.
- Les professionnels qualifiés et les organisations compétentes, dans le cadre d'accès et de responsabilités distincts.

L'inscription à Heritis ne constitue pas, à elle seule, une preuve d'identité vérifiée, de qualification professionnelle, de filiation, de qualité d'héritier ou de droit de propriété.

## Positionnement et limites

Heritis organise les informations, conserve les documents, facilite la traçabilité et oriente vers les interlocuteurs appropriés. La plateforme :

- ne constitue pas un tribunal, un service cadastral ou une autorité administrative ;
- ne certifie pas automatiquement la propriété, l'authenticité d'un document ou la qualité d'héritier ;
- ne transforme pas une déclaration ou une pièce déposée en droit juridiquement établi ;
- ne tranche pas les conflits et ne garantit pas l'issue d'une procédure ;
- ne remplace pas les avocats, notaires, experts, administrations ou juridictions compétentes.

Les informations déclarées, les documents déposés, les vérifications internes et les décisions officielles doivent rester clairement différenciés.

## Accès et accompagnement

- **Visiteur :** découverte de Heritis, explications et aperçus uniquement ; pas d'accès aux fonctionnalités de gestion.
- **Utilisateur disposant d'un compte :** accès aux fonctionnalités selon son identité, ses droits et les permissions accordées.
- **Professionnel ou organisation :** accès distinct, encadré par la spécialité, les justificatifs et le statut de vérification applicables.

L'assistant adaptatif accompagne la découverte et les parcours autorisés. Il explique et oriente ; il ne remplace pas un professionnel et ne prend pas de décision juridique.

## Pays de lancement

Le Cameroun constitue le premier pays de lancement de la V1, avec une ambition d'accès national. Les services professionnels disponibles peuvent varier selon les régions et les spécialités. Toute expansion ultérieure devra tenir compte des cadres et pratiques locaux.

## Évolution du produit

- **V1 — Fondation :** lancement maîtrisé des quatre domaines métier et des services transversaux essentiels.
- **V2 — Stabilisation :** correction, consolidation et amélioration des fonctionnalités existantes.
- **V3 — Extension :** enrichissement progressif des capacités des domaines existants.
- **V4 — Évolution :** ouverture à de nouveaux services, domaines et territoires.

La présence d'une fonctionnalité dans la documentation de référence décrit le périmètre fonctionnel validé ; elle ne signifie pas nécessairement que cette fonctionnalité est déjà implémentée ou disponible en production.

## Documentation de référence

Commencer par l'[index de la documentation Heritis V1](docs/00-FONDATIONS/INDEX-DOCUMENTATION-HERITIS-V1.md).

- [Vision, mission, objectifs et principes](docs/00-FONDATIONS/VISION-MISSION-OBJECTIFS-PRINCIPES-HERITIS.md)
- [Cartographie générale des domaines et fonctionnalités V1](docs/00-FONDATIONS/CARTOGRAPHIE-GENERALE-DOMAINES-FONCTIONNALITES-V1.md)
- [Patrimoine et gestion des biens](docs/01-DOMAINES/PATRIMOINE-ET-GESTION-DES-BIENS-V1.md)
- [Héritage et succession](docs/02-DOMAINES/HERITAGE-ET-SUCCESSION-V1.md)
- [Volontés secrètes et dernières volontés](docs/03-DOMAINES/VOLONTES-SECRETES-ET-DERNIERES-VOLONTES-V1.md)
- [Gestion des conflits et litiges](docs/04-DOMAINES/GESTION-DES-CONFLITS-ET-LITIGES-V1.md)
- [Services transversaux V1](docs/SERVICES_TRANSVERSAUX_V1.md)

Les audits UI/UX et les documents de préparation complémentaires peuvent contenir des constats historiques. Toujours vérifier leur date, leur commit de référence et leur niveau de validation avant de les utiliser comme état actuel du produit.

## Socle technique du dépôt

Le dépôt contient une application web basée sur React, TypeScript et Vite, avec Supabase pour les services backend, une prise en charge PWA et des mécanismes de continuité hors connexion. Les choix techniques détaillés et leur état réel doivent être vérifiés dans le code et les configurations du dépôt ; cette présentation produit ne constitue pas une spécification d'architecture.

## Développement

Le dépôt utilise Bun et son lockfile pour l'installation reproductible et les contrôles CI.

```sh
git clone <repository-url>
cd <repository-directory>
bun install --frozen-lockfile
bun run dev
```

Commandes de contrôle :

```sh
bun run test
bun run lint
bun run build
```

Les tests de migrations et d'intégration nécessitent l'environnement local prévu par les workflows GitHub Actions. Ne pas utiliser une base distante pour les contrôles de migrations locaux.
