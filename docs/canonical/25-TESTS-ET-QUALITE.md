# 25 — TESTS ET QUALITÉ

**Projet :** Heritage Guardian / Fonciers  
**Statut :** CANONICAL — V1.0  
**Position :** 25/27  
**Type :** Spécification transverse de stratégie de tests, qualité, certification et CI/CD

---

# 1. Mission

Définir une stratégie de qualité capable de prouver que l’application :

- respecte les invariants métier ;
- applique correctement les permissions ;
- protège les données sensibles ;
- fonctionne en réseau faible ou offline ;
- synchronise sans doublons ;
- gère correctement les conflits ;
- reste accessible ;
- respecte les contrats API/events ;
- résiste aux régressions ;
- peut être livrée en production avec des preuves vérifiables.

---

# 2. Principe fondamental

```text
Tested
≠
No bugs
```

L’objectif est :

```text
Known behavior
+
Verified invariants
+
Controlled risk
+
Reproducible evidence
```

---

# 3. Quality pyramid

```text
          E2E
       Integration
    Contract / RLS
      Unit tests
Static checks / types
```

Le projet ne doit pas dépendre uniquement de tests E2E.

---

# 4. Niveaux de tests

La stratégie distingue :

```text
STATIC_CHECK
UNIT
DOMAIN
APPLICATION
INTEGRATION
CONTRACT
DATABASE
RLS
OFFLINE_SYNC
E2E
ACCESSIBILITY
PERFORMANCE
SECURITY
MIGRATION
RECOVERY
SMOKE
REGRESSION
```

---

# 5. STATIC_CHECK

Comprend :

- TypeScript strict ;
- lint ;
- formatting ;
- dead code checks ;
- dependency checks ;
- secret scanning ;
- schema validation.

---

# 6. TypeScript

Objectif :

```text
noImplicitAny
strictNullChecks
strict
```

ou configuration équivalente stricte.

---

# 7. Linting

Le lint doit détecter notamment :

- imports interdits entre domaines ;
- hooks mal utilisés ;
- dépendances inutiles ;
- patterns dangereux ;
- code mort.

---

# 8. Boundary linting

Il faut empêcher :

```text
module A
→ internal repository of module B
```

Les imports inter-domaines passent uniquement par `public-api`.

---

# 9. Unit tests

Les unit tests couvrent :

- fonctions pures ;
- value objects ;
- validateurs ;
- calculs ;
- reason codes ;
- transitions simples.

---

# 10. Domain tests

Chaque agrégat métier doit avoir des tests couvrant :

- états ;
- transitions ;
- préconditions ;
- invariants ;
- erreurs ;
- événements produits.

---

# 11. Exemple Domain Test

```text
Given TransmissionCase = UNDER_DISCUSSION
When FamilyAgreementRecorded
Then status may become AGREEMENT_RECORDED
And TransmissionCompleted is not emitted
```

---

# 12. Application Service tests

Tester :

- authorization ;
- foreign references ;
- idempotency ;
- expected_version ;
- transaction ;
- audit ;
- outbox.

---

# 13. Integration tests

Couvrent :

- Application Service + DB ;
- Storage ;
- Realtime ;
- Edge Functions ;
- jobs ;
- integrations internes.

---

# 14. Contract tests

Référence documents 13, 14 et 18.

Chaque contrat public doit vérifier :

- schema ;
- version ;
- compatibilité ;
- erreurs ;
- confidentialité ;
- payload minimal.

---

# 15. Event contract tests

Pour chaque événement public :

```text
producer serialization
consumer parsing
compatibility
sensitive field absence
idempotent consumer
```

---

# 16. Command contract tests

Pour chaque commande :

```text
valid payload
invalid payload
unauthorized
idempotency
expected_version
domain rejection
```

---

# 17. API contract tests

Pour chaque API publique :

- input ;
- output ;
- code HTTP ;
- error code ;
- pagination ;
- version ;
- fields interdits.

---

# 18. Database tests

Couvrent :

- contraintes ;
- indexes ;
- FK ;
- unique constraints ;
- triggers internes ;
- fonctions SQL ;
- migrations.

---

# 19. pgTAP

Utiliser pgTAP ou équivalent pour les tests SQL/RLS structurés.

---

# 20. RLS tests

Chaque table sensible doit avoir des tests au minimum pour :

