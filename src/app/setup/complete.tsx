import React from "react";
import { View, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Check, Share2 } from "lucide-react-native";
import { Text } from "@/components/ui/Text";
import { useTheme } from "@/theme";
import { useAuth } from "@/auth";
import { useTimetable } from "@/hooks/useTimetable";

export default function SetupCompleteScreen() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { completeOnboarding, hasCompletedOnboarding } = useAuth();

  const { data } = useTimetable();
  const courseCount = data.courses.length;
  const weeklyClassCount = data.classRules.length;
  const breakCount = data.breaks.length;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }}
      edges={["top", "left", "right", "bottom"]}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 20,
          paddingTop: 56,
          paddingBottom: 24,
          justifyContent: "space-between",
        }}
        showsVerticalScrollIndicator={false}
      >
        <View>
          {/* Green Check Circle */}
          <View style={{ alignItems: "center", marginBottom: 24 }}>
            <View
              style={{
                width: 88,
                height: 88,
                borderRadius: 44,
                backgroundColor: isDark ? "#052E16" : "#ECFDF5",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Check size={36} color={isDark ? "#4ADE80" : "#16A34A"} strokeWidth={2.2} />
            </View>
          </View>

          <Text
            variant="title-page"
            style={{
              color: isDark ? "#F8FAFC" : "#0F172A",
              textAlign: "center",
              marginBottom: 24,
            }}
          >
            Your timetable is ready
          </Text>

          {/* 3 Stat Cards Row */}
          <View
            style={{
              flexDirection: "row",
              columnGap: 10,
              marginBottom: 20,
            }}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: isDark ? "#1E293B" : "#F1F5F9",
                borderRadius: 16,
                padding: 16,
              }}
            >
              <Text
                variant="caption"
                style={{ color: isDark ? "#94A3B8" : "#475569", marginBottom: 8 }}
              >
                courses
              </Text>
              <Text
                variant="display"
                style={{
                  color: isDark ? "#F8FAFC" : "#0F172A",
                  fontVariant: ["tabular-nums"],
                }}
              >
                {courseCount}
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                backgroundColor: isDark ? "#1E293B" : "#F1F5F9",
                borderRadius: 16,
                padding: 16,
              }}
            >
              <Text
                variant="caption"
                numberOfLines={1}
                style={{ color: isDark ? "#94A3B8" : "#475569", marginBottom: 8 }}
              >
                classes a week
              </Text>
              <Text
                variant="display"
                style={{
                  color: isDark ? "#F8FAFC" : "#0F172A",
                  fontVariant: ["tabular-nums"],
                }}
              >
                {weeklyClassCount}
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                backgroundColor: isDark ? "#1E293B" : "#F1F5F9",
                borderRadius: 16,
                padding: 16,
              }}
            >
              <Text
                variant="caption"
                style={{ color: isDark ? "#94A3B8" : "#475569", marginBottom: 8 }}
              >
                break
              </Text>
              <Text
                variant="display"
                style={{
                  color: isDark ? "#F8FAFC" : "#0F172A",
                  fontVariant: ["tabular-nums"],
                }}
              >
                {breakCount}
              </Text>
            </View>
          </View>

          {/* Course Rep Callout Card */}
          <View
            style={{
              backgroundColor: isDark ? "#1E1B4B" : "#EEF2FF",
              borderRadius: 16,
              padding: 16,
            }}
          >
            <Text
              variant="title-card"
              style={{
                color: isDark ? "#818CF8" : "#4338CA",
                fontSize: 17,
                lineHeight: 24,
                marginBottom: 8,
              }}
            >
              Are you the course rep?
            </Text>
            <Text
              variant="body-lg"
              style={{
                color: isDark ? "#A5B4FC" : "#4338CA",
                fontFamily: "Inter_400Regular",
                lineHeight: 22,
              }}
            >
              Share this timetable and your classmates get it in one tap, with every change you
              make.
            </Text>
          </View>
        </View>

        {/* Bottom CTAs */}
        <View style={{ rowGap: 12, marginTop: 32 }}>
          <Pressable
            onPress={async () => {
              await completeOnboarding();
              if (typeof router.canDismiss === "function" && router.canDismiss()) {
                router.dismissAll();
              }
              router.replace("/(tabs)" as any);
              setTimeout(() => {
                router.push("/share/create" as any);
              }, 60);
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
              Share with my class
            </Text>
          </Pressable>

          <Pressable
            onPress={async () => {
              if (hasCompletedOnboarding) {
                if (typeof router.canDismiss === "function" && router.canDismiss()) {
                  router.dismissAll();
                }
                router.replace("/(tabs)" as any);
                return;
              }
              router.replace("/setup/profile?step=turn-on-reminders&next=/(tabs)" as any);
            }}
            accessibilityRole="button"
            style={{
              height: 52,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: isDark ? "#334155" : "#CBD5E1",
              backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text variant="label-lg" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
              Go to Today
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
