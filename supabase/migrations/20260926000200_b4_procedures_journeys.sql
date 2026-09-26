-- B4 — versioned procedure definitions and persistent dossier journeys

CREATE TABLE public.procedure_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL CHECK (code ~ '^[a-z0-9_]{3,80}$'),
  dossier_type public.dossier_type NOT NULL,
  territory text NOT NULL CHECK (territory = '*' OR char_length(btrim(territory)) BETWEEN 2 AND 120),
  version integer NOT NULL CHECK (version > 0),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','a_verifier','validee','publiee','archivee')),
  source_reference text CHECK (source_reference IS NULL OR char_length(source_reference) <= 1000),
  valid_from date,
  valid_until date,
  verified_by uuid REFERENCES auth.users(id),
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (code, version),
  CHECK (valid_until IS NULL OR valid_from IS NULL OR valid_until >= valid_from),
  CHECK ((status IN ('validee','publiee','archivee')) = (verified_at IS NOT NULL AND verified_by IS NOT NULL))
);

CREATE TABLE public.procedure_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  procedure_id uuid NOT NULL REFERENCES public.procedure_definitions(id) ON DELETE RESTRICT,
  step_order integer NOT NULL CHECK (step_order > 0),
  code text NOT NULL CHECK (code ~ '^[a-z0-9_]{2,80}$'),
  title text NOT NULL CHECK (char_length(btrim(title)) BETWEEN 2 AND 200),
  short_description text NOT NULL CHECK (char_length(btrim(short_description)) BETWEEN 2 AND 1000),
  territorial_level text NOT NULL CHECK (territorial_level IN ('local','rural','arrondissement','departement','region','national','autre')),
  required_competence text CHECK (required_competence IS NULL OR char_length(required_competence) <= 120),
  is_optional boolean NOT NULL DEFAULT false,
  rules_json jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (procedure_id, step_order),
  UNIQUE (procedure_id, code),
  CHECK (rules_json IS NULL OR jsonb_typeof(rules_json) = 'object')
);

ALTER TABLE public.dossiers
  ADD COLUMN procedure_definition_id uuid REFERENCES public.procedure_definitions(id) ON DELETE RESTRICT;

CREATE TABLE public.dossier_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id uuid NOT NULL REFERENCES public.dossiers(id) ON DELETE CASCADE,
  procedure_step_id uuid REFERENCES public.procedure_steps(id) ON DELETE SET NULL,
  step_order integer NOT NULL CHECK (step_order > 0),
  title text NOT NULL CHECK (char_length(btrim(title)) BETWEEN 2 AND 200),
  short_description text NOT NULL CHECK (char_length(btrim(short_description)) BETWEEN 2 AND 1000),
  territorial_level text NOT NULL CHECK (territorial_level IN ('local','rural','arrondissement','departement','region','national','autre')),
  status text NOT NULL DEFAULT 'a_faire' CHECK (status IN ('a_faire','en_cours','terminee','bloquee','a_verifier')),
  started_at timestamptz,
  completed_at timestamptz,
  blocked_reason text CHECK (blocked_reason IS NULL OR char_length(blocked_reason) <= 1000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (dossier_id, step_order),
  UNIQUE NULLS NOT DISTINCT (dossier_id, procedure_step_id),
  CHECK ((status = 'terminee') = (completed_at IS NOT NULL)),
  CHECK ((status = 'bloquee') = (blocked_reason IS NOT NULL))
);

CREATE INDEX procedure_definitions_type_idx ON public.procedure_definitions(dossier_type);
CREATE INDEX procedure_definitions_status_idx ON public.procedure_definitions(status);
CREATE INDEX procedure_definitions_territory_idx ON public.procedure_definitions(territory);
CREATE INDEX procedure_steps_procedure_idx ON public.procedure_steps(procedure_id);
CREATE INDEX procedure_steps_order_idx ON public.procedure_steps(procedure_id, step_order);
CREATE INDEX dossier_steps_dossier_idx ON public.dossier_steps(dossier_id);
CREATE INDEX dossier_steps_status_idx ON public.dossier_steps(status);
CREATE INDEX dossier_steps_order_idx ON public.dossier_steps(dossier_id, step_order);

CREATE TRIGGER update_procedure_definitions_updated_at BEFORE UPDATE ON public.procedure_definitions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_procedure_steps_updated_at BEFORE UPDATE ON public.procedure_steps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_dossier_steps_updated_at BEFORE UPDATE ON public.dossier_steps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.procedure_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procedure_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dossier_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "published procedures are readable"
  ON public.procedure_definitions FOR SELECT
  USING (status = 'publiee' OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins create procedures"
  ON public.procedure_definitions FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins update procedures"
  ON public.procedure_definitions FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "published procedure steps are readable"
  ON public.procedure_steps FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.procedure_definitions pd
    WHERE pd.id = procedure_id AND (pd.status = 'publiee' OR public.has_role(auth.uid(), 'admin'))
  ));
CREATE POLICY "admins create procedure steps"
  ON public.procedure_steps FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins update procedure steps"
  ON public.procedure_steps FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "authorized users view dossier steps"
  ON public.dossier_steps FOR SELECT
  USING (public.can_view_dossier(dossier_id, auth.uid()));

REVOKE ALL ON public.procedure_definitions, public.procedure_steps, public.dossier_steps FROM anon, authenticated;
GRANT SELECT ON public.procedure_definitions, public.procedure_steps TO anon, authenticated;
GRANT SELECT ON public.dossier_steps TO authenticated;
GRANT INSERT, UPDATE ON public.procedure_definitions, public.procedure_steps TO authenticated;

