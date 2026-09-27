import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import type { User } from "https://esm.sh/@supabase/supabase-js@2";

const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "https://*.lovable.app",
  "https://*.lovableproject.com",
];

function configuredOrigins(): string[] {
  const configured = Deno.env.get("APP_ALLOWED_ORIGINS");
  return configured
    ? configured.split(",").map((value) => value.trim()).filter(Boolean)
    : DEFAULT_ALLOWED_ORIGINS;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^$()|[\]\\]/g, "\\$&");
}

function matchesOrigin(origin: string, rule: string): boolean {
  if (rule === origin) return true;
  if (!rule.includes("*")) return false;

  const wildcardPattern = rule
    .split("*")
    .map(escapeRegex)
    .join(".*");
  return new RegExp(`^${wildcardPattern}$`).test(origin);
}

export function isAllowedOrigin(req: Request): boolean {
  const origin = req.headers.get("Origin");
  // Non-browser/server-to-server requests do not require CORS.
  if (!origin) return true;
  return configuredOrigins().some((rule) => matchesOrigin(origin, rule));
}

export function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin");
  const headers: Record<string, string> = {
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };

  if (origin && isAllowedOrigin(req)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
}

export function preflight(req: Request): Response | null {
  if (req.method !== "OPTIONS") return null;
  if (!isAllowedOrigin(req)) return new Response(null, { status: 403 });
  return new Response(null, { status: 204, headers: corsHeaders(req) });
}

export function json(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req), "Content-Type": "application/json" },
  });
}

export interface AuthenticatedRequest {
  client: ReturnType<typeof createClient>;
  user: User;
}

export async function authenticateRequest(req: Request): Promise<AuthenticatedRequest | null> {
  if (!isAllowedOrigin(req)) return null;

  const authorization = req.headers.get("Authorization");
  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!authorization?.startsWith("Bearer ") || !url || !anonKey) return null;

  const client = createClient(url, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false },
  });
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) return null;

  return { client, user: data.user };
}

export type AiAuthorization = "allowed" | "unauthorized" | "rate_limited";

export async function authorizeAiRequest(req: Request): Promise<AiAuthorization> {
  const authenticated = await authenticateRequest(req);
  if (!authenticated) return "unauthorized";

  const { data: allowed, error: quotaError } = await authenticated.client.rpc("consume_ai_quota", {
    max_requests: 30,
  });
  if (quotaError) throw quotaError;
  return allowed === true ? "allowed" : "rate_limited";
}
