import { platformStorage } from "./storage";
import {
  replaceScheduledReminders,
  sendImmediateNotification,
  type ScheduledReminderInput,
} from "./notifications";

export interface ReminderPayload {
  title: string;
  body: string;
  courseCode: string;
  venue: string;
  leadMinutes: number;
  scheduledWallClockIso: string;
  triggerDate: Date;
}

export interface ReminderPreferences {
  leadMinutes: 30 | 60;
  classesEnabled: boolean;
  assignmentsEnabled: boolean;
  movesEnabled: boolean;
  morningSummaryEnabled: boolean;
  quietHoursEnabled: boolean;
  batteryFixed: boolean;
  checkInsDelayMinutes: 10 | 30;
  checkInsRepeat8pm: boolean;
  attendanceTargetPct: number;
  courseRemindersEnabled: Record<string, boolean>;
  courseCheckInsEnabled: Record<string, boolean>;
}

export interface InAppNotificationItem {
  id: string;
  kind: "move" | "cancel" | "reminder" | "assignment" | "checkin" | "invite";
  title: string;
  subtitle: string;
  createdAtIso: string;
  unread: boolean;
  route: string;
}

export const REMINDER_PREFS_STORAGE_KEY = "tt_reminder_preferences_v1";
export const IN_APP_NOTIFICATIONS_STORAGE_KEY = "tt_in_app_notifications_v1";

let activeReminderStudentId = "student-anonymous";

function getScopedReminderPrefsKey(): string {
  return `${REMINDER_PREFS_STORAGE_KEY}_${activeReminderStudentId}`;
}

function getScopedNotificationsKey(): string {
  return `${IN_APP_NOTIFICATIONS_STORAGE_KEY}_${activeReminderStudentId}`;
}

export const DEFAULT_REMINDER_PREFERENCES: ReminderPreferences = {
  leadMinutes: 30,
  classesEnabled: true,
  assignmentsEnabled: true,
  movesEnabled: true,
  morningSummaryEnabled: false,
  quietHoursEnabled: true,
  batteryFixed: false,
  checkInsDelayMinutes: 10,
  checkInsRepeat8pm: true,
  attendanceTargetPct: 75,
  courseRemindersEnabled: {},
  courseCheckInsEnabled: {},
};

let inMemoryReminderPrefs: ReminderPreferences = {
  ...DEFAULT_REMINDER_PREFERENCES,
  courseRemindersEnabled: {},
  courseCheckInsEnabled: {},
};

let inMemoryNotifications: InAppNotificationItem[] = [];
let notificationsHydrated = false;

export async function switchReminderAccount(studentId: string | null): Promise<void> {
  const nextId = studentId && studentId.trim() ? studentId.trim() : "student-anonymous";
  if (activeReminderStudentId === nextId && notificationsHydrated) {
    return;
  }
  activeReminderStudentId = nextId;
  inMemoryReminderPrefs = {
    ...DEFAULT_REMINDER_PREFERENCES,
    courseRemindersEnabled: {},
    courseCheckInsEnabled: {},
  };
  inMemoryNotifications = [];
  notificationsHydrated = false;
  if (nextId === "student-anonymous") {
    await replaceScheduledReminders([]);
  } else {
    await loadReminderPreferences();
    await loadInAppNotifications();
  }
  prefChangeListeners.forEach((listener) => listener(inMemoryReminderPrefs));
  notifyInAppListeners();
}

const prefChangeListeners = new Set<(prefs: ReminderPreferences) => void>();
const notificationChangeListeners = new Set<() => void>();

export function subscribeToReminderPreferenceChanges(
  listener: (prefs: ReminderPreferences) => void,
): () => void {
  prefChangeListeners.add(listener);
  return () => {
    prefChangeListeners.delete(listener);
  };
}

export function subscribeToInAppNotifications(listener: () => void): () => void {
  notificationChangeListeners.add(listener);
  return () => {
    notificationChangeListeners.delete(listener);
  };
}

function notifyInAppListeners(): void {
  notificationChangeListeners.forEach((listener) => listener());
}

