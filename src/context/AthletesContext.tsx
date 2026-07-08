import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Athlete, IssuedItem } from '../data/types';
import { athletes as mockAthletes } from '../data/mock/athletes';

interface AthletesContextValue {
  athletes: Athlete[];
  addAthlete: (athlete: Athlete) => void;
  issueToAthlete: (athleteId: string, item: IssuedItem) => void;
  returnFromAthlete: (athleteId: string, itemId: string) => void;
}

const AthletesContext = createContext<AthletesContextValue | null>(null);

export function AthletesProvider({ children }: { children: ReactNode }) {
  const [athletes, setAthletes] = useState<Athlete[]>([...mockAthletes]);

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

  return (
    <AthletesContext.Provider value={{ athletes, addAthlete, issueToAthlete, returnFromAthlete }}>
      {children}
    </AthletesContext.Provider>
  );
}

export function useAthletes() {
  const ctx = useContext(AthletesContext);
  if (!ctx) throw new Error('useAthletes must be used within AthletesProvider');
  return ctx;
}
