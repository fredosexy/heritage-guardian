# Heritis — audit de l’état UI/UX actuel

> **Date de vérification :** 7 novembre 2026  
> **Branche de référence :** `main`  
> **Commit vérifié :** `03e2c112ddb1b09203ab0537884fde7a235e6f13` (fusion de la PR #52)  
> **Périmètre :** lecture du dépôt GitHub uniquement. Aucune modification de Lovable.  
> **Nature :** audit statique des routes, pages, composants partagés, textes visibles et tokens. Aucun rendu navigateur, test utilisateur, mesure de contraste ou test appareil n’est revendiqué.

## 1. Objectif et règles de référence

Cet audit prépare la réorganisation des pages et des parcours de Heritis. Il ne constitue pas une autorisation de modifier immédiatement toutes les pages.

Les références fonctionnelles sont les documents V1 :
- vision, mission, objectifs et principes ;
- cartographie des quatre domaines métier ;
- documents détaillés des quatre domaines ;
- services transversaux V1.

La référence visuelle active est `docs/DESIGN_SYSTEM_UI_UX.md` : **Héritage premium**, vert forêt, ivoire et or patiné, avec thèmes clair et sombre.

Principes de conception retenus :
1. Moins d’éléments, mieux hiérarchisés.
2. Chaque information doit aider à comprendre, décider ou agir.
3. Chaque carte doit avoir une fonction identifiable ; une carte informative n’a pas besoin d’un faux bouton.
4. Une action principale claire par zone, les actions secondaires restant discrètes.
5. Ne pas répéter la même information dans plusieurs cartes ou sections sans utilité.
6. Mobile d’abord, avec une lecture et des actions adaptées aux petits écrans.
7. Ne pas ajouter de fonctionnalité ou de contenu métier absent de la documentation validée.
8. Préserver les permissions, les données, la traçabilité et les parcours existants.
9. Les visiteurs découvrent Heritis et consultent des aperçus ; ils n’accèdent pas aux fonctions applicatives complètes. Les comptes accèdent aux fonctions selon leurs droits.
10. Toute modification est réalisée dans GitHub uniquement.

## 2. État du référentiel documentaire existant

Le dépôt contient déjà :
- `docs/DESIGN_SYSTEM_UI_UX.md` — référence active Héritage premium ;
- `docs/UI_UX_PAGE_INVENTORY.md` — inventaire antérieur des pages ;
- `docs/UI_UX_FUNCTIONAL_AUDIT.md` — audit fonctionnel antérieur ;
- `docs/UI_UX_VISUAL_AUDIT.md` — audit visuel antérieur ;
- `docs/UI_UX_ACCESSIBILITY_AUDIT.md` — audit d’accessibilité ;
- `docs/UI_UX_CONSOLIDATED_AUDIT.md` — consolidation des constats antérieurs ;
- `docs/UX-PRINCIPLES.md` — principes UX.

Les trois audits historiques et l’inventaire de pages se réfèrent encore à l’ancien commit `26dca74ff76a21ebd67cf73c03860bf222c8d6d5`. Ils avertissent eux-mêmes que les routes et le code ont évolué. Leur ancien statut de PR et leurs anciennes références de palette ne décrivent pas l’état courant. Le présent document constitue le nouveau point de départ statique ; les constats historiques ne sont conservés que s’ils sont revérifiés.

## 3. Cartographie des routes actuellement déclarées

Source vérifiée : `src/app/router.tsx`.

| Route | Page | Accès déclaré dans le routeur | Rôle constaté |
|---|---|---|---|
| `/` | `HomePage` | Public | Accueil visiteur ou accueil connecté |
| `/modules/:moduleId` | `ModulePage` | Public | Présentation d’un parcours, état disponible ou en préparation |
| `/auth` | `AuthPage` | Public | Connexion et inscription |
| `/onboarding` | `OnboardingPage` | Protégé | Questions initiales après authentification |
| `/assistant` | `AssistantPage` | Public dans le routeur | Interface de conversation |
| `/profile` | `ProfilePage` | Public dans le routeur | Profil, préférences et liens vers d’autres espaces |
| `/dossiers` | `DossiersPage` | Protégé | Liste des dossiers |
| `/create` | `CreateDossierPage` | Protégé | Choix du type et création d’un dossier |
| `/dossiers/:id` | `DossierDetailPage` | Protégé | Consultation et gestion d’un dossier |
| `/dossiers/:id/edit` | `EditDossierPage` | Protégé | Modification d’un dossier |
| `/alerts` | `AlertsPage` | Protégé | Centre d’alertes |
| `/files` | `MyFilesPage` | Protégé | Fichiers personnels |
| `/sync` | `SyncCenterPage` | Protégé | Opérations en attente et conflits de synchronisation |
| `/index`, `/index.html` | Redirection | Public | Redirection vers l’accueil |
| `*` | `NotFoundPage` | Public | Route inconnue |

**Précision :** « public » signifie ici que la route n’est pas enveloppée par `ProtectedRoute`. Cela ne signifie pas que toutes les actions ou données de cette page sont autorisées pour un visiteur.

## 4. Constatations vérifiées sur le code courant

### 4.1 Découverte et accès visiteur — priorité P1

**Constats :**
- L’accueil visiteur de `HomePage.tsx` présente Heritis principalement à travers le terrain et annonce que les brouillons peuvent être enregistrés sans compte.
- Le bouton visiteur « créer un dossier Terrain » dirige vers `/create?type=terrain`, alors que `/create` est protégé par `ProtectedRoute`. Un visiteur non connecté est donc redirigé vers l’authentification au lieu d’atteindre ce formulaire.
- Le hook `useCreateDossier.tsx` contient bien une logique de brouillon local pour les visiteurs, et `useDossiers.tsx` sait lire ces brouillons ; cependant, la route de création est protégée. La logique locale et l’accès par navigation ne sont donc pas alignés.
- La route `/assistant` est publique et affiche un champ de saisie ainsi qu’une action d’envoi. Le texte de traduction prévoit un retour « connectez-vous » lorsque l’authentification est requise ; l’interface présente néanmoins le compositeur de conversation au visiteur.
- `ProfilePage.tsx` est publique. Elle affiche un formulaire nom/téléphone et un bouton Enregistrer même sans compte ; la fonction de sauvegarde retourne immédiatement en l’absence d’utilisateur. Les réglages de langue et de thème restent affichés.
- La navigation visiteur de `BottomNav.tsx` expose Accueil, Assistant et Profil.

**Écart par rapport à la décision produit documentée :** le visiteur doit disposer d’une découverte guidée et d’aperçus uniquement ; la conversation complète et les fonctionnalités de gestion sont réservées au compte. L’interface actuelle mélange présentation, saisie et appels d’actions dont certaines sont ensuite bloquées.

**Suite proposée :** définir précisément l’accueil public, les aperçus des quatre domaines, le premier geste d’identification et les limites du mode visiteur ; ensuite seulement aligner les routes, CTA et états d’accès. Ne pas supprimer la logique de brouillon local sans décision produit explicite.

### 4.2 Périmètre des domaines affichés — priorité P1

**Constats :**
- `dossierTypeMeta.ts` déclare cinq types : `terrain`, `heritage`, `volonte`, `conflit` et `savoir`.
- Les quatre premiers correspondent aux domaines métier V1, avec seul `terrain` marqué disponible.
- `savoir` est également transmis aux cartes de l’accueil et à la liste de création, alors que la cartographie V1 retient quatre domaines et ne retient pas « Dons et savoirs vivants » dans son périmètre V1.

**Suite proposée :** traiter `savoir` comme un écart de périmètre à clarifier avant toute refonte des cartes ou de la navigation. Ne pas le supprimer ni le promouvoir dans V1 sans examiner ses références, données éventuelles, traductions et tests, puis obtenir une décision explicite.

### 4.3 Cohérence des descriptions métier — priorité P1

Les textes visibles des modules sont dans `src/core/i18n/locales/fr.ts`. Certains libellés sont plus étroits ou plus affirmatifs que les documents V1 :
- l’accueil visiteur décrit surtout la collecte d’informations d’un terrain, alors que l’accueil de découverte doit expliquer la plateforme et ses quatre domaines ;
- le module Conflit est présenté comme « Prévenir les conflits », alors que le domaine validé porte sur le signalement, la constitution du dossier, sa finalisation puis l’orientation vers les voies et services compétents ;
- certains libellés d’étapes, notamment « clarifier les responsabilités », doivent être confrontés à la limite explicite : Heritis n’arbitre pas et ne détermine pas les droits des parties.

**Suite proposée :** établir une matrice « texte actuel / formulation V1 / action associée » pour chaque module. Les textes ne seront corrigés qu’après comparaison avec le document détaillé du domaine concerné.

### 4.4 Accueil connecté et cartes de parcours — priorité P2

**Constats :**
- L’accueil connecté combine salutation, contexte, accès à l’assistant, complétion du profil, prochaine étape, cartes de modules, alertes et accès assistant.
- Les cartes `HomeModuleCard` sont des surfaces cliquables qui ouvrent un parcours. Elles contiennent titre, description, disponibilité, état, compteurs, personnes, preuves et parfois une prochaine attention.
- Le même accès à l’assistant apparaît dans l’en-tête, dans des conseils contextuels et dans une action en bas de page. La répétition peut alourdir l’écran et concurrencer l’action principale.
- Les statistiques de plusieurs cartes sont calculées depuis les dossiers. Il faut vérifier que chaque donnée affichée aide réellement à choisir la prochaine action et ne répète pas un autre bloc de l’accueil.

**Suite proposée :** hiérarchiser l’accueil autour d’une seule prochaine action utile, puis des parcours et des alertes réellement nécessaires. Conserver les données métier utiles, mais retirer les répétitions visuelles après vérification des usages.

### 4.5 Navigation et cadre partagé — priorité P2

**Constats :**
- `AppLayout` gère le thème, l’indicateur hors ligne, le conteneur et la navigation inférieure.
- `BottomNav` propose trois entrées au visiteur et cinq entrées au compte connecté, dont une action centrale déterminée par `centralAction`.
- `PageHeader` standardise le titre, le sous-titre, un parent court et le retour.
- Les pages n’utilisent pas toutes le même niveau de composition : certaines utilisent `PageHeader`, d’autres construisent leur propre en-tête.
- L’assistant dispose désormais d’un shell plein écran dédié après la PR #52.

**Suite proposée :** établir des modèles d’écran communs selon leur fonction (découverte, liste, détail, formulaire, suivi, conversation) sans forcer un même gabarit sur toutes les pages. Vérifier la navigation, le retour, les zones sûres et le comportement avec la navigation inférieure.

### 4.6 Cartes et densité d’information — priorité P2

**Constats :**
- Plusieurs pages utilisent des cartes arrondies avec bordures, ombres et fonds nuancés ; les mêmes informations peuvent être réparties entre une carte, un conseil assistant et une carte « prochaine action ».
- Les listes de dossiers et de fichiers doivent être distinguées des cartes d’action : un élément de liste sert d’abord à identifier et ouvrir un objet ; une carte d’action sert à proposer une tâche.
- Les formulaires de création et les détails de dossier contiennent des groupes d’informations métier qui nécessitent une hiérarchie propre, plutôt qu’une accumulation de cartes de même importance.

**Règle de refonte :** une carte doit avoir un rôle explicite parmi : information, résumé d’objet, état, prochaine action, choix ou confirmation. Le rôle détermine sa présentation et son interaction. Une carte purement informative ne doit pas simuler un bouton.

### 4.7 Système visuel — priorité P2

**Constats :**
- `src/index.css` porte désormais les tokens Héritage premium : fond ivoire et texte vert profond en thème clair ; fond vert presque noir et texte ivoire en thème sombre ; accents or patiné.
- Les polices DM Sans et Fraunces sont chargées. Les titres globaux utilisent Fraunces et le texte courant DM Sans, conformément à la direction éditoriale documentée.
- Les classes historiques `gradient-earth` et `gradient-warm` existent encore, mais leurs définitions CSS actuelles sont des dégradés neutres/ivoire-or et non l’ancienne palette pastel. Leur nom seul ne suffit pas pour conclure à un écart.
- Des styles locaux persistent dans plusieurs pages. Leur cohérence doit être jugée à partir des tokens et du rendu réel, pas uniquement par recherche de classes.
- `ThemeToggle` s’appuie sur `next-themes`, tandis que `ProfilePage` modifie directement la classe `dark` sur l’élément racine. La synchronisation de ces deux chemins de réglage doit être vérifiée avant de modifier le comportement du thème.

**Suite proposée :** préserver les tokens globaux et auditer leur utilisation page par page. Ne pas refaire la palette ni remplacer globalement les gradients par recherche/remplacement.

### 4.8 Écrans de gestion et de suivi — priorité P2

| Écran | Éléments à examiner lors de la refonte |
|---|---|
| Liste des dossiers | Recherche, statut, type, brouillons locaux, synchronisation, état vide/erreur et action de création |
| Création de dossier | Choix du type, distinction entre domaines disponibles et en préparation, champs requis/optionnels, sections Terrain et progression |
| Détail du dossier | Résumé, statut, personnes, preuves, sections Terrain, étapes, suggestions, droits, actions sensibles et historique |
| Modification | Champs réellement modifiables, lecture seule, erreurs, sauvegarde et retour |
| Alertes | Catégories, gravité, état lu/non lu, action associée et état vide |
| Fichiers | Métadonnées, aperçu, renommage, suppression, droits et état vide |
| Synchronisation | File d’attente, tentatives, erreurs compréhensibles, conflits et choix explicites |
| Profil | Séparer identité, préférences, sécurité, notifications et raccourcis ; masquer les contrôles sans action possible pour le visiteur |

Les comportements métier ne doivent pas être modifiés pendant la seule réorganisation visuelle.

### 4.9 Revue page par page — surfaces et actions présentes

| Page | Composition et informations observées dans le code | Point de réorganisation à étudier |
|---|---|---|
| Accueil visiteur `/` | Présentation orientée Terrain, première étape d’identité, cartes de parcours, bloc assistant et CTA de création. | Recentrer sur la découverte des quatre domaines et l’aperçu, clarifier la première action et retirer toute promesse d’accès non conforme au mode visiteur validé. |
| Accueil connecté `/` | Salutation/contextualisation, profil à compléter, prochaine étape, cartes des parcours, alertes et assistant. | Réduire les répétitions et établir une hiérarchie entre prochaine action, état des dossiers et alertes. |
| Page module `/modules/:moduleId` | Présentation, disponibilité, étapes traduites, compteurs de dossiers et CTA vers création ou assistant. | Aligner chaque description/étape sur le document métier ; séparer nettement aperçu et action réellement disponible. |
| Authentification `/auth` | Bascule connexion/inscription, onglets e-mail/téléphone, formulaire, OTP et retours toast. | Simplifier les choix visibles, renforcer la lisibilité des erreurs et vérifier les états de chargement et les textes d’aide. |
| Onboarding `/onboarding` | Trois questions successives oui/non, progression visuelle, sauvegarde finale. | Vérifier que chaque question reste utile au parcours et expliquer la progression sans ajouter de collecte non documentée. |
| Assistant `/assistant` | En-tête dédié, contexte de module éventuel, conversation défilante, réponses en streaming, champ et bouton d’envoi. | Distinguer l’aperçu visiteur de la conversation complète du compte ; clarifier le rôle de l’assistant et éviter les propositions contextuelles répétées. |
| Profil `/profile` | Bannière visiteur, aide assistant, complétion, raccourcis, identité, langue, thème, alertes e-mail, sécurité et déconnexion selon le compte. | Séparer préférences et identité ; ne pas afficher au visiteur un formulaire d’enregistrement qui ne peut rien enregistrer. |
| Liste des dossiers `/dossiers` | En-tête, conseil assistant, file de synchronisation, brouillons, recherche, liste, état vide/erreur et prochaine action. | Prioriser la recherche et la liste ; rendre les états hors ligne visibles sans multiplier les panneaux ; préciser les actions disponibles selon les droits. |
| Création `/create` | Choix de type, badge « en préparation », formulaire Terrain et neuf sections repliables, puis sauvegarde. | Confirmer le parcours d’accès visiteur/compte ; distinguer les informations essentielles des compléments facultatifs et expliquer la progression réelle. |
| Détail `/dossiers/:id` | Résumé du dossier, suppression, aide Terrain, neuf sections détaillées et leurs pièces, parcours/étapes, onglets preuves/participants/récapitulatif, suggestion IA flottante. | C’est l’écran le plus dense. Regrouper les informations par tâche et priorité, réduire les répétitions de cartes, rendre les actions sensibles distinctes et vérifier que la suggestion flottante ne masque pas le contenu. |
| Modification `/dossiers/:id/edit` | Formulaire titre, description et localisation ; champs désactivés si l’utilisateur ne peut pas modifier. | Expliquer clairement le mode lecture seule et le résultat d’une sauvegarde ou d’une mise en attente hors ligne. |
| Alertes `/alerts` | Filtres Toutes/Urgentes/Infos/Suggestions, liste cliquable, marquage lu et navigation vers l’action associée. | Vérifier la sémantique « urgente » : le filtre actuel compare `type === "urgent"`, tandis que la présentation utilise aussi `severity`. Confirmer le modèle avant correction. |
| Fichiers `/files` | Aperçu visiteur nécessitant un compte, liste de fichiers, aperçu, renommage et suppression. | Faire de chaque ligne un résumé de fichier lisible ; garder les trois actions secondaires discrètes et confirmer les opérations sensibles. |
| Synchronisation `/sync` | Conflits avec choix « moi/distant », file d’attente, relance, nombre de tentatives et abandon confirmé. | Donner la priorité aux conflits et à la reprise ; présenter les erreurs en langage utilisateur et éviter que les détails techniques deviennent l’information dominante. |
| Page introuvable `*` | État vide avec retour à l’accueil et raccourci vers les dossiers. | Garder une seule action principale cohérente avec le statut visiteur ou compte ; vérifier que le raccourci dossiers ne mène pas à une redirection inattendue. |

Cette revue décrit les surfaces et les contrôles visibles dans le code ; elle ne valide pas encore l’exécution de chaque action dans un navigateur.

## 5. Composants transversaux à auditer avant leur réutilisation

- `AppLayout`, `BottomNav`, `OfflineIndicator` ;
- `PageHeader`, `HomeHeader` ;
- `AssistantTip`, `NextActionCard`, `EmptyState` ;
- `HomeModuleCard`, `DossierStatusBadge`, `FileRow` ;
- `ProfileCompletionCard`, `AvatarCard`, `SecurityCard`, `EmailAlertsCard` ;
- primitives partagées dans `src/components/ui/` ;
- tokens et classes communes dans `src/index.css` et `tailwind.config.ts`.

Leur réutilisation doit être fondée sur une fonction commune réelle, pas sur une ressemblance visuelle.

## 5. Audit des composants transversaux et des règles d’interaction

### 5.1 Cadre partagé — `AppLayout`

- Le shell standard affiche l’indicateur hors ligne, un contrôle de thème dans l’en-tête et, selon la route, la navigation inférieure.
- Le mode `fullScreen` ajouté pour l’assistant masque l’en-tête et la navigation inférieure, mais conserve l’indicateur hors ligne.
- Le shell standard applique un conteneur commun et un espacement vertical. Les pages qui ont leur propre en-tête ou composition peuvent donc avoir des rythmes différents.

**Orientation :** conserver un shell commun, mais formaliser plusieurs gabarits selon la tâche. Ne pas imposer l’en-tête global aux conversations, formulaires ou écrans immersifs lorsque cela réduit l’espace utile.

### 5.2 Navigation inférieure — `BottomNav`

- Visiteur : trois entrées Accueil, Assistant, Profil.
- Compte connecté : cinq colonnes, Accueil, Mes espaces, action centrale contextuelle, Alertes, Profil.
- L’action centrale provient du service `centralAction(pathname)` et peut soit naviguer vers une route, soit faire défiler vers un élément de la page.
- Le nombre d’alertes non lues et une indication d’erreur de chargement sont affichés sur l’entrée Alertes.
- L’avatar du profil est chargé de façon asynchrone.

**Points à vérifier avant refonte :**
- La navigation visiteur expose Assistant alors que la conversation complète doit être réservée au compte ; il faut décider si l’entrée ouvre une découverte guidée ou une invitation à se connecter.
- L’action centrale contextuelle doit rester explicite et prévisible ; son libellé accessible existe, mais le sens de l’action doit aussi être compréhensible visuellement.
- Vérifier le comportement à 320 px, avec libellés longs, zoom et safe-area Android.
- Éviter que le badge d’alertes soit le seul moyen de transmettre une information urgente.

### 5.3 En-tête de page — `PageHeader`

- Le composant affiche un titre, un sous-titre facultatif, un parent court et une action droite facultative.
- Le retour utilise l’historique du navigateur lorsqu’un index existe, sinon une route parent calculée.

**Orientation :** adopter ce composant pour les écrans de liste, détail et formulaire lorsque sa hiérarchie correspond à la tâche. Vérifier les routes de repli et les titres longs ; ne pas ajouter systématiquement un fil d’Ariane plus profond.

### 5.4 Cartes d’action et conseils — `NextActionCard`, `AssistantTip`

- `NextActionCard` est une surface bouton pleine largeur qui propose une seule prochaine action calculée par `useNextAction`.
- `AssistantTip` est un bloc non cliquable dans son ensemble : il contient un bouton d’ouverture de l’assistant et un bouton de masquage.
- Les deux composants peuvent coexister sur un même écran avec d’autres accès à l’assistant.

**Orientation :** conserver la prochaine action unique si elle est réellement prioritaire sur l’écran. Le conseil assistant doit rester secondaire et ne pas répéter la même action. Une carte d’information sans action ne doit pas être transformée en bouton.

### 5.5 Carte de domaine — `HomeModuleCard`

- La carte entière est un bouton accessible et ouvre `/modules/:moduleId` ou déclenche `onFirstGesture`.
- Elle regroupe icône, titre, description, disponibilité, état, compteurs, progression, participants, preuves, prochaine attention et CTA textuel.
- La carte `savoir` est explicitement traitée dans le composant, confirmant sa présence visuelle malgré son absence du périmètre métier V1 validé.

**Orientation :** pour la refonte, limiter le premier niveau à l’identité du domaine, une phrase utile, sa disponibilité et une seule information d’état pertinente. Déplacer les indicateurs secondaires vers la page du domaine. La carte doit garder un comportement uniforme et un seul point d’activation.

### 5.6 Primitives UI — bouton, carte, badge, dialogue

- Le bouton partagé propose plusieurs variantes et tailles ; les tailles par défaut et larges atteignent au moins 44 px, tandis que la variante `sm` est de 36 px.
- La primitive `Card` est un conteneur visuel neutre sans comportement interactif imposé.
- Le badge est un élément de statut/étiquette, et non un contrôle.
- Le dialogue Radix possède un overlay, une hauteur maximale avec défilement, une largeur adaptée au mobile et une cible de fermeture de 44 px.

**Orientation :** ne pas confondre la primitive `Card` avec une carte cliquable. Les actions doivent utiliser des boutons ou liens sémantiquement adaptés. Réserver les badges aux états réellement utiles et vérifier la variante `sm` au regard des cibles tactiles lorsque le contrôle doit être touché.

### 5.7 Tokens visuels — `src/index.css`

- La palette active est sémantique et partagée entre thème clair et sombre : fond ivoire/vert profond, accent vert forêt et or patiné.
- Les polices déclarées sont DM Sans pour le texte et Fraunces pour les titres.
- Des tokens existent pour les surfaces, statuts, rayons, espacements, ombres, animations et focus.
- Les classes utilitaires `.tap`, `.focus-ring`, `.card-soft`, `.text-display`, `.text-caption` fournissent des conventions partagées.
- La règle `prefers-reduced-motion` réduit les animations et transitions.

**Orientation :** réutiliser les tokens plutôt que coder des couleurs, ombres et rayons locaux. Vérifier les contrastes réels des combinaisons clair/sombre avant de modifier les couleurs ; la présence d’un token ne prouve pas son contraste.

## 6. Principes de composition à appliquer lors des maquettes et corrections

| Type d’écran | Hiérarchie recommandée | Carte / composant pertinent |
|---|---|---|
| Découverte publique | Promesse et rôle de Heritis → quatre domaines → aperçu → première action guidée | Cartes de domaine informatives, CTA d’exploration |
| Accueil connecté | Prochaine action prioritaire → dossiers/parcours → alertes nécessitant une action | Une carte prochaine action, liste ou résumé de parcours |
| Liste | Titre et action de création → recherche/filtres utiles → éléments → état vide/erreur | Lignes ou cartes d’objet compactes |
| Détail | Identité et statut → action principale → sections métier → preuves/personnes/historique | Résumé d’objet, sections repliables si justifiées |
| Formulaire | But et conséquences → champs requis → champs complémentaires → validation | Groupes de champs, aide contextuelle ciblée |
| Suivi / synchronisation | État réel → problème à résoudre → choix/action → historique et détails | Cartes d’état et panneaux de résolution |
| Conversation | Contexte → échange → composer → état de connexion/permission | Fil de messages ; pas de cartes décoratives répétées |
| Préférences | Regroupement par sujet → valeur actuelle → action de modification | Lignes de réglages, confirmations pour actions sensibles |

Cette table est un principe de hiérarchie visuelle, pas l’ajout de nouvelles fonctions métier.

## 7. Ordre de travail proposé

1. **Clore l’inventaire courant** : vérifier chaque page et ses sous-vues, les états, les actions et les permissions.
2. **Résoudre les écarts de périmètre et d’accès** : visiteur/compte, présence du type `savoir`, descriptions des quatre domaines.
3. **Définir les modèles d’écran** : accueil, découverte, liste, détail, formulaire, suivi, conversation et préférences.
4. **Auditer les composants partagés** : navigation, en-têtes, cartes, boutons, états vides, statuts et thème.
5. **Réorganiser par lots** : commencer par les parcours de découverte et d’accueil, puis traiter les pages métier selon les quatre domaines V1.
6. **Valider chaque lot** : tests concernés, lint, build, CI, comparaison mobile/desktop et tests manuels adaptés.
7. **Mettre à jour la documentation GitHub après validation de chaque domaine ou lot cohérent**, avant d’entamer le suivant.

## 8. Limites de cet audit

- Audit réalisé par lecture statique des fichiers du dépôt sur `main`.
- Aucune navigation de l’application en navigateur n’a été exécutée.
- Aucun rendu mobile, tablette ou desktop n’a été visuellement mesuré.
- Aucun test TalkBack/VoiceOver, clavier physique, zoom 200/400 % ou contraste calculé n’est revendiqué.
- Les écarts identifiés sont des constats de code et de cohérence documentaire ; ils ne prouvent pas à eux seuls un défaut de sécurité ou de backend.
- Aucun code applicatif, schéma de données, migration, fonction Supabase ou projet Lovable n’a été modifié dans cette phase.

**Statut :** première passe d’audit statique de l’architecture des pages et des interfaces, destinée à guider l’inventaire détaillé et les décisions de réorganisation.