export async function loadReminderPreferences(): Promise<ReminderPreferences> {
  try {
    const raw = await platformStorage.getItem(getScopedReminderPrefsKey());
    if (!raw) return inMemoryReminderPrefs;
    const parsed = JSON.parse(raw) as Partial<ReminderPreferences>;
    inMemoryReminderPrefs = {
      leadMinutes: parsed.leadMinutes === 60 ? 60 : 30,
      classesEnabled: parsed.classesEnabled ?? true,
      assignmentsEnabled: parsed.assignmentsEnabled ?? true,
      movesEnabled: parsed.movesEnabled ?? true,
      morningSummaryEnabled: parsed.morningSummaryEnabled ?? false,
      quietHoursEnabled: parsed.quietHoursEnabled ?? true,
      batteryFixed: parsed.batteryFixed ?? false,
      checkInsDelayMinutes: parsed.checkInsDelayMinutes === 30 ? 30 : 10,
      checkInsRepeat8pm: parsed.checkInsRepeat8pm ?? true,
      attendanceTargetPct:
        typeof parsed.attendanceTargetPct === "number" &&
        parsed.attendanceTargetPct >= 50 &&
        parsed.attendanceTargetPct <= 100
          ? parsed.attendanceTargetPct
          : 75,
      courseRemindersEnabled:
        parsed.courseRemindersEnabled && typeof parsed.courseRemindersEnabled === "object"
          ? { ...parsed.courseRemindersEnabled }
          : {},
      courseCheckInsEnabled:
        parsed.courseCheckInsEnabled && typeof parsed.courseCheckInsEnabled === "object"
          ? { ...parsed.courseCheckInsEnabled }
          : {},
    };
    return inMemoryReminderPrefs;
  } catch {
    return inMemoryReminderPrefs;
  }
}

export async function saveReminderPreferences(
  updates: Partial<ReminderPreferences>,
): Promise<ReminderPreferences> {
  const current = await loadReminderPreferences();
  const next: ReminderPreferences = {
    ...current,
    ...updates,
    courseRemindersEnabled: updates.courseRemindersEnabled
      ? { ...current.courseRemindersEnabled, ...updates.courseRemindersEnabled }
      : current.courseRemindersEnabled,
    courseCheckInsEnabled: updates.courseCheckInsEnabled
      ? { ...current.courseCheckInsEnabled, ...updates.courseCheckInsEnabled }
      : current.courseCheckInsEnabled,
  };
  inMemoryReminderPrefs = next;
  try {
    await platformStorage.setItem(getScopedReminderPrefsKey(), JSON.stringify(next));
  } catch {
    // Ignore storage write errors
  }
  prefChangeListeners.forEach((listener) => listener(next));
  return next;
}

export function isCourseReminderEnabled(prefs: ReminderPreferences, courseId?: string): boolean {
  if (!courseId) return true;
  return prefs.courseRemindersEnabled[courseId] !== false;
}

export function isCourseCheckInEnabled(prefs: ReminderPreferences, courseId?: string): boolean {
  if (!courseId) return true;
  return prefs.courseCheckInsEnabled[courseId] !== false;
}

export async function loadInAppNotifications(): Promise<InAppNotificationItem[]> {
  if (notificationsHydrated) {
    return inMemoryNotifications;
  }
  notificationsHydrated = true;
  try {
    const raw = await platformStorage.getItem(getScopedNotificationsKey());
    if (!raw) return inMemoryNotifications;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      inMemoryNotifications = parsed.filter((item): item is InAppNotificationItem =>
        Boolean(item && typeof item.id === "string" && typeof item.title === "string"),
      );
    }
    return inMemoryNotifications;
  } catch {
    return inMemoryNotifications;
  }
}

export function getInAppNotificationsSnapshot(): InAppNotificationItem[] {
  return [...inMemoryNotifications];
}

async function persistInAppNotifications(): Promise<void> {
  try {
    await platformStorage.setItem(
      getScopedNotificationsKey(),
      JSON.stringify(inMemoryNotifications.slice(0, 50)),
    );
  } catch {
    // Ignore storage write errors
  }
}

