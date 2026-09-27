# 16 — MODÈLE DE DONNÉES GLOBAL

**Statut : CANONICAL — V1.0**

## 1. Mission

Définir les conventions de persistence communes aux domaines 00–11 et aux infrastructures transverses sans fusionner leurs ownerships.

## 2. Principe

```text
same PostgreSQL database
≠
same domain ownership
```

Chaque table possède un owner domain explicite.

## 3. Identifiants

UUID partout pour les entités synchronisables/offline.

Les UUID peuvent être générés côté client pour les nouveaux objets autorisés.

## 4. Colonnes communes

Lorsque pertinent :
```text
id UUID PK
created_at TIMESTAMPTZ NOT NULL
updated_at TIMESTAMPTZ NOT NULL
created_by_user_id UUID NULL
version BIGINT NOT NULL DEFAULT 1
status TEXT NOT NULL
archived_at TIMESTAMPTZ NULL
```

## 5. Temps

Tous les timestamps serveur : `TIMESTAMPTZ`, stockés/interprétés en UTC.

Le timezone utilisateur est une préférence séparée utilisée pour affichage/récurrence.

## 6. Version optimistic locking

Les agrégats sensibles utilisent `version`. Les updates sont conditionnés par la version attendue.

## 7. FK internes

À l’intérieur d’un même domaine, utiliser des FK PostgreSQL fortes lorsque possible.

Exemple :
`protection_alerts → alert_recipients`.

## 8. Références inter-domaines

Deux modèles autorisés :

### Référence stable connue
FK possible vers une table maîtresse stable lorsque l’architecture et la RLS le permettent, par exemple certains `person_id` ou `asset_id`.

### Référence polymorphe
```text
domain
entity_type
entity_id
```

Validation par Application Service + contrat du domaine propriétaire.

## 9. Interdiction

Pas de trigger cross-domain qui modifie automatiquement une table métier étrangère.

## 10. Tables maîtres par domaine

### 00
`land_memories`, `historical_events`, `land_person_relations`, `historical_possessions`, `boundary_records`, `land_markers`, `historical_usages`, `memory_revisions`.

### 01
`inheritance_cases`, `estates`, `estate_assets`, `inheritance_person_relations`, `heir_statuses`, `declared_shares`, `estate_management`, `estate_decisions`, `inheritance_issues`.

### 02
`wills`, `will_versions`, `will_triggers`, `release_rules`, `release_reviews`, `release_decisions`, `release_executions`, `will_disclosures`.

### 03
`assets`, `asset_person_relations`, `asset_origins`, `asset_objectives`, `asset_subdivision_links`.

### 04
`transmission_cases`, `transmission_proposals`, `transmission_participants`, `participant_positions`, `transmission_allocations`, `family_agreements`, `formalization_records`.

### 05
`persons`, `person_names`, `person_contacts`, `person_account_links`, `family_relations`, `family_relation_sources`, `role_assignments`, `permission_grants`, `permission_denies`, `representation_mandates`, `role_conflicts`.

### 06
`documents`, `document_files`, `document_versions`, `document_links`, `document_requirements`, `document_relations`, `testimonies`, `document_access_grants`, `evidence_conflicts`, `extracted_fields`.

### 07
`procedure_definitions`, `procedure_versions`, `procedure_cases`, `procedure_steps`, `procedure_requirements`, `procedure_blockers`, `procedure_appointments`, `procedure_submissions`, `procedure_outcomes`.

### 08
`professional_profiles`, `professional_skills`, `professional_credentials`, `intervention_needs`, `professional_missions`, `mission_scopes`, `candidate_evaluations`, `recommendation_sets`, `mission_deliverables`.

### 09
`conflict_cases`, `conflict_issues`, `conflict_parties`, `conflict_positions`, `conflict_evidence_links`, `conflict_incidents`, `conflict_proposals`, `conflict_agreements`, `mediations`, `conflict_impacts`, `workflow_dependencies`.

### 10
`protection_rules`, `protection_rule_versions`, `protection_rule_conditions`, `protection_event_inbox`, `protection_rule_evaluations`, `risk_signals`, `protection_alerts`, `alert_signal_links`, `alert_audience_rules`, `alert_recipients`, `alert_recipient_sources`, `alert_recipient_states`, `protection_actions`, `protection_reminders`, `monitoring_subscriptions`.

### 11
`asset_uses`, `economic_activities`, `activity_operators`, `management_arrangements`, `rental_arrangements`, `economic_projects`, `project_dependencies`, `work_records`, `maintenance_records`, `contributions`, `income_records`, `revenue_allocations`, `expense_records`, `valuation_records`, `economic_decisions`.

## 11. Tables transverses

`integration_outbox`, `integration_inbox`, `command_idempotency_records`, éventuellement `process_instances`, `notification_deliveries`, projections/search index.

## 12. Enum strategy

Préférer codes textuels stables + CHECK/table de référence lorsque l’évolution est probable. Utiliser PostgreSQL ENUM seulement pour ensembles réellement stables et maîtrisés.

## 13. JSONB

Autorisé pour :
- configuration versionnée ;
- paramètres extensibles ;
- snapshots safe ;
- métadonnées non relationnelles.

Interdit comme remplacement d’un modèle relationnel métier essentiel.

## 14. Index

Indexer :
- FK ;
- owner/scope IDs ;
- status actifs ;
- dates d’échéance ;
- `event_id` ;
- `idempotency_key` ;
- fingerprints/alert_key ;
- champs de recherche autorisés.

Utiliser partial indexes pour statuts actifs lorsque bénéfique.

## 15. Unique constraints

Les règles métier doivent avoir des contraintes DB lorsqu’elles sont exprimables :
- rule code unique ;
- version pair unique ;
- consumer+event inbox unique ;
- recipient unique par principal/alert ;
- relation unique active selon contexte ;
- idempotency key unique par principal/commande.

## 16. Soft delete / archive

Les entités historiques utilisent `archived_at`, statut ou tombstone.

Hard delete limité aux brouillons sans dépendance et aux politiques de purge explicitement autorisées.

## 17. Audit

Les tables d’audit sont append-only. Éviter de stocker des snapshots complets sensibles ; préférer reason codes, diff safe, IDs et hashes lorsque possible.

## 18. Chiffrement / secrets

Secrets applicatifs hors tables métier. Les données très sensibles utilisent les capacités de sécurité Supabase/Postgres adaptées et accès restreint.

## 19. Storage

Les fichiers sont hors DB dans Storage ; la DB contient métadonnées, checksum, version, provenance et path.

## 20. Migration

Toute évolution schéma :
- migration versionnée ;
- compatible ou plan de migration explicite ;
- backfill contrôlé ;
- RLS mise à jour dans la même phase ;
- tests avant production.

## 21. Naming

Tables `snake_case`, colonnes `snake_case`, IDs suffixés `_id`, timestamps `_at`.

## 22. Multi-domain read models

Vues/materialized views autorisées pour lecture. Elles sont reconstructibles et jamais source maître.

## 23. Invariants

- Owner domain documenté pour chaque table.
- Aucune duplication de Person/Asset/Document.
- FK interne forte par défaut.
- Polymorphic ref validée par application.
- Pas de write cross-domain trigger.
- Version obligatoire pour agrégats concurrents.
- Soft/archive avant purge.
