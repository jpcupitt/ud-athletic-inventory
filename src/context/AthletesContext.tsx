import { createContext, useContext, type ReactNode } from 'react';
import type { Athlete, CustomSizeEntry, IssuedItem } from '../data/types';
import { athletes as mockAthletes } from '../data/mock/athletes';
import { usePersistentState } from '../hooks/usePersistentState';

interface AthletesContextValue {
  athletes: Athlete[];
  addAthlete: (athlete: Athlete) => void;
  issueToAthlete: (athleteId: string, item: IssuedItem) => void;
  returnFromAthlete: (athleteId: string, itemId: string) => void;
  resolveIssuedItem: (athleteId: string, ref: string, resolution: 'returned' | 'missing' | 'damaged') => void;
  unresolveIssuedItem: (athleteId: string, ref: string) => void;
  setCustomSizes: (athleteId: string, sizes: CustomSizeEntry[]) => void;
}

const AthletesContext = createContext<AthletesContextValue | null>(null);

export function AthletesProvider({ children }: { children: ReactNode }) {
  const [athletes, setAthletes] = usePersistentState<Athlete[]>('athletes', () => [...mockAthletes]);

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

  return (
    <AthletesContext.Provider value={{ athletes, addAthlete, issueToAthlete, returnFromAthlete, resolveIssuedItem, unresolveIssuedItem, setCustomSizes }}>
      {children}
    </AthletesContext.Provider>
  );
}

export function useAthletes() {
  const ctx = useContext(AthletesContext);
  if (!ctx) throw new Error('useAthletes must be used within AthletesProvider');
  return ctx;
}
