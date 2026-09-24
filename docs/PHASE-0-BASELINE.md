# Phase 0 — Baseline

## Gestionnaire de paquets canonique

Le projet utilise **npm** et `package-lock.json` comme source reproductible des dépendances.

Les fichiers `bun.lock` et `bun.lockb` sont historiques et doivent être supprimés du dépôt lors du prochain commit. Ils ne doivent plus être régénérés.

## Commandes de certification

```bash
npm ci
npm run typecheck
npm run lint
npm run test
npm run build
```

La commande agrégée est :

```bash
npm run check
```

## Environnement

- Copier `.env.example` vers `.env` localement.
- Ne jamais versionner `.env` ou `.env.*`.
- Les clés `VITE_*` sont exposées au navigateur et ne doivent contenir aucun secret.
- Les secrets des Edge Functions restent exclusivement dans le gestionnaire de secrets Supabase.

Secrets serveur requis :

- `LOVABLE_API_KEY` pour la passerelle IA ;
- `RESEND_API_KEY` pour l'envoi des alertes ;
- `ALERT_EMAIL_FROM` pour l'expéditeur vérifié des alertes.

Les variables Supabase fournies automatiquement aux Edge Functions restent côté serveur.

## Gate

La baseline n'est certifiée que lorsque `npm ci` et `npm run check` réussissent dans la CI et dans un environnement autorisé à joindre le registre npm.

## État du 24 septembre 2026

- configuration JSON vérifiée ;
- `.env` retiré du projet de travail et remplacé par `.env.example` ;
- CI de qualité ajoutée ;
- tests unitaires initiaux ajoutés pour le scoring et les règles d'alertes ;
- installation locale bloquée par l'indisponibilité du registre npm dans l'environnement d'audit (`403`, puis cache offline absent) ;
- build, lint, typecheck et tests restent donc **à exécuter**, et non déclarés réussis.
