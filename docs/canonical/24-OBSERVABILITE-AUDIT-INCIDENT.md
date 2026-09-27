# 24 — OBSERVABILITÉ / AUDIT / INCIDENT

**Projet :** Heritage Guardian / Fonciers  
**Statut :** CANONICAL — V1.0  
**Position :** 24/27  
**Type :** Spécification transverse observabilité, audit métier/sécurité, alerting technique, incidents et amélioration continue

---

# 1. Mission

Définir comment le système :

- mesure son état de santé ;
- suit ses flux inter-domaines ;
- détecte les anomalies ;
- conserve les actions sensibles ;
- diagnostique les erreurs ;
- alerte les opérateurs ;
- gère les incidents ;
- produit des postmortems utiles ;
- permet une reconstruction fiable de ce qui s’est passé.

---

# 2. Principe fondamental

```text
Observability
≠
Logging only
```

L’observabilité repose sur :

```text
Logs
+ Metrics
+ Traces
+ Audit
+ Alerts
+ Health Signals
```

---

# 3. Séparation essentielle

```text
Technical Log
≠
Business Audit
≠
Security Audit
≠
Domain Event
≠
ProtectionAlert
```

Chaque mécanisme répond à une question différente.

---

# 4. Questions auxquelles répondre

Le système doit pouvoir répondre à :

- Que s’est-il passé ?
- Quand ?
- Sur quelle ressource ?
- Quel utilisateur ou service a agi ?
- Avec quel rôle ?
- Pour quelle personne représentée ?
- Quelle commande a été exécutée ?
- Quel résultat a été produit ?
- Quels événements ont suivi ?
- Quelle erreur est survenue ?
- Quel composant est lent ou indisponible ?
- L’incident est-il encore actif ?
- Quelle donnée a pu être affectée ?

---

# 5. Trois piliers

## Logs

Événements techniques détaillés mais minimisés.

## Metrics

Mesures numériques agrégées.

## Traces

Suivi d’une requête ou workflow à travers plusieurs composants.

---

# 6. Audit comme quatrième pilier métier

L’audit conserve les actions significatives et sensibles.

Il doit être distinct des logs techniques.

---

# 7. Correlation ID

Toute interaction importante doit pouvoir utiliser :

```text
correlation_id
```

pour relier :

- requête API ;
- commande ;
- transaction ;
- événement ;
- ProcessManager ;
- job ;
- notification ;
- erreur.

---

# 8. Request ID

Chaque requête réseau possède :

```text
request_id
```

Le request_id suit l’appel technique.

Le correlation_id suit le workflow métier.

---

# 9. Causation ID

Pour les événements :

```text
causation_id
```

identifie la cause directe.

---

# 10. Structured logs

Les logs doivent être structurés.

Exemple :

```text
{
  timestamp,
  level,
  service,
  environment,
  request_id,
  correlation_id,
  operation,
  status,
  duration_ms,
  error_code
}
```

---

# 11. Log levels

```text
DEBUG
INFO
WARN
ERROR
CRITICAL
```

Production ne doit pas utiliser DEBUG en permanence sur des données sensibles.

---

# 12. Sensitive data redaction

Ne jamais logguer en clair :

- tokens ;
- service role ;
- mots de passe ;
- OTP ;
- contenu de volonté ;
- document complet ;
- données d’identité ;
- coordonnées exactes ;
- détails financiers sensibles ;
- cookies/session secrets.

---

# 13. Principal logging

Préférer :

- user_id technique ;
- hash/pseudonyme ;
- ref interne.

Éviter email/téléphone en clair.

---

# 14. Error logging

Une erreur serveur doit inclure :

- code ;
- composant ;
- stack technique interne ;
- correlation_id ;
- request_id ;
- contexte minimal safe.

---

# 15. Client error

Le frontend reçoit uniquement :

- code stable ;
- message_key ;
- retryable ;
- correlation_id si utile.

---

# 16. Frontend telemetry

Mesurer :

- crash ;
- route error ;
- performance ;
- sync conflict ;
- failed command ;
- failed upload.

Sans capturer les données privées des écrans.

---

# 17. Metrics categories

```text
AVAILABILITY
LATENCY
ERRORS
TRAFFIC
CAPACITY
BUSINESS_FLOW
SECURITY
SYNC
JOBS
NOTIFICATIONS
```

