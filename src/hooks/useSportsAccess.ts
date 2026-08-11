import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useActiveSport } from '../context/SportContext';
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
  const { activeSport } = useActiveSport();

  const isLead = user?.isLead ?? false;
  const assignedSet = useMemo(() => new Set<string>(user?.assignedSports ?? []), [user?.assignedSports]);

  function canAccess(sport: string): boolean {
    return isLead || assignedSet.has(sport);
  }

  // Role scope first (which sports this account can see at all), then the
  // sport picker next to the search bar narrows it further — pick a specific
  // team there and every page that scopes its data this way shows only that team.
  function filterBySports<T>(items: T[], getSports: (item: T) => string[]): T[] {
    const roleScoped = isLead ? items : items.filter((item) => getSports(item).some((s) => assignedSet.has(s)));
    if (activeSport === 'All Sports') return roleScoped;
    return roleScoped.filter((item) => getSports(item).includes(activeSport));
  }

  const accessibleSports: Sport[] = isLead
    ? ALL_SPORTS
    : (user?.assignedSports ?? []);

  return { isLead, canAccess, filterBySports, accessibleSports, assignedSet };
}
