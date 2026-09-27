-- Phase A — canonical transverse foundation:
-- authorization, command idempotency, audit, event contracts, outbox and inbox.

-- ========= AUTHORIZATION FOUNDATION =========

CREATE TABLE public.role_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN (
    'TITULAIRE','CASE_ADMIN','MANAGER','CONTRIBUTOR','PARTICIPANT','READER',
    'REPRESENTATIVE','COMPANION','PROFESSIONAL','MEDIATOR','WITNESS','ADMINISTRATIVE_ACTOR',
    'PLATFORM_ADMIN','SUPPORT_AGENT','ACTOR_VERIFIER','PROCEDURE_EDITOR',
    'MODERATION_REVIEWER','SECURITY_OPERATOR'
  )),
  scope_type text NOT NULL CHECK (scope_type IN (
    'GLOBAL','FAMILY','ASSET','CASE','INHERITANCE','TRANSMISSION','CONFLICT',
    'PROCEDURE','MISSION','DOCUMENT','ALERT','ECONOMIC_ACTIVITY'
  )),
  scope_id uuid,
  valid_from timestamptz NOT NULL DEFAULT now(),
  valid_until timestamptz,
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','SUSPENDED','REVOKED','EXPIRED')),
  assigned_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  CHECK ((scope_type='GLOBAL' AND scope_id IS NULL) OR (scope_type<>'GLOBAL' AND scope_id IS NOT NULL)),
  CHECK (valid_until IS NULL OR valid_until>valid_from),
  CHECK ((status='REVOKED')=(revoked_at IS NOT NULL))
);

CREATE TABLE public.permission_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission text NOT NULL CHECK (permission ~ '^[A-Z][A-Z0-9_]{1,79}$'),
  scope_type text NOT NULL CHECK (scope_type IN (
    'GLOBAL','FAMILY','ASSET','CASE','INHERITANCE','TRANSMISSION','CONFLICT',
    'PROCEDURE','MISSION','DOCUMENT','ALERT','ECONOMIC_ACTIVITY'
  )),
  scope_id uuid,
  valid_from timestamptz NOT NULL DEFAULT now(),
  valid_until timestamptz,
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','SUSPENDED','REVOKED','EXPIRED')),
  granted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reason_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  CHECK ((scope_type='GLOBAL' AND scope_id IS NULL) OR (scope_type<>'GLOBAL' AND scope_id IS NOT NULL)),
  CHECK (valid_until IS NULL OR valid_until>valid_from),
  CHECK ((status='REVOKED')=(revoked_at IS NOT NULL))
);

CREATE TABLE public.permission_denies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission text NOT NULL CHECK (permission ~ '^[A-Z][A-Z0-9_]{1,79}$'),
  scope_type text NOT NULL CHECK (scope_type IN (
    'GLOBAL','FAMILY','ASSET','CASE','INHERITANCE','TRANSMISSION','CONFLICT',
    'PROCEDURE','MISSION','DOCUMENT','ALERT','ECONOMIC_ACTIVITY'
  )),
  scope_id uuid,
  valid_from timestamptz NOT NULL DEFAULT now(),
  valid_until timestamptz,
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','SUSPENDED','REVOKED','EXPIRED')),
  denied_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reason_code text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  CHECK ((scope_type='GLOBAL' AND scope_id IS NULL) OR (scope_type<>'GLOBAL' AND scope_id IS NOT NULL)),
  CHECK (valid_until IS NULL OR valid_until>valid_from),
  CHECK ((status='REVOKED')=(revoked_at IS NOT NULL))
);

