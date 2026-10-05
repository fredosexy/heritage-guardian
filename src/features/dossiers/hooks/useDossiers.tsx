import { useEffect, useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { dossiersRepo, listLocalDrafts, participantsRepo, countProofsByDossier } from "@/data";
import type { Dossier, DossierStatus } from "@/core/types/domain";
import { getNextDossierAttention } from "@/services";
import { useIdentity } from "@/features/identity";
import { usePendingSync } from "@/features/offline";

export interface DossierListItem {
  id: string;
  type: string;
  title: string;
  status: DossierStatus;
  completionScore: number;
  updatedAt: string;
  locationName?: string | null;
  participantsCount: number;
  proofsCount: number;
  nextAttention: string;
  local?: boolean;
}

export function useDossiers() {
  const { userId, isGuest } = useIdentity();
  const pendingSync = usePendingSync();
  const [remote, setRemote] = useState<Dossier[]>([]);
  const [participants, setParticipants] = useState<Record<string, number>>({});
  const [proofs, setProofs] = useState<Record<string, number>>({});
  const [loadingRemote, setLoadingRemote] = useState(true);

  const localDrafts = useLiveQuery(
    async () => (isGuest && userId ? listLocalDrafts(userId) : []),
    [isGuest, userId],
    []
  );

  useEffect(() => {
    if (isGuest || !userId) {
      setRemote([]);
      setParticipants({});
      setProofs({});
      setLoadingRemote(false);
      return;
    }
    let cancelled = false;
    setLoadingRemote(true);
    Promise.all([dossiersRepo.listDossiers(userId), countProofsByDossier(userId)])
      .then(async ([data, proofCounts]) => {
        const participantCounts = await participantsRepo.countParticipantsByDossier(data.map((d) => d.id));
        if (!cancelled) {
          setRemote(data);
          setProofs(proofCounts);
          setParticipants(participantCounts);
        }
      })
      .catch(() => undefined)
      .finally(() => { if (!cancelled) setLoadingRemote(false); });
    return () => { cancelled = true; };
  }, [userId, isGuest, pendingSync]);

  const dossiers = useMemo<DossierListItem[]>(() => {
    if (isGuest) return (localDrafts ?? []).map((draft) => ({
      id: draft.localId, type: draft.type, title: draft.title,
      status: "incomplete" as DossierStatus, completionScore: 0,
      updatedAt: new Date().toISOString(), participantsCount: 0, proofsCount: 0,
      nextAttention: "Commencer votre dossier", local: true,
    }));
    return remote.map((d) => ({
      id: d.id, type: d.type, title: d.title, status: d.status,
      completionScore: d.completion_score, updatedAt: d.updated_at,
      locationName: d.location_name, participantsCount: participants[d.id] ?? 0,
      proofsCount: proofs[d.id] ?? 0,
      nextAttention: getNextDossierAttention(d, proofs[d.id] ?? 0, participants[d.id] ?? 0).label,
    }));
  }, [isGuest, localDrafts, remote, participants, proofs]);

  return { dossiers, loading: isGuest ? localDrafts === undefined : loadingRemote };
}