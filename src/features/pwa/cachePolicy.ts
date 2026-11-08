const LEGACY_PRIVATE_CACHE_NAMES = ["supabase-storage"];

export async function clearLegacyPrivatePwaCaches(): Promise<void> {
  if (typeof caches === "undefined") return;
  await Promise.all(LEGACY_PRIVATE_CACHE_NAMES.map((name) => caches.delete(name)));
}
