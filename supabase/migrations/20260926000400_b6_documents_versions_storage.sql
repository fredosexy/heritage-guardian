-- B6 — progressively evolve the existing proofs system into versioned documents.
ALTER TABLE public.proofs
  ADD COLUMN bien_id uuid REFERENCES public.biens(id) ON DELETE SET NULL,
  ADD COLUMN document_type text,
  ADD COLUMN source_type text NOT NULL DEFAULT 'utilisateur'
    CHECK (source_type IN ('declaration','utilisateur','accompagnateur','acteur','service','source_officielle')),
  ADD COLUMN verification_status text
    CHECK (verification_status IN ('declare','fourni','a_verifier','verifie','officiel','rejete','archive')),
  ADD COLUMN created_by uuid REFERENCES auth.users(id),
  ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN archived_at timestamptz,
  ADD COLUMN client_operation_id text;

UPDATE public.proofs SET
  document_type = CASE type::text WHEN 'image' THEN 'photo' ELSE 'autre' END,
  verification_status = CASE WHEN verified THEN 'verifie' ELSE 'fourni' END,
  created_by = uploaded_by;

ALTER TABLE public.proofs
  ALTER COLUMN document_type SET NOT NULL,
  ALTER COLUMN verification_status SET NOT NULL,
  ALTER COLUMN created_by SET NOT NULL,
  ADD CONSTRAINT proofs_document_type_check CHECK (document_type ~ '^[a-z0-9_]{2,80}$'),
  ADD CONSTRAINT proofs_official_source_check CHECK (verification_status <> 'officiel' OR source_type = 'source_officielle');

CREATE UNIQUE INDEX proofs_client_operation_unique
  ON public.proofs(created_by, client_operation_id) WHERE client_operation_id IS NOT NULL;
CREATE INDEX proofs_bien_idx ON public.proofs(bien_id);
CREATE INDEX proofs_document_type_idx ON public.proofs(document_type);
CREATE INDEX proofs_verification_status_idx ON public.proofs(verification_status);

CREATE TABLE public.document_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.proofs(id) ON DELETE RESTRICT,
  storage_path text NOT NULL UNIQUE,
  mime_type text NOT NULL,
  size_bytes bigint NOT NULL CHECK (size_bytes > 0 AND size_bytes <= 15728640),
  checksum text NOT NULL CHECK (checksum ~ '^[a-f0-9]{64}$'),
  version_number integer NOT NULL CHECK (version_number > 0),
  uploaded_by uuid NOT NULL REFERENCES auth.users(id),
  provided_by uuid REFERENCES public.persons(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  replaced_at timestamptz,
  UNIQUE (document_id, version_number),
  UNIQUE (document_id, id)
);

INSERT INTO public.document_versions
  (id, document_id, storage_path, mime_type, size_bytes, checksum, version_number, uploaded_by, created_at)
SELECT gen_random_uuid(), id, storage_path, COALESCE(NULLIF(mime_type,''),'application/octet-stream'),
  GREATEST(COALESCE(size_bytes,1),1), repeat('0',64), 1, uploaded_by, created_at
FROM public.proofs;

ALTER TABLE public.proofs ADD COLUMN current_version_id uuid;
UPDATE public.proofs p SET current_version_id = v.id
FROM public.document_versions v WHERE v.document_id = p.id AND v.version_number = 1;
ALTER TABLE public.proofs
  ADD CONSTRAINT proofs_current_version_fkey
  FOREIGN KEY (id, current_version_id) REFERENCES public.document_versions(document_id, id) DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE public.procedure_steps
  ADD COLUMN required_document_types text[] NOT NULL DEFAULT '{}',
  ADD CONSTRAINT procedure_steps_document_codes_check
    CHECK (cardinality(required_document_types)=0 OR array_to_string(required_document_types,',') ~ '^[a-z0-9_]+(,[a-z0-9_]+)*$');

ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owners view proofs" ON public.proofs;
DROP POLICY IF EXISTS "participants view proofs" ON public.proofs;
DROP POLICY IF EXISTS "owners insert proofs" ON public.proofs;
DROP POLICY IF EXISTS "owners delete proofs" ON public.proofs;
DROP POLICY IF EXISTS "owners update proofs" ON public.proofs;

