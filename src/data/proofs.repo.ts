import { supabase } from "@/integrations/supabase/client";
import { assertDossierOwner } from "@/services/dossier-ownership";

export async function requireOwnerForProofUpload(dossierId: string, userId: string): Promise<void> {
  const { data, error } = await supabase
    .from("dossiers")
    .select("id, user_id")
    .eq("id", dossierId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Dossier not found");
  assertDossierOwner(data, userId);
}

export async function uploadProof(params: {
  file: File;
  dossierId: string;
  userId: string;
  sectionKey?: string;
}): Promise<ReturnType<typeof import("@/data/proofs.repo").uploadProof>> {
  const { file, dossierId, userId, sectionKey } = params;
  await requireOwnerForProofUpload(dossierId, userId);
  const { uploadProof: uploadProofImpl } = await import("@/data/proofs.repo");
  return uploadProofImpl({ file, dossierId, userId, sectionKey });
}

export async function deleteProof(proof: { id: string; storage_path: string; uploaded_by: string; dossier_id: string }): Promise<void> {
  const { data, error } = await supabase
    .from("dossiers")
    .select("id, user_id")
    .eq("id", proof.dossier_id)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Dossier not found");

  const { data: sessionUser } = await supabase.auth.getUser();
  if (!sessionUser.user) throw new Error("Session required");
  assertDossierOwner(data, sessionUser.user.id);

  const { deleteProof: deleteProofImpl } = await import("@/data/proofs.repo");
  await deleteProofImpl(proof);
}
