import React, { useState } from "react";
import { View, ScrollView, Pressable, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft, ChevronDown, Share2 } from "lucide-react-native";
import { Text } from "@/components/ui/Text";
import { ShareClassSheet } from "@/components/timetable";
import { useTheme } from "@/theme";
import { useAuth } from "@/auth";
import { useTimetable } from "@/hooks/useTimetable";
import { enqueueOutboxMutation } from "@/lib/sync";

export default function CreateSharedClassScreen() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { user, hasCompletedOnboarding } = useAuth();
  const { data } = useTimetable();

  const mainGroup = data.followedSubscriptions[0];
  const defaultCodePrefix = data.courses[0]?.code.split(" ")[0] ?? "CSC";
  const defaultClassName = mainGroup?.title ?? `${defaultCodePrefix} 300L · Computer Science`;

  const [classNameText, setClassNameText] = useState(defaultClassName);
  const [institution, setInstitution] = useState(
    data.student.institution ?? "University of Benin (UNIBEN)",
  );
  const [level, setLevel] = useState("300L");
  const [session, setSession] = useState(
    data.semester.name.match(/\d{4}\/\d{4}/)?.[0] ?? "2026/2027",
  );
  const [semesterText, setSemesterText] = useState(
    `${data.semester.name || "First semester 2026/2027"} · ${data.semester.startDate} to ${data.semester.endDate}`,
  );
  const [shareSheetOpen, setShareSheetOpen] = useState(false);
  const [hasCreatedClass, setHasCreatedClass] = useState(false);
  const shareCode = mainGroup?.shareCode ?? "CSC3X9";

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
              Share your timetable
            </Text>
          </View>

          <Text
            variant="body-lg"
            style={{
              color: isDark ? "#94A3B8" : "#334155",
              fontFamily: "Inter_400Regular",
              lineHeight: 22,
              marginBottom: 16,
            }}
          >
            Name your class so classmates know they&apos;re joining the right one.
          </Text>

          {/* Class name */}
          <View style={{ marginBottom: 20 }}>
            <Text
              variant="label"
              style={{ color: isDark ? "#CBD5E1" : "#334155", marginBottom: 6 }}
            >
              Class name
            </Text>
            <TextInput
              value={classNameText}
              onChangeText={setClassNameText}
              style={{
                height: 48,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: "#4F46E5",
                backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                paddingHorizontal: 14,
                fontFamily: "Inter_400Regular",
                fontSize: 15,
                color: isDark ? "#F8FAFC" : "#0F172A",
              }}
            />
            <Text variant="caption" style={{ color: isDark ? "#94A3B8" : "#475569", marginTop: 6 }}>
              Department and level work best
            </Text>
          </View>

          {/* Institution */}
          <View style={{ marginBottom: 20 }}>
            <Text
              variant="label"
              style={{ color: isDark ? "#CBD5E1" : "#334155", marginBottom: 6 }}
            >
              Institution
            </Text>
            <TextInput
              value={institution}
              onChangeText={setInstitution}
              placeholder="e.g. University of Benin (UNIBEN)"
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
                color: isDark ? "#F8FAFC" : "#0F172A",
              }}
            />
          </View>

          {/* Level & Session Row */}
          <View
            style={{
              flexDirection: "row",
              columnGap: 12,
              marginBottom: 20,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                variant="label"
                style={{ color: isDark ? "#CBD5E1" : "#334155", marginBottom: 6 }}
              >
                Level
              </Text>
              <View
                style={{
                  height: 48,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: isDark ? "#334155" : "#CBD5E1",
                  backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                  paddingHorizontal: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <TextInput
                  value={level}
                  onChangeText={setLevel}
                  style={{
                    flex: 1,
                    fontFamily: "Inter_400Regular",
                    fontSize: 15,
                    color: isDark ? "#F8FAFC" : "#0F172A",
                  }}
                />
                <ChevronDown size={18} color={isDark ? "#94A3B8" : "#475569"} />
              </View>
            </View>

            <View style={{ flex: 1 }}>
              <Text
                variant="label"
                style={{ color: isDark ? "#CBD5E1" : "#334155", marginBottom: 6 }}
              >
                Session
              </Text>
              <View
                style={{
                  height: 48,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: isDark ? "#334155" : "#CBD5E1",
                  backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                  paddingHorizontal: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <TextInput
                  value={session}
                  onChangeText={setSession}
                  style={{
                    flex: 1,
                    fontFamily: "Inter_400Regular",
                    fontSize: 15,
                    color: isDark ? "#F8FAFC" : "#0F172A",
                  }}
                />
                <ChevronDown size={18} color={isDark ? "#94A3B8" : "#475569"} />
              </View>
            </View>
          </View>

          {/* Semester */}
          <View style={{ marginBottom: 20 }}>
            <Text
              variant="label"
              style={{ color: isDark ? "#CBD5E1" : "#334155", marginBottom: 6 }}
            >
              Semester
            </Text>
            <View
              style={{
                height: 48,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: isDark ? "#334155" : "#CBD5E1",
                backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                paddingHorizontal: 14,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <TextInput
                value={semesterText}
                onChangeText={setSemesterText}
                style={{
                  flex: 1,
                  fontFamily: "Inter_400Regular",
                  fontSize: 15,
                  color: isDark ? "#F8FAFC" : "#0F172A",
                }}
              />
              <ChevronDown size={18} color={isDark ? "#94A3B8" : "#475569"} />
            </View>
            <Text variant="caption" style={{ color: isDark ? "#94A3B8" : "#475569", marginTop: 6 }}>
              Dates and breaks come from your setup
            </Text>
          </View>

          {/* What classmates get Callout */}
          <View
            style={{
              backgroundColor: isDark ? "#1E293B" : "#F1F5F9",
              borderRadius: 16,
              padding: 16,
            }}
          >
            <Text
              variant="title-card"
              style={{
                color: isDark ? "#F8FAFC" : "#0F172A",
                marginBottom: 8,
              }}
            >
              What classmates get
            </Text>
            <Text
              variant="body-lg"
              style={{
                color: isDark ? "#CBD5E1" : "#334155",
                fontFamily: "Inter_400Regular",
                lineHeight: 22,
                marginBottom: 6,
              }}
            >
              • Classes, assignments and exams, updated live
            </Text>
            <Text
              variant="body-lg"
              style={{
                color: isDark ? "#CBD5E1" : "#334155",
                fontFamily: "Inter_400Regular",
                lineHeight: 22,
              }}
            >
              • Their own reminders, notes and attendance
            </Text>
          </View>
        </ScrollView>

        {/* Bottom CTA */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 16, rowGap: 10 }}>
          <Pressable
            onPress={() => {
              const now = new Date().toISOString();
              void enqueueOutboxMutation("course_groups", "insert", "group-csc-300l", {
                id: "group-csc-300l",
                owner_student_id: user.studentId,
                name: classNameText.trim() || defaultClassName,
                institution: institution.trim() || "University of Benin (UNIBEN)",
                share_code: shareCode,
                updated_at: now,
              });
              setHasCreatedClass(true);
              setShareSheetOpen(true);
            }}
            accessibilityRole="button"
            style={{
              height: 52,
              borderRadius: 12,
              backgroundColor: "#4F46E5",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Share2 size={18} color="#FFFFFF" strokeWidth={2.2} />
            <Text variant="label-lg" style={{ color: "#FFFFFF", marginLeft: 8 }}>
              {hasCreatedClass ? "Share class link & QR again" : "Create class and share"}
            </Text>
          </Pressable>

          <View style={{ flexDirection: "row", columnGap: 10 }}>
            <Pressable
              onPress={() => router.push("/share/projector")}
              accessibilityRole="button"
              style={{
                flex: 1,
                height: 46,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: isDark ? "#334155" : "#CBD5E1",
                backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 10,
              }}
            >
              <Text
                variant="label"
                numberOfLines={1}
                style={{ color: isDark ? "#E2E8F0" : "#0F172A" }}
              >
                Projector ({shareCode})
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push("/class-settings" as any)}
              accessibilityRole="button"
              style={{
                flex: 1,
                height: 46,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: isDark ? "#334155" : "#CBD5E1",
                backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 10,
              }}
            >
              <Text
                variant="label"
                numberOfLines={1}
                style={{ color: isDark ? "#E2E8F0" : "#0F172A" }}
              >
                Class settings
              </Text>
            </Pressable>
          </View>

          {hasCreatedClass || !hasCompletedOnboarding ? (
            <Pressable
              onPress={() => {
                if (!hasCompletedOnboarding) {
                  router.push("/setup/profile?step=turn-on-reminders");
                } else {
                  router.replace("/(tabs)");
                }
              }}
              accessibilityRole="button"
              style={{
                height: 44,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                variant="label"
                style={{
                  color: isDark ? "#818CF8" : "#4F46E5",
                  fontFamily: "Inter_600SemiBold",
                }}
              >
                Done · Go to Today
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <ShareClassSheet
        isOpen={shareSheetOpen}
        onClose={() => setShareSheetOpen(false)}
        classNameTitle={classNameText.split("·")[0]?.trim() || "CSC 300L"}
        shareCode={shareCode}
      />
    </SafeAreaView>
  );
}
