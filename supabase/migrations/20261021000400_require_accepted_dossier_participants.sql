-- Only an accepted participant may access a shared dossier or its proofs.
-- Keep the helper's identity check so it cannot be used to probe other users' dossiers.
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
