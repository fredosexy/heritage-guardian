# B14 — BACK-OFFICE + GOUVERNANCE + MODÉRATION

**AUDIT FIRST — REUSE FIRST — DELTA ONLY — PRODUCTION ONLY**

B1 à B13 sont terminés.

Ne reconstruis rien.

## 1. AUDIT OBLIGATOIRE

Inspecte avant toute modification :

- espace admin existant ;
- rôles administratifs ;
- gestion utilisateurs ;
- validation Actors B5 ;
- Procedure Definitions B4 ;
- Signalements B10 ;
- Audit Events B11 ;
- notifications B13 ;
- composants dashboard/table/filter existants ;
- routes admin ;
- services/repositories ;
- RLS ;
- fonctions backend privilégiées.

Réutilise ce qui existe.

Ne crée pas un deuxième back-office.

---

# 2. OBJECTIF B14

Finaliser uniquement :

1. rôles administratifs séparés ;
2. validation/suspension des acteurs ;
3. validation des compétences et habilitations ;
4. gestion/versionnement des procédures ;
5. traitement des signalements ;
6. gouvernance de l'annuaire ;
7. modération nécessaire ;
8. journalisation des actions admin ;
9. UI back-office ;
10. RLS + fonctions backend sécurisées.

Ne crée pas de nouvelles features métier utilisateur.

---

# 3. PRINCIPE DE GOUVERNANCE

Ne crée pas :

```text
admin = true
```

avec tous les pouvoirs.

Séparer les responsabilités.

Rôles conceptuels :

```text
platform_admin
actor_verifier
procedure_editor
signalement_reviewer
support_agent
moderator
```

Un utilisateur peut avoir plusieurs rôles si nécessaire.

Chaque rôle possède uniquement les permissions nécessaires.

---

# 4. RÔLES ADMINISTRATIFS

Créer ou compléter la structure existante.

Éviter de stocker les permissions critiques uniquement dans le frontend.

Prévoir une source backend dédiée permettant de savoir :

- qui possède quel rôle ;
- qui l'a attribué ;
- quand ;
- statut actif/révoqué.

Toute attribution ou révocation doit être auditée.

---

# 5. VALIDATION DES ACTEURS

Créer le workflow :

```text
Acteur créé
↓
Non vérifié
↓
Vérification en cours
↓
Vérifié
```

ou :

```text
Refusé / Suspendu / Révoqué
```

Le vérificateur doit pouvoir consulter uniquement les éléments nécessaires :

- identité/service ;
- compétences déclarées ;
- habilitations ;
- justificatifs ;
- territoire ;
- informations de contact pertinentes.

---

# 6. INTERDICTION AUTO-VÉRIFICATION

Un Acteur ne peut jamais :

- vérifier son propre profil ;
- vérifier sa compétence ;
- valider son credential ;
- supprimer une suspension ;
- modifier `verified_by`.

Ces transitions passent par une action backend autorisée.

---

# 7. COMPÉTENCES

Workflow :

```text
Compétence déclarée
↓
À vérifier
↓
Vérifiée
```

ou :

```text
Refusée
Suspendue
Expirée
Révoquée
```

Une compétence vérifiée doit conserver :

```text
verified_by
verified_at
expires_at nullable
```

---

# 8. HABILITATIONS / CREDENTIALS

Le back-office doit permettre :

- consulter ;
- vérifier ;
- refuser ;
- suspendre ;
- révoquer ;
- détecter expiration.

Ne jamais supprimer silencieusement une habilitation historique.

Conserver les anciens statuts.

---

# 9. PROCÉDURES

Réutilise B4.

Le back-office doit permettre :

- créer draft ;
- modifier draft ;
- ajouter étapes ;
- associer source ;
- définir territoire ;
- vérifier ;
- publier ;
- archiver ;
- créer nouvelle version.

Ne jamais modifier directement une version publiée déjà utilisée par des Dossiers.

---

# 10. VERSIONNEMENT DES PROCÉDURES

Flow :

```text
Version 1 publiée
↓
nouvelle modification nécessaire
↓
Version 2 draft
↓
validation
↓
publication
```

Version 1 reste intacte.

Les Dossiers existants continuent d'utiliser leur version jusqu'à migration explicite.

---

# 11. SOURCE PROCÉDURE

Chaque procédure publiée doit avoir au minimum :

```text
source_reference
version
territory
verified_by
verified_at
status
```

Ne publier aucune procédure marquée `a_verifier`.

---

# 12. PUBLICATION

Seul un rôle autorisé peut passer :

```text
validee → publiee
```

La publication doit :

- vérifier les champs requis ;
- conserver version ;
- créer AuditEvent ;
- éventuellement produire notification interne appropriée.

---

# 13. SIGNALEMENTS

Réutilise B10.

Le reviewer doit pouvoir voir une file :

```text
à documenter
à vérifier
transmis
en examen
```

Avec filtres :

- statut ;
- date ;
- territoire ;
- type ;
- dossier ;
- acteur concerné.

---

# 14. TRAITEMENT D'UN SIGNALEMENT

