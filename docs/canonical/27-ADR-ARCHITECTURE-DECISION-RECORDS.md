# 27 — ADR / ARCHITECTURE DECISION RECORDS

**Projet :** Heritage Guardian / Fonciers  
**Statut :** CANONICAL — V1.0  
**Position :** 27/27  
**Type :** Gouvernance des décisions d’architecture et registre initial des décisions structurantes

---

# 1. Mission

Définir comment les décisions d’architecture importantes sont :

- proposées ;
- discutées ;
- acceptées ;
- documentées ;
- remplacées ;
- reliées au code ;
- reliées aux migrations ;
- reliées aux tests ;
- conservées historiquement.

Un ADR empêche que des choix structurants disparaissent dans des conversations, commits ou implémentations sans contexte.

---

# 2. Principe fondamental

```text
Architecture decision
≠
implementation detail
```

Un ADR documente un choix qui :

- affecte plusieurs modules ;
- crée une contrainte durable ;
- modifie un contrat public ;
- introduit une technologie structurante ;
- change un modèle de sécurité ;
- modifie une frontière de domaine ;
- engage une stratégie de données, offline ou production.

---

# 3. Objectifs

Les ADR doivent permettre de répondre à :

- Pourquoi ce choix ?
- Quelles alternatives ont été évaluées ?
- Quelles conséquences ?
- Quelles contraintes ?
- Quel document canonique est concerné ?
- Quel code applique la décision ?
- Quelle décision la remplace éventuellement ?

---

# 4. Statuts ADR

```text
PROPOSED
ACCEPTED
REJECTED
DEPRECATED
SUPERSEDED
REVOKED
```

---

# 5. PROPOSED

Décision en discussion.

Elle ne doit pas être considérée comme règle de production tant qu’elle n’est pas ACCEPTED.

---

# 6. ACCEPTED

Décision active et normative.

---

# 7. REJECTED

Alternative examinée mais non retenue.

La raison reste documentée.

---

# 8. DEPRECATED

Décision encore historique mais déconseillée pour les nouveaux développements.

---

# 9. SUPERSEDED

Une nouvelle décision remplace explicitement l’ancienne.

Exemple :

```text
ADR-005 SUPERSEDED BY ADR-032
```

---

# 10. REVOKED

Décision annulée sans remplacement direct.

---

# 11. Numérotation

Convention :

```text
ADR-001
ADR-002
...
ADR-NNN
```

Le numéro n’est jamais réutilisé.

---

# 12. Emplacement

Structure recommandée :

```text
docs/
└── adr/
    ├── README.md
    ├── ADR-001-modular-monolith.md
    ├── ADR-002-supabase-backend.md
    └── ...
```

Le présent document définit le registre canonique initial.

---

# 13. Nom de fichier

```text
ADR-<NNN>-<short-kebab-title>.md
```

---

# 14. Template ADR

```markdown
# ADR-XXX — Titre

**Statut :** PROPOSED | ACCEPTED | ...
**Date :**
**Décideurs :**
**Documents liés :**

## Contexte

## Problème

## Options étudiées

### Option A
### Option B
### Option C

## Décision

## Raisons

## Conséquences positives

## Conséquences négatives

## Risques

## Mesures compensatoires

## Impact code

## Impact data / migrations

## Impact sécurité

## Impact offline

## Tests requis

## ADR remplacé
## Remplacé par
```

---

# 15. Règle de décision

Un ADR doit documenter le compromis réel.

Il ne doit pas seulement écrire :

> Nous choisissons X parce que X est meilleur.

Il doit préciser :
- pourquoi ;
- pour quel contexte ;
- avec quelles limites.

---

# 16. Quand créer un ADR

Créer un ADR si le changement concerne :

- architecture générale ;
- ownership de domaine ;
- base de données ;
- technologie frontend/backend ;
- stratégie auth/authorization ;
- modèle d’événements ;
- orchestration ;
- sync/offline ;
- sécurité ;
- recherche ;
- observabilité ;
- déploiement ;
- contrat public transversal.

---

# 17. Quand ne pas créer un ADR

Pas nécessaire pour :

