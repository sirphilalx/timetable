export interface NotificationPermissionState {
  granted: boolean;
  canAskAgain: boolean;
  exactAlarmAllowed: boolean;
}

export interface ScheduledReminderInput {
  id: string;
  title: string;
  body: string;
  triggerDate: Date;
  data?: Record<string, string>;
}

const webResponseListeners = new Set<(data: Record<string, string>) => void>();

export async function configureNotificationChannels(): Promise<void> {
  // No-op on web
}

export async function getNotificationPermissionState(): Promise<NotificationPermissionState> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return { granted: true, canAskAgain: false, exactAlarmAllowed: true };
  }
  return {
    granted: Notification.permission === "granted",
    canAskAgain: Notification.permission === "default",
    exactAlarmAllowed: true,
  };
}

export async function requestNotificationPermissions(): Promise<NotificationPermissionState> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return { granted: true, canAskAgain: false, exactAlarmAllowed: true };
  }
  try {
    const result = await Notification.requestPermission();
    return {
      granted: result === "granted",
      canAskAgain: result === "default",
      exactAlarmAllowed: true,
    };
  } catch {
    return { granted: true, canAskAgain: false, exactAlarmAllowed: true };
  }
}

export async function sendImmediateNotification(input: {
  title: string;
  body: string;
  data?: Record<string, string>;
}): Promise<boolean> {
  if (typeof window !== "undefined" && "Notification" in window) {
    if (Notification.permission === "granted") {
      try {
        const notif = new Notification(input.title, { body: input.body });
        notif.onclick = () => {
          const payload = input.data ?? {};
          webResponseListeners.forEach((listener) => listener(payload));
        };
        return true;
      } catch {
        return true;
      }
    }
  }
  return true;
}

export async function replaceScheduledReminders(
  reminders: ScheduledReminderInput[],
): Promise<number> {
  const nowMs = Date.now();
  return reminders.filter((r) => r.triggerDate.getTime() > nowMs + 5000).length;
}

export function subscribeToNotificationResponses(
  listener: (data: Record<string, string>) => void,
): () => void {
  webResponseListeners.add(listener);
  return () => {
    webResponseListeners.delete(listener);
  };
}
