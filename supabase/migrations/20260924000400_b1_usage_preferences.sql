-- B1 — identity, profiles and usage preferences

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_status_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_status_check
  CHECK (status IN ('active', 'suspended', 'disabled'));

CREATE TABLE IF NOT EXISTS public.usage_preferences (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  context_type text NOT NULL DEFAULT 'urbain'
    CHECK (context_type IN ('rural', 'urbain')),
  assistance_level text NOT NULL DEFAULT 'autonome'
    CHECK (assistance_level IN ('autonome', 'assiste')),
  interface_level text NOT NULL DEFAULT 'standard'
    CHECK (interface_level IN ('essentiel', 'standard', 'complet')),
  audio_preference text NOT NULL DEFAULT 'optionnel'
    CHECK (audio_preference IN ('prefere', 'optionnel')),
  accompaniment_preference text NOT NULL DEFAULT 'seul'
    CHECK (accompaniment_preference IN ('seul', 'accompagne')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.usage_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "view own usage preferences" ON public.usage_preferences;
CREATE POLICY "view own usage preferences"
  ON public.usage_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert own usage preferences" ON public.usage_preferences;
CREATE POLICY "insert own usage preferences"
  ON public.usage_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update own usage preferences" ON public.usage_preferences;
CREATE POLICY "update own usage preferences"
  ON public.usage_preferences
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_usage_preferences_updated_at
  ON public.usage_preferences;
CREATE TRIGGER update_usage_preferences_updated_at
  BEFORE UPDATE ON public.usage_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Existing users receive safe neutral defaults. Rural never implies assisted.
INSERT INTO public.usage_preferences (user_id)
SELECT id FROM public.profiles
ON CONFLICT (user_id) DO NOTHING;

-- Keep the existing signup flow as the single backend source of profile creation.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, language)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.phone,
    COALESCE(NEW.raw_user_meta_data->>'language', 'fr')
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.usage_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

REVOKE ALL ON public.usage_preferences FROM anon;
GRANT SELECT, INSERT, UPDATE ON public.usage_preferences TO authenticated;

-- Ordinary users may update user-owned profile fields, never status or identity.
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (
  full_name,
  phone,
  avatar_url,
  language,
  theme,
  onboarding_completed,
  onboarding_answers,
  email_alerts
) ON public.profiles TO authenticated;