```text
OWNER_ALLOWED
AUTHORIZED_PARTICIPANT_ALLOWED
UNRELATED_USER_DENIED
EXPLICIT_DENY_WINS
EXPIRED_GRANT_DENIED
REVOKED_MANDATE_DENIED
REVOKED_MISSION_SCOPE_DENIED
SECRET_RESOURCE_DENIED
```

---

# 21. RLS write tests

Tester :

- SELECT ;
- INSERT ;
- UPDATE ;
- DELETE ;
- RPC ;
- Storage access.

---

# 22. Negative tests

La sécurité doit tester ce qui doit échouer.

```text
Security quality
=
positive tests
+
negative tests
```

---

# 23. Offline tests

Référence document 17.

Scénarios obligatoires :

- création offline ;
- modification offline ;
- fermeture/réouverture ;
- reconnexion ;
- retry ;
- conflit de version ;
- mandat révoqué avant sync ;
- upload interrompu ;
- duplicate prevention.

---

# 24. Sync chain test

Exemple :

```text
Create Person
→ Create Asset
→ Create Activity
```

offline puis synchronisation ordonnée.

---

# 25. Conflict sync test

```text
base_version = 4
server_version = 5
→ SYNC_CONFLICT
```

Aucun overwrite silencieux.

---

# 26. E2E

Les tests E2E couvrent les parcours critiques utilisateur.

---

# 27. Parcours E2E minimum

```text
signup/login
create asset
create case
add person
upload document
start procedure
view protection alert
request professional
create conflict
offline draft
sync
logout/login
```

---

# 28. E2E ≠ test de toute logique

Les invariants métier doivent rester testés principalement dans Domain/Application tests.

---

# 29. Test data

Les données de test doivent être :

- synthétiques ;
- reproductibles ;
- non personnelles ;
- versionnées.

---

# 30. Seed data

Prévoir :

```text
seed_minimal
seed_demo
seed_e2e
seed_security
```

---

# 31. Pas de données réelles

Interdit dans les tests automatisés :

- vrais documents ;
- vraies identités ;
- vrais numéros ;
- vrais secrets.

---

# 32. Test fixtures

Chaque domaine peut avoir :

```text
fixtures/
builders/
factories/
```

pour générer ses objets.

---

# 33. Builders

Préférer :

```text
buildAsset()
buildPerson()
buildProcedureCase()
```

avec defaults cohérents.

---

# 34. Determinism

Les tests doivent éviter :

- date système non contrôlée ;
- random non seedé ;
- appels réseau réels inutiles ;
- dépendances externes instables.

---

# 35. Clock abstraction

Pour les expirations/deadlines :

```text
Clock
→ fixed in tests
```

---

# 36. UUID determinism

Les tests peuvent injecter un générateur UUID contrôlé.

---

# 37. Property-based testing

Pertinent pour :

- parsing ;
- validation ;
- calculs de ranges ;
- idempotence ;
- serialization.

---

# 38. State machine tests

Chaque machine d’état critique doit tester :

- transitions valides ;
- transitions invalides ;
- final states ;
- reopen/resume si supporté.

---

# 39. Domains critiques

Tests renforcés pour :

- 01 Héritage ;
- 02 Volontés ;
- 04 Transmission ;
- 05 Autorisation ;
- 06 Documents ;
- 07 Procédures ;
- 09 Conflits ;
- 10 Protection.

---

# 40. Mutation testing

Optionnel mais recommandé sur règles critiques.

But :

> vérifier que les tests échouent réellement lorsque la règle change.

---

# 41. Coverage

La couverture brute ne suffit pas.

Préférer des objectifs :

```text
100% critical invariants covered
100% sensitive commands authorization tested
100% RLS critical tables tested
100% public contracts tested
```

---

# 42. Code coverage

Peut être utilisée comme indicateur.

Elle ne doit pas devenir l’objectif principal.

---

# 43. Traceability

Chaque règle critique doit pouvoir suivre :

```text
Requirement
→ Invariant
→ Implementation
→ Test
→ Evidence
```

---

# 44. Test ID

Convention :

```text
TEST-<DOMAIN>-<NNN>
TEST-SEC-<NNN>
TEST-API-<NNN>
TEST-SYNC-<NNN>
```

---

# 45. Test registry

Un registre peut contenir :

```text
TestCase {
  test_id
  requirement_id
  type
  owner
  status
  evidence
}
```

---

# 46. Quality Gates

Avant merge :

