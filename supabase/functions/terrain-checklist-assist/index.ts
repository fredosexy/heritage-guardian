import { generateResponse, GatewayError } from "npm:@lovable.dev/ai-gateway@0.1.11";
import { corsHeaders } from "../_shared/cors.ts";
import { authorizeAiRequest } from "../_shared/ai-security.ts";
import { readBoundedJsonBody } from "../_shared/request-body.ts";
import { buildTerrainChecklist, terrainSectionsFromMetadata } from "../_shared/terrain-checklist.ts";

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });

  // Shares the "ai-context" rate-limit bucket (the server only accepts known names).
  const auth = await authorizeAiRequest(req, "ai-context", 30);
  if ("response" in auth) return auth.response;

  const body = await readBoundedJsonBody(req, 4 * 1024);
  const dossierId = body.kind === "ok" ? (body.value as { dossierId?: unknown })?.dossierId : undefined;
  const language = body.kind === "ok" && (body.value as { language?: unknown })?.language === "en" ? "en" : "fr";
  if (typeof dossierId !== "string" || !UUID.test(dossierId)) return json(400, { error: "invalid_dossier" });

  const { data: dossier, error } = await auth.userClient
    .from("dossiers").select("id, user_id, type, title, location_name, description, metadata")
    .eq("id", dossierId).maybeSingle();
  if (error) return json(500, { error: "load_failed" });
  if (!dossier) return json(404, { error: "dossier_not_found" });
  if (dossier.user_id !== auth.user.id) return json(403, { error: "owner_only" });
  if (dossier.type !== "terrain") return json(400, { error: "not_terrain" });

  const { data: proofs, error: proofsError } = await auth.userClient
    .from("proofs").select("title, metadata").eq("dossier_id", dossierId);
  if (proofsError) return json(500, { error: "load_failed" });

  const sections = terrainSectionsFromMetadata(dossier.metadata);
  const checklist = buildTerrainChecklist(sections, proofs ?? []);

  const lines = checklist.map((item) => {
    const text = typeof sections[item.key] === "string" ? String(sections[item.key]).slice(0, 600) : "";
    return `- ${item.key}: info=${text ? JSON.stringify(text) : "absente"}; pièces=${item.proofCount}`;
  }).join("\n");

  const prompt = `Dossier Terrain "${String(dossier.title).slice(0, 200)}" (${dossier.location_name ? String(dossier.location_name).slice(0, 200) : "lieu non renseigné"}).
Checklist par section (texte saisi et nombre de pièces jointes) :
${lines}

Tâche : résume en 2 à 3 phrases simples l'état du dossier, puis liste au plus 6 informations ou pièces concrètes à compléter, en partant des sections vides ou sans pièce.
Règles strictes : ne te prononce JAMAIS sur la validité, l'authenticité ou la valeur juridique d'un document ou d'une propriété ; ne dis pas qu'un document "prouve" quoi que ce soit ; pas de score. Rappelle que seul un professionnel (notaire, conservation foncière) peut vérifier les pièces.
Réponds en ${language === "en" ? "anglais" : "français"}, ton humain et bienveillant. Return JSON.`;

  try {
    const response = await generateResponse({
      model: "openai/gpt-6-astra",
      input: [{ role: "user", content: prompt }],
      text: {
        format: {
          type: "json_schema",
          name: "terrain_checklist_review",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              summary: { type: "string" },
              toComplete: { type: "array", items: { type: "string" } },
            },
            required: ["summary", "toComplete"],
          },
        },
      },
    });

    let raw = "";
    for (const item of (response as { output?: unknown[] }).output ?? []) {
      const content = (item as { content?: unknown[] }).content ?? [];
      for (const c of content) {
        const part = c as { type?: string; text?: string };
        if (part.type === "output_text" && typeof part.text === "string") raw += part.text;
      }
    }
    const parsed = JSON.parse(raw || "{}") as { summary?: unknown; toComplete?: unknown };
    const summary = typeof parsed.summary === "string" ? parsed.summary.trim().slice(0, 1200) : "";
    const toComplete = Array.isArray(parsed.toComplete)
      ? parsed.toComplete.filter((s): s is string => typeof s === "string" && s.trim().length > 1).map((s) => s.trim().slice(0, 300)).slice(0, 6)
      : [];
    return json(200, { checklist, summary, toComplete });
  } catch (err) {
    if (err instanceof GatewayError) {
      console.error("terrain-checklist-assist gateway error:", err.code, err.httpStatus);
      const status = err.httpStatus === 429 ? 429 : err.httpStatus === 402 ? 402 : 502;
      return json(status, { error: status === 429 ? "rate_limit" : status === 402 ? "credits" : "ai_unavailable", checklist });
    }
    console.error("terrain-checklist-assist failed:", err instanceof Error ? err.message : "unknown");
    return json(502, { error: "ai_unavailable", checklist });
  }
});
