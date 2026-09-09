# B12 — OFFLINE SYNC + OUTBOX + CONFLITS + REPRISE RÉSEAU

**AUDIT FIRST — REUSE FIRST — DELTA ONLY — PRODUCTION ONLY**

B1 à B11 sont terminés.

Ne reconstruis rien.

## 1. AUDIT OBLIGATOIRE

Inspecte avant toute modification :

- PWA existante ;
- service worker ;
- cache ;
- IndexedDB ou autre stockage local ;
- stores persistés ;
- logique offline existante ;
- queue/outbox éventuelle ;
- retry réseau ;
- gestion upload différé ;
- documents B6 ;
- messages B9 ;
- signalements B10 ;
- audit B11 ;
- éventuel background sync.

Réutilise ce qui existe.

Ne crée pas un deuxième système offline.

---

# 2. OBJECTIF B12

Finaliser uniquement :

1. persistence locale production ;
2. Outbox ;
3. synchronisation différée ;
4. reprise après coupure ;
5. idempotence ;
6. états de synchronisation ;
7. gestion des conflits ;
8. upload différé documents/audio ;
9. UI état réseau/sync ;
10. tests offline.

Ne touche pas encore :

- Notifications avancées B13 ;
- Back-office B14.

---

# 3. PRINCIPE

Une action utilisateur ne doit pas dépendre d'une connexion immédiate lorsque le domaine l'autorise.

Flux attendu :

```text id="a2l4rq"
UI
↓
Application / Repository
↓
Local persistence
↓
Outbox
↓
Réseau disponible
↓
Sync engine
↓
Supabase
↓
Confirmation serveur
↓
État local synchronisé
```

Les composants ne doivent jamais manipuler directement l'Outbox.

---

# 4. SOURCE DE VÉRITÉ

Quand l'utilisateur est offline :

la source immédiate d'affichage est le stockage local autorisé.

Quand le backend confirme une opération :

le backend reste la source d'autorité finale.

Ne crée pas deux versions indépendantes sans mécanisme de réconciliation.

---

# 5. PERSISTENCE LOCALE

Réutiliser la technologie locale déjà présente.

Ne pas utiliser `localStorage` pour les données métier importantes.

La persistence locale doit pouvoir gérer :

- Dossiers récents ;
- Étapes ;
- Documents metadata ;
- Participants nécessaires ;
- Acteurs utiles ;
- messages récents ;
- préférences ;
- opérations en attente ;
- fichiers offline référencés.

Les données sensibles doivent être minimisées.

---

# 6. OUTBOX

Créer ou compléter un modèle d'opération offline.

Champs conceptuels :

```text id="9tjjzf"
id
operation_type
entity_type
entity_id
payload
client_created_at
status
attempt_count
last_attempt_at nullable
last_error nullable
idempotency_key
depends_on nullable
```

Statuts :

```text id="ar9f81"
pending
syncing
synced
failed
conflict
cancelled
```

---

# 7. OPÉRATIONS SUPPORTÉES

Support minimum :

```text id="uuiv7s"
CREATE_BIEN
UPDATE_BIEN

CREATE_DOSSIER
UPDATE_DOSSIER

ADD_PARTICIPANT

ADD_DOCUMENT
ADD_DOCUMENT_VERSION

ADD_INTERVENTION

SEND_MESSAGE

CREATE_SIGNALEMENT

UPDATE_USAGE_PREFERENCES
```

N'ajoute pas une opération si le domaine ne peut pas être correctement synchronisé.

---

# 8. IDEMPOTENCE

Chaque opération envoyée au backend doit posséder une clé stable.

Objectifs :

- retry sans doublon ;
- reprise après crash ;
- éviter double création après reconnexion.

Ne génère pas une nouvelle `idempotency_key` à chaque tentative.

---

# 9. IDS STABLES

Utiliser des IDs générés côté client lorsque cela est compatible avec les entités concernées.

Un objet créé offline doit conserver le même ID après synchronisation.

Éviter :

```text id="nqdm4g"
temp-id local
→ nouvel id serveur
→ remapping massif
```

si l'architecture peut l'éviter.

---

# 10. DÉPENDANCES ENTRE OPÉRATIONS

