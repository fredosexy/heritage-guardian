-- Scope private proof objects to a real dossier and its access rules.
-- Owners may upload/delete objects for their own dossiers; participants may read
-- those objects only when they are listed on the corresponding dossier.
DROP POLICY IF EXISTS "users upload to own folder" ON storage.objects;
DROP POLICY IF EXISTS "users read own files" ON storage.objects;
DROP POLICY IF EXISTS "users delete own files" ON storage.objects;
-- The terrain branch adds a retry UPDATE policy; replace it as well so retries
-- cannot write objects for a missing or foreign dossier.
DROP POLICY IF EXISTS "users update own proof files" ON storage.objects;
DROP POLICY IF EXISTS "dossier participants read proof files" ON storage.objects;
DROP POLICY IF EXISTS "dossier owners and participants read proof files" ON storage.objects;

-- Invitation-pending users must not be treated as dossier participants by RLS.
CREATE OR REPLACE FUNCTION public.is_dossier_participant(_dossier_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
  SELECT _user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.participants AS participant
      WHERE participant.dossier_id = _dossier_id
        AND participant.user_id = _user_id
        AND participant.accepted_at IS NOT NULL
    );
$function$;

CREATE POLICY "owners upload proofs for own dossiers"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'dossier-proofs'
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND EXISTS (
    SELECT 1
    FROM public.dossiers AS d
    WHERE d.id::text = (storage.foldername(name))[2]
      AND d.user_id = auth.uid()
  )
);

CREATE POLICY "owners update proofs for own dossiers"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'dossier-proofs'
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND EXISTS (
    SELECT 1
    FROM public.dossiers AS d
    WHERE d.id::text = (storage.foldername(name))[2]
      AND d.user_id = auth.uid()
  )
)
WITH CHECK (
  bucket_id = 'dossier-proofs'
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND EXISTS (
    SELECT 1
    FROM public.dossiers AS d
    WHERE d.id::text = (storage.foldername(name))[2]
      AND d.user_id = auth.uid()
  )
);

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
        -- Owners retain access to their own dossier folder.
        d.user_id = auth.uid()
        -- Participants may read only files represented by a proof row.
        OR EXISTS (
          SELECT 1
          FROM public.proofs AS p
          WHERE p.storage_path = storage.objects.name
            AND p.dossier_id = d.id
            AND EXISTS (
              SELECT 1
              FROM public.participants AS participant
              WHERE participant.dossier_id = d.id
                AND participant.user_id = auth.uid()
                AND participant.accepted_at IS NOT NULL
            )
        )
      )
  )
);

CREATE POLICY "owners delete proofs for own dossiers"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'dossier-proofs'
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND EXISTS (
    SELECT 1
    FROM public.dossiers AS d
    WHERE d.id::text = (storage.foldername(name))[2]
      AND d.user_id = auth.uid()
  )
);
