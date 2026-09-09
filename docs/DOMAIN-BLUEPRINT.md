# VITALA-FONCIER-DOMAIN-BLUEPRINT.md

## 0. STATUT DU DOCUMENT

**Type :** Domain Blueprint  
**Rôle :** Source de vérité fonctionnelle et architecturale  
**Cible :** Production  
**Principe :** Audit First — Reuse First — Delta Only — Production Only

Ce document définit :

- les domaines métier ;
- les responsabilités ;
- les relations entre entités ;
- les rôles ;
- les permissions ;
- les parcours ;
- la chaîne de responsabilité ;
- la gestion des acteurs ;
- les signalements ;
- l'orientation conversationnelle ;
- les modes d'utilisation ;
- l'offline-first ;
- les frontières frontend/backend ;
- les exigences de sécurité ;
- les règles d'audit ;
- les principes UI/UX.

Toute évolution du produit doit respecter ce Blueprint.

---

# 1. VISION

L'application aide une personne à :

**comprendre → constituer → documenter → faire progresser → vérifier → protéger → transmettre**

un bien ou un dossier associé.

Elle doit particulièrement fonctionner pour :

- zones rurales ;
- réseau faible ou instable ;
- personnes peu habituées aux applications modernes ;
- utilisateurs préférant écouter plutôt que lire ;
- personnes accompagnées par un proche ;
- professionnels et services intervenant sur des dossiers ;
- personnes contestant une intervention antérieure.

L'application ne remplace pas les autorités, professionnels ou procédures légalement compétentes.

Elle facilite :

- compréhension ;
- organisation ;
- traçabilité ;
- orientation ;
- communication ;
- constitution documentaire ;
- suivi du parcours.

---

# 2. PROMESSE PRODUIT

La promesse centrale est :

> **Comprendre son bien, construire son dossier, savoir qui intervient et connaître sa prochaine étape.**

Le produit ne doit jamais promettre :

- propriété juridiquement garantie ;
- validation officielle sans autorité compétente ;
- authenticité automatique d'un document ;
- légalité automatique d'une situation.

---

# 3. LES 4 PILIERS DIFFÉRENCIANTS

## 3.1 Carnet du Bien

Chaque bien possède une histoire durable.

Il peut être lié à plusieurs dossiers successifs :

- acquisition ;
- succession ;
- protection ;
- régularisation ;
- partage ;
- transmission ;
- vente ;
- signalement.

---

## 3.2 Mode Accompagné

Une personne peut réaliser son parcours avec l'aide d'un tiers.

Exemple :

```text
Titulaire : Jeanne
Accompagnateur : Paul
```

Paul peut aider Jeanne.

Paul ne devient jamais automatiquement titulaire.

---

## 3.3 Chaîne de responsabilité

Chaque action importante doit pouvoir répondre à :

```text
Qui ?
A fait quoi ?
Pour qui ?
Avec quel rôle ?
À quelle étape ?
Quand ?
Avec quelle source ?
Avec quel niveau de vérification ?
```

---

## 3.4 Chaîne de parcours

Le dossier avance progressivement entre les différents niveaux nécessaires.

Conceptuellement :

```text
Local / Rural
      ↓
Arrondissement
      ↓
Département
      ↓
Région
      ↓
Niveau final compétent
```

Toutes les procédures ne doivent pas utiliser obligatoirement tous ces niveaux.

---

# 4. PRINCIPES D'ARCHITECTURE

## 4.1 Architecture modulaire

Le projet reste organisé par domaines métier.

Structure cible conceptuelle :

```text
src/
├── application/
├── components/
├── features/
│   ├── auth/
│   ├── usage-profile/
│   ├── orientation/
│   ├── biens/
│   ├── dossiers/
│   ├── parcours/
│   ├── acteurs/
│   ├── accompagnement/
│   ├── documents/
│   ├── signalements/
│   ├── communications/
│   ├── procedures/
│   └── sync/
├── shared/
├── services/
└── lib/
```

Cette structure n'est pas une obligation de déplacer tout le projet existant.

Si une architecture équivalente existe déjà :

**la conserver.**

---

# 5. FRONTIÈRES DE RESPONSABILITÉS

## `components/`

UI générique.

Autorisé :

- affichage ;
- animations ;
- état visuel local ;
- props ;
- callbacks.