Supporter les dépendances.

Exemple :

```text id="rf44vj"
CREATE_DOSSIER
↓
ADD_DOCUMENT
↓
SEND_MESSAGE
```

Une opération dépendante ne doit pas être envoyée si sa dépendance critique a échoué.

---

# 11. STRATÉGIE DE RETRY

Prévoir :

- retry progressif ;
- limite raisonnable ;
- backoff ;
- retry manuel ;
- reprise automatique après retour réseau.

Éviter les boucles agressives qui consomment batterie et données.

---

# 12. ÉTATS UI DE SYNCHRONISATION

Utiliser un vocabulaire clair :

```text id="z4ey5n"
Sur cet appareil
En attente d'envoi
Synchronisation
Synchronisé
Erreur
Conflit
```

Ne jamais afficher :

`Envoyé`

avant confirmation backend.

---

# 13. NETWORK STATE

Créer ou réutiliser un état réseau central.

Expose conceptuellement :

```ts id="x71j4e"
isOnline
isOffline
isSyncing
pendingCount
failedCount
```

Ne duplique pas `navigator.onLine` dans plusieurs composants.

---

# 14. UI GLOBALE

Ajouter un indicateur discret mais visible.

Exemple :

```text id="lso5bw"
Hors connexion
3 éléments seront envoyés plus tard
```

ou :

```text id="y2j1a6"
Synchronisation...
```

En mode essentiel :

phrase simple + icône.

---

# 15. DOCUMENTS OFFLINE

B6 doit fonctionner avec upload différé.

Flow :

```text id="s3tm43"
Photo prise
↓
stockée localement
↓
metadata Document créée
↓
Outbox ADD_DOCUMENT
↓
réseau disponible
↓
upload Storage
↓
document_version créée
↓
confirmation
```

Ne perdre jamais le fichier si l'upload échoue.

---

# 16. AUDIO OFFLINE

Même principe pour les notes vocales B9.

Flow :

```text id="8q8z8z"
Audio enregistré
↓
local
↓
Outbox SEND_MESSAGE
↓
upload audio
↓
message créé
↓
confirmation
```

La transcription reste facultative.

---

# 17. MESSAGES

Utiliser `client_message_id` de B9.

Un retry ne doit jamais produire deux messages.

Les messages pending restent visibles avec statut clair.

---

# 18. SIGNALEMENTS OFFLINE

Autoriser la création d'un brouillon Signalement offline.

L'utilisateur peut :

- expliquer ;
- ajouter notes ;
- ajouter photos ;
- enregistrer audio.

La soumission finale peut être différée jusqu'au retour réseau.

Ne jamais afficher `transmis` tant que le serveur n'a pas confirmé.

---

# 19. CONFLITS — PRINCIPE

Ne pas appliquer une seule stratégie globale.

Chaque type de donnée possède sa propre politique.

---

# 20. CONFLITS — PRÉFÉRENCES

Pour `usage_preferences` :

une stratégie last-write-wins peut être acceptable si elle est contrôlée.

Documenter clairement la règle choisie.

---

# 21. CONFLITS — MESSAGES

Messages = append-only.

Pas de merge complexe.

Un message possède son propre ID stable.

---

# 22. CONFLITS — AUDIT

Audit = append-only.

Ne jamais fusionner ou écraser.

---

# 23. CONFLITS — DOCUMENTS

Documents = versionnement.

Si deux versions arrivent :

conserver les deux.

Ne pas écraser automatiquement.

---

# 24. CONFLITS — INTERVENTIONS

Préférer append-only/correction versionnée.

Ne pas remplacer silencieusement une intervention existante.

---

# 25. CONFLITS — TITULAIRES / DROITS / ACCÈS

Aucune résolution automatique risquée.

Si un conflit touche :

- titulaire ;
- ayant droit ;
- permission ;
- Access Grant ;
- rôle sensible ;

mettre :

```text id="lw2wno"
conflict
```

et exiger résolution explicite.

---

# 26. VERSIONING / OPTIMISTIC CONCURRENCY

Lorsque pertinent, ajouter ou réutiliser un mécanisme de version :

```text id="85mh4c"
version
updated_at
```

