# AUDIT COMPLET — DOCUMENTATION CANONIQUE ↔ CODE RÉEL

**Projet :** Heritage Guardian / Fonciers  
**Date :** 2026-09-27  
**Branche auditée :** `main`  
**Commit de référence :** `6ac07524f899ec205ac8195f0eeeb442ec0ba2c2`  
**Référentiel :** `docs/canonical/00 → 27`  
**Statut :** SUPPORTING — AUDIT BASELINE

---

# 1. Objectif

Comparer la documentation canonique complète 00→27 au code réellement présent dans le dépôt afin d’identifier :

- ce qui existe et doit être conservé ;
- ce qui existe mais doit être étendu/corrigé ;
- ce qui manque ;
- les écarts de sécurité ;
- les écarts de modèle de données ;
- les écarts offline/sync ;
- les écarts UI/UX ;
- les écarts qualité/production ;
- l’ordre de finalisation recommandé.

L’audit suit la règle :

```text
AUDIT FIRST
→ REUSE FIRST
→ DELTA ONLY
→ PRODUCTION ONLY
```

Aucune reconstruction complète du projet n’est recommandée.

---

# 2. État technique vérifié

Le dépôt contient actuellement :

- React 18 + TypeScript + Vite ;
- React Router ;
- TanStack Query ;
- Tailwind + shadcn/ui ;
- Supabase JS ;
- PostgreSQL/Supabase migrations ;
- Supabase Auth ;
- Storage ;
- RLS ;
- Edge Functions ;
- Dexie pour offline ;
- vite-plugin-pwa ;
- i18n français/anglais ;
- Vitest ;
- pgTAP/Supabase DB tests ;
- GitHub Actions.

## CI actuelle

Le workflow `.github/workflows/quality.yml` exécute :

```text
npm ci
npm run check

supabase start
supabase db reset --local
supabase test db
```

Sur le commit de référence, les deux jobs :

- `check`
- `database`

sont **SUCCESS**.

Cela prouve que la baseline actuelle build, typecheck selon la configuration actuelle, lint, exécute les tests Vitest et les tests DB présents.

---

# 3. Fondation existante à conserver

Les anciens Blueprints B1→B10 ont une implémentation concrète et réutilisable.

| Bloc existant | Migration / code | Test DB | Audit |
|---|---|---:|---|
| B1 Usage Preferences | Oui | Oui | Solide baseline |
| B2 Biens + right holders | Oui | Oui | Solide baseline |
| B3 Dossiers + participants | Oui | Oui | Solide baseline |
| B4 Procédures + parcours | Oui | Oui | Solide baseline |
| B5 Acteurs + compétences + credentials | Oui | Oui | Solide baseline |
| B6 Documents + versions + Storage | Oui | Oui | Solide baseline |
| B7 Access requests/grants/scopes | Oui | Oui | Solide baseline |
| B8 Interventions | Oui | Oui | Solide baseline |
| B9 Communications contextuelles | Oui | Oui | Solide baseline |
| B10 Signalements | Oui | Oui | Solide baseline |

Ces blocs doivent être **migrés vers le modèle canonique**, pas supprimés/recréés sans nécessité.

---

# 4. Schéma actuellement présent

Les types Supabase générés exposent notamment :

```text
profiles
user_roles
usage_preferences

persons
biens
bien_right_holders

dossiers
dossier_participants

procedure_definitions
procedure_steps
dossier_steps

actors
actor_competences
actor_credentials

proofs
document_versions

access_requests
access_request_scopes
access_grants
access_grant_scopes
access_grant_documents

dossier_interventions

conversations
conversation_members
messages

signalements
signalement_events
signalement_documents
signalement_witnesses

alerts

ai_conversations
ai_messages
```

Le schéma n’implémente pas encore la majorité des agrégats canoniques nouveaux.

---

# 5. Écart Types Supabase

