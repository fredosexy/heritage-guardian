# Plan — Refonte Mémoire (13 parties)

App de sécurisation du patrimoine africain (terres, héritages, volontés, savoirs).
Mobile-first, offline-first, langage humain, zéro blocage, design 2026.

Chaque partie est livrée, testée (build + parcours réel dans le navigateur), puis validée par toi avant la suivante.

## Principes appliqués partout

- **Aucune logique dans les composants** : composants = affichage + événements. Toute logique dans `services/` (règles métier pures), `data/` (accès backend), `hooks/` (liaison état ↔ UI).
- **Composants < 300 lignes**, découpage systématique.
- **Zéro code temporaire** : pas de mock, pas de TODO, pas de fichier mort.
- **Bas de gamme d'abord** : pas d'animation lourde, images compressées, listes virtualisées au-delà de 50 items, budget JS surveillé, lazy-loading par route.
- **Langage humain** : « Ton terrain est presque protégé » plutôt que « Statut : incomplete ».
- **Progressive profiling** : navigation libre en visiteur, on ne demande que le prénom + la position au premier geste utile, le profil se complète au fil du temps.

## Architecture modulaire (l'équivalent monorepo)

Un vrai monorepo (workspaces) n'est pas supporté sur cette stack. On obtient le même bénéfice avec des « packages » internes, frontières claires et imports par barrel :

```text
src/
  core/          config, types partagés, erreurs, utils, i18n
  data/          accès backend + cache offline (une couche unique)
  services/      règles métier pures et testables (score, risque, suggestions)
  features/
    identity/    visiteur, profil progressif, session
    dossiers/    terres, héritages, volontés, savoirs
    proofs/      fichiers et preuves
    assistant/   conversation IA
    alerts/      alertes et risques
    dashboard/   vue de gestion
  ui/            design system (primitives, tokens, patterns)
  app/           routes, layouts, providers
```

Règle de dépendance : `features` → `services` → `data` → `core`. Jamais l'inverse.

---

## Partie 1 — Fondations d'architecture

Créer l'arborescence ci-dessus, déplacer le code existant dans les bons modules, poser les barrels et une règle ESLint qui interdit les imports croisés interdits. Aucun changement visuel.

## Partie 2 — Design system 2026

Tokens sémantiques (couleurs terre/ocre/vert savane, élévations, rayons, typo serif patrimoniale + sans lisible), échelle d'espacement, états focus/pressé, variantes shadcn thémées, mode sombre. Suppression de toute couleur codée en dur. Aucun texte codé en dur hors i18n.

## Partie 3 — Mode visiteur et profil progressif

Toutes les pages consultables sans compte. Un « compte local » anonyme (identifiant sur l'appareil) porte les dossiers créés hors ligne. Au premier geste utile : une seule question — prénom + activation de la localisation. Rattachement automatique des données locales au compte réel dès qu'il est créé plus tard. Jauge « profil complété » avec relances douces, jamais bloquantes.

## Partie 4 — Espace utilisateur

Espace personnel : profil éditable (nom, téléphone, langue, thème, avatar), mes fichiers (téléversement, renommage, suppression, aperçu), mes dossiers, sécurité, appareils. Stockage privé cloisonné par utilisateur.

## Partie 5 — Navigation zéro-blocage

Chaque écran a une action suivante évidente et unique. Barre d'onglets simplifiée, bouton d'action central contextuel, fils d'Ariane courts, retour toujours prévisible. États vides qui expliquent et proposent l'action. Aucun cul-de-sac.

## Partie 6 — Dashboard connecté

Vue de gestion moderne : état global du patrimoine, score de protection, ce qui manque, activité récente, alertes prioritaires, raccourcis. Données réelles agrégées côté service, calcul unique et partagé. Responsive : cartes empilées sur mobile, grille dense sur grand écran.

## Partie 7 — Moteur de risque et de score

Service pur : score de sécurisation d'un dossier (preuves, participants, géoloc, documents clés), détection de risque, priorisation. Utilisé par le dashboard, les dossiers et l'assistant — une seule source de vérité. Couvert par des tests.

## Partie 8 — Assistant conversationnel

Vraie conversation : mémoire du fil, historique persisté, contexte injecté (profil, dossiers, alertes), réponses en flux, gestion des reprises (« et pour l'autre terrain ? »). Ton humain, orienté action, propositions cliquables qui exécutent réellement une action dans l'app. Multilingue FR/EN.

## Partie 9 — Module Terres finalisé

Création guidée (1 écran = 1 décision), carte de localisation légère, preuves avec compression automatique, participants/témoins, historique lisible en langage humain, partage familial.

## Partie 10 — Héritages, volontés, savoirs

Les trois modules restants, sur le même socle : création guidée, preuves, participants. Volontés avec accès restreint et confirmation renforcée.

## Partie 11 — Offline-first consolidé

Cache local complet (lecture hors ligne de tous les dossiers), file de synchronisation pour toutes les écritures (dossiers, preuves, profil), résolution de conflits, indicateur clair « X éléments en attente », reprise automatique. Preuves téléversées en différé.

## Partie 12 — Performance bas de gamme

Découpage par route, préchargement intelligent, images responsives, listes virtualisées, réduction des animations si l'appareil le demande, mesure réelle du poids et du temps d'affichage. Objectif : premier affichage utile rapide en 3G sur appareil d'entrée de gamme.

## Partie 13 — Sécurité, qualité, finition

Revue des règles d'accès aux données, journal d'activité, contrôle des rôles, audit de sécurité, tests des services critiques, accessibilité (contrastes, tailles de touche, lecteurs d'écran), métadonnées et écran d'installation.

---

## Notes techniques

- Backend Lovable Cloud existant conservé ; ajouts prévus : journal d'activité, mémoire de conversation, fichiers utilisateur, champs de profil progressif.
- Les migrations de base de données seront proposées à la validation au moment de la partie concernée (3, 4, 8, 13).
- L'assistant reste sur le modèle par défaut de la passerelle IA Lovable.
- Le service worker ne s'active que sur le site publié (contrainte de la prévisualisation) ; le cache local Dexie fonctionne partout.
