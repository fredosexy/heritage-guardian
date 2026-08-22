import { useEffect, useState } from "react";
import { dossiersRepo } from "@/data";
import type { Dossier } from "@/core/types/domain";
import { useAuth } from "@/features/identity";
import { usePendingSync } from "@/features/offline";

export function useDossiers() {
  const { user } = useAuth();
  const pendingSync = usePendingSync();
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    dossiersRepo
      .listDossiers(user.id)
      .then((data) => {
        if (!cancelled) setDossiers(data);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user, pendingSync]);

  return { dossiers, loading };
}
