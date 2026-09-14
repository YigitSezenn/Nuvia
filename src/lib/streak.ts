import { shiftDayKey, todayKey } from "./date";
import type { CheckIn } from "./types";

function dateSetForHabit(checkIns: CheckIn[], habitId: string): Set<string> {
  return new Set(
    checkIns.filter((c) => c.habitId === habitId).map((c) => c.date)
  );
}

/** Bugünden geriye ardışık işaretli günler. Bugün yoksa 0. */
export function currentStreak(
  checkIns: CheckIn[],
  habitId: string,
  today = todayKey()
): number {
  const dates = dateSetForHabit(checkIns, habitId);
  if (!dates.has(today)) return 0;

  let streak = 0;
  let cursor = today;
  while (dates.has(cursor)) {
    streak += 1;
    cursor = shiftDayKey(cursor, -1);
  }
  return streak;
}

/** Tüm geçmişteki en uzun ardışık seri. */
export function longestStreak(
  checkIns: CheckIn[],
  habitId: string
): number {
  const dates = [
    ...dateSetForHabit(checkIns, habitId),
  ].sort();
  if (dates.length === 0) return 0;

  let best = 1;
  let run = 1;

  for (let i = 1; i < dates.length; i++) {
    if (dates[i] === shiftDayKey(dates[i - 1], 1)) {
      run += 1;
      best = Math.max(best, run);
    } else {
      run = 1;
    }
  }

  return best;
}

/** Tüm alışkanlıklar arasında en uzun seri. */
export function longestStreakAcrossHabits(
  checkIns: CheckIn[],
  habitIds: string[]
): number {
  if (habitIds.length === 0) return 0;
  return Math.max(
    0,
    ...habitIds.map((id) => longestStreak(checkIns, id))
  );
}

export function completedTodayCount(
  checkIns: CheckIn[],
  habitIds: string[],
  today = todayKey()
): number {
  return habitIds.filter((id) =>
    checkIns.some((c) => c.habitId === id && c.date === today)
  ).length;
}
