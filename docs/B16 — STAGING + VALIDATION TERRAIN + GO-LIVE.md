# B16 — STAGING + VALIDATION TERRAIN + GO-LIVE

**AUDIT FIRST — REUSE FIRST — DELTA ONLY — PRODUCTION ONLY**

B1 à B15 sont terminés.

B16 n'ajoute aucune nouvelle fonctionnalité métier.

Objectif :

**valider le système en conditions réelles, corriger uniquement les blockers et décider du passage en production.**

---

# 1. GATE D'ENTRÉE

Ne commence B16 que si B15 retourne :

`READY FOR STAGING`

Sinon :

STOP et liste les blockers.

---

# 2. ENVIRONNEMENT STAGING

Vérifier que staging est séparé de production :

- Supabase projet/environnement approprié ;
- Auth ;
- Storage ;
- Edge Functions/RPC ;
- variables d'environnement ;
- URLs ;
- clés ;
- observabilité ;
- données de test.

Aucune donnée réelle utilisateur ne doit être utilisée sans cadre autorisé.

---

# 3. MIGRATIONS

Appliquer les migrations sur staging dans leur ordre réel.

Vérifier :

- tables ;
- FK ;
- contraintes ;
- index ;
- RLS ;
- functions ;
- triggers ;
- Storage policies ;
- données de référence nécessaires.

Ne modifie pas une ancienne migration appliquée.

Toute correction = nouvelle migration.

---

# 4. SEED STAGING

Utiliser uniquement des données fictives contrôlées permettant de tester :

- utilisateur titulaire ;
- accompagnateur ;
- professionnel ;
- service ;
- autorité ;
- dossier rural ;
- dossier succession ;
- dossier achat ;
- signalement ;
- documents ;
- procédures ;
- accès limités.

Aucun mock frontend.

---

# 5. MATRICE DES APPAREILS

Tester au minimum :

### Android faible/moyenne puissance
Priorité principale.

### Android moderne

### iPhone / Safari si PWA supportée

### Desktop
pour interface complète et back-office.

Tester plusieurs tailles d'écran.

---

# 6. CONDITIONS RÉSEAU

Tester réellement ou simuler :

```text id="r01fbe"
Offline complet
2G / très lent
3G instable
4G normal
Wi-Fi
coupures répétées
retour réseau intermittent
```

Les workflows principaux ne doivent pas dépendre d'une connexion parfaite.

---

# 7. TEST TERRAIN — RURAL ESSENTIEL

Scénario critique :

```text id="0q89yz"
Première ouverture
↓
Rural essentiel
↓
préférence audio
↓
orientation
↓
une question à la fois
↓
création du parcours
↓
connexion perdue
↓
continuer
↓
réseau revient
↓
synchronisation
```

Vérifier :

- compréhension ;
- gros boutons ;
- texte court ;
- audio ;
- feedback offline ;
- aucune donnée perdue.

---

# 8. TEST TERRAIN — GRAND-MÈRE ACCOMPAGNÉE

Scénario de référence :

```text id="yqqdke"
Jeanne = titulaire
Paul = accompagnateur
```

Tester :

- onboarding ;
- Bien ;
- Dossier ;
- parcours ;
- documents ;
- audio ;
- intervention ;
- synchronisation.

Vérifier systématiquement :

```text id="j91v8j"
Titulaire = Jeanne
Action effectuée par = Paul
Pour le compte de = Jeanne
```

Paul ne devient jamais titulaire automatiquement.

---

# 9. TEST — ORIENTATION

Tester plusieurs intentions :

```text id="o9ohj8"
Je veux seulement regarder
J'ai un bien
Je veux acheter
Je veux protéger mon bien
Je prépare une succession
Je veux transmettre / partager / vendre
J'ai un problème
J'accompagne quelqu'un
```

Chaque intention doit diriger vers le bon flow.

Pas de dead-end.

Pas de duplication d'Assistant.

---

# 10. TEST — CRÉATION DOSSIER

Tester :

```text id="dbupqh"
Orientation
→ Bien
→ Titulaire
→ Accompagnement
→ Documents
→ Localisation
→ Procédure
→ Parcours
→ Création
```

Vérifier :

- responsabilités ;
- version de procédure ;
- première étape ;
- prochaine action ;
- historique initial.

---

# 11. TEST — PARCOURS TERRITORIAL

Tester au moins un parcours complet :

```text id="2rvzhe"
Rural
↓
Arrondissement
↓
Département
↓
Région / niveau compétent
```

