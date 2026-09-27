# 18 — API ET CONTRATS FRONTEND / BACKEND

**Projet :** Heritage Guardian / Fonciers  
**Statut :** CANONICAL — V1.0  
**Position :** 18/27  
**Type :** Spécification d’architecture applicative, contrats frontend/backend, queries, mutations, uploads, realtime et erreurs

---

# 1. Mission

Définir les frontières stables entre :

- UI ;
- hooks et clients applicatifs ;
- Application Services ;
- Supabase/PostgreSQL ;
- RPC ;
- Edge Functions ;
- Storage ;
- Realtime ;
- domaines métier 00 à 11.

L’objectif est d’éviter que le frontend devienne une seconde couche métier ou qu’une table Supabase soit utilisée comme une API publique implicite.

---

# 2. Principe architectural

~~~text
UI
↓
Feature Hook / Application Client
↓
Public Application Contract
↓
Backend / Application Service
↓
Domain
↓
Repository
↓
PostgreSQL / Storage
~~~

Pour les opérations sensibles :

~~~text
Component
¬→ direct sensitive SQL
~~~

---

# 3. Contrats supportés

La V1 distingue :

~~~text
QUERY
COMMAND
PROJECTION
UPLOAD
REALTIME_SIGNAL
AUTHORIZATION_CHECK
INTEGRATION_CALLBACK
~~~

Chaque type possède une sémantique propre.

---

# 4. QUERY

Une query demande l’état actuel ou une projection.

Exemples :

~~~text
GetAssetSummary
GetInheritanceCase
ListMyAssets
GetProcedureCase
SearchProfessionals
GetProtectionSummary
GetEconomicSummary
~~~

Une query ne doit produire aucun effet métier.

---

# 5. COMMAND

Toute mutation métier utilise le modèle du document 14.

Exemples :

~~~text
CreateAsset
CreateProcedureCase
ContestDocument
AddActivityOperator
RecordIncome
ResolveConflictImpact
~~~

Une commande est validée côté serveur même si le frontend a déjà effectué une validation UX.

---

# 6. PROJECTION

Une projection est un modèle de lecture adapté à un écran ou à un use case.

~~~text
Projection
≠
Domain Entity
≠
Database Row
~~~

Exemple :

~~~text
AssetSummaryDTO {
  id
  title
  type
  general_location
  situation
  open_alert_count
  next_action?
}
~~~

Ne pas exposer les contacts privés ou coordonnées exactes sans besoin et permission.

---

# 7. UPLOAD

Le transfert d’un fichier est un flux technique distinct de la création du document métier.

~~~text
Request upload authorization
↓
Upload bytes
↓
Validate checksum / metadata
↓
Create DocumentFile
↓
Link to Document / target
~~~

---

# 8. REALTIME_SIGNAL

Le realtime informe le client qu’une donnée ou projection autorisée a changé.

Il ne devient pas la source de vérité.

~~~text
Realtime signal
↓
Authorized refetch / projection refresh
~~~

---

# 9. AUTHORIZATION_CHECK

Un check d’autorisation peut être utilisé pour l’UX.

Mais :

~~~text
Frontend authorization check
≠
Server authorization enforcement
~~~

Toute mutation sensible est revérifiée au moment de la commande.

---

# 10. DTO publics

Les DTO publics ne doivent exposer que les informations nécessaires au use case.

~~~text
DatabaseRow
≠
DomainEntity
≠
PublicDTO
~~~

Une colonne interne n’est pas automatiquement un champ d’API.

---

# 11. Séparation lecture / écriture

Lecture :

~~~text
Query
→ Read Model / Repository
→ DTO
~~~

Écriture :

~~~text
Command
→ Application Service
→ Aggregate
→ Transaction
→ Event / Audit
~~~

---

# 12. QueryEnvelope

Format conceptuel :

~~~text
QueryEnvelope<TFilters> {
  query_name
  query_version
  target_domain
  filters
  pagination?
  sort?
  request_id
}
~~~

L’identité du principal n’est pas prise comme vérité depuis le payload client ; elle est résolue depuis la session.

