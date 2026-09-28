import { supabase } from "@/integrations/supabase/client";
import { runOrQueueVoid } from "./offline/command-client";
import type {
  AccompanimentPreference,
  AssistanceLevel,
  AudioPreference,
  InterfaceLevel,
  UsageContext,
  UsagePreferences,
} from "@/core/types/domain";

export type UsagePreferencesPatch = Partial<{
  context_type: UsageContext;
  assistance_level: AssistanceLevel;
  interface_level: InterfaceLevel;
  audio_preference: AudioPreference;
  accompaniment_preference: AccompanimentPreference;
}>;

export async function getUsagePreferences(userId: string): Promise<UsagePreferences | null> {
  const { data, error } = await supabase
    .from("usage_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}

export async function updateUsagePreferences(
  userId: string,
  patch: UsagePreferencesPatch,
): Promise<UsagePreferences> {
  let updated: UsagePreferences | null = null;
  const queued = await runOrQueueVoid({
    principalId: userId,
    targetDomain: "IDENTITY",
    commandName: "UPDATE_USAGE_PREFERENCES",
    aggregateId: userId,
    payload: patch as Record<string, unknown>,
  }, async () => {
    const { data, error } = await supabase
      .from("usage_preferences")
      .upsert({ user_id: userId, ...patch }, { onConflict: "user_id" })
      .select()
      .single();
    if (error) throw error;
    updated = data;
  });
  if (updated) return updated;
  if (queued) {
    return {
      user_id: userId,
      context_type: patch.context_type ?? "urbain",
      assistance_level: patch.assistance_level ?? "autonome",
      interface_level: patch.interface_level ?? "standard",
      audio_preference: patch.audio_preference ?? "optionnel",
      accompaniment_preference: patch.accompaniment_preference ?? "seul",
      updated_at: new Date().toISOString(),
    } as UsagePreferences;
  }
  throw new Error("usage_preferences_update_failed");
}
