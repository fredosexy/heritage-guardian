import { supabase } from "@/integrations/supabase/client";
import type { Dossier } from "@/core/types/domain";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export class AiUnavailableError extends Error {
  constructor(public reason: "rate_limit" | "credits" | "unknown") {
    super(reason);
  }
}

/** Contextual suggestions for a dossier (2-3 concrete next actions). */
export async function fetchDossierSuggestions(params: {
  dossier: Dossier;
  proofsCount: number;
  participantsCount: number;
}): Promise<string[]> {
  const { data, error } = await supabase.functions.invoke("ai-context", {
    body: {
      dossier: params.dossier,
      proofs_count: params.proofsCount,
      participants_count: params.participantsCount,
    },
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
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: params.messages, language: params.language }),
    }
  );

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
