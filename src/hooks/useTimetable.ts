import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import NetInfo from "@react-native-community/netinfo";
import { eq } from "drizzle-orm";
import {
  db,
  students,
  courses,
  classRules,
  semesters,
  attendanceRecords,
  assignments,
  classOccurrences,
  type Course,
  type ClassRule,
  type AttendanceRecord,
  type Assignment,
  type ClassOccurrence,
} from "@/db";
import {
  ensureSeeded,
  memoryStore,
  resetMemoryStoreForAccount,
  SEED_SEMESTER_ID,
  SEED_STUDENT_ID,
  SHARED_CATALOG_COURSES,
  SHARED_CATALOG_RULES,
  type CalendarCategory,
  type SubscriptionMode,
  type FollowedSubscription,
  type ExamItem,
  type PersonalOtherItem,
} from "@/db/seed";
import {
  expandWeeklyClassRules,
  mergeOccurrencesWithOverrides,
  generateUuidV4,
} from "@/lib/timetable";
import { buildWeekStripForDate, getCurrentTime24, getTodayIsoDate } from "@/lib/dateClock";
import { platformStorage } from "@/lib/storage";
import {
  enqueueOutboxMutation,
  flushSyncOutbox,
  getSyncStatusSummary,
  pullSubscribedGroupsFromCloud,
  subscribeToRepBroadcasts,
  switchSyncOutboxAccount,
} from "@/lib/sync";
import {
  appendInAppNotification,
  clearAllNotifications,
  getInAppNotificationsSnapshot,
  loadInAppNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  notifyClassMovedOrCancelled,
  subscribeToInAppNotifications,
  subscribeToReminderPreferenceChanges,
  switchReminderAccount,
  syncScheduledClassAlarms,
  type InAppNotificationItem,
} from "@/lib/reminders";
import { trackEvent } from "@/lib/analytics";

const PERSIST_STORE_PREFIX = "tt_timetable_store_v4_";
const PENDING_JOIN_STORAGE_KEY = "tt_pending_join_v1";
let hydratedAccountId: string | null = null;

export interface SubscribeSharedClassInput {
  groupId: string;
  shareCode: string;
  title: string;
  department: string;
  level: string;
  institution: string;
  repName: string;
  memberCount: number;
  mode: SubscriptionMode;
  selectedCourseIds: string[];
}

function applySubscriptionToMemoryStore(input: SubscribeSharedClassInput): FollowedSubscription {
  // Ensure catalog courses & rules for this shared group exist in memoryStore for this account
  const groupCatalogCourses = SHARED_CATALOG_COURSES.filter(
    (c) => c.sharedGroupId === input.groupId,
  );
  if (groupCatalogCourses.length > 0) {
    const existingCourseIds = new Set(memoryStore.courses.map((c) => c.id));
    for (const catCourse of groupCatalogCourses) {
      if (!existingCourseIds.has(catCourse.id)) {
        memoryStore.courses.push({
          ...catCourse,
          semesterId: memoryStore.semester.id || SEED_SEMESTER_ID,
        });
      }
    }
    const groupCourseIds = new Set(groupCatalogCourses.map((c) => c.id));
    const existingRuleIds = new Set(memoryStore.classRules.map((r) => r.id));
    for (const catRule of SHARED_CATALOG_RULES) {
      if (groupCourseIds.has(catRule.courseId) && !existingRuleIds.has(catRule.id)) {
        memoryStore.classRules.push({ ...catRule });
      }
    }
  }

  const existingIdx = memoryStore.followedSubscriptions.findIndex((s) => s.id === input.groupId);
  const selectedCourses = memoryStore.courses.filter((c) => input.selectedCourseIds.includes(c.id));
  const firstCode = selectedCourses[0]?.code ?? input.shareCode;

  const computedTitle =
    input.mode === "carryover"
      ? `${firstCode}${selectedCourses.length > 1 ? ` +${selectedCourses.length - 1}` : ""} carryover · ${input.level}`
      : input.mode === "elective"
        ? `${firstCode}${selectedCourses.length > 1 ? ` +${selectedCourses.length - 1}` : ""} elective · ${input.department} ${input.level}`
        : input.title;

  const sub: FollowedSubscription = {
    id: input.groupId,
    shareCode: input.shareCode,
    title: computedTitle,
    department: input.department,
    level: input.level,
    institution: input.institution,
    semesterName: memoryStore.semester.name || "First semester 2026/2027",
    semesterStartDate: memoryStore.semester.startDate,
    semesterEndDate: memoryStore.semester.endDate,
    repName: input.repName,
    editorCount: 2,
    memberCount: input.memberCount,
    mode: input.mode,
    selectedCourseIds: input.selectedCourseIds,
    isPaused: false,
  };

  if (existingIdx >= 0) {
    memoryStore.followedSubscriptions[existingIdx] = sub;
  } else {
    memoryStore.followedSubscriptions.push(sub);
  }

  return sub;
}

function getAccountStoreKey(studentId: string): string {
  return `${PERSIST_STORE_PREFIX}${studentId}`;
}

function mergeUniqueById<T extends { id: string }>(persisted: T[], inMemory: T[]): T[] {
  const byId = new Map<string, T>();
  for (const item of persisted) {
    byId.set(item.id, item);
  }
  for (const item of inMemory) {
    byId.set(item.id, item);
  }
  return Array.from(byId.values());
}

function isScopedStudentId(studentId: string | null | undefined): boolean {
  return Boolean(studentId && studentId !== SEED_STUDENT_ID && studentId !== "student-local-001");
}

function canPersistStudentId(studentId: string | null | undefined): boolean {
  return Boolean(studentId && studentId !== "student-local-001");
}

export async function clearAnonymousTimetableStore(): Promise<void> {
  hydratedAccountId = null;
  resetMemoryStoreForAccount(SEED_STUDENT_ID, SEED_SEMESTER_ID);
  await switchReminderAccount(SEED_STUDENT_ID);
  await switchSyncOutboxAccount(SEED_STUDENT_ID);
  try {
    await platformStorage.removeItem(getAccountStoreKey(SEED_STUDENT_ID));
  } catch {
    // Ignore storage removal errors
  }
}

export async function switchTimetableAccount(studentId: string, semesterId: string): Promise<void> {
  const previousStudentId = memoryStore.student.id;
  await switchReminderAccount(studentId);
  await switchSyncOutboxAccount(studentId);

  // Same account: never wipe in-memory courses or class rules
  if (previousStudentId === studentId) {
    memoryStore.semester = {
      ...memoryStore.semester,
      id: semesterId,
      studentId,
    };
    if (hydratedAccountId !== studentId) {
      await hydrateMemoryStoreOnce();
    }
    persistMemoryStoreSnapshot();
    return;
  }

  // If transitioning from anonymous onboarding into an authenticated account, carry over any timetable just created during setup
  const hasStagedOnboardingData =
    previousStudentId === SEED_STUDENT_ID &&
    studentId !== SEED_STUDENT_ID &&
    (memoryStore.courses.length > 0 ||
      memoryStore.classRules.length > 0 ||
      memoryStore.classOccurrences.length > 0 ||
      memoryStore.assignments.length > 0 ||
      memoryStore.exams.length > 0 ||
      memoryStore.personalEvents.length > 0 ||
      memoryStore.followedSubscriptions.length > 0);

  const staged = hasStagedOnboardingData
    ? {
        courses: memoryStore.courses.map((c) => ({ ...c, semesterId })),
        classRules: [...memoryStore.classRules],
        classOccurrences: [...memoryStore.classOccurrences],
        attendanceRecords: memoryStore.attendanceRecords.map((a) => ({ ...a, studentId })),
        assignments: [...memoryStore.assignments],
        exams: [...memoryStore.exams],
        personalEvents: [...memoryStore.personalEvents],
        followedSubscriptions: [...memoryStore.followedSubscriptions],
        classNotes: { ...memoryStore.classNotes },
        assignmentProgress: { ...memoryStore.assignmentProgress },
        breaks: [...memoryStore.breaks],
      }
    : null;

  resetMemoryStoreForAccount(studentId, semesterId);
  hydratedAccountId = null;
  await hydrateMemoryStoreOnce();

  if (staged && memoryStore.courses.length === 0) {
    memoryStore.courses = mergeUniqueById(memoryStore.courses, staged.courses);
    memoryStore.classRules = mergeUniqueById(memoryStore.classRules, staged.classRules);
    memoryStore.classOccurrences = mergeUniqueById(
      memoryStore.classOccurrences,
      staged.classOccurrences,
    );
    memoryStore.attendanceRecords = mergeUniqueById(
      memoryStore.attendanceRecords,
      staged.attendanceRecords,
    );
    memoryStore.assignments = mergeUniqueById(memoryStore.assignments, staged.assignments);
    memoryStore.exams = mergeUniqueById(memoryStore.exams, staged.exams);
    memoryStore.personalEvents = mergeUniqueById(memoryStore.personalEvents, staged.personalEvents);
    memoryStore.followedSubscriptions = mergeUniqueById(
      memoryStore.followedSubscriptions,
      staged.followedSubscriptions,
    );
    memoryStore.classNotes = { ...memoryStore.classNotes, ...staged.classNotes };
    memoryStore.assignmentProgress = {
      ...memoryStore.assignmentProgress,
      ...staged.assignmentProgress,
    };
    memoryStore.breaks = mergeUniqueById(memoryStore.breaks, staged.breaks);
    persistMemoryStoreSnapshot();
  }
  if (previousStudentId === SEED_STUDENT_ID) {
    try {
      await platformStorage.removeItem(getAccountStoreKey(SEED_STUDENT_ID));
    } catch {
      // Ignore cleanup error
    }
  }
}

