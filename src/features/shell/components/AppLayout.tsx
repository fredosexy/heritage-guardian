import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { OfflineIndicator } from "./OfflineIndicator";

interface Props {
  children: ReactNode;
  hideNav?: boolean;
}

export function AppLayout({ children, hideNav }: Props) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <OfflineIndicator />
      <main className={`flex-1 ${hideNav ? "" : "pb-24"}`}>
        <div className="container-app py-4 animate-fade-in">{children}</div>
      </main>
      {!hideNav && <BottomNav />}
    </div>
  );
}