La migration `ai_rate_limits` crée une table `ai_rate_limits`, mais le fichier généré :

`src/integrations/supabase/types.ts`

ne l’expose pas.

Conclusion :

> Les types Supabase générés ne sont pas totalement synchronisés avec l’état des migrations.

**Action :** ajouter une étape de génération/vérification des types Supabase dans la chaîne de travail/CI.

---

# 6. Matrice canonique 00→27

L’évaluation utilise :

- **COMPLETE** : exigences canoniques principales implémentées et testées ;
- **PARTIAL** : fondation réutilisable présente mais exigences importantes manquantes ;
- **MISSING** : le domaine/système canonique n’existe pas réellement dans le code.

| # | Domaine / Architecture | Statut | État réel principal |
|---|---|---|---|
| 00 | Mémoire des terres | **MISSING** | Aucun `LandMemory`, `HistoricalEvent`, `BoundaryRecord` dédié |
| 01 | Héritage | **PARTIAL** | Dossier type héritage + participants/preuves, mais pas `InheritanceCase/Estate/HeirStatus` |
| 02 | Volontés secrètes | **MISSING** | Aucun agrégat Will, trigger, release review/disclosure |
| 03 | Mes biens / Asset | **PARTIAL** | `biens/persons/bien_right_holders` présents ; objectifs, relations canoniques, subdivisions manquent |
| 04 | Transmission / Donation / Partage | **MISSING** | Aucun `TransmissionCase/Proposal/Agreement/Formalization` dédié |
| 05 | Personnes / Famille / Relations | **PARTIAL** | `persons` présent ; family relations, RoleAssignment, PermissionDeny, Mandate manquent |
| 06 | Documents / Preuves | **PARTIAL** | proofs + versions + Storage solides ; DocumentLink/Requirement/Testimony/confidentialité canonique manquent |
| 07 | Procédures | **PARTIAL** | définitions/steps/dossier_steps présents ; ProcedureCase/Requirements/Blockers/Outcomes complets manquent |
| 08 | Professionnels / Intervenants | **PARTIAL** | actors/skills/credentials/interventions présents ; Need/Mission/MissionScope/COI manquent |
| 09 | Gestion des conflits | **PARTIAL** | signalements présents ; ConflictCase/Issue/Party/Position/Agreement/Impact manquent |
| 10 | Protection / Alertes | **PARTIAL** | alertes simples présentes ; RuleVersion/RiskSignal/Audience/Action manquent |
| 11 | Vie économique | **MISSING** | Aucun domaine économique canonique |
| 12 | Architecture inter-domaines | **PARTIAL** | features/repos/services existent ; pas de modules domain/public-api/application structurés |
| 13 | Event Model / Contracts | **MISSING** | Aucun `integration_outbox/inbox`, event envelope ou contract registry |
| 14 | Commands / Application Services | **PARTIAL** | RPC métier présentes ; pas de CommandEnvelope/Result/registry général |
| 15 | Autorisation globale | **PARTIAL** | RLS + roles + access grants ; pas RBAC+ABAC complet/denies/mandates/MissionScope |
| 16 | Modèle de données global | **PARTIAL** | B1→B10 substantiel ; modèle canonique incomplet |
| 17 | Offline / Synchronisation | **PARTIAL** | Dexie + queue ; seule création dossier réellement supportée |
| 18 | API / contrats frontend/backend | **PARTIAL** | repos/RPC/Edge Functions ; contrats versionnés/DTO registry manquent |
| 19 | Realtime / Notifications / Jobs | **PARTIAL** | email alerts minimal ; pas publications realtime, deliveries, jobs/cron canoniques |
| 20 | Recherche / Indexation | **MISSING** | Aucun moteur/index de recherche transverse |
| 21 | Vita | **PARTIAL** | chat + Edge Functions + rate limit ; pas orchestration structurée/tools/voice/local fallback |
| 22 | UI/UX transverse | **PARTIAL** | UI mobile solide ; navigation canonique et écrans nouveaux incomplets |
| 23 | Sécurité transverse | **PARTIAL** | RLS/Auth/Storage existants ; hardening incomplet |
| 24 | Observabilité / Audit / Incident | **MISSING** | pas d’audit structuré global, métriques/traces/incidents |
| 25 | Tests / Qualité | **PARTIAL** | CI + Vitest + pgTAP solides ; E2E/perf/a11y/security suites manquent |
| 26 | Déploiement / Production | **PARTIAL** | CI build/test présente ; staging/release/rollback/restore non automatisés |
| 27 | ADR | **PARTIAL** | registre canonique présent ; compliance automatisée et ADR individuels futurs non encore en place |