Interdit :

- Supabase ;
- API métier ;
- accès direct aux données ;
- permissions ;
- calculs métier complexes.

---

## `features/`

Responsabilité métier locale à un domaine.

Une feature peut posséder :

```text
components/
hooks/
services/
selectors/
types/
```

uniquement si nécessaire.

---

## `application/`

Orchestration impliquant plusieurs domaines.

Exemples :

```text
Dossier + Parcours + Acteurs
Dossier + Accompagnement
Signalement + Dossier + Documents
Orientation + UsageProfile
```

---

## `shared/`

Uniquement éléments réellement transversaux :

- types génériques ;
- constants génériques ;
- utils purs.

Ne pas y placer :

- workflow Dossier ;
- permissions métier ;
- moteur de parcours ;
- règles Signalement.

---

## `services/` / `lib/`

Infrastructure :

- Supabase client ;
- stockage ;
- réseau ;
- configuration ;
- adapters ;
- observabilité.

---

# 6. FLUX ARCHITECTURAL

Flux normal :

```text
UI
 ↓
Hook / Application
 ↓
Service / Repository
 ↓
Backend ou stockage local
```

Jamais :

```text
Component
 ↓
supabase.from(...)
```

---

# 7. DOMAINE `BIEN`

Le Bien représente l'élément patrimonial durable.

Exemples :

- terrain ;
- parcelle ;
- maison ;
- propriété familiale ;
- autre type extensible.

Conceptuellement :

```text
Bien
├── id
├── titulaire(s)
├── localisation
├── type
├── description
├── origine déclarée
├── statut documentaire
├── created_at
└── dossiers[]
```

Un Bien ne représente pas une procédure.

---

# 8. DOMAINE `DOSSIER`

Un Dossier représente une démarche concernant un Bien.

Types principaux :

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
signalement_associé
autre
```

Conceptuellement :

```text
Dossier
├── id
├── bien_id
├── owner_id
├── type
├── visibilité
├── état
├── niveau_completude
├── participants
├── parcours
├── documents
├── communications
├── interventions
├── signalements
└── historique
```

---

# 9. CYCLE DE VIE DOSSIER

États possibles :

```text
brouillon
actif
en_attente
bloqué
à_vérifier
à_compléter
en_traitement
à_finaliser
clos
archivé
```

Ne pas réduire tout le domaine à :

```text
bonne / mauvaise
```

Ces valeurs peuvent exister historiquement dans le code, mais l'UI doit évoluer vers des états plus précis.

---

# 10. NIVEAU DE COMPLÉTUDE

Indicateurs produit possibles :

```text
Début du parcours
À compléter
À vérifier
Partiellement documenté
Bien documenté
Parcours avancé
À finaliser
```

La complétude n'est pas une garantie juridique.

---

# 11. DOMAINE `PERSONNES ET RESPONSABILITÉS`

Rôles fondamentaux :

```text
titulaire
ayant_droit
déclarant
accompagnateur
témoin
professionnel
service
autorité
```

Chaque relation avec un dossier doit être explicite.

---

# 12. MODE ACCOMPAGNÉ

Un accompagnateur peut :

- aider à remplir ;
- ajouter des éléments autorisés ;
- prendre des photos ;
- enregistrer une note vocale ;
- aider à comprendre ;
- accompagner physiquement ou numériquement.

Il ne peut pas automatiquement :

- devenir titulaire ;
- changer un titulaire ;
- autoriser une vente ;
- partager tout le dossier ;
- approuver une opération juridiquement sensible.

Toute action importante doit indiquer :

```text
Titulaire
Accompagné par
Action effectuée par
Pour le compte de
```

---

# 13. DOMAINE `ACTEUR`

Le modèle Acteur remplace progressivement le concept trop large d'Agent.

Catégories :

```text
accompagnateur
témoin
professionnel
autorité_locale
service_administratif
organisation
autre
```

Conceptuellement :

```text
Acteur
├── id
├── type
├── nom
├── localisation
├── zone
├── niveau_territorial
├── compétences[]
├── habilitations[]
├── statut_verification
├── disponibilité
└── contact
```

---

# 14. HABILITATION

Chaque acteur doit distinguer :

```text
compétence déclarée
compétence vérifiée
habilitation déclarée
habilitation vérifiée
```

Un professionnel ne peut pas devenir automatiquement :

```text
Vérifié / Agréé
```

par simple création de compte.

---

# 15. DOMAINE `PARCOURS`

Le Parcours représente la progression d'un Dossier.

Un parcours est composé d'étapes.

```text
Parcours
└── Étapes[]
```

Une définition de parcours dépend potentiellement de :

```text
type de dossier
type de bien
mode d'acquisition
zone
territoire
documents disponibles
situation
```

---

# 16. ÉTAPE DE PARCOURS

Conceptuellement :

```text
ParcoursEtape
├── id
├── dossier_id
├── ordre
├── niveau
├── titre
├── description
├── statut
├── acteur_attendu
├── compétence_attendue
├── documents_attendus
├── started_at
└── completed_at
```

États :

```text
à_faire
en_cours
terminée
bloquée
à_vérifier
```

---

# 17. INTERVENTION

Une intervention décrit ce qu'un Acteur a réellement effectué.

Conceptuellement :

```text
Intervention
├── id
├── dossier_id
├── etape_id
├── acteur_id
├── action
├── rôle
├── niveau
├── statut
├── commentaire
├── preuve_id
├── performed_at
└── verification_status
```

Actions possibles :

```text
déclaré
accompagné
constaté
témoigné
signé
vérifié
validé
enregistré
transmis
reçu
```

Ne jamais utiliser automatiquement :

```text
approuvé
```

pour toutes les interventions.

---

# 18. CHAÎNE VISUELLE DU DOSSIER

Exemple :

```text
✓ Niveau rural
  Jean N.
  Rôle : témoin
  Action : déclaration confirmée

