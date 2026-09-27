-- B8 — interventions and chain of responsibility
CREATE TABLE public.dossier_interventions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id uuid NOT NULL REFERENCES public.dossiers(id) ON DELETE RESTRICT,
  step_id uuid REFERENCES public.dossier_steps(id) ON DELETE RESTRICT,
  actor_id uuid REFERENCES public.actors(id) ON DELETE RESTRICT,
  participant_id uuid REFERENCES public.dossier_participants(id) ON DELETE RESTRICT,
  performed_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  on_behalf_of uuid REFERENCES public.persons(id) ON DELETE RESTRICT,
  role text NOT NULL CHECK (role IN ('titulaire','ayant_droit','declarant','accompagnateur','temoin','professionnel','service','autorite')),
  action_type text NOT NULL CHECK (action_type IN ('declare','accompagne','constate','temoigne','signe','verifie','valide','enregistre','transmis','recu','corrige')),
  territorial_level text NOT NULL CHECK (territorial_level IN ('local','rural','arrondissement','departement','region','national','autre')),
  verification_status text NOT NULL DEFAULT 'declare' CHECK (verification_status IN ('declare','a_verifier','verifie','conteste','invalide')),
  comment text CHECK (comment IS NULL OR char_length(comment) <= 2000),
  performed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  supersedes_intervention_id uuid REFERENCES public.dossier_interventions(id) ON DELETE RESTRICT,
  verified_by uuid REFERENCES auth.users(id) ON DELETE RESTRICT,
  verified_at timestamptz,
  CHECK ((verification_status='verifie')=(verified_by IS NOT NULL AND verified_at IS NOT NULL)),
  CHECK (actor_id IS NOT NULL OR participant_id IS NOT NULL),
  CHECK (supersedes_intervention_id IS NULL OR supersedes_intervention_id<>id)
);
CREATE INDEX dossier_interventions_dossier_idx ON public.dossier_interventions(dossier_id);
CREATE INDEX dossier_interventions_step_idx ON public.dossier_interventions(step_id);
CREATE INDEX dossier_interventions_actor_idx ON public.dossier_interventions(actor_id);
CREATE INDEX dossier_interventions_performed_by_idx ON public.dossier_interventions(performed_by);
CREATE INDEX dossier_interventions_action_idx ON public.dossier_interventions(action_type);
CREATE INDEX dossier_interventions_verification_idx ON public.dossier_interventions(verification_status);
CREATE INDEX dossier_interventions_performed_at_idx ON public.dossier_interventions(performed_at DESC);

CREATE OR REPLACE FUNCTION public.can_create_intervention(
  p_dossier_id uuid,p_step_id uuid,p_actor_id uuid,p_participant_id uuid,p_role text,p_action text
) RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public SET row_security=off AS $$
DECLARE u uuid:=auth.uid(); protected boolean:=p_action IN ('verifie','valide','enregistre'); required_code text;
BEGIN
  IF u IS NULL OR NOT EXISTS(SELECT 1 FROM public.dossiers WHERE id=p_dossier_id) THEN RETURN false; END IF;
  IF p_step_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.dossier_steps WHERE id=p_step_id AND dossier_id=p_dossier_id) THEN RETURN false; END IF;
  IF p_actor_id IS NOT NULL THEN
    IF NOT EXISTS(SELECT 1 FROM public.actors WHERE id=p_actor_id AND profile_id=u) THEN RETURN false; END IF;
    IF NOT public.owns_dossier(p_dossier_id,u) AND NOT public.has_scope(p_dossier_id,u,'intervenir') THEN RETURN false; END IF;
    IF protected AND NOT EXISTS(SELECT 1 FROM public.actors WHERE id=p_actor_id AND verification_status='verifie') THEN RETURN false; END IF;
    SELECT ps.required_competence INTO required_code FROM public.dossier_steps ds LEFT JOIN public.procedure_steps ps ON ps.id=ds.procedure_step_id WHERE ds.id=p_step_id;
    IF protected AND required_code IS NOT NULL AND NOT EXISTS(
      SELECT 1 FROM public.actor_competences c WHERE c.actor_id=p_actor_id AND c.competence_code=required_code
      AND c.status='verifie' AND (c.expires_at IS NULL OR c.expires_at>now())
    ) THEN RETURN false; END IF;
    IF protected AND p_action IN ('valide','enregistre') AND NOT EXISTS(
      SELECT 1 FROM public.actor_credentials c WHERE c.actor_id=p_actor_id AND c.status='verifie'
      AND (c.expires_at IS NULL OR c.expires_at>now())
    ) THEN RETURN false; END IF;
  ELSE
    IF NOT EXISTS(
      SELECT 1 FROM public.dossier_participants dp JOIN public.persons p ON p.id=dp.person_id
      WHERE dp.id=p_participant_id AND dp.dossier_id=p_dossier_id AND dp.status='actif'
      AND (p.linked_profile_id=u OR dp.user_id=u) AND dp.role=p_role
    ) AND NOT public.owns_dossier(p_dossier_id,u) THEN RETURN false; END IF;
    IF p_role='accompagnateur' AND p_action NOT IN ('accompagne','declare','transmis','recu','corrige') THEN RETURN false; END IF;
    IF p_role='temoin' AND p_action NOT IN ('temoigne','constate','signe','corrige') THEN RETURN false; END IF;
    IF protected THEN RETURN false; END IF;
  END IF;
  RETURN true;
