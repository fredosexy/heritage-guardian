import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "./cors.ts";

type FunctionName = "ai-chat" | "ai-context";

function jsonResponse(status: number, error: string): Response {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/**
 * Require a real signed-in user and consume a server-side per-user rate-limit
 * slot. The service-role client is used only for the private rate-limit RPC.
 */
export async function authorizeAiRequest(
  req: Request,
  functionName: FunctionName,
  limitPerMinute: number,
) {
  const authorization = req.headers.get("Authorization");
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return { response: jsonResponse(401, "authentication_required") };

  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anonKey || !serviceRoleKey) {
    console.error("Missing Supabase environment configuration for AI authorization");
    return { response: jsonResponse(503, "service_unavailable") };
  }

  const userClient = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser(token);
  if (userError || !userData.user) {
    return { response: jsonResponse(401, "authentication_required") };
  }

  const serviceClient = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: allowed, error: limitError } = await serviceClient.rpc("consume_ai_request", {
    p_user_id: userData.user.id,
    p_function_name: functionName,
    p_limit: limitPerMinute,
    p_window_seconds: 60,
  });

  if (limitError) {
    console.error("AI rate-limit check failed:", limitError.message);
    return { response: jsonResponse(503, "service_unavailable") };
  }
  if (allowed !== true) return { response: jsonResponse(429, "rate_limit") };

  return { user: userData.user, userClient };
}
