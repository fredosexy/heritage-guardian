# 00 — MÉMOIRE DES TERRES

**Statut : CANONICAL — V1.0**

## Mission

Conserver la mémoire durable d’un bien foncier : événements historiques, détenteurs successifs, usages, limites, témoins, documents, conflits et procédures, sans transformer une déclaration en vérité juridique.

## Principes

- `LandMemory` est rattachée à `Asset` du domaine 03.
- Un événement historique peut exister sans document.
- `DECLARED ≠ DOCUMENTED ≠ VERIFIED ≠ LEGAL_EFFECT`.
- Une information contestée reste historique ; elle n’est pas supprimée.
- Une correction crée une nouvelle version.
- Une subdivision conserve le lien vers le bien parent.
- Le changement de titulaire ne détruit jamais l’histoire antérieure.
- La localisation exacte et les informations personnelles restent protégées.

## Modèle

```text
LandMemory
HistoricalEvent
LandPersonRelation
HistoricalPossession
BoundaryRecord
LandMarker
HistoricalUsage
EvidenceLink
TestimonyLink
MemoryIssue
MemoryRevision
```

### HistoricalEvent

```text
HistoricalEvent {
  id
  land_memory_id
  event_type
  event_date
  date_precision
  description
  source_kind
  status
  version
  created_at
}
```

### BoundaryRecord

Statuts possibles : `DECLARED`, `DOCUMENTED`, `CONTESTED`, `SUPERSEDED`, `HISTORICAL`.

## Événements

- `LandMemoryCreated`
- `LandMemoryUpdated`
- `HistoricalEventAdded`
- `HistoricalEventCorrected`
- `PersonLinkedToLand`
- `EvidenceLinkedToLand`
- `BoundaryRecordAdded`
- `BoundaryRecordContested`
- `OwnershipHistoryUpdated`
- `TransmissionRecorded`
- `ConflictLinked`
- `ProcedureLinked`
- `LandMemoryArchived`

## Frontières

- Asset maître : domaine 03.
- Personnes : domaine 05.
- Documents/preuves : domaine 06.
- Procédures : domaine 07.
- Conflits : domaine 09.
- Alertes : domaine 10.

Aucune écriture directe dans les tables étrangères.

## Invariants

1. Une déclaration historique ne certifie pas la propriété.
2. Une contestation ne supprime pas l’information antérieure.
3. Une correction conserve l’ancienne version.
4. Un lien documentaire n’entraîne pas copie du document.
5. Une sous-parcelle conserve son origine.
6. Les événements historiques significatifs ne sont pas hard-deleted.
7. `VIEW_LAND_MEMORY ¬⇒ VIEW_SECRET_DOCUMENT`.

## Offline

Lecture cache autorisée selon permissions. Les nouveaux événements peuvent être préparés localement avec UUID stable puis synchronisés avec `base_version` et `idempotency_key`. Aucun écrasement silencieux d’un historique concurrent.
