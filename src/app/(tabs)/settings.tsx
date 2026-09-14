import { useHabits } from "@/hooks/useHabits";
import {
  cancelAllHabitReminders,
  clearAllData,
  getReminderPermissionStatus,
  requestReminderPermission,
} from "@/lib";
import { colors } from "@/theme/color";
import { textStyles } from "@/theme/typography";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Perm = "granted" | "denied" | "undetermined" | "unavailable";

function permLabel(status: Perm): string {
  switch (status) {
    case "granted":
      return "Açık";
    case "denied":
      return "Kapalı";
    case "undetermined":
      return "İzin ver";
    default:
      return "Kullanılamıyor";
  }
}

export default function Settings() {
  const { refresh } = useHabits();
  const [clearing, setClearing] = useState(false);
  const [perm, setPerm] = useState<Perm | null>(null);

  const loadPerm = useCallback(async () => {
    const status = await getReminderPermissionStatus();
    setPerm(status);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
      loadPerm();
    }, [refresh, loadPerm])
  );

  async function handlePermission() {
    if (perm === "unavailable") return;
    if (perm === "granted") {
      Alert.alert("Bildirimler", "Hatırlatmalar açık.");
      return;
    }
    if (perm === "denied") {
      Alert.alert(
        "Bildirimler kapalı",
        "Telefon ayarlarından Seri için bildirimleri açabilirsin. Uygulama yine çalışır."
      );
      return;
    }
    const ok = await requestReminderPermission();
    await loadPerm();
    if (!ok) {
      Alert.alert(
        "İzin verilmedi",
        "Hatırlatma olmadan da uygulamayı kullanabilirsin."
      );
    }
  }

  function handleClearAll() {
    Alert.alert("Tüm veriyi sil?", "Geri alınamaz.", [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          try {
            setClearing(true);
            await cancelAllHabitReminders();
            await clearAllData();
            await refresh();
            Alert.alert("Tamam", "Tüm veriler silindi.");
          } catch {
            Alert.alert("Hata", "Veriler silinemedi.");
          } finally {
            setClearing(false);
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={[textStyles.bold, styles.title]}>Ayarlar</Text>

        <View style={styles.card}>
          {perm !== null && perm !== "unavailable" && (
            <Pressable onPress={handlePermission} style={styles.row}>
              <Text style={[textStyles.semibold, styles.rowLabel]}>
                Bildirimler
              </Text>
              <Text style={[textStyles.regular, styles.rowValue]}>
                {permLabel(perm)}
              </Text>
            </Pressable>
          )}

          <Pressable
            onPress={handleClearAll}
            disabled={clearing}
            style={styles.dangerRow}
          >
            <Text style={[textStyles.semibold, styles.dangerText]}>
              {clearing ? "Siliniyor…" : "Tüm veriyi sil"}
            </Text>
          </Pressable>
        </View>

        <Text style={[textStyles.regular, styles.version]}>Seri 0.1</Text>
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
    paddingHorizontal: 20,
    paddingTop: 12,
    flex: 1,
  },
  title: {
    fontSize: 24,
    color: colors.ink,
  },
  card: {
    marginTop: 24,
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: "hidden",
  },
  row: {
    minHeight: 48,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.inkMuted,
  },
  rowLabel: {
    fontSize: 16,
    color: colors.cardText,
  },
  rowValue: {
    fontSize: 14,
    color: colors.inkMuted,
  },
  dangerRow: {
    minHeight: 48,
    paddingHorizontal: 20,
    paddingVertical: 16,
    justifyContent: "center",
  },
  dangerText: {
    fontSize: 16,
    color: "#E63946",
  },
  version: {
    marginTop: "auto",
    marginBottom: 24,
    textAlign: "center",
    fontSize: 14,
    color: colors.inkMuted,
  },
});
