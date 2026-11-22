import { useEffect, useState } from "react";
import { dossiersRepo, enqueueUpdateDossier, enqueueUpdateDossierMetadata } from "@/data";
import { db } from "@/data/offline/db";
import { createAgriculturalRuralPatch, mergeAgriculturalRural } from "@/data/offline/metadataMerge";
import type { Dossier } from "@/core/types/domain";
import { EDITABLE_FIELDS, type DossierChanges } from "@/services/sync-conflicts";
import { useAuth } from "@/features/identity";
import { assertDossierOwner, canEditDossier } from "@/services/dossier-ownership";

async function overlayPendingAgriculturalMetadata(dossier: Dossier, viewerUserId: string): Promise<Dossier> {
  try {
    const operations = await db.queue.where("kind").equals("update_dossier").toArray();
    const pending = operations
      .filter((operation) =>
        operation.kind === "update_dossier" &&
        operation.viewer_user_id === viewerUserId &&
        operation.payload?.dossierId === dossier.id &&
        operation.payload?.metadata &&
        typeof operation.payload.metadata === "object" &&
        !Array.isArray(operation.payload.metadata),
      )
      .sort((a, b) => a.created_at - b.created_at);
    if (pending.length === 0) return dossier;

    const currentMetadata = dossier.metadata && typeof dossier.metadata === "object" && !Array.isArray(dossier.metadata)
      ? dossier.metadata as Record<string, unknown>
      : {};
    let agriculturalRural = currentMetadata.agriculturalRural;
    for (const operation of pending) {
      if (operation.kind !== "update_dossier") continue;
      const queuedMetadata = operation.payload.metadata as Record<string, unknown>;
      if (queuedMetadata.agriculturalRural && typeof queuedMetadata.agriculturalRural === "object" && !Array.isArray(queuedMetadata.agriculturalRural)) {
        agriculturalRural = mergeAgriculturalRural(agriculturalRural, queuedMetadata.agriculturalRural);
      }
    }
    if (agriculturalRural === currentMetadata.agriculturalRural) return dossier;
    return { ...dossier, metadata: { ...currentMetadata, agriculturalRural } };
  } catch {
    return dossier;
  }
}

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
          loaded = await overlayPendingAgriculturalMetadata(loaded, userId);
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
            loaded = await overlayPendingAgriculturalMetadata(cached.data as Dossier, userId);
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

  const saveAgricultural = async (asset: Record<string, unknown>): Promise<boolean> => {
    if (!visibleDossier || visibleDossier.type !== "agricole") return false;
    assertDossierOwner(visibleDossier, userId);
    const metadata = visibleDossier.metadata && typeof visibleDossier.metadata === "object" && !Array.isArray(visibleDossier.metadata)
      ? visibleDossier.metadata as Record<string, unknown>
      : {};
    const current = metadata.agriculturalRural && typeof metadata.agriculturalRural === "object" && !Array.isArray(metadata.agriculturalRural)
      ? metadata.agriculturalRural as Record<string, unknown>
      : {};
    const next = { ...asset, version: 1, declarationStatus: "declare", source: "declarant" };
    const patch = createAgriculturalRuralPatch(current, next);
    if (Object.keys(patch).length === 0) return false;
    await enqueueUpdateDossierMetadata(visibleDossier.id, { agriculturalRural: patch });
    return true;
  };

  return { dossier: visibleDossier, loading, save, saveAgricultural, canEdit: canEditDossier(visibleDossier, userId) };
}
