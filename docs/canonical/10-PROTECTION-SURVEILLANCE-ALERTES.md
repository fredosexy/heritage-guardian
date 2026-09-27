# 10 — PROTECTION PATRIMONIALE / SURVEILLANCE / ALERTES

**Statut : CANONICAL — V1.3**

## Mission

Répondre à : **« Quel élément de mon patrimoine nécessite mon attention, pourquoi et que puis-je faire maintenant ? »**

## Flux

```text
DomainEvent
→ ProtectionRuleVersion
→ Evaluation
→ RiskSignal
→ ProtectionAlert
→ Audience
→ RecommendedAction
→ NotificationIntent
→ Audit
```

## Séparations

```text
DomainEvent
≠ RiskSignal
≠ ProtectionAlert
≠ AlertRecipient
≠ Notification
≠ RecommendedAction
```

## ProtectionLevel

`STABLE`, `WATCH`, `ATTENTION`, `PRIORITY`.

Priority n’est pas une qualification juridique d’urgence.

## Rule model

```text
ProtectionRule
└── ProtectionRuleVersion
    └── ProtectionRuleCondition
```

Une version publiée est immuable ; modification = N+1.

Déclencheurs : `DOMAIN_EVENT`, `STATE_CHANGE`, `SCHEDULED_CHECK`, `DEADLINE_APPROACHING`, `EXPIRATION_APPROACHING`, `INACTIVITY`, `MANUAL_SIGNAL`, `COMPOSITE`.

Pas de JavaScript/SQL arbitraire dans les règles configurables.

## Event Inbox

`protection_event_inbox` conserve event_id, source, schema_version, correlation/causation, payload minimal et état de traitement.

## RiskSignal

Contient fingerprint, source, cible affectée, category, severity, reason_code, evidence_level, dates et version.

Le fingerprint déduplique les signaux actifs.

## ProtectionAlert

```text
OPEN
ACTION_IN_PROGRESS
RESOLVED
EXPIRED
ARCHIVED
```

`SEEN`, `ACKNOWLEDGED`, `SNOOZED`, `DISMISSED` appartiennent à l’état **par destinataire**, pas à l’alerte globale.

## Signals ↔ Alerts

Relation N-N via `alert_signal_links`.

## Audience

```text
alert_audience_rules
→ alert_recipients
→ alert_recipient_sources
→ alert_recipient_states
```

### Candidate selectors

OWNER_OF_SUBJECT, CASE_ADMIN, ASSIGNED_PARTICIPANT, VALID_REPRESENTATIVE, ACTIVE_MISSION_ACTOR, ACTIVE_MEDIATOR, SERVICE_ASSIGNEE, ORGANIZATION_RESPONSIBLE_ACTOR, SPECIFIC_PERSON, SPECIFIC_USER, SYSTEM_SECURITY_ROLE.

## Effective audience

```text
CandidateRecipients
∩ DomainScope
∩ EffectivePermissions
∩ AudiencePolicy
∩ ConfidentialityPolicy
- ExplicitDeny
- ConflictRestriction
- ExpiredOrRevokedAccess
```

`VIEW_ALERT ¬⇒ VIEW_SOURCE_RESOURCE`.

## Actions

`protection_actions` invoquent le domaine propriétaire de la cible. Le domaine 10 ne modifie pas directement Asset, Document, Procedure, Conflict ou Mission.

## Reminders

`protection_reminders` est séparé des alertes. Un rappel n’est pas une nouvelle alerte.

## Notification boundary

Le domaine 10 produit une intention sûre :
`protection.notification-intent.recorded`.

Le moteur Notifications possède les canaux et tentatives de livraison.

## Invariants

- Sévérité de l’alerte ≠ niveau de notification.
- Augmenter la sévérité n’élargit pas l’audience.
- Aucune donnée secrète n’est révélée par simple existence d’une alerte.
- L’autorisation réelle est revalidée avant lecture d’une ressource source sensible.
- Les historiques d’alertes/signaux/audiences sont conservés.
