# 19 — REALTIME / NOTIFICATIONS / BACKGROUND JOBS

**Projet :** Heritage Guardian / Fonciers  
**Statut :** CANONICAL — V1.0  
**Position :** 19/27  
**Type :** Spécification transverse pour temps réel, notifications, jobs planifiés, retries et observabilité

---

# 1. Mission

Définir comment l’application :

- propage les changements utiles en temps réel ;
- informe les utilisateurs ;
- exécute les tâches planifiées ;
- traite les expirations et échéances ;
- relance les traitements techniques ;
- conserve une séparation stricte entre vérité métier, alerte, notification et transport.

---

# 2. Séparations fondamentales

```text
DomainEvent
≠
RealtimeSignal
≠
ProtectionAlert
≠
NotificationIntent
≠
NotificationDelivery
≠
ScheduledJob
```

Chaque concept a une responsabilité distincte.

---

# 3. Domain Event

Un DomainEvent décrit un fait métier accompli.

Exemple :

```text
procedure.case.completed
```

Il est défini par le document 13.

---

# 4. RealtimeSignal

Un RealtimeSignal indique au client qu’une ressource ou projection a changé.

Il ne contient pas nécessairement toute la donnée.

```text
RealtimeSignal
→ Authorized refetch
```

---

# 5. ProtectionAlert

Une ProtectionAlert appartient au domaine 10.

Elle exprime une situation nécessitant potentiellement l’attention d’un utilisateur.

Elle n’est pas une notification technique.

---

# 6. NotificationIntent

Une intention de notification décrit :

> ce qui peut être communiqué, à qui, avec quel niveau de visibilité.

Elle ne signifie pas que la livraison a réussi.

---

# 7. NotificationDelivery

La livraison est un objet technique représentant une tentative sur un canal.

Exemples :

- IN_APP ;
- PUSH ;
- SMS ;
- EMAIL.

---

# 8. ScheduledJob

Un ScheduledJob exécute une tâche technique ou demande une réévaluation métier à une date déterminée.

Il ne décide pas seul de la vérité métier.

---

# 9. Architecture globale

```text
Domain Commit
↓
Outbox / Event
↓
Projection update
↓
Realtime signal
↓
Client refetch
```

Notifications :

```text
Domain / Protection
↓
Notification Intent
↓
Notification Orchestrator
↓
Delivery
↓
Provider
```

Jobs :

```text
Scheduler
↓
Job
↓
Application Command / Reevaluation
↓
Domain
```

---

# 10. Realtime — objectifs

Le temps réel sert à :

- mettre à jour une timeline ;
- montrer une nouvelle alerte ;
- rafraîchir l’état d’un dossier ;
- actualiser une projection ;
- signaler une modification de mission ;
- indiquer une nouvelle notification.

---

# 11. Realtime ≠ source de vérité

```text
Realtime payload
≠
Authoritative state
```

Le client doit pouvoir refetch la projection actuelle.

---

# 12. Realtime et RLS

Toute souscription doit respecter :

- session authentifiée ;
- scope ;
- RLS ;
- confidentialité ;
- état actuel des permissions.

Une subscription active ne donne pas un droit permanent.

---

# 13. Realtime payload minimal

Format conceptuel :

```text
RealtimeSignal {
  signal_id

  resource_ref
  change_kind
  projection_hint?

  version?
  occurred_at
}
```

---

# 14. ChangeKind

```text
CREATED
UPDATED
STATUS_CHANGED
ARCHIVED
DELETED_LOGICALLY
INVALIDATED
REFRESH_REQUIRED
```

---

# 15. Données sensibles

Ne pas transmettre dans un signal realtime générique :

- contenu d’un document ;
- contenu d’une volonté ;
- coordonnées privées ;
- montant financier ;
- notes de conflit ;
- données d’identité détaillées.

---

# 16. Supabase Realtime

Utiliser des publications explicites.

Ne pas publier automatiquement toutes les tables du schéma.

---

# 17. Publications recommandées

Exemples de projections ou tables adaptées :

- notification summaries ;
- protection summaries ;
- procedure status projection ;
- mission status projection ;
- read models Home ;
- timeline summaries.

---

# 18. Tables déconseillées en publication directe

Par défaut :

