import React, { useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Bell, List, Calendar, MapPin } from "lucide-react-native";
import { Text } from "@/components/ui/Text";
import { StudentAvatar } from "@/components/ui/StudentAvatar";
import { ClerkAccountPopover } from "@/components/ui/ClerkAccountPopover";
import {
  TodayHeroCard,
  ClassCard,
  TodayAssignmentCard,
  CalendarFilterBar,
  QuickAddSheet,
} from "@/components/timetable";
import { HamburgerButton } from "@/components/navigation/AppSidebarShell";
import { useTheme } from "@/theme";
import { useAuth } from "@/auth";
import { useTimetable, useInAppNotifications, type EnrichedClassItem } from "@/hooks/useTimetable";
import { useLiveClassProgress } from "@/hooks/useLiveClassProgress";
import {
  addDaysIso,
  buildWeekStripForDate,
  formatLongDateHeading,
  formatShortDateLabel,
  getTodayIsoDate,
} from "@/lib/dateClock";

const CALENDAR_START_HOUR = 7; // 7:00 am
const CALENDAR_END_HOUR = 21; // 9:00 pm
const HOUR_HEIGHT = 84; // 84px per hour so 1hr = 84px, 1.75hr = 147px, 2hr = 168px

function parseMinutes(hhmm: string): number {
  const [h = 8, m = 0] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function formatHourLabel(hour24: number): string {
  const period = hour24 >= 12 ? "pm" : "am";
  const h12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${h12}:00 ${period}`;
}

interface PositionedCalendarItem {
  item: EnrichedClassItem;
  top: number;
  height: number;
  colIndex: number;
  totalCols: number;
}

function layoutCalendarItems(items: EnrichedClassItem[]): PositionedCalendarItem[] {
  const sorted = [...items].sort((a, b) => parseMinutes(a.startTime) - parseMinutes(b.startTime));

  // Assign columns for overlapping classes so every class block shows at its exact duration
  const columns: { endMins: number; item: EnrichedClassItem }[][] = [];
  const itemColMap = new Map<string, number>();

  for (const item of sorted) {
    const startMins = parseMinutes(item.startTime);
    const endMins = Math.max(startMins + 30, parseMinutes(item.endTime));
    let placedCol = -1;

    for (let c = 0; c < columns.length; c++) {
      const col = columns[c]!;
      const lastInCol = col[col.length - 1];
      if (!lastInCol || lastInCol.endMins <= startMins) {
        col.push({ endMins, item });
        placedCol = c;
        break;
      }
    }

    if (placedCol === -1) {
      placedCol = columns.length;
      columns.push([{ endMins, item }]);
    }
    itemColMap.set(item.id, placedCol);
  }

  return sorted.map((item) => {
    const startMins = parseMinutes(item.startTime);
    const endMins = Math.max(startMins + 30, parseMinutes(item.endTime));
    const durationMins = endMins - startMins;

    const overlapping = sorted.filter((other) => {
      const oStart = parseMinutes(other.startTime);
      const oEnd = Math.max(oStart + 30, parseMinutes(other.endTime));
      return oStart < endMins && oEnd > startMins;
    });
    const maxColInOverlap = Math.max(0, ...overlapping.map((o) => itemColMap.get(o.id) ?? 0));
    const totalCols = maxColInOverlap + 1;
    const colIndex = itemColMap.get(item.id) ?? 0;

    const offsetMins = Math.max(0, startMins - CALENDAR_START_HOUR * 60);
    const top = (offsetMins / 60) * HOUR_HEIGHT;
    const height = Math.max(44, (durationMins / 60) * HOUR_HEIGHT);

    return {
      item,
      top,
      height,
      colIndex,
      totalCols,
    };
  });
}

function CalendarBlockBody({
  item,
  isDark,
  mutedCurtain,
}: {
  item: EnrichedClassItem;
  isDark: boolean;
  mutedCurtain: boolean;
}) {
  const stripeColor = mutedCurtain ? (isDark ? "#475569" : "#CBD5E1") : item.courseColor;
  const primaryColor = mutedCurtain
    ? isDark
      ? "#64748B"
      : "#94A3B8"
    : isDark
      ? "#F8FAFC"
      : "#0F172A";
  const titleColor = mutedCurtain
    ? isDark
      ? "#64748B"
      : "#94A3B8"
    : isDark
      ? "#E2E8F0"
      : "#1E293B";
  const venueColor = mutedCurtain
    ? isDark
      ? "#475569"
      : "#CBD5E1"
    : isDark
      ? "#94A3B8"
      : "#64748B";
  const pillBg = mutedCurtain ? (isDark ? "#1E293B" : "#E2E8F0") : isDark ? "#1E293B" : "#E2E8F0";

  return (
    <View style={{ flex: 1, flexDirection: "row" }}>
      {/* 4px Course Color Stripe */}
      <View
        style={{
          width: 4,
          alignSelf: "stretch",
          backgroundColor: stripeColor,
        }}
      />

      <View
        style={{
          flex: 1,
          paddingHorizontal: 10,
          paddingVertical: 8,
          rowGap: 4,
        }}
      >
        {/* 1. Time */}
        <Text
          variant="time"
          numberOfLines={1}
          style={{
            fontSize: 13,
            lineHeight: 17,
            fontFamily: "Inter_700Bold",
            fontVariant: ["tabular-nums"],
            color: primaryColor,
          }}
        >
          {item.displayTime}
        </Text>

        {/* 2. Course Pill + Course Title */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            columnGap: 6,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: pillBg,
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 5,
            }}
          >
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: stripeColor,
                marginRight: 4,
              }}
            />
            <Text
              variant="label-sm"
              style={{
                fontSize: 11,
                lineHeight: 14,
                fontFamily: "Inter_600SemiBold",
                color: primaryColor,
              }}
            >
              {item.courseCode}
            </Text>
          </View>

          <Text
            variant="caption"
            numberOfLines={1}
            style={{
              flex: 1,
              fontSize: 12,
              lineHeight: 16,
              fontFamily: "Inter_500Medium",
              color: titleColor,
            }}
          >
            {item.courseTitle}
          </Text>
        </View>

        {/* 3. Venue */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <MapPin size={12} color={venueColor} strokeWidth={1.85} />
          <Text
            variant="caption"
            numberOfLines={1}
            style={{
              marginLeft: 4,
              flex: 1,
              fontSize: 11,
              lineHeight: 15,
              color: venueColor,
            }}
          >
            {item.venue}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function TodayScreen() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { user } = useAuth();

  const [viewMode, setViewMode] = useState<"cards" | "calendar">("cards");
  const [accountPopoverOpen, setAccountPopoverOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  const { data, getOccurrencesForDate } = useTimetable();
  const { unreadCount } = useInAppNotifications();
  const todayIso = getTodayIsoDate();
  const [selectedDateIso, setSelectedDateIso] = useState<string>(todayIso);
  const activeDateIso = selectedDateIso || todayIso;
  const isViewingToday = activeDateIso === todayIso;
  const tomorrowIso = addDaysIso(todayIso, 1);
  const dueWindowEndIso = addDaysIso(todayIso, 4);
  const todayHeading = formatLongDateHeading(activeDateIso);
  const weekStrip = buildWeekStripForDate(todayIso);

  // Authoritative list of items for the active day — identical across Card view and Calendar day view
  const todayOccurrences = getOccurrencesForDate(activeDateIso);

  // Collect all occurrences across this week so if today has no classes, we still surface the week's scheduled classes
  const weekScheduleGroups = weekStrip
    .map((day) => ({
      day,
      items: getOccurrencesForDate(day.isoDate),
    }))
    .filter((entry) => entry.items.length > 0);

  // Live second-by-second ongoing class tracker
  const {
    ongoingClass: heroClass,
    progressRatio,
    currentTimeLabel,
    elapsedLabel,
    remainingLabel,
  } = useLiveClassProgress();

  const pct = Math.min(100, Math.max(0, progressRatio * 100));

  const showHeroCard =
    isViewingToday &&
    data.activeCalendarFilter !== "assignments" &&
    todayOccurrences.some((c) => c.id === heroClass?.id);

  // 2. Other items for today in Card view (exact complement of heroClass in todayOccurrences)
  const restOfToday = todayOccurrences.filter((c) => !showHeroCard || c.id !== heroClass?.id);

  // Calendar day view renders the exact same todayOccurrences list positioned by start time & duration
  const positionedCalendarItems = layoutCalendarItems(todayOccurrences);
  const calendarHours = Array.from(
    { length: CALENDAR_END_HOUR - CALENDAR_START_HOUR + 1 },
    (_, i) => CALENDAR_START_HOUR + i,
  );

  const showAssignmentsSection =
    data.activeCalendarFilter === "all" || data.activeCalendarFilter === "assignments";
  const dueAssignments = data.assignments.filter(
    (asg) =>
      asg.dueAt.slice(0, 10) >= todayIso &&
      asg.dueAt.slice(0, 10) <= dueWindowEndIso &&
      data.assignmentProgress?.[asg.id] !== "done",
  );
  const dueAssignmentsCount = dueAssignments.length;

  const activeSubObj = data.followedSubscriptions.find(
    (s) => s.id === data.activeSubscriptionFilter,
  );
  const subtitleFilterLabel =
    data.activeSubscriptionFilter === "group-personal"
      ? "Others (Gym, Church, Club)"
      : activeSubObj
        ? activeSubObj.title
        : data.activeCalendarFilter === "all"
          ? "All calendars"
          : `All · ${data.activeCalendarFilter.charAt(0).toUpperCase() + data.activeCalendarFilter.slice(1)}`;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }}
      edges={["top", "left", "right"]}
    >
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 40, paddingBottom: 28 }}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
      >
        {/* Top Bar (hamburger + title + date on left, bell + 44px avatar on right) */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", columnGap: 12, flex: 1 }}>
            <HamburgerButton />
            <View style={{ flex: 1 }}>
              <Text variant="title-page" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                Today
              </Text>
              <Text
                variant="body"
                numberOfLines={1}
                style={{ color: isDark ? "#94A3B8" : "#475569", marginTop: 2 }}
              >
                {todayHeading} · {subtitleFilterLabel}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", columnGap: 16 }}>
            {/* Notification Bell with 8px Red Dot */}
            <Pressable
              onPress={() => router.push("/notifications" as any)}
              accessibilityLabel="Notifications"
              accessibilityRole="button"
              hitSlop={8}
              style={{
                width: 28,
                height: 28,
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              <Bell size={22} color={isDark ? "#F8FAFC" : "#0F172A"} strokeWidth={1.85} />
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

            {/* 44x44 Student Avatar with 2px white ring -> Opens Clerk Account & Logout Popover */}
            <Pressable
              onPress={() => setAccountPopoverOpen(true)}
              accessibilityRole="button"
              accessibilityLabel="Account and session menu"
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

        {/* View Mode Toggle: Card / List View vs Calendar Day View */}
        <View
          style={{
            flexDirection: "row",
            backgroundColor: isDark ? "#1E293B" : "#E2E8F0",
            borderRadius: 12,
            padding: 3,
            marginBottom: 16,
          }}
        >
          <Pressable
            onPress={() => setViewMode("cards")}
            accessibilityRole="button"
            accessibilityLabel="Card view"
            style={{
              flex: 1,
              height: 36,
              borderRadius: 9,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              backgroundColor:
                viewMode === "cards" ? (isDark ? "#0F172A" : "#FFFFFF") : "transparent",
            }}
          >
            <List
              size={16}
              color={
                viewMode === "cards"
                  ? isDark
                    ? "#818CF8"
                    : "#4F46E5"
                  : isDark
                    ? "#94A3B8"
                    : "#475569"
              }
              strokeWidth={2}
            />
            <Text
              variant="label"
              style={{
                color:
                  viewMode === "cards"
                    ? isDark
                      ? "#F8FAFC"
                      : "#0F172A"
                    : isDark
                      ? "#94A3B8"
                      : "#475569",
                fontFamily: viewMode === "cards" ? "Inter_600SemiBold" : "Inter_500Medium",
              }}
            >
              Card view
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setViewMode("calendar")}
            accessibilityRole="button"
            accessibilityLabel="Calendar day view"
            style={{
              flex: 1,
              height: 36,
              borderRadius: 9,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              backgroundColor:
                viewMode === "calendar" ? (isDark ? "#0F172A" : "#FFFFFF") : "transparent",
            }}
          >
            <Calendar
              size={16}
              color={
                viewMode === "calendar"
                  ? isDark
                    ? "#818CF8"
                    : "#4F46E5"
                  : isDark
                    ? "#94A3B8"
                    : "#475569"
              }
              strokeWidth={2}
            />
            <Text
              variant="label"
              style={{
                color:
                  viewMode === "calendar"
                    ? isDark
                      ? "#F8FAFC"
                      : "#0F172A"
                    : isDark
                      ? "#94A3B8"
                      : "#475569",
                fontFamily: viewMode === "calendar" ? "Inter_600SemiBold" : "Inter_500Medium",
              }}
            >
              Calendar day
            </Text>
          </Pressable>
        </View>

        {/* Inline Calendar Category Filter Chips + Quick Add Button */}
        <CalendarFilterBar onOpenQuickAdd={() => setQuickAddOpen(true)} />

        {/* Interactive Week Strip on Today so students see & tap Mon/Wed classes immediately */}
        {data.courses.length > 0 || data.followedSubscriptions.length > 0 ? (
          <View style={{ marginBottom: 16 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                columnGap: 6,
              }}
            >
              {weekStrip.map((day) => {
                const isSelected = day.isoDate === activeDateIso;
                const isTodayChip = day.isoDate === todayIso;
                const dayItems = getOccurrencesForDate(day.isoDate);
                const dotColors = Array.from(new Set(dayItems.map((it) => it.courseColor))).slice(
                  0,
                  3,
                );

                return (
                  <Pressable
                    key={day.isoDate}
                    onPress={() => setSelectedDateIso(day.isoDate)}
                    accessibilityRole="button"
                    accessibilityLabel={`${day.label} ${day.dayNum}${dayItems.length > 0 ? `, ${dayItems.length} classes` : ""}`}
                    style={{
                      flex: 1,
                      paddingVertical: 8,
                      borderRadius: 12,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: isSelected ? "#4F46E5" : isDark ? "#1E293B" : "#FFFFFF",
                      borderWidth: 1,
                      borderColor: isSelected
                        ? "#4F46E5"
                        : isTodayChip
                          ? isDark
                            ? "#818CF8"
                            : "#6366F1"
                          : isDark
                            ? "#334155"
                            : "#E2E8F0",
                    }}
                  >
                    <Text
                      variant="caption"
                      style={{
                        fontSize: 11,
                        color: isSelected ? "#E0E7FF" : isDark ? "#94A3B8" : "#64748B",
                        fontFamily:
                          isSelected || isTodayChip ? "Inter_600SemiBold" : "Inter_500Medium",
                      }}
                    >
                      {day.label}
                    </Text>
                    <Text
                      variant="label"
                      style={{
                        marginTop: 2,
                        fontVariant: ["tabular-nums"],
                        color: isSelected ? "#FFFFFF" : isDark ? "#F8FAFC" : "#0F172A",
                        fontFamily: "Inter_700Bold",
                      }}
                    >
                      {day.dayNum}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        columnGap: 3,
                        height: 6,
                        marginTop: 4,
                        alignItems: "center",
                      }}
                    >
                      {dotColors.map((color, idx) => (
                        <View
                          key={`${day.isoDate}-dot-${idx}`}
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: 2.5,
                            backgroundColor: isSelected ? "#FFFFFF" : color,
                          }}
                        />
                      ))}
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {!isViewingToday ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: 8,
                }}
              >
                <Text variant="caption" style={{ color: isDark ? "#94A3B8" : "#475569" }}>
                  Viewing {formatLongDateHeading(activeDateIso)}
                </Text>
                <Pressable
                  onPress={() => setSelectedDateIso(todayIso)}
                  accessibilityRole="button"
                  hitSlop={8}
                >
                  <Text
                    variant="caption"
                    style={{
                      color: isDark ? "#818CF8" : "#4F46E5",
                      fontFamily: "Inter_600SemiBold",
                    }}
                  >
                    Back to today
                  </Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        ) : null}

        {viewMode === "cards" ? (
          <>
            {/* 1. Ongoing Class Hero Card with Live Second-by-Second Moving Curtain Bar */}
            {showHeroCard ? (
              <TodayHeroCard
                courseCode={heroClass?.courseCode ?? "CSC 301"}
                courseTitle={
                  heroClass?.courseTitle.replace(/\s*·\s*(Lecture|Tutorial|Lab)$/i, "") ??
                  "Operating Systems"
                }
                courseColor={heroClass?.courseColor ?? "#2563EB"}
                time={heroClass?.displayTime ?? "10:00 – 12:00"}
                venue={heroClass?.venue ?? "LT1, Faculty of Science"}
                currentTimeLabel={currentTimeLabel}
                isOngoing={true}
                progressRatio={progressRatio}
                elapsedLabel={elapsedLabel}
                remainingLabel={remainingLabel}
                countdown={remainingLabel}
                typeAndFaculty={`${heroClass?.classType ?? "Lecture"} · ${heroClass?.faculty ?? "Faculty of Science"}${heroClass?.lecturerName ? ` · ${heroClass.lecturerName}` : " · Dr. E. Okoro"}`}
                onPress={() => router.push(`/class/${heroClass?.id ?? "occ-fri-csc301-10"}`)}
                style={{ marginBottom: 22 }}
              />
            ) : null}

            {/* 2. Rest of Today Section (Smaller cards with Time -> Course [Pill + Title] -> Venue) */}
            {restOfToday.length > 0 ? (
              <View style={{ marginBottom: 22 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 10,
                  }}
                >
                  <Text variant="title-section" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                    {!isViewingToday
                      ? `${formatShortDateLabel(activeDateIso)} schedule`
                      : data.activeCalendarFilter === "all"
                        ? "Today's schedule"
                        : `Today's ${data.activeCalendarFilter}`}
                  </Text>
                  <Text
                    variant="title-section"
                    style={{
                      color: isDark ? "#94A3B8" : "#475569",
                      marginLeft: 8,
                      fontVariant: ["tabular-nums"],
                    }}
                  >
                    {restOfToday.length}
                  </Text>
                </View>

                <View style={{ rowGap: 10 }}>
                  {restOfToday.map((item) => (
                    <ClassCard
                      key={item.id}
                      courseCode={item.courseCode}
                      courseTitle={item.courseTitle}
                      courseColor={item.courseColor}
                      time={item.displayTime}
                      venue={item.venue}
                      attended={item.attended}
                      moved={item.moved}
                      isPast={item.isPast}
                      sourceAttribution={item.sourceAttribution}
                      onPress={() =>
                        item.calendarKind === "assignments"
                          ? router.push(`/assignment/${item.id}`)
                          : router.push(`/class/${item.id}`)
                      }
                    />
                  ))}
                </View>
              </View>
            ) : !showHeroCard ? (
              data.courses.length === 0 && data.followedSubscriptions.length === 0 ? (
                <View
                  style={{
                    backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: isDark ? "#334155" : "#E2E8F0",
                    padding: 20,
                    marginBottom: 22,
                    rowGap: 14,
                  }}
                >
                  <View style={{ rowGap: 6 }}>
                    <Text variant="title-section" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                      Your timetable is empty
                    </Text>
                    <Text variant="body" style={{ color: isDark ? "#94A3B8" : "#475569" }}>
                      Join a shared class with a code or QR from your course rep, or set up your own
                      semester courses.
                    </Text>
                  </View>

                  <View style={{ flexDirection: "row", columnGap: 10 }}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => router.push("/join/scan")}
                      style={({ pressed }) => ({
                        flex: 1,
                        minHeight: 44,
                        borderRadius: 10,
                        backgroundColor: pressed ? "#4338CA" : "#4F46E5",
                        alignItems: "center",
                        justifyContent: "center",
                        paddingHorizontal: 14,
                      })}
                    >
                      <Text
                        variant="label"
                        style={{ color: "#FFFFFF", fontFamily: "Inter_600SemiBold" }}
                      >
                        Join a class
                      </Text>
                    </Pressable>

                    <Pressable
                      accessibilityRole="button"
                      onPress={() => router.push("/setup/semester")}
                      style={({ pressed }) => ({
                        flex: 1,
                        minHeight: 44,
                        borderRadius: 10,
                        backgroundColor: pressed
                          ? isDark
                            ? "#334155"
                            : "#F1F5F9"
                          : isDark
                            ? "#0F172A"
                            : "#F8FAFC",
                        borderWidth: 1,
                        borderColor: isDark ? "#334155" : "#CBD5E1",
                        alignItems: "center",
                        justifyContent: "center",
                        paddingHorizontal: 14,
                      })}
                    >
                      <Text
                        variant="label"
                        style={{
                          color: isDark ? "#E2E8F0" : "#0F172A",
                          fontFamily: "Inter_600SemiBold",
                        }}
                      >
                        Create timetable
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <View style={{ marginBottom: 22, rowGap: 16 }}>
                  <View
                    style={{
                      backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: isDark ? "#334155" : "#E2E8F0",
                      padding: 20,
                      alignItems: "center",
                      rowGap: 6,
                    }}
                  >
                    <Text variant="title-card" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                      {isViewingToday
                        ? "Nothing on today. Enjoy it."
                        : `No classes on ${formatShortDateLabel(activeDateIso)}.`}
                    </Text>
                    <Text
                      variant="caption"
                      style={{ color: isDark ? "#94A3B8" : "#475569", textAlign: "center" }}
                    >
                      Tap another day on the week strip above or check your scheduled classes for
                      this week below.
                    </Text>
                  </View>

                  {weekScheduleGroups.length > 0 ? (
                    <View style={{ rowGap: 12 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text
                          variant="title-section"
                          style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}
                        >
                          Scheduled this week
                        </Text>
                        <Pressable
                          onPress={() => router.push("/(tabs)/classes")}
                          accessibilityRole="button"
                          hitSlop={8}
                        >
                          <Text variant="label" style={{ color: isDark ? "#818CF8" : "#4338CA" }}>
                            Full timetable
                          </Text>
                        </Pressable>
                      </View>

                      {weekScheduleGroups.map(({ day, items }) => (
                        <View key={day.isoDate} style={{ rowGap: 8 }}>
                          <Pressable
                            onPress={() => setSelectedDateIso(day.isoDate)}
                            accessibilityRole="button"
                            style={{ flexDirection: "row", alignItems: "center", columnGap: 6 }}
                          >
                            <Text
                              variant="label"
                              style={{
                                color: isDark ? "#CBD5E1" : "#334155",
                                fontFamily: "Inter_600SemiBold",
                              }}
                            >
                              {formatLongDateHeading(day.isoDate)}
                            </Text>
                            <Text
                              variant="caption"
                              style={{ color: isDark ? "#94A3B8" : "#64748B" }}
                            >
                              · {items.length} {items.length === 1 ? "class" : "classes"}
                            </Text>
                          </Pressable>

                          {items.map((item) => (
                            <ClassCard
                              key={item.id}
                              courseCode={item.courseCode}
                              courseTitle={item.courseTitle}
                              courseColor={item.courseColor}
                              time={item.displayTime}
                              venue={item.venue}
                              attended={item.attended}
                              moved={item.moved}
                              isPast={item.isPast}
                              sourceAttribution={item.sourceAttribution}
                              onPress={() =>
                                item.calendarKind === "assignments"
                                  ? router.push(`/assignment/${item.id}`)
                                  : router.push(`/class/${item.id}`)
                              }
                            />
                          ))}
                        </View>
                      ))}
                    </View>
                  ) : null}
                </View>
              )
            ) : null}
          </>
        ) : (
          /* 4. Calendar Day View: Uniform hierarchy, height proportional to duration, live moving bar on ongoing class */
          <View
            style={{
              backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
              borderRadius: 16,
              borderWidth: 1,
              borderColor: isDark ? "#334155" : "#E2E8F0",
              paddingVertical: 12,
              paddingRight: 12,
              marginBottom: 22,
            }}
          >
            <View
              style={{
                position: "relative",
                height: (CALENDAR_END_HOUR - CALENDAR_START_HOUR) * HOUR_HEIGHT + 24,
              }}
            >
              {/* Hourly grid lines & time labels */}
              {calendarHours.map((hour) => {
                const top = (hour - CALENDAR_START_HOUR) * HOUR_HEIGHT;
                return (
                  <View
                    key={hour}
                    style={{
                      position: "absolute",
                      top,
                      left: 0,
                      right: 0,
                      flexDirection: "row",
                      alignItems: "flex-start",
                    }}
                  >
                    <View style={{ width: 66, paddingLeft: 10, marginTop: -7 }}>
                      <Text
                        variant="caption"
                        style={{
                          fontSize: 11,
                          fontVariant: ["tabular-nums"],
                          color: isDark ? "#64748B" : "#94A3B8",
                        }}
                      >
                        {formatHourLabel(hour)}
                      </Text>
                    </View>
                    <View
                      style={{
                        flex: 1,
                        height: 1,
                        backgroundColor: isDark ? "#334155" : "#F1F5F9",
                      }}
                    />
                  </View>
                );
              })}

              {/* Class blocks sized strictly by duration, with equal hierarchy */}
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: 68,
                  right: 0,
                }}
              >
                {positionedCalendarItems.map(({ item, top, height, colIndex, totalCols }) => {
                  const widthPct = 100 / totalCols;
                  const leftPct = colIndex * widthPct;
                  const isItemOngoing = item.id === heroClass?.id;
                  const isItemPast = !isItemOngoing && item.isPast;
                  const blockHeight = height - 2;
                  const curtainHeight = blockHeight * Math.min(1, Math.max(0, progressRatio));

                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => router.push(`/class/${item.id}`)}
                      accessibilityRole="button"
                      style={{
                        position: "absolute",
                        top,
                        height: blockHeight,
                        left: `${leftPct}%`,
                        width: `${widthPct}%`,
                        paddingHorizontal: totalCols > 1 ? 2 : 0,
                      }}
                    >
                      <View
                        style={{
                          flex: 1,
                          borderRadius: 12,
                          overflow: "hidden",
                          backgroundColor: isItemOngoing
                            ? isDark
                              ? "#1E1B4B"
                              : "#EEF2FF"
                            : isDark
                              ? "#0F172A"
                              : "#F8FAFC",
                          borderWidth: isItemOngoing ? 1.5 : 1,
                          borderColor: isItemOngoing
                            ? isDark
                              ? "#818CF8"
                              : "#4F46E5"
                            : isDark
                              ? "#334155"
                              : "#E2E8F0",
                          opacity: isItemPast ? 0.62 : 1,
                          position: "relative",
                        }}
                      >
                        {/* Layer 1: Active Remaining Side (below the horizontal curtain bar) */}
                        <CalendarBlockBody item={item} isDark={isDark} mutedCurtain={isItemPast} />

                        {/* Layer 2: Passed Curtain Side (above the horizontal bar) — greys out texts, pills, icons, and stripe */}
                        {isItemOngoing ? (
                          <View
                            pointerEvents="none"
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              height: curtainHeight,
                              overflow: "hidden",
                              backgroundColor: isDark ? "#0F172A" : "#F1F5F9",
                              zIndex: 10,
                            }}
                          >
                            <View style={{ height: blockHeight, width: "100%" }}>
                              <CalendarBlockBody item={item} isDark={isDark} mutedCurtain={true} />
                            </View>
                          </View>
                        ) : null}

                        {/* Layer 3: Horizontal Curtain Bar traveling down the card by the second */}
                        {isItemOngoing ? (
                          <View
                            pointerEvents="none"
                            style={{
                              position: "absolute",
                              top: `${pct}%`,
                              left: 0,
                              right: 0,
                              marginTop: -1.5,
                              height: 3,
                              backgroundColor: isDark ? "#818CF8" : "#4F46E5",
                              zIndex: 20,
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "flex-end",
                            }}
                          >
                            <View
                              style={{
                                backgroundColor: isDark ? "#312E81" : "#4F46E5",
                                paddingHorizontal: 6,
                                paddingVertical: 1,
                                borderRadius: 6,
                                marginRight: 6,
                                borderWidth: 1,
                                borderColor: isDark ? "#818CF8" : "#FFFFFF",
                              }}
                            >
                              <Text
                                variant="label-sm"
                                style={{
                                  fontSize: 9,
                                  lineHeight: 12,
                                  color: "#FFFFFF",
                                  fontFamily: "Inter_700Bold",
                                  fontVariant: ["tabular-nums"],
                                }}
                              >
                                {currentTimeLabel}
                              </Text>
                            </View>
                          </View>
                        ) : null}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {/* 3. Due in the next 3 days Section (Small compact assignment cards) */}
        {showAssignmentsSection ? (
          <View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text variant="title-section" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                  Due in the next 3 days
                </Text>
                <Text
                  variant="title-section"
                  style={{
                    color: isDark ? "#94A3B8" : "#475569",
                    marginLeft: 8,
                    fontVariant: ["tabular-nums"],
                  }}
                >
                  {dueAssignmentsCount}
                </Text>
              </View>

              <Pressable
                onPress={() => router.push("/(tabs)/assignments")}
                hitSlop={8}
                accessibilityRole="button"
              >
                <Text variant="label" style={{ color: isDark ? "#818CF8" : "#4338CA" }}>
                  See all
                </Text>
              </Pressable>
            </View>

            <View style={{ rowGap: 10 }}>
              {dueAssignments.map((asg) => {
                const course = data.allCatalogCourses.find((c) => c.id === asg.courseId);
                const dueDateOnly = asg.dueAt.slice(0, 10);
                const isTodayDue = dueDateOnly === todayIso;
                const dueLabel = isTodayDue
                  ? "Due today"
                  : dueDateOnly === tomorrowIso
                    ? "Tomorrow"
                    : formatShortDateLabel(dueDateOnly);
                return (
                  <TodayAssignmentCard
                    key={asg.id}
                    courseCode={course?.code ?? "CSC 305"}
                    courseColor={course?.color ?? "#0D9488"}
                    assignmentType={asg.type === "group" ? "Group" : "Solo"}
                    title={asg.title}
                    dueText={dueLabel}
                    dueTimeText={`${dueLabel}, 11:59 pm`}
                    urgencyVariant={isTodayDue ? "danger" : "info"}
                    onPress={() => router.push(`/assignment/${asg.id}`)}
                  />
                );
              })}
            </View>
          </View>
        ) : null}
      </ScrollView>

      <ClerkAccountPopover
        visible={accountPopoverOpen}
        onClose={() => setAccountPopoverOpen(false)}
      />
      <QuickAddSheet visible={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
    </SafeAreaView>
  );
}
