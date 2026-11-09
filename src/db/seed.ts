import {
  db,
  runMigrations,
  students,
  semesters,
  courses,
  classRules,
  classOccurrences,
  attendanceRecords,
  assignments,
  type Student,
  type Semester,
  type Course,
  type ClassRule,
  type ClassOccurrence,
  type AttendanceRecord,
  type Assignment,
} from "./index";
import { platformStorage } from "@/lib/storage";

export const SEED_STUDENT_ID = "student-anonymous";
export const SEED_SEMESTER_ID = "semester-anonymous";

export function deriveAccountIds(
  clerkUserId?: string | null,
  email?: string | null,
  username?: string | null,
): { studentId: string; semesterId: string } {
  const cleanEmail = (email ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_");
  const cleanClerk = (clerkUserId ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_");
  const cleanUsername = (username ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_");
  const accountSlug = cleanEmail || cleanClerk || cleanUsername;
  if (!accountSlug) {
    return {
      studentId: SEED_STUDENT_ID,
      semesterId: SEED_SEMESTER_ID,
    };
  }
  return {
    studentId: `student-${accountSlug}`,
    semesterId: `semester-${accountSlug}`,
  };
}

export function resetMemoryStoreForAccount(studentId: string, semesterId: string): void {
  const now = new Date().toISOString();
  memoryStore.student = {
    ...memoryStore.student,
    id: studentId,
    updatedAt: now,
  };
  memoryStore.semester = {
    ...memoryStore.semester,
    id: semesterId,
    studentId,
    updatedAt: now,
  };
  memoryStore.courses = [];
  memoryStore.classRules = [];
  memoryStore.classOccurrences = [];
  memoryStore.attendanceRecords = [];
  memoryStore.assignments = [];
  memoryStore.exams = [];
  memoryStore.personalEvents = [];
  memoryStore.followedSubscriptions = [];
  memoryStore.activeCalendarFilter = "all";
  memoryStore.activeSubscriptionFilter = "all";
  memoryStore.classNotes = {};
  memoryStore.assignmentProgress = {};
  memoryStore.breaks = [];
}

export type CalendarCategory = "all" | "classes" | "assignments" | "exams" | "others";
export type SubscriptionMode = "main" | "carryover" | "elective";

export interface FollowedSubscription {
  id: string;
  shareCode: string;
  title: string;
  department: string;
  level: string;
  institution: string;
  semesterName: string;
  semesterStartDate: string;
  semesterEndDate: string;
  repName: string;
  editorCount: number;
  memberCount: number;
  mode: SubscriptionMode;
  selectedCourseIds: string[];
  isPaused: boolean;
  pauseReason?: string;
}

export interface ExamItem {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  courseColor: string;
  paperType: "Written" | "CBT" | "Practical";
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  seatOrInstructions: string;
  sharedGroupId: string | null;
}

export interface PersonalOtherItem {
  id: string;
  category: "Gym" | "Church" | "Club" | "Study" | "Personal";
  title: string;
  color: string;
  repeatMode: "recurring" | "one-time";
  weekdays: number[];
  oneTimeDate: string | null;
  startTime: string;
  endTime: string;
  venue: string;
  note: string;
  linkedCourseId?: string | null;
  studyTopic?: string;
  completedDates?: string[];
}

export interface SeedDataset {
  student: Student;
  semester: Semester;
  courses: Course[];
  classRules: ClassRule[];
  classOccurrences: ClassOccurrence[];
  attendanceRecords: AttendanceRecord[];
  assignments: Assignment[];
  exams: ExamItem[];
  personalEvents: PersonalOtherItem[];
  followedSubscriptions: FollowedSubscription[];
  activeCalendarFilter: CalendarCategory;
  activeSubscriptionFilter: string; // "all" | subscription.id | "group-personal"
  classNotes: Record<string, string>;
  assignmentProgress: Record<string, "not_started" | "in_progress" | "done">;
  breaks: { id: string; title: string; dateRange: string }[];
}

const NOW_ISO = new Date().toISOString();

export const SHARED_CATALOG_COURSES: Course[] = [
  {
    id: "course-csc301",
    semesterId: SEED_SEMESTER_ID,
    code: "CSC 301",
    title: "Operating Systems",
    units: 3,
    color: "#2563EB",
    lecturerName: "Dr. Omoregie",
    lecturerPhone: null,
    lecturerEmail: null,
    sharedGroupId: "group-csc-300l",
    isArchived: 0,
    createdAt: NOW_ISO,
    updatedAt: NOW_ISO,
    deletedAt: null,
    isDeleted: 0,
  },
  {
    id: "course-csc305",
    semesterId: SEED_SEMESTER_ID,
    code: "CSC 305",
    title: "Database Systems",
    units: 3,
    color: "#16A34A",
    lecturerName: "Prof. Egbokhare",
    lecturerPhone: null,
    lecturerEmail: null,
    sharedGroupId: "group-csc-300l",
    isArchived: 0,
    createdAt: NOW_ISO,
    updatedAt: NOW_ISO,
    deletedAt: null,
    isDeleted: 0,
  },
  {
    id: "course-mth201",
    semesterId: SEED_SEMESTER_ID,
    code: "MTH 201",
    title: "Linear Algebra",
    units: 2,
    color: "#EA580C",
    lecturerName: "Dr. Igbinovia",
    lecturerPhone: null,
    lecturerEmail: null,
    sharedGroupId: "group-csc-300l",
    isArchived: 0,
    createdAt: NOW_ISO,
    updatedAt: NOW_ISO,
    deletedAt: null,
    isDeleted: 0,
  },
  {
    id: "course-gst311",
    semesterId: SEED_SEMESTER_ID,
    code: "GST 311",
    title: "Entrepreneurship",
    units: 2,
    color: "#7C3AED",
    lecturerName: "Dr. Osagie",
    lecturerPhone: null,
    lecturerEmail: null,
    sharedGroupId: "group-csc-300l",
    isArchived: 0,
    createdAt: NOW_ISO,
    updatedAt: NOW_ISO,
    deletedAt: null,
    isDeleted: 0,
  },
  {
    id: "course-sta211",
    semesterId: SEED_SEMESTER_ID,
    code: "STA 211",
    title: "Probability II",
    units: 3,
    color: "#D97706",
    lecturerName: "Dr. Adebayo",
    lecturerPhone: null,
    lecturerEmail: null,
    sharedGroupId: "group-sta-211",
    isArchived: 0,
    createdAt: NOW_ISO,
    updatedAt: NOW_ISO,
    deletedAt: null,
    isDeleted: 0,
  },
  {
    id: "course-eco303",
    semesterId: SEED_SEMESTER_ID,
    code: "ECO 303",
    title: "Macroeconomic Theory",
    units: 2,
    color: "#0D9488",
    lecturerName: "Prof. Okonkwo",
    lecturerPhone: null,
    lecturerEmail: null,
    sharedGroupId: "group-eco-300l",
    isArchived: 0,
    createdAt: NOW_ISO,
    updatedAt: NOW_ISO,
    deletedAt: null,
    isDeleted: 0,
  },
];

export const SHARED_CATALOG_RULES: ClassRule[] = [
  {
    id: "rule-csc301-mon",
    courseId: "course-csc301",
    weekday: 1,
    startTime: "08:00",
    endTime: "10:00",
    venue: "LT1, Faculty of Science",
    classType: "lecture",
    createdAt: NOW_ISO,
    updatedAt: NOW_ISO,
    deletedAt: null,
    isDeleted: 0,
  },
  {
    id: "rule-csc305-tue",
    courseId: "course-csc305",
    weekday: 2,
    startTime: "11:00",
    endTime: "13:00",
    venue: "Hardware Lab, Computer Science",
    classType: "practical",
    createdAt: NOW_ISO,
    updatedAt: NOW_ISO,
    deletedAt: null,
    isDeleted: 0,
  },
  {
    id: "rule-mth201-wed",
    courseId: "course-mth201",
    weekday: 3,
    startTime: "09:00",
    endTime: "11:00",
    venue: "500LT, Physical Sciences",
    classType: "lecture",
    createdAt: NOW_ISO,
    updatedAt: NOW_ISO,
    deletedAt: null,
    isDeleted: 0,
  },
  {
    id: "rule-gst311-thu",
    courseId: "course-gst311",
    weekday: 4,
    startTime: "14:00",
    endTime: "16:00",
    venue: "Akin Deko Auditorium",
    classType: "lecture",
    createdAt: NOW_ISO,
    updatedAt: NOW_ISO,
    deletedAt: null,
    isDeleted: 0,
  },
  {
    id: "rule-sta211-fri",
    courseId: "course-sta211",
    weekday: 5,
    startTime: "10:00",
    endTime: "12:00",
    venue: "LT2, Physical Sciences",
    classType: "lecture",
    createdAt: NOW_ISO,
    updatedAt: NOW_ISO,
    deletedAt: null,
    isDeleted: 0,
  },
  {
    id: "rule-eco303-wed",
    courseId: "course-eco303",
    weekday: 3,
    startTime: "13:00",
    endTime: "15:00",
    venue: "Social Sciences Hall B",
    classType: "lecture",
    createdAt: NOW_ISO,
    updatedAt: NOW_ISO,
    deletedAt: null,
    isDeleted: 0,
  },
];

export function createInitialSeedDataset(): SeedDataset {
  const student: Student = {
    id: SEED_STUDENT_ID,
    clerkUserId: null,
    displayName: "",
    username: "",
    avatarUrl: null,
    email: "",
    institution: "",
    dateOfBirth: "",
    isMinor: 0,
    guardianConsentStatus: "none",
    createdAt: NOW_ISO,
    updatedAt: NOW_ISO,
    deletedAt: null,
    isDeleted: 0,
  };

  const semester: Semester = {
    id: SEED_SEMESTER_ID,
    studentId: SEED_STUDENT_ID,
    name: "",
    startDate: "2026-10-12",
    endDate: "2027-02-12",
    isCurrent: 1,
    isPaused: 0,
    createdAt: NOW_ISO,
    updatedAt: NOW_ISO,
    deletedAt: null,
    isDeleted: 0,
  };

  return {
    student,
    semester,
    courses: [],
    classRules: [],
    classOccurrences: [],
    attendanceRecords: [],
    assignments: [],
    exams: [],
    personalEvents: [],
    followedSubscriptions: [],
    activeCalendarFilter: "all",
    activeSubscriptionFilter: "all",
    classNotes: {},
    assignmentProgress: {},
    breaks: [],
  };
}

// Singleton in-memory store used on web and synchronized with SQLite on native
export const memoryStore: SeedDataset = createInitialSeedDataset();
let isInitialized = false;

export async function ensureSeeded(): Promise<void> {
  if (isInitialized) return;
  isInitialized = true;

  if (!db) {
    return;
  }

  try {
    await runMigrations().catch(() => {
      // Migrations may already be applied
    });

    // One-time cleanup of legacy un-scoped rows in on-device SQLite
    const purgedKey = "tt_sqlite_seed_purged_v2";
    const alreadyPurged = await platformStorage.getItem(purgedKey);
    if (!alreadyPurged) {
      await db.delete(attendanceRecords);
      await db.delete(classOccurrences);
      await db.delete(classRules);
      await db.delete(assignments);
      await db.delete(courses);
      await platformStorage.setItem(purgedKey, "1");
    }

    const initial = createInitialSeedDataset();
    await db.insert(students).values(initial.student).onConflictDoNothing();
    await db.insert(semesters).values(initial.semester).onConflictDoNothing();
  } catch (error) {
    console.warn("Database initialization warning:", error);
  }
}
