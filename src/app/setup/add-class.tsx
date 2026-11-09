import React, { useState } from "react";
import { View, ScrollView, Pressable, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, ChevronDown, Clock, Calendar, Check, Repeat } from "lucide-react-native";
import { Text } from "@/components/ui/Text";
import { DatePickerModal, TimePickerModal } from "@/components/ui/DateTimePickerModal";
import { useTheme } from "@/theme";
import { useAuth } from "@/auth";
import { useTimetable, useCreateClassRules, type DayScheduleInput } from "@/hooks/useTimetable";
import { buildWeekStripForDate, formatShortDateLabel, getTodayIsoDate } from "@/lib/dateClock";

const CLASS_TYPES: { id: "lecture" | "tutorial" | "lab"; label: string }[] = [
  { id: "lecture", label: "Lecture" },
  { id: "tutorial", label: "Tutorial" },
  { id: "lab", label: "Lab" },
];

const WEEKDAYS: {
  weekday: number;
  label: string;
  fullName: string;
}[] = [
  { weekday: 1, label: "Mon", fullName: "Monday" },
  { weekday: 2, label: "Tue", fullName: "Tuesday" },
  { weekday: 3, label: "Wed", fullName: "Wednesday" },
  { weekday: 4, label: "Thu", fullName: "Thursday" },
  { weekday: 5, label: "Fri", fullName: "Friday" },
  { weekday: 6, label: "Sat", fullName: "Saturday" },
];

const DURATION_OPTIONS = [
  { label: "1 hr", minutes: 60 },
  { label: "1.5 hrs", minutes: 90 },
  { label: "2 hrs", minutes: 120 },
  { label: "3 hrs", minutes: 180 },
  { label: "4 hrs", minutes: 240 },
] as const;

interface DayConfig {
  startsText: string;
  starts24: string;
  endsText: string;
  ends24: string;
  durationMinutes: number;
  venue: string;
  repeatMode: "recurring" | "one-time";
  oneTimeDateText: string;
  oneTimeDateIso: string;
}

function computeEndFromStart(start24: string, durMins: number) {
  const [sh = 10, sm = 0] = start24.split(":").map(Number);
  const totalMins = (sh * 60 + sm + durMins) % (24 * 60);
  const eh24 = Math.floor(totalMins / 60);
  const em = totalMins % 60;
  const end24 = `${String(eh24).padStart(2, "0")}:${String(em).padStart(2, "0")}`;
  const period = eh24 >= 12 ? "pm" : "am";
  const eh12 = eh24 % 12 === 0 ? 12 : eh24 % 12;
  const endFormatted = `${eh12}:${String(em).padStart(2, "0")} ${period}`;
  return { end24, endFormatted };
}

function createInitialDayConfigs(): Record<number, DayConfig> {
  const todayIso = getTodayIsoDate();
  const weekStrip = buildWeekStripForDate(todayIso);
  const configs: Record<number, DayConfig> = {};
  for (const d of WEEKDAYS) {
    const stripDay = weekStrip[d.weekday - 1];
    const defaultIso = stripDay?.isoDate ?? todayIso;
    configs[d.weekday] = {
      startsText: "10:00 am",
      starts24: "10:00",
      endsText: "12:00 pm",
      ends24: "12:00",
      durationMinutes: 120,
      venue: "LT1, Faculty of Science",
      repeatMode: "recurring",
      oneTimeDateText: formatShortDateLabel(defaultIso),
      oneTimeDateIso: defaultIso,
    };
  }
  return configs;
}

