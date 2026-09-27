# Heritage Guardian / Fonciers

Application patrimoniale et foncière **mobile-first, PWA et offline-first**, conçue pour aider les utilisateurs à comprendre, documenter, protéger, transmettre et mettre en valeur leurs biens et dossiers, y compris en contexte rural ou à faible connectivité.

> L’application organise, accompagne et trace. Elle ne remplace pas les autorités ou professionnels compétents et ne transforme pas automatiquement une déclaration ou un document en vérité juridique.

---

## Documentation canonique

La source de vérité du projet est désormais la série complète :

**[docs/canonical/README.md](./docs/canonical/README.md)**

Elle contient **28 documents canoniques numérotés 00 à 27** couvrant :

- Mémoire des terres ;
- Héritage ;
- Volontés secrètes ;
- Biens patrimoniaux ;
- Transmission / donation / partage ;
- Personnes et relations ;
- Documents / preuves ;
- Procédures ;
- Professionnels / intervenants ;
- Conflits ;
- Protection / alertes ;
- Vie économique ;
- architecture inter-domaines ;
- événements ;
- commandes ;
- autorisation ;
- modèle de données ;
- offline/sync ;
- API ;
- Realtime / notifications / jobs ;
- recherche ;
- Vita ;
- UI/UX ;
- sécurité ;
- observabilité ;
- tests ;
- déploiement ;
- ADR.

L’ancienne documentation B1→B16 reste conservée sous `docs/` comme historique/support, mais la série canonique prévaut en cas de contradiction.

---

## Vision produit

Le parcours cible est :

```text
comprendre
→ documenter
→ organiser
→ vérifier
→ protéger
→ suivre
→ transmettre / partager
→ mettre en valeur
```

Le système est particulièrement adapté à :

- zones rurales ;
- connexions faibles ou intermittentes ;
- smartphones ;
- personnes peu habituées aux outils numériques ;
- personnes utilisant la voix ou un accompagnateur ;
- professionnels et services intervenant sur un dossier.

---

## Principes métier essentiels

```text
Person ≠ UserAccount
Asset ≠ Case
Document ≠ DocumentFile
Ownership ≠ Usage ≠ Management
PotentialHeir ≠ ConfirmedHeir
AgreementRecorded ≠ Formalized
ProcedureCompleted ≠ AssetProblemResolved
```

Le système distingue toujours :

```text
DECLARED
DOCUMENTED
VERIFIED
FORMALIZED
EXTERNAL LEGAL EFFECT
```

---

## Domaines métier

```text
00 Land Memory
01 Inheritance
02 Secret Wills
03 Asset
04 Transmission
05 Person
06 Document
07 Procedure
08 Professional
09 Conflict
10 Protection
11 Asset Lifecycle / Economic Use
```

Chaque concept maître possède un **owner domain unique**.

Un domaine ne modifie pas directement les tables métier d’un autre domaine.

---

## Architecture

Architecture retenue :

```text
Modular Monolith
+ Domain-Oriented Modules
+ Application Services
+ Explicit Public APIs
+ Commands / Queries
+ Domain Events
+ Transactional Outbox / Inbox
+ RBAC + ABAC + Scopes
+ Offline Client Outbox
+ Eventual Consistency
```

Règle structurante :

> **Un orchestrateur coordonne ; un domaine décide.**

---

## Stack actuelle

Le projet conserve la stack réellement présente dans le dépôt, notamment :

- React ;
- TypeScript ;
- Vite ;
- Tailwind CSS ;
- shadcn/ui ;
- Supabase ;
- PostgreSQL ;
- Supabase Auth ;
- Storage ;
- RLS ;
- Realtime ;
- PWA/service worker.

Aucune technologie fonctionnelle ne doit être remplacée sans raison architecturale documentée par ADR.

---

## Frontières de code

Direction cible :

```text
UI
↓
Feature Hook / Application Client
↓
Application Service / Orchestrator
↓
Domain
↓
Repository
↓
Supabase / PostgreSQL / Storage
```

Interdit :

```text
UI component
→ sensitive business SQL
```

---

## Offline-first

Le produit supporte :

- lectures locales ;
- drafts ;
- UUID stables ;
- commandes différées ;
- Client Outbox ;
- uploads différés ;
- reprise réseau ;
- optimistic concurrency ;
- sync conflicts explicites.

```text
Offline-capable
≠
Offline-trusted
```

Le serveur revalide toujours les permissions et invariants à la reconnexion.

---

## Autorisation et sécurité

Principe :

```text
DENY BY DEFAULT
```

Autorisation effective :

```text
RoleGrant
+ ExplicitGrant
+ ValidMandate
+ ValidMissionScope
+ ContextGrant
- ExplicitDeny
- ConflictRestriction
- ConfidentialityRestriction
```

`DENY > ALLOW`.

Les ressources secrètes ne deviennent jamais accessibles simplement parce qu’elles sont liées à une ressource visible.

---

## Vita

Vita est un **orchestrateur conversationnel**.

Il peut :

- comprendre une intention ;
- rechercher ;
- expliquer ;
- demander une précision ;
- préparer une commande ;
- accompagner texte/voix/offline.

Il ne peut pas :

- contourner les permissions ;
- écrire directement en base ;
- certifier la propriété ;
- décider d’un héritier ;
- trancher un conflit ;
- inventer une donnée absente.

---

## Navigation principale

```text
Home      → /home
Cas       → /cas
+         → /cas/nouveau
Aide      → /aide
Procédure → /procedure
```

---

## Règle de contribution

Avant toute modification importante :

```text
AUDIT FIRST
→ REUSE FIRST
→ DELTA ONLY
→ PRODUCTION ONLY
```

Inspecter notamment :

- `src/`
- `components/`
- `pages/` ou routes existantes
- `hooks/`
- `stores/`
- `packages/shared/` si présent
- `supabase/`
- `docs/canonical/`

Ne pas créer une architecture parallèle ni dupliquer une fonctionnalité déjà existante.

---

## Tests et qualité

Les changements doivent selon leur périmètre couvrir :

- TypeScript/lint ;
- unit/domain tests ;
- contract tests ;
- RLS/pgTAP ;
- integration ;
- E2E ;
- offline/sync ;
- sécurité ;
- accessibilité ;
- performance ;
- migrations.

Une fonctionnalité n’est pas considérée production-ready uniquement parce que l’écran fonctionne.

---

## Production

Chaîne cible :

```text
Pull Request
→ CI
→ Main
→ Staging
→ Release Certification
→ Production
→ Smoke Tests
→ Monitoring
```

Environnements isolés :

```text
LOCAL
CI
STAGING
PRODUCTION
```

---

## ADR

Les décisions structurantes sont documentées dans :

**[27 — Architecture Decision Records](./docs/canonical/27-ADR-ARCHITECTURE-DECISION-RECORDS.md)**

Le registre initial contient les décisions fondamentales du projet : modular monolith, Supabase, offline-first, domaine owner unique, RLS, commands/events, Outbox/Inbox, Search, Vita, sécurité, production, etc.

---

## État documentaire

```text
Série canonique 00–27 : COMPLETE
Documents canoniques : 28 / 28
Architecture documentaire : COMPLETE
```

### Prochaine phase

La prochaine étape logique est de réaliser un **audit documentation ↔ code réel** :

```text
Requirement
→ Current implementation
→ COMPLETE / PARTIAL / MISSING
→ Tests
→ Migration
→ Priority
```

Cette matrice devient ensuite le backlog de finalisation production.
