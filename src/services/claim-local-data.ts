import { claimLocalDrafts, profilesRepo } from "@/data";
import { getGuestIdentity, resetGuestIdentity } from "@/core/identity/guestIdentity";

export interface ClaimResult {
  claimedDossiers: number;
}

/**
 * Rattache les données créées en mode visiteur au compte réel : dossiers locaux
 * et informations de profil déjà renseignées.
 *
 * L'identité visiteur est conservée si le rattachement des dossiers échoue,
 * afin de ne pas perdre le lien permettant de retrouver les brouillons locaux.
 */
export async function claimLocalData(userId: string): Promise<ClaimResult> {
  const guest = getGuestIdentity();
  if (guest.id === userId) return { claimedDossiers: 0 };

  let claimedDossiers: number;
  try {
    claimedDossiers = await claimLocalDrafts(guest.id, userId);
  } catch {
    // Ne pas réinitialiser l'identité visiteur : la reprise doit pouvoir
    // retrouver les brouillons encore associés à cette identité. Ne pas
    // propager l'erreur depuis le listener d'authentification.
    return { claimedDossiers: 0 };
  }

  if (guest.firstName) {
    try {
      const profile = await profilesRepo.getProfile(userId);
      if (profile && !profile.full_name) {
        await profilesRepo.updateProfile(userId, { full_name: guest.firstName });
      }
    } catch {
      // La mise à jour du profil est indépendante du rattachement des dossiers.
    }
  }

  resetGuestIdentity();
  return { claimedDossiers };
}
