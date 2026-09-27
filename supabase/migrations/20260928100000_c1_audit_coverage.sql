-- C1 — corrective audit coverage for documents, actors and procedure publication.
-- Reuses the canonical append-only audit_events store and B11 dossier helper.

CREATE OR REPLACE FUNCTION public.c1_audit_non_case(
  p_action text,
  p_target_domain text,
  p_target_type text,
  p_target_id uuid,
  p_scope_type text DEFAULT 'GLOBAL',
  p_scope_id uuid DEFAULT NULL,
  p_safe_context jsonb DEFAULT '{}'::jsonb
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
DECLARE
  correlation uuid;
  actor_person uuid;
  event_source text;
BEGIN
  BEGIN
    correlation := nullif(current_setting('app.audit_request_id', true), '')::uuid;
  EXCEPTION WHEN invalid_text_representation THEN
    correlation := NULL;
  END;
  correlation := coalesce(correlation, gen_random_uuid());
  actor_person := public.current_user_person_id();
  event_source := CASE WHEN auth.uid() IS NULL THEN 'SYSTEM' ELSE 'BACKEND' END;

  RETURN public.record_audit_event(
    'ACTION', p_action, p_target_domain, 'SUCCEEDED', correlation,
    p_target_type, p_target_id, NULL, NULL, actor_person, NULL, NULL, NULL, NULL,
    p_scope_type, p_scope_id, NULL,
    coalesce(p_safe_context, '{}'::jsonb) || jsonb_build_object('source', event_source)
  );
END
$$;

CREATE OR REPLACE FUNCTION public.c1_audit_document_insert()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
BEGIN
  PERFORM public.b11_audit(
    'DOCUMENT_ADDED', 'DOCUMENT', NEW.id, NEW.dossier_id,
    jsonb_build_object('document_type', NEW.document_type, 'status', NEW.verification_status)
  );
  RETURN NEW;
END
$$;

CREATE TRIGGER c1_audit_document_added
AFTER INSERT ON public.proofs
FOR EACH ROW EXECUTE FUNCTION public.c1_audit_document_insert();

CREATE OR REPLACE FUNCTION public.c1_audit_document_version_insert()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
DECLARE dossier_ref uuid;
BEGIN
  SELECT dossier_id INTO dossier_ref FROM public.proofs WHERE id=NEW.document_id;
  PERFORM public.b11_audit(
    'VERSION_ADDED', 'DOCUMENT_VERSION', NEW.id, dossier_ref,
    jsonb_build_object('document_id', NEW.document_id, 'version_number', NEW.version_number)
  );
  RETURN NEW;
END
$$;

CREATE TRIGGER c1_audit_document_version_added
AFTER INSERT ON public.document_versions
FOR EACH ROW EXECUTE FUNCTION public.c1_audit_document_version_insert();

CREATE OR REPLACE FUNCTION public.c1_audit_document_status_change()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
BEGIN
  IF OLD.verification_status NOT IN ('verifie','officiel')
     AND NEW.verification_status IN ('verifie','officiel') THEN
    PERFORM public.b11_audit(
      'DOCUMENT_VERIFIED', 'DOCUMENT', NEW.id, NEW.dossier_id,
      jsonb_build_object('previous_status', OLD.verification_status, 'status', NEW.verification_status)
    );
  END IF;
  RETURN NEW;
END
$$;

CREATE TRIGGER c1_audit_document_verified
AFTER UPDATE OF verification_status ON public.proofs
FOR EACH ROW EXECUTE FUNCTION public.c1_audit_document_status_change();

CREATE OR REPLACE FUNCTION public.c1_audit_actor_status_change()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
DECLARE event_action text;
BEGIN
  IF OLD.verification_status IS NOT DISTINCT FROM NEW.verification_status THEN RETURN NEW; END IF;
  event_action := CASE NEW.verification_status
    WHEN 'verifie' THEN 'ACTOR_VERIFIED'
    WHEN 'suspendu' THEN 'ACTOR_SUSPENDED'
    WHEN 'revoque' THEN 'ACTOR_REVOKED'
    ELSE NULL
  END;
  IF event_action IS NOT NULL THEN
    PERFORM public.c1_audit_non_case(
      event_action, 'ACTOR', 'ACTOR', NEW.id, 'GLOBAL', NULL,
      jsonb_build_object('actor_type', NEW.actor_type, 'previous_status', OLD.verification_status, 'status', NEW.verification_status)
    );
  END IF;
  RETURN NEW;
END
$$;

CREATE TRIGGER c1_audit_actor_status
AFTER UPDATE OF verification_status ON public.actors
FOR EACH ROW EXECUTE FUNCTION public.c1_audit_actor_status_change();

CREATE OR REPLACE FUNCTION public.c1_audit_actor_child_status_change()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
DECLARE event_action text;
DECLARE target_type text;
BEGIN
  IF OLD.status IS NOT DISTINCT FROM NEW.status THEN RETURN NEW; END IF;
  target_type := CASE TG_TABLE_NAME
    WHEN 'actor_competences' THEN 'ACTOR_COMPETENCE'
    ELSE 'ACTOR_CREDENTIAL'
  END;
  event_action := CASE NEW.status
    WHEN 'verifie' THEN target_type || '_VERIFIED'
    WHEN 'suspendu' THEN target_type || '_SUSPENDED'
    WHEN 'revoque' THEN target_type || '_REVOKED'
    ELSE NULL
  END;
  IF event_action IS NOT NULL THEN
    PERFORM public.c1_audit_non_case(
      event_action, 'ACTOR', target_type, NEW.id, 'GLOBAL', NULL,
      jsonb_build_object('actor_id', NEW.actor_id, 'previous_status', OLD.status, 'status', NEW.status)
    );
  END IF;
  RETURN NEW;
END
$$;

CREATE TRIGGER c1_audit_actor_competence_status
AFTER UPDATE OF status ON public.actor_competences
FOR EACH ROW EXECUTE FUNCTION public.c1_audit_actor_child_status_change();

CREATE TRIGGER c1_audit_actor_credential_status
AFTER UPDATE OF status ON public.actor_credentials
FOR EACH ROW EXECUTE FUNCTION public.c1_audit_actor_child_status_change();

CREATE OR REPLACE FUNCTION public.c1_audit_procedure_status_change()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
DECLARE event_action text;
BEGIN
  IF OLD.status IS NOT DISTINCT FROM NEW.status THEN RETURN NEW; END IF;
  event_action := CASE NEW.status
    WHEN 'publiee' THEN 'PROCEDURE_PUBLISHED'
    WHEN 'archivee' THEN 'PROCEDURE_ARCHIVED'
    ELSE NULL
  END;
  IF event_action IS NOT NULL THEN
    PERFORM public.c1_audit_non_case(
      event_action, 'PROCEDURE', 'PROCEDURE_DEFINITION', NEW.id, 'PROCEDURE', NEW.id,
      jsonb_build_object('code', NEW.code, 'version', NEW.version, 'previous_status', OLD.status, 'status', NEW.status)
    );
  END IF;
  RETURN NEW;
END
$$;

CREATE TRIGGER c1_audit_procedure_status
AFTER UPDATE OF status ON public.procedure_definitions
FOR EACH ROW EXECUTE FUNCTION public.c1_audit_procedure_status_change();

REVOKE ALL ON FUNCTION public.c1_audit_non_case(text,text,text,uuid,text,uuid,jsonb),
  public.c1_audit_document_insert(),
  public.c1_audit_document_version_insert(),
  public.c1_audit_document_status_change(),
  public.c1_audit_actor_status_change(),
  public.c1_audit_actor_child_status_change(),
  public.c1_audit_procedure_status_change()
FROM PUBLIC, anon, authenticated;
