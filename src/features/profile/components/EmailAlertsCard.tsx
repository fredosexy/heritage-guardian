import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { profilesRepo } from "@/data";
import type { Profile } from "@/core/types/domain";

/** Préférence simple : recevoir les alertes importantes par e-mail. */
export function EmailAlertsCard({
  userId,
  profile,
  onChanged,
}: {
  userId: string;
  profile: Profile | null;
  onChanged?: () => void;
}) {
  const { t } = useTranslation();
  const [enabled, setEnabled] = useState(profile?.email_alerts ?? true);
  const [busy, setBusy] = useState(false);

  const toggle = async (value: boolean) => {
    setEnabled(value);
    setBusy(true);
    try {
      await profilesRepo.updateProfile(userId, { email_alerts: value });
      onChanged?.();
    } catch {
      setEnabled(!value);
      toast.error(t("auth.error"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="card-soft p-4 mb-4 flex items-center gap-3">
      <span className="size-9 rounded-lg bg-accent text-primary flex items-center justify-center shrink-0">
        <Mail className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{t("alerts.emailTitle")}</p>
        <p className="text-caption">{t("alerts.emailHint")}</p>
      </div>
      <Switch checked={enabled} disabled={busy} onCheckedChange={(v) => void toggle(v)} aria-label={t("alerts.emailTitle")} />
    </section>
  );
}