CREATE TABLE public.representation_mandates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  represented_person_id uuid NOT NULL REFERENCES public.persons(id) ON DELETE RESTRICT,
  representative_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  scope_type text NOT NULL CHECK (scope_type IN (
    'GLOBAL','FAMILY','ASSET','CASE','INHERITANCE','TRANSMISSION','CONFLICT',
    'PROCEDURE','MISSION','DOCUMENT','ALERT','ECONOMIC_ACTIVITY'
  )),
  scope_id uuid,
  permissions text[] NOT NULL,
  source_type text NOT NULL CHECK (source_type IN ('DECLARATION','DOCUMENTED','VERIFIED','FORMALIZED')),
  source_document_id uuid REFERENCES public.proofs(id) ON DELETE SET NULL,
  valid_from timestamptz NOT NULL DEFAULT now(),
  valid_until timestamptz,
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','SUSPENDED','REVOKED','EXPIRED')),
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  revoked_at timestamptz,
  CHECK ((scope_type='GLOBAL' AND scope_id IS NULL) OR (scope_type<>'GLOBAL' AND scope_id IS NOT NULL)),
  CHECK (cardinality(permissions)>0),
  CHECK (valid_until IS NULL OR valid_until>valid_from),
  CHECK ((status='REVOKED')=(revoked_at IS NOT NULL))
);

CREATE INDEX role_assignments_user_scope_idx ON public.role_assignments(user_id,scope_type,scope_id);
CREATE INDEX permission_grants_user_scope_idx ON public.permission_grants(user_id,permission,scope_type,scope_id);
CREATE INDEX permission_denies_user_scope_idx ON public.permission_denies(user_id,permission,scope_type,scope_id);
CREATE INDEX representation_mandates_representative_idx ON public.representation_mandates(representative_user_id,status);
CREATE INDEX representation_mandates_person_idx ON public.representation_mandates(represented_person_id,status);

-- Preserve existing platform administration semantics without granting patrimonial permissions.
INSERT INTO public.role_assignments(user_id,role,scope_type,scope_id,status,assigned_by)
SELECT ur.user_id,
       CASE ur.role::text WHEN 'admin' THEN 'PLATFORM_ADMIN' ELSE 'MODERATION_REVIEWER' END,
       'GLOBAL',
       NULL,
       'ACTIVE',
       ur.user_id
FROM public.user_roles ur
WHERE ur.role::text IN ('admin','moderator')
ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION public.authorization_scope_matches(
  p_rule_scope_type text,
  p_rule_scope_id uuid,
  p_target_scope_type text,
  p_target_scope_id uuid
) RETURNS boolean
LANGUAGE sql IMMUTABLE SET search_path=public AS $$
  SELECT
    p_rule_scope_type='GLOBAL'
    OR (
      p_rule_scope_type=p_target_scope_type
      AND p_rule_scope_id IS NOT DISTINCT FROM p_target_scope_id
    )
$$;

CREATE OR REPLACE FUNCTION public.role_allows_permission(p_role text,p_permission text)
RETURNS boolean
LANGUAGE sql IMMUTABLE SET search_path=public AS $$
  SELECT CASE p_role
    WHEN 'TITULAIRE' THEN p_permission IN (
      'VIEW','CONTRIBUTE','UPLOAD_DOCUMENT','EDIT','MANAGE_DOCUMENTS','MANAGE_PARTICIPANTS',
      'MANAGE_PROCEDURES','MANAGE_CONFLICT','GRANT_ACCESS','REVOKE_ACCESS','ARCHIVE',
      'REMOVE_FROM_CASE','REMOVE_LINK','SOFT_DELETE','RESTORE','EXPORT','ADMIN_CASE'
    )
    WHEN 'CASE_ADMIN' THEN p_permission IN (
      'VIEW','CONTRIBUTE','UPLOAD_DOCUMENT','EDIT','MANAGE_DOCUMENTS','MANAGE_PARTICIPANTS',
      'MANAGE_PROCEDURES','MANAGE_CONFLICT','GRANT_ACCESS','REVOKE_ACCESS','ARCHIVE',
      'REMOVE_FROM_CASE','REMOVE_LINK','RESTORE','EXPORT','ADMIN_CASE'
    )
    WHEN 'MANAGER' THEN p_permission IN (
      'VIEW','CONTRIBUTE','UPLOAD_DOCUMENT','EDIT','MANAGE_DOCUMENTS','MANAGE_PROCEDURES','ARCHIVE','EXPORT'
    )
    WHEN 'CONTRIBUTOR' THEN p_permission IN ('VIEW','CONTRIBUTE','UPLOAD_DOCUMENT')
    WHEN 'PARTICIPANT' THEN p_permission IN ('VIEW','CONTRIBUTE')
    WHEN 'READER' THEN p_permission='VIEW'
    ELSE false
  END
