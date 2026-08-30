import { useIdentity } from "@/features/identity";
import { computeProfileCompletion, type ProfileCompletion } from "@/services/profile-completion";
import { useDossiers } from "@/features/dossiers/hooks/useDossiers";
import { useProfile } from "./useProfile";

export function useProfileCompletion(): ProfileCompletion {
  const { isAuthenticated, guest } = useIdentity();
  const { profile } = useProfile();
  const { dossiers } = useDossiers();

  return computeProfileCompletion({
    hasAccount: isAuthenticated,
    firstName: isAuthenticated ? profile?.full_name : guest.firstName,
    phone: isAuthenticated ? profile?.phone : null,
    hasLocation: isAuthenticated ? true : !!guest.latitude,
    dossierCount: dossiers.length,
  });
}
