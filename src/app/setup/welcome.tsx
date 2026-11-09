import React, { useState } from "react";
import { View, ScrollView, Pressable, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Clock, MapPin, Scan, ChevronLeft, Mail, RefreshCw, Bell } from "lucide-react-native";
import { Text } from "@/components/ui/Text";
import { StudentAvatar } from "@/components/ui/StudentAvatar";
import { OAuthAccountChooserModal } from "@/components/ui/OAuthAccountChooserModal";
import { useTheme } from "@/theme";
import { useAuth } from "@/auth";
import { pullSubscribedGroupsFromCloud } from "@/lib/sync";

type AuthScreenMode = "welcome" | "signin" | "signup" | "reset" | "restoring";

export default function WelcomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string; next?: string }>();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const {
    user,
    signInWithEmail,
    signUpWithEmail,
    verifyEmailCode,
    signInWithOAuth,
    resetPassword,
    completeOnboarding,
  } = useAuth();

  const paramKey = `${params.mode ?? ""}:${params.next ?? ""}`;
  const [lastParamKey, setLastParamKey] = useState(paramKey);
  const [mode, setMode] = useState<AuthScreenMode>(() => {
    if (params.mode === "signin" || params.mode === "signup" || params.mode === "reset") {
      return params.mode;
    }
    return "welcome";
  });
  const [nextDestination, setNextDestination] = useState<string>(params.next || "/(tabs)");

  if (paramKey !== lastParamKey) {
    setLastParamKey(paramKey);
    if (params.mode === "signin" || params.mode === "signup" || params.mode === "reset") {
      setMode(params.mode);
    }
    if (params.next) {
      setNextDestination(params.next);
    }
  }
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [pendingVerificationMode, setPendingVerificationMode] = useState<
    "signin" | "signup" | null
  >(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [oauthChooserProvider, setOauthChooserProvider] = useState<
    "oauth_google" | "oauth_apple" | null
  >(null);

  const runRestoreAndEnterApp = async () => {
    setMode("restoring");
    try {
      await pullSubscribedGroupsFromCloud();
      await completeOnboarding();
    } catch {
      // Offline safe
    }
    setTimeout(() => {
      if (typeof router.canDismiss === "function" && router.canDismiss()) {
        router.dismissAll();
      }
      router.replace("/(tabs)");
    }, 1100);
  };

  // Screen 18 · Restoring on a new phone
  if (mode === "restoring") {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }}
        edges={["top", "left", "right", "bottom"]}
      >
        {/* Top Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: 14,
          }}
        >
          <View>
            <Text
              variant="display"
              style={{
                color: isDark ? "#F8FAFC" : "#0F172A",
                fontSize: 28,
                lineHeight: 34,
                fontFamily: "Inter_700Bold",
              }}
            >
              Today
            </Text>
            <Text
              variant="body-lg"
              style={{
                color: isDark ? "#94A3B8" : "#475569",
                fontFamily: "Inter_400Regular",
                marginTop: 2,
              }}
            >
              Restoring...
            </Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", columnGap: 14 }}>
            <View style={{ position: "relative", padding: 4 }}>
              <Bell size={22} color={isDark ? "#F8FAFC" : "#0F172A"} strokeWidth={2} />
              <View
                style={{
                  position: "absolute",
                  top: 3,
                  right: 3,
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "#DC2626",
                }}
              />
            </View>
            <StudentAvatar
              avatarUrl={user.avatarUrl}
              initials={user.initials}
              size={40}
              borderWidth={2}
              borderColor={isDark ? "#312E81" : "#FFFFFF"}
            />
          </View>
        </View>

        {/* Restoring Banner */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: isDark ? "#1E1B4B" : "#EEF2FF",
            paddingHorizontal: 20,
            paddingVertical: 14,
            marginBottom: 20,
          }}
        >
          <RefreshCw size={18} color={isDark ? "#818CF8" : "#4F46E5"} strokeWidth={2.2} />
          <Text
            variant="body-lg"
            style={{
              color: isDark ? "#C7D2FE" : "#4338CA",
              fontFamily: "Inter_400Regular",
              marginLeft: 12,
            }}
          >
            Restoring your classes on this phone...
          </Text>
        </View>

        {/* 4 Skeleton Cards */}
        <View style={{ paddingHorizontal: 16, rowGap: 14 }}>
          {[0, 1, 2, 3].map((idx) => (
            <View
              key={idx}
              style={{
                backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                borderRadius: 16,
                borderWidth: 1,
                borderColor: isDark ? "#334155" : "#E2E8F0",
                padding: 18,
                rowGap: 12,
              }}
            >
              <View
                style={{
                  width: "52%",
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: isDark ? "#334155" : "#E2E8F0",
                }}
              />
              <View
                style={{
                  width: "82%",
                  height: 18,
                  borderRadius: 8,
                  backgroundColor: isDark ? "#334155" : "#E2E8F0",
                }}
              />
              <View
                style={{
                  width: "66%",
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: isDark ? "#334155" : "#E2E8F0",
                }}
              />
            </View>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  // Screen 09 · Reset password
  if (mode === "reset") {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }}
        edges={["top", "left", "right", "bottom"]}
      >
        <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 }}>
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              height: 48,
              marginBottom: 16,
            }}
          >
            <Pressable
              onPress={() => {
                setResetSent(false);
                setAuthError(null);
                setMode("signin");
              }}
              accessibilityRole="button"
              accessibilityLabel="Back to sign in"
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
              Reset password
            </Text>
          </View>

          <Text
            variant="body-lg"
            style={{
              color: isDark ? "#94A3B8" : "#334155",
              fontFamily: "Inter_400Regular",
              lineHeight: 22,
              marginBottom: 20,
            }}
          >
            Enter the email on your account. We&apos;ll send a link to set a new password.
          </Text>

          <View style={{ marginBottom: 16 }}>
            <Text
              variant="label"
              style={{ color: isDark ? "#CBD5E1" : "#334155", marginBottom: 6 }}
            >
              Email
            </Text>
            <TextInput
              value={email}
              onChangeText={(val) => {
                setEmail(val);
                setAuthError(null);
              }}
              placeholder="name@example.com"
              placeholderTextColor={isDark ? "#64748B" : "#64748B"}
              autoCapitalize="none"
              keyboardType="email-address"
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

          {authError ? (
            <Text
              variant="caption"
              style={{ color: isDark ? "#F87171" : "#DC2626", marginBottom: 12 }}
            >
              {authError}
            </Text>
          ) : null}

          {resetSent ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: isDark ? "#052E16" : "#ECFDF5",
                borderRadius: 16,
                padding: 16,
              }}
            >
              <Mail size={20} color={isDark ? "#4ADE80" : "#15803D"} strokeWidth={2} />
              <Text
                variant="body-lg"
                style={{
                  color: isDark ? "#A7F3D0" : "#15803D",
                  fontFamily: "Inter_400Regular",
                  lineHeight: 22,
                  marginLeft: 12,
                  flex: 1,
                }}
              >
                Check your email. The link works for 1 hour.
              </Text>
            </View>
          ) : null}

          <View style={{ flex: 1 }} />

          <Pressable
            onPress={async () => {
              setAuthError(null);
              const res = await resetPassword(email);
              if (!res.ok) {
                setAuthError(res.error ?? "Enter a valid email address.");
                return;
              }
              setResetSent(true);
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
              Send reset link
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Screen 07 (Create account) & Screen 08 (Sign in)
  if (mode === "signin" || mode === "signup") {
    const isSignIn = mode === "signin";
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }}
        edges={["top", "left", "right", "bottom"]}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 24,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              height: 48,
              marginBottom: 16,
            }}
          >
            <Pressable
              onPress={() => {
                setAuthError(null);
                setMode("welcome");
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
              {isSignIn ? "Sign in" : "Create account"}
            </Text>
          </View>

          {!isSignIn ? (
            <Text
              variant="body-lg"
              style={{
                color: isDark ? "#94A3B8" : "#334155",
                fontFamily: "Inter_400Regular",
                lineHeight: 22,
                marginBottom: 20,
              }}
            >
              Follow CSC 300L in under a minute. Your account keeps your timetable safe if you
              change phones.
            </Text>
          ) : null}

          {/* Social Auth Buttons */}
          <View style={{ rowGap: 12, marginBottom: 20 }}>
            <Pressable
              onPress={async () => {
                setAuthError(null);
                setIsSubmitting(true);
                try {
                  const res = await signInWithOAuth("oauth_google");
                  if (res.ok) {
                    if (isSignIn) {
                      await runRestoreAndEnterApp();
                    } else {
                      router.push(
                        `/setup/profile?next=${encodeURIComponent(nextDestination)}` as any,
                      );
                    }
                    return;
                  }
                  if (res.cancelled) {
                    return;
                  }
                  setOauthChooserProvider("oauth_google");
                } finally {
                  setIsSubmitting(false);
                }
              }}
              accessibilityRole="button"
              style={{
                height: 52,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: isDark ? "#334155" : "#CBD5E1",
                backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                columnGap: 10,
              }}
            >
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: "#FFFFFF",
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  variant="label"
                  style={{
                    color: "#4285F4",
                    fontFamily: "Inter_700Bold",
                    fontSize: 13,
                  }}
                >
                  G
                </Text>
              </View>
              <Text variant="title-card" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                Continue with Google
              </Text>
            </Pressable>

            <Pressable
              onPress={async () => {
                setAuthError(null);
                setIsSubmitting(true);
                try {
                  const res = await signInWithOAuth("oauth_apple");
                  if (res.ok) {
                    if (isSignIn) {
                      await runRestoreAndEnterApp();
                    } else {
                      router.push(
                        `/setup/profile?next=${encodeURIComponent(nextDestination)}` as any,
                      );
                    }
                    return;
                  }
                  if (res.cancelled) {
                    return;
                  }
                  setOauthChooserProvider("oauth_apple");
                } finally {
                  setIsSubmitting(false);
                }
              }}
              accessibilityRole="button"
              style={{
                height: 52,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: isDark ? "#334155" : "#CBD5E1",
                backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                columnGap: 10,
              }}
            >
              <Text
                variant="title-card"
                style={{ color: isDark ? "#F8FAFC" : "#0F172A", fontSize: 18 }}
              >
                
              </Text>
              <Text variant="title-card" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                Continue with Apple
              </Text>
            </Pressable>
          </View>

          {!isSignIn ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <View
                style={{
                  flex: 1,
                  height: 1,
                  backgroundColor: isDark ? "#334155" : "#E2E8F0",
                }}
              />
              <Text
                variant="caption"
                style={{
                  color: isDark ? "#94A3B8" : "#64748B",
                  marginHorizontal: 12,
                }}
              >
                or
              </Text>
              <View
                style={{
                  flex: 1,
                  height: 1,
                  backgroundColor: isDark ? "#334155" : "#E2E8F0",
                }}
              />
            </View>
          ) : null}

          {/* Email */}
          <View style={{ marginBottom: 16 }}>
            <Text
              variant="label"
              style={{ color: isDark ? "#CBD5E1" : "#334155", marginBottom: 6 }}
            >
              Email
            </Text>
            <TextInput
              value={email}
              onChangeText={(val) => {
                setEmail(val);
                setAuthError(null);
              }}
              placeholder="name@example.com"
              placeholderTextColor={isDark ? "#64748B" : "#64748B"}
              autoCapitalize="none"
              keyboardType="email-address"
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

          {/* Password */}
          <View style={{ marginBottom: 16 }}>
            <Text
              variant="label"
              style={{ color: isDark ? "#CBD5E1" : "#334155", marginBottom: 6 }}
            >
              Password
            </Text>
            <TextInput
              value={password}
              onChangeText={(val) => {
                setPassword(val);
                setAuthError(null);
              }}
              placeholder={isSignIn ? "Enter your password" : "Choose a password"}
              placeholderTextColor={isDark ? "#64748B" : "#64748B"}
              secureTextEntry={isSignIn}
              style={{
                height: 48,
                borderRadius: 12,
                borderWidth: isSignIn ? 2 : 1,
                borderColor: isSignIn ? "#4F46E5" : isDark ? "#334155" : "#CBD5E1",
                backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                paddingHorizontal: 14,
                fontFamily: "Inter_400Regular",
                fontSize: 15,
                color: isDark ? "#F8FAFC" : "#0F172A",
              }}
            />
            {!isSignIn ? (
              <Text
                variant="caption"
                style={{ color: isDark ? "#94A3B8" : "#475569", marginTop: 6 }}
              >
                At least 8 characters
              </Text>
            ) : (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: 14,
                }}
              >
                <Pressable
                  onPress={() => {
                    setResetSent(false);
                    setAuthError(null);
                    setMode("reset");
                  }}
                >
                  <Text variant="label" style={{ color: isDark ? "#818CF8" : "#4F46E5" }}>
                    Forgot password?
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    setAuthError(null);
                    setPassword("");
                    setMode("signup");
                  }}
                >
                  <Text variant="label" style={{ color: isDark ? "#94A3B8" : "#475569" }}>
                    Create account
                  </Text>
                </Pressable>
              </View>
            )}
          </View>

          {pendingVerificationMode ? (
            <View
              style={{
                marginBottom: 16,
                padding: 16,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: isDark ? "#312E81" : "#C7D2FE",
                backgroundColor: isDark ? "#1E1B4B" : "#EEF2FF",
                rowGap: 10,
              }}
            >
              <Text
                variant="label"
                style={{ color: isDark ? "#C7D2FE" : "#3730A3", fontFamily: "Inter_600SemiBold" }}
              >
                Clerk email verification code
              </Text>
              <TextInput
                value={verificationCode}
                onChangeText={(val) => {
                  setVerificationCode(val);
                  setAuthError(null);
                }}
                placeholder="Enter 6-digit code"
                placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                keyboardType="number-pad"
                maxLength={6}
                style={{
                  height: 48,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: isDark ? "#4338CA" : "#818CF8",
                  backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
                  paddingHorizontal: 14,
                  fontFamily: "Inter_700Bold",
                  fontSize: 18,
                  letterSpacing: 4,
                  color: isDark ? "#F8FAFC" : "#0F172A",
                }}
              />
            </View>
          ) : null}

          {authError ? (
            <Text
              variant="caption"
              style={{ color: isDark ? "#F87171" : "#DC2626", marginBottom: 12 }}
            >
              {authError}
            </Text>
          ) : null}

          <View style={{ flex: 1, minHeight: 24 }} />

          <Pressable
            disabled={isSubmitting}
            onPress={async () => {
              setAuthError(null);
              setIsSubmitting(true);
              try {
                if (pendingVerificationMode) {
                  const verifyRes = await verifyEmailCode(
                    verificationCode,
                    pendingVerificationMode,
                  );
                  if (!verifyRes.ok) {
                    setAuthError(verifyRes.error ?? "Invalid verification code.");
                    return;
                  }
                  const completedMode = pendingVerificationMode;
                  setPendingVerificationMode(null);
                  setVerificationCode("");
                  if (completedMode === "signin") {
                    await runRestoreAndEnterApp();
                  } else {
                    router.push(
                      `/setup/profile?next=${encodeURIComponent(nextDestination)}` as any,
                    );
                  }
                  return;
                }

                if (isSignIn) {
                  const res = await signInWithEmail(email, password || "chioma2026");
                  if (!res.ok) {
                    if (res.needsVerification) {
                      setPendingVerificationMode(res.verificationMode ?? "signin");
                    }
                    setAuthError(res.error ?? "Unable to sign in.");
                    return;
                  }
                  await runRestoreAndEnterApp();
                } else {
                  const res = await signUpWithEmail({
                    email,
                    password: password || "chioma2026",
                  });
                  if (!res.ok) {
                    if (res.needsVerification) {
                      setPendingVerificationMode(res.verificationMode ?? "signup");
                    }
                    setAuthError(res.error ?? "Unable to create account.");
                    return;
                  }
                  router.push(`/setup/profile?next=${encodeURIComponent(nextDestination)}` as any);
                }
              } finally {
                setIsSubmitting(false);
              }
            }}
            accessibilityRole="button"
            style={{
              height: 52,
              borderRadius: 12,
              backgroundColor: "#4F46E5",
              alignItems: "center",
              justifyContent: "center",
              opacity: isSubmitting ? 0.75 : 1,
            }}
          >
            <Text variant="label-lg" style={{ color: "#FFFFFF" }}>
              {pendingVerificationMode
                ? "Verify code & continue"
                : isSignIn
                  ? "Sign in"
                  : "Create account"}
            </Text>
          </Pressable>

          {!isSignIn ? (
            <Text
              variant="caption"
              style={{
                color: isDark ? "#94A3B8" : "#475569",
                marginTop: 12,
                lineHeight: 16,
              }}
            >
              By continuing you agree to the Terms and Privacy Policy.{"\n"}TT never sells your
              data.
            </Text>
          ) : null}
        </ScrollView>

        <OAuthAccountChooserModal
          visible={oauthChooserProvider !== null}
          provider={oauthChooserProvider}
          currentUser={user}
          onClose={() => setOauthChooserProvider(null)}
          onSelectAccount={async (chosenAccount) => {
            const activeProvider = oauthChooserProvider ?? "oauth_google";
            setOauthChooserProvider(null);
            await signInWithOAuth(activeProvider, {
              email: chosenAccount.email,
              displayName: chosenAccount.displayName,
              avatarUrl: chosenAccount.avatarUrl,
              completeOnboarding: isSignIn,
            });
            if (isSignIn) {
              await runRestoreAndEnterApp();
            } else {
              router.push(`/setup/profile?next=${encodeURIComponent(nextDestination)}` as any);
            }
          }}
        />
      </SafeAreaView>
    );
  }

  // Screen 02 · Welcome
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }}
      edges={["top", "left", "right", "bottom"]}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 20,
          paddingTop: 48,
          paddingBottom: 24,
          justifyContent: "space-between",
        }}
        showsVerticalScrollIndicator={false}
      >
        <View>
          {/* Soft Indigo Hero Preview Container matching Screen 02 */}
          <View
            style={{
              backgroundColor: isDark ? "#1E1B4B" : "#EEF2FF",
              borderRadius: 24,
              padding: 20,
              marginBottom: 32,
            }}
          >
            <View
              style={{
                backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                borderRadius: 16,
                overflow: "hidden",
                position: "relative",
              }}
            >
              <View
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 4,
                  backgroundColor: "#2563EB",
                }}
              />
              <View style={{ padding: 16, paddingLeft: 20 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <Text variant="body" style={{ color: isDark ? "#94A3B8" : "#475569" }}>
                    Next class
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: isDark ? "#312E81" : "#EEF2FF",
                      borderRadius: 9999,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                    }}
                  >
                    <Clock size={12} color={isDark ? "#818CF8" : "#4F46E5"} strokeWidth={2.2} />
                    <Text
                      variant="label-sm"
                      style={{
                        color: isDark ? "#818CF8" : "#4F46E5",
                        marginLeft: 4,
                      }}
                    >
                      in 1 h 40 min
                    </Text>
                  </View>
                </View>

                <Text
                  variant="title-card"
                  style={{
                    color: isDark ? "#F8FAFC" : "#0F172A",
                    marginBottom: 8,
                  }}
                >
                  CSC 301 · Operating Systems
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <Text
                    variant="title-section"
                    style={{
                      color: isDark ? "#F8FAFC" : "#0F172A",
                      fontVariant: ["tabular-nums"],
                      marginRight: 10,
                    }}
                  >
                    10:00 am
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <MapPin size={16} color={isDark ? "#F8FAFC" : "#0F172A"} strokeWidth={2} />
                    <Text
                      variant="title-section"
                      style={{
                        color: isDark ? "#F8FAFC" : "#0F172A",
                        marginLeft: 4,
                      }}
                    >
                      LT1
                    </Text>
                  </View>
                </View>

                <Text variant="caption" style={{ color: isDark ? "#94A3B8" : "#475569" }}>
                  Lecture · Faculty of Science · Dr. E. Okoro
                </Text>
              </View>
            </View>
          </View>

          {/* Headline & Copy */}
          <Text
            variant="display"
            style={{
              color: isDark ? "#F8FAFC" : "#0F172A",
              fontSize: 28,
              lineHeight: 34,
              marginBottom: 14,
            }}
          >
            Every class, venue and{"\n"}deadline in one place
          </Text>

          <Text
            variant="body-lg"
            style={{
              color: isDark ? "#94A3B8" : "#475569",
              fontFamily: "Inter_400Regular",
              lineHeight: 24,
            }}
          >
            Join your class with a link, code or QR from your course rep. Or set up your own
            timetable in a few minutes.
          </Text>
        </View>

        {/* Bottom Actions */}
        <View style={{ rowGap: 12, marginTop: 32 }}>
          <Pressable
            onPress={() => router.push("/join/scan" as any)}
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
            <Scan size={18} color="#FFFFFF" strokeWidth={2.2} />
            <Text variant="label-lg" style={{ color: "#FFFFFF", marginLeft: 8 }}>
              Join my class
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              setNextDestination("/setup/semester");
              setEmail("");
              setPassword("");
              setMode("signup");
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
              Set up my own timetable
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              setNextDestination("/(tabs)");
              setPassword("");
              setMode("signin");
            }}
            accessibilityRole="button"
            style={{
              height: 44,
              alignItems: "center",
              justifyContent: "center",
              marginTop: 4,
            }}
          >
            <Text variant="label-lg" style={{ color: isDark ? "#818CF8" : "#4F46E5" }}>
              I already have an account
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
