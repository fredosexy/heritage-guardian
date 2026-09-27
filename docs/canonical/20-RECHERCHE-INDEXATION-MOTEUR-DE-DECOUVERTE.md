# 20 — RECHERCHE / INDEXATION / MOTEUR DE DÉCOUVERTE

**Projet :** Heritage Guardian / Fonciers  
**Statut :** CANONICAL — V1.0  
**Position :** 20/27  
**Type :** Spécification transverse pour recherche, indexation, découverte, ranking, géolocalisation et recherche offline

---

# 1. Mission

Définir comment l’application permet de retrouver rapidement une information utile à travers les domaines 00 à 11 sans transformer le moteur de recherche en nouvelle source de vérité ni exposer des données auxquelles l’utilisateur n’a pas accès.

Le moteur doit permettre notamment de rechercher :

- biens ;
- dossiers ;
- personnes ;
- documents ;
- procédures ;
- professionnels ;
- conflits autorisés ;
- alertes visibles ;
- activités économiques ;
- éléments historiques ;
- services et acteurs de proximité.

---

# 2. Principe fondamental

```text
SearchIndex
≠
SourceOfTruth
```

Le moteur de recherche contient des **projections dérivées**.

Les domaines propriétaires restent les sources de vérité.

---

# 3. Deux responsabilités distinctes

```text
SEARCH
=
retrouver ce qui existe déjà
```

```text
DISCOVERY
=
faire ressortir des ressources pertinentes
que l’utilisateur n’aurait pas nécessairement cherchées exactement
```

---

# 4. Recherche ≠ recommandation métier

Le moteur de recherche peut classer des résultats.

Il ne doit pas remplacer :

- le moteur de sélection des professionnels du domaine 08 ;
- le moteur Protection du domaine 10 ;
- les décisions successorales ;
- les décisions de conflit ;
- les décisions juridiques ou administratives.

---

# 5. Recherche ≠ autorisation

```text
SearchHit
¬⇒
PermissionToOpenResource
```

Le résultat visible doit déjà respecter les permissions, puis l’ouverture de la ressource revalide l’accès actuel.

---

# 6. Domaines indexables V1

```text
00 LAND_MEMORY
01 INHERITANCE
02 WILL
03 ASSET
04 TRANSMISSION
05 PERSON
06 DOCUMENT
07 PROCEDURE
08 PROFESSIONAL
09 CONFLICT
10 PROTECTION
11 ASSET_LIFECYCLE
```

Le domaine 02 est indexé de manière extrêmement restreinte, voire non indexé pour certains secrets.

---

# 7. SearchDocument

Modèle logique commun :

```text
SearchDocument {
  search_document_id

  source_domain
  entity_type
  entity_id

  title
  subtitle?
  searchable_text

  keywords[]
  tags[]

  category
  status

  general_location?
  geo_cell?
  zone_ids[]

  owner_scope_refs[]
  access_scope_refs[]

  confidentiality

  ranking_signals

  source_version
  indexed_at
}
```

---

# 8. SearchDocument ≠ copie complète

Le SearchDocument doit contenir uniquement les données nécessaires à la découverte.

Interdit par défaut :

- contenu intégral d’un document ;
- contenu d’une volonté ;
- notes privées de conflit ;
- téléphone ;
- email ;
- adresse exacte ;
- montant financier détaillé ;
- pièces d’identité ;
- coordonnées cadastrales ultra-précises non nécessaires.

---

# 9. SearchProjection

Chaque domaine expose une projection destinée à l’index.

Exemple :

```text
AssetSearchProjection {
  asset_id
  title
  asset_type
  general_location
  situation
  keywords[]
  visibility_scope
}
```

---

# 10. Index producer

Le domaine propriétaire produit ou permet de construire sa projection de recherche.

Le moteur Search ne doit pas interpréter directement toutes les tables internes des domaines.

---

# 11. Architecture recommandée

```text
Owner Domain
↓
Search Projection
↓
Indexer
↓
Search Index
↓
Search Query
↓
Permission Filter
↓
Ranked Results
↓
Authorized Open
```

---

# 12. Index dérivé

L’index doit être entièrement reconstructible à partir des sources maîtres.

