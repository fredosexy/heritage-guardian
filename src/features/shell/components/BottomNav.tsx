import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Bell, FolderOpen, Home, Paperclip, Plus, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { centralAction } from "@/services";
import { profilesRepo } from "@/data";
import { useAlerts } from "@/features/alerts/hooks/useAlerts";
import { useProfile } from "@/features/profile";
import { cn } from "@/lib/utils";

/**
 * Barre d'onglets : Accueil, Dossiers, action centrale contextuelle,
 * Alertes (badge non lus) et Profil (avatar). Rien dans l'en-tête.
 */
export function BottomNav() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const central = centralAction(pathname);
  const CentralIcon = central.icon === "proof" ? Paperclip : Plus;

  const { alerts } = useAlerts();
  const unreadCount = alerts.filter((a) => !a.read).length;

  const { profile } = useProfile();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    if (!profile?.avatar_url) {
      setAvatarUrl(null);
      return;
    }
    profilesRepo
      .getAvatarUrl(profile.avatar_url)
      .then((url) => {
        if (!cancelled) setAvatarUrl(url);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [profile?.avatar_url]);

  const left = [
    { to: "/", icon: Home, label: t("nav.home") },
    { to: "/dossiers", icon: FolderOpen, label: t("nav.dossiers") },
  ];

  const runCentral = () => {
    if (central.route.startsWith("#")) {
      document.getElementById(central.route.slice(1))?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    navigate(central.route);
  };

  const tabClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex flex-col items-center justify-center gap-1 py-2 rounded-xl text-xs font-medium transition-colors tap focus-ring",
      isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
    );

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur border-t border-border shadow-elegant">
      <div className="mx-auto max-w-md px-3 py-2 grid grid-cols-5 gap-1">
        {left.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end className={tabClass}>
            <Icon className="size-5" />
            <span>{label}</span>
          </NavLink>
        ))}

        <button
          onClick={runCentral}
          aria-label={t(central.labelKey)}
          className="bg-gradient-warm text-primary-foreground shadow-warm -mt-4 mx-1 py-3 rounded-2xl flex items-center justify-center pressable focus-ring tap"
        >
          <CentralIcon className="size-6" />
          <span className="sr-only">{t(central.labelKey)}</span>
        </button>

        <NavLink to="/alerts" className={tabClass}>
          <span className="relative">
            <Bell className="size-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 text-[9px] rounded-full bg-destructive text-destructive-foreground flex items-center justify-center font-bold">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </span>
          <span>{t("nav.alerts")}</span>
        </NavLink>

        <NavLink to="/profile" className={tabClass}>
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="size-5 rounded-full object-cover" loading="lazy" />
          ) : (
            <User className="size-5" />
          )}
          <span>{t("nav.profile")}</span>
        </NavLink>
      </div>
    </nav>
  );
}
