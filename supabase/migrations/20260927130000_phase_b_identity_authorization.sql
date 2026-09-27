-- Phase B — Identity / Person / canonical authorization convergence.
-- Reuses B2/B3/B7 and Phase A foundations. No duplicate person/access systems.

-- ============================================================================
-- 1. PERSON CANONICAL LIFECYCLE
-- ============================================================================

ALTER TABLE public.persons
  ADD COLUMN identity_status text NOT NULL DEFAULT 'DECLARED'
    CHECK (identity_status IN ('PARTIAL','DECLARED','DOCUMENTED','VERIFIED','CONTESTED','DUPLICATE_SUSPECTED')),
  ADD COLUMN death_status text NOT NULL DEFAULT 'UNKNOWN'
    CHECK (death_status IN ('UNKNOWN','DECLARED_DECEASED','DOCUMENTED_DECEASED','VERIFIED_DECEASED')),
  ADD COLUMN birth_date date,
  ADD COLUMN death_date date,
  ADD COLUMN merged_into_person_id uuid REFERENCES public.persons(id) ON DELETE RESTRICT,
  ADD COLUMN merged_at timestamptz,
  ADD COLUMN merged_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD CONSTRAINT persons_merge_consistency_check CHECK (
    (merged_into_person_id IS NULL AND merged_at IS NULL AND merged_by IS NULL)
    OR
    (merged_into_person_id IS NOT NULL AND merged_at IS NOT NULL AND merged_by IS NOT NULL)
  ),
  ADD CONSTRAINT persons_not_merged_into_self_check CHECK (
    merged_into_person_id IS NULL OR merged_into_person_id <> id
  ),
  ADD CONSTRAINT persons_dates_check CHECK (
    death_date IS NULL OR birth_date IS NULL OR death_date >= birth_date
  );

CREATE INDEX persons_identity_status_idx ON public.persons(identity_status);
CREATE INDEX persons_death_status_idx ON public.persons(death_status);
CREATE INDEX persons_merged_into_idx ON public.persons(merged_into_person_id);

-- Every account may have a linked Person, but Person remains an independent aggregate.
INSERT INTO public.persons(linked_profile_id,display_name,phone,created_by,identity_status)
SELECT p.id,COALESCE(NULLIF(btrim(p.full_name),''),'Utilisateur'),p.phone,p.id,'DECLARED'
FROM public.profiles p
WHERE NOT EXISTS(SELECT 1 FROM public.persons x WHERE x.linked_profile_id=p.id)
ON CONFLICT(linked_profile_id) DO NOTHING;

CREATE TABLE public.person_aliases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id uuid NOT NULL REFERENCES public.persons(id) ON DELETE RESTRICT,
  alias_name text NOT NULL CHECK (char_length(btrim(alias_name)) BETWEEN 2 AND 160),
  alias_type text NOT NULL DEFAULT 'OTHER'
    CHECK(alias_type IN ('DISPLAY','FORMER_NAME','SPELLING','MERGED_RECORD','OTHER')),
  source_type text NOT NULL DEFAULT 'DECLARATION'
    CHECK(source_type IN ('DECLARATION','DOCUMENT','VERIFIED')),
  source_document_id uuid REFERENCES public.proofs(id) ON DELETE SET NULL,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz
);
CREATE UNIQUE INDEX person_aliases_active_unique_idx
  ON public.person_aliases(person_id,lower(alias_name))
  WHERE revoked_at IS NULL;
CREATE INDEX person_aliases_person_idx ON public.person_aliases(person_id);

-- ============================================================================
-- 2. VERSIONED FAMILY RELATIONS
-- ============================================================================

CREATE TABLE public.family_relations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_person_id uuid NOT NULL REFERENCES public.persons(id) ON DELETE RESTRICT,
  to_person_id uuid NOT NULL REFERENCES public.persons(id) ON DELETE RESTRICT,
  relation_type text NOT NULL CHECK(relation_type IN (
    'PARENT','CHILD','SPOUSE','SIBLING','GUARDIAN','DEPENDENT','OTHER'
  )),
  status text NOT NULL DEFAULT 'DECLARED'
    CHECK(status IN ('DECLARED','DOCUMENTED','VERIFIED','CONTESTED','REVOKED')),
  current_revision integer NOT NULL DEFAULT 1 CHECK(current_revision>0),
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  CHECK(from_person_id<>to_person_id),
  CHECK((status='REVOKED')=(revoked_at IS NOT NULL))
);
CREATE INDEX family_relations_from_idx ON public.family_relations(from_person_id,status);
CREATE INDEX family_relations_to_idx ON public.family_relations(to_person_id,status);
CREATE INDEX family_relations_type_idx ON public.family_relations(relation_type,status);
CREATE UNIQUE INDEX family_relations_active_unique_idx
  ON public.family_relations(from_person_id,to_person_id,relation_type)
  WHERE status<>'REVOKED';

CREATE TABLE public.family_relation_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  relation_id uuid NOT NULL REFERENCES public.family_relations(id) ON DELETE RESTRICT,
  version_number integer NOT NULL CHECK(version_number>0),
  relation_type text NOT NULL CHECK(relation_type IN (
    'PARENT','CHILD','SPOUSE','SIBLING','GUARDIAN','DEPENDENT','OTHER'
  )),
  status text NOT NULL CHECK(status IN ('DECLARED','DOCUMENTED','VERIFIED','CONTESTED','REVOKED')),
  source_type text NOT NULL CHECK(source_type IN ('DECLARATION','DOCUMENT','VERIFIED')),
  source_document_id uuid REFERENCES public.proofs(id) ON DELETE SET NULL,
  note text CHECK(note IS NULL OR char_length(note)<=1000),
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  supersedes_revision_id uuid REFERENCES public.family_relation_revisions(id) ON DELETE RESTRICT,
  UNIQUE(relation_id,version_number)
);
CREATE INDEX family_relation_revisions_relation_idx
  ON public.family_relation_revisions(relation_id,version_number DESC);

-- ============================================================================
-- 3. MANDATE CANONICAL COMPLETION
-- ============================================================================

ALTER TABLE public.representation_mandates
  ADD COLUMN representative_person_id uuid REFERENCES public.persons(id) ON DELETE RESTRICT,
  ADD COLUMN confirmed_by_represented_at timestamptz,
  ADD COLUMN verified_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN verified_at timestamptz;

UPDATE public.representation_mandates m
SET representative_person_id=p.id
FROM public.persons p
WHERE p.linked_profile_id=m.representative_user_id
  AND m.representative_person_id IS NULL;

-- ============================================================================
-- 4. ROLE ASSIGNMENT UNIQUENESS + BACKFILL
-- ============================================================================

CREATE UNIQUE INDEX role_assignments_active_unique_idx
  ON public.role_assignments(user_id,role,scope_type,scope_id)
  WHERE status='ACTIVE';

-- Durable asset app role is derived only for a linked declared titular relation.
INSERT INTO public.role_assignments(user_id,role,scope_type,scope_id,status,assigned_by)
SELECT p.linked_profile_id,'TITULAIRE','ASSET',brh.bien_id,'ACTIVE',brh.declared_by
FROM public.bien_right_holders brh
JOIN public.persons p ON p.id=brh.person_id
WHERE p.linked_profile_id IS NOT NULL
  AND brh.status<>'revoque'
  AND brh.role IN ('titulaire','co_titulaire')
ON CONFLICT DO NOTHING;

-- Dossier ownership is an application responsibility, not a patrimonial status.
INSERT INTO public.role_assignments(user_id,role,scope_type,scope_id,status,assigned_by)
SELECT d.owner_id,'CASE_ADMIN','CASE',d.id,'ACTIVE',d.owner_id
FROM public.dossiers d
ON CONFLICT DO NOTHING;

-- Existing participants receive application roles without converting patrimonial labels.
INSERT INTO public.role_assignments(user_id,role,scope_type,scope_id,status,assigned_by)
SELECT COALESCE(p.linked_profile_id,dp.user_id),
       CASE dp.role
         WHEN 'declarant' THEN 'CONTRIBUTOR'
         WHEN 'accompagnateur' THEN 'COMPANION'
         WHEN 'temoin' THEN 'WITNESS'
         WHEN 'professionnel' THEN 'PROFESSIONAL'
         WHEN 'service' THEN 'ADMINISTRATIVE_ACTOR'
         WHEN 'autorite' THEN 'ADMINISTRATIVE_ACTOR'
         ELSE 'PARTICIPANT'
       END,
       'CASE',dp.dossier_id,'ACTIVE',dp.invited_by
FROM public.dossier_participants dp
JOIN public.persons p ON p.id=dp.person_id
WHERE dp.status='actif'
  AND COALESCE(p.linked_profile_id,dp.user_id) IS NOT NULL
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 5. EVENT CONTRACT REGISTRY
-- ============================================================================

