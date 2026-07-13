import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

export function useSportsAccess() {
  const { user } = useAuth();

  const isLead = user?.isLead ?? false;
  const assignedSet = useMemo(() => new Set<string>(user?.assignedSports ?? []), [user?.assignedSports]);

  function canAccess(sport: string): boolean {
    return isLead || assignedSet.has(sport);
  }

  function filterBySports<T>(items: T[], getSports: (item: T) => string[]): T[] {
    if (isLead) return items;
    return items.filter((item) => getSports(item).some((s) => assignedSet.has(s)));
  }

  const accessibleSports = isLead
    ? (user?.assignedSports ?? [])
    : (user?.assignedSports ?? []);

  return { isLead, canAccess, filterBySports, accessibleSports, assignedSet };
}
