import { supabase } from "@/integrations/supabase/client";
import { assertDossierOwner } from "@/services/dossier-ownership";
import type { Proof, ProofType } from "@/core/types/domain";

const BUCKET = "dossier-proofs";

/** The file is already in Storage, but its database record still needs retrying. */
export class ProofPersistenceError extends Error {
  readonly storagePath: string;
  readonly cause: unknown;

  constructor(storagePath: string, cause: unknown) {
    const detail = cause instanceof Error ? cause.message : String(cause);
    super(`Proof file uploaded but record persistence failed: ${detail}`);
    this.name = "ProofPersistenceError";
    this.storagePath = storagePath;
    this.cause = cause;
  }
}

async function requireDossierOwnerForCurrentUser(dossierId: string): Promise<string> {
  const { data: sessionUser, error: sessionError } = await supabase.auth.getUser();
  if (sessionError) throw sessionError;
  if (!sessionUser.user) throw new Error("Session required");

  const { data, error } = await supabase
    .from("dossiers")
    .select("id, user_id")
    .eq("id", dossierId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Dossier not found");
  assertDossierOwner(data, sessionUser.user.id);
  return sessionUser.user.id;
}

async function requireCurrentUserMatches(userId: string): Promise<string> {
  const { data: sessionUser, error: sessionError } = await supabase.auth.getUser();
  if (sessionError) throw sessionError;
  if (!sessionUser.user) throw new Error("Session required");
  if (sessionUser.user.id !== userId) {
    throw new Error("Only the current user can access their own proof list");
  }
  return sessionUser.user.id;
}

export async function listProofs(dossierId: string): Promise<Proof[]> {
  const { data, error } = await supabase.from("proofs").select("*").eq("dossier_id", dossierId).order("created_at", { ascending: false });
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
  sectionKey?: string;
}): Promise<Proof> {
  const { file, dossierId, userId, sectionKey } = params;

  const { data: sessionUser, error: sessionError } = await supabase.auth.getUser();
  if (sessionError) throw sessionError;
  if (!sessionUser.user) throw new Error("Session required");
  if (sessionUser.user.id !== userId) throw new Error("Cannot upload a proof for another user");
  await requireDossierOwnerForCurrentUser(dossierId);

  const uploadId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const path = `${userId}/${dossierId}/${uploadId}-${file.name}`;
  const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file);
  if (upErr) throw upErr;

  const metadata = sectionKey ? { terrainSectionKey: sectionKey } : {};
  const { data, error } = await supabase.from("proofs").insert({
    dossier_id: dossierId,
    uploaded_by: userId,
    type: proofTypeForFile(file),
    title: file.name,
    storage_path: path,
    mime_type: file.type,
    size_bytes: file.size,
    metadata,
  }).select().single();

  if (error) throw new ProofPersistenceError(path, error);
  return data;
}

export async function getProofUrl(storagePath: string): Promise<string | null> {
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(storagePath, 60 * 10);
  return data?.signedUrl ?? null;
}

export async function listUserProofs(userId: string): Promise<(Proof & { dossier_title?: string | null })[]> {
  await requireCurrentUserMatches(userId);
  const { data, error } = await supabase.from("proofs").select("*, dossiers(title)").eq("uploaded_by", userId).order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(({ dossiers, ...proof }) => ({ ...proof, dossier_title: (dossiers as { title: string } | null)?.title ?? null }));
}

export async function renameProof(proofId: string, title: string): Promise<void> {
  const { data: proof, error: proofError } = await supabase.from("proofs").select("id, dossier_id").eq("id", proofId).maybeSingle();
  if (proofError) throw proofError;
  if (!proof) throw new Error("Proof not found");

  await requireDossierOwnerForCurrentUser(proof.dossier_id);

  const { error } = await supabase.from("proofs").update({ title }).eq("id", proofId);
  if (error) throw error;
}

export async function deleteProof(
  proof: Pick<Proof, "id" | "storage_path"> & { dossier_id?: string | null; uploaded_by?: string | null },
): Promise<void> {
  let dossierId = proof.dossier_id ?? null;
  if (!dossierId) {
    const { data: existing, error } = await supabase.from("proofs").select("dossier_id").eq("id", proof.id).maybeSingle();
    if (error) throw error;
    if (!existing) throw new Error("Proof not found");
    dossierId = existing.dossier_id;
  }

  if (!dossierId) throw new Error("Proof dossier missing");
  await requireDossierOwnerForCurrentUser(dossierId);

  const { error: storageError } = await supabase.storage.from(BUCKET).remove([proof.storage_path]);
  if (storageError) throw storageError;

  const { error } = await supabase.from("proofs").delete().eq("id", proof.id);
  if (error) throw error;
}

export async function countProofsByDossier(): Promise<Record<string, number>> {
  const { data, error } = await supabase.from("proofs").select("dossier_id");
  if (error) throw error;
  const out: Record<string, number> = {};
  for (const row of data ?? []) out[row.dossier_id] = (out[row.dossier_id] ?? 0) + 1;
  return out;
}
