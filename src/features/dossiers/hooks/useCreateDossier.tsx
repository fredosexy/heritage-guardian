import { useCallback, useState } from "react";
import { dossiersRepo, enqueueCreateDossier, proceduresRepo, saveLocalDraft } from "@/data";
import { useIdentity } from "@/features/identity";

export interface CreateDossierForm {
  type: string;
  title: string;
  description?: string;
  location_name?: string;
  metadata?: Record<string, unknown>;
}

export type CreateResult =
  | { mode: "online"; id: string; journeyStatus: "ready" | "procedure_unavailable" | "attention" }
  | { mode: "offline" }
  | { mode: "local" };

function newLocalId() {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useCreateDossier() {
  const { userId, isGuest } = useIdentity();
  const [saving, setSaving] = useState(false);

  const create = useCallback(
    async (form: CreateDossierForm): Promise<CreateResult | null> => {
      if (!userId) return null;
      setSaving(true);
      try {
        const draft = {
          localId: newLocalId(),
          user_id: userId,
          type: form.type,
          title: form.title,
          description: form.description || null,
          location_name: form.location_name || null,
          metadata: form.metadata ?? {},
        };

        // Visiteur : tout reste sur l'appareil jusqu'à la création du compte.
        if (isGuest) {
          await saveLocalDraft(draft);
          return { mode: "local" };
        }

        const online = typeof navigator === "undefined" ? true : navigator.onLine;
        if (online) {
          const dossier = await dossiersRepo.createDossier({
            user_id: userId,
            type: form.type,
            title: form.title,
            description: form.description || null,
            location_name: form.location_name || null,
            metadata: form.metadata ?? {},
          });
          let journeyStatus: "ready" | "procedure_unavailable" | "attention" = "ready";
          try {
            await proceduresRepo.initializeDossierJourney(dossier.id);
          } catch (error) {
            const procedureError = error as { code?: string; message?: string };
            journeyStatus = procedureError.code === "P0002" ||
              procedureError.message?.includes("published_procedure_not_found")
              ? "procedure_unavailable"
              : "attention";
          }
          return { mode: "online", id: dossier.id, journeyStatus };
        }

        await enqueueCreateDossier(draft);
        return { mode: "offline" };
      } finally {
        setSaving(false);
      }
    },
    [userId, isGuest]
  );

  return { create, saving };
}