## Résumé

```text
COMPLETE : 0 / 28
PARTIAL  : 21 / 28
MISSING  : 7 / 28
```

Ce résultat ne signifie pas que le projet est peu avancé.

Il signifie que la **nouvelle cible canonique 00→27 est beaucoup plus large que la baseline B1→B10 déjà construite**.

---

# 7. Frontend — état réel

## Points forts

- séparation `src/features/` ;
- `src/data/` repositories ;
- `src/services/` ;
- `src/core/` ;
- pages par feature ;
- i18n FR/EN ;
- ErrorBoundary ;
- React Query ;
- UI shadcn ;
- responsive mobile ;
- PWA ;
- indicateur offline ;
- auth provider ;
- parcours onboarding/profile ;
- pages biens/dossiers/procédures/fichiers/assistant/alertes.

## Écart architectural

La cible canonique demande une séparation proche de :

```text
modules/<domain>/
  domain/
  application/
  infrastructure/
  presentation/
  public-api/
```

Le code reste organisé selon l’ancienne architecture :

```text
features/
data/
services/
core/
```

Cette architecture est exploitable et doit être **adaptée progressivement**, pas remplacée d’un coup.

## Violation de frontière observée

Des composants de présentation importent encore directement des repositories.

Exemple :

`BottomNav.tsx → profilesRepo`.

Cible :

```text
UI
→ hook/application client
→ repo/service
```

---

# 8. Navigation — écart canonique

Navigation documentée :

```text
Home      → /home
Cas       → /cas
+         → /cas/nouveau
Aide      → /aide
Procédure → /procedure
```

Navigation actuelle :

```text
/           Home
/dossiers   Dossiers
central CTA contextuel
/alerts     Alertes
/profile    Profil
```

Le BottomNav actuel affiche :

```text
Accueil
Dossiers
+
Alertes
Profil
```

**Écart : important mais corrigeable sans refonte.**

Recommandation :
- ajouter aliases/migration de routes ;
- aligner la BottomNav ;
- conserver Alertes/Profile dans Header/menus prévus par l’UX canonique.

---

# 9. PWA — état

## Présent

- `vite-plugin-pwa` ;
- manifest custom ;
- icons 192/512 ;
- enregistrement manuel du Service Worker ;
- garde Lovable preview/iframe ;
- Workbox runtime caching ;
- Dexie.

## Risque important

`vite.config.ts` applique :

```text
StaleWhileRevalidate
→ https://*.supabase.co/storage/*
→ cache 7 jours
```

Cette règle peut conserver localement des réponses Storage privées/signées après logout.

Cela contredit la politique canonique de minimisation/cache privé.

**Priorité : P0 sécurité.**

Recommandation :
- ne pas mettre en cache génériquement les fichiers Supabase privés ;
- distinguer assets publics vs ressources privées ;
- purger/partitionner les caches privés au logout.

---

# 10. Offline / Sync — état

## Présent

Dexie :

```text
drafts
queue
cachedDossiers
```

Queue :

```text
create_dossier
update_dossier
delete_dossier
```

Mais le moteur actuel ne traite réellement que :

```text
create_dossier
```

Les autres opérations déclenchent :

```text
Unsupported offline operation
```

