ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS activity_preferences JSONB;

COMMENT ON COLUMN public.profiles.activity_preferences IS
  'User-selected Heritis modules/activity areas. NULL means no explicit preference has been saved yet.';

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
