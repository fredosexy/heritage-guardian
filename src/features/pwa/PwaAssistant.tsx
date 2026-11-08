import { useEffect, useState } from "react";
import { Download, RefreshCw, Wifi, WifiOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { applyPwaUpdate, subscribePwaStatus } from "./registration";
import { usePwa } from "./usePwa";

type PwaNotice = "update" | "offline-ready" | "error" | null;

export function PwaAssistant() {
  const { installed, ios, android, online, canPromptInstall, install } = usePwa();
  const [notice, setNotice] = useState<PwaNotice>(null);
  const [installMessage, setInstallMessage] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => subscribePwaStatus(setNotice), []);

  const showInstall = !dismissed && !installed && (canPromptInstall || ios || android || installMessage !== null);
  if (!showInstall && !notice) return null;

  const installApp = async () => {
    try {
      const result = await install();
      if (result === "accepted") setInstallMessage("Demande acceptée. L'installation sera confirmée par le navigateur.");
      if (result === "dismissed") setInstallMessage("Installation reportée. Vous pourrez la reprendre depuis ce navigateur.");
      if (result === "unavailable") setInstallMessage("La proposition d'installation n'est plus disponible. Ouvrez le menu du navigateur pour continuer.");
    } catch {
      setInstallMessage("Le navigateur n'a pas pu lancer l'installation. Réessayez depuis son menu.");
    }
  };

  const updateApp = async () => {
    setUpdating(true);
    try {
      await applyPwaUpdate();
    } catch {
      setNotice("error");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <aside aria-label="Assistant PWA Heritis" className="fixed right-3 top-16 z-[60] w-[min(24rem,calc(100vw-1.5rem))] rounded-xl border border-border bg-card p-4 text-card-foreground shadow-xl">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {notice === "update" ? <RefreshCw className="size-5 text-primary" /> : showInstall ? <Download className="size-5 text-primary" /> : online ? <Wifi className="size-5 text-primary" /> : <WifiOff className="size-5 text-warning" />}
          <p className="font-semibold">Heritis · PWA</p>
        </div>
        <Button size="icon" variant="ghost" className="size-7 shrink-0" aria-label="Fermer l'assistant PWA" onClick={() => { setNotice(null); setInstallMessage(null); setDismissed(true); }}>
          <X className="size-4" />
        </Button>
      </div>

      {showInstall && (
        <div className="mt-3 space-y-2">
          <p className="text-sm font-medium">Emportez Heritis avec vous</p>
          {ios ? (
            <p className="text-sm text-muted-foreground">Sur iPhone ou iPad : ouvrez le menu Partager de Safari, puis choisissez « Sur l’écran d’accueil ».</p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">Installez Heritis sur votre appareil pour retrouver un accès direct depuis votre écran d’accueil.</p>
              {canPromptInstall
                ? <Button className="w-full" onClick={() => void installApp()}><Download className="mr-2 size-4" /> Installer Heritis</Button>
                : android && <p className="text-sm text-muted-foreground">Ouvrez le menu du navigateur, puis choisissez « Installer l’application » ou « Ajouter à l’écran d’accueil » si cette option est proposée.</p>}
            </>
          )}
          {installMessage && <p role="status" className="text-xs text-muted-foreground">{installMessage}</p>}
        </div>
      )}

      {notice === "update" && (
        <div className="mt-3 space-y-2">
          <p className="text-sm font-medium">Une nouvelle version est prête.</p>
          <p className="text-sm text-muted-foreground">Mettez Heritis à jour pour profiter des dernières corrections et améliorations.</p>
          <Button className="w-full" disabled={updating} onClick={() => void updateApp()}>
            <RefreshCw className={`mr-2 size-4 ${updating ? "animate-spin" : ""}`} /> {updating ? "Mise à jour…" : "Mettre à jour"}
          </Button>
        </div>
      )}

      {notice === "offline-ready" && (
        <p role="status" className="mt-3 text-sm text-muted-foreground">Les ressources essentielles de l’application sont prêtes pour une utilisation hors ligne. Les actions nécessitant le serveur attendront le retour du réseau.</p>
      )}

      {notice === "error" && (
        <p role="alert" className="mt-3 text-sm text-destructive">{online ? "La gestion de l’application ou de sa mise à jour a rencontré un problème. Rechargez la page puis réessayez." : "Vous êtes hors ligne. La mise à jour reprendra lorsque la connexion sera rétablie."}</p>
      )}
    </aside>
  );
}