- changement de couleur ;
- renommage local ;
- correction simple ;
- refactor sans impact contractuel ;
- détail interne facilement réversible.

---

# 18. Relation ADR ↔ documents 00–27

Les documents 00–27 définissent **ce que l’architecture exige**.

Les ADR expliquent **pourquoi certains choix structurants ont été retenus**.

```text
Canonical specification
+
ADR rationale
=
architectural governance
```

---

# 19. Relation ADR ↔ code

Chaque ADR accepté doit idéalement référencer :

- modules ;
- migrations ;
- scripts ;
- tests ;
- configurations concernées.

---

# 20. Relation ADR ↔ tests

Une décision critique doit avoir des tests empêchant sa violation involontaire.

Exemple :

```text
ADR-004 No cross-domain direct writes
→ architecture test
→ import boundary test
→ integration test
```

---

# 21. Relation ADR ↔ CI

La CI peut automatiser certaines décisions :

- boundary rules ;
- RLS required ;
- canonical docs existence ;
- dependency rules ;
- public contract versioning.

---

# 22. Révision

Un ADR ACCEPTED n’est pas modifié pour réécrire l’histoire.

Si le choix change :

```text
new ADR
→ supersedes old ADR
```

---

# 23. Corrections mineures

Les corrections purement éditoriales sont autorisées sans nouvel ADR.

---

# 24. Gouvernance

Pour un ADR important :

1. proposition ;
2. contexte ;
3. alternatives ;
4. impact ;
5. validation ;
6. implémentation ;
7. tests ;
8. mise à jour du registre.

---

# 25. Décisions initiales

Les décisions suivantes représentent le socle architectural actuel du projet.

---

# ADR-001 — Modular Monolith

**Statut : ACCEPTED**

## Décision

Le système utilise un **modular monolith orienté domaines**, plutôt qu’un ensemble initial de microservices.

## Raisons

- produit encore en évolution ;
- équipe réduite ;
- besoin de transactions locales simples ;
- coûts opérationnels limités ;
- forte cohérence métier ;
- possibilité d’extraction future.

## Conséquence

Les frontières logiques sont strictes même si la base et le runtime sont communs.

---

# ADR-002 — Domain-Oriented Modules

**Statut : ACCEPTED**

Le code est organisé par domaines fonctionnels explicites.

Chaque domaine possède :

```text
domain/
application/
infrastructure/
presentation/
public-api/
```

ou structure équivalente compatible avec l’existant.

---

# ADR-003 — Unique Domain Ownership

**Statut : ACCEPTED**

Chaque concept maître appartient à un seul domaine.

Exemples :

- Person → 05 ;
- Asset → 03 ;
- Document → 06 ;
- ProcedureCase → 07 ;
- ConflictCase → 09.

---

# ADR-004 — No Cross-Domain Direct Writes

**Statut : ACCEPTED**

Un domaine ne modifie jamais directement les tables métier d’un autre domaine.

Interaction par :

- public API ;
- command ;
- event ;
- projection.

---

# ADR-005 — Shared PostgreSQL Database

**Statut : ACCEPTED**

Les domaines utilisent une base PostgreSQL/Supabase commune en V1.

La cohabitation physique ne supprime pas l’ownership logique.

---

# ADR-006 — Supabase Backend Platform

**Statut : ACCEPTED**

Supabase est retenu pour :

- PostgreSQL ;
- Auth ;
- Storage ;
- Realtime ;
- Edge Functions ;
- RLS.

---

# ADR-007 — PWA Mobile-First

**Statut : ACCEPTED**

L’application principale est une PWA mobile-first adaptée aux smartphones Android et aux réseaux faibles.

---

# ADR-008 — Offline-First Hybrid

**Statut : ACCEPTED**

L’application supporte :

- lectures cache ;
- drafts locaux ;
- commandes différées ;
- outbox client ;
- reprise réseau.

Le serveur reste autoritatif.

---

# ADR-009 — Stable Client UUIDs

**Statut : ACCEPTED**

Les entités créables offline utilisent des UUID stables pouvant être générés côté client.

---

# ADR-010 — Explicit Command Model

**Statut : ACCEPTED**

Toute mutation métier passe par une commande explicite.

