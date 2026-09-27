# 07 — PROCÉDURES / DÉMARCHES / PARCOURS ADMINISTRATIFS

**Statut : CANONICAL — V1.0**

## Mission

Répondre à : **« Que dois-je faire maintenant dans ma situation ? »** au moyen de procédures contextualisées et versionnées plutôt que d’articles statiques.

## Modèle

```text
Situation
→ Context
→ ProcedureDefinition + Version
→ ProcedureCase
→ Steps
→ Requirements
→ Evidence / Documents
→ Professionals / Services
→ Outcome
```

## Definition

`DRAFT`, `ACTIVE`, `UNDER_REVIEW`, `DEPRECATED`, `RETIRED`.

Une définition dépend de la juridiction/zone, du type de bien, du dossier et du contexte.

## ProcedureCaseStatus

`DRAFT`, `PREPARING`, `READY`, `IN_PROGRESS`, `WAITING`, `ACTION_REQUIRED`, `BLOCKED`, `SUSPENDED`, `COMPLETED`, `CANCELLED`, `ARCHIVED`.

```text
COMPLETED
≠
AssetProblemResolved
```

## Requirements

Une exigence possède :
- applicabilité ;
- statut ;
- mode de vérification ;
- caractère bloquant ;
- waiver éventuel ;
- alternative group ;
- preuves liées.

```text
EvidenceExists
≠
RequirementSatisfied
```

## Documents

```text
ProcedureRequirement
→ DocumentRequirement
→ Existing/New Document
→ DocumentLink
→ RequirementEvidence
```

Le document reste maître dans 06.

## Deadlines

Distinguer :
- officielle ;
- annoncée ;
- objectif utilisateur ;
- estimation applicative ;
- inconnue.

## Fees

Les frais sont catégorisés et sourcés ; une estimation n’est pas présentée comme tarif officiel.

## Pipeline

```text
Command
→ Authorization
→ Context validation
→ Jurisdiction validation
→ Foreign reference validation
→ Dependency validation
→ Requirement validation
→ Domain invariants
→ Transaction
→ Events
→ Audit
```

## Événements

`ProcedureCaseCreated`, `ProcedureStarted`, `ProcedureBlocked`, `RequirementSatisfied`, `RequirementRejected`, `ComplementRequested`, `AppointmentScheduled`, `SubmissionRecorded`, `ProcedureOutcomeRecorded`, `ProcedureCompleted`.

## Invariants

- Une procédure ne modifie pas directement la propriété.
- Une fin de procédure entraîne des réévaluations chez les domaines consommateurs.
- Une étape ne peut ignorer un blocker critique actif.
- Les définitions versionnées publiées sont immuables ; une correction crée une nouvelle version.
- Les documents, personnes, missions et conflits restent gérés par leurs domaines propriétaires.
