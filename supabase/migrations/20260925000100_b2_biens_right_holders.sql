-- B2 — durable assets, people and declared right holders

CREATE TABLE public.persons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  linked_profile_id uuid UNIQUE REFERENCES public.profiles(id) ON DELETE SET NULL,
  display_name text NOT NULL CHECK (char_length(btrim(display_name)) BETWEEN 2 AND 160),
  phone text,
  email text,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (phone IS NULL OR char_length(phone) <= 40),
  CHECK (email IS NULL OR char_length(email) <= 254)
);

CREATE TABLE public.biens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL REFERENCES auth.users(id),
  type text NOT NULL CHECK (type IN ('terrain', 'parcelle', 'maison', 'propriete_familiale', 'autre')),
  title text NOT NULL CHECK (char_length(btrim(title)) BETWEEN 2 AND 160),
  description text CHECK (description IS NULL OR char_length(description) <= 4000),
  location_label text NOT NULL CHECK (char_length(btrim(location_label)) BETWEEN 2 AND 240),
  latitude double precision CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90),
  longitude double precision CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180),
  origin_declared text CHECK (origin_declared IS NULL OR char_length(origin_declared) <= 1000),
  creation_context text NOT NULL
    CHECK (creation_context IN ('propre_bien', 'proche_accompagne', 'bien_familial')),
  status text NOT NULL DEFAULT 'actif'
    CHECK (status IN ('actif', 'a_verifier', 'conteste', 'archive')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  CHECK (
    (status = 'archive' AND archived_at IS NOT NULL)
    OR (status <> 'archive' AND archived_at IS NULL)
  )
);

CREATE TABLE public.bien_right_holders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bien_id uuid NOT NULL REFERENCES public.biens(id) ON DELETE CASCADE,
  person_id uuid NOT NULL REFERENCES public.persons(id) ON DELETE RESTRICT,
  role text NOT NULL
    CHECK (role IN ('titulaire', 'co_titulaire', 'ayant_droit', 'representant_autorise', 'autre')),
  status text NOT NULL DEFAULT 'declare'
    CHECK (status IN ('declare', 'a_verifier', 'verifie', 'revoque')),
  declared_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  verified_at timestamptz,
  revoked_at timestamptz,
  CHECK ((status = 'verifie') = (verified_at IS NOT NULL)),
  CHECK ((status = 'revoque') = (revoked_at IS NOT NULL))
);

CREATE INDEX biens_created_by_idx ON public.biens(created_by);
CREATE INDEX bien_right_holders_bien_idx ON public.bien_right_holders(bien_id);
CREATE INDEX bien_right_holders_person_idx ON public.bien_right_holders(person_id);
CREATE INDEX bien_right_holders_status_idx ON public.bien_right_holders(status);
CREATE INDEX persons_created_by_idx ON public.persons(created_by);

CREATE UNIQUE INDEX bien_right_holders_active_unique_idx
  ON public.bien_right_holders(bien_id, person_id, role)
  WHERE status <> 'revoque';

CREATE TRIGGER update_persons_updated_at
  BEFORE UPDATE ON public.persons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_biens_updated_at
  BEFORE UPDATE ON public.biens
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.can_view_bien(_bien_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.biens b
    WHERE b.id = _bien_id
      AND (
        b.created_by = _user_id
        OR EXISTS (
          SELECT 1
          FROM public.bien_right_holders brh
          JOIN public.persons p ON p.id = brh.person_id
          WHERE brh.bien_id = b.id
            AND brh.status <> 'revoque'
            AND p.linked_profile_id = _user_id
        )
      )
  )
$$;

