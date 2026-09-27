import { authenticateRequest, json, preflight } from "../_shared/security.ts";

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
  const preflightResponse = preflight(req);
  if (preflightResponse) return preflightResponse;
  if (req.method !== "POST") return json(req, { error: "method_not_allowed" }, 405);

  const authenticated = await authenticateRequest(req);
  if (!authenticated?.user.email) return json(req, { error: "unauthorized" }, 401);

  const resendKey = Deno.env.get("RESEND_API_KEY");
  const emailFrom = Deno.env.get("ALERT_EMAIL_FROM");
  if (!resendKey || !emailFrom) {
    return json(req, { error: "service_not_configured" }, 503);
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return json(req, { error: "invalid_json" }, 400);
  }

  const alertIds = (payload as { alertIds?: unknown })?.alertIds;
  if (!Array.isArray(alertIds) || alertIds.length === 0 || alertIds.length > 20 ||
      alertIds.some((id) => typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id))) {
    return json(req, { error: "invalid_alert_ids" }, 400);
  }

  // RLS guarantees that only alerts owned by the authenticated user are returned.
  const { data: alerts, error: alertsError } = await authenticated.client
    .from("alerts")
    .select("id,title,message,severity")
    .in("id", alertIds)
    .is("email_sent_at", null);

  if (alertsError) return json(req, { error: "alerts_unavailable" }, 500);
  if (!alerts?.length) return json(req, { sent: 0 });

  const items = alerts.map((alert) =>
    `<li><strong>${escapeHtml(alert.title)}</strong><br>${escapeHtml(alert.message)}</li>`
  ).join("");

  const mailResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: emailFrom,
      to: [authenticated.user.email],
      subject: "Mémoire — alertes importantes",
      html: `<h1>Vos alertes</h1><ul>${items}</ul>`,
    }),
  });

  if (!mailResponse.ok) return json(req, { error: "email_provider_error" }, 502);

  return json(req, { sent: alerts.length });
});
