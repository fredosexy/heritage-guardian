# 26 — DÉPLOIEMENT / ENVIRONNEMENTS / PRODUCTION

**Projet :** Heritage Guardian / Fonciers  
**Statut :** CANONICAL — V1.0  
**Position :** 26/27  
**Type :** Spécification transverse déploiement, environnements, CI/CD, migrations, release, rollback et go-live

---

# 1. Mission

Définir comment l’application passe du développement à la production de manière :

- reproductible ;
- sécurisée ;
- traçable ;
- testable ;
- réversible ;
- compatible PWA ;
- compatible Supabase ;
- compatible offline-first ;
- sans perte silencieuse de données.

---

# 2. Principe fondamental

```text
Deploy
≠
Copy files
```

Un déploiement de production comprend :

```text
Code
+ Configuration
+ Database migrations
+ RLS
+ Storage policies
+ Edge Functions
+ Jobs
+ Secrets
+ PWA assets
+ Verification
+ Rollback plan
```

---

# 3. Environnements

Environnements canoniques :

```text
LOCAL
CI
STAGING
PRODUCTION
```

Un environnement PREVIEW peut être ajouté pour les PR lorsque la plateforme le permet.

---

# 4. LOCAL

Objectifs :

- développement ;
- tests rapides ;
- Supabase local si disponible ;
- données synthétiques ;
- aucun secret production.

---

# 5. CI

Environnement temporaire pour :

- lint ;
- typecheck ;
- tests ;
- migrations ;
- pgTAP ;
- build ;
- scans sécurité.

---

# 6. STAGING

Doit être structurellement proche de production :

- même schéma ;
- mêmes RLS ;
- mêmes migrations ;
- mêmes feature flags structurels ;
- providers sandbox lorsque nécessaire.

---

# 7. PRODUCTION

Données réelles.

Exigences maximales :

- secrets dédiés ;
- logs/monitoring ;
- backup ;
- restrictions admin ;
- branch protection ;
- release certification.

---

# 8. Séparation stricte

```text
development database
≠
staging database
≠
production database
```

Même principe pour Storage et secrets.

---

# 9. Configuration

Séparer :

```text
CODE
CONFIG
SECRETS
```

La configuration ne doit pas nécessiter une modification du code pour chaque environnement.

---

# 10. Environment variables

Catégories :

- public frontend config ;
- server config ;
- secrets.

---

# 11. Public config

Exemples :

```text
PUBLIC_APP_ENV
PUBLIC_SUPABASE_URL
PUBLIC_SUPABASE_ANON_KEY
PUBLIC_RELEASE_VERSION
```

Une clé publique n’est pas un secret.

---

# 12. Secrets serveur

Exemples :

- service role ;
- webhook secrets ;
- notification provider secrets ;
- private API keys.

Jamais préfixés comme public.

---

# 13. Validation de configuration

Au démarrage/deploy :

- vérifier variables requises ;
- vérifier format ;
- refuser config incohérente.

---

# 14. ReleaseVersion

Chaque release possède :

```text
release_version
commit_sha
build_id
deployed_at
environment
```

---

# 15. Versioning

Approche recommandée :

```text
MAJOR.MINOR.PATCH
```

ou version interne équivalente, tant qu’elle reste traçable.

---

# 16. Release manifest

```text
ReleaseManifest {
  release_version
  commit_sha
  build_id
  migration_range
  event_contract_versions
  command_contract_versions
  feature_flags
}
```

---

# 17. CI/CD

Pipeline cible :

```text
Pull Request
↓
Static checks
↓
Tests
↓
Build
↓
Security scans
↓
Preview optional
↓
Merge main
↓
Staging deploy
↓
Staging validation
↓
Release certification
↓
Production deploy
↓
Smoke tests
↓
Monitoring
```

---

# 18. Pull Request gate

Bloquer merge si :

- lint failed ;
- typecheck failed ;
- test critique failed ;
- pgTAP failed ;
- secret detected ;
- build failed.

---

# 19. Main branch

Main représente la branche intégrée de référence.

Elle doit rester déployable.

---

# 20. Protected branch

Recommandé :

- PR obligatoire ;
- CI obligatoire ;
- review ;
- restrictions force push.

---

# 21. Build

Le build doit être reproductible depuis :

```text
commit
+ lockfile
+ config
```

---

# 22. Lockfile

Obligatoire et committé.

---

# 23. Artifact

Le build de production produit un artifact identifiable par build_id.

---

# 24. Build once

Lorsque possible :

