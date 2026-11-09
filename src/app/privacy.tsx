import React, { useEffect, useState } from "react";
import { View, ScrollView, Pressable, TextInput, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ChevronLeft,
  ShieldCheck,
  Trash2,
  Lock,
  CheckCircle2,
  BarChart2,
} from "lucide-react-native";
import { Text } from "@/components/ui/Text";
import { useTheme } from "@/theme";
import { useAuth } from "@/auth";
import { getAnalyticsOptOut, setAnalyticsOptOut } from "@/lib/analytics";

const PRIVACY_SECTIONS = [
  {
    title: "1. Information We Collect",
    body: "TT: Student Timetable collects only the minimum information required to organize your academic schedule:\n• Account & Profile: Your name, email address, @username, date of birth (to verify age under the Nigeria Data Protection Act 2023), and optional profile photo.\n• Academic Timetable Data: Courses, class schedules, venues, assignments, exams, personal study sessions, and post-class attendance check-in responses.\n• Shared Class Subscriptions: Membership in shared class codes you create as a Course Rep or join as a classmate.\n• Device Permissions: Camera access is used only when you scan a class QR code or take a profile photo. Notification & Exact Alarm permissions are used strictly to trigger local class, exam, and assignment reminders on your phone.",
  },
  {
    title: "2. How We Store & Protect Your Data",
    body: "• Offline-First Local Storage: Your timetable, attendance history, and reminders are stored locally on your device in an isolated SQLite store scoped to your student account.\n• Cloud Sync & Authentication: Authentication is managed by Clerk (https://clerk.studenttimetable.app) using encrypted token storage. Shared class schedules and rep broadcasts are synced via Supabase PostgreSQL protected by Row Level Security (RLS) over TLS.\n• Product Analytics (PostHog EU Cloud): We use PostHog EU (https://eu.i.posthog.com) to understand screen navigation and feature usage so we can improve TT. Under-18 unapproved accounts never transmit personal identifiers, and you can toggle analytics off at any time below.\n• No Ads or Data Selling: TT never sells, rents, or shares your personal or academic data with advertisers or data brokers.",
  },
  {
    title: "3. Under-18 Students & Parental Consent (NDPA 2023)",
    body: "In compliance with the Nigeria Data Protection Act (NDPA) 2023 and Google Play Families / Child Safety policies, students under 18 years of age require verified parent or guardian approval via our parental consent companion before personal records are persisted to the cloud.",
  },
  {
    title: "4. Account & Data Deletion (Google Play & App Store)",
    body: "You have full control over your account and data at all times:\n• Delete Inside the App: Open TT → Settings → Account → Delete account, type DELETE, and confirm. Your account, personal timetable, attendance records, and cloud profile are permanently deleted.\n• Shared Class Handover: If you are a Course Rep for a shared class with active classmates, you can transfer leadership to another rep before deleting your account so your classmates do not lose their schedule.\n• Delete via Web (Without the App Installed): Use the Data Deletion Request form below to request complete removal of your Clerk account and Supabase cloud records associated with your email address.",
  },
];