✓ Arrondissement
  Service X
  Action : document traité

● Département
  En cours

○ Région
  Pas encore commencé
```

---

# 19. DOMAINE `DOCUMENTS`

Un document doit posséder une provenance.

Conceptuellement :

```text
Document
├── id
├── dossier_id
├── type
├── fichier
├── ajouté_par
├── fourni_par
├── source
├── statut
├── version
├── created_at
└── verified_at
```

Statuts :

```text
déclaré
fourni
à_vérifier
vérifié
officiel
rejeté
```

`officiel` ne peut être attribué que selon une règle backend/administrative appropriée.

---

# 20. VERSIONNEMENT DOCUMENTAIRE

Ne jamais écraser silencieusement une version importante.

Prévoir :

```text
Document
└── DocumentVersions[]
```

Permet de conserver :

- ancienne version ;
- nouvelle version ;
- auteur ;
- date ;
- raison.

---

# 21. DOMAINE `SIGNALEMENT`

Un Signalement est différent d'un Dossier normal.

Il permet de déclarer :

- une intervention contestée ;
- une action sans consentement ;
- un document contesté ;
- une étape mal exécutée selon l'utilisateur ;
- un traitement considéré comme injuste ;
- une modification suspectée.

L'application reste neutre.

---

# 22. LANGAGE DES SIGNALEMENTS

Interdit automatiquement :

```text
fraude
corruption
faux
coupable
voleur
```

Préférer :

```text
fait signalé
intervention contestée
déclaration utilisateur
élément à vérifier
document contesté
```

---

# 23. STRUCTURE SIGNALEMENT

Conceptuellement :

```text
Signalement
├── id
├── auteur_id
├── bien_id?
├── dossier_id?
├── etape_id?
├── intervention_id?
├── acteur_concerné?
├── description
├── période
├── documents[]
├── témoins[]
├── événements[]
├── résultat_attendu
├── statut
└── created_at
```

États :

```text
brouillon
à_documenter
à_vérifier
transmis
en_examen
résolu
clos
```

---

# 24. PARCOURS SIGNALEMENT

UX simple :

```text
Que s'est-il passé ?
       ↓
Qui était concerné ?
       ↓
Avez-vous un document, une photo ou un témoin ?
       ↓
Quelle étape pose problème ?
       ↓
Qui peut vous aider ?
       ↓
