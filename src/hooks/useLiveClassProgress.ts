import { useEffect, useRef, useState } from "react";
import { useTimetable, type EnrichedClassItem } from "./useTimetable";
import {
  subscribeLiveActivityAppState,
  syncOngoingClassLiveActivity,
  type LiveActivityClassPayload,
} from "@/lib/liveActivity";

export interface LiveClassProgress {
  ongoingClass: EnrichedClassItem | null;
  progressRatio: number; // 0 to 1, updated every second
  elapsedSeconds: number;
  remainingSeconds: number;
  totalDurationSeconds: number;
  currentTimeLabel: string; // e.g. "10:52:14 am"
  elapsedLabel: string; // e.g. "52m 14s elapsed"
  remainingLabel: string; // e.g. "1h 07m 46s left"
  compactRemaining: string; // e.g. "01:07:46" or "42:18"
}

function parseHhMmToSeconds(hhmm: string): number {
  const [h = 10, m = 0] = hhmm.split(":").map(Number);
  return h * 3600 + m * 60;
}

function formatSecondsAsClock(totalSec: number): string {
  const clamped = Math.max(0, Math.floor(totalSec));
  const h = Math.floor(clamped / 3600);
  const m = Math.floor((clamped % 3600) / 60);
  const s = clamped % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatDurationHuman(totalSec: number, suffix: string): string {
  const clamped = Math.max(0, Math.floor(totalSec));
  const h = Math.floor(clamped / 3600);
  const m = Math.floor((clamped % 3600) / 60);
  const s = clamped % 60;
  if (h > 0) {
    return `${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s ${suffix}`;
  }
  return `${m}m ${String(s).padStart(2, "0")}s ${suffix}`;
}

function formatWallSecondsAmPm(secOfDay: number): string {
  const wrapped = ((Math.floor(secOfDay) % 86400) + 86400) % 86400;
  const h24 = Math.floor(wrapped / 3600);
  const m = Math.floor((wrapped % 3600) / 60);
  const s = wrapped % 60;
  const period = h24 >= 12 ? "pm" : "am";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")} ${period}`;
}

export function useLiveClassProgress(): LiveClassProgress {
  const { getOccurrencesForDate } = useTimetable();

  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const nowDate = new Date(nowMs);
  const todayIso = `${nowDate.getFullYear()}-${String(nowDate.getMonth() + 1).padStart(2, "0")}-${String(nowDate.getDate()).padStart(2, "0")}`;
  const todayOccurrences = getOccurrencesForDate(todayIso);

  const realWallSeconds =
    nowDate.getHours() * 3600 + nowDate.getMinutes() * 60 + nowDate.getSeconds();

  // Only match a non-cancelled class on today's schedule that spans the real wall-clock time right now
  const realOngoing = todayOccurrences.find((c) => {
    if (c.status === "cancelled") return false;
    const startSec = parseHhMmToSeconds(c.startTime);
    const endSec = parseHhMmToSeconds(c.endTime);
    return realWallSeconds >= startSec && realWallSeconds < endSec;
  });

  const targetClass = realOngoing ?? null;

  const startSec = targetClass ? parseHhMmToSeconds(targetClass.startTime) : 36000;
  const endSec = targetClass
    ? Math.max(startSec + 1800, parseHhMmToSeconds(targetClass.endTime))
    : 43200;
  const totalDurationSeconds = endSec - startSec;

  const currentSecOfDay = realWallSeconds;

  const elapsedSeconds = Math.max(0, Math.min(totalDurationSeconds, currentSecOfDay - startSec));
  const remainingSeconds = Math.max(0, totalDurationSeconds - elapsedSeconds);
  const progressRatio =
    totalDurationSeconds > 0 ? Math.min(1, Math.max(0, elapsedSeconds / totalDurationSeconds)) : 0;

  const remainingLabel = formatDurationHuman(remainingSeconds, "left");
  const cleanTitle = targetClass
    ? targetClass.courseTitle.replace(/\s*·\s*(Lecture|Tutorial|Lab)$/i, "")
    : "";

  const latestPayloadRef = useRef<LiveActivityClassPayload | null>(
    targetClass
      ? {
          occurrenceId: targetClass.id,
          courseCode: targetClass.courseCode,
          courseTitle: cleanTitle,
          courseColor: targetClass.courseColor,
          venue: targetClass.venue,
          timeRange: targetClass.displayTime,
          startTimestampMs: nowMs - elapsedSeconds * 1000,
          endTimestampMs: nowMs + remainingSeconds * 1000,
          progressRatio,
          remainingSeconds,
          remainingLabel,
        }
      : null,
  );

  const progressPercent = Math.floor(progressRatio * 100);

  useEffect(() => {
    latestPayloadRef.current = targetClass
      ? {
          occurrenceId: targetClass.id,
          courseCode: targetClass.courseCode,
          courseTitle: cleanTitle,
          courseColor: targetClass.courseColor,
          venue: targetClass.venue,
          timeRange: targetClass.displayTime,
          startTimestampMs: nowMs - elapsedSeconds * 1000,
          endTimestampMs: nowMs + remainingSeconds * 1000,
          progressRatio,
          remainingSeconds,
          remainingLabel,
        }
      : null;
  });

  useEffect(() => {
    if (latestPayloadRef.current) {
      void syncOngoingClassLiveActivity(latestPayloadRef.current);
    }
  }, [targetClass?.id, progressPercent]);

  useEffect(() => {
    return subscribeLiveActivityAppState(() => latestPayloadRef.current);
  }, []);

  return {
    ongoingClass: targetClass,
    progressRatio,
    elapsedSeconds,
    remainingSeconds,
    totalDurationSeconds,
    currentTimeLabel: formatWallSecondsAmPm(currentSecOfDay),
    elapsedLabel: formatDurationHuman(elapsedSeconds, "elapsed"),
    remainingLabel,
    compactRemaining: formatSecondsAsClock(remainingSeconds),
  };
}
