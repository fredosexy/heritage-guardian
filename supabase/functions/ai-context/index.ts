import { authorizeAiRequest, corsHeaders, json, preflight } from "../_shared/security.ts";

interface SafeDossierProjection {
  dossier_type: string;
  status: string;
  completion_band: "low" | "medium" | "high";
  has_location: boolean;
  has_description: boolean;
  proofs_count: number;
  participants_count: number;
}

function isSafeProjection(value: unknown): value is SafeDossierProjection {
  if (!value || typeof value !== "object") return false;
  const input = value as Record<string, unknown>;
  return (
    typeof input.dossier_type === "string" &&
    input.dossier_type.length > 0 &&
    input.dossier_type.length <= 40 &&
    typeof input.status === "string" &&
    input.status.length > 0 &&
    input.status.length <= 40 &&
    ["low", "medium", "high"].includes(String(input.completion_band)) &&
    typeof input.has_location === "boolean" &&
    typeof input.has_description === "boolean" &&
    Number.isInteger(input.proofs_count) &&
    Number(input.proofs_count) >= 0 &&
    Number(input.proofs_count) <= 10_000 &&
    Number.isInteger(input.participants_count) &&
    Number(input.participants_count) >= 0 &&
    Number(input.participants_count) <= 10_000
  );
}

Deno.serve(async (req) => {
  const preflightResponse = preflight(req);
  if (preflightResponse) return preflightResponse;
  if (req.method !== "POST") return json(req, { error: "method_not_allowed" }, 405);

  try {
    const authorization = await authorizeAiRequest(req);
    if (authorization === "unauthorized") return json(req, { error: "unauthorized" }, 401);
    if (authorization === "rate_limited") return json(req, { error: "rate_limit" }, 429);

    const body = await req.json();
    const projection = body?.projection;
    if (!isSafeProjection(projection)) {
      return json(req, { error: "invalid_input" }, 400);
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const prompt = `À partir uniquement de cette projection minimale, propose 2 actions prudentes et concrètes à l'utilisateur. N'invente aucun fait et ne tire aucune conclusion juridique.

Projection :
- Type de dossier : ${projection.dossier_type}
- Statut interne : ${projection.status}
- Niveau de complétude : ${projection.completion_band}
- Localisation renseignée : ${projection.has_location ? "oui" : "non"}
- Description renseignée : ${projection.has_description ? "oui" : "non"}
- Nombre de documents/preuves : ${projection.proofs_count}
- Nombre de participants : ${projection.participants_count}

Contraintes :
- Ne cite aucun nom, adresse ou contenu de document.
- Ne certifie aucun droit.
- Distingue clairement une action de préparation d'une formalisation officielle.
- Réponds en français, phrases courtes.`;

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
            description: "Return 2 safe concrete actions",
            parameters: {
              type: "object",
              properties: {
                suggestions: {
                  type: "array",
                  items: { type: "string", maxLength: 280 },
                  minItems: 1,
                  maxItems: 3,
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
      console.error("ai-context error:", response.status);
      return json(req, { suggestions: [] });
    }

    const data = await response.json();
    const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    const parsed = args ? JSON.parse(args) : { suggestions: [] };
    const suggestions = Array.isArray(parsed.suggestions)
      ? parsed.suggestions.filter((item: unknown) => typeof item === "string").slice(0, 3)
      : [];

    return new Response(JSON.stringify({ suggestions }), {
      headers: { ...corsHeaders(req), "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-context error:", e);
    return json(req, { suggestions: [] });
  }
});