```text
lint
typecheck
unit/domain tests
contract tests
RLS tests
build
secret scan
```

---

# 47. Quality Gate PR

Un PR ne doit pas être merge si un test critique échoue.

---

# 48. Main branch

Main doit rester :

```text
buildable
testable
deployable
```

---

# 49. CI stages

```text
Install
↓
Static checks
↓
Unit/Domain
↓
Contract
↓
DB/RLS
↓
Integration
↓
Build
↓
E2E critical
↓
Security checks
```

---

# 50. Fast vs slow suites

Séparer :

```text
PR FAST SUITE
NIGHTLY FULL SUITE
RELEASE CERTIFICATION SUITE
```

---

# 51. PR fast suite

Doit rester assez rapide pour feedback fréquent.

Inclut :

- lint ;
- typecheck ;
- unit ;
- domain ;
- contracts ;
- targeted RLS.

---

# 52. Nightly suite

Peut inclure :

- full RLS ;
- E2E large ;
- performance baseline ;
- accessibility sweep ;
- recovery tests.

---

# 53. Release suite

Avant production :

- tous tests critiques ;
- migrations ;
- smoke ;
- security ;
- offline ;
- rollback ;
- backups.

---

# 54. Flaky tests

Un test flaky doit être :

- identifié ;
- corrigé ;
- quarantined temporairement si nécessaire ;
- jamais ignoré indéfiniment.

---

# 55. Retry tests

Un retry CI ne doit pas masquer une vraie instabilité.

---

# 56. Test isolation

Chaque test doit pouvoir tourner indépendamment.

---

# 57. Database test isolation

Utiliser :

- transactions ;
- schema dédié ;
- reset contrôlé ;
- fixtures propres.

---

# 58. Parallel tests

Possible lorsque les données sont isolées.

---

# 59. Performance tests

Référence documents 22 et 24.

Mesurer :

- API p95 ;
- search ;
- page load ;
- sync ;
- upload ;
- DB queries.

---

# 60. Performance budgets

Exemple de budget V1 à affiner :

```text
critical query p95 < 1.5s
common command p95 < 2s
search p95 < 1.5s
```

selon environnement et réseau.

---

# 61. Web Vitals

Suivre :

- LCP ;
- INP ;
- CLS.

---

# 62. Network tests

Simuler :

- offline ;
- slow 3G ;
- high latency ;
- packet loss ;
- intermittent connection.

---

# 63. Load tests

Tester principalement :

- login ;
- Home ;
- Search ;
- document listing ;
- outbox dispatch ;
- notification queue.

---

# 64. Load testing safety

Ne jamais lancer un test de charge non contrôlé sur production.

---

# 65. Soak tests

Pour les workers/jobs :

- outbox ;
- notifications ;
- sync ;
- realtime ;

tester sur durée prolongée.

---

# 66. Accessibility tests

Automatiser autant que possible :

- axe-like checks ;
- labels ;
- contrast basics ;
- landmarks.

Mais compléter par tests manuels.

---

# 67. Accessibility manual tests

- screen reader ;
- keyboard ;
- zoom ;
- reduced motion ;
- touch targets ;
- voice flows.

---

# 68. Accessibility target

Viser WCAG niveau approprié à l’application, avec priorité aux parcours critiques.

---

# 69. Security tests

Référence document 23.

Inclure :

- auth ;
- authorization ;
- RLS ;
- injection ;
- XSS ;
- uploads ;
- rate limits ;
- secrets ;
- offline ;
- search leaks.

---

# 70. Dependency tests

CI :

- audit dépendances ;
- vulnérabilités critiques ;
- lockfile integrity.

---

# 71. Secret scanning

Un secret détecté bloque la pipeline.

---

# 72. Migration tests

Chaque migration doit être testée :

```text
empty database
existing representative dataset
rollback strategy
RLS after migration
```

---

# 73. Forward-only migrations

Quand rollback SQL n’est pas sûr, prévoir :

- corrective migration ;
- feature flag ;
- backup ;
- deployment plan.

---

# 74. Data migration tests

Vérifier :

- row counts ;
- checksums ;
- constraints ;
- nulls ;
- ownership ;
- references.

---

# 75. Backfill tests

Un backfill doit être :

- idempotent ;
- resumable ;
- observable.

---

# 76. Contract migration tests

Ancien client + nouveau backend.

Nouveau client + backend supporté.

---

# 77. PWA tests

