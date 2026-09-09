# VITALA-FONCIER-TECHNICAL-IMPLEMENTATION-MATRIX.md

## 0. OBJECTIF

Ce document traduit le Domain Blueprint en architecture technique exploitable.

Il définit :

- les entités backend ;
- les relations ;
- les responsabilités frontend/backend ;
- les permissions ;
- la RLS ;
- les événements métier ;
- les repositories ;
- les flux offline ;
- les modules frontend ;
- l'ordre d'implémentation production.

Principe permanent :

`AUDIT FIRST → REUSE FIRST → DELTA ONLY → PRODUCTION ONLY`

---

# 1. AGRÉGATS MÉTIER PRINCIPAUX

Les agrégats principaux sont :

```text
Utilisateur
Profil d'usage
Bien
Dossier
Parcours
Participant
Acteur
Document
Accès
Communication
Signalement
Audit
Synchronisation
```

Chaque agrégat possède une responsabilité distincte.

---

# 2. TABLE `profiles`

Responsabilité :

identité applicative liée à Supabase Auth.

Champs conceptuels :

```text
id uuid PK → auth.users.id
display_name
preferred_language
phone?
avatar_path?
status
created_at
updated_at
```

Ne pas stocker ici :

- permissions dossier ;
- compétences professionnelles détaillées ;
- préférences offline ;
- historique métier.

---

# 3. TABLE `usage_preferences`

Relation :

```text
profiles 1 ── 1 usage_preferences
```

Champs :

```text
user_id
context_type
assistance_level
interface_level
audio_preference
accompaniment_preference
created_at
updated_at
```

Valeurs conceptuelles :

```text
context_type:
rural | urbain

assistance_level:
autonome | assiste

interface_level:
essentiel | standard | complet

audio_preference:
prefere | optionnel

accompaniment_preference:
seul | accompagne
```

Ces valeurs changent l'UX.

Elles ne changent jamais les permissions métier.

---

# 4. TABLE `biens`

Responsabilité :

représenter durablement un bien.

Champs conceptuels :

```text
id
created_by
type
title
description
location_label
latitude?
longitude?
origin_declared
status
created_at
updated_at
archived_at?
```

Un Bien ne représente pas une procédure.

---

# 5. TABLE `bien_right_holders`

Responsabilité :

lier les personnes ayant un rôle déclaré sur un Bien.

Relation :

```text
biens 1 ── N bien_right_holders
```

Champs :

```text
id
bien_id
person_id
role
status
declared_by
verified_at?
created_at
```

Rôles possibles :

```text
titulaire
ayant_droit
co_titulaire
representant_autorise
autre
```

Important :

une relation déclarée n'est pas automatiquement une reconnaissance juridique officielle.

---

# 6. TABLE `dossiers`

Responsabilité :

représenter une démarche liée à un Bien.

Relation :

```text
biens 1 ── N dossiers
```

Champs :

```text
id
bien_id
owner_id
type
visibility
status
completion_level
current_step_id?
created_at
updated_at
closed_at?
archived_at?
```

Types :

```text
acquisition
achat
succession
heritage
protection
regularisation
partage
transmission
vente
autre
```

---

# 7. TABLE `dossier_participants`

Responsabilité :

définir qui participe à un Dossier et avec quel rôle.

Relation :

```text
dossiers 1 ── N dossier_participants
```

Champs :

```text
id
dossier_id
person_id
role
status
invited_by
accepted_at?
revoked_at?
created_at
```

Rôles :

```text
titulaire
ayant_droit
declarant
accompagnateur
temoin
professionnel
service
autorite
```

Le rôle Dossier est distinct du rôle global User.

---

# 8. TABLE `actors`

Responsabilité :

référentiel des intervenants externes/professionnels/services.

Champs :

```text
id
profile_id?
actor_type
name
description?
location
territorial_level
verification_status
availability_status
created_at
updated_at
```

Types :

```text
professionnel
autorite_locale
service_administratif
organisation
temoin_reference?
autre
```

---

# 9. TABLE `actor_competences`

Relation :

```text
actors 1 ── N actor_competences
```

