# 04 — TRANSMISSION / DONATION / PARTAGE FAMILIAL

**Statut : CANONICAL — V1.0**

## Mission

Préparer, discuter, documenter et formaliser une transmission patrimoniale sans appliquer directement une mutation de propriété.

## Séparations

```text
Transmission
≠
Donation
≠
FamilyPartition
```

```text
AgreementRecorded
≠
Formalized
```

```text
TransmissionCompleted
≠
Direct AssetOwnerRelation write
```

## Types

Donation, allocation familiale, partage, transmission progressive, transmission historique, succession, usage/gestion, autres formes documentées.

## Allocation

`PHYSICAL_PORTION`, `PERCENTAGE`, `FRACTION`, `USAGE`, `MANAGEMENT`, `UNDEFINED`.

## Positions des participants

`AGREE`, `DISAGREE`, `RESERVATION`, `NOT_CONSULTED`, `NO_RESPONSE`.

```text
Silence
≠
Agreement
```

## ProposalStatus

`DRAFT`, `PROPOSED`, `UNDER_DISCUSSION`, `PARTIALLY_ACCEPTED`, `ACCEPTED`, `REJECTED`, `WITHDRAWN`, `SUPERSEDED`, `EXPIRED`.

## CaseStatus

`DRAFT`, `PREPARING`, `UNDER_DISCUSSION`, `AGREEMENT_RECORDED`, `READY_FOR_FORMALIZATION`, `FORMALIZATION_IN_PROGRESS`, `FORMALIZED`, `COMPLETED` + états de blocage/suspension.

## Formalisation

Une source externe/procédure peut être nécessaire avant que le domaine 04 considère la formalisation enregistrée.

Le domaine 03 reste seul propriétaire des relations Asset.

## Événements

`TransmissionCaseCreated`, `TransmissionStatusChanged`, `TransmissionProposalCreated`, `ParticipantPositionChanged`, `FamilyAgreementRecorded`, `TransmissionBlocked`, `FormalizationStarted`, `TransmissionFormalized`, `TransmissionCompleted`.

## Invariants

- Une contribution familiale n’est pas une part de propriété.
- Un accord applicatif n’est pas une formalisation externe.
- La subdivision conserve la généalogie Asset.
- Le domaine 04 demande au domaine 03 de réévaluer ; il ne fait aucun UPDATE croisé.
