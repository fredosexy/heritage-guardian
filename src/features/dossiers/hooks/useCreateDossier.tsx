import { useCallback, useState } from "react";
import { dossiersRepo, enqueueCreateDossier } from "@/data";
import { useAuth } from "@/features/identity";

export interface CreateDossierForm {
  type: string;
  title: string;
  description?: string;
  location_name?: string;
}

export type CreateResult = { mode: "online"; id: string } | { mode: "offline" };

export function useCreateDossier() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  const create = useCallback(
    async (form: CreateDossierForm): Promise<CreateResult | null> => {
      if (!user) return null;
      setSaving(true);
      try {
        const online = typeof navigator === "undefined" ? true : navigator.onLine;
        if (online) {
          const dossier = await dossiersRepo.createDossier({
            user_id: user.id,
            type: form.type,
            title: form.title,
            description: form.description || null,
            location_name: form.location_name || null,
          });
          return { mode: "online", id: dossier.id };
        }
        await enqueueCreateDossier({
          localId: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          user_id: user.id,
          type: form.type,
          title: form.title,
          description: form.description || null,
          location_name: form.location_name || null,
        });
        return { mode: "offline" };
      } finally {
        setSaving(false);
      }
    },
    [user]
  );

  return { create, saving };
}