Avant update :

vérifier que la version distante correspond à celle connue localement.

Sinon :

conflit.

---

# 27. SYNC ENGINE

Créer ou compléter une couche unique.

Responsabilités :

- lire Outbox ;
- ordonner opérations ;
- vérifier dépendances ;
- envoyer ;
- gérer retry ;
- appliquer confirmation ;
- marquer erreur ;
- détecter conflit.

Ne place pas ce moteur dans un hook UI.

---

# 28. APPLICATION LAYER

Créer/compléter si nécessaire :

```text id="60i3c3"
application/offline-sync/
```

Sous-responsabilités possibles :

```text id="whx6pf"
outbox
sync-engine
conflict-resolution
network-state
```

Ne sur-fragmente pas si l'existant est déjà propre.

---

# 29. REPOSITORY PATTERN

Les repositories métier doivent pouvoir utiliser :

```text id="uo0e5q"
local adapter
remote adapter
sync orchestration
```

L'UI continue d'appeler les mêmes abstractions.

Elle ne doit pas connaître si la donnée vient du local ou du remote.

---

# 30. CACHE DE LECTURE

Prioriser offline pour :

- Home essentielle ;
- dossiers récents ;
- détail du dossier courant ;
- parcours ;
- prochaine étape ;
- participants nécessaires ;
- acteurs recommandés déjà consultés.

Ne cache pas inutilement tout l'annuaire.

---

# 31. STRATÉGIE CACHE

Distinguer :

```text id="76ov2m"
App shell
Données métier
Médias
Documents
Audio
```

Ne mélange pas tout dans un seul cache.

Respecter le service worker existant.

---

# 32. SERVICE WORKER

Auditer avant modification.

Ne remplace pas le service worker si l'actuel fonctionne.

Ajouter seulement ce qui manque pour :

- app shell ;
- assets ;
- routes essentielles ;
- stratégie réseau adaptée.

Ne stocke pas automatiquement des réponses privées dans un cache public.

---

# 33. SÉCURITÉ OFFLINE

Le stockage local peut contenir des données sensibles.

Minimiser ce qui est conservé.

Prévoir :

- nettoyage à logout ;
- isolation utilisateur ;
- suppression des caches privés après changement de compte ;
- pas de secret ;
- pas de token sensible dans un stockage inadapté.

---

# 34. CHANGEMENT DE COMPTE

Scénario obligatoire :

```text id="3jozfd"
Utilisateur A se déconnecte
↓
Utilisateur B se connecte
```

B ne doit jamais voir les données offline privées de A.

---

# 35. LOGOUT AVEC OUTBOX PENDING

Si des opérations sont en attente :

ne les supprimer pas silencieusement.

Le produit doit suivre une stratégie explicite.

Par exemple :

- avertir ;
- synchroniser avant logout si possible ;
- ou conserver de façon isolée pour le même utilisateur.

Ne jamais transférer les opérations à un autre compte.

---

# 36. BACKGROUND SYNC

Réutiliser si déjà supporté proprement.

Ne dépend pas exclusivement de Background Sync car il n'est pas garanti partout.

Le sync doit aussi pouvoir se lancer :

- au démarrage ;
- au retour réseau ;
- manuellement ;
- lorsque l'app revient au premier plan.

---

# 37. PERFORMANCE RÉSEAU FAIBLE

Optimiser :

- requêtes petites ;
- batch raisonnable ;
- pagination ;
- compression ;
- pas de polling agressif ;
- reprise upload si possible ;
- priorité aux données essentielles.

---

# 38. PRIORITÉ DE SYNCHRONISATION

Ordre général :

```text id="c7ob8w"
identité/préférences critiques
↓
Dossier/Bien
↓
relations nécessaires
↓
documents metadata
↓
interventions
↓
messages
↓
médias volumineux
```

Adapter selon dépendances réelles.

---

# 39. SYNC MANUEL

Prévoir une action :

**Synchroniser maintenant**

si des éléments sont pending ou failed.

En mode essentiel :

```text id="x47bzv"
3 éléments attendent Internet.
```

Puis bouton :

`Réessayer`

---

# 40. ERREURS

Ne montre pas :

