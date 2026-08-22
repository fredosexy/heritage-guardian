import { useCallback, useEffect, useState } from "react";
import { profilesRepo } from "@/data";
import type { Profile } from "@/core/types/domain";
import { useAuth } from "@/features/identity/hooks/useAuth";

export type { Profile };

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) return null;
    return profilesRepo.getProfile(user.id);
  }, [user]);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchProfile()
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user, fetchProfile]);

  const refresh = useCallback(async () => {
    const data = await fetchProfile();
    setProfile(data);
  }, [fetchProfile]);

  return { profile, loading, refresh };
}