Suivi
```

---

# 25. DOMAINE `ORIENTATION`

L'orientation précède toute nouvelle démarche.

Objectif :

comprendre l'intention sans exposer l'utilisateur à un menu administratif complexe.

---

# 26. CONVERSATION INITIALE

Maximum 3 à 4 questions principales.

Exemple :

```text
Bonjour.
Je suis votre assistant.
Je vais vous accompagner pas à pas.
```

Question :

```text
Aujourd'hui, que voulez-vous faire ?
```

Choix :

```text
Regarder
J'ai un bien
Je veux acheter
Je veux protéger un bien
Je veux préparer une succession
Je veux transmettre / partager / vendre
J'ai un problème à signaler
Je veux aider quelqu'un
```

L'Assistant détermine ensuite le parcours approprié.

---

# 27. LANGAGE SIMPLE

Le produit doit privilégier :

- phrases courtes ;
- vocabulaire simple ;
- une question par écran ;
- 3 à 5 choix maximum ;
- audio ;
- illustrations/icônes ;
- bouton principal clairement identifiable.

Éviter le jargon administratif tant qu'il n'est pas nécessaire.

---

# 28. PROFIL D'UTILISATION

Ne jamais confondre :

```text
zone géographique
niveau d'alphabétisation
aisance numérique
besoin d'accompagnement
```

Préférences séparées :

```text
contexte = rural | urbain

assistance = autonome | assisté

interface = essentiel | standard | complet

audio = préféré | optionnel

accompagnement = seul | accompagné
```

---

# 29. MODES UX

## Rural essentiel

Pour utilisateur ayant besoin d'une expérience très guidée.

Caractéristiques :

- très peu de texte ;
- gros boutons ;
- audio prioritaire ;
- une action principale ;
- navigation étape par étape ;
- offline prioritaire.

---

## Rural autonome

Pour utilisateur rural à l'aise avec smartphone et lecture.

Caractéristiques :

- interface standard ;
- davantage d'informations ;
- audio disponible ;
- offline prioritaire.

---

## Moderne

Interface complète :

- tableaux ;
- filtres ;
- historique ;
- détails ;
- timeline avancée.

Le mode Moderne peut être utilisé en zone rurale.

---

# 30. NAVIGATION PRINCIPALE

Conserver :

```text
Accueil
Dossiers
+
Aide
Parcours
```

Routes :

```text
/home
/cas
/cas/nouveau
/aide
/procedure
```

La convention réelle du routeur doit être respectée.

---

# 31. HOME

Objectif principal :

```text
Que voulez-vous faire aujourd'hui ?
```

Actions :

- recevoir/hériter ;
- acheter ;
- protéger ;
- transmettre ;
- partager ;
- vendre ;
- signaler.

Afficher ensuite selon rôle et contexte :

- dossiers récents ;
- prochaine étape ;
- demandes reçues ;
- synchronisations en attente.

---

# 32. PAGE DOSSIERS

`/cas`

Afficher les dossiers.

Filtres possibles :

```text
type
visibilité
étape
complétude
localisation
```

Les filtres avancés peuvent être masqués en mode essentiel.

---

# 33. CRÉATION DOSSIER

`/cas/nouveau`

Flow :

```text
Orientation
   ↓
Objectif
   ↓
Bien
   ↓
Origine / acquisition
   ↓
Titulaire
   ↓
Accompagnateur éventuel
   ↓
Documents disponibles
   ↓
Localisation
   ↓
Parcours recommandé
   ↓
Résumé
   ↓
