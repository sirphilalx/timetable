import React, { useState, useMemo, useEffect } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  GraduationCap,
  Users,
  Calendar,
  Flag,
  Link2Off,
  Check,
  Sparkles,
  BookOpen,
  ChevronLeft,
} from "lucide-react-native";
import { Text } from "@/components/ui/Text";
import { Sheet } from "@/components/ui/Sheet";
import { useTheme } from "@/theme";
import { useAuth } from "@/auth";
import { useTimetable, useSubscribeSharedClass, type SubscriptionMode } from "@/hooks/useTimetable";
import { fetchSharedClassFromCloud, enqueueOutboxMutation } from "@/lib/sync";

interface SharedCatalogPreset {
  groupId: string;
  code: string;
  title: string;
  department: string;
  level: string;
  institution: string;
  repName: string;
  memberCount: number;
  weeklyClassesCount: number;
  defaultMode: SubscriptionMode;
}

const SHARED_CATALOG_PRESETS: Record<string, SharedCatalogPreset> = {
  CSC3X9: {
    groupId: "group-csc-300l",
    code: "CSC3X9",
    title: "CSC 300L · Computer Science",
    department: "Computer Science",
    level: "300L",
    institution: "University of Benin (UNIBEN)",
    repName: "Ada Eze",
    memberCount: 128,
    weeklyClassesCount: 18,
    defaultMode: "main",
  },
  CSC200: {
    groupId: "group-sta-211",
    code: "CSC200",
    title: "CSC / STA 200L · Physical Sciences",
    department: "Statistics & Computer Science",
    level: "200L",
    institution: "University of Benin (UNIBEN)",
    repName: "Chukwudi Okafor",
    memberCount: 142,
    weeklyClassesCount: 16,
    defaultMode: "carryover",
  },
  ECO300: {
    groupId: "group-eco-300l",
    code: "ECO300",
    title: "ECO 300L · Economics & Mgt",
    department: "Economics",
    level: "300L",
    institution: "University of Benin (UNIBEN)",
    repName: "Osaze Igbinosa",
    memberCount: 94,
    weeklyClassesCount: 14,
    defaultMode: "elective",
  },
};

