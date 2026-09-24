CREATE TABLE IF NOT EXISTS public.ai_rate_limits (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  window_start timestamptz NOT NULL,
  request_count integer NOT NULL DEFAULT 1 CHECK (request_count > 0),
  PRIMARY KEY (user_id, window_start)
);

ALTER TABLE public.ai_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.consume_ai_quota(max_requests integer DEFAULT 30)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_window timestamptz := date_trunc('hour', now());
  updated_count integer;
BEGIN
  IF auth.uid() IS NULL OR max_requests < 1 OR max_requests > 100 THEN
    RETURN false;
  END IF;

  DELETE FROM public.ai_rate_limits
  WHERE user_id = auth.uid()
    AND window_start < current_window - interval '7 days';

  INSERT INTO public.ai_rate_limits (user_id, window_start, request_count)
  VALUES (auth.uid(), current_window, 1)
  ON CONFLICT (user_id, window_start)
  DO UPDATE SET request_count = public.ai_rate_limits.request_count + 1
  RETURNING request_count INTO updated_count;

  RETURN updated_count <= max_requests;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_ai_quota(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.consume_ai_quota(integer) TO authenticated;

CREATE INDEX IF NOT EXISTS ai_rate_limits_window_idx
  ON public.ai_rate_limits (window_start);
