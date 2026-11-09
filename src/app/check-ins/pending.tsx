import React, { useMemo, useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft, Check, X, CheckCircle2 } from "lucide-react-native";
import { Text } from "@/components/ui/Text";
import { useTheme } from "@/theme/ThemeProvider";
import { useRecordAttendance, useTimetable } from "@/hooks/useTimetable";
import {
  addDaysIso,
  formatShortDateLabel,
  getCurrentTime24,
  getTodayIsoDate,
} from "@/lib/dateClock";

interface PendingCheckInItem {
  id: string;
  courseCode: string;
  courseTitle: string;
  color: string;
  daysLeftLabel: string;
  sessionSummary: string;
}

export default function PendingCheckInsScreen() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { data, getOccurrencesForDate } = useTimetable();
  const recordAttendance = useRecordAttendance();
  const [todayIso] = useState(() => getTodayIsoDate());
  const [currentTime24] = useState(() => getCurrentTime24());

  const items = useMemo(() => {
    const resolvedIds = new Set(data.attendanceRecords.map((r) => r.occurrenceId));
    const pending: PendingCheckInItem[] = [];

    for (let offset = 0; offset < 7; offset++) {
      const dateIso = addDaysIso(todayIso, -offset);
      const occs = getOccurrencesForDate(dateIso, { calendarFilter: "classes" });
      for (const occ of occs) {
        if (occ.status === "cancelled") continue;
        if (offset === 0 && occ.endTime > currentTime24) continue;
        if (resolvedIds.has(occ.id)) continue;

        const daysRemaining = Math.max(1, 7 - offset);
        pending.push({
          id: occ.id,
          courseCode: occ.courseCode,
          courseTitle: occ.courseTitle.replace(/\s*·\s*(Lecture|Tutorial|Lab)$/i, ""),
          color: occ.courseColor,
          daysLeftLabel: `${daysRemaining} day${daysRemaining === 1 ? "" : "s"} left`,
          sessionSummary: `${formatShortDateLabel(dateIso)} · ${occ.displayTime} · ${occ.venue}`,
        });
      }
    }

    return pending;
  }, [currentTime24, data.attendanceRecords, getOccurrencesForDate, todayIso]);

  const bg = isDark ? "#0F172A" : "#F8FAFC";
  const cardBg = isDark ? "#1E293B" : "#FFFFFF";
  const textPrimary = isDark ? "#F8FAFC" : "#0F172A";
  const textSecondary = isDark ? "#94A3B8" : "#475569";
  const borderCol = isDark ? "#334155" : "#E2E8F0";

  const handleResolve = (id: string, status: "present" | "absent") => {
    recordAttendance.mutate({ occurrenceId: id, status });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }} edges={["top"]}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Pressable
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/(tabs)");
              }
            }}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ChevronLeft size={24} color={textPrimary} />
          </Pressable>
          <Text variant="TT/H2" style={{ color: textPrimary, fontSize: 20 }}>
            Pending check-ins
          </Text>
        </View>
        <Text variant="TT/Subhead" style={{ color: textSecondary, fontWeight: "600" }}>
          {items.length} left
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="TT/Body" style={{ color: textSecondary, marginBottom: 20, lineHeight: 22 }}>
          Check-ins stay open for 7 days, then close as Not answered.
        </Text>

        {items.length === 0 ? (
          <View
            style={{
              backgroundColor: cardBg,
              borderRadius: 16,
              padding: 28,
              alignItems: "center",
              borderWidth: 1,
              borderColor: borderCol,
              marginTop: 20,
            }}
          >
            <CheckCircle2 size={36} color="#059669" />
            <Text variant="TT/H3" style={{ color: textPrimary, marginTop: 12, marginBottom: 4 }}>
              All caught up
            </Text>
            <Text variant="TT/Body" style={{ color: textSecondary, textAlign: "center" }}>
              You have answered all recent class check-ins.
            </Text>
          </View>
        ) : (
          items.map((item) => (
            <View
              key={item.id}
              style={{
                backgroundColor: cardBg,
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: borderCol,
              }}
            >
              {/* Top pill row */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 6,
                    backgroundColor: isDark ? "#0F172A" : "#F1F5F9",
                  }}
                >
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: item.color,
                    }}
                  />
                  <Text variant="TT/Caption" style={{ color: textPrimary, fontWeight: "700" }}>
                    {item.courseCode}
                  </Text>
                </View>

                <Text variant="TT/Caption" style={{ color: textSecondary }}>
                  {item.daysLeftLabel}
                </Text>
              </View>

              {/* Main row with course title + circular buttons */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    variant="TT/H3"
                    style={{ color: textPrimary, fontSize: 17, marginBottom: 4 }}
                  >
                    {item.courseTitle}
                  </Text>
                  <Text variant="TT/Caption" style={{ color: textSecondary }}>
                    {item.sessionSummary}
                  </Text>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <Pressable
                    accessibilityLabel={`Mark ${item.courseCode} attended`}
                    onPress={() => handleResolve(item.id, "present")}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: "#4F46E5",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Check size={20} color="#FFFFFF" />
                  </Pressable>

                  <Pressable
                    accessibilityLabel={`Mark ${item.courseCode} missed`}
                    onPress={() => handleResolve(item.id, "absent")}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: isDark ? "#0F172A" : "#F1F5F9",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <X size={20} color={textSecondary} />
                  </Pressable>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