---

# 13. QueryResult

~~~text
QueryResult<T> {
  data
  meta {
    generated_at
    projection_version?
    next_cursor?
    has_more?
  }
}
~~~

---

# 14. CommandEnvelope

Référence canonique au document 14 :

~~~text
CommandEnvelope<TPayload> {
  command_id
  command_name
  command_version
  target_domain
  target_entity_type?
  target_entity_id?
  idempotency_key?
  expected_version?
  payload
}
~~~

Le serveur complète le contexte d’action à partir de la session et des autorisations actuelles.

---

# 15. Identité côté serveur

Le backend dérive actor_user_id depuis la session authentifiée.

Le client ne peut pas choisir arbitrairement l’utilisateur qui exécute la commande.

---

# 16. Représentation

Lorsqu’un utilisateur agit pour une autre personne, le frontend peut indiquer le mandat ou le contexte représenté.

Le serveur valide :

- existence ;
- validité ;
- scope ;
- permission ;
- absence de révocation.

---

# 17. Validation d’entrée

Toute entrée backend doit passer par :

~~~text
schema validation
→ normalization
→ size / shape limits
→ authentication
→ authorization
→ foreign reference validation
→ domain invariants
~~~

---

# 18. Runtime schemas

Les contrats publics doivent disposer de validateurs runtime.

Exemples possibles :

- Zod ;
- JSON Schema ;
- autre système typé compatible.

La technologie exacte peut évoluer sans changer la sémantique du contrat.

---

# 19. TypeScript

Les types TypeScript doivent idéalement être dérivés de la même source que le schéma runtime ou vérifiés automatiquement contre lui.

Éviter :

~~~text
TypeScript contract
≠
runtime contract
~~~

---

# 20. Versionnement

Chaque contrat public doit être versionnable.

~~~text
query_version
command_version
dto_version when necessary
~~~

Un breaking change ne modifie pas silencieusement un contrat déjà publié.

---

# 21. Backward compatibility PWA

Une PWA installée peut rester ouverte avec une ancienne version.

Le backend doit donc prévoir :

- courte fenêtre de compatibilité ;
- erreurs de version explicites ;
- stratégie de migration ;
- message d’upgrade lorsqu’une ancienne version n’est plus supportée.

---

# 22. Version minimale supportée

Le serveur peut exposer :

~~~text
minimum_supported_client_version
recommended_client_version
~~~

si nécessaire.

Une incompatibilité de sécurité peut forcer une mise à jour.

---

# 23. Erreur publique

Format conceptuel :

~~~text
ApiError {
  code
  message_key
  safe_params?
  field_errors?
  correlation_id?
  retryable
}
~~~

---

# 24. Sécurité des erreurs

Ne jamais exposer :

- SQL ;
- stack trace ;
- noms de policies sensibles ;
- secrets ;
- service role ;
- données d’autres utilisateurs ;
- contenu documentaire confidentiel.

---

# 25. Codes HTTP

Lorsque HTTP est utilisé :

~~~text
200 Query success
201 Resource created
202 Accepted async
400 Invalid schema/request
401 Unauthenticated
403 Unauthorized
404 Not found / not accessible
409 Conflict / optimistic concurrency / idempotency mismatch
422 Domain precondition failed
429 Rate limited
5xx Technical failure
~~~

Le code HTTP ne remplace pas le ApiError.code.

---

# 26. Codes API transverses

~~~text
API_INVALID_REQUEST
API_VERSION_UNSUPPORTED
API_UNAUTHENTICATED
API_NOT_AUTHORIZED
API_RESOURCE_NOT_FOUND
API_CONCURRENT_MODIFICATION
API_PRECONDITION_FAILED
API_RATE_LIMITED
API_TEMPORARILY_UNAVAILABLE
API_INTERNAL_ERROR
~~~

---

# 27. Pagination

Préférer la pagination par curseur pour :

- timelines ;
- messages ;
- documents ;
- événements ;
- recherche ;
- audit ;
- notifications.

---