```text
Delete search index
→ rebuild
→ no business data lost
```

---

# 13. Indexation initiale

La construction initiale peut utiliser :

- batch ;
- pagination ;
- projection par domaine ;
- jobs de reconstruction.

---

# 14. Mise à jour incrémentale

Les événements inter-domaines servent à invalider ou mettre à jour les projections.

Exemples :

```text
AssetUpdated
DocumentClassified
ProcedureStatusChanged
ProfessionalProfileChanged
ConflictResolved
ActivityStarted
```

---

# 15. Indexing event ≠ source de vérité

Un événement de mise à jour d’index sert uniquement à rafraîchir l’index.

Si un événement manque, un rebuild doit corriger l’index.

---

# 16. SearchIndexStatus

```text
ACTIVE
STALE
REBUILDING
FAILED
DISABLED
```

---

# 17. Stale index

Un index peut être temporairement obsolète.

Le moteur doit éviter d’afficher un résultat définitivement faux lorsqu’un refetch autoritatif est nécessaire.

---

# 18. Ouverture d’un résultat

Pattern :

```text
SearchHit
↓
Resource ref
↓
Authorized query to owner domain
↓
Fresh projection
```

---

# 19. Types de recherche

La V1 distingue :

```text
GLOBAL_SEARCH
DOMAIN_SEARCH
CONTEXTUAL_SEARCH
NEARBY_SEARCH
OFFLINE_SEARCH
AUTOCOMPLETE
FILTERED_BROWSE
```

---

# 20. Global Search

Permet une recherche transversale depuis Home ou une surface dédiée.

Exemple :

```text
"terrain Ngomedzap"
```

peut retourner :

- Asset visible ;
- dossier autorisé ;
- procédure liée ;
- professionnel correspondant ;
- mémoire historique autorisée.

---

# 21. Domain Search

Exemples :

- uniquement mes biens ;
- uniquement documents ;
- uniquement professionnels ;
- uniquement procédures.

---

# 22. Contextual Search

La recherche est limitée à un contexte.

Exemple :

```text
dans ce dossier
chercher un document
```

Le scope du dossier ne doit jamais élargir les permissions.

---

# 23. Nearby Search

Utilise la géographie autorisée pour rechercher :

- professionnels ;
- services ;
- biens visibles ;
- acteurs locaux autorisés ;
- informations publiques ou partagées.

---

# 24. Nearby ≠ exact location exposure

Le moteur peut indexer une localisation approximative :

- commune ;
- village ;
- arrondissement ;
- zone ;
- geohash/cellule.

La coordonnée exacte reste dans le domaine source si elle est sensible.

---

# 25. GeoSearchDocument

```text
GeoSearchData {
  country_code
  region_code?
  municipality?
  locality?
  zone_ids[]
  geo_cell?
  precision_level
}
```

---

# 26. PrecisionLevel

```text
COUNTRY
REGION
MUNICIPALITY
LOCALITY
ZONE
APPROXIMATE_POINT
EXACT_POINT
```

`EXACT_POINT` doit être exceptionnel dans un index général.

---

# 27. Localisation rurale

Le modèle doit supporter :

- noms de villages ;
- lieux-dits ;
- chefferies ;
- routes ;
- repères traditionnels ;
- zones non adressées formellement.

---

# 28. Alias géographiques

Un lieu peut posséder plusieurs noms.

```text
LocationAlias {
  canonical_location_id
  alias
  language?
  source?
}
```

---

# 29. Recherche linguistique

Prévoir :

- français ;
- anglais ;
- variantes orthographiques ;
- accents ;
- abréviations ;
- noms locaux ;
- fautes fréquentes.

---

# 30. Normalisation

Pipeline possible :

```text
raw query
↓
trim
↓
unicode normalize
↓
case fold
↓
accent handling
↓
tokenization
↓
synonym expansion
↓
domain-specific parsing
```

---

# 31. Texte original

La normalisation ne doit pas détruire l’original utilisateur.

Conserver la requête brute dans le contexte de session ou télémétrie safe lorsque autorisé.

---

# 32. Stop words

Éviter de supprimer mécaniquement des mots pouvant porter un sens foncier ou administratif.