export default function JoinClassScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const { data } = useTimetable();
  const subscribeMutation = useSubscribeSharedClass();
  const { isSignedIn, hasCompletedOnboarding, completeOnboarding } = useAuth();

  const initialCode = (code ?? "CSC3X9").toUpperCase();
  const [activePresetKey, setActivePresetKey] = useState<string>(
    SHARED_CATALOG_PRESETS[initialCode] ? initialCode : "CSC3X9",
  );

  const preset = SHARED_CATALOG_PRESETS[activePresetKey] ?? SHARED_CATALOG_PRESETS.CSC3X9!;

  useEffect(() => {
    void fetchSharedClassFromCloud(preset.code);
  }, [preset.code]);

  const catalogCourses = useMemo(
    () => data.allCatalogCourses.filter((c) => c.sharedGroupId === preset.groupId),
    [data.allCatalogCourses, preset.groupId],
  );

  const existingSub = data.followedSubscriptions.find((s) => s.id === preset.groupId);

  const [viewState, setViewState] = useState<"invited" | "following" | "invalid">(
    initialCode === "EXPIRED" || initialCode === "INVALID" ? "invalid" : "invited",
  );

  // Sheet states: 1. Subscription Mode + Course Checklist sheet, 2. Duplicate Clash sheet
  const [subscribeSheetOpen, setSubscribeSheetOpen] = useState(false);
  const [subscriptionMode, setSubscriptionMode] = useState<SubscriptionMode>(
    existingSub?.mode ?? preset.defaultMode,
  );
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>(
    existingSub?.selectedCourseIds ?? catalogCourses.map((c) => c.id),
  );

  const [clashSheetOpen, setClashSheetOpen] = useState(false);
  const [clashOption, setClashOption] = useState<"rep" | "mine">("rep");
  const [reportSheetOpen, setReportSheetOpen] = useState(false);
  const [reportReason, setReportReason] = useState<string>("wrong_class");
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const handleSwitchPreset = (presetKey: string) => {
    setActivePresetKey(presetKey);
    const nextPreset = SHARED_CATALOG_PRESETS[presetKey]!;
    const nextCourses = data.allCatalogCourses.filter(
      (c) => c.sharedGroupId === nextPreset.groupId,
    );
    const existing = data.followedSubscriptions.find((s) => s.id === nextPreset.groupId);
    const nextMode = existing?.mode ?? nextPreset.defaultMode;
    setSubscriptionMode(nextMode);
    if (existing) {
      setSelectedCourseIds(existing.selectedCourseIds);
    } else if (nextMode === "main") {
      setSelectedCourseIds(nextCourses.map((c) => c.id));
    } else {
      setSelectedCourseIds(nextCourses[0] ? [nextCourses[0].id] : []);
    }
    setViewState("invited");
  };

  const toggleCourseSelection = (courseId: string) => {
    setSelectedCourseIds((prev) => {
      if (prev.includes(courseId)) {
        if (prev.length === 1) return prev; // Keep at least 1 selected
        return prev.filter((id) => id !== courseId);
      }
      return [...prev, courseId];
    });
  };

  const handleConfirmSubscription = async () => {
    const finalCourseIds =
      subscriptionMode === "main"
        ? catalogCourses.map((c) => c.id)
        : selectedCourseIds.length > 0
          ? selectedCourseIds
          : catalogCourses[0]
            ? [catalogCourses[0].id]
            : [];

    await subscribeMutation.mutateAsync({
      groupId: preset.groupId,
      shareCode: preset.code,
      title: preset.title,
      department: preset.department,
      level: preset.level,
      institution: preset.institution,
      repName: preset.repName,
      memberCount: preset.memberCount,
      mode: subscriptionMode,
      selectedCourseIds: finalCourseIds,
    });

    void enqueueOutboxMutation(
      "course_memberships",
      "insert",
      `${preset.groupId}-${data.student.id}`,
      {
        id: `${preset.groupId}-${data.student.id}`,
        group_id: preset.groupId,
        student_id: data.student.id,
        role: "follower",
        joined_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    );

    setSubscribeSheetOpen(false);
    if (subscriptionMode === "main" && preset.groupId === "group-csc-300l") {
      setClashSheetOpen(true);
    } else {
      setViewState("following");
    }
  };

  if (viewState === "invalid") {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }}
        edges={["top", "left", "right", "bottom"]}
      >
        <View
          style={{
            flex: 1,
            paddingHorizontal: 20,
            paddingTop: 56,
            paddingBottom: 24,
            justifyContent: "space-between",
          }}
        >
          <View>
            {/* Broken Link Circle */}
            <View style={{ alignItems: "center", marginBottom: 24 }}>
              <View
                style={{
                  width: 84,
                  height: 84,
                  borderRadius: 42,
                  backgroundColor: isDark ? "#1E1B4B" : "#EEF2FF",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Link2Off size={32} color={isDark ? "#818CF8" : "#4F46E5"} strokeWidth={2} />
              </View>
            </View>

            <Text
              variant="title-page"
              style={{
                color: isDark ? "#F8FAFC" : "#0F172A",
                textAlign: "center",
                marginBottom: 12,
              }}
            >
              This link no longer works
            </Text>

            <Text
              variant="body-lg"
              style={{
                color: isDark ? "#94A3B8" : "#475569",
                fontFamily: "Inter_400Regular",
                textAlign: "center",
                lineHeight: 22,
                marginBottom: 32,
              }}
            >
              Your rep may have made a new link, or the class was removed. Ask them for the new
              link, or enter the share code.
            </Text>

            {/* 6 Character Boxes */}
            <Pressable
              onPress={() => router.push("/join/scan" as any)}
              accessibilityRole="button"
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                columnGap: 8,
                marginBottom: 8,
              }}
            >
              {[0, 1, 2, 3, 4, 5].map((idx) => (
                <View
                  key={idx}
                  style={{
                    flex: 1,
                    height: 54,
                    borderRadius: 12,
                    borderWidth: idx === 0 ? 2 : 1,
                    borderColor: idx === 0 ? "#4F46E5" : isDark ? "#334155" : "#CBD5E1",
                    backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                  }}
                />
              ))}
            </Pressable>

            <Text variant="caption" style={{ color: isDark ? "#94A3B8" : "#475569" }}>
              6 letters and numbers, from your rep
            </Text>
          </View>

          <View style={{ rowGap: 12 }}>
            <Pressable
              onPress={() => setViewState("invited")}
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
                Join class
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.replace("/(tabs)")}
              accessibilityRole="button"
              style={{
                height: 44,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text variant="label-lg" style={{ color: isDark ? "#818CF8" : "#4F46E5" }}>
                Back to start
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const isFollowing = viewState === "following";

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }}
      edges={["top", "left", "right", "bottom"]}
    >
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 24,
          paddingBottom: 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header with Back Button */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <Pressable
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace(isSignedIn ? "/(tabs)" : "/setup/welcome");
              }
            }}
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={12}
            style={{
              flexDirection: "row",
              alignItems: "center",
              columnGap: 4,
              paddingVertical: 6,
            }}
          >
            <ChevronLeft size={22} color={isDark ? "#F8FAFC" : "#0F172A"} strokeWidth={2.2} />
            <Text variant="label" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
              Back
            </Text>
          </Pressable>

          {initialCode === "CATALOG" ? (
            <View style={{ flexDirection: "row", columnGap: 6 }}>
              {(
                [
                  { key: "CSC3X9", label: "300L" },
                  { key: "CSC200", label: "200L" },
                  { key: "ECO300", label: "ECO" },
                ] as const
              ).map((tab) => {
                const active = activePresetKey === tab.key;
                return (
                  <Pressable
                    key={tab.key}
                    onPress={() => handleSwitchPreset(tab.key)}
                    style={{
                      paddingVertical: 5,
                      paddingHorizontal: 10,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: active ? "#4F46E5" : isDark ? "#334155" : "#CBD5E1",
                      backgroundColor: active
                        ? isDark
                          ? "#1E1B4B"
                          : "#EEF2FF"
                        : isDark
                          ? "#1E293B"
                          : "#FFFFFF",
                    }}
                  >
                    <Text
                      variant="caption"
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
                      {tab.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}
        </View>

        {/* Headline (Screen 03 / Screen 06) */}
        <Text
          variant="display"
          style={{
            color: isDark ? "#F8FAFC" : "#0F172A",
            fontSize: 26,
            lineHeight: 32,
            fontFamily: "Inter_700Bold",
            marginBottom: 16,
          }}
        >
          {isFollowing ? "Subscription saved" : "You've been invited to a\nclass"}
        </Text>

        {/* Class Preview Card */}
        <View
          style={{
            backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
            borderRadius: 20,
            borderWidth: 1,
            borderColor: isDark ? "#334155" : "#E2E8F0",
            padding: 20,
            marginBottom: 16,
          }}
        >
          {/* 52x52 Rounded Cap Icon */}
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              backgroundColor: isDark ? "#1E1B4B" : "#EEF2FF",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <GraduationCap size={26} color={isDark ? "#818CF8" : "#4F46E5"} strokeWidth={2} />
          </View>

          <Text
            variant="title-page"
            style={{
              color: isDark ? "#F8FAFC" : "#0F172A",
              fontSize: 22,
              lineHeight: 28,
              marginBottom: 6,
            }}
          >
            {preset.title}
          </Text>

          <Text
            variant="body-lg"
            style={{
              color: isDark ? "#94A3B8" : "#334155",
              fontFamily: "Inter_400Regular",
              lineHeight: 22,
              marginBottom: 12,
            }}
          >
            {preset.institution} · 2026/2027 · First semester
          </Text>

          {/* Rep Row */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: isDark ? "#1E1B4B" : "#EEF2FF",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 10,
              }}
            >
              <Text
                variant="caption"
                style={{
                  fontFamily: "Inter_600SemiBold",
                  color: isDark ? "#818CF8" : "#4F46E5",
                }}
              >
                {preset.repName.charAt(0)}
              </Text>
            </View>
            <Text
              variant="body-lg"
              style={{
                color: isDark ? "#CBD5E1" : "#334155",
                fontFamily: "Inter_400Regular",
              }}
            >
              Run by {preset.repName} (rep) and 2 editors
            </Text>
          </View>

          {/* Members + Courses Row */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              columnGap: 20,
              marginBottom: 8,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Users size={16} color={isDark ? "#94A3B8" : "#334155"} strokeWidth={2} />
              <Text
                variant="body"
                style={{
                  color: isDark ? "#CBD5E1" : "#334155",
                  marginLeft: 6,
                }}
              >
                {preset.memberCount} members
              </Text>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <GraduationCap size={16} color={isDark ? "#94A3B8" : "#334155"} strokeWidth={2} />
              <Text
                variant="body"
                style={{
                  color: isDark ? "#CBD5E1" : "#334155",
                  marginLeft: 6,
                }}
              >
                {catalogCourses.length} courses
              </Text>
            </View>
          </View>

          {/* Weekly Classes Row */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <Calendar size={16} color={isDark ? "#94A3B8" : "#334155"} strokeWidth={2} />
            <Text
              variant="body"
              style={{
                color: isDark ? "#CBD5E1" : "#334155",
                marginLeft: 6,
              }}
            >
              {preset.weeklyClassesCount} classes a week
            </Text>
          </View>

          {/* Inherited Settings & Coursework Notice */}
          <View
            style={{
              backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
              borderRadius: 12,
              padding: 12,
              borderWidth: 1,
              borderColor: isDark ? "#334155" : "#E2E8F0",
              marginBottom: 16,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
              <Sparkles size={15} color={isDark ? "#818CF8" : "#4F46E5"} strokeWidth={2} />
              <Text
                variant="label"
                style={{
                  marginLeft: 6,
                  color: isDark ? "#F8FAFC" : "#0F172A",
                  fontFamily: "Inter_600SemiBold",
                }}
              >
                All course & class settings carry on to you
              </Text>
            </View>
            <Text
              variant="caption"
              style={{
                color: isDark ? "#94A3B8" : "#475569",
                lineHeight: 18,
              }}
            >
              Course units, lecturer contacts, per-day times & venues, rep venue moves or
              cancellations, assignments, and exam schedules sync automatically for the courses you
              subscribe to.
            </Text>
          </View>

          {/* Courses inside this shared class */}
          <View style={{ marginBottom: 16, rowGap: 8 }}>
            <Text
              variant="caption"
              style={{
                color: isDark ? "#94A3B8" : "#64748B",
                fontFamily: "Inter_600SemiBold",
              }}
            >
              COURSES IN THIS TIMETABLE ({catalogCourses.length})
            </Text>
            {catalogCourses.map((course) => (
              <View
                key={course.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingVertical: 8,
                  paddingHorizontal: 10,
                  borderRadius: 10,
                  backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: course.color,
                      marginRight: 8,
                    }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text
                      variant="label"
                      style={{
                        color: isDark ? "#F8FAFC" : "#0F172A",
                        fontFamily: "Inter_600SemiBold",
                      }}
                    >
                      {course.code} · {course.title}
                    </Text>
                    <Text variant="caption" style={{ color: isDark ? "#94A3B8" : "#64748B" }}>
                      {course.units} units
                      {course.lecturerName ? ` · ${course.lecturerName}` : ""}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Primary / Outlined CTA */}
          {isFollowing ? (
            <>
              <Pressable
                onPress={async () => {
                  if (!isSignedIn) {
                    router.push("/setup/welcome?mode=signup&next=/setup/complete" as any);
                    return;
                  }
                  if (!hasCompletedOnboarding) {
                    await completeOnboarding();
                  }
                  router.replace("/(tabs)");
                }}
                accessibilityRole="button"
                style={{
                  height: 52,
                  borderRadius: 12,
                  backgroundColor: "#4F46E5",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 10,
                }}
              >
                <Text variant="label-lg" style={{ color: "#FFFFFF" }}>
                  {isSignedIn ? "Open Today timetable" : "Continue · Create account"}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setSubscribeSheetOpen(true)}
                accessibilityRole="button"
                style={{
                  height: 46,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: isDark ? "#334155" : "#CBD5E1",
                  backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 10,
                }}
              >
                <Text variant="label" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                  Change subscription mode or selected courses
                </Text>
              </Pressable>

              <Text
                variant="body"
                style={{
                  color: isDark ? "#4ADE80" : "#15803D",
                  fontFamily: "Inter_500Medium",
                  marginBottom: 8,
                }}
              >
                Subscribed as{" "}
                {subscriptionMode === "main"
                  ? "Main class (all courses)"
                  : subscriptionMode === "carryover"
                    ? `Carry-over (${selectedCourseIds.length} course${selectedCourseIds.length > 1 ? "s" : ""})`
                    : `Elective (${selectedCourseIds.length} course${selectedCourseIds.length > 1 ? "s" : ""})`}
              </Text>
            </>
          ) : (
            <>
              <Pressable
                onPress={() => {
                  const defaultMode = existingSub?.mode ?? preset.defaultMode;
                  setSubscriptionMode(defaultMode);
                  if (existingSub) {
                    setSelectedCourseIds(existingSub.selectedCourseIds);
                  } else if (defaultMode === "main") {
                    setSelectedCourseIds(catalogCourses.map((c) => c.id));
                  } else {
                    setSelectedCourseIds(catalogCourses[0] ? [catalogCourses[0].id] : []);
                  }
                  setSubscribeSheetOpen(true);
                }}
                accessibilityRole="button"
                style={{
                  height: 52,
                  borderRadius: 12,
                  backgroundColor: "#4F46E5",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 10,
                }}
              >
                <Text variant="label-lg" style={{ color: "#FFFFFF" }}>
                  Follow class or courses
                </Text>
              </Pressable>

              <Text
                variant="body"
                style={{
                  color: isDark ? "#94A3B8" : "#475569",
                  lineHeight: 20,
                  marginBottom: 8,
                }}
              >
                Choose Main class, Carry-over courses, or Elective courses from another department.
              </Text>
            </>
          )}

          {/* Report this class */}
          <Pressable
            onPress={() => {
              setReportSubmitted(false);
              setReportSheetOpen(true);
            }}
            accessibilityRole="button"
            style={{
              flexDirection: "row",
              alignItems: "center",
              alignSelf: "flex-start",
              paddingVertical: 4,
            }}
          >
            <Flag size={14} color={isDark ? "#94A3B8" : "#475569"} strokeWidth={2} />
            <Text
              variant="body"
              style={{
                color: isDark ? "#94A3B8" : "#475569",
                marginLeft: 6,
              }}
            >
              {reportSubmitted ? "Report sent · Thank you" : "Report this class"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* 3-Mode Subscription & Selective Course Picker Sheet */}
      <Sheet isOpen={subscribeSheetOpen} onClose={() => setSubscribeSheetOpen(false)}>
        <ScrollView style={{ maxHeight: 540 }} showsVerticalScrollIndicator={false}>
          <View style={{ paddingBottom: 12 }}>
            <Text
              variant="title-page"
              style={{
                color: isDark ? "#F8FAFC" : "#0F172A",
                fontSize: 20,
                lineHeight: 26,
                marginBottom: 6,
              }}
            >
              How are you taking {preset.title}?
            </Text>

            <Text
              variant="body"
              style={{
                color: isDark ? "#94A3B8" : "#475569",
                marginBottom: 16,
              }}
            >
              All course details, lecturer contacts, per-day venues, assignments, exams, and rep
              updates carry on to your timetable.
            </Text>

            {/* 3 Subscription Mode Options */}
            <View style={{ rowGap: 10, marginBottom: 18 }}>
              {(
                [
                  {
                    id: "main",
                    title: "Main class (All courses)",
                    subtitle: `Follow all ${catalogCourses.length} courses in ${preset.title}`,
                  },
                  {
                    id: "carryover",
                    title: "Carry-over course(s) (Lower level)",
                    subtitle: "Pick only the specific lower-level course(s) you are retaking",
                  },
                  {
                    id: "elective",
                    title: "Elective course(s) (Other department)",
                    subtitle: `Pick specific elective course(s) from ${preset.department}`,
                  },
                ] as const
              ).map((opt) => {
                const isSelected = subscriptionMode === opt.id;
                return (
                  <Pressable
                    key={opt.id}
                    onPress={() => {
                      setSubscriptionMode(opt.id);
                      if (opt.id === "main") {
                        setSelectedCourseIds(catalogCourses.map((c) => c.id));
                      } else if (selectedCourseIds.length === catalogCourses.length) {
                        setSelectedCourseIds(catalogCourses[0] ? [catalogCourses[0].id] : []);
                      }
                    }}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: isSelected }}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      padding: 12,
                      borderRadius: 12,
                      borderWidth: 1.5,
                      borderColor: isSelected ? "#4F46E5" : isDark ? "#334155" : "#E2E8F0",
                      backgroundColor: isSelected
                        ? isDark
                          ? "#1E1B4B"
                          : "#EEF2FF"
                        : isDark
                          ? "#0F172A"
                          : "#F8FAFC",
                    }}
                  >
                    <View
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 11,
                        borderWidth: 2,
                        borderColor: isSelected ? "#4F46E5" : "#94A3B8",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 12,
                      }}
                    >
                      {isSelected ? (
                        <View
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: "#4F46E5",
                          }}
                        />
                      ) : null}
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text
                        variant="label-lg"
                        style={{
                          color: isDark ? "#F8FAFC" : "#0F172A",
                          fontFamily: "Inter_600SemiBold",
                        }}
                      >
                        {opt.title}
                      </Text>
                      <Text
                        variant="caption"
                        style={{
                          color: isDark ? "#94A3B8" : "#475569",
                          marginTop: 2,
                        }}
                      >
                        {opt.subtitle}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {/* Selective Course Checklist for Carry-Over or Elective */}
            {subscriptionMode !== "main" ? (
              <View
                style={{
                  backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                  borderRadius: 14,
                  padding: 14,
                  borderWidth: 1,
                  borderColor: isDark ? "#334155" : "#E2E8F0",
                  marginBottom: 18,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                  <BookOpen size={16} color={isDark ? "#818CF8" : "#4F46E5"} strokeWidth={2} />
                  <Text
                    variant="label"
                    style={{
                      marginLeft: 6,
                      color: isDark ? "#F8FAFC" : "#0F172A",
                      fontFamily: "Inter_600SemiBold",
                    }}
                  >
                    {subscriptionMode === "carryover"
                      ? `Select your carry-over course(s) from ${preset.level}`
                      : `Select your elective course(s) from ${preset.department}`}
                  </Text>
                </View>

                <Text
                  variant="caption"
                  style={{
                    color: isDark ? "#94A3B8" : "#64748B",
                    marginBottom: 12,
                  }}
                >
                  Unchecked courses stay hidden so your Today screen and reminders are never flooded
                  with classes you do not take.
                </Text>

                <View style={{ rowGap: 8 }}>
                  {catalogCourses.map((course) => {
                    const checked = selectedCourseIds.includes(course.id);
                    return (
                      <Pressable
                        key={course.id}
                        onPress={() => toggleCourseSelection(course.id)}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked }}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          padding: 10,
                          borderRadius: 10,
                          borderWidth: 1,
                          borderColor: checked ? "#4F46E5" : isDark ? "#334155" : "#CBD5E1",
                          backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                        }}
                      >
                        <View
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: 6,
                            backgroundColor: checked ? "#4F46E5" : "transparent",
                            borderWidth: checked ? 0 : 1.5,
                            borderColor: isDark ? "#64748B" : "#94A3B8",
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: 10,
                          }}
                        >
                          {checked ? <Check size={14} color="#FFFFFF" strokeWidth={2.5} /> : null}
                        </View>

                        <View style={{ flex: 1 }}>
                          <Text
                            variant="label"
                            style={{
                              color: isDark ? "#F8FAFC" : "#0F172A",
                              fontFamily: "Inter_600SemiBold",
                            }}
                          >
                            {course.code} · {course.title}
                          </Text>
                          <Text variant="caption" style={{ color: isDark ? "#94A3B8" : "#64748B" }}>
                            {course.units} units
                            {course.lecturerName ? ` · ${course.lecturerName}` : ""} · Schedule &
                            updates included
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ) : null}

            <Pressable
              onPress={handleConfirmSubscription}
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
                {subscriptionMode === "main"
                  ? `Follow all ${catalogCourses.length} courses`
                  : subscriptionMode === "carryover"
                    ? `Subscribe to ${selectedCourseIds.length} carry-over course${selectedCourseIds.length > 1 ? "s" : ""}`
                    : `Subscribe to ${selectedCourseIds.length} elective course${selectedCourseIds.length > 1 ? "s" : ""}`}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </Sheet>

      {/* Course Clash Resolution Bottom Sheet (Screen 16) */}
      <Sheet isOpen={clashSheetOpen} onClose={() => setClashSheetOpen(false)}>
        <View style={{ paddingBottom: 8 }}>
          <Text
            variant="title-page"
            style={{
              color: isDark ? "#F8FAFC" : "#0F172A",
              fontSize: 22,
              lineHeight: 28,
              marginBottom: 10,
            }}
          >
            2 courses are already in your{"\n"}timetable
          </Text>

          <Text
            variant="body-lg"
            style={{
              color: isDark ? "#94A3B8" : "#334155",
              fontFamily: "Inter_400Regular",
              lineHeight: 22,
              marginBottom: 20,
            }}
          >
            CSC 301 and MTH 301 are in both your own timetable and CSC 300L. Which should TT use?
          </Text>

          {/* Radio Option 1 */}
          <Pressable
            onPress={() => setClashOption("rep")}
            accessibilityRole="radio"
            accessibilityState={{ checked: clashOption === "rep" }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: clashOption === "rep" ? "#4F46E5" : "#CBD5E1",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              {clashOption === "rep" ? (
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
              variant="body-lg"
              style={{
                flex: 1,
                color: isDark ? "#F8FAFC" : "#0F172A",
                fontFamily: "Inter_400Regular",
                lineHeight: 22,
              }}
            >
              Use the rep&apos;s timetable (mine are hidden, not deleted)
            </Text>
          </Pressable>

          {/* Radio Option 2 */}
          <Pressable
            onPress={() => setClashOption("mine")}
            accessibilityRole="radio"
            accessibilityState={{ checked: clashOption === "mine" }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: clashOption === "mine" ? "#4F46E5" : "#CBD5E1",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              {clashOption === "mine" ? (
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
              variant="body-lg"
              style={{
                flex: 1,
                color: isDark ? "#F8FAFC" : "#0F172A",
                fontFamily: "Inter_400Regular",
              }}
            >
              Keep mine
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              setClashSheetOpen(false);
              setViewState("following");
            }}
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
              Continue
            </Text>
          </Pressable>
        </View>
      </Sheet>

      {/* Screen 26 · Report a shared class */}
      <Sheet
        isOpen={reportSheetOpen}
        onClose={() => setReportSheetOpen(false)}
        title={`Report ${preset.title.split("·")[0]?.trim() ?? "shared class"}`}
      >
        <View style={{ paddingBottom: 12, rowGap: 14 }}>
          <Text variant="body" style={{ color: isDark ? "#94A3B8" : "#475569" }}>
            Why are you reporting this shared class? Your report is anonymous.
          </Text>

          {[
            { id: "wrong_class", label: "Wrong courses or timetable times" },
            { id: "impersonation", label: "Impersonating our course rep" },
            { id: "spam", label: "Spam or inappropriate content" },
          ].map((opt) => {
            const selected = reportReason === opt.id;
            return (
              <Pressable
                key={opt.id}
                onPress={() => setReportReason(opt.id)}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: selected ? "#4F46E5" : isDark ? "#334155" : "#CBD5E1",
                  backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                }}
              >
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: selected ? "#4F46E5" : isDark ? "#64748B" : "#CBD5E1",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  {selected ? (
                    <View
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: "#4F46E5",
                      }}
                    />
                  ) : null}
                </View>
                <Text variant="body-lg" style={{ color: isDark ? "#F8FAFC" : "#0F172A", flex: 1 }}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}

          <Pressable
            onPress={() => {
              setReportSubmitted(true);
              setReportSheetOpen(false);
            }}
            accessibilityRole="button"
            style={{
              height: 50,
              borderRadius: 12,
              backgroundColor: "#DC2626",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 4,
            }}
          >
            <Text variant="label-lg" style={{ color: "#FFFFFF" }}>
              Send report
            </Text>
          </Pressable>
        </View>
      </Sheet>
    </SafeAreaView>
  );
}
