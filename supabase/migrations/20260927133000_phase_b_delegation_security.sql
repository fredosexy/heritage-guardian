-- Phase B security hardening:
-- delegation cannot create authority, Person claims/merges preserve account identity,
-- and merged Person references remain visible without rewriting history.

CREATE OR REPLACE FUNCTION public.person_directly_manageable(p_person_id uuid,p_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public SET row_security=off AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.persons p
    WHERE p.id=p_person_id
      AND p.merged_into_person_id IS NULL
      AND (
        public.has_role(p_user_id,'admin')
        OR (p.linked_profile_id IS NOT NULL AND p.linked_profile_id=p_user_id)
        OR (p.linked_profile_id IS NULL AND p.created_by=p_user_id)
      )
  )
$$;

CREATE OR REPLACE FUNCTION public.current_user_person_id()
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public SET row_security=off AS $$
  SELECT COALESCE(p.merged_into_person_id,p.id)
  FROM public.persons p
  WHERE p.linked_profile_id=auth.uid()
  ORDER BY (p.merged_into_person_id IS NULL) DESC
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.has_explicit_permission_deny_for(
  p_user_id uuid,p_permission text,p_scope_type text,p_scope_id uuid
) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public SET row_security=off AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.permission_denies d
    WHERE d.user_id=p_user_id
      AND d.permission=p_permission
      AND d.status='ACTIVE'
      AND d.valid_from<=now()
      AND (d.valid_until IS NULL OR d.valid_until>now())
      AND public.authorization_scope_matches(d.scope_type,d.scope_id,p_scope_type,p_scope_id)
  )
$$;

CREATE OR REPLACE FUNCTION public.has_direct_permission_allow_for(
  p_user_id uuid,p_permission text,p_scope_type text,p_scope_id uuid
) RETURNS boolean
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public SET row_security=off AS $$
BEGIN
  IF p_user_id IS NULL OR p_permission IS NULL OR p_scope_type IS NULL THEN RETURN false; END IF;

  IF EXISTS(
    SELECT 1 FROM public.permission_grants g
    WHERE g.user_id=p_user_id AND g.permission=p_permission
      AND g.status='ACTIVE' AND g.valid_from<=now()
      AND (g.valid_until IS NULL OR g.valid_until>now())
      AND public.authorization_scope_matches(g.scope_type,g.scope_id,p_scope_type,p_scope_id)
  ) THEN RETURN true; END IF;

  IF EXISTS(
    SELECT 1 FROM public.role_assignments r
    WHERE r.user_id=p_user_id AND r.status='ACTIVE'
      AND r.valid_from<=now() AND (r.valid_until IS NULL OR r.valid_until>now())
      AND public.authorization_scope_matches(r.scope_type,r.scope_id,p_scope_type,p_scope_id)
      AND public.role_allows_permission(r.role,p_permission)
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

CREATE OR REPLACE FUNCTION public.has_effective_permission_for(
  p_user_id uuid,p_permission text,p_scope_type text,p_scope_id uuid
) RETURNS boolean
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public SET row_security=off AS $$
BEGIN
  IF p_user_id IS NULL OR p_permission IS NULL OR p_scope_type IS NULL THEN RETURN false; END IF;

  -- DENY on the acting principal always wins, including over a mandate.
  IF public.has_explicit_permission_deny_for(p_user_id,p_permission,p_scope_type,p_scope_id) THEN
    RETURN false;
  END IF;

  IF public.has_direct_permission_allow_for(p_user_id,p_permission,p_scope_type,p_scope_id) THEN
    RETURN true;
  END IF;

  -- A mandate delegates existing authority; it never creates new authority.
  IF EXISTS(
    SELECT 1
    FROM public.representation_mandates m
    JOIN public.persons source_person ON source_person.id=m.represented_person_id
    JOIN public.persons represented
      ON represented.id=COALESCE(source_person.merged_into_person_id,source_person.id)
    WHERE m.representative_user_id=p_user_id
      AND m.status='ACTIVE'
      AND m.valid_from<=now()
      AND (m.valid_until IS NULL OR m.valid_until>now())
      AND p_permission=ANY(m.permissions)
      AND public.authorization_scope_matches(m.scope_type,m.scope_id,p_scope_type,p_scope_id)
      AND (
        (
          represented.linked_profile_id IS NOT NULL
          AND m.confirmed_by_represented_at IS NOT NULL
          AND NOT public.has_explicit_permission_deny_for(
            represented.linked_profile_id,p_permission,p_scope_type,p_scope_id
          )
          AND public.has_direct_permission_allow_for(
            represented.linked_profile_id,p_permission,p_scope_type,p_scope_id
          )
        )
        OR
        (
          represented.linked_profile_id IS NULL
          AND m.source_type IN ('VERIFIED','FORMALIZED')
          AND m.verified_at IS NOT NULL
        )
      )
  ) THEN RETURN true; END IF;

  RETURN false;
END $$;

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
        LEFT JOIN public.persons canonical ON canonical.id=p.merged_into_person_id
        WHERE brh.bien_id=b.id AND brh.status<>'revoque'
          AND (p.linked_profile_id=_user_id OR canonical.linked_profile_id=_user_id)
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
        LEFT JOIN public.persons canonical ON canonical.id=p.merged_into_person_id
        WHERE dp.dossier_id=d.id AND dp.status='actif'
          AND (
            p.linked_profile_id=_user_id
            OR canonical.linked_profile_id=_user_id
            OR dp.user_id=_user_id
          )
      )
    )
  )