export async function appendInAppNotification(input: {
  id?: string;
  kind: InAppNotificationItem["kind"];
  title: string;
  subtitle: string;
  route: string;
  createdAtIso?: string;
  unread?: boolean;
}): Promise<InAppNotificationItem> {
  await loadInAppNotifications();
  const id = input.id ?? `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const item: InAppNotificationItem = {
    id,
    kind: input.kind,
    title: input.title,
    subtitle: input.subtitle,
    route: input.route,
    createdAtIso: input.createdAtIso ?? new Date().toISOString(),
    unread: input.unread ?? true,
  };
  const deduped = inMemoryNotifications.filter((n) => n.id !== id);
  inMemoryNotifications = [item, ...deduped].slice(0, 50);
  await persistInAppNotifications();
  notifyInAppListeners();
  return item;
}

export async function markNotificationRead(id: string): Promise<void> {
  await loadInAppNotifications();
  let changed = false;
  inMemoryNotifications = inMemoryNotifications.map((item) => {
    if (item.id === id && item.unread) {
      changed = true;
      return { ...item, unread: false };
    }
    return item;
  });
  if (changed) {
    await persistInAppNotifications();
    notifyInAppListeners();
  }
}

export async function markAllNotificationsRead(): Promise<void> {
  await loadInAppNotifications();
  let changed = false;
  inMemoryNotifications = inMemoryNotifications.map((item) => {
    if (item.unread) {
      changed = true;
      return { ...item, unread: false };
    }
    return item;
  });
  if (changed) {
    await persistInAppNotifications();
    notifyInAppListeners();
  }
}

export async function clearAllNotifications(): Promise<void> {
  await loadInAppNotifications();
  inMemoryNotifications = [];
  await persistInAppNotifications();
  notifyInAppListeners();
}

export function formatRelativeNotificationAge(iso: string, nowMs = Date.now()): string {
  const ts = new Date(iso).getTime();
  if (Number.isNaN(ts)) return "just now";
  const diffSec = Math.max(0, Math.floor((nowMs - ts) / 1000));
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs} h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays} d ago`;
}

function formatLocalOffset(date: Date): string {
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMinutes);
  const hh = String(Math.floor(abs / 60)).padStart(2, "0");
  const mm = String(abs % 60).padStart(2, "0");
  return `${sign}${hh}:${mm}`;
}

export function buildLocalWallClockDate(
  dateIso: string,
  hour24: number,
  minute: number,
  dayOffset = 0,
): { date: Date; wallClockIso: string; time24: string } {
  const parts = dateIso.split("-").map(Number);
  const year = parts[0] ?? 2026;
  const month = parts[1] ?? 11;
  const day = parts[2] ?? 6;
  const localDate = new Date(year, month - 1, day + dayOffset, hour24, minute, 0, 0);
  const yyyy = String(localDate.getFullYear()).padStart(4, "0");
  const mo = String(localDate.getMonth() + 1).padStart(2, "0");
  const dd = String(localDate.getDate()).padStart(2, "0");
  const hh = String(localDate.getHours()).padStart(2, "0");
  const mm = String(localDate.getMinutes()).padStart(2, "0");
  const offset = formatLocalOffset(localDate);
  return {
    date: localDate,
    wallClockIso: `${yyyy}-${mo}-${dd}T${hh}:${mm}:00${offset}`,
    time24: `${hh}:${mm}`,
  };
}

/**
 * Formats a class reminder notification leading with the course code and short venue
 * matching Screen 17 & Screen 43: "CSC 301 in 30 min, LT1" / "Operating Systems · Lecture · 10:00 am"
 */
