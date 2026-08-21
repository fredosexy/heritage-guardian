import { createRoot } from "react-dom/client";
import App from "./app/App";
import "./index.css";
import { initSyncListeners } from "./data/offline/sync";

// PWA service worker registration — guarded against Lovable preview iframe
const isInIframe = (() => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
})();
const isPreviewHost =
  window.location.hostname.includes("id-preview--") ||
  window.location.hostname.includes("lovableproject.com") ||
  window.location.hostname.includes("lovable.app") && window.location.hostname.includes("id-preview");

if (isPreviewHost || isInIframe) {
  // Clean up any previously registered SW so it cannot poison the preview
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => r.unregister()));
  }
} else if ("serviceWorker" in navigator && import.meta.env.PROD) {
  import("virtual:pwa-register").then(({ registerSW }) => {
    registerSW({ immediate: true });
  }).catch(() => {});
}

// Always init offline sync listeners (works without SW)
initSyncListeners();

createRoot(document.getElementById("root")!).render(<App />);