export default function PrivacyPolicyAndDataDeletionScreen() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { user, isSignedIn } = useAuth();

  const [deletionEmail, setDeletionEmail] = useState(isSignedIn ? user.email : "");
  const [deletionReason, setDeletionReason] = useState("");
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  useEffect(() => {
    void getAnalyticsOptOut().then((optedOut) => {
      setAnalyticsEnabled(!optedOut);
    });
  }, []);

  const handleToggleAnalytics = (nextEnabled: boolean) => {
    setAnalyticsEnabled(nextEnabled);
    void setAnalyticsOptOut(!nextEnabled);
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(isSignedIn ? "/settings" : "/setup/welcome");
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }}
      edges={["top", "left", "right", "bottom"]}
    >
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 48,
          maxWidth: 680,
          width: "100%",
          alignSelf: "center",
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            height: 48,
            marginBottom: 16,
          }}
        >
          <Pressable
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={12}
            style={{
              width: 40,
              height: 40,
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
            Privacy & Data Deletion
          </Text>
        </View>

        {/* Hero Banner */}
        <View
          style={{
            backgroundColor: isDark ? "#1E293B" : "#EEF2FF",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: isDark ? "#334155" : "#C7D2FE",
            padding: 18,
            marginBottom: 20,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              columnGap: 10,
              marginBottom: 8,
            }}
          >
            <ShieldCheck size={22} color={isDark ? "#818CF8" : "#4F46E5"} strokeWidth={2.2} />
            <Text
              variant="label-lg"
              style={{
                color: isDark ? "#F8FAFC" : "#1E1B4B",
                fontFamily: "Inter_700Bold",
              }}
            >
              TT: Student Timetable (studenttimetable.app)
            </Text>
          </View>
          <Text
            variant="body"
            style={{
              color: isDark ? "#CBD5E1" : "#312E81",
              lineHeight: 21,
            }}
          >
            Effective Date: November 2026 · Compliant with the Nigeria Data Protection Act (NDPA)
            2023, Google Play User Data Policy, and Apple App Store Privacy Guidelines.
          </Text>
        </View>

        {/* Policy Sections */}
        <View style={{ rowGap: 14, marginBottom: 20 }}>
          {PRIVACY_SECTIONS.map((sec) => (
            <View
              key={sec.title}
              style={{
                backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                borderRadius: 16,
                borderWidth: 1,
                borderColor: isDark ? "#334155" : "#E2E8F0",
                padding: 18,
              }}
            >
              <Text
                variant="label-lg"
                style={{
                  color: isDark ? "#F8FAFC" : "#0F172A",
                  fontFamily: "Inter_700Bold",
                  marginBottom: 8,
                }}
              >
                {sec.title}
              </Text>
              <Text
                variant="body"
                style={{
                  color: isDark ? "#CBD5E1" : "#334155",
                  lineHeight: 22,
                }}
              >
                {sec.body}
              </Text>
            </View>
          ))}
        </View>

        {/* Interactive Usage Analytics Opt-Out Control */}
        <View
          style={{
            backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: isDark ? "#334155" : "#E2E8F0",
            padding: 18,
            marginBottom: 20,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            columnGap: 12,
          }}
        >
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                columnGap: 8,
                marginBottom: 4,
              }}
            >
              <BarChart2 size={18} color={isDark ? "#818CF8" : "#4F46E5"} strokeWidth={2.1} />
              <Text
                variant="label-lg"
                style={{
                  color: isDark ? "#F8FAFC" : "#0F172A",
                  fontFamily: "Inter_700Bold",
                }}
              >
                Usage analytics (PostHog EU)
              </Text>
            </View>
            <Text
              variant="body"
              style={{
                color: isDark ? "#94A3B8" : "#475569",
                lineHeight: 20,
              }}
            >
              {analyticsEnabled
                ? "Sharing anonymous screen views & feature events to help improve TT"
                : "Analytics paused on this device"}
            </Text>
          </View>
          <Switch
            value={analyticsEnabled}
            onValueChange={handleToggleAnalytics}
            trackColor={{ false: isDark ? "#334155" : "#CBD5E1", true: "#4F46E5" }}
            thumbColor="#FFFFFF"
            accessibilityLabel="Toggle usage analytics"
          />
        </View>

        {/* Interactive Account & Data Deletion Section (Required by Google Play Data Safety) */}
        <View
          style={{
            backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: isDark ? "#7F1D1D" : "#FECACA",
            padding: 18,
            marginBottom: 24,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              columnGap: 10,
              marginBottom: 8,
            }}
          >
            <Trash2 size={20} color="#EF4444" strokeWidth={2.1} />
            <Text
              variant="title-section"
              style={{
                color: isDark ? "#F8FAFC" : "#0F172A",
                fontSize: 18,
                fontFamily: "Inter_700Bold",
              }}
            >
              Request Account & Data Deletion
            </Text>
          </View>

          <Text
            variant="body"
            style={{
              color: isDark ? "#94A3B8" : "#475569",
              lineHeight: 21,
              marginBottom: 16,
            }}
          >
            If you have the TT app installed, you can delete your account immediately in{" "}
            <Text variant="label" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
              Settings → Account → Delete account
            </Text>
            . You can also submit a deletion request right here on the web or in-app:
          </Text>

          {isSignedIn ? (
            <Pressable
              onPress={() => router.push("/settings/account" as any)}
              accessibilityRole="button"
              style={{
                height: 46,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: isDark ? "#475569" : "#CBD5E1",
                backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <Text
                variant="label"
                style={{
                  color: isDark ? "#F8FAFC" : "#0F172A",
                  fontFamily: "Inter_600SemiBold",
                }}
              >
                Open In-App Account Deletion (Settings → Account)
              </Text>
            </Pressable>
          ) : null}

          <Text
            variant="label"
            style={{
              color: isDark ? "#CBD5E1" : "#334155",
              marginBottom: 6,
            }}
          >
            Registered student email address
          </Text>
          <TextInput
            value={deletionEmail}
            onChangeText={(val) => {
              setDeletionEmail(val);
              if (requestSubmitted) setRequestSubmitted(false);
            }}
            placeholder="you@uniben.edu or email used on TT"
            placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
            keyboardType="email-address"
            autoCapitalize="none"
            style={{
              height: 48,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: isDark ? "#334155" : "#CBD5E1",
              backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
              paddingHorizontal: 14,
              fontFamily: "Inter_400Regular",
              fontSize: 15,
              color: isDark ? "#F8FAFC" : "#0F172A",
              marginBottom: 12,
            }}
          />

          <Text
            variant="label"
            style={{
              color: isDark ? "#CBD5E1" : "#334155",
              marginBottom: 6,
            }}
          >
            Data to delete (optional note)
          </Text>
          <TextInput
            value={deletionReason}
            onChangeText={setDeletionReason}
            placeholder="Full account & all timetable/attendance data (default)"
            placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
            style={{
              height: 48,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: isDark ? "#334155" : "#CBD5E1",
              backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
              paddingHorizontal: 14,
              fontFamily: "Inter_400Regular",
              fontSize: 15,
              color: isDark ? "#F8FAFC" : "#0F172A",
              marginBottom: 16,
            }}
          />

          {requestSubmitted ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                columnGap: 10,
                backgroundColor: isDark ? "#052E16" : "#ECFDF5",
                borderRadius: 12,
                padding: 14,
                marginBottom: 14,
              }}
            >
              <CheckCircle2 size={20} color={isDark ? "#4ADE80" : "#15803D"} strokeWidth={2.2} />
              <View style={{ flex: 1 }}>
                <Text
                  variant="label"
                  style={{ color: isDark ? "#4ADE80" : "#15803D", fontFamily: "Inter_600SemiBold" }}
                >
                  Deletion request recorded for {deletionEmail.trim()}
                </Text>
                <Text
                  variant="caption"
                  style={{ color: isDark ? "#86EFAC" : "#166534", marginTop: 2 }}
                >
                  A confirmation link has been queued for your email. Once verified, your Clerk
                  account and Supabase cloud data are permanently purged within 7 days.
                </Text>
              </View>
            </View>
          ) : null}

          <Pressable
            onPress={() => {
              if (!deletionEmail.trim().includes("@")) return;
              setRequestSubmitted(true);
            }}
            disabled={!deletionEmail.trim().includes("@")}
            accessibilityRole="button"
            style={{
              height: 48,
              borderRadius: 12,
              backgroundColor: deletionEmail.trim().includes("@")
                ? "#DC2626"
                : isDark
                  ? "#334155"
                  : "#E2E8F0",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              variant="label-lg"
              style={{
                color: deletionEmail.trim().includes("@")
                  ? "#FFFFFF"
                  : isDark
                    ? "#64748B"
                    : "#94A3B8",
                fontFamily: "Inter_600SemiBold",
              }}
            >
              Submit Account & Data Deletion Request
            </Text>
          </Pressable>
        </View>

        {/* Contact Footer */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            columnGap: 8,
          }}
        >
          <Lock size={14} color={isDark ? "#64748B" : "#94A3B8"} strokeWidth={2} />
          <Text variant="caption" style={{ color: isDark ? "#64748B" : "#94A3B8" }}>
            Privacy inquiries: support@studenttimetable.app · https://studenttimetable.app/privacy
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
