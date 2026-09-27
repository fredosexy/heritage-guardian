# 23 — SÉCURITÉ APPLICATIVE TRANSVERSE

**Projet :** Heritage Guardian / Fonciers  
**Statut :** CANONICAL — V1.0  
**Position :** 23/27  
**Type :** Spécification transverse sécurité applicative, données, accès, PWA, offline, stockage, dépendances et incidents

---

# 1. Mission

Définir les règles de sécurité applicables à l’ensemble du système, indépendamment du domaine métier concerné.

Le document couvre :

- authentification ;
- sessions ;
- autorisation ;
- RLS ;
- actions sensibles ;
- secrets ;
- fichiers et Storage ;
- frontend/PWA ;
- offline ;
- injections ;
- abus et fraude ;
- rate limiting ;
- événements et Realtime ;
- supply chain ;
- sauvegardes ;
- audit ;
- incidents ;
- tests.

---

# 2. Principe fondamental

```text
Security
≠
UI restriction
```

La sécurité doit être appliquée au niveau serveur, base de données, stockage et contrats d’application.

---

# 3. Défense en profondeur

```text
Authentication
↓
Authorization
↓
Domain invariants
↓
RLS
↓
Storage policies
↓
Audit
↓
Monitoring
```

Aucune couche ne doit être considérée comme suffisante à elle seule.

---

# 4. Zero trust applicatif

Toute requête doit être considérée comme non fiable jusqu’à validation.

```text
Client input
≠
trusted input
```

---

# 5. Classification des données

Niveaux recommandés :

```text
PUBLIC
INTERNAL
SENSITIVE
HIGHLY_SENSITIVE
SECRET
```

---

# 6. Exemples

### PUBLIC
Contenus explicitement destinés au public.

### INTERNAL
Métadonnées techniques sans risque majeur.

### SENSITIVE
Informations patrimoniales générales.

### HIGHLY_SENSITIVE
Documents, conflits, relations, procédures privées.

### SECRET
Volontés secrètes, permissions critiques, données d’identité particulièrement sensibles, certaines informations financières.

---

# 7. Data minimization

Le système ne collecte et ne transmet que ce qui est nécessaire.

```text
NeedToKnow
>
Convenience
```

---

# 8. Person ≠ UserAccount

Le référentiel Person du domaine 05 reste distinct de l’identité d’authentification.

La compromission d’un compte ne doit pas modifier automatiquement la vérité patrimoniale d’une Person.

---

# 9. Authentication

Supabase Auth ou mécanisme équivalent gère l’authentification.

Exigences :

- session vérifiée ;
- tokens courts/rotatifs selon plateforme ;
- invalidation à la déconnexion ;
- protection contre réutilisation de session ;
- gestion des comptes désactivés.

---

# 10. Session server-side

Le backend reconstruit le principal à partir de la session vérifiée.

Interdit :

```text
trust payload.actor_user_id
```

---

# 11. MFA

La V1 peut prévoir une activation MFA pour :

- administrateurs ;
- support privilégié ;
- opérateurs sécurité ;
- actions particulièrement sensibles.

La politique exacte dépendra du niveau de risque réel.

---

# 12. Session expiry

Une session expirée doit :

- bloquer les nouvelles commandes ;
- invalider les accès privés ;
- forcer réauthentification ;
- préserver localement les drafts non sensibles selon politique.

---

# 13. Login abuse

Mesures :

- rate limiting ;
- cooldown ;
- logs ;
- verrouillage progressif si nécessaire ;
- aucune indication excessive sur l’existence d’un compte.

---

# 14. Authorization

Référence canonique : document 15.

```text
RoleGrant
+ ExplicitGrant
+ ValidMandate
+ ValidMissionScope
+ ContextGrant
- ExplicitDeny
- ConflictRestriction
- ConfidentialityRestriction
= EffectivePermission
```

`DENY > ALLOW`.

---

# 15. Authorization server-side

