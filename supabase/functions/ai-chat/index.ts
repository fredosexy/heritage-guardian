import { corsHeaders } from "@supabase/supabase-js/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, language = "fr" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

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

    if (response.status === 429) return new Response(JSON.stringify({ error: "rate_limit" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (response.status === 402) return new Response(JSON.stringify({ error: "credits" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "ai_error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(response.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
  } catch (e) {
    console.error("ai-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
