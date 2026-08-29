/**
 * Identité locale "visiteur" : un compte anonyme porté par l'appareil.
 * Permet de consulter et de créer sans compte, puis de tout rattacher plus tard.
 */

export interface GuestIdentity {
  id: string;
  firstName?: string;
  locationName?: string;
  latitude?: number;
  longitude?: number;
  firstStepDone?: boolean;
  createdAt: number;
}

const STORAGE_KEY = "memoire.guest";

const listeners = new Set<() => void>();
let cache: GuestIdentity | null = null;

function newId(): string {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return `guest-${random}`;
}

function read(): GuestIdentity | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GuestIdentity;
    return parsed?.id ? parsed : null;
  } catch {
    return null;
  }
}

function write(value: GuestIdentity) {
  cache = value;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* stockage indisponible : on garde en mémoire */
  }
  listeners.forEach((listener) => listener());
}

/** Renvoie l'identité visiteur, en la créant au besoin. */
export function getGuestIdentity(): GuestIdentity {
  if (cache) return cache;
  const existing = read();
  if (existing) {
    cache = existing;
    return existing;
  }
  const created: GuestIdentity = { id: newId(), createdAt: Date.now() };
  write(created);
  return created;
}

export function updateGuestIdentity(patch: Partial<Omit<GuestIdentity, "id" | "createdAt">>): GuestIdentity {
  const next = { ...getGuestIdentity(), ...patch };
  write(next);
  return next;
}

export function subscribeGuestIdentity(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Après rattachement à un vrai compte, on repart d'une identité vierge. */
export function resetGuestIdentity(): void {
  cache = null;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  listeners.forEach((listener) => listener());
}