Toute mutation et lecture sensible doit être autorisée côté serveur ou RLS.

Une UI cachée ne constitue jamais une sécurité.

---

# 16. Authorization non-transitivity

```text
VIEW_CASE
¬⇒
VIEW_SECRET_DOCUMENT
```

```text
VIEW_ALERT
¬⇒
VIEW_SOURCE_RESOURCE
```

```text
VIEW_ACTIVITY
¬⇒
VIEW_FINANCIAL_DETAILS
```

---

# 17. Representation security

Toute action représentée conserve :

```text
actor_user_id
represented_person_id
mandate_id
acting_role
```

Le mandat est revalidé au moment de l’action sensible.

---

# 18. RLS

Principe :

```text
DENY BY DEFAULT
```

Toutes les tables exposées au client ont des policies explicites.

---

# 19. RLS design

Une policy doit vérifier selon besoin :

- principal ;
- ownership/relation ;
- scope ;
- permission ;
- mandat ;
- mission ;
- deny ;
- confidentialité ;
- statut actif.

---

# 20. RLS ≠ logique métier complète

Les règles complexes peuvent nécessiter :

- RPC sécurisée ;
- Application Service ;
- fonction SQL contrôlée.

Mais la RLS continue de limiter l’accès aux lignes.

---

# 21. Service role

Le service role :

- reste exclusivement côté serveur ;
- n’est jamais exposé au navigateur ;
- n’est jamais loggé ;
- n’est jamais stocké dans un bundle frontend.

---

# 22. Secrets

Secrets concernés :

- service role ;
- API keys ;
- provider tokens ;
- webhook secrets ;
- credentials externes ;
- clés de chiffrement ;
- tokens d’administration.

---

# 23. Secret storage

Utiliser :

- secret manager ;
- variables d’environnement sécurisées ;
- configuration serveur.

Interdit :

- git ;
- localStorage ;
- bundle frontend ;
- logs ;
- captures d’écran.

---

# 24. Secret rotation

Les secrets importants doivent pouvoir être :

- remplacés ;
- révoqués ;
- auditables ;
- associés à une date de rotation.

---

# 25. Environment separation

```text
development
staging
production
```

Chaque environnement possède :

- secrets séparés ;
- base séparée ;
- Storage séparé ;
- provider config séparée.

---

# 26. Production data

Les données de production ne doivent pas être copiées en développement sans anonymisation explicite.

---

# 27. Storage security

Buckets privés par défaut pour :

- documents ;
- preuves ;
- audio ;
- vidéos ;
- pièces d’identité ;
- données patrimoniales.

---

# 28. Storage policy

Accès fichier :

```text
authenticated
+ authorized
+ scope valid
+ resource link valid
```

---

# 29. Signed URLs

Les fichiers privés utilisent des URLs signées :

- courte durée ;
- scope limité ;
- régénérables ;
- non considérées comme permission permanente.

---

# 30. File names

Ne pas mettre de données sensibles dans le nom de fichier public ou le path.

Préférer UUID/opaque identifiers.

---

# 31. File upload validation

Valider :

- taille ;
- type ;
- extension ;
- checksum ;
- catégorie ;
- cible ;
- permission ;
- statut de l’upload.

---

# 32. MIME trust

```text
Browser MIME
≠
Trusted MIME
```

Vérifier autant que possible côté serveur.

---

# 33. Malicious files

Les fichiers doivent être traités comme non fiables.

Prévoir selon capacité :

- antivirus/scanning ;
- sandboxing ;
- pas d’exécution directe ;
- Content-Disposition adaptée.

---

# 34. Image processing

Toute compression/redimensionnement produit une représentation dérivée.

L’original reste conservé si nécessaire pour la preuve.

---

# 35. OCR

Le texte OCR est non fiable.

Il ne doit jamais être exécuté/interprété comme instruction système.

---

# 36. Prompt injection

