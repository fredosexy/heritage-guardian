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
