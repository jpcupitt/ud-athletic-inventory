/** "due in 3 days" / "due today" / "5 days overdue" — reads instantly, no date math for the user. */
export function relativeDueDate(dateStr: string): { label: string; overdue: boolean } {
  const due = new Date(dateStr + (dateStr.length === 10 ? 'T00:00:00' : ''));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const days = Math.round((due.getTime() - today.getTime()) / 86400000);
  if (days === 0) return { label: 'due today', overdue: false };
  if (days === 1) return { label: 'due tomorrow', overdue: false };
  if (days > 1) return { label: `due in ${days} days`, overdue: false };
  if (days === -1) return { label: '1 day overdue', overdue: true };
  return { label: `${-days} days overdue`, overdue: true };
}