Tester :

- install ;
- update ;
- stale service worker ;
- cache invalidation ;
- offline route ;
- draft preservation.

---

# 78. Realtime tests

Tester :

- reconnect ;
- missed event ;
- revoked access ;
- duplicate signal ;
- refetch.

---

# 79. Job tests

Tester :

- duplicate schedule ;
- retry ;
- stale state ;
- failure ;
- lock/concurrency.

---

# 80. Notification tests

Tester :

- intent ;
- channel cap ;
- delivery ;
- retry ;
- expired intent ;
- revoked recipient ;
- safe content.

---

# 81. Search tests

Tester :

- authorization ;
- ranking ;
- typo ;
- aliases ;
- zero results ;
- no facet leak ;
- offline index.

---

# 82. Vita tests

Tester :

- intent ;
- ambiguity ;
- confirmation ;
- tool failures ;
- prompt injection ;
- stale context ;
- offline fallback.

---

# 83. Recovery tests

Vérifier :

- DB restore ;
- queue recovery ;
- reprocessing dead letter ;
- secret rotation ;
- failover provider.

---

# 84. Backup restore drill

Doit être exécuté périodiquement.

Résultat conservé comme preuve.

---

# 85. Chaos tests

Optionnels en V1, utiles plus tard :

- provider down ;
- DB latency ;
- network partition ;
- queue backlog.

---

# 86. Smoke tests

Après déploiement :

- login ;
- Home ;
- query Asset ;
- command simple ;
- upload léger ;
- Search ;
- sync basic.

---

# 87. Production smoke

Utiliser uniquement données synthétiques/compte test dédié.

---

# 88. Feature flags

Les fonctionnalités à risque peuvent être protégées par feature flag.

---

# 89. Feature flag tests

Tester :

- OFF ;
- ON ;
- rollout partiel ;
- rollback.

---

# 90. Test environments

```text
LOCAL
CI
STAGING
PRODUCTION_SMOKE
```

---

# 91. Staging

Doit ressembler à production :

- mêmes migrations ;
- mêmes RLS ;
- mêmes variables structurelles ;
- providers mock/sandbox si nécessaire.

---

# 92. Mocking

Mocker les frontières externes.

Ne pas mocker systématiquement les domaines internes au point de perdre la valeur d’intégration.

---

# 93. Provider sandbox

Utiliser pour :
- SMS ;
- email ;
- push ;
- webhooks.

---

# 94. Test observability

Les tests doivent pouvoir vérifier :

- audit event produit ;
- outbox event produit ;
- metric incrémentée ;
- logs safe.

---

# 95. Snapshot tests

À utiliser avec modération.

Éviter les snapshots géants qui masquent les changements importants.

---

# 96. Visual regression

Utile pour :

- composants critiques ;
- responsive ;
- dark mode ;
- status badges.

---

# 97. Browser matrix

Au minimum :

- Chrome Android ;
- Chrome desktop ;
- Firefox desktop ;
- Safari/WebKit si supporté.

---

# 98. Device matrix

- petit mobile ;
- mobile moyen ;
- tablette ;
- desktop.

---

# 99. Localization tests

Tester :
- français ;
- anglais ;
- textes longs ;
- formats dates/nombres.

---

# 100. Rural UX tests

Tester :
- faible réseau ;
- lecture limitée ;
- voice ;
- données progressives ;
- boutons larges.

---

# 101. Test de non-régression métier

Toute correction d’un bug métier doit ajouter un test reproduisant le bug.

---

# 102. Bug lifecycle

```text
Bug
→ reproduction
→ failing test
→ fix
→ passing test
→ regression protection
```

---

# 103. Defect severity

```text
BLOCKER
CRITICAL
MAJOR
MINOR
COSMETIC
```

---

# 104. Release blocker

Exemples :

- fail RLS critique ;
- fuite de données ;
- corruption ;
- migration non sûre ;
- sync duplicate majeur ;
- secret exposé ;
- E2E parcours critique cassé.

---

# 105. Quality ownership

Chaque domaine possède ses tests métier.

L’équipe plateforme/transverse possède :
- CI ;
- security suite ;
- RLS framework ;
- shared contracts ;
- E2E base.

---

# 106. Definition of Done — Feature

Une feature est DONE si :

```text
code
+
tests
+
authorization
+
RLS
+
errors
+
audit
+
offline behavior
+
docs
```

sont cohérents lorsque pertinents.

