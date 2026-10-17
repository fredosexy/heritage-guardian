import { corsHeaders } from "@supabase/supabase-js/cors";
import { authorizeAiRequest } from "../_shared/ai-security.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const authorization = await authorizeAiRequest(req, "ai-chat", 12);
  if ("response" in authorization) return authorization.response;

  try {
    const body = await req.json();
    const messages = body?.messages;
    const language = typeof body?.language === "string" && body.language.toLowerCase().startsWith("fr")
      ? "fr"
      : "en";

    if (!Array.isArray(messages) || messages.length < 1 || messages.length > 20) {
      return new Response(JSON.stringify({ error: "invalid_messages" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let totalCharacters = 0;
    const safeMessages: Array<{ role: "user" | "assistant"; content: string }> = [];
    for (const message of messages) {
      if (
        !message ||
        (message.role !== "user" && message.role !== "assistant") ||
        typeof message.content !== "string" ||
        message.content.trim().length === 0 ||
        message.content.length > 4000
      ) {
        return new Response(JSON.stringify({ error: "invalid_message" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      totalCharacters += message.content.length;
      if (totalCharacters > 12000) {
        return new Response(JSON.stringify({ error: "message_limit_exceeded" }), {
          status: 413,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      safeMessages.push({ role: message.role, content: message.content });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(JSON.stringify({ error: "service_unavailable" }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
- Always action-oriented: suggest one concrete next step.
- Empathetic, human, never condescending.
- If an official procedure (notary, town hall, court) is needed, explain it simply.
- You are not a lawyer; recommend consulting an expert for important legal decisions.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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

    if (response.status === 429) return new Response(JSON.stringify({ error: "rate_limit" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (response.status === 402) return new Response(JSON.stringify({ error: "credits" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (!response.ok) {
      console.error("AI gateway error:", response.status);
      return new Response(JSON.stringify({ error: "ai_error" }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(response.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" } });
  } catch (error) {
    console.error("ai-chat request failed:", error instanceof Error ? error.message : "unknown");
    return new Response(JSON.stringify({ error: "invalid_request" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
