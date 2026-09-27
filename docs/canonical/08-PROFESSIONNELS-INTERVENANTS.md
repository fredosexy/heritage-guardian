# 08 — SERVICES / PROFESSIONNELS / AGENTS / INTERVENANTS

**Statut : CANONICAL — V1.0**

## Mission

Relier un besoin à un intervenant compatible en tenant compte de compétence, habilitation, zone, disponibilité, conflits d’intérêt, scope et explicabilité.

## Séparations

```text
Person
≠
ProfessionalProfile
≠
Credential
≠
Authorization
≠
Mission
≠
Permission
```

## Catégories

`PROFESSIONAL`, `PUBLIC_SERVICE`, `LOCAL_AUTHORITY`, `ORGANIZATION`, `TECHNICAL_AGENT`, `MEDIATOR`, `AUTHORIZED_ASSISTANT`, `OTHER`.

## Profession / habilitation

Une profession déclarée n’est pas une habilitation. Les credentials ont leur propre statut et validité.

## InterventionNeed

```text
InterventionNeed {
  source_domain
  source_entity
  required_skill
  required_credential
  zone
  urgency
  status
}
```

Need ≠ Mission.

## Mission

`PROPOSED`, `REQUESTED`, `ACCEPTED`, `SCHEDULED`, `IN_PROGRESS`, `RESULT_PROVIDED`, `WAITING_VALIDATION`, `COMPLETED`, `DECLINED`, `CANCELLED`, `SUSPENDED`.

L’accès d’un professionnel est strictement limité au `MissionScope`.

## Conflit d’intérêt

`NONE`, `POTENTIAL`, `RESTRICTED`, `INCOMPATIBLE`.

Un médiateur ne peut être simultanément partie/représentant/conseiller dans le même conflit.

## Sélection

```text
InterventionNeed
+ context
+ required skills
+ credentials
+ zone
+ availability
+ access constraints
+ conflict-of-interest
→ Eligible candidates
→ Compatible candidates
→ Explainable ranking
→ Human choice
→ Mission request
```

### Eligibility

```text
ActiveProfile
∧ ProfessionCompatible
∧ RequiredSkillsSatisfied
∧ RequiredCredentialsValid
∧ JurisdictionCompatible
∧ NoHardRestriction
∧ NoIncompatibleConflict
```

Un hard fail ne peut pas être compensé par un score.

## Explicabilité

`CandidateEvaluation` conserve reason codes, warnings, checks et version du contexte. Pas de score opaque universel.

## Invariants

- Candidate évalué ≠ accès accordé.
- Mission complétée ≠ cible résolue.
- Professionnel ne vérifie pas son propre travail lorsque l’indépendance est requise.
- Les permissions expirent avec mission/scope.
- Le classement n’entraîne aucune assignation automatique en V1.
