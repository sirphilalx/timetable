import React, { useState } from "react";
import { View, ScrollView, Pressable, TextInput, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ChevronLeft,
  ChevronDown,
  Calendar,
  ShieldCheck,
  GraduationCap,
  Users,
  Clock,
  Flag,
  Bell,
  AtSign,
  CheckCircle2,
} from "lucide-react-native";
import { Text } from "@/components/ui/Text";
import { StudentAvatar } from "@/components/ui/StudentAvatar";
import { PhotoPickerSheet } from "@/components/ui/PhotoPickerSheet";
import { BirthDatePickerModal } from "@/components/ui/DateTimePickerModal";
import { useTheme } from "@/theme";
import { useAuth, normalizeUsername, suggestUsernames } from "@/auth";
import { useTimetable } from "@/hooks/useTimetable";
import { requestNotificationPermissions } from "@/lib/notifications";
import { saveReminderPreferences } from "@/lib/reminders";

const appIconLight = require("../../../logo/Logo-light.png");

type ProfileStep =
  "dob" | "display-name" | "turn-on-reminders" | "guardian-form" | "waiting-consent";

export default function SetupProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ next?: string; step?: string }>();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { user, updateProfile, completeOnboarding } = useAuth();
  const { data } = useTimetable();

  const nextRoute = params.next || "/(tabs)";
  const weeklyClassesCount = data.classRules.length || 18;
  const firstCourse = data.courses[0];

  const paramStepKey = `${params.step ?? ""}:${params.next ?? ""}`;
  const [lastStepKey, setLastStepKey] = useState(paramStepKey);
  const [step, setStep] = useState<ProfileStep>(() =>
    params.step === "turn-on-reminders" ? "turn-on-reminders" : "dob",
  );
  if (paramStepKey !== lastStepKey) {
    setLastStepKey(paramStepKey);
    if (params.step === "turn-on-reminders") {
      setStep("turn-on-reminders");
    }
  }
  const [dobDisplay, setDobDisplay] = useState("14 Apr 2005");
  const [dobParts, setDobParts] = useState({
    day: 14,
    monthIndex: 3,
    year: 2005,
    isoDate: "2005-04-14",
  });
  const [dobPickerOpen, setDobPickerOpen] = useState(false);
  const [isUnder18, setIsUnder18] = useState(false);
  const [displayName, setDisplayName] = useState(user.displayName || "");
  const [username, setUsername] = useState(
    user.username || (suggestUsernames(user.displayName || "Chioma Okafor", user.email)[0] ?? ""),
  );
  const [usernameTouched, setUsernameTouched] = useState(Boolean(user.username));
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user.avatarUrl ?? null);
  const [photoSheetOpen, setPhotoSheetOpen] = useState(false);
  const [guardianName, setGuardianName] = useState("");
  const [guardianContact, setGuardianContact] = useState("");
  const [resentNotice, setResentNotice] = useState(false);

  const isTakenName = displayName.trim().toLowerCase() === "chioma o.";
  const normalizedHandle = normalizeUsername(
    username || suggestUsernames(displayName || "Chioma Okafor", user.email)[0] || "chioma_okafor",
  );
  const isTakenUsername = ["chioma", "admin", "rep", "courserep"].includes(normalizedHandle);
  const isShortUsername = normalizedHandle.length > 0 && normalizedHandle.length < 3;
  const usernameSuggestions = suggestUsernames(displayName || "Chioma Okafor", user.email);

  const initials =
    displayName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "CO";

  const finishOnboardingAndNavigate = async (enableReminders: boolean) => {
    await updateProfile({
      displayName: displayName.trim() || "Chioma Okafor",
      username: normalizedHandle || "chioma_okafor",
      avatarUrl,
      dateOfBirth: dobParts.isoDate,
    });
    if (enableReminders) {
      await requestNotificationPermissions();
      await saveReminderPreferences({ classesEnabled: true });
    }
    await completeOnboarding();
    if (typeof router.canDismiss === "function" && router.canDismiss()) {
      router.dismissAll();
    }
    router.replace(nextRoute as any);
  };

  // Screen 17 · Turn on reminders
  if (step === "turn-on-reminders") {
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
          <View style={{ alignItems: "center" }}>
            {/* Bell Circle */}
            <View
              style={{
                width: 96,
                height: 96,
                borderRadius: 48,
                backgroundColor: isDark ? "#1E1B4B" : "#EEF2FF",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 28,
              }}
            >
              <Bell size={40} color={isDark ? "#818CF8" : "#4F46E5"} strokeWidth={1.85} />
            </View>

            <Text
              variant="display"
              style={{
                color: isDark ? "#F8FAFC" : "#0F172A",
                fontSize: 28,
                lineHeight: 34,
                fontFamily: "Inter_700Bold",
                textAlign: "center",
                marginBottom: 14,
              }}
            >
              Get a reminder before{"\n"}every class
            </Text>

            <Text
              variant="body-lg"
              style={{
                color: isDark ? "#94A3B8" : "#334155",
                fontFamily: "Inter_400Regular",
                lineHeight: 24,
                textAlign: "center",
                marginBottom: 28,
              }}
            >
              You have {weeklyClassesCount} classes a week across {data.courses.length || 6}{" "}
              courses. TT reminds you 30 minutes before each one, with the venue, and asks after
              class if you attended.
            </Text>

            {/* Sample Notification Card matching Screen 17 */}
            <View
              style={{
                width: "100%",
                backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                borderRadius: 20,
                borderWidth: 1,
                borderColor: isDark ? "#334155" : "#E2E8F0",
                padding: 18,
                flexDirection: "row",
                alignItems: "flex-start",
                shadowColor: "#0F172A",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: isDark ? 0.25 : 0.06,
                shadowRadius: 14,
                elevation: 3,
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: isDark ? "#0F172A" : "#EEF2FF",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  marginRight: 14,
                }}
              >
                <Image
                  source={appIconLight}
                  style={{ width: 32, height: 32, borderRadius: 8 }}
                  resizeMode="cover"
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  variant="caption"
                  style={{
                    color: isDark ? "#94A3B8" : "#475569",
                    marginBottom: 4,
                  }}
                >
                  TT · now
                </Text>
                <Text
                  variant="title-card"
                  style={{
                    color: isDark ? "#F8FAFC" : "#0F172A",
                    marginBottom: 4,
                  }}
                >
                  {firstCourse?.code ?? "CSC 301"} in 30 min, LT1
                </Text>
                <Text
                  variant="body-lg"
                  style={{
                    color: isDark ? "#CBD5E1" : "#334155",
                    fontFamily: "Inter_400Regular",
                    lineHeight: 22,
                  }}
                >
                  {firstCourse?.title ?? "Operating Systems"} · Lecture · 10:00 am
                </Text>
              </View>
            </View>
          </View>

          {/* Bottom CTAs */}
          <View style={{ rowGap: 12 }}>
            <Pressable
              onPress={() => {
                void finishOnboardingAndNavigate(true);
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
                Turn on reminders
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                void finishOnboardingAndNavigate(false);
              }}
              accessibilityRole="button"
              style={{
                height: 44,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text variant="label-lg" style={{ color: isDark ? "#818CF8" : "#4F46E5" }}>
                Not now
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (step === "waiting-consent") {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }}
        edges={["top", "left", "right", "bottom"]}
      >
        {/* Top Banner (Screen 14) */}
        <View
          style={{
            backgroundColor: isDark ? "#1E1B4B" : "#EEF2FF",
            paddingHorizontal: 16,
            paddingVertical: 14,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1, marginRight: 12 }}>
            <ShieldCheck size={22} color={isDark ? "#818CF8" : "#4F46E5"} strokeWidth={2} />
            <Text
              variant="body-lg"
              style={{
                color: isDark ? "#C7D2FE" : "#4338CA",
                fontFamily: "Inter_400Regular",
                lineHeight: 20,
                marginLeft: 12,
                flex: 1,
              }}
            >
              Waiting for your parent or guardian to approve
            </Text>
          </View>

          <Pressable
            onPress={() => {
              setResentNotice(true);
              setTimeout(() => setResentNotice(false), 2000);
            }}
            accessibilityRole="button"
          >
            <Text
              variant="body-lg"
              style={{
                color: isDark ? "#818CF8" : "#4F46E5",
                textDecorationLine: "underline",
              }}
            >
              {resentNotice ? "Sent" : "Resend"}
            </Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          <Text
            variant="title-page"
            style={{
              color: isDark ? "#F8FAFC" : "#0F172A",
              marginBottom: 12,
            }}
          >
            Almost there
          </Text>

          <Text
            variant="body-lg"
            style={{
              color: isDark ? "#94A3B8" : "#334155",
              fontFamily: "Inter_400Regular",
              lineHeight: 24,
              marginBottom: 20,
            }}
          >
            We sent a request to {guardianName} on {guardianContact}. You can look around, but you
            can follow the class once they approve.
          </Text>

          {/* Restricted Class Preview Card (Screen 14) */}
          <View
            style={{
              backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
              borderRadius: 20,
              borderWidth: 1,
              borderColor: isDark ? "#334155" : "#E2E8F0",
              padding: 20,
              marginBottom: 20,
            }}
          >
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                backgroundColor: isDark ? "#1E1B4B" : "#EEF2FF",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 14,
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
              CSC 300L · Computer{"\n"}Science
            </Text>

            <Text
              variant="body-lg"
              style={{
                color: isDark ? "#94A3B8" : "#334155",
                fontFamily: "Inter_400Regular",
                lineHeight: 22,
                marginBottom: 10,
              }}
            >
              University of Benin · 2026/2027 · First{"\n"}semester
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
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
                  A
                </Text>
              </View>
              <Text
                variant="body-lg"
                style={{
                  color: isDark ? "#CBD5E1" : "#334155",
                  fontFamily: "Inter_400Regular",
                }}
              >
                Run by Ada (rep) and 2 editors
              </Text>
            </View>

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
                  style={{ color: isDark ? "#CBD5E1" : "#334155", marginLeft: 6 }}
                >
                  128 members
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <GraduationCap size={16} color={isDark ? "#94A3B8" : "#334155"} strokeWidth={2} />
                <Text
                  variant="body"
                  style={{ color: isDark ? "#CBD5E1" : "#334155", marginLeft: 6 }}
                >
                  7 courses
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
              <Calendar size={16} color={isDark ? "#94A3B8" : "#334155"} strokeWidth={2} />
              <Text variant="body" style={{ color: isDark ? "#CBD5E1" : "#334155", marginLeft: 6 }}>
                18 classes a week
              </Text>
            </View>

            <Text
              variant="body"
              style={{ color: isDark ? "#94A3B8" : "#475569", marginBottom: 12 }}
            >
              Created 28 Oct 2026
            </Text>

            {/* Waiting for Parent Callout */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: isDark ? "#1E1B4B" : "#EEF2FF",
                borderRadius: 12,
                padding: 14,
                marginBottom: 10,
              }}
            >
              <Clock size={18} color={isDark ? "#818CF8" : "#4338CA"} strokeWidth={2} />
              <Text
                variant="body"
                style={{
                  color: isDark ? "#C7D2FE" : "#4338CA",
                  marginLeft: 10,
                  flex: 1,
                  lineHeight: 20,
                }}
              >
                Waiting for your parent or guardian to approve. You can follow once they do.
              </Text>
            </View>

            {/* Disabled Follow Button */}
            <View
              style={{
                height: 52,
                borderRadius: 12,
                backgroundColor: isDark ? "#334155" : "#E2E8F0",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 10,
              }}
            >
              <Text variant="label-lg" style={{ color: isDark ? "#64748B" : "#94A3B8" }}>
                Follow class
              </Text>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Flag size={14} color={isDark ? "#94A3B8" : "#475569"} strokeWidth={2} />
              <Text variant="body" style={{ color: isDark ? "#94A3B8" : "#475569", marginLeft: 6 }}>
                Report this class
              </Text>
            </View>
          </View>

          {/* Resend Request & Change Contact */}
          <Pressable
            onPress={() => router.push("/consent/tok-ngozi-2026" as any)}
            accessibilityRole="button"
            style={{
              height: 52,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: isDark ? "#334155" : "#CBD5E1",
              backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 14,
            }}
          >
            <Text variant="title-card" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
              Resend request
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setStep("guardian-form")}
            accessibilityRole="button"
            style={{
              height: 44,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text variant="label-lg" style={{ color: isDark ? "#818CF8" : "#4F46E5" }}>
              Change contact
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (step === "guardian-form") {
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
            {/* Header (Screen 13) */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                height: 48,
                marginBottom: 16,
              }}
            >
              <Pressable
                onPress={() => setStep("display-name")}
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
                Parent or guardian
              </Text>
            </View>

            <Text
              variant="title-page"
              style={{
                color: isDark ? "#F8FAFC" : "#0F172A",
                marginBottom: 10,
              }}
            >
              Ask a parent or guardian to{"\n"}approve
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
              You&apos;re under 18, so we need their OK before TT saves your timetable. We&apos;ll
              send them a short request.
            </Text>

            {/* Their name */}
            <View style={{ marginBottom: 20 }}>
              <Text
                variant="label"
                style={{ color: isDark ? "#CBD5E1" : "#334155", marginBottom: 6 }}
              >
                Their name
              </Text>
              <TextInput
                value={guardianName}
                onChangeText={setGuardianName}
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

            {/* Their email or phone */}
            <View style={{ marginBottom: 20 }}>
              <Text
                variant="label"
                style={{ color: isDark ? "#CBD5E1" : "#334155", marginBottom: 6 }}
              >
                Their email or phone
              </Text>
              <TextInput
                value={guardianContact}
                onChangeText={setGuardianContact}
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
              <Text
                variant="caption"
                style={{ color: isDark ? "#94A3B8" : "#475569", marginTop: 6 }}
              >
                We only use this for the consent request
              </Text>
            </View>

            {/* NDPA Privacy Shield Callout */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: isDark ? "#1E1B4B" : "#EEF2FF",
                borderRadius: 16,
                padding: 16,
              }}
            >
              <ShieldCheck size={22} color={isDark ? "#818CF8" : "#4F46E5"} strokeWidth={2} />
              <Text
                variant="body-lg"
                style={{
                  color: isDark ? "#C7D2FE" : "#4338CA",
                  fontFamily: "Inter_400Regular",
                  lineHeight: 22,
                  marginLeft: 14,
                  flex: 1,
                }}
              >
                They&apos;ll see what TT collects: your name, timetable, attendance answers and
                assignments. No ads are shown to under-18s.
              </Text>
            </View>
          </ScrollView>

          <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
            <Pressable
              onPress={() => setStep("waiting-consent")}
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
                Send request
              </Text>
            </Pressable>
            <Text variant="caption" style={{ color: isDark ? "#94A3B8" : "#475569" }}>
              Wording to be confirmed by a lawyer (NDPA 2023).
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (step === "display-name") {
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
            {/* Header (Screens 11 & 12) */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                height: 48,
                marginBottom: 16,
              }}
            >
              <Pressable
                onPress={() => setStep("dob")}
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
                About you
              </Text>
            </View>

            {/* Step 2 Progress Indicator */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                columnGap: 8,
                marginBottom: 16,
              }}
            >
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#4F46E5" }} />
              <View style={{ width: 28, height: 8, borderRadius: 4, backgroundColor: "#4F46E5" }} />
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: isDark ? "#334155" : "#E2E8F0",
                }}
              />
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: isDark ? "#334155" : "#E2E8F0",
                }}
              />
            </View>

            <Text
              variant="title-page"
              style={{
                color: isDark ? "#F8FAFC" : "#0F172A",
                marginBottom: 8,
              }}
            >
              Set up your student profile
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
              Add a photo, your display name, and a @username so classmates and course reps can
              recognize you in classes and group polls.
            </Text>

            {/* Profile Photo Upload Hero */}
            <View style={{ alignItems: "center", marginBottom: 22 }}>
              <Pressable
                onPress={() => setPhotoSheetOpen(true)}
                accessibilityRole="button"
                accessibilityLabel="Upload or change profile photo"
                style={{ alignItems: "center" }}
              >
                <StudentAvatar
                  avatarUrl={avatarUrl}
                  initials={initials}
                  size={88}
                  borderWidth={2.5}
                  borderColor={isDark ? "#4F46E5" : "#FFFFFF"}
                  showCameraBadge
                />
                <Text
                  variant="label-lg"
                  style={{
                    color: isDark ? "#818CF8" : "#4F46E5",
                    marginTop: 10,
                  }}
                >
                  {avatarUrl ? "Change photo" : "Upload photo"}
                </Text>
              </Pressable>
            </View>

            {/* Display Name Input */}
            <View style={{ marginBottom: 16 }}>
              <Text
                variant="label"
                style={{ color: isDark ? "#CBD5E1" : "#334155", marginBottom: 6 }}
              >
                Display name
              </Text>
              <TextInput
                value={displayName}
                onChangeText={(val) => {
                  setDisplayName(val);
                  if (!usernameTouched) {
                    const nextSuggested = suggestUsernames(val, user.email)[0] ?? "";
                    setUsername(nextSuggested);
                  }
                }}
                placeholder="e.g. Chioma Okafor"
                placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                style={{
                  height: 48,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: isTakenName ? "#DC2626" : "#4F46E5",
                  backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                  paddingHorizontal: 14,
                  fontFamily: "Inter_400Regular",
                  fontSize: 15,
                  color: isDark ? "#F8FAFC" : "#0F172A",
                }}
              />
              {isTakenName ? (
                <Text
                  variant="caption"
                  style={{ color: isDark ? "#F87171" : "#DC2626", marginTop: 6 }}
                >
                  Someone in CSC 300L already uses &quot;Chioma O.&quot; Try adding a surname.
                </Text>
              ) : (
                <Text
                  variant="caption"
                  style={{ color: isDark ? "#94A3B8" : "#475569", marginTop: 6 }}
                >
                  Reps and your class group see this full name.
                </Text>
              )}
            </View>

            {isTakenName ? (
              <View style={{ flexDirection: "row", columnGap: 10, marginBottom: 16 }}>
                {["Chioma Okafor", "Chioma O.K."].map((suggestion) => (
                  <Pressable
                    key={suggestion}
                    onPress={() => {
                      setDisplayName(suggestion);
                      if (!usernameTouched) {
                        setUsername(suggestUsernames(suggestion, user.email)[0] ?? "chioma_okafor");
                      }
                    }}
                    accessibilityRole="button"
                    style={{
                      height: 40,
                      paddingHorizontal: 16,
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: isDark ? "#334155" : "#CBD5E1",
                      backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text variant="label" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                      {suggestion}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : null}

            {/* Username (@handle) Input */}
            <View style={{ marginBottom: 16 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <Text variant="label" style={{ color: isDark ? "#CBD5E1" : "#334155" }}>
                  Username
                </Text>
                {!isTakenUsername && !isShortUsername && normalizedHandle.length >= 3 ? (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <CheckCircle2
                      size={14}
                      color={isDark ? "#4ADE80" : "#16A34A"}
                      strokeWidth={2.2}
                    />
                    <Text
                      variant="caption"
                      style={{
                        color: isDark ? "#4ADE80" : "#16A34A",
                        fontFamily: "Inter_600SemiBold",
                        marginLeft: 4,
                      }}
                    >
                      @{normalizedHandle} available
                    </Text>
                  </View>
                ) : null}
              </View>

              <View
                style={{
                  height: 48,
                  borderRadius: 12,
                  borderWidth: 1.5,
                  borderColor:
                    isTakenUsername || isShortUsername ? "#DC2626" : isDark ? "#334155" : "#CBD5E1",
                  backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                  paddingHorizontal: 14,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <AtSign size={17} color={isDark ? "#818CF8" : "#4F46E5"} strokeWidth={2.2} />
                <TextInput
                  value={username}
                  onChangeText={(val) => {
                    setUsernameTouched(true);
                    setUsername(val.replace(/^@+/, "").toLowerCase());
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="chioma_okafor"
                  placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                  style={{
                    flex: 1,
                    marginLeft: 6,
                    fontFamily: "Inter_500Medium",
                    fontSize: 15,
                    color: isDark ? "#F8FAFC" : "#0F172A",
                  }}
                />
              </View>

              {isTakenUsername ? (
                <Text
                  variant="caption"
                  style={{ color: isDark ? "#F87171" : "#DC2626", marginTop: 6 }}
                >
                  @{normalizedHandle} is already taken. Pick one of the available handles below.
                </Text>
              ) : isShortUsername ? (
                <Text
                  variant="caption"
                  style={{ color: isDark ? "#F87171" : "#DC2626", marginTop: 6 }}
                >
                  Username must be at least 3 characters (letters, numbers, underscores or dots).
                </Text>
              ) : (
                <Text
                  variant="caption"
                  style={{ color: isDark ? "#94A3B8" : "#475569", marginTop: 6 }}
                >
                  Used for quick @mentions in group assignments and class polls.
                </Text>
              )}

              {/* Suggested Usernames */}
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  columnGap: 8,
                  rowGap: 8,
                  marginTop: 10,
                }}
              >
                {usernameSuggestions.map((sug) => {
                  const isCurrent = normalizedHandle === sug;
                  return (
                    <Pressable
                      key={sug}
                      onPress={() => {
                        setUsernameTouched(true);
                        setUsername(sug);
                      }}
                      accessibilityRole="button"
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 999,
                        borderWidth: 1,
                        borderColor: isCurrent ? "#4F46E5" : isDark ? "#334155" : "#CBD5E1",
                        backgroundColor: isCurrent
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
                          color: isCurrent
                            ? isDark
                              ? "#818CF8"
                              : "#4F46E5"
                            : isDark
                              ? "#CBD5E1"
                              : "#475569",
                          fontFamily: isCurrent ? "Inter_600SemiBold" : "Inter_400Regular",
                        }}
                      >
                        @{sug}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Live Student Identity Preview Card */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: isDark ? "#1E293B" : "#F1F5F9",
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: isDark ? "#334155" : "#E2E8F0",
              }}
            >
              <View style={{ marginRight: 14 }}>
                <StudentAvatar
                  avatarUrl={avatarUrl}
                  initials={initials}
                  size={52}
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
                    {displayName.trim() || "Chioma Okafor"}
                  </Text>
                  <View
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 999,
                      backgroundColor: isDark ? "#1E1B4B" : "#EEF2FF",
                    }}
                  >
                    <Text
                      variant="caption"
                      style={{
                        color: isDark ? "#818CF8" : "#4F46E5",
                        fontFamily: "Inter_600SemiBold",
                      }}
                    >
                      @{normalizedHandle || "chioma_okafor"}
                    </Text>
                  </View>
                </View>
                <Text
                  variant="caption"
                  style={{ color: isDark ? "#94A3B8" : "#475569", marginTop: 4 }}
                >
                  How you&apos;ll appear in groups, polls, and member lists
                </Text>
              </View>
            </View>
          </ScrollView>

          <PhotoPickerSheet
            isOpen={photoSheetOpen}
            onClose={() => setPhotoSheetOpen(false)}
            currentAvatarUrl={avatarUrl}
            initials={initials}
            onSelectAvatar={(nextUri) => setAvatarUrl(nextUri)}
          />

          <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
            <Pressable
              disabled={isTakenName || isTakenUsername || isShortUsername}
              onPress={async () => {
                await updateProfile({
                  displayName: displayName.trim() || "Chioma Okafor",
                  username: normalizedHandle || "chioma_okafor",
                  avatarUrl,
                  dateOfBirth: dobParts.isoDate,
                });
                if (isUnder18) {
                  setStep("guardian-form");
                } else if (nextRoute === "/setup/semester") {
                  router.push("/setup/semester" as any);
                } else {
                  setStep("turn-on-reminders");
                }
              }}
              accessibilityRole="button"
              style={{
                height: 52,
                borderRadius: 12,
                backgroundColor:
                  isTakenName || isTakenUsername || isShortUsername
                    ? isDark
                      ? "#334155"
                      : "#E2E8F0"
                    : "#4F46E5",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                variant="label-lg"
                style={{
                  color:
                    isTakenName || isTakenUsername || isShortUsername
                      ? isDark
                        ? "#64748B"
                        : "#94A3B8"
                      : "#FFFFFF",
                }}
              >
                Continue
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

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
          {/* Header (Screen 10) */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              height: 48,
              marginBottom: 16,
            }}
          >
            <Pressable
              onPress={() => router.back()}
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
              About you
            </Text>
          </View>

          {/* Step 1 Progress Indicator */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              columnGap: 8,
              marginBottom: 16,
            }}
          >
            <View style={{ width: 28, height: 8, borderRadius: 4, backgroundColor: "#4F46E5" }} />
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: isDark ? "#334155" : "#E2E8F0",
              }}
            />
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: isDark ? "#334155" : "#E2E8F0",
              }}
            />
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: isDark ? "#334155" : "#E2E8F0",
              }}
            />
          </View>

          <Text
            variant="title-page"
            style={{
              color: isDark ? "#F8FAFC" : "#0F172A",
              marginBottom: 10,
            }}
          >
            When were you born?
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
            We ask everyone. If you&apos;re under 18, a parent or guardian approves your account
            before TT stores anything.
          </Text>

          <View>
            <Text
              variant="label"
              style={{ color: isDark ? "#CBD5E1" : "#334155", marginBottom: 6 }}
            >
              Date of birth
            </Text>
            <Pressable
              onPress={() => setDobPickerOpen(true)}
              accessibilityRole="button"
              accessibilityLabel={`Date of birth: ${dobDisplay}. Tap to open date picker`}
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
              <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                <Calendar size={18} color={isDark ? "#94A3B8" : "#475569"} strokeWidth={1.85} />
                <Text
                  variant="body-lg"
                  style={{
                    marginLeft: 10,
                    fontFamily: "Inter_400Regular",
                    color: isDark ? "#F8FAFC" : "#0F172A",
                  }}
                >
                  {dobDisplay}
                </Text>
              </View>
              <ChevronDown size={18} color={isDark ? "#94A3B8" : "#64748B"} strokeWidth={2} />
            </Pressable>
            <Text variant="caption" style={{ color: isDark ? "#94A3B8" : "#475569", marginTop: 6 }}>
              Only used to check your age. Never shown to classmates.
            </Text>
          </View>
        </ScrollView>

        <BirthDatePickerModal
          isOpen={dobPickerOpen}
          onClose={() => setDobPickerOpen(false)}
          day={dobParts.day}
          monthIndex={dobParts.monthIndex}
          year={dobParts.year}
          onSelect={(res) => {
            setDobDisplay(res.formatted);
            setIsUnder18(res.isUnder18);
            setDobParts({
              day: res.day,
              monthIndex: res.monthIndex,
              year: res.year,
              isoDate: res.isoDate,
            });
          }}
        />

        <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
          <Pressable
            onPress={() => setStep("display-name")}
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
      </View>
    </SafeAreaView>
  );
}
