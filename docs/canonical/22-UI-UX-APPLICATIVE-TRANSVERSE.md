# 22 — UI/UX APPLICATIVE TRANSVERSE

**Projet :** Heritage Guardian / Fonciers  
**Statut :** CANONICAL — V1.0  
**Position :** 22/27  
**Type :** Spécification transverse UI/UX, navigation, mobile-first, accessibilité, offline et cohérence inter-domaines

---

# 1. Mission

Définir une expérience utilisateur cohérente, simple, mobile-first et adaptée aux contextes ruraux ou à faible connectivité, sans mélanger les responsabilités des domaines métier.

L’interface doit aider l’utilisateur à comprendre :

- où il se trouve ;
- ce qu’il possède ou suit ;
- ce qui nécessite son attention ;
- ce qu’il peut faire maintenant ;
- quelles informations manquent ;
- quelles actions sont encore en attente ;
- quelles actions sont sensibles ;
- ce qui est confirmé, déclaré, contesté ou non vérifié.

---

# 2. Principes fondamentaux

```text
Simple
≠
Simplistic

Guided
≠
Opaque

Helpful
≠
Autonomous

Mobile-first
≠
Mobile-only
```

---

# 3. Priorité mobile

La V1 est conçue d’abord pour :

- smartphone Android ;
- petits écrans ;
- réseau faible ;
- usage à une main ;
- interactions courtes ;
- texte lisible ;
- boutons larges.

Les layouts tablette/desktop restent supportés mais ne dictent pas l’architecture.

---

# 4. Navigation principale

Bottom Navigation canonique :

```text
Home      → /home
Cas       → /cas
+         → /cas/nouveau
Aide      → /aide
Procédure → /procedure
```

Le bouton central `+` lance la création guidée.

---

# 5. BottomNav

Règles :

- toujours cohérente ;
- 5 entrées maximum ;
- labels courts ;
- icônes compréhensibles ;
- état actif visible ;
- bouton central distinct ;
- ne pas cacher une action critique derrière plusieurs menus.

---

# 6. Home

La Home est une projection transverse, pas un domaine.

Elle doit afficher en priorité :

```text
Situation actuelle
↓
Prochaine action prioritaire
↓
Alertes importantes
↓
Dossiers / biens récents
↓
Suggestions utiles
```

---

# 7. Home — utilisateur non connecté

Parcours de découverte :

- Découvrir ;
- J’ai un héritage ou un terrain ;
- J’ai un problème ;
- Voir les procédures ;
- Aide.

Aucune surcharge de formulaires.

---

# 8. Home — utilisateur connecté

La Home peut contenir :

- salutation contextuelle ;
- résumé patrimonial ;
- dossiers actifs ;
- alertes ;
- procédures en cours ;
- prochaine action ;
- professionnels si nécessaire ;
- suggestions Vita.

---

# 9. Une action prioritaire

L’interface met en avant une seule action principale lorsque possible.

Les autres restent accessibles.

Exemple :

> Ajouter le document demandé

plutôt que 7 CTA concurrents.

---

# 10. Priorité ≠ vérité juridique

Une action mise en avant est une priorité UX ou métier interne.

Elle ne constitue pas une conclusion juridique.

---

# 11. Page Cas

Objectif :

- lister les dossiers ;
- distinguer types et statuts ;
- montrer progression ;
- filtrer ;
- accéder rapidement aux dossiers nécessitant attention.

---

# 12. Dossier Card

Une carte dossier peut afficher :

```text
type
titre
statut
progression
prochaine_action
dernier_changement
alerte?
```

Sans exposer de données sensibles inutiles.

---

# 13. Page Mes biens

La vue patrimoniale doit rester distincte des dossiers.

```text
Mes biens
≠
Mes dossiers
```

Un Asset peut afficher :

- titre ;
- type ;
- localisation générale ;
- situation ;
- relations visibles ;
- procédures liées ;
- conflits visibles ;
- activité économique ;
- alertes.

---

# 14. Page Procédure

La page doit répondre :

> Où en suis-je et que dois-je faire ensuite ?

Elle affiche :

- progression ;
- étapes ;
- exigences ;
- documents ;
- blockers ;
- rendez-vous ;
- résultat ;
- prochaine action.

