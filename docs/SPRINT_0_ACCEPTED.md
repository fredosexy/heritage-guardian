# SPRINT 0 ACCEPTED — Fondation Heritage Guardian

**Date :** 24 septembre 2026  
**Périmètre :** Phase 0 uniquement  
**Décision :** implémentation Phase 0 terminée ; validation CI externe obligatoire avant ouverture de B1.

## 1. Règles respectées

- audit et réutilisation de l'existant ;
- corrections delta-only ;
- aucune nouvelle fonctionnalité métier ;
- aucune duplication d'architecture ;
- aucun ZIP intermédiaire ;
- aucune déclaration de production sans preuve ;
- npm et `package-lock.json` deviennent la référence ;
- le fichier `.env` n'est plus versionné.

## 2. Work Orders

| Work Order | Résultat |
|---|---|
| WO-0001 — Baseline et reproductibilité | Terminé |
| WO-0002 — Visiteur et pertes offline | Terminé |
| WO-0003 — Storage et notifications | Terminé |
| WO-0004 — Sécurité IA | Terminé |
| WO-0005 — Gestion globale des erreurs | Terminé |
| WO-0006 — Tests, RLS, offline et CI | Implémenté |
| WO-0007 — Rapport et gate | Terminé |

## 3. Corrections fonctionnelles

- fin du chargement infini du détail dossier lorsqu'aucun utilisateur authentifié n'est disponible ;
- conservation des opérations offline non supportées au lieu de leur suppression silencieuse ;
- idempotence de la création offline grâce à `client_operation_id` ;
- déduplication garantie par contrainte unique `(user_id, client_operation_id)` ;
- Error Boundary global avec message sans exposition de données sensibles.

## 4. Corrections sécurité

- Edge Functions IA accessibles uniquement avec une session utilisateur valide ;
- utilisation du jeton de session au lieu de la clé publique comme identité ;
- validation de forme, taille et volume des messages ;
- quota IA serveur de 30 appels par heure et par utilisateur ;
- fonction `notify-alerts` authentifiée ;
- alertes récupérées sous RLS, donc limitées à leur propriétaire ;
- validation des identifiants et limitation à 20 alertes par envoi ;
- absence de contenu fournisseur sensible dans les logs d'erreur ;
- bucket avatar privé, limité à 5 Mio et aux formats JPEG, PNG et WebP.

## 5. Base de données et migrations

Migrations Phase 0 ajoutées :

1. `20260924000100_create_avatars_bucket.sql` ;
2. `20260924000200_ai_rate_limits.sql` ;
3. `20260924000300_dossier_idempotency.sql`.

La suite d'intégration vérifie :

- lecture du dossier par son propriétaire ;
- refus de lecture par un utilisateur étranger ;
- lecture par un participant déclaré ;
- isolation des alertes ;
- consommation du quota IA ;
- présence des policies Storage avatar ;
- présence des policies `proofs` et `dossiers` ;
- absence de doublon lors du rejeu d'une création offline.

## 6. Tests et CI

Ajouts :

- test du score et de ses seuils ;
- test des règles et clés de déduplication des alertes ;
- contrôle statique Phase 0 sans dépendance ;
- workflow frontend : `npm ci` puis `npm run check` ;
- workflow Supabase : démarrage local, reset des migrations et tests RLS.

Résultat local vérifié :

```text
Phase 0 static checks passed
package.json valid
```

## 7. Limite de l'environnement d'exécution

Le registre npm n'était pas accessible dans l'environnement d'audit :

```text
403 Forbidden
ENOTCACHED en mode offline
```

En conséquence, les commandes suivantes sont préparées mais ne sont pas déclarées réussies localement :

```bash
npm ci
npm run typecheck
npm run lint
npm run test
npm run build
supabase db reset --local
supabase test db
```

La CI ajoutée constitue la gate autoritative. B1 ne doit pas commencer si l'un de ces contrôles échoue.

## 8. Fichiers principaux ajoutés

- `.env.example` ;
- `.github/workflows/quality.yml` ;
- `docs/PHASE-0-BASELINE.md` ;
- `docs/SPRINT_0_ACCEPTED.md` ;
- `scripts/phase0-static-check.mjs` ;
- `src/app/ErrorBoundary.tsx` ;
- `src/test/alert-rules.test.ts` ;
- `src/test/dossier-scoring.test.ts` ;
- `supabase/functions/_shared/security.ts` ;
- `supabase/functions/notify-alerts/index.ts` ;
- trois migrations Phase 0 ;
- `supabase/tests/database/phase0_rls.test.sql`.

## 9. Fichiers principaux modifiés

- `.gitignore` ;
- `package.json` ;
- `src/app/App.tsx` ;
- locales française et anglaise ;
- repositories et hooks dossier ;
- synchronisation offline ;
- types Supabase ;
- service et page Assistant ;
- fonctions `ai-chat` et `ai-context`.

Le test factice `src/test/example.test.ts` et le lockfile texte Bun ont été supprimés. Le fichier binaire historique `bun.lockb` est ignoré et devra rester exclu de tout commit et du ZIP final.

## 10. Gate finale

| Critère | État |
|---|---|
| Configuration et secrets | Conforme |
| Aucun effacement silencieux offline | Conforme |
| Idempotence création offline | Implémentée et test CI préparé |
| Authentification et quota IA | Conforme |
| Migration avatar | Implémentée |
| Fonction notifications manquante | Corrigée |
| Tests unitaires | Ajoutés, exécution CI requise |
| Tests RLS multi-utilisateurs | Ajoutés, exécution CI requise |
| TypeScript/lint/build | Exécution CI requise |
| Documentation et traçabilité | Conforme |

## 11. Décision

La **Phase 0 est terminée au niveau code et documentation**.

La décision de passage est :

> **GO CONDITIONNEL VERS B1** — uniquement après succès du workflow `Quality` sur le dépôt connecté.

Ce statut n'est pas une certification production. Il signifie que les fondations ont été corrigées, instrumentées et dotées de leurs gates automatiques. Toute erreur CI doit être corrigée dans la Phase 0 avant de développer B1.
