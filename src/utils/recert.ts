import type { RecertPolicy, RecertUnit } from '../data/types';

export type RecertStatus = 'ok' | 'due-soon' | 'overdue';

const DUE_SOON_WINDOW_DAYS = 60;

export function recertDueDate(unit: RecertUnit, policy: RecertPolicy): Date {
  const due = new Date(unit.lastCertifiedDate + 'T00:00:00');
  due.setMonth(due.getMonth() + policy.intervalMonths);
  return due;
}

export function recertStatus(unit: RecertUnit, policy: RecertPolicy): RecertStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = recertDueDate(unit, policy);
  const days = Math.round((due.getTime() - today.getTime()) / 86400000);
  if (days < 0) return 'overdue';
  if (days <= DUE_SOON_WINDOW_DAYS) return 'due-soon';
  return 'ok';
}

export const RECERT_STATUS_STYLE: Record<RecertStatus, { label: string; bg: string; text: string }> = {
  ok: { label: 'OK', bg: '#dcfce7', text: '#166534' },
  'due-soon': { label: 'Due Soon', bg: '#fef3c7', text: '#92400e' },
  overdue: { label: 'Overdue', bg: '#fee2e2', text: '#991b1b' },
};
