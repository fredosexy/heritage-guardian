// Runs in the generated Workbox service worker context.
// Cache deletion is tied to activation so it happens at the worker handover,
// after the legacy worker stops being the active fetch handler.
self.addEventListener("activate", (event) => {
  event.waitUntil(caches.delete("supabase-storage"));
});
