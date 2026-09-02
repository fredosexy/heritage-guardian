import { useState } from "react";
import { useTranslation } from "react-i18next";
import { KeyRound, Loader2, ShieldCheck, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Sécurité et appareil courant : mot de passe, appareil utilisé. */
export function SecurityCard({ email }: { email: string | null }) {
  const { t } = useTranslation();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const deviceLabel =
    typeof navigator === "undefined" ? "—" : `${navigator.platform || "Appareil"} · ${navigator.language}`;

  const changePassword = async () => {
    if (password.length < 8) {
      toast.error(t("profile.passwordTooShort"));
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setPassword("");
      toast.success(t("profile.passwordChanged"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("auth.error"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="card-soft p-5 mb-4 space-y-4">
      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
        <ShieldCheck className="size-4" /> {t("profile.security")}
      </h2>

      <div className="space-y-2">
        <Label htmlFor="newpass" className="flex items-center gap-2">
          <KeyRound className="size-3.5" /> {t("profile.newPassword")}
        </Label>
        <Input
          id="newpass"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder={t("profile.newPasswordPlaceholder")}
          className="rounded-xl"
          autoComplete="new-password"
        />
        <Button onClick={() => void changePassword()} disabled={busy || !password} variant="outline" className="w-full">
          {busy && <Loader2 className="size-4 animate-spin" />} {t("profile.changePassword")}
        </Button>
      </div>

      <div className="rounded-xl border border-border p-3 flex items-center gap-3">
        <span className="size-9 rounded-lg bg-accent text-primary flex items-center justify-center shrink-0">
          <Smartphone className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{t("profile.thisDevice")}</p>
          <p className="text-caption truncate">{email ?? deviceLabel}</p>
        </div>
      </div>
    </section>
  );
}