```text
Build once
→ promote same artifact
```

plutôt que reconstruire différemment pour chaque environnement.

---

# 25. Supabase migrations

Toute modification DB passe par migration versionnée.

---

# 26. Migration naming

Exemple :

```text
20260927_001_create_protection_tables.sql
```

---

# 27. Migration content

Peut inclure :

- table ;
- column ;
- index ;
- constraint ;
- policy ;
- function ;
- trigger ;
- publication.

---

# 28. RLS in migration

Une table sensible ne doit pas être livrée sans RLS dans la même série de migrations.

---

# 29. Migration review

Vérifier :

- destructive change ;
- lock risk ;
- data migration ;
- index cost ;
- RLS ;
- SECURITY DEFINER ;
- rollback/corrective plan.

---

# 30. Migration order

```text
expand
→ deploy compatible code
→ migrate/backfill
→ switch
→ contract old schema later
```

pour les changements risqués.

---

# 31. Expand/contract

Pattern recommandé pour zero/minimal downtime.

---

# 32. Destructive migration

Exemples :

- DROP COLUMN ;
- DROP TABLE ;
- rename breaking.

Doivent avoir :
- preuve d’absence d’usage ;
- backup ;
- migration plan ;
- release coordination.

---

# 33. Backfill

Les backfills longs doivent être :

- idempotents ;
- resumables ;
- observables ;
- batchés.

---

# 34. Backfill ≠ transaction géante

Éviter une transaction très longue bloquant la production.

---

# 35. Database backup

Avant migration risquée :

- snapshot/backup ;
- restauration testée selon criticité.

---

# 36. Storage migrations

Les changements de path/bucket doivent être versionnés et réversibles autant que possible.

---

# 37. Edge Functions

Déployer avec :

- version ;
- config ;
- secrets ;
- timeout ;
- logs ;
- rollback.

---

# 38. Function compatibility

Une Edge Function mise à jour doit rester compatible avec les clients encore supportés.

---

# 39. Cron / Jobs

Les jobs planifiés doivent être définis comme configuration/version contrôlée.

---

# 40. Job deploy

Lors d’un changement de cadence :

- documenter ;
- vérifier timezone ;
- éviter doublons ;
- conserver idempotence.

---

# 41. Realtime publications

Toute nouvelle publication Realtime est explicitement versionnée/reviewée.

---

# 42. Search index

Une release modifiant le schema d’index doit prévoir :

- rebuild ;
- compatibility ;
- rollback ;
- monitoring.

---

# 43. PWA manifest

Le manifest de production doit contenir :

- name ;
- short_name ;
- icons ;
- start_url ;
- scope ;
- display ;
- theme/background.

---

# 44. Service Worker

Déploiement contrôlé.

Le service worker ne doit pas servir indéfiniment une ancienne version incompatible.

---

# 45. PWA cache version

Utiliser une version de cache liée à la release.

---

# 46. PWA update strategy

Pattern :

```text
new service worker
→ waiting
→ notify user
→ preserve draft
→ activate
→ refresh safely
```

---

# 47. Forced update

Réservé à :

- fail sécurité ;
- incompatibilité critique ;
- migration client incompatible.

---

# 48. Offline drafts during update

Les drafts locaux doivent être préservés.

---

# 49. Minimum supported client

Le backend peut refuser un client trop ancien.

Réponse :

```text
CLIENT_VERSION_UNSUPPORTED
```

---

# 50. Feature flags

Permettent :

- rollout progressif ;
- désactivation rapide ;
- test staging ;
- canary.

---

# 51. Feature flag ≠ permission

Une feature activée ne donne aucun droit supplémentaire.

---

# 52. Flag lifecycle

```text
CREATED
TESTING
ROLLOUT
FULL
RETIRED
```

---

# 53. Retirer les vieux flags

Éviter l’accumulation de flags permanents.

---

# 54. Canary deploy

Option possible :

- petit trafic ;
- petit groupe ;
- observation ;
- élargissement.

---

# 55. Blue/green

Approche possible pour frontend ou services lorsque l’infrastructure le permet.

---

# 56. Rollback

Chaque release risquée doit avoir un rollback plan.

---

# 57. Code rollback

Revenir au build précédent lorsque DB reste compatible.

---

# 58. Migration rollback

Les migrations destructives peuvent rendre le rollback impossible.

Préférer corrective migration.

---

# 59. Rollback matrix

```text
frontend only → easy rollback
backend compatible → code rollback
schema additive → code rollback possible
schema destructive → corrective migration required
```

