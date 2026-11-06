import type { NewSyncOutboxItem, SyncOutboxItem } from "@/db";
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
