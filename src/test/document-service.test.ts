import { describe, expect, it } from "vitest";
import { getDocumentCoverage, validateDocumentFile } from "@/services/document-service";

describe("document service", () => {
  it("rejects unsupported and oversized files", () => {
    expect(validateDocumentFile({ type: "text/html", size: 10 } as File)).toBe("unsupported_mime_type");
    expect(validateDocumentFile({ type: "application/pdf", size: 20 * 1024 * 1024 } as File)).toBe("invalid_file_size");
  });
  it("accepts a supported readable file", () => expect(validateDocumentFile({ type: "image/jpeg", size: 1024 } as File)).toBeNull());
  it("reports provided, missing and unverified documents", () => {
    expect(getDocumentCoverage(["piece_identite","acte"], [
      { document_type: "piece_identite", verification_status: "fourni" },
      { document_type: "photo", verification_status: "verifie" },
    ])).toEqual({ required: ["piece_identite","acte"], provided: ["piece_identite"], missing: ["acte"], unverified: ["piece_identite"] });
  });
  it("ignores archived documents", () => expect(getDocumentCoverage(["acte"], [{ document_type: "acte", verification_status: "archive", archived_at: "2026-01-01" }]).missing).toEqual(["acte"]));
});