async function hydrateMemoryStoreOnce(): Promise<void> {
  const currentStudentId = memoryStore.student.id;
  if (!canPersistStudentId(currentStudentId)) {
    return;
  }
  if (hydratedAccountId === currentStudentId) {
    return;
  }
  hydratedAccountId = currentStudentId;
  try {
    const raw = await platformStorage.getItem(getAccountStoreKey(currentStudentId));
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<typeof memoryStore>;
      if (Array.isArray(parsed.courses)) {
        memoryStore.courses = mergeUniqueById(parsed.courses, memoryStore.courses);
      }
      if (Array.isArray(parsed.classRules)) {
        memoryStore.classRules = mergeUniqueById(parsed.classRules, memoryStore.classRules);
      }
      if (Array.isArray(parsed.classOccurrences)) {
        memoryStore.classOccurrences = mergeUniqueById(
          parsed.classOccurrences,
          memoryStore.classOccurrences,
        );
      }
      if (Array.isArray(parsed.attendanceRecords)) {
        memoryStore.attendanceRecords = mergeUniqueById(
          parsed.attendanceRecords,
          memoryStore.attendanceRecords,
        );
      }
      if (Array.isArray(parsed.assignments)) {
        memoryStore.assignments = mergeUniqueById(parsed.assignments, memoryStore.assignments);
      }
      if (Array.isArray(parsed.exams)) {
        memoryStore.exams = mergeUniqueById(parsed.exams, memoryStore.exams);
      }
      if (Array.isArray(parsed.personalEvents)) {
        memoryStore.personalEvents = mergeUniqueById(
          parsed.personalEvents,
          memoryStore.personalEvents,
        );
      }
      if (Array.isArray(parsed.followedSubscriptions)) {
        memoryStore.followedSubscriptions = mergeUniqueById(
          parsed.followedSubscriptions,
          memoryStore.followedSubscriptions,
        );
      }
      if (parsed.activeCalendarFilter && memoryStore.activeCalendarFilter === "all") {
        memoryStore.activeCalendarFilter = parsed.activeCalendarFilter;
      }
      if (parsed.activeSubscriptionFilter && memoryStore.activeSubscriptionFilter === "all") {
        memoryStore.activeSubscriptionFilter = parsed.activeSubscriptionFilter;
      }
      if (parsed.classNotes) {
        memoryStore.classNotes = { ...parsed.classNotes, ...memoryStore.classNotes };
      }
      if (parsed.assignmentProgress) {
        memoryStore.assignmentProgress = {
          ...parsed.assignmentProgress,
          ...memoryStore.assignmentProgress,
        };
      }
      if (Array.isArray(parsed.breaks)) {
        memoryStore.breaks = mergeUniqueById(parsed.breaks, memoryStore.breaks);
      }
    }

    // Apply any shared class joined during unauthenticated onboarding preview
    const pendingJoinRaw = await platformStorage.getItem(PENDING_JOIN_STORAGE_KEY);
    if (pendingJoinRaw) {
      await platformStorage.removeItem(PENDING_JOIN_STORAGE_KEY);
      const pendingJoin = JSON.parse(pendingJoinRaw) as SubscribeSharedClassInput;
      if (pendingJoin?.groupId) {
        applySubscriptionToMemoryStore(pendingJoin);
        persistMemoryStoreSnapshot();
      }
    }
  } catch {
    // Ignore corrupt snapshot
  }
}

function persistMemoryStoreSnapshot(): void {
  const currentStudentId = memoryStore.student.id;
  if (!canPersistStudentId(currentStudentId)) {
    return;
  }
  try {
    const payload = JSON.stringify(getStoreSnapshot());
    void platformStorage.setItem(getAccountStoreKey(currentStudentId), payload);
  } catch {
    // Non-blocking persistence
  }
}

export type {
  CalendarCategory,
  SubscriptionMode,
  FollowedSubscription,
  ExamItem,
  PersonalOtherItem,
};

export interface EnrichedClassItem {
  id: string;
  ruleId: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  courseColor: string;
  courseUnits: number;
  lecturerName: string | null;
  classType: string;
  calendarKind: "classes" | "assignments" | "exams" | "others";
  subscriptionMode: "main" | "carryover" | "elective" | "personal";
  sharedGroupId: string | null;
  date: string;
  startTime: string;
  endTime: string;
  displayTime: string;
  venue: string;
  shortVenue: string;
  faculty: string;
  status: "scheduled" | "moved" | "cancelled" | "completed";
  attended: boolean;
  moved: boolean;
  isPast: boolean;
  sourceAttribution?: string;
  note: string;
  recurrenceLabel: string;
}

export function formatTimeRange(startTime: string, endTime: string): string {
  const [sh = 8, sm = 0] = startTime.split(":").map(Number);
  const [eh = 10, em = 0] = endTime.split(":").map(Number);

  const sHour12 = sh % 12 === 0 ? 12 : sh % 12;
  const eHour12 = eh % 12 === 0 ? 12 : eh % 12;
  const sMinStr = String(sm).padStart(2, "0");
  const eMinStr = String(em).padStart(2, "0");
  const ePeriod = eh >= 12 ? " pm" : "";

  if (sh === 11 && eh === 13) {
    return `${sHour12}:${sMinStr} – ${eHour12}:${eMinStr} pm`;
  }
  return `${sHour12}:${sMinStr} – ${eHour12}:${eMinStr}${eh > 12 ? ePeriod : ""}`;
}

export function formatStartTimeAmPm(startTime: string): string {
  const [sh = 10, sm = 0] = startTime.split(":").map(Number);
  const hour12 = sh % 12 === 0 ? 12 : sh % 12;
  const minStr = String(sm).padStart(2, "0");
  const period = sh >= 12 ? "pm" : "am";
  return `${hour12}:${minStr} ${period}`;
}

const WEEKDAY_SHORT: Record<number, string> = {
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
  7: "Sun",
};

function getIsoWeekday(isoDate: string): number {
  const parts = isoDate.split("-").map(Number);
  const year = parts[0] ?? 2026;
  const month = parts[1] ?? 11;
  const day = parts[2] ?? 6;
  const jsDay = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return jsDay === 0 ? 7 : jsDay;
}

