# Portes d'acceptation — Lovable / Heritis

Version 1.0

Aucun lot ne peut être déclaré terminé en sautant une porte applicable. Une porte non vérifiée reste **NON FRANCHIE**.

## Porte 0 — Référentiel pris en compte

**Objectif :** garantir que l'intervenant travaille selon les règles en vigueur.

Critères :
- [ ] Lecture de `AGENTS.md` et des documents spécialisés requis.
- [ ] Lecture du référentiel de ce dossier Lovable dans l'ordre prévu.
- [ ] Identification des décisions validées et des propositions non validées.
- [ ] Confirmation de la branche et du commit de référence.
- [ ] Rapport de prise en compte fourni.

Preuve attendue : compte rendu avec chemins et références de commits. Une simple affirmation « j'ai compris » ne suffit pas.

## Porte 1 — Audit de l'existant

**Objectif :** connaître le comportement réel avant de proposer une modification.

Critères :
- [ ] Parcours, pages et états concernés inventoriés.
- [ ] Code, services, données, migrations et permissions concernés examinés.
- [ ] Fonctionnalités existantes et réutilisables identifiées.
- [ ] Tests disponibles, manquants et résultats actuels identifiés.
- [ ] Dépendances, risques et effets de bord analysés.
- [ ] Incertitudes explicitement classées.

Preuve attendue : matrice constat / statut / preuve / impact. Aucun changement de code n'est autorisé par cette porte seule.

## Porte 2 — Besoin et conception validés

**Objectif :** éviter de construire une solution à un besoin supposé.

Critères :
- [ ] Problème et résultat utilisateur définis.
- [ ] Périmètre inclus et exclu explicite.
- [ ] Règles métier, permissions et cas limites définis.
- [ ] Impacts sur données, sécurité, UX, offline et autres domaines analysés.
- [ ] Critères d'acceptation observables et testables.
- [ ] Décisions nécessaires obtenues explicitement.

Preuve attendue : spécification courte et décision/validation traçable. Tout point essentiel non décidé bloque la partie concernée.

## Porte 3 — Réalisation contrôlée

**Objectif :** limiter les changements au périmètre approuvé.

Critères :
- [ ] Branche dédiée et base à jour.
- [ ] Changements conformes à la conception validée.
- [ ] Aucun contournement de sécurité ou test.
- [ ] Aucun mock ou placeholder présenté comme réel.
- [ ] Compatibilité des données et contrats examinée.
- [ ] Documentation du domaine mise à jour dans la PR.

Preuve attendue : PR lisible, diff cohérent, commits traçables et documentation correspondante.

## Porte 4 — Validation technique et sécurité

**Objectif :** démontrer que le changement fonctionne et respecte les protections.

Critères applicables selon le périmètre :
- [ ] Tests unitaires et tests métier.
- [ ] Tests d'intégration des interfaces backend.
- [ ] Tests positifs et négatifs des permissions/RLS.
- [ ] Tests des migrations sur base locale vierge isolée.
- [ ] Tests Edge Functions et gestion des erreurs.
- [ ] Vérification des types, lint et build production.
- [ ] Vérification des dépendances et vulnérabilités pertinentes.
- [ ] Aucun secret ou environnement distant modifié sans autorisation.

Preuve attendue : résultats CI associés au commit exact, commandes et rapports. Un contrôle non exécuté doit rester explicitement signalé.

## Porte 5 — Parcours et expérience réelle

**Objectif :** valider l'expérience du point de vue des personnes concernées.

Critères :
- [ ] Parcours nominal testé dans l'interface réelle.
- [ ] Cas d'erreur, absence, refus et reprise testés.
- [ ] Affichage mobile et tailles d'écran pertinentes vérifiés.
- [ ] Accessibilité et lisibilité vérifiées selon le changement.
- [ ] États hors ligne/synchronisation testés si concernés.
- [ ] Aucun écran ou bouton ne promet une action non opérationnelle.
- [ ] Séparation visiteur / personne reconnue / compte authentifié respectée.

Preuve attendue : protocole d'essai, environnement, étapes, résultat et anomalies. Un test automatisé ne remplace pas un essai manuel requis.

## Porte 6 — Documentation, revue et clôture

**Objectif :** rendre le résultat compréhensible, vérifiable et maintenable.

Critères :
- [ ] Documentation alignée sur ce qui est réellement livré.
- [ ] Statut de chaque exigence indiqué.
- [ ] Limites, risques et éléments reportés documentés.
- [ ] Liens vers PR, commits et exécutions CI présents.
- [ ] Revue finale effectuée.
- [ ] Validation propriétaire obtenue lorsque requise.
- [ ] Domaine documenté et vérifié sur GitHub avant le domaine suivant.

Preuve attendue : compte rendu final complet et documentation intégrée.

## Règle de décision

- **ACCEPTÉ** : toutes les portes applicables sont franchies et les validations requises sont obtenues.
- **ACCEPTÉ AVEC RÉSERVES** : seules des réserves non bloquantes, explicites et attribuées subsistent, avec accord du responsable.
- **BLOQUÉ** : au moins un critère critique manque, un test requis échoue, une décision manque ou un risque n'est pas maîtrisé.
- **NON ÉVALUÉ** : les preuves nécessaires n'ont pas été produites.

Une porte franchie pour un lot ne vaut pas validation globale de Heritis ni validation automatique des lots suivants.
