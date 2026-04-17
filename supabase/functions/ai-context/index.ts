import { corsHeaders } from "@supabase/supabase-js/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { dossier, proofs_count, participants_count } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const prompt = `Analyse ce dossier patrimonial et propose 2 actions concrètes que l'utilisateur peut faire MAINTENANT pour le sécuriser.

Dossier :
- Type : ${dossier.type}
- Titre : ${dossier.title}
- Statut : ${dossier.status} (score ${dossier.completion_score}%)
- Localisation : ${dossier.location_name || "non renseignée"}
- Description : ${dossier.description || "aucune"}
- Nombre de preuves : ${proofs_count}
- Nombre de participants : ${participants_count}

Réponds en français, phrases courtes, ton humain et bienveillant.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: prompt }],
        tools: [{
          type: "function",
          function: {
            name: "suggest_actions",
            description: "Return 2 concrete actions",
            parameters: {
              type: "object",
              properties: {
                suggestions: {
                  type: "array",
                  items: { type: "string" },
                  minItems: 1, maxItems: 3,
                },
              },
              required: ["suggestions"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "suggest_actions" } },
      }),
    });

    if (!response.ok) {
      console.error("ai-context error:", response.status, await response.text());
      return new Response(JSON.stringify({ suggestions: [] }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const data = await response.json();
    const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    const parsed = args ? JSON.parse(args) : { suggestions: [] };
    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ suggestions: [] }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
