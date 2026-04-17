import { NavLink } from "react-router-dom";
import { Home, FolderOpen, Plus, Bell, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const { t } = useTranslation();
  const items = [
    { to: "/", icon: Home, label: t("nav.home") },
    { to: "/dossiers", icon: FolderOpen, label: t("nav.dossiers") },
    { to: "/create", icon: Plus, label: t("nav.create"), primary: true },
    { to: "/alerts", icon: Bell, label: t("nav.alerts") },
    { to: "/profile", icon: User, label: t("nav.profile") },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur border-t border-border shadow-elegant">
      <div className="mx-auto max-w-md px-2 py-2 grid grid-cols-5 gap-1">
        {items.map(({ to, icon: Icon, label, primary }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-1 py-2 rounded-xl text-xs font-medium transition-colors",
                primary
                  ? "bg-gradient-warm text-primary-foreground shadow-warm -mt-4 mx-1 py-3"
                  : isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            <Icon className={cn(primary ? "size-6" : "size-5")} />
            <span className={cn(primary && "sr-only")}>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
