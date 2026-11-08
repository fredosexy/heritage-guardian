import { useCallback, useEffect, useState } from "react";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

let pendingInstallPrompt: InstallPromptEvent | null = null;
let installationConfirmed = false;
const installPromptListeners = new Set<(event: InstallPromptEvent) => void>();

function captureInstallPrompt(event: Event) {
  event.preventDefault();
  pendingInstallPrompt = event as InstallPromptEvent;
  installPromptListeners.forEach((listener) => listener(pendingInstallPrompt!));
}

// Capture before React mounts: startup cache cleanup and SW registration may delay the UI.
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", captureInstallPrompt);
  window.addEventListener("appinstalled", () => { pendingInstallPrompt = null; installationConfirmed = true; });
}

function subscribeToInstallPrompt(listener: (event: InstallPromptEvent) => void) {
  installPromptListeners.add(listener);
  if (pendingInstallPrompt) listener(pendingInstallPrompt);
  return () => { installPromptListeners.delete(listener); };
}

function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;
  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
  return installationConfirmed || window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: minimal-ui)").matches ||
    navigatorWithStandalone.standalone === true;
}

function isAppleMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

export function usePwa() {
  const [installed, setInstalled] = useState(isStandaloneDisplay);
  const [ios, setIos] = useState(isAppleMobileDevice);
  const [android, setAndroid] = useState(typeof navigator !== "undefined" && /android/i.test(navigator.userAgent));
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(pendingInstallPrompt);
  const [online, setOnline] = useState(typeof navigator === "undefined" ? true : navigator.onLine);

  useEffect(() => {
    const displayMode = window.matchMedia("(display-mode: standalone)");
    const updateDisplayMode = () => setInstalled(isStandaloneDisplay());
    const handleInstalled = () => {
      pendingInstallPrompt = null;
      installationConfirmed = true;
      setInstalled(true);
      setInstallPrompt(null);
    };
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    const unsubscribeInstallPrompt = subscribeToInstallPrompt(setInstallPrompt);

    displayMode.addEventListener?.("change", updateDisplayMode);
    window.addEventListener("appinstalled", handleInstalled);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    setIos(isAppleMobileDevice());
    setAndroid(/android/i.test(navigator.userAgent));
    updateDisplayMode();

    return () => {
      unsubscribeInstallPrompt();
      displayMode.removeEventListener?.("change", updateDisplayMode);
      window.removeEventListener("appinstalled", handleInstalled);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const install = useCallback(async (): Promise<"accepted" | "dismissed" | "unavailable"> => {
    if (!installPrompt) return "unavailable";
    const prompt = installPrompt;
    pendingInstallPrompt = null;
    setInstallPrompt(null);
    await prompt.prompt();
    const choice = await prompt.userChoice;
    return choice.outcome;
  }, [installPrompt]);

  return {
    installed,
    ios,
    android,
    online,
    canPromptInstall: installPrompt !== null,
    install,
  };
}
