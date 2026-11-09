import { Platform } from "react-native";
import {
  AndroidImportance,
  SchedulableTriggerInputTypes,
  addNotificationResponseReceivedListener,
  cancelAllScheduledNotificationsAsync,
  clearLastNotificationResponse,
  getLastNotificationResponse,
  getPermissionsAsync,
  requestPermissionsAsync,
  scheduleNotificationAsync,
  setNotificationChannelAsync,
  setNotificationHandler,
} from "expo-notifications";
import type { NotificationPermissionState, ScheduledReminderInput } from "./notifications.web";

export type { NotificationPermissionState, ScheduledReminderInput };

export const CLASS_REMINDER_CHANNEL_ID = "tt-class-reminders";

let handlerConfigured = false;

export async function configureNotificationChannels(): Promise<void> {
  if (!handlerConfigured) {
    setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    handlerConfigured = true;
  }

  if (Platform.OS === "android") {
    try {
      await setNotificationChannelAsync(CLASS_REMINDER_CHANNEL_ID, {
        name: "Class & Assignment Reminders",
        importance: AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#4F46E5",
        bypassDnd: false,
      });
    } catch {
      // Ignore in environments that do not support channel creation
    }
  }
}

export async function getNotificationPermissionState(): Promise<NotificationPermissionState> {
  try {
    const settings = await getPermissionsAsync();
    return {
      granted: settings.granted,
      canAskAgain: settings.canAskAgain,
      exactAlarmAllowed: true,
    };
  } catch {
    return {
      granted: true,
      canAskAgain: true,
      exactAlarmAllowed: true,
    };
  }
}

export async function requestNotificationPermissions(): Promise<NotificationPermissionState> {
  try {
    await configureNotificationChannels();
    const settings = await requestPermissionsAsync();
    return {
      granted: settings.granted,
      canAskAgain: settings.canAskAgain,
      exactAlarmAllowed: true,
    };
  } catch {
    return {
      granted: true,
      canAskAgain: false,
      exactAlarmAllowed: true,
    };
  }
}

export async function sendImmediateNotification(input: {
  title: string;
  body: string;
  data?: Record<string, string>;
}): Promise<boolean> {
  try {
    await configureNotificationChannels();
    const perm = await getPermissionsAsync();
    if (!perm.granted && perm.canAskAgain) {
      await requestPermissionsAsync();
    }
    await scheduleNotificationAsync({
      content: {
        title: input.title,
        body: input.body,
        data: input.data ?? {},
        sound: "default",
      },
      trigger: null,
    });
    return true;
  } catch {
    return false;
  }
}

export async function replaceScheduledReminders(
  reminders: ScheduledReminderInput[],
): Promise<number> {
  try {
    await configureNotificationChannels();
    const perm = await getPermissionsAsync();
    if (!perm.granted) {
      return 0;
    }

    await cancelAllScheduledNotificationsAsync();

    const nowMs = Date.now();
    let scheduledCount = 0;

    for (const item of reminders) {
      const targetMs = item.triggerDate.getTime();
      if (targetMs <= nowMs + 5000) {
        continue;
      }
      await scheduleNotificationAsync({
        identifier: item.id,
        content: {
          title: item.title,
          body: item.body,
          data: item.data ?? {},
          sound: "default",
        },
        trigger: {
          type: SchedulableTriggerInputTypes.DATE,
          date: item.triggerDate,
          channelId: Platform.OS === "android" ? CLASS_REMINDER_CHANNEL_ID : undefined,
        },
      });
      scheduledCount += 1;
    }

    return scheduledCount;
  } catch {
    return 0;
  }
}

function normalizeNotificationData(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== "object") return {};
  const result: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof v === "string") {
      result[k] = v;
    } else if (v !== undefined && v !== null) {
      result[k] = String(v);
    }
  }
  return result;
}

export function subscribeToNotificationResponses(
  listener: (data: Record<string, string>) => void,
): () => void {
  try {
    const last = getLastNotificationResponse();
    if (last?.notification?.request?.content?.data) {
      const payload = normalizeNotificationData(last.notification.request.content.data);
      clearLastNotificationResponse();
      listener(payload);
    }
  } catch {
    // Ignore if unavailable
  }

  try {
    const sub = addNotificationResponseReceivedListener((response) => {
      const payload = normalizeNotificationData(response.notification.request.content.data);
      listener(payload);
    });
    return () => {
      sub.remove();
    };
  } catch {
    return () => {};
  }
}