Le reviewer peut :

- commencer examen ;
- demander information complémentaire ;
- associer note interne ;
- changer statut autorisé ;
- enregistrer résultat ;
- clôturer.

Il ne doit pas :

- modifier la déclaration originale ;
- effacer les pièces ;
- changer silencieusement une intervention historique.

---

# 15. NOTES INTERNES

Si nécessaire, prévoir des notes internes distinctes des messages utilisateur.

Elles ne doivent pas être visibles par défaut par les parties externes.

Ne les stocke pas dans `messages` si cela mélange les responsabilités.

Réutilise une structure existante si elle existe.

---

# 16. MODÉRATION

La modération peut concerner :

- contenu abusif ;
- faux profil évident ;
- spam ;
- pièce inappropriée ;
- compte compromis ;
- acteur problématique.

La modération ne décide pas automatiquement de la validité juridique d'un Bien.

---

# 17. SUSPENSION D'ACTEUR

Une suspension doit :

- renseigner motif ;
- date ;
- auteur ;
- statut ;
- durée éventuelle.

Un acteur suspendu :

- ne doit plus être recommandé ;
- ne doit plus recevoir de nouvelles interventions si le workflow l'interdit ;
- conserve son historique passé.

---

# 18. RÉVOCATION

La révocation est plus forte qu'une suspension.

Elle doit être auditée et conserver :

```text
reason
revoked_by
revoked_at
```

Ne supprime pas l'Acteur.

---

# 19. ANNUAIRE

Le back-office doit pouvoir :

- corriger nom/service ;
- gérer localisation ;
- gérer niveau territorial ;
- mettre à jour contacts ;
- contrôler statut de publication ;
- éviter doublons.

Un seul référentiel B5 reste source de vérité.

---

# 20. DÉTECTION DE DOUBLONS

Lorsqu'un nouvel Acteur ou Service ressemble à un existant :

prévoir une alerte ou mécanisme de vérification.

Ne fusionne pas automatiquement deux acteurs.

La fusion doit être explicite et auditée si elle est supportée.

---

# 21. BACK-OFFICE UI

Réutilise les composants admin existants.

Sections principales :

```text
Vue d'ensemble
Acteurs
Compétences
Habilitations
Procédures
Signalements
Modération
Audit
```

Ne surcharge pas la navigation utilisateur normale.

Utiliser une route/admin layout séparé si l'existant le permet.

---

# 22. DASHBOARD

Afficher uniquement des indicateurs utiles :

- acteurs à vérifier ;
- credentials expirant ;
- procédures en attente ;
- signalements en examen ;
- éléments suspendus ;
- erreurs système importantes.

Pas de dashboard décoratif.

---

# 23. LISTES

Les tables/listes doivent supporter :

- pagination ;
- recherche ;
- filtres ;
- tri ;
- états loading/empty/error.

Ne charge pas toutes les données en une fois.

---

# 24. FICHE ACTEUR ADMIN

Afficher :

1. identité/service ;
2. territoire ;
3. compétences ;
4. credentials ;
5. statut ;
6. historique de vérification ;
7. actions admin possibles ;
8. AuditEvents pertinents.

---

# 25. FICHE PROCÉDURE ADMIN

Afficher :

1. code ;
2. type de Dossier ;
3. territoire ;
4. version ;
5. statut ;
6. source ;
7. étapes ;
8. historique versions ;
9. auteur/validateur ;
10. actions autorisées.

---

# 26. FICHE SIGNALEMENT ADMIN

Afficher :

1. résumé ;
2. auteur ;
3. Bien/Dossier concernés ;
4. étape/intervention concernée ;
5. acteur/service concerné ;
6. documents ;
7. témoins ;
8. conversations ;
9. historique ;
10. actions de traitement.

Respecter strictement les permissions.

---

# 27. APPLICATION LAYER

Créer/compléter si nécessaire :

```text
application/admin-governance/
```

Responsabilités :

- vérifier acteur ;
- valider compétence ;
- gérer credential ;
- publier procédure ;
- traiter signalement ;
- suspendre/révoquer.

Ne place pas cette logique dans les composants admin.

---

# 28. BACKEND PRIVILÉGIÉ

Les opérations sensibles doivent passer par :

- RPC SQL sécurisée ;
- Edge Function ;
- transaction backend ;

selon ce qui existe déjà et ce qui est réellement nécessaire.

Exemples :

```text
verify_actor
verify_competence
publish_procedure
suspend_actor
revoke_actor
resolve_signalement
```

Ne laisse pas l'UI faire directement un simple UPDATE sur les champs protégés.

---

# 29. AUDIT B11

Toutes les actions admin sensibles doivent produire un AuditEvent.

Minimum :

```text
admin_role_granted
admin_role_revoked

actor_verified
actor_suspended
actor_revoked

competence_verified
credential_verified
credential_revoked

procedure_published
procedure_archived

signalement_review_started
signalement_status_changed
signalement_closed
```

---

# 30. CONFIRMATION ACTIONS SENSIBLES

Avant :

