import React, { useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  GraduationCap,
} from "lucide-react-native";
import { Text } from "@/components/ui/Text";
import { StudentAvatar } from "@/components/ui/StudentAvatar";
import { ClerkAccountPopover } from "@/components/ui/ClerkAccountPopover";
import { EmptyState } from "@/components/ui/EmptyState";
import { ClassCard, CalendarFilterBar, QuickAddSheet } from "@/components/timetable";
import { HamburgerButton } from "@/components/navigation/AppSidebarShell";
import { useTimetable, useInAppNotifications } from "@/hooks/useTimetable";
import { useTheme } from "@/theme";
import { useAuth } from "@/auth";
import {
  buildMonthGrid,
  buildWeekStripForDate,
  formatLongDateHeading,
  formatMonthYearHeading,
  getCurrentTime24,
  getTodayIsoDate,
  parseIsoDateParts,
  shiftYearMonth,
} from "@/lib/dateClock";

export default function ClassesScreen() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { user } = useAuth();

  const { data, getOccurrencesForDate, hasClassesOnDate } = useTimetable();
  const { unreadCount } = useInAppNotifications();
  const todayIso = getTodayIsoDate();
  const [primaryTab, setPrimaryTab] = useState<"list" | "calendar">("list");
  const [calendarSubTab, setCalendarSubTab] = useState<"day" | "week" | "month">("month");
  const [selectedDate, setSelectedDate] = useState<string>(() => getTodayIsoDate());
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [accountPopoverOpen, setAccountPopoverOpen] = useState(false);
  const [nowH = 10, nowM = 0] = getCurrentTime24().split(":").map(Number);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const parts = parseIsoDateParts(getTodayIsoDate());
    return { year: parts.year, monthIndex0: parts.monthIndex0 };
  });

  const weekDays = buildWeekStripForDate(selectedDate);
  const monthGrid = buildMonthGrid(visibleMonth.year, visibleMonth.monthIndex0);
  const monthHeading = formatMonthYearHeading(visibleMonth.year, visibleMonth.monthIndex0);

  const dayClasses = getOccurrencesForDate(selectedDate);
  const dateHeading = formatLongDateHeading(selectedDate);

  const activeSubObj = data.followedSubscriptions.find(
    (s) => s.id === data.activeSubscriptionFilter,
  );
  const activeFilterLabel =
    data.activeSubscriptionFilter === "group-personal"
      ? "Others (Gym, Church)"
      : activeSubObj
        ? activeSubObj.title
        : `All calendars · ${data.courses.length} courses`;

  const subtitleText =
    primaryTab === "calendar" && calendarSubTab === "day"
      ? `${dateHeading} · ${activeFilterLabel}`
      : activeFilterLabel;

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
        {/* Top Bar (Screen 35 / 36 / 37) */}
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
              <Text variant="title-page" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                Classes & Calendar
              </Text>
              <Text
                variant="body"
                numberOfLines={1}
                style={{ color: isDark ? "#94A3B8" : "#475569", marginTop: 2 }}
              >
                {subtitleText}
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

        {/* Primary Segmented Control: List | Calendar (Screens 35, 36) */}
        <View
          style={{
            flexDirection: "row",
            backgroundColor: isDark ? "#1E293B" : "#F1F5F9",
            padding: 4,
            borderRadius: 12,
            marginBottom: 12,
          }}
        >
          {(["list", "calendar"] as const).map((tab) => {
            const active = primaryTab === tab;
            return (
              <Pressable
                key={tab}
                onPress={() => {
                  setPrimaryTab(tab);
                }}
                accessibilityRole="button"
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
                    color: active
                      ? isDark
                        ? "#F8FAFC"
                        : "#0F172A"
                      : isDark
                        ? "#94A3B8"
                        : "#475569",
                  }}
                >
                  {tab === "list" ? "List" : "Calendar"}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Inline Calendar Category Filter Chips + Quick Add */}
        <CalendarFilterBar onOpenQuickAdd={() => setQuickAddOpen(true)} />

        {/* Secondary Segmented Control when in Calendar mode: Day | Week | Month (Screens 36, 37) */}
        {primaryTab === "calendar" ? (
          <View
            style={{
              flexDirection: "row",
              backgroundColor: isDark ? "#1E293B" : "#F1F5F9",
              padding: 4,
              borderRadius: 12,
              marginBottom: 16,
            }}
          >
            {(["day", "week", "month"] as const).map((sub) => {
              const active = calendarSubTab === sub;
              return (
                <Pressable
                  key={sub}
                  onPress={() => {
                    setCalendarSubTab(sub);
                  }}
                  accessibilityRole="button"
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
                      color: active
                        ? isDark
                          ? "#F8FAFC"
                          : "#0F172A"
                        : isDark
                          ? "#94A3B8"
                          : "#475569",
                    }}
                  >
                    {sub === "day" ? "Day" : sub === "week" ? "Week" : "Month"}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        {/* Week Strip (shown in List mode, Calendar Day mode, and Calendar Week mode) */}
        {primaryTab === "list" || calendarSubTab !== "month" ? (
          <View style={{ marginBottom: 24 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
                paddingHorizontal: 4,
              }}
            >
              <Pressable
                onPress={() => {
                  setPrimaryTab("calendar");
                  setCalendarSubTab("month");
                }}
                style={{ flexDirection: "row", alignItems: "center", columnGap: 6 }}
              >
                <Text variant="title-card" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                  {monthHeading}
                </Text>
                <ChevronDown size={18} color={isDark ? "#F8FAFC" : "#0F172A"} strokeWidth={2} />
              </Pressable>

              <Pressable
                onPress={() => router.push("/settings/courses")}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 9999,
                  backgroundColor: isDark ? "#1E1B4B" : "#EEF2FF",
                }}
              >
                <Text variant="label-sm" style={{ color: isDark ? "#818CF8" : "#4F46E5" }}>
                  Manage courses ({data.courses.length})
                </Text>
              </Pressable>
            </View>

            {/* 7-Day Strip (Screen 35 / 37) */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {weekDays.map((wd) => {
                const isSelected = selectedDate === wd.isoDate;
                const hasClasses = hasClassesOnDate(wd.isoDate);
                const isPastDay = wd.isoDate < todayIso;

                return (
                  <Pressable
                    key={wd.isoDate}
                    onPress={() => setSelectedDate(wd.isoDate)}
                    accessibilityRole="button"
                    style={{
                      width: 44,
                      paddingVertical: 8,
                      borderRadius: 12,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: isSelected ? "#4F46E5" : "transparent",
                    }}
                  >
                    <Text
                      variant="caption"
                      style={{
                        color: isSelected ? "#E0E7FF" : isDark ? "#94A3B8" : "#64748B",
                        marginBottom: 4,
                      }}
                    >
                      {wd.label}
                    </Text>

                    <Text
                      variant="time"
                      style={{
                        color: isSelected
                          ? "#FFFFFF"
                          : isPastDay
                            ? isDark
                              ? "#64748B"
                              : "#64748B"
                            : isDark
                              ? "#F8FAFC"
                              : "#0F172A",
                      }}
                    >
                      {wd.dayNum}
                    </Text>

                    <View
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: 2.5,
                        marginTop: 5,
                        backgroundColor: hasClasses
                          ? isSelected
                            ? "#FFFFFF"
                            : "#4F46E5"
                          : "transparent",
                      }}
                    />
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        {/* Month Grid View (Screen 36 Classes · month.png) */}
        {primaryTab === "calendar" && calendarSubTab === "month" ? (
          <View
            style={{
              backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
              borderRadius: 16,
              padding: 16,
              marginBottom: 24,
              borderWidth: isDark ? 1 : 0,
              borderColor: "#334155",
            }}
          >
            {/* Month Header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <Text variant="title-card" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                {monthHeading}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", columnGap: 16 }}>
                <Pressable
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Previous month"
                  onPress={() =>
                    setVisibleMonth((prev) => shiftYearMonth(prev.year, prev.monthIndex0, -1))
                  }
                >
                  <ChevronLeft
                    size={20}
                    color={isDark ? "#F8FAFC" : "#0F172A"}
                    strokeWidth={1.85}
                  />
                </Pressable>
                <Pressable
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Next month"
                  onPress={() =>
                    setVisibleMonth((prev) => shiftYearMonth(prev.year, prev.monthIndex0, 1))
                  }
                >
                  <ChevronRight
                    size={20}
                    color={isDark ? "#F8FAFC" : "#0F172A"}
                    strokeWidth={1.85}
                  />
                </Pressable>
              </View>
            </View>

            {/* Weekday Initials */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              {["M", "T", "W", "T", "F", "S", "S"].map((letter, idx) => (
                <View key={idx} style={{ width: 40, alignItems: "center" }}>
                  <Text variant="caption" style={{ color: isDark ? "#94A3B8" : "#475569" }}>
                    {letter}
                  </Text>
                </View>
              ))}
            </View>

            {/* 6 Week Rows */}
            <View style={{ rowGap: 6 }}>
              {monthGrid.map((week, wIdx) => (
                <View key={wIdx} style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  {week.map((cell) => {
                    const isToday = cell.isoDate === todayIso;
                    const isSelected = selectedDate === cell.isoDate;
                    const hasDot = cell.inMonth && hasClassesOnDate(cell.isoDate);

                    return (
                      <Pressable
                        key={cell.isoDate}
                        onPress={() => setSelectedDate(cell.isoDate)}
                        style={{
                          width: 40,
                          height: 44,
                          borderRadius: 22,
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: isSelected ? "#4F46E5" : "transparent",
                          borderWidth: isToday && !isSelected ? 1.5 : 0,
                          borderColor: "#4F46E5",
                        }}
                      >
                        <Text
                          variant="label"
                          style={{
                            fontFamily:
                              isSelected || isToday ? "Inter_600SemiBold" : "Inter_500Medium",
                            color: isSelected
                              ? "#FFFFFF"
                              : !cell.inMonth
                                ? isDark
                                  ? "#475569"
                                  : "#94A3B8"
                                : isToday
                                  ? isDark
                                    ? "#818CF8"
                                    : "#4F46E5"
                                  : isDark
                                    ? "#F8FAFC"
                                    : "#0F172A",
                          }}
                        >
                          {cell.day}
                        </Text>
                        <View
                          style={{
                            width: 4.5,
                            height: 4.5,
                            borderRadius: 2.25,
                            marginTop: 2,
                            backgroundColor: hasDot
                              ? isSelected
                                ? "#FFFFFF"
                                : "#4F46E5"
                              : "transparent",
                          }}
                        />
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* Day Timeline Grid View (Screen 37 Classes · day.png) */}
        {primaryTab === "calendar" && calendarSubTab === "day" ? (
          <View
            style={{
              backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
              borderRadius: 16,
              paddingVertical: 16,
              paddingHorizontal: 12,
              borderWidth: isDark ? 1 : 0,
              borderColor: "#334155",
            }}
          >
            <View style={{ position: "relative", height: 15 * 68 }}>
              {[7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21].map((hour24, idx) => {
                const period = hour24 >= 12 ? "pm" : "am";
                const h12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
                const hourLabel = `${h12} ${period}`;

                return (
                  <View
                    key={hour24}
                    style={{
                      position: "absolute",
                      top: idx * 68,
                      left: 0,
                      right: 0,
                      flexDirection: "row",
                      height: 68,
                    }}
                  >
                    <View style={{ width: 52, paddingRight: 8 }}>
                      <Text
                        variant="caption"
                        style={{ color: isDark ? "#94A3B8" : "#475569", marginTop: -6 }}
                      >
                        {hourLabel}
                      </Text>
                    </View>

                    <View
                      style={{
                        flex: 1,
                        borderTopWidth: 1,
                        borderTopColor: isDark ? "#334155" : "#E2E8F0",
                        position: "relative",
                      }}
                    >
                      {/* Live Red Current Time Indicator (Screen 37) */}
                      {hour24 === nowH ? (
                        <View
                          style={{
                            position: "absolute",
                            top: Math.round((nowM / 60) * 68) - 4,
                            left: -5,
                            right: 0,
                            flexDirection: "row",
                            alignItems: "center",
                            zIndex: 10,
                          }}
                        >
                          <View
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: "#DC2626",
                            }}
                          />
                          <View style={{ flex: 1, height: 2, backgroundColor: "#DC2626" }} />
                        </View>
                      ) : null}
                    </View>
                  </View>
                );
              })}

              {/* Dynamic Day Blocks for All Active Calendars (side-by-side collision columns) */}
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: 56,
                  right: 0,
                }}
              >
                {(() => {
                  const sorted = [...dayClasses].sort((a, b) => {
                    const [ah = 8, am = 0] = a.startTime.split(":").map(Number);
                    const [bh = 8, bm = 0] = b.startTime.split(":").map(Number);
                    return ah * 60 + am - (bh * 60 + bm);
                  });

                  const cols: { endMins: number; id: string }[][] = [];
                  const colMap = new Map<string, number>();

                  for (const item of sorted) {
                    const [sh = 8, sm = 0] = item.startTime.split(":").map(Number);
                    const [eh = 10, em = 0] = item.endTime.split(":").map(Number);
                    const sMins = sh * 60 + sm;
                    const eMins = Math.max(sMins + 35, eh * 60 + em);
                    let placed = -1;
                    for (let c = 0; c < cols.length; c++) {
                      const col = cols[c]!;
                      const last = col[col.length - 1];
                      if (!last || last.endMins <= sMins) {
                        col.push({ endMins: eMins, id: item.id });
                        placed = c;
                        break;
                      }
                    }
                    if (placed === -1) {
                      placed = cols.length;
                      cols.push([{ endMins: eMins, id: item.id }]);
                    }
                    colMap.set(item.id, placed);
                  }

                  return sorted.map((cls) => {
                    const [sh = 8, sm = 0] = cls.startTime.split(":").map(Number);
                    const [eh = 10, em = 0] = cls.endTime.split(":").map(Number);
                    const startMins = sh * 60 + sm;
                    const endMins = Math.max(startMins + 35, eh * 60 + em);

                    const overlapping = sorted.filter((other) => {
                      const [osh = 8, osm = 0] = other.startTime.split(":").map(Number);
                      const [oeh = 10, oem = 0] = other.endTime.split(":").map(Number);
                      const oStart = osh * 60 + osm;
                      const oEnd = Math.max(oStart + 35, oeh * 60 + oem);
                      return oStart < endMins && oEnd > startMins;
                    });
                    const maxCol = Math.max(0, ...overlapping.map((o) => colMap.get(o.id) ?? 0));
                    const totalCols = maxCol + 1;
                    const colIndex = colMap.get(cls.id) ?? 0;
                    const widthPct = 100 / totalCols;
                    const leftPct = colIndex * widthPct;

                    const top = Math.max(0, ((startMins - 7 * 60) / 60) * 68);
                    const height = Math.max(44, ((endMins - startMins) / 60) * 68 - 3);

                    return (
                      <Pressable
                        key={cls.id}
                        onPress={() => router.push(`/class/${cls.id}` as any)}
                        style={{
                          position: "absolute",
                          top,
                          left: `${leftPct}%`,
                          width: `${widthPct}%`,
                          height,
                          paddingHorizontal: totalCols > 1 ? 2 : 0,
                          zIndex: 6,
                        }}
                      >
                        <View
                          style={{
                            flex: 1,
                            flexDirection: "row",
                            borderRadius: 8,
                            overflow: "hidden",
                            backgroundColor: isDark ? "#0F172A" : "#EEF2FF",
                            borderWidth: 1,
                            borderColor: isDark ? "#334155" : "#C7D2FE",
                            opacity: cls.isPast ? 0.72 : 1,
                          }}
                        >
                          <View style={{ width: 4, backgroundColor: cls.courseColor }} />
                          <View style={{ paddingHorizontal: 8, paddingVertical: 6, flex: 1 }}>
                            <Text
                              variant="label"
                              numberOfLines={1}
                              style={{
                                color: isDark ? "#F8FAFC" : "#0F172A",
                                fontFamily: "Inter_600SemiBold",
                              }}
                            >
                              {cls.courseCode} · {cls.courseTitle}
                            </Text>
                            <Text
                              variant="caption"
                              numberOfLines={1}
                              style={{ color: isDark ? "#CBD5E1" : "#334155", marginTop: 2 }}
                            >
                              {cls.displayTime} · {cls.shortVenue}
                            </Text>
                          </View>
                        </View>
                      </Pressable>
                    );
                  });
                })()}
              </View>
            </View>
          </View>
        ) : (
          /* Selected Day Classes List (Screen 35 & Screen 36 bottom section) */
          <View>
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
                  {dateHeading}
                </Text>
                <Text
                  variant="title-section"
                  style={{
                    color: isDark ? "#94A3B8" : "#475569",
                    marginLeft: 8,
                    fontVariant: ["tabular-nums"],
                  }}
                >
                  {dayClasses.length}
                </Text>
              </View>
            </View>

            {dayClasses.length === 0 ? (
              <EmptyState
                icon={<GraduationCap size={28} color="#4F46E5" />}
                title="No classes on this day"
                description="Pick another day on the calendar or add a weekly recurring class to your timetable."
                actionLabel="Add class"
                onAction={() => router.push("/setup/add-class" as any)}
              />
            ) : (
              <View style={{ rowGap: 12 }}>
                {dayClasses.map((cls) => (
                  <ClassCard
                    key={cls.id}
                    courseCode={cls.courseCode}
                    courseTitle={cls.courseTitle}
                    courseColor={cls.courseColor}
                    time={cls.displayTime}
                    venue={cls.venue}
                    attended={cls.attended}
                    moved={cls.moved}
                    isPast={cls.isPast}
                    sourceAttribution={cls.sourceAttribution}
                    onPress={() =>
                      cls.calendarKind === "assignments"
                        ? router.push(`/assignment/${cls.id}` as any)
                        : router.push(`/class/${cls.id}` as any)
                    }
                  />
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button (56x56, 16px above tab bar per SG · Layout.png) */}
      <Pressable
        accessibilityLabel="Quick add to timetable"
        accessibilityRole="button"
        onPress={() => setQuickAddOpen(true)}
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

      <QuickAddSheet visible={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
      <ClerkAccountPopover
        visible={accountPopoverOpen}
        onClose={() => setAccountPopoverOpen(false)}
      />
    </SafeAreaView>
  );
}