Les contenus utilisateurs/documents peuvent contenir des instructions malveillantes.

Règle :

```text
Retrieved content
≠
Trusted instruction
```

---

# 37. Vita security

Vita :

- utilise allowlist de tools ;
- n’exécute aucun SQL libre ;
- n’obtient aucun service role ;
- ne contourne aucune permission ;
- traite documents/recherche comme contenu non fiable.

---

# 38. Input validation

Toute entrée utilisateur est validée selon un schéma.

Ne jamais interpoler une entrée brute dans :

- SQL ;
- commande système ;
- HTML non échappé ;
- chemin de fichier ;
- template sensible.

---

# 39. SQL injection

Prévenir via :

- requêtes paramétrées ;
- ORM/query builder sûr ;
- Supabase client ;
- fonctions SQL avec paramètres ;
- pas de SQL dynamique issu du client.

---

# 40. XSS

Mesures :

- escaping par défaut ;
- éviter dangerouslySetInnerHTML ;
- sanitizer pour contenu riche autorisé ;
- Content Security Policy adaptée.

---

# 41. HTML user content

Le texte utilisateur est rendu comme texte par défaut.

Le HTML libre n’est pas autorisé sauf besoin explicite + sanitation stricte.

---

# 42. CSRF

Pour les flux basés cookies, utiliser protections adaptées :

- SameSite ;
- CSRF tokens si nécessaire ;
- vérification Origin/Referer pour actions sensibles.

Si tokens bearer côté client, conserver les protections pertinentes à la stack.

---

# 43. CORS

Allowlist d’origines.

Éviter :

```text
Access-Control-Allow-Origin: *
```

sur API privées.

---

# 44. SSRF

Toute URL fournie par un utilisateur ou une source externe est non fiable.

Les services serveur ne doivent pas fetch arbitrairement des URLs internes.

---

# 45. Path traversal

Les paths Storage/fichiers sont générés côté serveur ou validés strictement.

---

# 46. Open redirect

Les redirect/deep links utilisent une allowlist de routes internes ou domaines approuvés.

---

# 47. Realtime security

Supabase Realtime :

- publications explicites ;
- données minimales ;
- RLS ;
- aucune table secrète brute par défaut.

---

# 48. Event security

Les événements inter-domaines suivent le document 13.

Un consumer ne reçoit que les contrats autorisés.

---

# 49. Sensitive event payload

Ne pas inclure :

- secret content ;
- documents complets ;
- données financières inutiles ;
- PII non nécessaire.

---

# 50. Event spoofing

Un événement entrant d’une source externe doit être authentifié et adapté avant d’être transformé en événement interne.

---

# 51. Webhooks

Tout webhook doit idéalement avoir :

- signature ;
- timestamp ;
- anti-replay ;
- idempotency ;
- allowlist si appropriée.

---

# 52. Offline security

```text
Offline cache
=
sensitive local copy
```

Il doit être considéré comme une surface d’attaque.

---

# 53. Offline data minimization

Ne stocker localement que ce qui est nécessaire.

Les données SECRET peuvent être exclues du cache local.

---

# 54. Local storage

Éviter de stocker des secrets dans localStorage.

Les données sensibles locales utilisent les mécanismes de stockage les plus appropriés à la plateforme.

---

# 55. Multi-account device

Partitionner les données locales par compte.

À la déconnexion :

- arrêter sync ;
- invalider session ;
- purger ou isoler cache privé ;
- empêcher compte B de lire les données du compte A.

---

# 56. Offline queued commands

À la reconnexion, revalider :

- auth ;
- permission ;
- mandat ;
- scope ;
- target state ;
- expected_version.

---

# 57. Revoked offline access

Une commande préparée offline doit être rejetée si l’accès a été révoqué.

Le draft peut rester visible localement si la politique le permet, sans être appliqué.

---

# 58. PWA service worker

Le service worker ne doit pas :