La procédure testée doit suivre sa véritable définition configurée.

Vérifier :

- acteur ;
- compétence ;
- habilitation ;
- intervention ;
- documents ;
- progression ;
- historique.

---

# 12. TEST — PERSONNE INVITÉE

Inviter un intervenant.

Son écran doit montrer uniquement :

```text id="l7dhio"
Pourquoi suis-je invité ?
Sur quelle étape ?
Quel est mon rôle ?
Que dois-je faire ?
Que puis-je voir ?
```

Pas l'ensemble du dossier privé.

---

# 13. TEST — ACCESS GRANTS

Tester :

```text id="u1a8j2"
demande
↓
acceptation partielle
↓
accès limité
↓
expiration
```

et :

```text id="71qpfu"
accès actif
↓
révocation
↓
accès immédiatement refusé
```

Tester en UI et via appel backend direct.

---

# 14. TEST — DOCUMENTS

Tester :

- photo appareil ;
- fichier ;
- upload lent ;
- coupure pendant upload ;
- reprise ;
- nouvelle version ;
- document fourni par une autre personne ;
- document à vérifier ;
- vérification autorisée.

Toujours conserver :

```text id="is07mq"
Ajouté par
Fourni par
Source
Version
Statut
```

---

# 15. TEST — AUDIO

Tester :

- permission micro refusée ;
- permission acceptée ;
- enregistrement ;
- lecture ;
- offline ;
- upload différé ;
- retry ;
- message audio.

Un refus de microphone ne doit pas bloquer l'application.

---

# 16. TEST — COMMUNICATION

Tester :

```text id="33xn1u"
Dossier
→ Étape
→ Conversation
→ Texte
→ Audio
→ Document
```

Vérifier :

- contexte toujours visible ;
- RLS ;
- membre retiré ;
- réseau lent ;
- messages sans doublon.

---

# 17. TEST — SIGNALEMENT

Tester :

```text id="epkz4h"
J'ai un problème
↓
intervention contestée
↓
description
↓
document/témoin
↓
soumission
↓
suivi
```

L'intervention originale reste intacte.

Le langage UI reste neutre.

---

# 18. TEST — AUDIT

Vérifier que l'historique permet de comprendre :

```text id="ik56kq"
qui
quoi
pour qui
quand
où dans le parcours
avec quel rôle
```

Aucune action sensible ne doit manquer dans l'Audit.

---

# 19. TEST — OFFLINE COMPLET

Tester une session longue hors connexion :

- ouvrir Dossier cached ;
- compléter données ;
- prendre photo ;
- enregistrer audio ;
- créer message ;
- avancer un flow autorisé ;
- fermer l'application ;
- relancer ;
- retrouver les pending actions ;
- reconnecter ;
- synchroniser.

Aucune perte.

Aucun doublon.

---

# 20. TEST — CONFLITS

Provoquer volontairement :

- modification distante + locale ;
- document concurrent ;
- permission révoquée offline ;
- changement de titulaire sensible ;
- intervention devenue non autorisée.

Vérifier que les conflits sensibles ne sont jamais résolus automatiquement de manière dangereuse.

---

# 21. TEST — CHANGEMENT DE COMPTE

Scénario :

```text id="nyhfof"
Utilisateur A
↓
données offline
↓
logout
↓
Utilisateur B
```

B ne doit voir aucune donnée privée locale de A.

---

# 22. TEST — NOTIFICATIONS

Tester :

- demande d'accès ;
- message ;
- étape ;
- document ;
- signalement ;
- erreur sync.

Vérifier :

- pas de doublon ;
- deep link correct ;
- données sensibles minimisées ;
- préférences respectées.

---

# 23. TEST — BACK-OFFICE

Tester chaque rôle séparément :

```text id="ch7c9f"
platform_admin
actor_verifier
procedure_editor
signalement_reviewer
support_agent
moderator
```

Tester aussi les actions interdites.

Exemple :

`actor_verifier` ne doit pas publier une procédure sans permission correspondante.

---

# 24. VALIDATION DU CONTENU MÉTIER

Avant production, chaque procédure affichée comme validée doit posséder :

- source ;
- territoire ;
- version ;
- date de vérification ;
- validateur ;
- statut publié.

Tout contenu non validé doit être identifié comme :

```text id="xmge6u"
Information indicative
ou
À vérifier
```

---

# 25. TEST DE COMPRÉHENSION