---

# 60. Rollback trigger

Exemples :

- 5xx spike ;
- auth broken ;
- RLS regression ;
- sync corruption ;
- migration failure ;
- critical UI path broken.

---

# 61. Release freeze

Pendant incident critique, suspendre les changements non nécessaires.

---

# 62. Staging validation

Avant prod :

- migrations ;
- RLS ;
- E2E ;
- offline ;
- uploads ;
- Search ;
- jobs ;
- notifications ;
- Vita ;
- PWA update.

---

# 63. Staging data

Synthétique et réaliste.

---

# 64. Staging parity

Les différences staging/prod doivent être documentées.

---

# 65. Production readiness review

Checklist avant go-live.

---

# 66. Infrastructure readiness

```text
[ ] production Supabase
[ ] backups
[ ] Storage policies
[ ] domains/DNS
[ ] HTTPS
[ ] monitoring
[ ] secrets
[ ] alerting
```

---

# 67. Application readiness

```text
[ ] build
[ ] routes
[ ] PWA
[ ] offline
[ ] update flow
[ ] error states
[ ] support
```

---

# 68. Security readiness

```text
[ ] RLS tests
[ ] secret scan
[ ] no service role frontend
[ ] security headers
[ ] rate limits
[ ] admin roles
[ ] incident procedure
```

---

# 69. Data readiness

```text
[ ] migrations
[ ] constraints
[ ] indexes
[ ] seed reference data
[ ] retention policy
[ ] backup restore
```

---

# 70. Operational readiness

```text
[ ] dashboards
[ ] alerts
[ ] runbooks
[ ] on-call/responsible
[ ] support process
[ ] incident owner
```

---

# 71. Quality readiness

```text
[ ] release certification
[ ] E2E
[ ] performance
[ ] accessibility
[ ] offline
[ ] migrations tested
```

---

# 72. Go-live strategy

Recommandé :

```text
internal validation
→ limited rollout
→ monitor
→ expand
```

---

# 73. Limited rollout

Peut cibler :

- équipe interne ;
- groupe pilote ;
- zone pilote.

---

# 74. Pilot

Le pilote permet de valider :

- compréhension ;
- réseau faible ;
- support ;
- procédures ;
- bugs terrain.

---

# 75. Terrain validation

Important pour cette application.

Tester avec :

- zone urbaine ;
- zone semi-rurale ;
- zone rurale ;
- connexion instable ;
- utilisateurs peu lecteurs.

---

# 76. No silent production experiment

Toute expérimentation doit être :

- définie ;
- mesurée ;
- réversible ;
- non trompeuse.

---

# 77. Smoke tests production

Après déploiement :

```text
login
Home
Asset query
Case query
Procedure query
Search
simple safe command
upload lightweight
offline shell
health checks
```

---

# 78. Synthetic production account

Compte dédié.

Jamais compte utilisateur réel.

---

# 79. Post-deploy watch

Pendant une période appropriée :

- errors ;
- latency ;
- RLS denies ;
- sync ;
- jobs ;
- notifications ;
- Search ;
- client crashes.

---

# 80. Deploy marker

Enregistrer :

```text
release_version
commit_sha
timestamp
actor
environment
```

---

# 81. Release audit

Toute production release est auditable.

---

# 82. Release notes

Doivent inclure :

- nouvelles fonctions ;
- changements visibles ;
- migrations importantes ;
- known issues ;
- rollback note.

---

# 83. User-facing notes

Simplifiées.

Ne pas exposer détails sécurité exploitables.

---

# 84. Known issues

Une issue connue non critique peut être livrée uniquement si :

- documentée ;
- workaround ;
- owner ;
- pas de risque critique.

---

# 85. Blockers

Interdiction de prod si :

- fuite connue ;
- RLS critique cassée ;
- corruption ;
- migrations non validées ;
- service role exposé ;
- E2E critique cassé.

---

# 86. Maintenance mode

Prévoir si migration exceptionnelle nécessite interruption.

---

# 87. Maintenance UX

Message clair :

> Le service est temporairement indisponible pour maintenance.

---

# 88. Read-only mode

Option utile pendant certaines opérations.

---

# 89. Read-only enforcement

Doit être côté backend, pas uniquement UI.

---

# 90. Disaster recovery

Prévoir scénarios :

- DB loss ;
- Storage issue ;
- provider outage ;
- secret leak ;
- bad migration ;
- app deploy broken.

---

# 91. RPO

```text
Recovery Point Objective
```

Tolérance maximale de perte de données.

---

