-- Phase A security correction: Supabase may grant function EXECUTE privileges
-- explicitly to API roles. Internal transverse writers/workers must not be callable
-- directly by anon/authenticated clients.

REVOKE ALL ON FUNCTION public.record_audit_event(
  text,text,text,text,uuid,text,uuid,text,uuid,uuid,text,uuid,uuid,text,text,uuid,uuid,jsonb
) FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.enqueue_domain_event(
  uuid,text,integer,text,text,text,uuid,bigint,bigint,timestamptz,uuid,text,uuid,uuid,uuid,uuid,text,text,jsonb
) FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.claim_command_idempotency(
  text,integer,text,text,uuid
) FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.complete_command_idempotency(
  uuid,text,jsonb,jsonb
) FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.claim_outbox_batch(integer)
FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.complete_outbox_event(uuid,boolean,text,integer)
FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.register_inbox_event(text,uuid,text,integer,jsonb)
FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.complete_inbox_event(text,uuid,boolean,boolean,text)
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.record_audit_event(
  text,text,text,text,uuid,text,uuid,text,uuid,uuid,text,uuid,uuid,text,text,uuid,uuid,jsonb
) TO service_role;

GRANT EXECUTE ON FUNCTION public.enqueue_domain_event(
  uuid,text,integer,text,text,text,uuid,bigint,bigint,timestamptz,uuid,text,uuid,uuid,uuid,uuid,text,text,jsonb
) TO service_role;

GRANT EXECUTE ON FUNCTION public.claim_command_idempotency(
  text,integer,text,text,uuid
) TO service_role;

GRANT EXECUTE ON FUNCTION public.complete_command_idempotency(
  uuid,text,jsonb,jsonb
) TO service_role;

GRANT EXECUTE ON FUNCTION public.claim_outbox_batch(integer),
  public.complete_outbox_event(uuid,boolean,text,integer),
  public.register_inbox_event(text,uuid,text,integer,jsonb),
  public.complete_inbox_event(text,uuid,boolean,boolean,text)
TO service_role;

-- Safe query remains callable by authenticated principals.
REVOKE ALL ON FUNCTION public.has_effective_permission(text,text,uuid)
FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_effective_permission(text,text,uuid)
TO authenticated, service_role;
