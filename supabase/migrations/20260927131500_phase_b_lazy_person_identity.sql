-- Phase B identity correction: Person is not automatically created for every account.
-- Accounts get a Person lazily when a patrimonial/person use case requires it.

DROP TRIGGER IF EXISTS sync_profile_person_on_insert ON public.profiles;
DROP FUNCTION IF EXISTS public.sync_profile_person_on_insert();

CREATE OR REPLACE FUNCTION public.ensure_current_user_person(
  p_correlation_id uuid
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
DECLARE current_user_id uuid:=auth.uid(); existing_id uuid; new_id uuid;
BEGIN
  IF current_user_id IS NULL THEN RAISE EXCEPTION 'authentication_required' USING ERRCODE='42501'; END IF;

  SELECT id INTO existing_id
  FROM public.persons
  WHERE linked_profile_id=current_user_id AND merged_into_person_id IS NULL
  LIMIT 1;
  IF existing_id IS NOT NULL THEN RETURN existing_id; END IF;

  INSERT INTO public.persons(linked_profile_id,display_name,phone,created_by,identity_status)
  SELECT p.id,COALESCE(NULLIF(btrim(p.full_name),''),'Utilisateur'),p.phone,current_user_id,'DECLARED'
  FROM public.profiles p
  WHERE p.id=current_user_id
  RETURNING id INTO new_id;

  IF new_id IS NULL THEN RAISE EXCEPTION 'profile_required' USING ERRCODE='P0002'; END IF;

  PERFORM public.phase_b_record_change(
    'person.person.created','Person',new_id,'EnsureCurrentUserPerson',p_correlation_id,
    jsonb_build_object('person_id',new_id,'linked_account',true)
  );
  RETURN new_id;
END $$;

REVOKE ALL ON FUNCTION public.ensure_current_user_person(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.ensure_current_user_person(uuid) TO authenticated,service_role;
