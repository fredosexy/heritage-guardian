import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  }[char] ?? char));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const authorization = req.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) return json({ error: "unauthorized" }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const resendKey = Deno.env.get("RESEND_API_KEY");
  const emailFrom = Deno.env.get("ALERT_EMAIL_FROM");
  if (!supabaseUrl || !anonKey || !resendKey || !emailFrom) {
    return json({ error: "service_not_configured" }, 503);
  }

  const client = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false },
  });
  const { data: authData, error: authError } = await client.auth.getUser();
  if (authError || !authData.user?.email) return json({ error: "unauthorized" }, 401);

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }
  const alertIds = (payload as { alertIds?: unknown })?.alertIds;
  if (!Array.isArray(alertIds) || alertIds.length === 0 || alertIds.length > 20 ||
      alertIds.some((id) => typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id))) {
    return json({ error: "invalid_alert_ids" }, 400);
  }

  // RLS guarantees that only alerts owned by the authenticated user are returned.
  const { data: alerts, error: alertsError } = await client
    .from("alerts")
    .select("id,title,message,severity")
    .in("id", alertIds)
    .is("email_sent_at", null);
  if (alertsError) return json({ error: "alerts_unavailable" }, 500);
  if (!alerts?.length) return json({ sent: 0 });

  const items = alerts.map((alert) =>
    `<li><strong>${escapeHtml(alert.title)}</strong><br>${escapeHtml(alert.message)}</li>`
  ).join("");
  const mailResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: emailFrom,
      to: [authData.user.email],
      subject: "Mémoire — alertes importantes",
      html: `<h1>Vos alertes</h1><ul>${items}</ul>`,
    }),
  });
  if (!mailResponse.ok) return json({ error: "email_provider_error" }, 502);

  return json({ sent: alerts.length });
});
