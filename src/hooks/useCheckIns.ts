import { listCheckIns, toggleCheckIn, type CheckIn } from "@/lib";
import { subscribeDataChange } from "@/lib/dataEvents";
import { useCallback, useEffect, useState } from "react";

export function useCheckIns() {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await listCheckIns();
    setCheckIns(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      const data = await listCheckIns();
      if (!cancelled) {
        setCheckIns(data);
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

  const toggle = useCallback(async (habitId: string) => {
    const next = await toggleCheckIn(habitId);
    setCheckIns(next);
    return next;
  }, []);

  return { checkIns, loading, refresh, toggle };
}
