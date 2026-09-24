import { authorizeAiRequest, corsHeaders, json } from "../_shared/security.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  try {
    const authorization = await authorizeAiRequest(req);
    if (authorization === "unauthorized") return json({ error: "unauthorized" }, 401);
    if (authorization === "rate_limited") return json({ error: "rate_limit" }, 429);

    const { dossier, proofs_count, participants_count } = await req.json();
    if (!dossier || typeof dossier !== "object" ||
        typeof dossier.type !== "string" || dossier.type.length > 40 ||
        typeof dossier.title !== "string" || dossier.title.length < 1 || dossier.title.length > 160 ||
        (dossier.description != null && (typeof dossier.description !== "string" || dossier.description.length > 2_000)) ||
        (dossier.location_name != null && (typeof dossier.location_name !== "string" || dossier.location_name.length > 200)) ||
        !Number.isInteger(proofs_count) || proofs_count < 0 || proofs_count > 10_000 ||
        !Number.isInteger(participants_count) || participants_count < 0 || participants_count > 10_000) {
      return json({ error: "invalid_input" }, 400);
    }
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
