import type { ClassOccurrence, ClassRule } from "@/db";

export interface VirtualOccurrence {
  id: string;
  ruleId: string;
  courseId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  venue: string;
  status: ClassOccurrence["status"];
  overrideReason?: string | null;
  isVirtual: boolean;
}

// Generate standard UUID v4 string
export function generateUuidV4(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  // Fallback random UUID v4 generator
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Simple deterministic hash for generating consistent occurrence IDs from (ruleId, date)
function stringHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, "0");
}

// Generate deterministic identifier for a recurring rule occurrence on a specific date
export function generateDeterministicOccurrenceId(ruleId: string, date: string): string {
  const hash1 = stringHash(`${ruleId}:${date}:1`);
  const hash2 = stringHash(`${ruleId}:${date}:2`);
  const hash3 = stringHash(`${ruleId}:${date}:3`);
  const hash4 = stringHash(`${ruleId}:${date}:4`);
  return `${hash1.slice(0, 8)}-${hash2.slice(0, 4)}-5${hash2.slice(4, 7)}-8${hash3.slice(0, 3)}-${hash4.slice(0, 12)}`;
}

// Convert YYYY-MM-DD to ISO day of week: 1=Monday, 2=Tuesday, ..., 7=Sunday
export function getWeekdayFromIsoDate(isoDate: string): number {
  const parts = isoDate.split("-").map(Number);
  const year = parts[0] ?? 2026;
  const month = parts[1] ?? 1;
  const day = parts[2] ?? 1;
  const dateObj = new Date(Date.UTC(year, month - 1, day));
  const jsDay = dateObj.getUTCDay(); // 0=Sunday, 1=Monday ... 6=Saturday
  return jsDay === 0 ? 7 : jsDay;
}

// Add days to ISO date string
export function addDaysToIsoDate(isoDate: string, days: number): string {
  const parts = isoDate.split("-").map(Number);
  const year = parts[0] ?? 2026;
  const month = parts[1] ?? 1;
  const day = parts[2] ?? 1;
  const dateObj = new Date(Date.UTC(year, month - 1, day + days));
  const y = dateObj.getUTCFullYear();
  const m = String(dateObj.getUTCMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Generate list of dates between start date and end date inclusive
export function getDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  let current = startDate;
  while (current <= endDate) {
    dates.push(current);
    current = addDaysToIsoDate(current, 1);
  }
  return dates;
}

// Expand weekly recurring class rules into virtual occurrences across a date range
export function expandWeeklyClassRules(
  rules: ClassRule[],
  startDate: string,
  endDate: string,
): VirtualOccurrence[] {
  const activeRules = rules.filter((rule) => rule.isDeleted === 0);
  const dates = getDateRange(startDate, endDate);
  const occurrences: VirtualOccurrence[] = [];

  for (const date of dates) {
    const weekday = getWeekdayFromIsoDate(date);
    const matchingRules = activeRules.filter((rule) => rule.weekday === weekday);

    for (const rule of matchingRules) {
      occurrences.push({
        id: generateDeterministicOccurrenceId(rule.id, date),
        ruleId: rule.id,
        courseId: rule.courseId,
        date,
        startTime: rule.startTime,
        endTime: rule.endTime,
        venue: rule.venue,
        status: "scheduled",
        overrideReason: null,
        isVirtual: true,
      });
    }
  }

  return occurrences;
}

// Merge virtual occurrences with persisted database overrides (relocated, cancelled, or custom occurrences)
export function mergeOccurrencesWithOverrides(
  virtualOccurrences: VirtualOccurrence[],
  persistedOccurrences: ClassOccurrence[],
): VirtualOccurrence[] {
  const activeOverrides = persistedOccurrences.filter((occ) => occ.isDeleted === 0);
  const overrideMap = new Map<string, ClassOccurrence>();

  // Map overrides by ruleId:date when ruleId exists, or by occurrence id
  for (const occ of activeOverrides) {
    if (occ.ruleId) {
      overrideMap.set(`${occ.ruleId}:${occ.date}`, occ);
    } else {
      overrideMap.set(`adhoc:${occ.id}`, occ);
    }
  }

  const result: VirtualOccurrence[] = [];
  const appliedOverrides = new Set<string>();

  // Overlay overrides onto virtual occurrences
  for (const virt of virtualOccurrences) {
    const key = `${virt.ruleId}:${virt.date}`;
    const override = overrideMap.get(key);

    if (override) {
      appliedOverrides.add(key);
      result.push({
        id: override.id,
        ruleId: virt.ruleId,
        courseId: override.courseId,
        date: override.date,
        startTime: override.startTime,
        endTime: override.endTime,
        venue: override.venue,
        status: override.status,
        overrideReason: override.overrideReason,
        isVirtual: false,
      });
    } else {
      result.push(virt);
    }
  }

  // Include any ad hoc or unmerged overrides that fall within the range
  for (const occ of activeOverrides) {
    const key = occ.ruleId ? `${occ.ruleId}:${occ.date}` : `adhoc:${occ.id}`;
    if (!appliedOverrides.has(key)) {
      result.push({
        id: occ.id,
        ruleId: occ.ruleId ?? "",
        courseId: occ.courseId,
        date: occ.date,
        startTime: occ.startTime,
        endTime: occ.endTime,
        venue: occ.venue,
        status: occ.status,
        overrideReason: occ.overrideReason,
        isVirtual: false,
      });
    }
  }

  // Sort chronologically by date and start time
  return result.sort((a, b) => {
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    return a.startTime.localeCompare(b.startTime);
  });
}
