# 13 — MODÈLE D’ÉVÉNEMENTS ET CONTRATS D’ÉVÉNEMENTS

**Statut : CANONICAL — V1.1**

## Mission

Définir les événements publics, leur enveloppe, leur versionnement, leur confidentialité, leur livraison fiable et leur catalogue contractuel.

## Principe

```text
Command = request
Event = fact
```

Un événement n’est ni une notification, ni un audit, ni une opération offline.

## Categories

`DOMAIN_EVENT`, `INTEGRATION_EVENT`, `SYSTEM_EVENT`, `AUDIT_EVENT`.

## Envelope

```text
DomainEventEnvelope {
  event_id
  event_name
  event_version
  event_category

  source_domain
  source_entity_type
  source_entity_id

  aggregate_version
  aggregate_sequence

  occurred_at
  recorded_at

  actor_user_id
  actor_person_id
  acting_role
  represented_person_id
  mandate_id

  correlation_id
  causation_id

  confidentiality
  event_origin

  payload
}
```

## Event name

Convention :
```text
<domain>.<aggregate>.<past-tense-fact>
```

Exemples :
`procedure.case.completed`,
`conflict.impact.created`,
`document.document.expired`.

## Version

`event_version ≠ aggregate_version`.

Breaking change = N+1. Une version publiée est immuable.

## Delivery

Événements critiques : `AT_LEAST_ONCE`.

```text
duplicate delivery = acceptable
duplicate business effect = forbidden
```

## Outbox

`integration_outbox` : event_id, name, version, source, aggregate_sequence, envelope, status, available_at, published_at, attempts/errors.

Status : PENDING, PUBLISHING, PUBLISHED, FAILED, DEAD_LETTER.

## Inbox

Clé : `consumer_name + event_id`.

Status : RECEIVED, PROCESSING, PROCESSED, FAILED_RETRYABLE, FAILED_PERMANENT, DEAD_LETTER.

## Handler

```text
validate envelope
→ validate version
→ check confidentiality
→ inbox/idempotency
→ ordering if needed
→ translate to local command
→ local domain
→ local outbox
→ mark processed
```

## Confidentialité

`NORMAL`, `SENSITIVE`, `HIGHLY_SENSITIVE`, `SECRET`.

Le domaine 02 et les permissions/mandats/scopes utilisent des politiques restreintes.

## Ordering

`NONE`, `PER_AGGREGATE`, `STRICT_PER_AGGREGATE`.

Pas d’ordre global.

## Replay

Rejeu autorisé pour reconstruction/récupération, mais Outbox history ≠ Event Sourcing. Les tables métier restent source de vérité.

## ContractDefinition

```text
ContractDefinition {
  contract_id
  event_name
  version
  producer
  aggregate
  event_category
  event_origin_policy
  description
  trigger
  payload_schema
  confidentiality
  priority
  ordering_policy
  freshness_policy
  semantic_deduplication_key
  allowed_consumers
  known_consumers
  guarantees
  non_guarantees
  compatibility_policy
  status
}
```

## Catalogue critique V1

- EVT-05-008 `person.permission.denied`
- EVT-05-013 `person.representation-mandate.expired`
- EVT-05-014 `person.representation-mandate.revoked`
- EVT-06-007 `document.document.verified`
- EVT-06-010 `document.document.expired`
- EVT-07-006 `procedure.case.blocked`
- EVT-07-020 `procedure.outcome.recorded`
- EVT-07-021 `procedure.case.completed`
- EVT-08-006 `professional.credential.expired`
- EVT-08-015 `professional.mission-scope.revoked`
- EVT-08-016 `professional.mission-scope.expired`
- EVT-08-020 `professional.mission.completed`
- EVT-09-014 `conflict.impact.created`
- EVT-09-015 `conflict.impact.resolved`
- EVT-09-017 `conflict.case.resolved`
- EVT-10-006 `protection.alert.created`
- EVT-10-010 `protection.alert-audience.changed`
- EVT-11-009 `asset-lifecycle.activity.blocked`
- EVT-11-025 `asset-lifecycle.project.blocked`

Tous exigent Outbox + Inbox + validation de contrat + idempotence.

## Notification intent

L’ancien nom impératif `AlertNotificationRequested` est remplacé par l’événement :
`protection.notification-intent.recorded`.

La commande de livraison sera définie au document 14.

## Garanties / non-garanties

Chaque contrat documente ce que le producteur promet et ce que le consumer ne doit pas déduire.

Exemple :
`procedure.case.completed` garantit que ProcedureCase a atteint COMPLETED selon 07 ; il ne garantit pas TransmissionCompleted, ConflictResolved ou ProjectStarted.

## Governance

Chaque contrat actif possède :
- Contract ID unique ;
- event_name + version uniques ;
- schéma runtime ;
- fixture valide ;
- tests producteur/consumer ;
- confidentialité ;
- compatibility policy.

## Invariants

- Un événement public existe pour un fait métier stable, pas parce qu’une ligne SQL a changé.
- Pas de mega-events ou CRUD events génériques.
- Payload minimal ; données personnelles et financières exclues par défaut.
- Les consumers réappliquent leurs invariants locaux.
- Les événements d’autorisation invalident les caches mais ne remplacent jamais une vérification actuelle.