- wills ;
- document_files ;
- permission_denies ;
- representation_mandates ;
- financial detail tables ;
- private conflict notes ;
- raw audit tables.

---

# 19. Realtime et projection

La préférence est :

```text
Domain tables
↓
Projection / View
↓
Realtime
```

plutôt que publier l’agrégat complet.

---

# 20. Reconnect

Après reconnexion :

1. rétablir la session ;
2. resouscrire ;
3. invalider les projections trop anciennes ;
4. refetch les données visibles ;
5. synchroniser l’outbox client.

---

# 21. Événements manqués

Le client ne doit pas supposer qu’il a reçu tous les événements realtime.

Le realtime améliore l’UX ; il ne remplace pas les queries autoritatives.

---

# 22. Notification Domain

Le sous-système Notifications possède :

- intentions ;
- préférences ;
- deliveries ;
- templates ;
- retries ;
- channel routing ;
- provider adapters ;
- delivery status.

---

# 23. NotificationIntent

```text
NotificationIntent {
  id

  source_domain
  source_entity_ref

  recipient_person_id?
  recipient_user_id?

  notification_category
  notification_level
  visibility_level

  message_key
  safe_params

  allowed_channels[]

  status
  created_at
  expires_at?
}
```

---

# 24. NotificationIntentStatus

```text
PENDING
READY
CANCELLED
EXPIRED
SUPPRESSED
DELIVERED_PARTIALLY
COMPLETED
```

---

# 25. NotificationLevel

```text
NONE
IN_APP_ONLY
NORMAL
IMPORTANT
IMMEDIATE
```

---

# 26. VisibilityLevel

```text
MINIMAL
SUMMARY
STANDARD
DETAILED
SENSITIVE
```

Le canal peut imposer un plafond plus restrictif.

---

# 27. Channel exposure caps

Recommandation :

```text
IN_APP → up to authorized level
PUSH   → SUMMARY max by default
SMS    → MINIMAL by default
EMAIL  → STANDARD max by default
```

La politique la plus restrictive gagne.

---

# 28. NotificationDelivery

```text
NotificationDelivery {
  id
  intent_id

  channel
  destination_ref

  status
  attempt_count

  scheduled_at
  last_attempt_at?
  delivered_at?

  provider_message_id?
  failure_code?
}
```

---

# 29. DeliveryStatus

```text
PENDING
SENDING
DELIVERED
FAILED_RETRYABLE
FAILED_PERMANENT
CANCELLED
SUPPRESSED
EXPIRED
```

---

# 30. DestinationRef

Le système ne doit pas recopier inutilement téléphone/email dans toutes les tables.

Préférer une référence vers le canal de contact autorisé.

---

# 31. User Preferences

```text
NotificationPreference {
  user_id
  category
  channel
  enabled

  quiet_hours?
  timezone?
}
```

---

# 32. Préférences ≠ restrictions de sécurité

Une préférence utilisateur peut réduire des notifications.

Elle ne peut pas forcer la divulgation d’une donnée qu’il n’a pas le droit de recevoir.

---

# 33. Quiet Hours

Les notifications non urgentes peuvent respecter des heures silencieuses.

Les heures sont interprétées selon la timezone utilisateur.

---

# 34. Timezone

Tous les timestamps serveur utilisent UTC.

Les préférences de récurrence et quiet hours conservent une timezone IANA lorsqu’elle est connue.

---

# 35. Notification templates

Utiliser :

```text
message_key
+
safe_params
```

et non stocker des phrases générées comme source de vérité.

---

# 36. i18n

Le rendu final se fait avec :

- langue utilisateur ;
- niveau de simplicité ;
- mode lecteur/non-lecteur ;
- canal.

---

# 37. Rural-friendly notifications

Pour un utilisateur peu lecteur :

- phrase courte ;
- vocabulaire simple ;
- une action claire ;
- éventuellement lecture vocale côté UI ;
- pas de jargon administratif inutile.

---

# 38. In-app Notification

Peut contenir :

- titre ;
- résumé ;
- icon/category ;
- resource_ref ;
- CTA autorisé ;
- timestamp.

L’ouverture revalide l’accès.

---

# 39. Push

Payload minimal :

```text
notification_id
message_key
safe_params
deep_link_hint?
```

Aucune donnée secrète directe.

---

# 40. SMS

