import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Bell, FolderOpen, Home, Paperclip, Plus, Sparkles, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { centralAction } from "@/services";
import { profilesRepo } from "@/data";
import { useAlerts } from "@/features/alerts/hooks/useAlerts";
import { useProfile } from "@/features/profile";
import { useAuth } from "@/features/identity";
import { cn } from "@/lib/utils";

/**
 * Navigation principale adaptée au statut :
 * - visiteur : Accueil, Assistant, Profil ;
 * - compte connecté : Accueil, Mes espaces, action centrale, Alertes, Profil.
 */
export function BottomNav() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isGuest = !user;
  const central = centralAction(location.pathname);
  const CentralIcon = central.icon === "proof" ? Paperclip : Plus;

  const { alerts, loadError: alertsLoadError } = useAlerts();
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

  const tabClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex min-h-12 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-xs font-medium transition-colors duration-fast tap focus-ring",
      isActive ? "bg-accent/75 text-primary" : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
    );

  const runCentral = () => {
    if (central.route.startsWith("#")) {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      document.getElementById(central.route.slice(1))?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
      return;
    }
    navigate(central.route);
  };

  return (
    <nav
      aria-label={t("nav.primaryNavigation")}
      className="fixed bottom-0 inset-x-0 z-40 border-t border-border/80 bg-card/95 pb-[env(safe-area-inset-bottom)] shadow-elegant backdrop-blur-xl"
    >
      {isGuest ? (
        <div className="mx-auto grid max-w-md grid-cols-3 gap-1 px-3 py-2">
          <NavLink to="/" end className={tabClass}>
            <Home className="size-5" />
            <span>{t("nav.home")}</span>
          </NavLink>
          <NavLink to="/assistant" className={tabClass}>
            <Sparkles className="size-5" />
            <span>{t("nav.assistant")}</span>
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
      ) : (
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1 px-3 py-2">
          <NavLink to="/" end className={tabClass}>
            <Home className="size-5" />
            <span>{t("nav.home")}</span>
          </NavLink>
          <NavLink to="/dossiers" className={tabClass}>
            <FolderOpen className="size-5" />
            <span>{t("nav.spaces")}</span>
          </NavLink>
          <button
            type="button"
            onClick={runCentral}
            aria-label={t(central.labelKey)}
            title={t(central.hintKey)}
            className="-mt-4 mx-1 flex min-h-12 items-center justify-center rounded-xl bg-primary py-3 text-primary-foreground shadow-warm pressable focus-ring tap transition-transform duration-fast hover:brightness-110"
          >
            <CentralIcon className="size-6" aria-hidden="true" />
          </button>
          <NavLink
            to="/alerts"
            className={tabClass}
            aria-label={`${t("nav.alerts")}${alertsLoadError ? ` — ${t("auth.error")}` : unreadCount > 0 ? ` — ${t("nav.alertsUnread", { count: unreadCount })}` : ""}`}
          >
            <span className="relative">
              <Bell className="size-5" />
              {alertsLoadError ? (
                <span aria-hidden="true" className="absolute -top-1.5 -right-2 size-2 rounded-full bg-warning ring-2 ring-card" />
              ) : unreadCount > 0 && (
                <span aria-hidden="true" className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 text-[9px] rounded-full bg-destructive text-destructive-foreground flex items-center justify-center font-bold">
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
      )}
    </nav>
  );
}
