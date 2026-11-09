import React, { useState } from "react";
import { View, Pressable, Modal } from "react-native";
import { useRouter } from "expo-router";
import { Check, X, Plus, ClipboardCheck } from "lucide-react-native";
import { Text } from "@/components/ui/Text";
import { useTheme } from "@/theme/ThemeProvider";
import { useRecordAttendance } from "@/hooks/useTimetable";
import { addDaysIso, formatShortDateLabel, getTodayIsoDate } from "@/lib/dateClock";

export interface PostClassCheckInSheetProps {
  isOpen: boolean;
  onClose: () => void;
  occurrenceId?: string;
  courseCode?: string;
  courseTitle?: string;
  courseColor?: string;
  timeRange?: string;
  venue?: string;
  initialMode?: "single" | "two-classes" | "rep-posted";
}

export function PostClassCheckInSheet({
  isOpen,
  onClose,
  occurrenceId,
  courseCode = "CSC 301",
  courseTitle = "Operating Systems",
  courseColor = "#2563EB",
  timeRange = "10:00 am – 12:00 pm",
  initialMode = "single",
}: PostClassCheckInSheetProps) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const recordAttendance = useRecordAttendance();
  const [todayIso] = useState(() => getTodayIsoDate());
  const resolvedOccurrenceId =
    occurrenceId ?? `occ-${courseCode.toLowerCase().replace(/\s+/g, "")}-${todayIso}`;
  const endTimeLabel = timeRange.includes("–")
    ? `Ended ${timeRange.split("–").pop()?.trim() || "12:00"}`
    : `Ended ${timeRange}`;

  const [overrideMode, setOverrideMode] = useState<"single" | "two-classes" | "rep-posted" | null>(
    null,
  );
  const mode = overrideMode ?? initialMode;

  const handleClose = () => {
    setOverrideMode(null);
    onClose();
  };

  const sheetBg = isDark ? "#1E293B" : "#FFFFFF";
  const textPrimary = isDark ? "#F8FAFC" : "#0F172A";
  const textSecondary = isDark ? "#94A3B8" : "#475569";
  const borderCol = isDark ? "#334155" : "#CBD5E1";

  const handleRecord = (occId: string, status: "present" | "absent") => {
    recordAttendance.mutate({ occurrenceId: occId, status });
    handleClose();
  };

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable
        onPress={handleClose}
        style={{
          flex: 1,
          backgroundColor: "rgba(15, 23, 42, 0.45)",
          justifyContent: "flex-end",
        }}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: sheetBg,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingHorizontal: 20,
            paddingTop: 14,
            paddingBottom: 32,
          }}
        >
          {/* Left-aligned handle bar matching Screens 44, 45, 46 */}
          <View
            style={{
              width: 44,
              height: 5,
              borderRadius: 3,
              backgroundColor: isDark ? "#475569" : "#CBD5E1",
              alignSelf: "flex-start",
              marginBottom: 16,
            }}
          />

          {/* Top Course Tag + End Time Row */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              marginBottom: 14,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 8,
                backgroundColor: isDark ? "#0F172A" : "#F1F5F9",
              }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: courseColor,
                }}
              />
              <Text variant="TT/Caption" style={{ color: textPrimary, fontWeight: "700" }}>
                {courseCode}
              </Text>
            </View>

            <Text variant="TT/Body" style={{ color: textSecondary }}>
              {endTimeLabel}
            </Text>
          </View>

          {mode === "two-classes" ? (
            /* Screen 45: Check-in · two classes */
            <View>
              <Text
                variant="TT/H2"
                style={{
                  color: textPrimary,
                  fontSize: 22,
                  lineHeight: 28,
                  marginBottom: 16,
                }}
              >
                Two classes ended at 12:00. Which one did you attend?
              </Text>

              {/* Option 1: CSC 301 Operating Systems · LT1 */}
              <Pressable
                onPress={() => handleRecord(`${resolvedOccurrenceId}-opt1`, "present")}
                style={{
                  borderWidth: 1,
                  borderColor: borderCol,
                  borderRadius: 14,
                  paddingHorizontal: 14,
                  height: 58,
                  marginBottom: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 8,
                    backgroundColor: isDark ? "#0F172A" : "#F1F5F9",
                  }}
                >
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: courseColor,
                    }}
                  />
                  <Text variant="TT/Caption" style={{ color: textPrimary, fontWeight: "700" }}>
                    {courseCode}
                  </Text>
                </View>

                <Text variant="TT/Body" style={{ color: textPrimary, fontSize: 16, flex: 1 }}>
                  {courseTitle} · LT1
                </Text>
              </Pressable>

              {/* Option 2: GST 301 Entrepreneurship · Hall B */}
              <Pressable
                onPress={() => handleRecord(`occ-gst301-${todayIso}`, "present")}
                style={{
                  borderWidth: 1,
                  borderColor: borderCol,
                  borderRadius: 14,
                  paddingHorizontal: 14,
                  height: 58,
                  marginBottom: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 8,
                    backgroundColor: isDark ? "#0F172A" : "#F1F5F9",
                  }}
                >
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: "#DB2777",
                    }}
                  />
                  <Text variant="TT/Caption" style={{ color: textPrimary, fontWeight: "700" }}>
                    GST 301
                  </Text>
                </View>

                <Text variant="TT/Body" style={{ color: textPrimary, fontSize: 16, flex: 1 }}>
                  Entrepreneurship · Hall B
                </Text>
              </Pressable>

              {/* Missed both */}
              <Pressable
                onPress={() => handleRecord(resolvedOccurrenceId, "absent")}
                style={{
                  height: 48,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: borderCol,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <Text variant="TT/Button" style={{ color: textPrimary, fontWeight: "600" }}>
                  Missed both
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  handleClose();
                  router.push("/check-ins/pending");
                }}
              >
                <Text variant="TT/Caption" style={{ color: textSecondary }}>
                  Answer later from Pending check-ins
                </Text>
              </Pressable>
            </View>
          ) : (
            /* Screen 44 & 46: Single class check-in */
            <View>
              <Text variant="TT/H2" style={{ color: textPrimary, fontSize: 22, marginBottom: 16 }}>
                Did you attend {courseTitle}?
              </Text>

              {mode === "rep-posted" ? (
                /* Screen 46: Soft indigo banner above Attended/Missed */
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    padding: 16,
                    borderRadius: 14,
                    backgroundColor: isDark ? "#1E1B4B" : "#EEF2FF",
                    marginBottom: 16,
                  }}
                >
                  <ClipboardCheck size={20} color="#4F46E5" />
                  <Text
                    variant="TT/Body"
                    style={{
                      color: isDark ? "#818CF8" : "#4338CA",
                      flex: 1,
                      lineHeight: 22,
                    }}
                  >
                    Your rep posted: Scheduling report, due{" "}
                    {formatShortDateLabel(addDaysIso(todayIso, 7))}
                  </Text>
                </View>
              ) : null}

              <View
                style={{
                  flexDirection: "row",
                  gap: 12,
                  marginBottom: 18,
                }}
              >
                <Pressable
                  onPress={() => handleRecord(resolvedOccurrenceId, "present")}
                  style={{
                    flex: 1,
                    height: 50,
                    borderRadius: 12,
                    backgroundColor: "#4F46E5",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <Check size={18} color="#FFFFFF" />
                  <Text variant="TT/Button" style={{ color: "#FFFFFF", fontWeight: "600" }}>
                    Attended
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => handleRecord(resolvedOccurrenceId, "absent")}
                  style={{
                    flex: 1,
                    height: 50,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: borderCol,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <X size={18} color={textPrimary} />
                  <Text variant="TT/Button" style={{ color: textPrimary, fontWeight: "600" }}>
                    Missed
                  </Text>
                </Pressable>
              </View>

              {mode === "single" ? (
                /* Screen 44: + Add an assignment from this class */
                <Pressable
                  onPress={() => {
                    handleClose();
                    router.push("/assignment/add");
                  }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    paddingVertical: 6,
                    marginBottom: 14,
                  }}
                >
                  <Plus size={18} color={isDark ? "#818CF8" : "#4F46E5"} />
                  <Text
                    variant="TT/Subhead"
                    style={{
                      color: isDark ? "#818CF8" : "#4F46E5",
                      fontWeight: "600",
                      fontSize: 16,
                    }}
                  >
                    Add an assignment from this class
                  </Text>
                </Pressable>
              ) : null}

              <Pressable
                onPress={() => {
                  handleClose();
                  router.push("/check-ins/pending");
                }}
              >
                <Text variant="TT/Caption" style={{ color: textSecondary }}>
                  Answer later from Pending check-ins
                </Text>
              </Pressable>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