$$;

CREATE OR REPLACE FUNCTION public.has_effective_permission_for(
  p_user_id uuid,
  p_permission text,
  p_scope_type text,
  p_scope_id uuid
) RETURNS boolean
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public SET row_security=off AS $$
DECLARE
  now_ts timestamptz:=now();
BEGIN
  IF p_user_id IS NULL OR p_permission IS NULL OR p_scope_type IS NULL THEN
    RETURN false;
  END IF;

  -- DENY > ALLOW.
  IF EXISTS (
    SELECT 1
    FROM public.permission_denies d
    WHERE d.user_id=p_user_id
      AND d.permission=p_permission
      AND d.status='ACTIVE'
      AND d.valid_from<=now_ts
      AND (d.valid_until IS NULL OR d.valid_until>now_ts)
      AND public.authorization_scope_matches(d.scope_type,d.scope_id,p_scope_type,p_scope_id)
  ) THEN
    RETURN false;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.permission_grants g
    WHERE g.user_id=p_user_id
      AND g.permission=p_permission
      AND g.status='ACTIVE'
      AND g.valid_from<=now_ts
      AND (g.valid_until IS NULL OR g.valid_until>now_ts)
      AND public.authorization_scope_matches(g.scope_type,g.scope_id,p_scope_type,p_scope_id)
  ) THEN
    RETURN true;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.role_assignments r
    WHERE r.user_id=p_user_id
      AND r.status='ACTIVE'
      AND r.valid_from<=now_ts
      AND (r.valid_until IS NULL OR r.valid_until>now_ts)
      AND public.authorization_scope_matches(r.scope_type,r.scope_id,p_scope_type,p_scope_id)
      AND public.role_allows_permission(r.role,p_permission)
  ) THEN
    RETURN true;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.representation_mandates m
    WHERE m.representative_user_id=p_user_id
      AND m.status='ACTIVE'
      AND m.valid_from<=now_ts
      AND (m.valid_until IS NULL OR m.valid_until>now_ts)
      AND p_permission=ANY(m.permissions)
      AND public.authorization_scope_matches(m.scope_type,m.scope_id,p_scope_type,p_scope_id)
  ) THEN
    RETURN true;
  END IF;

  RETURN false;
END $$;

CREATE OR REPLACE FUNCTION public.has_effective_permission(
  p_permission text,
  p_scope_type text,
  p_scope_id uuid DEFAULT NULL
) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public SET row_security=off AS $$
  SELECT public.has_effective_permission_for(auth.uid(),p_permission,p_scope_type,p_scope_id)
$$;

REVOKE ALL ON FUNCTION public.authorization_scope_matches(text,uuid,text,uuid),
  public.role_allows_permission(text,text),
  public.has_effective_permission_for(uuid,text,text,uuid),
  public.has_effective_permission(text,text,uuid)
FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_effective_permission(text,text,uuid) TO authenticated;