REVOKE ALL ON FUNCTION public.can_view_bien(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_view_bien(uuid, uuid) TO authenticated;

ALTER TABLE public.persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bien_right_holders ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.can_view_person(_person_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.persons p
    WHERE p.id = _person_id
      AND (
        p.created_by = _user_id
        OR p.linked_profile_id = _user_id
        OR EXISTS (
          SELECT 1
          FROM public.bien_right_holders brh
          WHERE brh.person_id = p.id
            AND public.can_view_bien(brh.bien_id, _user_id)
        )
      )
  )
$$;

REVOKE ALL ON FUNCTION public.can_view_person(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_view_person(uuid, uuid) TO authenticated;

CREATE POLICY "view legitimate persons"
  ON public.persons FOR SELECT
  USING (public.can_view_person(id, auth.uid()));

CREATE POLICY "create persons with clear responsibility"
  ON public.persons FOR INSERT
  WITH CHECK (
    created_by = auth.uid()
    AND (linked_profile_id IS NULL OR linked_profile_id = auth.uid())
  );

CREATE POLICY "maintain declared persons"
  ON public.persons FOR UPDATE
  USING (created_by = auth.uid() OR linked_profile_id = auth.uid())
  WITH CHECK (created_by = auth.uid() OR linked_profile_id = auth.uid());

CREATE POLICY "view legitimate biens"
  ON public.biens FOR SELECT
  USING (public.can_view_bien(id, auth.uid()));

CREATE POLICY "create own biens"
  ON public.biens FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "maintain created biens"
  ON public.biens FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "view legitimate right holders"
  ON public.bien_right_holders FOR SELECT
  USING (public.can_view_bien(bien_id, auth.uid()));

CREATE POLICY "declare right holders on created biens"
  ON public.bien_right_holders FOR INSERT
  WITH CHECK (
    declared_by = auth.uid()
    AND status IN ('declare', 'a_verifier')
    AND EXISTS (
      SELECT 1 FROM public.biens b
      WHERE b.id = bien_id AND b.created_by = auth.uid()
    )
  );

CREATE POLICY "maintain unverified right holders"
  ON public.bien_right_holders FOR UPDATE
  USING (
    declared_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.biens b
      WHERE b.id = bien_id AND b.created_by = auth.uid()
    )
  )
  WITH CHECK (
    status IN ('declare', 'a_verifier', 'revoque')
    AND verified_at IS NULL
  );

REVOKE ALL ON public.persons, public.biens, public.bien_right_holders FROM anon;
GRANT SELECT, INSERT ON public.persons, public.biens, public.bien_right_holders TO authenticated;
GRANT UPDATE (display_name, phone, email) ON public.persons TO authenticated;
GRANT UPDATE (
  type, title, description, location_label, latitude, longitude,
  origin_declared, status, archived_at
) ON public.biens TO authenticated;
GRANT UPDATE (role, status, revoked_at) ON public.bien_right_holders TO authenticated;

CREATE OR REPLACE FUNCTION public.create_bien_with_holder(
  p_type text,
  p_title text,
  p_location_label text,
  p_creation_context text,
  p_description text DEFAULT NULL,
  p_latitude double precision DEFAULT NULL,
  p_longitude double precision DEFAULT NULL,
  p_origin_declared text DEFAULT NULL,
  p_holder_name text DEFAULT NULL,
  p_holder_phone text DEFAULT NULL,
  p_holder_email text DEFAULT NULL,
  p_holder_role text DEFAULT 'titulaire'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid := auth.uid();
  new_bien_id uuid;
  holder_person_id uuid;
  self_name text;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'authentication_required' USING ERRCODE = '42501';
  END IF;

  IF p_creation_context NOT IN ('propre_bien', 'proche_accompagne', 'bien_familial') THEN
    RAISE EXCEPTION 'invalid_creation_context' USING ERRCODE = '22023';
  END IF;

  IF p_holder_role NOT IN ('titulaire', 'co_titulaire', 'ayant_droit', 'representant_autorise', 'autre') THEN
    RAISE EXCEPTION 'invalid_holder_role' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.biens (
    created_by, type, title, description, location_label,
    latitude, longitude, origin_declared, creation_context
  )
  VALUES (
    current_user_id, p_type, p_title, p_description, p_location_label,
    p_latitude, p_longitude, p_origin_declared, p_creation_context
  )
  RETURNING id INTO new_bien_id;

  IF p_creation_context = 'propre_bien' THEN
    SELECT COALESCE(NULLIF(btrim(full_name), ''), 'Utilisateur')
    INTO self_name
    FROM public.profiles
    WHERE id = current_user_id;

    INSERT INTO public.persons (linked_profile_id, display_name, phone, created_by)
    VALUES (current_user_id, self_name, p_holder_phone, current_user_id)
    ON CONFLICT (linked_profile_id)
    DO UPDATE SET display_name = EXCLUDED.display_name
    RETURNING id INTO holder_person_id;
  ELSE
    IF p_holder_name IS NULL OR char_length(btrim(p_holder_name)) < 2 THEN
      RAISE EXCEPTION 'holder_name_required' USING ERRCODE = '22023';
    END IF;

    INSERT INTO public.persons (display_name, phone, email, created_by)
    VALUES (btrim(p_holder_name), p_holder_phone, p_holder_email, current_user_id)
    RETURNING id INTO holder_person_id;
  END IF;

  INSERT INTO public.bien_right_holders (
    bien_id, person_id, role, status, declared_by
  )
  VALUES (
    new_bien_id, holder_person_id, p_holder_role, 'declare', current_user_id
  );

  RETURN new_bien_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_bien_with_holder(
  text, text, text, text, text, double precision, double precision,
  text, text, text, text, text
) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_bien_with_holder(
  text, text, text, text, text, double precision, double precision,
  text, text, text, text, text
) TO authenticated;
