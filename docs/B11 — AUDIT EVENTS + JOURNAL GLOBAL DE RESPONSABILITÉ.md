# B11 — AUDIT EVENTS + JOURNAL GLOBAL DE RESPONSABILITÉ

**AUDIT FIRST — REUSE FIRST — DELTA ONLY — PRODUCTION ONLY**

B1 à B10 sont terminés.

Ne reconstruis rien.

## 1. AUDIT OBLIGATOIRE

Inspecte avant toute modification :

- historiques Dossier existants ;
- logs métier ;
- `dossier_interventions` ;
- Access Requests / Grants ;
- Documents / versions ;
- Signalements / events ;
- changements de statut ;
- validations Acteurs ;
- publication Procédures ;
- éventuelles tables `audit`, `events`, `activity_logs` ;
- triggers SQL existants ;
- hooks/services ;
- RLS.

Réutilise ce qui existe.

Ne crée pas un deuxième système d'audit.

---

# 2. OBJECTIF B11

Finaliser uniquement :

1. journal global `audit_events` ;
2. traçabilité des actions sensibles ;
3. distinction acteur réel / action pour le compte de ;
4. source de l'action ;
5. corrélation requête/événement ;
6. historique global d'un Dossier ;
7. append-only ;
8. RLS ;
9. services de lecture ;
10. tests.

Ne touche pas encore :

- Offline Sync B12 ;
- Notifications B13 ;
- Back-office complet B14.

---

# 3. PRINCIPE

L'Audit répond toujours à :

```text
Qui ?
A fait quoi ?
Sur quoi ?
Pour qui ?
Quand ?
Depuis quelle source ?
Avec quel résultat ?
```

L'Audit ne remplace pas les tables métier.

Exemple :

```text
Document
= source de vérité documentaire

AuditEvent
= trace qu'une action a été effectuée sur ce document
```

---

# 4. TABLE `audit_events`

Créer ou compléter.

Champs minimum :

```text
id
actor_user_id nullable
actor_actor_id nullable
on_behalf_of_user_id nullable
entity_type
entity_id
action
source
metadata
request_id nullable
created_at
```

`created_at` doit provenir du serveur.

---

# 5. SOURCE

Valeurs contrôlées :

```text
web
pwa
offline_sync
backend
admin
system
```

Ne jamais utiliser une chaîne libre provenant directement du client pour une information de sécurité.

---

# 6. ENTITY TYPE

Prévoir un type contrôlé pour les domaines audités :

```text
profile
bien
bien_right_holder
dossier
dossier_participant
dossier_step
actor
actor_competence
actor_credential
document
document_version
access_request
access_grant
intervention
conversation
message
signalement
procedure
```

Rester extensible.

---

# 7. ACTIONS À AUDITER

Minimum :

```text
created
updated
archived

participant_added
participant_revoked

step_started
step_completed
step_blocked

document_added
document_version_added
document_verified

access_requested
access_granted
access_revoked

intervention_recorded
intervention_corrected

actor_verified
actor_suspended
actor_revoked

signalement_created
signalement_status_changed

procedure_published
procedure_archived
```

Ne crée pas des dizaines d'actions redondantes si une action existante suffit.

---

# 8. ACTIONS SENSIBLES OBLIGATOIRES

Audit obligatoire pour :

- ajout/changement de titulaire ;
- révocation d'un ayant droit ;
- modification participant sensible ;
- attribution/révocation d'accès ;
- vérification Document ;
- passage vers `officiel` ;
- intervention protégée ;
- validation Acteur ;
- suspension/révocation Acteur ;
- changement de statut Signalement ;
- publication d'une Procédure ;
- archivage Dossier ;
- modification de permission.

---

# 9. `performed_by` / `on_behalf_of`

Préserver la distinction déjà introduite en B8.

Exemple :

```text
actor_user_id = Paul
on_behalf_of_user_id = Jeanne

action = document_added
```

L'historique doit pouvoir afficher :

