export const pwaRuntimeCaching = [
  {
    urlPattern: /^https:\/\/unpkg\.com\/maplibre-gl@6\.16\.0\/dist\/.*/i,
    handler: "CacheFirst" as const,
    options: { cacheName: "maplibre-library", expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 30 } },
  },
  {
    urlPattern: ({ url }: { url: URL }) => url.origin === self.location.origin && url.pathname.startsWith("/icons/"),
    handler: "CacheFirst" as const,
    options: { cacheName: "icons", expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 30 } },
  },
];