---

# 18. API metrics

Exemples :

```text
request_count
request_latency_p50
request_latency_p95
request_latency_p99
error_rate
rate_limit_count
timeout_count
```

---

# 19. Database metrics

Suivre :

- connections ;
- slow queries ;
- lock waits ;
- deadlocks ;
- CPU ;
- storage ;
- replication/availability si applicable.

---

# 20. Supabase metrics

Suivre selon capacités :

- auth errors ;
- DB performance ;
- Storage errors ;
- Realtime connections ;
- Edge Function errors ;
- cron/jobs.

---

# 21. Outbox metrics

```text
outbox_pending_count
outbox_oldest_pending_age
outbox_publish_failure_rate
outbox_dead_letter_count
```

---

# 22. Inbox metrics

```text
inbox_failed_count
inbox_retry_count
inbox_dead_letter_count
event_processing_latency
duplicate_event_count
```

---

# 23. Sync metrics

```text
pending_sync_operations
oldest_pending_sync_age
sync_success_rate
sync_failure_rate
sync_conflict_rate
upload_retry_count
```

---

# 24. Notification metrics

```text
notification_intents
delivery_success_rate
delivery_failure_rate
delivery_retry_count
delivery_oldest_pending_age
suppressed_notifications
expired_notifications
```

---

# 25. Job metrics

```text
job_runs
job_success_rate
job_failure_rate
job_lag
job_duration
job_retry_count
stuck_jobs
```

---

# 26. Search metrics

```text
search_latency
zero_result_rate
search_error_rate
index_staleness
index_rebuild_duration
unauthorized_result_filter_count
```

---

# 27. Vita metrics

```text
intent_resolution_rate
clarification_rate
tool_failure_rate
command_confirmation_rate
offline_assistant_usage
handoff_rate
user_correction_rate
```

---

# 28. Business flow metrics

Sans transformer les utilisateurs en simples chiffres, mesurer :

- dossiers créés ;
- procédures démarrées ;
- procédures bloquées ;
- documents manquants ;
- missions en attente ;
- alertes actives ;
- conflits actifs ;
- projets bloqués.

---

# 29. Metrics ≠ user truth

Les métriques servent au pilotage du système.

Elles ne doivent pas devenir la source de vérité métier.

---

# 30. Tracing

Toute requête complexe peut être représentée comme :

```text
Trace
└── Span API
    ├── Authorization
    ├── Domain Service
    ├── DB
    ├── Outbox
    └── External Provider
```

---

# 31. Trace span

Chaque span contient :

- span_id ;
- parent_span_id ;
- operation ;
- duration ;
- status ;
- tags safe.

---

# 32. Cross-domain trace

Un workflow comme :

```text
Conflict
→ Procedure
→ Professional mission
→ Procedure
```

doit conserver le même correlation_id.

---

# 33. Audit métier

L’audit métier répond à :

> Qui a changé quoi, dans quel contexte, avec quel résultat ?

---

# 34. AuditEvent

```text
AuditEvent {
  id

  actor_user_id?
  actor_person_id?
  acting_role?

  represented_person_id?
  mandate_id?

  action
  target_ref

  source_domain

  result
  reason_code?

  before_version?
  after_version?

  correlation_id
  occurred_at
}
```

---

# 35. Audit result

```text
SUCCEEDED
DENIED
FAILED
REVIEW_REQUIRED
PARTIAL
```

---

# 36. Audit actions critiques

Doivent être auditées :

- grant/revoke permission ;
- mandat ;
- MissionScope ;
- document secret access ;
- document verification ;
- conflict resolution ;
- procedure outcome ;
- transmission formalization ;
- economic financial mutation ;
- purge ;
- export ;
- support/admin access ;
- break-glass access.

---

# 37. Audit append-only

Les audits critiques sont append-only ou fortement protégés.

---

# 38. Audit correction

Une erreur d’audit ne doit pas être modifiée silencieusement.

Créer une entrée de correction ou annotation.

---

# 39. Audit visibility

Tous les utilisateurs ne voient pas l’audit complet.

Prévoir :

- history view utilisateur ;
- audit métier détaillé ;
- audit sécurité restreint.

---

# 40. Audit retention