function parseMinutes(hhmm: string): number {
  const [h = 8, m = 0] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function getStoreSnapshot() {
  return {
    student: memoryStore.student,
    semester: memoryStore.semester,
    courses: [...memoryStore.courses],
    classRules: [...memoryStore.classRules],
    classOccurrences: [...memoryStore.classOccurrences],
    attendanceRecords: [...memoryStore.attendanceRecords],
    assignments: [...memoryStore.assignments],
    exams: [...memoryStore.exams],
    personalEvents: [...memoryStore.personalEvents],
    followedSubscriptions: [...memoryStore.followedSubscriptions],
    activeCalendarFilter: memoryStore.activeCalendarFilter,
    activeSubscriptionFilter: memoryStore.activeSubscriptionFilter,
    classNotes: { ...memoryStore.classNotes },
    assignmentProgress: { ...memoryStore.assignmentProgress },
    breaks: [...memoryStore.breaks],
  };
}

function commitAndRefresh(queryClient: ReturnType<typeof useQueryClient>) {
  persistMemoryStoreSnapshot();
  queryClient.setQueryData(["timetable"], getStoreSnapshot());
  void queryClient.invalidateQueries({ queryKey: ["timetable"] });
}

export function useTimetable() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribeBroadcasts = subscribeToRepBroadcasts(() => {
      commitAndRefresh(queryClient);
    });

    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      const isOnline = Boolean(state.isConnected) && state.isInternetReachable !== false;
      if (isOnline) {
        void flushSyncOutbox().then(() => {
          void queryClient.invalidateQueries({ queryKey: ["cloud-sync-status"] });
        });
        void pullSubscribedGroupsFromCloud().then((updated) => {
          if (updated) {
            commitAndRefresh(queryClient);
          }
        });
      }
    });

    return () => {
      unsubscribeBroadcasts();
      unsubscribeNetInfo();
    };
  }, [queryClient]);

  const query = useQuery({
    queryKey: ["timetable"],
    queryFn: async () => {
      await ensureSeeded();
      await hydrateMemoryStoreOnce();

      if (db && isScopedStudentId(memoryStore.student.id)) {
        try {
          const activeSemesterId = memoryStore.semester.id;
          const activeGroupIds = new Set(memoryStore.followedSubscriptions.map((s) => s.id));
          const dbCourses = (await db.select().from(courses)).filter(
            (c) =>
              c.isDeleted === 0 &&
              (c.semesterId === activeSemesterId ||
                (Boolean(c.sharedGroupId) && activeGroupIds.has(c.sharedGroupId!))),
          );

          if (dbCourses.length > 0) {
            const byId = new Map<string, Course>();
            for (const c of memoryStore.courses) {
              if (c.isDeleted === 0) byId.set(c.id, c);
            }
            for (const c of dbCourses) {
              byId.set(c.id, c);
            }
            memoryStore.courses = Array.from(byId.values());
          }

          const accountCourseIds = new Set(memoryStore.courses.map((c) => c.id));
          const dbRules = (await db.select().from(classRules)).filter(
            (r) => r.isDeleted === 0 && accountCourseIds.has(r.courseId),
          );
          const dbOccurrences = (await db.select().from(classOccurrences)).filter(
            (o) => o.isDeleted === 0 && accountCourseIds.has(o.courseId),
          );

          if (dbRules.length > 0) {
            const ruleById = new Map<string, ClassRule>();
            for (const r of memoryStore.classRules) {
              if (r.isDeleted === 0) ruleById.set(r.id, r);
            }
            for (const r of dbRules) {
              ruleById.set(r.id, r);
            }
            memoryStore.classRules = Array.from(ruleById.values());
          }
          if (dbOccurrences.length > 0) {
            const occById = new Map<string, ClassOccurrence>();
            for (const o of memoryStore.classOccurrences) {
              if (o.isDeleted === 0) occById.set(o.id, o);
            }
            for (const o of dbOccurrences) {
              occById.set(o.id, o);
            }
            memoryStore.classOccurrences = Array.from(occById.values());
          }
        } catch {
          // Use in-memory account store fallback
        }
      }

      return getStoreSnapshot();
    },
    staleTime: 0,
  });

  const data = query.data ?? getStoreSnapshot();

  const subscriptionByGroupId = new Map<string, FollowedSubscription>();
  for (const sub of data.followedSubscriptions) {
    subscriptionByGroupId.set(sub.id, sub);
  }

  const effectiveSubFilter =
    data.activeSubscriptionFilter === "all" ||
    data.activeSubscriptionFilter === "group-personal" ||
    subscriptionByGroupId.has(data.activeSubscriptionFilter)
      ? data.activeSubscriptionFilter
      : "all";

  // Determine whether a course is subscribed by the student
  function isCourseSubscribed(course: Course): boolean {
    if (!course.sharedGroupId) {
      // Personal course created by student
      return effectiveSubFilter === "all" || effectiveSubFilter === "group-personal";
    }

    const sub = subscriptionByGroupId.get(course.sharedGroupId);
    if (!sub) return false;

    if (effectiveSubFilter !== "all" && effectiveSubFilter !== course.sharedGroupId) {
      return false;
    }

    if (sub.mode === "main") {
      return true;
    }
    // For carry-over or elective subscriptions, only include courses explicitly selected by the student
    return sub.selectedCourseIds.includes(course.id);
  }

  const subscribedCourses = data.courses.filter(isCourseSubscribed);
  const subscribedCourseIds = new Set(subscribedCourses.map((c) => c.id));

  const courseMap = new Map<string, Course>();
  for (const c of data.courses) {
    courseMap.set(c.id, c);
  }

  function getAttributionForCourse(course: Course | undefined): {
    mode: "main" | "carryover" | "elective" | "personal";
    attribution?: string;
  } {
    if (!course || !course.sharedGroupId) {
      return { mode: "personal", attribution: undefined };
    }
    const sub = subscriptionByGroupId.get(course.sharedGroupId);
    if (!sub) {
      return { mode: "main", attribution: undefined };
    }
    if (sub.mode === "carryover") {
      return {
        mode: "carryover",
        attribution: `From ${course.code} carryover · ${sub.level}`,
      };
    }
    if (sub.mode === "elective") {
      return {
        mode: "elective",
        attribution: `From ${course.code} elective · ${sub.department} ${sub.level}`,
      };
    }
    return {
      mode: "main",
      attribution: undefined,
    };
  }

  function getOccurrencesForDate(
    isoDate: string,
    options?: {
      calendarFilter?: CalendarCategory;
      includeAssignmentsInTimeline?: boolean;
    },
  ): EnrichedClassItem[] {
    const calFilter = options?.calendarFilter ?? data.activeCalendarFilter;
    const subFilter = data.activeSubscriptionFilter;
    const results: EnrichedClassItem[] = [];
    const todayIso = getTodayIsoDate();
    const nowTime24 = getCurrentTime24();

    // 1. CLASSES (Main class + Carry-over courses + Elective courses + Personal courses)
    if (calFilter === "all" || calFilter === "classes") {
      const activeRules = data.classRules.filter((r) => subscribedCourseIds.has(r.courseId));
      const virtual = expandWeeklyClassRules(activeRules, isoDate, isoDate);
      const concreteForDate = data.classOccurrences.filter(
        (o) => o.date === isoDate && subscribedCourseIds.has(o.courseId),
      );
      const merged = mergeOccurrencesWithOverrides(virtual, concreteForDate);

      for (const occ of merged) {
        const course = courseMap.get(occ.courseId);
        const rule = data.classRules.find((r) => r.id === occ.ruleId);
        const courseRules = data.classRules.filter((r) => r.courseId === occ.courseId);
        const dayNames = Array.from(
          new Set(courseRules.map((r) => WEEKDAY_SHORT[r.weekday] ?? "Mon")),
        );
        const recurrenceLabel = !occ.ruleId
          ? "One-time class"
          : dayNames.length > 1
            ? `Every ${dayNames.slice(0, -1).join(", ")} and ${dayNames[dayNames.length - 1]}`
            : `Every ${dayNames[0] ?? "Fri"}`;

        const isAttended =
          occ.status === "completed" ||
          data.attendanceRecords.some((a) => a.occurrenceId === occ.id && a.status === "present");
        const isMoved = occ.status === "moved" || occ.venue.startsWith("Moved to ");
        const isPast = isoDate < todayIso || (isoDate === todayIso && occ.endTime <= nowTime24);

        const rawClassType = rule?.classType ?? "lecture";
        const classTypeLabel = rawClassType.charAt(0).toUpperCase() + rawClassType.slice(1);

        const venueParts = occ.venue.replace(/^Moved to\s+/i, "").split(",");
        const shortVenue = (venueParts[0] ?? "LT1").trim();
        const faculty = (venueParts[1] ?? "Faculty of Science").trim();

        const { mode, attribution } = getAttributionForCourse(course);

        results.push({
          id: occ.id,
          ruleId: occ.ruleId,
          courseId: occ.courseId,
          courseCode: course?.code ?? "CSC 301",
          courseTitle: `${course?.title ?? "Operating Systems"} · ${classTypeLabel}`,
          courseColor: course?.color ?? "#2563EB",
          courseUnits: course?.units ?? 3,
          lecturerName: course?.lecturerName ?? null,
          classType: classTypeLabel,
          calendarKind: "classes",
          subscriptionMode: mode,
          sharedGroupId: course?.sharedGroupId ?? null,
          date: occ.date,
          startTime: occ.startTime,
          endTime: occ.endTime,
          displayTime: formatTimeRange(occ.startTime, occ.endTime),
          venue: occ.venue,
          shortVenue,
          faculty,
          status: occ.status as EnrichedClassItem["status"],
          attended: isAttended,
          moved: isMoved,
          isPast,
          sourceAttribution: occ.overrideReason ?? attribution,
          note: data.classNotes[occ.id] ?? data.classNotes[occ.ruleId] ?? "",
          recurrenceLabel,
        });
      }
    }

    // 2. EXAMS
    if (calFilter === "all" || calFilter === "exams") {
      const examsForDate = data.exams.filter((exam) => {
        if (exam.date !== isoDate) return false;
        const course = courseMap.get(exam.courseId);
        if (course) {
          return isCourseSubscribed(course);
        }
        return subFilter === "all" || subFilter === exam.sharedGroupId;
      });

      for (const exam of examsForDate) {
        const course = courseMap.get(exam.courseId);
        const { mode, attribution } = getAttributionForCourse(course);
        const isPast = isoDate < todayIso || (isoDate === todayIso && exam.endTime <= nowTime24);

        results.push({
          id: exam.id,
          ruleId: exam.id,
          courseId: exam.courseId,
          courseCode: `${exam.courseCode} · EXAM`,
          courseTitle: `${exam.courseTitle} (${exam.paperType})`,
          courseColor: exam.courseColor || course?.color || "#DC2626",
          courseUnits: course?.units ?? 3,
          lecturerName: course?.lecturerName ?? null,
          classType: `Exam · ${exam.paperType}`,
          calendarKind: "exams",
          subscriptionMode: mode,
          sharedGroupId: exam.sharedGroupId,
          date: exam.date,
          startTime: exam.startTime,
          endTime: exam.endTime,
          displayTime: formatTimeRange(exam.startTime, exam.endTime),
          venue: exam.venue,
          shortVenue: exam.venue.split(",")[0]?.trim() ?? exam.venue,
          faculty: exam.seatOrInstructions,
          status: "scheduled",
          attended: false,
          moved: false,
          isPast,
          sourceAttribution: attribution ?? exam.seatOrInstructions,
          note: exam.seatOrInstructions,
          recurrenceLabel: "Semester Exam",
        });
      }
    }

    // 3. OTHERS (Gym, Church, Club, Study, Personal)
    if (calFilter === "all" || calFilter === "others") {
      const isoWeekday = getIsoWeekday(isoDate);
      const personalForDate = data.personalEvents.filter((ev) => {
        // Subscription filtering:
        // If linked to a course, include when that course is subscribed (or when filtering to personal events)
        if (ev.linkedCourseId) {
          const linkedCourse = courseMap.get(ev.linkedCourseId);
          if (linkedCourse) {
            if (subFilter !== "group-personal" && !isCourseSubscribed(linkedCourse)) {
              return false;
            }
          }
        } else if (subFilter !== "all" && subFilter !== "group-personal") {
          return false;
        }

        if (ev.repeatMode === "one-time") {
          return ev.oneTimeDate === isoDate;
        }
        return ev.weekdays.includes(isoWeekday);
      });

      for (const ev of personalForDate) {
        const linkedCourse = ev.linkedCourseId ? courseMap.get(ev.linkedCourseId) : undefined;
        const isCompletedSession = Boolean(ev.completedDates?.includes(isoDate));
        const isPast =
          isCompletedSession ||
          isoDate < todayIso ||
          (isoDate === todayIso && ev.endTime <= nowTime24);
        const dayNames = ev.weekdays.map((w) => WEEKDAY_SHORT[w] ?? "Fri");
        const badgeCode =
          ev.category === "Study" && linkedCourse
            ? `STUDY · ${linkedCourse.code}`
            : ev.category.toUpperCase();

        results.push({
          id: `${ev.id}-${isoDate}`,
          ruleId: ev.id,
          courseId: linkedCourse?.id ?? ev.id,
          courseCode: badgeCode,
          courseTitle: ev.title,
          courseColor: linkedCourse?.color ?? ev.color,
          courseUnits: linkedCourse?.units ?? 0,
          lecturerName: linkedCourse?.lecturerName ?? null,
          classType: ev.category === "Study" ? "Reading Session" : ev.category,
          calendarKind: "others",
          subscriptionMode: "personal",
          sharedGroupId: linkedCourse?.sharedGroupId ?? null,
          date: isoDate,
          startTime: ev.startTime,
          endTime: ev.endTime,
          displayTime: formatTimeRange(ev.startTime, ev.endTime),
          venue: ev.venue,
          shortVenue: ev.venue.split("·")[0]?.trim() ?? ev.venue,
          faculty:
            ev.category === "Study" && linkedCourse
              ? `${linkedCourse.code} · ${ev.studyTopic || "Reading timetable"}`
              : "Personal · Others calendar",
          status: isCompletedSession ? "completed" : "scheduled",
          attended: isCompletedSession,
          moved: false,
          isPast,
          sourceAttribution:
            ev.category === "Study" && linkedCourse
              ? `Reading · ${linkedCourse.code}${ev.studyTopic ? ` (${ev.studyTopic})` : ""}`
              : `Others · ${ev.category}`,
          note: ev.note || ev.studyTopic || "",
          recurrenceLabel:
            ev.repeatMode === "one-time" ? "One-time event" : `Every ${dayNames.join(", ")}`,
        });
      }
    }

    // 4. ASSIGNMENTS (included in timeline when filtered to "assignments" or requested)
    if (calFilter === "assignments" || options?.includeAssignmentsInTimeline) {
      const filteredAssignments = data.assignments.filter((asg) => {
        const course = courseMap.get(asg.courseId);
        if (course && !isCourseSubscribed(course)) return false;
        const asgDate = asg.dueAt.slice(0, 10);
        return calFilter === "assignments" ? true : asgDate === isoDate;
      });

      for (const asg of filteredAssignments) {
        const course = courseMap.get(asg.courseId);
        const { mode, attribution } = getAttributionForCourse(course);
        results.push({
          id: asg.id,
          ruleId: asg.id,
          courseId: asg.courseId,
          courseCode: `${course?.code ?? "CSC 305"} · DUE`,
          courseTitle: asg.title,
          courseColor: course?.color ?? "#0D9488",
          courseUnits: course?.units ?? 3,
          lecturerName: course?.lecturerName ?? null,
          classType: asg.type === "group" ? "Group Assignment" : "Assignment",
          calendarKind: "assignments",
          subscriptionMode: mode,
          sharedGroupId: course?.sharedGroupId ?? null,
          date: asg.dueAt.slice(0, 10),
          startTime: "16:00",
          endTime: "17:00",
          displayTime: "Due 11:59 pm",
          venue: asg.type === "group" ? "Group submission" : "Course portal / Class rep",
          shortVenue: "Assignment due",
          faculty: asg.description ?? "",
          status: "scheduled",
          attended: false,
          moved: false,
          isPast: false,
          sourceAttribution: attribution,
          note: asg.description ?? "",
          recurrenceLabel: "Assignment deadline",
        });
      }
    }

    return results.sort((a, b) => parseMinutes(a.startTime) - parseMinutes(b.startTime));
  }

  function hasClassesOnDate(isoDate: string): boolean {
    return getOccurrencesForDate(isoDate).length > 0;
  }

  // Filter assignments by active subscription filter
  const filteredAssignments = data.assignments.filter((asg) => {
    const course = courseMap.get(asg.courseId);
    if (!course) return true;
    return isCourseSubscribed(course);
  });

  useEffect(() => {
    const runAlarmSync = () => {
      const today = new Date();
      const upcomingOccurrences: {
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
      }[] = [];

      for (let offset = 0; offset < 7; offset += 1) {
        const d = new Date(today.getTime() + offset * 86400000);
        const isoDate = d.toISOString().slice(0, 10);
        const items = getOccurrencesForDate(isoDate, { calendarFilter: "all" });
        for (const item of items) {
          if (item.calendarKind === "assignments") continue;
          upcomingOccurrences.push({
            id: item.id,
            courseId: item.courseId,
            courseCode: item.courseCode,
            courseTitle: item.courseTitle,
            classType: item.classType,
            calendarKind: item.calendarKind,
            startTimeFormatted: item.displayTime.split("–")[0]?.trim() || item.startTime,
            shortVenue: item.shortVenue,
            dateIso: item.date,
            startTime24: item.startTime,
            endTime24: item.endTime,
            status: item.status,
            attended: item.attended,
          });
        }
      }

      const upcomingAssignments = filteredAssignments.map((asg) => ({
        id: asg.id,
        courseId: asg.courseId,
        courseCode: courseMap.get(asg.courseId)?.code ?? "CSC 301",
        title: asg.title,
        dueAtIso: asg.dueAt,
        done: data.assignmentProgress[asg.id] === "done",
      }));

      void syncScheduledClassAlarms({
        occurrences: upcomingOccurrences,
        assignments: upcomingAssignments,
      });
    };

    runAlarmSync();
    const unsubPrefs = subscribeToReminderPreferenceChanges(() => {
      runAlarmSync();
    });
    return () => {
      unsubPrefs();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    data.courses.length,
    data.classRules.length,
    data.classOccurrences.length,
    data.exams.length,
    data.personalEvents.length,
    filteredAssignments.length,
  ]);

  const catalogCourseById = new Map<string, Course>();
  for (const cat of SHARED_CATALOG_COURSES) {
    catalogCourseById.set(cat.id, cat);
  }
  for (const c of data.courses) {
    catalogCourseById.set(c.id, c);
  }

  return {
    ...query,
    data: {
      ...data,
      courses: subscribedCourses,
      allCatalogCourses: Array.from(catalogCourseById.values()),
      assignments: filteredAssignments,
    },
    getOccurrencesForDate,
    hasClassesOnDate,
  };
}