Champs :

```text
id
actor_id
competence_code
label
status
verified_by?
verified_at?
expires_at?
```

---

# 10. TABLE `actor_credentials`

Responsabilité :

preuves d'habilitation ou de statut professionnel.

Champs :

```text
id
actor_id
credential_type
reference
document_id?
status
issued_at?
expires_at?
verified_by?
verified_at?
```

Statuts :

```text
declare
verification_en_cours
verifie
expire
suspendu
revoque
```

---

# 11. TABLE `procedure_definitions`

Responsabilité :

définir un parcours métier/procédural versionnable.

Champs :

```text
id
code
dossier_type
territory
version
status
source_reference
valid_from?
valid_until?
verified_by?
verified_at?
created_at
```

Statuts :

```text
draft
a_verifier
validee
publiee
archivee
```

---

# 12. TABLE `procedure_steps`

Relation :

```text
procedure_definitions 1 ── N procedure_steps
```

Champs :

```text
id
procedure_id
step_order
code
title
short_description
territorial_level
required_competence?
is_optional
rules_json
created_at
```

`rules_json` doit rester limité à des règles configurables.

Ne pas transformer cette colonne en moteur métier illisible.

---

# 13. TABLE `dossier_steps`

Responsabilité :

instance réelle d'une étape pour un Dossier.

Relation :

```text
dossiers 1 ── N dossier_steps
```

Champs :

```text
id
dossier_id
procedure_step_id?
step_order
title
territorial_level
status
started_at?
completed_at?
blocked_reason?
created_at
updated_at
```

Statuts :

```text
a_faire
en_cours
terminee
bloquee
a_verifier
```

---

# 14. TABLE `dossier_interventions`

Responsabilité :

enregistrer ce qu'une personne/service a réellement fait.

Champs :

```text
id
dossier_id
step_id
actor_id?
participant_id?
action_type
performed_by
on_behalf_of?
territorial_level
verification_status
comment?
performed_at
created_at
```

Actions :

```text
declare
accompagne
constate
temoigne
signe
verifie
valide
enregistre
transmis
recu
```

Une intervention ne donne pas automatiquement de droits sur le Dossier.

---

# 15. TABLE `documents`

Responsabilité :

métadonnées documentaires.

Champs :

```text
id
dossier_id
bien_id?
document_type
title
source_type
verification_status
current_version_id?
created_by
created_at
updated_at
```

Sources :

```text
declaration
utilisateur
acteur
service
source_officielle
```

---

# 16. TABLE `document_versions`

Relation :

```text
documents 1 ── N document_versions
```

Champs :

```text
id
document_id
storage_path
mime_type
size_bytes
checksum
uploaded_by
provided_by?
version_number
created_at
```

Aucune version importante ne doit être écrasée.

---

# 17. STORAGE

Buckets recommandés conceptuellement :

```text
documents-private
audio-private
avatars
public-assets
```

Par défaut :

documents et audio = privés.

L'accès se fait via :

- RLS Storage ;
- signed URLs ;
- scope autorisé.

---

# 18. TABLE `access_requests`

Responsabilité :

demande de consultation ou d'intervention.

Champs :

```text
id
dossier_id
requester_actor_id
requested_by
purpose
status
message?
created_at
resolved_at?
resolved_by?
```

Statuts :

```text
en_attente
acceptee
refusee
annulee
expiree
```

---

# 19. TABLE `access_request_scopes`

Relation :

```text
access_requests 1 ── N access_request_scopes
```

Scopes possibles :

```text
voir_resume
voir_documents_selectionnes
ajouter_document
accompagner
intervenir
commenter
```

---

# 20. TABLE `access_grants`

Responsabilité :

autorisation réellement accordée.

Champs :

```text
id
dossier_id
grantee_actor_id
granted_by
purpose
granted_at
expires_at?
revoked_at?
```

---

# 21. TABLE `access_grant_scopes`

Relation :

```text
access_grants 1 ── N access_grant_scopes
```

Permet d'appliquer une portée précise.

---

# 22. TABLE `conversations`

Chaque conversation doit avoir un contexte métier.