Les durées sont définies selon criticité.

Les traces essentielles d’historique patrimonial peuvent avoir conservation longue.

---

# 41. Security audit

Doit capturer :

- login failure ;
- repeated access denial ;
- role change ;
- explicit deny ;
- session revoke ;
- secret access ;
- signed URL generation ;
- export ;
- admin action ;
- break-glass.

---

# 42. Audit vs ProtectionAlert

Une action de sécurité auditée ne produit pas nécessairement une alerte patrimoniale.

---

# 43. Alerting technique

Les alertes techniques doivent être basées sur seuils ou conditions significatives.

Exemples :

- error rate élevé ;
- DB indisponible ;
- outbox bloquée ;
- jobs en retard ;
- notifications bloquées ;
- Storage erreurs ;
- Realtime indisponible ;
- auth anomalies.

---

# 44. AlertSeverity

```text
INFO
WARNING
HIGH
CRITICAL
```

---

# 45. Alert fatigue

Éviter trop d’alertes.

Chaque alerte doit avoir :
- owner ;
- seuil ;
- action attendue ;
- runbook ;
- règle de résolution.

---

# 46. TechnicalAlert

```text
TechnicalAlert {
  id
  alert_type
  severity
  service
  metric
  threshold
  started_at
  status
  runbook_ref?
}
```

---

# 47. TechnicalAlertStatus

```text
OPEN
ACKNOWLEDGED
MITIGATING
RESOLVED
SUPPRESSED
```

---

# 48. SLI

Service Level Indicator = mesure.

Exemples :

- API success rate ;
- p95 latency ;
- sync success ;
- notification delivery ;
- job timeliness.

---

# 49. SLO

Service Level Objective = objectif.

Exemple conceptuel :

```text
99.5% des queries critiques réussissent
sur une fenêtre donnée
```

Les valeurs exactes doivent être réalistes et adaptées à l’infrastructure.

---

# 50. Error budget

Un SLO peut produire un error budget.

Quand le budget est dépassé :
- ralentir changements risqués ;
- prioriser fiabilité.

---

# 51. SLO V1 — catégories

Prévoir au minimum :

- disponibilité API ;
- latence query ;
- latence command ;
- sync ;
- outbox ;
- jobs critiques ;
- notifications critiques.

---

# 52. Health checks

```text
/liveness
/readiness
```

ou équivalent.

---

# 53. Liveness

Répond :

> Le processus est-il vivant ?

---

# 54. Readiness

Répond :

> Peut-il servir correctement du trafic ?

Peut vérifier :
- DB ;
- dépendances critiques ;
- migrations.

---

# 55. Dependency health

Chaque dépendance externe importante a un état :

```text
UP
DEGRADED
DOWN
UNKNOWN
```

---

# 56. Degraded mode

Si un fournisseur SMS est DOWN :

- app reste fonctionnelle ;
- intent reste en file ;
- IN_APP peut fonctionner ;
- retry est planifié.

---

# 57. Dashboard opérationnel

Minimum :

- disponibilité ;
- erreurs ;
- latence ;
- DB ;
- outbox ;
- inbox ;
- sync ;
- notifications ;
- jobs ;
- incidents actifs.

---

# 58. Dashboard métier

Peut montrer :

- dossiers actifs ;
- procédures bloquées ;
- documents manquants ;
- missions actives ;
- conflits ;
- alertes.

Sans exposer données personnelles inutiles.

---

# 59. Environment tags

Tous logs/metrics/traces incluent :

```text
environment
version
service
region?
```

---

# 60. Release version

Chaque erreur doit pouvoir être reliée à une version de déploiement.

---

# 61. Deployment markers

Lors d’un déploiement, enregistrer un marker.

Permet de corréler :
- hausse erreurs ;
- latence ;
- crash.

---

# 62. Incident

Un incident est un événement opérationnel affectant :

- disponibilité ;
- intégrité ;
- confidentialité ;
- performance ;
- sécurité.

---

# 63. IncidentSeverity

```text
SEV-1 CRITICAL
SEV-2 HIGH
SEV-3 MEDIUM
SEV-4 LOW
```

---

# 64. SEV-1

Exemples :

- fuite massive de données ;
- service totalement indisponible ;
- corruption critique ;
- service_role compromis.

---

# 65. SEV-2

