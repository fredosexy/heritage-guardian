# APPLICATION FONCIÈRE RURALE — PROMPTS LOVABLE DE LA FONDATION À LA PRODUCTION

---

# RÈGLES PERMANENTES — À DONNER UNE SEULE FOIS À LOVABLE

Ces règles s'appliquent à toutes les phases suivantes.

## MODE DE TRAVAIL

Le projet existe déjà.

Pour chaque phase :

1. **AUDIT FIRST** — inspecte réellement le code concerné.
2. **COMPARE** — compare l'existant aux exigences de la phase.
3. **DELTA ONLY** — implémente uniquement ce qui manque ou doit être corrigé.
4. **REUSE FIRST** — réutilise les composants, hooks, services, types, stores et routes existants.
5. **VALIDATE** — build, TypeScript, imports, routes et régressions.

INTERDIT :

- refaire l'application ;
- créer une architecture parallèle ;
- dupliquer une feature existante ;
- dupliquer un type avec un autre nom ;
- recréer une page déjà présente ;
- créer un deuxième store pour la même donnée ;
- mettre des mocks dans le code production ;
- laisser des TODO, pseudo-code ou services provisoires ;
- ajouter une dépendance si l'existant permet déjà de faire le travail ;
- modifier le Design System existant.

Si une modification structurelle hors périmètre est indispensable, STOP et indique seulement :

- pourquoi ;
- fichiers concernés ;
- impact.

Ne l'effectue pas sans validation.

---

# STACK À CONSERVER

Utilise la stack réellement présente.

Priorité si déjà installée :

- React + TypeScript ;
- router actuel ;
- Tailwind ;
- shadcn/ui ;
- Supabase ;
- système PWA/service-worker actuel.

Ne remplace aucune technologie fonctionnelle pour satisfaire une préférence théorique.

Backend :

- Supabase/PostgreSQL ;
- Supabase Auth ;
- Storage ;
- RLS ;
- Edge Functions uniquement pour logique serveur nécessitant une frontière sécurisée.

Frontend :

- UI ;
- interactions ;
- orchestration frontend ;
- cache/offline ;
- validation client ;
- adaptation au profil d'utilisation.

Ne jamais mettre :

- clés secrètes ;
- logique d'autorisation réelle ;
- validation de sécurité critique ;

dans le frontend.

---

# FRONTIÈRES DE CODE

Utiliser l'architecture existante lorsqu'elle est équivalente.

Sinon appliquer progressivement :

```text
src/
├── components/       # UI générique
├── features/         # domaines
├── application/      # orchestration multi-domaines
├── shared/           # types/constants/utils réellement transversaux
├── services/         # infrastructure partagée
└── lib/              # clients/config/infrastructure
```

Une feature possède ses propres :

```text
components/
hooks/
services/
types/
selectors/
```

seulement lorsqu'ils sont nécessaires.

`components` :

- UI ;
- props in ;
- events out ;
- état visuel local autorisé.

Pas :

- appels Supabase ;
- fetch métier ;
- règles métier complexes ;
- accès direct aux mocks/data stores.

Flux :

```text
UI
 ↓
hook / application
 ↓
service / repository
 ↓
backend ou stockage local
```

`shared` ne doit jamais devenir un fourre-tout métier.

`packages/shared` est utilisé seulement si le projet est réellement un monorepo et possède déjà ce package.

---

# PRINCIPES PRODUIT PERMANENTS

Le produit aide à :

**comprendre → documenter → vérifier → protéger → transmettre / partager / vendre**

Il ne prétend jamais garantir juridiquement la propriété.

Différencier toujours :

- information déclarée ;
- document fourni ;
- information à vérifier ;
- information vérifiée ;
- source officielle.

Ne jamais transformer automatiquement une photo, une déclaration ou un badge frontend en preuve officielle.

Chaque action importante doit pouvoir identifier :

```text
qui a agi
pour qui
avec quel rôle
sur quelle étape
à quelle date
avec quelle source
avec quel niveau de vérification
```

