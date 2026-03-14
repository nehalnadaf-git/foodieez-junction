/**
 * Safely reads and parses JSON from localStorage.
 */
export function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }

    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * Stores serializable data in localStorage.
 */
export function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

/**
 * Removes an item from localStorage.
 */
export function removeFromStorage(key: string): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(key);
}

/**
 * Checks whether a timestamp is older than the provided ttl.
 */
export function isExpired(timestamp: number, ttlMs: number): boolean {
  return Date.now() - timestamp > ttlMs;
}
