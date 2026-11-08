import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

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
        navigateFallbackDenylist: [/^\/~oauth/, /^\/api/, /^\/auth/],
        globPatterns: ["**/*.{js,css,html,svg,png,webp,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/unpkg\.com\/maplibre-gl@6\.16\.0\/dist\/.*/i,
            handler: "CacheFirst",
            options: { cacheName: "maplibre-library", expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 30 } },
          },
          {
            urlPattern: /\/icons\/.*/,
            handler: "CacheFirst",
            options: { cacheName: "icons", expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 30 } },
          },
        ],
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
