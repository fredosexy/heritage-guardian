# 12 — ARCHITECTURE INTER-DOMAINES GLOBALE

**Statut : CANONICAL — V1.1**

## Architecture

```text
Modular Monolith
+ Domain-Oriented Modules
+ Application Services
+ Explicit Public APIs
+ Domain Events
+ Inbox / Outbox
+ Shared Authorization
+ Controlled Orchestration
+ Eventual Consistency
```

## Domaines

00 LAND_MEMORY  
01 INHERITANCE  
02 WILL  
03 ASSET  
04 TRANSMISSION  
05 PERSON  
06 DOCUMENT  
07 PROCEDURE  
08 PROFESSIONAL  
09 CONFLICT  
10 PROTECTION  
11 ASSET_LIFECYCLE

## Owner unique

```text
1 master concept
→ 1 owner domain
```

Une base Supabase commune n’autorise pas les mutations croisées.

## DomainReference

```text
DomainReference {
  domain
  entity_type
  entity_id
}
```

Référence ≠ ownership ≠ authorization.

## Interactions

`REFERENCE`, `QUERY`, `COMMAND`, `EVENT`, `IMPACT`, `DEPENDENCY`, `PROJECTION`.

### Command
Demande au domaine propriétaire de tenter une action.

### Event
Annonce un fait accompli.

### Impact
Signale qu’une ressource étrangère peut être affectée. La cible décide.

### Dependency
Exprime une condition attendue d’un domaine externe.

### Projection
Vue de lecture non autoritative.

## Public API

Chaque domaine expose uniquement :
- queries autorisées ;
- commands ;
- validations ;
- projections ;
- événements publics.

Un module voisin ne peut pas importer un repository interne.

## Shared Kernel

Minimal : UUID, Money, DatePrecision, DomainReference, DomainEventEnvelope, ActionContext, pagination/error primitives.

Aucun Asset/Person/Document/ConflictCase dans le Shared Kernel.

## Transaction locale

```text
Command
→ local aggregate
→ audit
→ outbox
→ COMMIT
```

Pas de transaction distribuée géante.

## Orchestrateurs

### UseCaseOrchestrator
Cas d’usage court, request-scoped. Coordonne, ne possède aucun état métier.

### CrossDomainOrchestrator
Coordonne une intention multi-domaines via APIs publiques.

### ProcessManager
Workflow long et asynchrone. Peut conserver uniquement l’état de coordination.

### ReadModelOrchestrator
Home, Search, Dashboard. Lecture seulement.

### ConversationalOrchestrator
Vita comprend l’intention et prépare queries/commands. Ne possède aucune vérité métier.

### InfrastructureOrchestrator
Sync, EventDispatcher, Notification delivery, Scheduler. Transporte et coordonne, ne décide pas les règles métier.

## Règle

```text
Orchestrator coordinates
Domain decides
```

## ProcessManager

```text
ProcessInstance {
  id
  process_type
  correlation_id
  current_coordination_step
  waiting_for_event
  status
}
```

Son statut ne remplace jamais ProcedureCase.status, TransmissionCase.status ou Mission.status.

## Outbox / Inbox

Événements critiques via Transactional Outbox. Consumers critiques idempotents via Inbox.

## Eventual consistency

Les états peuvent être temporairement divergents s’ils restent observables, retryables, traçables et convergents.

## Anti-cascade

event_id + correlation_id + causation_id + idempotency + origine empêchent les boucles.

## Confidentialité

```text
AccessToReference
¬⇒
AccessToReferencedResource
```

`VIEW_ALERT ¬⇒ VIEW_SOURCE_RESOURCE`.

## Structure cible

```text
src/modules/<domain>/
  domain/
  application/
  infrastructure/
  presentation/
  public-api/
```

Les orchestrateurs transversaux peuvent vivre sous `src/application/orchestrators/` et `process-managers/`.

## Invariants

- Owner unique.
- Foreign write direct interdit.
- Public API obligatoire.
- Target domain invariants always win.
- ProcessManager ≠ domain state.
- Read model reconstructible.
- Aucun God Service.
- Partial success représentable.
- Compensation = action métier explicite, pas rollback fictif.