## Manques canoniques

- CommandEnvelope offline générique ;
- dependency graph ;
- `base_version` ;
- `expected_version` ;
- SYNC_CONFLICT structuré ;
- uploads queue ;
- mutations Person/Asset/Documents/etc. ;
- politique de merge par domaine ;
- purge/partition forte au logout ;
- invalidation après revoke.

**Conclusion : PARTIAL, fondation utile mais encore limitée.**

---

# 11. Domain Events / Outbox

Aucune table actuelle :

```text
integration_outbox
integration_inbox
```

Aucune infrastructure canonique :

- DomainEventEnvelope ;
- event_version ;
- aggregate_sequence ;
- contract registry ;
- consumer subscriptions ;
- dead letter.

**Document 13 : MISSING.**

C’est une dépendance structurante pour Protection, Search, Notifications et workflows longs.

---

# 12. Commands / Application Services

Le backend possède plusieurs RPC métier solides :

- `create_dossier` ;
- `initialize_dossier_journey` ;
- `transition_dossier_step` ;
- `register_document_version` ;
- `request_dossier_access` ;
- `resolve_access_request` ;
- `create_dossier_intervention` ;
- `create_contextual_conversation` ;
- `create_signalement`.

C’est une excellente base pour le futur Command Model.

Mais il manque :

- CommandEnvelope standard ;
- command_version ;
- CommandResult ;
- idempotency généralisée ;
- Application Services dédiés ;
- Public APIs par domaine ;
- process managers.

---

# 13. Autorisation

## Présent

- Supabase Auth ;
- `user_roles` ;
- RLS ;
- ownership ;
- dossier participants ;
- access requests/grants/scopes ;
- credentials/verifier roles ;
- tests SQL.

## Manque

```text
role_assignments
permission_grants
permission_denies
representation_mandates
mission_scopes
role_conflicts
ActionContext complet
```

Le modèle canonique :

```text
DENY > ALLOW
```

n’est donc pas encore implémenté globalement.

---

# 14. Documents

## Points forts

- versionnement ;
- checksum ;
- Storage privé ;
- signed URLs ;
- RPC d’enregistrement ;
- archivage ;
- RLS ;
- tests DB.

## Manques

- Document master générique indépendant des dossiers ;
- DocumentLink N-N ;
- DocumentRequirement ;
- testimony ;
- EvidenceConflict ;
- niveaux de confidentialité canoniques ;
- représentation original/preview/OCR/transcription structurée.

Le domaine 06 est l’un des plus avancés mais reste **PARTIAL**.

---

# 15. Procédures

## Présent

- ProcedureDefinition ;
- ProcedureStep ;
- DossierStep ;
- conditions d’applicabilité ;
- initialisation parcours ;
- transitions ;
- UI.

## Manques

- ProcedureCase distinct ;
- ProcedureVersion robuste ;
- Requirement ;
- blocker ;
- appointment ;
- submission ;
- outcome ;
- deadline model ;
- jurisdiction structurée.

---

# 16. Professionnels

## Présent

- Actor ;
- competence ;
- credential ;
- vérification ;
- disponibilité ;
- recommendation service ;
- intervention.

## Manques

- InterventionNeed ;
- Mission ;
- MissionScope ;
- conflict of interest ;
- candidate evaluation persisted ;
- recommendation set ;
- mission deliverables.

Le ranking actuel est utile mais encore simplifié.

---

# 17. Conflits

Le code actuel possède `signalements`.

C’est utile pour :
- déclaration ;
- contestation ;
- événement ;
- documents ;
- témoins ;
- communication.

Mais le domaine canonique 09 est plus riche :

```text
ConflictCase
Issue
Party
Position
Evidence
Proposal
Agreement
Mediation
Impact
WorkflowDependency
```

Le signalement ne doit donc pas être simplement renommé en ConflictCase.

Il doit devenir une source/entrée possible vers le domaine conflit.

