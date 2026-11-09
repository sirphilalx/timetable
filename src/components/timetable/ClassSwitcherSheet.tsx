import React, { useState } from "react";
import { View, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import {
  GraduationCap,
  Check,
  Plus,
  Layers,
  Sparkles,
  Dumbbell,
  SlidersHorizontal,
} from "lucide-react-native";
import { Sheet } from "@/components/ui/Sheet";
import { Text } from "@/components/ui/Text";
import { useTheme } from "@/theme";
import {
  useTimetable,
  useUpdateCalendarFilters,
  useSubscribeSharedClass,
  type CalendarCategory,
  type FollowedSubscription,
} from "@/hooks/useTimetable";

export interface ClassSwitcherSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedClassId?: string;
  onSelectClass?: (classId: string) => void;
}

const CALENDAR_TABS: { id: CalendarCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "classes", label: "1. Classes" },
  { id: "assignments", label: "2. Assignments" },
  { id: "exams", label: "3. Exams" },
  { id: "others", label: "4. Others" },
];

export function ClassSwitcherSheet({ isOpen, onClose, onSelectClass }: ClassSwitcherSheetProps) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const { data } = useTimetable();
  const updateFilters = useUpdateCalendarFilters();
  const subscribeMutation = useSubscribeSharedClass();

  const [editingSubId, setEditingSubId] = useState<string | null>(null);

  const activeCal = data.activeCalendarFilter;
  const activeSub = data.activeSubscriptionFilter;

  const handleSelectCalendar = (cal: CalendarCategory) => {
    updateFilters.mutate({
      calendarFilter: cal,
      subscriptionFilter: cal === "others" ? "all" : activeSub,
    });
  };

  const handleSelectSubscription = (subId: string) => {
    updateFilters.mutate({
      subscriptionFilter: subId,
      calendarFilter: subId === "group-personal" ? "others" : activeCal,
    });
    onSelectClass?.(subId);
    setTimeout(() => {
      onClose();
    }, 150);
  };

  const handleToggleSubCourse = (sub: FollowedSubscription, courseId: string) => {
    const exists = sub.selectedCourseIds.includes(courseId);
    let nextIds: string[];
    if (exists) {
      if (sub.selectedCourseIds.length <= 1) return;
      nextIds = sub.selectedCourseIds.filter((id) => id !== courseId);
    } else {
      nextIds = [...sub.selectedCourseIds, courseId];
    }

    subscribeMutation.mutate({
      groupId: sub.id,
      shareCode: sub.shareCode,
      title: sub.title,
      department: sub.department,
      level: sub.level,
      institution: sub.institution,
      repName: sub.repName,
      memberCount: sub.memberCount,
      mode: sub.mode,
      selectedCourseIds: nextIds,
    });
  };

  const handleJoinAnother = () => {
    onClose();
    setTimeout(() => {
      router.push("/join/CSC200" as any);
    }, 120);
  };

  const handleAddEvent = () => {
    onClose();
    setTimeout(() => {
      router.push("/events/add" as any);
    }, 120);
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose}>
      <ScrollView style={{ maxHeight: 540 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingBottom: 12 }}>
          <Text
            variant="title-page"
            style={{
              color: isDark ? "#F8FAFC" : "#0F172A",
              fontSize: 22,
              lineHeight: 28,
              marginBottom: 12,
            }}
          >
            Calendars & classes
          </Text>

          {/* 4 Calendars Filter Pills: All | 1. Classes | 2. Assignments | 3. Exams | 4. Others */}
          <Text
            variant="caption"
            style={{
              color: isDark ? "#94A3B8" : "#64748B",
              fontFamily: "Inter_600SemiBold",
              marginBottom: 8,
            }}
          >
            FILTER BY CALENDAR
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 18 }}
            contentContainerStyle={{ columnGap: 8 }}
          >
            {CALENDAR_TABS.map((tab) => {
              const isActive = activeCal === tab.id;
              return (
                <Pressable
                  key={tab.id}
                  onPress={() => handleSelectCalendar(tab.id)}
                  accessibilityRole="button"
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 9999,
                    borderWidth: 1,
                    borderColor: isActive ? "#4F46E5" : isDark ? "#334155" : "#CBD5E1",
                    backgroundColor: isActive ? "#4F46E5" : isDark ? "#0F172A" : "#F8FAFC",
                  }}
                >
                  <Text
                    variant="label-sm"
                    style={{
                      color: isActive ? "#FFFFFF" : isDark ? "#CBD5E1" : "#334155",
                      fontFamily: isActive ? "Inter_600SemiBold" : "Inter_500Medium",
                    }}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Text
            variant="caption"
            style={{
              color: isDark ? "#94A3B8" : "#64748B",
              fontFamily: "Inter_600SemiBold",
              marginBottom: 10,
            }}
          >
            FOLLOWED CLASSES & PERSONAL CALENDARS
          </Text>

          <View style={{ rowGap: 14, marginBottom: 20 }}>
            {/* 0. All Combined Option */}
            <Pressable
              onPress={() => handleSelectSubscription("all")}
              accessibilityRole="button"
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: isDark ? "#1E1B4B" : "#EEF2FF",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 14,
                  }}
                >
                  <Layers size={20} color={isDark ? "#818CF8" : "#4F46E5"} strokeWidth={2} />
                </View>

                <View style={{ flex: 1 }}>
                  <Text variant="title-card" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                    All calendars (Combined)
                  </Text>
                  <Text
                    variant="body"
                    style={{
                      color: isDark ? "#94A3B8" : "#475569",
                      marginTop: 2,
                    }}
                  >
                    Main class + Carry-over + Electives + Exams + Others
                  </Text>
                </View>
              </View>

              {activeSub === "all" ? (
                <Check size={20} color={isDark ? "#818CF8" : "#4F46E5"} strokeWidth={2.2} />
              ) : null}
            </Pressable>

            {/* Followed Subscriptions: Main class, Carry-over, Elective */}
            {data.followedSubscriptions.map((sub) => {
              const isSelected = activeSub === sub.id;
              const groupCourses = data.allCatalogCourses.filter((c) => c.sharedGroupId === sub.id);
              const isEditing = editingSubId === sub.id;

              const modeBadgeLabel =
                sub.mode === "main"
                  ? "Main class"
                  : sub.mode === "carryover"
                    ? "Carry-over"
                    : "Elective";

              const modeBadgeBg =
                sub.mode === "main"
                  ? isDark
                    ? "#1E1B4B"
                    : "#EEF2FF"
                  : sub.mode === "carryover"
                    ? isDark
                      ? "#451A03"
                      : "#FEF3C7"
                    : isDark
                      ? "#064E3B"
                      : "#D1FAE5";

              const modeBadgeColor =
                sub.mode === "main"
                  ? isDark
                    ? "#818CF8"
                    : "#4F46E5"
                  : sub.mode === "carryover"
                    ? isDark
                      ? "#FBBF24"
                      : "#B45309"
                    : isDark
                      ? "#34D399"
                      : "#047857";

              return (
                <View key={sub.id}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Pressable
                      onPress={() => handleSelectSubscription(sub.id)}
                      accessibilityRole="button"
                      style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
                    >
                      <View
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          backgroundColor: modeBadgeBg,
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 14,
                        }}
                      >
                        <GraduationCap size={20} color={modeBadgeColor} strokeWidth={2} />
                      </View>

                      <View style={{ flex: 1 }}>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            columnGap: 6,
                            flexWrap: "wrap",
                          }}
                        >
                          <Text
                            variant="title-card"
                            style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}
                          >
                            {sub.title}
                          </Text>
                          <View
                            style={{
                              paddingHorizontal: 6,
                              paddingVertical: 2,
                              borderRadius: 6,
                              backgroundColor: modeBadgeBg,
                            }}
                          >
                            <Text
                              variant="caption"
                              style={{
                                fontSize: 10,
                                lineHeight: 13,
                                fontFamily: "Inter_600SemiBold",
                                color: modeBadgeColor,
                              }}
                            >
                              {modeBadgeLabel}
                            </Text>
                          </View>
                        </View>

                        <Text
                          variant="body"
                          style={{
                            color: isDark ? "#94A3B8" : "#475569",
                            marginTop: 2,
                          }}
                        >
                          {sub.mode === "main"
                            ? `${sub.memberCount} members · all ${groupCourses.length} courses`
                            : `${sub.selectedCourseIds.length} of ${groupCourses.length} courses selected · settings synced`}
                        </Text>
                      </View>
                    </Pressable>

                    <View style={{ flexDirection: "row", alignItems: "center", columnGap: 8 }}>
                      {sub.mode !== "main" ? (
                        <Pressable
                          onPress={() => setEditingSubId(isEditing ? null : sub.id)}
                          accessibilityRole="button"
                          accessibilityLabel="Edit subscribed courses"
                          style={{
                            paddingHorizontal: 8,
                            paddingVertical: 5,
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: isDark ? "#334155" : "#CBD5E1",
                            backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                            flexDirection: "row",
                            alignItems: "center",
                            columnGap: 4,
                          }}
                        >
                          <SlidersHorizontal
                            size={12}
                            color={isDark ? "#CBD5E1" : "#475569"}
                            strokeWidth={2}
                          />
                          <Text
                            variant="caption"
                            style={{
                              fontSize: 11,
                              color: isDark ? "#CBD5E1" : "#475569",
                              fontFamily: "Inter_600SemiBold",
                            }}
                          >
                            Courses
                          </Text>
                        </Pressable>
                      ) : null}

                      {isSelected ? (
                        <Check size={20} color={isDark ? "#818CF8" : "#4F46E5"} strokeWidth={2.2} />
                      ) : null}
                    </View>
                  </View>

                  {/* Expandable course checklist for Carry-over or Elective */}
                  {isEditing ? (
                    <View
                      style={{
                        marginTop: 10,
                        marginLeft: 58,
                        padding: 10,
                        borderRadius: 12,
                        backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                        borderWidth: 1,
                        borderColor: isDark ? "#334155" : "#E2E8F0",
                        rowGap: 6,
                      }}
                    >
                      <Text
                        variant="caption"
                        style={{
                          color: isDark ? "#94A3B8" : "#64748B",
                          fontFamily: "Inter_600SemiBold",
                          marginBottom: 2,
                        }}
                      >
                        {sub.mode === "carryover"
                          ? `Pick carry-over courses from ${sub.level}:`
                          : `Pick elective courses from ${sub.department}:`}
                      </Text>
                      {groupCourses.map((c) => {
                        const checked = sub.selectedCourseIds.includes(c.id);
                        return (
                          <Pressable
                            key={c.id}
                            onPress={() => handleToggleSubCourse(sub, c.id)}
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              paddingVertical: 6,
                              paddingHorizontal: 8,
                              borderRadius: 8,
                              backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                            }}
                          >
                            <View
                              style={{
                                width: 18,
                                height: 18,
                                borderRadius: 5,
                                backgroundColor: checked ? "#4F46E5" : "transparent",
                                borderWidth: checked ? 0 : 1.5,
                                borderColor: "#94A3B8",
                                alignItems: "center",
                                justifyContent: "center",
                                marginRight: 8,
                              }}
                            >
                              {checked ? (
                                <Check size={12} color="#FFFFFF" strokeWidth={2.5} />
                              ) : null}
                            </View>
                            <Text
                              variant="caption"
                              style={{
                                flex: 1,
                                color: isDark ? "#F8FAFC" : "#0F172A",
                                fontFamily: checked ? "Inter_600SemiBold" : "Inter_400Regular",
                              }}
                            >
                              {c.code} · {c.title}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  ) : null}
                </View>
              );
            })}

            {/* 4. Others Calendar (Gym, Church, Club — Only you) */}
            <Pressable
              onPress={() => handleSelectSubscription("group-personal")}
              accessibilityRole="button"
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: isDark ? "#052E16" : "#DCFCE7",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 14,
                  }}
                >
                  <Dumbbell size={20} color={isDark ? "#4ADE80" : "#15803D"} strokeWidth={2} />
                </View>

                <View style={{ flex: 1 }}>
                  <Text variant="title-card" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                    Others (Gym, Church, Club)
                  </Text>
                  <Text
                    variant="body"
                    style={{
                      color: isDark ? "#94A3B8" : "#475569",
                      marginTop: 2,
                    }}
                  >
                    {data.personalEvents.length} personal items · Only you
                  </Text>
                </View>
              </View>

              {activeSub === "group-personal" ? (
                <Check size={20} color={isDark ? "#818CF8" : "#4F46E5"} strokeWidth={2.2} />
              ) : null}
            </Pressable>
          </View>

          {/* Bottom Actions */}
          <View style={{ rowGap: 10 }}>
            <Pressable
              onPress={handleAddEvent}
              accessibilityRole="button"
              style={{
                height: 48,
                borderRadius: 12,
                backgroundColor: "#4F46E5",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Sparkles size={17} color="#FFFFFF" strokeWidth={2.2} />
              <Text
                variant="label-lg"
                style={{
                  color: "#FFFFFF",
                  marginLeft: 8,
                }}
              >
                Add Exam or Other event (Gym, Church, Club)
              </Text>
            </Pressable>

            <Pressable
              onPress={handleJoinAnother}
              accessibilityRole="button"
              style={{
                height: 48,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: isDark ? "#334155" : "#CBD5E1",
                backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Plus size={18} color={isDark ? "#94A3B8" : "#475569"} strokeWidth={2.2} />
              <Text
                variant="title-card"
                style={{
                  color: isDark ? "#F8FAFC" : "#0F172A",
                  marginLeft: 8,
                }}
              >
                Join class, carry-over, or elective
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </Sheet>
  );
}