Les règles de stop words doivent être spécifiques à la langue et testées.

---

# 33. Synonymes métier

Exemples possibles :

```text
terrain ↔ parcelle
héritage ↔ succession
géomètre ↔ expert géomètre selon contexte
titre foncier ↔ TF
sous-préfecture ↔ arrondissement selon contexte administratif
```

Les synonymes ne doivent pas fusionner des notions juridiquement distinctes.

---

# 34. Typo tolerance

Autoriser une tolérance raisonnable pour :

- noms de lieux ;
- professions ;
- catégories ;
- noms de personnes selon permissions.

---

# 35. Typo tolerance sensible

Pour les Personnes, une approximation trop large peut provoquer une fuite d’existence.

Le moteur doit limiter les fuzzy matches selon scope et confidentialité.

---

# 36. Autocomplete

L’autocomplete doit utiliser des suggestions déjà autorisées.

Il ne doit jamais révéler :

- noms de personnes privées non accessibles ;
- titres de documents secrets ;
- existence d’une volonté ;
- nature précise d’un conflit privé.

---

# 37. SearchQuery

```text
SearchQuery {
  query
  domains[]
  categories[]
  filters

  geo_context?
  distance_limit?

  cursor?
  limit

  sort_mode?
}
```

---

# 38. SearchResult

```text
SearchResult {
  result_id
  source_ref

  result_type

  title
  subtitle?
  snippet?

  general_location?
  badges[]

  relevance_reason_codes[]

  source_version?
}
```

---

# 39. Snippet

Le snippet doit être construit à partir de champs autorisés.

Ne jamais générer un extrait à partir de texte secret puis seulement masquer le lien.

---

# 40. Result badges

Exemples :

```text
VERIFIED
DOCUMENTED
CONTESTED
NEARBY
ACTIVE
PROFESSIONAL
PROCEDURE
HISTORICAL
```

Les badges doivent refléter une sémantique documentée.

---

# 41. Ranking

La V1 utilise un ranking explicable.

```text
text relevance
+ scope relevance
+ recency where appropriate
+ proximity where appropriate
+ domain importance
+ user context
```

---

# 42. Ranking ≠ décision

Un premier résultat n’est pas automatiquement :

- le meilleur professionnel ;
- le propriétaire ;
- le bon héritier ;
- la procédure correcte sans contexte ;
- le dossier prioritaire.

---

# 43. Explainable ranking

Le moteur doit pouvoir produire des reason codes.

Exemples :

```text
TEXT_EXACT_MATCH
TITLE_MATCH
SAME_ASSET_CONTEXT
SAME_CASE_CONTEXT
NEARBY_ZONE
RECENT_ACTIVITY
ACTIVE_PROCEDURE
USER_OWNS_RESOURCE
USER_PARTICIPATES_IN_CASE
```

---

# 44. Pas de score opaque exposé comme vérité

Un score interne peut exister techniquement.

L’UI ne doit pas le présenter comme un niveau de légitimité ou de fiabilité juridique.

---

# 45. Ranking professionnels

La recherche peut retrouver des professionnels.

Mais la recommandation finale doit passer par le domaine 08 :

```text
Search
→ candidate discovery
→ Domain 08 eligibility
→ compatibility
→ explainable recommendation
```

---

# 46. Eligibility before ranking

Un professionnel incompatible ou non habilité ne doit pas être remonté comme recommandation simplement grâce à un bon match textuel.

---

# 47. Ranking procédures

Le moteur peut rechercher une ProcedureDefinition.

La sélection d’une procédure applicable doit ensuite passer par les règles du domaine 07.

---

# 48. Ranking personnes

Par défaut, limiter aux personnes accessibles dans le contexte utilisateur.

Le système ne doit pas devenir un annuaire public de toutes les personnes.

---

# 49. Recherche documents

Index autorisé :

- titre sécurisé ;
- catégorie ;
- statut ;
- tags ;
- type ;
- dates non sensibles ;
- éventuellement texte OCR selon politique stricte.

---

# 50. OCR Search

Le texte OCR peut être indexé uniquement si :

