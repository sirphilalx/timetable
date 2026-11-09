import React, { useEffect, useMemo, useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft, ChevronRight, BarChart2, AlertTriangle, Plus } from "lucide-react-native";
import { Text } from "@/components/ui/Text";
import { useTheme } from "@/theme/ThemeProvider";
import { useTimetable } from "@/hooks/useTimetable";
import { addDaysIso, formatShortDateLabel, getTodayIsoDate } from "@/lib/dateClock";
import { loadReminderPreferences } from "@/lib/reminders";

interface CourseSessionItem {
  id: string;
  dateLabel: string;
  venue: string;
  status: "Attended" | "Missed" | "Not answered";
}

interface CourseReport {
  id: string;
  code: string;
  title: string;
  color: string;
  attended: number;
  missed: number;
  unanswered: number;
  total: number;
  pct: number;
  warningText?: string;
  sessions: CourseSessionItem[];
}

export default function ReportsScreen() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { data, getOccurrencesForDate } = useTimetable();
  const [todayIso] = useState(() => getTodayIsoDate());

  const [period, setPeriod] = useState<"week" | "semester" | "empty">("semester");
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [targetPct, setTargetPct] = useState(75);

  useEffect(() => {
    void loadReminderPreferences().then((prefs) => {
      if (prefs.attendanceTargetPct) {
        setTargetPct(prefs.attendanceTargetPct);
      }
    });
  }, []);

  const courseReports: CourseReport[] = useMemo(() => {
    const attendanceMap = new Map(data.attendanceRecords.map((r) => [r.occurrenceId, r.status]));
    const lookbackDays = period === "week" ? 7 : 28;
    const pastDates = Array.from({ length: lookbackDays }, (_, idx) => addDaysIso(todayIso, -idx));

    return data.courses.map((course) => {
      const courseRules = data.classRules.filter((r) => r.courseId === course.id);
      const courseRuleIds = new Set(courseRules.map((r) => r.id));
      const codeSlug = course.code.toLowerCase().replace(/\s+/g, "");

      const sessions: CourseSessionItem[] = [];
      for (const dateIso of pastDates) {
        const occs = getOccurrencesForDate(dateIso, { calendarFilter: "classes" }).filter(
          (o) => o.courseId === course.id && o.status !== "cancelled",
        );
        for (const occ of occs) {
          const recStatus = attendanceMap.get(occ.id);
          sessions.push({
            id: occ.id,
            dateLabel: `${formatShortDateLabel(dateIso)} · ${occ.displayTime}`,
            venue: occ.venue,
            status:
              recStatus === "present"
                ? "Attended"
                : recStatus === "absent"
                  ? "Missed"
                  : "Not answered",
          });
        }
      }

      // Also count any explicit attendance records logged for this course
      const directRecords = data.attendanceRecords.filter((rec) => {
        for (const rId of courseRuleIds) {
          if (rec.occurrenceId.includes(rId)) return true;
        }
        return rec.occurrenceId.toLowerCase().includes(codeSlug);
      });

      const sessionAttended = sessions.filter((s) => s.status === "Attended").length;
      const sessionMissed = sessions.filter((s) => s.status === "Missed").length;
      const directAttended = directRecords.filter((r) => r.status === "present").length;
      const directMissed = directRecords.filter((r) => r.status === "absent").length;

      const attended = Math.max(sessionAttended, directAttended);
      const missed = Math.max(sessionMissed, directMissed);
      const unanswered = sessions.filter((s) => s.status === "Not answered").length;
      const totalLogged = attended + missed;
      const total = totalLogged > 0 ? totalLogged : sessions.length;
      const pct = totalLogged > 0 ? Math.round((attended / totalLogged) * 100) : 100;
      const isBelow = totalLogged > 0 && pct < targetPct;
      const targetRatio = targetPct / 100;
      const needed = isBelow
        ? Math.max(
            1,
            Math.ceil((targetRatio * totalLogged - attended) / Math.max(0.05, 1 - targetRatio)),
          )
        : 0;

      return {
        id: course.id,
        code: course.code,
        title: course.title,
        color: course.color,
        attended,
        missed,
        unanswered,
        total,
        pct,
        warningText: isBelow ? `Need ${needed} more in a row to reach ${targetPct}%` : undefined,
        sessions: sessions.slice(0, 8),
      };
    });
  }, [
    data.attendanceRecords,
    data.classRules,
    data.courses,
    getOccurrencesForDate,
    period,
    targetPct,
    todayIso,
  ]);

  const selectedCourse = useMemo(
    () => courseReports.find((c) => c.id === selectedCourseId) ?? null,
    [courseReports, selectedCourseId],
  );

  const totalAttendedAll = courseReports.reduce((acc, c) => acc + c.attended, 0);
  const totalMissedAll = courseReports.reduce((acc, c) => acc + c.missed, 0);
  const totalClassesLogged = totalAttendedAll + totalMissedAll;
  const totalScheduledClasses = courseReports.reduce((acc, c) => acc + c.total, 0);
  const overallAttendancePct =
    totalClassesLogged > 0 ? Math.round((totalAttendedAll / totalClassesLogged) * 100) : 100;
  const activeAssignments = data.assignments.filter((a) => a.isDeleted === 0);
  const doneAssignmentsCount = activeAssignments.filter(
    (a) => data.assignmentProgress[a.id] === "done",
  ).length;
  const dueSoonAssignmentsCount = Math.max(0, activeAssignments.length - doneAssignmentsCount);

  const studyEvents = data.personalEvents.filter((ev) => ev.category === "Study");
  const readingByCourse = data.courses.map((course) => {
    const linked = studyEvents.filter((ev) => ev.linkedCourseId === course.id);
    const weeklyHours = linked.reduce((acc, ev) => {
      const [sh = 16, sm = 0] = ev.startTime.split(":").map(Number);
      const [eh = 17, em = 30] = ev.endTime.split(":").map(Number);
      const dur = Math.max(0.5, (eh * 60 + em - (sh * 60 + sm)) / 60);
      const freq = ev.repeatMode === "one-time" ? 1 : ev.weekdays.length;
      return acc + dur * freq;
    }, 0);
    const completedSessions = linked.reduce((acc, ev) => acc + (ev.completedDates?.length ?? 0), 0);
    const topics = linked
      .map((ev) => ev.studyTopic || ev.title)
      .filter(Boolean)
      .join(" · ");
    return {
      courseId: course.id,
      code: course.code,
      title: course.title,
      color: course.color,
      weeklyHours,
      semesterHours: Number((weeklyHours * 4).toFixed(1)),
      completedSessions,
      sessionCount: linked.length,
      topics,
    };
  });

  const totalWeeklyReadingHours = readingByCourse.reduce((s, r) => s + r.weeklyHours, 0);
  const totalSemesterReadingHours = readingByCourse.reduce((s, r) => s + r.semesterHours, 0);
  const activeReadingCoursesCount = readingByCourse.filter((r) => r.weeklyHours > 0).length;

  const bg = isDark ? "#0F172A" : "#F8FAFC";
  const cardBg = isDark ? "#1E293B" : "#FFFFFF";
  const textPrimary = isDark ? "#F8FAFC" : "#0F172A";
  const textSecondary = isDark ? "#94A3B8" : "#475569";
  const borderCol = isDark ? "#334155" : "#E2E8F0";

  if (selectedCourse) {
    /* Screen 78: Course attendance · MTH 301 */
    const isBelowTarget = selectedCourse.pct < 75;
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: bg }} edges={["top"]}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 12,
            gap: 8,
          }}
        >
          <Pressable
            onPress={() => setSelectedCourseId(null)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ChevronLeft size={24} color={textPrimary} />
          </Pressable>
          <Text variant="TT/H2" style={{ color: textPrimary, fontSize: 20 }}>
            {selectedCourse.code} · {selectedCourse.title}
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Summary hero card */}
          <View
            style={{
              backgroundColor: cardBg,
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: borderCol,
              marginBottom: 24,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "baseline",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <Text
                variant="TT/H1"
                style={{
                  fontSize: 36,
                  color: isBelowTarget ? "#D97706" : "#059669",
                  fontWeight: "700",
                }}
              >
                {selectedCourse.pct}%
              </Text>
              <Text variant="TT/Caption" style={{ color: textSecondary }}>
                Target: 75%
              </Text>
            </View>

            <Text variant="TT/Body" style={{ color: textSecondary, marginBottom: 14 }}>
              Attended {selectedCourse.attended} of {selectedCourse.total} classes ·{" "}
              {selectedCourse.missed} missed · {selectedCourse.unanswered} not answered
            </Text>

            {/* Progress bar */}
            <View
              style={{
                height: 8,
                borderRadius: 4,
                backgroundColor: isDark ? "#334155" : "#E2E8F0",
                overflow: "hidden",
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  width: `${selectedCourse.pct}%`,
                  height: "100%",
                  backgroundColor: isBelowTarget ? "#D97706" : "#4F46E5",
                  borderRadius: 4,
                }}
              />
            </View>

            {selectedCourse.warningText ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  padding: 12,
                  borderRadius: 10,
                  backgroundColor: isDark ? "rgba(217, 119, 6, 0.15)" : "#FEF3C7",
                }}
              >
                <AlertTriangle size={16} color="#D97706" />
                <Text
                  variant="TT/Caption"
                  style={{ color: isDark ? "#FBBF24" : "#92400E", fontWeight: "600" }}
                >
                  {selectedCourse.warningText}
                </Text>
              </View>
            ) : null}
          </View>

          <Text variant="TT/H3" style={{ color: textPrimary, fontSize: 18, marginBottom: 12 }}>
            Recent classes
          </Text>

          {selectedCourse.sessions.length === 0 ? (
            <View
              style={{
                backgroundColor: cardBg,
                borderRadius: 14,
                padding: 18,
                borderWidth: 1,
                borderColor: borderCol,
              }}
            >
              <Text variant="TT/Body" style={{ color: textSecondary }}>
                No class occurrences recorded for this course yet.
              </Text>
            </View>
          ) : (
            selectedCourse.sessions.map((session) => {
              const isAttended = session.status === "Attended";
              const isMissed = session.status === "Missed";
              const pillBg = isAttended
                ? isDark
                  ? "rgba(5, 150, 105, 0.2)"
                  : "#ECFDF5"
                : isMissed
                  ? isDark
                    ? "rgba(220, 38, 38, 0.2)"
                    : "#FEF2F2"
                  : isDark
                    ? "#334155"
                    : "#F1F5F9";
              const pillColor = isAttended ? "#059669" : isMissed ? "#DC2626" : textSecondary;

              return (
                <View
                  key={session.id}
                  style={{
                    backgroundColor: cardBg,
                    borderRadius: 14,
                    padding: 16,
                    marginBottom: 10,
                    borderWidth: 1,
                    borderColor: borderCol,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      variant="TT/Subhead"
                      style={{ color: textPrimary, fontWeight: "600", marginBottom: 2 }}
                    >
                      {session.dateLabel}
                    </Text>
                    <Text variant="TT/Caption" style={{ color: textSecondary }}>
                      {session.venue}
                    </Text>
                  </View>

                  <View
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      borderRadius: 999,
                      backgroundColor: pillBg,
                    }}
                  >
                    <Text variant="TT/Caption" style={{ color: pillColor, fontWeight: "600" }}>
                      {session.status}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }} edges={["top"]}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Pressable
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/(tabs)");
              }
            }}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ChevronLeft size={24} color={textPrimary} />
          </Pressable>
          <View>
            <Text variant="TT/H2" style={{ color: textPrimary, fontSize: 22 }}>
              Attendance & Reports
            </Text>
            <Text variant="TT/Caption" style={{ color: textSecondary }}>
              {data.semester.name ? `${data.semester.name} · ` : ""}
              {data.courses.length} course
              {data.courses.length === 1 ? "" : "s"}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => router.push("/check-ins/pending")}
          accessibilityRole="button"
          style={{
            paddingHorizontal: 12,
            height: 36,
            borderRadius: 999,
            backgroundColor: isDark ? "#312E81" : "#EEF2FF",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            variant="caption"
            style={{ color: isDark ? "#818CF8" : "#4F46E5", fontFamily: "Inter_600SemiBold" }}
          >
            Pending check-ins
          </Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Segmented toggle: This week | Semester */}
        <View
          style={{
            flexDirection: "row",
            backgroundColor: isDark ? "#1E293B" : "#E2E8F0",
            borderRadius: 12,
            padding: 4,
            marginBottom: 20,
          }}
        >
          {[
            { id: "week" as const, label: "This week" },
            { id: "semester" as const, label: "Semester" },
          ].map((tab) => {
            const active = period === tab.id;
            return (
              <Pressable
                key={tab.id}
                onPress={() => setPeriod(tab.id)}
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  borderRadius: 9,
                  alignItems: "center",
                  backgroundColor: active ? cardBg : "transparent",
                }}
              >
                <Text
                  variant="TT/Subhead"
                  style={{
                    color: active ? textPrimary : textSecondary,
                    fontWeight: active ? "600" : "500",
                  }}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {period === "empty" || courseReports.length === 0 ? (
          /* Screen 79: Reports · nothing yet */
          <View
            style={{
              backgroundColor: cardBg,
              borderRadius: 16,
              padding: 32,
              alignItems: "center",
              borderWidth: 1,
              borderColor: borderCol,
              marginTop: 24,
            }}
          >
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: isDark ? "#312E81" : "#EEF2FF",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <BarChart2 size={28} color="#4F46E5" />
            </View>
            <Text
              variant="TT/H3"
              style={{ color: textPrimary, marginBottom: 6, textAlign: "center" }}
            >
              Nothing to report yet
            </Text>
            <Text
              variant="TT/Body"
              style={{ color: textSecondary, textAlign: "center", lineHeight: 22 }}
            >
              Check-ins and assignment stats show up here after your first week of classes.
            </Text>
          </View>
        ) : (
          <>
            {/* 2x2 Summary Stat Grid */}
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 12,
                marginBottom: 24,
              }}
            >
              <View
                style={{
                  width: "48%",
                  backgroundColor: cardBg,
                  borderRadius: 16,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: borderCol,
                }}
              >
                <Text variant="TT/Caption" style={{ color: textSecondary, marginBottom: 6 }}>
                  Classes so far
                </Text>
                <Text variant="TT/H1" style={{ color: textPrimary, fontSize: 28 }}>
                  {totalClassesLogged > 0 ? totalClassesLogged : totalScheduledClasses}
                </Text>
                <Text variant="TT/Caption" style={{ color: textSecondary, marginTop: 4 }}>
                  {totalClassesLogged > 0
                    ? `${totalAttendedAll} attended · ${totalMissedAll} missed`
                    : "No check-ins logged yet"}
                </Text>
              </View>

              <View
                style={{
                  width: "48%",
                  backgroundColor: cardBg,
                  borderRadius: 16,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: borderCol,
                }}
              >
                <Text variant="TT/Caption" style={{ color: textSecondary, marginBottom: 6 }}>
                  Attendance
                </Text>
                <Text
                  variant="TT/H1"
                  style={{
                    color:
                      totalClassesLogged > 0 && overallAttendancePct < targetPct
                        ? "#D97706"
                        : "#059669",
                    fontSize: 28,
                  }}
                >
                  {totalClassesLogged > 0 ? `${overallAttendancePct}%` : "—"}
                </Text>
                <Text variant="TT/Caption" style={{ color: textSecondary, marginTop: 4 }}>
                  {totalClassesLogged > 0
                    ? `Target ${targetPct}% · ${
                        overallAttendancePct >= targetPct
                          ? `+${overallAttendancePct - targetPct}% above`
                          : `${targetPct - overallAttendancePct}% below`
                      }`
                    : `Target ${targetPct}%`}
                </Text>
              </View>

              <View
                style={{
                  width: "48%",
                  backgroundColor: cardBg,
                  borderRadius: 16,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: borderCol,
                }}
              >
                <Text variant="TT/Caption" style={{ color: textSecondary, marginBottom: 6 }}>
                  Assignments
                </Text>
                <Text variant="TT/H1" style={{ color: textPrimary, fontSize: 28 }}>
                  {doneAssignmentsCount} of {activeAssignments.length}
                </Text>
                <Text variant="TT/Caption" style={{ color: textSecondary, marginTop: 4 }}>
                  {dueSoonAssignmentsCount} pending
                </Text>
              </View>

              <View
                style={{
                  width: "48%",
                  backgroundColor: cardBg,
                  borderRadius: 16,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: borderCol,
                }}
              >
                <Text variant="TT/Caption" style={{ color: textSecondary, marginBottom: 6 }}>
                  Reading
                </Text>
                <Text variant="TT/H1" style={{ color: textPrimary, fontSize: 28 }}>
                  {period === "week"
                    ? `${totalWeeklyReadingHours.toFixed(1)} h`
                    : `${totalSemesterReadingHours.toFixed(0)} h`}
                </Text>
                <Text variant="TT/Caption" style={{ color: textSecondary, marginTop: 4 }}>
                  Across {activeReadingCoursesCount || data.courses.length} courses
                </Text>
              </View>
            </View>

            {/* Attendance by course */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Text variant="TT/H3" style={{ color: textPrimary, fontSize: 18 }}>
                  Attendance by course
                </Text>
                <Text variant="TT/Subhead" style={{ color: textSecondary, fontWeight: "600" }}>
                  {courseReports.length}
                </Text>
              </View>
            </View>

            {courseReports.map((course) => {
              const isBelow = course.pct < 75;
              return (
                <Pressable
                  key={course.id}
                  onPress={() => setSelectedCourseId(course.id)}
                  style={{
                    backgroundColor: cardBg,
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: borderCol,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <View
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: course.color,
                        }}
                      />
                      <Text variant="TT/Subhead" style={{ color: textPrimary, fontWeight: "700" }}>
                        {course.code} · {course.title}
                      </Text>
                    </View>

                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Text
                        variant="TT/Subhead"
                        style={{
                          color: isBelow ? "#D97706" : textPrimary,
                          fontWeight: "700",
                        }}
                      >
                        {course.pct}%
                      </Text>
                      <ChevronRight size={18} color={textSecondary} />
                    </View>
                  </View>

                  <View
                    style={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: isDark ? "#334155" : "#E2E8F0",
                      overflow: "hidden",
                      marginBottom: 8,
                    }}
                  >
                    <View
                      style={{
                        width: `${course.pct}%`,
                        height: "100%",
                        backgroundColor: isBelow ? "#D97706" : "#4F46E5",
                        borderRadius: 3,
                      }}
                    />
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text variant="TT/Caption" style={{ color: textSecondary }}>
                      {course.attended} of {course.total} classes
                    </Text>
                    {course.warningText ? (
                      <Text variant="TT/Caption" style={{ color: "#D97706", fontWeight: "600" }}>
                        {course.warningText}
                      </Text>
                    ) : null}
                  </View>
                </Pressable>
              );
            })}

            {/* Reading timetable by course */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 16,
                marginBottom: 12,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Text variant="TT/H3" style={{ color: textPrimary, fontSize: 18 }}>
                  Reading by course
                </Text>
                <Text variant="TT/Subhead" style={{ color: textSecondary, fontWeight: "600" }}>
                  {readingByCourse.length}
                </Text>
              </View>

              <Pressable
                onPress={() => router.push("/events/add?category=Study")}
                accessibilityRole="button"
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 8,
                  backgroundColor: isDark ? "#134E4A" : "#CCFBF1",
                }}
              >
                <Plus size={14} color={isDark ? "#2DD4BF" : "#0F766E"} strokeWidth={2.4} />
                <Text
                  variant="TT/Caption"
                  style={{ color: isDark ? "#2DD4BF" : "#0F766E", fontWeight: "700" }}
                >
                  Add study block
                </Text>
              </Pressable>
            </View>

            {readingByCourse.map((rc) => {
              const targetHrs = period === "week" ? 3 : 12;
              const currentHrs = period === "week" ? rc.weeklyHours : rc.semesterHours;
              const pct = Math.min(100, Math.round((currentHrs / targetHrs) * 100));
              return (
                <Pressable
                  key={rc.courseId}
                  onPress={() => router.push(`/course/${rc.courseId}`)}
                  style={{
                    backgroundColor: cardBg,
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: borderCol,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
                      <View
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: rc.color,
                        }}
                      />
                      <Text
                        variant="TT/Subhead"
                        numberOfLines={1}
                        style={{ color: textPrimary, fontWeight: "700", flex: 1 }}
                      >
                        {rc.code} · {rc.title}
                      </Text>
                    </View>

                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Text
                        variant="TT/Subhead"
                        style={{
                          color: currentHrs > 0 ? "#0D9488" : textSecondary,
                          fontWeight: "700",
                        }}
                      >
                        {currentHrs.toFixed(1)} h / {period === "week" ? "wk" : "sem"}
                      </Text>
                      <ChevronRight size={18} color={textSecondary} />
                    </View>
                  </View>

                  <View
                    style={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: isDark ? "#334155" : "#E2E8F0",
                      overflow: "hidden",
                      marginBottom: 8,
                    }}
                  >
                    <View
                      style={{
                        width: `${pct}%`,
                        height: "100%",
                        backgroundColor: rc.color,
                        borderRadius: 3,
                      }}
                    />
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text variant="TT/Caption" style={{ color: textSecondary }} numberOfLines={1}>
                      {rc.sessionCount > 0
                        ? `${rc.sessionCount} reading block${rc.sessionCount > 1 ? "s" : ""} · ${rc.completedSessions} logged`
                        : "No reading blocks yet · tap to add"}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
