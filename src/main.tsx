import { createRoot } from "react-dom/client";
import App from "./app/App";
import "./index.css";
import { initSyncListeners } from "./data/offline/sync";
import { clearLegacyPrivatePwaCaches } from "./features/pwa/cachePolicy";
import { setPwaUpdateWorker } from "./features/pwa/registration";

const dispatchPwaEvent = (name: string) => window.dispatchEvent(new Event(name));

// PWA is intentionally disabled in embedded Lovable previews.
const isInIframe = (() => {
  try { return window.self !== window.top; } catch { return true; }
})();
const isPreviewHost =
  window.location.hostname.includes("id-preview--") ||
  window.location.hostname.includes("lovableproject.com") ||
  (window.location.hostname.includes("lovable.app") && window.location.hostname.includes("id-preview"));

if (isPreviewHost || isInIframe) {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations
        .filter((registration) => {
          const scope = new URL(registration.scope);
          return scope.origin === window.location.origin && scope.pathname === "/";
        })
        .forEach((registration) => void registration.unregister());
    }).catch(() => undefined);
  }
} else if ("serviceWorker" in navigator && import.meta.env.PROD) {
  void clearLegacyPrivatePwaCaches().catch(() => dispatchPwaEvent("heritis:pwa-error"));

  import("virtual:pwa-register").then(({ registerSW }) => {
    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh() { dispatchPwaEvent("heritis:pwa-update"); },
      onOfflineReady() { dispatchPwaEvent("heritis:pwa-offline-ready"); },
      onRegisterError() { dispatchPwaEvent("heritis:pwa-error"); },
      onRegisteredSW(_swUrl, registration) {
        if (!registration) return;
        const checkForUpdate = () => {
          if (document.visibilityState === "visible" && navigator.onLine) {
            void registration.update().catch(() => dispatchPwaEvent("heritis:pwa-error"));
          }
        };
        document.addEventListener("visibilitychange", checkForUpdate);
      },
    });
    setPwaUpdateWorker(updateSW);
  }).catch(() => dispatchPwaEvent("heritis:pwa-error"));
}

initSyncListeners();
createRoot(document.getElementById("root")!).render(<App />);