- le document est autorisé ;
- la confidentialité le permet ;
- l’index est protégé au même niveau ;
- la suppression/expiration d’accès entraîne invalidation.

---

# 51. OCR ≠ vérité

Une correspondance OCR n’est pas une preuve que le contenu est correct.

---

# 52. Recherche conflits

Par défaut :

- seulement conflits auxquels l’utilisateur a accès ;
- snippets minimaux ;
- aucune note privée ;
- aucune position adverse non autorisée.

---

# 53. Recherche alertes

La recherche peut porter sur les alertes visibles par le principal.

`VIEW_ALERT ¬⇒ VIEW_SOURCE_RESOURCE`.

L’ouverture de la source revalide l’accès.

---

# 54. Recherche vie économique

Les résultats peuvent exposer :

- activité ;
- projet ;
- maintenance ;
- usage.

Les montants financiers sont exclus sans `VIEW_FINANCIAL_DETAILS`.

---

# 55. Search ACL

Chaque SearchDocument doit conserver suffisamment d’informations pour un préfiltrage de visibilité.

Mais la décision finale ne dépend pas uniquement de l’index.

---

# 56. ACL strategy

Combinaison :

```text
index-time filtering metadata
+
query-time authorization filtering
+
open-time owner-domain revalidation
```

---

# 57. Public / private scopes

Exemples conceptuels :

```text
PUBLIC
AUTHENTICATED
OWNER_ONLY
CASE_SCOPED
FAMILY_SCOPED
MISSION_SCOPED
EXPLICIT_GRANT
SECRET
```

---

# 58. SECRET

Les ressources SECRET peuvent être :

- non indexées ;
- indexées dans un index séparé ;
- recherchables seulement via contexte précis ;
- sans autocomplete.

---

# 59. Will Search

Par défaut, aucune recherche globale sur les volontés secrètes.

Un accès autorisé peut utiliser une query contextuelle du domaine 02.

---

# 60. Index isolation

Pour les ressources les plus sensibles, utiliser des index ou collections logiquement séparés afin de réduire les risques de fuite.

---

# 61. Search engine technology

L’architecture ne dépend pas d’un moteur particulier.

Options possibles :

- PostgreSQL full-text search ;
- pg_trgm ;
- PostGIS ;
- moteur externe futur.

La V1 peut commencer avec PostgreSQL/Supabase si les besoins de charge le permettent.

---

# 62. Full-text PostgreSQL

Approprié pour :

- documents de projection ;
- titre ;
- mots clés ;
- procédures ;
- professionnels ;
- biens.

---

# 63. Trigram

Utilisable pour :

- fautes ;
- noms de lieux ;
- noms de personnes autorisés ;
- catégories.

Doit être borné pour éviter les scans coûteux.

---

# 64. PostGIS

À utiliser pour géolocalisation structurée si activé :

- proximité ;
- rayon ;
- zone ;
- bounding box ;
- intersection.

---

# 65. Distance

La distance ne doit être calculée qu’avec une précision adaptée à la permission.

Une distance approximative est préférable lorsque la localisation exacte est privée.

---

# 66. SearchIndex tables

Modèle possible :

```text
search_documents
search_document_tokens
search_location_aliases
search_synonyms
search_index_jobs
search_index_failures
```

Les implémentations peuvent simplifier ce modèle.

---

# 67. search_documents

```text
search_documents {
  id
  source_domain
  entity_type
  entity_id

  title
  subtitle
  searchable_text
  keywords
  tags

  category
  status

  general_location
  geo_data

  confidentiality
  access_metadata

  source_version
  indexed_at
  archived_at?
}
```

---

# 68. Unique identity

Contrainte :

```text
UNIQUE(source_domain, entity_type, entity_id)
```

pour la projection courante.

---

# 69. SourceVersion

Permet d’éviter qu’un événement ancien remplace une projection plus récente.

---

# 70. IndexingStatus

```text
PENDING
INDEXING
INDEXED
FAILED_RETRYABLE
FAILED_PERMANENT
REMOVED
```

---

# 71. Indexing job

```text
IndexResource {
  source_ref
  expected_source_version?
  reason
}
```

---

# 72. Remove from index

Lorsqu’une ressource devient invisible ou supprimée logiquement :

