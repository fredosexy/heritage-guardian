# Documentation — Heritage Guardian / Fonciers

Ce dossier contient l’ensemble de la documentation du projet.

## Source de vérité

La documentation actuelle et normative se trouve dans :

**[docs/canonical/](./canonical/README.md)**

La série canonique **00 → 27 est complète** et couvre les domaines métier, l’architecture, les contrats, la sécurité, l’offline, l’UI/UX, la production et les ADR.

---

## Priorité documentaire

```text
1. docs/canonical/00–27  → CANONICAL
2. ADR ACCEPTED          → décisions actives
3. documents supporting  → aide à l’implémentation
4. anciens B1–B16        → legacy/supporting
```

En cas de contradiction, la série canonique prévaut.

---

## Accès rapide

- [Index canonique complet](./canonical/README.md)
- [Audit Documentation ↔ Code — 2026-09-27](./audits/2026-09-27-CANONICAL-CODE-AUDIT.md)
- [12 — Architecture inter-domaines](./canonical/12-ARCHITECTURE-INTER-DOMAINES.md)
- [13 — Event Model & Contracts](./canonical/13-EVENT-MODEL-AND-CONTRACTS.md)
- [14 — Commands & Application Services](./canonical/14-COMMANDS-AND-APPLICATION-SERVICES.md)
- [15 — Autorisation globale](./canonical/15-AUTORISATION-GLOBALE.md)
- [17 — Offline & Synchronisation](./canonical/17-OFFLINE-FIRST-ET-SYNCHRONISATION.md)
- [23 — Sécurité transverse](./canonical/23-SECURITE-APPLICATIVE-TRANSVERSE.md)
- [25 — Tests et qualité](./canonical/25-TESTS-ET-QUALITE.md)
- [26 — Déploiement / Production](./canonical/26-DEPLOIEMENT-ENVIRONNEMENTS-PRODUCTION.md)
- [27 — ADR](./canonical/27-ADR-ARCHITECTURE-DECISION-RECORDS.md)

---

## Audits

### 2026-09-27 — Documentation canonique ↔ Code réel

**[Ouvrir l’audit complet](./audits/2026-09-27-CANONICAL-CODE-AUDIT.md)**

Résultat :

```text
COMPLETE : 0 / 28
PARTIAL  : 21 / 28
MISSING  : 7 / 28
```

Ce résultat utilise la cible canonique complète 00→27. La baseline existante B1→B10 reste une fondation technique réelle et réutilisable.

Prochaine phase recommandée :

**Phase A — Stabilisation sécurité et fondation transverse.**

---

## Documentation historique existante

Le dossier contient aussi notamment :

- B1 — Auth + Profiles + Usage Preferences
- B2 — Biens + Titulaires / Ayants droit
- B3 — Dossiers + Participants
- B4 — Procedure Definitions + Parcours
- B5 — Acteurs + Compétences + Habilitations
- B6 — Documents + Storage + Versionnement
- B7 — Access Requests + Grants + Scopes
- B8 — Interventions + Chaîne de responsabilité
- B9 — Communications contextuelles
- B10 — Signalements + Contestations
- B11 — Audit Events
- B12 — Offline Sync
- B13 — Notifications
- B14 — Back-office
- B15 — Production Hardening
- B16 — Staging + Go-live
- DOMAIN-BLUEPRINT.md
- IMPLEMENTATION-MATRIX.md
- FONDATION À LA PRODUCTION.md
- PHASE-0-BASELINE.md

Ces documents restent utiles pour l’historique et certaines informations d’implémentation, mais doivent être relus à la lumière de la série canonique.

---

## Règle pour toute modification

```text
AUDIT FIRST
→ REUSE FIRST
→ DELTA ONLY
→ PRODUCTION ONLY
```

Avant de modifier le code :

1. identifier le ou les documents canoniques concernés ;
2. inspecter le code existant ;
3. comparer documentation ↔ implémentation ;
4. modifier uniquement le delta nécessaire ;
5. ajouter/mettre à jour les tests ;
6. vérifier migrations, RLS, offline et sécurité si concernés.

---

## État

```text
Documentation canonique : COMPLETE — 00→27
Audit documentation ↔ code : COMPLETE
Code conforme à la cible canonique : PARTIAL
```

La suite n’est plus un nouvel audit documentaire. Elle consiste à appliquer le backlog de convergence défini par l’audit.
