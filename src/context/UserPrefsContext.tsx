import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { DashboardWidget } from '../data/types';
import { useAuth } from './AuthContext';

const DEFAULT_WIDGETS: DashboardWidget[] = [
  'notifications',
  'transaction-history',
  'inventory-chart',
  'returns-tracker',
];

interface UserPrefsContextValue {
  widgets: DashboardWidget[];
  toggleWidget: (widget: DashboardWidget) => void;
}

const UserPrefsContext = createContext<UserPrefsContextValue | null>(null);

export function UserPrefsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const storageKey = user ? `eqi-prefs-${user.id}` : null;

  const [widgets, setWidgets] = useState<DashboardWidget[]>(() => {
    if (!storageKey) return DEFAULT_WIDGETS;
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : DEFAULT_WIDGETS;
    } catch {
      return DEFAULT_WIDGETS;
    }
  });

  useEffect(() => {
    if (!storageKey) return;
    try {
      const saved = localStorage.getItem(storageKey);
      setWidgets(saved ? JSON.parse(saved) : DEFAULT_WIDGETS);
    } catch {
      setWidgets(DEFAULT_WIDGETS);
    }
  }, [storageKey]);

  function toggleWidget(widget: DashboardWidget) {
    setWidgets((prev) => {
      const next = prev.includes(widget)
        ? prev.filter((w) => w !== widget)
        : [...prev, widget];
      if (storageKey) localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  }

  return (
    <UserPrefsContext.Provider value={{ widgets, toggleWidget }}>
      {children}
    </UserPrefsContext.Provider>
  );
}

export function useUserPrefs() {
  const ctx = useContext(UserPrefsContext);
  if (!ctx) throw new Error('useUserPrefs must be used inside UserPrefsProvider');
  return ctx;
}
