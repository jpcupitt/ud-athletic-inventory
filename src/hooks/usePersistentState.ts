import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';

/** Prefix for every persisted key so demo data can be wiped in one sweep. */
export const STORAGE_PREFIX = 'eqi.v1.';

/**
 * useState that survives app relaunches via localStorage.
 * Falls back to `initial()` when the key is missing or unreadable, and
 * silently skips writes if storage is full (e.g. too many item photos).
 */
export function usePersistentState<T>(
  key: string,
  initial: () => T
): [T, Dispatch<SetStateAction<T>>] {
  const storageKey = STORAGE_PREFIX + key;

  const [state, setState] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw !== null) return JSON.parse(raw) as T;
    } catch {
      /* corrupted entry — fall back to seed data */
    }
    return initial();
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      /* quota exceeded — keep running in-memory */
    }
  }, [storageKey, state]);

  // Pick up writes from other open tabs (e.g. an intake form submitted in a new tab).
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== storageKey || e.newValue === null) return;
      try {
        setState(JSON.parse(e.newValue) as T);
      } catch {
        /* ignore malformed write */
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [storageKey]);

  return [state, setState];
}

/** Wipe all persisted EQI data (used by the Settings reset button). */
export function clearPersistedState() {
  const doomed: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(STORAGE_PREFIX)) doomed.push(k);
  }
  doomed.forEach((k) => localStorage.removeItem(k));
}

/** Wipe only the given persisted keys (unprefixed, e.g. "inventory2") — used to
 *  clear out demo inventory before real data entry without touching rosters. */
export function clearPersistedKeys(keys: string[]) {
  keys.forEach((k) => localStorage.removeItem(STORAGE_PREFIX + k));
}