CREATE POLICY "authorized users view documents" ON public.proofs FOR SELECT
  USING (public.can_view_dossier(dossier_id, auth.uid()));
CREATE POLICY "authorized users view document versions" ON public.document_versions FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.proofs d WHERE d.id = document_id AND public.can_view_dossier(d.dossier_id, auth.uid())));

REVOKE ALL ON public.proofs, public.document_versions FROM anon, authenticated;
GRANT SELECT ON public.proofs, public.document_versions TO authenticated;

DROP POLICY IF EXISTS "users upload to own folder" ON storage.objects;
DROP POLICY IF EXISTS "users read own files" ON storage.objects;
DROP POLICY IF EXISTS "users delete own files" ON storage.objects;
CREATE POLICY "authorized dossier document upload" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'dossier-proofs'
    AND (storage.foldername(name))[1] = 'dossiers'
    AND public.owns_dossier(((storage.foldername(name))[2])::uuid, auth.uid())
  );
CREATE POLICY "authorized dossier document read" ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'dossier-proofs'
    AND CASE WHEN (storage.foldername(name))[1] = 'dossiers'
      THEN public.can_view_dossier(((storage.foldername(name))[2])::uuid, auth.uid())
      ELSE (storage.foldername(name))[1] = auth.uid()::text
    END
  );
CREATE POLICY "owners delete unregistered document uploads" ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id='dossier-proofs' AND CASE WHEN (storage.foldername(name))[1]='dossiers'
      THEN public.owns_dossier(((storage.foldername(name))[2])::uuid,auth.uid()) ELSE false END
    AND NOT EXISTS (SELECT 1 FROM public.document_versions v WHERE v.storage_path=name)
  );

UPDATE storage.buckets SET public=false, file_size_limit=15728640,
  allowed_mime_types=ARRAY['image/jpeg','image/png','image/webp','application/pdf','audio/mpeg','audio/mp4','video/mp4']
WHERE id='dossier-proofs';

