# Heritis — inventaire UI/UX des pages et sous-pages

- **Branche de référence :** `main`
- **Commit de référence :** `26dca74ff76a21ebd67cf73c03860bf222c8d6d5`
- **Date de l’inventaire :** 22 octobre 2026
- **Périmètre :** dépôt GitHub uniquement ; aucune modification directe dans Lovable.
- **Objectif :** cartographier les routes visibles et les surfaces UI à contrôler avant les corrections globales.

> Cet inventaire est un audit statique du code et des routes. Il ne constitue pas encore une validation visuelle dans un navigateur sur toutes les tailles d’écran.

## 1. Routes de l’application

Source principale : `src/app/router.tsx`.

| Route | Écran / fonction | Sous-écrans, états et éléments à auditer |
|---|---|---|
| `/` | Accueil / découverte | Visiteur et utilisateur connecté, personnalisation, modules, actions rapides, assistant contextuel, états de chargement et données vides |
| `/index` | Redirection vers l’accueil | Redirection et conservation d’une navigation prévisible |
| `/index.html` | Redirection vers l’accueil | Redirection et comportement de repli |
| `/modules/:moduleId` | Page d’un module / espace | Chaque module, module inconnu, disponible ou à venir, étapes, dossiers associés, appel à l’action |
| `/auth` | Connexion et inscription | Bascule connexion/inscription, champs, erreurs, chargement, confirmations, petits écrans |
| `/onboarding` | Questions initiales après authentification | Progression des questions, réponses oui/non, sauvegarde, erreur et retour vers l’accueil |
| `/dossiers` | Liste des dossiers | Liste, recherche/filtre, aucun dossier, chargement, visiteur et utilisateur connecté |
| `/create` | Création d’un dossier | Choix du type, champs, validation, sauvegarde, échec et retour |
| `/dossiers/:id` | Détail d’un dossier | Informations générales, parcours/étapes, sections Terrain, pièces justificatives, participants, suggestions, édition, suppression, droits et états hors ligne |
| `/dossiers/:id/edit` | Modification d’un dossier | Formulaire prérempli, accès en lecture seule si non autorisé, absence de dossier, sauvegarde et erreur |
| `/alerts` | Centre d’alertes | Filtres toutes/urgentes/informations/suggestions, lu/non lu, navigation vers l’action, liste vide |
| `/profile` | Profil et préférences | Informations personnelles, complétion, avatar, fichiers, dossiers, langue, thème, sécurité, alertes e-mail, visiteur |
| `/files` | Mes fichiers | Visiteur sans compte, chargement, liste, aperçu, renommage, suppression, liste vide |
| `/sync` | Centre de synchronisation | File en attente, conflit, choix de version, relance, suppression confirmée, erreur réseau et file vide |
| `/assistant` | Assistant conversationnel | Conversation vide et active, envoi, réponse en cours, indisponibilité IA, erreurs, contexte de module et petits écrans |
| `*` | Page introuvable | Message clair, retour à l’accueil et accès aux dossiers |

## 2. Composants transversaux

Ces composants sont réutilisés par plusieurs écrans ; leur cohérence a un effet direct sur l’ensemble du produit.

| Composant / groupe | Fichiers principaux | Points de contrôle |
|---|---|---|
| Cadre et navigation | `AppLayout.tsx`, `BottomNav.tsx`, `OfflineIndicator.tsx` | Fond, marges, navigation mobile, zone sûre, indicateur hors ligne |
| En-têtes | `PageHeader.tsx`, `HomeHeader.tsx` | Hiérarchie des titres, retour, contexte, actions et débordement mobile |
| Aide contextuelle | `AssistantTip.tsx`, `NextActionCard.tsx` | Discrétion, pertinence, répétition, lisibilité et action principale |
| États vides | `EmptyState.tsx`, `NotFoundPage.tsx` | Message explicatif, icône, action principale et action secondaire |
| Identité visiteur | `VisitorBanner.tsx`, `FirstStepDialog.tsx`, `ProtectedRoute.tsx` | Découverte progressive, clarté des permissions et transitions vers le compte |
| Dossiers et preuves | `DossierStatusBadge.tsx`, `ProofsTab.tsx`, `FileRow.tsx` | Statuts, lisibilité des métadonnées, actions, confirmation de suppression |
| Profil | `AvatarCard.tsx`, `ProfileCompletionCard.tsx`, `SecurityCard.tsx`, `EmailAlertsCard.tsx` | États occupés, échecs, contrôle tactile, cohérence des cartes |
| Primitives UI | `src/components/ui/*` | Boutons, cartes, champs, dialogues, onglets, alertes, menus, sélecteurs, focus et contraste |
| Thème global | `src/index.css` | Tokens clair/sombre, couleurs d’état, gradients, ombres, typographie, rayons, focus |

## 3. Premiers écarts constatés dans le code

### Priorité haute — direction artistique héritée
- `src/features/identity/pages/AuthPage.tsx` conserve des classes `bg-gradient-earth`, `bg-gradient-warm` et `font-serif`.
- `src/features/identity/pages/OnboardingPage.tsx` conserve `bg-gradient-earth`, `bg-gradient-warm` et `shadow-warm`.
- `src/features/home/pages/ModulePage.tsx` conserve un appel à l’action `bg-gradient-warm`/`shadow-warm` et un titre `font-serif`.
- `src/features/shell/components/NextActionCard.tsx` et `src/features/identity/components/FirstStepDialog.tsx` emploient encore `bg-gradient-warm`.

Ces noms de classes ne prouvent pas à eux seuls un défaut de rendu : il faut examiner leur définition CSS et comparer le rendu à la référence pastel. Ils signalent cependant les premières zones à vérifier.

### Priorité moyenne — composants internes
- Les cartes du profil et leurs sous-sections utilisent le composant de surface partagé `card-soft`, mais doivent être vérifiées une par une pour les espacements, les états occupés/erreur et les petits écrans.
- Les alertes et le centre de synchronisation ont des styles locaux et des états métier nombreux ; l’audit doit couvrir les états sélectionnés, en attente, erreur, conflit et vide.
- La page détail de dossier est la surface la plus complexe : ses onglets, ses sections Terrain et ses actions sensibles doivent être contrôlés séparément.

### Validation à réaliser avant de déclarer la couverture complète
- Rendu réel en mobile étroit, mobile courant et desktop.
- Thème clair et thème sombre.
- Clavier/focus, libellés accessibles, zones tactiles et contraste.
- États de chargement, vide, erreur, succès, accès restreint et hors ligne.
- Contrôle fonctionnel des actions, sans modifier les règles métier ou les permissions.

## 4. Ordre de couverture détaillée

1. Identité et découverte : accueil visiteur, connexion/inscription, première étape et onboarding.
2. Espaces et dossiers : accueil connecté, modules, liste, création, détail, modification, preuves et participants.
3. Gestion quotidienne : alertes, fichiers, profil et toutes ses cartes internes.
4. Continuité et assistance : assistant, synchronisation, indicateurs hors ligne et page introuvable.
5. Composants UI partagés : primitives, tokens de thème et comportements responsive.

## 5. Critère de sortie de la phase 1

La phase d’inventaire sera considérée comme terminée lorsque chaque route aura une liste de ses sous-vues et états conditionnels, un statut d’audit, les écarts liés à des fichiers précis et les validations attendues. Le présent document établit la cartographie initiale ; les étapes suivantes la complèteront avec les résultats détaillés des audits visuel, fonctionnel et responsive.