```text
DeindexResource
```

Le retrait de l’index ne supprime pas la ressource source.

---

# 73. Confidentiality change

Un changement de confidentialité doit être traité avec priorité.

Exemple :

```text
STANDARD → SECRET
```

doit invalider rapidement l’ancienne projection.

---

# 74. Permission change

Les permissions individuelles ne doivent pas nécessairement provoquer une duplication d’index par utilisateur.

Préférer access metadata + query-time authorization.

---

# 75. Revocation

Une révocation doit empêcher immédiatement l’ouverture autorisée côté domaine source, même si l’index n’est pas encore rafraîchi.

---

# 76. Search leak prevention

En cas de doute d’autorisation :

```text
FAIL CLOSED
```

Ne pas afficher le résultat.

---

# 77. Count leak

Même le nombre de résultats peut révéler l’existence d’informations sensibles.

Les counts doivent être calculés après filtrage d’autorisation.

---

# 78. Facet leak

Les facettes doivent également être calculées uniquement sur les ressources visibles.

Exemple :

```text
"3 conflits secrets"
```

ne doit jamais apparaître pour un utilisateur non autorisé.

---

# 79. Search analytics

Les analytics peuvent mesurer :

- requêtes ;
- zéro résultat ;
- clics ;
- temps de réponse ;
- reformulations.

Mais ils ne doivent pas enregistrer en clair des requêtes sensibles sans politique adaptée.

---

# 80. Query privacy

Pour les recherches potentiellement sensibles :

- minimiser logs ;
- redacter certains termes ;
- limiter rétention ;
- utiliser IDs/agrégats analytiques.

---

# 81. Zero results

Si aucun résultat :

- suggérer filtres ;
- proposer synonymes ;
- proposer recherche contextuelle ;
- éventuellement proposer un professionnel ou une procédure via les domaines appropriés.

Ne pas inventer de résultat.

---

# 82. Suggestions

Les suggestions peuvent être :

```text
QUERY_REWRITE
FILTER_SUGGESTION
CATEGORY_SUGGESTION
NEARBY_SUGGESTION
PROCEDURE_SUGGESTION
PROFESSIONAL_DISCOVERY
```

---

# 83. Suggestion ≠ auto-action

Cliquer une suggestion déclenche une query ou ouvre un parcours.

Elle ne lance pas automatiquement une procédure ou mission.

---

# 84. Query rewrite

Vita ou le moteur peut reformuler :

```text
"papier terrain"
→ catégorie documentaire / procédure potentielle
```

La reformulation doit être visible ou explicable si elle change fortement le sens.

---

# 85. Vita + Search

Vita peut :

- reformuler une intention ;
- appeler Search ;
- filtrer par contexte ;
- présenter les résultats ;
- demander précision.

Vita ne contourne pas la sécurité Search.

---

# 86. Search context

```text
SearchContext {
  principal
  active_scope?
  current_asset_id?
  current_case_id?
  current_procedure_id?
  geo_context?
  locale
}
```

---

# 87. Context boost

Le contexte peut améliorer le ranking.

Exemple :

un document lié au dossier actuel peut être classé avant un document identique dans un autre dossier.

---

# 88. Context boost ≠ permission

Le boost ne peut jamais faire apparaître une ressource non autorisée.

---

# 89. Offline Search

En faible réseau, la recherche locale doit fonctionner sur les données déjà autorisées et synchronisées.

---

# 90. OfflineIndex

Index local minimal :

- titres ;
- catégories ;
- IDs ;
- général location ;
- status ;
- snippets safe ;
- last_sync_version.

---

# 91. Offline index ≠ serveur

Les résultats offline doivent indiquer qu’ils proviennent d’une copie locale potentiellement ancienne.

---

# 92. Sensitive offline index

Les ressources `SECRET` peuvent être exclues de l’index offline ou protégées selon politique du document 23.

---

# 93. Offline query

```text
local query
→ local authorized cache
→ offline results
```

Aucune recherche serveur n’est simulée si les données ne sont pas présentes.

---

# 94. Reconnect

Au retour réseau :

