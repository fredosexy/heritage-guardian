import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/core/types/domain";

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error) throw error;
  return data ?? null;
}

export async function updateProfile(
  userId: string,
  patch: Partial<Pick<Profile, "full_name" | "phone" | "language" | "theme" | "avatar_url">>
): Promise<void> {
  const { error } = await supabase.from("profiles").update(patch).eq("id", userId);
  if (error) throw error;
}

export async function completeOnboarding(
  userId: string,
  answers: Record<string, boolean>
): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({ onboarding_completed: true, onboarding_answers: answers })
    .eq("id", userId);
  if (error) throw error;
}
