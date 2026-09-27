-- B11 — immutable global responsibility audit
CREATE TABLE public.audit_events(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid REFERENCES auth.users(id) ON DELETE RESTRICT,
  actor_actor_id uuid REFERENCES public.actors(id) ON DELETE RESTRICT,
  on_behalf_of_user_id uuid REFERENCES auth.users(id) ON DELETE RESTRICT,
  dossier_id uuid REFERENCES public.dossiers(id) ON DELETE RESTRICT,
  entity_type text NOT NULL CHECK(entity_type IN(
    'profile','bien','bien_right_holder','dossier','dossier_participant','dossier_step',
    'actor','actor_competence','actor_credential','document','document_version',
    'access_request','access_grant','intervention','conversation','message','signalement','procedure'
  )),
  entity_id uuid NOT NULL,
  action text NOT NULL CHECK(action IN(
    'created','updated','archived','participant_added','participant_revoked',
    'step_started','step_completed','step_blocked','document_added','version_added','verified',
    'access_requested','access_granted','access_revoked','intervention_recorded',
    'intervention_corrected','actor_verified','actor_suspended','actor_revoked',
    'signalement_created','signalement_status_changed','procedure_published','procedure_archived'
  )),
  source text NOT NULL CHECK(source IN('web','pwa','offline_sync','backend','admin','system')),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  request_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK(actor_user_id IS NOT NULL OR source='system'),
  CHECK(jsonb_typeof(metadata)='object'),
  CHECK(octet_length(metadata::text)<=4096)
);
CREATE INDEX audit_events_dossier_timeline_idx ON public.audit_events(dossier_id,created_at DESC,id DESC);
CREATE INDEX audit_events_entity_timeline_idx ON public.audit_events(entity_type,entity_id,created_at DESC);
CREATE INDEX audit_events_actor_idx ON public.audit_events(actor_user_id,created_at DESC);
CREATE INDEX audit_events_request_idx ON public.audit_events(request_id) WHERE request_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.record_audit_event(
  p_entity_type text,p_entity_id uuid,p_action text,p_dossier_id uuid DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb,p_on_behalf_of_person_id uuid DEFAULT NULL
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
DECLARE
  event_id uuid; uid uuid:=auth.uid(); represented_user uuid; professional_actor uuid;
  event_source text:=coalesce(nullif(current_setting('app.audit_source',true),''),'backend');
  correlation uuid;
BEGIN
  IF event_source NOT IN('web','pwa','offline_sync','backend','admin','system') THEN event_source:='backend'; END IF;
  BEGIN correlation:=nullif(current_setting('app.audit_request_id',true),'')::uuid;
  EXCEPTION WHEN invalid_text_representation THEN correlation:=NULL; END;
  correlation:=coalesce(correlation,gen_random_uuid());
  IF p_on_behalf_of_person_id IS NOT NULL THEN
    SELECT linked_profile_id INTO represented_user FROM public.persons WHERE id=p_on_behalf_of_person_id;
  END IF;
  SELECT id INTO professional_actor FROM public.actors WHERE profile_id=uid ORDER BY created_at LIMIT 1;
  INSERT INTO public.audit_events(actor_user_id,actor_actor_id,on_behalf_of_user_id,dossier_id,
    entity_type,entity_id,action,source,metadata,request_id)
  VALUES(uid,professional_actor,represented_user,p_dossier_id,p_entity_type,p_entity_id,p_action,
    CASE WHEN uid IS NULL THEN 'system' ELSE event_source END,
    coalesce(p_metadata,'{}'::jsonb),correlation)
  RETURNING id INTO event_id;
  RETURN event_id;
END $$;

CREATE OR REPLACE FUNCTION public.audit_events_are_immutable()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'audit_events_are_immutable' USING ERRCODE='42501'; END $$;
CREATE TRIGGER audit_events_immutable BEFORE UPDATE OR DELETE ON public.audit_events
FOR EACH ROW EXECUTE FUNCTION public.audit_events_are_immutable();

CREATE OR REPLACE FUNCTION public.audit_dossier_change() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
BEGIN
  IF TG_OP='INSERT' THEN
    PERFORM public.record_audit_event('dossier',NEW.id,'created',NEW.id,jsonb_build_object('status',NEW.status));
  ELSIF NEW.status='archive' AND OLD.status IS DISTINCT FROM NEW.status THEN
    PERFORM public.record_audit_event('dossier',NEW.id,'archived',NEW.id,jsonb_build_object('previous_status',OLD.status));
  ELSIF OLD IS DISTINCT FROM NEW THEN
    PERFORM public.record_audit_event('dossier',NEW.id,'updated',NEW.id,jsonb_build_object('status',NEW.status));
  END IF; RETURN NEW;
END $$;
CREATE TRIGGER audit_dossiers AFTER INSERT OR UPDATE ON public.dossiers
FOR EACH ROW EXECUTE FUNCTION public.audit_dossier_change();

CREATE OR REPLACE FUNCTION public.audit_participant_change() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
BEGIN
  IF TG_OP='INSERT' THEN
    PERFORM public.record_audit_event('dossier_participant',NEW.id,'participant_added',NEW.dossier_id,jsonb_build_object('role',NEW.role));
  ELSIF NEW.status='revoque' AND OLD.status IS DISTINCT FROM NEW.status THEN
    PERFORM public.record_audit_event('dossier_participant',NEW.id,'participant_revoked',NEW.dossier_id,jsonb_build_object('role',NEW.role));
  END IF; RETURN NEW;
END $$;
CREATE TRIGGER audit_dossier_participants AFTER INSERT OR UPDATE ON public.dossier_participants
FOR EACH ROW EXECUTE FUNCTION public.audit_participant_change();

CREATE OR REPLACE FUNCTION public.audit_step_change() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
DECLARE event_action text;
BEGIN
  IF OLD.status IS NOT DISTINCT FROM NEW.status THEN RETURN NEW; END IF;
  event_action:=CASE NEW.status WHEN 'en_cours' THEN 'step_started' WHEN 'terminee' THEN 'step_completed'
    WHEN 'bloquee' THEN 'step_blocked' ELSE NULL END;
  IF event_action IS NOT NULL THEN
    PERFORM public.record_audit_event('dossier_step',NEW.id,event_action,NEW.dossier_id,
      jsonb_build_object('previous_status',OLD.status,'status',NEW.status));
  END IF; RETURN NEW;
END $$;
CREATE TRIGGER audit_dossier_steps AFTER UPDATE ON public.dossier_steps
FOR EACH ROW EXECUTE FUNCTION public.audit_step_change();

CREATE OR REPLACE FUNCTION public.audit_access_request_insert() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
BEGIN
  PERFORM public.record_audit_event('access_request',NEW.id,'access_requested',NEW.dossier_id,
    jsonb_build_object('purpose',NEW.purpose));
  RETURN NEW;
END $$;
CREATE TRIGGER audit_access_requests AFTER INSERT ON public.access_requests
FOR EACH ROW EXECUTE FUNCTION public.audit_access_request_insert();

CREATE OR REPLACE FUNCTION public.audit_access_grant_change() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
BEGIN
  IF TG_OP='INSERT' THEN
    PERFORM public.record_audit_event('access_grant',NEW.id,'access_granted',NEW.dossier_id,
      jsonb_build_object('purpose',NEW.purpose));
  ELSIF NEW.revoked_at IS NOT NULL AND OLD.revoked_at IS NULL THEN
    PERFORM public.record_audit_event('access_grant',NEW.id,'access_revoked',NEW.dossier_id,'{}'::jsonb);
  END IF; RETURN NEW;
END $$;
CREATE TRIGGER audit_access_grants AFTER INSERT OR UPDATE ON public.access_grants
FOR EACH ROW EXECUTE FUNCTION public.audit_access_grant_change();

CREATE OR REPLACE FUNCTION public.audit_intervention_insert() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
BEGIN
  PERFORM public.record_audit_event('intervention',NEW.id,
    CASE WHEN NEW.supersedes_intervention_id IS NULL THEN 'intervention_recorded' ELSE 'intervention_corrected' END,
    NEW.dossier_id,jsonb_build_object('action_type',NEW.action_type,'role',NEW.role),NEW.on_behalf_of);
  RETURN NEW;
END $$;
CREATE TRIGGER audit_dossier_interventions AFTER INSERT ON public.dossier_interventions
FOR EACH ROW EXECUTE FUNCTION public.audit_intervention_insert();

CREATE OR REPLACE FUNCTION public.audit_signalement_change() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
BEGIN
  IF TG_OP='INSERT' THEN
    PERFORM public.record_audit_event('signalement',NEW.id,'signalement_created',NEW.dossier_id,
      jsonb_build_object('type',NEW.signalement_type,'status',NEW.status),NEW.on_behalf_of);
  ELSIF OLD.status IS DISTINCT FROM NEW.status THEN
    PERFORM public.record_audit_event('signalement',NEW.id,'signalement_status_changed',NEW.dossier_id,
      jsonb_build_object('previous_status',OLD.status,'status',NEW.status),NEW.on_behalf_of);
  END IF; RETURN NEW;
END $$;
CREATE TRIGGER audit_signalements AFTER INSERT OR UPDATE ON public.signalements
FOR EACH ROW EXECUTE FUNCTION public.audit_signalement_change();

ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authorized users view dossier audit" ON public.audit_events FOR SELECT USING(
  actor_user_id=auth.uid()
  OR (dossier_id IS NOT NULL AND (
    public.can_view_dossier(dossier_id,auth.uid())
    OR public.has_active_grant(dossier_id,auth.uid())
    OR public.can_verify_actor(auth.uid())
  ))
);
REVOKE ALL ON public.audit_events FROM anon,authenticated;
GRANT SELECT ON public.audit_events TO authenticated;
REVOKE ALL ON FUNCTION public.record_audit_event(text,uuid,text,uuid,jsonb,uuid) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.audit_events_are_immutable(),public.audit_dossier_change(),
 public.audit_participant_change(),public.audit_step_change(),public.audit_access_request_insert(),
 public.audit_access_grant_change(),public.audit_intervention_insert(),public.audit_signalement_change()
 FROM PUBLIC,anon,authenticated;