# 92. RTO

```text
Recovery Time Objective
```

Temps cible pour restaurer le service.

---

# 93. RPO/RTO by component

Peuvent différer :

- DB ;
- Storage ;
- Search index ;
- read models.

Un SearchIndex peut être reconstruit, donc RPO différent de DB.

---

# 94. Backup schedule

À définir selon criticité.

---

# 95. Restore drill

Périodique.

Conserver :
- date ;
- durée ;
- résultat ;
- problèmes.

---

# 96. Search recovery

```text
restore source data
→ rebuild search index
```

---

# 97. Projection recovery

Les read models sont reconstructibles.

---

# 98. Outbox recovery

Après incident :

- ne pas perdre events PENDING ;
- reprendre publication ;
- idempotent consumers.

---

# 99. Client offline after incident

Le client peut conserver des commands pending.

Au retour serveur :
- auth ;
- permission ;
- expected_version ;
- sync.

---

# 100. DNS / domain

Le domaine de production doit être stable et TLS actif.

---

# 101. HTTPS

Obligatoire.

---

# 102. Security headers

Valider en production :
- CSP ;
- HSTS ;
- Referrer-Policy ;
- X-Content-Type-Options ;
- Permissions-Policy.

---

# 103. CORS production

Uniquement origines autorisées.

---

# 104. Source maps

Si utilisées :
- protéger leur exposition selon politique ;
- permettre diagnostic sans divulguer secrets.

---

# 105. Frontend env leak

Vérifier le bundle pour absence de :
- service role ;
- private API key ;
- secrets.

---

# 106. Release scanning

Avant prod :

- dependency audit ;
- secret scan ;
- build scan ;
- config validation.

---

# 107. Database connection policy

Limiter droits selon composant.

---

# 108. Least privilege

Chaque service utilise les permissions minimales nécessaires.

---

# 109. Admin tooling

Les outils admin production doivent être :
- séparés ;
- sécurisés ;
- audités.

---

# 110. Manual DB edits

Éviter.

Si exception :
- procédure ;
- review ;
- backup ;
- audit ;
- script reproductible.

---

# 111. Hotfix

Processus :

```text
branch
→ fix
→ targeted tests
→ review
→ staging/validation
→ production
```

---

# 112. Emergency hotfix

Même en urgence :
- pas de secret leak ;
- pas de bypass sécurité ;
- tests minimum ;
- audit release.

---

# 113. Release cadence

Peut être fréquente si CI forte.

Ne pas regrouper artificiellement trop de changements risqués.

---

# 114. Dependency upgrade

Tester en staging avant prod.

---

# 115. Supabase upgrade/change

Tout changement majeur :
- compatibility ;
- migration ;
- backup ;
- observability.

---

# 116. Provider outage

Le système doit dégrader proprement.

Exemple :
SMS down
→ intent pending
→ IN_APP still available.

---

# 117. Degraded production mode

Fonctionnalités principales doivent continuer si :
- notifications externes down ;
- Realtime down ;
- Vita LLM down ;
- Search advanced down.

---

# 118. Core availability

Priorité :
- auth ;
- lecture dossiers/biens ;
- commandes critiques ;
- documents ;
- sync.

---

# 119. Production configuration registry

Documenter :

```text
feature flags
job schedules
supported client versions
provider enablement
rate limits
```

sans stocker secrets.

---

# 120. Config changes

Toute modification production importante doit être :
- versionnée ou auditable ;
- revue ;
- réversible.

---

# 121. Observability readiness

Référence document 24.

Aucune prod sans :
- logs ;
- metrics ;
- alerts critiques ;
- correlation IDs.

---

# 122. Support readiness

Avant go-live :
- canal support ;
- procédures ;
- messages d’erreur ;
- correlation IDs ;
- escalation.

---

# 123. Documentation readiness

Avant prod :

- docs canonical à jour ;
- README ;
- runbooks ;
- ADR ;
- release notes.

---

# 124. Data seeding production

Uniquement données de référence :

- catégories ;
- définitions ;
- règles ;
- procédures validées.

Pas de données demo mélangées.

---

# 125. Demo data

En production :
- environnement séparé ;
- ou flag clair ;
- jamais confondu avec données utilisateur.

---

# 126. Analytics production

Activer seulement après :
- privacy review ;
- redaction ;
- consent/requirements appropriés.

---

# 127. Rollout metrics

Pendant rollout :
- activation ;
- errors ;
- abandonment ;
- sync failure ;
- support volume.

---

# 128. Rollout stop condition

