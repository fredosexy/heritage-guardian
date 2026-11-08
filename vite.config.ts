import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";
import { pwaRuntimeCaching } from "./src/features/pwa/workboxConfig";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "prompt",
      injectRegister: null,
      devOptions: { enabled: false },
      manifest: false,
      workbox: {
        // The activation hook removes the legacy private cache at the actual
        // service-worker handover, not only during page bootstrap.
        importScripts: ["/pwa-legacy-cache-cleanup.js"],
        navigateFallbackDenylist: [/^\/~oauth/, /^\/api/, /^\/auth/],
        globPatterns: ["**/*.{js,css,html,svg,png,jpg,jpeg,webp,woff2,webmanifest}"],
        runtimeCaching: pwaRuntimeCaching,
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
