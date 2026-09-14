import { useCheckIns } from "@/hooks/useCheckIns";
import { useHabits } from "@/hooks/useHabits";
import {
  completedTodayCount,
  currentStreak,
  isCheckedOn,
  longestStreakAcrossHabits,
  todayKey,
} from "@/lib";
import { colors } from "@/theme/color";
import { textStyles } from "@/theme/typography";
import { Checkbox } from "expo-checkbox";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function formToday(date = new Date()) {
  const day = date.getDate();
  const month = date.toLocaleDateString("tr-TR", { month: "long" });
  const weekday = date.toLocaleDateString("tr-TR", { weekday: "long" });
  const cap = (s: string) => s.charAt(0).toLocaleUpperCase() + s.slice(1);
  return `${day} ${cap(month)} ${cap(weekday)}`;
}

export default function Index() {
  const router = useRouter();
  const [todayLabel, setTodayLabel] = useState<string>(formToday());
  const { habits, loading, refresh: refreshHabits } = useHabits();
  const {
    checkIns,
    refresh: refreshCheckIns,
    toggle,
  } = useCheckIns();

  const today = todayKey();
  const habitIds = useMemo(() => habits.map((h) => h.id), [habits]);
  const doneToday = completedTodayCount(checkIns, habitIds, today);
  const bestStreak = longestStreakAcrossHabits(checkIns, habitIds);

  useEffect(() => {
    const timer = setInterval(() => {
      setTodayLabel(formToday());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshHabits();
      refreshCheckIns();
    }, [refreshHabits, refreshCheckIns])
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={[textStyles.bold, styles.date]}>{todayLabel}</Text>
        <Text style={[textStyles.bold, styles.title]}>Bugün</Text>

        {habits.length > 0 && (
          <View style={styles.statCard}>
            <Text style={[textStyles.medium, styles.statLabel]}>
              En Uzun Seri
            </Text>
            <View style={styles.statRow}>
              <Text style={[textStyles.bold, styles.statNumber]}>
                {bestStreak}
              </Text>
              <Text style={[textStyles.semibold, styles.statUnit]}>
                gün üst üste
              </Text>
            </View>
            <Text style={[textStyles.regular, styles.statSub]}>
              {doneToday} / {habits.length} alışkanlık tamam
            </Text>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={[textStyles.semibold, styles.sectionTitle]}>
            Alışkanlıklar
          </Text>
          <Pressable onPress={() => router.push("/add")}>
            <Text style={[textStyles.semibold, styles.AddHabitButtonText]}>
              + Ekle
            </Text>
          </Pressable>
        </View>

        {loading ? (
          <Text style={[textStyles.regular, styles.firstAddText]}>
            Yükleniyor…
          </Text>
        ) : habits.length === 0 ? (
          <Pressable onPress={() => router.push("/add")}>
            <Text style={[textStyles.regular, styles.firstAddText]}>
              İlk alışkanlığını eklemek için tıklayın
            </Text>
          </Pressable>
        ) : (
          habits.map((habit) => {
            const checked = isCheckedOn(checkIns, habit.id, today);
            const streak = currentStreak(checkIns, habit.id, today);

            return (
              <View key={habit.id} style={styles.habitRow}>
                <Pressable
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                  }}
                  onPress={() =>
                    router.push({
                      pathname: "/add",
                      params: { id: habit.id },
                    })
                  }
                >
                  <View
                    style={[
                      styles.habitAvatar,
                      { backgroundColor: habit.color },
                    ]}
                  >
                    <Text
                      style={[textStyles.semibold, styles.habitAvatarText]}
                    >
                      {habit.name.charAt(0).toLocaleUpperCase("tr-TR")}
                    </Text>
                  </View>
                  <View style={styles.habitText}>
                    <Text style={[textStyles.semibold, styles.habitName]}>
                      {habit.name}
                    </Text>
                    <Text style={[textStyles.regular, styles.habitStreak]}>
                      {streak} gün üst üste
                    </Text>
                  </View>
                </Pressable>

                <View style={styles.checkButton}>
                  <Checkbox
                    style={styles.checkButton}
                    value={checked}
                    onValueChange={() => toggle(habit.id)}
                    color={checked ? colors.accent : colors.ink}
                  />
                </View>
              </View>
            );
          })
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  date: {
    fontSize: 14,
    color: colors.inkMuted,
  },
  title: {
    fontSize: 24,
    color: colors.ink,
    marginTop: 4,
  },
  statCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    marginTop: 20,
  },
  statLabel: {
    fontSize: 14,
    color: colors.inkMuted,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginTop: 8,
  },
  statNumber: {
    fontSize: 40,
    color: colors.accent,
  },
  statUnit: {
    fontSize: 22,
    color: colors.cardText,
  },
  statSub: {
    fontSize: 14,
    color: colors.inkMuted,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    color: colors.accent,
  },
  AddHabitButtonText: {
    fontSize: 16,
    color: colors.accent,
  },
  habitRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    gap: 12,
  },
  habitAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  habitText: {
    flex: 1,
    backgroundColor: colors.bg,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  habitName: { fontSize: 16, color: colors.ink },
  habitAvatarText: { fontSize: 20, color: colors.white },
  habitStreak: { fontSize: 13, color: colors.inkMuted, marginTop: 2 },
  checkButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  firstAddText: {
    fontSize: 16,
    color: colors.accent,
    marginTop: 24,
    textAlign: "center",
  },
});
