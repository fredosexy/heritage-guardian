# 09 — GESTION DES CONFLITS

**Statut : CANONICAL — V1.0**

## Mission

Représenter désaccords, positions, preuves, médiation, impacts et accords sans décider automatiquement qui a raison.

## Principe

```text
Declaration
≠
Evidence
≠
Position
≠
Agreement
≠
ExternalDecision
≠
LegalTruth
```

Distinguer : point à clarifier, désaccord, conflit.

## ConflictStatus

`DRAFT`, `OPEN`, `UNDER_REVIEW`, `CLARIFICATION`, `DIALOGUE`, `MEDIATION`, `PROFESSIONAL_INTERVENTION`, `FORMAL_PROCEDURE`, `PARTIALLY_RESOLVED`, `RESOLVED`, `SUSPENDED`, `CLOSED_UNRESOLVED`, `CANCELLED`, `ARCHIVED`.

## Modèle

```text
ConflictCase
ConflictIssue
ConflictParty
ConflictPosition
ConflictEvidenceLink
ConflictIncident
ConflictProposal
ConflictAgreement
Mediation
ConflictImpact
WorkflowDependency
ConflictTimeline
```

## Positions / preuves

Une position n’est pas une preuve. Une partie peut contester une preuve adverse mais ne peut pas la supprimer.

`CONTEST_EVIDENCE` est distinct de `DELETE`.

## Médiation

Le médiateur :
- facilite ;
- documente ;
- ne décide pas du gagnant ;
- reste indépendant.

## Agreement

```text
ConflictAgreementRecorded
≠
ExternalFormalization
```

Un accord n’actualise aucune propriété directement.

## Impact inter-domaine

```text
Conflict
→ Targeted Impact
→ Event/Command
→ Target domain loads own state
→ Target validates own rules
→ Possible consequence
```

`ConflictCreated ¬⇒ global block`.

`ConflictResolved ¬⇒ automatic resume`.

## Cohérence

Inbox/Outbox + idempotence + eventual consistency. Aucun giant distributed transaction.

## Confidentialité

Positions privées, notes de médiation et informations sensibles restent protégées. Une permission de voir le conflit ne donne pas accès à tous les documents liés.

## Invariants

- Silence ≠ accord.
- Refus ≠ abandon de droit.
- Résolution 09 ≠ résultat juridique externe.
- Les impacts sont ciblés, temporalisés et audités.
- Aucune écriture directe dans 01,03,04,07,08,10,11.