- mettre en cache des réponses privées sans stratégie sûre ;
- servir des données d’un autre utilisateur ;
- conserver indéfiniment des données sensibles.

---

# 59. Cache partitioning

Clé de cache incluant le contexte utilisateur lorsqu’une donnée privée est cachée.

---

# 60. PWA update security

Une mise à jour critique de sécurité peut imposer :

- invalidation de cache ;
- refresh ;
- version minimale.

---

# 61. Content Security Policy

La production doit utiliser une CSP adaptée.

Objectifs :

- réduire XSS ;
- limiter scripts externes ;
- contrôler frames ;
- contrôler connexions.

---

# 62. Security headers

Prévoir selon hébergement :

- Content-Security-Policy ;
- X-Content-Type-Options ;
- Referrer-Policy ;
- Permissions-Policy ;
- Strict-Transport-Security en HTTPS approprié.

---

# 63. HTTPS

Production :

```text
HTTPS only
```

Aucune donnée privée via HTTP clair.

---

# 64. Abuse prevention

Catégories :

- spam ;
- création massive ;
- scraping ;
- upload abusif ;
- tentative d’accès ;
- harcèlement via conflit/message ;
- enumeration de personnes ;
- notification abuse.

---

# 65. Rate limiting

Combiner :

```text
principal
+ IP/device signal when lawful/useful
+ action
+ resource
+ window
```

---

# 66. Sensitive rate limits

Plus stricts pour :

- login ;
- OTP ;
- password reset ;
- signed URL ;
- search people ;
- secret resource access ;
- uploads ;
- invitations ;
- webhook ;
- admin actions.

---

# 67. Search security

Référence document 20.

Protéger contre :

- enumeration ;
- count leak ;
- autocomplete leak ;
- facet leak ;
- query abuse.

---

# 68. Enumeration resistance

Pour ressources secrètes, un 404/not available peut être préféré à une réponse confirmant l’existence.

---

# 69. Fraud / manipulation

Le système ne doit pas conclure automatiquement à une fraude.

Les signaux suspects sont :

```text
signals
≠
guilt
```

Ils déclenchent revue/modération.

---

# 70. Moderation

Prévoir des objets structurés :

```text
ModerationCase
ModerationSignal
ModerationDecision
ModerationAction
```

Une sanction sensible doit être auditable.

---

# 71. Security-sensitive actions

Exemples :

- grant/revoke access ;
- representation mandate ;
- MissionScope ;
- secret disclosure ;
- document verification ;
- account recovery ;
- admin override ;
- purge ;
- export complet.

---

# 72. Sensitive action controls

Selon risque :

- re-authentication ;
- confirmation ;
- second factor ;
- maker-checker ;
- cooldown ;
- audit renforcé.

---

# 73. Maker-checker

Recommandé pour :

- purge définitive ;
- changement d’accès critique ;
- action admin à fort impact ;
- certaines vérifications professionnelles indépendantes.

---

# 74. No self-approval

Lorsqu’une indépendance est exigée :

```text
maker_id
≠
checker_id
```

---

# 75. Data export

Tout export doit :

- respecter permissions ;
- minimiser champs ;
- être audité ;
- avoir durée de disponibilité limitée ;
- être protégé par URL signée ou mécanisme équivalent.

---

# 76. Bulk export

Restreint aux rôles explicitement autorisés.

---

# 77. Data import

Tout import :

- valide format ;
- valide permissions ;
- conserve provenance ;
- ne bypass pas les domaines ;
- peut passer par staging/review.

---

# 78. Data retention

Chaque type de données doit avoir une politique :

```text
retention_period
archive_policy
purge_policy
legal_hold?
```

---

# 79. Legal hold / preservation

Une ressource sous conservation obligatoire ne doit pas être purgée par un job générique.

---

# 80. Hard delete

Exceptionnel pour :

- brouillons sans dépendance ;
- données temporaires ;
- purge explicitement autorisée.