Champs :

```text
id
dossier_id?
signalement_id?
step_id?
access_request_id?
conversation_type
created_by
created_at
closed_at?
```

Pas de conversation sans contexte métier sauf besoin futur explicitement validé.

---

# 23. TABLE `conversation_members`

Champs :

```text
conversation_id
member_id
role
joined_at
left_at?
```

---

# 24. TABLE `messages`

Champs :

```text
id
conversation_id
sender_id
message_type
text_content?
audio_path?
attachment_document_id?
client_message_id
created_at
server_received_at
```

Types :

```text
text
audio
document
system
```

`client_message_id` sert notamment à éviter les doublons après synchronisation.

---

# 25. TABLE `signalements`

Responsabilité :

déclaration distincte d'une procédure normale.

Champs :

```text
id
created_by
bien_id?
dossier_id?
step_id?
intervention_id?
actor_concerned_id?
description
expected_resolution?
status
created_at
updated_at
closed_at?
```

Statuts :

```text
brouillon
a_documenter
a_verifier
transmis
en_examen
resolu
clos
```

---

# 26. TABLE `signalement_events`

Historique du signalement.

Champs :

```text
id
signalement_id
event_type
actor_id
details
created_at
```

Le signalement initial ne doit pas être réécrit silencieusement.

---

# 27. TABLE `audit_events`

Responsabilité :

journal technique/métier sensible.

Champs :

```text
id
actor_id
on_behalf_of?
entity_type
entity_id
action
metadata
request_id?
created_at
```

Audit obligatoire notamment pour :

- changement titulaire ;
- accord/révocation accès ;
- intervention ;
- document vérifié ;
- modification habilitation ;
- publication procédure ;
- traitement signalement.

---

# 28. AUTORISATIONS — PRINCIPES

Les permissions reposent sur :

```text
Identité
+
relation au Dossier
+
scope
+
statut
+
contexte
```

Pas uniquement sur :

```text
UserRole
```

---

# 29. MATRICE DE PERMISSIONS — TITULAIRE

Peut normalement :

- voir son Bien ;
- voir ses Dossiers ;
- inviter un accompagnateur ;
- demander un intervenant ;
- accorder/révoquer certains accès ;
- ajouter documents ;
- voir historique ;
- communiquer dans ses conversations ;
- créer un signalement.

Actions sensibles supplémentaires :

doivent éventuellement nécessiter confirmation renforcée selon leur nature.

---

# 30. MATRICE — ACCOMPAGNATEUR

Peut uniquement selon autorisation :

- voir informations nécessaires ;
- aider à saisir ;
- ajouter document ;
- enregistrer note vocale ;
- suivre certaines étapes.

Ne peut pas par défaut :

- modifier titulaire ;
- accorder des droits à d'autres ;
- conclure une opération ;
- voir tout le dossier ;
- valider à la place d'une autorité.

---

# 31. MATRICE — PROFESSIONNEL / SERVICE

Peut uniquement selon :

```text
habilitation
+
access_grant
+
scope
```

Exemples :

- voir résumé ;
- voir certains documents ;
- intervenir sur une étape ;
- ajouter une observation ;
- joindre un document ;
- confirmer son intervention.

---

# 32. MATRICE — TÉMOIN

Accès minimal.

Peut :

- consulter l'élément nécessaire ;
- fournir/valider son témoignage ;
- joindre une pièce autorisée.

Ne doit pas consulter l'ensemble du patrimoine du titulaire.

---

# 33. ADMINISTRATION

Les rôles administratifs doivent être séparés.

Exemples conceptuels :

```text
platform_admin
actor_verifier
procedure_editor
signalement_reviewer
support_agent
```

Éviter un unique `admin=true` donnant tous les pouvoirs.

---

# 34. RLS — RÈGLE PAR DÉFAUT

Politique :

```text
DENY BY DEFAULT
```

Une ligne n'est lisible/modifiable que si une policy l'autorise explicitement.

---

# 35. RLS `biens`

SELECT autorisé si :

- utilisateur possède/relation autorisée au Bien ;
- ou accès dérivé explicitement autorisé.

