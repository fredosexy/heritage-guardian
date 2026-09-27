import { authorizeAiRequest, corsHeaders, json, preflight } from "../_shared/security.ts";

Deno.serve(async (req) => {
  const preflightResponse = preflight(req);
  if (preflightResponse) return preflightResponse;
  if (req.method !== "POST") return json(req, { error: "method_not_allowed" }, 405);

  try {
    const authorization = await authorizeAiRequest(req);
    if (authorization === "unauthorized") return json(req, { error: "unauthorized" }, 401);
    if (authorization === "rate_limited") return json(req, { error: "rate_limit" }, 429);

    const { messages, language = "fr" } = await req.json();
    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 20 ||
        !["fr", "en"].includes(String(language).slice(0, 2)) ||
        messages.some((message) =>
          !message || !["user", "assistant"].includes(message.role) ||
          typeof message.content !== "string" || message.content.length < 1 || message.content.length > 2_000
        ) || messages.reduce((sum, message) => sum + message.content.length, 0) > 8_000) {
      return json(req, { error: "invalid_input" }, 400);
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const systemPrompt = language.startsWith("fr") ? `Tu es Vita, l'assistant conversationnel de Heritage Guardian. Tu aides l'utilisateur à comprendre sa situation patrimoniale sans inventer de fait ni de droit.

Règles :
- Réponses courtes, claires et sans jargon inutile.
- Distingue toujours déclaration, document, vérification, formalisation et effet juridique externe.
- Ne certifie jamais la propriété, la qualité d'héritier ou l'issue d'un conflit.
- N'affirme jamais qu'une démarche officielle est accomplie si le système ne l'a pas confirmée.
- Pour une action sensible, prépare l'étape suivante mais demande une confirmation humaine explicite avant toute mutation.
- Si une information manque, dis-le clairement au lieu de la déduire.
- Les professionnels et autorités restent responsables de leurs décisions propres.` : `You are Vita, the conversational assistant for Heritage Guardian. Help users understand patrimonial situations without inventing facts or legal effects.

Rules:
- Keep answers short and clear.
- Always distinguish declarations, documents, verification, formalization, and external legal effect.
- Never certify ownership, heir status, or conflict outcomes.
- Never claim an official procedure is complete unless the system confirms it.
- For sensitive actions, prepare the next step but require explicit human confirmation before mutation.
- If information is missing, say so instead of inferring it.
- Professionals and authorities remain responsible for their own decisions.`;

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

    if (response.status === 429) return json(req, { error: "rate_limit" }, 429);
    if (response.status === 402) return json(req, { error: "credits" }, 402);
    if (!response.ok) {
      console.error("AI gateway error:", response.status);
      return json(req, { error: "ai_error" }, 500);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders(req), "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-chat error:", e);
    return json(req, { error: "internal_error" }, 500);
  }
});