1. synchroniser permissions ;
2. invalider ressources révoquées ;
3. synchroniser données ;
4. reconstruire l’index local ;
5. relancer la query serveur si nécessaire.

---

# 95. SearchResult freshness

Le résultat peut porter :

```text
indexed_at
source_version
freshness_hint
```

---

# 96. FreshnessHint

```text
FRESH
POSSIBLY_STALE
OFFLINE_COPY
REFRESH_REQUIRED
```

---

# 97. Cache Search

Une query de recherche peut être cachée brièvement si :

- principal identique ;
- mêmes permissions/scopes ;
- mêmes filtres ;
- TTL court.

---

# 98. Cache key

Doit inclure :

```text
principal
authorization_context_version
query
filters
locale
geo_scope
```

lorsque pertinent.

---

# 99. Performance

Objectifs V1 :
- réponse rapide sur recherche courante ;
- pagination ;
- pas de scans complets ;
- index adaptés ;
- limites de query ;
- debounce autocomplete.

Les budgets précis seront suivis au document 24/25.

---

# 100. Search timeout

Une recherche coûteuse doit être interrompue plutôt que saturer la base.

Retour possible :

```text
SEARCH_TEMPORARILY_UNAVAILABLE
SEARCH_QUERY_TOO_BROAD
```

---

# 101. Query limits

Imposer :

- longueur max ;
- nombre de filtres ;
- rayon max ;
- limit max ;
- profondeur max.

---

# 102. Empty query

Une query vide ne doit pas retourner toutes les données privées.

Elle devient soit :
- browse contrôlé ;
- suggestions ;
- résultats récents autorisés.

---

# 103. Wildcards

Les wildcards libres côté client ne doivent pas entraîner des scans globaux non bornés.

---

# 104. Search APIs

Exemples :

```text
SearchGlobal
SearchAssets
SearchDocuments
SearchProcedures
SearchProfessionals
SearchPeopleInContext
SearchNearbyServices
AutocompleteSearch
```

---

# 105. SearchGlobal

Retourne un mélange de catégories avec quotas par type pour éviter qu’un domaine monopolise la première page.

---

# 106. SearchAssets

Filtres :
- type ;
- situation ;
- zone ;
- ownership relation autorisée ;
- status.

---

# 107. SearchDocuments

Filtres :
- category ;
- verification status ;
- date ;
- target context ;
- confidentiality autorisée.

---

# 108. SearchProfessionals

Recherche brute de profils/acteurs disponibles.

La vérification d’éligibilité finale appartient au domaine 08.

---

# 109. SearchProcedures

Recherche de definitions/projections actives.

La détermination d’applicabilité finale appartient au domaine 07.

---

# 110. SearchPeopleInContext

Toujours contextualisé :

```text
family
case
asset
mission
organization
```

Pas d’annuaire global des personnes privées.

---

# 111. SearchNearbyServices

Peut utiliser :
- zone ;
- profession ;
- compétence ;
- disponibilité publiée ;
- habilitation compatible.

La recommandation finale passe au moteur 08.

---

# 112. Facettes V1

Exemples :
- catégorie ;
- type ;
- status ;
- zone ;
- période ;
- owner/participant context ;
- documented/verified ;
- active/inactive.

---

# 113. Access-filter first

Lorsque possible :

```text
authorization scope filter
→ search
→ rank
```

plutôt que :
```text
search everything
→ filter later
```

afin de réduire les risques de fuite et le coût.

---

# 114. Re-ranking

Une seconde phase peut réordonner uniquement les résultats déjà autorisés.

---

# 115. SearchExplain

```text
SearchExplain {
  reason_codes[]
  matched_fields[]
  context_boosts[]
}
```

N’exposer aucun score interne sensible.

---

# 116. Moderation

Les contenus masqués/bloqués par modération ne doivent pas réapparaître via Search.

---

# 117. Archived resources

Par défaut, exclus de la recherche courante.

Un filtre explicite peut permettre la recherche historique si autorisée.

---

# 118. Historical search

Le domaine 00 et les historiques de dossiers peuvent offrir une recherche spécifique.

Elle doit afficher clairement le caractère historique.

---

# 119. Duplicate results

Lorsque plusieurs projections représentent la même ressource, éviter les doublons.