---

# 107. Definition of Done — Domain capability

Inclut :

- invariant tests ;
- command tests ;
- event tests ;
- RLS ;
- migration ;
- UI flow ;
- failure states.

---

# 108. Definition of Done — Public contract

Inclut :

- schema ;
- version ;
- producer ;
- consumer ;
- compatibility ;
- fixtures ;
- tests.

---

# 109. Certification documentaire

Chaque document 00–27 doit pouvoir être relié à :

- code ;
- migration ;
- tests ;
- status d’implémentation.

---

# 110. ImplementationStatus

```text
DEFINED
DESIGNED
IMPLEMENTED
TESTED
VERIFIED
DEFERRED
```

---

# 111. Quality evidence

Exemples :

```text
CI run URL
test report
coverage report
migration hash
pgTAP output
E2E result
security scan
performance report
```

---

# 112. Release Certification

Avant production :

```text
RELEASE_CERTIFIED
```

uniquement si les gates critiques passent.

---

# 113. ReleaseCertification

```text
ReleaseCertification {
  release_version
  commit_sha

  static_checks
  unit_domain
  contracts
  rls
  integration
  e2e
  security
  migration
  performance
  accessibility
  backup_restore

  blockers[]
  approved_at
}
```

---

# 114. Exception process

Une exception doit être :

- documentée ;
- limitée ;
- owner ;
- expiration ;
- risque accepté.

---

# 115. No silent exception

Un test critique désactivé doit apparaître comme dette explicite.

---

# 116. Test naming

Format conseillé :

```text
should_<expected_behavior>_when_<condition>
```

---

# 117. Test clarity

Un test doit clairement exprimer :
- Given ;
- When ;
- Then.

---

# 118. Test size

Un test doit vérifier un comportement cohérent.

Éviter les tests massifs couvrant 20 scénarios non liés.

---

# 119. Assertions

Des assertions précises.

Éviter :

```text
expect(result).toBeTruthy()
```

pour des règles métier critiques.

---

# 120. Error assertions

Vérifier :
- code exact ;
- state unchanged ;
- no event emitted si rejet ;
- audit deny si requis.

---

# 121. Event assertions

Vérifier :
- event name ;
- version ;
- payload minimal ;
- correlation_id ;
- absence données interdites.

---

# 122. Permission tests

Toujours inclure au moins :

```text
allowed
denied
expired
revoked
explicit deny
```

---

# 123. Concurrency tests

Pour agrégats sensibles :

- two writers ;
- stale expected_version ;
- retry same idempotency ;
- different idempotency.

---

# 124. Idempotency tests

Même commande :

```text
same key
same payload
→ same logical result
```

```text
same key
different payload
→ reject
```

---

# 125. Data integrity tests

Vérifier :

- aucune relation orpheline ;
- aucune duplicate active relation ;
- aucune projection Search sans source ;
- aucune alert_recipient sans alert ;
- aucune inbox duplicate.

---

# 126. Invariant matrix

Chaque invariant du projet doit avoir au moins un test.

Exemple :

```text
INV-XD-002
→ TEST-XD-foreign-write-blocked
```

---

# 127. Coverage matrix

```text
Domain
Requirements
Invariants
Commands
Events
RLS
E2E
Status
```

---

# 128. Minimum release coverage

Cibles :

```text
100% critical invariants
100% sensitive permissions
100% critical RLS paths
100% public command/event contracts
100% release blockers tested
```

---

# 129. CI failure policy

Toute gate critique rouge bloque merge/release.

---

# 130. Warning policy

Warnings non bloquants doivent :
- être visibles ;
- avoir owner ;
- ne pas augmenter sans contrôle.

---

# 131. Technical debt

Toute dette test/qualité doit être enregistrée.

---

# 132. Flaky budget

Le taux de flakiness doit rester proche de zéro.

Une suite instable perd sa valeur.

---

# 133. Build reproducibility

Deux builds à partir du même commit doivent produire des artefacts fonctionnellement équivalents.

---

# 134. Lockfile

Le lockfile est obligatoire.

---

# 135. Dependency drift

Toute mise à jour majeure doit repasser :
- tests ;
- security ;
- E2E critique.

---

# 136. Performance regression gate

Un ralentissement majeur peut bloquer release.

---

# 137. Accessibility regression gate

Les erreurs critiques d’accessibilité sur parcours principaux peuvent bloquer release.

