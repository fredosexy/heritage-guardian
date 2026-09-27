# 03 — DOSSIER PATRIMONIAL / MES BIENS

**Statut : CANONICAL — V1.0**

## Mission

Fournir la source de vérité des biens patrimoniaux indépendamment des démarches qui les concernent.

## Principe

```text
MES BIENS = patrimoine
MES DOSSIERS = processus
```

```text
1 Asset
→ N Cases
```

Un nouveau dossier ne recrée jamais le bien.

## Asset

```text
Asset {
  id
  type
  title
  origin
  status
  situation
  privacy
  created_at
  updated_at
  version
}
```

### AssetStatus

`DRAFT`, `ACTIVE`, `UNDER_REVIEW`, `CONTESTED`, `INACTIVE`, `HISTORICAL_PARENT`, `ARCHIVED`.

### AssetSituation

`CLEAR`, `NEEDS_INFORMATION`, `NEEDS_ATTENTION`, `CONTESTED`, `PROCEDURE_IN_PROGRESS`, `TRANSFER_IN_PROGRESS`, `PROTECTED`.

## Relations

```text
Ownership
≠
Usage
≠
Management
```

Les relations Person↔Asset sont contextualisées, versionnées et contestables.

## Objectifs

Conserver, protéger, documenter, régulariser, transmettre, partager, développer, cultiver, louer, vendre, construire, résoudre un conflit.

Un objectif n’est pas un état réalisé.

## Valeur

`DECLARED`, `ESTIMATED`, `PROFESSIONAL`, `TRANSACTION`, `UNKNOWN`.

Aucune valeur ne doit être présentée comme officielle universelle sans source appropriée.

## Command pipeline

```text
Command
→ Authorization
→ Preconditions
→ Invariant validation
→ Transaction
→ Domain events
→ Audit
```

## Événements

`AssetCreated`, `AssetUpdated`, `AssetArchived`, `AssetRestored`, `AssetPersonRelationAdded`, `AssetPersonRelationUpdated`, `AssetPersonRelationContested`, `AssetSituationChanged`, `AssetSubdivisionCreated`, `AssetsMerged`.

## Invariants

- Asset reste la racine patrimoniale durable.
- Un dossier terminé ne supprime pas l’Asset.
- Une relation contestée reste historique.
- Une subdivision conserve le parent.
- Les documents restent dans 06.
- Les personnes restent dans 05.
