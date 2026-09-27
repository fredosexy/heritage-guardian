-- Phase A corrective migration: disambiguate PL/pgSQL output parameters
-- in canonical command idempotency helper.

CREATE OR REPLACE FUNCTION public.claim_command_idempotency(
  p_command_name text,
  p_command_version integer,
  p_idempotency_key text,
  p_request_hash text,
  p_correlation_id uuid
) RETURNS TABLE(record_id uuid,result_status text,result_payload jsonb,is_new boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
DECLARE
  principal text;
  existing public.command_idempotency_records;
  new_id uuid;
  new_status text;
  new_payload jsonb;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'command_unauthorized' USING ERRCODE='42501';
  END IF;

  principal:='user:'||auth.uid()::text;

  SELECT * INTO existing
  FROM public.command_idempotency_records
  WHERE principal_key=principal
    AND command_name=p_command_name
    AND idempotency_key=p_idempotency_key
  FOR UPDATE;

  IF FOUND THEN
    IF existing.request_hash<>p_request_hash THEN
      RAISE EXCEPTION 'idempotency_key_reused_with_different_payload' USING ERRCODE='22023';
    END IF;

    record_id:=existing.id;
    result_status:=existing.status;
    result_payload:=existing.result_payload;
    is_new:=false;
    RETURN NEXT;
    RETURN;
  END IF;

  INSERT INTO public.command_idempotency_records AS cir(
    principal_key,command_name,command_version,idempotency_key,request_hash,correlation_id
  ) VALUES (
    principal,p_command_name,p_command_version,p_idempotency_key,p_request_hash,p_correlation_id
  )
  RETURNING cir.id,cir.status,cir.result_payload
  INTO new_id,new_status,new_payload;

  record_id:=new_id;
  result_status:=new_status;
  result_payload:=new_payload;
  is_new:=true;
  RETURN NEXT;
END $$;

REVOKE ALL ON FUNCTION public.claim_command_idempotency(text,integer,text,text,uuid) FROM PUBLIC;
