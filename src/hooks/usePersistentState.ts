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