$$;

CREATE OR REPLACE FUNCTION public.claim_person_record(
  p_person_id uuid,p_correlation_id uuid
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
DECLARE
  current_user_id uuid:=auth.uid();
  item public.persons;
  existing public.persons;
  account_email text;
  profile_phone text;
  canonical_id uuid:=public.resolve_person_id(p_person_id);
  brh record;
  dp record;
  mapped_role text;
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
    OR (item.phone IS NOT NULL AND profile_phone IS NOT NULL AND item.phone=profile_phone)
  ) THEN
    RAISE EXCEPTION 'person_claim_identity_mismatch' USING ERRCODE='42501';
  END IF;

  SELECT * INTO existing
  FROM public.persons
  WHERE linked_profile_id=current_user_id AND id<>item.id
  FOR UPDATE;

  IF existing.id IS NOT NULL THEN
    INSERT INTO public.person_aliases(person_id,alias_name,alias_type,source_type,created_by)
    VALUES(item.id,existing.display_name,'MERGED_RECORD','DECLARATION',current_user_id)
    ON CONFLICT DO NOTHING;

    UPDATE public.persons
    SET linked_profile_id=NULL,merged_into_person_id=item.id,merged_at=now(),merged_by=current_user_id,
        identity_status='DUPLICATE_SUSPECTED'
    WHERE id=existing.id;
  END IF;

  UPDATE public.persons SET linked_profile_id=current_user_id WHERE id=item.id;

  -- Synchronize authority from historical references without rewriting them.
  FOR brh IN
    SELECT b.bien_id,b.role
    FROM public.bien_right_holders b
    JOIN public.persons p ON p.id=b.person_id
    WHERE COALESCE(p.merged_into_person_id,p.id)=item.id
      AND b.status<>'revoque'
      AND b.role IN ('titulaire','co_titulaire')
  LOOP
    PERFORM public.ensure_role_assignment_internal(
      current_user_id,'TITULAIRE','ASSET',brh.bien_id,current_user_id
    );
  END LOOP;

  FOR dp IN
    SELECT d.dossier_id,d.role,d.status,d.invited_by
    FROM public.dossier_participants d
    JOIN public.persons p ON p.id=d.person_id
    WHERE COALESCE(p.merged_into_person_id,p.id)=item.id
      AND d.status<>'revoque'
  LOOP
    mapped_role:=CASE dp.role
      WHEN 'declarant' THEN 'CONTRIBUTOR'
      WHEN 'accompagnateur' THEN 'COMPANION'
      WHEN 'temoin' THEN 'WITNESS'
      WHEN 'professionnel' THEN 'PROFESSIONAL'
      WHEN 'service' THEN 'ADMINISTRATIVE_ACTOR'
      WHEN 'autorite' THEN 'ADMINISTRATIVE_ACTOR'
      ELSE 'PARTICIPANT'
    END;

    IF dp.status='actif' THEN
      PERFORM public.ensure_role_assignment_internal(
        current_user_id,mapped_role,'CASE',dp.dossier_id,dp.invited_by
      );
    ELSE
      INSERT INTO public.role_assignments(user_id,role,scope_type,scope_id,status,assigned_by)
      VALUES(current_user_id,mapped_role,'CASE',dp.dossier_id,'SUSPENDED',dp.invited_by)
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;

  PERFORM public.phase_b_record_change(
    'person.person.updated','Person',item.id,'ClaimPerson',p_correlation_id,
    jsonb_build_object('person_id',item.id,'linked_account',true)
  );
  RETURN item.id;
END $$;

