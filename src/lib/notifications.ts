import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const CHANNEL_ID = "seri-reminders";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function notifId(habitId: string) {
  return `habit-${habitId}`;
}

export async function ensureNotificationChannel(): Promise<void> {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: "Alışkanlık hatırlatmaları",
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

/** İzin iste. Reddedilirse false — app kırılmaz. */
export async function requestReminderPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;

  try {
    await ensureNotificationChannel();
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;

    const asked = await Notifications.requestPermissionsAsync();
    return asked.granted;
  } catch {
    return false;
  }
}

export async function getReminderPermissionStatus(): Promise<
  "granted" | "denied" | "undetermined" | "unavailable"
> {
  if (Platform.OS === "web") return "unavailable";
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status === "granted") return "granted";
    if (status === "denied") return "denied";
    return "undetermined";
  } catch {
    return "unavailable";
  }
}

/** Günlük yerel hatırlatma. Başarılıysa true. */
export async function scheduleHabitReminder(
  habitId: string,
  habitName: string,
  hour: number
): Promise<boolean> {
  if (Platform.OS === "web") return false;

  try {
    const ok = await requestReminderPermission();
    if (!ok) return false;

    await ensureNotificationChannel();
    await cancelHabitReminder(habitId);

    await Notifications.scheduleNotificationAsync({
      identifier: notifId(habitId),
      content: {
        title: "Seri",
        body: `${habitName} — bugün işaretlemeyi unutma`,
        data: { habitId, screen: "today" },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute: 0,
        channelId: CHANNEL_ID,
      },
    });
    return true;
  } catch {
    return false;
  }
}

export async function cancelHabitReminder(habitId: string): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notifId(habitId));
  } catch {
    // yoksa sorun değil
  }
}

export async function cancelAllHabitReminders(): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // ignore
  }
}

/** Hatırlatmayı senkronize et. Schedule başarısızsa false. */
export async function syncHabitReminder(
  habitId: string,
  habitName: string,
  reminderHour: number | null
): Promise<boolean> {
  if (reminderHour == null) {
    await cancelHabitReminder(habitId);
    return true;
  }
  return scheduleHabitReminder(habitId, habitName, reminderHour);
}