```text
Intent
→ Command
→ Application Service
→ Domain
```

---

# ADR-011 — Explicit Query Model

**Statut : ACCEPTED**

Les lectures utilisent des queries/projections distinctes des commandes.

---

# ADR-012 — Application Services as Orchestration Boundary

**Statut : ACCEPTED**

Les Application Services coordonnent authorization, references, transaction, audit et événements.

Les règles métier profondes restent dans les domaines.

---

# ADR-013 — Controlled Cross-Domain Orchestration

**Statut : ACCEPTED**

Les workflows transverses utilisent des orchestrateurs spécialisés.

Aucun Universal God Workflow Service.

---

# ADR-014 — Process Managers for Long-Running Workflows

**Statut : ACCEPTED**

Les processus longs/asynchrones utilisent des ProcessManagers conservant uniquement l’état de coordination.

---

# ADR-015 — Domain Events as Facts

**Statut : ACCEPTED**

Les événements représentent des faits déjà accomplis.

```text
Command = request
Event = fact
```

---

# ADR-016 — Transactional Outbox

**Statut : ACCEPTED**

Les événements critiques sont enregistrés atomiquement avec la transaction métier dans une outbox.

---

# ADR-017 — Consumer Inbox / Idempotency

**Statut : ACCEPTED**

Les consumers critiques utilisent Inbox + idempotence.

---

# ADR-018 — At-Least-Once Event Delivery

**Statut : ACCEPTED**

La livraison peut être dupliquée techniquement.

Le double effet métier est interdit.

---

# ADR-019 — No Event Sourcing in V1

**Statut : ACCEPTED**

La V1 n’utilise pas Event Sourcing comme source de vérité globale.

Les tables métier restent maîtres.

---

# ADR-020 — Eventual Consistency Across Domains

**Statut : ACCEPTED**

Les domaines acceptent une cohérence éventuelle contrôlée pour les interactions asynchrones.

---

# ADR-021 — Optimistic Concurrency

**Statut : ACCEPTED**

Les agrégats sensibles utilisent version/expected_version.

Pas de last-write-wins silencieux.

---

# ADR-022 — Idempotency for Retryable Commands

**Statut : ACCEPTED**

Les commandes sensibles/retryables utilisent une idempotency_key.

---

# ADR-023 — Person Separate from UserAccount

**Statut : ACCEPTED**

```text
Person
≠
UserAccount
```

Une personne peut être décédée, partielle ou sans compte.

---

# ADR-024 — Asset Separate from Case

**Statut : ACCEPTED**

```text
Asset
≠
Case
```

Un Asset peut être lié à plusieurs dossiers sans duplication.

---

# ADR-025 — Document Master + Links

**Statut : ACCEPTED**

Un document est stocké comme ressource maître et lié à plusieurs contextes.

```text
1 Document
→ N links
```

---

# ADR-026 — RBAC + ABAC + Scopes

**Statut : ACCEPTED**

L’autorisation combine :

- rôles ;
- grants ;
- denies ;
- scopes ;
- mandats ;
- MissionScope ;
- conflits ;
- confidentialité.

---

# ADR-027 — Deny Overrides Allow

**Statut : ACCEPTED**

```text
DENY > ALLOW
```

Une restriction explicite prévaut sur un grant général.

---

# ADR-028 — RLS Deny-by-Default

**Statut : ACCEPTED**

Toutes les données privées exposées via Supabase sont protégées par RLS deny-by-default.

---

# ADR-029 — Secret Access Non-Transitive

**Statut : ACCEPTED**

Un accès à un container ne donne pas accès aux ressources secrètes liées.

---

# ADR-030 — Representation Requires Explicit Mandate

**Statut : ACCEPTED**

Un accompagnateur n’est pas automatiquement représentant.

Toute représentation sensible requiert un mandat valide.

---

# ADR-031 — Professional Access via MissionScope

**Statut : ACCEPTED**

Un ProfessionalProfile n’accorde aucun accès de dossier par lui-même.

---

# ADR-032 — Conflict Impacts Are Targeted

**Statut : ACCEPTED**

Un conflit ne bloque pas automatiquement tous les workflows.

