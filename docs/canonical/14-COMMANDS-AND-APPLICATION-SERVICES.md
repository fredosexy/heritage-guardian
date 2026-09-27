# 14 — COMMANDES ET APPLICATION SERVICES

**Statut : CANONICAL — V1.0**

## 1. Mission

Définir la manière unique d’exécuter une intention utilisateur ou système, d’orchestrer les cas d’usage, d’appliquer autorisations/invariants, de garantir l’idempotence et de produire les événements/audits nécessaires.

## 2. Principe

```text
Intent
→ Command
→ Application Service
→ Authorization
→ Domain
→ Transaction
→ Events / Audit
→ Result
```

Une commande demande une action. Elle n’est ni un événement, ni un DTO de persistence.

## 3. CommandEnvelope

```text
CommandEnvelope<TPayload> {
  command_id
  command_name
  command_version

  target_domain
  target_entity_type?
  target_entity_id?

  action_context

  idempotency_key?
  expected_version?

  issued_at

  payload
}
```

## 4. ActionContext

```text
ActionContext {
  actor_user_id
  actor_person_id?

  acting_role?

  represented_person_id?
  mandate_id?

  correlation_id
  causation_id?

  locale?
  client_context?
}
```

Toute action représentée conserve l’acteur réel.

## 5. Nommage

Convention :
```text
<Verb><Aggregate>
```

Exemples :
`CreateProcedureCase`,
`ContestDocument`,
`RevokeRepresentationMandate`,
`RecordIncome`.

Pas de noms ambigus comme `UpdateEverything`.

## 6. Version

Une commande publique/inter-domaine possède `command_version`. Un breaking change du payload incrémente la version.

## 7. Application Service

Responsabilités :
- charger le contexte ;
- contrôler l’autorisation ;
- valider les références étrangères ;
- charger l’agrégat local ;
- invoquer le comportement métier ;
- persister ;
- produire audit/outbox ;
- retourner un résultat typé.

Il ne doit pas réimplémenter les invariants de l’agrégat.

## 8. Pipeline normatif

```text
Receive Command
↓
Validate envelope/schema
↓
Resolve ActionContext
↓
Idempotency lookup
↓
Authorization
↓
Foreign-reference validation
↓
Expected-version check
↓
Load aggregate
↓
Domain invariant validation
↓
Apply behavior
↓
Persist local transaction
↓
Audit + Outbox
↓
Store idempotent result
↓
Return CommandResult
```

## 9. CommandResult

```text
CommandResult {
  command_id
  status
  target_ref?
  resulting_version?
  emitted_event_ids[]
  warnings[]
  error?
}
```

Status :
`SUCCEEDED`, `ACCEPTED_ASYNC`, `REVIEW_REQUIRED`, `REJECTED`, `NOT_AUTHORIZED`, `CONFLICT`, `FAILED`.

## 10. Idempotence

Toute commande sensible/retryable doit porter une `idempotency_key`.

```text
same principal
+ same command_name
+ same idempotency_key
→ same logical result
```

Les paiements n’existent pas ici, mais revenus, dépenses, contributions, créations offline et actions d’alerte doivent éviter les doublons.

## 11. Table conceptuelle

```text
command_idempotency_records {
  principal_id
  command_name
  idempotency_key
  request_hash
  result_status
  result_payload
  target_ref
  created_at
  expires_at?
}
```

Une même clé avec payload différent produit `IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_PAYLOAD`.

## 12. Optimistic concurrency

Les agrégats sensibles utilisent `expected_version`.

Si :
```text
expected_version != current_version
```
alors :
`CONCURRENT_MODIFICATION`.

Pas de last-write-wins silencieux.

## 13. Commande locale

Une commande locale cible son propre domaine et s’exécute dans une transaction locale.

## 14. Commande inter-domaine

Un orchestrateur peut appeler le `PublicApi` d’un autre domaine.

Exemples :
- `RequestProcedureCreation`
- `RequestDocumentReview`
- `RequestProfessionalIntervention`
- `RequestConflictReview`
- `RequestProtectionMonitoring`
- `RequestTransmissionReview`

La cible applique toujours ses propres règles.

## 15. Résultat inter-domaine

```text
ACCEPTED
REJECTED
REVIEW_REQUIRED
NOT_AUTHORIZED
INVALID_STATE
CONFLICT
```

Le caller ne force jamais la décision de la cible.

## 16. Commande synchrone vs asynchrone

Synchrone lorsque le résultat immédiat est requis pour poursuivre une interaction courte.

Asynchrone lorsqu’un workflow long peut attendre un événement.

```text
command
→ ACCEPTED_ASYNC
→ event later
```

## 17. ProcessManager

Un ProcessManager envoie des commandes et attend des événements. Il ne modifie pas directement les tables participantes.

## 18. Notification delivery

Commande canonique transverse :

```text
RequestNotificationDelivery {
  notification_intent_id
  recipient_id
  notification_level
  visibility_level
  message_key
  safe_params
  allowed_channels
}
```

Elle est distincte de l’événement `protection.notification-intent.recorded`.

## 19. Validation des références étrangères

Un Application Service peut appeler :
- `validateReference`
- `getCurrentState`
- `checkAccess`

Une référence existante n’implique pas permission.

## 20. Transactions

Chaque commande écrit uniquement dans le domaine propriétaire, hors tables transverses explicitement prévues (idempotence/audit/outbox).

## 21. Effets secondaires

Aucun email/push externe ne doit être envoyé avant commit métier. Utiliser outbox/intention.

## 22. Erreurs métier standard

```text
COMMAND_INVALID
COMMAND_VERSION_UNSUPPORTED
COMMAND_NOT_AUTHORIZED
COMMAND_INVALID_STATE
COMMAND_PRECONDITION_FAILED
COMMAND_REFERENCE_NOT_FOUND
COMMAND_REFERENCE_STALE
COMMAND_DEPENDENCY_UNSATISFIED
COMMAND_CONCURRENT_MODIFICATION
COMMAND_REVIEW_REQUIRED
COMMAND_ALREADY_PROCESSED
IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_PAYLOAD
```

## 23. ApplicationServiceResponse

Les erreurs internes ne doivent pas exposer SQL, stack trace ou secrets au frontend.

## 24. Validation client ≠ sécurité

Le frontend peut valider pour l’UX, mais la commande serveur applique toujours la validation autoritative.

## 25. Audit

Les commandes sensibles enregistrent :
`command_id`, acteur, acting_role, représenté, cible, action, résultat, reason_code, correlation_id.

## 26. Command catalog

Chaque domaine maintient ses commandes publiques dans :
```text
modules/<domain>/public-api/commands/
```

Les commandes purement internes peuvent rester dans `application/commands`.

## 27. Tests

- schéma de commande valide/invalide ;
- autorisation refusée ;
- mandat expiré ;
- idempotency retry ;
- idempotency mismatch ;
- expected_version conflict ;
- foreign ref stale ;
- target-domain rejection ;
- transaction rollback ;
- outbox atomique ;
- partial success d’orchestrateur.

## 28. Invariants

1. Une commande ne contourne jamais l’autorisation.
2. Une commande inter-domaine n’écrit jamais dans la table étrangère.
3. Une mutation sensible possède une stratégie d’idempotence/concurrence.
4. Le domaine cible décide.
5. Une réponse `SUCCEEDED` n’est retournée qu’après commit.
6. Les effets externes sont découplés du commit.
7. Toute représentation garde acteur + mandat.
8. Application Service orchestre ; Aggregate décide.