CREATE OR REPLACE FUNCTION public.procedure_step_applies(_rules jsonb, _bien public.biens)
RETURNS boolean LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT _rules IS NULL OR (
    (NOT (_rules ? 'bien_type') OR
      (_rules->'bien_type' = to_jsonb((_bien).type) OR (_rules->'bien_type') ? (_bien).type))
    AND (NOT (_rules ? 'creation_context') OR
      (_rules->'creation_context' = to_jsonb((_bien).creation_context) OR (_rules->'creation_context') ? (_bien).creation_context))
  )
$$;

CREATE OR REPLACE FUNCTION public.initialize_dossier_journey(
  p_dossier_id uuid,
  p_procedure_id uuid DEFAULT NULL
)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public SET row_security = off AS $$
DECLARE current_user_id uuid := auth.uid(); chosen_id uuid; dossier_row public.dossiers; bien_row public.biens;
BEGIN
  SELECT * INTO dossier_row FROM public.dossiers WHERE id = p_dossier_id FOR UPDATE;
  IF NOT FOUND OR dossier_row.owner_id <> current_user_id THEN
    RAISE EXCEPTION 'journey_initialization_forbidden' USING ERRCODE = '42501';
  END IF;
  IF dossier_row.procedure_definition_id IS NOT NULL THEN RETURN dossier_row.procedure_definition_id; END IF;
  SELECT * INTO bien_row FROM public.biens WHERE id = dossier_row.bien_id;
  SELECT pd.id INTO chosen_id FROM public.procedure_definitions pd
  WHERE pd.id = COALESCE(p_procedure_id, pd.id)
    AND pd.dossier_type = dossier_row.type
    AND pd.status = 'publiee'
    AND (pd.territory = '*' OR lower(pd.territory) = lower(bien_row.location_label))
    AND (pd.valid_from IS NULL OR pd.valid_from <= current_date)
    AND (pd.valid_until IS NULL OR pd.valid_until >= current_date)
  ORDER BY CASE WHEN lower(pd.territory) = lower(bien_row.location_label) THEN 0 WHEN pd.territory = '*' THEN 1 ELSE 2 END,
    pd.version DESC
  LIMIT 1;
  IF chosen_id IS NULL THEN RAISE EXCEPTION 'published_procedure_not_found' USING ERRCODE = 'P0002'; END IF;
  UPDATE public.dossiers SET procedure_definition_id = chosen_id WHERE id = p_dossier_id;
  INSERT INTO public.dossier_steps (dossier_id, procedure_step_id, step_order, title, short_description, territorial_level, status, started_at)
  SELECT p_dossier_id, ps.id, row_number() over (ORDER BY ps.step_order), ps.title, ps.short_description, ps.territorial_level,
    CASE WHEN row_number() over (ORDER BY ps.step_order) = 1 THEN 'en_cours' ELSE 'a_faire' END,
    CASE WHEN row_number() over (ORDER BY ps.step_order) = 1 THEN now() ELSE NULL END
  FROM public.procedure_steps ps
  WHERE ps.procedure_id = chosen_id AND public.procedure_step_applies(ps.rules_json, bien_row)
  ORDER BY ps.step_order;
  IF NOT FOUND THEN RAISE EXCEPTION 'procedure_has_no_applicable_steps' USING ERRCODE = '22023'; END IF;
  RETURN chosen_id;
END;
$$;
REVOKE ALL ON FUNCTION public.initialize_dossier_journey(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.initialize_dossier_journey(uuid, uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.transition_dossier_step(p_step_id uuid, p_target_status text, p_blocked_reason text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public SET row_security = off AS $$
DECLARE current_user_id uuid := auth.uid(); current_status text; dossier_ref uuid;
BEGIN
  SELECT status, dossier_id INTO current_status, dossier_ref FROM public.dossier_steps WHERE id = p_step_id FOR UPDATE;
  IF NOT FOUND OR NOT public.owns_dossier(dossier_ref, current_user_id) THEN
    RAISE EXCEPTION 'step_transition_forbidden' USING ERRCODE = '42501';
  END IF;
  IF NOT ((current_status='a_faire' AND p_target_status='en_cours') OR
          (current_status='en_cours' AND p_target_status IN ('terminee','bloquee')) OR
          (current_status='bloquee' AND p_target_status='en_cours') OR
          (current_status='terminee' AND p_target_status='a_verifier') OR
          (current_status='a_verifier' AND p_target_status='terminee')) THEN
    RAISE EXCEPTION 'invalid_step_transition' USING ERRCODE = '22023';
  END IF;
  IF p_target_status='bloquee' AND (p_blocked_reason IS NULL OR char_length(btrim(p_blocked_reason)) < 2) THEN
    RAISE EXCEPTION 'blocked_reason_required' USING ERRCODE = '22023';
  END IF;
  UPDATE public.dossier_steps SET status=p_target_status,
    started_at=CASE WHEN p_target_status='en_cours' THEN COALESCE(started_at,now()) ELSE started_at END,
    completed_at=CASE WHEN p_target_status='terminee' THEN now() ELSE NULL END,
    blocked_reason=CASE WHEN p_target_status='bloquee' THEN btrim(p_blocked_reason) ELSE NULL END
  WHERE id=p_step_id;
  IF p_target_status='terminee' THEN
    UPDATE public.dossier_steps SET status='en_cours', started_at=now()
    WHERE id=(SELECT id FROM public.dossier_steps WHERE dossier_id=dossier_ref AND status='a_faire' ORDER BY step_order LIMIT 1);
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.transition_dossier_step(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.transition_dossier_step(uuid, text, text) TO authenticated;
