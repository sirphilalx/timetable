import React, { useEffect, useState } from "react";
import { View, ScrollView, Pressable, TextInput, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ChevronLeft,
  AlertTriangle,
  Plus,
  Bell,
  Clock,
  Edit3,
  Trash2,
  Check,
  X,
} from "lucide-react-native";
import { Text } from "@/components/ui/Text";
import { ClassCard, TodayAssignmentCard } from "@/components/timetable";
import { useTheme } from "@/theme";
import {
  useTimetable,
  useUpdateCourse,
  useDeleteCourse,
  useUpdateClassRule,
  useDeleteClassRule,
  useDeleteClassOccurrence,
  formatTimeRange,
} from "@/hooks/useTimetable";
import { loadReminderPreferences, saveReminderPreferences } from "@/lib/reminders";
import { getTodayIsoDate } from "@/lib/dateClock";
import type { ClassRule } from "@/db";

const WEEKDAY_NAMES: Record<number, string> = {
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
  7: "Sun",
};

const COURSE_COLORS = [
  { id: "blue", name: "Blue", light: "#2563EB" },
  { id: "teal", name: "Teal", light: "#0D9488" },
  { id: "violet", name: "Violet", light: "#7C3AED" },
  { id: "pink", name: "Pink", light: "#DB2777" },
  { id: "orange", name: "Orange", light: "#EA580C" },
  { id: "cyan", name: "Cyan", light: "#0891B2" },
  { id: "ochre", name: "Ochre", light: "#A16207" },
  { id: "slate", name: "Slate", light: "#475569" },
] as const;