SMS doit rester particulièrement minimal.

Exemple :

> Une action nécessite votre attention dans votre espace.

Éviter d’exposer dans le SMS la nature exacte du conflit ou une information patrimoniale sensible.

---

# 41. Email

Utiliser pour les messages adaptés au canal, avec prudence sur les détails sensibles.

Les liens renvoient vers l’application authentifiée.

---

# 42. Delivery retry

Les erreurs transitoires utilisent un backoff.

Exemple conceptuel :

```text
1 min
5 min
15 min
1 h
6 h
```

La politique exacte dépend du canal/provider.

---

# 43. Delivery permanent failure

Exemples :

- destination invalidée ;
- canal non supporté ;
- provider rejection permanente.

Ne pas retry indéfiniment.

---

# 44. Deduplication

Clé logique recommandée :

```text
intent_id
+ recipient
+ channel
+ occurrence
```

---

# 45. Stale notification

Avant une livraison fortement différée, certains intents doivent être réévalués.

Exemple :

- alerte déjà résolue ;
- mandat révoqué ;
- accès expiré ;
- procédure déjà complétée.

---

# 46. Delivery ≠ source mutation

```text
NotificationDeliveryFailed
¬⇒
ProtectionAlertChanged
```

Un échec de canal ne modifie pas la situation métier source.

---

# 47. Notification events

Événements techniques possibles :

```text
notification.intent.created
notification.delivery.scheduled
notification.delivery.delivered
notification.delivery.failed
notification.delivery.cancelled
```

Ils restent distincts des Domain Events patrimoniaux.

---

# 48. Background Jobs — catégories

```text
EXPIRATION_CHECK
DEADLINE_CHECK
REMINDER
RULE_EVALUATION
OUTBOX_RETRY
INBOX_RETRY
NOTIFICATION_RETRY
PROJECTION_REBUILD
CLEANUP
HEALTH_CHECK
DATA_RETENTION
```

---

# 49. Scheduler

Le scheduler est un orchestrateur technique.

```text
Scheduler
≠
Business decision engine
```

---

# 50. Pattern métier planifié

```text
Scheduled job
↓
ReevaluateX command
↓
Domain loads current state
↓
Domain decides whether transition exists
↓
Event
```

---

# 51. Expiration

Exemples :

- mandat ;
- credential ;
- document ;
- MissionScope ;
- gestion économique ;
- location ;
- deadline de procédure.

---

# 52. Expiration ≠ simple horloge

Le job ne doit pas faire directement :

```text
UPDATE status = EXPIRED
```

sans passer par la logique métier lorsqu’une transition comporte des invariants.

---

# 53. JobDefinition

```text
JobDefinition {
  job_name
  job_type

  schedule
  target_domain?

  enabled
  retry_policy

  concurrency_policy
}
```

---

# 54. JobRun

```text
JobRun {
  id

  job_name
  occurrence_key

  started_at
  completed_at?

  status

  attempt_count
  error_code?
}
```

---

# 55. JobRunStatus

```text
PENDING
RUNNING
SUCCEEDED
FAILED_RETRYABLE
FAILED_PERMANENT
CANCELLED
SKIPPED
```

---

# 56. Idempotence d’un job

```text
job_name
+ occurrence_key
→ one logical execution
```

---

# 57. ConcurrencyPolicy

```text
ALLOW
SKIP_IF_RUNNING
SERIALIZE
SINGLETON
```

---

# 58. Jobs critiques

Pour les jobs de sécurité ou autorisation :

- mandat expiré ;
- MissionScope expiré ;
- credential révoqué ;

les actions serveur sensibles doivent toujours revalider l’état actuel, même si le job n’a pas encore tourné.

---

# 59. Cron

Supabase Cron/pg_cron ou mécanisme équivalent peut planifier les jobs.

Le scheduler ne doit pas contenir les règles métier détaillées.

---

# 60. Job worker

Le worker :

1. claim le job ;
2. écrit JobRun ;
3. appelle le service approprié ;
4. capture résultat ;
5. planifie retry si nécessaire ;
6. publie métriques.

---

# 61. Distributed locks

Pour les jobs singleton ou critiques, utiliser un mécanisme évitant deux workers simultanés sur la même occurrence.

---

# 62. Outbox Retry Job

Responsabilité :