export function useUpdateCalendarFilters() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      calendarFilter?: CalendarCategory;
      subscriptionFilter?: string;
    }) => {
      if (input.calendarFilter !== undefined) {
        memoryStore.activeCalendarFilter = input.calendarFilter;
      }
      if (input.subscriptionFilter !== undefined) {
        memoryStore.activeSubscriptionFilter = input.subscriptionFilter;
      }
      return {
        activeCalendarFilter: memoryStore.activeCalendarFilter,
        activeSubscriptionFilter: memoryStore.activeSubscriptionFilter,
      };
    },
    onSuccess: () => {
      commitAndRefresh(queryClient);
    },
  });
}

export function useSubscribeSharedClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SubscribeSharedClassInput) => {
      await ensureSeeded();
      const sub = applySubscriptionToMemoryStore(input);
      if (!isScopedStudentId(memoryStore.student.id)) {
        try {
          await platformStorage.setItem(PENDING_JOIN_STORAGE_KEY, JSON.stringify(input));
        } catch {
          // Non-blocking
        }
      }
      trackEvent("shared_class_joined", {
        share_code: input.shareCode,
        subscription_mode: sub.mode,
        courses_count: input.selectedCourseIds.length,
      });
      return sub;
    },
    onSuccess: () => {
      commitAndRefresh(queryClient);
    },
  });
}

