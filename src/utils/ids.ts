import type { Sport } from '../data/types';

/** Generate a unique id for a single issuance row. Uses crypto.randomUUID when
 *  available, with a timestamp+random fallback for older environments. */
export function newIssueId(): string {
  const c = typeof crypto !== 'undefined' ? crypto : undefined;
  if (c && typeof c.randomUUID === 'function') return c.randomUUID();
  return `iss-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** First letter, skipping a leading quoted nickname (e.g. `'Tee' Johnson` -> "J")
 *  and any other non-alphabetic character — never a stray quote/hyphen/space. */
function firstLetter(name: string): string {
  const stripped = name.replace(/^['"][^'"]*['"]\s*/, '');
  return (stripped.match(/[A-Za-z]/)?.[0] ?? '').toUpperCase();
}

export const SPORT_ABBR: Partial<Record<Sport, string>> = {
  'Baseball': 'BASE', "Basketball, Men's": 'MBB', "Basketball, Women's": 'WBB',
  'Cross Country': 'XC', 'Field Hockey': 'FH', 'Football': 'FB',
  "Golf, Men's": 'MGOLF', "Golf, Women's": 'WGOLF', 'Ice Hockey': 'IH',
  "Lacrosse, Men's": 'MLAX', "Lacrosse, Women's": 'WLAX', 'Rowing': 'ROW',
  "Soccer, Men's": 'MSOC', "Soccer, Women's": 'WSOC', 'Softball': 'SB',
  "Swimming & Diving, Men's": 'MSWIM', "Swimming & Diving, Women's": 'WSWIM',
  "Tennis, Men's": 'MTEN', "Tennis, Women's": 'WTEN',
  'Track & Field, Indoor': 'TRK', 'Track & Field, Outdoor': 'TRK', 'Volleyball': 'VB',
};

/** Year + sport + initials + jersey number, e.g. "26FBNM4" (2026, Football, Nate
 *  Marsh, #4) — consistent across every sport. Falls back to appending a
 *  counter on a collision, e.g. two same-initials players with the same
 *  jersey number in the same year. */
export function smartAthleteId(sport: Sport, firstName: string, lastName: string, jersey: string, existing: Set<string>): string {
  const abbr = SPORT_ABBR[sport] ?? 'ATH';
  const yy = String(new Date().getFullYear()).slice(-2);
  const initials = `${firstLetter(firstName)}${firstLetter(lastName)}`;
  const base = jersey.trim() ? `${yy}${abbr}${initials}${jersey.trim()}` : `${yy}${abbr}${initials}`;
  if (!existing.has(base)) return base;
  let n = 2;
  let candidate = `${base}${n}`;
  while (existing.has(candidate)) { n++; candidate = `${base}${n}`; }
  return candidate;
}

/** HC for a head coach, DIR for a director-level role, EQ for equipment staff,
 *  MGR for any kind of manager, AC for everyone else (assistant/associate
 *  coaches, coordinators, analysts, position-only titles). */
function roleAbbr(title: string): string {
  const t = title.toLowerCase();
  if (t.includes('equipment')) return 'EQ';
  if (/^head\b[\s\S]*\bcoach\b/.test(t)) return 'HC';
  if (t.includes('director')) return 'DIR';
  if (t.includes('manager')) return 'MGR';
  return 'AC';
}

/** UD + sport + role (HC/AC/DIR/MGR/EQ) + initials, e.g. "UDFBHCRC" (Football
 *  Head Coach R. Carty) or "UDFBACTB" (Football Assistant Coach T. Brown).
 *  Falls back to appending a counter on a collision. */
export function smartStaffId(sport: Sport | '', title: string, firstName: string, lastName: string, existing: Set<string>): string {
  const sportCode = sport ? (SPORT_ABBR[sport] ?? '') : '';
  const role = roleAbbr(title);
  const initials = `${firstLetter(firstName)}${firstLetter(lastName)}`;
  const base = `UD${sportCode}${role}${initials}`;
  if (!existing.has(base)) return base;
  let n = 2;
  let candidate = `${base}${n}`;
  while (existing.has(candidate)) { n++; candidate = `${base}${n}`; }
  return candidate;
}
