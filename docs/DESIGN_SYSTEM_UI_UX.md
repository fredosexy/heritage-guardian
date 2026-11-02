# Heritis — système de design UI/UX global

> **Statut :** référence visuelle globale approuvée pour les nouvelles interfaces et la refonte progressive de l’application.  
> **Direction artistique retenue le 22 octobre 2026 :** Héritage premium — vert forêt, ivoire et or patiné.  
> **Périmètre :** dépôt GitHub uniquement ; aucune modification directe dans Lovable.

## 1. Principe directeur

**Moins d’éléments, mieux hiérarchisés.** Heritis doit expliquer avant de demander, faire découvrir avant d’imposer et accompagner avant de complexifier. Chaque écran doit avoir un objectif principal clair et aider l’utilisateur à accomplir la prochaine étape sans le submerger.

Le design doit évoquer la confiance, la transmission, la pérennité et la protection du patrimoine. Le caractère premium vient de la retenue, de la qualité de la hiérarchie et de la cohérence, pas d'une accumulation d'effets décoratifs.

## 2. Direction artistique — Héritage premium

### Palette de référence

- **Vert forêt :** couleur principale, actions importantes, navigation active et éléments de confiance.
- **Ivoire :** arrière-plans clairs et surfaces de lecture.
- **Or patiné :** accent secondaire, détails de distinction, focus et repères ponctuels.
- **Neutres chauds :** textes secondaires, séparateurs et surfaces intermédiaires.
- **Couleurs d’état dédiées :** succès/sécurité, avertissement/incomplet et risque/erreur. Elles doivent rester immédiatement différenciables de la palette de marque.

La palette pastel historique (lavande, bleu ciel, rose poudré et menthe) est remplacée par cette direction. Ne pas réintroduire l'ancienne palette lors d'une nouvelle page ou d'une correction.

### Ambiance et composition

- Privilégier une ambiance calme, chaleureuse, structurée et contemporaine.
- Utiliser des surfaces ivoire et des fonds verts très profonds avec parcimonie, selon le contexte.
- Réserver l'or patiné aux accents ; il ne doit pas devenir une couleur de texte courant ou remplir de grandes surfaces.
- Préférer des cartes sobres, des bordures discrètes et des ombres légères.
- Réserver les dégradés aux surfaces de mise en avant réellement utiles.
- Préférer une iconographie simple, cohérente et fine.
- Utiliser DM Sans pour l'interface et les textes courants ; Fraunces pour les titres éditoriaux et les accents de marque.
- Préserver une densité faible, une hiérarchie nette et des espaces généreux.

## 3. Thèmes clair et sombre

Les deux thèmes font partie du système dès sa fondation.

- Le thème clair utilise l'ivoire comme surface principale, le vert forêt pour les actions et l'or patiné comme accent.
- Le thème sombre utilise un vert presque noir pour le fond, des surfaces vert profond, du texte ivoire et un or éclairci pour les accents.
- Le thème initial suit la préférence système.
- L'utilisateur peut basculer manuellement entre clair et sombre ; son choix doit être conservé.
- Chaque composant utilise les tokens sémantiques afin que les deux thèmes restent cohérents.
- Éviter les valeurs de couleur blanches, noires ou hexadécimales directement dans les composants, sauf cas technique documenté.

## 4. Tokens et échelles communes

Les valeurs visuelles sont centralisées dans src/index.css et exposées dans tailwind.config.ts.

### Couleurs sémantiques

Utiliser les rôles background, foreground, card, popover, primary, secondary, accent, muted, border, input, ring, success, warning, destructive et status-*. Ne pas coder une couleur de marque directement dans une page.

### Typographie

- Titres principaux : text-display / police Fraunces.
- Titres de section et cartes : text-title ou style de titre partagé.
- Corps : DM Sans, taille confortable et interligne généreux.
- Métadonnées : text-caption, avec contraste suffisant.
- Sur-titres : text-overline, réservés aux petites catégories.
- Éviter de multiplier les tailles, graisses et polices dans un même écran.

### Espacements et dimensions

- Réutiliser les échelles Tailwind et les tokens page, section et card-inset.
- Utiliser des espacements réguliers entre sections, cartes et contrôles.
- Garder une largeur de lecture adaptée ; le conteneur global s'adapte à la taille de l'écran et les formulaires peuvent conserver une largeur plus étroite.
- Les contrôles interactifs visent au moins 44 × 44 px lorsque l'espace le permet.

### Formes, bordures et profondeur

- Utiliser les rayons partagés rounded-lg, rounded-md, rounded-sm, rounded-card et rounded-panel.
- Garder les bordures fines et discrètes, mais visibles sur les surfaces adjacentes.
- Utiliser shadow-soft, shadow-warm et shadow-elegant selon la hiérarchie, sans empiler les ombres.
- Réserver les panneaux et dialogues aux contenus qui nécessitent réellement une séparation.

## 5. Composants et interactions

Les composants de src/components/ui/ constituent la base commune : boutons, champs, cartes, badges, cases à cocher, boutons radio, interrupteurs, onglets, sélecteurs, alertes, dialogues, panneaux, menus, info-bulles, notifications, indicateurs de progression et états de chargement.