END $$;

CREATE OR REPLACE FUNCTION public.create_dossier_intervention(
 p_dossier_id uuid,p_step_id uuid,p_actor_id uuid,p_participant_id uuid,p_on_behalf_of uuid,
 p_role text,p_action_type text,p_territorial_level text,p_comment text DEFAULT NULL
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
DECLARE new_id uuid; initial_status text;
BEGIN
 IF NOT public.can_create_intervention(p_dossier_id,p_step_id,p_actor_id,p_participant_id,p_role,p_action_type)
 THEN RAISE EXCEPTION 'intervention_forbidden' USING ERRCODE='42501'; END IF;
 IF p_on_behalf_of IS NOT NULL AND NOT EXISTS(
   SELECT 1 FROM public.dossier_participants WHERE dossier_id=p_dossier_id AND person_id=p_on_behalf_of AND status='actif'
 ) THEN RAISE EXCEPTION 'on_behalf_of_forbidden' USING ERRCODE='42501'; END IF;
 initial_status:=CASE WHEN p_action_type IN ('verifie','valide','enregistre') THEN 'a_verifier' ELSE 'declare' END;
 INSERT INTO public.dossier_interventions(dossier_id,step_id,actor_id,participant_id,performed_by,on_behalf_of,role,action_type,territorial_level,verification_status,comment)
 VALUES(p_dossier_id,p_step_id,p_actor_id,p_participant_id,auth.uid(),p_on_behalf_of,p_role,p_action_type,p_territorial_level,initial_status,nullif(btrim(p_comment),''))
 RETURNING id INTO new_id;
 RETURN new_id;
END $$;

CREATE OR REPLACE FUNCTION public.correct_dossier_intervention(
 p_previous_id uuid,p_action_type text,p_comment text
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
DECLARE old public.dossier_interventions; new_id uuid;
BEGIN
 SELECT * INTO old FROM public.dossier_interventions WHERE id=p_previous_id;
 IF NOT FOUND OR old.performed_by<>auth.uid() THEN RAISE EXCEPTION 'intervention_correction_forbidden' USING ERRCODE='42501'; END IF;
 IF NOT public.can_create_intervention(old.dossier_id,old.step_id,old.actor_id,old.participant_id,old.role,p_action_type)
 THEN RAISE EXCEPTION 'intervention_correction_forbidden' USING ERRCODE='42501'; END IF;
 INSERT INTO public.dossier_interventions(dossier_id,step_id,actor_id,participant_id,performed_by,on_behalf_of,role,action_type,territorial_level,verification_status,comment,supersedes_intervention_id)
 VALUES(old.dossier_id,old.step_id,old.actor_id,old.participant_id,auth.uid(),old.on_behalf_of,old.role,p_action_type,old.territorial_level,'declare',nullif(btrim(p_comment),''),old.id)
 RETURNING id INTO new_id;
 RETURN new_id;
END $$;

CREATE OR REPLACE FUNCTION public.verify_dossier_intervention(p_intervention_id uuid,p_status text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
DECLARE item public.dossier_interventions;
BEGIN
 IF p_status NOT IN ('verifie','conteste','invalide') OR NOT public.can_verify_actor(auth.uid())
 THEN RAISE EXCEPTION 'intervention_verification_forbidden' USING ERRCODE='42501'; END IF;
 SELECT * INTO item FROM public.dossier_interventions WHERE id=p_intervention_id FOR UPDATE;
 IF NOT FOUND OR item.performed_by=auth.uid() THEN RAISE EXCEPTION 'self_verification_forbidden' USING ERRCODE='42501'; END IF;
 UPDATE public.dossier_interventions SET verification_status=p_status,
 verified_by=CASE WHEN p_status='verifie' THEN auth.uid() ELSE NULL END,
 verified_at=CASE WHEN p_status='verifie' THEN now() ELSE NULL END WHERE id=p_intervention_id;
END $$;

CREATE OR REPLACE FUNCTION public.can_complete_dossier_step(p_step_id uuid)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public SET row_security=off AS $$
DECLARE s public.dossier_steps; rules jsonb; expected text;
BEGIN
 SELECT * INTO s FROM public.dossier_steps WHERE id=p_step_id;
 IF NOT FOUND THEN RETURN false; END IF;
 SELECT ps.rules_json INTO rules FROM public.procedure_steps ps WHERE ps.id=s.procedure_step_id;
 expected:=rules->>'required_intervention_action';
 IF expected IS NULL THEN RETURN EXISTS(
   SELECT 1 FROM public.dossier_interventions i WHERE i.step_id=s.id AND i.verification_status='verifie'
 );
 END IF;
 RETURN EXISTS(SELECT 1 FROM public.dossier_interventions i
   WHERE i.step_id=s.id AND i.action_type=expected AND i.verification_status='verifie');
END $$;

CREATE OR REPLACE FUNCTION public.complete_dossier_step_from_interventions(p_step_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
DECLARE did uuid;
BEGIN
 SELECT dossier_id INTO did FROM public.dossier_steps WHERE id=p_step_id FOR UPDATE;
 IF did IS NULL OR NOT public.owns_dossier(did,auth.uid()) OR NOT public.can_complete_dossier_step(p_step_id)
 THEN RAISE EXCEPTION 'step_completion_conditions_not_met' USING ERRCODE='42501'; END IF;
 UPDATE public.dossier_steps SET status='terminee',completed_at=now(),updated_at=now()
 WHERE id=p_step_id AND status IN ('en_cours','a_verifier');
 IF NOT FOUND THEN RAISE EXCEPTION 'invalid_step_transition' USING ERRCODE='22023'; END IF;
END $$;

ALTER TABLE public.dossier_interventions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authorized users view interventions" ON public.dossier_interventions FOR SELECT USING(
 public.can_view_dossier(dossier_id,auth.uid()) OR public.has_active_grant(dossier_id,auth.uid())
);
REVOKE ALL ON public.dossier_interventions FROM anon,authenticated;
GRANT SELECT ON public.dossier_interventions TO authenticated;
REVOKE ALL ON FUNCTION public.can_create_intervention(uuid,uuid,uuid,uuid,text,text),
 public.create_dossier_intervention(uuid,uuid,uuid,uuid,uuid,text,text,text,text),
 public.correct_dossier_intervention(uuid,text,text),
 public.verify_dossier_intervention(uuid,text),
 public.can_complete_dossier_step(uuid),
 public.complete_dossier_step_from_interventions(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_create_intervention(uuid,uuid,uuid,uuid,text,text),
 public.create_dossier_intervention(uuid,uuid,uuid,uuid,uuid,text,text,text,text),
 public.correct_dossier_intervention(uuid,text,text),
 public.verify_dossier_intervention(uuid,text),
 public.can_complete_dossier_step(uuid),
 public.complete_dossier_step_from_interventions(uuid) TO authenticated;