---

# 15. Page Conflit

L’UI doit distinguer clairement :

- problème ;
- position ;
- preuve ;
- proposition ;
- médiation ;
- accord ;
- impact.

Ne jamais afficher une position comme vérité.

---

# 16. Page Documents

Organisation par :

- catégorie ;
- dossier ;
- bien ;
- statut ;
- date ;
- niveau de vérification.

Les documents secrets ou restreints sont visuellement séparés.

---

# 17. Page Professionnels

Afficher :

- profession ;
- compétence ;
- zone ;
- disponibilité ;
- statut de vérification/habilitation ;
- raisons de recommandation ;
- éventuelles restrictions.

Pas de score opaque universel.

---

# 18. Page Protection

Afficher :

- alertes actives ;
- niveau ;
- résumé simple ;
- action proposée ;
- historique ;
- statut personnel lu/reconnu.

```text
Dismissed
≠
Resolved
```

---

# 19. Page Vie économique

Afficher distinctement :

- usage ;
- activité ;
- gestion ;
- projet ;
- maintenance ;
- revenus/dépenses si autorisés.

Les montants financiers ne doivent jamais apparaître sans permission spécifique.

---

# 20. Parcours de création

Le wizard `/cas/nouveau` doit rester progressif.

Étapes recommandées :

```text
1. Situation
2. Bien / contexte
3. Personnes concernées
4. Documents / preuves
5. Vérification et confirmation
```

---

# 21. Formulaires progressifs

Préférer :

```text
one question at a time
or
small logical groups
```

Éviter les formulaires très longs sur mobile.

---

# 22. Sauvegarde brouillon

Chaque parcours important doit permettre :

- sauvegarde automatique ;
- reprise ;
- fonctionnement offline ;
- indicateur de sync.

---

# 23. États visuels

Chaque ressource doit avoir des états explicites :

```text
LOADING
READY
EMPTY
ERROR
OFFLINE
PENDING_SYNC
SYNC_CONFLICT
READ_ONLY
NOT_AUTHORIZED
ARCHIVED
```

---

# 24. Loading

Préférer skeletons ou loaders contextualisés.

Éviter les écrans blancs.

---

# 25. Empty state

Un empty state doit expliquer :

- pourquoi c’est vide ;
- quoi faire ensuite ;
- CTA unique.

---

# 26. Error state

Une erreur doit :

- expliquer simplement ;
- proposer retry si pertinent ;
- conserver le travail saisi ;
- montrer correlation_id uniquement si utile au support.

---

# 27. Offline state

Toujours visible lorsque le contenu peut être ancien.

Exemple :

> Mode hors ligne — certaines informations peuvent ne pas être à jour.

---

# 28. Sync state

Indicateurs possibles :

```text
Enregistré sur cet appareil
En attente de synchronisation
Synchronisation…
Synchronisé
Conflit à vérifier
```

---

# 29. Sensitive action

Pour une action sensible :

- résumé ;
- conséquence ;
- confirmation ;
- possibilité d’annuler ;
- résultat final clair.

---

# 30. Confirmation

Exemple :

> Vous allez retirer l’accès de cette personne à ce dossier. Continuer ?

---

# 31. Destructive action hierarchy

UI :

```text
Retirer le lien
→ Archiver
→ Suppression logique
→ Suppression définitive exceptionnelle
```

---

# 32. Undo

Lorsque techniquement sûr :

- permettre annulation courte ;
- ne pas proposer undo si l’action est juridiquement ou techniquement irréversible.

---

# 33. Historique

Les timelines importantes affichent :

- action ;
- acteur ;
- date ;
- statut ;
- contexte ;
- correction/version éventuelle.

---

# 34. Timeline ≠ audit complet

L’UI montre une version lisible.

L’audit technique complet reste distinct.

---

# 35. Badges de statut

Exemples :

```text
Déclaré
Documenté
Vérifié
Contesté
À compléter
En cours
Bloqué
Archivé
```

---

# 36. Pas de badge trompeur

Éviter :

```text
100% sûr
Propriétaire confirmé
Validé juridiquement
```

sauf si le système possède réellement la source compétente correspondante.

---

