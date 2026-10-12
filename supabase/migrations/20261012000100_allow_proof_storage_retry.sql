-- A queued proof may already exist in Storage when its database insert fails.
-- Allow the authenticated owner to replace that same object during a retry.
-- The existing SELECT and INSERT policies still constrain the bucket and folder.
CREATE POLICY "users update own proof files" ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'dossier-proofs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'dossier-proofs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