Exemples :

- fonctionnalité majeure indisponible ;
- sync largement bloquée ;
- permissions incorrectes limitées ;
- notification critique en panne.

---

# 66. Incident lifecycle

```text
DETECTED
TRIAGED
CONTAINED
MITIGATING
RECOVERING
RESOLVED
POSTMORTEM
```

---

# 67. IncidentRecord

```text
IncidentRecord {
  id
  title
  severity
  status

  detected_at
  contained_at?
  resolved_at?

  affected_services[]
  affected_domains[]
  data_impact?

  owner
  communication_status

  root_cause?
  corrective_actions[]
}
```

---

# 68. Incident owner

Chaque incident a un responsable clairement identifié.

---

# 69. Incident timeline

Conserver :
- détection ;
- décisions ;
- changements ;
- mitigation ;
- recovery ;
- résolution.

---

# 70. Evidence preservation

Pour incident sécurité :
- ne pas supprimer logs pertinents ;
- préserver traces ;
- conserver versions ;
- contrôler accès.

---

# 71. Incident communication

Prévoir des messages :
- internes ;
- support ;
- utilisateurs si impact pertinent.

Ne pas spéculer avant validation.

---

# 72. User-facing incident message

Doit être :
- factuel ;
- clair ;
- sans jargon inutile ;
- sans révéler détails exploitables.

---

# 73. Postmortem

Tout incident majeur produit un postmortem.

---

# 74. Postmortem structure

```text
Summary
Impact
Timeline
Detection
Root cause
Contributing factors
What worked
What failed
Corrective actions
Owners
Deadlines
```

---

# 75. Blameless

Le postmortem recherche les causes système, pas un coupable individuel.

---

# 76. CorrectiveAction

```text
CorrectiveAction {
  id
  description
  owner
  priority
  due_date
  status
  verification
}
```

---

# 77. CorrectiveActionStatus

```text
OPEN
IN_PROGRESS
BLOCKED
DONE
VERIFIED
CANCELLED
```

---

# 78. Runbooks

Chaque alerte critique doit idéalement avoir un runbook.

Exemples :
- outbox blocked ;
- DB latency ;
- Storage outage ;
- service role leak ;
- notification queue stuck ;
- failed migrations.

---

# 79. Runbook structure

```text
Symptoms
Checks
Immediate mitigation
Escalation
Recovery
Verification
Rollback
```

---

# 80. Audit queryability

Les audits doivent être recherchables par :

- actor ;
- target ;
- action ;
- date ;
- correlation_id ;
- result ;
- domain.

---

# 81. Audit export

Restreint à rôles autorisés.

Toute export d’audit est lui-même audité.

---

# 82. Log retention

Définir par environnement :

- dev court ;
- staging moyen ;
- production adapté à diagnostic/obligations.

---

# 83. Metrics retention

Les séries agrégées peuvent être conservées plus longtemps que les logs bruts.

---

# 84. Trace sampling

Pour réduire coûts :

- toutes les erreurs ;
- échantillonnage du trafic normal ;
- toutes les commandes critiques si besoin.

---

# 85. Dynamic sampling

Peut augmenter pendant incident.

---

# 86. PII in traces

Aucune PII brute dans span attributes.

---

# 87. Frontend session replay

Si un outil de session replay est utilisé, masquer :
- champs personnels ;
- documents ;
- messages ;
- données financières ;
- secrets.

Par défaut, ne pas l’activer sur surfaces sensibles.

---

# 88. Crash reporting

Les crash reports doivent redacter :
- payload ;
- URL sensible ;
- headers auth.

---

# 89. Alert routing

Exemple :

```text
CRITICAL → on-call / security
HIGH     → owner service
WARNING  → dashboard + ticket
INFO     → dashboard
```

---

# 90. Escalation

Une alerte non reconnue dans le délai prévu peut être escaladée.

---

# 91. Maintenance window

Les alertes planifiées pendant maintenance peuvent être suppressées proprement.

---

# 92. Suppression ≠ deletion

Une alerte supprimée temporairement reste historisée.

---

# 93. Synthetic checks

Tester périodiquement :
- login ;
- Home ;
- query Asset ;
- upload léger ;
- procedure query.

Sans utiliser de vraies données sensibles.

---