Création
```

Le nombre réel d'écrans peut varier selon les réponses.

---

# 34. DÉTAIL DOSSIER

Le détail complet contient :

1. Bien concerné
2. Titulaire
3. Participants
4. Parcours
5. Documents
6. Personnes/services impliqués
7. Interventions
8. Demandes d'accès/intervention
9. Communications
10. Signalements
11. Historique
12. Prochaine étape

En mode essentiel :

ne jamais afficher les douze blocs simultanément.

Afficher :

```text
Tu es ici
↓
Ce qui est terminé
↓
Ce qui manque
↓
Qui peut t'aider maintenant
```

---

# 35. PAGE PARCOURS / ANNUAIRE

`/procedure`

Organiser selon les niveaux réellement applicables :

```text
Rural
Arrondissement
Département
Région
Autre niveau compétent
```

Filtres :

- zone ;
- compétence ;
- type de dossier ;
- service.

Les données doivent provenir d'un seul référentiel Acteurs.

---

# 36. DEMANDE D'ACCÈS

Remplacer l'idée d'adhésion totale au dossier.

Une demande d'accès précise :

```text
acteur
dossier
objectif
portée
durée
statut
```

Portées possibles :

```text
voir_résumé
voir_documents_sélectionnés
ajouter_document
accompagner
intervenir
```

---

# 37. AUTORISATION

Conceptuellement :

```text
AccessGrant
├── dossier_id
├── actor_id
├── scope[]
├── granted_by
├── granted_at
├── expires_at
└── revoked_at
```

Le frontend ne constitue jamais la frontière de sécurité.

---

# 38. COMMUNICATION

Pas de chat libre global.

Une conversation appartient à :

```text
dossier
étape
demande d'intervention
signalement
```

Messages supportés :

- texte ;
- audio ;
- pièce jointe ;
- message système.

---

# 39. AUDIT TRAIL

Toute action sensible produit un événement.

Conceptuellement :

```text
AuditEvent
├── id
├── actor_id
├── on_behalf_of?
├── entity_type
├── entity_id
├── action
├── metadata
├── created_at
└── source
```

Historique exemple :

```text
12 août
Document ajouté
Par : Paul
Pour : Jeanne
Rôle : accompagnateur

14 août
Déclaration confirmée
Par : Jean
Rôle : témoin

20 août
Document traité
Par : Service X
Niveau : arrondissement
```

---

# 40. OFFLINE-FIRST

Le produit doit continuer à fonctionner avec réseau faible ou absent.

Disponibles offline selon droits :

- shell application ;
- profil ;
- dossiers récents ;
- dossier actif ;
- parcours déjà chargé ;
- documents locaux ;
- photos ;
- notes vocales ;
- formulaires ;
- acteurs nécessaires déjà synchronisés.

---

# 41. OUTBOX

Toute écriture offline passe par une Outbox.

Conceptuellement :

```text
UI
 ↓
Application
 ↓
Repository
 ↓
Local DB
 ↓
Outbox
 ↓ reconnexion
Sync
 ↓
