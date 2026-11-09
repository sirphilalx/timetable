import React, { useEffect, useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft, GraduationCap, Check, Calendar, Sun, Moon, Info } from "lucide-react-native";
import { Text } from "@/components/ui/Text";
import { useTheme } from "@/theme";
import {
  loadReminderPreferences,
  saveReminderPreferences,
  type ReminderPreferences,
} from "@/lib/reminders";
import { requestNotificationPermissions } from "@/lib/notifications";

export default function RemindersSettingsScreen() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [leadMinutes, setLeadMinutes] = useState<30 | 60>(30);
  const [classesEnabled, setClassesEnabled] = useState(true);
  const [assignmentsEnabled, setAssignmentsEnabled] = useState(true);
  const [movesEnabled, setMovesEnabled] = useState(true);
  const [morningSummaryEnabled, setMorningSummaryEnabled] = useState(false);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(true);

  useEffect(() => {
    void loadReminderPreferences().then((prefs) => {
      setLeadMinutes(prefs.leadMinutes);
      setClassesEnabled(prefs.classesEnabled);
      setAssignmentsEnabled(prefs.assignmentsEnabled);
      setMovesEnabled(prefs.movesEnabled);
      setMorningSummaryEnabled(prefs.morningSummaryEnabled);
      setQuietHoursEnabled(prefs.quietHoursEnabled);
    });
  }, []);

  const updatePref = (patch: Partial<ReminderPreferences>) => {
    void saveReminderPreferences(patch);
    void requestNotificationPermissions();
  };

  const renderSwitch = (value: boolean, onToggle: () => void) => (
    <Pressable
      onPress={onToggle}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      style={{
        width: 52,
        height: 30,
        borderRadius: 15,
        backgroundColor: value ? "#4F46E5" : isDark ? "#334155" : "#E2E8F0",
        padding: 3,
        justifyContent: "center",
        alignItems: value ? "flex-end" : "flex-start",
      }}
    >
      <View
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          backgroundColor: "#FFFFFF",
        }}
      />
    </Pressable>
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }}
      edges={["top", "left", "right"]}
    >
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 36 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header (Screen 82) */}
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
            Reminders
          </Text>
        </View>

        <Text variant="label" style={{ color: isDark ? "#CBD5E1" : "#334155", marginBottom: 8 }}>
          Before each class
        </Text>

        {/* Segmented Control: 30 min | 1 hour */}
        <View
          style={{
            flexDirection: "row",
            backgroundColor: isDark ? "#1E293B" : "#F1F5F9",
            borderRadius: 12,
            padding: 4,
            marginBottom: 16,
          }}
        >
          {([30, 60] as const).map((mins) => {
            const isSelected = leadMinutes === mins;
            return (
              <Pressable
                key={mins}
                onPress={() => {
                  setLeadMinutes(mins);
                  updatePref({ leadMinutes: mins });
                }}
                accessibilityRole="button"
                style={{
                  flex: 1,
                  height: 38,
                  borderRadius: 9,
                  backgroundColor: isSelected ? (isDark ? "#0F172A" : "#FFFFFF") : "transparent",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  variant="label"
                  style={{
                    color: isSelected
                      ? isDark
                        ? "#F8FAFC"
                        : "#0F172A"
                      : isDark
                        ? "#94A3B8"
                        : "#475569",
                  }}
                >
                  {mins === 60 ? "1 hour" : "30 min"}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Main Toggles Card */}
        <View
          style={{
            backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: isDark ? "#334155" : "#E2E8F0",
            padding: 16,
            rowGap: 20,
            marginBottom: 24,
          }}
        >
          {/* Classes */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1, marginRight: 12 }}>
              <View style={{ width: 32, alignItems: "flex-start" }}>
                <GraduationCap
                  size={20}
                  color={isDark ? "#94A3B8" : "#475569"}
                  strokeWidth={1.85}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="body-lg" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                  Classes
                </Text>
                <Text
                  variant="body"
                  style={{ color: isDark ? "#94A3B8" : "#475569", marginTop: 2 }}
                >
                  With venue and lecturer
                </Text>
              </View>
            </View>
            {renderSwitch(classesEnabled, () => {
              const next = !classesEnabled;
              setClassesEnabled(next);
              updatePref({ classesEnabled: next });
            })}
          </View>

          {/* Assignments due */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1, marginRight: 12 }}>
              <View style={{ width: 32, alignItems: "flex-start" }}>
                <Check size={20} color={isDark ? "#94A3B8" : "#475569"} strokeWidth={1.85} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="body-lg" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                  Assignments due
                </Text>
                <Text
                  variant="body"
                  style={{ color: isDark ? "#94A3B8" : "#475569", marginTop: 2 }}
                >
                  Evening before and 3 h{"\n"}before
                </Text>
              </View>
            </View>
            {renderSwitch(assignmentsEnabled, () => {
              const next = !assignmentsEnabled;
              setAssignmentsEnabled(next);
              updatePref({ assignmentsEnabled: next });
            })}
          </View>

          {/* Moves and cancellations */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1, marginRight: 12 }}>
              <View style={{ width: 32, alignItems: "flex-start" }}>
                <Calendar size={20} color={isDark ? "#94A3B8" : "#475569"} strokeWidth={1.85} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="body-lg" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                  Moves and cancellations
                </Text>
                <Text
                  variant="body"
                  style={{ color: isDark ? "#94A3B8" : "#475569", marginTop: 2 }}
                >
                  Right away, from the class
                </Text>
              </View>
            </View>
            {renderSwitch(movesEnabled, () => {
              const next = !movesEnabled;
              setMovesEnabled(next);
              updatePref({ movesEnabled: next });
            })}
          </View>

          {/* Morning summary */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1, marginRight: 12 }}>
              <View style={{ width: 32, alignItems: "flex-start" }}>
                <Sun size={20} color={isDark ? "#94A3B8" : "#475569"} strokeWidth={1.85} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="body-lg" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                  Morning summary
                </Text>
                <Text
                  variant="body"
                  style={{ color: isDark ? "#94A3B8" : "#475569", marginTop: 2 }}
                >
                  7:00 am, what is on today
                </Text>
              </View>
            </View>
            {renderSwitch(morningSummaryEnabled, () => {
              const next = !morningSummaryEnabled;
              setMorningSummaryEnabled(next);
              updatePref({ morningSummaryEnabled: next });
            })}
          </View>
        </View>

        {/* Quiet hours Section */}
        <Text
          variant="title-section"
          style={{
            color: isDark ? "#F8FAFC" : "#0F172A",
            marginBottom: 12,
          }}
        >
          Quiet hours
        </Text>

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
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1, marginRight: 12 }}>
              <View style={{ width: 32, alignItems: "flex-start" }}>
                <Moon size={20} color={isDark ? "#94A3B8" : "#475569"} strokeWidth={1.85} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="body-lg" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                  Quiet hours
                </Text>
                <Text
                  variant="body"
                  style={{ color: isDark ? "#94A3B8" : "#475569", marginTop: 2 }}
                >
                  10:00 pm – 6:00 am. Changes{"\n"}still come through.
                </Text>
              </View>
            </View>
            {renderSwitch(quietHoursEnabled, () => {
              const next = !quietHoursEnabled;
              setQuietHoursEnabled(next);
              updatePref({ quietHoursEnabled: next });
            })}
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
              <View style={{ width: 32, alignItems: "flex-start" }}>
                <Calendar size={20} color={isDark ? "#94A3B8" : "#475569"} strokeWidth={1.85} />
              </View>
              <Text variant="body-lg" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                Weekends
              </Text>
            </View>
            <Text variant="body-lg" style={{ color: isDark ? "#CBD5E1" : "#334155" }}>
              Same as weekdays
            </Text>
          </View>
        </View>

        {/* Per-course Override Info Box */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            backgroundColor: isDark ? "#1E293B" : "#F1F5F9",
            borderRadius: 12,
            padding: 14,
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
            Per-course settings override these. Open a course in My courses to change just that one.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