# 37. Couleurs

La couleur ne doit jamais être la seule information.

Associer :

```text
color
+ icon
+ label
```

---

# 38. Accessibilité

Objectif minimum :

- contraste suffisant ;
- focus visible ;
- navigation clavier desktop ;
- labels accessibles ;
- zones tactiles assez grandes ;
- textes redimensionnables ;
- lecteurs d’écran.

---

# 39. Taille tactile

Minimum recommandé :

```text
44 × 44 px
```

pour les actions importantes.

---

# 40. Typographie

Préférer :

- texte lisible ;
- hiérarchie claire ;
- lignes courtes ;
- titres utiles ;
- taille suffisante sur petits écrans.

---

# 41. Langage simple

Préférer :

> Ajouter un document

à :

> Procéder à l’adjonction d’une pièce justificative

---

# 42. Mode non lecteur

Fonctions :

- lecture vocale ;
- cartes visuelles ;
- pictogrammes ;
- question unique ;
- gros boutons ;
- confirmation simple ;
- aide Vita.

---

# 43. Mode rural

Adapter :

- vocabulaire ;
- densité d’information ;
- disponibilité réseau ;
- poids média ;
- usage offline ;
- aides contextuelles.

---

# 44. Voice-first support

Sur certains écrans :

- bouton micro ;
- transcription ;
- correction ;
- confirmation.

La voix ne remplace pas l’affichage du résultat.

---

# 45. Image / preuve

Lors d’un ajout de photo/document :

- preview ;
- compression éventuelle ;
- statut upload ;
- confidentialité ;
- lien avec cible.

---

# 46. Progressive disclosure

Ne montrer les détails avancés que lorsque nécessaires.

Exemple :

Résumé d’une alerte
→ “Voir pourquoi”
→ détails autorisés.

---

# 47. Informations sensibles

Par défaut masquées ou résumées.

Exemples :

- téléphone ;
- adresse ;
- montant ;
- coordonnées exactes ;
- notes privées.

---

# 48. Reveal sensitive data

Une action explicite peut être requise :

> Afficher les détails

avec vérification d’autorisation.

---

# 49. Personne ≠ compte

L’UI doit distinguer :

- personne connue ;
- utilisateur inscrit ;
- personne sans compte ;
- personne décédée.

---

# 50. Person Chip

Peut afficher :

```text
nom
relation contextuelle
status
account indicator?
```

Sans laisser croire qu’un non-utilisateur possède un compte.

---

# 51. Relations

Éviter un vocabulaire absolu pour les relations contestées.

Exemple :

> Relation déclarée : frère

au lieu de :

> Frère confirmé

si non vérifié.

---

# 52. Permissions UI

Les actions invisibles peuvent être masquées.

Mais la sécurité réelle reste serveur.

---

# 53. Disabled vs hidden

- hidden : action jamais pertinente ou sensible ;
- disabled : action visible mais temporairement indisponible, avec explication.

---

# 54. Permission denied UX

Afficher une explication simple :

> Vous n’avez pas l’autorisation pour cette action.

Éviter de révéler le détail de la policy.

---

# 55. Role switching

Si l’utilisateur a plusieurs rôles :

- afficher le rôle actif ;
- permettre de changer ;
- rappeler le rôle avant action sensible.

---

# 56. Representation mode

Lorsque l’utilisateur agit pour quelqu’un :

Bannière claire :

> Vous agissez pour Marie.

---

# 57. Representation exit

Toujours permettre de quitter ce mode facilement.

---

# 58. Search UX

Recherche globale :

- champ unique ;
- filtres ;
- catégories ;
- résultats groupés ;
- reason codes lisibles.

---

# 59. Search result

Afficher :

- type ;
- titre ;
- contexte ;
- zone générale ;
- raison de pertinence ;
- statut utile.

---

# 60. Search zero state

Proposer :

- reformuler ;
- changer zone ;
- enlever filtre ;
- rechercher procédure ;
- demander à Vita.

---

# 61. Nearby UX

Afficher une zone approximative.

Ne pas afficher une adresse exacte sans permission.

---

# 62. Map

Une carte est optionnelle, jamais obligatoire.

Toujours fournir une alternative liste.

---