---

# 18. Protection / Alertes

## État actuel

Les alertes sont calculées côté application à partir de règles TypeScript :

- aucune preuve ;
- aucun participant ;
- dossier à risque ;
- dossier ancien ;
- profil incomplet.

Puis le client écrit dans `alerts`.

## Écart canonique

Le document 10 exige :

```text
ProtectionRuleVersion
→ Evaluation
→ RiskSignal
→ ProtectionAlert
→ Audience
→ RecommendedAction
→ NotificationIntent
```

Le code actuel n’a pas :

- rules versionnées ;
- risk signals ;
- audience per-recipient ;
- protection actions ;
- reminders ;
- monitoring subscriptions.

Le moteur d’alertes actuel doit être conservé comme **prototype de règles**, puis déplacé vers la nouvelle architecture.

---

# 19. Notifications

Le système possède :
- alertes in-app ;
- notification email via Edge Function/Resend.

Mais pas :
- NotificationIntent ;
- NotificationDelivery ;
- channel routing ;
- delivery idempotency ;
- retry queue ;
- SMS/Push abstractions ;
- preferences par catégorie/canal.

## Risque idempotence email

L’Edge Function envoie l’email, puis le frontend marque `email_sent_at`.

Si le provider réussit mais que le client ne réalise pas le marquage, un nouvel appel peut renvoyer le message.

Le modèle canonique Delivery doit résoudre ce problème.

---

# 20. Realtime / Jobs

Aucune migration actuelle n’ajoute explicitement les tables métier aux publications `supabase_realtime`.

Aucun système canonique de :

- ScheduledJob ;
- JobRun ;
- cron métier ;
- retry workers ;
- expiration jobs.

**19 reste PARTIAL uniquement grâce aux notifications minimales.**

---

# 21. Recherche

Aucun SearchIndex canonique.

Pas de :
- `search_documents` ;
- SearchProjection ;
- FTS transverse ;
- geo search ;
- autocomplete sécurisé ;
- offline search index.

**20 : MISSING.**

---

# 22. Vita — état

## Présent

- page assistant ;
- chat streaming ;
- Edge Function ;
- auth token ;
- rate limiting ;
- FR/EN ;
- suggestions contextuelles.

## Écart critique de minimisation

`fetchDossierSuggestions` transmet le dossier complet à `ai-context`.

L’Edge Function reconstruit ensuite un prompt incluant notamment :

- type ;
- titre ;
- statut ;
- score ;
- localisation ;
- description ;
- compteurs.

Le modèle canonique exige une **SafeAssistantProjection** minimale et des tools structurés.

## Manques

- intent resolver ;
- tool allowlist applicative ;
- structured query/command tools ;
- PendingCommand ;
- confirmation des actions sensibles ;
- voice input ;
- local knowledge ;
- offline assistant ;
- tool result grounding ;
- prompt-injection isolation complète.

---

# 23. Edge Functions — sécurité

## Points positifs

- validation input ;
- token d’accès ;
- `getUser()` côté serveur ;
- AI quota ;
- secrets via Deno.env ;
- limites taille messages.

## Écarts

### CORS

```text
Access-Control-Allow-Origin: *
```

dans les fonctions.

À restreindre en production selon les origines autorisées.

### JWT config

`supabase/config.toml` :

```toml
[functions.ai-chat]
verify_jwt = false

[functions.ai-context]
verify_jwt = false
```

Le code réalise une vérification manuelle via `getUser()`, donc les fonctions ne sont pas ouvertes sans contrôle applicatif.

Mais la défense en profondeur canonique recommande d’évaluer l’activation de la vérification JWT plateforme si compatible.

---

# 24. TypeScript

`tsconfig.app.json` contient :

```json
"strict": false,
"noImplicitAny": false,
"noUnusedLocals": false,
"noUnusedParameters": false
```

La CI typecheck réussit, mais avec une configuration plus permissive que le document 25.

