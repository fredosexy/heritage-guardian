# B10 — SIGNALEMENTS + CONTESTATIONS + HISTORIQUE DES FAITS

**AUDIT FIRST — REUSE FIRST — DELTA ONLY — PRODUCTION ONLY**

B1 à B9 sont terminés.

Ne reconstruis rien.

## 1. AUDIT OBLIGATOIRE

Inspecte avant toute modification :

- anciens formulaires de plainte/signalement ;
- historique Dossier ;
- Interventions B8 ;
- Documents B6 ;
- Communications B9 ;
- Acteurs B5 ;
- étapes B4 ;
- tables/migrations similaires ;
- modération éventuelle ;
- RLS ;
- composants UI existants.

Réutilise ce qui existe.

Ne crée pas un deuxième système de signalement.

---

# 2. OBJECTIF B10

Finaliser uniquement :

1. `signalements` ;
2. événements du signalement ;
3. relation avec Bien/Dossier/Étape/Intervention/Acteur ;
4. pièces et témoins associés ;
5. workflow de contestation ;
6. suivi ;
7. neutralité des statuts ;
8. RLS ;
9. UI dédiée ;
10. intégration avec l'orientation existante.

Ne touche pas encore :

- Audit global B11 ;
- Offline Sync complet B12 ;
- Notifications avancées B13 ;
- Back-office complet B14.

---

# 3. PRINCIPE FONDAMENTAL

Un Signalement ne modifie jamais l'historique original.

Exemple :

```text
Intervention originale
        ↓
reste intacte

Signalement
        ↓
référence cette intervention
        ↓
ajoute une contestation séparée
```

Ne jamais réécrire silencieusement :

- une intervention ;
- une étape ;
- un document ;
- une validation ;
- un participant.

---

# 4. LANGAGE NEUTRE

L'application ne doit pas conclure automatiquement :

- fraude ;
- corruption ;
- faux ;
- vol ;
- favoritisme ;
- culpabilité.

Utiliser :

- fait signalé ;
- intervention contestée ;
- document contesté ;
- version déclarée par l'utilisateur ;
- élément à vérifier ;
- situation en examen.

Les qualifications plus fortes ne doivent venir que d'un processus autorisé et vérifié.

---

# 5. TABLE `signalements`

Créer ou compléter.

Champs minimum :

```text
id
created_by
bien_id nullable
dossier_id nullable
step_id nullable
intervention_id nullable
actor_concerned_id nullable
signalement_type
description
expected_resolution nullable
status
occurred_at nullable
created_at
updated_at
closed_at nullable
```

Types possibles :

```text
intervention_contestee
document_conteste
action_sans_accord
etape_mal_traitee
information_modifiee
traitement_conteste
autre
```

---

# 6. STATUTS

Utiliser un workflow contrôlé :

```text
brouillon
a_documenter
a_verifier
transmis
en_examen
resolu
clos
```

Éviter un statut automatique comme :

```text
fraude_confirmee
```

sans workflow administratif dédié ultérieur.

---

# 7. TABLE `signalement_events`

Chaque évolution produit un événement.

Champs minimum :

```text
id
signalement_id
event_type
actor_id
details
created_at
```

Types possibles :

```text
created
document_added
witness_added
comment_added
submitted
review_started
additional_info_requested
status_changed
resolved
closed
```

Ces événements constituent l'historique propre du Signalement.

---

# 8. RELATIONS

Un Signalement peut référencer :

```text
Bien
Dossier
Étape
Intervention
Acteur
Document
```

Toutes les relations sont optionnelles selon le cas.

Exemple :

```text
Dossier X
↓
Étape Arrondissement
↓
Intervention Y
↓
Signalement Z
```

---

# 9. DOCUMENTS ASSOCIÉS

Réutilise B6.

Ne crée pas une deuxième table de pièces.

Un Signalement peut associer des documents existants ou créer de nouvelles pièces via le workflow documentaire standard.

Exemples :

- photo ;
- reçu ;
- copie d'un acte ;
- note écrite ;
- fichier fourni par un témoin.

Conserver toujours :

```text
uploaded_by
provided_by
source
verification_status
```

---

# 10. TÉMOINS

Réutilise les Participants/Acteurs existants.

Ne crée pas un nouveau type de personne.

Un témoin lié à un Signalement doit avoir une relation explicite.

Il ne reçoit pas automatiquement accès à tout le Dossier.

---

# 11. CRÉATION DU SIGNALEMENT

Le flow doit rester simple.

Étapes :