# 28. Pagination contract

~~~text
PageRequest {
  cursor?
  limit
}

PageResult<T> {
  items[]
  next_cursor?
  has_more
}
~~~

Le serveur impose une limite maximale.

---

# 29. Offset pagination

Peut être utilisée sur de petites listes stables.

Elle ne doit pas être le mécanisme par défaut pour les grandes timelines évolutives.

---

# 30. Filtres

Les filtres sont whitelistés.

Exemple :

~~~text
status
category
date_range
zone
type
~~~

Aucun filtre client ne doit être injecté comme fragment SQL brut.

---

# 31. Tri

Les champs triables sont whitelistés.

~~~text
sort_by
sort_direction
~~~

Le ranking métier complexe appartient au domaine ou au moteur de recherche.

---

# 32. Recherche

Les queries de recherche utilisent le document 20 comme source de vérité.

Le frontend ne lit pas directement toutes les tables pour simuler un moteur de recherche.

---

# 33. RLS

Toute table exposée directement via Supabase client doit avoir une RLS complète.

~~~text
DENY BY DEFAULT
~~~

Un filtre frontend n’est jamais une autorisation.

---

# 34. Direct Supabase Reads

Ils sont autorisés uniquement lorsque :

- le read model est simple ;
- la RLS exprime entièrement les droits ;
- aucune logique métier sensible n’est contournée ;
- le DTO retourné est adapté.

---

# 35. RPC

Préférer une RPC/application service lorsqu’une opération exige :

- plusieurs validations ;
- transaction métier ;
- agrégat complexe ;
- contrôle d’autorisation riche ;
- idempotence ;
- audit ;
- plusieurs écritures dans le même domaine.

---

# 36. Règle RPC

Une RPC ne doit pas devenir :

~~~text
global_super_rpc()
~~~

capable de modifier arbitrairement tous les domaines.

---

# 37. Edge Functions

Utiliser lorsque nécessaire pour :

- secrets serveur ;
- appels à services externes ;
- webhook ;
- orchestration sécurisée ;
- traitement serveur isolé ;
- push/SMS/email ;
- tâches nécessitant une frontière hors client.

---

# 38. Edge Function ≠ Domain

Une Edge Function appelle l’Application Layer.

Elle ne devient pas propriétaire des invariants métier.

---

# 39. Upload — autorisation

Avant l’upload, le backend vérifie :

- principal ;
- cible ;
- type attendu ;
- taille max ;
- scope ;
- confidentialité.

---

# 40. Storage

Buckets privés par défaut pour :

- documents ;
- audio ;
- médias patrimoniaux ;
- preuves.

Les avatars et assets publics peuvent avoir une politique distincte.

---

# 41. Signed URLs

Les ressources privées utilisent des URLs signées limitées dans le temps lorsqu’un accès direct au fichier est nécessaire.

---

# 42. File validation

Vérifier :

- taille ;
- checksum ;
- type réel autant que possible ;
- extension ;
- MIME ;
- catégorie autorisée.

Le MIME envoyé par le navigateur ne constitue pas une preuve suffisante.

---

# 43. Upload resumable

Pour réseau faible, les gros fichiers doivent pouvoir utiliser une stratégie de reprise lorsque la stack choisie le permet.

La queue offline est définie par le document 17.

---

# 44. Idempotence upload

Le retry ne doit pas créer plusieurs DocumentFile pour le même upload logique.

Clés possibles :

~~~text
idempotency_key
checksum
client_file_id
~~~

---

# 45. Realtime

Supabase Realtime est utilisé uniquement pour les données ou projections qui bénéficient réellement d’une mise à jour live.

---

# 46. Realtime ≠ autorisation permanente

Une subscription ouverte avant une révocation ne garantit aucun accès futur.

La RLS et les queries serveur restent autoritatives.

---

# 47. Realtime payload

Préférer :

~~~text
resource_id
change_kind
projection_hint
version
~~~

plutôt qu’un document métier complet.

---

# 48. Re-fetch

Pour une ressource sensible :

