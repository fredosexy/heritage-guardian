# 11 — MISE EN VALEUR / EXPLOITATION / VIE ÉCONOMIQUE

**Statut : CANONICAL — V1.1**

## Mission

Répondre à : **« Que fait-on concrètement de ce bien aujourd’hui, et que veut-on en faire demain ? »**

Le domaine décrit l’usage, l’exploitation, la gestion, les projets, les contributions, revenus, dépenses, travaux et valorisations sans réécrire la propriété.

## Séparations

```text
Ownership
≠ Usage
≠ Occupation
≠ Management
≠ Operation
≠ RevenueBeneficiary
```

## Agrégats

```text
AssetUse
AssetObjective
EconomicActivity
ActivityOperator
ManagementArrangement
RentalArrangement
EconomicProject
ProjectDependency
WorkRecord
MaintenanceRecord
Contribution
IncomeRecord
RevenueAllocation
ExpenseRecord
ValuationRecord
EconomicDecision
EconomicDocumentLink
EconomicAuditEvent
```

## Principes

- Operator ¬⇒ Owner.
- Manager ¬⇒ Owner.
- Contributor ¬⇒ Owner.
- RevenueBeneficiary ¬⇒ OwnershipRight.
- Occupant ≠ Tenant.
- Une autorisation orale reste déclarative.
- Une contribution ne crée ni dette ni part patrimoniale automatiquement.
- Une valeur professionnelle n’est pas une valeur juridique universelle.
- Une décision économique ne change pas la propriété.

## Activities

États : `IDEA`, `PREPARING`, `ACTIVE`, `SUSPENDED`, `BLOCKED`, `ENDED`, `ABANDONED`, `CONTESTED`.

## Projects

`IDEA`, `PREPARING`, `TO_VERIFY`, `READY`, `IN_PROGRESS`, `BLOCKED`, `SUSPENDED`, `COMPLETED`, `CANCELLED`, `ABANDONED`.

`READY` signifie uniquement que les préconditions internes identifiées sont satisfaites.

## Finances

Les revenus/dépenses servent à une vision indicative, pas à une comptabilité officielle.

```text
IndicativeBalance
=
SelectedIncome - SelectedExpenses
```

`VIEW_ACTIVITY ¬⇒ VIEW_FINANCIAL_DETAILS`.

## Permissions

Permissions séparées pour usages, activités, gestion, location, projets, travaux, maintenance, contributions, revenus, dépenses, allocations, valorisations et détails financiers.

## Inter-domaines

- 03 : Asset maître.
- 05 : Personnes et mandats.
- 06 : Documents.
- 07 : Procédures nécessaires aux projets.
- 08 : Missions professionnelles.
- 09 : ConflictImpact ciblé.
- 10 : Alertes.
- 01/04 : contexte successorale/transmission.

## Command pipeline

```text
Command
→ Authorization
→ Foreign reference validation
→ Role / mandate validation
→ Financial privacy validation
→ Dependency validation
→ Invariant validation
→ Transaction
→ Domain events
→ Audit
```

## Offline

UUID client stables, idempotency_key, version optimistic locking et conflits explicites. Last-write-wins silencieux interdit sur les données financières ou contestées.

## Traçabilité

Chaque exigence critique doit être reliée à :
```text
Requirement
→ Entity
→ Command
→ Permission
→ Invariant
→ Event
→ Test
→ Owner domain
```

Toute commande sensible possède un contrôle d’autorisation et un test. Toute référence inter-domaine identifie son domaine propriétaire.

## Invariants majeurs

- Le domaine 11 ne modifie pas directement AssetOwnership.
- ProcedureCompleted entraîne une réévaluation, pas un ProjectStarted automatique.
- MissionCompleted n’entraîne pas WorkCompleted.
- ConflictCreated n’entraîne pas blocage global.
- Données financières : permission spécifique + audit.
- Les éléments historiques significatifs ne sont pas hard-deleted.
