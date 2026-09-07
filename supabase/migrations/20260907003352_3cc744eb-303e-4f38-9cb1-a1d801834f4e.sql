ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS dedupe_key text;
ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS email_sent_at timestamptz;
CREATE UNIQUE INDEX IF NOT EXISTS alerts_user_dedupe_key_idx ON public.alerts (user_id, dedupe_key) WHERE dedupe_key IS NOT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_alerts boolean NOT NULL DEFAULT true;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.alerts TO authenticated;
GRANT ALL ON public.alerts TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;