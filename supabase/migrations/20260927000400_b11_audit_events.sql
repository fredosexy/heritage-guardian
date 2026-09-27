-- B11 — connect business actions to the canonical append-only audit foundation.
-- audit_events and record_audit_event are provided by the transverse Phase A foundation.

CREATE OR REPLACE FUNCTION public.b11_audit(
  p_action text,p_target_type text,p_target_id uuid,p_dossier_id uuid,
  p_safe_context jsonb DEFAULT '{}'::jsonb,p_represented_person_id uuid DEFAULT NULL
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
DECLARE
  correlation uuid; actor_person uuid;
BEGIN
  BEGIN correlation:=nullif(current_setting('app.audit_request_id',true),'')::uuid;
  EXCEPTION WHEN invalid_text_representation THEN correlation:=NULL; END;
  correlation:=coalesce(correlation,gen_random_uuid());
  actor_person:=public.current_user_person_id();
  RETURN public.record_audit_event(
    'ACTION',p_action,'DOSSIER','SUCCEEDED',correlation,p_target_type,p_target_id,
    NULL,NULL,actor_person,NULL,p_represented_person_id,NULL,NULL,'CASE',p_dossier_id,NULL,
    coalesce(p_safe_context,'{}'::jsonb)||jsonb_build_object('source','BACKEND')
  );
END $$;

CREATE OR REPLACE FUNCTION public.b11_audit_dossier_change() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
BEGIN
  IF TG_OP='INSERT' THEN
    PERFORM public.b11_audit('CREATED','DOSSIER',NEW.id,NEW.id,jsonb_build_object('status',NEW.status));
  ELSIF NEW.status='archive' AND OLD.status IS DISTINCT FROM NEW.status THEN
    PERFORM public.b11_audit('ARCHIVED','DOSSIER',NEW.id,NEW.id,jsonb_build_object('previous_status',OLD.status));
  ELSIF OLD IS DISTINCT FROM NEW THEN
    PERFORM public.b11_audit('UPDATED','DOSSIER',NEW.id,NEW.id,jsonb_build_object('status',NEW.status));
  END IF; RETURN NEW;
END $$;
CREATE TRIGGER b11_audit_dossiers AFTER INSERT OR UPDATE ON public.dossiers
FOR EACH ROW EXECUTE FUNCTION public.b11_audit_dossier_change();

CREATE OR REPLACE FUNCTION public.b11_audit_participant_change() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
BEGIN
  IF TG_OP='INSERT' THEN
    PERFORM public.b11_audit('PARTICIPANT_ADDED','DOSSIER_PARTICIPANT',NEW.id,NEW.dossier_id,jsonb_build_object('role',NEW.role));
  ELSIF NEW.status='revoque' AND OLD.status IS DISTINCT FROM NEW.status THEN
    PERFORM public.b11_audit('PARTICIPANT_REVOKED','DOSSIER_PARTICIPANT',NEW.id,NEW.dossier_id,jsonb_build_object('role',NEW.role));
  END IF; RETURN NEW;
END $$;
CREATE TRIGGER b11_audit_dossier_participants AFTER INSERT OR UPDATE ON public.dossier_participants
FOR EACH ROW EXECUTE FUNCTION public.b11_audit_participant_change();

CREATE OR REPLACE FUNCTION public.b11_audit_step_change() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
DECLARE event_action text;
BEGIN
  IF OLD.status IS NOT DISTINCT FROM NEW.status THEN RETURN NEW; END IF;
  event_action:=CASE NEW.status WHEN 'en_cours' THEN 'STEP_STARTED' WHEN 'terminee' THEN 'STEP_COMPLETED'
    WHEN 'bloquee' THEN 'STEP_BLOCKED' ELSE NULL END;
  IF event_action IS NOT NULL THEN
    PERFORM public.b11_audit(event_action,'DOSSIER_STEP',NEW.id,NEW.dossier_id,
      jsonb_build_object('previous_status',OLD.status,'status',NEW.status));
  END IF; RETURN NEW;
END $$;
CREATE TRIGGER b11_audit_dossier_steps AFTER UPDATE ON public.dossier_steps
FOR EACH ROW EXECUTE FUNCTION public.b11_audit_step_change();

CREATE OR REPLACE FUNCTION public.b11_audit_access_request_insert() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
BEGIN
  PERFORM public.b11_audit('ACCESS_REQUESTED','ACCESS_REQUEST',NEW.id,NEW.dossier_id,jsonb_build_object('purpose',NEW.purpose));
  RETURN NEW;
END $$;
CREATE TRIGGER b11_audit_access_requests AFTER INSERT ON public.access_requests
FOR EACH ROW EXECUTE FUNCTION public.b11_audit_access_request_insert();

CREATE OR REPLACE FUNCTION public.b11_audit_access_grant_change() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
BEGIN
  IF TG_OP='INSERT' THEN
    PERFORM public.b11_audit('ACCESS_GRANTED','ACCESS_GRANT',NEW.id,NEW.dossier_id,jsonb_build_object('purpose',NEW.purpose));
  ELSIF NEW.revoked_at IS NOT NULL AND OLD.revoked_at IS NULL THEN
    PERFORM public.b11_audit('ACCESS_REVOKED','ACCESS_GRANT',NEW.id,NEW.dossier_id);
  END IF; RETURN NEW;
END $$;
CREATE TRIGGER b11_audit_access_grants AFTER INSERT OR UPDATE ON public.access_grants
FOR EACH ROW EXECUTE FUNCTION public.b11_audit_access_grant_change();

CREATE OR REPLACE FUNCTION public.b11_audit_intervention_insert() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
BEGIN
  PERFORM public.b11_audit(
    CASE WHEN NEW.supersedes_intervention_id IS NULL THEN 'INTERVENTION_RECORDED' ELSE 'INTERVENTION_CORRECTED' END,
    'INTERVENTION',NEW.id,NEW.dossier_id,jsonb_build_object('action_type',NEW.action_type,'role',NEW.role),NEW.on_behalf_of
  );
  RETURN NEW;
END $$;
CREATE TRIGGER b11_audit_dossier_interventions AFTER INSERT ON public.dossier_interventions
FOR EACH ROW EXECUTE FUNCTION public.b11_audit_intervention_insert();

CREATE OR REPLACE FUNCTION public.b11_audit_signalement_change() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
BEGIN
  IF TG_OP='INSERT' THEN
    PERFORM public.b11_audit('SIGNALEMENT_CREATED','SIGNALEMENT',NEW.id,NEW.dossier_id,
      jsonb_build_object('type',NEW.signalement_type,'status',NEW.status),NEW.on_behalf_of);
  ELSIF OLD.status IS DISTINCT FROM NEW.status THEN
    PERFORM public.b11_audit('SIGNALEMENT_STATUS_CHANGED','SIGNALEMENT',NEW.id,NEW.dossier_id,
      jsonb_build_object('previous_status',OLD.status,'status',NEW.status),NEW.on_behalf_of);
  END IF; RETURN NEW;
END $$;
CREATE TRIGGER b11_audit_signalements AFTER INSERT OR UPDATE ON public.signalements
FOR EACH ROW EXECUTE FUNCTION public.b11_audit_signalement_change();

CREATE POLICY "authorized users view case audit"
ON public.audit_events FOR SELECT TO authenticated
USING (
  actor_user_id=auth.uid()
  OR (
    scope_type='CASE' AND scope_id IS NOT NULL
    AND (public.can_view_dossier(scope_id,auth.uid()) OR public.has_active_grant(scope_id,auth.uid()))
  )
);

REVOKE ALL ON FUNCTION public.b11_audit(text,text,uuid,uuid,jsonb,uuid),
 public.b11_audit_dossier_change(),public.b11_audit_participant_change(),
 public.b11_audit_step_change(),public.b11_audit_access_request_insert(),
 public.b11_audit_access_grant_change(),public.b11_audit_intervention_insert(),
 public.b11_audit_signalement_change() FROM PUBLIC,anon,authenticated;
