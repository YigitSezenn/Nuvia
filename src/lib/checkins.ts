import { todayKey } from "./date";
import { emitDataChange } from "./dataEvents";
import { getJson, setJson } from "./storage";
import type { CheckIn } from "./types";

const CHECKINS_KEY = "checkins";

export async function listCheckIns(): Promise<CheckIn[]> {
  const checkIns = await getJson<CheckIn[]>(CHECKINS_KEY);
  return checkIns ?? [];
}

export async function listCheckInsForHabit(
  habitId: string
): Promise<CheckIn[]> {
  const checkIns = await listCheckIns();
  return checkIns.filter((c) => c.habitId === habitId);
}

export function isCheckedOn(
  checkIns: CheckIn[],
  habitId: string,
  date: string
): boolean {
  return checkIns.some((c) => c.habitId === habitId && c.date === date);
}

/** Bugün işaretle / geri al. Aynı gün ikinci basışta kaldırır. */
export async function toggleCheckIn(
  habitId: string,
  date = todayKey()
): Promise<CheckIn[]> {
  const checkIns = await listCheckIns();
  const existing = checkIns.find(
    (c) => c.habitId === habitId && c.date === date
  );

  const next = existing
    ? checkIns.filter((c) => c.id !== existing.id)
    : [
        ...checkIns,
        {
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          habitId,
          date,
        },
      ];

  await setJson(CHECKINS_KEY, next);
  emitDataChange();
  return next;
}

export async function deleteCheckInsForHabit(habitId: string): Promise<void> {
  const checkIns = await listCheckIns();
  await setJson(
    CHECKINS_KEY,
    checkIns.filter((c) => c.habitId !== habitId)
  );
  emitDataChange();
}
