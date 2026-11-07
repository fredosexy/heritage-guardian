import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { OfflineIndicator } from "./OfflineIndicator";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface Props {
  children: ReactNode;
  /** Force le masquage de la barre du bas. */
  hideNav?: boolean;
  /** Render a viewport-filling shell without shared chrome or page gutters. */
  fullScreen?: boolean;
}

/** Shell partagé : fond, contrôle du thème, contenu et navigation principale. */
const MAIN_ROUTES = ["/", "/dossiers", "/alerts", "/profile", "/files"];

export function AppLayout({ children, hideNav, fullScreen = false }: Props) {
  const { pathname } = useLocation();
  const showNav = !hideNav && MAIN_ROUTES.includes(pathname);

  return (
    <div className={fullScreen ? "flex h-[100dvh] min-h-0 flex-col overflow-hidden bg-background text-foreground" : "min-h-screen flex flex-col bg-background text-foreground"}>
      <OfflineIndicator />
      {!fullScreen && (
        <header className="relative z-30 mx-auto flex w-full max-w-6xl justify-end px-page pt-3 sm:pt-4">
          <ThemeToggle />
        </header>
      )}
      <main className={fullScreen ? "flex-1 min-h-0" : showNav ? "flex-1 pb-24" : "flex-1"}>
        <div className={fullScreen ? "h-full min-h-0" : "container-app py-5 sm:py-7 animate-fade-in"}>{children}</div>
      </main>
      {showNav && <BottomNav />}
    </div>
  );
}