~~~text
RealtimeSignal
→ authorized query
→ fresh projection
~~~

---

# 49. Optimistic UI

Autorisé pour actions à faible risque.

Pour les actions sensibles :

~~~text
PENDING
→ server confirmation
→ CONFIRMED
~~~

Ne jamais afficher une transmission ou décision patrimoniale comme finalisée avant confirmation serveur.

---

# 50. Cache

Le cache client doit être :

- scope-aware ;
- principal-aware ;
- version-aware lorsque nécessaire ;
- invalidable.

Les données privées de deux comptes ne doivent jamais être mélangées.

---

# 51. ETag / projection version

Les projections peuvent exposer une version ou un hash permettant d’éviter des refetch inutiles.

Cela ne remplace pas la version métier de l’agrégat.

---

# 52. Rate limiting

Appliquer selon :

~~~text
principal
+ command/query
+ resource
+ time window
~~~

---

# 53. Actions à limiter fortement

Notamment :

- authentification répétée ;
- invitations ;
- uploads ;
- demandes d’accès ;
- création de signalements ;
- notifications ;
- recherches coûteuses ;
- génération de signed URLs ;
- tentatives d’accès sensibles.

---

# 54. Rate limit response

Retourner :

~~~text
API_RATE_LIMITED
retryable = true
retry_after
~~~

sans dévoiler les règles internes de défense.

---

# 55. Requêtes coûteuses

Le backend impose :

- limites ;
- pagination ;
- profondeur maximale ;
- filtres autorisés ;
- timeouts.

---

# 56. N+1

Les projections doivent éviter les appels N+1 massifs.

Préférer :

- read model ;
- repository spécialisé ;
- query serveur ;
- batch.

---

# 57. Query inter-domaine

Une query transverse appelle les public APIs ou read models appropriés.

Elle ne crée pas une jointure métier géante difficile à sécuriser lorsqu’une projection dédiée est préférable.

---

# 58. Home

La Home utilise des projections :

~~~text
AssetSummary
CaseSummary
ProcedureSummary
ProtectionSummary
EconomicSummary
~~~

Elle ne lit pas arbitrairement les tables maîtres.

---

# 59. Vita

Vita utilise les mêmes commandes et queries que l’UI.

Il n’existe pas d’API permettant à l’assistant de contourner les domaines ou permissions.

---

# 60. Client-generated IDs

Pour l’offline-first, certaines commandes de création acceptent un UUID client.

Le serveur valide unicité et idempotence.

---

# 61. Request IDs

Chaque interaction réseau importante possède un request_id.

Le correlation_id suit le workflow métier ; le request_id suit la requête technique.

---

# 62. Observabilité

Logs sûrs :

~~~text
request_id
correlation_id
principal_ref
contract_name
contract_version
status
duration
error_code
~~~

Pas de payload sensible complet.

---

# 63. Timeouts

Toute intégration externe ou query lourde possède un timeout.

Un timeout n’est pas interprété comme un résultat métier négatif.

---

# 64. Retry client

Retry automatique uniquement sur erreurs explicitement retryables.

Une mutation retryable réutilise la même idempotency_key.

---

# 65. Retry interdit automatiquement

Ne pas retry automatiquement :

- authorization deny ;
- invalid state ;
- schema invalid ;
- version conflict nécessitant intervention ;
- idempotency mismatch.

---

# 66. Webhooks / callbacks externes

Tout callback externe doit :

- vérifier signature/authenticité si disponible ;
- être idempotent ;
- conserver external_reference ;
- valider le payload ;
- produire une commande locale ou enregistrer un fait externe ;
- ne jamais écrire directement les tables métier en contournant Application Service.

---

# 67. Documentation API

Chaque contrat public documente :

~~~text
name
version
purpose
input
output
permissions
errors
idempotency
pagination
confidentiality
examples
~~~

---

# 68. Contract Registry

~~~text
ApiContract {
  contract_name
  contract_type
  version
  owner_domain
  status
  schema_ref
  permissions[]
}
~~~

---

# 69. ContractStatus

