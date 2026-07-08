import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import type { Sport } from '../data/types';

const ALL_SPORTS: Sport[] = [
  'Baseball', "Basketball, Men's", "Basketball, Women's", 'Cross Country', 'Field Hockey',
  'Football', "Golf, Men's", "Golf, Women's", 'Ice Hockey', "Lacrosse, Men's", "Lacrosse, Women's",
  'Rowing', "Soccer, Men's", "Soccer, Women's", 'Softball', "Swimming & Diving, Men's",
  "Swimming & Diving, Women's", "Tennis, Men's", "Tennis, Women's", 'Track & Field, Indoor',
  'Track & Field, Outdoor', 'Volleyball',
];

export function useSportsAccess() {
  const { user } = useAuth();

  const isLead = user?.isLead ?? false;
  const assignedSet = useMemo<Set<string>>(() => new Set<string>(user?.assignedSports ?? []), [user?.assignedSports]);

  function canAccess(sport: string): boolean {
    return isLead || assignedSet.has(sport);
  }

  function filterBySports<T>(items: T[], getSports: (item: T) => string[]): T[] {
    if (isLead) return items;
    return items.filter((item) => getSports(item).some((s) => assignedSet.has(s)));
  }

  const accessibleSports: Sport[] = isLead
    ? ALL_SPORTS
    : (user?.assignedSports ?? []);

  return { isLead, canAccess, filterBySports, accessibleSports, assignedSet };
}