ALTER TABLE public.role_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permission_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permission_denies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.representation_mandates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users view own role assignments"
ON public.role_assignments FOR SELECT TO authenticated
USING (user_id=auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "users view own permission grants"
ON public.permission_grants FOR SELECT TO authenticated
USING (user_id=auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "users view own permission denies"
ON public.permission_denies FOR SELECT TO authenticated
USING (user_id=auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "mandate parties view mandates"
ON public.representation_mandates FOR SELECT TO authenticated
USING (
  representative_user_id=auth.uid()
  OR created_by=auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.persons p
    WHERE p.id=represented_person_id AND p.linked_profile_id=auth.uid()
  )
  OR public.has_role(auth.uid(),'admin')
);

REVOKE ALL ON public.role_assignments,public.permission_grants,public.permission_denies,public.representation_mandates
FROM anon,authenticated;
GRANT SELECT ON public.role_assignments,public.permission_grants,public.permission_denies,public.representation_mandates
TO authenticated;

-- ========= COMMAND FOUNDATION =========

CREATE TABLE public.command_idempotency_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  principal_key text NOT NULL,
  command_name text NOT NULL CHECK (command_name ~ '^[A-Z][A-Za-z0-9]{2,119}$'),
  command_version integer NOT NULL DEFAULT 1 CHECK (command_version>0),
  idempotency_key text NOT NULL CHECK (char_length(idempotency_key) BETWEEN 8 AND 200),
  request_hash text NOT NULL CHECK (request_hash ~ '^[a-f0-9]{64}$'),
  status text NOT NULL DEFAULT 'PROCESSING' CHECK (status IN (
    'PROCESSING','SUCCEEDED','ACCEPTED_ASYNC','REVIEW_REQUIRED','REJECTED',
    'NOT_AUTHORIZED','CONFLICT','FAILED'
  )),
  result_payload jsonb,
  target_ref jsonb,
  correlation_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  expires_at timestamptz,
  UNIQUE(principal_key,command_name,idempotency_key),
  CHECK (expires_at IS NULL OR expires_at>created_at)
);
CREATE INDEX command_idempotency_correlation_idx ON public.command_idempotency_records(correlation_id);
ALTER TABLE public.command_idempotency_records ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.command_idempotency_records FROM anon,authenticated;

-- ========= EVENT CONTRACT + RELIABLE DELIVERY FOUNDATION =========

CREATE TABLE public.event_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id text NOT NULL UNIQUE,
  event_name text NOT NULL CHECK (event_name ~ '^[a-z0-9-]+\.[a-z0-9-]+\.[a-z0-9-]+$'),
  event_version integer NOT NULL CHECK (event_version>0),
  producer_domain text NOT NULL,
  event_category text NOT NULL CHECK (event_category IN ('DOMAIN_EVENT','INTEGRATION_EVENT','SYSTEM_EVENT','AUDIT_EVENT')),
  confidentiality text NOT NULL DEFAULT 'NORMAL' CHECK (confidentiality IN ('NORMAL','SENSITIVE','HIGHLY_SENSITIVE','SECRET')),
  ordering_policy text NOT NULL DEFAULT 'NONE' CHECK (ordering_policy IN ('NONE','PER_AGGREGATE','STRICT_PER_AGGREGATE')),
  payload_schema jsonb NOT NULL DEFAULT '{}'::jsonb,
  allowed_consumers text[] NOT NULL DEFAULT '{}'::text[],
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('DRAFT','ACTIVE','DEPRECATED','RETIRED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(event_name,event_version)
);

CREATE TABLE public.integration_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL UNIQUE,
  event_name text NOT NULL,
  event_version integer NOT NULL CHECK (event_version>0),
  event_category text NOT NULL CHECK (event_category IN ('DOMAIN_EVENT','INTEGRATION_EVENT','SYSTEM_EVENT','AUDIT_EVENT')),
  source_domain text NOT NULL,
  source_entity_type text NOT NULL,
  source_entity_id uuid,
  aggregate_version bigint,
  aggregate_sequence bigint,
  occurred_at timestamptz NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  actor_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_person_id uuid REFERENCES public.persons(id) ON DELETE SET NULL,
  acting_role text,
  represented_person_id uuid REFERENCES public.persons(id) ON DELETE SET NULL,
  mandate_id uuid REFERENCES public.representation_mandates(id) ON DELETE SET NULL,
  correlation_id uuid NOT NULL,
  causation_id uuid,
  confidentiality text NOT NULL DEFAULT 'NORMAL' CHECK (confidentiality IN ('NORMAL','SENSITIVE','HIGHLY_SENSITIVE','SECRET')),
  event_origin text NOT NULL DEFAULT 'APPLICATION' CHECK (event_origin IN ('APPLICATION','PROCESS_MANAGER','JOB','SYSTEM','IMPORT')),
  envelope jsonb NOT NULL,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','PUBLISHING','PUBLISHED','FAILED','DEAD_LETTER')),
  available_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz,
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts>=0),
  last_error_code text,
  last_error_at timestamptz
);
CREATE INDEX integration_outbox_dispatch_idx ON public.integration_outbox(status,available_at,recorded_at);
CREATE INDEX integration_outbox_aggregate_idx ON public.integration_outbox(source_domain,source_entity_type,source_entity_id,aggregate_sequence);
CREATE INDEX integration_outbox_correlation_idx ON public.integration_outbox(correlation_id);

