import { AppState, NativeModules, Platform } from "react-native";

export interface LiveActivityClassPayload {
  occurrenceId: string;
  courseCode: string;
  courseTitle: string;
  courseColor: string;
  venue: string;
  timeRange: string;
  startTimestampMs: number;
  endTimestampMs: number;
  progressRatio: number;
  remainingSeconds: number;
  remainingLabel: string;
}

interface NativeTTLiveActivityModule {
  startOrUpdateActivity?: (payload: LiveActivityClassPayload) => Promise<string | void>;
  updateActivity?: (payload: LiveActivityClassPayload) => Promise<void>;
  endActivity?: () => Promise<void>;
}

let activeActivityOccurrenceId: string | null = null;
let lastBackgroundNotificationAt = 0;

/**
 * Starts or updates the native iOS ActivityKit Live Activity (Dynamic Island + Lock Screen).
 *
 * - In a native iOS development/production build (`npx expo run:ios` or EAS Build) with the
 *   `TTLiveActivity` ActivityKit + WidgetKit extension target and `NSSupportsLiveActivities: true`
 *   in `Info.plist`, iOS renders the ongoing class directly in the system Dynamic Island
 *   (compact leading/trailing + expanded view) using `ProgressView(timerInterval:)` and
 *   `Text(timerInterval:, countsDown: true)` so the bar and timer keep ticking every second
 *   even when the user leaves the app.
 * - In Expo Go (which is a pre-compiled sandbox binary without custom WidgetKit extensions),
 *   it falls back to an in-app Dynamic Island capsule + a Lock Screen notification when
 *   backgrounded.
 */
export async function syncOngoingClassLiveActivity(
  payload: LiveActivityClassPayload,
): Promise<void> {
  if (Platform.OS !== "ios") {
    return;
  }

  const nativeModule = NativeModules.TTLiveActivity as NativeTTLiveActivityModule | undefined;

  if (nativeModule?.startOrUpdateActivity) {
    try {
      await nativeModule.startOrUpdateActivity(payload);
      activeActivityOccurrenceId = payload.occurrenceId;
      return;
    } catch {
      // Fall through if ActivityKit is disabled in device settings
    }
  }

  if (nativeModule?.updateActivity) {
    try {
      await nativeModule.updateActivity(payload);
      activeActivityOccurrenceId = payload.occurrenceId;
    } catch {
      // Ignore in Expo Go
    }
  }
}

/**
 * Posts a Lock Screen / Notification Center ongoing class summary when the app transitions
 * to the background inside Expo Go (where Apple blocks third-party WidgetKit extensions).
 */
export async function notifyOngoingClassOnBackground(
  payload: LiveActivityClassPayload,
): Promise<void> {
  if (Platform.OS === "web") return;

  // Avoid duplicate background notifications within 60 seconds
  const now = Date.now();
  if (now - lastBackgroundNotificationAt < 60_000) return;
  lastBackgroundNotificationAt = now;

  // If native ActivityKit module is active, the system Dynamic Island already stays on screen
  const nativeModule = NativeModules.TTLiveActivity as NativeTTLiveActivityModule | undefined;
  if (nativeModule?.startOrUpdateActivity || activeActivityOccurrenceId) {
    return;
  }

  try {
    const presenter = NativeModules.ExpoNotificationPresenter as
      | {
          presentNotificationAsync?: (
            id: string,
            content: Record<string, unknown>,
          ) => Promise<void>;
        }
      | undefined;
    if (presenter?.presentNotificationAsync) {
      await presenter.presentNotificationAsync("tt-ongoing-class-live", {
        title: `${payload.courseCode} · ${payload.courseTitle}`,
        subtitle: `${payload.timeRange} · ${payload.venue}`,
        body: `Ongoing class · ${payload.remainingLabel} (${Math.round(payload.progressRatio * 100)}% complete)`,
        sound: false,
      });
    }
  } catch {
    // Notifications not available in current environment
  }
}

export function subscribeLiveActivityAppState(
  getLatestPayload: () => LiveActivityClassPayload | null,
): () => void {
  const subscription = AppState.addEventListener("change", (nextState) => {
    if (nextState === "background" || nextState === "inactive") {
      const payload = getLatestPayload();
      if (payload) {
        void syncOngoingClassLiveActivity(payload);
        void notifyOngoingClassOnBackground(payload);
      }
    }
  });

  return () => {
    subscription.remove();
  };
}
