import React, { useMemo, useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Bell, Plus, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react-native";
import { Text } from "@/components/ui/Text";
import { StudentAvatar } from "@/components/ui/StudentAvatar";
import { ClerkAccountPopover } from "@/components/ui/ClerkAccountPopover";
import { TodayAssignmentCard } from "@/components/timetable";
import { HamburgerButton } from "@/components/navigation/AppSidebarShell";
import { useTimetable, useInAppNotifications } from "@/hooks/useTimetable";
import { useTheme } from "@/theme";
import { useAuth } from "@/auth";
import {
  addDaysIso,
  buildMonthGrid,
  formatLongDateHeading,
  formatMonthYearHeading,
  formatShortDateLabel,
  getTodayIsoDate,
  parseIsoDateParts,
  shiftYearMonth,
} from "@/lib/dateClock";

function formatDueMeta(
  dueIso: string,
  isDone: boolean,
  todayIso: string,
): {
  dueDateIso: string;
  dueText: string;
  dueTimeText: string;
  urgencyVariant: "danger" | "warning" | "info";
} {
  const dueDateIso = dueIso.slice(0, 10);
  const dayLabel = formatShortDateLabel(dueDateIso);

  if (isDone) {
    return {
      dueDateIso,
      dueText: "Submitted",
      dueTimeText: `Completed · Due ${dayLabel}`,
      urgencyVariant: "info",
    };
  }

  if (dueDateIso < todayIso) {
    const diffDays = Math.max(
      1,
      Math.round(
        (new Date(`${todayIso}T00:00:00Z`).getTime() -
          new Date(`${dueDateIso}T00:00:00Z`).getTime()) /
          86400000,
      ),
    );
    return {
      dueDateIso,
      dueText: `${diffDays} ${diffDays === 1 ? "day" : "days"} late`,
      dueTimeText: `Was due ${dayLabel}`,
      urgencyVariant: "danger",
    };
  }

  if (dueDateIso === todayIso) {
    return {
      dueDateIso,
      dueText: "Due today",
      dueTimeText: "Due today, 11:59 pm",
      urgencyVariant: "warning",
    };
  }

  const threeDaysOut = addDaysIso(todayIso, 3);
  if (dueDateIso <= threeDaysOut) {
    return {
      dueDateIso,
      dueText: `Due ${dayLabel.split(" ")[0] ?? "soon"}`,
      dueTimeText: `Due ${dayLabel}, 11:59 pm`,
      urgencyVariant: "warning",
    };
  }

  return {
    dueDateIso,
    dueText: `Due ${dayLabel}`,
    dueTimeText: `Due ${dayLabel}, 11:59 pm`,
    urgencyVariant: "info",
  };
}

export default function AssignmentsScreen() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { user } = useAuth();
  const { data } = useTimetable();
  const { unreadCount } = useInAppNotifications();
  const todayIso = getTodayIsoDate();
  const thisWeekEndIso = addDaysIso(todayIso, 6);
  const nextWeekStartIso = addDaysIso(todayIso, 7);
  const nextWeekEndIso = addDaysIso(todayIso, 13);

  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [filterChip, setFilterChip] = useState<"all" | "this-week" | "next-week" | "later">("all");
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(() => getTodayIsoDate());
  const [accountPopoverOpen, setAccountPopoverOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const parts = parseIsoDateParts(getTodayIsoDate());
    return { year: parts.year, monthIndex0: parts.monthIndex0 };
  });

  const monthWeeks = buildMonthGrid(visibleMonth.year, visibleMonth.monthIndex0);
  const monthHeading = formatMonthYearHeading(visibleMonth.year, visibleMonth.monthIndex0);

  const cardBg = isDark ? "#1E293B" : "#FFFFFF";
  const textPrimary = isDark ? "#F8FAFC" : "#0F172A";
  const textSecondary = isDark ? "#94A3B8" : "#475569";

  const enrichedAssignments = useMemo(() => {
    const courseMap = new Map<string, (typeof data.allCatalogCourses)[number]>();
    for (const c of data.allCatalogCourses) {
      courseMap.set(c.id, c);
    }

    return [...data.assignments]
      .sort((a, b) => a.dueAt.localeCompare(b.dueAt))
      .map((asg) => {
        const course = courseMap.get(asg.courseId);
        const progress = data.assignmentProgress?.[asg.id] ?? "not_started";
        const isDone = progress === "done";
        const dueMeta = formatDueMeta(asg.dueAt, isDone, todayIso);
        return {
          ...asg,
          courseCode: course?.code ?? "CSC 301",
          courseColor: course?.color ?? "#4F46E5",
          progress,
          isDone,
          ...dueMeta,
        };
      });
  }, [data.allCatalogCourses, data.assignmentProgress, data.assignments, todayIso]);

  const thisWeekItems = useMemo(
    () =>
      enrichedAssignments.filter(
        (a) => !a.isDone && a.dueDateIso >= todayIso && a.dueDateIso <= thisWeekEndIso,
      ),
    [enrichedAssignments, thisWeekEndIso, todayIso],
  );
  const nextWeekItems = useMemo(
    () =>
      enrichedAssignments.filter(
        (a) => !a.isDone && a.dueDateIso >= nextWeekStartIso && a.dueDateIso <= nextWeekEndIso,
      ),
    [enrichedAssignments, nextWeekEndIso, nextWeekStartIso],
  );
  const laterItems = useMemo(
    () => enrichedAssignments.filter((a) => !a.isDone && a.dueDateIso > nextWeekEndIso),
    [enrichedAssignments, nextWeekEndIso],
  );

  const missingItems = useMemo(
    () => enrichedAssignments.filter((a) => !a.isDone && a.dueDateIso < todayIso),
    [enrichedAssignments, todayIso],
  );

  const dueSoonItems = useMemo(() => {
    const activeUpcoming = enrichedAssignments.filter((a) => !a.isDone && a.dueDateIso >= todayIso);
    if (filterChip === "this-week") return thisWeekItems;
    if (filterChip === "next-week") return nextWeekItems;
    if (filterChip === "later") return laterItems;
    return activeUpcoming;
  }, [enrichedAssignments, filterChip, laterItems, nextWeekItems, thisWeekItems, todayIso]);

  const doneItems = useMemo(
    () => enrichedAssignments.filter((a) => a.isDone),
    [enrichedAssignments],
  );

  const datesWithAssignments = useMemo(() => {
    const set = new Set<string>();
    for (const asg of enrichedAssignments) {
      set.add(asg.dueDateIso);
    }
    return set;
  }, [enrichedAssignments]);

  const selectedDateAssignments = useMemo(
    () => enrichedAssignments.filter((a) => a.dueDateIso === selectedCalendarDate),
    [enrichedAssignments, selectedCalendarDate],
  );

  const activeSubTitle = useMemo(() => {
    if (data.activeSubscriptionFilter === "all") return null;
    if (data.activeSubscriptionFilter === "group-personal") return "Personal courses";
    const sub = data.followedSubscriptions.find((s) => s.id === data.activeSubscriptionFilter);
    return sub?.title ?? null;
  }, [data.activeSubscriptionFilter, data.followedSubscriptions]);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }}
      edges={["top", "left", "right"]}
    >
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 40, paddingBottom: 96 }}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
      >
        {/* Top Bar (Screens 50 & 51) */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", columnGap: 12, flex: 1 }}>
            <HamburgerButton />
            <View style={{ flex: 1 }}>
              <Text variant="title-page" style={{ color: textPrimary }}>
                Assignments
              </Text>
              <Text variant="body" style={{ color: textSecondary, marginTop: 2 }}>
                {activeSubTitle
                  ? `${activeSubTitle} · ${dueSoonItems.length} due`
                  : viewMode === "calendar"
                    ? monthHeading
                    : `${thisWeekItems.length} due this week · ${missingItems.length} missing`}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", columnGap: 16 }}>
            <Pressable
              accessibilityLabel="Notifications"
              accessibilityRole="button"
              onPress={() => router.push("/notifications")}
              hitSlop={8}
              style={{
                width: 28,
                height: 28,
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              <Bell size={22} color={textPrimary} strokeWidth={1.85} />
              {unreadCount > 0 ? (
                <View
                  style={{
                    position: "absolute",
                    top: 1,
                    right: 1,
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "#DC2626",
                  }}
                />
              ) : null}
            </Pressable>

            <Pressable
              accessibilityLabel="Account & session menu"
              accessibilityRole="button"
              onPress={() => setAccountPopoverOpen(true)}
            >
              <StudentAvatar
                avatarUrl={user.avatarUrl}
                initials={user.initials}
                size={44}
                borderWidth={2}
                borderColor={isDark ? "#312E81" : "#FFFFFF"}
              />
            </Pressable>
          </View>
        </View>

        {/* Segmented Control: List | Calendar */}
        <View
          style={{
            flexDirection: "row",
            backgroundColor: isDark ? "#1E293B" : "#F1F5F9",
            padding: 4,
            borderRadius: 12,
            marginBottom: 14,
          }}
        >
          {(["list", "calendar"] as const).map((tab) => {
            const active = viewMode === tab;
            return (
              <Pressable
                key={tab}
                onPress={() => setViewMode(tab)}
                style={{
                  flex: 1,
                  minHeight: 36,
                  borderRadius: 8,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: active ? (isDark ? "#334155" : "#FFFFFF") : "transparent",
                }}
              >
                <Text
                  variant="label"
                  style={{
                    fontFamily: active ? "Inter_600SemiBold" : "Inter_500Medium",
                    color: active ? textPrimary : textSecondary,
                  }}
                >
                  {tab === "list" ? "List" : "Calendar"}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {viewMode === "calendar" ? (
          /* Screen 51: Assignments · Interactive Calendar */
          <View>
            <View
              style={{
                backgroundColor: cardBg,
                borderRadius: 20,
                padding: 18,
                marginBottom: 24,
              }}
            >
              {/* Month header */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <Text variant="TT/H3" style={{ color: textPrimary, fontSize: 18 }}>
                  {monthHeading}
                </Text>
                <View style={{ flexDirection: "row", gap: 16 }}>
                  <Pressable
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel="Previous month"
                    onPress={() =>
                      setVisibleMonth((prev) => shiftYearMonth(prev.year, prev.monthIndex0, -1))
                    }
                  >
                    <ChevronLeft size={20} color={textPrimary} />
                  </Pressable>
                  <Pressable
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel="Next month"
                    onPress={() =>
                      setVisibleMonth((prev) => shiftYearMonth(prev.year, prev.monthIndex0, 1))
                    }
                  >
                    <ChevronRight size={20} color={textPrimary} />
                  </Pressable>
                </View>
              </View>

              {/* Weekday headers */}
              <View style={{ flexDirection: "row", marginBottom: 10 }}>
                {["M", "T", "W", "T", "F", "S", "S"].map((day, idx) => (
                  <View key={idx} style={{ flex: 1, alignItems: "center" }}>
                    <Text variant="TT/Caption" style={{ color: textSecondary }}>
                      {day}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Calendar weeks */}
              {monthWeeks.map((week, wIdx) => (
                <View
                  key={wIdx}
                  style={{
                    flexDirection: "row",
                    marginVertical: 4,
                  }}
                >
                  {week.map((cell) => {
                    const isSelected = cell.isoDate === selectedCalendarDate;
                    const isToday = cell.isoDate === todayIso;
                    const outside = Boolean(cell.outside);
                    const hasDot = datesWithAssignments.has(cell.isoDate);
                    return (
                      <Pressable
                        key={cell.isoDate}
                        accessibilityRole="button"
                        accessibilityLabel={`Select ${cell.isoDate}`}
                        onPress={() => setSelectedCalendarDate(cell.isoDate)}
                        style={{
                          flex: 1,
                          alignItems: "center",
                          justifyContent: "center",
                          height: 44,
                        }}
                      >
                        <View
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: isSelected ? "#4F46E5" : "transparent",
                            borderWidth: isToday && !isSelected ? 1.5 : 0,
                            borderColor: "#4F46E5",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Text
                            variant="TT/Subhead"
                            style={{
                              color: isSelected
                                ? "#FFFFFF"
                                : isToday
                                  ? "#4F46E5"
                                  : outside
                                    ? "#94A3B8"
                                    : textPrimary,
                              fontWeight: isSelected || isToday ? "700" : "500",
                            }}
                          >
                            {cell.day}
                          </Text>
                          {hasDot ? (
                            <View
                              style={{
                                width: 5,
                                height: 5,
                                borderRadius: 2.5,
                                backgroundColor: isSelected ? "#FFFFFF" : "#4F46E5",
                                marginTop: 2,
                              }}
                            />
                          ) : null}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </View>

            {/* Selected day assignments */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 14,
              }}
            >
              <Text variant="title-section" style={{ color: textPrimary }}>
                {formatLongDateHeading(selectedCalendarDate)}
              </Text>
              <Text variant="title-section" style={{ color: textSecondary }}>
                {selectedDateAssignments.length}
              </Text>
            </View>

            {selectedDateAssignments.length > 0 ? (
              <View style={{ rowGap: 12 }}>
                {selectedDateAssignments.map((asg) => (
                  <TodayAssignmentCard
                    key={asg.id}
                    courseCode={asg.courseCode}
                    courseColor={asg.courseColor}
                    assignmentType={asg.type === "group" ? "Group" : "Solo"}
                    title={asg.title}
                    dueText={asg.dueText}
                    dueTimeText={asg.dueTimeText}
                    groupMeta={asg.type === "group" ? "Group 4 · 6 of 6 members" : undefined}
                    urgencyVariant={asg.urgencyVariant}
                    onPress={() => router.push(`/assignment/${asg.id}`)}
                  />
                ))}
              </View>
            ) : (
              <View
                style={{
                  backgroundColor: cardBg,
                  borderRadius: 16,
                  padding: 20,
                  borderWidth: 1,
                  borderColor: isDark ? "#334155" : "#E2E8F0",
                  alignItems: "center",
                }}
              >
                <Text variant="label" style={{ color: textPrimary, marginBottom: 4 }}>
                  No assignments due on this day
                </Text>
                <Text
                  variant="caption"
                  style={{ color: textSecondary, textAlign: "center", marginBottom: 14 }}
                >
                  Tap another date with a dot or add a new assignment.
                </Text>
                <Pressable
                  onPress={() => router.push("/assignment/add")}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 10,
                    backgroundColor: isDark ? "#1E1B4B" : "#EEF2FF",
                  }}
                >
                  <Text
                    variant="label"
                    style={{
                      color: isDark ? "#818CF8" : "#4F46E5",
                      fontFamily: "Inter_600SemiBold",
                    }}
                  >
                    + Add assignment
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        ) : (
          /* Screen 50: Assignments List */
          <View>
            {/* Filter Chips: All | This week | Next week | Later */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                flexDirection: "row",
                alignItems: "center",
                columnGap: 8,
                marginBottom: 20,
              }}
            >
              {[
                {
                  id: "all" as const,
                  label: "All upcoming",
                  count: thisWeekItems.length + nextWeekItems.length + laterItems.length,
                },
                { id: "this-week" as const, label: "This week", count: thisWeekItems.length },
                { id: "next-week" as const, label: "Next week", count: nextWeekItems.length },
                { id: "later" as const, label: "Later", count: laterItems.length },
              ].map((chip) => {
                const active = filterChip === chip.id;
                return (
                  <Pressable
                    key={chip.id}
                    onPress={() => setFilterChip(chip.id)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: 9999,
                      backgroundColor: active
                        ? isDark
                          ? "#1E1B4B"
                          : "#EEF2FF"
                        : isDark
                          ? "#1E293B"
                          : "#FFFFFF",
                      borderWidth: 1,
                      borderColor: active ? "#4F46E5" : isDark ? "#334155" : "#E2E8F0",
                    }}
                  >
                    <Text
                      variant="label"
                      style={{
                        color: active ? (isDark ? "#818CF8" : "#4F46E5") : textPrimary,
                      }}
                    >
                      {chip.label}
                    </Text>
                    <Text
                      variant="label-sm"
                      style={{
                        marginLeft: 6,
                        color: active ? (isDark ? "#818CF8" : "#4F46E5") : textSecondary,
                      }}
                    >
                      {chip.count}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Section 1: Missing */}
            {missingItems.length > 0 ? (
              <View style={{ marginBottom: 24 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <Text variant="title-section" style={{ color: textPrimary }}>
                    Missing
                  </Text>
                  <Text
                    variant="title-section"
                    style={{
                      color: textSecondary,
                      marginLeft: 8,
                      fontVariant: ["tabular-nums"],
                    }}
                  >
                    {missingItems.length}
                  </Text>
                </View>

                <View style={{ rowGap: 12 }}>
                  {missingItems.map((asg) => (
                    <TodayAssignmentCard
                      key={asg.id}
                      courseCode={asg.courseCode}
                      courseColor={asg.courseColor}
                      assignmentType={asg.type === "group" ? "Group" : "Solo"}
                      title={asg.title}
                      dueText={asg.dueText}
                      dueTimeText={asg.dueTimeText}
                      urgencyVariant="danger"
                      onPress={() => router.push(`/assignment/${asg.id}`)}
                    />
                  ))}
                </View>
              </View>
            ) : null}

            {/* Section 2: Due soon */}
            <View style={{ marginBottom: 24 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <Text variant="title-section" style={{ color: textPrimary }}>
                  Due soon
                </Text>
                <Text
                  variant="title-section"
                  style={{
                    color: textSecondary,
                    marginLeft: 8,
                    fontVariant: ["tabular-nums"],
                  }}
                >
                  {dueSoonItems.length}
                </Text>
              </View>

              {dueSoonItems.length > 0 ? (
                <View style={{ rowGap: 12 }}>
                  {dueSoonItems.map((asg) => (
                    <TodayAssignmentCard
                      key={asg.id}
                      courseCode={asg.courseCode}
                      courseColor={asg.courseColor}
                      assignmentType={asg.type === "group" ? "Group" : "Solo"}
                      title={asg.title}
                      dueText={asg.dueText}
                      dueTimeText={asg.dueTimeText}
                      groupMeta={asg.type === "group" ? "Group 4 · 6 of 6 members" : undefined}
                      urgencyVariant={asg.urgencyVariant}
                      onPress={() => router.push(`/assignment/${asg.id}`)}
                    />
                  ))}
                </View>
              ) : (
                <View
                  style={{
                    backgroundColor: cardBg,
                    borderRadius: 16,
                    padding: 20,
                    borderWidth: 1,
                    borderColor: isDark ? "#334155" : "#E2E8F0",
                  }}
                >
                  <Text variant="label" style={{ color: textPrimary }}>
                    No assignments in this window
                  </Text>
                  <Text variant="caption" style={{ color: textSecondary, marginTop: 4 }}>
                    Switch the time chip above or tap + to add an assignment.
                  </Text>
                </View>
              )}
            </View>

            {/* Section 3: Done */}
            {doneItems.length > 0 ? (
              <View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <CheckCircle2 size={18} color="#16A34A" style={{ marginRight: 6 }} />
                  <Text variant="title-section" style={{ color: textPrimary }}>
                    Done
                  </Text>
                  <Text
                    variant="title-section"
                    style={{
                      color: textSecondary,
                      marginLeft: 8,
                      fontVariant: ["tabular-nums"],
                    }}
                  >
                    {doneItems.length}
                  </Text>
                </View>

                <View style={{ rowGap: 12 }}>
                  {doneItems.map((asg) => (
                    <TodayAssignmentCard
                      key={asg.id}
                      courseCode={asg.courseCode}
                      courseColor={asg.courseColor}
                      assignmentType={asg.type === "group" ? "Group" : "Solo"}
                      title={asg.title}
                      dueText="Done"
                      dueTimeText={asg.dueTimeText}
                      urgencyVariant="info"
                      onPress={() => router.push(`/assignment/${asg.id}`)}
                    />
                  ))}
                </View>
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button (56x56) */}
      <Pressable
        accessibilityLabel="Add assignment"
        accessibilityRole="button"
        onPress={() => router.push("/assignment/add")}
        style={{
          position: "absolute",
          right: 16,
          bottom: 16,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: "#4F46E5",
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#0F172A",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.18,
          shadowRadius: 12,
          elevation: 5,
        }}
      >
        <Plus size={24} color="#FFFFFF" strokeWidth={2.2} />
      </Pressable>

      <ClerkAccountPopover
        visible={accountPopoverOpen}
        onClose={() => setAccountPopoverOpen(false)}
      />
    </SafeAreaView>
  );
}
