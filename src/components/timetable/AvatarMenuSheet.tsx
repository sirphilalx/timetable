import React from "react";
import { View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import {
  Scan,
  Bell,
  BarChart2,
  Settings,
  LogOut,
  ChevronRight,
  Plus,
  Share2,
  ClipboardCheck,
  Users,
} from "lucide-react-native";
import { Sheet } from "@/components/ui/Sheet";
import { Text } from "@/components/ui/Text";
import { StudentAvatar } from "@/components/ui/StudentAvatar";
import { useTheme } from "@/theme";
import { useAuth } from "@/auth";

export interface AvatarMenuSheetProps {
  isOpen: boolean;
  onClose: () => void;
  displayName?: string;
  username?: string;
  avatarUrl?: string | null;
  email?: string;
  initials?: string;
}

export function AvatarMenuSheet({
  isOpen,
  onClose,
  displayName,
  username,
  avatarUrl,
  email,
  initials,
}: AvatarMenuSheetProps) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { user, signOut } = useAuth();

  const resolvedName = displayName ?? (user.displayName || "Student");
  const resolvedUsername = username ?? user.username;
  const resolvedAvatarUrl = avatarUrl !== undefined ? avatarUrl : user.avatarUrl;
  const resolvedEmail = email ?? user.email;
  const resolvedInitials = initials ?? user.initials;

  const navigateTo = (href: string) => {
    onClose();
    setTimeout(() => {
      router.push(href as any);
    }, 120);
  };

  const rows = [
    {
      icon: Scan,
      title: "Join a class",
      subtitle: "Scan a QR code or enter a share code",
      onPress: () => navigateTo("/join/scan"),
    },
    {
      icon: Share2,
      title: "Share class timetable",
      subtitle: "QR card, share code or projector mode",
      onPress: () => navigateTo("/share/create"),
    },
    {
      icon: Plus,
      title: "Set up semester & courses",
      subtitle: "Add courses or weekly classes",
      onPress: () => navigateTo("/setup/courses"),
    },
    {
      icon: Bell,
      title: "Notifications",
      subtitle: "3 new",
      onPress: () => navigateTo("/notifications"),
    },
    {
      icon: ClipboardCheck,
      title: "Pending check-ins",
      subtitle: "3 left in 7-day window",
      onPress: () => navigateTo("/check-ins/pending"),
    },
    {
      icon: BarChart2,
      title: "Reports",
      subtitle: "Attendance and weekly summary",
      onPress: () => navigateTo("/reports"),
    },
    {
      icon: Users,
      title: "Class settings (CSC 300L)",
      subtitle: "Members, change log, pause & rollover",
      onPress: () => navigateTo("/class-settings"),
    },
    {
      icon: Settings,
      title: "Settings",
      subtitle: undefined,
      onPress: () => navigateTo("/settings"),
    },
    {
      icon: LogOut,
      title: "Sign out",
      subtitle: undefined,
      onPress: () => {
        onClose();
        void signOut().then(() => {
          router.replace("/setup/welcome");
        });
      },
    },
  ];

  return (
    <Sheet isOpen={isOpen} onClose={onClose}>
      <View style={{ paddingBottom: 8 }}>
        {/* Student Profile Row (Screen 33) */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 12,
            marginBottom: 8,
          }}
        >
          <View style={{ marginRight: 14 }}>
            <StudentAvatar
              avatarUrl={resolvedAvatarUrl}
              initials={resolvedInitials}
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
                {resolvedName}
              </Text>
              {resolvedUsername ? (
                <Text
                  variant="caption"
                  style={{
                    color: isDark ? "#818CF8" : "#4F46E5",
                    fontFamily: "Inter_600SemiBold",
                  }}
                >
                  @{resolvedUsername}
                </Text>
              ) : null}
            </View>
            <Text variant="body" style={{ color: isDark ? "#94A3B8" : "#475569", marginTop: 2 }}>
              {resolvedEmail}
            </Text>
          </View>
        </View>

        {/* Menu Rows */}
        <View style={{ rowGap: 4 }}>
          {rows.map((item) => {
            const IconComponent = item.icon;
            return (
              <Pressable
                key={item.title}
                onPress={item.onPress}
                accessibilityRole="button"
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  minHeight: 56,
                  paddingVertical: 10,
                }}
              >
                <View
                  style={{
                    width: 32,
                    alignItems: "flex-start",
                    justifyContent: "center",
                    marginRight: 8,
                  }}
                >
                  <IconComponent
                    size={20}
                    color={isDark ? "#CBD5E1" : "#334155"}
                    strokeWidth={1.85}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text variant="body-lg" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                    {item.title}
                  </Text>
                  {item.subtitle ? (
                    <Text
                      variant="body"
                      style={{
                        color: isDark ? "#94A3B8" : "#475569",
                        marginTop: 2,
                      }}
                    >
                      {item.subtitle}
                    </Text>
                  ) : null}
                </View>

                <ChevronRight size={18} color={isDark ? "#64748B" : "#475569"} strokeWidth={1.85} />
              </Pressable>
            );
          })}
        </View>
      </View>
    </Sheet>
  );
}
