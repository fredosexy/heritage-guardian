# 02 — VOLONTÉS SECRÈTES ET DERNIÈRES VOLONTÉS

**Statut : CANONICAL — V1.0**

## Mission

Permettre à une personne d’enregistrer une volonté confidentielle, d’en définir les conditions de divulgation et les destinataires autorisés, sans transformer cette volonté en acte juridique automatique.

## Séparation fondamentale

```text
Intention
≠
LegalDocument
≠
Trigger
≠
ReleaseReview
≠
ReleaseDecision
≠
DisclosureExecution
≠
ExternalLegalEffect
```

```text
WillDisclosure
≠
AssetTransfer
```

## Machines d’état

- `WillStatus`
- `TriggerStatus`
- `ReleaseReviewStatus`
- `ReleaseExecutionStatus`
- `ReleaseDecisionStatus`

## LegalScope

```text
PERSONAL_NOTE
RECORDED_PERSONAL_WISH
FAMILY_OR_PATRIMONIAL_INSTRUCTION
LINKED_TO_EXTERNAL_LEGAL_DOCUMENT
EXTERNAL_DOCUMENT_VERIFIED
```

## Confidentialité

```text
PRIVATE
CONFIDENTIAL
HIGHLY_CONFIDENTIAL
CONDITIONAL
SHARED
```

Les événements publics correspondants utilisent `HIGHLY_SENSITIVE` ou `SECRET`.

## Règles de divulgation

La divulgation doit être :
- par destinataire ;
- idempotente ;
- auditable ;
- fail-closed ;
- limitée au strict nécessaire ;
- indépendante des droits patrimoniaux.

Le contenu de la volonté ne doit jamais être embarqué dans un événement générique.

## Événements

`WillCreated`, `WillActivated`, `WillSuspended`, `WillRevoked`, `WillReplaced`, `TriggerReported`, `TriggerVerified`, `TriggerRejected`, `ReleaseReviewOpened`, `ReleaseReviewEligible`, `ReleaseReviewDenied`, `ReleaseExecutionStarted`, `ReleaseExecutionCompleted`, `WillDisclosureCompleted`, `WillDisclosureFailed`.

## Invariants

1. Une volonté ne transfère aucun bien.
2. Une divulgation réussie ne crée aucun droit successoral.
3. `ADMIN_CASE ¬⇒ VIEW_SECRET_WILL`.
4. L’existence même d’une volonté peut être secrète.
5. Les documents référencés restent dans le domaine 06.
6. Les versions historiques restent immuables.
