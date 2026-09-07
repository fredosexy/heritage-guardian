import { supabase } from "@/integrations/supabase/client";
import type { Proof, ProofType } from "@/core/types/domain";

const BUCKET = "dossier-proofs";

export async function listProofs(dossierId: string): Promise<Proof[]> {
  const { data, error } = await supabase
    .from("proofs")
    .select("*")
    .eq("dossier_id", dossierId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export function proofTypeForFile(file: File): ProofType {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("audio/")) return "audio";
  return "document";
}

export async function uploadProof(params: {
  file: File;
  dossierId: string;
  userId: string;
}): Promise<Proof> {
  const { file, dossierId, userId } = params;
  const path = `${userId}/${dossierId}/${Date.now()}-${file.name}`;
  const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file);
  if (upErr) throw upErr;

  const { data, error } = await supabase
    .from("proofs")
    .insert({
      dossier_id: dossierId,
      uploaded_by: userId,
      type: proofTypeForFile(file),
      title: file.name,
      storage_path: path,
      mime_type: file.type,
      size_bytes: file.size,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getProofUrl(storagePath: string): Promise<string | null> {
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(storagePath, 60 * 10);
  return data?.signedUrl ?? null;
}

/** Tous les fichiers de l'utilisateur, tous dossiers confondus. */
export async function listUserProofs(userId: string): Promise<(Proof & { dossier_title?: string | null })[]> {
  const { data, error } = await supabase
    .from("proofs")
    .select("*, dossiers(title)")
    .eq("uploaded_by", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(({ dossiers, ...proof }) => ({
    ...proof,
    dossier_title: (dossiers as { title: string } | null)?.title ?? null,
  }));
}

export async function renameProof(proofId: string, title: string): Promise<void> {
  const { error } = await supabase.from("proofs").update({ title }).eq("id", proofId);
  if (error) throw error;
}

export async function deleteProof(proof: Pick<Proof, "id" | "storage_path">): Promise<void> {
  await supabase.storage.from(BUCKET).remove([proof.storage_path]);
  const { error } = await supabase.from("proofs").delete().eq("id", proof.id);
  if (error) throw error;
}

/** Nombre de preuves par dossier pour un utilisateur. */
export async function countProofsByDossier(userId: string): Promise<Record<string, number>> {
  const { data, error } = await supabase.from("proofs").select("dossier_id").eq("uploaded_by", userId);
  if (error) throw error;
  const out: Record<string, number> = {};
  for (const row of data ?? []) out[row.dossier_id] = (out[row.dossier_id] ?? 0) + 1;
  return out;
}
