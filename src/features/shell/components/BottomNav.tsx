import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Home, FolderOpen, Paperclip, Plus, Bell, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { centralAction } from "@/services";
import { cn } from "@/lib/utils";

/** Barre d'onglets simplifiée : 4 destinations + une action centrale contextuelle. */
export function BottomNav() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const central = centralAction(pathname);
  const CentralIcon = central.icon === "proof" ? Paperclip : Plus;

  const tabs = [
    { to: "/", icon: Home, label: t("nav.home") },
    { to: "/dossiers", icon: FolderOpen, label: t("nav.dossiers") },
    { to: "/alerts", icon: Bell, label: t("nav.alerts") },
    { to: "/profile", icon: User, label: t("nav.profile") },
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
      <div className="mx-auto max-w-md px-2 py-2 grid grid-cols-5 gap-1">
        {tabs.slice(0, 2).map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === "/"} className={tabClass}>
            <Icon className="size-5" />
            <span>{label}</span>
          </NavLink>
        ))}

        <button
          onClick={runCentral}
          aria-label={t(central.labelKey)}
          className="bg-gradient-warm text-primary-foreground shadow-warm -mt-4 mx-1 py-3 rounded-xl flex flex-col items-center justify-center pressable focus-ring tap"
        >
          <CentralIcon className="size-6" />
          <span className="sr-only">{t(central.labelKey)}</span>
        </button>

        {tabs.slice(2).map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={tabClass}>
            <Icon className="size-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
