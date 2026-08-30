import { useCallback, useEffect, useState } from "react";
import {
  getGuestIdentity,
  subscribeGuestIdentity,
  updateGuestIdentity,
  type GuestIdentity,
} from "@/core/identity/guestIdentity";
import { useAuth } from "./useAuth";

export interface IdentityState {
  /** Identifiant utilisé pour porter les données (compte réel ou identité d'appareil). */
  userId: string;
  isGuest: boolean;
  isAuthenticated: boolean;
  loading: boolean;
  guest: GuestIdentity;
  /** Vrai tant que le visiteur n'a pas répondu à la première question. */
  needsFirstStep: boolean;
  updateGuest: (patch: Partial<Omit<GuestIdentity, "id" | "createdAt">>) => void;
  /** Prénom affichable, quelle que soit la situation. */
  displayName: string | null;
}

export function useIdentity(): IdentityState {
  const { user, loading } = useAuth();
  const [guest, setGuest] = useState<GuestIdentity>(() => getGuestIdentity());

  useEffect(() => {
    const unsubscribe = subscribeGuestIdentity(() => setGuest(getGuestIdentity()));
    return () => {
      unsubscribe();
    };
  }, []);

  const updateGuest = useCallback((patch: Partial<Omit<GuestIdentity, "id" | "createdAt">>) => {
    setGuest(updateGuestIdentity(patch));
  }, []);

  const isGuest = !user;

  return {
    userId: user?.id ?? guest.id,
    isGuest,
    isAuthenticated: !!user,
    loading,
    guest,
    needsFirstStep: isGuest && !guest.firstStepDone,
    updateGuest,
    displayName: user ? null : guest.firstName ?? null,
  };
}
