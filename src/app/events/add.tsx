import React, { useState } from "react";
import { View, ScrollView, Pressable, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ChevronLeft,
  Calendar,
  Clock,
  MapPin,
  Dumbbell,
  FileCheck2,
  GraduationCap,
} from "lucide-react-native";
import { Text } from "@/components/ui/Text";
import { useTheme } from "@/theme";
import { useTimetable, useCreateExam, useCreatePersonalEvent } from "@/hooks/useTimetable";
import { addDaysIso, formatShortDateLabel, getTodayIsoDate } from "@/lib/dateClock";

const WEEKDAYS = [
  { id: 1, label: "Mon" },
  { id: 2, label: "Tue" },
  { id: 3, label: "Wed" },
  { id: 4, label: "Thu" },
  { id: 5, label: "Fri" },
  { id: 6, label: "Sat" },
  { id: 7, label: "Sun" },
];

const START_TIMES = [
  { hhmm: "07:00", label: "7:00 am" },
  { hhmm: "08:00", label: "8:00 am" },
  { hhmm: "09:00", label: "9:00 am" },
  { hhmm: "10:00", label: "10:00 am" },
  { hhmm: "11:00", label: "11:00 am" },
  { hhmm: "12:00", label: "12:00 pm" },
  { hhmm: "14:00", label: "2:00 pm" },
  { hhmm: "15:15", label: "3:15 pm" },
  { hhmm: "16:00", label: "4:00 pm" },
  { hhmm: "17:00", label: "5:00 pm" },
  { hhmm: "18:15", label: "6:15 pm" },
];

const DURATIONS = [
  { mins: 60, label: "1 hr" },
  { mins: 90, label: "1.5 hrs" },
  { mins: 120, label: "2 hrs" },
  { mins: 180, label: "3 hrs" },
];

function buildDateOptions(todayIso: string) {
  return [
    { iso: todayIso, label: `Today (${formatShortDateLabel(todayIso)})` },
    { iso: addDaysIso(todayIso, 1), label: formatShortDateLabel(addDaysIso(todayIso, 1)) },
    { iso: addDaysIso(todayIso, 2), label: formatShortDateLabel(addDaysIso(todayIso, 2)) },
    { iso: addDaysIso(todayIso, 3), label: formatShortDateLabel(addDaysIso(todayIso, 3)) },
    { iso: addDaysIso(todayIso, 7), label: formatShortDateLabel(addDaysIso(todayIso, 7)) },
  ];
}

const OTHER_CATEGORIES: {
  id: "Gym" | "Church" | "Club" | "Study" | "Personal";
  label: string;
  defaultColor: string;
  defaultTitle: string;
  defaultVenue: string;
}[] = [
  {
    id: "Gym",
    label: "Gym",
    defaultColor: "#16A34A",
    defaultTitle: "Evening Gym Workout",
    defaultVenue: "UNIBEN Sports Complex",
  },
  {
    id: "Church",
    label: "Church",
    defaultColor: "#9333EA",
    defaultTitle: "Midweek Fellowship & Choir",
    defaultVenue: "All Saints Campus Chapel",
  },
  {
    id: "Club",
    label: "Club",
    defaultColor: "#0284C7",
    defaultTitle: "GDG Campus Tech Club",
    defaultVenue: "Engineering Seminar Room",
  },
  {
    id: "Study",
    label: "Study",
    defaultColor: "#0D9488",
    defaultTitle: "Library Past Questions Group",
    defaultVenue: "John Harris Library",
  },
  {
    id: "Personal",
    label: "Personal",
    defaultColor: "#EA580C",
    defaultTitle: "Personal Errand / Appointment",
    defaultVenue: "Hall 3, Ekehuan / Ugbowo",
  },
];

