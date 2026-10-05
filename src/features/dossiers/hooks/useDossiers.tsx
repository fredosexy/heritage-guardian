import { useEffect, useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { dossiersRepo, listLocalDrafts, participantsRepo, countProofsByDossier, proceduresRepo } from "@/data";
import type { Dossier, DossierStatus } from "@/core/types/domain";
import { getNextDossierAttention, getJourneySummary } from "@/services";
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
  journeyProgress?: number;
  currentStepTitle?: string | null;
  nextStepTitle?: string | null;
  blockedStepTitle?: string | null;
  local?: boolean;
}

export function useDossiers() {
  const { userId, isGuest } = useIdentity();
  const pendingSync = usePendingSync();
  const [remote, setRemote] = useState<Dossier[]>([]);
  const [participants, setParticipants] = useState<Record<string, number>>({});
  const [proofs, setProofs] = useState<Record<string, number>>({});
  const [journeys, setJourneys] = useState<Record<string, { progress: number; current: string | null; next: string | null; blocked: string | null }>>({});
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
      setJourneys({});
      setLoadingRemote(false);
      return;
    }
    let cancelled = false;
    setLoadingRemote(true);
    Promise.all([dossiersRepo.listDossiers(userId), countProofsByDossier(userId)])
      .then(async ([data, proofCounts]) => {
        const participantCounts = await participantsRepo.countParticipantsByDossier(data.map((d) => d.id));
        let journeySteps: Record<string, Awaited<ReturnType<typeof proceduresRepo.getDossierStepsByDossierIds>>[string]> = {};
        try {
          journeySteps = await proceduresRepo.getDossierStepsByDossierIds(data.map((d) => d.id));
        } catch {
          // B4 is additive: if the migration is not deployed yet, keep the Home usable.
        }
        const journeyEntries = data.map((d) => {
          const summary = getJourneySummary(journeySteps[d.id] ?? []);
          return [d.id, {
            progress: summary.progressPercent,
            current: summary.currentStep?.title ?? null,
            next: summary.nextStep?.title ?? null,
            blocked: summary.blockedSteps[0]?.title ?? null,
          }] as const;
        });
        if (!cancelled) {
          setRemote(data);
          setProofs(proofCounts);
          setParticipants(participantCounts);
          setJourneys(Object.fromEntries(journeyEntries));
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
      nextAttention: "Commencer votre dossier", journeyProgress: 0, currentStepTitle: null, nextStepTitle: null, blockedStepTitle: null, local: true,
    }));
    return remote.map((d) => ({
      id: d.id, type: d.type, title: d.title, status: d.status,
      completionScore: d.completion_score, updatedAt: d.updated_at,
      locationName: d.location_name, participantsCount: participants[d.id] ?? 0,
      proofsCount: proofs[d.id] ?? 0,
      nextAttention: journeys[d.id]?.blocked
        ? `Parcours bloqué : ${journeys[d.id].blocked}`
        : journeys[d.id]?.current
          ? `Étape en cours : ${journeys[d.id].current}`
          : getNextDossierAttention(d, proofs[d.id] ?? 0, participants[d.id] ?? 0).label,
      journeyProgress: journeys[d.id]?.progress ?? 0,
      currentStepTitle: journeys[d.id]?.current ?? null,
      nextStepTitle: journeys[d.id]?.next ?? null,
      blockedStepTitle: journeys[d.id]?.blocked ?? null,
    }));
  }, [isGuest, localDrafts, remote, participants, proofs, journeys]);

  return { dossiers, loading: isGuest ? localDrafts === undefined : loadingRemote };
}