import { useCallback, useState } from "react";
import { dossiersRepo, enqueueCreateDossier } from "@/data";
import { useIdentity } from "@/features/identity";
import type { DossierType } from "@/core/types/domain";

export interface CreateDossierForm {
  bien_id: string;
  type: DossierType;
  title: string;
  description?: string;
  visibility: "prive" | "public";
}
export type CreateResult = { mode: "online"; id: string } | { mode: "offline" };
const newLocalId = () => `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export function useCreateDossier() {
  const { userId, isGuest } = useIdentity();
  const [saving, setSaving] = useState(false);
  const create = useCallback(async (form: CreateDossierForm): Promise<CreateResult | null> => {
    if (!userId || isGuest) return null;
    setSaving(true);
    try {
      const operationId = newLocalId();
      if (typeof navigator === "undefined" || navigator.onLine) {
        const dossier = await dossiersRepo.createDossier({ ...form, client_operation_id: operationId });
        return { mode: "online", id: dossier.id };
      }
      await enqueueCreateDossier({ localId: operationId, user_id: userId, ...form });
      return { mode: "offline" };
    } finally { setSaving(false); }
  }, [userId, isGuest]);
  return { create, saving };
}
