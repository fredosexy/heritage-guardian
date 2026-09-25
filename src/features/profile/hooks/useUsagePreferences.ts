import { useCallback, useEffect, useState } from "react";
import { usagePreferencesRepo } from "@/data";
import type { UsagePreferences } from "@/core/types/domain";
import { useAuth } from "@/features/identity/hooks/useAuth";

export function useUsagePreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UsagePreferences | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setPreferences(null);
      setLoading(false);
      return null;
    }
    setLoading(true);
    try {
      const data = await usagePreferencesRepo.getUsagePreferences(user.id);
      setPreferences(data);
      return data;
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const update = useCallback(
    async (patch: usagePreferencesRepo.UsagePreferencesPatch) => {
      if (!user) throw new Error("Authentication required");
      const data = await usagePreferencesRepo.updateUsagePreferences(user.id, patch);
      setPreferences(data);
      return data;
    },
    [user],
  );

  return { preferences, loading, refresh, update };
}