export function buildClassReminderPayload(input: {
  courseCode: string;
  courseTitle: string;
  classType: string;
  startTimeFormatted: string;
  shortVenue: string;
  dateIso: string;
  startTime24: string;
  leadMinutes: 30 | 60;
}): ReminderPayload {
  const leadLabel = input.leadMinutes === 60 ? "1 hour" : `${input.leadMinutes} min`;
  const title = `${input.courseCode} in ${leadLabel}, ${input.shortVenue}`;
  const cleanTitle = input.courseTitle.split("·")[0]?.trim() || input.courseTitle;
  const body = `${cleanTitle} · ${input.classType} · ${input.startTimeFormatted}`;

  const [hours = 10, minutes = 0] = input.startTime24.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes - input.leadMinutes;
  const dayOffset = totalMinutes < 0 ? -1 : 0;
  const wrappedMinutes = ((totalMinutes % 1440) + 1440) % 1440;
  const triggerHour = Math.floor(wrappedMinutes / 60);
  const triggerMin = wrappedMinutes % 60;

  const built = buildLocalWallClockDate(input.dateIso, triggerHour, triggerMin, dayOffset);

  return {
    title,
    body,
    courseCode: input.courseCode,
    venue: input.shortVenue,
    leadMinutes: input.leadMinutes,
    scheduledWallClockIso: built.wallClockIso,
    triggerDate: built.date,
  };
}

/**
 * Checks whether a wall clock HH:MM falls inside quiet hours (22:00 to 06:00).
 */
export function isWithinQuietHours(time24: string): boolean {
  const [hh = 0] = time24.split(":").map(Number);
  return hh >= 22 || hh < 6;
}

export async function notifyClassMovedOrCancelled(input: {
  occurrenceId: string;
  courseCode: string;
  action: "moved" | "cancelled";
  newVenue?: string;
  newTimeFormatted?: string;
  actorLabel?: string;
}): Promise<void> {
  const prefs = await loadReminderPreferences();
  const title =
    input.action === "cancelled"
      ? `${input.courseCode} class cancelled`
      : `${input.courseCode} moved to ${input.newVenue ?? "new venue"}${input.newTimeFormatted ? `, ${input.newTimeFormatted}` : ""}`;
  const subtitle = input.actorLabel ? `${input.actorLabel} · just now` : "Updated just now";
  const route = `/class/${input.occurrenceId}`;

  const item = await appendInAppNotification({
    kind: input.action === "cancelled" ? "cancel" : "move",
    title,
    subtitle,
    route,
  });

  if (prefs.movesEnabled) {
    await sendImmediateNotification({
      title,
      body: subtitle,
      data: {
        notificationId: item.id,
        occurrenceId: input.occurrenceId,
        courseCode: input.courseCode,
        route,
        type: input.action === "cancelled" ? "class_cancelled" : "class_moved",
      },
    });
  }
}

export async function sendTestReminderNotification(
  leadMinutes: 30 | 60 = 30,
  sampleCourse?: {
    id?: string;
    code: string;
    title: string;
    venue?: string;
    startTimeFormatted?: string;
  },
): Promise<{ ok: boolean; title: string }> {
  const sample = buildClassReminderPayload({
    courseCode: sampleCourse?.code || "CSC 301",
    courseTitle: sampleCourse?.title || "Operating Systems",
    classType: "Lecture",
    startTimeFormatted: sampleCourse?.startTimeFormatted || "10:00 am",
    shortVenue: sampleCourse?.venue || "LT1",
    dateIso: new Date().toISOString().slice(0, 10),
    startTime24: "10:00",
    leadMinutes,
  });

  const route = sampleCourse?.id ? `/course/${sampleCourse.id}` : "/(tabs)";
  const notifItem = await appendInAppNotification({
    kind: "reminder",
    title: sample.title,
    subtitle: `${sample.body} · Test reminder`,
    route,
  });

  const ok = await sendImmediateNotification({
    title: sample.title,
    body: sample.body,
    data: {
      notificationId: notifItem.id,
      courseCode: sample.courseCode,
      venue: sample.venue,
      route,
      type: "test_reminder",
    },
  });

  return { ok, title: sample.title };
}

