import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export type AiAuthorization = "allowed" | "unauthorized" | "rate_limited";

export async function authorizeAiRequest(req: Request): Promise<AiAuthorization> {
  const authorization = req.headers.get("Authorization");
  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!authorization?.startsWith("Bearer ") || !url || !anonKey) return "unauthorized";

  const client = createClient(url, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false },
  });
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) return "unauthorized";

  const { data: allowed, error: quotaError } = await client.rpc("consume_ai_quota", {
    max_requests: 30,
  });
  if (quotaError) throw quotaError;
  return allowed === true ? "allowed" : "rate_limited";
}
