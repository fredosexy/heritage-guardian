import { useCallback, useEffect, useState } from "react";
import { dossiersRepo, participantsRepo } from "@/data";
import type { DossierWithBien } from "@/data/dossiers.repo";
import type { DossierParticipantWithPerson } from "@/data/participants.repo";
import { useAuth } from "@/features/identity";

export function useDossierDetail(id?: string) {
  const { user } = useAuth();
  const [dossier, setDossier] = useState<DossierWithBien | null>(null);
  const [participants, setParticipants] = useState<DossierParticipantWithPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    if (!id || !user) { setDossier(null); setParticipants([]); setLoading(false); return; }
    setLoading(true);
    try {
      const [record, people] = await Promise.all([dossiersRepo.getDossierById(id), participantsRepo.getParticipants(id)]);
      setDossier(record); setParticipants(people);
    } finally { setLoading(false); }
  }, [id, user]);
  useEffect(() => { void load(); }, [load]);
  const archive = useCallback(async () => { if (dossier) await dossiersRepo.archiveDossier(dossier.id); }, [dossier]);
  return { dossier, participants, loading, archive, reload: load };
}
