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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setDossier(null);
    setLoading(Boolean(id && userId));

    if (!id || !userId) {
      setLoading(false);
      return () => { cancelled = true; };
    }

    (async () => {
      let loaded: Dossier | null = null;
      try {
        loaded = await dossiersRepo.getDossier(id);
        if (loaded && loaded.user_id === userId) {
          await db.cachedDossiers.put({ id: loaded.id, user_id: loaded.user_id, data: loaded, cached_at: Date.now() });
        } else if (loaded) {
          loaded = null;
        }
      } catch {
        const cached = await db.cachedDossiers.get(id);
        if (cached?.user_id === userId) {
          const cachedDossier = cached.data as Dossier;
          loaded = cachedDossier.user_id === userId ? cachedDossier : null;
        }
      }
      if (!cancelled) {
        setDossier(loaded);
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [id, userId]);

  const save = async (values: DossierChanges): Promise<boolean> => {
    if (!dossier) return false;
    assertDossierOwner(dossier, userId);
    const changes: DossierChanges = {};
    for (const f of EDITABLE_FIELDS) {
      const v = (values[f] ?? "").trim() || null;
      if (v !== (dossier[f] ?? null)) changes[f] = v;
    }
    if (Object.keys(changes).length === 0) return false;
    await enqueueUpdateDossier(dossier.id, changes, dossier.updated_at);
    return true;
  };

  return { dossier, loading, save, canEdit: canEditDossier(dossier, userId) };
}
