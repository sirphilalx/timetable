import { db, syncOutbox, type NewSyncOutboxItem, type SyncOutboxItem } from "@/db";
import { memoryStore } from "@/db/seed";
import { platformStorage } from "./storage";
import { supabase, isSupabaseConfigured } from "./supabase";
import { generateUuidV4 } from "./timetable";

// Topological dependency order for pulling and ingesting remote records without FK failures
export const TOPOLOGICAL_ENTITY_ORDER = [
  "students",
  "guardian_consents",
  "semesters",
  "courses",
  "course_groups",
  "course_memberships",
  "class_rules",
  "class_occurrences",
  "attendance_records",
  "assignments",
  "student_assignment_progress",
  "assignment_groups",
  "assignment_group_members",
] as const;

export type SyncEntityType = (typeof TOPOLOGICAL_ENTITY_ORDER)[number];

// Non retriable HTTP client error status codes that immediately transition to dead letter
export const NON_RETRIABLE_HTTP_STATUSES = [400, 401, 403, 404, 409, 422];

const OUTBOX_STORAGE_KEY = "tt_sync_outbox_v1";
let activeOutboxStudentId = "student-anonymous";

function getScopedOutboxKey(): string {
  return `${OUTBOX_STORAGE_KEY}_${activeOutboxStudentId}`;
}

interface OutboxMemoryState {
  items: SyncOutboxItem[];
  lastSyncedAt: string | null;
  hydrated: boolean;
}

const outboxState: OutboxMemoryState = {
  items: [],
  lastSyncedAt: null,
  hydrated: false,
};

export async function switchSyncOutboxAccount(studentId: string | null): Promise<void> {
  const nextId = studentId && studentId.trim() ? studentId.trim() : "student-anonymous";
  if (activeOutboxStudentId === nextId && outboxState.hydrated) {
    return;
  }
  activeOutboxStudentId = nextId;
  outboxState.items = [];
  outboxState.lastSyncedAt = null;
  outboxState.hydrated = false;
  if (nextId !== "student-anonymous") {
    await hydrateOutboxOnce();
  }
}

// Build a new sync outbox queue record for an offline mutation
export function createSyncOutboxRecord(
  entityType: SyncEntityType,
  actionType: "insert" | "update" | "delete",
  entityId: string,
  payload: Record<string, unknown>,
): NewSyncOutboxItem {
  const nowIso = new Date().toISOString();
  return {
    id: generateUuidV4(),
    actionType,
    entityType,
    entityId,
    payload: JSON.stringify(payload),
    status: "pending",
    attempts: 0,
    maxAttempts: 5,
    lastError: null,
    createdAt: nowIso,
    updatedAt: nowIso,
  };
}

// Compare two ISO timestamps to resolve Last Write Wins conflict
// Returns true if the local change is newer or equal to the remote timestamp
export function isLocalWinnerLastWriteWins(
  localUpdatedAtIso: string,
  remoteUpdatedAtIso: string,
): boolean {
  const localMs = new Date(localUpdatedAtIso).getTime();
  const remoteMs = new Date(remoteUpdatedAtIso).getTime();
  return localMs >= remoteMs;
}

// Calculate exponential backoff delay in milliseconds
export function calculateExponentialBackoffMs(
  attempts: number,
  baseMs = 1000,
  maxMs = 30000,
): number {
  const delay = baseMs * Math.pow(2, attempts);
  return Math.min(maxMs, delay);
}

// Check whether a failed sync mutation should transition to dead letter status
export function shouldTransitionToDeadLetter(
  attempts: number,
  maxAttempts: number = 5,
  httpStatus?: number,
): boolean {
  if (httpStatus && NON_RETRIABLE_HTTP_STATUSES.includes(httpStatus)) {
    return true;
  }
  return attempts >= maxAttempts;
}

// Record an attempt on a sync outbox item
export function recordSyncAttempt(
  item: SyncOutboxItem,
  errorMessage?: string,
  httpStatus?: number,
): { status: SyncOutboxItem["status"]; attempts: number; lastError: string | null } {
  const nextAttempts = item.attempts + 1;
  const isDeadLetter = shouldTransitionToDeadLetter(nextAttempts, item.maxAttempts, httpStatus);

  return {
    status: isDeadLetter ? "dead_letter" : "failed",
    attempts: nextAttempts,
    lastError: errorMessage ?? null,
  };
}