CREATE TABLE public.integration_inbox (
  consumer_name text NOT NULL,
  event_id uuid NOT NULL,
  event_name text NOT NULL,
  event_version integer NOT NULL CHECK (event_version>0),
  envelope jsonb NOT NULL,
  status text NOT NULL DEFAULT 'RECEIVED' CHECK (status IN (
    'RECEIVED','PROCESSING','PROCESSED','FAILED_RETRYABLE','FAILED_PERMANENT','DEAD_LETTER'
  )),
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts>=0),
  last_error_code text,
  last_error_at timestamptz,
  PRIMARY KEY(consumer_name,event_id)
);
CREATE INDEX integration_inbox_status_idx ON public.integration_inbox(consumer_name,status,received_at);

ALTER TABLE public.event_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_outbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_inbox ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.event_contracts,public.integration_outbox,public.integration_inbox FROM anon,authenticated;
GRANT SELECT,INSERT,UPDATE ON public.event_contracts,public.integration_outbox,public.integration_inbox TO service_role;

-- ========= GLOBAL AUDIT =========

CREATE TABLE public.audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL DEFAULT 'ACTION' CHECK (event_type IN ('ACTION','AUTHORIZATION','COMMAND','SECURITY','SYSTEM')),
  actor_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_person_id uuid REFERENCES public.persons(id) ON DELETE SET NULL,
  acting_role text,
  represented_person_id uuid REFERENCES public.persons(id) ON DELETE SET NULL,
  mandate_id uuid REFERENCES public.representation_mandates(id) ON DELETE SET NULL,
  permission text,
  scope_type text,
  scope_id uuid,
  action text NOT NULL,
  target_domain text NOT NULL,
  target_type text,
  target_id uuid,
  result text NOT NULL CHECK (result IN ('SUCCEEDED','DENIED','REJECTED','FAILED','REVIEW_REQUIRED','ACCEPTED_ASYNC')),
  reason_code text,
  command_id uuid,
  correlation_id uuid NOT NULL,
  causation_id uuid,
  safe_context jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_events_actor_idx ON public.audit_events(actor_user_id,occurred_at DESC);
CREATE INDEX audit_events_target_idx ON public.audit_events(target_domain,target_type,target_id,occurred_at DESC);
CREATE INDEX audit_events_correlation_idx ON public.audit_events(correlation_id);

CREATE OR REPLACE FUNCTION public.prevent_audit_event_mutation()
RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
  RAISE EXCEPTION 'audit_events_append_only' USING ERRCODE='55000';
END $$;

CREATE TRIGGER audit_events_append_only
BEFORE UPDATE OR DELETE ON public.audit_events
FOR EACH ROW EXECUTE FUNCTION public.prevent_audit_event_mutation();

ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "platform admins view audit events"
ON public.audit_events FOR SELECT TO authenticated
USING (public.has_role(auth.uid(),'admin'));
REVOKE ALL ON public.audit_events FROM anon,authenticated;
GRANT SELECT ON public.audit_events TO authenticated;
GRANT SELECT,INSERT ON public.audit_events TO service_role;

-- ========= INTERNAL HELPERS =========