---

# PHASE 0 — AUDIT ET CARTOGRAPHIE DES FONDATIONS

PROMPT :

Analyse le projet complet sans modifier le code.

Inspecte :

- architecture ;
- router ;
- BottomNav ;
- Design System ;
- auth ;
- stores ;
- Supabase ;
- PWA/offline ;
- pages ;
- features ;
- hooks ;
- services ;
- shared/packages ;
- types ;
- modèles Dossier/Agent/User ;
- Assistant ;
- onboarding ;
- profil ;
- documents ;
- procédures.

Identifie :

1. ce qui existe et doit être conservé ;
2. ce qui existe mais doit être adapté ;
3. ce qui manque ;
4. les duplications éventuelles ;
5. les dépendances circulaires ;
6. les violations UI/data ;
7. l'architecture réellement utilisée.

Ne crée aucun fichier.

Livre uniquement une cartographie concise avec :
- chemins réels ;
- fonctionnalités trouvées ;
- écarts avec les règles permanentes ;
- ordre minimal des corrections.

---

# PHASE 1 — CONSOLIDATION ARCHITECTURALE

PROMPT :

Applique les règles permanentes.

À partir de l'audit Phase 0, corrige uniquement les frontières réellement nécessaires.

Domaines cibles :

```text
usage-profile
orientation
biens
dossiers
parcours
acteurs
accompagnement
documents
signalements
communications
auth
```

Créer `src/application/` uniquement si l'orchestration multi-feature n'a pas déjà d'emplacement approprié.

Ne déplace pas massivement l'ancien code.

Corrige seulement :

- logique métier dans UI ;
- accès data direct depuis composants ;
- types dupliqués ;
- services dupliqués ;
- mauvaises dépendances entre features ;
- sources de vérité multiples.

Ne change aucune UI visuellement pendant cette phase.

Build et TypeScript obligatoires.

---

# PHASE 2 — BACKEND ET MODÈLE DE DONNÉES PRODUCTION

PROMPT :

Audite d'abord Supabase et les migrations existantes.

Ne recrée aucune table équivalente.

Complète proprement le modèle production pour couvrir au minimum :

```text
profiles
usage_preferences

biens
dossiers

dossier_participants
dossier_steps
dossier_interventions

documents
document_versions

acteurs
actor_credentials
actor_competences

access_requests
access_grants

signalements
signalement_events

conversations
messages

procedure_definitions
procedure_versions
procedure_steps

audit_events
```

Relations importantes :

```text
Bien
 └── plusieurs Dossiers

Dossier
 ├── Titulaire
 ├── Participants
 ├── Étapes
 ├── Interventions
 ├── Documents
 ├── Signalements
 └── Communications
```

Implémente :

- migrations versionnées ;
- contraintes ;
- index ;
- timestamps ;
- intégrité référentielle ;
- types Supabase générés ;
- Storage pour documents/médias.

RLS obligatoire :

- propriétaire : accès à ses données ;
- accompagnateur : uniquement portée autorisée ;
- professionnel/service : uniquement dossiers et éléments autorisés ;
- public : uniquement projection réellement publique ;
- aucune donnée privée exposée par simple filtre frontend.

Les opérations sensibles et auditables doivent être protégées côté serveur.

Aucune règle de sécurité critique uniquement dans React.

---

# PHASE 3 — PROFIL D'USAGE + ORIENTATION CONVERSATIONNELLE

PROMPT :

Audite onboarding, profil, Home et Assistant existants.

Ajoute uniquement ce qui manque.

Séparer les préférences suivantes :

```text
contexte : rural | urbain
assistance : autonome | assiste
interface : essentiel | standard | complet
audio : prefere | optionnel
accompagnement : seul | accompagne
```

Ne jamais supposer :

`rural = ne sait pas lire`.

Créer trois presets UX :

