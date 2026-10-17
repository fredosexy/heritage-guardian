-- Bootstrap hardening for a newly initialized Supabase project.
-- Keep this additive so existing migration history remains auditable.

-- Avatar storage is private; profile code uses signed URLs.
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Reassert avatar access policies explicitly and keep each user's files isolated.
DROP POLICY IF EXISTS "avatars upload own folder" ON storage.objects;
CREATE POLICY "avatars upload own folder" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "avatars read own" ON storage.objects;
CREATE POLICY "avatars read own" ON storage.objects FOR SELECT
  USING (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "avatars update own" ON storage.objects;
CREATE POLICY "avatars update own" ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "avatars delete own" ON storage.objects;
CREATE POLICY "avatars delete own" ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- A dossier participant may read its evidence file only when the corresponding
-- proof row is visible to that participant through the public.proofs RLS rules.
DROP POLICY IF EXISTS "dossier participants read proof files" ON storage.objects;
CREATE POLICY "dossier participants read proof files" ON storage.objects FOR SELECT
  USING (
    bucket_id = 'dossier-proofs'
    AND EXISTS (
      SELECT 1
      FROM public.proofs p
      WHERE p.storage_path = storage.objects.name
        AND (
          public.owns_dossier(p.dossier_id, auth.uid())
          OR public.is_dossier_participant(p.dossier_id, auth.uid())
        )
    )
  );

-- Persistent, server-only request ledger for per-user AI rate limits.
CREATE TABLE IF NOT EXISTS public.ai_request_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  function_name text NOT NULL CHECK (function_name IN ('ai-chat', 'ai-context')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ai_request_events_user_function_created_idx
  ON public.ai_request_events (user_id, function_name, created_at DESC);
ALTER TABLE public.ai_request_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.ai_request_events FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.ai_request_events TO service_role;

-- Atomically check and record each AI call. The advisory lock prevents concurrent
-- requests for one user/function from bypassing the per-minute cap.
CREATE OR REPLACE FUNCTION public.consume_ai_request(
  p_user_id uuid,
  p_function_name text,
  p_limit integer,
  p_window_seconds integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
DECLARE
  request_count integer;
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'service_role_required' USING ERRCODE = '42501';
  END IF;

  IF p_user_id IS NULL
    OR p_function_name NOT IN ('ai-chat', 'ai-context')
    OR p_limit < 1 OR p_limit > 100
    OR p_window_seconds < 1 OR p_window_seconds > 3600
  THEN
    RAISE EXCEPTION 'invalid_ai_rate_limit_arguments' USING ERRCODE = '22023';
  END IF;

  PERFORM pg_advisory_xact_lock(
    hashtextextended(p_user_id::text || ':' || p_function_name, 0)
  );

  SELECT count(*)::integer INTO request_count
  FROM public.ai_request_events
  WHERE user_id = p_user_id
    AND function_name = p_function_name
    AND created_at >= now() - make_interval(secs => p_window_seconds);

  IF request_count >= p_limit THEN
    RETURN false;
  END IF;

  INSERT INTO public.ai_request_events (user_id, function_name)
  VALUES (p_user_id, p_function_name);

  DELETE FROM public.ai_request_events
  WHERE created_at < now() - interval '7 days';

  RETURN true;
END;
$function$;

REVOKE ALL ON FUNCTION public.consume_ai_request(uuid, text, integer, integer)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_ai_request(uuid, text, integer, integer)
  TO service_role;

-- Supabase currently exposes this SECURITY DEFINER event-trigger function via
-- PostgREST. Event triggers continue to execute as their owner after EXECUTE is
-- revoked from API roles.
DO $block$
BEGIN
  IF to_regprocedure('public.rls_auto_enable()') IS NOT NULL THEN
    EXECUTE 'REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM PUBLIC';
    EXECUTE 'REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM anon, authenticated';
  END IF;
END;
$block$;
