import { supabase } from "@/integrations/supabase/client";
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
  const { data, error } = await supabase
    .from("usage_preferences")
    .upsert({ user_id: userId, ...patch }, { onConflict: "user_id" })
    .select()
    .single();
  if (error) throw error;
  return data;
}