INSERT INTO public.event_contracts(
  contract_id,event_name,event_version,producer_domain,event_category,confidentiality,ordering_policy,payload_schema,status
) VALUES
('EVT-05-001','person.person.updated',1,'person','DOMAIN_EVENT','SENSITIVE','PER_AGGREGATE','{}'::jsonb,'ACTIVE'),
('EVT-05-002','person.person.merged',1,'person','DOMAIN_EVENT','SENSITIVE','PER_AGGREGATE','{}'::jsonb,'ACTIVE'),
('EVT-05-003','person.family-relation.created',1,'person','DOMAIN_EVENT','SENSITIVE','PER_AGGREGATE','{}'::jsonb,'ACTIVE'),
('EVT-05-004','person.family-relation.revised',1,'person','DOMAIN_EVENT','SENSITIVE','PER_AGGREGATE','{}'::jsonb,'ACTIVE'),
('EVT-05-005','person.role-assignment.changed',1,'person','DOMAIN_EVENT','SENSITIVE','PER_AGGREGATE','{}'::jsonb,'ACTIVE'),
('EVT-05-006','person.permission.granted',1,'person','DOMAIN_EVENT','SENSITIVE','PER_AGGREGATE','{}'::jsonb,'ACTIVE'),
('EVT-05-007','person.permission.denied',1,'person','DOMAIN_EVENT','SENSITIVE','PER_AGGREGATE','{}'::jsonb,'ACTIVE'),
('EVT-05-008','person.permission.revoked',1,'person','DOMAIN_EVENT','SENSITIVE','PER_AGGREGATE','{}'::jsonb,'ACTIVE'),
('EVT-05-009','person.representation-mandate.created',1,'person','DOMAIN_EVENT','HIGHLY_SENSITIVE','PER_AGGREGATE','{}'::jsonb,'ACTIVE'),
('EVT-05-010','person.representation-mandate.confirmed',1,'person','DOMAIN_EVENT','HIGHLY_SENSITIVE','PER_AGGREGATE','{}'::jsonb,'ACTIVE'),
('EVT-05-011','person.representation-mandate.revoked',1,'person','DOMAIN_EVENT','HIGHLY_SENSITIVE','PER_AGGREGATE','{}'::jsonb,'ACTIVE')
ON CONFLICT(event_name,event_version) DO NOTHING;

-- ============================================================================
-- 6. INTERNAL HELPERS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.current_user_person_id()
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public SET row_security=off AS $$
  SELECT id FROM public.persons WHERE linked_profile_id=auth.uid() AND merged_into_person_id IS NULL LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.resolve_person_id(p_person_id uuid)
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public SET row_security=off AS $$
  SELECT COALESCE(p.merged_into_person_id,p.id)
  FROM public.persons p
  WHERE p.id=p_person_id
$$;

CREATE OR REPLACE FUNCTION public.person_directly_manageable(p_person_id uuid,p_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public SET row_security=off AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.persons p
    WHERE p.id=p_person_id
      AND p.merged_into_person_id IS NULL
      AND (
        p.created_by=p_user_id
        OR p.linked_profile_id=p_user_id
        OR public.has_role(p_user_id,'admin')
      )
  )
$$;

CREATE OR REPLACE FUNCTION public.person_directly_visible(p_person_id uuid,p_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public SET row_security=off AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.persons p
    WHERE p.id=p_person_id
      AND (
        p.created_by=p_user_id
        OR p.linked_profile_id=p_user_id
        OR public.has_role(p_user_id,'admin')
        OR EXISTS(
          SELECT 1 FROM public.bien_right_holders brh
          WHERE brh.person_id=p.id
            AND brh.status<>'revoque'
            AND public.can_view_bien(brh.bien_id,p_user_id)
        )
      )
  )
$$;

CREATE OR REPLACE FUNCTION public.can_manage_authorization_scope(
  p_scope_type text,p_scope_id uuid,p_user_id uuid
) RETURNS boolean
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public SET row_security=off AS $$
BEGIN
  IF p_user_id IS NULL THEN RETURN false; END IF;
  IF public.has_role(p_user_id,'admin') THEN RETURN true; END IF;

  IF p_scope_type='GLOBAL' THEN
    RETURN false;
  ELSIF p_scope_type='CASE' THEN
    RETURN public.owns_dossier(p_scope_id,p_user_id)
      OR public.has_effective_permission_for(p_user_id,'GRANT_ACCESS','CASE',p_scope_id);
  ELSIF p_scope_type='ASSET' THEN
    RETURN EXISTS(SELECT 1 FROM public.biens b WHERE b.id=p_scope_id AND b.created_by=p_user_id)
      OR public.has_effective_permission_for(p_user_id,'GRANT_ACCESS','ASSET',p_scope_id);
  ELSIF p_scope_type='DOCUMENT' THEN
    RETURN public.can_access_document(p_scope_id,p_user_id)
      AND public.has_effective_permission_for(p_user_id,'MANAGE_DOCUMENTS','DOCUMENT',p_scope_id);
  END IF;

  RETURN public.has_effective_permission_for(p_user_id,'GRANT_ACCESS',p_scope_type,p_scope_id);
END $$;