### Rural essentiel
- gros boutons ;
- peu de texte ;
- audio prioritaire ;
- une action principale ;
- offline prioritaire.

### Rural autonome
- interface standard ;
- audio disponible ;
- informations plus riches ;
- offline prioritaire.

### Moderne
- interface complète ;
- filtres/détails avancés ;
- fonctionne aussi en zone rurale.

Permettre de modifier ces préférences dans Profil > Paramètres.

---

## ORIENTATION

Avant toute nouvelle démarche, utiliser une conversation de 3 à 4 questions maximum.

Début :

`Bonjour {nom}` si connu.

`Je suis votre assistant. Je vais vous accompagner pas à pas.`

Question principale :

`Aujourd'hui, que voulez-vous faire ?`

Choix :

- regarder ;
- enregistrer/préparer un bien ;
- acheter ;
- protéger ;
- préparer une succession ;
- transmettre/partager/vendre ;
- signaler un problème ;
- accompagner quelqu'un.

Puis demander seulement ce qui est nécessaire pour identifier :

- intention ;
- bien concerné ;
- titulaire ou accompagnateur ;
- besoin d'aide.

Ensuite afficher :

`Voici le parcours qui correspond à votre situation.`

Une seule action principale.

Ne duplique pas cet Assistant dans chaque feature.

---

# PHASE 4 — BIEN, DOSSIER ET CHAÎNE DE RESPONSABILITÉ

PROMPT :

Audite les modèles Dossier/User/Agent/Documents existants.

Introduis sans casser l'existant :

## Bien

Le `Bien` représente l'élément patrimonial durable.

## Dossier

Le `Dossier` représente une démarche concernant ce bien.

Types possibles :

- acquisition ;
- succession/héritage ;
- protection/régularisation ;
- partage ;
- transmission ;
- vente ;
- achat ;
- autre démarche autorisée.

Un Bien peut posséder plusieurs Dossiers.

---

## RESPONSABILITÉS

Distinguer :

- titulaire ;
- ayant droit ;
- déclarant ;
- accompagnateur ;
- témoin ;
- professionnel ;
- service ;
- autorité.

Un accompagnateur n'est jamais automatiquement titulaire.

Toute intervention doit conserver :

```text
performed_by
on_behalf_of
role
action
territorial_level
source
verification_status
created_at
```

---

## MODE ACCOMPAGNÉ

Permettre :

```text
Titulaire
 ↓ autorise
Accompagnateur
 ↓ aide
Dossier
```

L'accompagnateur peut effectuer uniquement les actions autorisées.

Pour une action sensible, rappeler clairement :

```text
Titulaire : X
Accompagné par : Y
Action réalisée par : Y
Pour le compte de : X
```

Aucune modification silencieuse de titulaire.

---

# PHASE 5 — PARCOURS SIMPLE + CHAÎNE D'INTERVENTIONS

PROMPT :

Construis le moteur de parcours sans coder les procédures directement dans les composants.

Chaque type de dossier possède une définition versionnée contenant :

- étapes ;
- ordre ;
- niveau territorial ;
- documents attendus ;
- compétences/acteurs nécessaires ;
- conditions ;
- sources ;
- date/version de validation.

Ne considère une procédure comme officielle que si sa source est réellement validée.

---

## CHAÎNE TERRITORIALE

Supporter selon la procédure :

```text
Local / rural
 ↓
Arrondissement
 ↓
Département
 ↓
Région
 ↓
Niveau final compétent
```

Toutes les procédures ne doivent pas obligatoirement utiliser tous les niveaux.

Chaque étape possède :

```text
a_faire
en_cours
terminee
bloquee
a_verifier
```

---

## UX TITULAIRE

En mode essentiel afficher uniquement :

```text
Tu es ici
↓
Ce qui est terminé
↓
Ce qu'il reste
↓
Qui peut t'aider maintenant
```

Une action principale.

---

## VUE COMPLÈTE DU DOSSIER

Afficher une timeline :

