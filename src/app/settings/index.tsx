import React, { useEffect, useState } from "react";
import { View, ScrollView, Pressable, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  GraduationCap,
  Bell,
  Check,
  BarChart2,
  ShieldCheck,
  Moon,
  HelpCircle,
  RefreshCw,
} from "lucide-react-native";
import { Text } from "@/components/ui/Text";
import { Sheet } from "@/components/ui/Sheet";
import { StudentAvatar } from "@/components/ui/StudentAvatar";
import { useTheme } from "@/theme";
import { useAuth } from "@/auth";
import { useTimetable, useCloudSyncStatus, useTriggerCloudSync } from "@/hooks/useTimetable";
import { loadReminderPreferences, type ReminderPreferences } from "@/lib/reminders";

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { user } = useAuth();
  const syncStatus = useCloudSyncStatus();
  const triggerSync = useTriggerCloudSync();

  const { data } = useTimetable();
  const courseCount = data.courses.length;

  const [reminderPrefs, setReminderPrefs] = useState<ReminderPreferences | null>(null);
  const attendanceTargetPct = reminderPrefs?.attendanceTargetPct ?? 75;
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackCategory, setFeedbackCategory] = useState<"bug" | "feature" | "timetable">(
    "feature",
  );
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    void loadReminderPreferences().then(setReminderPrefs);
  }, []);

  const cycleTheme = () => {
    const next = theme === "system" ? "light" : theme === "light" ? "dark" : "system";
    setTheme(next);
  };

  const themeLabel = theme === "system" ? "System" : theme === "dark" ? "Dark" : "Light";
  const leadLabel =
    reminderPrefs?.leadMinutes === 60 ? "1 hour before class" : "30 min before class";
  const checkInSummary = `${
    reminderPrefs?.checkInsDelayMinutes === 30 ? "30 min after class" : "After every class"
  }, ${courseCount} courses`;
  const setupCheckSummary = reminderPrefs?.batteryFixed
    ? "All checks passed"
    : "1 thing needs fixing";

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }}
      edges={["top", "left", "right"]}
    >
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 36 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header (Screen 80) */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            height: 48,
            marginBottom: 12,
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
            Settings
          </Text>
        </View>

        {/* Profile Card */}
        <Pressable
          onPress={() => router.push("/settings/account" as any)}
          accessibilityRole="button"
          style={{
            backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: isDark ? "#334155" : "#E2E8F0",
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <View style={{ marginRight: 14 }}>
              <StudentAvatar
                avatarUrl={user.avatarUrl}
                initials={user.initials}
                size={48}
                borderWidth={2}
                borderColor="#FFFFFF"
              />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap" }}>
                <Text
                  variant="title-card"
                  style={{ color: isDark ? "#F8FAFC" : "#0F172A", marginRight: 8 }}
                >
                  {user.displayName || "Student"}
                </Text>
                {user.username ? (
                  <Text
                    variant="caption"
                    style={{
                      color: isDark ? "#818CF8" : "#4F46E5",
                      fontFamily: "Inter_600SemiBold",
                    }}
                  >
                    @{user.username}
                  </Text>
                ) : null}
              </View>
              <Text variant="body" style={{ color: isDark ? "#94A3B8" : "#475569", marginTop: 2 }}>
                {user.email || "Tap to manage profile & photo"}
              </Text>
            </View>
          </View>
          <Edit size={18} color={isDark ? "#94A3B8" : "#475569"} strokeWidth={2} />
        </Pressable>

        {/* Timetable Section */}
        <Text
          variant="title-section"
          style={{
            color: isDark ? "#F8FAFC" : "#0F172A",
            marginBottom: 12,
          }}
        >
          Timetable
        </Text>

        <View
          style={{
            backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: isDark ? "#334155" : "#E2E8F0",
            padding: 16,
            rowGap: 20,
            marginBottom: 24,
          }}
        >
          {/* My courses */}
          <Pressable
            onPress={() => router.push("/settings/courses" as any)}
            accessibilityRole="button"
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
              <View style={{ width: 32, alignItems: "flex-start" }}>
                <GraduationCap
                  size={20}
                  color={isDark ? "#94A3B8" : "#475569"}
                  strokeWidth={1.85}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="body-lg" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                  My courses
                </Text>
                <Text
                  variant="body"
                  style={{ color: isDark ? "#94A3B8" : "#475569", marginTop: 2 }}
                >
                  {courseCount} courses this semester
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color={isDark ? "#94A3B8" : "#475569"} strokeWidth={2} />
          </Pressable>

          {/* Shared classes & subscriptions */}
          <Pressable
            onPress={() => router.push("/class-settings" as any)}
            accessibilityRole="button"
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
              <View style={{ width: 32, alignItems: "flex-start" }}>
                <GraduationCap
                  size={20}
                  color={isDark ? "#94A3B8" : "#475569"}
                  strokeWidth={1.85}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="body-lg" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                  Shared classes & subscriptions
                </Text>
                <Text
                  variant="body"
                  style={{ color: isDark ? "#94A3B8" : "#475569", marginTop: 2 }}
                >
                  {data.followedSubscriptions.length > 0
                    ? `${data.followedSubscriptions.length} subscribed · manage or pause`
                    : "Join or manage shared class timetables"}
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color={isDark ? "#94A3B8" : "#475569"} strokeWidth={2} />
          </Pressable>

          {/* Reminders & notifications */}
          <Pressable
            onPress={() => router.push("/settings/reminders" as any)}
            accessibilityRole="button"
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
              <View style={{ width: 32, alignItems: "flex-start" }}>
                <Bell size={20} color={isDark ? "#94A3B8" : "#475569"} strokeWidth={1.85} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="body-lg" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                  Reminders & notifications
                </Text>
                <Text
                  variant="body"
                  style={{ color: isDark ? "#94A3B8" : "#475569", marginTop: 2 }}
                >
                  {leadLabel} · banner, sound & vibration
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color={isDark ? "#94A3B8" : "#475569"} strokeWidth={2} />
          </Pressable>

          {/* Check-ins */}
          <Pressable
            onPress={() => router.push("/settings/check-ins" as any)}
            accessibilityRole="button"
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
              <View style={{ width: 32, alignItems: "flex-start" }}>
                <Check size={20} color={isDark ? "#94A3B8" : "#475569"} strokeWidth={1.85} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="body-lg" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                  Check-ins
                </Text>
                <Text
                  variant="body"
                  style={{ color: isDark ? "#94A3B8" : "#475569", marginTop: 2 }}
                >
                  {checkInSummary}
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color={isDark ? "#94A3B8" : "#475569"} strokeWidth={2} />
          </Pressable>

          {/* Attendance target */}
          <Pressable
            onPress={() => router.push("/settings/attendance-target" as any)}
            accessibilityRole="button"
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
              <View style={{ width: 32, alignItems: "flex-start" }}>
                <BarChart2 size={20} color={isDark ? "#94A3B8" : "#475569"} strokeWidth={1.85} />
              </View>
              <Text variant="body-lg" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                Attendance target
              </Text>
            </View>
            <Text variant="body-lg" style={{ color: isDark ? "#CBD5E1" : "#334155" }}>
              {attendanceTargetPct}%
            </Text>
          </Pressable>
        </View>

        {/* This phone Section */}
        <Text
          variant="title-section"
          style={{
            color: isDark ? "#F8FAFC" : "#0F172A",
            marginBottom: 12,
          }}
        >
          This phone
        </Text>

        <View
          style={{
            backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: isDark ? "#334155" : "#E2E8F0",
            padding: 16,
            rowGap: 20,
            marginBottom: 24,
          }}
        >
          {/* Cloud sync & offline outbox */}
          <Pressable
            onPress={() => triggerSync.mutate()}
            accessibilityRole="button"
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
              <View style={{ width: 32, alignItems: "flex-start" }}>
                <RefreshCw size={20} color={isDark ? "#94A3B8" : "#475569"} strokeWidth={1.85} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="body-lg" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                  Cloud sync & outbox
                </Text>
                <Text
                  variant="body"
                  style={{ color: isDark ? "#94A3B8" : "#475569", marginTop: 2 }}
                >
                  {syncStatus.pendingCount > 0
                    ? `${syncStatus.pendingCount} pending · tap to flush`
                    : syncStatus.isCloudConfigured
                      ? "Supabase cloud synced · tap to refresh"
                      : "All local changes saved · tap to sync"}
                </Text>
              </View>
            </View>
            <Text
              variant="label"
              style={{
                color: syncStatus.pendingCount > 0 ? "#D97706" : isDark ? "#818CF8" : "#4F46E5",
              }}
            >
              {triggerSync.isPending ? "Syncing..." : "Sync now"}
            </Text>
          </Pressable>

          {/* Reminder setup check */}
          <Pressable
            onPress={() => router.push("/settings/reminder-check" as any)}
            accessibilityRole="button"
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
              <View style={{ width: 32, alignItems: "flex-start" }}>
                <ShieldCheck size={20} color={isDark ? "#94A3B8" : "#475569"} strokeWidth={1.85} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="body-lg" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                  Reminder setup check
                </Text>
                <Text
                  variant="body"
                  style={{ color: isDark ? "#94A3B8" : "#475569", marginTop: 2 }}
                >
                  {setupCheckSummary}
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color={isDark ? "#94A3B8" : "#475569"} strokeWidth={2} />
          </Pressable>

          {/* Theme */}
          <Pressable
            onPress={cycleTheme}
            accessibilityRole="button"
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
              <View style={{ width: 32, alignItems: "flex-start" }}>
                <Moon size={20} color={isDark ? "#94A3B8" : "#475569"} strokeWidth={1.85} />
              </View>
              <Text variant="body-lg" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                Theme
              </Text>
            </View>
            <Text variant="body-lg" style={{ color: isDark ? "#CBD5E1" : "#334155" }}>
              {themeLabel}
            </Text>
          </Pressable>
        </View>

        {/* Help Section */}
        <Text
          variant="title-section"
          style={{
            color: isDark ? "#F8FAFC" : "#0F172A",
            marginBottom: 12,
          }}
        >
          Help
        </Text>

        <View
          style={{
            backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: isDark ? "#334155" : "#E2E8F0",
            padding: 16,
            rowGap: 20,
          }}
        >
          <Pressable
            onPress={() => {
              setFeedbackSubmitted(false);
              setFeedbackOpen(true);
            }}
            accessibilityRole="button"
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
              <View style={{ width: 32, alignItems: "flex-start" }}>
                <HelpCircle size={20} color={isDark ? "#94A3B8" : "#475569"} strokeWidth={1.85} />
              </View>
              <Text variant="body-lg" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                Send feedback
              </Text>
            </View>
            <ChevronRight size={18} color={isDark ? "#94A3B8" : "#475569"} strokeWidth={2} />
          </Pressable>

          <Pressable
            onPress={() => router.push("/privacy" as any)}
            accessibilityRole="button"
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
              <View style={{ width: 32, alignItems: "flex-start" }}>
                <ShieldCheck size={20} color={isDark ? "#94A3B8" : "#475569"} strokeWidth={1.85} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="body-lg" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                  Privacy policy & data deletion
                </Text>
                <Text
                  variant="body"
                  style={{ color: isDark ? "#94A3B8" : "#475569", marginTop: 2 }}
                >
                  NDPA 2023 · account & data controls
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color={isDark ? "#94A3B8" : "#475569"} strokeWidth={2} />
          </Pressable>
        </View>
      </ScrollView>

      <Sheet
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        title="Send feedback to TT"
      >
        <View style={{ paddingBottom: 12, rowGap: 14 }}>
          <Text variant="body" style={{ color: isDark ? "#94A3B8" : "#475569" }}>
            Spot a bug, missing department, or have an idea to make TT better for students?
          </Text>

          <View style={{ flexDirection: "row", columnGap: 8 }}>
            {(
              [
                { id: "feature", label: "Suggestion" },
                { id: "bug", label: "Bug report" },
                { id: "timetable", label: "Course / Rep" },
              ] as const
            ).map((opt) => {
              const active = feedbackCategory === opt.id;
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => setFeedbackCategory(opt.id)}
                  accessibilityRole="button"
                  style={{
                    flex: 1,
                    paddingVertical: 8,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: active ? "#4F46E5" : isDark ? "#334155" : "#CBD5E1",
                    backgroundColor: active
                      ? isDark
                        ? "#312E81"
                        : "#EEF2FF"
                      : isDark
                        ? "#0F172A"
                        : "#F8FAFC",
                    alignItems: "center",
                  }}
                >
                  <Text
                    variant="caption"
                    style={{
                      color: active
                        ? isDark
                          ? "#C7D2FE"
                          : "#4F46E5"
                        : isDark
                          ? "#CBD5E1"
                          : "#334155",
                      fontFamily: "Inter_600SemiBold",
                    }}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <TextInput
            value={feedbackText}
            onChangeText={setFeedbackText}
            placeholder="Tell us what happened or what you'd like to see..."
            placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
            multiline
            style={{
              minHeight: 96,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: isDark ? "#334155" : "#CBD5E1",
              backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
              paddingHorizontal: 14,
              paddingVertical: 12,
              textAlignVertical: "top",
              fontFamily: "Inter_400Regular",
              fontSize: 15,
              color: isDark ? "#F8FAFC" : "#0F172A",
            }}
          />

          {feedbackSubmitted ? (
            <View
              style={{
                backgroundColor: isDark ? "#052E16" : "#ECFDF5",
                borderRadius: 12,
                padding: 12,
              }}
            >
              <Text variant="label" style={{ color: isDark ? "#4ADE80" : "#15803D" }}>
                Thank you! Your feedback has been recorded.
              </Text>
            </View>
          ) : null}

          <Pressable
            onPress={() => {
              setFeedbackSubmitted(true);
              setFeedbackText("");
              setTimeout(() => {
                setFeedbackOpen(false);
                setFeedbackSubmitted(false);
              }, 900);
            }}
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
              Send feedback
            </Text>
          </Pressable>
        </View>
      </Sheet>
    </SafeAreaView>
  );
}
