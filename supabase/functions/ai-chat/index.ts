import { corsHeaders } from "@supabase/supabase-js/cors";

const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };
const MAX_MESSAGES = 30;
const MAX_MESSAGE_LENGTH = 8_000;
const MAX_TOTAL_LENGTH = 24_000;

function errorResponse(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), { status, headers: jsonHeaders });
}

async function readJsonBody(req: Request, maxBytes: number): Promise<
  { kind: "ok"; value: unknown } | { kind: "too_large" } | { kind: "invalid" }
> {
  const declaredLength = Number(req.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) return { kind: "too_large" };
  if (!req.body) return { kind: "invalid" };

  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel();
        return { kind: "too_large" };
      }
      chunks.push(value);
    }
  } catch {
    return { kind: "invalid" };
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return { kind: "ok", value: JSON.parse(new TextDecoder().decode(bytes)) };
  } catch {
    return { kind: "invalid" };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return errorResponse("method_not_allowed", 405);

  const parsedBody = await readJsonBody(req, 131072);
  if (parsedBody.kind === "too_large") return errorResponse("request_too_large", 413);
  if (parsedBody.kind === "invalid") return errorResponse("invalid_json", 400);
  const payload = parsedBody.value;

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return errorResponse("invalid_payload", 400);
  }

  const body = payload as { messages?: unknown; language?: unknown };
  if (!Array.isArray(body.messages) || body.messages.length < 1 || body.messages.length > MAX_MESSAGES) {
    return errorResponse("invalid_messages", 400);
  }

  let totalLength = 0;
  const messages: Array<{ role: "user" | "assistant"; content: string }> = [];
  for (const item of body.messages) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return errorResponse("invalid_message", 400);
    }
    const message = item as { role?: unknown; content?: unknown };
    if (
      (message.role !== "user" && message.role !== "assistant") ||
      typeof message.content !== "string" ||
      message.content.trim().length === 0 ||
      message.content.length > MAX_MESSAGE_LENGTH
    ) {
      return errorResponse("invalid_message", 400);
    }
    totalLength += message.content.length;
    if (totalLength > MAX_TOTAL_LENGTH) return errorResponse("messages_too_large", 413);
    messages.push({ role: message.role, content: message.content });
  }

  const language = typeof body.language === "string" && body.language.length <= 20
    ? body.language
    : "fr";
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    console.error("ai-chat configuration error: LOVABLE_API_KEY missing");
    return errorResponse("service_unavailable", 503);
  }

  const systemPrompt = language.startsWith("fr") ? `Tu es l'assistant Mémoire, un guide patrimonial bienveillant et concret pour les utilisateurs africains. Tu aides à sécuriser des terres, organiser des héritages, et enregistrer des volontés.

Règles :
- Réponses courtes (max 3-4 phrases), claires, sans jargon juridique.
- Toujours orienté action : suggère une étape concrète à chaque réponse.
- Empathique, humain, jamais condescendant.
- Si une démarche officielle est nécessaire (notaire, mairie, tribunal), explique-la simplement.
- Tu n'es pas avocat, mais tu vulgarises. Recommande de consulter un expert pour les décisions juridiques importantes.` : `You are Mémoire Assistant, a caring and practical heritage guide for African users. You help secure land, organize inheritance, and record wills.

Rules:
- Short answers (max 3-4 sentences), clear, no legal jargon.
- Always action-oriented: suggest one concrete next step.
- Empathetic, human, never condescending.
- If an official procedure (notary, town hall, court) is needed, explain it simply.
- You are not a lawyer; recommend consulting an expert for important legal decisions.`;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream: true,
      }),
    });

    if (response.status === 429) return errorResponse("rate_limit", 429);
    if (response.status === 402) return errorResponse("credits", 402);
    if (!response.ok) {
      console.error("AI gateway error:", response.status);
      return errorResponse("ai_error", 502);
    }

    return new Response(response.body, {
      status: response.status,
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("ai-chat upstream request failed:", error instanceof Error ? error.name : "unknown");
    return errorResponse("ai_error", 502);
  }
});
