# Audit UI/UX — responsive et accessibilité


> **Mise à jour design — 2 novembre 2026 :** les références de palette pastel présentes dans cet audit décrivent l'ancien état du produit. La direction artistique approuvée est désormais « Héritage premium » (vert forêt, ivoire, or patiné), avec thèmes clair et sombre. Les constats d'accessibilité restent valables comme éléments de revue statique ; les contrastes doivent être remesurés sur la nouvelle palette. Référence active : docs/DESIGN_SYSTEM_UI_UX.md.

**Périmètre :** revue statique du code sur `main`, sans exécution dans un navigateur ni audit automatisé. Les points ci-dessous sont des constats de code ou des risques à valider ; ils ne constituent pas une certification WCAG.

## Synthèse

Le socle prévoit déjà plusieurs bonnes pratiques : couleurs sémantiques, anneau de focus partagé, cible tactile `.tap` de 44 px minimum, règle `prefers-reduced-motion`, navigation principale fixe avec marge basse réservée, libellés sur plusieurs boutons à icône et gestion explicite de certaines erreurs. La couverture n'est toutefois pas uniforme.

## Constats priorisés

### A11Y-01 — P1 à vérifier : assistant plein écran et clavier mobile

**Fichier :** `src/features/assistant/pages/AssistantPage.tsx`

L'écran utilise `h-screen` à l'intérieur d'`AppLayout`, qui ajoute un conteneur avec padding vertical et un `main`. Sur mobile, la hauteur CSS du viewport peut ne pas suivre l'ouverture du clavier virtuel ; le champ et le bouton d'envoi risquent alors d'être masqués ou de provoquer un double défilement. Le défilement automatique des messages utilise aussi `behavior: "smooth"` sans vérifier la préférence de mouvement réduite (le CSS global réduit les transitions, mais cela ne garantit pas que les appels JS de défilement soient neutralisés).

**À vérifier en test réel :** petits écrans Android/iOS, clavier ouvert, orientation paysage, zoom système et préférence « réduire les animations ». Préférer une hauteur dynamique adaptée au viewport et une stratégie de scroll qui respecte `prefers-reduced-motion`.

### A11Y-02 — P1 à vérifier : boutons de sélection du mode d’authentification

**Fichier :** `src/features/identity/pages/AuthPage.tsx`

Les boutons « connexion » et « inscription » changent l’état visuel, mais ne publient pas explicitement leur état à la technologie d’assistance (`aria-pressed` ou un composant d’onglets sémantique). Leur style ne réutilise pas les classes communes `tap` et `focus-ring`, contrairement à plusieurs contrôles du reste de l’application.

**Risque :** état actif moins perceptible au lecteur d’écran et indication de focus clavier moins cohérente. Vérifier aussi le contraste réel du texte du bouton sur le dégradé avant de modifier ses couleurs.

### A11Y-03 — P2 : usage des cibles tactiles et du focus partagé non systématique

**Fichiers examinés :** `src/features/shell/components/BottomNav.tsx`, `PageHeader.tsx`, `AssistantPage.tsx`, `AuthPage.tsx`.

Le système définit `.tap` (min-height/min-width 44 px) et `.focus-ring`, et la navigation basse les utilise. Certains contrôles ont leurs propres styles de focus, tandis que les boutons de changement de mode dans l’écran d’authentification n’ont ni l’un ni l’autre. Le bouton retour de l’assistant a une cible de 40 px (`size-10`) plutôt que la cible de 44 px recommandée par le système du projet.

**Action proposée :** uniformiser les contrôles interactifs, en gardant des exceptions documentées lorsque la densité d’interface l’exige ; contrôler les zones tactiles à l’écran et non seulement les classes CSS.

### A11Y-04 — P2 : annonces accessibles des états dynamiques

**Fichiers examinés :** `src/features/assistant/pages/AssistantPage.tsx`, `src/features/offline/pages/SyncCenterPage.tsx`, `src/features/shell/components/BottomNav.tsx`.

