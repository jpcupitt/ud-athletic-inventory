import { createContext, useContext, type ReactNode } from 'react';
import { usePersistentState } from '../hooks/usePersistentState';
import type { Sport } from '../data/types';

export interface IntakeSubmission {
  firstName: string;
  lastName: string;
  jersey: string;
  position: string;
  shirtSize: string;
  shortsSize: string;
  shoeSize: string;
  gloveSize: string;
  cleatSize: string;
  practiceJerseySize: string;
  practicePantSize: string;
  notes: string;
  submittedAt: string;
}

export interface PendingIntake {
  token: string;
  sport: Sport;
  lastName: string;
  status: 'pending' | 'submitted' | 'approved';
  submission?: IntakeSubmission;
  createdAt: string;
}

interface PendingIntakesContextValue {
  pendingIntakes: PendingIntake[];
  /** Creates one intake link for a given athlete (sport + last name, used to
   *  identify them when the manager reviews the submission). */
  createIntakeLink: (sport: Sport, lastName: string) => { token: string; url: string };
  getIntake: (token: string) => PendingIntake | undefined;
  submitIntake: (token: string, submission: IntakeSubmission) => void;
  markApproved: (token: string) => void;
  dismissIntake: (token: string) => void;
}

const PendingIntakesContext = createContext<PendingIntakesContextValue | null>(null);

function newToken(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

/** Builds the shareable intake URL, matching however this app is currently hosted
 *  (dev server root, or the GitHub Pages subpath). */
export function intakeUrl(token: string): string {
  return `${window.location.origin}${import.meta.env.BASE_URL}intake/${token}`;
}

export function PendingIntakesProvider({ children }: { children: ReactNode }) {
  const [pendingIntakes, setPendingIntakes] = usePersistentState<PendingIntake[]>('pendingIntakes', () => []);

  function createIntakeLink(sport: Sport, lastName: string): { token: string; url: string } {
    const token = newToken();
    setPendingIntakes((prev) => [
      { token, sport, lastName, status: 'pending', createdAt: new Date().toISOString() },
      ...prev,
    ]);
    return { token, url: intakeUrl(token) };
  }

  function getIntake(token: string) {
    return pendingIntakes.find((i) => i.token === token);
  }

  function submitIntake(token: string, submission: IntakeSubmission) {
    setPendingIntakes((prev) => prev.map((i) => (i.token === token ? { ...i, status: 'submitted', submission } : i)));
  }

  function markApproved(token: string) {
    setPendingIntakes((prev) => prev.map((i) => (i.token === token ? { ...i, status: 'approved' } : i)));
  }

  function dismissIntake(token: string) {
    setPendingIntakes((prev) => prev.filter((i) => i.token !== token));
  }

  return (
    <PendingIntakesContext.Provider value={{ pendingIntakes, createIntakeLink, getIntake, submitIntake, markApproved, dismissIntake }}>
      {children}
    </PendingIntakesContext.Provider>
  );
}

export function usePendingIntakes() {
  const ctx = useContext(PendingIntakesContext);
  if (!ctx) throw new Error('usePendingIntakes must be used within PendingIntakesProvider');
  return ctx;
}
