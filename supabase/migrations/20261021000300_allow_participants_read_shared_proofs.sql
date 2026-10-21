-- Allow accepted dossier participants to read only proof objects that have a
-- corresponding public.proofs row and are attached to a dossier they participate in.
-- Owners retain the existing own-folder policy; arbitrary objects in that folder
-- are not exposed to participants by this policy.
CREATE POLICY "participants read shared proof files" ON storage.objects FOR SELECT
  USING (
    bucket_id = 'dossier-proofs'
    AND EXISTS (
      SELECT 1
      FROM public.proofs AS p
      WHERE p.storage_path = storage.objects.name
        AND public.is_dossier_participant(p.dossier_id, auth.uid())
    )
  );