export function useCreateExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      courseId: string;
      paperType: "Written" | "CBT" | "Practical";
      date: string;
      startTime: string;
      endTime: string;
      venue: string;
      seatOrInstructions: string;
    }) => {
      await ensureSeeded();
      const course = memoryStore.courses.find((c) => c.id === input.courseId);
      const exam: ExamItem = {
        id: generateUuidV4(),
        courseId: input.courseId,
        courseCode: course?.code ?? "CSC 301",
        courseTitle: `${course?.title ?? "Operating Systems"} Exam`,
        courseColor: course?.color ?? "#DC2626",
        paperType: input.paperType,
        date: input.date,
        startTime: input.startTime,
        endTime: input.endTime,
        venue: input.venue.trim() || "ETF Hall, Main Campus",
        seatOrInstructions: input.seatOrInstructions.trim() || "Bring student ID card",
        sharedGroupId: course?.sharedGroupId ?? null,
      };

      memoryStore.exams = [...memoryStore.exams, exam];
      trackEvent("event_created", {
        event_type: "exam",
        paper_type: input.paperType,
        course_code: exam.courseCode,
      });
      return exam;
    },
    onSuccess: () => {
      commitAndRefresh(queryClient);
    },
  });
}

export function useCreatePersonalEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      category: "Gym" | "Church" | "Club" | "Study" | "Personal";
      title: string;
      color: string;
      repeatMode: "recurring" | "one-time";
      weekdays: number[];
      oneTimeDate: string | null;
      startTime: string;
      endTime: string;
      venue: string;
      note?: string;
      linkedCourseId?: string | null;
      studyTopic?: string;
    }) => {
      await ensureSeeded();
      const ev: PersonalOtherItem = {
        id: generateUuidV4(),
        category: input.category,
        title: input.title.trim() || input.category,
        color: input.color,
        repeatMode: input.repeatMode,
        weekdays: input.weekdays.length > 0 ? input.weekdays : [5],
        oneTimeDate: input.oneTimeDate,
        startTime: input.startTime,
        endTime: input.endTime,
        venue: input.venue.trim() || "Campus",
        note: input.note?.trim() ?? "",
        linkedCourseId: input.linkedCourseId ?? null,
        studyTopic: input.studyTopic?.trim() ?? "",
        completedDates: [],
      };

      memoryStore.personalEvents = [...memoryStore.personalEvents, ev];
      trackEvent("event_created", {
        event_type: input.category.toLowerCase(),
        repeat_mode: input.repeatMode,
        has_linked_course: Boolean(input.linkedCourseId),
      });
      return ev;
    },
    onSuccess: () => {
      commitAndRefresh(queryClient);
    },
  });
}

export function useToggleStudySessionComplete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { eventId: string; date: string }) => {
      await ensureSeeded();
      const cleanId = input.eventId.replace(/-\d{4}-\d{2}-\d{2}$/, "");
      memoryStore.personalEvents = memoryStore.personalEvents.map((ev) => {
        if (ev.id !== cleanId) return ev;
        const prevDates = ev.completedDates ?? [];
        const exists = prevDates.includes(input.date);
        const nextDates = exists
          ? prevDates.filter((d) => d !== input.date)
          : [...prevDates, input.date];
        return {
          ...ev,
          completedDates: nextDates,
        };
      });
      return input;
    },
    onSuccess: () => {
      commitAndRefresh(queryClient);
    },
  });
}

export function useDeleteExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (examId: string) => {
      memoryStore.exams = memoryStore.exams.filter((e) => e.id !== examId);
      return examId;
    },
    onSuccess: () => {
      commitAndRefresh(queryClient);
    },
  });
}

