export const DOCUMENT_TYPES = ["attestation","recu","photo","plan","piece_identite","titre_foncier","acte","declaration","proces_verbal","autre"] as const;
export const ALLOWED_DOCUMENT_MIME_TYPES = ["image/jpeg","image/png","image/webp","application/pdf","audio/mpeg","audio/mp4","video/mp4"] as const;
export const MAX_DOCUMENT_BYTES = 15 * 1024 * 1024;

export interface DocumentLike { document_type: string; verification_status: string; archived_at?: string | null; }
export interface DocumentCoverage { required: string[]; provided: string[]; missing: string[]; unverified: string[]; }

export function validateDocumentFile(file: Pick<File, "type" | "size">): string | null {
  if (!ALLOWED_DOCUMENT_MIME_TYPES.includes(file.type as typeof ALLOWED_DOCUMENT_MIME_TYPES[number])) return "unsupported_mime_type";
  if (file.size <= 0 || file.size > MAX_DOCUMENT_BYTES) return "invalid_file_size";
  return null;
}

export async function sha256(file: Blob): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hash = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function getDocumentCoverage(required: string[], documents: DocumentLike[]): DocumentCoverage {
  const active = documents.filter((document) => !document.archived_at && document.verification_status !== "archive");
  const provided = [...new Set(active.map((document) => document.document_type).filter((type) => required.includes(type)))];
  const verified = new Set(active.filter((document) => ["verifie","officiel"].includes(document.verification_status)).map((document) => document.document_type));
  return {
    required: [...required],
    provided,
    missing: required.filter((type) => !provided.includes(type)),
    unverified: provided.filter((type) => !verified.has(type)),
  };
}

export function createPendingDocumentIds() {
  return { documentId: crypto.randomUUID(), versionId: crypto.randomUUID(), clientOperationId: crypto.randomUUID() };
}
