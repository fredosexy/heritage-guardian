import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/core/types/domain";

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error) throw error;
  return data ?? null;
}

export async function updateProfile(
  userId: string,
  patch: Partial<Pick<Profile, "full_name" | "phone" | "language" | "theme" | "avatar_url" | "email_alerts">>
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

const AVATAR_BUCKET = "avatars";

/** Téléverse (et remplace) la photo de profil dans le dossier privé de l'utilisateur. */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${userId}/avatar.${extension}`;
  const { error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw error;
  await updateProfile(userId, { avatar_url: path });
  return path;
}

/** Lien temporaire pour afficher la photo de profil (stockage privé). */
export async function getAvatarUrl(storagePath: string): Promise<string | null> {
  const { data } = await supabase.storage.from(AVATAR_BUCKET).createSignedUrl(storagePath, 60 * 60);
  return data?.signedUrl ?? null;
}

export async function removeAvatar(userId: string, storagePath: string): Promise<void> {
  await supabase.storage.from(AVATAR_BUCKET).remove([storagePath]);
  await updateProfile(userId, { avatar_url: null });
}