# 94. Canary user / synthetic account

Utiliser un compte technique dédié.

Jamais un compte utilisateur réel.

---

# 95. Database audit

Surveiller :
- migrations ;
- schema changes ;
- RLS changes ;
- SECURITY DEFINER ;
- grants ;
- indexes.

---

# 96. RLS change audit

Toute modification RLS doit être liée à :
- commit ;
- ticket/ADR ;
- tests.

---

# 97. Release observability

Avant/pendant/après release :
- baseline ;
- deploy marker ;
- watch errors ;
- compare latency ;
- verify jobs/sync.

---

# 98. Rollback trigger

Exemples :
- forte hausse 5xx ;
- auth failure ;
- RLS regression ;
- data corruption ;
- migration failure.

---

# 99. No silent failure

Un traitement asynchrone ne doit jamais échouer silencieusement.

---

# 100. Stuck detection

Détecter :
- outbox event trop ancien ;
- job RUNNING trop longtemps ;
- sync pending trop long ;
- notification pending trop long.

---

# 101. Data integrity monitoring

Checks périodiques possibles :
- broken foreign refs ;
- duplicate active relations ;
- orphan DocumentFiles ;
- missing owner domain ;
- invalid status transitions.

---

# 102. Integrity issue

Une anomalie détectée ne doit pas être corrigée automatiquement si la réparation est ambiguë.

Créer une revue.

---

# 103. Event integrity

Vérifier :
- duplicate event_id ;
- sequence gap ;
- unsupported versions ;
- dead letters.

---

# 104. Security monitoring

Suivre :
- access denied spikes ;
- suspicious search ;
- signed URL spikes ;
- admin actions ;
- secret access ;
- auth failures.

---

# 105. Business anomaly monitoring

Exemples :
- nombre anormal de conflits créés ;
- masse de suppressions ;
- nombreuses révocations ;
- uploads soudains.

Une anomalie n’implique pas fraude.

---

# 106. Cost observability

Suivre :
- DB usage ;
- Storage ;
- bandwidth ;
- Edge Functions ;
- notifications externes ;
- logs.

---

# 107. Capacity planning

Identifier les tendances :
- croissance documents ;
- croissance events ;
- taille indexes ;
- notifications ;
- sync.

---

# 108. Performance budgets

Budgeter :
- API ;
- page load ;
- DB ;
- Search ;
- upload ;
- sync.

Les seuils précis seront testés au document 25.

---

# 109. Audit immutability tests

Vérifier qu’un rôle normal ne peut pas :
- update audit ;
- delete audit critique ;
- modifier actor/result.

---

# 110. Audit actor integrity

L’actor est dérivé du contexte serveur.

Pas du payload client.

---

# 111. Representation audit

Toujours conserver :
- actor ;
- represented person ;
- mandate ;
- acting role.

---

# 112. Maker-checker audit

Conserver maker et checker distincts.

---

# 113. Incident automation

Automatiser :
- création ticket ;
- capture métriques ;
- notification on-call.

Mais pas la décision finale de gravité sans règle claire.

---

# 114. Incident drills

Organiser périodiquement :
- restore backup ;
- provider outage ;
- outbox stuck ;
- revoked secret ;
- RLS regression simulation.

---

# 115. Recovery verification

Après incident :
- service healthy ;
- queues drain ;
- no data corruption ;
- permissions correctes ;
- user paths fonctionnels.

---

# 116. Audit API

Prévoir des queries sécurisées :

```text
ListAuditEvents
GetAuditEvent
ListSecurityEvents
ListIncidentTimeline
```

---

# 117. Audit pagination

Toujours paginée.

---

# 118. Audit filters

Whitelist uniquement.

---

# 119. Audit confidentiality

Les audits peuvent eux-mêmes contenir des informations sensibles.

Accès restreint.

---

# 120. Audit redaction

Selon rôle, afficher version redacted.

---

# 121. Support observability

Le support peut voir :
- état sync ;
- erreurs générales ;
- correlation_id ;
- statut technique.

Pas nécessairement le contenu patrimonial.

---

# 122. Correlation ID UX

Une erreur utilisateur peut afficher :

> Référence : ABC123

pour support.

Ne pas exposer IDs internes sensibles inutiles.

---

# 123. Metric labels

