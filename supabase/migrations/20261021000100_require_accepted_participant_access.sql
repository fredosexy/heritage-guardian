-- Access matrix hardening: a pending invitation is not an accepted participant.
-- Keep the caller bound to auth.uid() and require explicit acceptance before shared reads.
CREATE OR REPLACE FUNCTION public.is_dossier_participant(_dossier_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT _user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.participants
      WHERE dossier_id = _dossier_id
        AND user_id = _user_id
        AND accepted_at IS NOT NULL
    )
$$;
