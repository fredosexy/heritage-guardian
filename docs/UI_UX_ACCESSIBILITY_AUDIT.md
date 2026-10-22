# Audit UI/UX — responsive et accessibilité

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
