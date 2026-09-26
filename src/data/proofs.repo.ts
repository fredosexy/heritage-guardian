import { supabase } from "@/integrations/supabase/client";
import type { Document, DocumentVersion, Proof } from "@/core/types/domain";
import { createPendingDocumentIds, getDocumentCoverage, sha256, validateDocumentFile, type DocumentCoverage } from "@/services/document-service";

const BUCKET = "dossier-proofs";

export interface DocumentWithCurrentVersion extends Document {
  current_version?: DocumentVersion | null;
}

export interface UploadDocumentInput {
  file: File;
  dossierId: string;
  bienId?: string | null;
  userId: string;
  documentType: string;
  title: string;
  sourceType?: "declaration" | "utilisateur" | "accompagnateur";
  providedBy?: string | null;
  documentId?: string;
  clientOperationId?: string;
}

export async function getDocumentsForDossier(dossierId: string): Promise<Document[]> {
  const { data, error } = await supabase.from("proofs").select("*").eq("dossier_id", dossierId).is("archived_at", null).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export const listProofs = getDocumentsForDossier;

export async function getDocument(id: string): Promise<Document | null> {
  const { data, error } = await supabase.from("proofs").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function getDocumentVersions(documentId: string): Promise<DocumentVersion[]> {
  const { data, error } = await supabase.from("document_versions").select("*").eq("document_id", documentId).order("version_number", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getCurrentVersion(document: Pick<Document, "current_version_id">): Promise<DocumentVersion | null> {
  if (!document.current_version_id) return null;
  const { data, error } = await supabase.from("document_versions").select("*").eq("id", document.current_version_id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function uploadDocument(input: UploadDocumentInput): Promise<Document> {
  const validationError = validateDocumentFile(input.file);
  if (validationError) throw new Error(validationError);
  const generated = createPendingDocumentIds();
  const documentId = input.documentId ?? generated.documentId;
  const versionId = generated.versionId;
  const operationId = input.clientOperationId ?? generated.clientOperationId;
  const storagePath = `dossiers/${input.dossierId}/documents/${documentId}/${versionId}`;
  const checksum = await sha256(input.file);
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(storagePath, input.file, { contentType: input.file.type, upsert: false });
  if (uploadError) throw uploadError;
  const { error } = await supabase.rpc("register_document_version", {
    p_document_id: documentId, p_version_id: versionId, p_dossier_id: input.dossierId, p_bien_id: input.bienId ?? null,
    p_document_type: input.documentType, p_title: input.title, p_source_type: input.sourceType ?? "utilisateur",
    p_storage_path: storagePath, p_mime_type: input.file.type, p_size_bytes: input.file.size, p_checksum: checksum,
    p_provided_by: input.providedBy ?? null, p_client_operation_id: operationId,
  });
  if (error) {
    await supabase.storage.from(BUCKET).remove([storagePath]);
    throw error;
  }
  const document = await getDocument(documentId);
  if (!document) throw new Error("document_not_found_after_upload");
  return document;
}

export async function addDocumentVersion(document: Document, file: File, userId: string, providedBy?: string | null) {
  return uploadDocument({
    file, dossierId: document.dossier_id, bienId: document.bien_id, userId, documentId: document.id,
    documentType: document.document_type, title: document.title ?? file.name, sourceType: document.source_type as "declaration" | "utilisateur" | "accompagnateur",
    providedBy, clientOperationId: undefined,
  });
}

export async function getDocumentUrl(storagePath: string): Promise<string | null> {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(storagePath, 60 * 10);
  if (error) throw error;
  return data?.signedUrl ?? null;
}
export const getProofUrl = getDocumentUrl;

export async function archiveDocument(documentId: string): Promise<void> {
  const { error } = await supabase.rpc("archive_document", { p_document_id: documentId });
  if (error) throw error;
}

export async function renameProof(documentId: string, title: string): Promise<void> {
  const { error } = await supabase.rpc("rename_document", { p_document_id: documentId, p_title: title });
  if (error) throw error;
}

export async function deleteProof(proof: Pick<Proof, "id">): Promise<void> {
  await archiveDocument(proof.id);
}

export async function getDocumentCoverageForStep(dossierId: string, procedureStepId: string): Promise<DocumentCoverage> {
  const [{ data: step, error: stepError }, documents] = await Promise.all([
    supabase.from("procedure_steps").select("required_document_types").eq("id", procedureStepId).maybeSingle(),
    getDocumentsForDossier(dossierId),
  ]);
  if (stepError) throw stepError;
  return getDocumentCoverage(step?.required_document_types ?? [], documents);
}

export async function getCurrentDocumentCoverage(dossierId: string): Promise<DocumentCoverage | null> {
  const { data, error } = await supabase.from("dossier_steps").select("procedure_step_id").eq("dossier_id", dossierId).in("status", ["en_cours", "bloquee", "a_verifier"]).order("step_order").limit(1).maybeSingle();
  if (error) throw error;
  return data?.procedure_step_id ? getDocumentCoverageForStep(dossierId, data.procedure_step_id) : null;
}

export async function listUserProofs(userId: string): Promise<(Proof & { dossier_title?: string | null })[]> {
  const { data, error } = await supabase.from("proofs").select("*, dossiers(title)").eq("created_by", userId).is("archived_at", null).order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(({ dossiers, ...proof }) => ({ ...proof, dossier_title: (dossiers as { title: string } | null)?.title ?? null }));
}

export async function countProofsByDossier(userId: string): Promise<Record<string, number>> {
  const { data, error } = await supabase.from("proofs").select("dossier_id").eq("created_by", userId).is("archived_at", null);
  if (error) throw error;
  const result: Record<string, number> = {};
  for (const row of data ?? []) result[row.dossier_id] = (result[row.dossier_id] ?? 0) + 1;
  return result;
}

/** Compatibility wrapper for the former proof upload flow. */
export async function uploadProof(params: { file: File; dossierId: string; userId: string }): Promise<Proof> {
  return uploadDocument({ ...params, documentType: params.file.type.startsWith("image/") ? "photo" : "autre", title: params.file.name });
}