---

# 138. Security regression gate

Toute fail critique de sécurité bloque production.

---

# 139. Migration regression gate

Aucune release si :
- migration échoue ;
- RLS inactive ;
- données critiques incohérentes.

---

# 140. Rollback verification

Tester la stratégie de rollback ou corrective migration avant release risquée.

---

# 141. Test report

Chaque pipeline de release génère un résumé :

```text
passed
failed
skipped
flaky
coverage
security findings
performance deltas
```

---

# 142. Audit test report

Conserver l’historique des releases importantes.

---

# 143. Quality dashboard

Peut afficher :

- test pass rate ;
- flaky tests ;
- release blockers ;
- security findings ;
- coverage critique ;
- performance trend ;
- accessibility issues.

---

# 144. Tests documentaires

Vérifier que :
- tous les documents 00–27 existent ;
- index docs à jour ;
- liens internes valides ;
- statut/version présents.

---

# 145. Code ↔ Documentation

La CI peut vérifier qu’une fonctionnalité majeure modifiant un contrat met à jour la documentation associée.

---

# 146. Tests architecture

Détecter :
- imports interdits ;
- cycles ;
- accès repositories étrangers ;
- duplication de shared concepts.

---

# 147. Check scripts

Prévoir des scripts comme :

```text
check-foundation.mjs
check-supabase-tests.mjs
check-domain-boundaries.mjs
check-canonical-docs.mjs
```

---

# 148. Release checklist

```text
[ ] lint
[ ] typecheck
[ ] domain tests
[ ] contract tests
[ ] pgTAP/RLS
[ ] integration
[ ] E2E critical
[ ] offline
[ ] security
[ ] migration
[ ] performance
[ ] accessibility
[ ] backup/restore evidence
[ ] docs updated
[ ] no blockers
```

---

# 149. Tests — architecture

### TEST-QUAL-001
Un module ne peut importer le repository interne d’un autre domaine.

### TEST-QUAL-002
Tous les contrats publics ont une version.

### TEST-QUAL-003
Tous les domaines ont au moins une suite de tests métier.

---

# 150. Tests — CI

### TEST-QUAL-004
Un lint error bloque PR.

### TEST-QUAL-005
Un RLS critical failure bloque merge.

### TEST-QUAL-006
Un secret détecté bloque pipeline.

---

# 151. Tests — release

### TEST-QUAL-007
Une release sans migration testée est rejetée.

### TEST-QUAL-008
Une release avec E2E critique cassé est rejetée.

### TEST-QUAL-009
Une release avec backup restore non validé selon politique est signalée/bloquée.

---

# 152. Invariants qualité

### INV-QUAL-001
Aucun invariant critique sans test.

### INV-QUAL-002
Aucune permission sensible sans test positif et négatif.

### INV-QUAL-003
Aucun contrat public sans test de compatibilité.

### INV-QUAL-004
Aucune table sensible sans tests RLS.

### INV-QUAL-005
Aucun bug critique corrigé sans test de régression.

### INV-QUAL-006
Aucune release avec secret exposé.

### INV-QUAL-007
Aucune release avec migration critique non validée.

### INV-QUAL-008
Les tests doivent rester déterministes.

### INV-QUAL-009
Les données de test sont synthétiques.

### INV-QUAL-010
La qualité est mesurée par risque couvert, pas uniquement par % de coverage.

---

# 153. Architecture de validation

```text
Developer
   │
   ▼
Static Checks
   │
   ▼
Unit / Domain
   │
   ▼
Contract / RLS
   │
   ▼
Integration
   │
   ▼
E2E / Offline
   │
   ▼
Security / Performance / Accessibility
   │
   ▼
Release Certification
```

---

# 154. Règle finale

> **Une fonctionnalité n’est pas complète lorsqu’elle “marche sur l’écran”, mais lorsqu’elle respecte ses invariants, ses permissions, ses contrats, ses erreurs, son comportement offline et ses tests.**

> **Les tests doivent prouver les comportements importants, en particulier les refus, les transitions interdites, les conflits de concurrence et les scénarios de sécurité.**

> **La certification de production repose sur des preuves reproductibles et non sur une validation manuelle informelle.**

> **La formule normative est : Requirement → Invariant → Implementation → Automated Test → Evidence → Release Gate.**

---

**Fin — 25-TESTS-ET-QUALITE.md**  
**Version 1.0 — Document 25/27**