Backend
```

---

# 42. ÉTATS DE SYNCHRONISATION

Afficher clairement :

```text
Sur cet appareil
En attente d'envoi
Synchronisation
Synchronisé
Erreur
Conflit
```

Ne jamais afficher :

```text
Envoyé
```

avant confirmation serveur.

---

# 43. SYNCHRONISATION

Exigences :

- identifiants stables ;
- opérations idempotentes ;
- protection contre doublons ;
- reprise après interruption ;
- gestion de conflit ;
- timestamps serveur ;
- version des entités.

---

# 44. AUDIO

Audio utilisable pour :

- écouter les explications ;
- enregistrer une réponse ;
- envoyer une note vocale ;
- écouter une prochaine étape.

La transcription :

- peut exister ;
- ne doit jamais être obligatoire ;
- ne doit pas bloquer un parcours offline.

---

# 45. BACKEND

Backend cible :

```text
Supabase
├── PostgreSQL
├── Auth
├── Storage
├── RLS
└── Edge Functions si nécessaire
```

---

# 46. FRONTEND VS BACKEND

Frontend :

- affichage ;
- interaction ;
- validation ergonomique ;
- cache ;
- offline ;
- orchestration client ;
- adaptation UX.

Backend :

- autorisations ;
- intégrité ;
- validation sensible ;
- persistance officielle ;
- audit ;
- contrôle des accès ;
- règles de sécurité ;
- fonctions privilégiées.

---

# 47. SÉCURITÉ

Principes :

- deny by default ;
- least privilege ;
- RLS ;
- accès par portée ;
- aucun secret frontend ;
- buckets privés pour documents sensibles ;
- signed URLs si nécessaire ;
- vérification des rôles côté backend ;
- journalisation des actions sensibles.

---

# 48. RLS — PRINCIPES

Un utilisateur voit :

- ses propres biens ;
- ses propres dossiers ;
- dossiers auxquels un accès lui a été accordé ;
- données explicitement publiques.

Un accompagnateur voit :

- uniquement la portée autorisée.

Un professionnel/service voit :

- uniquement les dossiers/interventions autorisés.

Un utilisateur public ne peut jamais obtenir un dossier privé en changeant simplement un ID dans l'URL.

---

# 49. KNOWLEDGE / PROCÉDURES

Les parcours administratifs ne doivent pas être figés dans un énorme fichier de constantes.

Créer un système versionnable.

Conceptuellement :

```text
ProcedureDefinition
├── type
├── territoire
├── version
├── source
├── status
├── valid_from
├── verified_at
└── steps[]
```

---

# 50. STATUT DES PROCÉDURES

Statuts possibles :

```text
draft
à_vérifier
validée
publiée
archivée
```

Une procédure officielle doit indiquer sa source et sa date de validation.

---

# 51. SOURCE DE VÉRITÉ

Une seule source de vérité par domaine.

Exemples :

```text
Bien → repository Bien
Dossier → repository Dossier
Acteur → repository Acteur
Parcours → moteur Parcours
User → Auth/Profile
```

Interdit :

- tableau Agent différent dans `/procedure` ;
- deuxième liste d'agents dans Assistant ;
- copies locales non synchronisées devenant indépendantes.

---

# 52. EVENTS MÉTIER

Événements importants :

```text
BienCreated
DossierCreated
ParticipantAdded
AccessRequested
AccessGranted
AccessRevoked
DocumentAdded
DocumentVerified
StepStarted
StepCompleted
InterventionRecorded
SignalementCreated
SignalementUpdated
MessageSent
SyncCompleted
SyncFailed
```

Ces événements peuvent servir à :

- audit ;
- notifications ;
- synchronisation ;
- analytics ;
- historique.

---

# 53. NOTIFICATIONS

Notifications pertinentes :

- demande d'accès reçue ;
- accès accordé/refusé ;
- intervention demandée ;
- document demandé ;
- prochaine étape disponible ;
- dossier bloqué ;
- synchronisation terminée ;
- message reçu.

Éviter les notifications inutiles.

---

# 54. MODALS / SHEETS / DRAWERS

Utiliser pour :

- choisir accompagnateur ;
- choisir acteur ;
- demander intervention ;
- demander accès ;
- ajouter document ;
- écouter explication ;
- afficher détails acteur ;
- confirmer action sensible ;
- synchronisation.

Ne pas créer une page dédiée si un composant contextuel suffit.

---

# 55. PAGE PROFIL / PARAMÈTRES

Doit permettre :

- informations utilisateur ;
- profil d'usage ;
- mode interface ;
- audio ;
- préférences de langue ;
- contexte rural/urbain ;
- accompagnement ;
- sécurité ;
- appareils/sessions si prévu ;
- gestion des autorisations.

---

# 56. ACCESSIBILITÉ

Exigences :

- grandes zones tactiles ;
- contraste ;
- labels ;
- lecteur écran ;
- navigation clavier ;
- texte simple ;
- audio ;
- icon + label ;
- erreurs compréhensibles.

---

# 57. DESIGN SYSTEM

Le Design System existant est la source de vérité.

Ne pas reconstruire :

- couleurs ;
- typography ;
- radius ;
- shadows ;
- spacing ;
- Tailwind ;
- shadcn.

Ajouter seulement les composants manquants dans le même langage visuel.

---

# 58. PERFORMANCE

Priorités :

- mobile-first ;
- bundle contrôlé ;
- lazy loading ;
- requêtes ciblées ;
- pagination ;
- compression images ;
- cache intelligent ;
- faible consommation réseau ;
- skeletons raisonnables ;
- fonctionnement réseau lent.

---

# 59. IMAGES ET DOCUMENTS

Avant upload :

- compression adaptée ;
- conservation de lisibilité ;
- métadonnées nécessaires ;
- taille contrôlée.

Ne jamais détériorer un document au point de le rendre inutilisable.

---

# 60. TESTS PRODUCTION

Minimum :

## Unit

- règles métier ;
- selectors ;
- permissions ;
- moteur parcours ;
- synchronisation.

## Integration

- repositories ;
- Supabase ;
- Storage ;
- Auth.

## RLS

Scénarios d'accès autorisé/interdit.

## E2E

1. première visite ;
2. Rural essentiel ;
3. création Bien ;
4. création Dossier ;
5. ajout accompagnateur ;
6. création offline ;
7. synchronisation ;
8. demande d'intervention ;
9. accès privé limité ;
10. signalement ;
11. consultation historique.

---

# 61. BACK-OFFICE

Back-office réservé aux rôles appropriés.

Fonctions :

- validation Acteurs ;
- gestion habilitations ;
- correction annuaire ;
- procédures ;
- versions ;
- sources ;
- signalements ;
- audit ;
- suspension d'acteurs ;
- modération nécessaire.

---

# 62. GOUVERNANCE DES ACTEURS

Un Acteur peut avoir :

```text
Non vérifié
Vérification en cours
Vérifié
Suspendu
Révoqué
```

Chaque changement est audité.

---

# 63. GOUVERNANCE DES PROCÉDURES

Une procédure possède :

```text
auteur
source
validateur
date
version
territoire
statut
```

Une nouvelle version ne détruit pas l'ancienne.

---

# 64. ANALYTICS

Analytics uniquement si respect de la confidentialité.

Mesures utiles :

- abandon parcours ;
- étapes bloquantes ;
- réseau/offline ;
- taux synchronisation ;
- besoins d'accompagnement ;
- temps moyen de progression ;
- zones manquant de services.

Ne pas exposer les données patrimoniales privées dans des dashboards non autorisés.

---

# 65. RÈGLE LOVABLE PERMANENTE

Pour toute implémentation future :

```text
AUDIT FIRST
REUSE FIRST
DELTA ONLY
PRODUCTION ONLY
```

Lovable doit :

1. scanner la zone concernée ;
2. identifier l'existant ;
3. comparer avec le Blueprint ;
4. réutiliser ;
5. modifier uniquement le delta ;
6. tester ;
7. rapporter les fichiers modifiés.

---

# 66. INTERDICTION DE CODE PROVISOIRE

Pour les phases production :

Interdit :

- mock métier persistant ;
- données hardcodées présentées comme production ;
- TODO important ;
- faux service ;
- API fictive ;
- `as any` pour contourner les types ;
- logique critique commentée ;
- duplications temporaires non supprimées.

---

# 67. CRITÈRES DE FIN

Le système peut être considéré production-ready lorsque :

- Auth fonctionne ;
- RLS testée ;
- Bien/Dossier stables ;
- rôles clairs ;
- accès limité ;
- parcours versionnés ;
- documents traçables ;
- accompagnement sécurisé ;
- acteurs vérifiables ;
- signalements séparés ;
- audit complet ;
- offline stable ;
- synchronisation robuste ;
- UI adaptée aux trois modes ;
- Design System intact ;
- tests critiques passent ;
- aucun secret frontend ;
- build production réussi.

---

# 68. RÉSUMÉ DU DOMAINE

Architecture métier finale :

```text
Utilisateur
   │
   ├── Profil d'usage
   │
   ├── Orientation
   │
   ▼
