import { useEffect, useState } from "react";
import { dossiersRepo, enqueueUpdateDossier } from "@/data";
import { db } from "@/data/offline/db";
import type { Dossier } from "@/core/types/domain";
import { EDITABLE_FIELDS, type DossierChanges } from "@/services/sync-conflicts";
import { useAuth } from "@/features/identity";
import { assertDossierOwner, canEditDossier } from "@/services/dossier-ownership";

/** Charge le dossier (réseau puis cache local) et met les changements en file. */
export function useEditDossier(id?: string) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [dossierViewerId, setDossierViewerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const visibleDossier = dossierViewerId === userId ? dossier : null;

  useEffect(() => {
    let cancelled = false;
    setDossier(null);
    setDossierViewerId(null);
    setLoading(Boolean(id && userId));

    if (!id || !userId) {
      setLoading(false);
      return () => { cancelled = true; };
    }

    (async () => {
      let loaded: Dossier | null = null;
      try {
        loaded = await dossiersRepo.getDossier(id);
        if (loaded) {
          await db.cachedDossiers.put({
            id: loaded.id,
            user_id: loaded.user_id,
            viewer_user_id: userId,
            data: loaded,
            cached_at: Date.now(),
          });
        }
      } catch {
        try {
          const cached = await db.cachedDossiers.get(id);
          if (cached?.viewer_user_id === userId) {
            loaded = cached.data as Dossier;
          }
        } catch {
          loaded = null;
        }
      }
      if (!cancelled) {
        setDossier(loaded);
        setDossierViewerId(userId);
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [id, userId]);

  const save = async (values: DossierChanges): Promise<boolean> => {
    if (!visibleDossier) return false;
    assertDossierOwner(visibleDossier, userId);
    const changes: DossierChanges = {};
    for (const f of EDITABLE_FIELDS) {
      const v = (values[f] ?? "").trim() || null;
      if (v !== (visibleDossier[f] ?? null)) changes[f] = v;
    }
    if (Object.keys(changes).length === 0) return false;
    await enqueueUpdateDossier(visibleDossier.id, changes, visibleDossier.updated_at);
    return true;
  };

  return { dossier: visibleDossier, loading, save, canEdit: canEditDossier(visibleDossier, userId) };
}