L’assistant expose la conversation via `role="log"` et `aria-live="polite"`, ce qui est positif. En revanche, le compteur d’alertes non lues dans la navigation n’a pas de libellé accessible dédié qui expose clairement le nombre d’alertes non lues. Dans le centre de synchronisation, certaines erreurs sont placées dans `role="status"`, mais l’ensemble des retours de résolution/retry repose aussi sur des toasts : vérifier qu’ils sont annoncés de façon fiable et compréhensible avec les lecteurs d’écran ciblés.

**Action proposée :** ajouter un libellé accessible localisé au badge de navigation et tester les annonces de succès/échec sans dépendre uniquement de la couleur ou de l’icône.

### A11Y-05 — P2 : lisibilité et débordements sur petits écrans/zoom

**Fichiers examinés :** `src/features/offline/pages/SyncCenterPage.tsx`, `src/features/assistant/pages/AssistantPage.tsx`, `src/features/shell/components/PageHeader.tsx`.

Le centre de synchronisation prévoit déjà `min-w-0`, `break-words` et `overflow-wrap:anywhere` pour les messages d’erreur longs ; l’en-tête de page protège aussi le titre avec `min-w-0`. Ces protections sont positives mais ne couvrent pas à elles seules tous les contenus traduits, les libellés longs, le zoom à 200–400 % et les largeurs étroites. L’assistant limite son contenu à `max-w-md`, ce qui peut laisser de l’espace inutilisé sur grand écran, mais c’est surtout une question d’adaptation visuelle à vérifier.

**Action proposée :** valider les textes les plus longs de chaque langue, zoom navigateur à 200 % et largeur équivalente à 320 CSS px, sans défilement horizontal de page.

### A11Y-06 — P2 : focus clavier dans les parcours complets

**Fichiers examinés :** navigation basse, en-tête de page, formulaire d’authentification, assistant et conflits de synchronisation.

Des contrôles possèdent des styles de focus visibles et les boutons de résolution de conflit utilisent `aria-pressed`. La revue statique ne permet pas de confirmer le parcours réel de tabulation, l’ordre du focus après navigation, le retour du focus après une boîte de dialogue native, ni l’absence de piège clavier dans les onglets et composants de dialogue partagés.

**Action proposée :** test manuel clavier seul : Tab/Shift+Tab, Entrée/Espace, Échap lorsque pertinent, focus après changement de route et après fermeture des dialogues.

## Points positifs observés

- `src/index.css` définit des couleurs sémantiques, un anneau de focus, des cibles tactiles `.tap` de 44 px et une règle globale `prefers-reduced-motion`.
- `BottomNav.tsx` utilise `NavLink` (état de route actif), des libellés textuels et une cible tactile partagée.
- `PageHeader.tsx` propose un bouton de retour textuel, une structure de titre et protège le titre contre certains débordements.
- `SyncCenterPage.tsx` utilise `aria-pressed` pour les choix « ma version / version distante » et prévoit des retours d’erreur.
- `AssistantPage.tsx` nomme les contrôles principaux et marque le flux de conversation comme journal dynamique.

## Limites et vérifications nécessaires

- Pas de tests navigateur, d’émulation mobile ou de tests avec lecteur d’écran exécutés dans cet audit.
- Pas de mesures de contraste calculées sur les états réels (repos, survol, focus, désactivé, dégradés).
- Pas de validation automatisée axe/Lighthouse, ni de test de zoom/rotation.
- Les problèmes A11Y-01 à A11Y-06 sont des risques de revue statique, à confirmer avant de les qualifier de défauts avérés.

## Plan de validation recommandé