Utiliser `source_ref` canonique.

---

# 120. Cross-domain grouping

Exemple :

```text
Asset A
├── Procedure P
├── Conflict C
└── Documents
```

L’UI peut regrouper visuellement les résultats mais chaque résultat reste propriétaire de son domaine.

---

# 121. Search indexing events

Événements/handlers internes possibles :

```text
search.resource.index-requested
search.resource.indexed
search.resource.deindexed
search.index.rebuild-started
search.index.rebuild-completed
search.index.rebuild-failed
```

Ce sont des événements système, pas patrimoniaux.

---

# 122. Index job status

```text
PENDING
RUNNING
SUCCEEDED
FAILED_RETRYABLE
FAILED_PERMANENT
```

---

# 123. Rebuild

Un rebuild peut être global ou par domaine.

```text
RebuildSearchIndex(domain?)
```

---

# 124. Blue/green rebuild

Pour éviter une indisponibilité :
- construire nouvel index ;
- valider ;
- basculer ;
- retirer ancien index.

À utiliser si l’implémentation le nécessite.

---

# 125. Index schema version

```text
search_schema_version
```

permet de reconstruire lors d’un changement incompatible.

---

# 126. Search migrations

Un changement d’index ne doit pas nécessiter de migrer les données maîtres si le changement est purement projectionnel.

---

# 127. Personalization

La V1 peut booster :
- mes biens ;
- mes dossiers ;
- zones récentes ;
- contexte courant.

Elle ne doit pas cacher arbitrairement les résultats plus pertinents.

---

# 128. Profilage minimal

La personnalisation Search doit rester limitée au besoin fonctionnel.

Ne pas créer un profil comportemental excessif.

---

# 129. Audit sensible

Certaines recherches très sensibles peuvent être auditées :
- recherche de document secret ;
- recherche admin ;
- recherche support avec accès exceptionnel.

---

# 130. Support search

Le service support ne doit pas disposer d’une recherche globale universelle.

Les scopes Support doivent être explicitement définis et audités.

---

# 131. Backoffice search

Les recherches admin doivent respecter :
- rôle ;
- raison d’accès ;
- minimisation ;
- audit ;
- restrictions sur les données secrets.

---

# 132. Search error codes

```text
SEARCH_INVALID_QUERY
SEARCH_QUERY_TOO_BROAD
SEARCH_NOT_AUTHORIZED
SEARCH_INDEX_UNAVAILABLE
SEARCH_INDEX_STALE
SEARCH_SCHEMA_UNSUPPORTED
SEARCH_TEMPORARILY_UNAVAILABLE
SEARCH_GEO_NOT_AVAILABLE
SEARCH_OFFLINE_LIMITED
```

---

# 133. Tests fonctionnels

### TEST-SEARCH-001
Un utilisateur retrouve son Asset par titre.

### TEST-SEARCH-002
Une faute mineure sur un lieu peut retourner le bon résultat autorisé.

### TEST-SEARCH-003
Une query contextuelle limite correctement le scope.

### TEST-SEARCH-004
Un résultat archivé n’apparaît pas par défaut.

### TEST-SEARCH-005
Une ressource contestée affiche son statut sans conclure qu’elle est fausse.

---

# 134. Tests sécurité

### TEST-SEARCH-006
Une personne non autorisée n’apparaît pas en autocomplete.

### TEST-SEARCH-007
Une volonté secrète ne révèle pas son existence en recherche globale.

### TEST-SEARCH-008
Un document secret n’est pas compté dans les facettes d’un utilisateur non autorisé.

### TEST-SEARCH-009
Une révocation empêche l’ouverture même si le SearchHit est encore en cache.

### TEST-SEARCH-010
Les snippets n’exposent pas de texte secret.

### TEST-SEARCH-011
Les résultats financiers masquent les montants sans permission financière.

---

# 135. Tests ranking

### TEST-SEARCH-012
Un exact title match est priorisé sur un match faible, à permissions égales.

### TEST-SEARCH-013
Un context boost ne contourne jamais une permission.

### TEST-SEARCH-014
Un professionnel non éligible n’est pas transformé en recommandation automatique.