```text
✓ Niveau rural
  Acteur X
  Action : ...

✓ Arrondissement
  Service Y
  Action : ...

● Département
  En cours

○ Étape suivante
```

Chaque intervenant affiche :

- rôle ;
- niveau territorial ;
- compétence ;
- habilitation/vérification ;
- action réalisée ;
- statut.

Ne pas écrire `approuvé` lorsque l'acteur a seulement témoigné, accompagné ou transmis.

---

## COMPLÉTUDE

Créer un indicateur de dossier :

- début du parcours ;
- à compléter ;
- à vérifier ;
- bien documenté ;
- parcours avancé ;
- à finaliser.

Ne jamais afficher `propriété garantie`.

---

# PHASE 6 — ACTEURS, SERVICES, ACCÈS ET COMMUNICATION

PROMPT :

Audite Agent, Procedure et demandes d'adhésion existants.

Remplace progressivement le modèle trop générique `Agent` par un référentiel `Acteur` lorsque nécessaire.

Catégories :

- accompagnateur ;
- témoin ;
- professionnel ;
- autorité locale ;
- service administratif ;
- autre acteur autorisé.

Chaque acteur possède :

- identité/service ;
- zone ;
- niveau territorial ;
- compétences ;
- habilitations ;
- statut de vérification ;
- disponibilité ;
- informations de contact validées.

Un seul référentiel Acteurs doit alimenter :
- `/procedure` ;
- dossiers ;
- recherche d'intervenants ;
- parcours.

Pas de copies différentes du même service.

---

## ACCÈS PRIVÉ

Utiliser :

`Demande d'accès` ou `Demande d'intervention`

et non une adhésion totale au dossier.

Un accès possède :

- objectif ;
- portée ;
- durée éventuelle ;
- statut.

Portées possibles :

- voir résumé ;
- voir documents sélectionnés ;
- ajouter un document ;
- accompagner ;
- intervenir professionnellement.

Le backend/RLS doit faire respecter cette portée.

---

## COMMUNICATION

Pas de chat libre global.

Chaque conversation est rattachée à :

- un dossier ;
- une étape ;
- une demande d'intervention.

Support :

- texte ;
- note vocale ;
- pièce jointe ;
- statut envoi/synchronisation.

---

# PHASE 7 — DOSSIERS DE SIGNALEMENT / CONTESTATION

PROMPT :

Créer un domaine `signalements` distinct du parcours normal.

Un signalement peut concerner :

- une intervention contestée ;
- une étape mal traitée ;
- une action sans accord ;
- un document contesté ;
- une décision ou intervention de service que l'utilisateur souhaite faire examiner.

Ne jamais conclure automatiquement :

- fraude ;
- corruption ;
- faux ;
- culpabilité.

Utiliser :

- fait signalé ;
- intervention contestée ;
- déclaration utilisateur ;
- élément à vérifier ;
- document fourni.

Workflow simple :

```text
Que s'est-il passé ?
 ↓
Qui était concerné ?
 ↓
Quelles pièces ou témoins ?
 ↓
Quelle étape est contestée ?
 ↓
Qui peut examiner/aider ?
 ↓
Suivi
```

Un signalement peut référencer :

- Bien ;
- Dossier ;
- Étape ;
- Intervention ;
- Acteur ;
- Documents.

Conserver toutes les versions et traces.

Ne modifier jamais silencieusement l'historique initial.

---

# PHASE 8 — UI/UX PRODUCTION COMPLÈTE

PROMPT :

Audite toutes les routes avant création.

Garde la BottomNav existante :

```text
Accueil
Dossiers
+
Aide
Parcours
```

Routes existantes à conserver :

```text
/home
/cas
/cas/nouveau
/aide
/procedure
```

Utilise la convention dynamique réelle du router pour le détail dossier.

---

## HOME

Adapter au profil d'usage et au rôle.

Afficher prioritairement :

`Que voulez-vous faire aujourd'hui ?`

Actions :

