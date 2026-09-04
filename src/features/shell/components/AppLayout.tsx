import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { OfflineIndicator } from "./OfflineIndicator";

interface Props {
  children: ReactNode;
  /** Force le masquage de la barre du bas. */
  hideNav?: boolean;
}

/** Écrans principaux : ceux qui méritent la barre du bas. */
const MAIN_ROUTES = ["/", "/dossiers", "/alerts", "/profile", "/files"];

export function AppLayout({ children, hideNav }: Props) {
  const { pathname } = useLocation();
  const isMain = MAIN_ROUTES.includes(pathname);
  const showNav = !hideNav && isMain;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <OfflineIndicator />
      <main className={showNav ? "flex-1 pb-24" : "flex-1"}>
        <div className="container-app py-4 animate-fade-in">{children}</div>
      </main>
      {showNav && <BottomNav />}
    </div>
  );
}