export function useDeletePersonalEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: string) => {
      memoryStore.personalEvents = memoryStore.personalEvents.filter(
        (ev) => ev.id !== eventId && !eventId.startsWith(`${ev.id}-`),
      );
      return eventId;
    },
    onSuccess: () => {
      commitAndRefresh(queryClient);
    },
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      code: string;
      title: string;
      units: number;
      color: string;
      lecturerName?: string;
    }) => {
      await ensureSeeded();
      const now = new Date().toISOString();
      const newCourse: Course = {
        id: generateUuidV4(),
        semesterId: memoryStore.semester.id || SEED_SEMESTER_ID,
        code: input.code.trim().toUpperCase(),
        title: input.title.trim(),
        units: input.units,
        color: input.color,
        lecturerName: input.lecturerName?.trim() || null,
        lecturerPhone: null,
        lecturerEmail: null,
        sharedGroupId: null,
        isArchived: 0,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        isDeleted: 0,
      };

      memoryStore.courses = [...memoryStore.courses, newCourse];
      if (
        memoryStore.activeSubscriptionFilter !== "all" &&
        memoryStore.activeSubscriptionFilter !== "group-personal"
      ) {
        memoryStore.activeSubscriptionFilter = "all";
      }
      if (db) {
        try {
          await db.insert(students).values(memoryStore.student).onConflictDoNothing();
          await db.insert(semesters).values(memoryStore.semester).onConflictDoNothing();
          await db.insert(courses).values(newCourse).onConflictDoNothing();
        } catch {
          // Stored in memoryStore
        }
      }
      commitAndRefresh(queryClient);
      trackEvent("course_created", {
        course_code: newCourse.code,
        units: newCourse.units,
      });
      return newCourse;
    },
    onSuccess: () => {
      commitAndRefresh(queryClient);
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      id: string;
      code?: string;
      title?: string;
      units?: number;
      color?: string;
      lecturerName?: string | null;
      lecturerPhone?: string | null;
      lecturerEmail?: string | null;
    }) => {
      await ensureSeeded();
      const now = new Date().toISOString();
      let updatedCourse: Course | null = null;

      memoryStore.courses = memoryStore.courses.map((c) => {
        if (c.id !== input.id) return c;
        const next: Course = {
          ...c,
          code: input.code !== undefined ? input.code.trim().toUpperCase() || c.code : c.code,
          title: input.title !== undefined ? input.title.trim() || c.title : c.title,
          units: input.units !== undefined ? input.units : c.units,
          color: input.color !== undefined ? input.color : c.color,
          lecturerName:
            input.lecturerName !== undefined ? input.lecturerName?.trim() || null : c.lecturerName,
          lecturerPhone:
            input.lecturerPhone !== undefined
              ? input.lecturerPhone?.trim() || null
              : c.lecturerPhone,
          lecturerEmail:
            input.lecturerEmail !== undefined
              ? input.lecturerEmail?.trim() || null
              : c.lecturerEmail,
          updatedAt: now,
        };
        updatedCourse = next;
        return next;
      });

      if (updatedCourse) {
        const finalCourse = updatedCourse as Course;
        memoryStore.exams = memoryStore.exams.map((ex) =>
          ex.courseId === finalCourse.id
            ? {
                ...ex,
                courseCode: finalCourse.code,
                courseTitle: `${finalCourse.title} Exam`,
                courseColor: finalCourse.color,
              }
            : ex,
        );

        if (db) {
          try {
            await db
              .update(courses)
              .set({
                code: finalCourse.code,
                title: finalCourse.title,
                units: finalCourse.units,
                color: finalCourse.color,
                lecturerName: finalCourse.lecturerName,
                lecturerPhone: finalCourse.lecturerPhone,
                lecturerEmail: finalCourse.lecturerEmail,
                updatedAt: now,
              })
              .where(eq(courses.id, finalCourse.id));
          } catch {
            // Persisted in memoryStore
          }
        }

        void enqueueOutboxMutation("courses", "update", finalCourse.id, {
          id: finalCourse.id,
          semester_id: finalCourse.semesterId,
          code: finalCourse.code,
          title: finalCourse.title,
          units: finalCourse.units,
          color: finalCourse.color,
          lecturer_name: finalCourse.lecturerName,
          lecturer_phone: finalCourse.lecturerPhone,
          lecturer_email: finalCourse.lecturerEmail,
          shared_group_id: finalCourse.sharedGroupId,
          is_archived: finalCourse.isArchived,
          updated_at: now,
        });
      }

      return updatedCourse;
    },
    onSuccess: () => {
      commitAndRefresh(queryClient);
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      await ensureSeeded();
      const now = new Date().toISOString();

      const removedRuleIds = new Set(
        memoryStore.classRules.filter((r) => r.courseId === courseId).map((r) => r.id),
      );
      const removedOccIds = new Set(
        memoryStore.classOccurrences.filter((o) => o.courseId === courseId).map((o) => o.id),
      );

      memoryStore.courses = memoryStore.courses.filter((c) => c.id !== courseId);
      memoryStore.classRules = memoryStore.classRules.filter((r) => r.courseId !== courseId);
      memoryStore.classOccurrences = memoryStore.classOccurrences.filter(
        (o) => o.courseId !== courseId,
      );
      memoryStore.assignments = memoryStore.assignments.filter((a) => a.courseId !== courseId);
      memoryStore.exams = memoryStore.exams.filter((e) => e.courseId !== courseId);
      memoryStore.personalEvents = memoryStore.personalEvents.filter(
        (ev) => ev.linkedCourseId !== courseId,
      );
      memoryStore.attendanceRecords = memoryStore.attendanceRecords.filter((rec) => {
        if (removedOccIds.has(rec.occurrenceId)) return false;
        for (const rId of removedRuleIds) {
          if (rec.occurrenceId.includes(rId)) return false;
        }
        return true;
      });
      memoryStore.followedSubscriptions = memoryStore.followedSubscriptions.map((sub) => ({
        ...sub,
        selectedCourseIds: sub.selectedCourseIds.filter((id) => id !== courseId),
      }));

      if (db) {
        try {
          await db.delete(classOccurrences).where(eq(classOccurrences.courseId, courseId));
          await db.delete(classRules).where(eq(classRules.courseId, courseId));
          await db.delete(assignments).where(eq(assignments.courseId, courseId));
          await db.delete(courses).where(eq(courses.id, courseId));
        } catch {
          // Persisted in memoryStore
        }
      }

      void enqueueOutboxMutation("courses", "delete", courseId, {
        id: courseId,
        is_deleted: 1,
        deleted_at: now,
        updated_at: now,
      });

      trackEvent("course_deleted", { course_id: courseId });
      return courseId;
    },
    onSuccess: () => {
      commitAndRefresh(queryClient);
    },
  });
}

export function useUpdateClassRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      id: string;
      weekday?: number;
      startTime?: string;
      endTime?: string;
      venue?: string;
      classType?: "lecture" | "tutorial" | "lab";
    }) => {
      await ensureSeeded();
      const now = new Date().toISOString();
      let updatedRule: ClassRule | null = null;

      memoryStore.classRules = memoryStore.classRules.map((r) => {
        if (r.id !== input.id) return r;
        const next: ClassRule = {
          ...r,
          weekday: input.weekday !== undefined ? input.weekday : r.weekday,
          startTime: input.startTime !== undefined ? input.startTime : r.startTime,
          endTime: input.endTime !== undefined ? input.endTime : r.endTime,
          venue: input.venue !== undefined ? input.venue.trim() || r.venue : r.venue,
          classType: input.classType !== undefined ? input.classType : r.classType,
          updatedAt: now,
        };
        updatedRule = next;
        return next;
      });

      if (updatedRule && db) {
        const finalRule = updatedRule as ClassRule;
        try {
          await db
            .update(classRules)
            .set({
              weekday: finalRule.weekday,
              startTime: finalRule.startTime,
              endTime: finalRule.endTime,
              venue: finalRule.venue,
              classType: finalRule.classType,
              updatedAt: now,
            })
            .where(eq(classRules.id, finalRule.id));
        } catch {
          // Persisted in memoryStore
        }
      }

      return updatedRule;
    },
    onSuccess: () => {
      commitAndRefresh(queryClient);
    },
  });
}

export function useDeleteClassRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ruleId: string) => {
      await ensureSeeded();
      memoryStore.classRules = memoryStore.classRules.filter((r) => r.id !== ruleId);
      memoryStore.classOccurrences = memoryStore.classOccurrences.filter(
        (o) => o.ruleId !== ruleId,
      );

      if (db) {
        try {
          await db.delete(classOccurrences).where(eq(classOccurrences.ruleId, ruleId));
          await db.delete(classRules).where(eq(classRules.id, ruleId));
        } catch {
          // Persisted in memoryStore
        }
      }

      return ruleId;
    },
    onSuccess: () => {
      commitAndRefresh(queryClient);
    },
  });
}