1. Test responsive à 320, 360, 390, 768 et 1280 px, portrait/paysage, avec clavier virtuel.
2. Navigation clavier seule sur les routes principales et tous les dialogues.
3. Contraste WCAG sur textes, badges, dégradés et focus visibles ; viser 4,5:1 pour le texte courant et 3:1 pour le grand texte et les composants graphiques concernés.
4. Lecteur d’écran : nom, rôle, état et annonces du badge d’alertes, du formulaire, du chat et de la synchronisation.
5. Zoom à 200 % et 400 %, langues avec libellés longs et préférence de mouvement réduit.
6. Après validation, corriger les écarts confirmés dans une branche de code dédiée et exécuter lint, tests, build et CI avant toute proposition de fusion.


## Vérification complémentaire du code source — 22 octobre 2026

Cette vérification compare les constats ci-dessus au contenu actuel de `main`. Elle reste statique : aucune interaction navigateur ou technologie d’assistance n'a été exécutée.

| Point | Constat confirmé sur `main` | Statut |
|---|---|---|
| A11Y-01 — assistant mobile | `AssistantPage.tsx` utilise encore `h-screen` dans `AppLayout`, dont le conteneur ajoute `py-5`. Le scroll automatique appelle `scrollTo({ behavior: "smooth" })` sans consulter `prefers-reduced-motion`. | Confirmé dans le code ; impact clavier/viewport à tester. |
| A11Y-02 — modes d’authentification | Les boutons connexion/inscription sont des boutons natifs, mais n'ont ni `aria-pressed` ni association explicite à l'état `mode`. Les classes locales ne comportent pas de style de focus explicite ni de cible minimale. | Confirmé dans le code. |
| A11Y-03 — retour assistant | Le bouton retour utilise `size-10` (40 px) alors que le design system définit la cible `.tap` à 44 px. Il a néanmoins un focus visible personnalisé : le problème est surtout la taille tactile et la cohérence, pas une absence totale de focus. | Confirmé, nuance apportée. |
| A11Y-04 — badge alertes | `BottomNav.tsx` affiche le nombre dans un `span` visuel, sans nom accessible qui annonce « nombre d’alertes non lues ». Le lien conserve le libellé « Alertes ». Le hook consommé ne fournit pas ici d'état d'erreur dans le composant. | Confirmé dans le code. |
| A11Y-04 — chat et synchronisation | Le journal du chat porte `role="log"`, `aria-live="polite"` et `aria-relevant`. La résolution de conflit utilise `aria-pressed`; les retours de synchronisation utilisent aussi des toasts. Leur annonce effective reste à vérifier avec lecteur d’écran. | Bonnes bases confirmées ; annonce réelle non testée. |
| A11Y-05 — layout partagé | `AppLayout` utilise `min-h-screen` et un conteneur `py-5`. L'assistant plein écran est imbriqué dans cette structure, ce qui renforce le risque de calcul de hauteur/espacement sur mobile. | Risque confirmé par composition des composants. |
| A11Y-06 — authentification | Le choix connexion/inscription est géré séparément des `Tabs` email/téléphone ; les onglets de méthode utilisent les composants Radix Tabs, mais le mode d'authentification n'est pas un onglet sémantique. | Confirmé dans le code. |
| Mouvement réduit | `src/index.css` comporte une règle globale `prefers-reduced-motion`, mais les appels de défilement JavaScript ne sont pas neutralisés par cette règle CSS. | Limite confirmée. |
| Palette et contraste | `src/index.css` définit des tokens sémantiques et des dégradés pastel. La page Auth utilise `bg-gradient-earth` ; le nom du token ne signifie pas que la palette est terre/ocre : sa définition réelle est rose poudré, bleu ciel et menthe. | Direction pastel confirmée ; contraste calculé non vérifié. |

### Validation technique complémentaire

- Les scripts déclarés dans `package.json` comprennent `npm run lint`, `npm test` et `npm run build`.
- Leur présence ne prouve pas qu'ils ont été exécutés sur la branche de cet audit ; aucun résultat d'exécution locale n'est revendiqué ici.
- La CI ne remplace pas les tests manuels de clavier, zoom, lecteur d’écran et clavier virtuel.
- Aucun changement applicatif n'est effectué dans cette PR documentaire. Les corrections de code doivent rester dans la branche dédiée aux corrections prioritaires, puis être vérifiées séparément.