Interdit par défaut pour :
- historique de propriété ;
- accords ;
- audit ;
- procédures finalisées ;
- conflits ;
- transmissions ;
- preuves historiques.

---

# 81. Backups

Production doit prévoir :

- sauvegarde DB ;
- sauvegarde/stratégie Storage ;
- tests de restauration ;
- rétention adaptée ;
- contrôle d’accès.

---

# 82. Backup encryption

Les backups doivent bénéficier des protections de chiffrement et accès appropriées.

---

# 83. Backup restore

Un backup non testé n’est pas une stratégie de reprise.

Prévoir exercices de restauration.

---

# 84. Recovery objectives

Définir :

```text
RPO
RTO
```

selon criticité.

Les valeurs exactes seront précisées au document 26.

---

# 85. Logging

Logs techniques :

- minimaux ;
- structurés ;
- sans secrets ;
- sans payloads sensibles complets.

---

# 86. Audit

Audit métier/sécurité séparé du log technique.

Référence document 24.

---

# 87. Security audit event

Conserver :

```text
actor
acting_role
represented_person
action
target
result
reason_code
timestamp
correlation_id
```

---

# 88. Immutable audit

Les traces critiques sont append-only ou protégées contre modification non autorisée.

---

# 89. Admin access audit

Toute lecture exceptionnelle admin/support de données privées doit être auditable.

---

# 90. Support impersonation

Éviter l’impersonation complète.

Préférer des scopes de support limités et read-only lorsque possible.

---

# 91. Break-glass access

Si un accès exceptionnel est nécessaire :

- rôle dédié ;
- durée limitée ;
- justification ;
- audit ;
- notification interne sécurité.

---

# 92. Security monitoring

Détecter :

- échecs auth ;
- access denied répétés ;
- spike uploads ;
- spike signed URLs ;
- changements permissions ;
- dead letters sécurité ;
- jobs critiques échoués ;
- erreurs RLS.

---

# 93. SecurityAlert

Les alertes techniques de sécurité sont distinctes de ProtectionAlert patrimoniale.

---

# 94. Incident severity

Exemple :

```text
SEV-1 CRITICAL
SEV-2 HIGH
SEV-3 MEDIUM
SEV-4 LOW
```

---

# 95. Incident lifecycle

```text
DETECTED
TRIAGED
CONTAINED
ERADICATED
RECOVERING
RESOLVED
POSTMORTEM
```

---

# 96. Incident response

Étapes :

1. détecter ;
2. limiter l’impact ;
3. préserver preuves techniques ;
4. révoquer secrets/tokens si nécessaire ;
5. corriger ;
6. restaurer ;
7. analyser ;
8. documenter actions préventives.

---

# 97. Security contact

Le projet doit définir une responsabilité claire pour les incidents de sécurité.

---

# 98. Vulnerability management

Les vulnérabilités sont suivies avec :

- sévérité ;
- composant ;
- état ;
- correctif ;
- date ;
- preuve de validation.

---

# 99. Supply chain

Toute dépendance tierce est une surface d’attaque.

---

# 100. Dependency controls

- lockfile committé ;
- versions maîtrisées ;
- revue des mises à jour ;
- audit de vulnérabilités ;
- dépendances inutiles supprimées.

---

# 101. Package installation

Éviter les packages inconnus pour des besoins triviaux.

Préférer dépendances reconnues ou code simple interne.

---

# 102. Dependency pinning

Les dépendances critiques peuvent être pinées ou limitées par ranges contrôlés.

---

# 103. CI security

La CI peut inclure :

- dependency audit ;
- secret scanning ;
- lint ;
- typecheck ;
- tests RLS ;
- tests sécurité ;
- build reproductible.

---

# 104. Secret scanning

Bloquer un commit contenant :

- clés API ;
- JWT secrets ;
- service role ;
- credentials.

---

# 105. SAST

Utiliser analyse statique lorsque pertinente pour détecter :

