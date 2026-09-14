import Constants from "expo-constants";
import { Platform } from "react-native";

const CHANNEL_ID = "seri-reminders";

type NotificationsModule = typeof import("expo-notifications");

let Notifications: NotificationsModule | null = null;
let loadAttempted = false;

/** Expo Go Android'de paket import'ta throw eder (SDK 53+). */
function getNotifications(): NotificationsModule | null {
  if (loadAttempted) return Notifications;
  loadAttempted = true;

  // Expo Go Android: paket import'ta throw (SDK 53+ push kaldırıldı).
  if (Constants.appOwnership === "expo" && Platform.OS === "android") {
    Notifications = null;
    return null;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    Notifications = require("expo-notifications") as NotificationsModule;
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch {
    Notifications = null;
  }

  return Notifications;
}

function notifId(habitId: string) {
  return `habit-${habitId}`;
}

export function areRemindersAvailable(): boolean {
  return getNotifications() != null && Platform.OS !== "web";
}

export async function ensureNotificationChannel(): Promise<void> {
  const N = getNotifications();
  if (!N || Platform.OS !== "android") return;
  await N.setNotificationChannelAsync(CHANNEL_ID, {
    name: "Alışkanlık hatırlatmaları",
    importance: N.AndroidImportance.DEFAULT,
  });
}

export async function requestReminderPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const N = getNotifications();
  if (!N) return false;

  try {
    await ensureNotificationChannel();
    const current = await N.getPermissionsAsync();
    if (current.granted) return true;
    const asked = await N.requestPermissionsAsync();
    return asked.granted;
  } catch {
    return false;
  }
}

export async function getReminderPermissionStatus(): Promise<
  "granted" | "denied" | "undetermined" | "unavailable"
> {
  if (Platform.OS === "web") return "unavailable";
  const N = getNotifications();
  if (!N) return "unavailable";

  try {
    const { status } = await N.getPermissionsAsync();
    if (status === "granted") return "granted";
    if (status === "denied") return "denied";
    return "undetermined";
  } catch {
    return "unavailable";
  }
}

export async function scheduleHabitReminder(
  habitId: string,
  habitName: string,
  hour: number
): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const N = getNotifications();
  if (!N) return false;

  try {
    const ok = await requestReminderPermission();
    if (!ok) return false;

    await ensureNotificationChannel();
    await cancelHabitReminder(habitId);

    await N.scheduleNotificationAsync({
      identifier: notifId(habitId),
      content: {
        title: "Seri",
        body: `${habitName} — bugün işaretlemeyi unutma`,
        data: { habitId, screen: "today" },
      },
      trigger: {
        type: N.SchedulableTriggerInputTypes.DAILY,
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
  const N = getNotifications();
  if (!N) return;
  try {
    await N.cancelScheduledNotificationAsync(notifId(habitId));
  } catch {
    // ignore
  }
}

export async function cancelAllHabitReminders(): Promise<void> {
  if (Platform.OS === "web") return;
  const N = getNotifications();
  if (!N) return;
  try {
    await N.cancelAllScheduledNotificationsAsync();
  } catch {
    // ignore
  }
}

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

/** Bildirime tıklanınca Bugün'e git. Expo Go'da no-op. */
export function addReminderResponseListener(
  onPress: () => void
): () => void {
  const N = getNotifications();
  if (!N) return () => {};

  try {
    const sub = N.addNotificationResponseReceivedListener(() => {
      onPress();
    });
    return () => sub.remove();
  } catch {
    return () => {};
  }
}