- recevoir/hériter ;
- acheter ;
- protéger ;
- transmettre/partager/vendre ;
- signaler un problème.

Puis :

- Mes dossiers ;
- prochaine action ;
- demandes/interventions ;
- synchronisations en attente.

---

## `/cas`

Liste des dossiers.

Filtres uniquement lorsque le mode UI le permet :

- type ;
- privé/public ;
- étape ;
- état de complétude.

---

## `/cas/nouveau`

La conversation d'orientation précède le Wizard.

Le Wizard pose uniquement les questions nécessaires au parcours choisi.

Toujours permettre :

- écouter ;
- répondre simplement ;
- être accompagné ;
- revenir en arrière.

---

## DÉTAIL DOSSIER

Sections :

1. Bien concerné
2. Titulaire
3. Accompagnateur
4. Parcours
5. Documents/preuves
6. Personnes et services impliqués
7. Demandes/interventions
8. Communications
9. Historique
10. Prochaine étape

En mode essentiel, ne pas afficher les dix sections simultanément.

Transformer cela en parcours guidé.

---

## `/procedure`

Annuaire territorial :

```text
Rural
→ Arrondissement
→ Département
→ Région
→ niveau compétent
```

Avec filtres par :
- zone ;
- compétence ;
- type de démarche.

---

## MODALS / SHEETS / DRAWERS

Réutiliser shadcn existant pour :

- choisir accompagnateur ;
- demander intervention ;
- demander accès ;
- ajouter document ;
- écouter explication ;
- afficher acteur ;
- confirmer action sensible ;
- état synchronisation.

Ne crée pas une page entière lorsqu'un Sheet/Drawer suffit.

Ne change pas le Design System.

---

# PHASE 9 — OFFLINE-FIRST ET RÉSEAU FAIBLE

PROMPT :

Audite d'abord PWA, service worker, cache et stockage local existants.

Réutilise la solution actuelle.

Objectif :

une démarche doit pouvoir continuer sans réseau.

Disponibles offline :

- shell application ;
- profil d'usage ;
- dossiers récents autorisés ;
- dossier en cours ;
- parcours déjà chargé ;
- acteurs utiles déjà chargés ;
- formulaires ;
- documents/photos en attente ;
- notes vocales ;
- historique local nécessaire.

Utiliser une architecture Outbox production.

Flux :

```text
UI
 ↓
application/repository
 ↓
stockage local
 ↓
Outbox
 ↓ reconnexion
sync
 ↓
Supabase
```

Chaque opération doit utiliser :

- identifiant stable ;
- idempotency key lorsque nécessaire ;
- timestamp serveur ;
- version/conflit détectable.

États UI :

- enregistré sur cet appareil ;
- en attente d'envoi ;
- synchronisation ;
- synchronisé ;
- erreur ;
- conflit à résoudre.

Ne jamais afficher `envoyé` avant confirmation backend.

Images :
- compression raisonnable avant upload ;
- qualité suffisante pour documents.

Audio :
- note vocale utilisable offline ;
- upload différé ;
- transcription facultative et jamais bloquante.

La sécurité backend reste la source d'autorité après synchronisation.

---

# PHASE 10 — LANGUES, AUDIO ET ACCESSIBILITÉ

PROMPT :

Audite i18n et composants audio existants.

Rendre l'application utilisable avec peu de lecture.

Chaque parcours essentiel doit permettre :

- écouter la question ;
- réponse par choix visuel ;
- note vocale lorsque pertinent ;
- demander l'aide d'un accompagnateur.

Utiliser :

- phrases courtes ;
- vocabulaire simple ;
- icônes + texte ;
- grandes zones tactiles ;
- contraste accessible ;
- focus clavier ;
- labels lecteur d'écran.

Préparer l'i18n sans dupliquer les textes métier dans les composants.

Les langues ajoutées doivent utiliser le même système de clés.

Ne pas dépendre obligatoirement de la transcription vocale pour fonctionner.