function computeEndTime(startHhMm: string, durationMins: number): string {
  const [h = 8, m = 0] = startHhMm.split(":").map(Number);
  const totalMins = h * 60 + m + durationMins;
  const endH = Math.min(23, Math.floor(totalMins / 60));
  const endM = totalMins % 60;
  return `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
}

export default function AddCalendarEventScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string; courseId?: string }>();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const { data } = useTimetable();
  const createExam = useCreateExam();
  const createPersonalEvent = useCreatePersonalEvent();
  const [todayIso] = useState(() => getTodayIsoDate());
  const dateOptions = buildDateOptions(todayIso);

  const initialCategory =
    params.category === "Study" ||
    params.category === "Gym" ||
    params.category === "Church" ||
    params.category === "Club" ||
    params.category === "Personal"
      ? params.category
      : "Gym";

  const preselectedCourse = data.courses.find(
    (c) => c.id === params.courseId || c.code === params.courseId,
  );

  const [eventKind, setEventKind] = useState<"others" | "exam">("others");

  // "Others" form state (Gym, Church, Club, Study, Personal)
  const [otherCategory, setOtherCategory] = useState<
    "Gym" | "Church" | "Club" | "Study" | "Personal"
  >(initialCategory);
  const [linkedCourseId, setLinkedCourseId] = useState<string | null>(
    preselectedCourse?.id ??
      (initialCategory === "Study" ? (data.courses[0]?.id ?? "course-mth-301") : null),
  );
  const [studyTopic, setStudyTopic] = useState<string>(
    initialCategory === "Study" ? "Past questions & lecture notes revision" : "",
  );
  const [otherTitle, setOtherTitle] = useState(
    initialCategory === "Study"
      ? `${preselectedCourse?.code ?? data.courses[0]?.code ?? "MTH 301"} · Reading & Past Questions`
      : "Evening Gym Workout",
  );
  const [otherColor, setOtherColor] = useState(
    initialCategory === "Study"
      ? (preselectedCourse?.color ?? data.courses[0]?.color ?? "#0D9488")
      : "#16A34A",
  );
  const [repeatMode, setRepeatMode] = useState<"recurring" | "one-time">("recurring");
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>(
    initialCategory === "Study" ? [2, 4, 6] : [1, 3, 5],
  );
  const [oneTimeDate, setOneTimeDate] = useState(todayIso);
  const [startTime, setStartTime] = useState(initialCategory === "Study" ? "16:00" : "17:00");
  const [durationMins, setDurationMins] = useState(initialCategory === "Study" ? 90 : 60);
  const [venue, setVenue] = useState(
    initialCategory === "Study" ? "John Harris Library" : "UNIBEN Sports Complex",
  );
  const [note] = useState("");

  // "Exam" form state
  const [examCourseId, setExamCourseId] = useState<string>(data.courses[0]?.id ?? "course-csc-301");
  const [paperType, setPaperType] = useState<"Written" | "CBT" | "Practical">("CBT");
  const [examDate, setExamDate] = useState(todayIso);
  const [examStartTime, setExamStartTime] = useState("15:15");
  const [examDurationMins, setExamDurationMins] = useState(90);
  const [examVenue, setExamVenue] = useState("ICT / CBT Centre Hall B");
  const [examInstructions, setExamInstructions] = useState(
    "Bring student ID card and non-programmable calculator",
  );

  const handleSelectOtherCategory = (cat: (typeof OTHER_CATEGORIES)[number]) => {
    setOtherCategory(cat.id);
    if (cat.id === "Study") {
      const targetCourse =
        data.courses.find((c) => c.id === linkedCourseId) ?? data.courses[0] ?? null;
      setLinkedCourseId(targetCourse?.id ?? null);
      setOtherColor(targetCourse?.color ?? cat.defaultColor);
      setOtherTitle(
        targetCourse ? `${targetCourse.code} · Reading & Past Questions` : cat.defaultTitle,
      );
      setVenue(cat.defaultVenue);
      if (!studyTopic) {
        setStudyTopic("Past questions & lecture notes revision");
      }
    } else {
      setOtherColor(cat.defaultColor);
      setOtherTitle(cat.defaultTitle);
      setVenue(cat.defaultVenue);
    }
  };

  const handleSelectStudyCourse = (courseId: string | null) => {
    setLinkedCourseId(courseId);
    if (!courseId) {
      setOtherColor("#0D9488");
      setOtherTitle("General Personal Reading Session");
      return;
    }
    const found = data.courses.find((c) => c.id === courseId);
    if (found) {
      setOtherColor(found.color);
      setOtherTitle(`${found.code} · ${studyTopic.trim() || "Reading & Past Questions"}`);
    }
  };

  const toggleWeekday = (dayId: number) => {
    setSelectedWeekdays((prev) => {
      if (prev.includes(dayId)) {
        if (prev.length === 1) return prev;
        return prev.filter((d) => d !== dayId);
      }
      return [...prev, dayId].sort((a, b) => a - b);
    });
  };

  const handleSave = async () => {
    if (eventKind === "others") {
      await createPersonalEvent.mutateAsync({
        category: otherCategory,
        title: otherTitle.trim() || otherCategory,
        color: otherColor,
        repeatMode,
        weekdays: selectedWeekdays,
        oneTimeDate: repeatMode === "one-time" ? oneTimeDate : null,
        startTime,
        endTime: computeEndTime(startTime, durationMins),
        venue: venue.trim() || "Campus",
        note: otherCategory === "Study" ? studyTopic.trim() || note : note,
        linkedCourseId: otherCategory === "Study" ? linkedCourseId : null,
        studyTopic: otherCategory === "Study" ? studyTopic.trim() : "",
      });
    } else {
      await createExam.mutateAsync({
        courseId: examCourseId,
        paperType,
        date: examDate,
        startTime: examStartTime,
        endTime: computeEndTime(examStartTime, examDurationMins),
        venue: examVenue.trim() || "ETF Hall",
        seatOrInstructions: examInstructions.trim(),
      });
    }
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }}
      edges={["top", "left", "right", "bottom"]}
    >
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 18,
          }}
        >
          <Pressable
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/(tabs)");
              }
            }}
            accessibilityRole="button"
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ChevronLeft size={22} color={isDark ? "#F8FAFC" : "#0F172A"} strokeWidth={2} />
          </Pressable>

          <Text variant="title-section" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
            Add to calendar
          </Text>

          <View style={{ width: 40 }} />
        </View>

        {/* Calendar Type Switcher: 4. Others (Gym, Church, Club) | 3. Exam | 1. Class */}
        <View
          style={{
            flexDirection: "row",
            backgroundColor: isDark ? "#1E293B" : "#E2E8F0",
            padding: 4,
            borderRadius: 12,
            marginBottom: 20,
          }}
        >
          <Pressable
            onPress={() => setEventKind("others")}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 10,
              borderRadius: 9,
              backgroundColor:
                eventKind === "others" ? (isDark ? "#334155" : "#FFFFFF") : "transparent",
              columnGap: 6,
            }}
          >
            <Dumbbell
              size={15}
              color={
                eventKind === "others"
                  ? isDark
                    ? "#4ADE80"
                    : "#15803D"
                  : isDark
                    ? "#94A3B8"
                    : "#475569"
              }
              strokeWidth={2}
            />
            <Text
              variant="label"
              style={{
                fontFamily: eventKind === "others" ? "Inter_600SemiBold" : "Inter_500Medium",
                color:
                  eventKind === "others"
                    ? isDark
                      ? "#F8FAFC"
                      : "#0F172A"
                    : isDark
                      ? "#94A3B8"
                      : "#475569",
              }}
            >
              Others (Gym, Church)
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setEventKind("exam")}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 10,
              borderRadius: 9,
              backgroundColor:
                eventKind === "exam" ? (isDark ? "#334155" : "#FFFFFF") : "transparent",
              columnGap: 6,
            }}
          >
            <FileCheck2
              size={15}
              color={
                eventKind === "exam"
                  ? isDark
                    ? "#F87171"
                    : "#DC2626"
                  : isDark
                    ? "#94A3B8"
                    : "#475569"
              }
              strokeWidth={2}
            />
            <Text
              variant="label"
              style={{
                fontFamily: eventKind === "exam" ? "Inter_600SemiBold" : "Inter_500Medium",
                color:
                  eventKind === "exam"
                    ? isDark
                      ? "#F8FAFC"
                      : "#0F172A"
                    : isDark
                      ? "#94A3B8"
                      : "#475569",
              }}
            >
              Exam
            </Text>
          </Pressable>
        </View>

        {eventKind === "others" ? (
          <View style={{ rowGap: 18 }}>
            {/* Category Presets: Gym, Church, Club, Study, Personal */}
            <View>
              <Text
                variant="label"
                style={{
                  color: isDark ? "#CBD5E1" : "#334155",
                  marginBottom: 8,
                  fontFamily: "Inter_600SemiBold",
                }}
              >
                Category (Others calendar)
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {OTHER_CATEGORIES.map((cat) => {
                  const active = otherCategory === cat.id;
                  return (
                    <Pressable
                      key={cat.id}
                      onPress={() => handleSelectOtherCategory(cat)}
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        borderRadius: 9999,
                        borderWidth: 1.5,
                        borderColor: active ? cat.defaultColor : isDark ? "#334155" : "#CBD5E1",
                        backgroundColor: active ? cat.defaultColor : isDark ? "#1E293B" : "#FFFFFF",
                      }}
                    >
                      <Text
                        variant="label"
                        style={{
                          color: active ? "#FFFFFF" : isDark ? "#F8FAFC" : "#0F172A",
                          fontFamily: active ? "Inter_600SemiBold" : "Inter_500Medium",
                        }}
                      >
                        {cat.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Course Link & Study Focus when "Study" category is selected */}
            {otherCategory === "Study" && (
              <View
                style={{
                  backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: isDark ? "#334155" : "#E2E8F0",
                  padding: 14,
                  rowGap: 14,
                }}
              >
                <View>
                  <Text
                    variant="label"
                    style={{
                      color: isDark ? "#CBD5E1" : "#334155",
                      marginBottom: 8,
                      fontFamily: "Inter_600SemiBold",
                    }}
                  >
                    Link reading session to a course
                  </Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                    {data.courses.map((course) => {
                      const active = linkedCourseId === course.id;
                      return (
                        <Pressable
                          key={course.id}
                          onPress={() => handleSelectStudyCourse(course.id)}
                          style={{
                            paddingHorizontal: 12,
                            paddingVertical: 7,
                            borderRadius: 10,
                            borderWidth: 1.5,
                            borderColor: active ? course.color : isDark ? "#334155" : "#CBD5E1",
                            backgroundColor: active ? course.color : isDark ? "#0F172A" : "#F8FAFC",
                          }}
                        >
                          <Text
                            variant="caption"
                            style={{
                              color: active ? "#FFFFFF" : isDark ? "#F8FAFC" : "#0F172A",
                              fontFamily: active ? "Inter_600SemiBold" : "Inter_500Medium",
                            }}
                          >
                            {course.code}
                          </Text>
                        </Pressable>
                      );
                    })}
                    <Pressable
                      onPress={() => handleSelectStudyCourse(null)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 7,
                        borderRadius: 10,
                        borderWidth: 1.5,
                        borderColor:
                          linkedCourseId === null ? "#0D9488" : isDark ? "#334155" : "#CBD5E1",
                        backgroundColor:
                          linkedCourseId === null ? "#0D9488" : isDark ? "#0F172A" : "#F8FAFC",
                      }}
                    >
                      <Text
                        variant="caption"
                        style={{
                          color:
                            linkedCourseId === null ? "#FFFFFF" : isDark ? "#F8FAFC" : "#0F172A",
                          fontFamily:
                            linkedCourseId === null ? "Inter_600SemiBold" : "Inter_500Medium",
                        }}
                      >
                        General study
                      </Text>
                    </Pressable>
                  </View>
                </View>

                <View>
                  <Text
                    variant="label"
                    style={{
                      color: isDark ? "#CBD5E1" : "#334155",
                      marginBottom: 6,
                      fontFamily: "Inter_600SemiBold",
                    }}
                  >
                    Study focus / topic
                  </Text>
                  <TextInput
                    value={studyTopic}
                    onChangeText={(txt) => {
                      setStudyTopic(txt);
                      const found = data.courses.find((c) => c.id === linkedCourseId);
                      if (found && txt.trim()) {
                        setOtherTitle(`${found.code} · ${txt.trim()}`);
                      }
                    }}
                    placeholder="e.g. Eigenvalues & past questions, Chapter 4 notes"
                    placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                    style={{
                      height: 44,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: isDark ? "#334155" : "#CBD5E1",
                      backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                      paddingHorizontal: 12,
                      fontFamily: "Inter_500Medium",
                      fontSize: 14,
                      color: isDark ? "#F8FAFC" : "#0F172A",
                    }}
                  />
                </View>
              </View>
            )}

            {/* Title Input */}
            <View>
              <Text
                variant="label"
                style={{
                  color: isDark ? "#CBD5E1" : "#334155",
                  marginBottom: 8,
                  fontFamily: "Inter_600SemiBold",
                }}
              >
                Title
              </Text>
              <TextInput
                value={otherTitle}
                onChangeText={setOtherTitle}
                placeholder="e.g. Evening Gym, Midweek Fellowship, Tech Club"
                placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                style={{
                  height: 48,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: isDark ? "#334155" : "#CBD5E1",
                  backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                  paddingHorizontal: 14,
                  fontFamily: "Inter_500Medium",
                  fontSize: 15,
                  color: isDark ? "#F8FAFC" : "#0F172A",
                }}
              />
            </View>

            {/* Recurring vs One-Time Toggle */}
            <View>
              <Text
                variant="label"
                style={{
                  color: isDark ? "#CBD5E1" : "#334155",
                  marginBottom: 8,
                  fontFamily: "Inter_600SemiBold",
                }}
              >
                Schedule frequency
              </Text>
              <View style={{ flexDirection: "row", columnGap: 10, marginBottom: 12 }}>
                {(
                  [
                    { id: "recurring", label: "Recurring weekly" },
                    { id: "one-time", label: "One-time date" },
                  ] as const
                ).map((mode) => {
                  const active = repeatMode === mode.id;
                  return (
                    <Pressable
                      key={mode.id}
                      onPress={() => setRepeatMode(mode.id)}
                      style={{
                        flex: 1,
                        paddingVertical: 10,
                        borderRadius: 10,
                        borderWidth: 1.5,
                        borderColor: active ? "#4F46E5" : isDark ? "#334155" : "#CBD5E1",
                        backgroundColor: active
                          ? isDark
                            ? "#1E1B4B"
                            : "#EEF2FF"
                          : isDark
                            ? "#1E293B"
                            : "#FFFFFF",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        variant="label"
                        style={{
                          fontFamily: active ? "Inter_600SemiBold" : "Inter_500Medium",
                          color: active
                            ? isDark
                              ? "#818CF8"
                              : "#4F46E5"
                            : isDark
                              ? "#94A3B8"
                              : "#475569",
                        }}
                      >
                        {mode.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {repeatMode === "recurring" ? (
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  {WEEKDAYS.map((day) => {
                    const active = selectedWeekdays.includes(day.id);
                    return (
                      <Pressable
                        key={day.id}
                        onPress={() => toggleWeekday(day.id)}
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: active ? "#4F46E5" : isDark ? "#1E293B" : "#FFFFFF",
                          borderWidth: 1,
                          borderColor: active ? "#4F46E5" : isDark ? "#334155" : "#CBD5E1",
                        }}
                      >
                        <Text
                          variant="label"
                          style={{
                            color: active ? "#FFFFFF" : isDark ? "#CBD5E1" : "#334155",
                            fontFamily: active ? "Inter_600SemiBold" : "Inter_500Medium",
                          }}
                        >
                          {day.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : (
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {dateOptions.map((d) => {
                    const active = oneTimeDate === d.iso;
                    return (
                      <Pressable
                        key={d.iso}
                        onPress={() => setOneTimeDate(d.iso)}
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 10,
                          borderWidth: 1,
                          borderColor: active ? "#4F46E5" : isDark ? "#334155" : "#CBD5E1",
                          backgroundColor: active ? "#4F46E5" : isDark ? "#1E293B" : "#FFFFFF",
                        }}
                      >
                        <Text
                          variant="caption"
                          style={{
                            color: active ? "#FFFFFF" : isDark ? "#CBD5E1" : "#334155",
                            fontFamily: active ? "Inter_600SemiBold" : "Inter_500Medium",
                          }}
                        >
                          {d.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Start Time & Duration */}
            <View>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                <Clock size={15} color={isDark ? "#94A3B8" : "#64748B"} strokeWidth={2} />
                <Text
                  variant="label"
                  style={{
                    marginLeft: 6,
                    color: isDark ? "#CBD5E1" : "#334155",
                    fontFamily: "Inter_600SemiBold",
                  }}
                >
                  Start time & duration
                </Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 10 }}
                contentContainerStyle={{ columnGap: 8 }}
              >
                {START_TIMES.map((t) => {
                  const active = startTime === t.hhmm;
                  return (
                    <Pressable
                      key={t.hhmm}
                      onPress={() => setStartTime(t.hhmm)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: active ? "#4F46E5" : isDark ? "#334155" : "#CBD5E1",
                        backgroundColor: active ? "#4F46E5" : isDark ? "#1E293B" : "#FFFFFF",
                      }}
                    >
                      <Text
                        variant="caption"
                        style={{
                          color: active ? "#FFFFFF" : isDark ? "#CBD5E1" : "#334155",
                          fontFamily: active ? "Inter_600SemiBold" : "Inter_500Medium",
                        }}
                      >
                        {t.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <View style={{ flexDirection: "row", columnGap: 8 }}>
                {DURATIONS.map((dur) => {
                  const active = durationMins === dur.mins;
                  return (
                    <Pressable
                      key={dur.mins}
                      onPress={() => setDurationMins(dur.mins)}
                      style={{
                        flex: 1,
                        paddingVertical: 8,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: active ? "#4F46E5" : isDark ? "#334155" : "#CBD5E1",
                        backgroundColor: active
                          ? isDark
                            ? "#1E1B4B"
                            : "#EEF2FF"
                          : isDark
                            ? "#1E293B"
                            : "#FFFFFF",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        variant="caption"
                        style={{
                          color: active
                            ? isDark
                              ? "#818CF8"
                              : "#4F46E5"
                            : isDark
                              ? "#CBD5E1"
                              : "#475569",
                          fontFamily: active ? "Inter_600SemiBold" : "Inter_500Medium",
                        }}
                      >
                        {dur.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Location / Venue */}
            <View>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                <MapPin size={15} color={isDark ? "#94A3B8" : "#64748B"} strokeWidth={2} />
                <Text
                  variant="label"
                  style={{
                    marginLeft: 6,
                    color: isDark ? "#CBD5E1" : "#334155",
                    fontFamily: "Inter_600SemiBold",
                  }}
                >
                  Location / Venue
                </Text>
              </View>
              <TextInput
                value={venue}
                onChangeText={setVenue}
                placeholder="e.g. UNIBEN Sports Complex, All Saints Chapel"
                placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                style={{
                  height: 48,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: isDark ? "#334155" : "#CBD5E1",
                  backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                  paddingHorizontal: 14,
                  fontFamily: "Inter_500Medium",
                  fontSize: 15,
                  color: isDark ? "#F8FAFC" : "#0F172A",
                }}
              />
            </View>
          </View>
        ) : (
          /* EXAM CREATION FORM */
          <View style={{ rowGap: 18 }}>
            {/* Course Selector */}
            <View>
              <Text
                variant="label"
                style={{
                  color: isDark ? "#CBD5E1" : "#334155",
                  marginBottom: 8,
                  fontFamily: "Inter_600SemiBold",
                }}
              >
                Course
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {data.courses.map((course) => {
                  const active = examCourseId === course.id;
                  return (
                    <Pressable
                      key={course.id}
                      onPress={() => setExamCourseId(course.id)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 10,
                        borderWidth: 1.5,
                        borderColor: active ? "#DC2626" : isDark ? "#334155" : "#CBD5E1",
                        backgroundColor: active ? "#DC2626" : isDark ? "#1E293B" : "#FFFFFF",
                      }}
                    >
                      <Text
                        variant="label"
                        style={{
                          color: active ? "#FFFFFF" : isDark ? "#F8FAFC" : "#0F172A",
                          fontFamily: active ? "Inter_600SemiBold" : "Inter_500Medium",
                        }}
                      >
                        {course.code}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Paper Type: Written | CBT | Practical */}
            <View>
              <Text
                variant="label"
                style={{
                  color: isDark ? "#CBD5E1" : "#334155",
                  marginBottom: 8,
                  fontFamily: "Inter_600SemiBold",
                }}
              >
                Paper type
              </Text>
              <View style={{ flexDirection: "row", columnGap: 10 }}>
                {(["Written", "CBT", "Practical"] as const).map((pt) => {
                  const active = paperType === pt;
                  return (
                    <Pressable
                      key={pt}
                      onPress={() => setPaperType(pt)}
                      style={{
                        flex: 1,
                        paddingVertical: 10,
                        borderRadius: 10,
                        borderWidth: 1.5,
                        borderColor: active ? "#DC2626" : isDark ? "#334155" : "#CBD5E1",
                        backgroundColor: active
                          ? isDark
                            ? "#450A0A"
                            : "#FEF2F2"
                          : isDark
                            ? "#1E293B"
                            : "#FFFFFF",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        variant="label"
                        style={{
                          fontFamily: active ? "Inter_600SemiBold" : "Inter_500Medium",
                          color: active
                            ? isDark
                              ? "#F87171"
                              : "#DC2626"
                            : isDark
                              ? "#94A3B8"
                              : "#475569",
                        }}
                      >
                        {pt}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Exam Date */}
            <View>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                <Calendar size={15} color={isDark ? "#94A3B8" : "#64748B"} strokeWidth={2} />
                <Text
                  variant="label"
                  style={{
                    marginLeft: 6,
                    color: isDark ? "#CBD5E1" : "#334155",
                    fontFamily: "Inter_600SemiBold",
                  }}
                >
                  Exam date
                </Text>
              </View>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {dateOptions.map((d) => {
                  const active = examDate === d.iso;
                  return (
                    <Pressable
                      key={d.iso}
                      onPress={() => setExamDate(d.iso)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: active ? "#DC2626" : isDark ? "#334155" : "#CBD5E1",
                        backgroundColor: active ? "#DC2626" : isDark ? "#1E293B" : "#FFFFFF",
                      }}
                    >
                      <Text
                        variant="caption"
                        style={{
                          color: active ? "#FFFFFF" : isDark ? "#CBD5E1" : "#334155",
                          fontFamily: active ? "Inter_600SemiBold" : "Inter_500Medium",
                        }}
                      >
                        {d.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Exam Start Time & Duration */}
            <View>
              <Text
                variant="label"
                style={{
                  color: isDark ? "#CBD5E1" : "#334155",
                  marginBottom: 8,
                  fontFamily: "Inter_600SemiBold",
                }}
              >
                Start time & duration
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 10 }}
                contentContainerStyle={{ columnGap: 8 }}
              >
                {START_TIMES.map((t) => {
                  const active = examStartTime === t.hhmm;
                  return (
                    <Pressable
                      key={t.hhmm}
                      onPress={() => setExamStartTime(t.hhmm)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: active ? "#DC2626" : isDark ? "#334155" : "#CBD5E1",
                        backgroundColor: active ? "#DC2626" : isDark ? "#1E293B" : "#FFFFFF",
                      }}
                    >
                      <Text
                        variant="caption"
                        style={{
                          color: active ? "#FFFFFF" : isDark ? "#CBD5E1" : "#334155",
                          fontFamily: active ? "Inter_600SemiBold" : "Inter_500Medium",
                        }}
                      >
                        {t.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <View style={{ flexDirection: "row", columnGap: 8 }}>
                {DURATIONS.map((dur) => {
                  const active = examDurationMins === dur.mins;
                  return (
                    <Pressable
                      key={dur.mins}
                      onPress={() => setExamDurationMins(dur.mins)}
                      style={{
                        flex: 1,
                        paddingVertical: 8,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: active ? "#DC2626" : isDark ? "#334155" : "#CBD5E1",
                        backgroundColor: active
                          ? isDark
                            ? "#450A0A"
                            : "#FEF2F2"
                          : isDark
                            ? "#1E293B"
                            : "#FFFFFF",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        variant="caption"
                        style={{
                          color: active
                            ? isDark
                              ? "#F87171"
                              : "#DC2626"
                            : isDark
                              ? "#CBD5E1"
                              : "#475569",
                          fontFamily: active ? "Inter_600SemiBold" : "Inter_500Medium",
                        }}
                      >
                        {dur.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Exam Venue & Seat/Instructions */}
            <View>
              <Text
                variant="label"
                style={{
                  color: isDark ? "#CBD5E1" : "#334155",
                  marginBottom: 8,
                  fontFamily: "Inter_600SemiBold",
                }}
              >
                Exam Hall / Venue
              </Text>
              <TextInput
                value={examVenue}
                onChangeText={setExamVenue}
                placeholder="e.g. ICT / CBT Centre Hall B, ETF Hall"
                placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                style={{
                  height: 48,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: isDark ? "#334155" : "#CBD5E1",
                  backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                  paddingHorizontal: 14,
                  fontFamily: "Inter_500Medium",
                  fontSize: 15,
                  color: isDark ? "#F8FAFC" : "#0F172A",
                  marginBottom: 14,
                }}
              />

              <Text
                variant="label"
                style={{
                  color: isDark ? "#CBD5E1" : "#334155",
                  marginBottom: 8,
                  fontFamily: "Inter_600SemiBold",
                }}
              >
                Seat / Batch / Instructions
              </Text>
              <TextInput
                value={examInstructions}
                onChangeText={setExamInstructions}
                placeholder="e.g. Batch B · Bring student ID card"
                placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                style={{
                  height: 48,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: isDark ? "#334155" : "#CBD5E1",
                  backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                  paddingHorizontal: 14,
                  fontFamily: "Inter_500Medium",
                  fontSize: 15,
                  color: isDark ? "#F8FAFC" : "#0F172A",
                }}
              />
            </View>
          </View>
        )}

        {/* Save Button */}
        <Pressable
          onPress={handleSave}
          accessibilityRole="button"
          style={{
            marginTop: 24,
            height: 52,
            borderRadius: 12,
            backgroundColor: eventKind === "exam" ? "#DC2626" : "#4F46E5",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text variant="label-lg" style={{ color: "#FFFFFF" }}>
            {eventKind === "others"
              ? `Save ${otherCategory} to Others calendar`
              : "Save Exam to Exams calendar"}
          </Text>
        </Pressable>

        {/* Shortcut to Add Course Class */}
        <Pressable
          onPress={() => router.push("/setup/add-class" as any)}
          accessibilityRole="button"
          style={{
            marginTop: 12,
            height: 44,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <GraduationCap size={16} color={isDark ? "#818CF8" : "#4F46E5"} strokeWidth={2} />
          <Text
            variant="label"
            style={{
              marginLeft: 6,
              color: isDark ? "#818CF8" : "#4F46E5",
            }}
          >
            Need to add a Course Lecture / Tutorial / Lab instead?
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
