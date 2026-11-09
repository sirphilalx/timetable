import React, { useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Check } from "lucide-react-native";
import { Text } from "@/components/ui/Text";
import { useTheme } from "@/theme";
import { useAuth } from "@/auth";
import { memoryStore } from "@/db/seed";

const STORED_ITEMS = [
  "Their name, email and date of birth",
  "Their timetable, assignments and exams",
  "Whether they attended each class (their answers)",
  "Which class groups they join",
];

export default function ParentConsentApprovalWebScreen() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { user, completeOnboarding } = useAuth();
  const firstName = user.displayName.trim().split(/\s+/)[0] || "this student";

  const [decision, setDecision] = useState<"none" | "approved" | "declined">("none");

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? "#0F172A" : "#FFFFFF" }}
      edges={["top", "left", "right", "bottom"]}
    >
      <View style={{ flex: 1, justifyContent: "space-between" }}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 28, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {/* TT Calendar Emblem Circle (Screen 15) */}
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: isDark ? "#1E293B" : "#F1F5F9",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            <View
              style={{
                width: 34,
                height: 34,
                borderRadius: 6,
                backgroundColor: "#FFFFFF",
                borderWidth: 1.5,
                borderColor: "#CBD5E1",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                variant="label"
                style={{
                  fontFamily: "Inter_700Bold",
                  color: "#4F46E5",
                  fontSize: 13,
                }}
              >
                T
              </Text>
              <Check size={14} color="#0F172A" strokeWidth={2.8} />
            </View>
          </View>

          <Text
            variant="display"
            style={{
              color: isDark ? "#F8FAFC" : "#0F172A",
              fontSize: 26,
              lineHeight: 32,
              fontFamily: "Inter_700Bold",
              marginBottom: 14,
            }}
          >
            {firstName} wants to use TT:{"\n"}Student Timetable
          </Text>

          <Text
            variant="body-lg"
            style={{
              color: isDark ? "#CBD5E1" : "#334155",
              fontFamily: "Inter_400Regular",
              lineHeight: 24,
              marginBottom: 24,
            }}
          >
            TT helps university students keep their class timetable, assignments and exams in one
            place. Because {firstName} is under 18, we need your consent first.
          </Text>

          {/* What TT stores Card */}
          <View
            style={{
              backgroundColor: isDark ? "#1E293B" : "#F1F5F9",
              borderRadius: 16,
              padding: 18,
            }}
          >
            <Text
              variant="title-card"
              style={{
                color: isDark ? "#F8FAFC" : "#0F172A",
                fontSize: 17,
                lineHeight: 24,
                marginBottom: 14,
              }}
            >
              What TT stores
            </Text>

            <View style={{ rowGap: 12, marginBottom: 16 }}>
              {STORED_ITEMS.map((item) => (
                <View key={item} style={{ flexDirection: "row", alignItems: "center" }}>
                  <Check size={18} color="#16A34A" strokeWidth={2.4} />
                  <Text
                    variant="body-lg"
                    style={{
                      color: isDark ? "#E2E8F0" : "#334155",
                      fontFamily: "Inter_400Regular",
                      lineHeight: 22,
                      marginLeft: 12,
                      flex: 1,
                    }}
                  >
                    {item}
                  </Text>
                </View>
              ))}
            </View>

            <Text
              variant="caption"
              style={{
                color: isDark ? "#94A3B8" : "#475569",
                lineHeight: 18,
              }}
            >
              Never sold. No ads for under-18s. You can withdraw consent at any time, which deletes
              the account.
            </Text>
          </View>

          {decision !== "none" ? (
            <View
              style={{
                marginTop: 16,
                padding: 14,
                borderRadius: 12,
                backgroundColor:
                  decision === "approved"
                    ? isDark
                      ? "#052E16"
                      : "#ECFDF5"
                    : isDark
                      ? "#450A0A"
                      : "#FEF2F2",
              }}
            >
              <Text
                variant="body"
                style={{
                  color:
                    decision === "approved"
                      ? isDark
                        ? "#4ADE80"
                        : "#15803D"
                      : isDark
                        ? "#FECACA"
                        : "#B91C1C",
                  fontFamily: "Inter_500Medium",
                }}
              >
                {decision === "approved"
                  ? `Thank you! ${firstName}'s TT account has been approved.`
                  : "Consent declined. No personal data has been stored."}
              </Text>
            </View>
          ) : null}
        </ScrollView>

        {/* Bottom CTAs */}
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: 20,
            borderTopWidth: 1,
            borderTopColor: isDark ? "#1E293B" : "#F1F5F9",
            rowGap: 12,
          }}
        >
          <Pressable
            onPress={async () => {
              memoryStore.student.guardianConsentStatus = "approved";
              await completeOnboarding();
              setDecision("approved");
              setTimeout(() => {
                router.replace("/setup/profile?step=turn-on-reminders&next=/(tabs)" as any);
              }, 800);
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
              I approve
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setDecision("declined")}
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
              Decline
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
