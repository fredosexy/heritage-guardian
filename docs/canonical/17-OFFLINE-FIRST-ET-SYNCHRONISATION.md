# 17 — OFFLINE-FIRST ET SYNCHRONISATION GLOBALE

**Statut : CANONICAL — V1.0**

## 1. Mission

Garantir l’utilisation en zones rurales, réseau faible ou interrompu, tout en évitant doublons, pertes, écrasements silencieux et actions non autorisées après reconnexion.

## 2. Principe

```text
Offline-capable
≠
Offline-trusted
```

Le client peut préparer des actions ; le serveur reste autoritatif pour sécurité et invariants.

## 3. Capacités V1

- lecture cache autorisée ;
- création/modification de drafts ;
- commandes offline autorisées ;
- outbox client persistante ;
- uploads différés ;
- reprise réseau ;
- résolution explicite des conflits sensibles.

## 4. Local stores

Séparer :
- cache de lecture ;
- drafts ;
- client outbox ;
- upload queue ;
- sync metadata.

## 5. SyncStatus

```text
LOCAL_DRAFT
PENDING_SYNC
SYNCING
SYNCED
SYNC_FAILED
SYNC_CONFLICT
CANCELLED
```

## 6. LocalOperation

```text
LocalOperation {
  operation_id
  target_domain
  command_name
  command_version

  aggregate_id?
  payload

  base_version?
  idempotency_key

  dependency_operation_ids[]

  created_at
  status
  retry_count
  last_error_code?
}
```

## 7. UUID client

Les nouvelles entités autorisées utilisent UUID stable généré avant connexion au serveur.

Cela permet :
```text
Create Person P1
→ Create Asset A1 referencing P1
→ Create Activity AC1 referencing A1
```

## 8. Dependency graph

Le SyncOrchestrator ordonne les opérations selon `dependency_operation_ids`.

Il ne décide pas des règles métier.

## 9. Client Outbox

Persistante même après fermeture de l’application.

Une opération n’est supprimée qu’après confirmation serveur ou annulation explicite.

## 10. Idempotency

Toute opération envoyable plusieurs fois possède `idempotency_key`.

Retry réseau ne crée jamais de duplication logique.

## 11. base_version

Les modifications d’agrégats existants portent la version connue lors de l’édition.

Si la version serveur a changé :
`SYNC_CONFLICT`.

## 12. Conflits

Catégories :
- non sensible et fusionnable ;
- sensible nécessitant revue ;
- permission révoquée ;
- entité archivée ;
- référence étrangère changée.

## 13. Pas de LWW sensible

Last-write-wins silencieux interdit pour :
- propriété/relations patrimoniales ;
- documents vérifiés ;
- mandats/permissions ;
- conflit ;
- procédure ;
- finances ;
- alertes/actions sensibles.

## 14. Merge

La logique de merge appartient au domaine concerné.

Le SyncOrchestrator fournit les versions/base/local/server ; le domaine décide.

## 15. Permissions

À la reconnexion, toute commande est réévaluée.

Une action préparée offline peut être rejetée si :
- mandat expiré ;
- permission révoquée ;
- mission terminée ;
- cible archivée ;
- conflit/restriction apparu.

L’UI explique le rejet sans perdre le draft utile.

## 16. Cache et confidentialité

Ne pas mettre en cache plus de données que nécessaire. Les ressources `SECRET` peuvent interdire le stockage offline ou exiger protection renforcée selon politique.

## 17. Logout

À la déconnexion :
- arrêter sync ;
- invalider tokens ;
- purger/partitionner les caches privés selon politique ;
- ne pas mélanger les données entre comptes.

## 18. Multi-user device

Les stores offline privés sont namespacés par compte/principal.

## 19. Uploads

```text
Local file
→ upload queue
→ checksum
→ Storage upload
→ create DocumentFile metadata
→ link
```

Le retry doit éviter les fichiers dupliqués via checksum/idempotency.

## 20. Compression

Images : compression/optimisation client permise pour représentation dérivée, mais l’original doit être conservé lorsqu’exigé par le domaine 06.

## 21. Reprise réseau

Déclencheurs :
- retour online ;
- ouverture app ;
- action utilisateur « synchroniser » ;
- background sync si plateforme supportée.

## 22. Backoff

Réseau instable : retry progressif + jitter. Ne pas boucler agressivement.

## 23. Priorités

1. révocations/sécurité et métadonnées critiques ;
2. petites commandes ;
3. documents/médias lourds ;
4. projections non critiques.

La priorité technique ne modifie pas la sémantique métier.

## 24. SyncResult

```text
SYNCED
RETRY_LATER
CONFLICT
REJECTED_AUTH
REJECTED_STATE
REVIEW_REQUIRED
PERMANENT_FAILURE
```

## 25. User conflict UX

Pour un conflit sensible :
- conserver version locale ;
- montrer ce qui a changé ;
- permettre abandon, correction ou nouvelle tentative ;
- ne jamais fusionner silencieusement les affirmations contradictoires.

## 26. Domain events vs Client Outbox

Client Outbox transporte des **commands** préparées offline.

Domain Outbox transporte des **events** après commit serveur.

Ne pas les confondre.

## 27. PWA

Le service worker gère assets/app shell et stratégies de cache adaptées. Les données privées sensibles ne doivent pas être exposées dans des caches publics partagés.

## 28. Observabilité sync

Mesures :
`pending_operations`, `oldest_pending_age`, `retry_count`, `conflict_rate`, `upload_failure_rate`, `sync_latency`.

## 29. Tests

- création offline chainée ;
- fermeture/réouverture app ;
- retry idempotent ;
- réseau intermittent ;
- mandat révoqué avant sync ;
- aggregate version conflict ;
- file upload resume ;
- compte A/B sur même appareil ;
- logout purge ;
- server rejection avec draft conservé ;
- duplicate command prevention.

## 30. Invariants

1. Le serveur revalide toujours sécurité/invariants.
2. Une commande locale n’est jamais considérée accomplie avant ack serveur.
3. Les IDs restent stables.
4. Les opérations sensibles ne sont jamais écrasées silencieusement.
5. L’outbox survit aux redémarrages.
6. Le moteur sync n’est pas propriétaire des règles de fusion métier.
