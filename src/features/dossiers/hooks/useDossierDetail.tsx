import { useCallback, useEffect, useState } from "react";
import { dossiersRepo, participantsRepo, proofsRepo } from "@/data";
import type { Dossier, Participant, Proof } from "@/core/types/domain";
import { scoreDossier } from "@/services";
import { fetchDossierSuggestions } from "@/services";
import { useAuth } from "@/features/identity";

export function useDossierDetail(id?: string) {
  const { user } = useAuth();
  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    if (!id || !user) {
      setDossier(null);
      setProofs([]);
      setParticipants([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [d, p, pa] = await Promise.all([
        dossiersRepo.getDossier(id),
        proofsRepo.listProofs(id),
        participantsRepo.listParticipants(id),
      ]);
      setDossier(d);
      setProofs(p);
      setParticipants(pa);
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!dossier) return;
    let cancelled = false;
    fetchDossierSuggestions({
      dossier,
      proofsCount: proofs.length,
      participantsCount: participants.length,
    })
      .then((s) => {
        if (!cancelled) setSuggestions(s);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [dossier?.id, proofs.length, participants.length]);

  const addProof = useCallback(
    async (file: File) => {
      if (!user || !dossier) return;
      setUploading(true);
      try {
        await proofsRepo.uploadProof({ file, dossierId: dossier.id, userId: user.id });
        const { score, status } = scoreDossier(dossier, proofs.length + 1, participants.length);
        await dossiersRepo.updateDossierScore(dossier.id, score, status);
        await load();
      } finally {
        setUploading(false);
      }
    },
    [user, dossier, proofs.length, participants.length, load]
  );

  const remove = useCallback(async () => {
    if (!dossier) return;
    await dossiersRepo.deleteDossier(dossier.id);
  }, [dossier]);

  return { dossier, proofs, participants, suggestions, loading, uploading, addProof, remove, reload: load };
}