Faire tester les écrans essentiels avec des personnes correspondant réellement aux profils cibles lorsque cela est possible.

Observer :

- savent-elles quoi faire sans explication externe ?
- comprennent-elles la prochaine étape ?
- comprennent-elles qui intervient ?
- comprennent-elles la différence titulaire/accompagnateur ?
- comprennent-elles si une donnée est envoyée ou seulement locale ?

Ne modifier que les problèmes réels observés.

---

# 26. RÈGLE DES 5 SECONDES

Sur chaque écran essentiel, l'utilisateur doit pouvoir identifier rapidement :

```text id="jkpaqx"
Où suis-je ?
Que dois-je faire ?
Quel est le bouton principal ?
```

Si ce n'est pas clair :

corriger l'UX sans reconstruire le Design System.

---

# 27. TEST LANGAGE SIMPLE

Auditer les textes Rural essentiel.

Éliminer autant que possible le jargon comme :

```text id="rmxudn"
scope
credential
workflow
validation transactionnelle
projection publique
```

Les termes administratifs nécessaires doivent être expliqués simplement.

---

# 28. LANGUES

Tester le système i18n existant.

Vérifier :

- aucun texte métier important hardcodé dans les composants ;
- fallback correct ;
- accents ;
- longueurs variables ;
- audio correspondant à la langue lorsque disponible.

---

# 29. ACCESSIBILITÉ TERRAIN

Tester :

- faible luminosité ;
- soleil extérieur ;
- une main ;
- écran petit ;
- utilisateur âgé ;
- gros texte système ;
- lecteur écran ;
- micro indisponible.

---

# 30. PERFORMANCE TERRAIN

Mesurer les écrans principaux en réseau lent.

Vérifier :

- temps d'ouverture ;
- poids initial ;
- requêtes ;
- images ;
- audio ;
- cache.

Corriger uniquement les problèmes réellement mesurés.

---

# 31. BATTERIE ET DONNÉES

Éviter :

- polling continu ;
- sync agressive ;
- téléchargement automatique de gros fichiers ;
- prefetch massif ;
- audio non demandé.

Le produit rural doit être économe en :

```text id="6rgmnk"
batterie
data
stockage
```

---

# 32. PWA INSTALLÉE

Tester :

- installation ;
- premier lancement ;
- lancement offline ;
- mise à jour ;
- nouvelle version disponible ;
- cache invalidation ;
- reprise après update.

---

# 33. UPDATE STRATEGY

Une mise à jour ne doit pas :

- perdre Outbox ;
- perdre drafts ;
- casser données locales ;
- laisser l'utilisateur indéfiniment sur une version incompatible.

Tester une migration réelle de version de l'application.

---

# 34. STAGING OBSERVABILITY

Pendant les tests, vérifier :

- erreurs frontend ;
- erreurs backend ;
- RLS denied inattendus ;
- failed uploads ;
- sync failures ;
- Edge Function failures ;
- temps requêtes ;
- crashs.

Corriger les problèmes critiques.

---

# 35. SEUILS GO-LIVE

Ne passer en production que si :

```text id="um46i2"
0 blocker sécurité critique

0 fuite cross-user

0 perte de données connue

0 duplication critique offline

0 migration cassée

0 parcours principal bloqué
```

Les problèmes mineurs non bloquants doivent être documentés.

---

# 36. BACKUP / RECOVERY

Avant Go-Live, vérifier :

- sauvegarde DB ;
- restauration testée ou procédure documentée ;
- stratégie Storage ;
- plan récupération incident ;
- gestion rollback déploiement.

---

# 37. DEPLOYMENT CHECKLIST

Avant production :

```text id="5pdqcb"
env production
✓

migrations
✓

RLS
✓

Storage
✓

Auth
✓

domains
✓

SSL/HTTPS
✓

service worker
✓

PWA
✓

observability
✓

backup
✓
```

---

# 38. SECRETS

Vérifier une dernière fois :

- aucun secret Git ;
- aucun token loggé ;
- aucune clé service-role frontend ;
- secrets backend uniquement dans environnement sécurisé.

---

# 39. PRODUCTION DATA

Avant ouverture :

- supprimer fixtures ;
- supprimer comptes de test non nécessaires ;
- supprimer documents fake ;
- vérifier procédures publiées ;
- vérifier acteurs publics initiaux.

---

# 40. PILOT GO-LIVE

Ne pas ouvrir immédiatement à tout le territoire si une phase pilote est possible.

Préférer :