export function useDeleteClassOccurrence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (occurrenceId: string) => {
      await ensureSeeded();
      memoryStore.classOccurrences = memoryStore.classOccurrences.filter(
        (o) => o.id !== occurrenceId,
      );

      if (db) {
        try {
          await db.delete(classOccurrences).where(eq(classOccurrences.id, occurrenceId));
        } catch {
          // Persisted in memoryStore
        }
      }

      return occurrenceId;
    },
    onSuccess: () => {
      commitAndRefresh(queryClient);
    },
  });
}

export interface DayScheduleInput {
  weekday: number;
  startTime: string;
  endTime: string;
  venue: string;
  repeatMode: "recurring" | "one-time";
  oneTimeDate?: string;
}

export function useCreateClassRules() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      courseId: string;
      classType: "lecture" | "tutorial" | "lab";
      weekdays: number[];
      startTime: string;
      endTime: string;
      venue: string;
      schedules?: DayScheduleInput[];
    }) => {
      await ensureSeeded();
      const now = new Date().toISOString();
      const createdRules: ClassRule[] = [];

      const items: DayScheduleInput[] =
        input.schedules && input.schedules.length > 0
          ? input.schedules
          : input.weekdays.map((weekday) => ({
              weekday,
              startTime: input.startTime,
              endTime: input.endTime,
              venue: input.venue,
              repeatMode: "recurring" as const,
            }));

      for (const item of items) {
        const cleanVenue = item.venue.trim() || input.venue.trim() || "LT1, Faculty of Science";
        if (item.repeatMode === "one-time") {
          const todayIso = getTodayIsoDate();
          const weekStrip = buildWeekStripForDate(todayIso);
          const occDate =
            item.oneTimeDate ?? weekStrip[(item.weekday - 1 + 7) % 7]?.isoDate ?? todayIso;
          const occ: ClassOccurrence = {
            id: generateUuidV4(),
            ruleId: null,
            courseId: input.courseId,
            date: occDate,
            startTime: item.startTime,
            endTime: item.endTime,
            venue: cleanVenue,
            status: "scheduled",
            overrideReason: "One-time class",
            createdAt: now,
            updatedAt: now,
            deletedAt: null,
            isDeleted: 0,
          };
          memoryStore.classOccurrences = [...memoryStore.classOccurrences, occ];

          if (db) {
            try {
              await db.insert(classOccurrences).values(occ).onConflictDoNothing();
            } catch {
              // Stored in memoryStore
            }
          }
        } else {
          const rule: ClassRule = {
            id: generateUuidV4(),
            courseId: input.courseId,
            weekday: item.weekday,
            startTime: item.startTime,
            endTime: item.endTime,
            venue: cleanVenue,
            classType: input.classType,
            createdAt: now,
            updatedAt: now,
            deletedAt: null,
            isDeleted: 0,
          };
          createdRules.push(rule);
          memoryStore.classRules = [...memoryStore.classRules, rule];

          if (db) {
            try {
              await db.insert(classRules).values(rule).onConflictDoNothing();
            } catch {
              // Stored in memoryStore
            }
          }
        }
      }
      if (
        memoryStore.activeCalendarFilter !== "all" &&
        memoryStore.activeCalendarFilter !== "classes"
      ) {
        memoryStore.activeCalendarFilter = "all";
      }
      if (
        memoryStore.activeSubscriptionFilter !== "all" &&
        memoryStore.activeSubscriptionFilter !== "group-personal"
      ) {
        memoryStore.activeSubscriptionFilter = "all";
      }
      commitAndRefresh(queryClient);
      trackEvent("class_rule_created", {
        class_type: input.classType,
        days_count: items.length,
      });
      return createdRules;
    },
    onSuccess: () => {
      commitAndRefresh(queryClient);
    },
  });
}

export function useUpdateSemester() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      institution: string;
      name: string;
      startDate: string;
      endDate: string;
    }) => {
      const now = new Date().toISOString();
      memoryStore.student = {
        ...memoryStore.student,
        institution: input.institution.trim(),
        updatedAt: now,
      };
      memoryStore.semester = {
        ...memoryStore.semester,
        name: input.name.trim(),
        startDate: input.startDate,
        endDate: input.endDate,
        updatedAt: now,
      };
      if (db) {
        try {
          await db.insert(semesters).values(memoryStore.semester).onConflictDoNothing();
        } catch {
          // Stored in memoryStore
        }
      }
      return memoryStore.semester;
    },
    onSuccess: () => {
      commitAndRefresh(queryClient);
    },
  });
}

export function useSaveClassNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { occurrenceId: string; note: string }) => {
      memoryStore.classNotes[input.occurrenceId] = input.note;
      return input;
    },
    onSuccess: () => {
      commitAndRefresh(queryClient);
    },
  });
}

export function useRecordAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      occurrenceId: string;
      status: "present" | "absent" | "excused";
    }) => {
      const now = new Date().toISOString();
      const existingIdx = memoryStore.attendanceRecords.findIndex(
        (r) => r.occurrenceId === input.occurrenceId,
      );
      const record: AttendanceRecord = {
        id:
          existingIdx >= 0
            ? (memoryStore.attendanceRecords[existingIdx]?.id ?? generateUuidV4())
            : generateUuidV4(),
        occurrenceId: input.occurrenceId,
        studentId: memoryStore.student.id,
        status: input.status,
        answeredAt: now,
        expiresAt: now,
        notes: null,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        isDeleted: 0,
      };
      if (existingIdx >= 0) {
        memoryStore.attendanceRecords[existingIdx] = record;
      } else {
        memoryStore.attendanceRecords.push(record);
      }

      if (db) {
        try {
          await db.insert(attendanceRecords).values(record).onConflictDoNothing();
        } catch {
          // Stored in memoryStore
        }
      }
      void enqueueOutboxMutation("attendance_records", "insert", record.id, {
        id: record.id,
        occurrence_id: record.occurrenceId,
        student_id: record.studentId,
        status: record.status,
        answered_at: record.answeredAt,
        expires_at: record.expiresAt,
        updated_at: record.updatedAt,
      });
      trackEvent("attendance_checked_in", {
        status: record.status,
      });
      return record;
    },
    onSuccess: () => {
      commitAndRefresh(queryClient);
    },
  });
}

export function useCreateAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      courseId: string;
      title: string;
      description?: string;
      dueAt: string;
      isGroupAssignment?: boolean;
    }) => {
      const now = new Date().toISOString();
      const newAssignment: Assignment = {
        id: generateUuidV4(),
        courseId: input.courseId,
        creatorStudentId: memoryStore.student.id,
        title: input.title.trim(),
        description: input.description?.trim() || null,
        dueAt: input.dueAt,
        type: input.isGroupAssignment ? "group" : "solo",
        visibility: "shared",
        suggestionStatus: "approved",
        suggestedByStudentId: null,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        isDeleted: 0,
      };
      memoryStore.assignments.unshift(newAssignment);
      if (db) {
        try {
          await db.insert(assignments).values(newAssignment);
        } catch {
          // Stored in memoryStore
        }
      }
      void enqueueOutboxMutation("assignments", "insert", newAssignment.id, {
        id: newAssignment.id,
        course_id: newAssignment.courseId,
        creator_student_id: newAssignment.creatorStudentId,
        title: newAssignment.title,
        description: newAssignment.description,
        due_at: newAssignment.dueAt,
        type: newAssignment.type,
        visibility: newAssignment.visibility,
        suggestion_status: newAssignment.suggestionStatus,
        updated_at: newAssignment.updatedAt,
      });

      const course = memoryStore.courses.find((c) => c.id === newAssignment.courseId);
      const courseCode = course?.code ?? "Course";
      void appendInAppNotification({
        id: `notif-asg-${newAssignment.id}`,
        kind: "assignment",
        title: `New assignment · "${newAssignment.title}"`,
        subtitle: `${courseCode} · Due ${newAssignment.dueAt.slice(0, 10)}`,
        route: `/assignment/${newAssignment.id}`,
      });

      trackEvent("assignment_created", {
        course_code: courseCode,
        assignment_type: newAssignment.type,
      });

      return newAssignment;
    },
    onSuccess: () => {
      commitAndRefresh(queryClient);
    },
  });
}

