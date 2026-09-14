import {
  createHabit,
  deleteHabit,
  listHabits,
  updateHabit,
  type Habit,
} from "@/lib";
import { subscribeDataChange } from "@/lib/dataEvents";
import { useCallback, useEffect, useState } from "react";

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await listHabits();
    setHabits(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      const data = await listHabits();
      if (!cancelled) {
        setHabits(data);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return subscribeDataChange(() => {
      void refresh();
    });
  }, [refresh]);

  const add = useCallback(
    async (name: string, color: string, reminderHour: number | null = null) => {
      const habit = await createHabit({ name, color, reminderHour });
      setHabits((prev) => [...prev, habit]);
      return habit;
    },
    []
  );

  const update = useCallback(
    async (
      id: string,
      patch: Partial<Pick<Habit, "name" | "color" | "reminderHour">>
    ) => {
      const habit = await updateHabit(id, patch);
      setHabits((prev) => prev.map((h) => (h.id === id ? habit : h)));
      return habit;
    },
    []
  );

  const remove = useCallback(async (id: string) => {
    await deleteHabit(id);
    setHabits((prev) => prev.filter((h) => h.id !== id));
  }, []);

  return { habits, loading, add, update, remove, refresh };
}
