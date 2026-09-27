# Documentation canonique — Heritage Guardian / Fonciers

**Statut : CANONICAL — COMPLETE**  
**Série : 00 → 27**  
**Documents canoniques : 28 / 28**  
**Dernière consolidation : 2026-09-27**

Ce dossier contient la **source documentaire officielle et prioritaire** du projet.

Toute évolution fonctionnelle, technique, sécurité, data, UI/UX ou production doit être comparée à cette série avant modification du code.

---

## Gouvernance documentaire

Ordre de priorité :

1. **CANONICAL** — série `docs/canonical/00 → 27`.
2. **ADR ACCEPTED** — décisions architecturales actives décrites dans le document 27 et futurs fichiers ADR dédiés.
3. **SUPPORTING** — documents complémentaires d’implémentation.
4. **LEGACY** — anciens Blueprints/conceptions conservés pour historique.

En cas de contradiction, la documentation canonique actuelle prévaut.

Règle d’implémentation :

```text
AUDIT FIRST
→ REUSE FIRST
→ DELTA ONLY
→ PRODUCTION ONLY
```

Le code existant doit être inspecté avant création, déplacement ou duplication.

---

# Index officiel 00 → 27

## A. Domaines métier — 00 à 11

| # | Document | Statut |
|---|---|---|
| 00 | [Mémoire des terres](./00-MEMOIRE-DES-TERRES.md) | CANONICAL |
| 01 | [Héritage](./01-HERITAGE.md) | CANONICAL |
| 02 | [Volontés secrètes et dernières volontés](./02-VOLONTES-SECRETES.md) | CANONICAL |
| 03 | [Dossier patrimonial / Mes biens](./03-DOSSIER-PATRIMONIAL-MES-BIENS.md) | CANONICAL |
| 04 | [Transmission / Donation / Partage familial](./04-TRANSMISSION-DONATION-PARTAGE.md) | CANONICAL |
| 05 | [Famille / Personnes / Relations patrimoniales](./05-FAMILLE-PERSONNES-RELATIONS.md) | CANONICAL |
| 06 | [Documents / Preuves / Coffre patrimonial](./06-DOCUMENTS-PREUVES-COFFRE.md) | CANONICAL |
| 07 | [Procédures / Démarches / Parcours administratifs](./07-PROCEDURES-DEMARCHES.md) | CANONICAL |
| 08 | [Services / Professionnels / Agents / Intervenants](./08-PROFESSIONNELS-INTERVENANTS.md) | CANONICAL |
| 09 | [Gestion des conflits](./09-GESTION-DES-CONFLITS.md) | CANONICAL |
| 10 | [Protection patrimoniale / Surveillance / Alertes](./10-PROTECTION-SURVEILLANCE-ALERTES.md) | CANONICAL |
| 11 | [Mise en valeur / Exploitation / Vie économique](./11-VIE-ECONOMIQUE.md) | CANONICAL |

---

## B. Architecture et contrats — 12 à 21

| # | Document | Statut |
|---|---|---|
| 12 | [Architecture inter-domaines globale](./12-ARCHITECTURE-INTER-DOMAINES.md) | CANONICAL |
| 13 | [Modèle d’événements et contrats d’événements](./13-EVENT-MODEL-AND-CONTRACTS.md) | CANONICAL |
| 14 | [Commandes et Application Services](./14-COMMANDS-AND-APPLICATION-SERVICES.md) | CANONICAL |
| 15 | [Autorisation globale / RBAC + ABAC + scopes](./15-AUTORISATION-GLOBALE.md) | CANONICAL |
| 16 | [Modèle de données global](./16-MODELE-DE-DONNEES-GLOBAL.md) | CANONICAL |
| 17 | [Offline-first et synchronisation globale](./17-OFFLINE-FIRST-ET-SYNCHRONISATION.md) | CANONICAL |
| 18 | [API et contrats frontend/backend](./18-API-ET-CONTRATS-FRONTEND-BACKEND.md) | CANONICAL |
| 19 | [Realtime / Notifications / Background Jobs](./19-REALTIME-NOTIFICATIONS-BACKGROUND-JOBS.md) | CANONICAL |
| 20 | [Recherche / Indexation / Moteur de découverte](./20-RECHERCHE-INDEXATION-MOTEUR-DE-DECOUVERTE.md) | CANONICAL |
| 21 | [Assistant Vita / Orchestration conversationnelle](./21-ASSISTANT-VITA-ORCHESTRATION-CONVERSATIONNELLE.md) | CANONICAL |

