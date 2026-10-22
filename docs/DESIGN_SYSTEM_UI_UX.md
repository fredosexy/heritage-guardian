# Heritis — règles prioritaires de design UI/UX

> Statut : référence de conception à appliquer à toute nouvelle interface et à toute refonte de l’application.  
> Référence visuelle : image mobile fournie par le produit le 22 octobre 2026.  
> Périmètre de travail : dépôt GitHub uniquement ; ne pas modifier directement le projet Lovable.

## 1. Principe directeur

**Moins d’éléments, mieux hiérarchisés.** Heritis doit expliquer avant de demander, faire découvrir avant d’imposer et accompagner avant de complexifier. Chaque écran doit avoir un objectif principal clair et aider l’utilisateur à accomplir la prochaine étape sans le submerger.

La référence visuelle donnée est la source de vérité pour la direction artistique. La palette historique ou les choix déjà présents dans le code ne doivent pas remplacer cette référence par défaut.

## 2. Direction artistique

- Privilégier une ambiance lumineuse, calme, douce et contemporaine.
- Utiliser une palette pastel inspirée de la référence : bleu ciel, lavande, rose poudré et vert menthe, avec des transitions subtiles.
- Préserver une surface de lecture claire et un contraste suffisant entre le texte et son arrière-plan.
- Utiliser des cartes et surfaces légères, des coins généreusement arrondis, des bordures discrètes et des ombres très douces.
- Réserver la translucidité et les effets de verre aux endroits où ils améliorent réellement la profondeur ou la séparation des contenus ; ne pas les appliquer partout.
- Préférer une iconographie fine, cohérente et simple. Éviter les décorations qui concurrencent le contenu.
- Employer une typographie lisible, une hiérarchie nette des titres et des espaces généreux.

## 3. Hiérarchie et composition des écrans

- Un objectif principal et une action principale clairement identifiable par écran.
- Présenter d’abord ce qui aide à comprendre ; révéler les options avancées au moment où elles deviennent utiles.
- Regrouper les informations apparentées dans des cartes sobres et aérées.
- Réduire les éléments répétés, les bordures inutiles, les boutons concurrents et les blocs denses.
- Maintenir des libellés courts, explicites et orientés vers l’action.
- Garder une navigation cohérente et prévisible, particulièrement sur mobile.

## 4. Parcours et comportement UX

- **Découverte progressive :** un visiteur doit comprendre Heritis avant d’être invité à créer un compte ou à gérer son patrimoine.
- **Assistant adaptatif :** présent au début, discret pendant l’exploration, puis contextuel ; jamais intrusif.
- **Actions au bon moment :** proposer une action ou une explication liée au contexte plutôt qu’afficher toutes les possibilités d’un coup.
- **États utiles :** concevoir explicitement les états de chargement, vide, erreur, succès, hors ligne et accès restreint. Ils doivent expliquer ce qui se passe et indiquer une prochaine étape pertinente.
- **Confiance :** rendre compréhensibles les permissions, la confidentialité, la synchronisation et les conséquences des opérations sensibles.
- **Accessibilité :** conserver des contrastes lisibles, des zones tactiles confortables, des libellés compréhensibles et une utilisation adaptée aux petits écrans.

## 5. Application à l’ensemble de Heritis

Ces règles s’appliquent à tous les parcours et modules : accueil, découverte visiteur, assistant, secteurs, modules, dossiers, activités, interactions, profil, fichiers, alertes, synchronisation, authentification et onboarding.

L’identité visuelle doit rester cohérente entre les écrans, mais les composants doivent s’adapter à leur fonction :
- les écrans de découverte sont accueillants et peu chargés ;
- les écrans de gestion structurent l’information sans densité excessive ;
- les documents et preuves privilégient la lisibilité et la confiance ;
- les alertes de sécurité et les erreurs importantes restent immédiatement perceptibles et ne sont jamais affaiblies par la palette pastel.

## 6. Règles d’implémentation

- Centraliser progressivement les couleurs, espacements, rayons, ombres, typographie et états dans les tokens et composants partagés ; éviter les valeurs visuelles arbitraires répétées page par page.
- Réutiliser les composants communs lorsqu’ils garantissent cohérence et accessibilité.
- Avant de modifier une page, comparer son état réel à la référence visuelle et relever les écarts fonctionnels, visuels et ergonomiques.
- Ne pas changer une palette ou un composant uniquement parce qu’il existe déjà dans le code : vérifier qu’il sert la direction artistique approuvée.
- Préserver les règles métier, les permissions, la sécurité des données et les parcours visiteurs pendant les refontes visuelles.
- Vérifier les affichages mobile et desktop ainsi que les états de chargement, vide, erreur et accès restreint.
- Exécuter les contrôles disponibles (tests, lint, build et CI pertinents) avant de proposer une fusion.
- Toute nouvelle fonctionnalité doit respecter cette référence dès sa première version ; les écrans existants seront rapprochés de celle-ci de façon progressive et contrôlée.

## 7. Critères de validation UI/UX

Une interface est prête à être proposée si :
1. son objectif et son action principale sont évidents ;
2. elle respecte l’ambiance pastel lumineuse et les surfaces légères de la référence ;
3. la hiérarchie, les espacements et la densité facilitent le balayage visuel ;
4. le texte et les actions restent accessibles et lisibles ;
5. les états et les erreurs sont compréhensibles ;
6. les parcours visiteur, les permissions et les données sensibles restent protégés ;
7. elle est cohérente avec les composants partagés et les autres écrans.

Cette charte est une priorité transversale de conception, pas une simple décoration à appliquer à la fin du développement.
