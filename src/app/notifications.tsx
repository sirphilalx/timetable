import React, { useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ChevronLeft,
  CornerUpRight,
  ClipboardCheck,
  UserPlus,
  Info,
  Bell,
  Check,
  CalendarOff,
} from "lucide-react-native";
import { Text } from "@/components/ui/Text";
import { useTheme } from "@/theme";
import { useInAppNotifications } from "@/hooks/useTimetable";
import { formatRelativeNotificationAge, type InAppNotificationItem } from "@/lib/reminders";

export default function NotificationsScreen() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { items, unreadCount, markRead, markAllRead } = useInAppNotifications();

  const [nowMs] = useState(() => Date.now());
  const todayItems = items.filter((item) => {
    const ts = new Date(item.createdAtIso).getTime();
    return Number.isNaN(ts) || nowMs - ts < 24 * 60 * 60 * 1000;
  });
  const earlierItems = items.filter((item) => {
    const ts = new Date(item.createdAtIso).getTime();
    return !Number.isNaN(ts) && nowMs - ts >= 24 * 60 * 60 * 1000;
  });

  const getVisualsForKind = (kind: InAppNotificationItem["kind"]) => {
    if (kind === "move") {
      return {
        icon: CornerUpRight,
        circleBg: isDark ? "#451A03" : "#FEF3C7",
        iconColor: isDark ? "#FBBF24" : "#92400E",
      };
    }
    if (kind === "cancel") {
      return {
        icon: CalendarOff,
        circleBg: isDark ? "#450A0A" : "#FEE2E2",
        iconColor: isDark ? "#F87171" : "#DC2626",
      };
    }
    if (kind === "assignment") {
      return {
        icon: ClipboardCheck,
        circleBg: isDark ? "#1E1B4B" : "#EEF2FF",
        iconColor: isDark ? "#818CF8" : "#4338CA",
      };
    }
    if (kind === "invite") {
      return {
        icon: UserPlus,
        circleBg: isDark ? "#1E1B4B" : "#EEF2FF",
        iconColor: isDark ? "#818CF8" : "#4338CA",
      };
    }
    if (kind === "reminder" || kind === "checkin") {
      return {
        icon: Bell,
        circleBg: isDark ? "#1E1B4B" : "#EEF2FF",
        iconColor: isDark ? "#818CF8" : "#4F46E5",
      };
    }
    return {
      icon: Info,
      circleBg: isDark ? "#1E293B" : "#F1F5F9",
      iconColor: isDark ? "#94A3B8" : "#334155",
    };
  };

  const renderItemRow = (item: InAppNotificationItem) => {
    const visuals = getVisualsForKind(item.kind);
    const IconComp = visuals.icon;
    const ageLabel = formatRelativeNotificationAge(item.createdAtIso, nowMs);
    const displaySubtitle = item.subtitle.includes("·")
      ? item.subtitle
      : `${item.subtitle} · ${ageLabel}`;

    return (
      <Pressable
        key={item.id}
        onPress={async () => {
          await markRead(item);
          router.push(item.route as any);
        }}
        accessibilityRole="button"
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          paddingHorizontal: 16,
          paddingVertical: 14,
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: visuals.circleBg,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 14,
          }}
        >
          <IconComp size={20} color={visuals.iconColor} strokeWidth={2} />
        </View>

        <View style={{ flex: 1, marginRight: 10 }}>
          <Text
            variant={item.unread ? "title-card" : "body-lg"}
            style={{
              color: isDark ? "#F8FAFC" : "#0F172A",
              fontSize: 16,
              lineHeight: 22,
            }}
          >
            {item.title}
          </Text>
          <Text
            variant="body"
            style={{
              color: isDark ? "#94A3B8" : "#475569",
              marginTop: 2,
            }}
          >
            {displaySubtitle}
          </Text>
        </View>

        {item.unread ? (
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: "#4F46E5",
              marginTop: 6,
            }}
          />
        ) : null}
      </Pressable>
    );
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }}
      edges={["top", "left", "right"]}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header (Screen 32) */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 16,
            paddingTop: 8,
            height: 56,
            marginBottom: 12,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
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
              Notifications
            </Text>
          </View>

          {unreadCount > 0 ? (
            <Pressable
              onPress={() => {
                void markAllRead();
              }}
              accessibilityRole="button"
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 8,
                backgroundColor: isDark ? "#1E1B4B" : "#EEF2FF",
              }}
            >
              <Check size={14} color={isDark ? "#818CF8" : "#4F46E5"} strokeWidth={2.2} />
              <Text
                variant="caption"
                style={{
                  color: isDark ? "#818CF8" : "#4F46E5",
                  fontFamily: "Inter_600SemiBold",
                  marginLeft: 4,
                }}
              >
                Mark all read
              </Text>
            </Pressable>
          ) : null}
        </View>

        {items.length === 0 ? (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 28,
              paddingTop: 56,
            }}
          >
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: isDark ? "#1E293B" : "#EEF2FF",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 18,
              }}
            >
              <Bell size={30} color={isDark ? "#818CF8" : "#4F46E5"} strokeWidth={1.85} />
            </View>
            <Text
              variant="title-section"
              style={{
                color: isDark ? "#F8FAFC" : "#0F172A",
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              No notifications yet
            </Text>
            <Text
              variant="body-lg"
              style={{
                color: isDark ? "#94A3B8" : "#475569",
                fontFamily: "Inter_400Regular",
                textAlign: "center",
                lineHeight: 22,
                marginBottom: 24,
              }}
            >
              Class moves, cancellations, assignment due alerts, and test reminders will appear
              here.
            </Text>

            <View style={{ flexDirection: "row", columnGap: 10 }}>
              <Pressable
                onPress={() => router.push("/settings/reminders" as any)}
                accessibilityRole="button"
                style={{
                  paddingHorizontal: 16,
                  height: 44,
                  borderRadius: 10,
                  backgroundColor: "#4F46E5",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text variant="label" style={{ color: "#FFFFFF" }}>
                  Reminder settings
                </Text>
              </Pressable>

              <Pressable
                onPress={() => router.push("/settings/reminder-check" as any)}
                accessibilityRole="button"
                style={{
                  paddingHorizontal: 16,
                  height: 44,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: isDark ? "#334155" : "#CBD5E1",
                  backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text variant="label" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                  Test reminder
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <>
            {todayItems.length > 0 ? (
              <>
                <Text
                  variant="label"
                  style={{
                    color: isDark ? "#94A3B8" : "#475569",
                    paddingHorizontal: 16,
                    marginBottom: 8,
                  }}
                >
                  Today
                </Text>

                <View
                  style={{
                    backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                    marginBottom: 24,
                  }}
                >
                  {todayItems.map(renderItemRow)}
                </View>
              </>
            ) : null}

            {earlierItems.length > 0 ? (
              <>
                <Text
                  variant="label"
                  style={{
                    color: isDark ? "#94A3B8" : "#475569",
                    paddingHorizontal: 16,
                    marginBottom: 8,
                  }}
                >
                  Earlier
                </Text>

                <View
                  style={{
                    backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                  }}
                >
                  {earlierItems.map(renderItemRow)}
                </View>
              </>
            ) : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