export default function AddClassScreen() {
  const { courseId: paramCourseId, origin } = useLocalSearchParams<{
    courseId?: string;
    origin?: string;
  }>();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { hasCompletedOnboarding } = useAuth();
  const isSetupFlow = !hasCompletedOnboarding || origin === "setup";

  const { data } = useTimetable();
  const createClassRulesMutation = useCreateClassRules();

  const latestCourseId = data.courses[data.courses.length - 1]?.id ?? data.courses[0]?.id;
  const initialCourseId = paramCourseId ?? latestCourseId;
  const [selectedCourseId, setSelectedCourseId] = useState<string | undefined>(initialCourseId);
  const [lastParamAndLatestKey, setLastParamAndLatestKey] = useState(
    `${paramCourseId ?? ""}:${latestCourseId ?? ""}`,
  );
  const currentParamAndLatestKey = `${paramCourseId ?? ""}:${latestCourseId ?? ""}`;
  if (currentParamAndLatestKey !== lastParamAndLatestKey) {
    setLastParamAndLatestKey(currentParamAndLatestKey);
    const nextId = paramCourseId ?? latestCourseId;
    if (nextId) {
      setSelectedCourseId(nextId);
    }
  }
  const [courseListOpen, setCourseListOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<"lecture" | "tutorial" | "lab">("lecture");
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([1, 3]); // Mon and Wed per Screen 25
  const [dayConfigs, setDayConfigs] = useState<Record<number, DayConfig>>(createInitialDayConfigs);

  // Active picker target across per-day cards
  const [activeTimePicker, setActiveTimePicker] = useState<{
    weekday: number;
    field: "starts" | "ends";
  } | null>(null);
  const [activeDatePickerWeekday, setActiveDatePickerWeekday] = useState<number | null>(null);

  const currentCourse =
    data.courses.find((c) => c.id === (selectedCourseId ?? paramCourseId)) ??
    data.courses[data.courses.length - 1] ??
    data.courses[0];

  const updateDayConfig = (weekday: number, patch: Partial<DayConfig>) => {
    setDayConfigs((prev) => {
      const existing = prev[weekday] ?? createInitialDayConfigs()[weekday]!;
      return {
        ...prev,
        [weekday]: { ...existing, ...patch },
      };
    });
  };

  const toggleWeekday = (weekday: number) => {
    setSelectedWeekdays((prev) => {
      if (prev.includes(weekday)) {
        return prev.length > 1 ? prev.filter((d) => d !== weekday) : prev;
      }
      return [...prev, weekday].sort((a, b) => a - b);
    });
  };

  const handleCopyFirstDayToAll = () => {
    const firstWeekday = selectedWeekdays[0];
    if (!firstWeekday) return;
    const source = dayConfigs[firstWeekday];
    if (!source) return;

    setDayConfigs((prev) => {
      const next = { ...prev };
      for (const w of selectedWeekdays) {
        const current = next[w];
        if (current) {
          next[w] = {
            ...current,
            startsText: source.startsText,
            starts24: source.starts24,
            endsText: source.endsText,
            ends24: source.ends24,
            durationMinutes: source.durationMinutes,
            venue: source.venue,
          };
        }
      }
      return next;
    });
  };

  const selectedDayLabels = selectedWeekdays.map(
    (w) => WEEKDAYS.find((d) => d.weekday === w)?.label ?? "Mon",
  );
  const buttonDaysLabel =
    selectedDayLabels.length > 1
      ? `${selectedDayLabels.slice(0, -1).join(", ")} and ${selectedDayLabels[selectedDayLabels.length - 1]}`
      : (selectedDayLabels[0] ?? "Mon");

  const handleAddClass = (nextAction: "default" | "another" | "finish" = "default") => {
    if (!currentCourse) {
      router.push(`/setup/add-course${isSetupFlow ? "?origin=setup" : ""}` as any);
      return;
    }
    const courseId = currentCourse.id;
    const schedules: DayScheduleInput[] = selectedWeekdays.map((weekday) => {
      const cfg = dayConfigs[weekday] ?? createInitialDayConfigs()[weekday]!;
      return {
        weekday,
        startTime: cfg.starts24,
        endTime: cfg.ends24,
        venue: cfg.venue.trim() || "LT1, Faculty of Science",
        repeatMode: cfg.repeatMode,
        oneTimeDate: cfg.repeatMode === "one-time" ? cfg.oneTimeDateIso : undefined,
      };
    });

    const firstCfg = schedules[0];
    createClassRulesMutation.mutate(
      {
        courseId,
        classType: selectedType,
        weekdays: selectedWeekdays,
        startTime: firstCfg?.startTime ?? "10:00",
        endTime: firstCfg?.endTime ?? "12:00",
        venue: firstCfg?.venue ?? "LT1, Faculty of Science",
        schedules,
      },
      {
        onSuccess: () => {
          if (!isSetupFlow) {
            if (paramCourseId) {
              router.replace(`/course/${courseId}`);
            } else if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/(tabs)");
            }
            return;
          }

          if (nextAction === "another") {
            router.replace("/setup/courses");
          } else {
            router.push("/setup/complete");
          }
        },
      },
    );
  };

  const activeTimePickerValue =
    activeTimePicker !== null
      ? activeTimePicker.field === "starts"
        ? (dayConfigs[activeTimePicker.weekday]?.startsText ?? "10:00 am")
        : (dayConfigs[activeTimePicker.weekday]?.endsText ?? "12:00 pm")
      : "10:00 am";

  const activeDatePickerValue =
    activeDatePickerWeekday !== null
      ? (dayConfigs[activeDatePickerWeekday]?.oneTimeDateText ?? "Fri 6 Nov")
      : "Fri 6 Nov";

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }}
      edges={["top", "left", "right", "bottom"]}
    >
      <View style={{ flex: 1, justifyContent: "space-between" }}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              height: 48,
              marginBottom: 16,
            }}
          >
            <Pressable
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace(isSetupFlow ? "/setup/courses" : "/(tabs)/classes");
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
              Add class
            </Text>
          </View>

          {/* Course Picker */}
          <View style={{ marginBottom: 20 }}>
            <Text
              variant="label"
              style={{ color: isDark ? "#CBD5E1" : "#334155", marginBottom: 6 }}
            >
              Course
            </Text>
            <Pressable
              onPress={() => setCourseListOpen((prev) => !prev)}
              accessibilityRole="button"
              style={{
                height: 48,
                borderRadius: 12,
                borderWidth: courseListOpen ? 2 : 1,
                borderColor: courseListOpen ? "#4F46E5" : isDark ? "#334155" : "#CBD5E1",
                backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                paddingHorizontal: 14,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text
                variant="body-lg"
                style={{
                  color: isDark ? "#F8FAFC" : "#0F172A",
                  fontFamily: "Inter_400Regular",
                }}
              >
                {currentCourse
                  ? `${currentCourse.code} · ${currentCourse.title}`
                  : "Select or add a course"}
              </Text>
              <ChevronDown size={18} color={isDark ? "#94A3B8" : "#475569"} />
            </Pressable>

            {courseListOpen ? (
              <View
                style={{
                  marginTop: 8,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: isDark ? "#334155" : "#CBD5E1",
                  backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                  overflow: "hidden",
                }}
              >
                {data.courses.map((c) => {
                  const isActive = currentCourse?.id === c.id;
                  return (
                    <Pressable
                      key={c.id}
                      onPress={() => {
                        setSelectedCourseId(c.id);
                        setCourseListOpen(false);
                      }}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingHorizontal: 14,
                        paddingVertical: 12,
                        backgroundColor: isActive
                          ? isDark
                            ? "#312E81"
                            : "#EEF2FF"
                          : "transparent",
                      }}
                    >
                      <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                        <View
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: c.color,
                            marginRight: 8,
                          }}
                        />
                        <Text
                          variant="body"
                          style={{
                            color: isDark ? "#F8FAFC" : "#0F172A",
                            fontFamily: isActive ? "Inter_600SemiBold" : "Inter_400Regular",
                          }}
                        >
                          {c.code} · {c.title}
                        </Text>
                      </View>
                      {isActive ? <Check size={16} color={isDark ? "#818CF8" : "#4F46E5"} /> : null}
                    </Pressable>
                  );
                })}
              </View>
            ) : null}

            <Text variant="caption" style={{ color: isDark ? "#94A3B8" : "#475569", marginTop: 6 }}>
              From your registered courses
            </Text>
          </View>

          {/* Type Selector Pills */}
          <View style={{ marginBottom: 20 }}>
            <Text
              variant="label"
              style={{ color: isDark ? "#CBD5E1" : "#334155", marginBottom: 8 }}
            >
              Type
            </Text>
            <View style={{ flexDirection: "row", columnGap: 10 }}>
              {CLASS_TYPES.map((typeItem) => {
                const isSelected = selectedType === typeItem.id;
                return (
                  <Pressable
                    key={typeItem.id}
                    onPress={() => setSelectedType(typeItem.id)}
                    accessibilityRole="button"
                    style={{
                      height: 40,
                      paddingHorizontal: 18,
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: isSelected ? "#4F46E5" : isDark ? "#334155" : "#CBD5E1",
                      backgroundColor: isSelected
                        ? isDark
                          ? "#1E1B4B"
                          : "#EEF2FF"
                        : isDark
                          ? "#1E293B"
                          : "#FFFFFF",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      variant="label-lg"
                      style={{
                        color: isSelected
                          ? isDark
                            ? "#818CF8"
                            : "#4F46E5"
                          : isDark
                            ? "#CBD5E1"
                            : "#334155",
                        fontFamily: "Inter_500Medium",
                      }}
                    >
                      {typeItem.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Circular Days Selector */}
          <View style={{ marginBottom: 20 }}>
            <Text
              variant="label"
              style={{ color: isDark ? "#CBD5E1" : "#334155", marginBottom: 8 }}
            >
              Days (pick one or more)
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              {WEEKDAYS.map((day) => {
                const isSelected = selectedWeekdays.includes(day.weekday);
                return (
                  <Pressable
                    key={day.weekday}
                    onPress={() => toggleWeekday(day.weekday)}
                    accessibilityRole="button"
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      borderWidth: isSelected ? 0 : 1,
                      borderColor: isDark ? "#334155" : "#CBD5E1",
                      backgroundColor: isSelected ? "#4F46E5" : isDark ? "#1E293B" : "#FFFFFF",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      variant="label"
                      style={{
                        color: isSelected ? "#FFFFFF" : isDark ? "#CBD5E1" : "#0F172A",
                      }}
                    >
                      {day.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Per-Day Time & Recurrence Cards */}
          <View style={{ marginBottom: 20 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <Text variant="label" style={{ color: isDark ? "#CBD5E1" : "#334155" }}>
                Schedule per day ({selectedWeekdays.length})
              </Text>
              {selectedWeekdays.length > 1 ? (
                <Pressable onPress={handleCopyFirstDayToAll} accessibilityRole="button">
                  <Text
                    variant="caption"
                    style={{
                      color: isDark ? "#818CF8" : "#4F46E5",
                      fontFamily: "Inter_600SemiBold",
                    }}
                  >
                    Copy {WEEKDAYS.find((d) => d.weekday === selectedWeekdays[0])?.label} time to
                    all
                  </Text>
                </Pressable>
              ) : null}
            </View>

            <View style={{ rowGap: 14 }}>
              {selectedWeekdays.map((weekday) => {
                const dayMeta = WEEKDAYS.find((d) => d.weekday === weekday) ?? WEEKDAYS[0]!;
                const cfg = dayConfigs[weekday] ?? createInitialDayConfigs()[weekday]!;
                const isRecurring = cfg.repeatMode === "recurring";

                return (
                  <View
                    key={weekday}
                    style={{
                      backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: isDark ? "#334155" : "#E2E8F0",
                      padding: 14,
                    }}
                  >
                    {/* Card Header: Day Name + Recurring vs One-Time Segmented Toggle */}
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 12,
                      }}
                    >
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <View
                          style={{
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                            borderRadius: 8,
                            backgroundColor: isDark ? "#312E81" : "#EEF2FF",
                          }}
                        >
                          <Text variant="label" style={{ color: isDark ? "#818CF8" : "#4F46E5" }}>
                            {dayMeta.fullName}
                          </Text>
                        </View>
                      </View>

                      {/* Segmented Toggle: Semester (Recurring) vs One-time */}
                      <View
                        style={{
                          flexDirection: "row",
                          backgroundColor: isDark ? "#0F172A" : "#F1F5F9",
                          borderRadius: 10,
                          padding: 2,
                        }}
                      >
                        <Pressable
                          onPress={() => updateDayConfig(weekday, { repeatMode: "recurring" })}
                          accessibilityRole="button"
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 4,
                            paddingHorizontal: 10,
                            paddingVertical: 6,
                            borderRadius: 8,
                            backgroundColor: isRecurring
                              ? isDark
                                ? "#1E293B"
                                : "#FFFFFF"
                              : "transparent",
                          }}
                        >
                          <Repeat
                            size={12}
                            color={
                              isRecurring
                                ? isDark
                                  ? "#818CF8"
                                  : "#4F46E5"
                                : isDark
                                  ? "#94A3B8"
                                  : "#64748B"
                            }
                          />
                          <Text
                            variant="caption"
                            style={{
                              color: isRecurring
                                ? isDark
                                  ? "#F8FAFC"
                                  : "#0F172A"
                                : isDark
                                  ? "#94A3B8"
                                  : "#64748B",
                              fontFamily: isRecurring ? "Inter_600SemiBold" : "Inter_500Medium",
                            }}
                          >
                            Semester
                          </Text>
                        </Pressable>

                        <Pressable
                          onPress={() => updateDayConfig(weekday, { repeatMode: "one-time" })}
                          accessibilityRole="button"
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 4,
                            paddingHorizontal: 10,
                            paddingVertical: 6,
                            borderRadius: 8,
                            backgroundColor: !isRecurring
                              ? isDark
                                ? "#1E293B"
                                : "#FFFFFF"
                              : "transparent",
                          }}
                        >
                          <Calendar
                            size={12}
                            color={
                              !isRecurring
                                ? isDark
                                  ? "#818CF8"
                                  : "#4F46E5"
                                : isDark
                                  ? "#94A3B8"
                                  : "#64748B"
                            }
                          />
                          <Text
                            variant="caption"
                            style={{
                              color: !isRecurring
                                ? isDark
                                  ? "#F8FAFC"
                                  : "#0F172A"
                                : isDark
                                  ? "#94A3B8"
                                  : "#64748B",
                              fontFamily: !isRecurring ? "Inter_600SemiBold" : "Inter_500Medium",
                            }}
                          >
                            One-time
                          </Text>
                        </Pressable>
                      </View>
                    </View>

                    {/* If One-time is selected, show Date picker for this day */}
                    {!isRecurring ? (
                      <View style={{ marginBottom: 12 }}>
                        <Text
                          variant="caption"
                          style={{
                            color: isDark ? "#94A3B8" : "#475569",
                            marginBottom: 6,
                          }}
                        >
                          One-time date
                        </Text>
                        <Pressable
                          onPress={() => setActiveDatePickerWeekday(weekday)}
                          accessibilityRole="button"
                          style={{
                            height: 44,
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: isDark ? "#334155" : "#CBD5E1",
                            backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                            paddingHorizontal: 12,
                            flexDirection: "row",
                            alignItems: "center",
                          }}
                        >
                          <Calendar
                            size={16}
                            color={isDark ? "#818CF8" : "#4F46E5"}
                            strokeWidth={2}
                          />
                          <Text
                            variant="body"
                            style={{
                              marginLeft: 8,
                              color: isDark ? "#F8FAFC" : "#0F172A",
                              fontFamily: "Inter_500Medium",
                            }}
                          >
                            {cfg.oneTimeDateText}
                          </Text>
                        </Pressable>
                      </View>
                    ) : null}

                    {/* Starts & Ends 2-Column Row for this specific day */}
                    <View
                      style={{
                        flexDirection: "row",
                        columnGap: 10,
                        marginBottom: 10,
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          variant="caption"
                          style={{ color: isDark ? "#94A3B8" : "#475569", marginBottom: 4 }}
                        >
                          Starts
                        </Text>
                        <Pressable
                          onPress={() => setActiveTimePicker({ weekday, field: "starts" })}
                          accessibilityRole="button"
                          style={{
                            height: 44,
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: isDark ? "#334155" : "#CBD5E1",
                            backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                            paddingHorizontal: 10,
                            flexDirection: "row",
                            alignItems: "center",
                          }}
                        >
                          <Clock
                            size={16}
                            color={isDark ? "#94A3B8" : "#475569"}
                            strokeWidth={1.85}
                          />
                          <Text
                            variant="body"
                            style={{
                              flex: 1,
                              marginLeft: 8,
                              fontFamily: "Inter_500Medium",
                              color: isDark ? "#F8FAFC" : "#0F172A",
                            }}
                          >
                            {cfg.startsText}
                          </Text>
                        </Pressable>
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text
                          variant="caption"
                          style={{ color: isDark ? "#94A3B8" : "#475569", marginBottom: 4 }}
                        >
                          Ends
                        </Text>
                        <Pressable
                          onPress={() => setActiveTimePicker({ weekday, field: "ends" })}
                          accessibilityRole="button"
                          style={{
                            height: 44,
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: isDark ? "#334155" : "#CBD5E1",
                            backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                            paddingHorizontal: 10,
                            flexDirection: "row",
                            alignItems: "center",
                          }}
                        >
                          <Clock
                            size={16}
                            color={isDark ? "#94A3B8" : "#475569"}
                            strokeWidth={1.85}
                          />
                          <Text
                            variant="body"
                            style={{
                              flex: 1,
                              marginLeft: 8,
                              fontFamily: "Inter_500Medium",
                              color: isDark ? "#F8FAFC" : "#0F172A",
                            }}
                          >
                            {cfg.endsText}
                          </Text>
                        </Pressable>
                      </View>
                    </View>

                    {/* Quick Duration Pills for this day */}
                    <View style={{ flexDirection: "row", gap: 6, marginTop: 2 }}>
                      {DURATION_OPTIONS.map((opt) => {
                        const active = cfg.durationMinutes === opt.minutes;
                        return (
                          <Pressable
                            key={opt.minutes}
                            onPress={() => {
                              const { end24, endFormatted } = computeEndFromStart(
                                cfg.starts24,
                                opt.minutes,
                              );
                              updateDayConfig(weekday, {
                                durationMinutes: opt.minutes,
                                ends24: end24,
                                endsText: endFormatted,
                              });
                            }}
                            style={{
                              flex: 1,
                              height: 32,
                              borderRadius: 8,
                              borderWidth: 1,
                              borderColor: active ? "#4F46E5" : isDark ? "#334155" : "#E2E8F0",
                              backgroundColor: active
                                ? isDark
                                  ? "#312E81"
                                  : "#EEF2FF"
                                : "transparent",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Text
                              variant="caption"
                              style={{
                                fontSize: 12,
                                color: active
                                  ? isDark
                                    ? "#818CF8"
                                    : "#4F46E5"
                                  : isDark
                                    ? "#94A3B8"
                                    : "#64748B",
                                fontFamily: active ? "Inter_600SemiBold" : "Inter_400Regular",
                              }}
                            >
                              {opt.label}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>

                    {/* Per-day Venue Input */}
                    <View style={{ marginTop: 12 }}>
                      <Text
                        variant="caption"
                        style={{ color: isDark ? "#94A3B8" : "#475569", marginBottom: 4 }}
                      >
                        Venue for {dayMeta.fullName}
                      </Text>
                      <TextInput
                        value={cfg.venue}
                        onChangeText={(text) => updateDayConfig(weekday, { venue: text })}
                        placeholder="e.g. LT1, Faculty of Science"
                        placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                        style={{
                          height: 44,
                          borderRadius: 10,
                          borderWidth: 1,
                          borderColor: isDark ? "#334155" : "#CBD5E1",
                          backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                          paddingHorizontal: 12,
                          fontFamily: "Inter_400Regular",
                          fontSize: 14,
                          color: isDark ? "#F8FAFC" : "#0F172A",
                        }}
                      />
                    </View>

                    <Text
                      variant="caption"
                      style={{ color: isDark ? "#94A3B8" : "#64748B", marginTop: 8 }}
                    >
                      {isRecurring
                        ? `Repeats every ${dayMeta.fullName} until Fri 12 Feb · skips breaks`
                        : `Happens once on ${cfg.oneTimeDateText}`}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>

        {/* Bottom Primary CTA */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 16, rowGap: 10 }}>
          <Pressable
            onPress={() => handleAddClass("finish")}
            accessibilityRole="button"
            style={{
              height: 52,
              borderRadius: 12,
              backgroundColor: "#4F46E5",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text variant="label-lg" style={{ color: "#FFFFFF" }}>
              {!currentCourse
                ? "Create a course first"
                : isSetupFlow
                  ? `Save class on ${buttonDaysLabel} & finish`
                  : `Add class on ${buttonDaysLabel}`}
            </Text>
          </Pressable>

          {isSetupFlow && currentCourse ? (
            <Pressable
              onPress={() => handleAddClass("another")}
              accessibilityRole="button"
              style={{
                height: 46,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: isDark ? "#334155" : "#CBD5E1",
                backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text variant="label" style={{ color: isDark ? "#E2E8F0" : "#0F172A" }}>
                Save & schedule another course
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <TimePickerModal
        isOpen={activeTimePicker !== null}
        onClose={() => setActiveTimePicker(null)}
        value={activeTimePickerValue}
        title={
          activeTimePicker
            ? `${WEEKDAYS.find((d) => d.weekday === activeTimePicker.weekday)?.fullName ?? ""} · ${
                activeTimePicker.field === "starts" ? "Start time" : "End time"
              }`
            : "Pick time"
        }
        onSelect={(formatted, time24) => {
          if (!activeTimePicker) return;
          const { weekday, field } = activeTimePicker;
          const cfg = dayConfigs[weekday] ?? createInitialDayConfigs()[weekday]!;
          if (field === "starts") {
            const { end24, endFormatted } = computeEndFromStart(time24, cfg.durationMinutes);
            updateDayConfig(weekday, {
              startsText: formatted,
              starts24: time24,
              endsText: endFormatted,
              ends24: end24,
            });
          } else {
            updateDayConfig(weekday, {
              endsText: formatted,
              ends24: time24,
            });
          }
        }}
      />

      <DatePickerModal
        isOpen={activeDatePickerWeekday !== null}
        onClose={() => setActiveDatePickerWeekday(null)}
        value={activeDatePickerValue}
        title="Pick one-time class date"
        onSelect={(formatted, isoDate) => {
          if (activeDatePickerWeekday === null) return;
          updateDayConfig(activeDatePickerWeekday, {
            oneTimeDateText: formatted,
            oneTimeDateIso: isoDate,
          });
        }}
      />
    </SafeAreaView>
  );
}
