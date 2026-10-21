import { corsHeaders } from "@supabase/supabase-js/cors";
import { authorizeAiRequest } from "../_shared/ai-security.ts";
import { readBoundedJsonBody } from "../_shared/request-body.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const authorization = await authorizeAiRequest(req, "ai-context", 30);
  if ("response" in authorization) return authorization.response;

  const parsedBody = await readBoundedJsonBody(req, 16 * 1024);
  if (parsedBody.kind === "too_large") {
    return new Response(JSON.stringify({ error: "request_too_large" }), {
      status: 413,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (parsedBody.kind === "invalid" || !parsedBody.value || typeof parsedBody.value !== "object" || Array.isArray(parsedBody.value)) {
    return new Response(JSON.stringify({ error: "invalid_request" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = parsedBody.value as { dossier?: { id?: unknown } };
    const dossierId = body?.dossier?.id;
    if (typeof dossierId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(dossierId)) {
      return new Response(JSON.stringify({ error: "invalid_dossier" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: dossier, error: dossierError } = await authorization.userClient
      .from("dossiers")
      .select("id, user_id, type, title, status, location_name, description")
      .eq("id", dossierId)
      .maybeSingle();

    if (dossierError) {
      console.error("Could not load dossier context:", dossierError.message);
      return new Response(JSON.stringify({ suggestions: [] }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!dossier) {
      return new Response(JSON.stringify({ error: "dossier_not_found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const [proofsResult, participantsResult] = await Promise.all([
      authorization.userClient
        .from("proofs")
        .select("id", { count: "exact", head: true })
        .eq("dossier_id", dossierId),
      dossier.user_id === authorization.user.id
        ? authorization.userClient
            .from("participants")
            .select("id", { count: "exact", head: true })
            .eq("dossier_id", dossierId)
        : Promise.resolve({ count: null, error: null }),
    ]);

    if (proofsResult.error || participantsResult.error) {
      console.error("Could not load dossier counts");
      return new Response(JSON.stringify({ suggestions: [] }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(JSON.stringify({ suggestions: [] }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = `Analyse ce dossier patrimonial et propose 2 actions concrètes que l'utilisateur peut faire MAINTENANT pour le sécuriser.

Dossier :
- Type : ${dossier.type}
- Titre : ${String(dossier.title).slice(0, 200)}
- Statut : ${dossier.status}
- Localisation : ${dossier.location_name ? String(dossier.location_name).slice(0, 200) : "non renseignée"}
- Description : ${dossier.description ? String(dossier.description).slice(0, 1000) : "aucune"}
- Nombre de preuves enregistrées : ${proofsResult.count ?? 0}
- Nombre de participants : ${participantsResult.count === null ? "non disponible" : participantsResult.count}

Ne donne aucun score ni pourcentage. Réponds en français, phrases courtes, ton humain et bienveillant.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
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
                  items: { type: "string", minLength: 2, maxLength: 300 },
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
      console.error("ai-context gateway error:", response.status);
      return new Response(JSON.stringify({ suggestions: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    const parsed = args ? JSON.parse(args) : { suggestions: [] };
    const suggestions = Array.isArray(parsed.suggestions)
      ? parsed.suggestions
          .filter((item: unknown): item is string => typeof item === "string" && item.trim().length >= 2)
          .map((item: string) => item.trim().slice(0, 300))
          .slice(0, 3)
      : [];

    return new Response(JSON.stringify({ suggestions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("ai-context request failed:", error instanceof Error ? error.message : "unknown");
    return new Response(JSON.stringify({ suggestions: [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
