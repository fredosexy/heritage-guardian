import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, MapPin } from "lucide-react";
import { useIdentity } from "../hooks/useIdentity";

/**
 * Une seule question au premier geste utile : le prénom, et si l'on veut,
 * la position. Toujours possible de passer.
 */
export function FirstStepDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const { guest, updateGuest } = useIdentity();
  const [firstName, setFirstName] = useState(guest.firstName ?? "");
  const [locating, setLocating] = useState(false);
  const [located, setLocated] = useState(!!guest.latitude);

  const askLocation = () => {
    if (!("geolocation" in navigator)) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateGuest({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        setLocated(true);
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 10_000 }
    );
  };

  const finish = () => {
    updateGuest({ firstName: firstName.trim() || undefined, firstStepDone: true });
    onClose();
  };

  const skip = () => {
    updateGuest({ firstStepDone: true });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? undefined : skip())}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-title">{t("firstStep.title")}</DialogTitle>
          <DialogDescription>{t("firstStep.subtitle")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="firstName">{t("firstStep.nameLabel")}</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              placeholder={t("firstStep.namePlaceholder")}
              className="rounded-xl"
              autoFocus
            />
          </div>

          <button
            type="button"
            onClick={askLocation}
            disabled={locating || located}
            className="w-full card-soft p-3 flex items-center gap-3 text-left pressable focus-ring tap disabled:opacity-70"
          >
            <span className="size-10 rounded-xl bg-accent text-primary flex items-center justify-center shrink-0">
              {locating ? <Loader2 className="size-4 animate-spin" /> : <MapPin className="size-4" />}
            </span>
            <span className="flex-1">
              <span className="block text-sm font-medium">
                {located ? t("firstStep.locationOn") : t("firstStep.locationCta")}
              </span>
              <span className="block text-caption">{t("firstStep.locationWhy")}</span>
            </span>
          </button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={skip} className="flex-1">
              {t("firstStep.later")}
            </Button>
            <Button onClick={finish} className="flex-1 bg-gradient-warm">
              {t("firstStep.continue")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