CREATE OR REPLACE FUNCTION public.record_audit_event(
  p_event_type text,
  p_action text,
  p_target_domain text,
  p_result text,
  p_correlation_id uuid,
  p_target_type text DEFAULT NULL,
  p_target_id uuid DEFAULT NULL,
  p_reason_code text DEFAULT NULL,
  p_command_id uuid DEFAULT NULL,
  p_actor_person_id uuid DEFAULT NULL,
  p_acting_role text DEFAULT NULL,
  p_represented_person_id uuid DEFAULT NULL,
  p_mandate_id uuid DEFAULT NULL,
  p_permission text DEFAULT NULL,
  p_scope_type text DEFAULT NULL,
  p_scope_id uuid DEFAULT NULL,
  p_causation_id uuid DEFAULT NULL,
  p_safe_context jsonb DEFAULT '{}'::jsonb
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
DECLARE new_id uuid;
BEGIN
  IF p_safe_context IS NULL THEN p_safe_context:='{}'::jsonb; END IF;
  INSERT INTO public.audit_events(
    event_type,actor_user_id,actor_person_id,acting_role,represented_person_id,mandate_id,
    permission,scope_type,scope_id,action,target_domain,target_type,target_id,result,reason_code,
    command_id,correlation_id,causation_id,safe_context
  ) VALUES (
    p_event_type,auth.uid(),p_actor_person_id,p_acting_role,p_represented_person_id,p_mandate_id,
    p_permission,p_scope_type,p_scope_id,p_action,p_target_domain,p_target_type,p_target_id,p_result,p_reason_code,
    p_command_id,p_correlation_id,p_causation_id,p_safe_context
  ) RETURNING id INTO new_id;
  RETURN new_id;
END $$;

CREATE OR REPLACE FUNCTION public.enqueue_domain_event(
  p_event_id uuid,
  p_event_name text,
  p_event_version integer,
  p_event_category text,
  p_source_domain text,
  p_source_entity_type text,
  p_source_entity_id uuid,
  p_aggregate_version bigint,
  p_aggregate_sequence bigint,
  p_occurred_at timestamptz,
  p_actor_person_id uuid,
  p_acting_role text,
  p_represented_person_id uuid,
  p_mandate_id uuid,
  p_correlation_id uuid,
  p_causation_id uuid,
  p_confidentiality text,
  p_event_origin text,
  p_payload jsonb
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
DECLARE outbox_id uuid; event_envelope jsonb;
BEGIN
  IF p_event_name !~ '^[a-z0-9-]+\.[a-z0-9-]+\.[a-z0-9-]+$' OR p_event_version<1 THEN
    RAISE EXCEPTION 'invalid_event_contract' USING ERRCODE='22023';
  END IF;
  IF p_payload IS NULL THEN p_payload:='{}'::jsonb; END IF;

  event_envelope:=jsonb_build_object(
    'event_id',p_event_id,
    'event_name',p_event_name,
    'event_version',p_event_version,
    'event_category',p_event_category,
    'source_domain',p_source_domain,
    'source_entity_type',p_source_entity_type,
    'source_entity_id',p_source_entity_id,
    'aggregate_version',p_aggregate_version,
    'aggregate_sequence',p_aggregate_sequence,
    'occurred_at',p_occurred_at,
    'recorded_at',now(),
    'actor_user_id',auth.uid(),
    'actor_person_id',p_actor_person_id,
    'acting_role',p_acting_role,
    'represented_person_id',p_represented_person_id,
    'mandate_id',p_mandate_id,
    'correlation_id',p_correlation_id,
    'causation_id',p_causation_id,
    'confidentiality',p_confidentiality,
    'event_origin',p_event_origin,
    'payload',p_payload
  );

  INSERT INTO public.integration_outbox(
    event_id,event_name,event_version,event_category,source_domain,source_entity_type,source_entity_id,
    aggregate_version,aggregate_sequence,occurred_at,actor_user_id,actor_person_id,acting_role,
    represented_person_id,mandate_id,correlation_id,causation_id,confidentiality,event_origin,envelope
  ) VALUES (
    p_event_id,p_event_name,p_event_version,p_event_category,p_source_domain,p_source_entity_type,p_source_entity_id,
    p_aggregate_version,p_aggregate_sequence,p_occurred_at,auth.uid(),p_actor_person_id,p_acting_role,
    p_represented_person_id,p_mandate_id,p_correlation_id,p_causation_id,p_confidentiality,p_event_origin,event_envelope
  )
  ON CONFLICT(event_id) DO UPDATE SET event_id=EXCLUDED.event_id
  RETURNING id INTO outbox_id;

  RETURN outbox_id;
END $$;

CREATE OR REPLACE FUNCTION public.claim_outbox_batch(p_limit integer DEFAULT 50)
RETURNS SETOF public.integration_outbox
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
BEGIN
  IF p_limit<1 OR p_limit>200 THEN RAISE EXCEPTION 'invalid_outbox_batch_size' USING ERRCODE='22023'; END IF;
  RETURN QUERY
  WITH claimed AS (
    SELECT o.id
    FROM public.integration_outbox o
    WHERE o.status IN ('PENDING','FAILED') AND o.available_at<=now()
    ORDER BY o.recorded_at
    FOR UPDATE SKIP LOCKED
    LIMIT p_limit
  )
  UPDATE public.integration_outbox o
  SET status='PUBLISHING',attempts=o.attempts+1,last_error_code=NULL
  FROM claimed c
  WHERE o.id=c.id
  RETURNING o.*;
END $$;

CREATE OR REPLACE FUNCTION public.complete_outbox_event(
  p_event_id uuid,
  p_success boolean,
  p_error_code text DEFAULT NULL,
  p_retry_after_seconds integer DEFAULT 30
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
BEGIN
  UPDATE public.integration_outbox
  SET status=CASE
      WHEN p_success THEN 'PUBLISHED'
      WHEN attempts>=10 THEN 'DEAD_LETTER'
      ELSE 'FAILED'
    END,
    published_at=CASE WHEN p_success THEN now() ELSE published_at END,
    last_error_code=CASE WHEN p_success THEN NULL ELSE left(COALESCE(p_error_code,'delivery_failed'),160) END,
    last_error_at=CASE WHEN p_success THEN NULL ELSE now() END,
    available_at=CASE WHEN p_success THEN available_at ELSE now()+make_interval(secs=>GREATEST(1,p_retry_after_seconds)) END
  WHERE event_id=p_event_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'outbox_event_not_found' USING ERRCODE='P0002'; END IF;
END $$;

CREATE OR REPLACE FUNCTION public.register_inbox_event(
  p_consumer_name text,
  p_event_id uuid,
  p_event_name text,
  p_event_version integer,
  p_envelope jsonb
) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
BEGIN
  INSERT INTO public.integration_inbox(consumer_name,event_id,event_name,event_version,envelope)
  VALUES(p_consumer_name,p_event_id,p_event_name,p_event_version,COALESCE(p_envelope,'{}'::jsonb))
  ON CONFLICT(consumer_name,event_id) DO NOTHING;
  RETURN FOUND;
END $$;

CREATE OR REPLACE FUNCTION public.complete_inbox_event(
  p_consumer_name text,
  p_event_id uuid,
  p_success boolean,
  p_retryable boolean DEFAULT true,
  p_error_code text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
BEGIN
  UPDATE public.integration_inbox
  SET status=CASE
      WHEN p_success THEN 'PROCESSED'
      WHEN p_retryable AND attempts<10 THEN 'FAILED_RETRYABLE'
      WHEN p_retryable THEN 'DEAD_LETTER'
      ELSE 'FAILED_PERMANENT'
    END,
    attempts=attempts+1,
    processed_at=CASE WHEN p_success THEN now() ELSE processed_at END,
    last_error_code=CASE WHEN p_success THEN NULL ELSE left(COALESCE(p_error_code,'consumer_failed'),160) END,
    last_error_at=CASE WHEN p_success THEN NULL ELSE now() END
  WHERE consumer_name=p_consumer_name AND event_id=p_event_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'inbox_event_not_found' USING ERRCODE='P0002'; END IF;
END $$;

CREATE OR REPLACE FUNCTION public.claim_command_idempotency(
  p_command_name text,
  p_command_version integer,
  p_idempotency_key text,
  p_request_hash text,
  p_correlation_id uuid
) RETURNS TABLE(record_id uuid,result_status text,result_payload jsonb,is_new boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
DECLARE
  principal text;
  existing public.command_idempotency_records;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'command_unauthorized' USING ERRCODE='42501'; END IF;
  principal:='user:'||auth.uid()::text;

  SELECT * INTO existing
  FROM public.command_idempotency_records
  WHERE principal_key=principal AND command_name=p_command_name AND idempotency_key=p_idempotency_key
  FOR UPDATE;

  IF FOUND THEN
    IF existing.request_hash<>p_request_hash THEN
      RAISE EXCEPTION 'idempotency_key_reused_with_different_payload' USING ERRCODE='22023';
    END IF;
    RETURN QUERY SELECT existing.id,existing.status,existing.result_payload,false;
    RETURN;
  END IF;

  INSERT INTO public.command_idempotency_records(
    principal_key,command_name,command_version,idempotency_key,request_hash,correlation_id
  ) VALUES (
    principal,p_command_name,p_command_version,p_idempotency_key,p_request_hash,p_correlation_id
  )
  RETURNING id,status,result_payload INTO record_id,result_status,result_payload;

  is_new:=true;
  RETURN NEXT;
END $$;

CREATE OR REPLACE FUNCTION public.complete_command_idempotency(
  p_record_id uuid,
  p_status text,
  p_result_payload jsonb DEFAULT NULL,
  p_target_ref jsonb DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
DECLARE principal text:='user:'||COALESCE(auth.uid()::text,'');
BEGIN
  UPDATE public.command_idempotency_records
  SET status=p_status,result_payload=p_result_payload,target_ref=p_target_ref,completed_at=now()
  WHERE id=p_record_id AND principal_key=principal;
  IF NOT FOUND THEN RAISE EXCEPTION 'idempotency_record_not_found' USING ERRCODE='P0002'; END IF;
END $$;

REVOKE ALL ON FUNCTION public.record_audit_event(text,text,text,text,uuid,text,uuid,text,uuid,uuid,text,uuid,uuid,text,text,uuid,uuid,jsonb),
  public.enqueue_domain_event(uuid,text,integer,text,text,text,uuid,bigint,bigint,timestamptz,uuid,text,uuid,uuid,uuid,uuid,text,text,jsonb),
  public.claim_outbox_batch(integer),
  public.complete_outbox_event(uuid,boolean,text,integer),
  public.register_inbox_event(text,uuid,text,integer,jsonb),
  public.complete_inbox_event(text,uuid,boolean,boolean,text),
  public.claim_command_idempotency(text,integer,text,text,uuid),
  public.complete_command_idempotency(uuid,text,jsonb,jsonb)
FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.claim_outbox_batch(integer),
  public.complete_outbox_event(uuid,boolean,text,integer),
  public.register_inbox_event(text,uuid,text,integer,jsonb),
  public.complete_inbox_event(text,uuid,boolean,boolean,text)
TO service_role;

-- Internal command/application RPCs may call these helpers under SECURITY DEFINER.
-- They are intentionally not executable directly by authenticated clients.

COMMENT ON TABLE public.audit_events IS 'Append-only canonical audit trail. Business RPCs write through record_audit_event.';
COMMENT ON TABLE public.integration_outbox IS 'Transactional domain/integration event outbox. Not an event-sourcing store.';
COMMENT ON TABLE public.integration_inbox IS 'Per-consumer idempotency inbox for at-least-once delivery.';
COMMENT ON TABLE public.command_idempotency_records IS 'Canonical command idempotency records; internal application services only.';
COMMENT ON FUNCTION public.has_effective_permission(text,text,uuid) IS 'Authoritative current-user permission check. Explicit deny overrides grants, roles and mandates.';
