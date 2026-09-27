# 01 — HÉRITAGE

**Statut : CANONICAL — V1.0**

## Mission

Gérer un dossier successoral autour d’une personne décédée, de son patrimoine, des héritiers potentiels, de la gestion temporaire, des désaccords, des procédures et de la transmission finale, sans déclarer automatiquement des droits successoraux.

## Séparations essentielles

```text
PotentialHeir
≠
ConfirmedHeir

DeclaredShare
≠
LegalShare

InheritanceCase
≠
Asset

InheritanceCompleted
≠
AutomaticOwnershipTransfer
```

## Agrégats

```text
InheritanceCase
Estate
EstateAsset
InheritancePersonRelation
HeirStatus
DeclaredShare
EstateManagement
EstateDecision
InheritanceIssue
InheritanceTimeline
```

## États

```text
DRAFT
PREPARING
TO_COMPLETE
UNDER_REVIEW
ORGANIZING
PARTITION_PREPARATION
PROCEDURE_IN_PROGRESS
CONSOLIDATED
COMPLETED

BLOCKED
CONTESTED
SUSPENDED
CANCELLED
ARCHIVED
```

## Règles

- Une succession peut contenir plusieurs biens.
- Un bien peut apparaître dans plusieurs dossiers historiques sans duplication de l’Asset maître.
- Les personnes décédées ou non-utilisatrices existent dans le graphe patrimonial.
- Silence, absence ou non-réponse d’un participant ne vaut pas renonciation.
- Une part déclarée est une information, pas une décision juridique.
- La finalisation d’un dossier 01 ne modifie pas directement les relations de propriété du domaine 03.

## Transmission de sortie

```text
EstateAsset
→ TransmissionCase (04)
→ Formalization / Procedure (07)
→ Domain 03 reevaluation
→ AssetOwnerRelation éventuelle
```

## Événements

`InheritanceCaseCreated`, `InheritanceStatusChanged`, `EstateAssetAdded`, `EstateAssetContested`, `PotentialHeirAdded`, `HeirStatusUpdated`, `EstateManagementChanged`, `InheritanceBlocked`, `InheritanceUnblocked`, `InheritanceConsolidated`, `InheritanceCompleted`.

## Permissions

Distinguer lecture, contribution, administration du dossier, gestion successorale, accès documentaire et accès aux données confidentielles. Les rôles patrimoniaux ne remplacent jamais les permissions applicatives.

## Frontières

03 Asset, 05 Person, 06 Document, 07 Procedure, 09 Conflict, 10 Protection, 11 vie économique.

## Invariants

- `HeirStatusUpdated ¬⇒ AssetOwnershipChanged`.
- Aucun dossier ne crée un clone d’Asset.
- Toute gestion temporaire est bornée par scope et validité.
- Les conflits restent gérés par 09.
- Les preuves restent gérées par 06.
