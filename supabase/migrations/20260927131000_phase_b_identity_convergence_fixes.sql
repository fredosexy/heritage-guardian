-- Phase B corrective convergence:
-- - preserve B7 summary isolation
-- - add canonical Person creation/account claim
-- - create linked Person for future profiles
-- - add participation acceptance/role activation

INSERT INTO public.event_contracts(
  contract_id,event_name,event_version,producer_domain,event_category,confidentiality,ordering_policy,payload_schema,status
) VALUES(
  'EVT-05-000','person.person.created',1,'person','DOMAIN_EVENT','SENSITIVE','PER_AGGREGATE','{}'::jsonb,'ACTIVE'
)
ON CONFLICT(event_name,event_version) DO NOTHING;

CREATE OR REPLACE FUNCTION public.sync_profile_person_on_insert()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
BEGIN
  INSERT INTO public.persons(linked_profile_id,display_name,phone,created_by,identity_status)
  VALUES(
    NEW.id,
    COALESCE(NULLIF(btrim(NEW.full_name),''),'Utilisateur'),
    NEW.phone,
    NEW.id,
    'DECLARED'
  )
  ON CONFLICT(linked_profile_id) DO NOTHING;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS sync_profile_person_on_insert ON public.profiles;
CREATE TRIGGER sync_profile_person_on_insert
AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.sync_profile_person_on_insert();

