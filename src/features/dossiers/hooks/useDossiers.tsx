import { useEffect, useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { dossiersRepo, listLocalDrafts } from "@/data";
import type { DossierStatus } from "@/core/types/domain";
import type { DossierWithBien } from "@/data/dossiers.repo";
import { useIdentity } from "@/features/identity";
import { usePendingSync } from "@/features/offline";

export interface DossierListItem {
  id: string;
  type: string;
  title: string;
  status: DossierStatus;
  visibility?: string;
  completion_level?: string;
  bien_title?: string;
  /** Dossier encore uniquement sur cet appareil (mode visiteur ou hors ligne). */
  local?: boolean;
}

export function useDossiers() {
  const { userId, isGuest } = useIdentity();
  const pendingSync = usePendingSync();
  const [remote, setRemote] = useState<DossierWithBien[]>([]);
  const [loadingRemote, setLoadingRemote] = useState(true);

  const localDrafts = useLiveQuery(
    async () => (isGuest && userId ? listLocalDrafts(userId) : []),
    [isGuest, userId],
    []
  );

  useEffect(() => {
    if (isGuest || !userId) {
      setRemote([]);
      setLoadingRemote(false);
      return;
    }
    let cancelled = false;
    setLoadingRemote(true);
    dossiersRepo
      .listDossiers(userId)
      .then((data) => {
        if (!cancelled) setRemote(data);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoadingRemote(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId, isGuest, pendingSync]);

  const dossiers = useMemo<DossierListItem[]>(() => {
    if (isGuest) {
      return (localDrafts ?? []).map((draft) => ({
        id: draft.localId,
        type: draft.type,
        title: draft.title,
        status: "brouillon" as DossierStatus,
        local: true,
      }));
    }
    return remote.map((d) => ({ id: d.id, type: d.type, title: d.title, status: d.status, visibility: d.visibility, completion_level: d.completion_level, bien_title: d.bien.title }));
  }, [isGuest, localDrafts, remote]);

  return { dossiers, loading: isGuest ? localDrafts === undefined : loadingRemote };
}