CREATE OR REPLACE FUNCTION public.register_document_version(
  p_document_id uuid, p_version_id uuid, p_dossier_id uuid, p_bien_id uuid,
  p_document_type text, p_title text, p_source_type text, p_storage_path text,
  p_mime_type text, p_size_bytes bigint, p_checksum text, p_provided_by uuid DEFAULT NULL,
  p_client_operation_id text DEFAULT NULL
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
DECLARE next_version integer; current_user_id uuid := auth.uid(); existing public.proofs;
BEGIN
  IF current_user_id IS NULL OR NOT public.owns_dossier(p_dossier_id,current_user_id) THEN
    RAISE EXCEPTION 'document_write_forbidden' USING ERRCODE='42501';
  END IF;
  IF p_source_type NOT IN ('declaration','utilisateur','accompagnateur') THEN
    RAISE EXCEPTION 'document_source_forbidden' USING ERRCODE='42501';
  END IF;
  IF p_document_type !~ '^[a-z0-9_]{2,80}$' OR char_length(btrim(p_title)) NOT BETWEEN 2 AND 200 THEN
    RAISE EXCEPTION 'invalid_document_metadata' USING ERRCODE='22023';
  END IF;
  IF p_mime_type NOT IN ('image/jpeg','image/png','image/webp','application/pdf','audio/mpeg','audio/mp4','video/mp4')
    OR p_size_bytes NOT BETWEEN 1 AND 15728640 OR p_checksum !~ '^[a-f0-9]{64}$' THEN
    RAISE EXCEPTION 'invalid_document_file' USING ERRCODE='22023';
  END IF;
  IF p_storage_path <> format('dossiers/%s/documents/%s/%s',p_dossier_id,p_document_id,p_version_id) THEN
    RAISE EXCEPTION 'invalid_document_path' USING ERRCODE='22023';
  END IF;
  SELECT * INTO existing FROM public.proofs WHERE id=p_document_id FOR UPDATE;
  IF NOT FOUND THEN
    INSERT INTO public.proofs(id,dossier_id,bien_id,type,title,storage_path,mime_type,size_bytes,uploaded_by,verified,
      document_type,source_type,verification_status,created_by,client_operation_id)
    VALUES(p_document_id,p_dossier_id,p_bien_id,
      CASE WHEN p_mime_type LIKE 'image/%' THEN 'image'::public.proof_type ELSE 'document'::public.proof_type END,
      btrim(p_title),p_storage_path,p_mime_type,p_size_bytes,current_user_id,false,
      p_document_type,p_source_type,'fourni',current_user_id,p_client_operation_id);
    next_version:=1;
  ELSE
    IF existing.dossier_id<>p_dossier_id OR NOT public.owns_dossier(existing.dossier_id,current_user_id) OR existing.archived_at IS NOT NULL THEN
      RAISE EXCEPTION 'document_write_forbidden' USING ERRCODE='42501';
    END IF;
    SELECT COALESCE(max(version_number),0)+1 INTO next_version FROM public.document_versions WHERE document_id=p_document_id;
    UPDATE public.document_versions SET replaced_at=now() WHERE id=existing.current_version_id AND replaced_at IS NULL;
  END IF;
  INSERT INTO public.document_versions(id,document_id,storage_path,mime_type,size_bytes,checksum,version_number,uploaded_by,provided_by)
  VALUES(p_version_id,p_document_id,p_storage_path,p_mime_type,p_size_bytes,p_checksum,next_version,current_user_id,p_provided_by);
  UPDATE public.proofs SET current_version_id=p_version_id,storage_path=p_storage_path,mime_type=p_mime_type,
    size_bytes=p_size_bytes,uploaded_by=current_user_id,updated_at=now() WHERE id=p_document_id;
  RETURN p_version_id;
END $$;

CREATE OR REPLACE FUNCTION public.archive_document(p_document_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
BEGIN
  UPDATE public.proofs SET verification_status='archive',archived_at=now(),updated_at=now()
  WHERE id=p_document_id AND public.owns_dossier(dossier_id,auth.uid()) AND archived_at IS NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'document_archive_forbidden' USING ERRCODE='42501'; END IF;
END $$;

CREATE OR REPLACE FUNCTION public.rename_document(p_document_id uuid,p_title text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
BEGIN
  IF char_length(btrim(p_title)) NOT BETWEEN 2 AND 200 THEN RAISE EXCEPTION 'invalid_document_title' USING ERRCODE='22023'; END IF;
  UPDATE public.proofs SET title=btrim(p_title),updated_at=now()
  WHERE id=p_document_id AND public.owns_dossier(dossier_id,auth.uid()) AND archived_at IS NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'document_rename_forbidden' USING ERRCODE='42501'; END IF;
END $$;

CREATE OR REPLACE FUNCTION public.transition_document_status(p_document_id uuid,p_status text,p_source_type text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET row_security=off AS $$
DECLARE current_status text;
BEGIN
  SELECT verification_status INTO current_status FROM public.proofs WHERE id=p_document_id FOR UPDATE;
  IF NOT FOUND OR NOT public.can_verify_actor(auth.uid()) THEN RAISE EXCEPTION 'document_verification_forbidden' USING ERRCODE='42501'; END IF;
  IF p_status='officiel' AND (NOT public.has_role(auth.uid(),'admin') OR p_source_type<>'source_officielle') THEN
    RAISE EXCEPTION 'official_document_forbidden' USING ERRCODE='42501';
  END IF;
  IF NOT ((current_status IN ('fourni','rejete') AND p_status='a_verifier') OR
          (current_status='a_verifier' AND p_status IN ('verifie','rejete')) OR
          (current_status='verifie' AND p_status='officiel')) THEN
    RAISE EXCEPTION 'invalid_document_transition' USING ERRCODE='22023';
  END IF;
  UPDATE public.proofs SET verification_status=p_status,
    source_type=CASE WHEN p_status='officiel' THEN 'source_officielle' ELSE source_type END,
    verified=(p_status IN ('verifie','officiel')),updated_at=now() WHERE id=p_document_id;
END $$;

REVOKE ALL ON FUNCTION public.register_document_version(uuid,uuid,uuid,uuid,text,text,text,text,text,bigint,text,uuid,text),
  public.archive_document(uuid),public.rename_document(uuid,text),public.transition_document_status(uuid,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.register_document_version(uuid,uuid,uuid,uuid,text,text,text,text,text,bigint,text,uuid,text),
  public.archive_document(uuid),public.rename_document(uuid,text),public.transition_document_status(uuid,text,text) TO authenticated;