CREATE OR REPLACE FUNCTION public.merge_person_records(
  p_source_person_id uuid,p_target_person_id uuid,p_correlation_id uuid
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

  IF source.linked_profile_id IS NOT NULL AND target.linked_profile_id IS NULL THEN
    UPDATE public.persons SET linked_profile_id=source.linked_profile_id WHERE id=target.id;
    UPDATE public.persons SET linked_profile_id=NULL WHERE id=source.id;
  END IF;

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
  caller_is_admin boolean:=public.has_role(auth.uid(),'admin');
BEGIN
  IF current_user_id IS NULL OR represented_id IS NULL OR p_representative_user_id IS NULL
     OR cardinality(p_permissions)=0 OR p_representative_user_id=current_user_id THEN
    RAISE EXCEPTION 'mandate_invalid' USING ERRCODE='22023';
  END IF;
  IF p_scope_type='GLOBAL' THEN
    IF p_scope_id IS NOT NULL THEN RAISE EXCEPTION 'mandate_invalid_scope' USING ERRCODE='22023'; END IF;
  ELSIF p_scope_id IS NULL THEN
    RAISE EXCEPTION 'mandate_invalid_scope' USING ERRCODE='22023';
  END IF;
  IF p_source_type NOT IN ('DECLARATION','DOCUMENTED','VERIFIED','FORMALIZED') THEN
    RAISE EXCEPTION 'mandate_invalid_source' USING ERRCODE='22023';
  END IF;
  IF p_valid_until IS NOT NULL AND p_valid_until<=now() THEN
    RAISE EXCEPTION 'mandate_invalid_validity' USING ERRCODE='22023';
  END IF;

  SELECT * INTO represented FROM public.persons WHERE id=represented_id;
  IF represented.id IS NULL THEN RAISE EXCEPTION 'represented_person_not_found' USING ERRCODE='P0002'; END IF;

  IF represented.linked_profile_id=current_user_id THEN
    -- A person may delegate only authority they currently possess.
    FOREACH perm IN ARRAY p_permissions LOOP
      IF perm !~ '^[A-Z][A-Z0-9_]{1,79}$' THEN RAISE EXCEPTION 'mandate_invalid_permission' USING ERRCODE='22023'; END IF;
      IF NOT caller_is_admin AND (
        public.has_explicit_permission_deny_for(current_user_id,perm,p_scope_type,p_scope_id)
        OR NOT public.has_direct_permission_allow_for(current_user_id,perm,p_scope_type,p_scope_id)
      ) THEN
        RAISE EXCEPTION 'mandate_permission_not_delegable' USING ERRCODE='42501';
      END IF;
    END LOOP;
  ELSE
    IF NOT public.person_directly_manageable(represented.id,current_user_id)
       OR NOT public.can_manage_authorization_scope(p_scope_type,p_scope_id,current_user_id) THEN
      RAISE EXCEPTION 'mandate_creation_forbidden' USING ERRCODE='42501';
    END IF;
    FOREACH perm IN ARRAY p_permissions LOOP
      IF perm !~ '^[A-Z][A-Z0-9_]{1,79}$' THEN RAISE EXCEPTION 'mandate_invalid_permission' USING ERRCODE='22023'; END IF;
      IF NOT caller_is_admin AND (
        public.has_explicit_permission_deny_for(current_user_id,perm,p_scope_type,p_scope_id)
        OR NOT public.has_direct_permission_allow_for(current_user_id,perm,p_scope_type,p_scope_id)
      ) THEN
        RAISE EXCEPTION 'mandate_permission_not_delegable' USING ERRCODE='42501';
      END IF;
    END LOOP;
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
DECLARE current_user_id uuid:=auth.uid(); item public.representation_mandates; perm text;
BEGIN
  SELECT * INTO item FROM public.representation_mandates WHERE id=p_mandate_id FOR UPDATE;
  IF item.id IS NULL OR item.status='REVOKED'
     OR NOT EXISTS(
       SELECT 1
       FROM public.persons source
       JOIN public.persons canonical ON canonical.id=COALESCE(source.merged_into_person_id,source.id)
       WHERE source.id=item.represented_person_id
         AND canonical.linked_profile_id=current_user_id
     ) THEN
    RAISE EXCEPTION 'mandate_confirmation_forbidden' USING ERRCODE='42501';
  END IF;
  IF item.valid_until IS NOT NULL AND item.valid_until<=now() THEN
    RAISE EXCEPTION 'mandate_expired' USING ERRCODE='22023';
  END IF;

  FOREACH perm IN ARRAY item.permissions LOOP
    IF public.has_explicit_permission_deny_for(current_user_id,perm,item.scope_type,item.scope_id)
       OR NOT public.has_direct_permission_allow_for(current_user_id,perm,item.scope_type,item.scope_id) THEN
      RAISE EXCEPTION 'mandate_permission_not_delegable' USING ERRCODE='42501';
    END IF;
  END LOOP;

  UPDATE public.representation_mandates
  SET status='ACTIVE',confirmed_by_represented_at=now()
  WHERE id=item.id;

  PERFORM public.ensure_role_assignment_internal(
    item.representative_user_id,'REPRESENTATIVE',item.scope_type,item.scope_id,current_user_id
  );

  PERFORM public.phase_b_record_change(
    'person.representation-mandate.confirmed','RepresentationMandate',item.id,'ConfirmRepresentationMandate',p_correlation_id,
    jsonb_build_object('mandate_id',item.id,'status','ACTIVE'),
    'HIGHLY_SENSITIVE','REPRESENTATIVE',public.resolve_person_id(item.represented_person_id),item.id
  );
END $$;

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
       OR public.resolve_person_id(mandate.represented_person_id)<>represented_id
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

REVOKE ALL ON FUNCTION public.has_explicit_permission_deny_for(uuid,text,text,uuid),
  public.has_direct_permission_allow_for(uuid,text,text,uuid)
FROM PUBLIC,anon,authenticated;
