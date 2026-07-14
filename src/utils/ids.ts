/** Generate a unique id for a single issuance row. Uses crypto.randomUUID when
 *  available, with a timestamp+random fallback for older environments. */
export function newIssueId(): string {
  const c = typeof crypto !== 'undefined' ? crypto : undefined;
  if (c && typeof c.randomUUID === 'function') return c.randomUUID();
  return `iss-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
