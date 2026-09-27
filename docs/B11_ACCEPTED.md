# B11 — Journal global de responsabilité

## Statut

Implémentée sur la branche `codex/b11-global-responsibility-audit`. Certification finale en attente de la CI.

## Livré

- registre global `audit_events`, horodaté côté serveur et strictement append-only ;
- acteur utilisateur, acteur professionnel, représentation, source contrôlée et `request_id` ;
- métadonnées bornées sans copie des contenus sensibles ;
- journalisation transactionnelle des dossiers, participants, étapes, demandes et droits d’accès, interventions et signalements ;
- RLS : lecture limitée aux personnes autorisées sur le dossier, refus par défaut et écriture interne uniquement ;
- dépôt applicatif exclusivement en lecture ;
- chronologie consolidée dans le dossier avec vues « Essentiel » et « Complet » ;
- tests unitaires de présentation et tests SQL multi-utilisateurs, anti-falsification et immutabilité.

## Limites de phase

B11 ne met en place ni synchronisation hors ligne B12, ni notifications B13, ni back-office B14. Le journal expose des faits techniques sobres et ne remplace pas les historiques métier détaillés des interventions ou signalements.

## Validation attendue

- `npm ci`
- `npm run check`
- reconstruction Supabase et application de toutes les migrations
- exécution des tests SQL, dont `b11_audit_events.test.sql`