INSERT :

utilisateur authentifié selon règle produit.

UPDATE :

titulaire/représentant autorisé selon portée.

DELETE physique :

à éviter.

Préférer archivage/soft-delete selon cas.

---

# 36. RLS `dossiers`

SELECT :

- owner ;
- participant autorisé ;
- access_grant valide ;
- projection publique explicitement prévue.

UPDATE :

selon relation + permission.

Une route `/cas/:id` ne constitue jamais une autorisation.

---

# 37. RLS `documents`

SELECT :

nécessite accès au Dossier + scope documentaire approprié.

INSERT :

participant autorisé.

UPDATE verification status :

seulement acteur/backend autorisé.

DELETE :

règles strictes + audit.

---

# 38. RLS `dossier_interventions`

INSERT uniquement si :

- acteur participe au Dossier ;
- ou access grant autorise intervention ;
- et compétence/habilitation requise si applicable.

L'utilisateur ne doit pas pouvoir déclarer arbitrairement qu'un service officiel a validé une étape.

---

# 39. RLS `access_grants`

Seuls les utilisateurs autorisés peuvent accorder/révoquer.

Le bénéficiaire peut lire ses propres grants.

Il ne peut pas augmenter lui-même son scope.

---

# 40. RLS `signalements`

Auteur :

voit son signalement.

Personnes de traitement :

uniquement selon rôle/backend.

Personne signalée :

ne reçoit pas automatiquement accès à toutes les pièces.

Le workflow doit définir ce qui devient visible et quand.

---

# 41. FRONTEND — FEATURES

Frontend cible :

```text
features/
├── auth/
├── usage-profile/
├── orientation/
├── biens/
├── dossiers/
├── parcours/
├── acteurs/
├── accompagnement/
├── documents/
├── access/
├── communications/
├── signalements/
├── procedures/
└── sync/
```

Créer uniquement les features absentes.

---

# 42. APPLICATION LAYER

Workflows principaux :

```text
application/
├── orientation-flow/
├── dossier-creation/
├── dossier-parcours/
├── dossier-accompaniment/
├── actor-intervention/
├── signalement-flow/
└── offline-sync/
```

Cette couche orchestre plusieurs domaines.

---

# 43. REPOSITORIES

Chaque domaine data important expose une interface claire.

Exemples :

```text
BienRepository
DossierRepository
ActorRepository
DocumentRepository
ProcedureRepository
SignalementRepository
MessageRepository
```

L'UI ne connaît pas Supabase directement.

---

# 44. ADAPTERS

Architecture :

```text
Repository interface
       ↓
Supabase adapter
```

et pour offline :

```text
Repository
   ├── Local adapter
   └── Remote adapter
```

L'orchestrateur choisit comment synchroniser.

---

# 45. OFFLINE LOCAL DATABASE

Les données offline doivent utiliser une vraie persistence locale adaptée à la stack existante.

Ne pas utiliser `localStorage` pour :

- documents ;
- grandes données ;
- outbox critique ;
- historique complexe.

Réutiliser la technologie déjà présente.

Si aucune solution n'existe, la décision technique doit être validée avant ajout d'une dépendance majeure.

---

# 46. OUTBOX

Chaque opération offline possède conceptuellement :

```text
id
operation_type
entity_type
entity_id
payload
client_created_at
attempt_count
status
last_error?
```

Statuts :

```text
pending
syncing
synced
failed
conflict
```

---

# 47. OPÉRATIONS OFFLINE

Exemples :

```text
CREATE_DOSSIER
UPDATE_DOSSIER
ADD_DOCUMENT
ADD_INTERVENTION
SEND_MESSAGE
CREATE_SIGNALEMENT
UPDATE_PROFILE_PREFERENCES
```

Les opérations doivent être idempotentes.

---

# 48. STRATÉGIE DE CONFLIT

Toutes les données ne se résolvent pas de la même manière.

## Préférences utilisateur

Dernière version serveur/client selon stratégie contrôlée.

## Messages

Append-only.

## Audit

Append-only.

## Interventions

Append-only ou correction versionnée.

