import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Home, FolderOpen, Paperclip, Plus, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { centralAction } from "@/services";
import { cn } from "@/lib/utils";

/**
 * Barre d'onglets minimale : 3 destinations + une action centrale contextuelle.
 * Alertes et Profil vivent dans l'en-tête, jamais ici.
 */
export function BottomNav() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const central = centralAction(pathname);
  const CentralIcon = central.icon === "proof" ? Paperclip : Plus;

  const left = [{ to: "/", icon: Home, label: t("nav.home") }];
  const right = [
    { to: "/dossiers", icon: FolderOpen, label: t("nav.dossiers") },
    { to: "/assistant", icon: Sparkles, label: t("nav.assistant") },
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
      <div className="mx-auto max-w-md px-3 py-2 grid grid-cols-4 gap-1">
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

        {right.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={tabClass}>
            <Icon className="size-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
