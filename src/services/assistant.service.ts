import { supabase } from "@/integrations/supabase/client";
import type { Dossier } from "@/core/types/domain";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface SafeDossierProjection {
  dossier_type: string;
  status: string;
  completion_band: "low" | "medium" | "high";
  has_location: boolean;
  has_description: boolean;
  proofs_count: number;
  participants_count: number;
}

export class AiUnavailableError extends Error {
  constructor(public reason: "unauthorized" | "rate_limit" | "credits" | "unknown") {
    super(reason);
  }
}

export function buildSafeDossierProjection(params: {
  dossier: Dossier;
  proofsCount: number;
  participantsCount: number;
}): SafeDossierProjection {
  const completionScore = Number(params.dossier.completion_score ?? 0);
  const completion_band: SafeDossierProjection["completion_band"] =
    completionScore >= 75 ? "high" : completionScore >= 40 ? "medium" : "low";

  return {
    dossier_type: String(params.dossier.type),
    status: String(params.dossier.status),
    completion_band,
    has_location: Boolean(params.dossier.location_name),
    has_description: Boolean(params.dossier.description?.trim()),
    proofs_count: Math.max(0, params.proofsCount),
    participants_count: Math.max(0, params.participantsCount),
  };
}

/** Contextual suggestions based only on a deliberately minimized projection. */
export async function fetchDossierSuggestions(params: {
  dossier: Dossier;
  proofsCount: number;
  participantsCount: number;
}): Promise<string[]> {
  const projection = buildSafeDossierProjection(params);
  const { data, error } = await supabase.functions.invoke("ai-context", {
    body: { projection },
  });
  if (error) return [];
  return (data?.suggestions as string[] | undefined) ?? [];
}

/** Streams the assistant answer, calling onDelta for each new chunk of text. */
export async function streamChat(params: {
  messages: ChatMessage[];
  language: string;
  onDelta: (fullText: string) => void;
}): Promise<void> {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  if (!accessToken) throw new AiUnavailableError("unauthorized");

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ messages: params.messages, language: params.language }),
    }
  );

  if (response.status === 401) throw new AiUnavailableError("unauthorized");
  if (response.status === 429) throw new AiUnavailableError("rate_limit");
  if (response.status === 402) throw new AiUnavailableError("credits");
  if (!response.ok || !response.body) throw new AiUnavailableError("unknown");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let newline: number;
    while ((newline = buffer.indexOf("\n")) !== -1) {
      let line = buffer.slice(0, newline);
      buffer = buffer.slice(newline + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (!line.startsWith("data: ")) continue;
      const payload = line.slice(6).trim();
      if (payload === "[DONE]") continue;
      try {
        const parsed = JSON.parse(payload);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) {
          text += delta;
          params.onDelta(text);
        }
      } catch {
        buffer = line + "\n" + buffer;
        break;
      }
    }
  }
}
