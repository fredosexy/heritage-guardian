-- The dedupe index was partial (WHERE dedupe_key IS NOT NULL), so Postgres could not
-- use it for ON CONFLICT (user_id, dedupe_key) and every alert insert failed with 42P10.
-- A plain unique index keeps the same guarantee (NULL dedupe_key rows stay distinct)
-- and makes the app's upsert work.
DROP INDEX IF EXISTS public.alerts_user_dedupe_key_idx;
CREATE UNIQUE INDEX alerts_user_dedupe_key_idx ON public.alerts (user_id, dedupe_key);