- sélectionner events PENDING/FAILED ;
- respecter available_at ;
- publier ;
- marquer résultat ;
- backoff ;
- dead letter après seuil.

---

# 63. Inbox Retry Job

Pour les consumers qui supportent retry asynchrone.

Il ne rejoue pas les FAILED_PERMANENT sans intervention explicite.

---

# 64. Projection Rebuild

Un read model reconstructible peut être régénéré par job.

Le rebuild n’altère pas les domaines maîtres.

---

# 65. Cleanup

Autorisé pour :

- tokens expirés ;
- cache technique ;
- anciennes deliveries techniques selon retention ;
- fichiers temporaires orphelins identifiés.

Interdit de purger automatiquement l’historique patrimonial sans politique dédiée.

---

# 66. Data Retention Job

Toute purge sensible doit :

- être explicitement autorisée ;
- respecter le document 23 ;
- produire audit ;
- exclure les données légalement/historiquement à conserver.

---

# 67. Realtime + Notifications

Le fait qu’un utilisateur soit en ligne ne signifie pas qu’une notification externe est inutile dans tous les cas.

La stratégie peut éviter les doublons, mais la décision dépend des préférences et de la criticité.

---

# 68. Notification coalescing

Plusieurs intents proches peuvent être regroupés lorsque cela ne masque pas l’urgence.

Exemple :

```text
3 nouveaux documents à vérifier
```

au lieu de trois pushes.

---

# 69. Coalescing interdit

Ne pas fusionner des messages qui ont :

- niveaux de confidentialité différents ;
- destinataires différents ;
- urgences incompatibles ;
- actions contradictoires.

---

# 70. Notification expiration

Un intent peut expirer si son contenu n’est plus utile.

Exemple : rappel de rendez-vous après la date.

---

# 71. Deep links

Les liens depuis notifications contiennent seulement un identifiant non secret ou une route sûre.

L’ouverture exige session + authorization.

---

# 72. Provider abstraction

```text
NotificationProvider {
  send()
  validateDestination()
  mapError()
}
```

Adapters possibles :
- push provider ;
- SMS provider ;
- email provider.

---

# 73. Provider independence

La logique métier ne dépend pas du nom d’un fournisseur spécifique.

---

# 74. Provider secrets

Stockés exclusivement côté serveur/secret manager.

Jamais dans le frontend.

---

# 75. Notification abuse prevention

Limiter :

- fréquence ;
- retry ;
- nombre de notifications similaires ;
- destinations invalides.

Éviter notification storms.

---

# 76. Security notification

Les notifications de sécurité doivent être minimales et éviter de révéler la donnée à un appareil potentiellement non sécurisé.

---

# 77. Realtime abuse prevention

Limiter les subscriptions :

- par principal ;
- par scope ;
- par nombre de channels ;
- par ressource.

---

# 78. Observabilité Realtime

Mesures :

```text
active_subscriptions
subscription_failures
reconnect_rate
authorization_denials
message_lag
```

---

# 79. Observabilité Notifications

```text
intent_count
delivery_pending
delivery_success_rate
delivery_failure_rate
retry_count
oldest_pending_age
suppressed_count
expired_count
```

---

# 80. Observabilité Jobs

```text
job_runs
job_failures
job_duration
job_lag
overlapping_runs
retry_count
dead_jobs
```

---

# 81. Technical alerts

Les problèmes comme :

- outbox bloquée ;
- queue notifications en retard ;
- job non exécuté ;
- taux d’erreur élevé ;

produisent des alertes d’infrastructure.

Elles ne sont pas automatiquement des ProtectionAlert du domaine 10.

---

# 82. Audit

Auditer au minimum :

- création d’intent sensible ;
- modification de préférences critiques ;
- suppression/suppression logique de destination ;
- job manuel sensible ;
- replay manuel ;
- dead-letter reprocessing.

---

# 83. Manual retry

Une interface admin peut permettre le retry.

Elle doit afficher :

- type ;
- cible ;
- attempts ;
- error code ;
- dates.

Pas de payload secret complet par défaut.

---

# 84. Dead Letter Notifications

Une delivery dead-letter reste consultable par support/admin technique autorisé.

---

# 85. Dead Letter Jobs

Un job définitivement échoué nécessite intervention ou correction.