```text
1. Que s'est-il passé ?
2. Où cela s'est-il passé dans votre parcours ?
3. Qui était concerné ?
4. Avez-vous un document, une photo ou un témoin ?
5. Que souhaitez-vous obtenir maintenant ?
6. Résumé
7. Soumettre
```

Le nombre réel d'écrans peut varier selon les réponses.

---

# 12. INTÉGRATION AVEC ORIENTATION

Réutilise la conversation d'orientation existante.

Si l'utilisateur choisit :

```text
J'ai un problème avec mon dossier
```

orienter vers B10.

Ne crée pas un deuxième Assistant.

L'Assistant peut demander :

```text
Que s'est-il passé ?
```

puis :

```text
Est-ce lié à une personne, un service, un document ou une étape ?
```

---

# 13. MODE RURAL ESSENTIEL

Une question par écran.

Exemple :

```text
Que s'est-il passé ?
```

Actions simples :

```text
Une personne a agi sans mon accord
Un document pose problème
Une étape a été mal faite
Un service a traité mon dossier d'une manière que je conteste
Je veux expliquer avec ma voix
```

Puis :

```text
Avez-vous quelque chose qui peut aider à comprendre ?
```

Choix :

```text
Photo
Document
Témoin
Rien pour le moment
```

---

# 14. NOTE VOCALE

Réutilise B9/B6.

Permettre à l'utilisateur d'expliquer les faits avec sa voix.

La note vocale :

- reste la source originale ;
- peut être transcrite si le système le permet ;
- la transcription ne remplace jamais l'original ;
- doit pouvoir être enregistrée offline plus tard avec B12.

---

# 15. RÉSULTAT ATTENDU

Prévoir un champ simple :

```text
expected_resolution
```

Exemples utilisateur :

- comprendre ce qui s'est passé ;
- faire examiner une étape ;
- demander correction ;
- obtenir l'aide d'un professionnel ;
- transmettre le dossier à un service compétent.

Ne promettre aucun résultat garanti.

---

# 16. UI — DÉTAIL DOSSIER

Réutilise `/cas/:id`.

Ajouter une section :

**Signalements et points contestés**

Afficher :

- type ;
- statut ;
- étape concernée ;
- acteur/service concerné ;
- date ;
- dernière évolution.

En mode essentiel :

```text
Vous avez signalé un problème.

Statut :
En cours de vérification.

Prochaine action :
Ajouter le document demandé.
```

---

# 17. UI — DÉTAIL SIGNALEMENT

Créer une route dédiée uniquement si nécessaire selon le router existant.

Afficher :

1. résumé ;
2. dossier/bien concerné ;
3. faits déclarés ;
4. personnes/services concernés ;
5. documents ;
6. témoins ;
7. timeline du signalement ;
8. échanges liés ;
9. prochaine action.

Ne duplique pas les données Dossier.

---

# 18. COMMUNICATION

Réutilise B9.

Une conversation peut avoir :

```text
conversation_type = signalement
```

avec :

```text
signalement_id
```

Ne crée pas une messagerie parallèle.

---

# 19. SIGNALER UNE INTERVENTION

Depuis une intervention B8, permettre si l'utilisateur est autorisé :

**Signaler un problème avec cette intervention**

Le Signalement reçoit :

```text
dossier_id
step_id
intervention_id
actor_concerned_id
```

Ne modifie pas l'intervention originale.

---

# 20. SIGNALER UN DOCUMENT

Depuis B6 :

**Signaler un problème avec ce document**

Le Signalement référence le document.

Le document ne devient pas automatiquement :

```text
rejete
```

La contestation reste séparée jusqu'à décision autorisée.

---

# 21. RESPONSABILITÉ DES DÉCLARATIONS

Conserver :

```text
signalement créé par
pour le compte de
si accompagnement
```

Exemple :

```text
Signalement créé par : Paul
Pour : Jeanne
Rôle : Accompagnateur
```

Le système doit conserver cette distinction.

---

# 22. APPLICATION LAYER

Créer/compléter si nécessaire :

```text
application/signalement-flow/
```

Responsabilité :

orchestrer :

```text
Signalement
+
Dossier
+
Étape
+
Intervention
+
Acteur
+
Documents
+
Communications
```

Ne place pas cette orchestration dans les composants UI.

---

# 23. REPOSITORY / SERVICE

Exposer conceptuellement :

```ts
createSignalement(...)
getSignalement(...)
getSignalementsForDossier(...)
getSignalementsForUser(...)
addSignalementEvent(...)
updateSignalementStatus(...)
attachDocument(...)
addWitness(...)
closeSignalement(...)
```

Réutilise l'infrastructure existante.

---

# 24. TRANSITIONS DE STATUT

