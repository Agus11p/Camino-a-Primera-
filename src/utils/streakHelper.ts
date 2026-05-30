import { ActivityLog } from '../types';

export function calculateStreak(logs: ActivityLog[]): number {
  if (logs.length === 0) return 0;

  // Extract date strings (YYYY-MM-DD) and get unique sorted descendnig
  const uniqueDates = Array.from(
    new Set(logs.map((log) => log.fecha))
  ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  if (uniqueDates.length === 0) return 0;

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayStr = new Date(Date.now() - 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const newestSavedDate = uniqueDates[0];

  // If the latest log is older than yesterday, the streak is broken (0)
  if (newestSavedDate !== todayStr && newestSavedDate !== yesterdayStr) {
    return 0;
  }

  let streak = 1;
  let currentDate = new Date(newestSavedDate);

  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = new Date(uniqueDates[i]);
    const diffTime = Math.abs(currentDate.getTime() - prevDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      streak++;
      currentDate = prevDate;
    } else if (diffDays > 1) {
      break; // Gap detected, streak ends here
    }
  }

  return streak;
}
