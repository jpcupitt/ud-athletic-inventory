import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { Athlete, CustomSizeEntry, IssuedItem } from '../data/types';
import { athletes as mockAthletes } from '../data/mock/athletes';
import { usePersistentState } from '../hooks/usePersistentState';

const mockAthleteById = new Map(mockAthletes.map((a) => [a.id, a]));

interface AthletesContextValue {
  athletes: Athlete[];
  addAthlete: (athlete: Athlete) => void;
  issueToAthlete: (athleteId: string, item: IssuedItem) => void;
  returnFromAthlete: (athleteId: string, itemId: string) => void;
  resolveIssuedItem: (athleteId: string, ref: string, resolution: 'returned' | 'missing' | 'damaged') => void;
  unresolveIssuedItem: (athleteId: string, ref: string) => void;
  setCustomSizes: (athleteId: string, sizes: CustomSizeEntry[]) => void;
  updateAthlete: (athleteId: string, changes: Partial<Athlete>) => void;
}

const AthletesContext = createContext<AthletesContextValue | null>(null);

export function AthletesProvider({ children }: { children: ReactNode }) {
  const [athletesRaw, setAthletes] = usePersistentState<Athlete[]>('athletes2', () => [...mockAthletes]);

  // A returning browser's persisted copy can predate a mock-data refresh (new
  // ID scheme, new photos). Forward-sync those two identity fields from the
  // current seed on every load, for any record this app itself seeded —
  // user-added athletes (not in mockAthletes) are left untouched.
  const athletes = useMemo(() => athletesRaw.map((a) => {
    const seed = mockAthleteById.get(a.id);
    if (!seed) return a;
    if (seed.athleteId === a.athleteId && seed.photoUrl === a.photoUrl) return a;
    return { ...a, athleteId: seed.athleteId, photoUrl: seed.photoUrl };
  }), [athletesRaw]);

  function addAthlete(athlete: Athlete) {
    setAthletes((prev) => [athlete, ...prev]);
  }

  function issueToAthlete(athleteId: string, item: IssuedItem) {
    setAthletes((prev) =>
      prev.map((a) =>
        a.id === athleteId
          ? { ...a, issuedItems: [item, ...a.issuedItems] }
          : a
      )
    );
  }

  function returnFromAthlete(athleteId: string, itemId: string) {
    setAthletes((prev) =>
      prev.map((a) =>
        a.id === athleteId
          ? {
              ...a,
              issuedItems: a.issuedItems.map((i) =>
                i.itemId === itemId ? { ...i, returned: true } : i
              ),
            }
          : a
      )
    );
  }

  function resolveIssuedItem(athleteId: string, ref: string, resolution: 'returned' | 'missing' | 'damaged') {
    setAthletes((prev) =>
      prev.map((a) => {
        if (a.id !== athleteId) return a;
        // Resolve exactly one row: prefer a matching issueId, else the first
        // unresolved row with this itemId (legacy/seed rows have no issueId).
        const idx = a.issuedItems.findIndex(
          (i) => !i.returned && (i.issueId === ref || (!i.issueId && i.itemId === ref))
        );
        if (idx === -1) return a;
        return {
          ...a,
          issuedItems: a.issuedItems.map((i, n) =>
            n === idx ? { ...i, returned: true, resolution } : i
          ),
        };
      })
    );
  }

  function unresolveIssuedItem(athleteId: string, ref: string) {
    setAthletes((prev) =>
      prev.map((a) => {
        if (a.id !== athleteId) return a;
        const idx = a.issuedItems.findIndex(
          (i) => i.resolution && (i.issueId === ref || (!i.issueId && i.itemId === ref))
        );
        if (idx === -1) return a;
        return {
          ...a,
          issuedItems: a.issuedItems.map((i, n) =>
            n === idx ? { ...i, returned: false, resolution: undefined } : i
          ),
        };
      })
    );
  }

  function setCustomSizes(athleteId: string, sizes: CustomSizeEntry[]) {
    setAthletes((prev) => prev.map((a) => (a.id === athleteId ? { ...a, customSizes: sizes } : a)));
  }

  function updateAthlete(athleteId: string, changes: Partial<Athlete>) {
    setAthletes((prev) => prev.map((a) => (a.id === athleteId ? { ...a, ...changes } : a)));
  }

  return (
    <AthletesContext.Provider value={{ athletes, addAthlete, issueToAthlete, returnFromAthlete, resolveIssuedItem, unresolveIssuedItem, setCustomSizes, updateAthlete }}>
      {children}
    </AthletesContext.Provider>
  );
}

export function useAthletes() {
  const ctx = useContext(AthletesContext);
  if (!ctx) throw new Error('useAthletes must be used within AthletesProvider');
  return ctx;
}