- injection ;
- secrets ;
- patterns dangereux ;
- dépendances à risque.

---

# 106. DAST

Sur environnement dédié, tester :

- auth ;
- routes ;
- RLS ;
- uploads ;
- headers ;
- injection ;
- rate limiting.

---

# 107. Branch protection

Main doit idéalement exiger :

- PR/review ;
- checks CI ;
- absence de secrets ;
- tests critiques.

---

# 108. Production deploy

Une modification sécurité critique ne doit pas être déployée sans :

- tests ;
- migration review ;
- RLS review ;
- rollback plan.

---

# 109. Database migrations

Toute migration de table sensible vérifie :

- RLS active ;
- grants ;
- indexes ;
- triggers ;
- functions security definer ;
- ownership.

---

# 110. SECURITY DEFINER

Une fonction SQL `SECURITY DEFINER` doit être exceptionnelle.

Exigences :

- owner sûr ;
- search_path fixé ;
- input validation ;
- permission check ;
- surface minimale.

---

# 111. SQL functions

Pas de fonction générique permettant d’exécuter arbitrairement des opérations au nom du service role.

---

# 112. Database extensions

N’activer que les extensions nécessaires.

---

# 113. Encryption in transit

Toutes communications externes via TLS.

---

# 114. Encryption at rest

S’appuyer sur les protections du fournisseur/infra et ajouter des mesures applicatives si la classification l’exige.

---

# 115. Application-level encryption

À envisager pour certains secrets particulièrement critiques si besoin réel.

Mais :
- gestion des clés ;
- rotation ;
- indexation ;
- récupération ;

doivent être conçues avant usage.

---

# 116. Passwords

Les mots de passe sont gérés uniquement via le provider d’authentification sécurisé.

Jamais stockés dans les tables métier.

---

# 117. OTP

Les OTP :
- expirent rapidement ;
- usage unique ;
- rate-limited ;
- jamais loggés.

---

# 118. Account recovery

Doit éviter :
- takeover ;
- enumeration ;
- support override non audité.

---

# 119. Account disable

Un compte désactivé ne doit plus pouvoir :
- ouvrir session ;
- synchroniser ;
- accéder aux fichiers ;
- utiliser anciennes signed URLs au-delà de leur TTL.

---

# 120. Data ownership after account disable

Les objets patrimoniaux ne sont pas supprimés parce qu’un UserAccount est désactivé.

```text
UserAccountDisabled
¬⇒
PersonDeleted
¬⇒
AssetDeleted
```

---

# 121. Privacy by design

Toute nouvelle fonctionnalité documente :

- données collectées ;
- pourquoi ;
- durée ;
- visibilité ;
- possibilité de suppression/archivage ;
- consumers.

---

# 122. Telemetry privacy

Les analytics ne doivent pas contenir :
- documents ;
- volonté ;
- PII brute ;
- requêtes sensibles non redacted.

---

# 123. Device signals

Si des signaux appareil/IP sont utilisés pour abus :
- minimiser ;
- limiter la durée ;
- documenter le besoin.

---

# 124. Screenshots / previews

Les previews système peuvent exposer des données sensibles.

Prévoir selon plateforme :
- masquage de certaines surfaces ;
- pas de secret dans notifications lockscreen.

---

# 125. Clipboard

Éviter de copier automatiquement des données sensibles dans le presse-papiers.

---

# 126. Deep links

Tous deep links :
- route allowlist ;
- auth ;
- authorization ;
- pas de secrets dans URL.

---

# 127. URL/query params

Ne pas mettre dans l’URL :
- tokens ;
- secrets ;
- contenu de volonté ;
- données personnelles sensibles.

---

# 128. Browser history

Les routes doivent utiliser des IDs opaques.

---

# 129. Error reporting

Les outils de monitoring externes reçoivent :
- stack technique ;
- context minimal ;
- redaction des données sensibles.

---

# 130. Third-party SDKs