# 63. Low-data mode

Prévoir :

- images réduites ;
- animations limitées ;
- lazy loading ;
- texte d’abord ;
- chargement manuel média.

---

# 64. Animations

Utiliser avec modération :

- transitions ;
- feedback ;
- progression.

Ne jamais bloquer l’utilisateur avec des animations longues.

---

# 65. Reduce motion

Respecter la préférence `prefers-reduced-motion`.

---

# 66. Feedback action

Toute action importante reçoit un retour :

```text
success
pending
failed
offline queued
review required
```

---

# 67. Toasts

Utiliser pour confirmations courtes.

Ne pas utiliser un toast comme seul moyen d’expliquer une erreur critique.

---

# 68. Modal

Réserver aux :
- confirmations ;
- décisions courtes ;
- avertissements critiques.

Éviter les longs formulaires dans modal mobile.

---

# 69. Bottom Sheet

Approprié pour :
- options rapides ;
- profil ;
- filtres ;
- actions contextuelles.

---

# 70. Navigation profonde

Préférer un maximum de profondeur faible.

Une ressource importante doit être accessible en 2–3 actions depuis le contexte principal.

---

# 71. Breadcrumbs desktop

Utiles sur grand écran.

Sur mobile, préférer :
- back ;
- titre ;
- contexte.

---

# 72. Deep link

Les notifications peuvent ouvrir une ressource.

Le deep link doit :
- authentifier ;
- revalider ;
- afficher fallback si accès expiré.

---

# 73. Screen ownership

Chaque écran principal doit avoir un domaine/projection owner identifié.

Exemple :

```text
Asset Detail → 03
Procedure Detail → 07
Conflict Detail → 09
Protection → 10
Economic Activity → 11
```

---

# 74. Cross-domain screen

Une page peut agréger plusieurs domaines, mais via projections/read models.

---

# 75. No giant form

Éviter un écran unique éditant simultanément :
- Asset ;
- Person ;
- Procedure ;
- Conflict ;
- Documents.

Préférer sous-flows/domain commands.

---

# 76. UI command boundary

Chaque CTA de mutation doit correspondre à une commande identifiable.

---

# 77. Example

```text
CTA: "Contester ce document"
→ ContestDocument
```

---

# 78. UI query boundary

Chaque écran de lecture doit pouvoir identifier sa query/projection.

---

# 79. Design tokens

Centraliser :

- spacing ;
- typography ;
- radius ;
- shadows ;
- colors ;
- z-index ;
- breakpoints ;
- motion.

---

# 80. Components

Catégories :

```text
primitives/
forms/
feedback/
navigation/
data-display/
domain-components/
```

---

# 81. Domain components

Exemples :

- AssetCard ;
- PersonRelationChip ;
- ProcedureStepCard ;
- ConflictImpactBadge ;
- ProtectionAlertCard ;
- MissionCard.

---

# 82. Reuse

Réutiliser les composants existants avant d’en créer de nouveaux.

```text
AUDIT FIRST
→ REUSE FIRST
→ DELTA ONLY
```

---

# 83. No default duplicates

Ne pas garder deux composants quasi identiques par défaut.

Un composant générique est acceptable seulement si la sémantique reste claire.

---

# 84. Responsive breakpoints

Les breakpoints sont centralisés.

Éviter des valeurs arbitraires dispersées.

---

# 85. Desktop

Sur grand écran, exploiter :
- split view ;
- sidebar ;
- panneau détails ;
- tableau.

Mais conserver les mêmes contrats métier.

---

# 86. Tablet

Peut utiliser :
- 2 colonnes ;
- side panels ;
- bottom sheets.

---

# 87. PWA install

Le prompt d’installation ne doit pas interrompre l’onboarding initial.

Proposer à un moment utile.

---

# 88. Update PWA

Lorsqu’une nouvelle version est disponible :

- informer ;
- éviter perte de draft ;
- proposer refresh ;
- préserver état local.

---

# 89. Offline banner

Visible mais non envahissant.

---

# 90. Conflict resolution UX

Afficher :

```text
Votre version
Version actuelle
Différences
Actions possibles
```

---

# 91. No silent overwrite

Jamais :

> Synchronisation terminée

