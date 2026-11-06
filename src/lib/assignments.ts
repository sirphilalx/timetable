export type AssignmentProgressStatus = "not_started" | "in_progress" | "completed";
export type AssignmentSuggestionStatus = "none" | "pending" | "approved" | "rejected";

export interface GroupCapacityCheck {
  allowed: boolean;
  reason?: string;
  remainingSlots: number;
}

// Validate if a student can join an assignment group without exceeding capacity
export function checkGroupCapacity(
  currentMemberCount: number,
  maxCapacity: number,
): GroupCapacityCheck {
  const remainingSlots = Math.max(0, maxCapacity - currentMemberCount);

  if (currentMemberCount >= maxCapacity) {
    return {
      allowed: false,
      reason: `Group has reached its maximum capacity of ${maxCapacity} members`,
      remainingSlots: 0,
    };
  }

  return {
    allowed: true,
    remainingSlots,
  };
}

// Validate assignment suggestion transitions
export function canTransitionSuggestion(
  currentStatus: AssignmentSuggestionStatus,
  targetStatus: AssignmentSuggestionStatus,
  isCourseRep: boolean,
): { allowed: boolean; reason?: string } {
  if (currentStatus === "none") {
    if (targetStatus === "pending") {
      return { allowed: true };
    }
    return { allowed: false, reason: "Can only transition to pending from none" };
  }

  if (currentStatus === "pending") {
    if (!isCourseRep) {
      return {
        allowed: false,
        reason: "Only course representatives or editors can review suggestions",
      };
    }
    if (targetStatus === "approved" || targetStatus === "rejected") {
      return { allowed: true };
    }
    return { allowed: false, reason: "Pending suggestions must be approved or rejected" };
  }

  return {
    allowed: false,
    reason: `Suggestion is already settled with status ${currentStatus}`,
  };
}

// Check if an assignment due date has passed
export function isAssignmentOverdue(dueAtIso: string, now: Date = new Date()): boolean {
  return now.getTime() > new Date(dueAtIso).getTime();
}