export function useUpdateAssignmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      id: string;
      isCompleted?: number;
      progress?: "not_started" | "in_progress" | "done";
    }) => {
      const now = new Date().toISOString();
      const nextProgress = input.progress ?? (input.isCompleted === 1 ? "done" : "in_progress");
      memoryStore.assignmentProgress[input.id] = nextProgress;
      memoryStore.assignments = memoryStore.assignments.map((a) =>
        a.id === input.id ? { ...a, updatedAt: now } : a,
      );
      void enqueueOutboxMutation("student_assignment_progress", "update", input.id, {
        id: `${memoryStore.student.id}-${input.id}`,
        assignment_id: input.id,
        student_id: memoryStore.student.id,
        status: nextProgress === "done" ? "completed" : nextProgress,
        completed_at: nextProgress === "done" ? now : null,
        updated_at: now,
      });
      trackEvent("assignment_status_toggled", {
        status: nextProgress,
      });
      return { id: input.id, progress: nextProgress };
    },
    onSuccess: () => {
      commitAndRefresh(queryClient);
    },
  });
}

export function useDeleteAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assignmentId: string) => {
      await ensureSeeded();
      const now = new Date().toISOString();
      memoryStore.assignments = memoryStore.assignments.filter((a) => a.id !== assignmentId);
      delete memoryStore.assignmentProgress[assignmentId];
      if (db) {
        try {
          await db.delete(assignments).where(eq(assignments.id, assignmentId));
        } catch {
          // Stored in memoryStore
        }
      }
      void enqueueOutboxMutation("assignments", "delete", assignmentId, {
        id: assignmentId,
        is_deleted: 1,
        deleted_at: now,
        updated_at: now,
      });
      trackEvent("assignment_deleted", { assignment_id: assignmentId });
      return assignmentId;
    },
    onSuccess: () => {
      commitAndRefresh(queryClient);
    },
  });
}

export function useOverrideClassOccurrence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      ruleId: string;
      courseId: string;
      date: string;
      startTime: string;
      endTime: string;
      venue: string;
      status: "scheduled" | "moved" | "cancelled" | "completed";
      overrideReason?: string;
    }) => {
      const now = new Date().toISOString();
      const existingIdx = memoryStore.classOccurrences.findIndex(
        (o) => o.ruleId === input.ruleId && o.date === input.date,
      );
      const occ: ClassOccurrence = {
        id:
          existingIdx >= 0
            ? (memoryStore.classOccurrences[existingIdx]?.id ?? generateUuidV4())
            : generateUuidV4(),
        ruleId: input.ruleId,
        courseId: input.courseId,
        date: input.date,
        startTime: input.startTime,
        endTime: input.endTime,
        venue: input.venue,
        status: input.status,
        overrideReason: input.overrideReason ?? "Updated by your rep",
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        isDeleted: 0,
      };
      if (existingIdx >= 0) {
        memoryStore.classOccurrences[existingIdx] = occ;
      } else {
        memoryStore.classOccurrences.push(occ);
      }
      if (db) {
        try {
          await db.insert(classOccurrences).values(occ).onConflictDoNothing();
        } catch {
          // Stored in memoryStore
        }
      }
      void enqueueOutboxMutation("class_occurrences", "update", occ.id, {
        id: occ.id,
        rule_id: occ.ruleId,
        course_id: occ.courseId,
        date: occ.date,
        start_time: occ.startTime,
        end_time: occ.endTime,
        venue: occ.venue,
        status: occ.status,
        override_reason: occ.overrideReason,
        updated_at: occ.updatedAt,
      });

      if (input.status === "moved" || input.status === "cancelled") {
        const course = memoryStore.courses.find((c) => c.id === input.courseId);
        void notifyClassMovedOrCancelled({
          occurrenceId: occ.id,
          courseCode: course?.code ?? "Class",
          action: input.status,
          newVenue:
            input.venue
              .replace(/^Moved to\s+/i, "")
              .split(",")[0]
              ?.trim() || input.venue,
          newTimeFormatted: formatStartTimeAmPm(input.startTime),
          actorLabel: occ.overrideReason ?? "Updated by your rep",
        });
      }

      return occ;
    },
    onSuccess: () => {
      commitAndRefresh(queryClient);
    },
  });
}

export function useInAppNotifications() {
  const { data } = useTimetable();
  const [storedItems, setStoredItems] = useState<InAppNotificationItem[]>(() =>
    getInAppNotificationsSnapshot(),
  );

  useEffect(() => {
    void loadInAppNotifications().then((loaded) => {
      setStoredItems([...loaded]);
    });
    const unsub = subscribeToInAppNotifications(() => {
      setStoredItems(getInAppNotificationsSnapshot());
    });
    return () => {
      unsub();
    };
  }, []);

  // Derive live items from moved/cancelled class occurrences and due assignments if not already stored
  const courseMap = new Map<string, Course>();
  for (const c of data.courses) {
    courseMap.set(c.id, c);
  }

  const storedIds = new Set(storedItems.map((i) => i.id));
  const derivedItems: InAppNotificationItem[] = [];

  for (const occ of data.classOccurrences) {
    if (occ.isDeleted !== 0) continue;
    if (occ.status !== "moved" && occ.status !== "cancelled") continue;
    const derivedId = `notif-occ-${occ.id}`;
    if (storedIds.has(derivedId)) continue;
    const course = courseMap.get(occ.courseId);
    const courseCode = course?.code ?? "Class";
    const shortVenue =
      occ.venue
        .replace(/^Moved to\s+/i, "")
        .split(",")[0]
        ?.trim() || occ.venue;
    derivedItems.push({
      id: derivedId,
      kind: occ.status === "cancelled" ? "cancel" : "move",
      title:
        occ.status === "cancelled"
          ? `${courseCode} cancelled (${occ.date})`
          : `${courseCode} moved to ${shortVenue}, ${formatStartTimeAmPm(occ.startTime)}`,
      subtitle: occ.overrideReason ?? "Updated from class schedule",
      createdAtIso: occ.updatedAt || occ.createdAt,
      unread: true,
      route: `/class/${occ.id}`,
    });
  }

  for (const asg of data.assignments) {
    if (asg.isDeleted !== 0) continue;
    if (data.assignmentProgress[asg.id] === "done") continue;
    const derivedId = `notif-asg-${asg.id}`;
    if (storedIds.has(derivedId)) continue;
    const course = courseMap.get(asg.courseId);
    const courseCode = course?.code ?? "Course";
    derivedItems.push({
      id: derivedId,
      kind: "assignment",
      title: `${courseCode} · "${asg.title}"`,
      subtitle: `Due ${asg.dueAt.slice(0, 10)} · tap to review`,
      createdAtIso: asg.updatedAt || asg.createdAt,
      unread: true,
      route: `/assignment/${asg.id}`,
    });
  }

  const allItems = [...storedItems, ...derivedItems].sort(
    (a, b) => new Date(b.createdAtIso).getTime() - new Date(a.createdAtIso).getTime(),
  );
  const unreadCount = allItems.filter((item) => item.unread).length;

  const markRead = async (item: InAppNotificationItem) => {
    if (storedIds.has(item.id)) {
      await markNotificationRead(item.id);
    } else {
      await appendInAppNotification({
        ...item,
        unread: false,
      });
    }
  };

  const markAllRead = async () => {
    for (const d of derivedItems) {
      await appendInAppNotification({
        ...d,
        unread: false,
      });
    }
    await markAllNotificationsRead();
  };

  const clearAll = async () => {
    await clearAllNotifications();
  };

  return {
    items: allItems,
    unreadCount,
    markRead,
    markAllRead,
    clearAll,
  };
}

export function useCloudSyncStatus() {
  const { data } = useTimetable();
  void data;
  return getSyncStatusSummary();
}

export function useTriggerCloudSync() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await pullSubscribedGroupsFromCloud();
      return await flushSyncOutbox();
    },
    onSuccess: () => {
      commitAndRefresh(queryClient);
    },
  });
}
