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
  const excludedSet = useMemo(() => new Set<string>(user?.excludedSports ?? []), [user?.excludedSports]);

  function canAccess(sport: string): boolean {
    if (excludedSet.has(sport)) return false;
    return isLead || assignedSet.has(sport);
  }

  // Role scope first (which sports this account can see at all, minus any
  // explicitly excluded sport even if isLead would otherwise grant it), then
  // the sport picker next to the search bar narrows it further.
  function filterBySports<T>(items: T[], getSports: (item: T) => string[]): T[] {
    const roleScoped = (isLead ? items : items.filter((item) => getSports(item).some((s) => assignedSet.has(s))))
      .filter((item) => excludedSet.size === 0 || getSports(item).some((s) => !excludedSet.has(s)));
    if (activeSport === 'All Sports') return roleScoped;
    if (excludedSet.has(activeSport)) return [];
    return roleScoped.filter((item) => getSports(item).includes(activeSport));
  }

  const accessibleSports: Sport[] = (isLead ? ALL_SPORTS : (user?.assignedSports ?? []))
    .filter((s) => !excludedSet.has(s));

  return { isLead, canAccess, filterBySports, accessibleSports, assignedSet, excludedSet };
}