```text
Paul a ajouté ce document
pour le compte de Jeanne.
```

---

# 10. `metadata`

Utiliser `metadata` uniquement pour contexte non structurant.

Exemples acceptables :

```text
ancien_statut
nouveau_statut
step_id
document_id
reason_code
```

Ne stocke pas dans `metadata` :

- tout le Dossier ;
- contenu complet des documents ;
- secrets ;
- données sensibles inutiles.

Les données métier restent dans leurs tables.

---

# 11. `request_id`

Utiliser un identifiant de corrélation lorsqu'une action déclenche plusieurs changements.

Exemple :

```text
Acceptation d'un Access Request
↓
Access Grant créé
↓
Scopes créés
↓
Audit Events
```

Ces événements peuvent partager le même `request_id`.

---

# 12. APPEND-ONLY

`audit_events` doit être append-only.

Un utilisateur ordinaire ne peut pas :

- modifier ;
- supprimer ;
- réécrire ;

un événement existant.

Une correction produit un nouvel événement.

---

# 13. CRÉATION DES EVENTS

Ne dépends pas uniquement du frontend pour créer les traces sensibles.

Priorité :

1. fonction backend/SQL/transaction ;
2. trigger sécurisé si approprié ;
3. service serveur contrôlé.

Le frontend peut déclencher une action métier.

Le backend garantit l'Audit correspondant.

---

# 14. TRANSACTIONS

Lorsque possible, une action sensible et son AuditEvent doivent être créés dans la même transaction.

Exemple :

```text
Grant access
+
audit access_granted
```

Éviter :

```text
action réussie
mais audit perdu
```

---

# 15. HISTORIQUE DOSSIER

Créer un service/selector permettant d'obtenir une timeline consolidée d'un Dossier depuis :

- étapes ;
- interventions ;
- documents ;
- accès ;
- signalements ;
- audit events.

Ne duplique pas les données métier dans une nouvelle table `dossier_history`.

---

# 16. UI — HISTORIQUE

Dans `/cas/:id`, réutiliser la Timeline existante.

Ajouter une vue :

**Historique**

Exemple :

```text
12 août
Paul a ajouté un document
Pour Jeanne
Rôle : accompagnateur

14 août
Jean N. a enregistré un témoignage
Niveau : rural

20 août
Accès accordé au Géomètre X
Portée : intervention

24 août
Étape Arrondissement terminée
```

---

# 17. MODE RURAL ESSENTIEL

Ne montrer que les événements réellement utiles.

Exemple :

```text
✓ Document ajouté

✓ Une personne est intervenue

→ Votre dossier passe à l'étape suivante
```

Permettre d'ouvrir les détails si nécessaire.

---

# 18. MODE COMPLET

Afficher :

- date ;
- acteur ;
- rôle ;
- action ;
- niveau territorial ;
- entité ;
- statut ;
- source ;
- détails utiles.

Filtres possibles :

```text
documents
personnes
accès
étapes
signalements
```

---

# 19. ACCÈS À L'AUDIT

Voir un AuditEvent ne doit jamais donner plus d'accès que l'entité correspondante.

Exemple :

si un utilisateur ne peut pas voir un Document privé, l'Audit ne doit pas révéler son contenu.

Les métadonnées doivent être filtrées côté backend si nécessaire.

---

# 20. RLS — `audit_events`

**DENY BY DEFAULT**

INSERT :

uniquement backend/workflow autorisé.

SELECT :

utilisateur autorisé à consulter l'entité concernée et selon la politique produit.

UPDATE :

interdit.

DELETE :

interdit pour utilisateurs ordinaires.

Les rôles administratifs éventuels restent soumis à des règles strictes.

---

# 21. SERVICE / REPOSITORY

Exposer conceptuellement :

```ts
getAuditEventsForEntity(...)
getAuditEventsForDossier(...)
getRecentAuditEventsForUser(...)
```

Ne pas exposer :