Bien
   │
   ├── Titulaire(s)
   ├── Accompagnateur(s)
   │
   ▼
Dossier
   │
   ├── Participants
   ├── Parcours
   │     ├── Étapes
   │     └── Interventions
   │
   ├── Documents
   ├── Acteurs / Services
   ├── Accès
   ├── Communications
   ├── Signalements
   └── Audit
         │
         ▼
Offline / Sync
         │
         ▼
Supabase sécurisé
```

---

# 69. PRINCIPE UX FINAL

Un utilisateur expérimenté peut voir :

- toutes les étapes ;
- personnes ;
- documents ;
- permissions ;
- historique ;
- services ;
- détails techniques.

Une personne en mode Rural essentiel doit pouvoir voir simplement :

```text
Voici votre dossier.

✓ Vous avez déjà fait ceci.

→ Maintenant, faites ceci.

👤 Cette personne peut vous aider.

🔊 Écouter l'explication.
```

Même backend.

Même dossier.

Même sécurité.

**Seule la complexité présentée à l'utilisateur change.**

---

# 70. PRINCIPE FINAL DU PRODUIT

Le système doit permettre à une personne de pouvoir dire :

> Voici mon bien.

> Voici comment je l'ai obtenu ou reçu.

> Voici les personnes qui m'ont accompagné.

> Voici les documents que j'ai fournis.

> Voici ceux qui restent à vérifier.

> Voici les personnes et services intervenus.

> Voici ce que chacun a réellement fait.

> Voici où mon dossier se trouve aujourd'hui.

> Voici ma prochaine étape.

> Et voici l'historique qui permet de comprendre comment nous sommes arrivés ici.