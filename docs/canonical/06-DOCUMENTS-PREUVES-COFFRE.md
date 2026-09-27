# 06 — DOCUMENTS / PREUVES / COFFRE PATRIMONIAL

**Statut : CANONICAL — V1.0**

## Mission

Centraliser les documents, fichiers, preuves, témoignages et références externes sans dupliquer les pièces entre dossiers et sans confondre présence, vérification et effet juridique.

## Principe

```text
1 Document master
→ N Domain Links
```

```text
Document
≠
DocumentFile
```

## Types de preuve

`DOCUMENT`, `PHOTO`, `VIDEO`, `AUDIO`, `TESTIMONY`, `EXTERNAL_REFERENCE`, `OBSERVATION`, `GEO_REFERENCE`, `STRUCTURED_RECORD`.

## Status

`DECLARED`, `ADDED`, `TO_CLASSIFY`, `CLASSIFIED`, `TO_VERIFY`, `VERIFIED`, `INCOMPLETE`, `ILLEGIBLE`, `CONTESTED`, `EXPIRED`, `REPLACED`, `DUPLICATE_SUSPECTED`, `ARCHIVED`.

```text
VERIFIED
≠
legally valid everywhere
```

## DocumentFile

Représentations : `ORIGINAL`, `OPTIMIZED`, `THUMBNAIL`, `PREVIEW`, `OCR_TEXT`, `TRANSCRIPTION`.

L’original n’est jamais remplacé silencieusement.

## DocumentLink

Une relation générique référence :
```text
target_domain
target_entity_type
target_entity_id
relation_type
```

`UNLINK ≠ DELETE`.

## Requirements

`MISSING`, `TO_FIND`, `REQUESTED`, `RECEIVED`, `NOT_AVAILABLE`, `NOT_APPLICABLE`.

La présence d’un document ne signifie pas que l’exigence d’une procédure est satisfaite.

## Testimony

```text
Testimony
≠
VerifiedFact
```

Audio et transcription restent deux représentations différentes.

## Confidentialité

`PRIVATE`, `FAMILY_SCOPED`, `CASE_SCOPED`, `PROFESSIONAL_SCOPED`, `HIGHLY_CONFIDENTIAL`, `SECRET`.

```text
ADMIN_CASE
¬⇒
VIEW_SECRET_DOCUMENT
```

## Autorisation

```text
RoleGrant
+ ExplicitGrant
+ DocumentAccessGrant
- ExplicitDeny
- ConfidentialityRestriction
- RoleConflictRestriction
= EffectiveDocumentPermission
```

## Entités

`documents`, `document_files`, `document_versions`, `document_links`, `document_requirements`, `document_relations`, `testimonies`, `document_access_grants`, `evidence_conflicts`, `document_bundles`, `extracted_fields`.

## IA/OCR

OCR et extraction IA produisent des **propositions**. Une donnée extraite ne devient pas automatiquement une information vérifiée.

## Événements

`DocumentCreated`, `DocumentClassified`, `DocumentLinked`, `DocumentUnlinked`, `DocumentVerified`, `DocumentVerificationRejected`, `DocumentContested`, `DocumentExpired`, `DocumentReplaced`, `DocumentArchived`, `TestimonyCreated`, `EvidenceConflictDetected`.

## Invariants

- Un fichier n’est pas un Document maître.
- Une contradiction documentaire n’est pas automatiquement une fraude.
- Les documents sensibles ne sont pas inclus en clair dans les événements.
- Les liens vers un document ne transfèrent pas les permissions.
- Les versions importantes restent historiques.