### TEST-SEARCH-015
Le moteur peut retourner des reason codes explicables.

---

# 136. Tests géographiques

### TEST-SEARCH-016
Nearby search respecte la zone autorisée.

### TEST-SEARCH-017
Une localisation approximative n’expose pas le point exact.

### TEST-SEARCH-018
Un alias de village retrouve la localisation canonique.

### TEST-SEARCH-019
Un rayon excessif est rejeté ou borné.

---

# 137. Tests offline

### TEST-SEARCH-020
La recherche locale fonctionne sur les données synchronisées.

### TEST-SEARCH-021
Un résultat offline est marqué potentiellement ancien.

### TEST-SEARCH-022
Une révocation synchronisée retire la ressource de l’index local.

### TEST-SEARCH-023
Les ressources non mises en cache ne sont pas inventées offline.

---

# 138. Tests indexation

### TEST-SEARCH-024
AssetUpdated rafraîchit la projection Search.

### TEST-SEARCH-025
Un événement ancien ne remplace pas une source_version plus récente.

### TEST-SEARCH-026
Le rebuild complet reconstruit l’index sans modifier les domaines.

### TEST-SEARCH-027
Un changement de confidentialité retire rapidement une ancienne projection visible.

---

# 139. Invariants Search

### INV-SEARCH-001
SearchIndex n’est jamais source de vérité.

### INV-SEARCH-002
Aucun résultat non autorisé ne doit être exposé.

### INV-SEARCH-003
Une SearchHit ne transfère aucune permission.

### INV-SEARCH-004
Les counts/facets respectent les mêmes permissions que les résultats.

### INV-SEARCH-005
Les ressources SECRET sont exclues de l’index général sauf politique explicite.

### INV-SEARCH-006
Les snippets utilisent uniquement des données autorisées.

### INV-SEARCH-007
La proximité ne révèle pas une localisation plus précise que la permission.

### INV-SEARCH-008
L’index est reconstructible.

### INV-SEARCH-009
Une projection ancienne ne doit pas écraser une nouvelle version.

### INV-SEARCH-010
Le ranking ne décide aucun droit patrimonial.

### INV-SEARCH-011
La recherche de professionnels ne remplace pas l’éligibilité du domaine 08.

### INV-SEARCH-012
La recherche de procédures ne remplace pas l’applicabilité du domaine 07.

### INV-SEARCH-013
L’autocomplete ne révèle aucune existence secrète.

### INV-SEARCH-014
Le Search offline ne prétend pas disposer de données non synchronisées.

### INV-SEARCH-015
Une requête vide ne retourne pas toutes les données privées.

---

# 140. Architecture cible

```text
Owner Domains
     │
     ├── Search Projections
     │
     ▼
   Indexer
     │
     ▼
 Search Index
     │
     ▼
 Query Parser
     │
     ▼
 Authorization Filter
     │
     ▼
 Retrieval
     │
     ▼
 Explainable Ranking
     │
     ▼
 Search Results
     │
     ▼
 Owner-domain Refetch
```

---

# 141. Offline architecture

```text
Authorized synced projections
↓
Local search index
↓
Offline query
↓
Offline result + freshness hint
↓
Reconnect
↓
Permission refresh
↓
Index refresh
```

---

# 142. Règle finale

> **La recherche aide à retrouver ; elle ne certifie, ne décide et ne transfère aucun droit.**

> **Le moteur indexe des projections minimales et reconstructibles, jamais les vérités métier complètes.**

> **La sécurité s’applique avant l’exposition, pendant la query et lors de l’ouverture de la ressource. Une information inaccessible ne doit pas être révélée par un résultat, un compteur, une facette, un autocomplete ou un snippet.**

> **Le ranking reste explicable : il améliore l’ordre des résultats autorisés mais ne devient jamais un jugement juridique ou une recommandation métier autonome.**

> **La formule normative est : Owner Domain → Safe Search Projection → Index → Authorization Filter → Explainable Retrieval/Ranking → SearchHit → Authorized Fresh Query.**

---

**Fin — 20-RECHERCHE-INDEXATION-MOTEUR-DE-DECOUVERTE.md**  
**Version 1.0 — Document 20/27**
