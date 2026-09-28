-- B12 — durable, idempotent server acknowledgement for client offline commands.

CREATE TABLE public.offline_command_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  principal_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  operation_id uuid NOT NULL,
  command_name text NOT NULL,
  command_version integer NOT NULL DEFAULT 1 CHECK (command_version > 0),
  request_payload jsonb NOT NULL,
  result_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'SUCCEEDED' CHECK (status IN ('SUCCEEDED','REJECTED','CONFLICT')),
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (principal_id, operation_id)
);

CREATE INDEX offline_command_receipts_principal_created_idx
  ON public.offline_command_receipts(principal_id, created_at DESC);

ALTER TABLE public.offline_command_receipts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.offline_command_receipts FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.offline_command_receipts TO service_role;

CREATE OR REPLACE FUNCTION public.execute_offline_command(
  p_operation_id uuid,
  p_command_name text,
  p_command_version integer,
  p_payload jsonb
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
DECLARE
  current_user_id uuid := auth.uid();
  existing public.offline_command_receipts;
  result jsonb := '{}'::jsonb;
  result_id uuid;
  correlation uuid;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'offline_command_authentication_required' USING ERRCODE='42501';
  END IF;
  IF p_operation_id IS NULL OR p_command_version <> 1 OR p_payload IS NULL OR jsonb_typeof(p_payload) <> 'object' THEN
    RAISE EXCEPTION 'invalid_offline_command' USING ERRCODE='22023';
  END IF;

  SELECT * INTO existing
  FROM public.offline_command_receipts
  WHERE principal_id=current_user_id AND operation_id=p_operation_id
  FOR UPDATE;

  IF FOUND THEN
    IF existing.command_name <> p_command_name
       OR existing.command_version <> p_command_version
       OR existing.request_payload <> p_payload THEN
      RAISE EXCEPTION 'offline_idempotency_conflict' USING ERRCODE='23505';
    END IF;
    RETURN existing.result_payload;
  END IF;

  CASE p_command_name
    WHEN 'CREATE_DOSSIER' THEN
      result_id := public.create_dossier(
        (p_payload->>'bien_id')::uuid,
        (p_payload->>'type')::public.dossier_type,
        p_payload->>'title',
        coalesce((p_payload->>'visibility')::public.dossier_visibility, 'prive'),
        nullif(p_payload->>'description',''),
        coalesce((p_payload->>'include_bien_holders')::boolean, true),
        p_operation_id::text
      );
      result := jsonb_build_object('id',result_id);

    WHEN 'CREATE_BIEN' THEN
      result_id := public.create_bien_with_holder(
        p_payload->>'type', p_payload->>'title', p_payload->>'location_label',
        p_payload->>'creation_context', nullif(p_payload->>'description',''),
        nullif(p_payload->>'latitude','')::double precision,
        nullif(p_payload->>'longitude','')::double precision,
        nullif(p_payload->>'origin_declared',''), nullif(p_payload->>'holder_name',''),
        nullif(p_payload->>'holder_phone',''), nullif(p_payload->>'holder_email',''),
        coalesce(p_payload->>'holder_role','titulaire')
      );
      result := jsonb_build_object('id',result_id);

    WHEN 'ADD_PARTICIPANT' THEN
      result_id := public.add_dossier_participant(
        (p_payload->>'dossier_id')::uuid,
        (p_payload->>'person_id')::uuid,
        p_payload->>'role'
      );
      result := jsonb_build_object('id',result_id);

    WHEN 'REVOKE_PARTICIPANT' THEN
      PERFORM public.revoke_dossier_participant((p_payload->>'participant_id')::uuid);
      result := jsonb_build_object('id',p_payload->>'participant_id');

    WHEN 'CREATE_INTERVENTION' THEN
      result_id := public.create_dossier_intervention(
        (p_payload->>'dossier_id')::uuid,
        nullif(p_payload->>'step_id','')::uuid,
        nullif(p_payload->>'actor_id','')::uuid,
        nullif(p_payload->>'participant_id','')::uuid,
        nullif(p_payload->>'on_behalf_of','')::uuid,
        p_payload->>'role',
        p_payload->>'action_type',
        p_payload->>'territorial_level',
        nullif(p_payload->>'comment','')
      );
      result := jsonb_build_object('id',result_id);

    WHEN 'SEND_TEXT_MESSAGE' THEN
      result_id := public.send_contextual_message(
        (p_payload->>'conversation_id')::uuid,
        'text',
        coalesce(p_payload->>'client_message_id',p_operation_id::text),
        p_payload->>'text',
        NULL,NULL,
        nullif(p_payload->>'reply_to','')::uuid,
        NULL
      );
      result := jsonb_build_object('id',result_id);

    WHEN 'CREATE_SIGNALEMENT' THEN
      result_id := public.create_signalement(
        nullif(p_payload->>'bien_id','')::uuid,
        (p_payload->>'dossier_id')::uuid,
        nullif(p_payload->>'step_id','')::uuid,
        nullif(p_payload->>'intervention_id','')::uuid,
        nullif(p_payload->>'actor_id','')::uuid,
        p_payload->>'type',
        p_payload->>'description',
        nullif(p_payload->>'expected_resolution',''),
        nullif(p_payload->>'occurred_at','')::timestamptz,
        nullif(p_payload->>'on_behalf_of','')::uuid,
        p_payload->>'role'
      );
      result := jsonb_build_object('id',result_id);

    WHEN 'UPDATE_USAGE_PREFERENCES' THEN
      INSERT INTO public.usage_preferences(
        user_id,context_type,assistance_level,interface_level,audio_preference,accompaniment_preference
      ) VALUES (
        current_user_id,
        coalesce(p_payload->>'context_type','urbain'),
        coalesce(p_payload->>'assistance_level','autonome'),
        coalesce(p_payload->>'interface_level','standard'),
        coalesce(p_payload->>'audio_preference','optionnel'),
        coalesce(p_payload->>'accompaniment_preference','seul')
      )
      ON CONFLICT(user_id) DO UPDATE SET
        context_type=coalesce(p_payload->>'context_type',public.usage_preferences.context_type),
        assistance_level=coalesce(p_payload->>'assistance_level',public.usage_preferences.assistance_level),
        interface_level=coalesce(p_payload->>'interface_level',public.usage_preferences.interface_level),
        audio_preference=coalesce(p_payload->>'audio_preference',public.usage_preferences.audio_preference),
        accompaniment_preference=coalesce(p_payload->>'accompaniment_preference',public.usage_preferences.accompaniment_preference),
        updated_at=now();
      result := jsonb_build_object('id',current_user_id);

    WHEN 'REGISTER_DOCUMENT' THEN
      result_id := public.register_document_version(
        (p_payload->>'document_id')::uuid,
        (p_payload->>'version_id')::uuid,
        (p_payload->>'dossier_id')::uuid,
        nullif(p_payload->>'bien_id','')::uuid,
        p_payload->>'document_type',
        p_payload->>'title',
        coalesce(p_payload->>'source_type','utilisateur'),
        p_payload->>'storage_path',
        p_payload->>'mime_type',
        (p_payload->>'size_bytes')::bigint,
        p_payload->>'checksum',
        nullif(p_payload->>'provided_by','')::uuid,
        p_operation_id::text
      );
      result := jsonb_build_object('id',result_id);

    ELSE
      RAISE EXCEPTION 'unsupported_offline_command' USING ERRCODE='22023';
  END CASE;

  INSERT INTO public.offline_command_receipts(
    principal_id,operation_id,command_name,command_version,request_payload,result_payload
  ) VALUES (
    current_user_id,p_operation_id,p_command_name,p_command_version,p_payload,result
  );

  BEGIN
    correlation := coalesce(nullif(current_setting('app.audit_request_id',true),'')::uuid,gen_random_uuid());
  EXCEPTION WHEN invalid_text_representation THEN
    correlation := gen_random_uuid();
  END;
  PERFORM public.record_audit_event(
    'COMMAND','OFFLINE_COMMAND_EXECUTED','SYNC','SUCCEEDED',correlation,
    p_command_name,p_operation_id,NULL,NULL,public.current_user_person_id(),NULL,NULL,NULL,NULL,
    'GLOBAL',NULL,NULL,jsonb_build_object('source','BACKEND','command_version',p_command_version)
  );

  RETURN result;
END
$$;

REVOKE ALL ON FUNCTION public.execute_offline_command(uuid,text,integer,jsonb)
FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.execute_offline_command(uuid,text,integer,jsonb)
TO authenticated;

COMMENT ON TABLE public.offline_command_receipts IS
  'Server acknowledgements for idempotent client-outbox commands. Payload reuse with different data is rejected.';