## Documents

Versionnement.

## Titulaire / permissions

Pas de résolution automatique dangereuse.

Conflit → intervention utilisateur/backend.

---

# 49. ÉVÉNEMENTS MÉTIER

Événements minimum :

```text
USER_PREFERENCES_UPDATED

BIEN_CREATED
RIGHT_HOLDER_ADDED

DOSSIER_CREATED
DOSSIER_STATUS_CHANGED

PARTICIPANT_INVITED
PARTICIPANT_ACCEPTED
PARTICIPANT_REVOKED

STEP_STARTED
STEP_COMPLETED
STEP_BLOCKED

INTERVENTION_RECORDED

DOCUMENT_ADDED
DOCUMENT_VERSION_ADDED
DOCUMENT_VERIFIED

ACCESS_REQUESTED
ACCESS_GRANTED
ACCESS_REVOKED

MESSAGE_SENT

SIGNALEMENT_CREATED
SIGNALEMENT_STATUS_CHANGED

ACTOR_VERIFIED
ACTOR_SUSPENDED

PROCEDURE_PUBLISHED

SYNC_COMPLETED
SYNC_FAILED
```

---

# 50. NOTIFICATIONS DÉRIVÉES

Les notifications doivent provenir d'événements métier.

Exemples :

```text
ACCESS_REQUESTED
→ notifier titulaire

ACCESS_GRANTED
→ notifier acteur

STEP_COMPLETED
→ calculer prochaine étape

DOCUMENT_REQUESTED
→ notifier participant concerné
```

Éviter la logique de notification dispersée dans les composants.

---

# 51. PARCOURS — MOTEUR

Le moteur reçoit :

```text
Dossier
Bien
Localisation
Documents
Participants
ProcedureDefinition
```

Il produit :

```text
étapes applicables
étape actuelle
éléments manquants
acteurs pertinents
prochaine action
```

---

# 52. LE MOTEUR NE DOIT PAS

Ne doit pas :

- modifier la base directement ;
- rendre l'UI ;
- contenir du code React ;
- considérer une recommandation comme validation juridique.

Il doit être déterministe et testable.

---

# 53. UI — HOME

Home utilise des selectors/application hooks.

Elle ne recalcule pas la logique métier dans JSX.

Sections selon profil :

```text
Action principale
Mes dossiers
Prochaine étape
Demandes
Synchronisation
```

---

# 54. UI — MODE ESSENTIEL

Maximum :

- une question principale ;
- une action primaire ;
- 3 à 5 choix ;
- texte court ;
- audio visible.

Éviter :

- tableaux ;
- filtres complexes ;
- jargon ;
- plusieurs CTA concurrents.

---

# 55. UI — MODE COMPLET

Peut présenter :

- timeline ;
- tableau documents ;
- participants ;
- audit ;
- permissions ;
- filtres ;
- historique détaillé.

Même data et mêmes permissions.

---

# 56. UI — DOSSIER COMPLET

Composants conceptuels :

```text
DossierHeader
NextActionCard
JourneyTimeline
ParticipantsPanel
DocumentsPanel
InterventionsPanel
AccessPanel
ConversationPanel
SignalementsPanel
AuditTimeline
SyncStatus
```

Ne créer ces composants que s'ils ne sont pas déjà présents sous une forme équivalente.

---

# 57. UI — PERSONNE INVITÉE

L'intervenant voit :

```text
Pourquoi suis-je ici ?
Qui demande mon aide ?
Sur quelle étape ?
Que dois-je faire ?
Quels éléments puis-je voir ?
```

Pas tout le Dossier.

---

# 58. UI — ACCOMPAGNATEUR

Toujours afficher clairement :

```text
Vous accompagnez :
Jeanne X

Votre rôle :
Accompagnateur

Vous n'êtes pas enregistré comme titulaire.
```

---

# 59. ORIENTATION → ROUTAGE

Résultat de l'orientation :

```text
visite
→ Home / découverte

creation_bien
→ création Bien/Dossier

succession
→ flow succession

achat
→ flow achat

signalement
→ flow signalement

accompagnement
→ flow invitation/accompagnement
```