const TIME_SLOTS_24 = [
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
] as const;

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const { data } = useTimetable();
  const updateCourseMutation = useUpdateCourse();
  const deleteCourseMutation = useDeleteCourse();
  const updateClassRuleMutation = useUpdateClassRule();
  const deleteClassRuleMutation = useDeleteClassRule();
  const deleteClassOccMutation = useDeleteClassOccurrence();

  const course =
    data.allCatalogCourses.find((c) => c.id === id || c.code === id) ??
    data.courses.find((c) => c.id === id || c.code === id);

  const courseCode = course?.code ?? "Course";
  const courseTitle = course?.title ?? "Course details";
  const courseColor = course?.color ?? "#2563EB";
  const courseUnits = course?.units ?? 3;
  const lecturerName = course?.lecturerName || "No lecturer set";
  const isPersonalCourse = !course?.sharedGroupId;

  const courseRules = data.classRules.filter((r) => r.courseId === course?.id && r.isDeleted === 0);
  const courseOneTime = data.classOccurrences.filter(
    (o) => !o.ruleId && o.courseId === course?.id && o.isDeleted === 0,
  );
  const totalScheduledCount = courseRules.length + courseOneTime.length;

  const [todayIso] = useState(() => getTodayIsoDate());
  const courseRuleIds = new Set(courseRules.map((r) => r.id));
  const courseOccIds = new Set(courseOneTime.map((o) => o.id));
  const codeSlug = courseCode.toLowerCase().replace(/\s+/g, "");
  const courseAttendance = data.attendanceRecords.filter((rec) => {
    if (courseOccIds.has(rec.occurrenceId)) return true;
    for (const rId of courseRuleIds) {
      if (rec.occurrenceId.includes(rId)) return true;
    }
    return codeSlug.length > 0 && rec.occurrenceId.toLowerCase().includes(codeSlug);
  });
  const attendedCount = courseAttendance.filter((r) => r.status === "present").length;
  const missedCount = courseAttendance.filter((r) => r.status === "absent").length;
  const totalLogged = attendedCount + missedCount;
  const attendancePct = totalLogged > 0 ? Math.round((attendedCount / totalLogged) * 100) : 100;
  const isBelowTarget = totalLogged > 0 && attendancePct < 75;
  const classesNeededFor75 = isBelowTarget
    ? Math.max(1, Math.ceil((0.75 * totalLogged - attendedCount) / 0.25))
    : 0;

  const scheduleSummaryText =
    courseRules.length > 0
      ? courseRules
          .map(
            (r) =>
              `${r.classType.charAt(0).toUpperCase() + r.classType.slice(1)} ${WEEKDAY_NAMES[r.weekday] ?? "Mon"}`,
          )
          .join(" · ")
      : "No recurring classes yet";

  const courseStudySessions = data.personalEvents.filter(
    (ev) => ev.category === "Study" && ev.linkedCourseId === course?.id,
  );
  const weeklyStudyHours = courseStudySessions.reduce((acc, ev) => {
    const [sh = 16, sm = 0] = ev.startTime.split(":").map(Number);
    const [eh = 17, em = 30] = ev.endTime.split(":").map(Number);
    const durationHrs = Math.max(0.5, (eh * 60 + em - (sh * 60 + sm)) / 60);
    const occurrencesPerWeek = ev.repeatMode === "one-time" ? 1 : ev.weekdays.length;
    return acc + durationHrs * occurrencesPerWeek;
  }, 0);

  const courseAssignments = data.assignments.filter(
    (asg) => asg.courseId === course?.id && asg.isDeleted === 0,
  );

  const [courseRemindersOn, setCourseRemindersOn] = useState(true);
  const [courseCheckInsOn, setCourseCheckInsOn] = useState(true);

  // Edit Course Modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editCode, setEditCode] = useState("");
  const [editUnits, setEditUnits] = useState("3");
  const [editTitle, setEditTitle] = useState("");
  const [editLecturer, setEditLecturer] = useState("");
  const [editColor, setEditColor] = useState("#2563EB");
  const [editError, setEditError] = useState<string | null>(null);

  // Edit Class Rule Modal state
  const [editingRule, setEditingRule] = useState<ClassRule | null>(null);
  const [ruleWeekday, setRuleWeekday] = useState<number>(1);
  const [ruleClassType, setRuleClassType] = useState<"lecture" | "tutorial" | "lab">("lecture");
  const [ruleStartTime, setRuleStartTime] = useState("08:00");
  const [ruleEndTime, setRuleEndTime] = useState("10:00");
  const [ruleVenue, setRuleVenue] = useState("");

  // Delete Course Confirmation Modal state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    void loadReminderPreferences().then((prefs) => {
      if (course?.id) {
        setCourseRemindersOn(prefs.courseRemindersEnabled[course.id] !== false);
        setCourseCheckInsOn(prefs.courseCheckInsEnabled[course.id] !== false);
      }
    });
  }, [course?.id]);

  const openEditCourseModal = () => {
    if (!course) return;
    setEditCode(course.code);
    setEditUnits(String(course.units ?? 3));
    setEditTitle(course.title);
    setEditLecturer(course.lecturerName ?? "");
    setEditColor(course.color || "#2563EB");
    setEditError(null);
    setEditModalOpen(true);
  };

  const handleSaveCourseEdits = async () => {
    if (!course) return;
    if (!editCode.trim() || !editTitle.trim()) {
      setEditError("Course code and course title are required.");
      return;
    }
    setEditError(null);
    await updateCourseMutation.mutateAsync({
      id: course.id,
      code: editCode.trim(),
      title: editTitle.trim(),
      units: Math.max(1, Math.min(12, parseInt(editUnits, 10) || 3)),
      color: editColor,
      lecturerName: editLecturer.trim() || null,
    });
    setEditModalOpen(false);
  };

  const openEditRuleModal = (rule: ClassRule) => {
    setEditingRule(rule);
    setRuleWeekday(rule.weekday);
    setRuleClassType((rule.classType as "lecture" | "tutorial" | "lab") || "lecture");
    setRuleStartTime(rule.startTime);
    setRuleEndTime(rule.endTime);
    setRuleVenue(rule.venue);
  };

  const handleSaveRuleEdits = async () => {
    if (!editingRule) return;
    await updateClassRuleMutation.mutateAsync({
      id: editingRule.id,
      weekday: ruleWeekday,
      classType: ruleClassType,
      startTime: ruleStartTime,
      endTime: ruleEndTime,
      venue: ruleVenue.trim() || "LT1, Faculty of Science",
    });
    setEditingRule(null);
  };

  const handleConfirmDeleteCourse = async () => {
    if (!course) return;
    setDeleteConfirmOpen(false);
    await deleteCourseMutation.mutateAsync(course.id);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/classes");
    }
  };

  const toggleCourseReminders = () => {
    const next = !courseRemindersOn;
    setCourseRemindersOn(next);
    if (course?.id) {
      void saveReminderPreferences({
        courseRemindersEnabled: { [course.id]: next },
      });
    }
  };

  const toggleCourseCheckIns = () => {
    const next = !courseCheckInsOn;
    setCourseCheckInsOn(next);
    if (course?.id) {
      void saveReminderPreferences({
        courseCheckInsEnabled: { [course.id]: next },
      });
    }
  };

  if (!course) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }}
        edges={["top", "left", "right"]}
      >
        <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
          <Pressable
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)/classes"))}
            accessibilityRole="button"
            style={{
              flexDirection: "row",
              alignItems: "center",
              height: 44,
              marginBottom: 24,
            }}
          >
            <ChevronLeft size={24} color={isDark ? "#F8FAFC" : "#0F172A"} strokeWidth={2.2} />
            <Text
              variant="title-card"
              style={{ color: isDark ? "#F8FAFC" : "#0F172A", marginLeft: 4 }}
            >
              Back
            </Text>
          </Pressable>

          <View
            style={{
              backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
              borderRadius: 16,
              borderWidth: 1,
              borderColor: isDark ? "#334155" : "#E2E8F0",
              padding: 24,
              alignItems: "center",
              rowGap: 10,
            }}
          >
            <Text variant="title-section" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
              Course not found
            </Text>
            <Text
              variant="body"
              style={{ color: isDark ? "#94A3B8" : "#475569", textAlign: "center" }}
            >
              This course may have been deleted from your timetable.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }}
      edges={["top", "left", "right"]}
    >
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            height: 48,
            marginBottom: 8,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <Pressable
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace("/(tabs)/classes");
                }
              }}
              accessibilityRole="button"
              accessibilityLabel="Back"
              hitSlop={12}
              style={{
                width: 36,
                height: 36,
                alignItems: "flex-start",
                justifyContent: "center",
              }}
            >
              <ChevronLeft size={24} color={isDark ? "#F8FAFC" : "#0F172A"} strokeWidth={2.2} />
            </Pressable>
            <Text
              variant="title-section"
              style={{
                color: isDark ? "#F8FAFC" : "#0F172A",
                fontSize: 20,
                lineHeight: 26,
                fontFamily: "Inter_700Bold",
              }}
            >
              {courseCode}
            </Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", columnGap: 8 }}>
            <Pressable
              onPress={openEditCourseModal}
              accessibilityRole="button"
              accessibilityLabel="Edit course"
              style={{
                flexDirection: "row",
                alignItems: "center",
                columnGap: 6,
                paddingHorizontal: 12,
                height: 36,
                borderRadius: 10,
                backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                borderWidth: 1,
                borderColor: isDark ? "#334155" : "#CBD5E1",
              }}
            >
              <Edit3 size={15} color={isDark ? "#E2E8F0" : "#0F172A"} strokeWidth={2} />
              <Text variant="label" style={{ color: isDark ? "#E2E8F0" : "#0F172A" }}>
                Edit
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setDeleteConfirmOpen(true)}
              accessibilityRole="button"
              accessibilityLabel="Delete course"
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: isDark ? "rgba(239, 68, 68, 0.14)" : "#FEF2F2",
                borderWidth: 1,
                borderColor: isDark ? "rgba(248, 113, 113, 0.3)" : "#FECACA",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Trash2 size={16} color={isDark ? "#F87171" : "#DC2626"} strokeWidth={2} />
            </Pressable>
          </View>
        </View>

        {/* Course Title & Metadata */}
        <Text
          variant="title-page"
          style={{
            color: isDark ? "#F8FAFC" : "#0F172A",
            marginBottom: 6,
          }}
        >
          {courseTitle}
        </Text>
        <Text
          variant="body"
          style={{
            color: isDark ? "#94A3B8" : "#475569",
            lineHeight: 20,
            marginBottom: 16,
          }}
        >
          {courseUnits} units · {lecturerName} · {scheduleSummaryText}
        </Text>

        {/* Attendance Summary Card */}
        <View
          style={{
            backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: isDark ? "#334155" : "#E2E8F0",
            padding: 16,
            marginBottom: 24,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: isDark ? "#0F172A" : "#F1F5F9",
                borderRadius: 6,
                paddingHorizontal: 8,
                paddingVertical: 4,
              }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: courseColor,
                  marginRight: 6,
                }}
              />
              <Text variant="label" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                {courseCode}
              </Text>
            </View>
            <Text
              variant="body-lg"
              numberOfLines={1}
              style={{
                color: isDark ? "#CBD5E1" : "#334155",
                marginLeft: 10,
                fontFamily: "Inter_400Regular",
                flex: 1,
              }}
            >
              {courseTitle}
            </Text>
          </View>

          <Text
            variant="display"
            style={{
              color: isBelowTarget
                ? isDark
                  ? "#F87171"
                  : "#DC2626"
                : isDark
                  ? "#34D399"
                  : "#059669",
              fontVariant: ["tabular-nums"],
              marginBottom: 10,
            }}
          >
            {totalLogged > 0 ? `${attendancePct}%` : "—"}
          </Text>

          {/* Progress Bar with 75% Threshold Tick */}
          <View
            style={{
              position: "relative",
              height: 8,
              borderRadius: 4,
              backgroundColor: isDark ? "#334155" : "#E2E8F0",
              marginBottom: 12,
              justifyContent: "center",
            }}
          >
            <View
              style={{
                width: `${totalLogged > 0 ? attendancePct : 0}%`,
                height: 8,
                borderRadius: 4,
                backgroundColor: isBelowTarget ? "#DC2626" : "#059669",
              }}
            />
            <View
              style={{
                position: "absolute",
                left: "75%",
                top: -3,
                width: 2,
                height: 14,
                backgroundColor: isDark ? "#F8FAFC" : "#0F172A",
              }}
            />
          </View>

          <Text
            variant="body"
            style={{
              color: isDark ? "#94A3B8" : "#475569",
              marginBottom: isBelowTarget ? 12 : 0,
            }}
          >
            {totalLogged > 0
              ? `${attendedCount} attended · ${missedCount} missed`
              : "No class attendance logged yet · check in after your next class"}
          </Text>

          {isBelowTarget ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: isDark ? "#450A0A" : "#FEF2F2",
                borderRadius: 12,
                padding: 12,
              }}
            >
              <AlertTriangle size={18} color={isDark ? "#F87171" : "#DC2626"} strokeWidth={2} />
              <Text
                variant="body"
                style={{
                  color: isDark ? "#FECACA" : "#B91C1C",
                  marginLeft: 10,
                  flex: 1,
                  lineHeight: 20,
                }}
              >
                Attend the next {classesNeededFor75} class
                {classesNeededFor75 === 1 ? "" : "es"} in a row to get back to 75%
              </Text>
            </View>
          ) : null}
        </View>

        {/* Class Schedule Slots Section */}
        <View style={{ marginBottom: 24 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text variant="title-section" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                Class schedule
              </Text>
              <Text
                variant="title-section"
                style={{
                  color: isDark ? "#94A3B8" : "#475569",
                  marginLeft: 8,
                  fontVariant: ["tabular-nums"],
                }}
              >
                {totalScheduledCount}
              </Text>
            </View>

            <Pressable
              onPress={() => router.push(`/setup/add-class?courseId=${course.id}`)}
              accessibilityRole="button"
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 8,
                backgroundColor: isDark ? "#312E81" : "#EEF2FF",
              }}
            >
              <Plus size={14} color={isDark ? "#818CF8" : "#4F46E5"} strokeWidth={2.4} />
              <Text variant="label" style={{ color: isDark ? "#818CF8" : "#4F46E5" }}>
                Add class time
              </Text>
            </Pressable>
          </View>

          <View style={{ rowGap: 12 }}>
            {totalScheduledCount > 0 ? (
              <>
                {courseRules.map((rule) => {
                  const dayLabel = WEEKDAY_NAMES[rule.weekday] ?? "Mon";
                  const typeLabel =
                    rule.classType.charAt(0).toUpperCase() + rule.classType.slice(1);
                  return (
                    <View key={rule.id} style={{ rowGap: 6 }}>
                      <ClassCard
                        courseCode={courseCode}
                        courseTitle={`${typeLabel} · Every ${dayLabel}`}
                        courseColor={courseColor}
                        time={`${dayLabel} ${formatTimeRange(rule.startTime, rule.endTime)}`}
                        venue={rule.venue}
                        onPress={() => router.push(`/class/${rule.id}`)}
                      />
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "flex-end",
                          columnGap: 8,
                        }}
                      >
                        <Pressable
                          onPress={() => openEditRuleModal(rule)}
                          accessibilityRole="button"
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            columnGap: 5,
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                            borderRadius: 8,
                            backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                            borderWidth: 1,
                            borderColor: isDark ? "#334155" : "#E2E8F0",
                          }}
                        >
                          <Edit3 size={13} color={isDark ? "#CBD5E1" : "#475569"} strokeWidth={2} />
                          <Text
                            variant="caption"
                            style={{
                              color: isDark ? "#CBD5E1" : "#475569",
                              fontFamily: "Inter_600SemiBold",
                            }}
                          >
                            Edit slot
                          </Text>
                        </Pressable>

                        <Pressable
                          onPress={() => deleteClassRuleMutation.mutate(rule.id)}
                          accessibilityRole="button"
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            columnGap: 5,
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                            borderRadius: 8,
                            backgroundColor: isDark ? "rgba(239, 68, 68, 0.12)" : "#FEF2F2",
                            borderWidth: 1,
                            borderColor: isDark ? "rgba(248, 113, 113, 0.25)" : "#FECACA",
                          }}
                        >
                          <Trash2
                            size={13}
                            color={isDark ? "#F87171" : "#DC2626"}
                            strokeWidth={2}
                          />
                          <Text
                            variant="caption"
                            style={{
                              color: isDark ? "#F87171" : "#DC2626",
                              fontFamily: "Inter_600SemiBold",
                            }}
                          >
                            Remove slot
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  );
                })}
                {courseOneTime.map((occ) => (
                  <View key={occ.id} style={{ rowGap: 6 }}>
                    <ClassCard
                      courseCode={courseCode}
                      courseTitle="One-time class"
                      courseColor={courseColor}
                      time={`${occ.date} · ${formatTimeRange(occ.startTime, occ.endTime)}`}
                      venue={occ.venue}
                      onPress={() => router.push(`/class/${occ.id}`)}
                    />
                    <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                      <Pressable
                        onPress={() => deleteClassOccMutation.mutate(occ.id)}
                        accessibilityRole="button"
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          columnGap: 5,
                          paddingHorizontal: 10,
                          paddingVertical: 5,
                          borderRadius: 8,
                          backgroundColor: isDark ? "rgba(239, 68, 68, 0.12)" : "#FEF2F2",
                          borderWidth: 1,
                          borderColor: isDark ? "rgba(248, 113, 113, 0.25)" : "#FECACA",
                        }}
                      >
                        <Trash2 size={13} color={isDark ? "#F87171" : "#DC2626"} strokeWidth={2} />
                        <Text
                          variant="caption"
                          style={{
                            color: isDark ? "#F87171" : "#DC2626",
                            fontFamily: "Inter_600SemiBold",
                          }}
                        >
                          Remove one-time class
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </>
            ) : (
              <Pressable
                onPress={() => router.push(`/setup/add-class?courseId=${course.id}`)}
                style={{
                  borderRadius: 14,
                  borderWidth: 1,
                  borderStyle: "dashed",
                  borderColor: isDark ? "#334155" : "#CBD5E1",
                  padding: 16,
                  alignItems: "center",
                }}
              >
                <Text variant="body" style={{ color: isDark ? "#94A3B8" : "#475569" }}>
                  No class times scheduled yet · Tap to add class days & times
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Personal Reading Timetable Section */}
        <View style={{ marginBottom: 24 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text variant="title-section" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                Reading timetable
              </Text>
              <Text
                variant="caption"
                style={{
                  color: isDark ? "#4ADE80" : "#0D9488",
                  marginLeft: 8,
                  fontFamily: "Inter_600SemiBold",
                }}
              >
                {weeklyStudyHours > 0 ? `${weeklyStudyHours.toFixed(1)} hrs / wk` : "0 hrs / wk"}
              </Text>
            </View>

            <Pressable
              onPress={() => router.push(`/events/add?category=Study&courseId=${course.id}`)}
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
              <Text variant="label" style={{ color: isDark ? "#2DD4BF" : "#0F766E" }}>
                Add study session
              </Text>
            </Pressable>
          </View>

          <View style={{ rowGap: 12 }}>
            {courseStudySessions.length > 0 ? (
              courseStudySessions.map((ev) => {
                const daysStr =
                  ev.repeatMode === "one-time"
                    ? (ev.oneTimeDate ?? todayIso)
                    : ev.weekdays.map((d) => WEEKDAY_NAMES[d] ?? "Sat").join(", ");
                const completedCount = ev.completedDates?.length ?? 0;
                return (
                  <ClassCard
                    key={ev.id}
                    courseCode={`STUDY · ${courseCode}`}
                    courseTitle={ev.studyTopic || ev.title}
                    courseColor={courseColor}
                    time={`${daysStr} · ${formatTimeRange(ev.startTime, ev.endTime)}`}
                    venue={`${ev.venue}${completedCount > 0 ? ` · ${completedCount} completed` : ""}`}
                    attended={completedCount > 0}
                    onPress={() => router.push(`/class/${ev.id}`)}
                  />
                );
              })
            ) : (
              <Pressable
                onPress={() => router.push(`/events/add?category=Study&courseId=${course.id}`)}
                style={{
                  borderRadius: 14,
                  borderWidth: 1,
                  borderStyle: "dashed",
                  borderColor: isDark ? "#334155" : "#CBD5E1",
                  padding: 16,
                  alignItems: "center",
                }}
              >
                <Text variant="body" style={{ color: isDark ? "#94A3B8" : "#475569" }}>
                  No reading sessions linked to {courseCode} yet · Tap to schedule study time
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Per-Course Reminders & Check-Ins Section */}
        <View style={{ marginBottom: 24 }}>
          <Text
            variant="title-section"
            style={{ color: isDark ? "#F8FAFC" : "#0F172A", marginBottom: 12 }}
          >
            Reminders & check-ins
          </Text>

          <View
            style={{
              backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
              borderRadius: 16,
              borderWidth: 1,
              borderColor: isDark ? "#334155" : "#E2E8F0",
              padding: 16,
              rowGap: 18,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", flex: 1, marginRight: 12 }}
              >
                <View style={{ width: 32, alignItems: "flex-start" }}>
                  <Bell size={20} color={isDark ? "#94A3B8" : "#475569"} strokeWidth={1.85} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="body-lg" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                    Class & assignment alerts
                  </Text>
                  <Text
                    variant="body"
                    style={{ color: isDark ? "#94A3B8" : "#475569", marginTop: 2 }}
                  >
                    {courseRemindersOn
                      ? "Following your reminder schedule"
                      : "Muted for this course"}
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={toggleCourseReminders}
                accessibilityRole="switch"
                accessibilityState={{ checked: courseRemindersOn }}
                style={{
                  width: 52,
                  height: 30,
                  borderRadius: 15,
                  backgroundColor: courseRemindersOn ? "#4F46E5" : isDark ? "#334155" : "#E2E8F0",
                  padding: 3,
                  justifyContent: "center",
                  alignItems: courseRemindersOn ? "flex-end" : "flex-start",
                }}
              >
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: "#FFFFFF",
                  }}
                />
              </Pressable>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", flex: 1, marginRight: 12 }}
              >
                <View style={{ width: 32, alignItems: "flex-start" }}>
                  <Clock size={20} color={isDark ? "#94A3B8" : "#475569"} strokeWidth={1.85} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="body-lg" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                    Post-class check-in
                  </Text>
                  <Text
                    variant="body"
                    style={{ color: isDark ? "#94A3B8" : "#475569", marginTop: 2 }}
                  >
                    {courseCheckInsOn
                      ? "Asks 10 min after class ends"
                      : "Off: attendance not tracked"}
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={toggleCourseCheckIns}
                accessibilityRole="switch"
                accessibilityState={{ checked: courseCheckInsOn }}
                style={{
                  width: 52,
                  height: 30,
                  borderRadius: 15,
                  backgroundColor: courseCheckInsOn ? "#4F46E5" : isDark ? "#334155" : "#E2E8F0",
                  padding: 3,
                  justifyContent: "center",
                  alignItems: courseCheckInsOn ? "flex-end" : "flex-start",
                }}
              >
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: "#FFFFFF",
                  }}
                />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Assignments Section */}
        <View style={{ marginBottom: 24 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text variant="title-section" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                Assignments
              </Text>
              <Text
                variant="title-section"
                style={{
                  color: isDark ? "#94A3B8" : "#475569",
                  marginLeft: 8,
                  fontVariant: ["tabular-nums"],
                }}
              >
                {courseAssignments.length}
              </Text>
            </View>

            <Pressable
              onPress={() => router.push("/assignment/add")}
              accessibilityRole="button"
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 8,
                backgroundColor: isDark ? "#312E81" : "#EEF2FF",
              }}
            >
              <Plus size={14} color={isDark ? "#818CF8" : "#4F46E5"} strokeWidth={2.4} />
              <Text variant="label" style={{ color: isDark ? "#818CF8" : "#4F46E5" }}>
                Add assignment
              </Text>
            </Pressable>
          </View>

          {courseAssignments.length > 0 ? (
            <View style={{ rowGap: 12 }}>
              {courseAssignments.map((asg) => (
                <TodayAssignmentCard
                  key={asg.id}
                  courseCode={courseCode}
                  courseColor={courseColor}
                  assignmentType={asg.type === "group" ? "Group" : "Solo"}
                  title={asg.title}
                  dueText={`Due ${asg.dueAt.slice(0, 10)}`}
                  dueTimeText={`Due ${asg.dueAt.slice(0, 10)}, 11:59 pm`}
                  onPress={() => router.push(`/assignment/${asg.id}` as any)}
                />
              ))}
            </View>
          ) : (
            <View
              style={{
                borderRadius: 14,
                borderWidth: 1,
                borderStyle: "dashed",
                borderColor: isDark ? "#334155" : "#CBD5E1",
                padding: 16,
                alignItems: "center",
              }}
            >
              <Text variant="body" style={{ color: isDark ? "#94A3B8" : "#475569" }}>
                No assignments due for {courseCode} right now
              </Text>
            </View>
          )}
        </View>

        {/* Course Management & Delete Section */}
        <View
          style={{
            backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: isDark ? "#334155" : "#E2E8F0",
            padding: 16,
            rowGap: 12,
          }}
        >
          <Text variant="title-card" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
            Manage {courseCode}
          </Text>
          <Text variant="caption" style={{ color: isDark ? "#94A3B8" : "#475569" }}>
            {isPersonalCourse
              ? "You created this course. You can edit its details, class times, or delete it from your timetable."
              : "This course was imported from a shared class. You can customize its colour, edit local details, or remove it from your timetable."}
          </Text>

          <View style={{ flexDirection: "row", columnGap: 10 }}>
            <Pressable
              onPress={openEditCourseModal}
              accessibilityRole="button"
              style={{
                flex: 1,
                height: 46,
                borderRadius: 12,
                backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                borderWidth: 1,
                borderColor: isDark ? "#334155" : "#CBD5E1",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                columnGap: 8,
              }}
            >
              <Edit3 size={16} color={isDark ? "#F8FAFC" : "#0F172A"} strokeWidth={2} />
              <Text
                variant="label"
                style={{ color: isDark ? "#F8FAFC" : "#0F172A", fontFamily: "Inter_600SemiBold" }}
              >
                Edit course
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setDeleteConfirmOpen(true)}
              accessibilityRole="button"
              style={{
                flex: 1,
                height: 46,
                borderRadius: 12,
                backgroundColor: isDark ? "rgba(239, 68, 68, 0.14)" : "#FEF2F2",
                borderWidth: 1,
                borderColor: isDark ? "rgba(248, 113, 113, 0.35)" : "#FECACA",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                columnGap: 8,
              }}
            >
              <Trash2 size={16} color={isDark ? "#F87171" : "#DC2626"} strokeWidth={2} />
              <Text
                variant="label"
                style={{ color: isDark ? "#F87171" : "#DC2626", fontFamily: "Inter_600SemiBold" }}
              >
                Delete course
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Edit Course Modal */}
      <Modal
        visible={editModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalOpen(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(15, 23, 42, 0.55)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 20,
              rowGap: 16,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text variant="title-section" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                Edit course
              </Text>
              <Pressable
                onPress={() => setEditModalOpen(false)}
                accessibilityRole="button"
                hitSlop={10}
              >
                <X size={20} color={isDark ? "#94A3B8" : "#64748B"} strokeWidth={2} />
              </Pressable>
            </View>

            <View style={{ flexDirection: "row", columnGap: 12 }}>
              <View style={{ flex: 2.2 }}>
                <Text
                  variant="label"
                  style={{ color: isDark ? "#CBD5E1" : "#334155", marginBottom: 6 }}
                >
                  Course code
                </Text>
                <TextInput
                  value={editCode}
                  onChangeText={setEditCode}
                  autoCapitalize="characters"
                  placeholder="e.g. CSC 301"
                  placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                  style={{
                    height: 46,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: isDark ? "#334155" : "#CBD5E1",
                    backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                    paddingHorizontal: 14,
                    fontSize: 15,
                    color: isDark ? "#F8FAFC" : "#0F172A",
                  }}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  variant="label"
                  style={{ color: isDark ? "#CBD5E1" : "#334155", marginBottom: 6 }}
                >
                  Units
                </Text>
                <TextInput
                  value={editUnits}
                  onChangeText={setEditUnits}
                  keyboardType="number-pad"
                  style={{
                    height: 46,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: isDark ? "#334155" : "#CBD5E1",
                    backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                    paddingHorizontal: 14,
                    fontSize: 15,
                    color: isDark ? "#F8FAFC" : "#0F172A",
                  }}
                />
              </View>
            </View>

            <View>
              <Text
                variant="label"
                style={{ color: isDark ? "#CBD5E1" : "#334155", marginBottom: 6 }}
              >
                Course title
              </Text>
              <TextInput
                value={editTitle}
                onChangeText={setEditTitle}
                placeholder="Course title"
                placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                style={{
                  height: 46,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: isDark ? "#334155" : "#CBD5E1",
                  backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                  paddingHorizontal: 14,
                  fontSize: 15,
                  color: isDark ? "#F8FAFC" : "#0F172A",
                }}
              />
            </View>

            <View>
              <Text
                variant="label"
                style={{ color: isDark ? "#CBD5E1" : "#334155", marginBottom: 6 }}
              >
                Lecturer
              </Text>
              <TextInput
                value={editLecturer}
                onChangeText={setEditLecturer}
                placeholder="Dr. ..."
                placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                style={{
                  height: 46,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: isDark ? "#334155" : "#CBD5E1",
                  backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                  paddingHorizontal: 14,
                  fontSize: 15,
                  color: isDark ? "#F8FAFC" : "#0F172A",
                }}
              />
            </View>

            <View>
              <Text
                variant="label"
                style={{ color: isDark ? "#CBD5E1" : "#334155", marginBottom: 10 }}
              >
                Colour
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                {COURSE_COLORS.map((swatch) => {
                  const isSelected = editColor === swatch.light;
                  return (
                    <Pressable
                      key={swatch.id}
                      onPress={() => setEditColor(swatch.light)}
                      accessibilityRole="button"
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: swatch.light,
                        alignItems: "center",
                        justifyContent: "center",
                        borderWidth: isSelected ? 3 : 0,
                        borderColor: "#FFFFFF",
                      }}
                    >
                      {isSelected ? <Check size={16} color="#FFFFFF" strokeWidth={2.5} /> : null}
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {editError ? (
              <Text variant="caption" style={{ color: "#EF4444" }}>
                {editError}
              </Text>
            ) : null}

            <Pressable
              onPress={handleSaveCourseEdits}
              accessibilityRole="button"
              style={{
                height: 50,
                borderRadius: 12,
                backgroundColor: "#4F46E5",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text variant="label-lg" style={{ color: "#FFFFFF" }}>
                Save changes
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Edit Class Slot Modal */}
      <Modal
        visible={Boolean(editingRule)}
        transparent
        animationType="slide"
        onRequestClose={() => setEditingRule(null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(15, 23, 42, 0.55)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 20,
              rowGap: 14,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text variant="title-section" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                Edit class slot ({courseCode})
              </Text>
              <Pressable
                onPress={() => setEditingRule(null)}
                accessibilityRole="button"
                hitSlop={10}
              >
                <X size={20} color={isDark ? "#94A3B8" : "#64748B"} strokeWidth={2} />
              </Pressable>
            </View>

            {/* Day of Week selector */}
            <View>
              <Text
                variant="label"
                style={{ color: isDark ? "#CBD5E1" : "#334155", marginBottom: 6 }}
              >
                Day of week
              </Text>
              <View style={{ flexDirection: "row", columnGap: 6 }}>
                {[1, 2, 3, 4, 5, 6, 7].map((dayNum) => {
                  const active = ruleWeekday === dayNum;
                  return (
                    <Pressable
                      key={dayNum}
                      onPress={() => setRuleWeekday(dayNum)}
                      style={{
                        flex: 1,
                        height: 38,
                        borderRadius: 8,
                        backgroundColor: active ? "#4F46E5" : isDark ? "#0F172A" : "#F1F5F9",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        variant="caption"
                        style={{
                          color: active ? "#FFFFFF" : isDark ? "#CBD5E1" : "#334155",
                          fontFamily: "Inter_600SemiBold",
                        }}
                      >
                        {WEEKDAY_NAMES[dayNum]}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Class type */}
            <View>
              <Text
                variant="label"
                style={{ color: isDark ? "#CBD5E1" : "#334155", marginBottom: 6 }}
              >
                Class type
              </Text>
              <View style={{ flexDirection: "row", columnGap: 8 }}>
                {(["lecture", "tutorial", "lab"] as const).map((t) => {
                  const active = ruleClassType === t;
                  return (
                    <Pressable
                      key={t}
                      onPress={() => setRuleClassType(t)}
                      style={{
                        flex: 1,
                        height: 38,
                        borderRadius: 8,
                        backgroundColor: active ? "#4F46E5" : isDark ? "#0F172A" : "#F1F5F9",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        variant="label"
                        style={{
                          color: active ? "#FFFFFF" : isDark ? "#CBD5E1" : "#334155",
                        }}
                      >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Start & End time chips */}
            <View>
              <Text
                variant="label"
                style={{ color: isDark ? "#CBD5E1" : "#334155", marginBottom: 6 }}
              >
                Start time ({ruleStartTime})
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: "row", columnGap: 6 }}>
                  {TIME_SLOTS_24.map((slot) => {
                    const active = ruleStartTime === slot;
                    return (
                      <Pressable
                        key={`start-${slot}`}
                        onPress={() => setRuleStartTime(slot)}
                        style={{
                          paddingHorizontal: 12,
                          height: 36,
                          borderRadius: 8,
                          backgroundColor: active ? "#4F46E5" : isDark ? "#0F172A" : "#F1F5F9",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          variant="caption"
                          style={{
                            color: active ? "#FFFFFF" : isDark ? "#CBD5E1" : "#334155",
                            fontFamily: "Inter_600SemiBold",
                          }}
                        >
                          {slot}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            </View>

            <View>
              <Text
                variant="label"
                style={{ color: isDark ? "#CBD5E1" : "#334155", marginBottom: 6 }}
              >
                End time ({ruleEndTime})
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: "row", columnGap: 6 }}>
                  {TIME_SLOTS_24.map((slot) => {
                    const active = ruleEndTime === slot;
                    return (
                      <Pressable
                        key={`end-${slot}`}
                        onPress={() => setRuleEndTime(slot)}
                        style={{
                          paddingHorizontal: 12,
                          height: 36,
                          borderRadius: 8,
                          backgroundColor: active ? "#4F46E5" : isDark ? "#0F172A" : "#F1F5F9",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          variant="caption"
                          style={{
                            color: active ? "#FFFFFF" : isDark ? "#CBD5E1" : "#334155",
                            fontFamily: "Inter_600SemiBold",
                          }}
                        >
                          {slot}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            </View>

            {/* Venue */}
            <View>
              <Text
                variant="label"
                style={{ color: isDark ? "#CBD5E1" : "#334155", marginBottom: 6 }}
              >
                Venue
              </Text>
              <TextInput
                value={ruleVenue}
                onChangeText={setRuleVenue}
                placeholder="e.g. LT1, Faculty of Science"
                placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                style={{
                  height: 44,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: isDark ? "#334155" : "#CBD5E1",
                  backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                  paddingHorizontal: 12,
                  fontSize: 15,
                  color: isDark ? "#F8FAFC" : "#0F172A",
                }}
              />
            </View>

            <Pressable
              onPress={handleSaveRuleEdits}
              accessibilityRole="button"
              style={{
                height: 48,
                borderRadius: 12,
                backgroundColor: "#4F46E5",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text variant="label-lg" style={{ color: "#FFFFFF" }}>
                Save slot changes
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Delete Course Confirmation Modal */}
      <Modal
        visible={deleteConfirmOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteConfirmOpen(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              width: "100%",
              maxWidth: 380,
              backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
              borderRadius: 20,
              padding: 20,
              rowGap: 14,
              borderWidth: 1,
              borderColor: isDark ? "#334155" : "#E2E8F0",
            }}
          >
            <Text variant="title-section" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
              Delete {courseCode}?
            </Text>
            <Text variant="body" style={{ color: isDark ? "#94A3B8" : "#475569", lineHeight: 20 }}>
              This will permanently remove {courseCode} ({courseTitle}), {totalScheduledCount}{" "}
              scheduled class {totalScheduledCount === 1 ? "slot" : "slots"}, and{" "}
              {courseAssignments.length}{" "}
              {courseAssignments.length === 1 ? "assignment" : "assignments"} from your timetable.
            </Text>

            <View style={{ flexDirection: "row", columnGap: 10, marginTop: 4 }}>
              <Pressable
                onPress={() => setDeleteConfirmOpen(false)}
                accessibilityRole="button"
                style={{
                  flex: 1,
                  height: 46,
                  borderRadius: 12,
                  backgroundColor: isDark ? "#0F172A" : "#F1F5F9",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  variant="label"
                  style={{ color: isDark ? "#E2E8F0" : "#0F172A", fontFamily: "Inter_600SemiBold" }}
                >
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                onPress={handleConfirmDeleteCourse}
                accessibilityRole="button"
                style={{
                  flex: 1,
                  height: 46,
                  borderRadius: 12,
                  backgroundColor: "#DC2626",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text variant="label" style={{ color: "#FFFFFF", fontFamily: "Inter_600SemiBold" }}>
                  Delete course
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