async function hydrateOutboxOnce(): Promise<void> {
  if (outboxState.hydrated) return;
  outboxState.hydrated = true;
  try {
    const raw = await platformStorage.getItem(getScopedOutboxKey());
    if (!raw) return;
    const parsed = JSON.parse(raw) as {
      items?: SyncOutboxItem[];
      lastSyncedAt?: string | null;
    };
    if (Array.isArray(parsed.items)) {
      outboxState.items = parsed.items;
    }
    if (parsed.lastSyncedAt !== undefined) {
      outboxState.lastSyncedAt = parsed.lastSyncedAt;
    }
  } catch {
    // Keep clean initial outbox
  }
}

function persistOutboxState(): void {
  try {
    void platformStorage.setItem(
      getScopedOutboxKey(),
      JSON.stringify({
        items: outboxState.items,
        lastSyncedAt: outboxState.lastSyncedAt,
      }),
    );
  } catch {
    // Non-blocking
  }
}

export interface SyncStatusSummary {
  items: SyncOutboxItem[];
  pendingCount: number;
  failedCount: number;
  deadLetterCount: number;
  lastSyncedAt: string | null;
  isCloudConfigured: boolean;
}

export function getSyncStatusSummary(): SyncStatusSummary {
  const pendingCount = outboxState.items.filter((i) => i.status === "pending").length;
  const failedCount = outboxState.items.filter((i) => i.status === "failed").length;
  const deadLetterCount = outboxState.items.filter((i) => i.status === "dead_letter").length;
  return {
    items: [...outboxState.items],
    pendingCount,
    failedCount,
    deadLetterCount,
    lastSyncedAt: outboxState.lastSyncedAt,
    isCloudConfigured: isSupabaseConfigured(),
  };
}

export async function enqueueOutboxMutation(
  entityType: SyncEntityType,
  actionType: "insert" | "update" | "delete",
  entityId: string,
  payload: Record<string, unknown>,
): Promise<SyncOutboxItem> {
  await hydrateOutboxOnce();
  const raw = createSyncOutboxRecord(entityType, actionType, entityId, payload);
  const item: SyncOutboxItem = {
    id: raw.id,
    actionType: raw.actionType,
    entityType: raw.entityType,
    entityId: raw.entityId,
    payload: raw.payload,
    status: raw.status ?? "pending",
    attempts: raw.attempts ?? 0,
    maxAttempts: raw.maxAttempts ?? 5,
    lastError: raw.lastError ?? null,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };

  // Deduplicate existing pending outbox entry for the same entityId
  outboxState.items = [
    ...outboxState.items.filter(
      (existing) => !(existing.entityId === entityId && existing.entityType === entityType),
    ),
    item,
  ];
  persistOutboxState();

  if (db) {
    try {
      await db.insert(syncOutbox).values(item).onConflictDoNothing();
    } catch {
      // Stored in outboxState
    }
  }

  if (isSupabaseConfigured()) {
    void flushSyncOutbox();
  }

  return item;
}

