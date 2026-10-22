import { useCallback, useEffect, useState } from "react";
import { dossiersRepo, enqueueProofUpload, participantsRepo, proofsRepo } from "@/data";
import type { Dossier, Participant, Proof } from "@/core/types/domain";
import { scoreDossier } from "@/services";
import { fetchDossierSuggestions } from "@/services";
import { useAuth } from "@/features/identity";
import { enqueueDeleteDossier, onSyncChange } from "@/data/offline/sync";
import { assertDossierOwner, canEditDossier } from "@/services/dossier-ownership";

export function useDossierDetail(id?: string) {
  const { user } = useAuth();
  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    if (!id || !user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(false);
    try {
      const [d, p, pa] = await Promise.all([dossiersRepo.getDossier(id), proofsRepo.listProofs(id), participantsRepo.listParticipants(id)]);
      setDossier(d);
      setProofs(p);
      setParticipants(pa);
    } catch (error) {
      setLoadError(true);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => { void load().catch(() => undefined); }, [load]);

  // Refresh an open dossier when offline queue processing changes state. In particular,
  // a proof queued while offline must appear in its Terrain section after sync succeeds.
  useEffect(() => {
    if (!id || !user) return;
    return onSyncChange(() => { void load().catch(() => undefined); });
  }, [id, user, load]);

  useEffect(() => {
    if (!dossier) return;
    let cancelled = false;
    fetchDossierSuggestions({ dossier, proofsCount: proofs.length, participantsCount: participants.length })
      .then((s) => { if (!cancelled) setSuggestions(s); }).catch(() => undefined);
    return () => { cancelled = true; };
  }, [dossier?.id, proofs.length, participants.length]);

  const addProof = useCallback(async (file: File, sectionKey?: string): Promise<"uploaded" | "queued" | ""> => {
    if (!user || !dossier) return "";
    assertDossierOwner(dossier, user.id);
    setUploading(true);
    try {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        await enqueueProofUpload({ file, dossierId: dossier.id, userId: user.id, sectionKey });
        return "queued";
      }
      try {
        await proofsRepo.uploadProof({ file, dossierId: dossier.id, userId: user.id, sectionKey });
      } catch (error) {
        // Storage succeeded but the proofs row failed: retry the same object path,
        // rather than creating a second object and leaving the first one orphaned.
        if (error instanceof proofsRepo.ProofPersistenceError) {
          await enqueueProofUpload({
            file,
            dossierId: dossier.id,
            userId: user.id,
            sectionKey,
            storagePath: error.storagePath,
          });
          return "queued";
        }
        const message = error instanceof Error ? error.message.toLowerCase() : "";
        const networkFailure = typeof navigator !== "undefined" && !navigator.onLine ||
          message.includes("fetch") || message.includes("network") || message.includes("failed to") || message.includes("load failed");
        if (!networkFailure) throw error;
        await enqueueProofUpload({ file, dossierId: dossier.id, userId: user.id, sectionKey });
        return "queued";
      }
      const { score, status } = scoreDossier(dossier, proofs.length + 1, participants.length);
      await dossiersRepo.updateDossierScore(dossier.id, score, status);
      await load();
      return "uploaded";
    } finally {
      setUploading(false);
    }
  }, [user, dossier, proofs.length, participants.length, load]);

  const remove = useCallback(async () => {
    if (!dossier) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      if (!user) throw new Error("Session required");
      assertDossierOwner(dossier, user.id);
      await enqueueDeleteDossier(dossier.id);
      return;
    }
    await dossiersRepo.deleteDossier(dossier.id);
  }, [dossier, user]);

  return { dossier, proofs, participants, suggestions, loading, loadError, uploading, addProof, remove, reload: load, canEdit: canEditDossier(dossier, user?.id) };
}
