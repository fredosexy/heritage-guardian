import { createRoot } from "react-dom/client";
import App from "./app/App";
import "./index.css";
import { initSyncListeners } from "./data/offline/sync";
import { clearLegacyPrivatePwaCaches } from "./features/pwa/cachePolicy";
import { publishPwaStatus, setPwaUpdateWorker } from "./features/pwa/registration";

const isInIframe = (() => {
  try { return window.self !== window.top; } catch { return true; }
})();
const isPreviewHost =
  window.location.hostname.includes("id-preview--") ||
  window.location.hostname.includes("lovableproject.com") ||
  (window.location.hostname.includes("lovable.app") && window.location.hostname.includes("id-preview"));

async function bootstrap() {
  if (isPreviewHost || isInIframe) {
    if ("serviceWorker" in navigator) {
      await navigator.serviceWorker.getRegistrations().then((registrations) =>
        Promise.all(registrations
          .filter((registration) => {
            const scope = new URL(registration.scope);
            return scope.origin === window.location.origin && scope.pathname === "/";
          })
          .map((registration) => registration.unregister())),
      ).catch(() => undefined);
    }
  } else if ("serviceWorker" in navigator && import.meta.env.PROD) {
    try {
      // Remove responses cached by the previous broad Supabase Storage rule
      // before rendering any screen that could request private resources.
      await clearLegacyPrivatePwaCaches();
    } catch {
      publishPwaStatus("error");
    }

    try {
      const { registerSW } = await import("virtual:pwa-register");
      const updateSW = registerSW({
        immediate: true,
        onNeedRefresh() { publishPwaStatus("update"); },
        onOfflineReady() { publishPwaStatus("offline-ready"); },
        onRegisterError() { publishPwaStatus("error"); },
        onRegisteredSW(_swUrl, registration) {
          if (!registration) return;
          const checkForUpdate = () => {
            if (document.visibilityState === "visible" && navigator.onLine) {
              void registration.update().catch(() => publishPwaStatus("error"));
            }
          };
          document.addEventListener("visibilitychange", checkForUpdate);
        },
      });
      setPwaUpdateWorker(updateSW);
    } catch {
      publishPwaStatus("error");
    }
  }

  // Offline sync remains independent from service-worker availability.
  initSyncListeners();
  createRoot(document.getElementById("root")!).render(<App />);
}

void bootstrap();
