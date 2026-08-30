import { claimLocalDrafts, profilesRepo } from "@/data";
import { getGuestIdentity, resetGuestIdentity } from "@/core/identity/guestIdentity";

export interface ClaimResult {
  claimedDossiers: number;
}

/**
 * Rattache les données créées en mode visiteur au compte réel :
 * dossiers locaux + prénom/localisation déjà renseignés.
 */
export async function claimLocalData(userId: string): Promise<ClaimResult> {
  const guest = getGuestIdentity();
  if (guest.id === userId) return { claimedDossiers: 0 };

  let claimedDossiers = 0;
  try {
    claimedDossiers = await claimLocalDrafts(guest.id, userId);
  } catch {
    /* la file réessaiera plus tard */
  }

  if (guest.firstName) {
    try {
      const profile = await profilesRepo.getProfile(userId);
      if (profile && !profile.full_name) {
        await profilesRepo.updateProfile(userId, { full_name: guest.firstName });
      }
    } catch {
      /* non bloquant */
    }
  }

  resetGuestIdentity();
  return { claimedDossiers };
}
