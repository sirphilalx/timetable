import React, { useState } from "react";
import { View, ScrollView, Pressable, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Lock,
  Link2,
  Info,
  Trash2,
  AtSign,
} from "lucide-react-native";
import { Text } from "@/components/ui/Text";
import { StudentAvatar } from "@/components/ui/StudentAvatar";
import { PhotoPickerSheet } from "@/components/ui/PhotoPickerSheet";
import { OAuthAccountChooserModal } from "@/components/ui/OAuthAccountChooserModal";
import { useTheme } from "@/theme";
import { useAuth, normalizeUsername } from "@/auth";

const FULL_MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function formatDobForDisplay(isoDob: string): string {
  const match = isoDob.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return isoDob || "Not provided";
  const year = Number(match[1]);
  const monthIdx = Math.max(0, Math.min(11, Number(match[2]) - 1));
  const day = Number(match[3]);
  return `${day} ${FULL_MONTH_NAMES[monthIdx] ?? "April"} ${year}`;
}

type AccountViewMode = "profile" | "delete-handover" | "delete-confirm";

export default function SettingsAccountScreen() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { user, updateProfile, signInWithOAuth, signOut, isClerkConfigured } = useAuth();

  const [mode, setMode] = useState<AccountViewMode>("profile");
  const [displayName, setDisplayName] = useState(user.displayName);
  const [username, setUsername] = useState(user.username || "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user.avatarUrl ?? null);
  const [photoSheetOpen, setPhotoSheetOpen] = useState(false);
  const [googleChooserOpen, setGoogleChooserOpen] = useState(false);
  const [email, setEmail] = useState(user.email);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [passwordText, setPasswordText] = useState("");
  const isDeleteArmed = deleteConfirmText.trim().toUpperCase() === "DELETE";

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/settings");
    }
  };

  if (mode === "delete-confirm") {
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
            {/* Header (Screen 88) */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                height: 48,
                marginBottom: 16,
              }}
            >
              <Pressable
                onPress={() => setMode("delete-handover")}
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
                Delete account
              </Text>
            </View>

            {/* Step 2 Indicator */}
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
              style={{ color: isDark ? "#F8FAFC" : "#0F172A", marginBottom: 12 }}
            >
              This cannot be undone
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
              Your data is removed within 30 days. Copies in backups are cleared on the next cycle.
              Ownership of CSC 300L Study Group passes to Emeka when he accepts.
            </Text>

            <View style={{ marginBottom: 20 }}>
              <Text
                variant="label"
                style={{ color: isDark ? "#CBD5E1" : "#334155", marginBottom: 6 }}
              >
                Type DELETE to confirm
              </Text>
              <TextInput
                value={deleteConfirmText}
                onChangeText={setDeleteConfirmText}
                autoCapitalize="characters"
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

            <View>
              <Text
                variant="label"
                style={{ color: isDark ? "#CBD5E1" : "#334155", marginBottom: 6 }}
              >
                Password
              </Text>
              <TextInput
                value={passwordText}
                onChangeText={setPasswordText}
                secureTextEntry
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
          </ScrollView>

          <View style={{ paddingHorizontal: 16, paddingBottom: 16, rowGap: 12 }}>
            <Pressable
              disabled={!isDeleteArmed}
              onPress={async () => {
                if (!isDeleteArmed) return;
                await signOut();
                router.replace("/setup/welcome");
              }}
              accessibilityRole="button"
              style={{
                height: 52,
                borderRadius: 12,
                backgroundColor: isDeleteArmed ? "#DC2626" : isDark ? "#334155" : "#CBD5E1",
                opacity: isDeleteArmed ? 1 : 0.6,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Trash2 size={18} color="#FFFFFF" strokeWidth={2.2} />
              <Text variant="label-lg" style={{ color: "#FFFFFF", marginLeft: 8 }}>
                Delete my account
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setMode("profile")}
              accessibilityRole="button"
              style={{
                height: 44,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text variant="label-lg" style={{ color: isDark ? "#818CF8" : "#4F46E5" }}>
                Keep my account
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (mode === "delete-handover") {
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
            {/* Header (Screen 87) */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                height: 48,
                marginBottom: 16,
              }}
            >
              <Pressable
                onPress={() => setMode("profile")}
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
                Delete account
              </Text>
            </View>

            {/* Step 1 Indicator */}
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
              style={{ color: isDark ? "#F8FAFC" : "#0F172A", marginBottom: 12 }}
            >
              You own a class
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
              Before your account goes, someone has to take over CSC 300L Study Group so its 24
              members keep getting updates.
            </Text>

            <View style={{ marginBottom: 16 }}>
              <Text
                variant="label"
                style={{ color: isDark ? "#CBD5E1" : "#334155", marginBottom: 6 }}
              >
                New owner
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
                <Text
                  variant="body-lg"
                  style={{
                    color: isDark ? "#F8FAFC" : "#0F172A",
                    fontFamily: "Inter_400Regular",
                  }}
                >
                  Emeka Nwosu · editor
                </Text>
                <ChevronDown size={18} color={isDark ? "#94A3B8" : "#475569"} />
              </View>
              <Text
                variant="caption"
                style={{ color: isDark ? "#94A3B8" : "#475569", marginTop: 6 }}
              >
                They have 7 days to accept
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                backgroundColor: isDark ? "#1E293B" : "#F1F5F9",
                borderRadius: 12,
                padding: 14,
                marginBottom: 24,
              }}
            >
              <Info size={18} color={isDark ? "#94A3B8" : "#475569"} strokeWidth={2} />
              <Text
                variant="body"
                style={{
                  color: isDark ? "#CBD5E1" : "#334155",
                  marginLeft: 10,
                  flex: 1,
                  lineHeight: 20,
                }}
              >
                If nobody accepts in 7 days, the class is archived and members keep a read-only
                copy.
              </Text>
            </View>

            <Text
              variant="label"
              style={{ color: isDark ? "#CBD5E1" : "#334155", marginBottom: 12 }}
            >
              What gets deleted
            </Text>

            <View style={{ rowGap: 14 }}>
              {[
                "Your account, display name and sign-in",
                "Your notes, check-ins and reports",
                "Your follows. Classes you followed are not affected.",
              ].map((line) => (
                <View key={line} style={{ flexDirection: "row", alignItems: "flex-start" }}>
                  <Trash2 size={18} color={isDark ? "#94A3B8" : "#475569"} strokeWidth={1.85} />
                  <Text
                    variant="body-lg"
                    style={{
                      color: isDark ? "#CBD5E1" : "#0F172A",
                      fontFamily: "Inter_400Regular",
                      marginLeft: 12,
                      flex: 1,
                      lineHeight: 22,
                    }}
                  >
                    {line}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>

          <View style={{ paddingHorizontal: 16, paddingBottom: 16, rowGap: 12 }}>
            <Pressable
              onPress={() => setMode("delete-confirm")}
              accessibilityRole="button"
              style={{
                height: 52,
                borderRadius: 12,
                backgroundColor: "#DC2626",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text variant="label-lg" style={{ color: "#FFFFFF" }}>
                Send transfer and continue
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setMode("profile")}
              accessibilityRole="button"
              style={{
                height: 44,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text variant="label-lg" style={{ color: isDark ? "#818CF8" : "#4F46E5" }}>
                Cancel
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
          {/* Header (Screen 86) */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              height: 48,
              marginBottom: 12,
            }}
          >
            <Pressable
              onPress={handleBack}
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
              Account
            </Text>
          </View>

          {/* Avatar Center */}
          <View style={{ alignItems: "center", marginBottom: 24 }}>
            <Pressable
              onPress={() => setPhotoSheetOpen(true)}
              accessibilityRole="button"
              accessibilityLabel="Change profile photo"
              style={{ alignItems: "center" }}
            >
              <View style={{ marginBottom: 12 }}>
                <StudentAvatar
                  avatarUrl={avatarUrl}
                  initials={user.initials}
                  size={84}
                  borderWidth={2}
                  borderColor="#FFFFFF"
                  showCameraBadge
                />
              </View>
              <Text
                variant="caption"
                style={{ color: isDark ? "#94A3B8" : "#475569", marginBottom: 4 }}
              >
                {isClerkConfigured
                  ? `Clerk session active · ${user.clerkUserId}`
                  : `Local session · ${user.clerkUserId}`}
              </Text>
              <Text variant="label-lg" style={{ color: isDark ? "#818CF8" : "#4F46E5" }}>
                Change photo
              </Text>
            </Pressable>
          </View>

          {/* Display name */}
          <View style={{ marginBottom: 20 }}>
            <Text
              variant="label"
              style={{ color: isDark ? "#CBD5E1" : "#334155", marginBottom: 6 }}
            >
              Display name
            </Text>
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
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
            <Text variant="caption" style={{ color: isDark ? "#94A3B8" : "#475569", marginTop: 6 }}>
              Classmates and reps see this name
            </Text>
          </View>

          {/* Username */}
          <View style={{ marginBottom: 20 }}>
            <Text
              variant="label"
              style={{ color: isDark ? "#CBD5E1" : "#334155", marginBottom: 6 }}
            >
              Username
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
              }}
            >
              <AtSign size={16} color={isDark ? "#818CF8" : "#4F46E5"} strokeWidth={2.2} />
              <TextInput
                value={username}
                onChangeText={(val) => setUsername(val.replace(/^@+/, "").toLowerCase())}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="chioma_okafor"
                placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                style={{
                  flex: 1,
                  marginLeft: 6,
                  fontFamily: "Inter_400Regular",
                  fontSize: 15,
                  color: isDark ? "#F8FAFC" : "#0F172A",
                }}
              />
            </View>
            <Text variant="caption" style={{ color: isDark ? "#94A3B8" : "#475569", marginTop: 6 }}>
              Your @handle in group assignments and class polls
            </Text>
          </View>

          {/* Email */}
          <View style={{ marginBottom: 20 }}>
            <Text
              variant="label"
              style={{ color: isDark ? "#CBD5E1" : "#334155", marginBottom: 6 }}
            >
              Email
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
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

          {/* Date of birth (read-only) */}
          <View style={{ marginBottom: 20 }}>
            <Text
              variant="label"
              style={{ color: isDark ? "#64748B" : "#64748B", marginBottom: 6 }}
            >
              Date of birth
            </Text>
            <View
              style={{
                height: 48,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: isDark ? "#334155" : "#CBD5E1",
                backgroundColor: isDark ? "#0F172A" : "#F1F5F9",
                paddingHorizontal: 14,
                justifyContent: "center",
              }}
            >
              <Text variant="body-lg" style={{ color: isDark ? "#64748B" : "#94A3B8" }}>
                {formatDobForDisplay(user.dateOfBirth)}
              </Text>
            </View>
            <Text variant="caption" style={{ color: isDark ? "#94A3B8" : "#475569", marginTop: 6 }}>
              Contact support to change this
            </Text>
          </View>

          {/* Password & Sign in with Google Card */}
          <View
            style={{
              backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
              borderRadius: 16,
              borderWidth: 1,
              borderColor: isDark ? "#334155" : "#E2E8F0",
              padding: 16,
              rowGap: 20,
              marginBottom: 20,
            }}
          >
            <Pressable
              onPress={() => router.push("/setup/welcome?mode=reset" as any)}
              accessibilityRole="button"
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                <View style={{ width: 32, alignItems: "flex-start" }}>
                  <Lock size={20} color={isDark ? "#94A3B8" : "#475569"} strokeWidth={1.85} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="body-lg" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                    Password
                  </Text>
                  <Text
                    variant="body"
                    style={{ color: isDark ? "#94A3B8" : "#475569", marginTop: 2 }}
                  >
                    Tap to change or reset password
                  </Text>
                </View>
              </View>
              <ChevronRight size={18} color={isDark ? "#94A3B8" : "#475569"} strokeWidth={2} />
            </Pressable>

            <Pressable
              onPress={() => setGoogleChooserOpen(true)}
              accessibilityRole="button"
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                <View style={{ width: 32, alignItems: "flex-start" }}>
                  <Link2 size={20} color={isDark ? "#94A3B8" : "#475569"} strokeWidth={1.85} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="body-lg" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                    Sign in with Google
                  </Text>
                  <Text
                    variant="body"
                    style={{ color: isDark ? "#94A3B8" : "#475569", marginTop: 2 }}
                  >
                    {user.clerkUserId.startsWith("user_google_")
                      ? `Connected · ${email}`
                      : "Tap to choose Google account"}
                  </Text>
                </View>
              </View>
              <ChevronRight size={18} color={isDark ? "#94A3B8" : "#475569"} strokeWidth={2} />
            </Pressable>
          </View>

          {/* Sign Out & Delete Account Links */}
          <View style={{ alignItems: "center", rowGap: 12 }}>
            <Pressable
              onPress={async () => {
                await signOut();
                router.replace("/setup/welcome");
              }}
              accessibilityRole="button"
              style={{
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: isDark ? "#334155" : "#CBD5E1",
              }}
            >
              <Text variant="label" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                Sign out
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setMode("delete-handover")}
              accessibilityRole="button"
              style={{
                paddingVertical: 8,
                alignSelf: "center",
              }}
            >
              <Text variant="label" style={{ color: isDark ? "#F87171" : "#DC2626" }}>
                Delete account...
              </Text>
            </Pressable>
          </View>
        </ScrollView>

        <PhotoPickerSheet
          isOpen={photoSheetOpen}
          onClose={() => setPhotoSheetOpen(false)}
          currentAvatarUrl={avatarUrl}
          initials={user.initials}
          onSelectAvatar={(nextUri) => setAvatarUrl(nextUri)}
        />

        <OAuthAccountChooserModal
          visible={googleChooserOpen}
          provider="oauth_google"
          currentUser={{ displayName, email, avatarUrl }}
          onClose={() => setGoogleChooserOpen(false)}
          onSelectAccount={async (chosen) => {
            setGoogleChooserOpen(false);
            setDisplayName(chosen.displayName);
            setEmail(chosen.email);
            if (chosen.avatarUrl) {
              setAvatarUrl(chosen.avatarUrl);
            }
            await signInWithOAuth("oauth_google", {
              email: chosen.email,
              displayName: chosen.displayName,
              avatarUrl: chosen.avatarUrl ?? avatarUrl,
              completeOnboarding: true,
            });
          }}
        />

        <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
          <Pressable
            onPress={async () => {
              await updateProfile({
                displayName,
                username: normalizeUsername(username),
                avatarUrl,
                email,
              });
              handleBack();
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
              Save changes
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