Il ne doit pas disparaître silencieusement.

---

# 86. Eventual consistency

Le realtime et les notifications sont naturellement eventually consistent.

Le client doit accepter qu’une notification arrive avant ou après un refresh de projection.

---

# 87. Duplicates

La livraison at-least-once peut produire des doublons techniques.

Le système utilise :

- intent id ;
- delivery id ;
- idempotency key ;
- provider_message_id ;

pour limiter les doubles envois.

---

# 88. Offline

Si l’utilisateur ouvre une notification hors ligne :

- afficher les données locales autorisées si disponibles ;
- ne pas inventer l’état actuel ;
- marquer clairement ce qui n’est pas synchronisé ;
- refetch au retour réseau.

---

# 89. Read state

L’état lu/non-lu d’une notification est individuel.

Il ne modifie pas le statut d’une ProtectionAlert globale.

---

# 90. NotificationRecipientState

```text
UNREAD
READ
ACKNOWLEDGED
DISMISSED
```

Ce modèle est propre à la surface notification si nécessaire.

---

# 91. Dismiss ≠ resolve

```text
DismissNotification
¬⇒
ResolveProtectionAlert
```

---

# 92. Acknowledge ≠ complete

```text
AcknowledgeNotification
¬⇒
CompleteProcedure
```

---

# 93. Background Jobs et Domain Events

Un job peut provoquer un DomainEvent uniquement après validation du domaine.

Exemple :

```text
ExpirationCheckJob
→ ExpireRepresentationMandate command
→ Domain 05
→ representation-mandate.expired
```

---

# 94. Realtime contracts

Chaque surface realtime doit documenter :

- channel ;
- source projection ;
- filter ;
- permissions ;
- payload ;
- refetch action.

---

# 95. Notification contracts

Chaque catégorie doit documenter :

- source ;
- audience ;
- level ;
- message_key ;
- safe params ;
- allowed channels ;
- expiration ;
- dedup key.

---

# 96. Job contracts

Chaque job doit documenter :

- owner ;
- cadence ;
- input ;
- idempotency ;
- retry ;
- timeout ;
- concurrency ;
- failure handling.

---

# 97. Catalogue minimal V1 — Jobs

```text
ExpireRepresentationMandates
ExpireMissionScopes
CheckCredentialExpirations
CheckDocumentExpirations
CheckProcedureDeadlines
CheckManagementExpirations
CheckRentalEndings
CheckMaintenanceOverdue

DispatchOutbox
RetryInboxFailures
RetryNotificationDeliveries

RebuildReadModels
CleanupTemporaryUploads
TechnicalHealthCheck
```

---

# 98. Catalogue minimal V1 — Notifications

```text
SECURITY_ACCESS_CHANGED
DOCUMENT_ATTENTION_REQUIRED
PROCEDURE_ACTION_REQUIRED
PROCEDURE_APPOINTMENT_REMINDER
MISSION_STATUS_CHANGED
CONFLICT_ATTENTION_REQUIRED
PROTECTION_ALERT
ECONOMIC_PROJECT_ATTENTION
SYSTEM_SYNC_PROBLEM
SUPPORT_MESSAGE
```

---

# 99. Support Message

Les messages du service client restent distincts des notifications automatisées.

Une réponse support peut toutefois produire une notification in-app/push pour signaler un nouveau message.

---

# 100. Notifications de conflit

Le texte doit rester neutre.

Exemple :

> Une mise à jour concernant un dossier en désaccord nécessite votre attention.

Éviter :

> L’autre partie a tort.

---

# 101. Notifications de protection

Ne jamais présenter une alerte comme une conclusion juridique.

Exemple :

> Un document lié à votre dossier doit être vérifié.

---

# 102. Tests Realtime

### TEST-RT-001
Un utilisateur non autorisé ne reçoit pas la projection privée.

### TEST-RT-002
Une révocation d’accès empêche le refetch même si le channel était ouvert.

### TEST-RT-003
Une reconnexion reconstruit l’état depuis une query.

### TEST-RT-004
Un message realtime manqué ne casse pas la cohérence métier.

### TEST-RT-005
Un payload secret n’est pas publié dans un channel général.

---

# 103. Tests Notifications

### TEST-NOTIF-001
Un intent ne signifie pas DELIVERED.