export async function syncScheduledClassAlarms(input: {
  occurrences: {
    id: string;
    courseId?: string;
    courseCode: string;
    courseTitle: string;
    classType: string;
    calendarKind?: "classes" | "assignments" | "exams" | "others";
    startTimeFormatted: string;
    shortVenue: string;
    dateIso: string;
    startTime24: string;
    endTime24?: string;
    status?: string;
    attended?: boolean;
  }[];
  assignments?: {
    id: string;
    courseId?: string;
    courseCode: string;
    title: string;
    dueAtIso: string;
    done?: boolean;
  }[];
}): Promise<number> {
  const prefs = await loadReminderPreferences();
  const scheduledList: ScheduledReminderInput[] = [];

  // 1. Class, Exam & Study Session Reminders + Post-Class Check-In Prompts
  for (const occ of input.occurrences) {
    if (occ.status === "cancelled") continue;

    const courseRemindersAllowed = isCourseReminderEnabled(prefs, occ.courseId);

    if (prefs.classesEnabled && courseRemindersAllowed) {
      const payload = buildClassReminderPayload({
        courseCode: occ.courseCode,
        courseTitle: occ.courseTitle,
        classType: occ.classType,
        startTimeFormatted: occ.startTimeFormatted,
        shortVenue: occ.shortVenue,
        dateIso: occ.dateIso,
        startTime24: occ.startTime24,
        leadMinutes: prefs.leadMinutes,
      });

      const triggerTime24 = payload.scheduledWallClockIso.slice(11, 16);
      if (!prefs.quietHoursEnabled || !isWithinQuietHours(triggerTime24)) {
        if (!Number.isNaN(payload.triggerDate.getTime())) {
          scheduledList.push({
            id: `class-rem-${occ.id}`,
            title: payload.title,
            body: payload.body,
            triggerDate: payload.triggerDate,
            data: {
              occurrenceId: occ.id,
              courseCode: occ.courseCode,
              route: `/class/${occ.id}`,
              type: "class_reminder",
            },
          });
        }
      }
    }

    // Post-class attendance check-in prompt (10 min after class + optional 8:00 pm follow-up)
    const isClassKind = !occ.calendarKind || occ.calendarKind === "classes";
    if (isClassKind && !occ.attended && isCourseCheckInEnabled(prefs, occ.courseId)) {
      const end24 = occ.endTime24 ?? "10:00";
      const [endH = 10, endM = 0] = end24.split(":").map(Number);
      const totalAfterMinutes = endH * 60 + endM + prefs.checkInsDelayMinutes;
      const dayOffset = Math.floor(totalAfterMinutes / 1440);
      const wrappedMin = ((totalAfterMinutes % 1440) + 1440) % 1440;
      const checkInBuilt = buildLocalWallClockDate(
        occ.dateIso,
        Math.floor(wrappedMin / 60),
        wrappedMin % 60,
        dayOffset,
      );

      if (!prefs.quietHoursEnabled || !isWithinQuietHours(checkInBuilt.time24)) {
        scheduledList.push({
          id: `checkin-after-${occ.id}`,
          title: `Did you attend ${occ.courseCode}?`,
          body: `Log your attendance for ${occ.courseTitle.split("·")[0]?.trim() || occ.courseCode} (${occ.shortVenue})`,
          triggerDate: checkInBuilt.date,
          data: {
            occurrenceId: occ.id,
            courseCode: occ.courseCode,
            route: `/class/${occ.id}`,
            type: "class_checkin",
          },
        });
      }

      if (prefs.checkInsRepeat8pm && endH * 60 + endM < 19 * 60 + 30) {
        const eveningCheckIn = buildLocalWallClockDate(occ.dateIso, 20, 0, 0);
        if (!prefs.quietHoursEnabled || !isWithinQuietHours(eveningCheckIn.time24)) {
          scheduledList.push({
            id: `checkin-8pm-${occ.id}`,
            title: `Evening check-in · ${occ.courseCode}`,
            body: `Did you attend ${occ.courseCode} today at ${occ.shortVenue}? Tap to answer.`,
            triggerDate: eveningCheckIn.date,
            data: {
              occurrenceId: occ.id,
              courseCode: occ.courseCode,
              route: `/class/${occ.id}`,
              type: "class_checkin_8pm",
            },
          });
        }
      }
    }
  }

  // 2. Assignment Due Alerts (both Evening before at 7:00 pm AND 3 hours before due time)
  if (prefs.assignmentsEnabled && input.assignments) {
    for (const asg of input.assignments) {
      if (asg.done) continue;
      if (!isCourseReminderEnabled(prefs, asg.courseId)) continue;

      const dueDate = new Date(asg.dueAtIso);
      if (Number.isNaN(dueDate.getTime())) continue;

      // 2a. Evening before (7:00 pm local time on the day prior to due date)
      const dueDateIso = asg.dueAtIso.slice(0, 10);
      const eveningBefore = buildLocalWallClockDate(dueDateIso, 19, 0, -1);
      if (!prefs.quietHoursEnabled || !isWithinQuietHours(eveningBefore.time24)) {
        scheduledList.push({
          id: `asg-rem-eve-${asg.id}`,
          title: `${asg.courseCode} due tomorrow`,
          body: `${asg.title} · Evening reminder`,
          triggerDate: eveningBefore.date,
          data: {
            assignmentId: asg.id,
            courseCode: asg.courseCode,
            route: `/assignment/${asg.id}`,
            type: "assignment_reminder_evening",
          },
        });
      }

      // 2b. 3 hours before due time
      const threeHoursBefore = new Date(dueDate.getTime() - 3 * 60 * 60 * 1000);
      const hh = String(threeHoursBefore.getHours()).padStart(2, "0");
      const mm = String(threeHoursBefore.getMinutes()).padStart(2, "0");
      if (!prefs.quietHoursEnabled || !isWithinQuietHours(`${hh}:${mm}`)) {
        scheduledList.push({
          id: `asg-rem-3h-${asg.id}`,
          title: `${asg.courseCode} due in 3 hours`,
          body: asg.title,
          triggerDate: threeHoursBefore,
          data: {
            assignmentId: asg.id,
            courseCode: asg.courseCode,
            route: `/assignment/${asg.id}`,
            type: "assignment_reminder",
          },
        });
      }
    }
  }

  // 3. Morning Daily Summary (7:00 am on days with scheduled classes/exams/study or due assignments)
  if (prefs.morningSummaryEnabled) {
    const byDate = new Map<
      string,
      {
        classesCount: number;
        firstItem?: { courseCode: string; startTimeFormatted: string; shortVenue: string };
        assignmentsCount: number;
      }
    >();

    for (const occ of input.occurrences) {
      if (occ.status === "cancelled") continue;
      const entry = byDate.get(occ.dateIso) ?? { classesCount: 0, assignmentsCount: 0 };
      entry.classesCount += 1;
      if (!entry.firstItem) {
        entry.firstItem = {
          courseCode: occ.courseCode,
          startTimeFormatted: occ.startTimeFormatted,
          shortVenue: occ.shortVenue,
        };
      }
      byDate.set(occ.dateIso, entry);
    }

    if (input.assignments) {
      for (const asg of input.assignments) {
        if (asg.done) continue;
        const dateIso = asg.dueAtIso.slice(0, 10);
        const entry = byDate.get(dateIso) ?? { classesCount: 0, assignmentsCount: 0 };
        entry.assignmentsCount += 1;
        byDate.set(dateIso, entry);
      }
    }

    for (const [dateIso, summary] of byDate.entries()) {
      if (summary.classesCount === 0 && summary.assignmentsCount === 0) continue;
      const morning7am = buildLocalWallClockDate(dateIso, 7, 0, 0);
      const parts: string[] = [];
      if (summary.classesCount > 0) {
        parts.push(`${summary.classesCount} ${summary.classesCount === 1 ? "class" : "classes"}`);
      }
      if (summary.assignmentsCount > 0) {
        parts.push(
          `${summary.assignmentsCount} ${summary.assignmentsCount === 1 ? "assignment" : "assignments"} due`,
        );
      }
      const title = `Today on TT · ${parts.join(", ")}`;
      const body = summary.firstItem
        ? `First up: ${summary.firstItem.courseCode} at ${summary.firstItem.startTimeFormatted}, ${summary.firstItem.shortVenue}`
        : "Open TT to review your schedule for today.";

      scheduledList.push({
        id: `morning-summary-${dateIso}`,
        title,
        body,
        triggerDate: morning7am.date,
        data: {
          route: "/(tabs)",
          type: "morning_summary",
        },
      });
    }
  }

  return await replaceScheduledReminders(scheduledList);
}
