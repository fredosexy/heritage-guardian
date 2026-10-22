-- Additive hardening for already-deployed B4 journey functions.
-- Do not rewrite the historical 20261005000100 migration: existing databases
-- have already applied it. This migration carries the identity checks forward.

CREATE OR REPLACE FUNCTION public.initialize_dossier_journey(
  p_dossier_id uuid,
  p_procedure_id uuid DEFAULT NULL
)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public SET row_security = off AS $$
DECLARE
  current_user_id uuid := auth.uid();
  chosen_id uuid;
  dossier_row public.dossiers;
BEGIN
  SELECT * INTO dossier_row FROM public.dossiers WHERE id = p_dossier_id FOR UPDATE;
  IF NOT FOUND OR current_user_id IS NULL OR dossier_row.user_id IS DISTINCT FROM current_user_id THEN
    RAISE EXCEPTION 'journey_initialization_forbidden' USING ERRCODE = '42501';
  END IF;

  IF dossier_row.procedure_definition_id IS NOT NULL THEN
    RETURN dossier_row.procedure_definition_id;
  END IF;

  SELECT pd.id INTO chosen_id
  FROM public.procedure_definitions pd
  WHERE pd.id = COALESCE(p_procedure_id, pd.id)
    AND pd.dossier_type = dossier_row.type
    AND pd.status = 'publiee'
    AND (pd.territory = '*' OR lower(pd.territory) = lower(COALESCE(dossier_row.location_name, '')))
    AND (pd.valid_from IS NULL OR pd.valid_from <= current_date)
    AND (pd.valid_until IS NULL OR pd.valid_until >= current_date)
  ORDER BY CASE
    WHEN lower(pd.territory) = lower(COALESCE(dossier_row.location_name, '')) THEN 0
    WHEN pd.territory = '*' THEN 1
    ELSE 2
  END, pd.version DESC
  LIMIT 1;

  IF chosen_id IS NULL THEN
    RAISE EXCEPTION 'published_procedure_not_found' USING ERRCODE = 'P0002';
  END IF;

  UPDATE public.dossiers SET procedure_definition_id = chosen_id WHERE id = p_dossier_id;

  INSERT INTO public.dossier_steps (
    dossier_id, procedure_step_id, step_order, title, short_description,
    territorial_level, status, started_at
  )
  SELECT
    p_dossier_id, ps.id, ps.step_order, ps.title, ps.short_description,
    ps.territorial_level,
    CASE WHEN ps.step_order = (
      SELECT min(ps2.step_order) FROM public.procedure_steps ps2 WHERE ps2.procedure_id = chosen_id
    ) THEN 'en_cours' ELSE 'a_faire' END,
    CASE WHEN ps.step_order = (
      SELECT min(ps2.step_order) FROM public.procedure_steps ps2 WHERE ps2.procedure_id = chosen_id
    ) THEN now() ELSE NULL END
  FROM public.procedure_steps ps
  WHERE ps.procedure_id = chosen_id
  ORDER BY ps.step_order;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'procedure_has_no_steps' USING ERRCODE = '22023';
  END IF;

  RETURN chosen_id;
END;
$$;

REVOKE ALL ON FUNCTION public.initialize_dossier_journey(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.initialize_dossier_journey(uuid, uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.transition_dossier_step(
  p_step_id uuid,
  p_target_status text,
  p_blocked_reason text DEFAULT NULL
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public SET row_security = off AS $$
DECLARE
  current_user_id uuid := auth.uid();
  current_status text;
  dossier_ref uuid;
BEGIN
  SELECT status, dossier_id INTO current_status, dossier_ref
  FROM public.dossier_steps WHERE id = p_step_id FOR UPDATE;

  IF NOT FOUND OR current_user_id IS NULL OR NOT public.owns_dossier(dossier_ref, current_user_id) THEN
    RAISE EXCEPTION 'step_transition_forbidden' USING ERRCODE = '42501';
  END IF;

  IF NOT (
    (current_status = 'a_faire' AND p_target_status = 'en_cours') OR
    (current_status = 'en_cours' AND p_target_status IN ('terminee','bloquee')) OR
    (current_status = 'bloquee' AND p_target_status = 'en_cours') OR
    (current_status = 'terminee' AND p_target_status = 'a_verifier') OR
    (current_status = 'a_verifier' AND p_target_status = 'terminee')
  ) THEN
    RAISE EXCEPTION 'invalid_step_transition' USING ERRCODE = '22023';
  END IF;

  IF p_target_status = 'bloquee' AND (p_blocked_reason IS NULL OR char_length(btrim(p_blocked_reason)) < 2) THEN
    RAISE EXCEPTION 'blocked_reason_required' USING ERRCODE = '22023';
  END IF;

  UPDATE public.dossier_steps
  SET status = p_target_status,
      started_at = CASE WHEN p_target_status = 'en_cours' THEN COALESCE(started_at, now()) ELSE started_at END,
      completed_at = CASE WHEN p_target_status = 'terminee' THEN now() ELSE NULL END,
      blocked_reason = CASE WHEN p_target_status = 'bloquee' THEN btrim(p_blocked_reason) ELSE NULL END
  WHERE id = p_step_id;

  IF p_target_status = 'terminee' THEN
    UPDATE public.dossier_steps
    SET status = 'en_cours', started_at = now()
    WHERE id = (
      SELECT id FROM public.dossier_steps
      WHERE dossier_id = dossier_ref AND status = 'a_faire'
      ORDER BY step_order LIMIT 1
    );
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.transition_dossier_step(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.transition_dossier_step(uuid, text, text) TO authenticated;