```text id="xa8355"
petite zone
+
nombre limité d'utilisateurs
+
quelques acteurs/services validés
```

Mesurer :

- compréhension ;
- sync ;
- erreurs ;
- parcours bloqués ;
- temps de réponse ;
- besoins d'assistance.

---

# 41. MÉTRIQUES PILOTE

Mesurer sans exposer les données patrimoniales :

```text id="3y0rxe"
taux de parcours commencés
taux de parcours terminés
étapes bloquantes
échecs sync
temps moyen de sync
usage audio
usage accompagnement
erreurs
```

---

# 42. CRITÈRES D'ARRÊT PILOTE

Suspendre l'expansion si :

- fuite de données ;
- perte documentaire ;
- erreur de titularité ;
- permission contournable ;
- procédure incorrecte critique ;
- sync provoquant corruption.

Corriger avant extension.

---

# 43. GO-LIVE PROGRESSIF

Après pilote validé :

élargir progressivement :

```text id="pq7uvu"
zone
→ utilisateurs
→ professionnels
→ services
→ nouveaux parcours
```

Ne pas activer une procédure non validée uniquement parce que l'infrastructure existe.

---

# 44. MONITORING PRODUCTION

Surveiller au minimum :

- disponibilité ;
- erreurs Auth ;
- erreurs DB ;
- sync ;
- Storage ;
- uploads ;
- messages ;
- RLS denied anormaux ;
- fonctions backend ;
- crash frontend.

Ne jamais collecter plus de données privées que nécessaire.

---

# 45. SUPPORT

Prévoir un chemin simple :

```text id="j0tyii"
J'ai besoin d'aide
```

L'utilisateur doit pouvoir distinguer :

- aide pour utiliser l'application ;
- problème avec son dossier ;
- signalement.

Ne mélange pas support technique et Signalement métier.

---

# 46. DOCUMENTATION OPÉRATIONNELLE

Avant production, disposer au minimum de :

```text id="cbv8d7"
architecture
migrations
RLS
backup/recovery
gestion incidents
procédures de publication
validation acteurs
offline/sync
déploiement
rollback
```

Réutilise la documentation déjà présente.

Ne crée pas des documents contradictoires.

---

# 47. AUCUNE NOUVELLE FEATURE

Pendant B16 :

Interdit :

- nouveau domaine ;
- nouveau flow métier ;
- redesign ;
- nouvelle architecture ;
- nouvelle dépendance majeure sauf blocker validé.

Toute idée nouvelle va dans le backlog.

---

# 48. CORRECTIONS AUTORISÉES

Autorisé uniquement :

- blocker ;
- bug ;
- fail sécurité ;
- fail sync ;
- fail accessibilité critique ;
- fail performance terrain majeur ;
- problème de compréhension bloquant.

---

# 49. FINAL GO-LIVE REVIEW

Rejouer les parcours critiques :

```text id="5wcvft"
Première visite
→ Profil usage
→ Orientation
→ Bien
→ Dossier
→ Parcours
→ Documents
→ Acteurs
→ Accès
→ Intervention
→ Communication
→ Historique
```

et :

```text id="887ely"
Orientation
→ Signalement
→ Faits
→ Pièces
→ Suivi
```

et :

```text id="3ii9s0"
Offline
→ travail local
→ reconnexion
→ sync
→ confirmation
```

---

# 50. DÉCISION FINALE

À la fin, Lovable doit retourner exactement l'un de ces statuts :

```text id="3qp1jz"
GO-LIVE APPROVED
```

ou :

```text id="c4d0k4"
GO-LIVE BLOCKED
```

Ne jamais approuver si un blocker sécurité, données, permissions ou synchronisation existe.

---

# 51. LIVRABLE FINAL

Rapporte uniquement :

## Staging
État et environnement testé.

## Appareils
Appareils/navigateurs réellement validés.

## Réseau
Scénarios réellement testés.

## Parcours terrain
Résultats.

## Sécurité
Résultats RLS/Auth/Storage/Admin.

## Offline
Résultats Outbox/Sync/Conflits.

## Performance
Mesures et corrections importantes.

## Accessibilité
Résultats.

## Contenu métier
Procédures réellement validées.

## Production blockers
Liste exacte.

## Correctifs appliqués
Liste.

## Migrations finales
Liste.

## Décision

`GO-LIVE APPROVED`

ou

`GO-LIVE BLOCKED`

Aucune nouvelle fonctionnalité après cette décision.