Tout SDK analytics/crash doit être évalué pour :
- données collectées ;
- région ;
- permissions ;
- nécessité.

---

# 131. Security review triggers

Revue obligatoire lors de :
- nouvelle table sensible ;
- nouveau bucket ;
- nouveau provider externe ;
- nouveau rôle ;
- nouvelle permission ;
- nouvelle Edge Function ;
- nouveau webhook ;
- nouveau flow secret.

---

# 132. Threat model

Pour chaque fonction sensible, identifier :

```text
Asset
Threat actor
Attack surface
Abuse case
Control
Detection
Recovery
```

---

# 133. Menaces prioritaires V1

- accès horizontal à un dossier d’un autre utilisateur ;
- contournement RLS ;
- accès à document secret ;
- réutilisation mandat expiré ;
- élévation de rôle ;
- upload malveillant ;
- fuite via Realtime/Search ;
- replay webhook ;
- fuite via logs ;
- manipulation offline ;
- dépendance compromise ;
- service role exposé.

---

# 134. Tests Auth

### TEST-SEC-001
Session expirée bloque la commande.

### TEST-SEC-002
Compte désactivé ne peut plus agir.

### TEST-SEC-003
actor_user_id client falsifié est ignoré.

---

# 135. Tests Authorization

### TEST-SEC-004
Un utilisateur non lié ne lit pas un Asset privé.

### TEST-SEC-005
ExplicitDeny bloque un RoleGrant.

### TEST-SEC-006
Mandat révoqué bloque l’action représentée.

### TEST-SEC-007
MissionScope expiré retire l’accès.

### TEST-SEC-008
CaseAdmin ne lit pas automatiquement un SecretDocument.

---

# 136. Tests RLS

### TEST-SEC-009
SELECT non autorisé échoue.

### TEST-SEC-010
INSERT non autorisé échoue.

### TEST-SEC-011
UPDATE hors scope échoue.

### TEST-SEC-012
DELETE direct historique échoue.

### TEST-SEC-013
Une RPC ne permet pas de bypass RLS sans contrôle explicite.

---

# 137. Tests Storage

### TEST-SEC-014
Signed URL expirée ne fonctionne plus.

### TEST-SEC-015
Utilisateur B ne télécharge pas fichier de A.

### TEST-SEC-016
Upload type interdit est rejeté.

### TEST-SEC-017
Path traversal est impossible.

---

# 138. Tests Injection

### TEST-SEC-018
Entrée SQL-like reste une donnée.

### TEST-SEC-019
HTML malveillant est échappé/sanitisé.

### TEST-SEC-020
Instruction dans document ne contrôle pas Vita.

---

# 139. Tests Offline

### TEST-SEC-021
Compte B ne voit pas cache A.

### TEST-SEC-022
Commande offline est refusée après révocation.

### TEST-SEC-023
Un cache secret exclu ne devient pas disponible offline.

---

# 140. Tests Realtime/Search

### TEST-SEC-024
Realtime ne fuite aucune ligne non autorisée.

### TEST-SEC-025
Autocomplete ne révèle pas une Person privée.

### TEST-SEC-026
Count/facet ne révèle pas ressource secrète.

---

# 141. Tests Abuse

### TEST-SEC-027
Login brute force déclenche rate limit.

### TEST-SEC-028
Génération massive de signed URLs est limitée.

### TEST-SEC-029
Upload flood est limité.

---

# 142. Tests Secrets

### TEST-SEC-030
Service role absent du bundle frontend.

### TEST-SEC-031
Secret scanner détecte une clé committée.

### TEST-SEC-032
Logs n’affichent pas les tokens.

---

# 143. Tests Recovery

### TEST-SEC-033
Backup DB peut être restauré.

### TEST-SEC-034
Une rotation de secret ne casse pas définitivement le système.

### TEST-SEC-035
Un incident peut révoquer sessions/tokens concernés.

---

