import {
  cancelHabitReminder,
  createHabit,
  deleteCheckInsForHabit,
  deleteHabit,
  listHabits,
  syncHabitReminder,
  updateHabit,
} from "@/lib";
import { colors } from "@/theme/color";
import { textStyles } from "@/theme/typography";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const HABIT_COLORS = [
  "#FF6B3D",
  "#3D8BFF",
  "#2EC4B6",
  "#E63946",
  "#9B5DE5",
  "#F4A261",
];

export default function AddHabitScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = typeof id === "string" && id.length > 0;

  const [name, setName] = useState("");
  const [color, setColor] = useState(HABIT_COLORS[0]);
  const [reminderOn, setReminderOn] = useState(false);
  const [reminderHour, setReminderHour] = useState(9);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;

    (async () => {
      const habits = await listHabits();
      const habit = habits.find((h) => h.id === id);
      if (!habit) {
        Alert.alert("Hata", "Alışkanlık bulunamadı");
        router.back();
        return;
      }
      setName(habit.name);
      setColor(habit.color);
      if (habit.reminderHour != null) {
        setReminderOn(true);
        setReminderHour(habit.reminderHour);
      } else {
        setReminderOn(false);
      }
    })();
  }, [id, isEdit, router]);

  async function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert("Hata", "Alışkanlık adı boş olamaz");
      return;
    }

    const hour = reminderOn ? reminderHour : null;

    try {
      setSaving(true);
      if (isEdit) {
        const updated = await updateHabit(id, {
          name: trimmed,
          color,
          reminderHour: hour,
        });
        const ok = await syncHabitReminder(
          updated.id,
          updated.name,
          updated.reminderHour
        );
        if (hour != null && !ok) {
          await updateHabit(id, { reminderHour: null });
          Alert.alert(
            "Hatırlatma kurulamadı",
            "Expo Go (Android) veya bildirim izni nedeniyle hatırlatma yok. Alışkanlık kaydedildi."
          );
        }
      } else {
        const created = await createHabit({
          name: trimmed,
          color,
          reminderHour: hour,
        });
        const ok = await syncHabitReminder(
          created.id,
          created.name,
          created.reminderHour
        );
        if (hour != null && !ok) {
          await updateHabit(created.id, { reminderHour: null });
          Alert.alert(
            "Hatırlatma kurulamadı",
            "Expo Go (Android) veya bildirim izni nedeniyle hatırlatma yok. Alışkanlık kaydedildi."
          );
        }
      }
      router.back();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Kaydedilemedi";
      Alert.alert("Hata", message);
    } finally {
      setSaving(false);
    }
  }

  function handleDelete() {
    Alert.alert("Silinsin mi?", "Bu alışkanlık kalıcı olarak silinir.", [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          try {
            await cancelHabitReminder(id!);
            await deleteHabit(id!);
            await deleteCheckInsForHabit(id!);
            router.back();
          } catch (error) {
            const message =
              error instanceof Error ? error.message : "Silinemedi";
            Alert.alert("Hata", message);
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: isEdit ? "Düzenle" : "Yeni alışkanlık",
          headerBackTitle: "Bugün",
        }}
      />

      <View style={styles.content}>
        <Text style={[textStyles.semibold, styles.label]}>Ad</Text>
        <TextInput
          style={[textStyles.regular, styles.input]}
          value={name}
          onChangeText={setName}
          placeholder="Örn. Su iç"
          placeholderTextColor={colors.inkMuted}
          autoFocus={!isEdit}
        />

        <Text style={[textStyles.semibold, styles.label]}>Renk</Text>
        <View style={styles.colorsRow}>
          {HABIT_COLORS.map((c) => (
            <Pressable
              key={c}
              onPress={() => setColor(c)}
              style={[
                styles.colorDot,
                { backgroundColor: c },
                color === c && styles.colorDotSelected,
              ]}
            />
          ))}
        </View>

        <View style={styles.reminderRow}>
          <Text style={[textStyles.semibold, styles.reminderLabel]}>
            Hatırlatma
          </Text>
          <Switch
            value={reminderOn}
            onValueChange={setReminderOn}
            trackColor={{ false: colors.inkMuted, true: colors.accent }}
            thumbColor={colors.white}
          />
        </View>

        {reminderOn && (
          <View style={styles.hourRow}>
            <Pressable
              style={styles.hourBtn}
              onPress={() =>
                setReminderHour((h) => (h === 0 ? 23 : h - 1))
              }
            >
              <Text style={[textStyles.bold, styles.hourBtnText]}>−</Text>
            </Pressable>
            <Text style={[textStyles.bold, styles.hourValue]}>
              {String(reminderHour).padStart(2, "0")}:00
            </Text>
            <Pressable
              style={styles.hourBtn}
              onPress={() =>
                setReminderHour((h) => (h === 23 ? 0 : h + 1))
              }
            >
              <Text style={[textStyles.bold, styles.hourBtnText]}>+</Text>
            </Pressable>
          </View>
        )}

        {isEdit && (
          <Pressable onPress={handleDelete} style={styles.deleteButton}>
            <Text style={[textStyles.semibold, styles.deleteText]}>Sil</Text>
          </Pressable>
        )}

        <Pressable
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={[textStyles.semibold, styles.saveText]}>
            {saving ? "Kaydediliyor…" : "Kaydet"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    color: colors.inkMuted,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: colors.card,
    color: colors.cardText,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  colorsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  colorDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  colorDotSelected: {
    borderWidth: 3,
    borderColor: colors.ink,
  },
  reminderRow: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  reminderLabel: {
    fontSize: 16,
    color: colors.cardText,
  },
  hourRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  hourBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  hourBtnText: {
    fontSize: 24,
    color: colors.accent,
  },
  hourValue: {
    fontSize: 28,
    color: colors.ink,
    minWidth: 96,
    textAlign: "center",
  },
  deleteButton: {
    marginTop: 24,
    alignItems: "center",
    minHeight: 48,
    justifyContent: "center",
  },
  deleteText: {
    fontSize: 16,
    color: "#E63946",
  },
  saveButton: {
    marginTop: 16,
    backgroundColor: colors.accent,
    borderRadius: 16,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveText: {
    fontSize: 16,
    color: colors.white,
  },
});