```ts
createAuditEvent()
```

directement à tous les composants frontend.

Les événements sensibles doivent être générés par les workflows métier.

---

# 22. ÉVITER LE DOUBLE AUDIT

Si un domaine possède déjà son historique métier :

exemple :

```text
signalement_events
```

le conserver.

`signalement_events`
= historique fonctionnel du Signalement.

`audit_events`
= trace de sécurité/responsabilité globale.

Ne duplique pas inutilement le même contenu complet.

---

# 23. PRIVACY

Ne pas journaliser inutilement :

- contenu complet d'une note vocale ;
- contenu d'un message ;
- fichier ;
- numéro sensible ;
- coordonnées précises ;
- informations privées non nécessaires.

Audit = trace.

Pas copie complète des données.

---

# 24. INDEXES

Prévoir selon les requêtes :

```text
audit_events.entity_type
audit_events.entity_id
audit_events.actor_user_id
audit_events.actor_actor_id
audit_events.request_id
audit_events.created_at
```

Index composite utile :

```text
entity_type + entity_id + created_at
```

si adapté aux requêtes réelles.

---

# 25. PAGINATION

L'historique doit être paginé.

Ne charge pas des milliers d'événements sur mobile.

Prévoir :

- derniers événements ;
- chargement progressif.

---

# 26. TESTS UNITAIRES

Tester :

- action auditée ;
- `on_behalf_of` ;
- source ;
- request_id ;
- correction produisant un nouvel event ;
- timeline consolidée ;
- filtrage d'événements.

---

# 27. TESTS INTÉGRATION

Tester qu'une action sensible produit bien son AuditEvent :

1. ajout titulaire ;
2. ajout participant ;
3. document vérifié ;
4. Access Grant créé ;
5. Access Grant révoqué ;
6. intervention enregistrée ;
7. Signalement créé ;
8. procédure publiée.

---

# 28. TESTS RLS

Scénarios minimum :

1. utilisateur ordinaire ne crée pas directement un AuditEvent sensible ;
2. utilisateur ne modifie pas un AuditEvent ;
3. utilisateur ne supprime pas un AuditEvent ;
4. utilisateur autorisé voit l'historique pertinent ;
5. utilisateur non autorisé ne voit pas les événements d'un Dossier privé ;
6. metadata ne révèle pas de données protégées ;
7. événement généré côté backend après action métier.

---

# 29. COMPATIBILITÉ EXISTANTE

Si le projet contient :

```text
history
activity_log
events
timeline
```

inspecte leur rôle.

Réutilise ce qui est compatible.

Ne maintiens pas :

```text
history + activity_log + audit_events
```

comme trois sources concurrentes du même concept.

Si une migration structurelle importante est nécessaire :

STOP et rapporte l'impact.

---

# 30. FRONTIÈRES

Ne place pas dans Audit :

- moteur Parcours ;
- logique Permissions ;
- contenu Communications ;
- logique Signalement ;
- règles Documents.

Audit observe et trace.

Les domaines restent source de vérité.

---

# 31. VALIDATION B11

Avant de terminer :

- build réussi ;
- TypeScript sans erreur ;
- migrations valides ;
- `audit_events` append-only ;
- actions sensibles auditées ;
- `performed_by/on_behalf_of` conservés ;
- timeline Dossier fonctionnelle ;
- RLS validée ;
- aucune donnée sensible inutile dans metadata ;
- aucun double système d'historique créé ;
- aucun appel d'écriture Audit direct depuis composants ;
- aucun domaine B12+ implémenté.

---

# 32. LIVRABLE

Rapporte uniquement :

1. existant réutilisé ;
2. anciens historiques adaptés ;
3. fichiers créés ;
4. fichiers modifiés ;
5. migrations ;
6. triggers/functions/workflows utilisés ;
7. RLS ;
8. services de lecture ;
9. UI historique adaptée ;
10. tests exécutés ;
11. écarts éventuels.

**Ne commence pas B12.**