Les impacts sont ciblés.

---

# ADR-033 — Protection Separate from Notifications

**Statut : ACCEPTED**

Le domaine Protection décide ce qui mérite attention.

Le sous-système Notifications décide comment livrer le message.

---

# ADR-034 — Notification Intent Before Delivery

**Statut : ACCEPTED**

```text
Protection / Domain
→ NotificationIntent
→ Delivery
```

Une intention n’est pas une livraison.

---

# ADR-035 — Search Index Is Derived

**Statut : ACCEPTED**

Le SearchIndex est reconstructible et n’est jamais source de vérité.

---

# ADR-036 — Search Authorization Before Exposure

**Statut : ACCEPTED**

Les résultats, counts, facets, snippets et autocomplete respectent les permissions.

---

# ADR-037 — Explainable Ranking

**Statut : ACCEPTED**

Les rankings professionnels/recherche utilisent reason codes explicables.

Pas de score opaque présenté comme vérité.

---

# ADR-038 — Approximate Geolocation by Default

**Statut : ACCEPTED**

Les index et surfaces générales utilisent la localisation minimale nécessaire.

La localisation exacte reste protégée.

---

# ADR-039 — Vita as Conversational Orchestrator

**Statut : ACCEPTED**

Vita comprend, guide et prépare.

Vita ne possède aucune vérité métier.

---

# ADR-040 — Vita Uses Same Public Contracts

**Statut : ACCEPTED**

L’assistant utilise les mêmes queries, commands et permissions que l’UI.

Aucun raccourci privilégié.

---

# ADR-041 — Human Confirmation for Sensitive Actions

**Statut : ACCEPTED**

Toute action sensible préparée par Vita/UI requiert une confirmation explicite.

---

# ADR-042 — Local Knowledge + Optional AI Fallback

**Statut : ACCEPTED**

L’assistant peut exploiter des règles/knowledge locales et utiliser un modèle externe seulement en fallback contrôlé.

---

# ADR-043 — Realtime as UX Signal

**Statut : ACCEPTED**

Realtime informe d’un changement mais ne devient pas source de vérité.

---

# ADR-044 — Scheduled Jobs Trigger Reevaluation

**Statut : ACCEPTED**

Un cron/job demande une réévaluation au domaine propriétaire au lieu de forcer directement un état métier complexe.

---

# ADR-045 — Centralized Structured Audit

**Statut : ACCEPTED**

Les actions sensibles produisent un AuditEvent structuré et append-only/protégé.

---

# ADR-046 — Correlation IDs Across Workflows

**Statut : ACCEPTED**

Les workflows majeurs transportent correlation_id de bout en bout.

---

# ADR-047 — Security by Defense in Depth

**Statut : ACCEPTED**

Auth, authorization, domain invariants, RLS, Storage policy, audit et monitoring se complètent.

---

# ADR-048 — Private Storage by Default

**Statut : ACCEPTED**

Documents, preuves, audio et médias patrimoniaux sont privés par défaut.

---

# ADR-049 — Signed URLs Are Temporary Access Mechanisms

**Statut : ACCEPTED**

Une signed URL ne constitue pas une permission permanente.

---

# ADR-050 — Secrets Server-Side Only

**Statut : ACCEPTED**

Service role et secrets providers ne quittent jamais le serveur.

---

# ADR-051 — No Silent Sensitive Merge

**Statut : ACCEPTED**

Les conflits de sync sensibles exigent revue/merge métier explicite.

---

# ADR-052 — Local Drafts Survive Network Failure

**Statut : ACCEPTED**

Les drafts importants sont conservés jusqu’à sync, annulation ou purge contrôlée.

---

# ADR-053 — Client Outbox for Offline Commands

**Statut : ACCEPTED**

Les mutations offline sont stockées comme commandes dans une outbox client.

---

# ADR-054 — Domain Outbox for Committed Events

**Statut : ACCEPTED**

Les événements serveur utilisent une outbox différente de l’outbox client.

---

# ADR-055 — Read Models for Cross-Domain Screens

**Statut : ACCEPTED**

Home et dashboards utilisent des projections/read models plutôt que des écritures ou jointures métier improvisées.