- suspension ;
- révocation ;
- publication ;
- clôture signalement ;
- changement de rôle admin ;

afficher confirmation explicite.

Pour les actions très sensibles, demander éventuellement motif obligatoire.

---

# 31. RLS ADMIN

**DENY BY DEFAULT**

Les droits doivent être vérifiés côté backend.

Ne base pas l'accès admin sur :

```text
route cachée
```

ou :

```text
bouton invisible
```

Un utilisateur non autorisé doit être refusé même en appelant directement l'API.

---

# 32. PLATFORM ADMIN

Même `platform_admin` ne doit pas contourner toutes les protections sans raison.

Limiter ses opérations aux fonctions réellement nécessaires.

Les opérations les plus sensibles doivent rester auditées.

---

# 33. SIGNALLEMENT REVIEWER

Peut :

- consulter les Signalements assignés/autorisés ;
- changer certains statuts ;
- demander informations ;
- clôturer selon workflow.

Ne peut pas automatiquement :

- vérifier un Acteur ;
- publier une Procédure ;
- modifier un Bien.

---

# 34. ACTOR VERIFIER

Peut :

- examiner Acteur ;
- compétence ;
- credential ;
- modifier statut de vérification.

Ne peut pas :

- traiter les Signalements sauf rôle supplémentaire ;
- modifier une Procédure publiée.

---

# 35. PROCEDURE EDITOR

Peut :

- créer/modifier drafts ;
- préparer nouvelle version.

La publication peut nécessiter un rôle distinct ou validation supplémentaire selon l'architecture.

---

# 36. SUPPORT AGENT

Le support doit avoir accès uniquement aux données nécessaires à l'assistance.

Ne lui donne pas automatiquement accès :

- documents privés ;
- Signalements sensibles ;
- historique complet ;
- données patrimoniales.

---

# 37. PRIVACY

Dans le back-office :

afficher uniquement les données nécessaires au rôle courant.

Éviter une vue « tout utilisateur / tout patrimoine » si elle n'est pas indispensable.

---

# 38. SERVICES / REPOSITORIES

Exposer conceptuellement :

```ts
getActorsToVerify(...)
verifyActor(...)
suspendActor(...)
revokeActor(...)

getProcedureDrafts(...)
publishProcedure(...)
archiveProcedure(...)

getSignalementsForReview(...)
startSignalementReview(...)
updateSignalementStatus(...)
closeSignalement(...)
```

Les composants ne parlent pas directement à Supabase.

---

# 39. INDEXES

Prévoir selon requêtes réelles :

```text
actors.verification_status
actor_competences.status
actor_credentials.status
actor_credentials.expires_at

procedure_definitions.status
procedure_definitions.territory

signalements.status
signalements.created_at
```

---

# 40. TESTS UNITAIRES

Tester :

- validation acteur ;
- auto-validation refusée ;
- suspension ;
- révocation ;
- credential expiré ;
- publication procédure ;
- ancienne version intacte ;
- traitement signalement ;
- rôle insuffisant refusé.

---

# 41. TESTS RLS / INTÉGRATION

Scénarios minimum :

1. utilisateur normal ne voit pas back-office ;
2. actor_verifier vérifie un acteur ;
3. actor_verifier ne publie pas procédure ;
4. procedure_editor modifie draft ;
5. procedure_editor ne modifie pas version publiée directement ;
6. signalement_reviewer traite signalement autorisé ;
7. support_agent ne voit pas document privé non nécessaire ;
8. suspension Acteur retire ses recommandations ;
9. chaque action sensible crée AuditEvent.

---

# 42. UI / UX ADMIN

Desktop-friendly mais responsive.

Conserver Tailwind/shadcn existants.

Priorités :

- lisibilité ;
- tables claires ;
- statut visible ;
- filtres ;
- confirmation ;
- historique ;
- aucune animation décorative inutile.

---

# 43. PAS DE MÉLANGE AVEC UI UTILISATEUR

Ne place pas les contrôles admin dans les composants utilisateur génériques.

Réutiliser les primitives UI.

Séparer les workflows.

---

# 44. VALIDATION B14

Avant de terminer :

- build réussi ;
- TypeScript sans erreur ;
- migrations valides ;
- rôles admin séparés ;
- vérification Acteur fonctionne ;
- compétence/credential contrôlés ;
- procédure versionnée/publivable ;
- ancienne version intacte ;
- Signalement traitable ;
- suspension/révocation fonctionne ;
- RLS admin validée ;
- actions sensibles backend ;
- Audit B11 alimenté ;
- aucune donnée sensible inutilement exposée ;
- aucun nouveau domaine métier ajouté.

---

# 45. LIVRABLE

Rapporte uniquement :

1. existant admin réutilisé ;
2. fichiers créés ;
3. fichiers modifiés ;
4. migrations ;
5. rôles/permissions ;
6. fonctions backend privilégiées ;
7. RLS ;
8. UI back-office adaptée ;
9. AuditEvents ajoutés ;
10. tests exécutés ;
11. écarts éventuels.

**Ne commence aucune nouvelle phase automatiquement.**