~~~text
DRAFT
ACTIVE
DEPRECATED
RETIRED
~~~

---

# 70. Deprecation

Une API dépréciée reste supportée pendant la fenêtre annoncée.

Les nouveaux consumers ne doivent plus l’utiliser.

---

# 71. Tests contractuels

Chaque API publique doit avoir :

- valid input ;
- invalid input ;
- unauthorized ;
- absence de champs interdits ;
- version test ;
- error mapping ;
- idempotency/concurrency si mutation.

---

# 72. Tests RLS

Les chemins basés sur Supabase direct doivent être testés avec :

- owner ;
- participant autorisé ;
- unrelated user ;
- explicit deny ;
- expired mandate ;
- revoked MissionScope ;
- secret resource.

---

# 73. Tests upload

- fichier autorisé ;
- oversized ;
- mauvais type ;
- retry ;
- checksum duplicate ;
- scope révoqué avant finalisation ;
- signed URL expirée.

---

# 74. Tests realtime

- subscription autorisée ;
- signal reçu ;
- refetch ;
- accès révoqué ;
- donnée secrète non exposée ;
- reconnect ;
- out-of-order update.

---

# 75. Tests compatibilité

- ancien client encore supporté ;
- version retirée ;
- breaking change ;
- champ optionnel ajouté ;
- enum inconnu géré proprement.

---

# 76. Invariants API

### INV-API-001
Un composant UI ne contient pas de logique d’autorisation critique.

### INV-API-002
Une table SQL n’est pas automatiquement une API métier.

### INV-API-003
Une mutation métier passe par une commande.

### INV-API-004
L’identité serveur provient de la session validée.

### INV-API-005
Les DTO publics minimisent les données.

### INV-API-006
Une query n’a pas d’effet métier.

### INV-API-007
Realtime n’est pas la source de vérité.

### INV-API-008
Une signed URL n’accorde pas un accès permanent.

### INV-API-009
Une RPC ne contourne pas le domaine propriétaire.

### INV-API-010
Une Edge Function ne devient pas un God Service.

### INV-API-011
Tout retry de mutation conserve la même idempotency_key.

### INV-API-012
Une erreur publique ne révèle aucun secret interne.

### INV-API-013
Toute liste potentiellement grande est bornée et paginée.

### INV-API-014
Un filtre client ne produit jamais de SQL arbitraire.

### INV-API-015
Le backend reste compatible avec l’offline et le versionnement définis aux documents 14 et 17.

---

# 77. Architecture cible

~~~text
React Component
     │
     ▼
Feature Hook
     │
     ▼
Application Client
     │
     ├── Query Contract
     ├── Command Contract
     └── Upload Contract
            │
            ▼
   Server Application Layer
            │
      ┌─────┼─────┐
      ▼     ▼     ▼
   Domain  RLS   Storage
      │
      ▼
 PostgreSQL
~~~

---

# 78. Flux mutation

~~~text
User action
↓
Client validation
↓
CommandEnvelope
↓
Session authentication
↓
Authorization
↓
Application Service
↓
Domain invariant
↓
DB transaction
↓
Audit + Outbox
↓
CommandResult
↓
UI refresh
~~~

---

# 79. Flux lecture

~~~text
Screen
↓
Query
↓
Authorization / RLS
↓
Read Model
↓
Minimal DTO
↓
Cache
↓
UI
~~~

---

# 80. Règle finale

> **Le frontend exprime des intentions et consomme des projections ; il ne possède ni la vérité métier ni la sécurité.**

> **Les commandes sont la frontière des mutations, les queries la frontière des lectures, les DTO la frontière des données exposées et la RLS la protection de dernier ressort pour les accès directs Supabase.**

> **Realtime signale qu’un changement a eu lieu ; une query autorisée confirme l’état actuel.**

> **La formule normative est : UI → Contract → Authentication → Authorization → Application Service → Domain → Persistence → Safe Result.**

---

**Fin — 18-API-ET-CONTRATS-FRONTEND-BACKEND.md**  
**Version 1.0 — Document 18/27**
