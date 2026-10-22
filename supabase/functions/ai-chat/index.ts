import { corsHeaders } from "../_shared/cors.ts";
import { authorizeAiRequest } from "../_shared/ai-security.ts";
import { readBoundedJsonBody } from "../_shared/request-body.ts";

const MAX_BODY_BYTES = 20_000;

function jsonResponse(status: number, error: string): Response {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse(405, "method_not_allowed");

  const authorization = await authorizeAiRequest(req, "ai-chat", 12);
  if ("response" in authorization) return authorization.response;

  const parsedBody = await readBoundedJsonBody(req, MAX_BODY_BYTES);
  if (parsedBody.kind === "too_large") return jsonResponse(413, "request_too_large");
  if (parsedBody.kind === "invalid") return jsonResponse(400, "invalid_request");
  if (!parsedBody.value || typeof parsedBody.value !== "object" || Array.isArray(parsedBody.value)) {
    return jsonResponse(400, "invalid_request");
  }
  const body = parsedBody.value as { messages?: unknown; language?: unknown };
  const messages = body.messages;
  const language = typeof body?.language === "string" && body.language.toLowerCase().startsWith("fr")
    ? "fr"
    : "en";

  if (!Array.isArray(messages) || messages.length < 1 || messages.length > 20) {
    return jsonResponse(400, "invalid_messages");
  }

  let totalCharacters = 0;
  const safeMessages: Array<{ role: "user" | "assistant"; content: string }> = [];
  for (const message of messages) {
    if (
      !message ||
      typeof message !== "object" ||
      !("role" in message) ||
      !("content" in message) ||
      (message.role !== "user" && message.role !== "assistant") ||
      typeof message.content !== "string" ||
      message.content.trim().length === 0 ||
      message.content.length > 4000
    ) {
      return jsonResponse(400, "invalid_message");
    }
    totalCharacters += message.content.length;
    if (totalCharacters > 12000) return jsonResponse(413, "message_limit_exceeded");
    safeMessages.push({ role: message.role, content: message.content });
  }

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    console.error("LOVABLE_API_KEY is not configured");
    return jsonResponse(503, "service_unavailable");
  }

  const systemPrompt = language === "fr" ? `Tu es l'assistant Mémoire, un guide patrimonial bienveillant et concret pour les utilisateurs africains. Tu aides à sécuriser des terres, organiser des héritages, et enregistrer des volontés.

Règles :
- Réponses courtes (max 3-4 phrases), claires, sans jargon juridique.
- Toujours orienté action : suggère une étape concrète à chaque réponse.
- Empathique, humain, jamais condescendant.
- Si une démarche officielle est nécessaire (notaire, mairie, tribunal), explique-la simplement.
- Tu n'es pas avocat, mais tu vulgarises. Recommande de consulter un expert pour les décisions juridiques importantes.` : `You are Mémoire Assistant, a caring and practical heritage guide for African users. You help secure land, organize inheritance, and record wills.

Rules:
- Short answers (max 3-4 sentences), clear, no legal jargon.
- Always action-oriented: suggest one concrete step in every answer.
- Empathetic, human, never condescending.
- If an official procedure (notary, town hall, court) is needed, explain it simply.
- You are not a lawyer; recommend consulting an expert for important legal decisions.`;

  let response: Response;
  try {
    response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: systemPrompt }, ...safeMessages],
        stream: true,
      }),
    });
  } catch (error) {
    console.error("AI gateway connection failed:", error instanceof Error ? error.message : "unknown");
    return jsonResponse(502, "ai_error");
  }

  if (response.status === 429) return jsonResponse(429, "rate_limit");
  if (response.status === 402) return jsonResponse(402, "credits");
  if (!response.ok || !response.body) {
    console.error("AI gateway returned an unsuccessful response:", response.status);
    return jsonResponse(502, "ai_error");
  }

  return new Response(response.body, {
    headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
  });
});
