import React, { useEffect, useState } from "react";
import { View, ScrollView, Pressable, TextInput, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ChevronLeft,
  MoreHorizontal,
  MapPin,
  User,
  Calendar,
  Bell,
  Info,
  Clock,
  CheckCircle2,
  Trash2,
  Sparkles,
} from "lucide-react-native";
import { Text } from "@/components/ui/Text";
import { useTheme } from "@/theme";
import {
  useTimetable,
  useSaveClassNote,
  useOverrideClassOccurrence,
  useDeleteExam,
  useDeletePersonalEvent,
  useDeleteClassRule,
  useDeleteClassOccurrence,
  useToggleStudySessionComplete,
} from "@/hooks/useTimetable";
import { PostClassCheckInSheet } from "@/components/timetable/PostClassCheckInSheet";
import { InlineDatePicker, InlineTimePicker } from "@/components/ui/DateTimePickerModal";
import {
  addDaysIso,
  buildWeekStripForDate,
  formatShortDateLabel,
  getTodayIsoDate,
} from "@/lib/dateClock";
import { loadReminderPreferences, saveReminderPreferences } from "@/lib/reminders";

export default function ClassDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const { data, getOccurrencesForDate } = useTimetable();
  const saveNoteMutation = useSaveClassNote();
  const deleteExamMutation = useDeleteExam();
  const deletePersonalEventMutation = useDeletePersonalEvent();
  const deleteClassRuleMutation = useDeleteClassRule();
  const deleteClassOccMutation = useDeleteClassOccurrence();
  const toggleStudyCompleteMutation = useToggleStudySessionComplete();

  // Locate occurrence across week dates across all 4 calendars
  const [todayIso] = useState(() => getTodayIsoDate());
  const weekStrip = buildWeekStripForDate(todayIso);
  const weekDates = [
    ...weekStrip.map((d) => d.isoDate),
    addDaysIso(todayIso, 7),
    addDaysIso(todayIso, 14),
  ];
  const allWeekOccurrences = weekDates.flatMap((d) =>
    getOccurrencesForDate(d, { calendarFilter: "all", includeAssignmentsInTimeline: true }),
  );
  const matched =
    allWeekOccurrences.find((item) => item.id === id || item.ruleId === id) ??
    getOccurrencesForDate(todayIso, { calendarFilter: "all" }).find(
      (item) => item.courseCode === "CSC 301",
    ) ??
    allWeekOccurrences[0];

  const course =
    data.allCatalogCourses.find((c) => c.id === matched?.courseId) ??
    data.courses.find((c) => c.id === matched?.courseId) ??
    data.courses[0];

  const calendarKind = matched?.calendarKind ?? "classes";
  const courseTitle =
    calendarKind === "others" || calendarKind === "exams"
      ? (matched?.courseTitle ?? "Event")
      : (course?.title ??
        matched?.courseTitle.replace(/\s*·\s*(Lecture|Tutorial|Lab)$/i, "") ??
        "Operating Systems");
  const courseCode = matched?.courseCode ?? course?.code ?? "CSC 301";
  const courseColor = matched?.courseColor ?? course?.color ?? "#2563EB";
  const courseId = course?.id ?? "course-csc-301";
  const lecturerName =
    calendarKind === "others"
      ? "Only you (Personal calendar)"
      : (matched?.lecturerName ?? course?.lecturerName ?? "Dr. E. Okoro");
  const classType = matched?.classType ?? "Lecture";
  const venue = (matched?.venue ?? "LT1, Faculty of Science").replace(/^Moved to\s+/i, "");
  const recurrenceLabel = matched?.recurrenceLabel ?? "Every Mon and Fri";

  const dateDisplay = formatShortDateLabel(matched?.date ?? todayIso);
  const timeDisplay = matched?.displayTime ?? "10:00 am – 12:00 pm";

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/classes");
    }
  };

  const handleDeleteCalendarItem = async () => {
    if (calendarKind === "exams" && matched) {
      await deleteExamMutation.mutateAsync(matched.id);
      handleBack();
    } else if (calendarKind === "others" && matched) {
      await deletePersonalEventMutation.mutateAsync(matched.ruleId || matched.id);
      handleBack();
    } else if (calendarKind === "classes" && matched) {
      if (matched.ruleId) {
        await deleteClassRuleMutation.mutateAsync(matched.ruleId);
      } else {
        await deleteClassOccMutation.mutateAsync(matched.id);
      }
      handleBack();
    }
  };

  const [checkInEnabled, setCheckInEnabled] = useState(true);
  useEffect(() => {
    void loadReminderPreferences().then((prefs) => {
      setCheckInEnabled(prefs.courseCheckInsEnabled[courseId] !== false);
    });
  }, [courseId]);

  const handleToggleCheckIn = async () => {
    const next = !checkInEnabled;
    setCheckInEnabled(next);
    await saveReminderPreferences({
      courseCheckInsEnabled: {
        [courseId]: next,
      },
    });
  };

  // Compute live attendance for this course
  const courseRuleIds = new Set(
    data.classRules.filter((r) => r.courseId === courseId).map((r) => r.id),
  );
  const courseOccurrenceIds = new Set(
    allWeekOccurrences
      .filter((o) => o.courseId === courseId || courseRuleIds.has(o.ruleId))
      .map((o) => o.id),
  );
  const courseAttendance = data.attendanceRecords.filter((a) =>
    courseOccurrenceIds.has(a.occurrenceId),
  );
  const attendedCount = courseAttendance.filter((a) => a.status === "present").length;
  const missedCount = courseAttendance.filter((a) => a.status === "absent").length;
  const totalLoggedCount = attendedCount + missedCount;
  const attendancePct =
    totalLoggedCount > 0 ? Math.round((attendedCount / totalLoggedCount) * 100) : 0;

  const [editedNote, setEditedNote] = useState<string | null>(null);
  const noteText = editedNote ?? matched?.note ?? "";

  const [changeSheetOpen, setChangeSheetOpen] = useState(false);
  const [changeMode, setChangeMode] = useState<"cancel" | "move">("move");
  const [newDateText, setNewDateText] = useState(() =>
    formatShortDateLabel(matched?.date ?? todayIso),
  );
  const [newDateIso, setNewDateIso] = useState(() => matched?.date ?? todayIso);
  const [newTimeText, setNewTimeText] = useState("11:00 am");
  const [newTime24, setNewTime24] = useState("11:00");
  const [durationMinutes, setDurationMinutes] = useState(120);
  const [newVenueText, setNewVenueText] = useState("LT2, Faculty of Science");
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [checkInSheetOpen, setCheckInSheetOpen] = useState(false);
  const [checkInInitialMode, setCheckInInitialMode] = useState<
    "single" | "two-classes" | "rep-posted"
  >("single");
  const overrideMutation = useOverrideClassOccurrence();

  const DURATION_OPTIONS = [
    { label: "1 hr", minutes: 60 },
    { label: "1.5 hrs", minutes: 90 },
    { label: "2 hrs", minutes: 120 },
    { label: "3 hrs", minutes: 180 },
    { label: "4 hrs", minutes: 240 },
  ] as const;

  const getComputedEndTime = (start24: string, durMins: number) => {
    const [sh = 11, sm = 0] = start24.split(":").map(Number);
    const totalMins = (sh * 60 + sm + durMins) % (24 * 60);
    const eh24 = Math.floor(totalMins / 60);
    const em = totalMins % 60;
    const end24 = `${String(eh24).padStart(2, "0")}:${String(em).padStart(2, "0")}`;
    const period = eh24 >= 12 ? "pm" : "am";
    const eh12 = eh24 % 12 === 0 ? 12 : eh24 % 12;
    const endFormatted = `${eh12}:${String(em).padStart(2, "0")} ${period}`;
    return { end24, endFormatted };
  };

  const { end24: computedEnd24, endFormatted: computedEndFormatted } = getComputedEndTime(
    newTime24,
    durationMinutes,
  );

  const handleApplyOverride = () => {
    overrideMutation.mutate({
      ruleId: matched?.ruleId ?? "rule-csc301-fri",
      courseId,
      date: changeMode === "move" ? newDateIso : (matched?.date ?? todayIso),
      startTime: changeMode === "move" ? newTime24 : (matched?.startTime ?? "10:00"),
      endTime: changeMode === "move" ? computedEnd24 : (matched?.endTime ?? "12:00"),
      venue: changeMode === "move" ? `Moved to ${newVenueText}` : venue,
      status: changeMode === "cancel" ? "cancelled" : "moved",
      overrideReason:
        changeMode === "cancel"
          ? `Cancelled by your rep · next class ${formatShortDateLabel(addDaysIso(matched?.date ?? todayIso, 3))}`
          : "From class reps",
    });
    setChangeSheetOpen(false);
    handleBack();
  };

  const handleBlurSaveNote = () => {
    const occId = matched?.id ?? "occ-fri-csc301-10";
    saveNoteMutation.mutate({ occurrenceId: occId, note: noteText });
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }}
      edges={["top", "left", "right"]}
    >
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 36 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            height: 48,
            marginBottom: 12,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <Pressable
              onPress={handleBack}
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
              numberOfLines={1}
              style={{
                color: isDark ? "#F8FAFC" : "#0F172A",
                fontSize: 20,
                lineHeight: 26,
                fontFamily: "Inter_700Bold",
              }}
            >
              {courseTitle}
            </Text>
          </View>

          <Pressable
            onPress={() => setChangeSheetOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="More options"
            hitSlop={12}
            style={{
              width: 36,
              height: 36,
              alignItems: "flex-end",
              justifyContent: "center",
            }}
          >
            <MoreHorizontal size={22} color={isDark ? "#F8FAFC" : "#0F172A"} strokeWidth={2} />
          </Pressable>
        </View>

        {/* Soft Indigo Summary Card */}
        <View
          style={{
            backgroundColor: isDark ? "#1E1B4B" : "#EEF2FF",
            borderRadius: 16,
            padding: 16,
            marginBottom: 16,
          }}
        >
          {/* Course Tag + Class Type */}
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
              variant="label"
              style={{
                color: isDark ? "#CBD5E1" : "#334155",
                marginLeft: 10,
              }}
            >
              {classType}
            </Text>
          </View>

          {/* Date & Time */}
          <Text
            variant="title-page"
            style={{
              color: isDark ? "#F8FAFC" : "#0F172A",
              fontSize: 20,
              lineHeight: 26,
              fontFamily: "Inter_700Bold",
              fontVariant: ["tabular-nums"],
              marginBottom: 10,
            }}
          >
            {dateDisplay} · {timeDisplay}
          </Text>

          {/* Venue Row */}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MapPin size={17} color={isDark ? "#F8FAFC" : "#0F172A"} strokeWidth={2} />
            <Text
              variant="title-card"
              style={{
                color: isDark ? "#F8FAFC" : "#0F172A",
                marginLeft: 6,
              }}
            >
              {venue}
            </Text>
          </View>

          {/* Source / Subscription Attribution Pill (Carry-over, Elective, Exam instructions, or Others) */}
          {matched?.sourceAttribution ? (
            <View
              style={{
                marginTop: 12,
                paddingTop: 10,
                borderTopWidth: 1,
                borderTopColor: isDark ? "#312E81" : "#C7D2FE",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Sparkles size={14} color={isDark ? "#818CF8" : "#4F46E5"} strokeWidth={2} />
              <Text
                variant="caption"
                style={{
                  marginLeft: 6,
                  color: isDark ? "#CBD5E1" : "#3730A3",
                  fontFamily: "Inter_500Medium",
                  flex: 1,
                }}
              >
                {matched.sourceAttribution}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Study session completion toggle button when viewing a Reading Session */}
        {calendarKind === "others" && classType === "Reading Session" && matched ? (
          <Pressable
            onPress={() =>
              toggleStudyCompleteMutation.mutate({
                eventId: matched.ruleId || matched.id,
                date: matched.date,
              })
            }
            accessibilityRole="button"
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              height: 48,
              borderRadius: 12,
              borderWidth: 1.5,
              borderColor: matched.attended ? "#16A34A" : isDark ? "#4F46E5" : "#4F46E5",
              backgroundColor: matched.attended
                ? isDark
                  ? "rgba(22, 163, 74, 0.2)"
                  : "#DCFCE7"
                : isDark
                  ? "#312E81"
                  : "#EEF2FF",
              marginBottom: 12,
              columnGap: 8,
            }}
          >
            <CheckCircle2
              size={18}
              color={matched.attended ? "#16A34A" : isDark ? "#818CF8" : "#4F46E5"}
              strokeWidth={2.2}
            />
            <Text
              variant="label"
              style={{
                color: matched.attended
                  ? isDark
                    ? "#4ADE80"
                    : "#15803D"
                  : isDark
                    ? "#818CF8"
                    : "#4F46E5",
                fontFamily: "Inter_600SemiBold",
              }}
            >
              {matched.attended
                ? `Completed reading session (${dateDisplay})`
                : `Mark study session completed (${dateDisplay})`}
            </Text>
          </Pressable>
        ) : null}

        {/* Delete button for Exam or Others personal item, or Course Management row for Classes */}
        {calendarKind === "exams" || calendarKind === "others" ? (
          <Pressable
            onPress={handleDeleteCalendarItem}
            accessibilityRole="button"
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              height: 46,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: isDark ? "#7F1D1D" : "#FECACA",
              backgroundColor: isDark ? "#450A0A" : "#FEF2F2",
              marginBottom: 16,
              columnGap: 8,
            }}
          >
            <Trash2 size={16} color={isDark ? "#F87171" : "#DC2626"} strokeWidth={2} />
            <Text
              variant="label"
              style={{
                color: isDark ? "#F87171" : "#DC2626",
                fontFamily: "Inter_600SemiBold",
              }}
            >
              {calendarKind === "exams" ? "Remove exam from calendar" : "Delete personal event"}
            </Text>
          </Pressable>
        ) : calendarKind === "classes" && course ? (
          <View style={{ flexDirection: "row", columnGap: 10, marginBottom: 16 }}>
            <Pressable
              onPress={() => router.push(`/course/${course.id}`)}
              accessibilityRole="button"
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                height: 44,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: isDark ? "#334155" : "#CBD5E1",
                backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                columnGap: 8,
              }}
            >
              <Text
                variant="label"
                style={{
                  color: isDark ? "#F8FAFC" : "#0F172A",
                  fontFamily: "Inter_600SemiBold",
                }}
              >
                Manage {courseCode}
              </Text>
            </Pressable>

            <Pressable
              onPress={handleDeleteCalendarItem}
              accessibilityRole="button"
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                height: 44,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: isDark ? "#7F1D1D" : "#FECACA",
                backgroundColor: isDark ? "#450A0A" : "#FEF2F2",
                columnGap: 8,
              }}
            >
              <Trash2 size={15} color={isDark ? "#F87171" : "#DC2626"} strokeWidth={2} />
              <Text
                variant="label"
                style={{
                  color: isDark ? "#F87171" : "#DC2626",
                  fontFamily: "Inter_600SemiBold",
                }}
              >
                Remove class slot
              </Text>
            </Pressable>
          </View>
        ) : null}

        {/* White Details Card */}
        <View
          style={{
            backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
            borderRadius: 16,
            padding: 16,
            marginBottom: 20,
          }}
        >
          {/* Lecturer */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <View style={{ width: 32, alignItems: "flex-start", justifyContent: "center" }}>
              <User size={20} color={isDark ? "#94A3B8" : "#475569"} strokeWidth={1.85} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="body-lg" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                {lecturerName}
              </Text>
              <Text variant="body" style={{ color: isDark ? "#94A3B8" : "#64748B", marginTop: 2 }}>
                Lecturer
              </Text>
            </View>
          </View>

          {/* Recurrence */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <View style={{ width: 32, alignItems: "flex-start", justifyContent: "center" }}>
              <Calendar size={20} color={isDark ? "#94A3B8" : "#475569"} strokeWidth={1.85} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="body-lg" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                {recurrenceLabel}
              </Text>
              <Text variant="body" style={{ color: isDark ? "#94A3B8" : "#64748B", marginTop: 2 }}>
                Until {formatShortDateLabel(data.semester.endDate || "2027-02-12")} · skips breaks
              </Text>
            </View>
          </View>

          {/* Reminder */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
              <View style={{ width: 32, alignItems: "flex-start", justifyContent: "center" }}>
                <Bell size={20} color={isDark ? "#94A3B8" : "#475569"} strokeWidth={1.85} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="body-lg" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                  Reminder
                </Text>
                <Text
                  variant="body"
                  style={{ color: isDark ? "#94A3B8" : "#64748B", marginTop: 2 }}
                >
                  Uses your default
                </Text>
              </View>
            </View>
            <Text variant="body-lg" style={{ color: isDark ? "#CBD5E1" : "#334155" }}>
              30 min before
            </Text>
          </View>

          {/* Check-in after class */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
              <View style={{ width: 32, alignItems: "flex-start", justifyContent: "center" }}>
                <Info size={20} color={isDark ? "#94A3B8" : "#475569"} strokeWidth={1.85} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="body-lg" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                  Check-in after class
                </Text>
                <Text
                  variant="body"
                  style={{ color: isDark ? "#94A3B8" : "#64748B", marginTop: 2 }}
                >
                  Asks if you attended
                </Text>
              </View>
            </View>

            {/* Custom Indigo Pill Switch matching Screen 38 */}
            <Pressable
              onPress={() => void handleToggleCheckIn()}
              accessibilityRole="switch"
              accessibilityState={{ checked: checkInEnabled }}
              style={{
                width: 52,
                height: 30,
                borderRadius: 15,
                backgroundColor: checkInEnabled ? "#4F46E5" : isDark ? "#334155" : "#CBD5E1",
                padding: 3,
                justifyContent: "center",
                alignItems: checkInEnabled ? "flex-end" : "flex-start",
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

        {/* Private Note Section */}
        <View style={{ marginBottom: 20 }}>
          <Text
            variant="body"
            style={{
              color: isDark ? "#CBD5E1" : "#334155",
              fontFamily: "Inter_500Medium",
              marginBottom: 12,
            }}
          >
            Your note (only you see this)
          </Text>
          <Text
            variant="label"
            style={{
              color: isDark ? "#CBD5E1" : "#334155",
              marginBottom: 6,
            }}
          >
            Note
          </Text>
          <TextInput
            value={noteText}
            onChangeText={setEditedNote}
            onBlur={handleBlurSaveNote}
            placeholder="Add a private note (e.g. Bring the lab manual)..."
            placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
            style={{
              height: 48,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: isDark ? "#334155" : "#CBD5E1",
              backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
              paddingHorizontal: 14,
              fontFamily: "Inter_400Regular",
              fontSize: 15,
              color: isDark ? "#F8FAFC" : "#334155",
            }}
          />
        </View>

        {/* Course Attendance Card (taps through to Course Detail) */}
        <Pressable
          onPress={() => router.push(`/course/${courseId}`)}
          accessibilityRole="button"
          accessibilityLabel={`View ${courseCode} course details`}
          style={{
            backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: isDark ? "#334155" : "#E2E8F0",
            padding: 16,
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
              style={{
                color: isDark ? "#CBD5E1" : "#334155",
                marginLeft: 10,
                fontFamily: "Inter_400Regular",
              }}
            >
              {courseTitle}
            </Text>
          </View>

          <Text
            variant="display"
            style={{
              color: isDark ? "#F8FAFC" : "#0F172A",
              fontVariant: ["tabular-nums"],
              marginBottom: 10,
            }}
          >
            {totalLoggedCount > 0 ? `${attendancePct}%` : "No check-ins yet"}
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
                width: `${totalLoggedCount > 0 ? attendancePct : 0}%`,
                height: 8,
                borderRadius: 4,
                backgroundColor: attendancePct >= 75 ? "#16A34A" : "#F59E0B",
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

          <Text variant="body" style={{ color: isDark ? "#94A3B8" : "#475569" }}>
            {totalLoggedCount > 0
              ? `${attendedCount} attended · ${missedCount} missed`
              : "Tap to view course details & log attendance"}
          </Text>
        </Pressable>

        {/* Quick Actions for Check-in and Move/Cancel */}
        <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
          <Pressable
            onPress={() => {
              setCheckInInitialMode("single");
              setCheckInSheetOpen(true);
            }}
            style={{
              flex: 1,
              height: 46,
              borderRadius: 12,
              backgroundColor: isDark ? "#312E81" : "#EEF2FF",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <CheckCircle2 size={16} color={isDark ? "#818CF8" : "#4F46E5"} />
            <Text variant="label" style={{ color: isDark ? "#818CF8" : "#4F46E5" }}>
              Log attendance
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setChangeSheetOpen(true)}
            style={{
              flex: 1,
              height: 46,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: isDark ? "#334155" : "#CBD5E1",
              backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text variant="label" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
              Move or cancel class
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Screen 40: Cancel or move one class bottom sheet */}
      <Modal
        visible={changeSheetOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setChangeSheetOpen(false)}
      >
        <Pressable
          onPress={() => setChangeSheetOpen(false)}
          style={{
            flex: 1,
            backgroundColor: "rgba(15, 23, 42, 0.45)",
            justifyContent: "flex-end",
          }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingHorizontal: 20,
              paddingTop: 12,
              paddingBottom: 32,
            }}
          >
            <View
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: isDark ? "#475569" : "#CBD5E1",
                alignSelf: "center",
                marginBottom: 16,
              }}
            />

            <Text
              variant="TT/H2"
              style={{
                color: isDark ? "#F8FAFC" : "#0F172A",
                fontSize: 22,
                marginBottom: 6,
              }}
            >
              Change {dateDisplay} only
            </Text>
            <Text
              variant="TT/Body"
              style={{
                color: isDark ? "#94A3B8" : "#475569",
                lineHeight: 22,
                marginBottom: 16,
              }}
            >
              The weekly pattern stays the same. Classmates following this course get a notice right
              away.
            </Text>

            {[
              { id: "cancel" as const, label: "Cancel this class" },
              { id: "move" as const, label: "Move this class" },
            ].map((opt) => {
              const selected = changeMode === opt.id;
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => setChangeMode(opt.id)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    paddingVertical: 10,
                  }}
                >
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: selected ? "#4F46E5" : isDark ? "#475569" : "#CBD5E1",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {selected ? (
                      <View
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: 6,
                          backgroundColor: "#4F46E5",
                        }}
                      />
                    ) : null}
                  </View>
                  <Text
                    variant="TT/Body"
                    style={{
                      color: isDark ? "#F8FAFC" : "#0F172A",
                      fontSize: 16,
                    }}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}

            {changeMode === "move" ? (
              <View style={{ marginTop: 12 }}>
                <View
                  style={{
                    flexDirection: "row",
                    gap: 12,
                    marginBottom: 16,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      variant="TT/Caption"
                      style={{
                        color: isDark ? "#94A3B8" : "#475569",
                        marginBottom: 6,
                      }}
                    >
                      New date
                    </Text>
                    <Pressable
                      onPress={() => {
                        setTimePickerOpen(false);
                        setDatePickerOpen((prev) => !prev);
                      }}
                      accessibilityRole="button"
                      accessibilityLabel="Pick new date"
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        borderWidth: datePickerOpen ? 2 : 1,
                        borderColor: datePickerOpen ? "#4F46E5" : isDark ? "#334155" : "#CBD5E1",
                        borderRadius: 12,
                        paddingHorizontal: 12,
                        height: 48,
                        gap: 8,
                        backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
                      }}
                    >
                      <Calendar
                        size={18}
                        color={datePickerOpen ? "#4F46E5" : isDark ? "#94A3B8" : "#475569"}
                      />
                      <Text
                        variant="TT/Body"
                        style={{
                          flex: 1,
                          color: isDark ? "#F8FAFC" : "#0F172A",
                          fontSize: 15,
                        }}
                      >
                        {newDateText}
                      </Text>
                    </Pressable>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text
                      variant="TT/Caption"
                      style={{
                        color: isDark ? "#94A3B8" : "#475569",
                        marginBottom: 6,
                      }}
                    >
                      New time
                    </Text>
                    <Pressable
                      onPress={() => {
                        setDatePickerOpen(false);
                        setTimePickerOpen((prev) => !prev);
                      }}
                      accessibilityRole="button"
                      accessibilityLabel="Pick new time"
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        borderWidth: timePickerOpen ? 2 : 1,
                        borderColor: timePickerOpen ? "#4F46E5" : isDark ? "#334155" : "#CBD5E1",
                        borderRadius: 12,
                        paddingHorizontal: 12,
                        height: 48,
                        gap: 8,
                        backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
                      }}
                    >
                      <Clock
                        size={18}
                        color={timePickerOpen ? "#4F46E5" : isDark ? "#94A3B8" : "#475569"}
                      />
                      <Text
                        variant="TT/Body"
                        style={{
                          flex: 1,
                          color: isDark ? "#F8FAFC" : "#0F172A",
                          fontSize: 15,
                        }}
                      >
                        {newTimeText}
                      </Text>
                    </Pressable>
                  </View>
                </View>

                {datePickerOpen ? (
                  <InlineDatePicker
                    value={newDateText}
                    title="Pick new date"
                    onClose={() => setDatePickerOpen(false)}
                    onSelect={(formatted, iso) => {
                      setNewDateText(formatted);
                      setNewDateIso(iso);
                    }}
                  />
                ) : null}

                {timePickerOpen ? (
                  <InlineTimePicker
                    value={newTimeText}
                    title="Pick new time"
                    onClose={() => setTimePickerOpen(false)}
                    onSelect={(formatted, time24) => {
                      setNewTimeText(formatted);
                      setNewTime24(time24);
                    }}
                  />
                ) : null}

                {/* Duration selector */}
                <View style={{ marginBottom: 16 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <Text
                      variant="TT/Caption"
                      style={{
                        color: isDark ? "#94A3B8" : "#475569",
                      }}
                    >
                      Duration
                    </Text>
                    <Text
                      variant="TT/Caption"
                      style={{
                        color: isDark ? "#818CF8" : "#4F46E5",
                        fontFamily: "Inter_600SemiBold",
                        fontVariant: ["tabular-nums"],
                      }}
                    >
                      {newTimeText} – {computedEndFormatted}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      gap: 8,
                    }}
                  >
                    {DURATION_OPTIONS.map((opt) => {
                      const active = durationMinutes === opt.minutes;
                      return (
                        <Pressable
                          key={opt.minutes}
                          onPress={() => setDurationMinutes(opt.minutes)}
                          accessibilityRole="button"
                          accessibilityLabel={`Duration ${opt.label}`}
                          accessibilityState={{ selected: active }}
                          style={{
                            flex: 1,
                            height: 40,
                            borderRadius: 10,
                            borderWidth: active ? 1.5 : 1,
                            borderColor: active ? "#4F46E5" : isDark ? "#334155" : "#CBD5E1",
                            backgroundColor: active
                              ? isDark
                                ? "#312E81"
                                : "#EEF2FF"
                              : isDark
                                ? "#0F172A"
                                : "#FFFFFF",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Text
                            variant="TT/Caption"
                            style={{
                              color: active
                                ? isDark
                                  ? "#818CF8"
                                  : "#4F46E5"
                                : isDark
                                  ? "#CBD5E1"
                                  : "#334155",
                              fontFamily: active ? "Inter_600SemiBold" : "Inter_500Medium",
                              fontSize: 13,
                            }}
                          >
                            {opt.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <Text
                  variant="TT/Caption"
                  style={{
                    color: isDark ? "#94A3B8" : "#475569",
                    marginBottom: 6,
                  }}
                >
                  New venue
                </Text>
                <TextInput
                  value={newVenueText}
                  onChangeText={setNewVenueText}
                  style={{
                    borderWidth: 1,
                    borderColor: isDark ? "#334155" : "#CBD5E1",
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    height: 48,
                    color: isDark ? "#F8FAFC" : "#0F172A",
                    fontSize: 15,
                    marginBottom: 20,
                  }}
                />
              </View>
            ) : (
              <View style={{ height: 16 }} />
            )}

            <Pressable
              onPress={handleApplyOverride}
              style={{
                height: 52,
                borderRadius: 14,
                backgroundColor: "#4F46E5",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text variant="TT/Button" style={{ color: "#FFFFFF", fontWeight: "600" }}>
                {changeMode === "move"
                  ? "Move and notify the class"
                  : "Cancel and notify the class"}
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <PostClassCheckInSheet
        isOpen={checkInSheetOpen}
        onClose={() => setCheckInSheetOpen(false)}
        occurrenceId={matched?.id ?? "occ-fri-csc301-10"}
        courseCode={courseCode}
        courseTitle={courseTitle}
        courseColor={courseColor}
        timeRange={timeDisplay}
        venue={venue}
        initialMode={checkInInitialMode}
      />
    </SafeAreaView>
  );
}
