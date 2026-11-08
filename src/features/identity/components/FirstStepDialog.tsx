import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, MapPin } from "lucide-react";
import { useIdentity } from "../hooks/useIdentity";

/**
 * Première identification facultative : prénom ou nom, avec localisation facultative.
 * La découverte reste possible sans répondre.
 */
export function FirstStepDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { guest, updateGuest } = useIdentity();
  const [firstName, setFirstName] = useState(guest.firstName ?? "");
  const [lastName, setLastName] = useState(guest.lastName ?? "");
  const [showNextStep, setShowNextStep] = useState(false);
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
    const first = firstName.trim();
    const last = lastName.trim();
    updateGuest({ firstName: first || undefined, lastName: last || undefined, firstStepDone: true });
    if (first || last) {
      setShowNextStep(true);
      return;
    }
    onClose();
  };

  const skip = () => {
    updateGuest({ firstStepDone: true });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) return;
        if (showNextStep) {
          onClose();
          return;
        }
        if (firstName.trim() || lastName.trim()) {
          finish();
          return;
        }
        skip();
      }}
    >
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-title">{showNextStep ? t("firstStep.nextTitle") : t("firstStep.title")}</DialogTitle>
          <DialogDescription>{showNextStep ? t("firstStep.nextDescription") : t("firstStep.subtitle")}</DialogDescription>
        </DialogHeader>

        {showNextStep ? (
          <div className="space-y-3">
            <Button type="button" className="w-full" onClick={() => { onClose(); navigate("/auth"); }}>{t("firstStep.createAccount")}</Button>
            <Button type="button" variant="outline" className="w-full" onClick={onClose}>{t("firstStep.discover")}</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="firstName">{t("firstStep.nameLabel")}</Label>
              <Input id="firstName" value={firstName} onChange={(event) => setFirstName(event.target.value)} placeholder={t("firstStep.namePlaceholder")} className="rounded-xl" autoFocus />
            </div>
            <div>
              <Label htmlFor="lastName">{t("firstStep.lastNameLabel")}</Label>
              <Input id="lastName" value={lastName} onChange={(event) => setLastName(event.target.value)} placeholder={t("firstStep.lastNamePlaceholder")} className="rounded-xl" />
            </div>
            <button type="button" onClick={askLocation} disabled={locating || located} className="w-full card-soft p-3 flex items-center gap-3 text-left pressable focus-ring tap disabled:opacity-70">
              <span className="size-10 rounded-xl bg-accent text-primary flex items-center justify-center shrink-0">
                {locating ? <Loader2 className="size-4 animate-spin" /> : <MapPin className="size-4" />}
              </span>
              <span className="flex-1">
                <span className="block text-sm font-medium">{located ? t("firstStep.locationOn") : t("firstStep.locationCta")}</span>
                <span className="block text-caption">{t("firstStep.locationWhy")}</span>
              </span>
            </button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={skip} className="flex-1">{t("firstStep.later")}</Button>
              <Button onClick={finish} className="flex-1 bg-gradient-warm">{t("firstStep.continue")}</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
