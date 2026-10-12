-- Phase B convergence hardening:
-- keep Person merge redirects canonical and prevent multi-hop alias chains.
-- Historical Person rows remain immutable references; only redirect pointers are flattened.

CREATE OR REPLACE FUNCTION public.resolve_person_id(p_person_id uuid)
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public SET row_security=off AS $$
  WITH RECURSIVE person_chain AS (
    SELECT p.id,p.merged_into_person_id,ARRAY[p.id]::uuid[] AS visited,1 AS depth
    FROM public.persons p
    WHERE p.id=p_person_id

    UNION ALL

    SELECT next_person.id,next_person.merged_into_person_id,
           chain.visited || next_person.id,
           chain.depth+1
    FROM person_chain chain
    JOIN public.persons next_person ON next_person.id=chain.merged_into_person_id
    WHERE chain.merged_into_person_id IS NOT NULL
      AND NOT next_person.id=ANY(chain.visited)
      AND chain.depth<64
  )
  SELECT id
  FROM person_chain
  WHERE merged_into_person_id IS NULL
  ORDER BY depth DESC
  LIMIT 1
$$;

-- Normalize any historical multi-hop redirects already present before enforcing
-- the single-hop invariant for future merges.
WITH canonical_redirects AS (
  SELECT p.id,public.resolve_person_id(p.id) AS canonical_id
  FROM public.persons p
  WHERE p.merged_into_person_id IS NOT NULL
)
UPDATE public.persons p
SET merged_into_person_id=redirect.canonical_id
FROM canonical_redirects redirect
WHERE p.id=redirect.id
  AND redirect.canonical_id IS NOT NULL
  AND p.merged_into_person_id IS DISTINCT FROM redirect.canonical_id;

CREATE OR REPLACE FUNCTION public.current_user_person_id()
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public SET row_security=off AS $$
  SELECT public.resolve_person_id(p.id)
  FROM public.persons p
  WHERE p.linked_profile_id=auth.uid()
  ORDER BY (p.merged_into_person_id IS NULL) DESC
  LIMIT 1
$$;

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

  IF source.id IS NULL
     OR source.merged_into_person_id IS NOT NULL
     OR canonical_target IS NULL
     OR canonical_target=source.id THEN
    RAISE EXCEPTION 'person_merge_invalid_state' USING ERRCODE='22023';
  END IF;

  SELECT * INTO target FROM public.persons WHERE id=canonical_target FOR UPDATE;
  IF target.id IS NULL OR target.merged_into_person_id IS NOT NULL THEN
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

  -- If this canonical source already had historical aliases pointing to it,
  -- repoint them directly to the new canonical target. This preserves history
  -- while keeping every redirect single-hop.
  UPDATE public.persons
  SET merged_into_person_id=target.id
  WHERE merged_into_person_id=source.id;

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

-- Apply the same single-hop redirect invariant to account claims as to merges.
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

    -- Keep historical aliases attached directly to the claimed canonical Person.
    UPDATE public.persons
    SET merged_into_person_id=item.id
    WHERE merged_into_person_id=existing.id;

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