Arrêter l’élargissement si :
- error rate ;
- crash ;
- sécurité ;
- support issue ;
- corruption.

---

# 129. Go-live owner

Une personne/équipe responsable coordonne le go-live.

---

# 130. Go-live checklist

```text
[ ] release certified
[ ] migrations applied
[ ] RLS verified
[ ] backups current
[ ] restore tested
[ ] smoke tests ready
[ ] monitoring ready
[ ] support ready
[ ] rollback ready
[ ] docs updated
```

---

# 131. Go-live decision

La décision doit être basée sur preuves.

Pas uniquement :

> Ça marche chez moi.

---

# 132. Post-go-live review

Après rollout :
- métriques ;
- incidents ;
- bugs ;
- feedback terrain ;
- corrective actions.

---

# 133. Production acceptance

Une release est considérée stable lorsque :
- smoke OK ;
- erreurs normales ;
- aucune regression critique ;
- queues normales ;
- sync normal.

---

# 134. ReleaseStatus

```text
PLANNED
STAGING
CERTIFIED
DEPLOYING
LIVE
DEGRADED
ROLLED_BACK
RETIRED
```

---

# 135. DeploymentRecord

```text
DeploymentRecord {
  id
  release_version
  commit_sha
  environment
  actor
  started_at
  completed_at
  status
  migration_set
  rollback_release?
}
```

---

# 136. Tests deployment

### TEST-DEP-001
Build reproducible from commit.

### TEST-DEP-002
Staging migrations succeed.

### TEST-DEP-003
Production config validation fails if secret missing.

### TEST-DEP-004
Old supported PWA client still works.

---

# 137. Tests rollback

### TEST-DEP-005
Frontend rollback restores previous version.

### TEST-DEP-006
Additive migration permits compatible rollback.

### TEST-DEP-007
Destructive migration has corrective plan.

---

# 138. Tests PWA

### TEST-DEP-008
Service worker update preserves drafts.

### TEST-DEP-009
Old cache is invalidated appropriately.

### TEST-DEP-010
Forced update occurs only under defined policy.

---

# 139. Tests recovery

### TEST-DEP-011
DB restore succeeds.

### TEST-DEP-012
Search index rebuild succeeds.

### TEST-DEP-013
Outbox resumes without duplicate business effect.

---

# 140. Tests go-live

### TEST-DEP-014
Production smoke login passes.

### TEST-DEP-015
Safe command passes.

### TEST-DEP-016
Upload/read private file passes.

### TEST-DEP-017
RLS negative smoke fails as expected.

---

# 141. Invariants déploiement

### INV-DEP-001
Les environnements ne partagent jamais leurs secrets.

### INV-DEP-002
Aucune table sensible n’est livrée sans RLS.

### INV-DEP-003
Toute migration production est versionnée.

### INV-DEP-004
Aucune release critique sans rollback/corrective plan.

### INV-DEP-005
Un deploy est lié à commit_sha et release_version.

### INV-DEP-006
Les drafts offline survivent aux updates normales.

### INV-DEP-007
Le service role ne se retrouve jamais dans le build frontend.

### INV-DEP-008
Les backups critiques sont restaurables.

### INV-DEP-009
Les smoke tests suivent chaque release production.

### INV-DEP-010
La production reste observable après déploiement.

---

# 142. Architecture finale

```text
Developer
  │
  ▼
Pull Request
  │
  ▼
CI Quality Gates
  │
  ▼
Main
  │
  ▼
Staging
  │
  ▼
Release Certification
  │
  ▼
Production Deploy
  │
  ▼
Smoke Tests
  │
  ▼
Monitoring
  │
  ├── Continue
  └── Rollback / Fix
```

---

# 143. Règle finale

> **Un déploiement n’est terminé que lorsque le code, la base, les permissions, les jobs, les fichiers, la PWA et l’observabilité ont été vérifiés ensemble.**

> **La production doit être reproductible, traçable et récupérable. Une release sans rollback, sans backup restaurable ou sans monitoring n’est pas prête pour la production.**

> **L’offline-first impose une responsabilité supplémentaire : les mises à jour serveur et PWA ne doivent jamais perdre silencieusement les drafts ou rejouer deux fois une commande métier.**

> **La formule normative est : Build → Validate → Migrate → Certify → Deploy → Smoke Test → Observe → Rollback or Continue.**

---

**Fin — 26-DEPLOIEMENT-ENVIRONNEMENTS-PRODUCTION.md**  
**Version 1.0 — Document 26/27**