si une partie du travail a été rejetée.

---

# 92. Partial success UX

Exemple :

> Le dossier a été créé, mais le document n’a pas encore été envoyé.

---

# 93. ReviewRequired

État dédié :

> Vérification nécessaire

avec action claire.

---

# 94. Audit visibility

Certaines actions sensibles peuvent offrir :

> Voir l’historique

sans exposer le log technique complet.

---

# 95. Trust / verification language

Utiliser des termes définis.

Éviter les labels non documentés.

---

# 96. Professional verification

Afficher séparément :
- identité ;
- compétence ;
- credential ;
- disponibilité ;
- statut mission.

---

# 97. Conflict neutrality

Ne jamais utiliser :
- coupable ;
- menteur ;
- fraudeur ;

comme labels automatiques.

---

# 98. Alert neutrality

Préférer :

> Élément à vérifier

plutôt que :

> Danger juridique

si la qualification n’est pas établie.

---

# 99. Progress bars

Une progression de procédure représente les étapes applicatives connues.

Elle ne garantit pas le résultat final.

---

# 100. Completion percentage

Éviter les pourcentages arbitraires si les étapes n’ont pas de poids défini.

---

# 101. Checklist

Préférable à un faux 80 % lorsqu’une progression exacte n’est pas calculable.

---

# 102. Data freshness

Sur données offline/stale :

Afficher :

```text
Mis à jour il y a…
```

ou :

```text
Données locales
```

---

# 103. Date formatting

Utiliser la locale utilisateur.

Conserver la date source exacte lorsqu’elle est importante.

---

# 104. Date precision

Respecter :

```text
exact date
month/year
year only
approximate
unknown
```

Ne pas inventer une date précise.

---

# 105. Location precision

Même principe :

```text
village
commune
zone
approximate point
exact point
```

---

# 106. Aide

La page Aide doit proposer :

- Vita ;
- FAQ ;
- explications ;
- support ;
- urgences applicatives non juridiques ;
- contact service client si prévu.

---

# 107. Support

Le support doit recevoir uniquement le contexte nécessaire.

---

# 108. Onboarding

Progressif :

```text
visitor
→ account
→ basic context
→ first asset/case
→ deeper profile as needed
```

---

# 109. No forced completeness

Ne pas demander un profil complet avant que l’utilisateur en ait besoin.

---

# 110. Trust progression

Le niveau de vérification peut progresser avec les actions.

L’UI explique ce qui manque.

---

# 111. Notifications UI

Cloche :
- unread count ;
- catégories ;
- lecture ;
- deep link ;
- préférences.

---

# 112. Notification ≠ inbox support

Séparer :
- notifications système ;
- messages support.

---

# 113. Header

Minimal :
- identité app ;
- notifications ;
- profil.

Éviter les barres surchargées.

---

# 114. Profile sheet

Peut contenir :
- profil ;
- langue ;
- thème ;
- accessibilité ;
- mode rural ;
- déconnexion.

---

# 115. Dark mode

Doit préserver :
- contraste ;
- lisibilité ;
- sémantique des statuts.

---

# 116. Theme ≠ status color

Les couleurs de thème ne doivent pas altérer la compréhension des alertes/status.

---

# 117. Accessibility labels

Toutes icônes interactives ont :
- aria-label ;
- tooltip/label si nécessaire.

---

# 118. Keyboard

Desktop :
- tab order logique ;
- focus trap dans modal ;
- escape ferme modal non critique.

---

# 119. Screen reader

Éviter des cartes entièrement cliquables sans label clair.

---

# 120. Live regions

Pour sync/realtime :
- annoncer les changements importants ;
- éviter les annonces répétitives.

---

# 121. Performance UX

Mesurer :
- LCP ;
- INP ;
- CLS ;
- temps écran interactif ;
- temps query ;
- temps sync.

---

# 122. Perceived performance

Afficher contenu utile progressivement.

---

# 123. Media lazy loading

Photos/documents lourds chargés à la demande.

---

# 124. Skeleton correctness

Un skeleton doit refléter approximativement le layout final pour réduire CLS.

---

# 125. Error recovery

Toujours prévoir un chemin de reprise.

---

# 126. 404 / resource unavailable