**Action : migration progressive vers strict mode**, sans basculement brutal.

---

# 25. Architecture lint

ESLint ne contrôle actuellement pas :

- imports cross-domain ;
- accès direct à repository étranger ;
- frontières public-api.

Le document 25 prévoit ce contrôle.

Ajouter ultérieurement :
- règle boundary ;
- `check-domain-boundaries.mjs`.

---

# 26. Tests

## Présent

Vitest couvre notamment :

- access-control ;
- actor recommendation ;
- alerts ;
- communications ;
- documents ;
- dossier scoring ;
- interventions ;
- journey ;
- signalement.

SQL/pgTAP couvre B1→B10 + phase0.

## Manque

- E2E navigateur ;
- tests canonical 00→11 ;
- contract tests 13/14/18 ;
- generic offline sync ;
- accessibility ;
- performance ;
- security automated scan ;
- Search ;
- Vita tool orchestration ;
- recovery/backup ;
- staging smoke.

---

# 27. Observabilité

Présent :
- ErrorBoundary ;
- console errors ;
- CI.

Absent :
- structured logger ;
- metrics ;
- traces ;
- global audit_events ;
- correlation IDs généralisés ;
- incident records ;
- SLO/SLI ;
- technical alerting.

**24 : MISSING comme système transverse.**

---

# 28. Production / Deployment

Présent :
- Quality workflow ;
- build ;
- DB reset/tests ;
- PWA build ;
- env example.

Absent :
- staging deployment workflow ;
- production deployment workflow ;
- release manifest ;
- release certification automatisée ;
- migration deployment gate ;
- backup/restore evidence ;
- rollback automation ;
- production smoke workflow ;
- deploy markers.

---

# 29. Problèmes prioritaires P0

## P0-01 — Cache PWA des fichiers privés

Retirer la stratégie générique de cache Supabase Storage privé ou la remplacer par une stratégie explicitement sûre.

## P0-02 — Autorisation canonique

Introduire progressivement :
- RoleAssignment ;
- PermissionGrant/Deny ;
- RepresentationMandate ;
- ActionContext ;
- MissionScope.

## P0-03 — Events / Outbox / Inbox

Créer :
- `integration_outbox` ;
- `integration_inbox` ;
- DomainEventEnvelope ;
- idempotent consumers.

## P0-04 — Command infrastructure

Standardiser :
- command_id ;
- command_name/version ;
- idempotency ;
- expected_version ;
- result/error taxonomy.

## P0-05 — Audit global

Créer `audit_events` et l’infrastructure minimale de correlation_id.

## P0-06 — Vita data minimization

Ne plus transmettre le dossier brut au modèle externe.

Créer une projection assistant explicitement sûre.

## P0-07 — CORS / Edge hardening

Restreindre origines production et renforcer la défense JWT.

## P0-08 — Generated Supabase Types

Régénérer et valider automatiquement les types après migrations.

---

# 30. Priorités P1 — Domaines métier

Ordre recommandé :

```text
05 Person / Authorization foundation
↓
03 Asset canonical extension
↓
06 Document canonical extension
↓
07 Procedure canonical extension
↓
08 Professional / Mission
↓
00 Land Memory
↓
01 Inheritance
↓
04 Transmission
↓
09 Conflict
↓
10 Protection
↓
11 Economic Lifecycle
↓
02 Secret Wills
```

Le domaine 02 est placé après la fondation sécurité car son niveau de confidentialité est maximal.

---

# 31. Priorités P1 — Infrastructure

En parallèle contrôlé :

1. Commands/Application Services ;
2. Domain Events + Outbox/Inbox ;
3. Authorization engine ;
4. Audit ;
5. generic Offline Command Queue ;
6. NotificationIntent/Delivery ;
7. Scheduled Jobs ;
8. Search ;
9. Vita tools.

---

# 32. Priorités P2 — UI/UX

