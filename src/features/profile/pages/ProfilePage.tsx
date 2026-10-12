import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AppLayout, AssistantTip } from "@/features/shell";
import { useAuth, VisitorBanner } from "@/features/identity";
import { ProfileCompletionCard } from "../components/ProfileCompletionCard";
import { AvatarCard } from "../components/AvatarCard";
import { SecurityCard } from "../components/SecurityCard";
import { EmailAlertsCard } from "../components/EmailAlertsCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ChevronRight,
  FolderOpen,
  Globe,
  Loader2,
  LogOut,
  Moon,
  Paperclip,
  MapPin,
  Users,
  Scale,
  ScrollText,
  Sparkles,
  Settings2,
  ShieldCheck,
  Sun,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import i18n from "@/core/i18n";
import { profilesRepo } from "@/data";
import { useProfile } from "../hooks/useProfile";

const activityOptions = [
  { id: "terrain", icon: MapPin },
  { id: "heritage", icon: Users },
  { id: "conflit", icon: Scale },
  { id: "volonte", icon: ScrollText },
] as const;

export default function ProfilePage() {
  const { t } = useTranslation();
  const profileSections = [
    { id: "personal-info", label: t("profile.sectionIdentity"), icon: UserRound },
    { id: "my-spaces", label: t("profile.sectionSpaces"), icon: FolderOpen },
    { id: "my-activities", label: t("profile.sectionActivities"), icon: Sparkles },
    { id: "preferences", label: t("profile.sectionPreferences"), icon: Settings2 },
    { id: "security", label: t("profile.sectionSecurity"), icon: ShieldCheck },
  ];
  const { user, signOut } = useAuth();
  const { profile, refresh } = useProfile();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [settingsBusy, setSettingsBusy] = useState(false);
  const [activeActivities, setActiveActivities] = useState<string[]>(activityOptions.map((item) => item.id));
  const [activitiesSaving, setActivitiesSaving] = useState(false);
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    if (!profile) return;
    setName(profile.full_name ?? "");
    setPhone(profile.phone ?? "");
    const savedActivities = profile.activity_preferences;
    setActiveActivities(Array.isArray(savedActivities) && savedActivities.every((item) => typeof item === "string")
      ? savedActivities.filter((item) => activityOptions.some((option) => option.id === item))
      : activityOptions.map((item) => item.id));
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

  const toggleActivity = async (activityId: string) => {
    const next = activeActivities.includes(activityId)
      ? activeActivities.filter((id) => id !== activityId)
      : [...activeActivities, activityId];
    if (next.length === 0) {
      toast.error(t("profile.keepOneActivity"));
      return;
    }
    const previous = activeActivities;
    setActiveActivities(next);
    if (!user) return;
    setActivitiesSaving(true);
    try {
      await profilesRepo.updateProfile(user.id, { activity_preferences: next });
      await refresh();
      toast.success(t("profile.activitiesSaved"));
    } catch (error) {
      setActiveActivities(previous);
      toast.error(error instanceof Error ? error.message : t("auth.error"));
    } finally {
      setActivitiesSaving(false);
    }
  };

  const setLanguage = async (language: "fr" | "en") => {
    setSettingsBusy(true);
    try {
      await i18n.changeLanguage(language);
      if (user) await profilesRepo.updateProfile(user.id, { language });
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("auth.error"));
    } finally {
      setSettingsBusy(false);
    }
  };

  const setTheme = async (theme: "light" | "dark") => {
    const previousTheme = isDark ? "dark" : "light";
    document.documentElement.classList.toggle("dark", theme === "dark");
    setIsDark(theme === "dark");
    setSettingsBusy(true);
    try {
      if (user) await profilesRepo.updateProfile(user.id, { theme });
      await refresh();
    } catch (error) {
      document.documentElement.classList.toggle("dark", previousTheme === "dark");
      setIsDark(previousTheme === "dark");
      toast.error(error instanceof Error ? error.message : t("auth.error"));
    } finally {
      setSettingsBusy(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 pb-8">
        <header className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-accent/80 via-card to-card p-5 sm:p-7">
          <div className="absolute -right-10 -top-12 size-40 rounded-full bg-primary/10 blur-2xl" aria-hidden="true" />
          <div className="relative">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              {t("profile.eyebrow")}
            </p>
            <h1 className="text-display">{t("profile.title")}</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              {t("profile.intro")}
            </p>
          </div>
        </header>

        <VisitorBanner />
        <AssistantTip className="mb-0" />
        <ProfileCompletionCard />

        <nav aria-label="Rubriques du profil" className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {profileSections.map(({ id, label, icon: Icon }) => (
            <a
              key={id}
              href={`#${id}`}
              className="flex min-h-11 items-center gap-2 rounded-xl border border-border/70 bg-card px-3 py-3 text-sm font-medium transition-colors hover:bg-accent focus-ring"
            >
              <Icon className="size-4 shrink-0 text-primary" />
              <span>{label}</span>
            </a>
          ))}
        </nav>

        <section id="personal-info" className="scroll-mt-4 space-y-4">
          <div>
            <h2 className="text-lg font-semibold">{t("profile.identityHeading")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("profile.identityHint")}
            </p>
          </div>

          {user && <AvatarCard userId={user.id} profile={profile} onChanged={refresh} />}

          <div className="card-soft space-y-4 rounded-2xl p-5">
            <div>
              <Label htmlFor="pname">{t("auth.fullName")}</Label>
              <Input id="pname" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 rounded-xl" />
            </div>
            <div>
              <Label htmlFor="pphone">{t("auth.phone")}</Label>
              <Input id="pphone" autoComplete="tel" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 rounded-xl" />
            </div>
            <div>
              <Label htmlFor="pmail">{t("auth.email")}</Label>
              <Input id="pmail" autoComplete="email" value={user?.email ?? ""} disabled className="mt-1 rounded-xl" />
              <p className="mt-1 text-xs text-muted-foreground">{t("profile.emailHint")}</p>
            </div>
            {user ? (
              <Button onClick={save} disabled={saving} className="w-full sm:w-auto">
                {saving && <Loader2 className="size-4 animate-spin" />}
                {t("profile.save")}
              </Button>
            ) : (
              <p className="rounded-xl bg-muted/60 p-3 text-sm text-muted-foreground">
                {t("profile.signInToSave")}
              </p>
            )}
          </div>
        </section>

        <section id="my-spaces" className="scroll-mt-4 space-y-4">
          <div>
            <h2 className="text-lg font-semibold">{t("profile.spacesHeading")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("profile.spacesHint")}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { icon: FolderOpen, label: t("profile.myDossiers"), hint: t("profile.myDossiersHint"), route: "/dossiers" },
              { icon: Paperclip, label: t("profile.myFiles"), hint: t("profile.myFilesHint"), route: "/files" },
            ].map(({ icon: Icon, label, hint, route }) => (
              <button
                key={route}
                onClick={() => navigate(route)}
                className="card-soft flex min-h-28 items-center gap-3 rounded-2xl p-4 text-left transition-colors hover:border-primary/40 focus-ring tap"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                  <Icon className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{label}</span>
                  <span className="mt-1 block text-caption">{hint}</span>
                </span>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </button>
            ))}
          </div>
          <p className="text-xs leading-5 text-muted-foreground">
            {t("profile.modulesNote")}
          </p>
        </section>

        <section id="my-activities" className="scroll-mt-4 space-y-4">
          <div>
            <h2 className="text-lg font-semibold">{t("profile.activitiesHeading")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("profile.activitiesHint")}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {activityOptions.map(({ id, icon: Icon }) => {
              const checked = activeActivities.includes(id);
              return (
                <label key={id} className={`card-soft flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors hover:border-primary/40 ${checked ? "border-primary/40 bg-accent/30" : "border-border/70"}`}>
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={!user || activitiesSaving}
                    onChange={() => void toggleActivity(id)}
                    className="mt-1 size-4 accent-primary"
                    aria-label={t(`profile.activity.${id}.title`)}
                  />
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-primary"><Icon className="size-5" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{t(`profile.activity.${id}.title`)}</span>
                    <span className="mt-1 block text-xs leading-5 text-muted-foreground">{t(`profile.activity.${id}.description`)}</span>
                    <span className="mt-2 block text-xs font-medium text-primary">{checked ? t("profile.activityEnabled") : t("profile.activityDisabled")}</span>
                  </span>
                </label>
              );
            })}
          </div>
          <p className="text-xs leading-5 text-muted-foreground">{activitiesSaving ? t("profile.activitiesSaving") : user ? t("profile.activitiesControlHint") : t("profile.signInToSave")}</p>
        </section>

        <section id="preferences" className="scroll-mt-4 space-y-4">
          <div>
            <h2 className="text-lg font-semibold">{t("profile.preferencesHeading")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("profile.preferencesHint")}
            </p>
          </div>

          <div className="card-soft space-y-4 rounded-2xl p-5">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Globe className="size-4 text-primary" /> {t("profile.language")}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">{t("profile.languageHint")}</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button disabled={settingsBusy} variant={i18n.language.startsWith("fr") ? "default" : "outline"} onClick={() => void setLanguage("fr")}>
                  Français
                </Button>
                <Button disabled={settingsBusy} variant={i18n.language.startsWith("en") ? "default" : "outline"} onClick={() => void setLanguage("en")}>
                  English
                </Button>
              </div>
            </div>
            <div className="border-t border-border/70 pt-4">
              <h3 className="text-sm font-semibold">{t("profile.theme")}</h3>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button disabled={settingsBusy} variant={isDark ? "outline" : "default"} onClick={() => void setTheme("light")}>
                  <Sun className="size-4" /> {t("profile.themeLight")}
                </Button>
                <Button disabled={settingsBusy} variant={isDark ? "default" : "outline"} onClick={() => void setTheme("dark")}>
                  <Moon className="size-4" /> {t("profile.themeDark")}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {user && (
          <section id="security" className="scroll-mt-4 space-y-4">
            <div>
              <h2 className="text-lg font-semibold">{t("profile.securityHeading")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("profile.securityHint")}
              </p>
            </div>
            <EmailAlertsCard userId={user.id} profile={profile} onChanged={refresh} />
            <SecurityCard email={user.email ?? null} />
            <Button
              variant="outline"
              onClick={() => void signOut()}
              className="w-full border-destructive/30 text-destructive hover:bg-destructive/5"
            >
              <LogOut className="size-4" /> {t("auth.signOut")}
            </Button>
          </section>
        )}
      </div>
    </AppLayout>
  );
}