CREATE OR REPLACE FUNCTION public.create_person_record(
  p_display_name text,
  p_phone text,
  p_email text,
  p_identity_status text,
  p_correlation_id uuid
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
DECLARE current_user_id uuid:=auth.uid(); new_id uuid;
BEGIN
  IF current_user_id IS NULL THEN RAISE EXCEPTION 'authentication_required' USING ERRCODE='42501'; END IF;
  IF p_display_name IS NULL OR char_length(btrim(p_display_name)) NOT BETWEEN 2 AND 160 THEN
    RAISE EXCEPTION 'invalid_person_name' USING ERRCODE='22023';
  END IF;
  IF p_identity_status NOT IN ('PARTIAL','DECLARED','DOCUMENTED','CONTESTED','DUPLICATE_SUSPECTED') THEN
    RAISE EXCEPTION 'person_creation_status_forbidden' USING ERRCODE='42501';
  END IF;
  IF p_phone IS NOT NULL AND char_length(p_phone)>40 THEN RAISE EXCEPTION 'invalid_person_phone' USING ERRCODE='22023'; END IF;
  IF p_email IS NOT NULL AND char_length(p_email)>254 THEN RAISE EXCEPTION 'invalid_person_email' USING ERRCODE='22023'; END IF;

  INSERT INTO public.persons(display_name,phone,email,created_by,identity_status)
  VALUES(btrim(p_display_name),p_phone,p_email,current_user_id,p_identity_status)
  RETURNING id INTO new_id;

  PERFORM public.phase_b_record_change(
    'person.person.created','Person',new_id,'CreatePerson',p_correlation_id,
    jsonb_build_object('person_id',new_id,'identity_status',p_identity_status)
  );
  RETURN new_id;
END $$;

CREATE OR REPLACE FUNCTION public.claim_person_record(
  p_person_id uuid,
  p_correlation_id uuid
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
DECLARE
  current_user_id uuid:=auth.uid();
  item public.persons;
  account_email text;
  profile_phone text;
  canonical_id uuid:=public.resolve_person_id(p_person_id);
BEGIN
  IF current_user_id IS NULL OR canonical_id IS NULL THEN
    RAISE EXCEPTION 'person_claim_forbidden' USING ERRCODE='42501';
  END IF;

  SELECT * INTO item FROM public.persons WHERE id=canonical_id FOR UPDATE;
  IF item.linked_profile_id IS NOT NULL THEN
    IF item.linked_profile_id=current_user_id THEN RETURN item.id; END IF;
    RAISE EXCEPTION 'person_already_linked' USING ERRCODE='42501';
  END IF;

  SELECT lower(email) INTO account_email FROM auth.users WHERE id=current_user_id;
  SELECT phone INTO profile_phone FROM public.profiles WHERE id=current_user_id;

  IF NOT (
    (item.email IS NOT NULL AND account_email IS NOT NULL AND lower(item.email)=account_email)
    OR
    (item.phone IS NOT NULL AND profile_phone IS NOT NULL AND item.phone=profile_phone)
  ) THEN
    RAISE EXCEPTION 'person_claim_identity_mismatch' USING ERRCODE='42501';
  END IF;

  -- If an auto-created account Person exists and has no domain references yet,
  -- preserve it as a historical alias source by merging it into the claimed record.
  UPDATE public.persons p
  SET merged_into_person_id=item.id,merged_at=now(),merged_by=current_user_id,
      identity_status='DUPLICATE_SUSPECTED',linked_profile_id=NULL
  WHERE p.linked_profile_id=current_user_id
    AND p.id<>item.id
    AND NOT EXISTS(SELECT 1 FROM public.bien_right_holders b WHERE b.person_id=p.id)
    AND NOT EXISTS(SELECT 1 FROM public.dossier_participants d WHERE d.person_id=p.id)
    AND NOT EXISTS(SELECT 1 FROM public.family_relations f WHERE f.from_person_id=p.id OR f.to_person_id=p.id);

  UPDATE public.persons
  SET linked_profile_id=current_user_id
  WHERE id=item.id;

  PERFORM public.phase_b_record_change(
    'person.person.updated','Person',item.id,'ClaimPerson',p_correlation_id,
    jsonb_build_object('person_id',item.id,'linked_account',true)
  );
  RETURN item.id;
END $$;

CREATE OR REPLACE FUNCTION public.accept_dossier_participation(
  p_participant_id uuid,
  p_correlation_id uuid
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
DECLARE
  current_user_id uuid:=auth.uid();
  item public.dossier_participants;
  linked_user uuid;
  mapped_role text;
BEGIN
  SELECT * INTO item FROM public.dossier_participants WHERE id=p_participant_id FOR UPDATE;
  IF item.id IS NULL OR item.status<>'invite' THEN
    RAISE EXCEPTION 'participation_invalid_state' USING ERRCODE='22023';
  END IF;

  SELECT COALESCE(p.linked_profile_id,item.user_id) INTO linked_user
  FROM public.persons p WHERE p.id=item.person_id;

  IF linked_user IS DISTINCT FROM current_user_id THEN
    RAISE EXCEPTION 'participation_acceptance_forbidden' USING ERRCODE='42501';
  END IF;

  UPDATE public.dossier_participants
  SET status='actif',accepted_at=now()
  WHERE id=item.id;

  mapped_role:=CASE item.role
    WHEN 'declarant' THEN 'CONTRIBUTOR'
    WHEN 'accompagnateur' THEN 'COMPANION'
    WHEN 'temoin' THEN 'WITNESS'
    WHEN 'professionnel' THEN 'PROFESSIONAL'
    WHEN 'service' THEN 'ADMINISTRATIVE_ACTOR'
    WHEN 'autorite' THEN 'ADMINISTRATIVE_ACTOR'
    ELSE 'PARTICIPANT'
  END;

  UPDATE public.role_assignments
  SET status='ACTIVE',valid_from=now()
  WHERE user_id=current_user_id
    AND role=mapped_role
    AND scope_type='CASE'
    AND scope_id=item.dossier_id
    AND status='SUSPENDED';

  IF NOT FOUND THEN
    PERFORM public.ensure_role_assignment_internal(
      current_user_id,mapped_role,'CASE',item.dossier_id,item.invited_by
    );
  END IF;

  PERFORM public.phase_b_record_change(
    'person.role-assignment.changed','DossierParticipant',item.id,'AcceptParticipation',p_correlation_id,
    jsonb_build_object('participant_id',item.id,'case_id',item.dossier_id,'role',mapped_role)
  );
END $$;

-- Legacy B7 "voir_resume" is deliberately NOT full canonical VIEW.
-- This keeps selected-document isolation intact.
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

  IF EXISTS(
    SELECT 1 FROM public.permission_denies d
    WHERE d.user_id=p_user_id AND d.permission=p_permission
      AND d.status='ACTIVE' AND d.valid_from<=now_ts
      AND (d.valid_until IS NULL OR d.valid_until>now_ts)
      AND public.authorization_scope_matches(d.scope_type,d.scope_id,p_scope_type,p_scope_id)
  ) THEN RETURN false; END IF;

  IF EXISTS(
    SELECT 1 FROM public.permission_grants g
    WHERE g.user_id=p_user_id AND g.permission=p_permission
      AND g.status='ACTIVE' AND g.valid_from<=now_ts
      AND (g.valid_until IS NULL OR g.valid_until>now_ts)
      AND public.authorization_scope_matches(g.scope_type,g.scope_id,p_scope_type,p_scope_id)
  ) THEN RETURN true; END IF;

  IF EXISTS(
    SELECT 1 FROM public.role_assignments r
    WHERE r.user_id=p_user_id AND r.status='ACTIVE'
      AND r.valid_from<=now_ts AND (r.valid_until IS NULL OR r.valid_until>now_ts)
      AND public.authorization_scope_matches(r.scope_type,r.scope_id,p_scope_type,p_scope_id)
      AND public.role_allows_permission(r.role,p_permission)
  ) THEN RETURN true; END IF;

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

  IF p_scope_type='CASE' AND p_scope_id IS NOT NULL THEN
    IF p_permission='VIEW_CASE_SUMMARY' AND public.has_scope(p_scope_id,p_user_id,'voir_resume') THEN RETURN true; END IF;
    IF p_permission='UPLOAD_DOCUMENT' AND public.has_scope(p_scope_id,p_user_id,'ajouter_document') THEN RETURN true; END IF;
    IF p_permission='CONTRIBUTE' AND (
      public.has_scope(p_scope_id,p_user_id,'commenter')
      OR public.has_scope(p_scope_id,p_user_id,'accompagner')
      OR public.has_scope(p_scope_id,p_user_id,'intervenir')
    ) THEN RETURN true; END IF;
  END IF;

  RETURN false;
END $$;

REVOKE ALL ON FUNCTION public.sync_profile_person_on_insert(),
  public.create_person_record(text,text,text,text,uuid),
  public.claim_person_record(uuid,uuid),
  public.accept_dossier_participation(uuid,uuid)
FROM PUBLIC,anon;

GRANT EXECUTE ON FUNCTION public.create_person_record(text,text,text,text,uuid),
  public.claim_person_record(uuid,uuid),
  public.accept_dossier_participation(uuid,uuid)
TO authenticated,service_role;
