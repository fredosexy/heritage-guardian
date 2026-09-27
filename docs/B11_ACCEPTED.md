# B11 — Journal global de responsabilité

## Statut
Implémentée sur `codex/b11-global-audit-v2`. Certification finale en attente de la CI.

## Décision d’architecture
B11 réutilise la fondation transverse canonique déjà présente : `audit_events`, `record_audit_event`, corrélation, représentation et immutabilité. Aucune seconde table d’historique n’est créée.

## Livré
- branchement transactionnel des dossiers, participants, étapes, accès, interventions et signalements ;
- acteur réel, personne représentée, corrélation et contexte sûr sans contenu métier sensible ;
- politique RLS étendue aux utilisateurs autorisés sur le dossier, refus par défaut ;
- dépôt applicatif exclusivement en lecture ;
- chronologie consolidée avec vues « Essentiel » et « Complet » ;
- tests unitaires et SQL multi-utilisateurs, anti-falsification et append-only.

## Hors périmètre
B12 (hors-ligne), B13 (notifications) et B14 (back-office) restent séparées. Les historiques métier détaillés ne sont pas dupliqués.

## Certification
- `npm ci`
- `npm run check`
- reset/migrations Supabase
- suite pgTAP complète, dont `b11_audit_events.test.sql`
