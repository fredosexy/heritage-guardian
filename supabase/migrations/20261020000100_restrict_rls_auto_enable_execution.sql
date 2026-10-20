-- The event trigger itself continues to run, but its SECURITY DEFINER function
-- must not be exposed as an RPC entry point to client roles.
-- Some environments may not have this project-specific helper, so keep this
-- migration safe for fresh Supabase projects as well.
DO $$
BEGIN
  IF to_regprocedure('public.rls_auto_enable()') IS NOT NULL THEN
    REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
  END IF;
END;
$$;