---

# ADR-056 — Mobile-First Rural UX

**Statut : ACCEPTED**

Le faible réseau, petits écrans, usage vocal et faible littératie font partie des contraintes de base.

---

# ADR-057 — Progressive Onboarding

**Statut : ACCEPTED**

Le profil et le contexte utilisateur se complètent progressivement.

Pas de formulaire initial exhaustif obligatoire.

---

# ADR-058 — Explicit Data Freshness

**Statut : ACCEPTED**

Les états offline/stale sont visibles dans l’UI.

---

# ADR-059 — Canonical Documentation 00–27

**Statut : ACCEPTED**

La série `docs/canonical/00–27` est la source documentaire prioritaire.

Les anciens documents B1–B16 sont Supporting/Legacy selon leur contenu.

---

# ADR-060 — Audit First / Reuse First / Delta Only

**Statut : ACCEPTED**

Toute évolution du projet existant commence par inspection du code.

```text
AUDIT FIRST
→ REUSE FIRST
→ DELTA ONLY
→ PRODUCTION ONLY
```

Pas de reconstruction parallèle inutile.

---

# ADR-061 — Supabase Migrations as Schema Source

**Statut : ACCEPTED**

Le schéma de production évolue exclusivement via migrations versionnées.

---

# ADR-062 — Expand/Contract for Risky Schema Changes

**Statut : ACCEPTED**

Les évolutions de schéma breaking utilisent autant que possible expand/contract.

---

# ADR-063 — Release Certification Before Production

**Statut : ACCEPTED**

Une release importante exige preuves de tests, migrations, sécurité, RLS et smoke.

---

# ADR-064 — Observability as Production Requirement

**Statut : ACCEPTED**

Une fonctionnalité critique sans logs/metrics/audit appropriés n’est pas production-ready.

---

# ADR-065 — Reconstructible Search and Read Models

**Statut : ACCEPTED**

Search indexes et projections doivent pouvoir être reconstruits depuis les domaines maîtres.

---

# ADR-066 — No Legal Truth Inference by Application

**Statut : ACCEPTED**

L’application distingue :

```text
declared
documented
verified
formalized
external legal effect
```

Elle ne déduit pas automatiquement propriété, qualité d’héritier ou issue juridique.

---

# ADR-067 — Historical Preservation Before Deletion

**Statut : ACCEPTED**

Priorité :

```text
remove relation
→ archive
→ soft delete
→ purge exceptional
```

L’historique patrimonial critique n’est pas hard-deleted normalement.

---

# ADR-068 — Human Choice for Professional Selection

**Statut : ACCEPTED**

Le moteur 08 peut classer des candidats éligibles, mais l’utilisateur choisit le professionnel en V1.

---

# ADR-069 — Procedure Completion Does Not Resolve Other Domains

**Statut : ACCEPTED**

```text
ProcedureCompleted
¬⇒
AssetProblemResolved
¬⇒
ConflictResolved
¬⇒
TransmissionCompleted
```

Les domaines concernés se réévaluent.

---

# ADR-070 — Conflict Resolution Does Not Auto-Resume All Workflows

**Statut : ACCEPTED**

Chaque domaine cible décide s’il peut reprendre après résolution d’un impact.

---

# ADR-071 — Deployment Environments Are Isolated

**Statut : ACCEPTED**

Local, CI, Staging et Production utilisent bases, Storage et secrets séparés.

---

# ADR-072 — Production Rollback / Corrective Plan Required

**Statut : ACCEPTED**

Toute release risquée possède rollback ou corrective migration plan.

---

# ADR-073 — PWA Updates Preserve Drafts

**Statut : ACCEPTED**

Une mise à jour normale du service worker ne doit pas perdre les drafts utilisateurs.

---

# ADR-074 — Security-Critical Client Versions Can Be Retired

**Statut : ACCEPTED**

Le backend peut imposer une version minimale en cas d’incompatibilité critique.

---

# ADR-075 — Synthetic Data for Tests

**Statut : ACCEPTED**

Les suites automatisées utilisent des données synthétiques.

Pas de données réelles copiées en CI.

---