## Revue de suivi sur la branche Phase 1 — 4 novembre 2026

Cette section actualise les constats historiques ci-dessus après inspection de `codex/phase-1-heritage-premium-design-system`. Elle ne remplace pas les tests manuels ni une mesure automatisée.

| Point historique | État constaté sur la branche Phase 1 | Suite requise |
|---|---|---|
| A11Y-01 — assistant mobile et mouvement réduit | `AssistantPage.tsx` utilise désormais `h-[100dvh]` et consulte `prefers-reduced-motion` avant le défilement automatique. | Tester le clavier virtuel, le paysage et le zoom sur appareils réels. |
| A11Y-02 — mode connexion/inscription | `AuthPage.tsx` expose maintenant `aria-pressed` sur les deux choix et applique `tap` / `focus-ring`. | Vérifier la restitution réelle avec lecteur d’écran et le contraste des états. |
| A11Y-03 — cibles tactiles | Le bouton retour de l’assistant est en 44 px ; les contrôles principaux de la navigation basse utilisent une hauteur minimale de 48 px. Les boutons icône partagés, le sélecteur de thème, le déclencheur de sidebar et les commandes du calendrier ont été alignés sur 44 px. | Vérifier les exceptions dans les écrans métier et la densité sur petits écrans. |
| A11Y-04 — compteur d’alertes | Le lien Alertes fournit un nom accessible qui inclut le nombre non lu ou l’état d’erreur. | Confirmer l’annonce avec NVDA, VoiceOver ou TalkBack. |
| A11Y-05 — responsive | Le shell partagé utilise une gouttière responsive et l’assistant une hauteur dynamique. | Exécuter les tests visuels 320/360/390/768/1280 px, zoom 200–400 % et textes longs. |
| A11Y-06 — parcours clavier | Les composants partagés ont des états de focus visibles renforcés ; les primitives Radix conservent leur gestion clavier native. | Parcourir manuellement Tab/Shift+Tab, Entrée/Espace et Échap sur les routes et dialogues. |

### Compléments apportés au socle partagé

- Les boutons icône par défaut, le contrôle de thème, les déclencheurs de navigation latérale et les flèches du calendrier disposent maintenant de zones d'au moins 44 × 44 px.
- Les commandes des menus déroulants (éléments, sous-menus et choix radio) ont une hauteur minimale de 40 px.
- Les commandes du carrousel utilisent une cible de 40 × 40 px ; leur positionnement doit être contrôlé sur les conteneurs étroits afin d'éviter qu'elles sortent de la zone visible.
- Les composants calendrier, tableaux, menus, accordéons, avatars, graphiques et panneaux latéraux ont été harmonisés sur les tokens sémantiques et les deux thèmes.

### Limites de validation inchangées

Aucun navigateur, lecteur d’écran, émulateur mobile ou outil axe/Lighthouse n’a été exécuté dans cette revue GitHub. Les changements décrits sont vérifiés dans le code de la branche, pas certifiés par une interaction réelle. Les contrôles lint, tests et build doivent être relancés sur la tête de branche lorsque la PR cible à nouveau `main` ; les workflows actuels ne se déclenchent que pour les PR ciblant `main`.

## Revue complémentaire — contraste des tokens et parcours visiteur — 4 novembre 2026

Cette revue porte sur les valeurs HSL déclarées dans `src/index.css` et sur les routes/composants de la branche Phase 1. Les ratios ci-dessous sont des calculs statiques sur les paires de tokens indiquées ; ils ne remplacent pas une mesure sur les composants rendus, leurs états hover/disabled, les dégradés ou les images.

### Contraste calculé des paires sémantiques