Règles :
- Une action principale visuellement dominante par zone.
- Les variantes secondaires et discrètes ne rivalisent pas avec l'action principale.
- Les états repos, survol, focus, pression, sélection, chargement et désactivation sont cohérents.
- Les champs, menus et dialogues utilisent les mêmes surfaces, rayons et anneaux de focus.
- Les statuts ne sont jamais indiqués uniquement par la couleur : ajouter un libellé ou un pictogramme compréhensible.
- Les contrôles à icône seule ont un nom accessible.
- Les toasts et messages d'erreur restent lisibles dans les deux thèmes.

## 6. Hiérarchie et composition des écrans

- Un objectif principal et une action principale clairement identifiable par écran.
- Présenter d'abord ce qui aide à comprendre ; révéler les options avancées au moment où elles deviennent utiles.
- Regrouper les informations apparentées dans des cartes sobres et aérées.
- Réduire les éléments répétés, les bordures inutiles, les boutons concurrents et les blocs denses.
- Maintenir des libellés courts, explicites et orientés vers l'action.
- Garder une navigation cohérente et prévisible, particulièrement sur mobile.
- Adapter la composition au rôle de l'écran : découverte, consultation, saisie, décision ou suivi.

## 7. Parcours et comportement UX

- **Découverte progressive :** un visiteur doit comprendre Heritis avant d'être invité à créer un compte ou à gérer son patrimoine.
- **Assistant adaptatif :** présent au début, discret pendant l'exploration, puis contextuel ; jamais intrusif.
- **Actions au bon moment :** proposer une action ou une explication liée au contexte plutôt qu'afficher toutes les possibilités d'un coup.
- **États utiles :** concevoir explicitement les états de chargement, vide, erreur, succès, hors ligne et accès restreint. Ils expliquent ce qui se passe et indiquent une prochaine étape pertinente.
- **Confiance :** rendre compréhensibles les permissions, la confidentialité, la synchronisation et les conséquences des opérations sensibles.
- **Visiteur :** aperçu et explications seulement ; les fonctionnalités complètes et la conversation complète de l'assistant restent liées au compte selon les règles d'accès définies.

## 8. Responsive, accessibilité et mouvement

- Concevoir d'abord pour les petits écrans, puis enrichir la mise en page pour tablette et desktop.
- Tester les largeurs étroites, les textes longs, les traductions, le zoom et l'orientation.
- Conserver un focus clavier visible et cohérent.
- Viser un contraste WCAG d'au moins 4,5:1 pour le texte courant et 3:1 pour les grands textes et composants graphiques concernés.
- Ne jamais utiliser uniquement la couleur pour exprimer une erreur, un risque ou un statut.
- Respecter prefers-reduced-motion, y compris dans les appels de défilement JavaScript.
- Prévoir des libellés accessibles, des annonces d'état utiles et un ordre de tabulation prévisible.
- Vérifier les dialogues, menus, onglets, navigation et contrôles avec le clavier et un lecteur d'écran.

## 9. Application à l’ensemble de Heritis

Ces règles s'appliquent à tous les parcours et modules : accueil, découverte visiteur, assistant, secteurs, modules, dossiers, activités, interactions, profil, fichiers, alertes, synchronisation, authentification et onboarding.

L'identité visuelle reste cohérente entre les écrans, mais les composants s'adaptent à leur fonction :
- les écrans de découverte sont accueillants et peu chargés ;
- les écrans de gestion structurent l'information sans densité excessive ;
- les documents et preuves privilégient la lisibilité et la confiance ;
- les alertes de sécurité et les erreurs importantes restent immédiatement perceptibles ;
- les écrans de saisie privilégient la clarté des champs, les aides courtes et la validation explicite.

## 10. Règles d'implémentation

- Centraliser les couleurs, espacements, rayons, ombres, typographie et états dans les tokens et composants partagés.
- Réutiliser les composants communs lorsqu'ils garantissent cohérence et accessibilité.
- Avant de modifier une page, comparer son état réel à la direction artistique approuvée et relever les écarts fonctionnels, visuels et ergonomiques.
- Éviter les couleurs, ombres, rayons et tailles arbitraires répétées page par page.
- Préserver les règles métier, les permissions, la sécurité des données et les parcours visiteurs pendant les refontes visuelles.
- Vérifier les affichages mobile et desktop ainsi que les états de chargement, vide, erreur et accès restreint.
- Exécuter les contrôles disponibles (tests, lint, build et CI pertinents) avant de proposer une fusion.
- Toute nouvelle fonctionnalité respecte cette référence dès sa première version ; les écrans existants sont rapprochés de celle-ci de façon progressive et contrôlée.
- Les changements sont effectués dans le dépôt GitHub uniquement ; aucune modification directe dans Lovable.

## 11. Critères de validation du système de design

Le système global est prêt à être utilisé pour la refonte des pages lorsque :

1. les tokens couvrent les couleurs, typographie, espacements, rayons, surfaces, ombres et mouvements ;
2. les thèmes clair et sombre sont cohérents et le choix est mémorisé ;
3. les composants UI partagés principaux utilisent les tokens et proposent des états cohérents ;
4. les contrôles interactifs sont accessibles au clavier et suffisamment grands sur mobile ;
5. les contrastes sont mesurés sur les états réels, y compris les statuts et le focus ;
6. le responsive est vérifié sur mobile, tablette et desktop ;
7. les tests, le lint, le build et la CI passent sur la branche de travail ;
8. les pages métier n'ont pas encore été refondues de manière opportuniste : elles seront traitées progressivement dans les phases suivantes.

Cette charte est une priorité transversale de conception, pas une décoration à appliquer à la fin du développement.
