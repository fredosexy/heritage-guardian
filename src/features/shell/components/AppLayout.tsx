import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { OfflineIndicator } from "./OfflineIndicator";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface Props {
  children: ReactNode;
  /** Force le masquage de la barre du bas. */
  hideNav?: boolean;
}

/** Shell partagé : fond, contrôle du thème, contenu et navigation principale. */
const MAIN_ROUTES = ["/", "/dossiers", "/alerts", "/profile", "/files"];

export function AppLayout({ children, hideNav }: Props) {
  const pathname = window.location.pathname;
  const showNav = !hideNav && MAIN_ROUTES.includes(pathname);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <OfflineIndicator />
      <header className="relative z-30 mx-auto flex w-full max-w-6xl justify-end px-page pt-3 sm:pt-4">
        <ThemeToggle />
      </header>
      <main className={showNav ? "flex-1 pb-24" : "flex-1"}>
        <div className="container-app py-5 sm:py-7 animate-fade-in">{children}</div>
      </main>
      {showNav && <BottomNav />}
    </div>
  );
}