### TEST-NOTIF-002
Un push échoué ne change pas l’état métier source.

### TEST-NOTIF-003
Un SMS ne contient pas de données sensibles interdites.

### TEST-NOTIF-004
Une intention expirée n’est pas livrée.

### TEST-NOTIF-005
Un retry ne crée pas plusieurs deliveries logiques.

### TEST-NOTIF-006
Une révocation d’audience supprime les futures deliveries non envoyées lorsque requis.

### TEST-NOTIF-007
Un clic revalide l’accès à la cible.

### TEST-NOTIF-008
Dismiss notification ne résout pas l’alerte.

---

# 104. Tests Jobs

### TEST-JOB-001
Deux runs de même occurrence sont idempotents.

### TEST-JOB-002
Un mandat expiré est réévalué par Domain 05.

### TEST-JOB-003
Un credential déjà renouvelé n’est pas marqué expiré par un job stale.

### TEST-JOB-004
Un job échoué peut être retryé.

### TEST-JOB-005
Un job FAILED_PERMANENT reste observable.

### TEST-JOB-006
Un job singleton ne s’exécute pas simultanément deux fois.

### TEST-JOB-007
Un cleanup ne supprime pas un document référencé.

### TEST-JOB-008
Un rebuild de projection ne modifie pas la source métier.

---

# 105. Invariants Realtime

### INV-RT-001
Realtime ne remplace jamais la source de vérité.

### INV-RT-002
Realtime ne contourne jamais RLS.

### INV-RT-003
Un signal realtime ne contient que le minimum utile.

### INV-RT-004
Un client doit pouvoir récupérer l’état correct sans avoir reçu chaque signal.

---

# 106. Invariants Notifications

### INV-NOTIF-001
NotificationIntent ≠ NotificationDelivery.

### INV-NOTIF-002
NotificationDelivery ≠ état métier source.

### INV-NOTIF-003
Le canal le plus restrictif impose son plafond de visibilité.

### INV-NOTIF-004
Aucune notification ne donne accès à une ressource sans autorisation actuelle.

### INV-NOTIF-005
La préférence utilisateur ne peut pas élargir la confidentialité.

### INV-NOTIF-006
Une notification dismissée ne résout pas l’objet métier.

### INV-NOTIF-007
Les retry sont idempotents.

### INV-NOTIF-008
Les détails secrets ne sont pas transportés dans Push/SMS par défaut.

---

# 107. Invariants Jobs

### INV-JOB-001
Un job technique ne décide pas directement d’un état métier complexe.

### INV-JOB-002
Le domaine propriétaire valide toute transition.

### INV-JOB-003
Les occurrences sont idempotentes.

### INV-JOB-004
Les échecs restent observables.

### INV-JOB-005
Une tâche planifiée utilise UTC + timezone explicite si récurrence locale.

### INV-JOB-006
Les jobs ne hard-delete pas l’historique patrimonial par défaut.

---

# 108. Architecture finale

```text
                    ┌──────────────┐
                    │ Domain Commit│
                    └──────┬───────┘
                           │
                     Domain Event
                           │
            ┌──────────────┼──────────────┐
            ▼              ▼              ▼
        Projection     Protection     ProcessManager
            │              │
            ▼              ▼
       Realtime       NotificationIntent
            │              │
            ▼              ▼
          Client     NotificationDelivery
                           │
                     Push/SMS/Email/InApp
```

Jobs :

```text
Scheduler
   │
   ▼
JobRun
   │
   ▼
Application Command
   │
   ▼
Owner Domain
   │
   ▼
Domain Event
```

---

# 109. Règle finale

> **Realtime informe, Notifications livrent, les Jobs déclenchent des réévaluations, mais seuls les domaines propriétaires décident de la vérité métier.**

> **Une alerte n’est pas une notification ; une notification n’est pas une décision ; un cron n’est pas une règle métier.**

> **Le système doit rester fonctionnel même si le realtime, le push ou un provider externe est temporairement indisponible.**

> **La formule normative est : Domain State → Event → Projection/Intent → Realtime or Delivery, tandis que Scheduler → Command → Domain → Event.**

---

**Fin — 19-REALTIME-NOTIFICATIONS-BACKGROUND-JOBS.md**  
**Version 1.0 — Document 19/27**