# ADR-076 — Critical Invariants Require Automated Tests

**Statut : ACCEPTED**

Chaque invariant critique doit être relié à au moins un test automatisé.

---

# ADR-077 — RLS Policies Require Tests

**Statut : ACCEPTED**

Toute table sensible exposée possède tests RLS positifs et négatifs.

---

# ADR-078 — Blameless Incident Postmortems

**Statut : ACCEPTED**

Les incidents majeurs produisent des postmortems centrés sur les causes système.

---

# ADR-079 — Readability Over Administrative Jargon

**Statut : ACCEPTED**

Les interfaces utilisent un langage humain et contextualisé, tout en conservant les termes administratifs précis lorsqu’ils sont nécessaires.

---

# ADR-080 — Application Remains Usable Without Vita

**Statut : ACCEPTED**

L’assistant améliore l’expérience mais ne constitue pas une dépendance obligatoire pour accéder aux fonctions essentielles.

---

# 26. Registre initial synthétique

| ADR | Décision | Statut |
|---|---|---|
| ADR-001 | Modular Monolith | ACCEPTED |
| ADR-002 | Domain-Oriented Modules | ACCEPTED |
| ADR-003 | Unique Domain Ownership | ACCEPTED |
| ADR-004 | No Cross-Domain Direct Writes | ACCEPTED |
| ADR-005 | Shared PostgreSQL Database | ACCEPTED |
| ADR-006 | Supabase Backend Platform | ACCEPTED |
| ADR-007 | PWA Mobile-First | ACCEPTED |
| ADR-008 | Offline-First Hybrid | ACCEPTED |
| ADR-009 | Stable Client UUIDs | ACCEPTED |
| ADR-010 | Explicit Command Model | ACCEPTED |
| ADR-011 | Explicit Query Model | ACCEPTED |
| ADR-012 | Application Services Boundary | ACCEPTED |
| ADR-013 | Controlled Cross-Domain Orchestration | ACCEPTED |
| ADR-014 | Process Managers | ACCEPTED |
| ADR-015 | Domain Events as Facts | ACCEPTED |
| ADR-016 | Transactional Outbox | ACCEPTED |
| ADR-017 | Consumer Inbox / Idempotency | ACCEPTED |
| ADR-018 | At-Least-Once Event Delivery | ACCEPTED |
| ADR-019 | No Event Sourcing V1 | ACCEPTED |
| ADR-020 | Eventual Consistency | ACCEPTED |
| ADR-021 | Optimistic Concurrency | ACCEPTED |
| ADR-022 | Retryable Command Idempotency | ACCEPTED |
| ADR-023 | Person ≠ UserAccount | ACCEPTED |
| ADR-024 | Asset ≠ Case | ACCEPTED |
| ADR-025 | Document Master + Links | ACCEPTED |
| ADR-026 | RBAC + ABAC + Scopes | ACCEPTED |
| ADR-027 | Deny Overrides Allow | ACCEPTED |
| ADR-028 | RLS Deny-by-Default | ACCEPTED |
| ADR-029 | Secret Access Non-Transitive | ACCEPTED |
| ADR-030 | Explicit Representation Mandate | ACCEPTED |
| ADR-031 | Professional Access via MissionScope | ACCEPTED |
| ADR-032 | Targeted Conflict Impacts | ACCEPTED |
| ADR-033 | Protection ≠ Notifications | ACCEPTED |
| ADR-034 | Notification Intent Before Delivery | ACCEPTED |
| ADR-035 | Search Index Derived | ACCEPTED |
| ADR-036 | Search Authorization Before Exposure | ACCEPTED |
| ADR-037 | Explainable Ranking | ACCEPTED |
| ADR-038 | Approximate Geolocation Default | ACCEPTED |
| ADR-039 | Vita Conversational Orchestrator | ACCEPTED |
| ADR-040 | Vita Same Public Contracts | ACCEPTED |
| ADR-041 | Human Confirmation Sensitive Actions | ACCEPTED |
| ADR-042 | Local Knowledge + AI Fallback | ACCEPTED |
| ADR-043 | Realtime as UX Signal | ACCEPTED |
| ADR-044 | Jobs Trigger Reevaluation | ACCEPTED |
| ADR-045 | Structured Audit | ACCEPTED |
| ADR-046 | Correlation IDs | ACCEPTED |
| ADR-047 | Defense in Depth | ACCEPTED |
| ADR-048 | Private Storage Default | ACCEPTED |
| ADR-049 | Temporary Signed URLs | ACCEPTED |
| ADR-050 | Server-Side Secrets Only | ACCEPTED |
| ADR-051 | No Silent Sensitive Merge | ACCEPTED |
| ADR-052 | Local Draft Durability | ACCEPTED |
| ADR-053 | Client Outbox | ACCEPTED |
| ADR-054 | Domain Outbox | ACCEPTED |
| ADR-055 | Cross-Domain Read Models | ACCEPTED |
| ADR-056 | Mobile-First Rural UX | ACCEPTED |
| ADR-057 | Progressive Onboarding | ACCEPTED |
| ADR-058 | Explicit Data Freshness | ACCEPTED |
| ADR-059 | Canonical Docs 00–27 | ACCEPTED |
| ADR-060 | Audit/Reuse/Delta First | ACCEPTED |
| ADR-061 | Supabase Migrations | ACCEPTED |
| ADR-062 | Expand/Contract | ACCEPTED |
| ADR-063 | Release Certification | ACCEPTED |
| ADR-064 | Observability Requirement | ACCEPTED |
| ADR-065 | Reconstructible Projections | ACCEPTED |
| ADR-066 | No Legal Truth Inference | ACCEPTED |
| ADR-067 | Historical Preservation | ACCEPTED |
| ADR-068 | Human Professional Choice | ACCEPTED |
| ADR-069 | Procedure Completion Isolation | ACCEPTED |
| ADR-070 | Conflict Resume Isolation | ACCEPTED |
| ADR-071 | Environment Isolation | ACCEPTED |
| ADR-072 | Rollback/Corrective Plan | ACCEPTED |
| ADR-073 | PWA Draft Preservation | ACCEPTED |
| ADR-074 | Minimum Client Version | ACCEPTED |
| ADR-075 | Synthetic Test Data | ACCEPTED |
| ADR-076 | Critical Invariant Tests | ACCEPTED |
| ADR-077 | RLS Tests | ACCEPTED |
| ADR-078 | Blameless Postmortems | ACCEPTED |
| ADR-079 | Human-readable UX Language | ACCEPTED |
| ADR-080 | App Works Without Vita | ACCEPTED |