```text id="tmojdp"
PostgREST error PGRST...
```

à l'utilisateur.

Traduire en messages simples :

```text id="01m8c6"
Impossible d'envoyer pour le moment.
Vos données sont conservées sur cet appareil.
```

Les détails techniques restent dans l'observabilité.

---

# 41. OBSERVABILITÉ SYNC

Tracer techniquement :

- nombre d'opérations ;
- erreurs ;
- retry ;
- conflits ;
- temps sync ;
- upload failed ;
- cause réseau.

Ne pas logger le contenu sensible.

---

# 42. AUDIT B11

Une opération offline importante doit produire l'AuditEvent approprié seulement lorsque l'action est acceptée côté backend.

Source :

```text id="6igxki"
offline_sync
```

Éviter de créer deux AuditEvents pour la même opération retryée.

---

# 43. IDEMPOTENCE BACKEND

Le backend doit pouvoir reconnaître une opération déjà traitée.

Si nécessaire, utiliser une table ou clé technique dédiée aux opérations synchronisées.

Ne base pas l'idempotence uniquement sur le frontend.

---

# 44. RLS

La synchronisation ne contourne jamais la RLS.

Une opération créée offline mais devenue non autorisée au moment du sync doit échouer proprement.

Exemple :

```text id="dkrl7j"
Grant révoqué pendant que l'utilisateur était offline
↓
intervention pending
↓
sync
↓
refus backend
↓
état failed/conflict
```

Ne force pas l'écriture.

---

# 45. TESTS UNITAIRES

Tester :

- enqueue ;
- dequeue ;
- retry ;
- dépendances ;
- idempotence ;
- réseau offline/online ;
- conflit ;
- erreur permanente ;
- logout ;
- changement compte.

---

# 46. TESTS INTÉGRATION

Scénarios minimum :

1. créer Dossier offline puis sync ;
2. ajouter document offline puis sync ;
3. audio offline puis sync ;
4. message retry sans doublon ;
5. interruption pendant upload ;
6. retour réseau ;
7. opération refusée par RLS ;
8. dépendance échouée ;
9. conflit document ;
10. conflit permission.

---

# 47. E2E — MODE RURAL

Scénario :

```text id="dke8p4"
Utilisateur hors ligne
↓
ouvre dossier cached
↓
ajoute document
↓
enregistre note vocale
↓
continue parcours
↓
voit "En attente d'envoi"
↓
réseau revient
↓
sync automatique
↓
confirmation
↓
états passent à "Synchronisé"
```

---

# 48. E2E — GRAND-MÈRE ACCOMPAGNÉE

```text id="0lnijw"
Jeanne + Paul
↓
réseau faible
↓
Paul ajoute document pour Jeanne
↓
performed_by = Paul
on_behalf_of = Jeanne
↓
offline
↓
sync
↓
audit backend
↓
responsabilités conservées
```

---

# 49. UI / UX

Respecte le Design System.

Mobile-first.

Toujours privilégier :

```text id="md1oiu"
Vos informations sont enregistrées.
Elles seront envoyées dès que le réseau revient.
```

Plutôt qu'un vocabulaire technique.

---

# 50. VALIDATION B12

Avant de terminer :

- build réussi ;
- TypeScript sans erreur ;
- persistence locale fonctionne ;
- Outbox fonctionne ;
- retry fonctionne ;
- idempotence fonctionne ;
- documents offline fonctionnent ;
- messages offline fonctionnent ;
- audio offline fonctionne ;
- signalement brouillon offline fonctionne ;
- changement de compte isolé ;
- logout sécurisé ;
- conflits protégés ;
- RLS non contournée ;
- Audit B11 non dupliqué ;
- aucun second système de cache/sync créé ;
- aucun domaine B13+ implémenté.

---

# 51. LIVRABLE

Rapporte uniquement :

1. existant offline/PWA réutilisé ;
2. stockage local utilisé ;
3. fichiers créés ;
4. fichiers modifiés ;
5. structure Outbox ;
6. moteur de sync ;
7. stratégie de conflit ;
8. service worker/cache adapté ;
9. tests exécutés ;
10. scénarios offline validés ;
11. écarts éventuels.

**Ne commence pas B13.**