Le routeur ne contient pas la logique métier de détection.

---

# 60. VALIDATION CLIENT / SERVEUR

Frontend :

- format ;
- champs requis ;
- UX ;
- feedback immédiat.

Backend :

- droits ;
- invariants ;
- intégrité ;
- transitions sensibles ;
- statuts protégés.

Une validation client ne remplace jamais la validation backend.

---

# 61. INVARIANTS MÉTIER

Exemples :

- un accompagnateur ne devient pas titulaire automatiquement ;
- un access grant ne peut pas dépasser les droits du grantor ;
- un acteur ne peut pas se déclarer vérifié lui-même ;
- une étape officielle ne peut pas être marquée validée par un rôle non autorisé ;
- un document officiel nécessite provenance appropriée ;
- un audit event sensible n'est pas supprimable par l'utilisateur courant ;
- un signalement ne réécrit pas l'intervention historique originale.

---

# 62. SOFT DELETE

Préférer archivage/révocation sur les données sensibles.

Exemples :

```text
dossier → archived_at
access_grant → revoked_at
actor credential → revoked/suspended
```

Éviter la suppression physique lorsque la traçabilité est nécessaire.

---

# 63. INDEXES

Prévoir notamment des index sur :

```text
dossiers.owner_id
dossiers.bien_id
dossier_participants.dossier_id
dossier_participants.person_id
dossier_steps.dossier_id
dossier_interventions.dossier_id
documents.dossier_id
access_requests.dossier_id
access_grants.dossier_id
messages.conversation_id
signalements.dossier_id
audit_events.entity_type + entity_id
```

Adapter aux requêtes réellement observées.

---

# 64. PAGINATION

Pagination obligatoire sur :

- messages ;
- audit events ;
- documents nombreux ;
- annuaire acteurs ;
- dossiers nombreux ;
- signalements administratifs.

Ne pas charger des milliers de lignes dans un écran mobile.

---

# 65. OBSERVABILITÉ

Capturer :

- erreurs synchronisation ;
- erreurs backend ;
- échec upload ;
- RLS denied anormaux ;
- temps de requête ;
- crash UI ;
- parcours bloqués techniquement.

Ne jamais logger inutilement le contenu sensible des documents.

---

# 66. TESTS DE PERMISSION CRITIQUES

Créer au minimum :

```text
Titulaire A ne voit pas dossier B.

Accompagnateur voit seulement scope accordé.

Acteur sans grant ne voit pas dossier privé.

Acteur avec grant expiré perd accès.

Utilisateur ne peut pas se déclarer acteur vérifié.

Utilisateur ne peut pas modifier audit event.

Un dossier public n'expose pas ses documents privés.

Un témoin ne voit que les éléments nécessaires.
```

---

# 67. E2E CRITIQUE — GRAND-MÈRE ACCOMPAGNÉE

Scénario :

```text
Jeanne crée/reçoit un dossier
↓
choisit Rural essentiel
↓
Paul devient accompagnateur
↓
Paul aide à saisir
↓
chaque action indique "pour Jeanne"
↓
document ajouté offline
↓
réseau revient
↓
synchronisation
↓
intervenant rural agit
↓
étape suivante proposée
```

Le test doit vérifier que Paul ne devient jamais titulaire.

---

# 68. E2E — PARCOURS TERRITORIAL

```text
Dossier créé
↓
étape rurale
↓
intervention enregistrée
↓
étape arrondissement
↓
service concerné
↓
étape suivante
↓
timeline complète
```

Chaque niveau conserve ses intervenants et actions.

---

# 69. E2E — SIGNALEMENT

```text
Utilisateur ouvre orientation
↓
"J'ai un problème"
↓
crée signalement
↓
référence intervention contestée
↓
ajoute pièce
↓
soumet
↓
historique original reste intact
↓
signalement suit son propre statut
```

---

# 70. ORDRE D'IMPLÉMENTATION BACKEND

Ne pas tout implémenter d'un coup.

Ordre conseillé :

### B1
Auth + Profiles + Usage Preferences