Le contenu audio important destiné au mode rural doit pouvoir être préchargé/cache lorsque possible.

---

# PHASE 11 — GOUVERNANCE DES PROFESSIONNELS ET DES PROCÉDURES

PROMPT :

Créer ou adapter le back-office sécurisé nécessaire uniquement s'il n'existe pas.

Il doit permettre aux utilisateurs autorisés de :

- vérifier un professionnel/service ;
- gérer ses compétences/habilitations ;
- suspendre une fiche ;
- versionner une procédure ;
- associer les sources d'une procédure ;
- corriger des informations d'annuaire ;
- examiner les signalements selon les rôles autorisés.

Une personne ou un service ne peut pas se déclarer lui-même :

`agréé/vérifié`

sans workflow de validation.

Toute modification sensible doit produire un audit event.

Les procédures publiées doivent avoir :

- version ;
- source ;
- date ;
- auteur/validateur ;
- statut publication.

---

# PHASE 12 — SÉCURITÉ, TESTS ET QUALITÉ PRODUCTION

PROMPT :

Faire un audit complet sans refactoring esthétique inutile.

Tester :

## Sécurité

- Auth ;
- RLS ;
- accès dossier privé ;
- portée des accompagnateurs ;
- accès professionnel/service ;
- Storage ;
- URLs signées ;
- actions sensibles ;
- isolation multi-utilisateurs ;
- tentatives d'accès direct par ID.

## Tests

Ajouter ou compléter :

- unit tests logique métier ;
- tests services/repositories ;
- tests RLS ;
- tests intégration ;
- parcours E2E critiques.

Scénarios E2E minimum :

1. première visite ;
2. Rural essentiel ;
3. création accompagnée ;
4. création dossier succession ;
5. ajout document offline ;
6. synchronisation ;
7. intervention professionnel ;
8. accès privé limité ;
9. signalement ;
10. consultation historique.

## Qualité

- TypeScript strict selon config ;
- aucune erreur build ;
- aucune dépendance circulaire ;
- aucun `any` injustifié ;
- aucune donnée fake production ;
- aucun secret frontend ;
- aucun console debug ;
- error boundaries ;
- états loading/empty/error ;
- formulaires accessibles ;
- responsive mobile.

## Performance

Optimiser :

- bundle ;
- lazy-loading ;
- images ;
- requêtes ;
- pagination ;
- cache ;
- réseau lent.

Ne reconstruis aucun écran simplement pour améliorer un score.

---

# PHASE 13 — VALIDATION ET MISE EN PRODUCTION

PROMPT :

Ne crée aucune nouvelle feature.

Effectue uniquement la validation finale.

Vérifier :

- migrations appliquées dans l'ordre ;
- schéma cohérent ;
- RLS activée ;
- buckets Storage sécurisés ;
- variables d'environnement ;
- build production ;
- routes ;
- PWA ;
- manifest ;
- service worker ;
- installation ;
- comportement offline ;
- reprise après reconnexion ;
- erreurs réseau ;
- logs ;
- monitoring existant ;
- sauvegarde/restauration prévue ;
- données de test absentes de production.

Faire une vérification complète des parcours :

```text
Orientation
→ Bien
→ Dossier
→ Parcours
→ Documents
→ Intervenants
→ Services
→ Communications
→ Historique
→ Finalisation
```

et :

```text
Orientation
→ Signalement
→ Faits
→ Interventions contestées
→ Éléments fournis
→ Acteur/service compétent
→ Suivi
```

Vérifier les trois expériences :

- Rural essentiel ;
- Rural autonome ;
- Moderne.

Le même backend et les mêmes données doivent être utilisés dans tous les modes.

Seule la présentation change.

Livrer uniquement :

1. build status ;
2. tests ;
3. migrations ;
4. sécurité ;
5. PWA/offline ;
6. problèmes réellement restants ;
7. fichiers concernés.

Ne faire aucun refactoring supplémentaire si le système est conforme.