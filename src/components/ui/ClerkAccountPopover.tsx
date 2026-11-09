import React from "react";
import { Modal, View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import {
  LogOut,
  Settings,
  UserCheck,
  RefreshCw,
  ShieldCheck,
  X,
  ChevronRight,
} from "lucide-react-native";
import { Text } from "./Text";
import { StudentAvatar } from "./StudentAvatar";
import { useTheme } from "@/theme";
import { useAuth } from "@/auth";

export interface ClerkAccountPopoverProps {
  visible: boolean;
  onClose: () => void;
  onSwitchAccount?: () => void;
}

export function ClerkAccountPopover({
  visible,
  onClose,
  onSwitchAccount,
}: ClerkAccountPopoverProps) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { user, isSignedIn, isClerkConfigured, signOut } = useAuth();

  if (!visible) return null;

  const isRealClerkSession = Boolean(
    isClerkConfigured &&
    user.clerkUserId &&
    !user.clerkUserId.startsWith("user_local_") &&
    isSignedIn,
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: "rgba(15, 23, 42, 0.55)",
          alignItems: "center",
          justifyContent: "flex-start",
          paddingTop: 76,
          paddingHorizontal: 16,
        }}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            width: "100%",
            maxWidth: 360,
            alignSelf: "flex-end",
            borderRadius: 22,
            backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
            borderWidth: 1,
            borderColor: isDark ? "#334155" : "#E2E8F0",
            overflow: "hidden",
            shadowColor: "#000000",
            shadowOpacity: 0.25,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 10 },
            elevation: 10,
          }}
        >
          {/* Active User Header */}
          <View
            style={{
              padding: 18,
              borderBottomWidth: 1,
              borderBottomColor: isDark ? "#334155" : "#F1F5F9",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
              <StudentAvatar
                avatarUrl={user.avatarUrl}
                initials={user.initials}
                size={48}
                borderWidth={2}
                borderColor={isDark ? "#4F46E5" : "#EEF2FF"}
              />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text
                  variant="title-card"
                  numberOfLines={1}
                  style={{ color: isDark ? "#F8FAFC" : "#0F172A", fontSize: 16 }}
                >
                  {user.displayName || "Student"}
                </Text>
                {user.username ? (
                  <Text
                    variant="caption"
                    numberOfLines={1}
                    style={{
                      color: isDark ? "#818CF8" : "#4F46E5",
                      fontFamily: "Inter_600SemiBold",
                      marginTop: 1,
                    }}
                  >
                    @{user.username}
                  </Text>
                ) : null}
                <Text
                  variant="caption"
                  numberOfLines={1}
                  style={{ color: isDark ? "#94A3B8" : "#64748B", marginTop: 2 }}
                >
                  {user.email || "No email linked"}
                </Text>
              </View>
            </View>

            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close account menu"
              hitSlop={10}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: isDark ? "#0F172A" : "#F1F5F9",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={16} color={isDark ? "#94A3B8" : "#64748B"} />
            </Pressable>
          </View>

          {/* Clerk Session Status Pill */}
          <View
            style={{
              paddingHorizontal: 18,
              paddingVertical: 10,
              backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
              borderBottomWidth: 1,
              borderBottomColor: isDark ? "#334155" : "#F1F5F9",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", columnGap: 8 }}>
              <ShieldCheck
                size={15}
                color={isRealClerkSession ? "#16A34A" : "#D97706"}
                strokeWidth={2.2}
              />
              <Text
                variant="caption"
                style={{
                  color: isDark ? "#CBD5E1" : "#334155",
                  fontFamily: "Inter_500Medium",
                }}
              >
                {isRealClerkSession
                  ? "Clerk session active"
                  : isSignedIn
                    ? "Signed in (device session)"
                    : "Not signed in"}
              </Text>
            </View>
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: isRealClerkSession ? "#16A34A" : "#F59E0B",
              }}
            />
          </View>

          {/* Menu Actions */}
          <View style={{ padding: 10, rowGap: 4 }}>
            <Pressable
              onPress={() => {
                onClose();
                router.push("/settings/account" as any);
              }}
              accessibilityRole="button"
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 12,
                paddingHorizontal: 12,
                borderRadius: 12,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", columnGap: 12 }}>
                <Settings size={18} color={isDark ? "#CBD5E1" : "#334155"} strokeWidth={2} />
                <Text variant="label-lg" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                  Manage account & profile
                </Text>
              </View>
              <ChevronRight size={16} color={isDark ? "#64748B" : "#94A3B8"} />
            </Pressable>

            <Pressable
              onPress={() => {
                onClose();
                if (onSwitchAccount) {
                  onSwitchAccount();
                } else {
                  router.push("/setup/welcome?mode=signin" as any);
                }
              }}
              accessibilityRole="button"
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 12,
                paddingHorizontal: 12,
                borderRadius: 12,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", columnGap: 12 }}>
                <RefreshCw size={18} color={isDark ? "#CBD5E1" : "#334155"} strokeWidth={2} />
                <Text variant="label-lg" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                  Switch account / Sign in
                </Text>
              </View>
              <ChevronRight size={16} color={isDark ? "#64748B" : "#94A3B8"} />
            </Pressable>

            <View
              style={{
                height: 1,
                backgroundColor: isDark ? "#334155" : "#F1F5F9",
                marginVertical: 4,
              }}
            />

            <Pressable
              onPress={async () => {
                onClose();
                await signOut();
                router.replace("/setup/welcome?mode=signin" as any);
              }}
              accessibilityRole="button"
              style={{
                flexDirection: "row",
                alignItems: "center",
                columnGap: 12,
                paddingVertical: 12,
                paddingHorizontal: 12,
                borderRadius: 12,
                backgroundColor: isDark ? "rgba(220, 38, 38, 0.14)" : "#FEF2F2",
              }}
            >
              <LogOut size={18} color={isDark ? "#F87171" : "#DC2626"} strokeWidth={2.2} />
              <Text
                variant="label-lg"
                style={{ color: isDark ? "#F87171" : "#DC2626", fontFamily: "Inter_600SemiBold" }}
              >
                Sign out
              </Text>
            </Pressable>
          </View>

          {/* Clerk Footer Badge */}
          <View
            style={{
              paddingVertical: 10,
              paddingHorizontal: 18,
              backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
              borderTopWidth: 1,
              borderTopColor: isDark ? "#334155" : "#F1F5F9",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              columnGap: 6,
            }}
          >
            <UserCheck size={13} color={isDark ? "#64748B" : "#94A3B8"} />
            <Text variant="caption" style={{ color: isDark ? "#64748B" : "#94A3B8" }}>
              Secured by Clerk Authentication
            </Text>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