---

# 27. ADR dependency map

Exemples :

```text
ADR-001
├── ADR-002
├── ADR-003
└── ADR-004

ADR-008
├── ADR-009
├── ADR-021
├── ADR-022
├── ADR-051
├── ADR-052
└── ADR-053

ADR-026
├── ADR-027
├── ADR-028
├── ADR-029
├── ADR-030
└── ADR-031

ADR-015
├── ADR-016
├── ADR-017
├── ADR-018
└── ADR-020
```

---

# 28. ADR review checklist

Avant ACCEPTED :

```text
[ ] contexte clair
[ ] problème réel
[ ] alternatives
[ ] raisons
[ ] conséquences
[ ] sécurité
[ ] données
[ ] offline
[ ] tests
[ ] migration
[ ] rollback
[ ] docs liés
```

---

# 29. ADR implementation checklist

```text
[ ] code conforme
[ ] migration conforme
[ ] tests
[ ] docs canonical
[ ] CI rule if applicable
[ ] observabilité
[ ] release note if needed
```

---

# 30. ADR supersession example

```text
ADR-042 — Local Knowledge + AI Fallback
Status: SUPERSEDED

Superseded by:
ADR-091 — Fully Local Assistant Runtime
```

L’ancien document reste dans Git.

---

# 31. ADR rejection example

Une option microservices peut être documentée REJECTED pour la V1 sans interdire son réexamen futur.

---

# 32. ADR ownership

Chaque ADR a un owner technique/fonctionnel.

---

# 33. ADR audit trail

Git fournit l’historique principal :

- auteur ;
- commit ;
- date ;
- modifications.

---

# 34. ADR et roadmap

