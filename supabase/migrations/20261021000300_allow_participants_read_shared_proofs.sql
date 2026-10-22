-- Consolidate proof-file reads into one policy: owners retain access to their
-- dossier folder, while accepted participants can read only registered proofs.
DROP POLICY IF EXISTS "users read own files" ON storage.objects;
DROP POLICY IF EXISTS "dossier participants read proof files" ON storage.objects;
DROP POLICY IF EXISTS "participants read shared proof files" ON storage.objects;
DROP POLICY IF EXISTS "dossier owners and participants read proof files" ON storage.objects;

CREATE POLICY "dossier owners and participants read proof files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'dossier-proofs'
  AND EXISTS (
    SELECT 1
    FROM public.dossiers AS d
    WHERE d.id::text = (storage.foldername(name))[2]
      AND d.user_id::text = (storage.foldername(name))[1]
      AND (
        d.user_id = auth.uid()
        OR EXISTS (
          SELECT 1
          FROM public.proofs AS p
          WHERE p.storage_path = storage.objects.name
            AND p.dossier_id = d.id
            AND public.is_dossier_participant(d.id, auth.uid())
        )
      )
  )
);