export async function flushSyncOutbox(): Promise<SyncStatusSummary> {
  await hydrateOutboxOnce();

  const actionable = outboxState.items
    .filter((i) => i.status === "pending" || i.status === "failed")
    .sort(
      (a, b) =>
        TOPOLOGICAL_ENTITY_ORDER.indexOf(a.entityType as SyncEntityType) -
        TOPOLOGICAL_ENTITY_ORDER.indexOf(b.entityType as SyncEntityType),
    );

  if (actionable.length === 0) {
    outboxState.lastSyncedAt = new Date().toISOString();
    persistOutboxState();
    return getSyncStatusSummary();
  }

  if (!isSupabaseConfigured()) {
    // When running in local/offline mode without cloud keys, mark local queue flushed to SQLite
    outboxState.items = [];
    outboxState.lastSyncedAt = new Date().toISOString();
    persistOutboxState();
    return getSyncStatusSummary();
  }

  const remaining: SyncOutboxItem[] = outboxState.items.filter((i) => i.status === "dead_letter");

  for (const item of actionable) {
    try {
      const parsedPayload = JSON.parse(item.payload) as Record<string, unknown>;
      const { error, status } = await supabase
        .from(item.entityType)
        .upsert(parsedPayload, { onConflict: "id" });

      if (error) {
        const next = recordSyncAttempt(item, error.message, status);
        remaining.push({
          ...item,
          status: next.status,
          attempts: next.attempts,
          lastError: next.lastError,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error";
      const next = recordSyncAttempt(item, msg);
      remaining.push({
        ...item,
        status: next.status,
        attempts: next.attempts,
        lastError: next.lastError,
        updatedAt: new Date().toISOString(),
      });
    }
  }

  outboxState.items = remaining;
  outboxState.lastSyncedAt = new Date().toISOString();
  persistOutboxState();
  return getSyncStatusSummary();
}

export async function fetchSharedClassFromCloud(shareCode: string): Promise<{
  syncedFromCloud: boolean;
  groupId?: string;
}> {
  const normalizedCode = shareCode.trim().toUpperCase();
  if (!isSupabaseConfigured()) {
    return { syncedFromCloud: false };
  }

  try {
    const { data: groupRow, error: groupErr } = await supabase
      .from("course_groups")
      .select("*")
      .eq("share_code", normalizedCode)
      .eq("is_deleted", 0)
      .maybeSingle();

    if (groupErr || !groupRow) {
      return { syncedFromCloud: false };
    }

    const groupId = String(groupRow.id);

    const { data: remoteCourses } = await supabase
      .from("courses")
      .select("*")
      .eq("shared_group_id", groupId)
      .eq("is_deleted", 0);

    if (Array.isArray(remoteCourses) && remoteCourses.length > 0) {
      const courseIds: string[] = [];
      for (const rc of remoteCourses) {
        const cId = String(rc.id);
        courseIds.push(cId);
        const existing = memoryStore.courses.find((c) => c.id === cId);
        const remoteUpdated = String(rc.updated_at ?? new Date().toISOString());
        if (!existing || !isLocalWinnerLastWriteWins(existing.updatedAt, remoteUpdated)) {
          const mappedCourse = {
            id: cId,
            semesterId: String(rc.semester_id ?? memoryStore.semester.id),
            code: String(rc.code),
            title: String(rc.title),
            units: Number(rc.units ?? 3),
            color: String(rc.color ?? "#4F46E5"),
            lecturerName: rc.lecturer_name ? String(rc.lecturer_name) : null,
            lecturerPhone: rc.lecturer_phone ? String(rc.lecturer_phone) : null,
            lecturerEmail: rc.lecturer_email ? String(rc.lecturer_email) : null,
            sharedGroupId: groupId,
            isArchived: Number(rc.is_archived ?? 0),
            createdAt: String(rc.created_at ?? remoteUpdated),
            updatedAt: remoteUpdated,
            deletedAt: null,
            isDeleted: 0,
          };
          memoryStore.courses = [...memoryStore.courses.filter((c) => c.id !== cId), mappedCourse];
        }
      }

      if (courseIds.length > 0) {
        const { data: remoteRules } = await supabase
          .from("class_rules")
          .select("*")
          .in("course_id", courseIds)
          .eq("is_deleted", 0);

        if (Array.isArray(remoteRules)) {
          for (const rr of remoteRules) {
            const rId = String(rr.id);
            const existing = memoryStore.classRules.find((r) => r.id === rId);
            const remoteUpdated = String(rr.updated_at ?? new Date().toISOString());
            if (!existing || !isLocalWinnerLastWriteWins(existing.updatedAt, remoteUpdated)) {
              const mappedRule = {
                id: rId,
                courseId: String(rr.course_id),
                weekday: Number(rr.weekday ?? 1),
                startTime: String(rr.start_time ?? "08:00"),
                endTime: String(rr.end_time ?? "10:00"),
                venue: String(rr.venue ?? "LT1"),
                classType: String(rr.class_type ?? "lecture"),
                createdAt: String(rr.created_at ?? remoteUpdated),
                updatedAt: remoteUpdated,
                deletedAt: null,
                isDeleted: 0,
              };
              memoryStore.classRules = [
                ...memoryStore.classRules.filter((r) => r.id !== rId),
                mappedRule,
              ];
            }
          }
        }
      }
    }

    return { syncedFromCloud: true, groupId };
  } catch {
    return { syncedFromCloud: false };
  }
}

export async function pullSubscribedGroupsFromCloud(): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    for (const sub of memoryStore.followedSubscriptions) {
      await fetchSharedClassFromCloud(sub.shareCode);
    }
    return true;
  } catch {
    return false;
  }
}

export function subscribeToRepBroadcasts(onBroadcastReceived: () => void): () => void {
  if (!isSupabaseConfigured()) {
    return () => {};
  }

  try {
    const channel = supabase
      .channel("tt-rep-broadcasts")
      .on("postgres_changes", { event: "*", schema: "public", table: "class_occurrences" }, () => {
        void pullSubscribedGroupsFromCloud().then(() => onBroadcastReceived());
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "assignments" }, () => {
        void pullSubscribedGroupsFromCloud().then(() => onBroadcastReceived());
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "class_rules" }, () => {
        void pullSubscribedGroupsFromCloud().then(() => onBroadcastReceived());
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  } catch {
    return () => {};
  }
}
