import { useCheckIns } from "@/hooks/useCheckIns";
import { useHabits } from "@/hooks/useHabits";
import {
  currentStreak,
  isCheckedOn,
  monthGrid,
  monthLabel,
  toDateKey,
  todayKey,
} from "@/lib";
import { colors } from "@/theme/color";
import { textStyles } from "@/theme/typography";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const WEEKDAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

function formatDaySummary(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const day = date.getDate();
  const month = date.toLocaleDateString("tr-TR", { month: "long" });
  const cap = month.charAt(0).toLocaleUpperCase("tr-TR") + month.slice(1);
  return `${day} ${cap}`;
}

export default function Calendar() {
  const router = useRouter();
  const { habits, loading, refresh: refreshHabits } = useHabits();
  const { checkIns, refresh: refreshCheckIns } = useCheckIns();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [monthIndex, setMonthIndex] = useState(now.getMonth());
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(now.getDate());

  useFocusEffect(
    useCallback(() => {
      refreshHabits();
      refreshCheckIns();
    }, [refreshHabits, refreshCheckIns])
  );

  useEffect(() => {
    if (habits.length === 0) {
      setSelectedHabitId(null);
      return;
    }
    setSelectedHabitId((prev) => {
      if (prev && habits.some((h) => h.id === prev)) return prev;
      return habits[0].id;
    });
  }, [habits]);

  const today = todayKey();
  const cells = useMemo(
    () => monthGrid(year, monthIndex),
    [year, monthIndex]
  );

  const selectedHabit = habits.find((h) => h.id === selectedHabitId) ?? null;

  const selectedKey =
    selectedDay != null
      ? toDateKey(year, monthIndex, selectedDay)
      : null;

  const selectedChecked =
    selectedHabit && selectedKey
      ? isCheckedOn(checkIns, selectedHabit.id, selectedKey)
      : false;

  const selectedStreak =
    selectedHabit && selectedKey && selectedChecked
      ? currentStreak(checkIns, selectedHabit.id, selectedKey)
      : 0;

  function goPrevMonth() {
    if (monthIndex === 0) {
      setYear((y) => y - 1);
      setMonthIndex(11);
    } else {
      setMonthIndex((m) => m - 1);
    }
    setSelectedDay(null);
  }

  function goNextMonth() {
    if (monthIndex === 11) {
      setYear((y) => y + 1);
      setMonthIndex(0);
    } else {
      setMonthIndex((m) => m + 1);
    }
    setSelectedDay(null);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={[textStyles.bold, styles.title]}>Takvim</Text>

        {loading ? (
          <Text style={[textStyles.regular, styles.emptyText]}>
            Yükleniyor…
          </Text>
        ) : habits.length === 0 ? (
          <View style={styles.empty}>
            <Text style={[textStyles.regular, styles.emptyText]}>
              Önce bir alışkanlık ekle
            </Text>
            <Pressable onPress={() => router.push("/add")}>
              <Text style={[textStyles.semibold, styles.addLink]}>+ Ekle</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
              style={styles.chipsScroll}
            >
              {habits.map((habit) => {
                const selected = habit.id === selectedHabitId;
                return (
                  <Pressable
                    key={habit.id}
                    onPress={() => setSelectedHabitId(habit.id)}
                    style={[
                      styles.chip,
                      selected && styles.chipSelected,
                      selected && { backgroundColor: habit.color },
                    ]}
                  >
                    <Text
                      style={[
                        textStyles.semibold,
                        styles.chipText,
                        selected && styles.chipTextSelected,
                      ]}
                    >
                      {habit.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={styles.monthNav}>
              <Pressable
                onPress={goPrevMonth}
                style={styles.navHit}
                hitSlop={8}
              >
                <Text style={[textStyles.bold, styles.navArrow]}>‹</Text>
              </Pressable>
              <Text style={[textStyles.semibold, styles.monthTitle]}>
                {monthLabel(year, monthIndex)}
              </Text>
              <Pressable
                onPress={goNextMonth}
                style={styles.navHit}
                hitSlop={8}
              >
                <Text style={[textStyles.bold, styles.navArrow]}>›</Text>
              </Pressable>
            </View>

            <View style={styles.weekRow}>
              {WEEKDAYS.map((w) => (
                <Text
                  key={w}
                  style={[textStyles.medium, styles.weekday]}
                >
                  {w}
                </Text>
              ))}
            </View>

            <View style={styles.grid}>
              {cells.map((day, index) => {
                if (day == null) {
                  return <View key={`e-${index}`} style={styles.cell} />;
                }

                const key = toDateKey(year, monthIndex, day);
                const filled =
                  !!selectedHabitId &&
                  isCheckedOn(checkIns, selectedHabitId, key);
                const isToday = key === today;
                const isSelected = selectedDay === day;

                return (
                  <Pressable
                    key={key}
                    onPress={() => setSelectedDay(day)}
                    style={styles.cell}
                  >
                    <View
                      style={[
                        styles.dayInner,
                        filled && styles.dayFilled,
                        isToday && styles.dayTodayRing,
                        isSelected && !filled && styles.daySelectedOutline,
                      ]}
                    >
                      <Text
                        style={[
                          textStyles.semibold,
                          styles.dayText,
                          filled && styles.dayTextFilled,
                        ]}
                      >
                        {day}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.summaryCard}>
              {selectedKey == null ? (
                <Text style={[textStyles.regular, styles.summaryText]}>
                  Bir gün seç
                </Text>
              ) : selectedChecked ? (
                <Text style={[textStyles.semibold, styles.summaryText]}>
                  {formatDaySummary(selectedKey)} · {selectedStreak} gün seri
                </Text>
              ) : (
                <Text style={[textStyles.regular, styles.summaryMuted]}>
                  {formatDaySummary(selectedKey)} · işaretlenmedi
                </Text>
              )}
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const CELL = 48;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  title: {
    fontSize: 24,
    color: colors.ink,
  },
  empty: {
    marginTop: 48,
    alignItems: "center",
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: colors.inkMuted,
    marginTop: 24,
    textAlign: "center",
  },
  addLink: {
    fontSize: 16,
    color: colors.accent,
  },
  chipsScroll: {
    marginTop: 20,
    marginHorizontal: -20,
  },
  chips: {
    paddingHorizontal: 20,
    gap: 8,
    flexDirection: "row",
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.card,
    minHeight: 40,
    justifyContent: "center",
  },
  chipSelected: {
    backgroundColor: colors.accent,
  },
  chipText: {
    fontSize: 14,
    color: colors.cardText,
  },
  chipTextSelected: {
    color: colors.white,
  },
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 24,
  },
  navHit: {
    width: CELL,
    height: CELL,
    alignItems: "center",
    justifyContent: "center",
  },
  navArrow: {
    fontSize: 28,
    color: colors.ink,
  },
  monthTitle: {
    fontSize: 18,
    color: colors.ink,
  },
  weekRow: {
    flexDirection: "row",
    marginTop: 16,
  },
  weekday: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    color: colors.inkMuted,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  cell: {
    width: "14.2857%",
    height: CELL,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 4,
  },
  dayInner: {
    width: CELL,
    height: CELL,
    borderRadius: CELL / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  dayFilled: {
    backgroundColor: colors.accent,
  },
  dayTodayRing: {
    borderWidth: 2,
    borderColor: colors.accent,
  },
  daySelectedOutline: {
    borderWidth: 2,
    borderColor: colors.inkMuted,
  },
  dayText: {
    fontSize: 16,
    color: colors.ink,
  },
  dayTextFilled: {
    color: colors.white,
  },
  summaryCard: {
    marginTop: 24,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
  },
  summaryText: {
    fontSize: 16,
    color: colors.cardText,
  },
  summaryMuted: {
    fontSize: 16,
    color: colors.inkMuted,
  },
});
