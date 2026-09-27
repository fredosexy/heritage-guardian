# 05 — FAMILLE / PERSONNES / RELATIONS PATRIMONIALES

**Statut : CANONICAL — V1.0**

## Mission

Fournir le référentiel des personnes, relations familiales, rôles applicatifs, permissions, mandats de représentation et identités de compte.

## Principe central

```text
Person
≠
UserAccount
≠
FamilyRelation
≠
PatrimonialRight
≠
CaseRole
≠
Permission
```

Une personne peut être décédée, partielle ou ne jamais posséder de compte.

## IdentityStatus

`PARTIAL`, `DECLARED`, `DOCUMENTED`, `VERIFIED`, `CONTESTED`, `DUPLICATE_SUSPECTED`.

## DeathStatus

`UNKNOWN`, `DECLARED_DECEASED`, `DOCUMENTED_DECEASED`, `VERIFIED_DECEASED`.

## Relations

Les relations familiales sont :
- directionnelles lorsque nécessaire ;
- multi-source ;
- contestables ;
- versionnées ;
- jamais automatiquement choisies comme vérité si les sources divergent.

## RoleAssignment

```text
RoleAssignment {
  user_id
  role
  scope_type
  scope_id
  valid_from
  valid_until
  status
}
```

Scopes : GLOBAL, FAMILY, ASSET, CASE, INHERITANCE, TRANSMISSION, CONFLICT, PROCEDURE, MISSION, DOCUMENT.

## RepresentationMandate

```text
RepresentationMandate {
  represented_person_id
  representative_person_id
  representative_user_id
  scope
  permissions
  valid_from
  valid_until
  source
  status
}
```

L’accompagnateur n’est pas automatiquement représentant.

## ActionContext

```text
ActionContext {
  actor_user_id
  actor_person_id
  acting_role
  represented_person_id
  mandate_id
  scope_type
  scope_id
}
```

## Autorisation

```text
RoleGrant
+ ExplicitGrant
+ ValidMandate
+ ContextGrant
- ExplicitDeny
- ConflictRestriction
- ConfidentialityRestriction
= EffectivePermission
```

`DENY > ALLOW`.

## Événements critiques

`PersonUpdated`, `PersonMerged`, `RoleAssignmentChanged`, `PermissionGranted`, `PermissionDenied`, `PermissionRevoked`, `RepresentationMandateCreated`, `RepresentationMandateExpired`, `RepresentationMandateRevoked`.

## Invariants

- Un statut familial ne crée pas une permission applicative.
- Un rôle de dossier n’est pas une propriété.
- Toute action représentée garde l’acteur réel.
- Une fusion de Person conserve les alias et références historiques.
- Les révocations d’accès doivent invalider les caches mais les actions sensibles revalident toujours l’état courant.
