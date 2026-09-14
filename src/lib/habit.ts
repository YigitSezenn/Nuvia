import { getJson, setJson } from "./storage";
import { emitDataChange } from "./dataEvents";
import type { Habit } from "./types";

const HABITS_KEY = "habits";
const Max_HABITS = 7;

export async function listHabits(): Promise<Habit[]> {
  const habits = await getJson<Habit[]>(HABITS_KEY);
  return habits ?? [];
}

export async function createHabit(input: {
  name: string;
  color: string;
  reminderHour?: number | null;
}): Promise<Habit> {
  const habits = await listHabits();
  if (habits.length >= Max_HABITS) {
    throw new Error("Yalnızca 7 adet alışkanlık oluşturabilirsiniz.");
  }
  const habit: Habit = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: input.name.trim(),
    color: input.color,
    reminderHour: input.reminderHour ?? null,
    createdAt: new Date().toISOString(),
  };
  await setJson(HABITS_KEY, [...habits, habit]);
  emitDataChange();
  return habit;
}

export async function updateHabit(
  id: string,
  patch: Partial<Pick<Habit, "name" | "color" | "reminderHour">>
): Promise<Habit> {
  const habits = await listHabits();
  const index = habits.findIndex((h) => h.id === id);
  if (index === -1) {
    throw new Error("Alışkanlık bulunamadı");
  }
  const updated: Habit = {
    ...habits[index],
    ...patch,
    name: patch.name !== undefined ? patch.name.trim() : habits[index].name,
  };
  const next = [...habits];
  next[index] = updated;
  await setJson(HABITS_KEY, next);
  emitDataChange();
  return updated;
}

export async function deleteHabit(id: string): Promise<void> {
  const habits = await listHabits();
  await setJson(
    HABITS_KEY,
    habits.filter((h) => h.id !== id)
  );
  emitDataChange();
}