CREATE OR REPLACE FUNCTION public.is_identity_verifier(p_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public SET row_security=off AS $$
  SELECT public.has_role(p_user_id,'admin')
    OR EXISTS(
      SELECT 1 FROM public.role_assignments r
      WHERE r.user_id=p_user_id
        AND r.role='ACTOR_VERIFIER'
        AND r.scope_type='GLOBAL'
        AND r.status='ACTIVE'
        AND r.valid_from<=now()
        AND (r.valid_until IS NULL OR r.valid_until>now())
    )
$$;

CREATE OR REPLACE FUNCTION public.phase_b_record_change(
  p_event_name text,
  p_entity_type text,
  p_entity_id uuid,
  p_action text,
  p_correlation_id uuid,
  p_payload jsonb,
  p_confidentiality text DEFAULT 'SENSITIVE',
  p_acting_role text DEFAULT NULL,
  p_represented_person_id uuid DEFAULT NULL,
  p_mandate_id uuid DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
DECLARE actor_person uuid:=public.current_user_person_id(); event_id uuid:=gen_random_uuid();
BEGIN
  PERFORM public.record_audit_event(
    'ACTION',p_action,'person','SUCCEEDED',p_correlation_id,
    p_entity_type,p_entity_id,NULL,NULL,actor_person,p_acting_role,
    p_represented_person_id,p_mandate_id,NULL,NULL,NULL,NULL,
    jsonb_build_object('event_name',p_event_name)
  );

  PERFORM public.enqueue_domain_event(
    event_id,p_event_name,1,'DOMAIN_EVENT','person',p_entity_type,p_entity_id,
    NULL,NULL,now(),actor_person,p_acting_role,p_represented_person_id,p_mandate_id,
    p_correlation_id,NULL,p_confidentiality,'APPLICATION',COALESCE(p_payload,'{}'::jsonb)
  );
END $$;

CREATE OR REPLACE FUNCTION public.ensure_role_assignment_internal(
  p_user_id uuid,p_role text,p_scope_type text,p_scope_id uuid,p_assigned_by uuid
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
DECLARE rid uuid;
BEGIN
  SELECT id INTO rid
  FROM public.role_assignments
  WHERE user_id=p_user_id AND role=p_role AND scope_type=p_scope_type
    AND scope_id IS NOT DISTINCT FROM p_scope_id AND status='ACTIVE'
  LIMIT 1;

  IF rid IS NOT NULL THEN RETURN rid; END IF;

  INSERT INTO public.role_assignments(user_id,role,scope_type,scope_id,status,assigned_by)
  VALUES(p_user_id,p_role,p_scope_type,p_scope_id,'ACTIVE',p_assigned_by)
  RETURNING id INTO rid;
  RETURN rid;
END $$;

CREATE OR REPLACE FUNCTION public.revoke_role_assignment_internal(
  p_user_id uuid,p_role text,p_scope_type text,p_scope_id uuid
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
BEGIN
  UPDATE public.role_assignments
  SET status='REVOKED',revoked_at=now()
  WHERE user_id=p_user_id AND role=p_role AND scope_type=p_scope_type
    AND scope_id IS NOT DISTINCT FROM p_scope_id AND status='ACTIVE';
END $$;

-- ============================================================================
-- 7. EFFECTIVE PERMISSION — PHASE B VERSION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.has_effective_permission_for(
  p_user_id uuid,
  p_permission text,
  p_scope_type text,
  p_scope_id uuid
) RETURNS boolean
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public SET row_security=off AS $$
DECLARE now_ts timestamptz:=now();
BEGIN
  IF p_user_id IS NULL OR p_permission IS NULL OR p_scope_type IS NULL THEN RETURN false; END IF;

  -- 1. Explicit deny always wins.
  IF EXISTS(
    SELECT 1 FROM public.permission_denies d
    WHERE d.user_id=p_user_id AND d.permission=p_permission
      AND d.status='ACTIVE' AND d.valid_from<=now_ts
      AND (d.valid_until IS NULL OR d.valid_until>now_ts)
      AND public.authorization_scope_matches(d.scope_type,d.scope_id,p_scope_type,p_scope_id)
  ) THEN RETURN false; END IF;

  -- 2. Explicit grants.
  IF EXISTS(
    SELECT 1 FROM public.permission_grants g
    WHERE g.user_id=p_user_id AND g.permission=p_permission
      AND g.status='ACTIVE' AND g.valid_from<=now_ts
      AND (g.valid_until IS NULL OR g.valid_until>now_ts)
      AND public.authorization_scope_matches(g.scope_type,g.scope_id,p_scope_type,p_scope_id)
  ) THEN RETURN true; END IF;

  -- 3. Application role grants.
  IF EXISTS(
    SELECT 1 FROM public.role_assignments r
    WHERE r.user_id=p_user_id AND r.status='ACTIVE'
      AND r.valid_from<=now_ts AND (r.valid_until IS NULL OR r.valid_until>now_ts)
      AND public.authorization_scope_matches(r.scope_type,r.scope_id,p_scope_type,p_scope_id)
      AND public.role_allows_permission(r.role,p_permission)
  ) THEN RETURN true; END IF;

  -- 4. Representation grants only when active AND explicitly confirmed or verified/formalized.
  IF EXISTS(
    SELECT 1 FROM public.representation_mandates m
    WHERE m.representative_user_id=p_user_id
      AND m.status='ACTIVE'
      AND m.valid_from<=now_ts
      AND (m.valid_until IS NULL OR m.valid_until>now_ts)
      AND p_permission=ANY(m.permissions)
      AND public.authorization_scope_matches(m.scope_type,m.scope_id,p_scope_type,p_scope_id)
      AND (
        m.confirmed_by_represented_at IS NOT NULL
        OR (m.source_type IN ('VERIFIED','FORMALIZED') AND m.verified_at IS NOT NULL)
      )
  ) THEN RETURN true; END IF;

  -- 5. Compatibility with B7 scoped dossier grants.
  IF p_scope_type='CASE' AND p_scope_id IS NOT NULL THEN
    IF p_permission='VIEW' AND public.has_scope(p_scope_id,p_user_id,'voir_resume') THEN RETURN true; END IF;
    IF p_permission='UPLOAD_DOCUMENT' AND public.has_scope(p_scope_id,p_user_id,'ajouter_document') THEN RETURN true; END IF;
    IF p_permission='CONTRIBUTE' AND (
      public.has_scope(p_scope_id,p_user_id,'commenter')
      OR public.has_scope(p_scope_id,p_user_id,'accompagner')
      OR public.has_scope(p_scope_id,p_user_id,'intervenir')
    ) THEN RETURN true; END IF;
  END IF;

  RETURN false;
END $$;

-- ============================================================================
-- 8. CANONICAL VISIBILITY BRIDGES
-- ============================================================================

CREATE OR REPLACE FUNCTION public.can_view_bien(_bien_id uuid,_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public SET row_security=off AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.biens b
    WHERE b.id=_bien_id AND (
      b.created_by=_user_id
      OR public.has_effective_permission_for(_user_id,'VIEW','ASSET',b.id)
      OR EXISTS(
        SELECT 1
        FROM public.bien_right_holders brh
        JOIN public.persons p ON p.id=brh.person_id
        WHERE brh.bien_id=b.id AND brh.status<>'revoque'
          AND p.linked_profile_id=_user_id
      )
    )
  )
$$;

CREATE OR REPLACE FUNCTION public.can_view_dossier(_dossier_id uuid,_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public SET row_security=off AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.dossiers d
    WHERE d.id=_dossier_id AND (
      d.owner_id=_user_id
      OR public.has_effective_permission_for(_user_id,'VIEW','CASE',d.id)
      OR EXISTS(
        SELECT 1 FROM public.dossier_participants dp
        JOIN public.persons p ON p.id=dp.person_id
        WHERE dp.dossier_id=d.id AND dp.status='actif'
          AND (p.linked_profile_id=_user_id OR dp.user_id=_user_id)
      )
    )
  )
$$;

CREATE OR REPLACE FUNCTION public.can_view_person(_person_id uuid,_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public SET row_security=off AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.persons target
    WHERE target.id=_person_id AND (
      public.person_directly_visible(target.id,_user_id)
      OR (target.merged_into_person_id IS NOT NULL AND public.person_directly_visible(target.merged_into_person_id,_user_id))
      OR EXISTS(
        SELECT 1 FROM public.persons source
        WHERE source.merged_into_person_id=target.id
          AND public.person_directly_visible(source.id,_user_id)
      )
      OR EXISTS(
        SELECT 1 FROM public.family_relations fr
        WHERE fr.status<>'REVOKED'
          AND (
            (fr.from_person_id=target.id AND public.person_directly_visible(fr.to_person_id,_user_id))
            OR
            (fr.to_person_id=target.id AND public.person_directly_visible(fr.from_person_id,_user_id))
          )
      )
    )
  )
$$;

-- ============================================================================
-- 9. RLS FOR NEW IDENTITY TABLES
-- ============================================================================

ALTER TABLE public.person_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_relation_revisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "view legitimate person aliases"
ON public.person_aliases FOR SELECT TO authenticated
USING(public.can_view_person(person_id,auth.uid()));

CREATE POLICY "view legitimate family relations"
ON public.family_relations FOR SELECT TO authenticated
USING(
  public.can_view_person(from_person_id,auth.uid())
  AND public.can_view_person(to_person_id,auth.uid())
);

CREATE POLICY "view legitimate family relation revisions"
ON public.family_relation_revisions FOR SELECT TO authenticated
USING(EXISTS(
  SELECT 1 FROM public.family_relations fr
  WHERE fr.id=relation_id
    AND public.can_view_person(fr.from_person_id,auth.uid())
    AND public.can_view_person(fr.to_person_id,auth.uid())
));

REVOKE ALL ON public.person_aliases,public.family_relations,public.family_relation_revisions
FROM anon,authenticated;
GRANT SELECT ON public.person_aliases,public.family_relations,public.family_relation_revisions
TO authenticated;

-- Person writes now go through application RPCs; direct reads remain RLS controlled.
REVOKE INSERT,UPDATE ON public.persons FROM authenticated;
GRANT SELECT ON public.persons TO authenticated;

-- ============================================================================
-- 10. PERSON APPLICATION SERVICES
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_person_record(
  p_person_id uuid,
  p_display_name text,
  p_phone text,
  p_email text,
  p_identity_status text,
  p_death_status text,
  p_birth_date date,
  p_death_date date,
  p_correlation_id uuid
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
DECLARE current_user_id uuid:=auth.uid(); resolved_id uuid;
BEGIN
  IF current_user_id IS NULL THEN RAISE EXCEPTION 'authentication_required' USING ERRCODE='42501'; END IF;
  resolved_id:=public.resolve_person_id(p_person_id);
  IF resolved_id IS NULL OR NOT public.person_directly_manageable(resolved_id,current_user_id) THEN
    RAISE EXCEPTION 'person_update_forbidden' USING ERRCODE='42501';
  END IF;

  IF p_display_name IS NULL OR char_length(btrim(p_display_name)) NOT BETWEEN 2 AND 160 THEN
    RAISE EXCEPTION 'invalid_person_name' USING ERRCODE='22023';
  END IF;
  IF p_phone IS NOT NULL AND char_length(p_phone)>40 THEN RAISE EXCEPTION 'invalid_person_phone' USING ERRCODE='22023'; END IF;
  IF p_email IS NOT NULL AND char_length(p_email)>254 THEN RAISE EXCEPTION 'invalid_person_email' USING ERRCODE='22023'; END IF;
  IF p_identity_status NOT IN ('PARTIAL','DECLARED','DOCUMENTED','VERIFIED','CONTESTED','DUPLICATE_SUSPECTED') THEN
    RAISE EXCEPTION 'invalid_identity_status' USING ERRCODE='22023';
  END IF;
  IF p_death_status NOT IN ('UNKNOWN','DECLARED_DECEASED','DOCUMENTED_DECEASED','VERIFIED_DECEASED') THEN
    RAISE EXCEPTION 'invalid_death_status' USING ERRCODE='22023';
  END IF;
  IF p_identity_status='VERIFIED' AND NOT public.is_identity_verifier(current_user_id) THEN
    RAISE EXCEPTION 'identity_verification_forbidden' USING ERRCODE='42501';
  END IF;
  IF p_death_status='VERIFIED_DECEASED' AND NOT public.is_identity_verifier(current_user_id) THEN
    RAISE EXCEPTION 'death_verification_forbidden' USING ERRCODE='42501';
  END IF;

  UPDATE public.persons
  SET display_name=btrim(p_display_name),phone=p_phone,email=p_email,
      identity_status=p_identity_status,death_status=p_death_status,
      birth_date=p_birth_date,death_date=p_death_date
  WHERE id=resolved_id;

  PERFORM public.phase_b_record_change(
    'person.person.updated','Person',resolved_id,'UpdatePerson',p_correlation_id,
    jsonb_build_object('person_id',resolved_id,'identity_status',p_identity_status,'death_status',p_death_status)
  );
END $$;

CREATE OR REPLACE FUNCTION public.merge_person_records(
  p_source_person_id uuid,
  p_target_person_id uuid,
  p_correlation_id uuid
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
DECLARE
  current_user_id uuid:=auth.uid();
  source public.persons;
  target public.persons;
  canonical_target uuid;
BEGIN
  IF current_user_id IS NULL OR p_source_person_id=p_target_person_id THEN
    RAISE EXCEPTION 'person_merge_forbidden' USING ERRCODE='42501';
  END IF;

  canonical_target:=public.resolve_person_id(p_target_person_id);
  SELECT * INTO source FROM public.persons WHERE id=p_source_person_id FOR UPDATE;
  SELECT * INTO target FROM public.persons WHERE id=canonical_target FOR UPDATE;

  IF source.id IS NULL OR target.id IS NULL OR source.merged_into_person_id IS NOT NULL THEN
    RAISE EXCEPTION 'person_merge_invalid_state' USING ERRCODE='22023';
  END IF;
  IF NOT public.person_directly_manageable(source.id,current_user_id)
     OR NOT public.person_directly_manageable(target.id,current_user_id) THEN
    RAISE EXCEPTION 'person_merge_forbidden' USING ERRCODE='42501';
  END IF;
  IF source.linked_profile_id IS NOT NULL
     AND target.linked_profile_id IS NOT NULL
     AND source.linked_profile_id<>target.linked_profile_id THEN
    RAISE EXCEPTION 'linked_accounts_cannot_merge' USING ERRCODE='42501';
  END IF;

  INSERT INTO public.person_aliases(person_id,alias_name,alias_type,source_type,created_by)
  VALUES(target.id,source.display_name,'MERGED_RECORD','DECLARATION',current_user_id)
  ON CONFLICT DO NOTHING;

  UPDATE public.persons
  SET merged_into_person_id=target.id,merged_at=now(),merged_by=current_user_id,
      identity_status='DUPLICATE_SUSPECTED'
  WHERE id=source.id;

  PERFORM public.phase_b_record_change(
    'person.person.merged','Person',target.id,'MergePerson',p_correlation_id,
    jsonb_build_object('source_person_id',source.id,'target_person_id',target.id)
  );
  RETURN target.id;
END $$;

-- ============================================================================
-- 11. FAMILY RELATION APPLICATION SERVICES
-- ============================================================================

CREATE OR REPLACE FUNCTION public.create_family_relation(
  p_from_person_id uuid,
  p_to_person_id uuid,
  p_relation_type text,
  p_source_type text,
  p_source_document_id uuid,
  p_note text,
  p_correlation_id uuid
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
DECLARE
  current_user_id uuid:=auth.uid();
  from_id uuid:=public.resolve_person_id(p_from_person_id);
  to_id uuid:=public.resolve_person_id(p_to_person_id);
  relation_id uuid;
  relation_status text;
  revision_id uuid;
BEGIN
  IF current_user_id IS NULL OR from_id IS NULL OR to_id IS NULL OR from_id=to_id THEN
    RAISE EXCEPTION 'family_relation_invalid' USING ERRCODE='22023';
  END IF;
  IF p_relation_type NOT IN ('PARENT','CHILD','SPOUSE','SIBLING','GUARDIAN','DEPENDENT','OTHER')
     OR p_source_type NOT IN ('DECLARATION','DOCUMENT','VERIFIED') THEN
    RAISE EXCEPTION 'family_relation_invalid' USING ERRCODE='22023';
  END IF;
  IF NOT public.can_view_person(from_id,current_user_id)
     OR NOT public.can_view_person(to_id,current_user_id)
     OR NOT (
       public.person_directly_manageable(from_id,current_user_id)
       OR public.person_directly_manageable(to_id,current_user_id)
     ) THEN
    RAISE EXCEPTION 'family_relation_forbidden' USING ERRCODE='42501';
  END IF;
  IF p_source_type='VERIFIED' AND NOT public.is_identity_verifier(current_user_id) THEN
    RAISE EXCEPTION 'family_relation_verification_forbidden' USING ERRCODE='42501';
  END IF;
  IF p_source_type IN ('DOCUMENT','VERIFIED') AND (
    p_source_document_id IS NULL OR NOT public.can_access_document(p_source_document_id,current_user_id)
  ) THEN
    RAISE EXCEPTION 'family_relation_document_forbidden' USING ERRCODE='42501';
  END IF;

  relation_status:=CASE p_source_type
    WHEN 'VERIFIED' THEN 'VERIFIED'
    WHEN 'DOCUMENT' THEN 'DOCUMENTED'
    ELSE 'DECLARED'
  END;

  INSERT INTO public.family_relations(
    from_person_id,to_person_id,relation_type,status,current_revision,created_by
  ) VALUES(from_id,to_id,p_relation_type,relation_status,1,current_user_id)
  RETURNING id INTO relation_id;

  INSERT INTO public.family_relation_revisions(
    relation_id,version_number,relation_type,status,source_type,source_document_id,note,created_by
  ) VALUES(
    relation_id,1,p_relation_type,relation_status,p_source_type,p_source_document_id,nullif(btrim(p_note),''),current_user_id
  ) RETURNING id INTO revision_id;

  PERFORM public.phase_b_record_change(
    'person.family-relation.created','FamilyRelation',relation_id,'CreateFamilyRelation',p_correlation_id,
    jsonb_build_object('relation_id',relation_id,'relation_type',p_relation_type,'status',relation_status)
  );
  RETURN relation_id;
END $$;

CREATE OR REPLACE FUNCTION public.revise_family_relation(
  p_relation_id uuid,
  p_relation_type text,
  p_status text,
  p_source_type text,
  p_source_document_id uuid,
  p_note text,
  p_correlation_id uuid
) RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
DECLARE
  current_user_id uuid:=auth.uid();
  item public.family_relations;
  next_version integer;
  previous_revision uuid;
  new_revision uuid;
BEGIN
  SELECT * INTO item FROM public.family_relations WHERE id=p_relation_id FOR UPDATE;
  IF item.id IS NULL OR NOT (
    public.person_directly_manageable(item.from_person_id,current_user_id)
    OR public.person_directly_manageable(item.to_person_id,current_user_id)
    OR public.has_role(current_user_id,'admin')
  ) THEN
    RAISE EXCEPTION 'family_relation_update_forbidden' USING ERRCODE='42501';
  END IF;
  IF p_relation_type NOT IN ('PARENT','CHILD','SPOUSE','SIBLING','GUARDIAN','DEPENDENT','OTHER')
     OR p_status NOT IN ('DECLARED','DOCUMENTED','VERIFIED','CONTESTED','REVOKED')
     OR p_source_type NOT IN ('DECLARATION','DOCUMENT','VERIFIED') THEN
    RAISE EXCEPTION 'family_relation_invalid' USING ERRCODE='22023';
  END IF;
  IF (p_status='VERIFIED' OR p_source_type='VERIFIED') AND NOT public.is_identity_verifier(current_user_id) THEN
    RAISE EXCEPTION 'family_relation_verification_forbidden' USING ERRCODE='42501';
  END IF;
  IF p_source_type IN ('DOCUMENT','VERIFIED') AND (
    p_source_document_id IS NULL OR NOT public.can_access_document(p_source_document_id,current_user_id)
  ) THEN
    RAISE EXCEPTION 'family_relation_document_forbidden' USING ERRCODE='42501';
  END IF;

  SELECT id INTO previous_revision
  FROM public.family_relation_revisions
  WHERE relation_id=item.id AND version_number=item.current_revision;

  next_version:=item.current_revision+1;
  INSERT INTO public.family_relation_revisions(
    relation_id,version_number,relation_type,status,source_type,source_document_id,note,created_by,supersedes_revision_id
  ) VALUES(
    item.id,next_version,p_relation_type,p_status,p_source_type,p_source_document_id,
    nullif(btrim(p_note),''),current_user_id,previous_revision
  ) RETURNING id INTO new_revision;

  UPDATE public.family_relations
  SET relation_type=p_relation_type,status=p_status,current_revision=next_version,updated_at=now(),
      revoked_at=CASE WHEN p_status='REVOKED' THEN now() ELSE NULL END
  WHERE id=item.id;

  PERFORM public.phase_b_record_change(
    'person.family-relation.revised','FamilyRelation',item.id,'ReviseFamilyRelation',p_correlation_id,
    jsonb_build_object('relation_id',item.id,'version',next_version,'status',p_status)
  );
  RETURN next_version;
END $$;

-- ============================================================================
-- 12. AUTHORIZATION APPLICATION SERVICES
-- ============================================================================

CREATE OR REPLACE FUNCTION public.assign_application_role(
  p_user_id uuid,p_role text,p_scope_type text,p_scope_id uuid,p_valid_until timestamptz,p_correlation_id uuid
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
DECLARE current_user_id uuid:=auth.uid(); rid uuid;
BEGIN
  IF current_user_id IS NULL OR NOT public.can_manage_authorization_scope(p_scope_type,p_scope_id,current_user_id) THEN
    RAISE EXCEPTION 'role_assignment_forbidden' USING ERRCODE='42501';
  END IF;
  IF p_role NOT IN (
    'CASE_ADMIN','MANAGER','CONTRIBUTOR','PARTICIPANT','READER','COMPANION','WITNESS',
    'PROFESSIONAL','MEDIATOR','ADMINISTRATIVE_ACTOR'
  ) THEN
    RAISE EXCEPTION 'role_assignment_protected' USING ERRCODE='42501';
  END IF;
  IF p_role='CASE_ADMIN' AND p_scope_type='CASE'
     AND NOT (public.owns_dossier(p_scope_id,current_user_id) OR public.has_role(current_user_id,'admin')) THEN
    RAISE EXCEPTION 'case_admin_assignment_forbidden' USING ERRCODE='42501';
  END IF;
  IF p_valid_until IS NOT NULL AND p_valid_until<=now() THEN
    RAISE EXCEPTION 'invalid_role_validity' USING ERRCODE='22023';
  END IF;

  INSERT INTO public.role_assignments(user_id,role,scope_type,scope_id,valid_until,status,assigned_by)
  VALUES(p_user_id,p_role,p_scope_type,p_scope_id,p_valid_until,'ACTIVE',current_user_id)
  ON CONFLICT(user_id,role,scope_type,scope_id) WHERE status='ACTIVE'
  DO UPDATE SET valid_until=EXCLUDED.valid_until,assigned_by=EXCLUDED.assigned_by
  RETURNING id INTO rid;

  PERFORM public.phase_b_record_change(
    'person.role-assignment.changed','RoleAssignment',rid,'AssignRole',p_correlation_id,
    jsonb_build_object('role_assignment_id',rid,'role',p_role,'scope_type',p_scope_type,'scope_id',p_scope_id)
  );
  RETURN rid;
END $$;

CREATE OR REPLACE FUNCTION public.revoke_application_role(
  p_role_assignment_id uuid,p_correlation_id uuid
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
DECLARE current_user_id uuid:=auth.uid(); item public.role_assignments;
BEGIN
  SELECT * INTO item FROM public.role_assignments WHERE id=p_role_assignment_id FOR UPDATE;
  IF item.id IS NULL OR item.status<>'ACTIVE'
     OR NOT public.can_manage_authorization_scope(item.scope_type,item.scope_id,current_user_id) THEN
    RAISE EXCEPTION 'role_revocation_forbidden' USING ERRCODE='42501';
  END IF;
  IF item.role='CASE_ADMIN' AND item.scope_type='CASE'
     AND public.owns_dossier(item.scope_id,item.user_id) THEN
    RAISE EXCEPTION 'owner_case_admin_cannot_be_revoked' USING ERRCODE='42501';
  END IF;

  UPDATE public.role_assignments SET status='REVOKED',revoked_at=now() WHERE id=item.id;

  PERFORM public.phase_b_record_change(
    'person.role-assignment.changed','RoleAssignment',item.id,'RevokeRole',p_correlation_id,
    jsonb_build_object('role_assignment_id',item.id,'role',item.role,'status','REVOKED')
  );
END $$;

CREATE OR REPLACE FUNCTION public.grant_explicit_permission(
  p_user_id uuid,p_permission text,p_scope_type text,p_scope_id uuid,p_valid_until timestamptz,p_reason_code text,p_correlation_id uuid
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
DECLARE current_user_id uuid:=auth.uid(); gid uuid;
BEGIN
  IF current_user_id IS NULL OR NOT public.can_manage_authorization_scope(p_scope_type,p_scope_id,current_user_id) THEN
    RAISE EXCEPTION 'permission_grant_forbidden' USING ERRCODE='42501';
  END IF;
  IF p_permission !~ '^[A-Z][A-Z0-9_]{1,79}$' THEN RAISE EXCEPTION 'invalid_permission' USING ERRCODE='22023'; END IF;
  IF p_valid_until IS NOT NULL AND p_valid_until<=now() THEN RAISE EXCEPTION 'invalid_permission_validity' USING ERRCODE='22023'; END IF;

  INSERT INTO public.permission_grants(
    user_id,permission,scope_type,scope_id,valid_until,status,granted_by,reason_code
  ) VALUES(
    p_user_id,p_permission,p_scope_type,p_scope_id,p_valid_until,'ACTIVE',current_user_id,nullif(btrim(p_reason_code),'')
  ) RETURNING id INTO gid;

  PERFORM public.phase_b_record_change(
    'person.permission.granted','PermissionGrant',gid,'GrantPermission',p_correlation_id,
    jsonb_build_object('permission_grant_id',gid,'permission',p_permission,'scope_type',p_scope_type,'scope_id',p_scope_id)
  );
  RETURN gid;
END $$;

CREATE OR REPLACE FUNCTION public.deny_explicit_permission(
  p_user_id uuid,p_permission text,p_scope_type text,p_scope_id uuid,p_valid_until timestamptz,p_reason_code text,p_correlation_id uuid
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
DECLARE current_user_id uuid:=auth.uid(); did uuid;
BEGIN
  IF current_user_id IS NULL OR NOT public.can_manage_authorization_scope(p_scope_type,p_scope_id,current_user_id) THEN
    RAISE EXCEPTION 'permission_deny_forbidden' USING ERRCODE='42501';
  END IF;
  IF p_permission !~ '^[A-Z][A-Z0-9_]{1,79}$' OR p_reason_code IS NULL OR char_length(btrim(p_reason_code))<2 THEN
    RAISE EXCEPTION 'invalid_permission_deny' USING ERRCODE='22023';
  END IF;
  IF p_valid_until IS NOT NULL AND p_valid_until<=now() THEN RAISE EXCEPTION 'invalid_permission_validity' USING ERRCODE='22023'; END IF;

  INSERT INTO public.permission_denies(
    user_id,permission,scope_type,scope_id,valid_until,status,denied_by,reason_code
  ) VALUES(
    p_user_id,p_permission,p_scope_type,p_scope_id,p_valid_until,'ACTIVE',current_user_id,btrim(p_reason_code)
  ) RETURNING id INTO did;

  PERFORM public.phase_b_record_change(
    'person.permission.denied','PermissionDeny',did,'DenyPermission',p_correlation_id,
    jsonb_build_object('permission_deny_id',did,'permission',p_permission,'scope_type',p_scope_type,'scope_id',p_scope_id)
  );
  RETURN did;
END $$;

CREATE OR REPLACE FUNCTION public.revoke_explicit_permission(
  p_record_type text,p_record_id uuid,p_correlation_id uuid
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
DECLARE
  current_user_id uuid:=auth.uid();
  scope_type_value text;
  scope_id_value uuid;
  permission_value text;
BEGIN
  IF p_record_type='GRANT' THEN
    SELECT scope_type,scope_id,permission INTO scope_type_value,scope_id_value,permission_value
    FROM public.permission_grants WHERE id=p_record_id AND status='ACTIVE' FOR UPDATE;
    IF scope_type_value IS NULL OR NOT public.can_manage_authorization_scope(scope_type_value,scope_id_value,current_user_id) THEN
      RAISE EXCEPTION 'permission_revocation_forbidden' USING ERRCODE='42501';
    END IF;
    UPDATE public.permission_grants SET status='REVOKED',revoked_at=now() WHERE id=p_record_id;
  ELSIF p_record_type='DENY' THEN
    SELECT scope_type,scope_id,permission INTO scope_type_value,scope_id_value,permission_value
    FROM public.permission_denies WHERE id=p_record_id AND status='ACTIVE' FOR UPDATE;
    IF scope_type_value IS NULL OR NOT public.can_manage_authorization_scope(scope_type_value,scope_id_value,current_user_id) THEN
      RAISE EXCEPTION 'permission_revocation_forbidden' USING ERRCODE='42501';
    END IF;
    UPDATE public.permission_denies SET status='REVOKED',revoked_at=now() WHERE id=p_record_id;
  ELSE
    RAISE EXCEPTION 'invalid_permission_record_type' USING ERRCODE='22023';
  END IF;

  PERFORM public.phase_b_record_change(
    'person.permission.revoked','Permission',p_record_id,'RevokePermission',p_correlation_id,
    jsonb_build_object('record_type',p_record_type,'permission',permission_value,'scope_type',scope_type_value,'scope_id',scope_id_value)
  );
END $$;

-- ============================================================================
-- 13. REPRESENTATION MANDATE APPLICATION SERVICES
-- ============================================================================

CREATE OR REPLACE FUNCTION public.create_representation_mandate(
  p_represented_person_id uuid,
  p_representative_user_id uuid,
  p_scope_type text,
  p_scope_id uuid,
  p_permissions text[],
  p_source_type text,
  p_source_document_id uuid,
  p_valid_until timestamptz,
  p_correlation_id uuid
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
DECLARE
  current_user_id uuid:=auth.uid();
  represented_id uuid:=public.resolve_person_id(p_represented_person_id);
  represented public.persons;
  representative_person uuid;
  mandate_id uuid;
  initial_status text;
  confirmed_at timestamptz;
  perm text;
BEGIN
  IF current_user_id IS NULL OR represented_id IS NULL OR p_representative_user_id IS NULL
     OR cardinality(p_permissions)=0 OR p_representative_user_id=current_user_id THEN
    RAISE EXCEPTION 'mandate_invalid' USING ERRCODE='22023';
  END IF;
  IF p_source_type NOT IN ('DECLARATION','DOCUMENTED','VERIFIED','FORMALIZED') THEN
    RAISE EXCEPTION 'mandate_invalid_source' USING ERRCODE='22023';
  END IF;
  IF p_valid_until IS NOT NULL AND p_valid_until<=now() THEN
    RAISE EXCEPTION 'mandate_invalid_validity' USING ERRCODE='22023';
  END IF;
  FOREACH perm IN ARRAY p_permissions LOOP
    IF perm !~ '^[A-Z][A-Z0-9_]{1,79}$' THEN RAISE EXCEPTION 'mandate_invalid_permission' USING ERRCODE='22023'; END IF;
  END LOOP;

  SELECT * INTO represented FROM public.persons WHERE id=represented_id;
  IF represented.id IS NULL THEN RAISE EXCEPTION 'represented_person_not_found' USING ERRCODE='P0002'; END IF;

  IF NOT (
    represented.linked_profile_id=current_user_id
    OR public.person_directly_manageable(represented.id,current_user_id)
    OR public.can_manage_authorization_scope(p_scope_type,p_scope_id,current_user_id)
  ) THEN
    RAISE EXCEPTION 'mandate_creation_forbidden' USING ERRCODE='42501';
  END IF;

  IF p_source_type IN ('DOCUMENTED','VERIFIED','FORMALIZED') AND (
    p_source_document_id IS NULL OR NOT public.can_access_document(p_source_document_id,current_user_id)
  ) THEN
    RAISE EXCEPTION 'mandate_document_forbidden' USING ERRCODE='42501';
  END IF;

  IF p_source_type IN ('VERIFIED','FORMALIZED') AND NOT public.is_identity_verifier(current_user_id) THEN
    RAISE EXCEPTION 'mandate_verification_forbidden' USING ERRCODE='42501';
  END IF;

  SELECT id INTO representative_person
  FROM public.persons
  WHERE linked_profile_id=p_representative_user_id AND merged_into_person_id IS NULL;

  IF representative_person IS NULL THEN
    INSERT INTO public.persons(linked_profile_id,display_name,phone,created_by,identity_status)
    SELECT p.id,COALESCE(NULLIF(btrim(p.full_name),''),'Utilisateur'),p.phone,current_user_id,'DECLARED'
    FROM public.profiles p WHERE p.id=p_representative_user_id
    RETURNING id INTO representative_person;
  END IF;
  IF representative_person IS NULL THEN RAISE EXCEPTION 'representative_account_not_found' USING ERRCODE='P0002'; END IF;

  confirmed_at:=CASE WHEN represented.linked_profile_id=current_user_id THEN now() ELSE NULL END;
  initial_status:=CASE
    WHEN confirmed_at IS NOT NULL THEN 'ACTIVE'
    WHEN p_source_type IN ('VERIFIED','FORMALIZED') THEN 'ACTIVE'
    ELSE 'SUSPENDED'
  END;

  INSERT INTO public.representation_mandates(
    represented_person_id,representative_person_id,representative_user_id,
    scope_type,scope_id,permissions,source_type,source_document_id,valid_until,status,
    created_by,confirmed_by_represented_at,verified_by,verified_at
  ) VALUES(
    represented.id,representative_person,p_representative_user_id,
    p_scope_type,p_scope_id,p_permissions,p_source_type,p_source_document_id,p_valid_until,initial_status,
    current_user_id,confirmed_at,
    CASE WHEN p_source_type IN ('VERIFIED','FORMALIZED') THEN current_user_id ELSE NULL END,
    CASE WHEN p_source_type IN ('VERIFIED','FORMALIZED') THEN now() ELSE NULL END
  ) RETURNING id INTO mandate_id;

  IF initial_status='ACTIVE' THEN
    PERFORM public.ensure_role_assignment_internal(
      p_representative_user_id,'REPRESENTATIVE',p_scope_type,p_scope_id,current_user_id
    );
  END IF;

  PERFORM public.phase_b_record_change(
    'person.representation-mandate.created','RepresentationMandate',mandate_id,'CreateRepresentationMandate',p_correlation_id,
    jsonb_build_object('mandate_id',mandate_id,'scope_type',p_scope_type,'scope_id',p_scope_id,'status',initial_status),
    'HIGHLY_SENSITIVE',NULL,represented.id,mandate_id
  );
  RETURN mandate_id;
END $$;

CREATE OR REPLACE FUNCTION public.confirm_representation_mandate(
  p_mandate_id uuid,p_correlation_id uuid
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
DECLARE current_user_id uuid:=auth.uid(); item public.representation_mandates;
BEGIN
  SELECT * INTO item FROM public.representation_mandates WHERE id=p_mandate_id FOR UPDATE;
  IF item.id IS NULL OR item.status='REVOKED'
     OR NOT EXISTS(
       SELECT 1 FROM public.persons p
       WHERE p.id=item.represented_person_id AND p.linked_profile_id=current_user_id
     ) THEN
    RAISE EXCEPTION 'mandate_confirmation_forbidden' USING ERRCODE='42501';
  END IF;
  IF item.valid_until IS NOT NULL AND item.valid_until<=now() THEN
    RAISE EXCEPTION 'mandate_expired' USING ERRCODE='22023';
  END IF;

  UPDATE public.representation_mandates
  SET status='ACTIVE',confirmed_by_represented_at=now()
  WHERE id=item.id;

  PERFORM public.ensure_role_assignment_internal(
    item.representative_user_id,'REPRESENTATIVE',item.scope_type,item.scope_id,current_user_id
  );

  PERFORM public.phase_b_record_change(
    'person.representation-mandate.confirmed','RepresentationMandate',item.id,'ConfirmRepresentationMandate',p_correlation_id,
    jsonb_build_object('mandate_id',item.id,'status','ACTIVE'),
    'HIGHLY_SENSITIVE','REPRESENTATIVE',item.represented_person_id,item.id
  );
END $$;

CREATE OR REPLACE FUNCTION public.verify_representation_mandate(
  p_mandate_id uuid,p_formalized boolean,p_correlation_id uuid
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
DECLARE current_user_id uuid:=auth.uid(); item public.representation_mandates;
BEGIN
  IF NOT public.is_identity_verifier(current_user_id) THEN
    RAISE EXCEPTION 'mandate_verification_forbidden' USING ERRCODE='42501';
  END IF;
  SELECT * INTO item FROM public.representation_mandates WHERE id=p_mandate_id FOR UPDATE;
  IF item.id IS NULL OR item.status='REVOKED' OR item.source_document_id IS NULL THEN
    RAISE EXCEPTION 'mandate_verification_invalid_state' USING ERRCODE='22023';
  END IF;
  IF item.valid_until IS NOT NULL AND item.valid_until<=now() THEN
    RAISE EXCEPTION 'mandate_expired' USING ERRCODE='22023';
  END IF;

  UPDATE public.representation_mandates
  SET source_type=CASE WHEN p_formalized THEN 'FORMALIZED' ELSE 'VERIFIED' END,
      status='ACTIVE',verified_by=current_user_id,verified_at=now()
  WHERE id=item.id;

  PERFORM public.ensure_role_assignment_internal(
    item.representative_user_id,'REPRESENTATIVE',item.scope_type,item.scope_id,current_user_id
  );

  PERFORM public.phase_b_record_change(
    'person.representation-mandate.confirmed','RepresentationMandate',item.id,'VerifyRepresentationMandate',p_correlation_id,
    jsonb_build_object('mandate_id',item.id,'status','ACTIVE','formalized',p_formalized),
    'HIGHLY_SENSITIVE','ACTOR_VERIFIER',item.represented_person_id,item.id
  );
END $$;

CREATE OR REPLACE FUNCTION public.revoke_representation_mandate(
  p_mandate_id uuid,p_correlation_id uuid
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
DECLARE current_user_id uuid:=auth.uid(); item public.representation_mandates;
BEGIN
  SELECT * INTO item FROM public.representation_mandates WHERE id=p_mandate_id FOR UPDATE;
  IF item.id IS NULL OR item.status='REVOKED' THEN
    RAISE EXCEPTION 'mandate_revocation_invalid_state' USING ERRCODE='22023';
  END IF;
  IF NOT (
    item.representative_user_id=current_user_id
    OR item.created_by=current_user_id
    OR EXISTS(
      SELECT 1 FROM public.persons p
      WHERE p.id=item.represented_person_id AND p.linked_profile_id=current_user_id
    )
    OR public.has_role(current_user_id,'admin')
  ) THEN
    RAISE EXCEPTION 'mandate_revocation_forbidden' USING ERRCODE='42501';
  END IF;

  UPDATE public.representation_mandates
  SET status='REVOKED',revoked_at=now(),revoked_by=current_user_id
  WHERE id=item.id;

  -- Revoke representative role only if no other active mandate still supports it.
  IF NOT EXISTS(
    SELECT 1 FROM public.representation_mandates m
    WHERE m.id<>item.id
      AND m.representative_user_id=item.representative_user_id
      AND m.scope_type=item.scope_type
      AND m.scope_id IS NOT DISTINCT FROM item.scope_id
      AND m.status='ACTIVE'
      AND (m.valid_until IS NULL OR m.valid_until>now())
      AND (
        m.confirmed_by_represented_at IS NOT NULL
        OR (m.source_type IN ('VERIFIED','FORMALIZED') AND m.verified_at IS NOT NULL)
      )
  ) THEN
    PERFORM public.revoke_role_assignment_internal(
      item.representative_user_id,'REPRESENTATIVE',item.scope_type,item.scope_id
    );
  END IF;

  PERFORM public.phase_b_record_change(
    'person.representation-mandate.revoked','RepresentationMandate',item.id,'RevokeRepresentationMandate',p_correlation_id,
    jsonb_build_object('mandate_id',item.id,'status','REVOKED'),
    'HIGHLY_SENSITIVE','REPRESENTATIVE',item.represented_person_id,item.id
  );
END $$;

-- ============================================================================
-- 14. ACTION CONTEXT SERVER RESOLUTION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.resolve_action_context(
  p_acting_role text,
  p_represented_person_id uuid,
  p_mandate_id uuid,
  p_scope_type text,
  p_scope_id uuid,
  p_correlation_id uuid
) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public SET row_security=off AS $$
DECLARE
  current_user_id uuid:=auth.uid();
  actor_person uuid:=public.current_user_person_id();
  represented_id uuid;
  mandate public.representation_mandates;
BEGIN
  IF current_user_id IS NULL OR p_correlation_id IS NULL THEN
    RAISE EXCEPTION 'action_context_invalid' USING ERRCODE='42501';
  END IF;

  IF p_represented_person_id IS NOT NULL THEN
    represented_id:=public.resolve_person_id(p_represented_person_id);
    IF p_mandate_id IS NULL THEN RAISE EXCEPTION 'representation_mandate_required' USING ERRCODE='42501'; END IF;
    SELECT * INTO mandate FROM public.representation_mandates WHERE id=p_mandate_id;
    IF mandate.id IS NULL
       OR mandate.representative_user_id<>current_user_id
       OR mandate.represented_person_id<>represented_id
       OR mandate.status<>'ACTIVE'
       OR (mandate.valid_until IS NOT NULL AND mandate.valid_until<=now())
       OR NOT public.authorization_scope_matches(mandate.scope_type,mandate.scope_id,p_scope_type,p_scope_id)
       OR NOT (
         mandate.confirmed_by_represented_at IS NOT NULL
         OR (mandate.source_type IN ('VERIFIED','FORMALIZED') AND mandate.verified_at IS NOT NULL)
       ) THEN
      RAISE EXCEPTION 'representation_mandate_invalid' USING ERRCODE='42501';
    END IF;
  ELSIF p_mandate_id IS NOT NULL THEN
    RAISE EXCEPTION 'represented_person_required' USING ERRCODE='22023';
  END IF;

  IF p_acting_role IS NOT NULL AND p_acting_role<>'REPRESENTATIVE' THEN
    IF NOT EXISTS(
      SELECT 1 FROM public.role_assignments r
      WHERE r.user_id=current_user_id AND r.role=p_acting_role AND r.status='ACTIVE'
        AND r.valid_from<=now() AND (r.valid_until IS NULL OR r.valid_until>now())
        AND public.authorization_scope_matches(r.scope_type,r.scope_id,p_scope_type,p_scope_id)
    ) AND NOT public.has_role(current_user_id,'admin') THEN
      RAISE EXCEPTION 'acting_role_invalid' USING ERRCODE='42501';
    END IF;
  END IF;

  IF p_acting_role='REPRESENTATIVE' AND represented_id IS NULL THEN
    RAISE EXCEPTION 'representative_context_requires_mandate' USING ERRCODE='42501';
  END IF;

  RETURN jsonb_build_object(
    'actor_user_id',current_user_id,
    'actor_person_id',actor_person,
    'acting_role',p_acting_role,
    'represented_person_id',represented_id,
    'mandate_id',p_mandate_id,
    'scope_type',p_scope_type,
    'scope_id',p_scope_id,
    'correlation_id',p_correlation_id
  );
END $$;

-- ============================================================================
-- 15. KEEP EXISTING CREATE PATHS SYNCHRONIZED WITH CANONICAL ROLES
-- ============================================================================

CREATE OR REPLACE FUNCTION public.create_dossier(
  p_bien_id uuid,p_type public.dossier_type,p_title text,
  p_visibility public.dossier_visibility DEFAULT 'prive',p_description text DEFAULT NULL,
  p_include_bien_holders boolean DEFAULT true,p_client_operation_id text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
DECLARE current_user_id uuid:=auth.uid(); new_id uuid; dp_record record; mapped_role text;
BEGIN
  IF current_user_id IS NULL OR NOT public.can_view_bien(p_bien_id,current_user_id) THEN
    RAISE EXCEPTION 'dossier_creation_forbidden' USING ERRCODE='42501';
  END IF;
  IF p_visibility::text NOT IN ('prive','public') THEN RAISE EXCEPTION 'invalid_visibility' USING ERRCODE='22023'; END IF;

  INSERT INTO public.dossiers(bien_id,owner_id,user_id,type,visibility,status,completion_level,title,description,client_operation_id)
  VALUES(p_bien_id,current_user_id,current_user_id,p_type,p_visibility,'brouillon','debut',btrim(p_title),p_description,p_client_operation_id)
  ON CONFLICT(user_id,client_operation_id)
  DO UPDATE SET updated_at=public.dossiers.updated_at
  RETURNING id INTO new_id;

  PERFORM public.ensure_role_assignment_internal(current_user_id,'CASE_ADMIN','CASE',new_id,current_user_id);

  IF p_include_bien_holders THEN
    INSERT INTO public.dossier_participants(dossier_id,person_id,user_id,contact_name,role,status,invited_by,accepted_at)
    SELECT new_id,brh.person_id,p.linked_profile_id,p.display_name,
      CASE WHEN brh.role='ayant_droit' THEN 'ayant_droit' ELSE 'titulaire' END,
      CASE WHEN p.linked_profile_id=current_user_id THEN 'actif' ELSE 'invite' END,
      current_user_id,CASE WHEN p.linked_profile_id=current_user_id THEN now() ELSE NULL END
    FROM public.bien_right_holders brh
    JOIN public.persons p ON p.id=brh.person_id
    WHERE brh.bien_id=p_bien_id AND brh.status<>'revoque'
    ON CONFLICT DO NOTHING;
  END IF;

  FOR dp_record IN
    SELECT dp.*,COALESCE(p.linked_profile_id,dp.user_id) AS linked_user
    FROM public.dossier_participants dp
    JOIN public.persons p ON p.id=dp.person_id
    WHERE dp.dossier_id=new_id AND dp.status='actif'
      AND COALESCE(p.linked_profile_id,dp.user_id) IS NOT NULL
  LOOP
    mapped_role:=CASE dp_record.role
      WHEN 'declarant' THEN 'CONTRIBUTOR'
      WHEN 'accompagnateur' THEN 'COMPANION'
      WHEN 'temoin' THEN 'WITNESS'
      WHEN 'professionnel' THEN 'PROFESSIONAL'
      WHEN 'service' THEN 'ADMINISTRATIVE_ACTOR'
      WHEN 'autorite' THEN 'ADMINISTRATIVE_ACTOR'
      ELSE 'PARTICIPANT'
    END;
    PERFORM public.ensure_role_assignment_internal(dp_record.linked_user,mapped_role,'CASE',new_id,current_user_id);
  END LOOP;

  RETURN new_id;
END $$;

CREATE OR REPLACE FUNCTION public.add_dossier_participant(p_dossier_id uuid,p_person_id uuid,p_role text)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
DECLARE
  current_user_id uuid:=auth.uid();
  relation_id uuid;
  linked_user uuid;
  person_name text;
  canonical_person uuid:=public.resolve_person_id(p_person_id);
  mapped_role text;
BEGIN
  IF NOT public.owns_dossier(p_dossier_id,current_user_id) THEN RAISE EXCEPTION 'participant_management_forbidden' USING ERRCODE='42501'; END IF;
  IF p_role NOT IN ('declarant','accompagnateur','temoin','titulaire','ayant_droit') THEN RAISE EXCEPTION 'protected_participant_role' USING ERRCODE='42501'; END IF;
  IF p_role IN ('titulaire','ayant_droit') AND NOT EXISTS(
    SELECT 1 FROM public.dossiers d
    JOIN public.bien_right_holders brh ON brh.bien_id=d.bien_id
    WHERE d.id=p_dossier_id AND brh.person_id=canonical_person AND brh.status<>'revoque'
      AND ((p_role='ayant_droit' AND brh.role='ayant_droit') OR (p_role='titulaire' AND brh.role IN ('titulaire','co_titulaire')))
  ) THEN RAISE EXCEPTION 'protected_participant_role' USING ERRCODE='42501'; END IF;

  SELECT linked_profile_id,display_name INTO linked_user,person_name
  FROM public.persons
  WHERE id=canonical_person AND public.can_view_person(id,current_user_id);
  IF NOT FOUND THEN RAISE EXCEPTION 'person_not_accessible' USING ERRCODE='42501'; END IF;

  INSERT INTO public.dossier_participants(dossier_id,person_id,user_id,contact_name,role,status,invited_by)
  VALUES(p_dossier_id,canonical_person,linked_user,person_name,p_role,'invite',current_user_id)
  RETURNING id INTO relation_id;

  IF linked_user IS NOT NULL THEN
    mapped_role:=CASE p_role
      WHEN 'declarant' THEN 'CONTRIBUTOR'
      WHEN 'accompagnateur' THEN 'COMPANION'
      WHEN 'temoin' THEN 'WITNESS'
      ELSE 'PARTICIPANT'
    END;
    -- Invite does not activate role until participation becomes active elsewhere.
    INSERT INTO public.role_assignments(user_id,role,scope_type,scope_id,status,assigned_by)
    VALUES(linked_user,mapped_role,'CASE',p_dossier_id,'SUSPENDED',current_user_id)
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN relation_id;
END $$;

CREATE OR REPLACE FUNCTION public.revoke_dossier_participant(p_participant_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
DECLARE
  item public.dossier_participants;
  linked_user uuid;
  mapped_role text;
BEGIN
  SELECT * INTO item FROM public.dossier_participants WHERE id=p_participant_id FOR UPDATE;
  IF item.id IS NULL OR item.status='revoque' OR NOT public.owns_dossier(item.dossier_id,auth.uid()) THEN
    RAISE EXCEPTION 'participant_revocation_forbidden' USING ERRCODE='42501';
  END IF;

  UPDATE public.dossier_participants SET status='revoque',revoked_at=now() WHERE id=item.id;
  SELECT COALESCE(p.linked_profile_id,item.user_id) INTO linked_user FROM public.persons p WHERE p.id=item.person_id;
  mapped_role:=CASE item.role
    WHEN 'declarant' THEN 'CONTRIBUTOR'
    WHEN 'accompagnateur' THEN 'COMPANION'
    WHEN 'temoin' THEN 'WITNESS'
    WHEN 'professionnel' THEN 'PROFESSIONAL'
    WHEN 'service' THEN 'ADMINISTRATIVE_ACTOR'
    WHEN 'autorite' THEN 'ADMINISTRATIVE_ACTOR'
    ELSE 'PARTICIPANT'
  END;
  IF linked_user IS NOT NULL THEN
    UPDATE public.role_assignments
    SET status='REVOKED',revoked_at=now()
    WHERE user_id=linked_user AND role=mapped_role AND scope_type='CASE'
      AND scope_id=item.dossier_id AND status IN ('ACTIVE','SUSPENDED');
  END IF;
END $$;

-- Existing B2 creation function now also writes canonical application authority.
CREATE OR REPLACE FUNCTION public.create_bien_with_holder(
  p_type text,p_title text,p_location_label text,p_creation_context text,
  p_description text DEFAULT NULL,p_latitude double precision DEFAULT NULL,
  p_longitude double precision DEFAULT NULL,p_origin_declared text DEFAULT NULL,
  p_holder_name text DEFAULT NULL,p_holder_phone text DEFAULT NULL,p_holder_email text DEFAULT NULL,
  p_holder_role text DEFAULT 'titulaire'
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
DECLARE
  current_user_id uuid:=auth.uid();
  new_bien_id uuid;
  holder_person_id uuid;
  self_name text;
BEGIN
  IF current_user_id IS NULL THEN RAISE EXCEPTION 'authentication_required' USING ERRCODE='42501'; END IF;
  IF p_creation_context NOT IN ('propre_bien','proche_accompagne','bien_familial') THEN RAISE EXCEPTION 'invalid_creation_context' USING ERRCODE='22023'; END IF;
  IF p_holder_role NOT IN ('titulaire','co_titulaire','ayant_droit','representant_autorise','autre') THEN RAISE EXCEPTION 'invalid_holder_role' USING ERRCODE='22023'; END IF;

  INSERT INTO public.biens(created_by,type,title,description,location_label,latitude,longitude,origin_declared,creation_context)
  VALUES(current_user_id,p_type,p_title,p_description,p_location_label,p_latitude,p_longitude,p_origin_declared,p_creation_context)
  RETURNING id INTO new_bien_id;

  IF p_creation_context='propre_bien' THEN
    SELECT COALESCE(NULLIF(btrim(full_name),''),'Utilisateur') INTO self_name FROM public.profiles WHERE id=current_user_id;
    INSERT INTO public.persons(linked_profile_id,display_name,phone,created_by,identity_status)
    VALUES(current_user_id,self_name,p_holder_phone,current_user_id,'DECLARED')
    ON CONFLICT(linked_profile_id) DO UPDATE SET display_name=EXCLUDED.display_name
    RETURNING id INTO holder_person_id;
  ELSE
    IF p_holder_name IS NULL OR char_length(btrim(p_holder_name))<2 THEN RAISE EXCEPTION 'holder_name_required' USING ERRCODE='22023'; END IF;
    INSERT INTO public.persons(display_name,phone,email,created_by,identity_status)
    VALUES(btrim(p_holder_name),p_holder_phone,p_holder_email,current_user_id,'DECLARED')
    RETURNING id INTO holder_person_id;
  END IF;

  INSERT INTO public.bien_right_holders(bien_id,person_id,role,status,declared_by)
  VALUES(new_bien_id,holder_person_id,p_holder_role,'declare',current_user_id);

  IF p_creation_context='propre_bien' THEN
    PERFORM public.ensure_role_assignment_internal(current_user_id,'TITULAIRE','ASSET',new_bien_id,current_user_id);
  END IF;

  RETURN new_bien_id;
END $$;

-- ============================================================================
-- 16. FUNCTION PRIVILEGES
-- ============================================================================

REVOKE ALL ON FUNCTION public.current_user_person_id(),
  public.resolve_person_id(uuid),
  public.person_directly_manageable(uuid,uuid),
  public.person_directly_visible(uuid,uuid),
  public.can_manage_authorization_scope(text,uuid,uuid),
  public.is_identity_verifier(uuid),
  public.phase_b_record_change(text,text,uuid,text,uuid,jsonb,text,text,uuid,uuid),
  public.ensure_role_assignment_internal(uuid,text,text,uuid,uuid),
  public.revoke_role_assignment_internal(uuid,text,text,uuid)
FROM PUBLIC,anon,authenticated;

GRANT EXECUTE ON FUNCTION public.current_user_person_id(),public.resolve_person_id(uuid)
TO authenticated,service_role;

REVOKE ALL ON FUNCTION public.update_person_record(uuid,text,text,text,text,text,date,date,uuid),
  public.merge_person_records(uuid,uuid,uuid),
  public.create_family_relation(uuid,uuid,text,text,uuid,text,uuid),
  public.revise_family_relation(uuid,text,text,text,uuid,text,uuid),
  public.assign_application_role(uuid,text,text,uuid,timestamptz,uuid),
  public.revoke_application_role(uuid,uuid),
  public.grant_explicit_permission(uuid,text,text,uuid,timestamptz,text,uuid),
  public.deny_explicit_permission(uuid,text,text,uuid,timestamptz,text,uuid),
  public.revoke_explicit_permission(text,uuid,uuid),
  public.create_representation_mandate(uuid,uuid,text,uuid,text[],text,uuid,timestamptz,uuid),
  public.confirm_representation_mandate(uuid,uuid),
  public.verify_representation_mandate(uuid,boolean,uuid),
  public.revoke_representation_mandate(uuid,uuid),
  public.resolve_action_context(text,uuid,uuid,text,uuid,uuid)
FROM PUBLIC,anon;

GRANT EXECUTE ON FUNCTION public.update_person_record(uuid,text,text,text,text,text,date,date,uuid),
  public.merge_person_records(uuid,uuid,uuid),
  public.create_family_relation(uuid,uuid,text,text,uuid,text,uuid),
  public.revise_family_relation(uuid,text,text,text,uuid,text,uuid),
  public.assign_application_role(uuid,text,text,uuid,timestamptz,uuid),
  public.revoke_application_role(uuid,uuid),
  public.grant_explicit_permission(uuid,text,text,uuid,timestamptz,text,uuid),
  public.deny_explicit_permission(uuid,text,text,uuid,timestamptz,text,uuid),
  public.revoke_explicit_permission(text,uuid,uuid),
  public.create_representation_mandate(uuid,uuid,text,uuid,text[],text,uuid,timestamptz,uuid),
  public.confirm_representation_mandate(uuid,uuid),
  public.verify_representation_mandate(uuid,boolean,uuid),
  public.revoke_representation_mandate(uuid,uuid),
  public.resolve_action_context(text,uuid,uuid,text,uuid,uuid)
TO authenticated,service_role;

-- Existing safe query functions remain available.
GRANT EXECUTE ON FUNCTION public.can_view_person(uuid,uuid),public.can_view_bien(uuid,uuid),public.can_view_dossier(uuid,uuid)
TO authenticated;

COMMENT ON TABLE public.family_relations IS 'Canonical family/person relationship. A relation is not a patrimonial right or permission.';
COMMENT ON TABLE public.family_relation_revisions IS 'Append-style revision history for family relation assertions and contestations.';
COMMENT ON COLUMN public.persons.identity_status IS 'Identity evidence state; VERIFIED is privileged and is not equivalent to legal capacity.';
COMMENT ON COLUMN public.persons.death_status IS 'Death information state; declaration/documentation/verification remain distinct.';
