import { useEffect, useState } from "react";
import { dossiersRepo, enqueueUpdateDossier } from "@/data";
import { db } from "@/data/offline/db";
import type { Dossier } from "@/core/types/domain";
import { EDITABLE_FIELDS, type DossierChanges } from "@/services/sync-conflicts";

/** Charge le dossier (réseau puis cache local) et met les changements en file. */
export function useEditDossier(id?: string) {
  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      let d: Dossier | null = null;
      try {
        d = await dossiersRepo.getDossier(id);
        if (d) await db.cachedDossiers.put({ id: d.id, user_id: d.user_id, data: d, cached_at: Date.now() });
      } catch {
        d = ((await db.cachedDossiers.get(id))?.data as Dossier) ?? null;
      }
      if (!cancelled) { setDossier(d); setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [id]);

  /** Renvoie false si rien n'a changé. */
  const save = async (values: DossierChanges): Promise<boolean> => {
    if (!dossier) return false;
    const changes: DossierChanges = {};
    for (const f of EDITABLE_FIELDS) {
      const v = (values[f] ?? "").trim() || null;
      if (v !== (dossier[f] ?? null)) changes[f] = v;
    }
    if (Object.keys(changes).length === 0) return false;
    await enqueueUpdateDossier(dossier.id, changes, dossier.updated_at);
    return true;
  };

  return { dossier, loading, save };
}