# 144. Invariants sécurité

### INV-SEC-001
Toute donnée privée est deny-by-default.

### INV-SEC-002
Aucune sécurité critique uniquement dans le frontend.

### INV-SEC-003
Le service role ne quitte jamais le serveur.

### INV-SEC-004
Les secrets ne sont jamais stockés dans Git.

### INV-SEC-005
Une référence n’accorde aucune permission.

### INV-SEC-006
Un mandat expiré/révoqué n’autorise aucune nouvelle action.

### INV-SEC-007
Une MissionScope expirée n’autorise plus l’accès.

### INV-SEC-008
Les fichiers privés sont privés par défaut.

### INV-SEC-009
Les URLs signées ont une durée limitée.

### INV-SEC-010
Le contenu utilisateur est non fiable.

### INV-SEC-011
Les données SECRET sont exclues des surfaces générales.

### INV-SEC-012
Offline ne contourne jamais l’autorisation serveur.

### INV-SEC-013
Les événements et Realtime minimisent les payloads.

### INV-SEC-014
Les logs ne contiennent aucun secret.

### INV-SEC-015
Les fonctions SECURITY DEFINER sont minimales et auditées.

### INV-SEC-016
Hard delete patrimonial est exceptionnel et contrôlé.

### INV-SEC-017
Toute action admin sensible est auditable.

### INV-SEC-018
Un backup doit être restaurable.

### INV-SEC-019
Les dépendances critiques sont surveillées.

### INV-SEC-020
Une vulnérabilité critique bloque la production jusqu’à correction ou acceptation formelle du risque.

---

# 145. Security checklist — nouvelle fonctionnalité

Avant livraison :

```text
[ ] data classification
[ ] authentication requirement
[ ] permissions
[ ] RLS
[ ] input validation
[ ] output minimization
[ ] storage policy
[ ] offline policy
[ ] logging redaction
[ ] rate limiting
[ ] audit requirement
[ ] tests
[ ] incident visibility
```

---

# 146. Security checklist — nouvelle table

```text
[ ] owner domain
[ ] RLS enabled
[ ] policies tested
[ ] grants reviewed
[ ] indexes
[ ] retention
[ ] audit needs
[ ] soft delete policy
[ ] sensitive fields classified
```

---

# 147. Security checklist — nouvelle Edge Function

```text
[ ] auth
[ ] authorization
[ ] schema validation
[ ] rate limit
[ ] timeout
[ ] secrets server-only
[ ] logging redaction
[ ] idempotency if mutation
[ ] tests
```

---

# 148. Security checklist — nouveau bucket

```text
[ ] private/public decision
[ ] upload policy
[ ] read policy
[ ] signed URL TTL
[ ] file limits
[ ] scanning strategy
[ ] cleanup policy
[ ] tests
```

---

# 149. Architecture finale

```text
Client
  │
  ▼
Authentication
  │
  ▼
Application Contract
  │
  ▼
Authorization
  │
  ▼
Domain Invariants
  │
  ▼
RLS / Storage Policy
  │
  ▼
Persistence
  │
  ├── Audit
  ├── Outbox
  └── Monitoring
```

---

# 150. Règle finale

> **La sécurité n’est pas un module ajouté après le développement : elle fait partie de chaque domaine, chaque contrat, chaque table, chaque fichier et chaque interaction utilisateur.**

> **Le système fonctionne en deny-by-default. Une permission doit être explicitement démontrée, scoped, valide et non révoquée.**

> **Le frontend, Vita, Realtime, Search, Offline et les notifications ne possèdent aucun raccourci permettant de contourner l’autorisation serveur ou la RLS.**

> **La formule normative est : Authenticate → Authorize → Validate → Apply Domain Rules → Enforce RLS/Storage → Audit → Monitor → Recover.**

---

**Fin — 23-SECURITE-APPLICATIVE-TRANSVERSE.md**  
**Version 1.0 — Document 23/27**