### B2
Biens + Right Holders

### B3
Dossiers + Participants

### B4
Procedure Definitions + Steps + Dossier Steps

### B5
Actors + Competences + Credentials

### B6
Documents + Storage + Versions

### B7
Access Requests + Grants

### B8
Interventions

### B9
Communications

### B10
Signalements

### B11
Audit Events

### B12
Offline Sync + Outbox

### B13
Notifications

### B14
Back-office + Governance

---

# 71. ORDRE FRONTEND ASSOCIÉ

Frontend doit suivre les besoins réels du backend.

```text
F1 Usage Profile
F2 Orientation
F3 Bien
F4 Dossier
F5 Parcours
F6 Accompagnement
F7 Acteurs
F8 Documents
F9 Accès
F10 Communications
F11 Signalements
F12 Offline
```

Ne pas créer des interfaces complètes sans backend correspondant si elles doivent être production-ready.

---

# 72. GATE DE VALIDATION ENTRE PHASES

Avant chaque phase suivante :

- build vert ;
- TypeScript vert ;
- migrations validées ;
- RLS testée ;
- aucune duplication ;
- aucune régression critique ;
- rapport des fichiers ;
- tests du domaine passent.

Si une gate échoue :

corriger avant de continuer.

---

# 73. PROMPT LOVABLE STANDARD À UTILISER ENSUITE

Pour chaque bloc d'implémentation :

`AUDIT FIRST — REUSE FIRST — DELTA ONLY — PRODUCTION ONLY.`

Puis :

1. scanne les fichiers et fonctions concernés ;
2. compare au Technical Implementation Matrix ;
3. conserve ce qui est conforme ;
4. modifie uniquement le delta ;
5. n'ajoute aucun mock ou code provisoire ;
6. garde les frontières frontend/backend ;
7. ajoute migrations/RLS/tests uniquement pour le domaine demandé ;
8. ne touche pas aux domaines suivants ;
9. build + TypeScript + tests ;
10. rapporte uniquement fichiers créés/modifiés et écarts restants.

Ne commence jamais automatiquement la phase suivante.

---

# 74. DEFINITION OF DONE GLOBALE

Le socle technique est considéré stable lorsque :

```text
User/Profile
✓

Usage Preferences
✓

Bien
✓

Dossier
✓

Participants
✓

Parcours
✓

Acteurs
✓

Documents
✓

Accès limité
✓

Interventions
✓

Communications
✓

Signalements
✓

Audit
✓

Offline/Sync
✓

RLS
✓

Tests
✓
```

---

# 75. RÉSULTAT ARCHITECTURAL

Architecture finale :

```text
                         ┌────────────────────┐
                         │      USER/PROFILE  │
                         └──────────┬─────────┘
                                    │
                          Usage Preferences
                                    │
                             Orientation
                                    │
                                    ▼
┌──────────┐              ┌──────────────────┐
│  ACTEURS │◄────────────►│       BIEN       │
└────┬─────┘              └────────┬─────────┘
     │                              │
     │                              ▼
     │                     ┌──────────────────┐
     └────────────────────►│     DOSSIER      │
                           └────────┬─────────┘
                                    │
            ┌───────────────────────┼────────────────────────┐
            │                       │                        │
            ▼                       ▼                        ▼
        PARCOURS                DOCUMENTS                PARTICIPANTS
            │                       │                        │
            ▼                       ▼                        ▼
      INTERVENTIONS             VERSIONS              ACCÈS/GRANTS
            │                                                │
            └────────────────────┬───────────────────────────┘
                                 ▼
                         COMMUNICATIONS
                                 │
                                 ▼
                         SIGNALEMENTS
                                 │
                                 ▼
                              AUDIT
                                 │
                                 ▼
                         OFFLINE / SYNC
                                 │
                                 ▼
                            SUPABASE
```

Cette architecture doit rester modulaire, auditable et compréhensible.

Le produit ne doit jamais perdre son objectif principal :

**rendre une démarche complexe compréhensible pour une personne ordinaire, tout en conservant suffisamment de structure et de traçabilité pour les professionnels et les services.**