Éviter les labels à forte cardinalité :
- user_id ;
- document_id ;
- exact URL.

Préférer :
- domain ;
- operation ;
- status ;
- environment.

---

# 124. Trace cardinality

Même règle : éviter explosion des tags.

---

# 125. Observability backend

Une abstraction peut centraliser :

```text
logger
metrics
tracer
audit_writer
```

---

# 126. Domain observability

Chaque domaine expose ses métriques spécifiques, mais suit les conventions globales.

---

# 127. Ownership

Chaque dashboard/alerte a :
- owner ;
- reviewer ;
- escalation target.

---

# 128. Documentation

Tout nouveau service doit documenter :
- logs ;
- metrics ;
- alerts ;
- runbooks ;
- audit events ;
- SLO.

---

# 129. Tests logs

### TEST-OBS-001
Une erreur serveur produit correlation_id.

### TEST-OBS-002
Les logs n’affichent pas token.

### TEST-OBS-003
Un document secret n’est pas loggé.

---

# 130. Tests metrics

### TEST-OBS-004
Une requête API incrémente request_count.

### TEST-OBS-005
Une erreur incrémente error metric.

### TEST-OBS-006
Un job failed apparaît dans metrics.

---

# 131. Tests traces

### TEST-OBS-007
Une commande cross-domain conserve correlation_id.

### TEST-OBS-008
Un span DB est relié au span API.

---

# 132. Tests audit

### TEST-OBS-009
Permission revocation crée audit.

### TEST-OBS-010
Secret access crée audit.

### TEST-OBS-011
Un rôle normal ne modifie pas audit.

### TEST-OBS-012
Representation conserve actor + represented.

---

# 133. Tests alerts

### TEST-OBS-013
Outbox bloquée déclenche alerte.

### TEST-OBS-014
Alerte résolue se ferme.

### TEST-OBS-015
Une alerte maintenance n’envoie pas faux incident.

---

# 134. Tests incident

### TEST-OBS-016
Un incident possède severity, owner, timeline.

### TEST-OBS-017
Un incident majeur produit postmortem.

### TEST-OBS-018
Les corrective actions ont owner et statut.

---

# 135. Tests privacy

### TEST-OBS-019
Aucune PII brute dans métriques.

### TEST-OBS-020
Session replay masque les champs sensibles.

---

# 136. Invariants Observabilité

### INV-OBS-001
Aucune erreur critique ne doit être silencieuse.

### INV-OBS-002
Correlation ID traverse les workflows majeurs.

### INV-OBS-003
Logs, metrics et traces minimisent les données sensibles.

### INV-OBS-004
Audit métier et log technique restent séparés.

### INV-OBS-005
Les audits critiques sont append-only/protégés.

### INV-OBS-006
Chaque alerte critique possède owner et runbook.

### INV-OBS-007
Un incident majeur produit postmortem.

### INV-OBS-008
Les métriques n’utilisent pas de labels PII à haute cardinalité.

### INV-OBS-009
Les jobs/queues bloqués sont détectables.

### INV-OBS-010
La restauration après incident est vérifiée.

---

# 137. Architecture finale

```text
Application
   │
   ├── Logs
   ├── Metrics
   ├── Traces
   ├── Audit
   │
   ▼
Observability Platform
   │
   ├── Dashboards
   ├── Alerts
   ├── Incident Detection
   └── Reporting
```

Incident :

```text
Signal
↓
Alert
↓
Triage
↓
Containment
↓
Recovery
↓
Resolution
↓
Postmortem
↓
Corrective Actions
```

---

# 138. Règle finale

> **Un système de production doit être capable d’expliquer son propre comportement.**

> **Les logs racontent ce que le logiciel a fait, les métriques montrent comment il se comporte, les traces relient les opérations, l’audit prouve les actions sensibles et les incidents structurent la réponse lorsque quelque chose se passe mal.**

> **L’observabilité ne doit jamais devenir une nouvelle fuite de données : chaque signal technique est minimisé, redacted et séparé des contenus patrimoniaux sensibles.**

> **La formule normative est : Instrument → Correlate → Detect → Alert → Triage → Recover → Audit → Learn.**

---

**Fin — 24-OBSERVABILITE-AUDIT-INCIDENT.md**  
**Version 1.0 — Document 24/27**
