import React, { useEffect, useState } from "react";
import { View, ScrollView, Pressable, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft, AlertTriangle, CheckCircle2 } from "lucide-react-native";
import { Text } from "@/components/ui/Text";
import { useTheme } from "@/theme";
import { useTimetable } from "@/hooks/useTimetable";
import { loadReminderPreferences, saveReminderPreferences } from "@/lib/reminders";

const TARGET_OPTIONS = [
  { id: "70", label: "70%" },
  { id: "75", label: "75% (most common)" },
  { id: "80", label: "80%" },
  { id: "custom", label: "Custom" },
];

export default function SettingsAttendanceTargetScreen() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { data } = useTimetable();

  const [selectedId, setSelectedId] = useState("75");
  const [customTargetText, setCustomTargetText] = useState("85");

  useEffect(() => {
    void loadReminderPreferences().then((prefs) => {
      const target = prefs.attendanceTargetPct ?? 75;
      if (target === 70 || target === 75 || target === 80) {
        setSelectedId(String(target));
      } else {
        setSelectedId("custom");
        setCustomTargetText(String(target));
      }
    });
  }, []);

  const parsedCustom = Number.parseInt(customTargetText, 10);
  const effectiveTargetPct =
    selectedId === "custom"
      ? Number.isFinite(parsedCustom) && parsedCustom >= 10 && parsedCustom <= 100
        ? parsedCustom
        : 75
      : Number.parseInt(selectedId, 10) || 75;

  let belowTargetCourse: { code: string; pct: number } | null = null;
  for (const course of data.courses) {
    const ruleIds = new Set(
      data.classRules.filter((r) => r.courseId === course.id).map((r) => r.id),
    );
    const codeSlug = course.code.toLowerCase().replace(/\s+/g, "");
    const records = data.attendanceRecords.filter((rec) => {
      for (const rId of ruleIds) {
        if (rec.occurrenceId.includes(rId)) return true;
      }
      return rec.occurrenceId.toLowerCase().includes(codeSlug);
    });
    if (records.length === 0) continue;
    const attended = records.filter((r) => r.status === "present").length;
    const pct = Math.round((attended / records.length) * 100);
    if (pct < effectiveTargetPct) {
      belowTargetCourse = { code: course.code, pct };
      break;
    }
  }

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/settings");
    }
  };

  const handleSave = async () => {
    await saveReminderPreferences({ attendanceTargetPct: effectiveTargetPct });
    handleBack();
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
          {/* Header (Screen 85) */}
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
              Attendance target
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
            TT warns you when a course drops below this. Most Nigerian universities use 75% for exam
            eligibility, but check with your department.
          </Text>

          {/* Radio Card */}
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
            {TARGET_OPTIONS.map((opt) => {
              const isSelected = selectedId === opt.id;
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => setSelectedId(opt.id)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isSelected }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: isSelected ? "#4F46E5" : "#CBD5E1",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    {isSelected ? (
                      <View
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: 6,
                          backgroundColor: "#4F46E5",
                        }}
                      />
                    ) : null}
                  </View>
                  <Text
                    variant="body-lg"
                    style={{
                      color: isDark ? "#F8FAFC" : "#0F172A",
                      fontFamily: "Inter_400Regular",
                    }}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}

            {selectedId === "custom" ? (
              <View style={{ paddingLeft: 36 }}>
                <Text
                  variant="caption"
                  style={{ color: isDark ? "#94A3B8" : "#64748B", marginBottom: 6 }}
                >
                  Target percentage (10% – 100%)
                </Text>
                <TextInput
                  value={customTargetText}
                  onChangeText={(txt) => setCustomTargetText(txt.replace(/[^0-9]/g, ""))}
                  keyboardType="number-pad"
                  maxLength={3}
                  placeholder="e.g. 85"
                  placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                  style={{
                    height: 44,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: isDark ? "#334155" : "#CBD5E1",
                    backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                    paddingHorizontal: 12,
                    color: isDark ? "#F8FAFC" : "#0F172A",
                    fontSize: 16,
                  }}
                />
              </View>
            ) : null}
          </View>

          {/* Dynamic Status Banner */}
          {belowTargetCourse ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: isDark ? "#451A03" : "#FEF3C7",
                borderRadius: 12,
                padding: 14,
              }}
            >
              <AlertTriangle size={18} color={isDark ? "#FBBF24" : "#92400E"} strokeWidth={2} />
              <Text
                variant="body"
                style={{
                  color: isDark ? "#FDE68A" : "#0F172A",
                  marginLeft: 10,
                  flex: 1,
                  lineHeight: 20,
                }}
              >
                At {effectiveTargetPct}%, {belowTargetCourse.code} is below target right now (
                {belowTargetCourse.pct}%).
              </Text>
            </View>
          ) : (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: isDark ? "#1E293B" : "#EEF2FF",
                borderRadius: 12,
                padding: 14,
              }}
            >
              <CheckCircle2 size={18} color={isDark ? "#818CF8" : "#4F46E5"} strokeWidth={2} />
              <Text
                variant="body"
                style={{
                  color: isDark ? "#CBD5E1" : "#334155",
                  marginLeft: 10,
                  flex: 1,
                  lineHeight: 20,
                }}
              >
                TT will alert you whenever a course drops below {effectiveTargetPct}%.
              </Text>
            </View>
          )}
        </ScrollView>

        <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
          <Pressable
            onPress={() => void handleSave()}
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
              Save
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
