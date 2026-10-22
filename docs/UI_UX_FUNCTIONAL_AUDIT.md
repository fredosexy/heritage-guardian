# Heritis — audit fonctionnel des parcours (partie 3)

- **Référence :** branche `main`, commit `26dca74ff76a21ebd67cf73c03860bf222c8d6d5`
- **Périmètre :** dépôt GitHub uniquement ; aucune modification directe dans Lovable.
- **Méthode :** lecture statique des routes, pages et hooks métier. Aucun parcours n'a été exécuté dans un navigateur ni avec un compte de test pendant cette étape.

## Synthèse

Les pages ont déjà des états explicites de chargement et d'absence de données à plusieurs endroits, la création prend en compte le mode visiteur et le hors-ligne, et les actions sensibles disposent souvent d'une confirmation ou d'un contrôle de propriétaire. Quelques chemins d'erreur et retours d'état doivent toutefois être consolidés.

## Points prioritaires

### F1 — P1 : chargement de détail potentiellement bloqué après une erreur réseau

- **Fichier :** `src/features/dossiers/hooks/useDossierDetail.tsx`
- **Constat :** `load()` attend `Promise.all` pour le dossier, les preuves et les participants, puis met `loading` à `false` uniquement après la réussite de ces requêtes. Si l'une rejette, la fonction ne termine pas son chemin de succès ; la page détail peut rester sur son indicateur de chargement.
- **Effet utilisateur possible :** écran qui tourne indéfiniment au lieu d'afficher une erreur et une possibilité de réessayer.
- **Correction recommandée :** ajouter un état d'erreur dédié, garantir la fin du chargement dans un `finally`, proposer un bouton de nouvelle tentative et distinguer « introuvable » de « impossible à charger ».
- **Validation requise :** simuler échec réseau de chacune des trois requêtes et confirmer le retour à un état compréhensible.

### F2 — P1 : lecture d'alerte optimiste sans restauration visible en cas d'échec

- **Fichier :** `src/features/alerts/hooks/useAlerts.tsx`
- **Constat :** `markRead` met immédiatement l'alerte à `read: true`, puis attend `alertsRepo.markAlertRead(id)` sans gérer localement l'échec ni restaurer l'état. `AlertsPage.tsx` déclenche la promesse sans `catch`.
- **Effet utilisateur possible :** une alerte peut apparaître comme lue localement alors que l'enregistrement a échoué ; une erreur peut aussi rester sans retour visible.
- **Correction recommandée :** conserver l'état précédent et le restaurer en cas d'échec, ou utiliser une mutation avec état d'erreur ; informer l'utilisateur sans interrompre la navigation.
- **Validation requise :** échec serveur lors du marquage, navigation vers l'action de l'alerte et rafraîchissement de la page.

### F3 — P1 : conflit de synchronisation, valeur affichée par défaut vs choix réellement enregistré

- **Fichier :** `src/features/offline/pages/SyncCenterPage.tsx`
- **Constat :** `ConflictCard` affiche « mine » comme option choisie lorsque `choice[field]` est vide (`choice[field] ?? "mine"`), mais l'état `choice` reste vide jusqu'à une interaction. Le formulaire peut donc afficher une sélection qui n'est pas explicitement présente dans les données soumises.
- **Effet utilisateur possible :** l'utilisateur peut penser que la valeur « la mienne » est confirmée alors que le choix transmis reste implicite ; la sécurité de la résolution dépend alors de la logique de fusion en aval.
- **Correction recommandée :** initialiser explicitement le choix par champ à l'option par défaut, ou ne pas afficher de sélection tant que l'utilisateur n'a pas choisi ; vérifier les règles de fusion pour toutes les combinaisons et exiger un choix explicite si nécessaire.
- **Validation requise :** conflit à un champ et à plusieurs champs ; choisir « moi », « distant », puis résoudre sans toucher une option.

### F4 — P2 : erreurs de chargement des alertes et dossiers sont silencieuses

- **Fichiers :** `src/features/alerts/hooks/useAlerts.tsx`, `src/features/dossiers/hooks/useDossiers.tsx`
- **Constat :** après l'échec des stratégies de chargement, les erreurs sont absorbées (`catch(() => undefined)`). L'interface peut ainsi présenter une liste vide ou incomplète sans expliquer si aucune donnée n'existe réellement ou si la requête a échoué.
- **Effet utilisateur possible :** confusion entre état vide et panne, notamment pour des données patrimoniales importantes.
- **Correction recommandée :** exposer un état d'erreur séparé de la collection vide, proposer une relance et garder un message sobre qui n'expose pas de détails techniques.
- **Validation requise :** serveur indisponible, session expirée et réponse vide réelle.

### F5 — P2 : filtres d'alertes à vérifier pour cohérence des catégories

- **Fichier :** `src/features/alerts/pages/AlertsPage.tsx`
- **Constat :** les filtres sont définis comme `all | urgent | info | suggestion` puis appliqués par égalité directe sur `a.type`. La sémantique du filtre « urgent » semble donc dépendre du fait que le type de l'alerte soit lui-même `urgent`, alors que l'affichage des accents visuels utilise `severity` (`high`, `medium`, autre).
- **Effet utilisateur possible :** les alertes urgentes par gravité pourraient ne pas apparaître dans le filtre urgent si leur `type` est différent.
- **Correction recommandée :** confirmer le modèle de données et, si « urgent » désigne la gravité, filtrer sur `severity` plutôt que `type`; ajouter des tests unitaires sur chaque combinaison type/gravité.
- **Validation requise :** alertes de type information/suggestion avec gravité haute, moyenne et basse.

## Parcours déjà couverts dans le code (à confirmer par tests d'exécution)