---

## C. Expérience, sécurité et production — 22 à 27

| # | Document | Statut |
|---|---|---|
| 22 | [UI/UX applicative transverse](./22-UI-UX-APPLICATIVE-TRANSVERSE.md) | CANONICAL |
| 23 | [Sécurité applicative transverse](./23-SECURITE-APPLICATIVE-TRANSVERSE.md) | CANONICAL |
| 24 | [Observabilité / Audit / Incident](./24-OBSERVABILITE-AUDIT-INCIDENT.md) | CANONICAL |
| 25 | [Tests et qualité](./25-TESTS-ET-QUALITE.md) | CANONICAL |
| 26 | [Déploiement / Environnements / Production](./26-DEPLOIEMENT-ENVIRONNEMENTS-PRODUCTION.md) | CANONICAL |
| 27 | [ADR / Architecture Decision Records](./27-ADR-ARCHITECTURE-DECISION-RECORDS.md) | CANONICAL |

---

# Principes structurants

Les règles suivantes traversent toute la série :

```text
Person ≠ UserAccount
Asset ≠ Case
Document ≠ DocumentFile
Ownership ≠ Usage ≠ Management
Command = Request
Event = Fact
SearchIndex ≠ SourceOfTruth
Realtime ≠ SourceOfTruth
NotificationIntent ≠ NotificationDelivery
Orchestrator coordinates; Domain decides
DENY > ALLOW
```

---

# Architecture de référence

```text
Mobile-first PWA
        │
        ▼
Presentation / Features
        │
        ▼
Application Services / Orchestrators
        │
        ▼
Domain Modules
        │
        ▼
Repositories / Public APIs
        │
        ▼
Supabase
├── PostgreSQL
├── Auth
├── Storage
├── RLS
├── Realtime
├── Edge Functions
└── Jobs/Cron
```

Le système reste un **modular monolith orienté domaines**, avec cohérence éventuelle contrôlée entre domaines.

---

# Règles de sécurité

- Deny-by-default.
- RLS pour les données privées exposées.
- Aucune autorisation critique uniquement dans React.
- Service role uniquement serveur.
- Secrets hors Git.
- Les ressources secrètes ne deviennent pas visibles par transitivité.
- Toute action représentée conserve l’acteur réel et le mandat.
- Les actions sensibles sont auditées.

---

# Règles offline

- UUID stables.
- Drafts locaux.
- Client Outbox pour les commandes.
- Server Outbox pour les événements.
- Idempotence.
- Optimistic concurrency.
- Aucun écrasement silencieux des données sensibles.
- Revalidation des permissions à la reconnexion.

---

# Règles documentaires

Lorsqu’un document canonique évolue :

1. modifier le document source concerné ;
2. vérifier ses dépendances inter-domaines ;
3. vérifier si un ADR est nécessaire ;
4. mettre à jour code/tests/migrations concernés ;
5. conserver la compatibilité contractuelle ou versionner ;
6. mettre à jour cet index si le statut change.

---

# Ancienne documentation

Les fichiers B1→B16 et les Blueprints antérieurs présents dans `docs/` sont conservés comme historique ou support d’implémentation.

Ils ne doivent pas être supprimés sans audit, mais **ils ne remplacent plus la série canonique 00→27**.

---

# État final

```text
Documentation canonique : 28 / 28 fichiers
Série 00–27 : COMPLETE
Fondation documentaire : COMPLETE
Prochaine phase : Documentation ↔ Code gap audit
```

La prochaine étape logique consiste à comparer cette documentation au code réel, puis produire une matrice :

```text
Requirement
→ Current code
→ Complete / Partial / Missing
→ Tests
→ Migration
→ Priority
```
