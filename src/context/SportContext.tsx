import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { usePersistentState } from '../hooks/usePersistentState';
import { useSportsAccess } from '../hooks/useSportsAccess';
import type { Sport } from '../data/types';

export type ActiveSport = Sport | 'All Sports';

interface SportContextValue {
  activeSport: ActiveSport;
  setActiveSport: (s: ActiveSport) => void;
}

const SportContext = createContext<SportContextValue | null>(null);

/**
 * One app-wide "which team am I working on" selection, shared by every page
 * that filters by sport and remembered across sessions.
 */
export function SportProvider({ children }: { children: ReactNode }) {
  const { canAccess } = useSportsAccess();
  const [activeSport, setActiveSport] = usePersistentState<ActiveSport>('activeSport', () => 'All Sports');

  // If the persisted sport is no longer accessible (role change), fall back.
  useEffect(() => {
    if (activeSport !== 'All Sports' && !canAccess(activeSport)) {
      setActiveSport('All Sports');
    }
  }, [activeSport]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <SportContext.Provider value={{ activeSport, setActiveSport }}>
      {children}
    </SportContext.Provider>
  );
}

export function useActiveSport() {
  const ctx = useContext(SportContext);
  if (!ctx) throw new Error('useActiveSport must be used within SportProvider');
  return ctx;
}
