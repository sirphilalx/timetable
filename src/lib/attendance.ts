import type { AttendanceRecord } from "@/db";

export type AttendanceStatus = "present" | "absent" | "cancelled" | "unknown" | "expired";

// Compute expiration ISO string: 7 days after occurrence at 23:59:59 West Africa Time (UTC+1 = 22:59:59 UTC)
export function computeAttendanceExpiresAt(occurrenceDate: string): string {
  const parts = occurrenceDate.split("-").map(Number);
  const year = parts[0] ?? 2026;
  const month = parts[1] ?? 1;
  const day = parts[2] ?? 1;

  // Add 7 days to date
  const targetDate = new Date(Date.UTC(year, month - 1, day + 7, 22, 59, 59, 999));
  return targetDate.toISOString();
}

// Check if attendance check in window has expired
export function isAttendanceCheckInExpired(expiresAtIso: string, now: Date = new Date()): boolean {
  const expiresAtMs = new Date(expiresAtIso).getTime();
  return now.getTime() > expiresAtMs;
}

export interface AttendanceSummaryInput {
  status: string;
  date: string;
}

export interface AttendanceMetricResult {
  presentCount: number;
  absentCount: number;
  expiredCount: number;
  totalEligible: number;
  percentage: number | null; // null if no classes held yet
  isTargetMet: boolean; // Nigerian university benchmark: 75% target
}

// Calculate course attendance percentage for completed occurrences
export function calculateAttendanceMetrics(
  records: AttendanceSummaryInput[],
  todayIsoDate: string,
): AttendanceMetricResult {
  // Only evaluate lectures on or before today
  const pastRecords = records.filter(
    (record) => record.date <= todayIsoDate && record.status !== "cancelled",
  );

  let presentCount = 0;
  let absentCount = 0;
  let expiredCount = 0;

  for (const rec of pastRecords) {
    if (rec.status === "present") {
      presentCount++;
    } else if (rec.status === "absent") {
      absentCount++;
    } else if (rec.status === "expired" || rec.status === "unknown") {
      expiredCount++;
    }
  }

  const totalEligible = pastRecords.length;
  if (totalEligible === 0) {
    return {
      presentCount: 0,
      absentCount: 0,
      expiredCount: 0,
      totalEligible: 0,
      percentage: null,
      isTargetMet: true,
    };
  }

  const percentage = Math.round((presentCount / totalEligible) * 100);
  return {
    presentCount,
    absentCount,
    expiredCount,
    totalEligible,
    percentage,
    isTargetMet: percentage >= 75,
  };
}

// Validate attendance status transitions
export function canTransitionAttendance(
  currentRecord: Pick<AttendanceRecord, "status" | "expiresAt">,
  targetStatus: AttendanceStatus,
  now: Date = new Date(),
): { allowed: boolean; reason?: string } {
  const isExpired = isAttendanceCheckInExpired(currentRecord.expiresAt, now);

  if (isExpired && (targetStatus === "present" || targetStatus === "absent")) {
    return {
      allowed: false,
      reason: "Attendance check in window has expired after 7 days",
    };
  }

  if (currentRecord.status === "cancelled") {
    return {
      allowed: false,
      reason: "Cannot check in to a cancelled lecture",
    };
  }

  return { allowed: true };
}
