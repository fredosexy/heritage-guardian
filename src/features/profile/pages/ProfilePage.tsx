import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AppLayout } from "@/features/shell";
import { useAuth } from "@/features/identity";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe, Loader2, LogOut, Moon, Sun } from "lucide-react";
import { toast } from "sonner";
import i18n from "@/core/i18n";
import { profilesRepo } from "@/data";
import { useProfile } from "../hooks/useProfile";

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const { profile, refresh } = useProfile();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    if (!profile) return;
    setName(profile.full_name ?? "");
    setPhone(profile.phone ?? "");
  }, [profile]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await profilesRepo.updateProfile(user.id, { full_name: name, phone });
      toast.success(t("profile.saved"));
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("auth.error"));
    } finally {
      setSaving(false);
    }
  };

  const setLanguage = async (language: "fr" | "en") => {
    await i18n.changeLanguage(language);
    if (user) await profilesRepo.updateProfile(user.id, { language });
    await refresh();
  };

  const setTheme = async (theme: "light" | "dark") => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    setIsDark(theme === "dark");
    if (user) await profilesRepo.updateProfile(user.id, { theme });
    await refresh();
  };

  return (
    <AppLayout>
      <h1 className="text-display mb-6">{t("profile.title")}</h1>

      <section className="card-soft p-5 mb-4 space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{t("profile.personal")}</h2>
        <div>
          <Label htmlFor="pname">{t("auth.fullName")}</Label>
          <Input id="pname" value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl" />
        </div>
        <div>
          <Label htmlFor="pphone">{t("auth.phone")}</Label>
          <Input id="pphone" value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-xl" />
        </div>
        <div>
          <Label htmlFor="pmail">{t("auth.email")}</Label>
          <Input id="pmail" value={user?.email ?? ""} disabled className="rounded-xl" />
        </div>
        <Button onClick={save} disabled={saving} className="w-full bg-gradient-warm">
          {saving && <Loader2 className="size-4 animate-spin" />} {t("profile.save")}
        </Button>
      </section>

      <section className="card-soft p-5 mb-4 space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <Globe className="size-4" /> {t("profile.language")}
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <Button variant={i18n.language.startsWith("fr") ? "default" : "outline"} onClick={() => setLanguage("fr")}>
            Français
          </Button>
          <Button variant={i18n.language.startsWith("en") ? "default" : "outline"} onClick={() => setLanguage("en")}>
            English
          </Button>
        </div>
      </section>

      <section className="card-soft p-5 mb-4 space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{t("profile.theme")}</h2>
        <div className="grid grid-cols-2 gap-2">
          <Button variant={isDark ? "outline" : "default"} onClick={() => setTheme("light")}>
            <Sun className="size-4" /> {t("profile.themeLight")}
          </Button>
          <Button variant={isDark ? "default" : "outline"} onClick={() => setTheme("dark")}>
            <Moon className="size-4" /> {t("profile.themeDark")}
          </Button>
        </div>
      </section>

      <Button
        variant="outline"
        onClick={signOut}
        className="w-full text-destructive border-destructive/30 hover:bg-destructive/5"
      >
        <LogOut className="size-4" /> {t("auth.signOut")}
      </Button>
    </AppLayout>
  );
}