| Parcours | Indice positif observé | Contrôle restant |
|---|---|---|
| Création de dossier | Validation minimale du type et du titre ; gestion des modes en ligne, local visiteur et hors ligne ; retour par toast et navigation. | Vérifier les doubles soumissions, le maintien des champs après erreur et le comportement du bouton pendant l'enregistrement. |
| Dossier / preuves | Contrôle de propriétaire avant ajout ; mise en file hors ligne ; retours toast ; confirmation avant suppression. | Simuler échec d'upload, suppression en attente et échec d'initialisation du parcours. |
| Assistant | État de chargement, désactivation de l'envoi vide/en cours, gestion des erreurs IA et annonce de messages avec `role="log"`. | Vérifier conservation de l'historique après erreur, annulation/navigation pendant streaming et clavier mobile. |
| Fichiers | Distinction visiteur/non-authentifié, chargement, état vide, retours de suppression. | Vérifier échec de renommage/aperçu et restauration de la liste après suppression échouée. |
| Synchronisation | Vérification hors ligne avant relance, état de relance, confirmation avant abandon, gestion de conflits. | Couvrir les conflits et les erreurs partielles, notamment F3. |
| Routes / permissions | `/onboarding` passe par `ProtectedRoute`; le commentaire du routeur décrit les autres pages comme consultables en mode visiteur. | Vérifier chaque action sensible et chaque accès direct par URL, pas seulement l'affichage des liens. |

## Matrice minimale de tests fonctionnels à exécuter

1. Visiteur : explorer accueil/modules, créer un brouillon local, ouvrir fichiers et déclencheurs de connexion ; confirmer que les données du visiteur restent locales.
2. Compte connecté : créer, éditer et supprimer un dossier ; confirmer propriétaire, validation et erreurs.
3. Preuves : upload valide, format/taille invalide, réseau interrompu pendant upload, reprise de synchronisation et échec serveur.
4. Alertes : aucune alerte, filtres par type et gravité, marquer lu en succès/échec, action sans route et action avec route.
5. Synchronisation : file vide, opération en attente, relance hors ligne, relance en ligne, conflit multi-champs, abandon confirmé/annulé.
6. Assistant : envoi vide, réponse en streaming, indisponibilité IA, limitation de débit, erreur puis nouvel essai.
7. Session et permissions : utilisateur déconnecté, dossier absent, dossier appartenant à un autre utilisateur, URL directe vers modification/suppression.
8. Réseau : lenteur, timeout, hors ligne au chargement, retour du réseau et rechargement.

## Limites

- Les constats ci-dessus sont fondés sur la lecture du code et doivent être confirmés par tests ciblés.
- Aucun test de navigateur, aucune simulation de panne et aucune suite automatisée n'ont été exécutés dans cette étape.
- Ce rapport est documentaire ; il ne change pas le comportement de l'application. Les corrections sont à regrouper après la partie 4, sauf si une anomalie critique impose une intervention immédiate.

## Vérification complémentaire du code source — 22 octobre 2026

Les fichiers applicatifs de référence ont été relus directement sur `main`. Les cinq constats ci-dessus sont confirmés dans cette révision du code :

- **F1 confirmé :** `useDossierDetail.tsx` attend les trois dépôts dans un `Promise.all`, sans `catch/finally` dans cette fonction, et ne remet `loading` à faux que sur le chemin de réussite. L'effet appelle `void load()` sans gestion d'erreur.
- **F2 confirmé :** `useAlerts().markRead` met à jour l'état local puis attend `alertsRepo.markAlertRead(id)`, sans rollback. Dans `AlertsPage.tsx`, la promesse est lancée avec `void markRead(a.id)`, sans traitement local de l'échec.
- **F3 confirmé :** `ConflictCard` calcule l'option visuellement sélectionnée avec `choice[field] ?? "mine"`, mais l'état initial reste vide et `submit` transmet cet état vide si l'utilisateur ne touche aucun choix. Le comportement exact de la fusion en aval doit être couvert par un test.
- **F4 confirmé :** les erreurs finales de chargement des alertes et les erreurs de `listUnreadAlerts` sont absorbées par `catch(() => undefined)`. Les listes peuvent donc se présenter comme vides sans état d'erreur explicite.
- **F5 confirmé :** le filtre de la page alertes applique `a.type === filter`, y compris pour `urgent`, alors que la bordure visuelle est calculée à partir de `a.severity`. Le contrat métier doit préciser si « urgent » est un type ou un niveau de gravité ; si c'est la gravité, le filtre actuel ne correspond pas à cette intention.

### Risques complémentaires repérés pendant la relecture

1. **Actions d'alerte :** la lecture est déclenchée avant la navigation, mais son échec n'est ni présenté ni restauré. Le test doit confirmer le comportement lorsque la route d'action change immédiatement de page.
2. **Conflits de synchronisation :** le bouton d'application n'est pas bloqué tant que tous les champs n'ont pas de choix explicite. Avant de rendre le choix obligatoire, inspecter `resolve` et les règles de fusion pour éviter de changer une règle métier intentionnelle.
3. **Chargement du détail :** le cas « dossier inexistant » doit être différencié d'une erreur réseau ; l'audit statique ne prouve pas encore le traitement de chacun de ces retours par le dépôt.

### Périmètre et niveau de preuve

Cette relecture confirme des chemins de code, pas un résultat d'exécution. Aucun scénario n'a été simulé avec un serveur indisponible, une session expirée ou un conflit réel. Les corrections déjà présentes sur une branche de travail distincte ne sont pas considérées comme livrées sur `main` tant qu'elles ne sont pas fusionnées ; le présent rapport reste donc rattaché à son commit de référence et ne présume pas de la fusion de PR.

**Statut de la partie 3 :** audit statique approfondi et documenté ; tests d'exécution et validation de la logique de fusion encore nécessaires.