Une décision ACCEPTED peut rester non implémentée.

Elle doit alors être marquée :

```text
Decision: ACCEPTED
Implementation: PLANNED
```

---

# 35. ImplementationStatus

```text
PLANNED
PARTIAL
IMPLEMENTED
VERIFIED
SUPERSEDED
```

---

# 36. DecisionStatus ≠ ImplementationStatus

Une décision peut être ACCEPTED mais seulement PARTIAL dans le code.

---

# 37. Architecture compliance

La revue finale doit comparer :

```text
Canonical Docs
+
Accepted ADRs
↔
Actual Code
```

---

# 38. Drift detection

Tout écart important devient :

- correction ;
- nouveau ADR ;
- mise à jour de décision ;
- dette explicitement documentée.

---

# 39. No undocumented architecture drift

Interdit de modifier silencieusement :

- domain ownership ;
- auth model ;
- sync model ;
- event model ;
- storage security ;
- production architecture.

---

# 40. ADR and Lovable/AI tools

Les outils IA doivent recevoir les ADR pertinents avant une refonte structurelle.

Règle :

```text
scan code
→ read canonical docs
→ read relevant ADRs
→ propose delta
→ implement
```

---

# 41. AI must not overwrite architecture

Une IA ne doit pas remplacer une architecture ACCEPTED simplement parce qu’un autre pattern lui paraît plus moderne.

---

# 42. New technology evaluation

Tout nouveau framework/service structurant exige ADR.

Exemples :

- remplacement Supabase ;
- microservices ;
- moteur Search externe ;
- nouvelle auth ;
- native mobile app ;
- nouvelle queue distribuée.

---

# 43. Cost consideration

Un ADR doit considérer le coût :

- développement ;
- exploitation ;
- maintenance ;
- infrastructure ;
- complexité équipe.

---

# 44. Rural/offline impact

Toute décision front/data doit considérer :

- réseau faible ;
- stockage local ;
- poids bundle ;
- latence ;
- reprise.

---

# 45. Security impact

Toute décision doit préciser si elle :
- élargit attack surface ;
- introduit secret ;
- modifie RLS ;
- ajoute provider ;
- stocke nouvelle donnée.

---

# 46. Privacy impact

Toute décision ajoutant collecte/analytics exige une section confidentialité.

---

# 47. Data migration impact

Toute décision changeant un modèle maître doit préciser :
- migration ;
- compatibilité ;
- rollback ;
- historique.

---

# 48. Contract impact

Si un ADR change :
- command ;
- event ;
- API ;
- DTO ;

il doit préciser versioning/compatibilité.

---

# 49. Test impact

Un ADR sans stratégie de test est incomplet lorsqu’il définit un comportement vérifiable.

---

# 50. Release impact

Les ADR à fort risque peuvent exiger :
- feature flag ;
- pilot ;
- staged rollout ;
- monitoring spécial.

---

# 51. ADR-000 conceptuel

Le registre lui-même joue le rôle de méta-décision :

> Les décisions structurantes du projet seront documentées et versionnées.

Aucun fichier ADR-000 obligatoire n’est nécessaire.

---

# 52. Documentation finalisée

Avec le présent document, la série canonique :

```text
00 → 27
```

est complète au niveau architectural et documentaire.

---

# 53. Prochaine phase

La suite logique n’est plus la création de nouveaux documents de fondation.

Elle devient :

```text
Documentation audit
→ Code audit
→ Documentation/code gap matrix
→ Implementation backlog
→ Production completion
```

---

# 54. Règle finale

> **Une architecture durable n’est pas seulement une structure de dossiers ou un diagramme : c’est un ensemble de décisions explicites, traçables et révisables.**

> **Les ADR conservent le “pourquoi”, tandis que les documents 00–27 conservent le “quoi” et les règles normatives.**

> **Une nouvelle décision ne réécrit pas l’histoire : elle supersède l’ancienne.**

> **La formule normative est : Context → Alternatives → Decision → Consequences → Implementation → Tests → Review → Supersession if needed.**

---

**Fin — 27-ADR-ARCHITECTURE-DECISION-RECORDS.md**  
**Version 1.0 — Document 27/27**
