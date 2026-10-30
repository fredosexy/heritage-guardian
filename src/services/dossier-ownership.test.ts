import { describe, expect, it } from "vitest";
import { assertDossierOwner, canEditDossier } from "@/services/dossier-ownership";

describe("dossier ownership guard", () => {
  it("accepts exact owner match after string normalization", () => {
    expect(canEditDossier({ user_id: " user-123 " }, "user-123")).toBe(true);
  });

  it("rejects a different user id", () => {
    expect(canEditDossier({ user_id: "user-123" }, "user-456")).toBe(false);
  });

  it("rejects missing owner or missing session", () => {
    expect(canEditDossier({ user_id: "user-123" }, null)).toBe(false);
    expect(canEditDossier(null, "user-123")).toBe(false);
    expect(canEditDossier({ user_id: "" }, "user-123")).toBe(false);
  });

  it("throws when ownership does not match", () => {
    expect(() => assertDossierOwner({ user_id: "user-123" }, "user-456")).toThrow(
      "Only the dossier owner can modify this dossier"
    );
  });

  it("accepts the same user with whitespace normalization", () => {
    expect(canEditDossier({ user_id: "  user-123  " }, "user-123")).toBe(true);
    expect(canEditDossier({ user_id: "user-123" }, "  user-123  ")).toBe(true);
  });

  it("blocks queued update if ownership changed before replay", () => {
    const dossier = { user_id: "user-123" };
    const currentUserId = "user-456";

    expect(canEditDossier(dossier, currentUserId)).toBe(false);
    expect(() => assertDossierOwner(dossier, currentUserId)).toThrow(
      "Only the dossier owner can modify this dossier"
    );
  });

  it("blocks queued delete if ownership changed before replay", () => {
    const dossier = { user_id: "user-123" };
    const currentUserId = "user-789";

    expect(canEditDossier(dossier, currentUserId)).toBe(false);
    expect(() => assertDossierOwner(dossier, currentUserId)).toThrow(
      "Only the dossier owner can modify this dossier"
    );
  });

  it("blocks queued proof upload if the user no longer owns the dossier", () => {
    const dossier = { user_id: "user-123" };
    const queuedUserId = "user-999";

    expect(canEditDossier(dossier, queuedUserId)).toBe(false);
    expect(() => assertDossierOwner(dossier, queuedUserId)).toThrow(
      "Only the dossier owner can modify this dossier"
    );
  });
});