- aligner les routes canoniques ;
- BottomNav Home/Cas/+/Aide/Procédure ;
- Header notifications/profile ;
- créer les écrans des nouveaux domaines ;
- représentation visible ;
- états stale/offline/sync conflict ;
- confirmations sensibles ;
- Search UI ;
- Vita voice/accessibility.

---

# 33. Priorités P2 — Qualité

- TypeScript strict progressif ;
- architecture boundaries ;
- contract tests ;
- E2E ;
- accessibility ;
- security tests ;
- performance budgets ;
- backup restore drill ;
- release certification.

---

# 34. Phasage de finalisation recommandé

## Phase A — Stabilisation sécurité/fondation

- PWA cache ;
- CORS/JWT ;
- Supabase types ;
- audit ;
- command/event foundation.

## Phase B — Identity / Authorization canonical

- Person ;
- family relations ;
- roles ;
- grants/denies ;
- mandates ;
- ActionContext.

## Phase C — Existing domains upgrade

- Asset ;
- Documents ;
- Procedures ;
- Professionals.

## Phase D — Missing patrimonial domains

- Land Memory ;
- Inheritance ;
- Transmission ;
- Conflict ;
- Protection ;
- Economic.

## Phase E — Secret Wills

Après sécurité/confidentialité canonique.

## Phase F — Transverse engines

- Search ;
- Notifications ;
- Jobs ;
- Realtime ;
- generic Offline Sync ;
- Vita.

## Phase G — UI/UX reconciliation

Routes, navigation et nouveaux écrans.

## Phase H — Production certification

E2E, security, performance, staging, backup/restore, go-live.

---

# 35. Ce qu’il ne faut pas refaire

Conserver et faire évoluer :

- AuthProvider ;
- Supabase client ;
- `features/` existantes pendant migration ;
- repositories ;
- B1→B10 migrations ;
- RLS existantes ;
- tests pgTAP ;
- composants UI ;
- i18n ;
- PWA registration ;
- Dexie foundation ;
- RPC métier déjà sûres ;
- Edge Functions existantes après hardening.

---

# 36. Ce qu’il faut éviter

- recréer une deuxième table Asset en parallèle de `biens` sans plan de migration ;
- recréer un second système Documents ;
- abandonner B1→B10 ;
- créer une nouvelle app ;
- migrer tous les fichiers d’un coup ;
- remplacer Supabase ;
- introduire microservices maintenant ;
- coder les nouveaux domaines sans authorization/audit/event foundations.

---

# 37. Conclusion

Le projet est dans un état **fondation production intermédiaire solide**, mais pas encore conforme à l’architecture canonique complète.

La meilleure stratégie n’est pas une refonte.

C’est une **convergence progressive** :

```text
Existing B1–B10
+
Canonical 00–27
→ Delta implementation
→ Tests
→ Production
```

La base actuelle apporte déjà :

- authentification ;
- profils ;
- préférences ;
- biens ;
- dossiers ;
- procédures ;
- acteurs ;
- documents ;
- contrôle d’accès initial ;
- interventions ;
- communications ;
- signalements ;
- alertes simples ;
- assistant ;
- offline dossier ;
- PWA ;
- CI ;
- pgTAP.

Les plus grands écarts sont :

1. nouveaux domaines patrimoniaux ;
2. autorisation canonique ;
3. events/outbox/inbox ;
4. command/application layer ;
5. offline générique ;
6. Protection/Notifications/Jobs ;
7. Search ;
8. Vita structurée ;
9. observabilité/audit ;
10. production certification.

---

# 38. Décision de sortie de l’audit

**AUDIT COMPLET : TERMINÉ**

Prochaine étape recommandée :

> **Phase A — Stabilisation sécurité et fondation transverse**, avant de coder les nouveaux domaines.

Cette phase doit être exécutée en delta sur le code actuel, avec migrations versionnées et tests, sans reconstruction du projet.