Message neutre :

> Cette information n’est pas disponible ou vous n’y avez plus accès.

Éviter de confirmer l’existence d’une ressource secrète.

---

# 127. Security-sensitive empty state

Pour ressource secrète non autorisée :

ne pas dire :

> Ce testament existe mais vous n’avez pas accès.

Préférer :

> Cette information n’est pas disponible.

---

# 128. Test mobile

Minimum :
- petit Android ;
- écran moyen ;
- tablette ;
- desktop.

---

# 129. Test réseau

- offline ;
- 2G/3G simulé ;
- latence ;
- coupure pendant upload ;
- coupure pendant commande.

---

# 130. Tests accessibilité

- contraste ;
- zoom ;
- screen reader ;
- keyboard ;
- reduced motion ;
- tailles tactiles.

---

# 131. Tests UX domaine

### TEST-UX-001
Mes biens et Mes dossiers restent clairement distincts.

### TEST-UX-002
Une alerte ne révèle pas une source secrète.

### TEST-UX-003
Une position de conflit n’est pas rendue comme vérité.

### TEST-UX-004
Un document contesté garde son historique.

### TEST-UX-005
Un professionnel recommandé affiche les raisons.

### TEST-UX-006
Une procédure terminée ne présente pas automatiquement le problème patrimonial comme résolu.

---

# 132. Tests offline

### TEST-UX-007
Un draft est conservé après coupure.

### TEST-UX-008
Une action offline est marquée pending.

### TEST-UX-009
Un conflit de sync est visible.

### TEST-UX-010
Aucun overwrite silencieux.

---

# 133. Tests permissions

### TEST-UX-011
Un utilisateur non autorisé ne voit pas le CTA sensible.

### TEST-UX-012
Une action disabled explique pourquoi.

### TEST-UX-013
Un deep link expiré ne révèle pas la ressource.

### TEST-UX-014
Mode représentation est visible.

---

# 134. Tests Vita

### TEST-UX-015
Une commande sensible préparée par Vita ouvre une confirmation.

### TEST-UX-016
Vita unavailable n’empêche pas l’usage normal.

---

# 135. Invariants UI/UX

### INV-UX-001
La sécurité ne dépend jamais uniquement de l’UI.

### INV-UX-002
Un état métier critique possède un rendu explicite.

### INV-UX-003
Offline et stale sont visibles.

### INV-UX-004
Une action sensible exige confirmation.

### INV-UX-005
Un libellé UI ne doit pas dépasser la sémantique du domaine.

### INV-UX-006
Une information secrète ne fuit pas via erreur, autocomplete, badge ou empty state.

### INV-UX-007
Les parcours importants restent accessibles sans Vita.

### INV-UX-008
La couleur seule ne porte jamais la signification.

### INV-UX-009
Les formulaires sensibles conservent les drafts en cas d’échec.

### INV-UX-010
Les actions cross-domain restent traduites en commandes explicites.

---

# 136. Architecture UI cible

```text
app/
  home/
  cas/
  aide/
  procedure/

src/
  features/
    asset/
    inheritance/
    transmission/
    documents/
    procedure/
    professionals/
    conflict/
    protection/
    lifecycle/
    assistant/

  components/
    ui/
    navigation/
    feedback/
    forms/
    domain/

  hooks/
  stores/
  shared/
```

---

# 137. Règle d’intégration Lovable

Avant toute création :

```text
scan existing src/
scan components/
scan pages/app/
scan hooks/
scan stores/
scan packages/shared/
↓
reuse
↓
modify
↓
create only missing pieces
```

---

# 138. Règle finale

> **L’interface doit rendre les domaines compréhensibles sans les mélanger.**

> **Chaque écran de lecture repose sur une projection autorisée ; chaque action de mutation correspond à une commande explicite.**

> **L’expérience mobile, rurale, offline et non lectrice n’est pas une variante secondaire : elle fait partie de l’architecture V1.**

> **La formule normative est : Clear Context → One Useful Next Action → Explicit State → Safe Confirmation → Domain Command → Visible Result.**

---

**Fin — 22-UI-UX-APPLICATIVE-TRANSVERSE.md**  
**Version 1.0 — Document 22/27**