| Thème | Paire de tokens | Ratio calculé | Lecture |
|---|---|---:|---|
| Clair | `foreground` / `background` | 13,67:1 | Conforme au seuil texte courant 4,5:1 |
| Clair | `muted-foreground` / `background` | 5,16:1 | Conforme au seuil texte courant 4,5:1 |
| Clair | `primary-foreground` / `primary` | 8,00:1 | Conforme au seuil texte courant 4,5:1 |
| Clair | `warning-foreground` / `warning` | 4,64:1 | Conforme de justesse au seuil texte courant 4,5:1 |
| Clair | `warning` / `background` | 3,28:1 | Au-dessus du seuil 3:1 pour un indicateur graphique |
| Clair | `focus-ring` / `background` | 3,66:1 | Au-dessus du seuil 3:1 pour un indicateur de focus |
| Sombre | `foreground` / `background` | 14,95:1 | Conforme au seuil texte courant 4,5:1 |
| Sombre | `muted-foreground` / `background` | 8,24:1 | Conforme au seuil texte courant 4,5:1 |
| Sombre | `primary-foreground` / `primary` | 8,22:1 | Conforme au seuil texte courant 4,5:1 |
| Sombre | `warning-foreground` / `warning` | 8,92:1 | Conforme au seuil texte courant 4,5:1 |
| Sombre | `focus-ring` / `background` | 8,69:1 | Conforme au seuil 3:1 pour un indicateur de focus |

**Réserve :** le ratio du warning clair (4,64:1) dispose d'une marge limitée. Ne pas éclaircir davantage son texte ou assombrir son fond sans recalcul. Les combinaisons de badges d'état, textes placés sur dégradé, bordures, placeholders, états désactivés et survols restent à mesurer sur leurs fonds effectifs.

### Points de vigilance dans les contrôles partagés

- Le calendrier donne 44 × 44 px à ses flèches de navigation et 40 × 40 px aux jours ; les jours sont donc sous la cible de projet de 44 px, même si leur taille dépasse le minimum WCAG 2.2 AA de 24 px dans les cas ordinaires.
- Les flèches de carrousel sont en 40 × 40 px ; vérifier leur placement et leur accès sur conteneur étroit.
- Les cases à cocher, boutons radio et curseurs ont un élément graphique de 20 × 20 px. Leur zone réelle dépend du label ou de la surface de piste ; elle doit être mesurée au niveau de l'interaction complète, pas déduite de la seule taille de l'icône.
- Le contrôle de thème est rendu dans l'en-tête global de `AppLayout`. Vérifier qu'il reste visible, non chevauchant et cohérent avec les en-têtes spécifiques sur les petits écrans et les pages plein écran.

### Parcours visiteur — point à traiter en Phase 3, pas dans le socle visuel

L'inspection de `src/app/router.tsx`, `HomePage.tsx`, `ModulePage.tsx` et `AssistantPage.tsx` confirme que les routes `/modules/:moduleId` et `/assistant` sont publiques. La page d'accueil visiteur affiche des aperçus de modules et un accès à l'assistant ; la page Assistant expose actuellement un champ de saisie et une action d'envoi sans verrouillage d'interface selon l'état connecté. Le service peut refuser une requête non authentifiée, mais cette revue ne certifie pas ce comportement serveur.

Ce constat ne justifie pas de modifier les règles d'accès dans la PR de design system. Il doit devenir un contrôle fonctionnel explicite de la Phase 3 : visiteur = explications et aperçu seulement ; conversation complète et fonctionnalités actives = utilisateur authentifié ; le refus côté serveur doit rester la frontière de sécurité, indépendamment du masquage UI.

### Limites et suite

- Ces ratios sont calculés à partir des valeurs HSL des tokens et des paires listées ; aucun screenshot ni état interactif n'a été analysé.
- Aucun navigateur, émulateur, lecteur d'écran, axe ou Lighthouse n'a été exécuté.
- Avant de considérer la Phase 1 terminée : mesurer les combinaisons réelles des composants, vérifier les cibles tactiles complètes et effectuer les tests responsive, clavier et lecteur d'écran.
- Le contrôle des accès visiteur/assistant sera repris dans la Phase 3, sans élargir le périmètre de cette PR visuelle.
