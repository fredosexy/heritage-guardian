CREATE POLICY "avatars upload own folder" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "avatars read own" ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "avatars update own" ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "avatars delete own" ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "owners update proofs" ON public.proofs FOR UPDATE
  USING (public.owns_dossier(dossier_id, auth.uid()))
  WITH CHECK (public.owns_dossier(dossier_id, auth.uid()));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.proofs TO authenticated;
GRANT ALL ON public.proofs TO service_role;