Les transitions doivent être contrôlées.

Exemple :

```text
brouillon
→ a_documenter
→ a_verifier
→ transmis
→ en_examen
→ resolu
→ clos
```

Certaines transitions peuvent être sautées selon le workflow.

Un utilisateur ordinaire ne doit pas pouvoir s'auto-attribuer :

```text
resolu
```

si cela dépend d'un traitement externe.

---

# 25. RLS — `signalements`

**DENY BY DEFAULT**

SELECT :

- auteur ;
- personnes autorisées ;
- rôles de traitement futurs appropriés.

INSERT :

utilisateur authentifié autorisé à créer un signalement.

UPDATE :

champs limités selon rôle.

Un utilisateur ne doit pas modifier librement :

- statut protégé ;
- acteur de traitement ;
- résultat officiel.

---

# 26. RLS — `signalement_events`

SELECT :

selon accès au Signalement.

INSERT :

selon workflow autorisé.

UPDATE/DELETE :

éviter.

Préférer append-only.

---

# 27. VISIBILITÉ DE LA PERSONNE SIGNALÉE

Un acteur/service concerné ne reçoit pas automatiquement accès à toutes les pièces.

La visibilité doit être contrôlée selon :

- workflow ;
- rôle ;
- besoin ;
- règles futures du back-office.

Ne crée pas un accès automatique simplement parce que son ID apparaît dans `actor_concerned_id`.

---

# 28. CONFIDENTIALITÉ

Les Signalements peuvent contenir des données sensibles.

Ne pas exposer :

- description complète ;
- documents ;
- identité de témoins ;
- notes vocales ;

à des utilisateurs non autorisés.

Pas de projection publique par défaut.

---

# 29. INDEXES

Prévoir selon requêtes réelles :

```text
signalements.created_by
signalements.dossier_id
signalements.bien_id
signalements.step_id
signalements.intervention_id
signalements.actor_concerned_id
signalements.status
signalements.created_at

signalement_events.signalement_id
signalement_events.created_at
```

---

# 30. CONTRAINTES

Garantir :

- FK correctes ;
- signalement cohérent avec les entités référencées ;
- statut valide ;
- acteur concerné valide ;
- historique non destructif ;
- pas de référence à une intervention appartenant à un autre Dossier.

---

# 31. TESTS UNITAIRES

Tester :

- signalement simple ;
- signalement d'intervention ;
- signalement de document ;
- ajout témoin ;
- ajout document ;
- ajout événement ;
- changement statut autorisé ;
- changement statut interdit ;
- accompagnateur agissant pour titulaire.

---

# 32. TESTS RLS / INTÉGRATION

Scénarios minimum :

1. auteur voit son Signalement ;
2. utilisateur externe ne le voit pas ;
3. acteur concerné ne voit pas automatiquement toutes les données ;
4. accompagnateur autorisé peut créer pour le compte du titulaire ;
5. utilisateur ordinaire ne marque pas `resolu` arbitrairement ;
6. document privé reste protégé ;
7. intervention originale reste inchangée ;
8. historique du Signalement reste append-only.

---

# 33. COMPATIBILITÉ EXISTANTE

Si le projet possède déjà :

```text
report
complaint
incident
dispute
issue
```

inspecte et réutilise.

Ne maintiens pas deux concepts parallèles ayant le même rôle.

Si une migration structurelle importante est nécessaire :

STOP et rapporte l'impact.

---

# 34. UI / UX

Respecte le Design System existant.

Mobile-first.

Toujours montrer :

```text
Ce que vous avez signalé
Ce qui est en cours
Ce qu'on vous demande maintenant
Qui peut vous aider
```

Ne montre pas de jargon juridique inutile en mode essentiel.

---

# 35. VALIDATION B10

Avant de terminer :

- build réussi ;
- TypeScript sans erreur ;
- migrations valides ;
- création Signalement ;
- lien Dossier/Bien/Étape/Intervention fonctionne ;
- documents B6 réutilisés ;
- conversations B9 réutilisées ;
- historique original intact ;
- statuts contrôlés ;
- RLS validée ;
- confidentialité respectée ;
- accompagnement tracé ;
- aucun appel Supabase dans composants ;
- aucun domaine B11+ implémenté.

---

# 36. LIVRABLE

Rapporte uniquement :

1. existant réutilisé ;
2. ancien système de plainte/signalement adapté ;
3. fichiers créés ;
4. fichiers modifiés ;
5. migrations ;
6. RLS ;
7. services/application layer ;
8. UI adaptée ;
9. tests exécutés ;
10. écarts éventuels.

**Ne commence pas B11.**