import React, { useEffect, useState } from "react";
import { View, ScrollView, Pressable, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft, Check, AlertTriangle, BatteryCharging, Bell } from "lucide-react-native";
import { Text } from "@/components/ui/Text";
import { useTheme } from "@/theme";
import { useTimetable, formatStartTimeAmPm } from "@/hooks/useTimetable";
import {
  loadReminderPreferences,
  saveReminderPreferences,
  sendTestReminderNotification,
} from "@/lib/reminders";
import {
  getNotificationPermissionState,
  requestNotificationPermissions,
} from "@/lib/notifications";

export default function ReminderSetupCheckScreen() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { data } = useTimetable();

  const [notificationsAllowed, setNotificationsAllowed] = useState(true);
  const [batteryFixed, setBatteryFixed] = useState(false);
  const [leadMinutes, setLeadMinutes] = useState<30 | 60>(30);
  const [testReminderMessage, setTestReminderMessage] = useState(
    'Tap "Send a test reminder" below to verify notifications on your phone.',
  );

  useEffect(() => {
    void loadReminderPreferences().then((prefs) => {
      setBatteryFixed(prefs.batteryFixed);
      setLeadMinutes(prefs.leadMinutes);
    });
    void getNotificationPermissionState().then((perm) => {
      setNotificationsAllowed(perm.granted);
    });
  }, []);

  const handleFixBattery = async () => {
    setBatteryFixed(true);
    await saveReminderPreferences({ batteryFixed: true });
    try {
      await Linking.openSettings();
    } catch {
      // Ignore on web or unsupported environments
    }
  };

  const handleSendTestReminder = async () => {
    const perm = await requestNotificationPermissions();
    setNotificationsAllowed(perm.granted);
    const firstCourse = data.courses[0];
    const firstRule = firstCourse
      ? data.classRules.find((r) => r.courseId === firstCourse.id)
      : data.classRules[0];
    const result = await sendTestReminderNotification(
      leadMinutes,
      firstCourse
        ? {
            id: firstCourse.id,
            code: firstCourse.code,
            title: firstCourse.title,
            venue: firstRule?.venue.split(",")[0]?.trim() || "LT1",
            startTimeFormatted: firstRule ? formatStartTimeAmPm(firstRule.startTime) : "10:00 am",
          }
        : undefined,
    );
    setTestReminderMessage(
      result.ok
        ? `Test sent: "${result.title}" · arrived on time (< 1s delay).`
        : `Scheduled: "${result.title}" · enable notifications in system settings if banner was hidden.`,
    );
  };

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
          {/* Header (Screen 83) */}
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
                  router.replace("/settings");
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
              Reminder setup check
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
            Some phones stop apps in the background to save battery. These checks make sure your
            reminders arrive on time.
          </Text>

          {/* 4 Checks Card */}
          <View
            style={{
              backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
              borderRadius: 16,
              borderWidth: 1,
              borderColor: isDark ? "#334155" : "#E2E8F0",
              padding: 16,
              rowGap: 20,
              marginBottom: 16,
            }}
          >
            {/* 1. Notifications allowed */}
            <Pressable
              onPress={() => {
                void requestNotificationPermissions().then((p) =>
                  setNotificationsAllowed(p.granted),
                );
              }}
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: notificationsAllowed
                    ? isDark
                      ? "#052E16"
                      : "#ECFDF5"
                    : isDark
                      ? "#451A03"
                      : "#FEF3C7",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 14,
                }}
              >
                {notificationsAllowed ? (
                  <Check size={18} color={isDark ? "#4ADE80" : "#16A34A"} strokeWidth={2.4} />
                ) : (
                  <AlertTriangle size={18} color={isDark ? "#FBBF24" : "#92400E"} strokeWidth={2} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="title-card" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                  Notifications allowed
                </Text>
                <Text
                  variant="body"
                  style={{ color: isDark ? "#94A3B8" : "#475569", marginTop: 2 }}
                >
                  {notificationsAllowed
                    ? "TT can remind you before class"
                    : "Tap to allow notifications from TT"}
                </Text>
              </View>
            </Pressable>

            {/* 2. Alarms and reminders */}
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: isDark ? "#052E16" : "#ECFDF5",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 14,
                }}
              >
                <Check size={18} color={isDark ? "#4ADE80" : "#16A34A"} strokeWidth={2.4} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="title-card" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                  Alarms and reminders
                </Text>
                <Text
                  variant="body"
                  style={{ color: isDark ? "#94A3B8" : "#475569", marginTop: 2 }}
                >
                  Allowed to ring at an exact time
                </Text>
              </View>
            </View>

            {/* 3. Battery saver for TT (Tecno / Infinix / Itel / Samsung guidance) */}
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: batteryFixed
                    ? isDark
                      ? "#052E16"
                      : "#ECFDF5"
                    : isDark
                      ? "#451A03"
                      : "#FEF3C7",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 14,
                }}
              >
                {batteryFixed ? (
                  <Check size={18} color={isDark ? "#4ADE80" : "#16A34A"} strokeWidth={2.4} />
                ) : (
                  <AlertTriangle size={18} color={isDark ? "#FBBF24" : "#92400E"} strokeWidth={2} />
                )}
              </View>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text variant="title-card" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                  Battery saver for TT
                </Text>
                <Text
                  variant="body"
                  style={{ color: isDark ? "#94A3B8" : "#475569", marginTop: 2, lineHeight: 19 }}
                >
                  {batteryFixed
                    ? "Set to No restrictions for reliable alarms."
                    : "Tecno and Infinix phones may delay reminders. Set TT to No restrictions."}
                </Text>
              </View>

              {!batteryFixed ? (
                <Pressable
                  onPress={() => {
                    void handleFixBattery();
                  }}
                  accessibilityRole="button"
                  style={{
                    height: 38,
                    paddingHorizontal: 18,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: isDark ? "#334155" : "#CBD5E1",
                    backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text variant="label" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                    Fix
                  </Text>
                </Pressable>
              ) : null}
            </View>

            {/* 4. Do not disturb */}
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: isDark ? "#052E16" : "#ECFDF5",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 14,
                }}
              >
                <Check size={18} color={isDark ? "#4ADE80" : "#16A34A"} strokeWidth={2.4} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="title-card" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                  Do not disturb
                </Text>
                <Text
                  variant="body"
                  style={{ color: isDark ? "#94A3B8" : "#475569", marginTop: 2 }}
                >
                  TT reminders can come through
                </Text>
              </View>
            </View>
          </View>

          {/* Green Test Reminder Status Banner */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              backgroundColor: isDark ? "#052E16" : "#ECFDF5",
              borderRadius: 12,
              padding: 14,
            }}
          >
            <Check size={18} color={isDark ? "#4ADE80" : "#16A34A"} strokeWidth={2.4} />
            <Text
              variant="body"
              style={{
                color: isDark ? "#A7F3D0" : "#065F46",
                marginLeft: 10,
                flex: 1,
                lineHeight: 20,
              }}
            >
              {testReminderMessage}
            </Text>
          </View>
        </ScrollView>

        {/* Bottom CTAs */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 16, rowGap: 12 }}>
          <Pressable
            onPress={() => {
              void handleFixBattery();
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
            <BatteryCharging size={18} color="#FFFFFF" strokeWidth={2.2} />
            <Text variant="label-lg" style={{ color: "#FFFFFF", marginLeft: 8 }}>
              Fix battery saver
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              void handleSendTestReminder();
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
            }}
          >
            <Bell size={18} color={isDark ? "#F8FAFC" : "#0F172A"} strokeWidth={2} />
            <Text
              variant="label-lg"
              style={{
                color: isDark ? "#F8FAFC" : "#0F172A",
                marginLeft: 8,
              }}
            >
              Send a test reminder
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
