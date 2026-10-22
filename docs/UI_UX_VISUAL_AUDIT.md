# Heritis — audit de cohérence visuelle (partie 2)

- **Référence de code :** `main`, commit `26dca74ff76a21ebd67cf73c03860bf222c8d6d5`
- **Branche de travail :** `docs/heritis-ui-ux-visual-audit`
- **Périmètre :** dépôt GitHub uniquement ; aucune modification directe dans Lovable.
- **Nature du contrôle :** audit statique des styles et composants. Les contrastes exacts, rendus réels et différences par viewport doivent encore être confirmés dans un navigateur.

## Résumé

Le socle global est déjà aligné sur la direction approuvée : surfaces claires, accent lavande, nuances pastel bleu/lavande/menthe, bordures discrètes, rayons généreux et ombres douces. Les noms historiques `gradient-earth` et `gradient-warm` ne décrivent plus leurs couleurs réelles : leurs tokens CSS actuels sont eux aussi pastel. Il ne faut donc pas remplacer ces classes sur la seule base de leur nom.

Les écarts à traiter concernent surtout la cohérence de la typographie, le contraste potentiel du texte blanc sur des gradients très clairs, les styles de focus/taille tactile sur certains contrôles et la confirmation du rendu réel sur petits écrans.

## Constatations classées

### P1 — À vérifier/corriger en priorité

| ID | Zone | Constat statique | Risque | Suite recommandée |
|---|---|---|---|---|
| VIS-01 | Authentification — `src/features/identity/pages/AuthPage.tsx` | Le bouton principal et le bouton de vérification OTP utilisent `bg-gradient-warm` avec la couleur `text-primary-foreground` (blanc). Le gradient défini dans `src/index.css` est très clair. | Le contraste du texte blanc peut être insuffisant sur tout ou partie du dégradé. | Calculer/mesurer le contraste du rendu final ; utiliser un texte sombre ou un fond d’action plus soutenu si le seuil n’est pas atteint. |
| VIS-02 | Onboarding — `src/features/identity/pages/OnboardingPage.tsx` | Le bouton « oui » utilise le même gradient clair avec texte de premier plan blanc. | Même risque de contraste sur une action essentielle. | Mesurer le contraste et harmoniser avec le bouton principal partagé. |
| VIS-03 | Module — `src/features/home/pages/ModulePage.tsx` | L’appel à l’action principal utilise le gradient clair avec texte blanc ; `NextActionCard.tsx` utilise aussi ce gradient derrière une icône blanche. | Contraste possiblement insuffisant dans un CTA important et dans l’icône. | Vérifier le contraste réel ; privilégier une surface accentuée suffisamment foncée pour les glyphes blancs, ou des glyphes sombres sur le pastel. |

### P2 — Cohérence à améliorer

| ID | Zone | Constat statique | Risque | Suite recommandée |
|---|---|---|---|---|
| VIS-04 | Typographie — `AuthPage.tsx`, `ModulePage.tsx` | Quelques titres utilisent `font-serif`/Fraunces alors que le système global fixe Inter pour les titres et expose une échelle typographique partagée. | Hiérarchie moins homogène entre écrans et impression d’une ancienne identité visuelle. | Confirmer si Fraunces est un accent éditorial voulu ; sinon utiliser les classes typographiques partagées (`text-display`, `text-title`). |
| VIS-05 | Onglets connexion/inscription — `AuthPage.tsx` | Les deux boutons HTML de bascule ont des styles locaux et n’affichent pas explicitement les classes communes `focus-ring` et `tap`. | Focus clavier et taille tactile potentiellement moins cohérents que les autres actions. | Vérifier le focus visible et une cible d’au moins 44 × 44 px ; harmoniser les classes sans changer le comportement des onglets. |
| VIS-06 | Système de composants — `src/index.css`, composants partagés | Le système définit des tokens et classes utiles (`card-soft`, `text-display`, `text-title`, `text-body`, `text-caption`, `tap`, `focus-ring`), mais certains écrans restent composés de nombreuses classes locales. | Dérive progressive des espacements, de la typographie et des interactions entre écrans. | Lors de la phase de correction, réutiliser les tokens/primitives lorsque cela simplifie vraiment le code et préserve la logique métier. |

### P3 — Validation visuelle nécessaire

| ID | Zone | Point non prouvé par la lecture du code | Validation requise |
|---|---|---|---|
| VIS-07 | Ensemble des routes et états | L’audit source ne permet pas de certifier l’équilibre visuel, la densité ou les débordements à l’écran. | Parcourir les routes de l’inventaire sur mobile étroit, mobile courant et desktop, avec états visiteur/connecté et chargement/vide/erreur. |
| VIS-08 | Thèmes clair/sombre — `src/index.css` | Les tokens des deux thèmes existent ; leur contraste et la cohérence de chaque composant dans les deux thèmes ne sont pas validés par cette inspection. | Contrôler les cartes, champs, badges, dialogues, focus et statuts dans les deux thèmes si le thème sombre est accessible dans l’application. |
| VIS-09 | Couleurs d’état | Les tokens de succès, avertissement, risque et statut sécurisé sont définis séparément de la palette pastel, ce qui est positif ; leur application uniforme dans toutes les pages reste à vérifier. | Vérifier que les alertes importantes restent distinctes et ne reposent jamais uniquement sur la couleur. |

## Tokens confirmés

Source : `src/index.css` et `tailwind.config.ts`.

- Fond clair : `--background: 210 35% 98%`.
- Texte principal : `--foreground: 230 18% 18%`.
- Accent primaire : lavande `--primary: 255 78% 58%`.
- Surfaces : cartes blanches, bordures fines, rayon global de 1,125 rem.
- Gradients actuels : `--gradient-warm` lavande → bleu ciel ; `--gradient-earth` rose poudré → bleu ciel → menthe ; `--gradient-hero` lavande → bleu ciel → menthe.
- Ombres douces et prise en charge de `prefers-reduced-motion`.
- Classes utilitaires prévues : `tap` (minimum 44 px) et `focus-ring`.

**Précaution :** les noms `earth` et `warm` sont historiques ; les tokens visibles dans le CSS ne correspondent pas à une ancienne palette terre/ocre. Les renommer ou les remplacer globalement sans vérifier tous les usages pourrait introduire une régression.

## Ordre proposé pour la correction après les quatre parties d’audit

1. Mesurer et corriger le contraste des actions à gradient (VIS-01 à VIS-03).
2. Uniformiser typographie et focus/taille tactile (VIS-04 à VIS-06).
3. Effectuer la validation navigateur responsive, clair/sombre et états (VIS-07 à VIS-09).
4. Exécuter tests, lint, build et CI pertinents avant toute proposition de fusion.

## Limites et critères de clôture

- Cet audit est fondé sur le code source ; aucune capture de navigateur n’a été prise et aucun rapport automatique de contraste n’a été exécuté dans cette étape.
- Les constats formulés comme « risque » sont des risques à vérifier, pas des échecs WCAG déjà mesurés.
- La partie 2 sera considérée documentée une fois ce rapport versionné. Les corrections de code attendront la fin des parties 3 et 4 afin de traiter les causes communes dans le bon ordre.
