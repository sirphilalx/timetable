import React, { useState } from "react";
import { View, ScrollView, Pressable, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ChevronLeft,
  ChevronDown,
  Calendar,
  CalendarOff,
  Plus,
  X,
  Check,
} from "lucide-react-native";
import { Text } from "@/components/ui/Text";
import { DatePickerModal } from "@/components/ui/DateTimePickerModal";
import { useTheme } from "@/theme";
import { useTimetable, useUpdateSemester } from "@/hooks/useTimetable";
import { memoryStore } from "@/db/seed";

const ACADEMIC_SESSION_PRESETS = ["2025/2026", "2026/2027", "2027/2028", "2028/2029"];

const SEMESTER_OPTIONS = [
  "First semester",
  "Second semester",
  "Harmattan semester",
  "Rain semester",
  "Summer / Long vacation",
];

function parseSemesterName(rawName?: string | null): { session: string; semester: string } {
  if (!rawName || !rawName.trim()) {
    return { session: "2026/2027", semester: "First semester" };
  }
  if (rawName.includes("·")) {
    const [left, right] = rawName.split("·").map((s) => s.trim());
    return {
      session: left || "2026/2027",
      semester: right || "First semester",
    };
  }
  return { session: "2026/2027", semester: rawName.trim() };
}

interface SemesterBreakItem {
  id: string;
  label: string;
  rangeLabel: string;
}

export default function SetupSemesterScreen() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const { data } = useTimetable();
  const updateSemesterMutation = useUpdateSemester();

  const initialParsed = parseSemesterName(data.semester.name);
  const [institution, setInstitution] = useState(
    data.student.institution || "University of Benin (UNIBEN)",
  );

  const [academicSession, setAcademicSession] = useState(initialParsed.session);
  const [sessionMenuOpen, setSessionMenuOpen] = useState(false);

  const [selectedSemester, setSelectedSemester] = useState(initialParsed.semester);
  const [semesterMenuOpen, setSemesterMenuOpen] = useState(false);

  const [startsLabel, setStartsLabel] = useState("Mon 12 Oct");
  const [startsIso, setStartsIso] = useState(data.semester.startDate ?? "2026-10-12");
  const [endsLabel, setEndsLabel] = useState("Fri 12 Feb");
  const [endsIso, setEndsIso] = useState(data.semester.endDate ?? "2027-02-12");
  const [startsDateOpen, setStartsDateOpen] = useState(false);
  const [endsDateOpen, setEndsDateOpen] = useState(false);

  const [breaks, setBreaks] = useState<SemesterBreakItem[]>([]);
  const [addingBreak, setAddingBreak] = useState(false);
  const [newBreakLabel, setNewBreakLabel] = useState("Christmas / New Year break");
  const [newBreakStart, setNewBreakStart] = useState("Mon 21 Dec");
  const [newBreakEnd, setNewBreakEnd] = useState("Mon 4 Jan");
  const [breakStartPickerOpen, setBreakStartPickerOpen] = useState(false);
  const [breakEndPickerOpen, setBreakEndPickerOpen] = useState(false);

  const handleContinue = () => {
    const cleanSession = academicSession.trim() || "2026/2027";
    const combinedSemesterName = `${cleanSession} · ${selectedSemester}`;
    memoryStore.breaks = breaks.map((b) => ({
      id: b.id,
      title: b.label,
      dateRange: b.rangeLabel,
    }));
    updateSemesterMutation.mutate(
      {
        institution,
        name: combinedSemesterName,
        startDate: startsIso,
        endDate: endsIso,
      },
      {
        onSuccess: () => {
          router.push("/setup/courses");
        },
      },
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
              onPress={() => router.back()}
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
              Set up your timetable
            </Text>
          </View>

          {/* 4-Step Progress Indicator (Step 1 active) */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              columnGap: 8,
              marginBottom: 16,
            }}
          >
            <View
              style={{
                width: 28,
                height: 8,
                borderRadius: 4,
                backgroundColor: "#4F46E5",
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
            style={{
              color: isDark ? "#F8FAFC" : "#0F172A",
              marginBottom: 20,
            }}
          >
            Your semester
          </Text>

          {/* Institution Field */}
          <View style={{ marginBottom: 20 }}>
            <Text
              variant="label"
              style={{ color: isDark ? "#CBD5E1" : "#334155", marginBottom: 6 }}
            >
              Institution
            </Text>
            <TextInput
              value={institution}
              onChangeText={setInstitution}
              placeholder="e.g. University of Benin (UNIBEN)"
              placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
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
              Optional
            </Text>
          </View>

          {/* Academic Session Field */}
          <View style={{ marginBottom: 20 }}>
            <Text
              variant="label"
              style={{ color: isDark ? "#CBD5E1" : "#334155", marginBottom: 6 }}
            >
              Academic session
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
              <TextInput
                value={academicSession}
                onChangeText={setAcademicSession}
                placeholder="e.g. 2026/2027"
                placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                style={{
                  flex: 1,
                  fontFamily: "Inter_400Regular",
                  fontSize: 15,
                  color: isDark ? "#F8FAFC" : "#0F172A",
                }}
              />
              <Pressable
                onPress={() => {
                  setSessionMenuOpen((prev) => !prev);
                  setSemesterMenuOpen(false);
                }}
                accessibilityRole="button"
                accessibilityLabel="Toggle academic session presets"
                hitSlop={10}
              >
                <ChevronDown size={18} color={isDark ? "#94A3B8" : "#475569"} />
              </Pressable>
            </View>
            {sessionMenuOpen ? (
              <View
                style={{
                  marginTop: 8,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: isDark ? "#334155" : "#CBD5E1",
                  backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                  overflow: "hidden",
                }}
              >
                {ACADEMIC_SESSION_PRESETS.map((sess) => {
                  const active = academicSession.trim() === sess;
                  return (
                    <Pressable
                      key={sess}
                      onPress={() => {
                        setAcademicSession(sess);
                        setSessionMenuOpen(false);
                      }}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingHorizontal: 14,
                        paddingVertical: 11,
                        backgroundColor: active ? (isDark ? "#312E81" : "#EEF2FF") : "transparent",
                      }}
                    >
                      <Text
                        variant="body"
                        style={{
                          color: isDark ? "#F8FAFC" : "#0F172A",
                          fontFamily: active ? "Inter_600SemiBold" : "Inter_400Regular",
                        }}
                      >
                        {sess}
                      </Text>
                      {active ? <Check size={16} color={isDark ? "#818CF8" : "#4F46E5"} /> : null}
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
            <Text variant="caption" style={{ color: isDark ? "#94A3B8" : "#475569", marginTop: 6 }}>
              Enter your academic year (e.g. 2026/2027)
            </Text>
          </View>

          {/* Semester Dropdown Field */}
          <View style={{ marginBottom: 20 }}>
            <Text
              variant="label"
              style={{ color: isDark ? "#CBD5E1" : "#334155", marginBottom: 6 }}
            >
              Semester
            </Text>
            <Pressable
              onPress={() => {
                setSemesterMenuOpen((prev) => !prev);
                setSessionMenuOpen(false);
              }}
              accessibilityRole="button"
              accessibilityLabel={`Semester: ${selectedSemester}. Tap to select semester`}
              style={{
                height: 48,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: semesterMenuOpen ? "#4F46E5" : isDark ? "#334155" : "#CBD5E1",
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
                  flex: 1,
                  fontFamily: "Inter_400Regular",
                  fontSize: 15,
                  color: isDark ? "#F8FAFC" : "#0F172A",
                }}
              >
                {selectedSemester}
              </Text>
              <ChevronDown size={18} color={isDark ? "#94A3B8" : "#475569"} />
            </Pressable>
            {semesterMenuOpen ? (
              <View
                style={{
                  marginTop: 8,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: isDark ? "#334155" : "#CBD5E1",
                  backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                  overflow: "hidden",
                }}
              >
                {SEMESTER_OPTIONS.map((sem) => {
                  const active = selectedSemester === sem;
                  return (
                    <Pressable
                      key={sem}
                      onPress={() => {
                        setSelectedSemester(sem);
                        setSemesterMenuOpen(false);
                      }}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingHorizontal: 14,
                        paddingVertical: 11,
                        backgroundColor: active ? (isDark ? "#312E81" : "#EEF2FF") : "transparent",
                      }}
                    >
                      <Text
                        variant="body"
                        style={{
                          color: isDark ? "#F8FAFC" : "#0F172A",
                          fontFamily: active ? "Inter_600SemiBold" : "Inter_400Regular",
                        }}
                      >
                        {sem}
                      </Text>
                      {active ? <Check size={16} color={isDark ? "#818CF8" : "#4F46E5"} /> : null}
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
            <Text variant="caption" style={{ color: isDark ? "#94A3B8" : "#475569", marginTop: 6 }}>
              Shown on your timetable as {academicSession.trim() || "2026/2027"} ·{" "}
              {selectedSemester}
            </Text>
          </View>

          {/* Starts & Ends 2-Column Row */}
          <View
            style={{
              flexDirection: "row",
              columnGap: 12,
              marginBottom: 16,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                variant="label"
                style={{ color: isDark ? "#CBD5E1" : "#334155", marginBottom: 6 }}
              >
                Starts
              </Text>
              <Pressable
                onPress={() => setStartsDateOpen(true)}
                accessibilityRole="button"
                style={{
                  height: 48,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: isDark ? "#334155" : "#CBD5E1",
                  backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                  paddingHorizontal: 12,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Calendar size={18} color={isDark ? "#94A3B8" : "#475569"} strokeWidth={1.85} />
                <Text
                  variant="body-lg"
                  style={{
                    flex: 1,
                    marginLeft: 8,
                    fontFamily: "Inter_400Regular",
                    fontSize: 15,
                    color: isDark ? "#F8FAFC" : "#0F172A",
                  }}
                >
                  {startsLabel}
                </Text>
              </Pressable>
              <Text
                variant="caption"
                style={{ color: isDark ? "#94A3B8" : "#475569", marginTop: 6 }}
              >
                First day of lectures
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text
                variant="label"
                style={{ color: isDark ? "#CBD5E1" : "#334155", marginBottom: 6 }}
              >
                Ends
              </Text>
              <Pressable
                onPress={() => setEndsDateOpen(true)}
                accessibilityRole="button"
                style={{
                  height: 48,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: isDark ? "#334155" : "#CBD5E1",
                  backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                  paddingHorizontal: 12,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Calendar size={18} color={isDark ? "#94A3B8" : "#475569"} strokeWidth={1.85} />
                <Text
                  variant="body-lg"
                  style={{
                    flex: 1,
                    marginLeft: 8,
                    fontFamily: "Inter_400Regular",
                    fontSize: 15,
                    color: isDark ? "#F8FAFC" : "#0F172A",
                  }}
                >
                  {endsLabel}
                </Text>
              </Pressable>
              <Text
                variant="caption"
                style={{ color: isDark ? "#94A3B8" : "#475569", marginTop: 6 }}
              >
                Before exams
              </Text>
            </View>
          </View>

          {/* Semester break pills */}
          <View style={{ rowGap: 8, marginBottom: 14 }}>
            {breaks.map((brk) => (
              <View
                key={brk.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: isDark ? "#1E293B" : "#F1F5F9",
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                  <CalendarOff
                    size={16}
                    color={isDark ? "#94A3B8" : "#475569"}
                    strokeWidth={1.85}
                  />
                  <Text
                    variant="label"
                    style={{
                      color: isDark ? "#CBD5E1" : "#334155",
                      marginLeft: 8,
                      flex: 1,
                    }}
                  >
                    {brk.label} · {brk.rangeLabel}
                  </Text>
                </View>
                <Pressable
                  onPress={() => setBreaks((prev) => prev.filter((item) => item.id !== brk.id))}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${brk.label}`}
                  hitSlop={8}
                  style={{ paddingLeft: 8 }}
                >
                  <X size={15} color={isDark ? "#94A3B8" : "#64748B"} />
                </Pressable>
              </View>
            ))}
          </View>

          {addingBreak ? (
            <View
              style={{
                backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                borderRadius: 14,
                borderWidth: 1,
                borderColor: isDark ? "#334155" : "#CBD5E1",
                padding: 14,
                marginBottom: 14,
                rowGap: 12,
              }}
            >
              <Text variant="label" style={{ color: isDark ? "#CBD5E1" : "#334155" }}>
                Break name
              </Text>
              <TextInput
                value={newBreakLabel}
                onChangeText={setNewBreakLabel}
                placeholder="e.g. Christmas break"
                placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                style={{
                  height: 44,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: isDark ? "#334155" : "#CBD5E1",
                  backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                  paddingHorizontal: 12,
                  fontFamily: "Inter_400Regular",
                  fontSize: 14,
                  color: isDark ? "#F8FAFC" : "#0F172A",
                }}
              />
              <View style={{ flexDirection: "row", columnGap: 10 }}>
                <Pressable
                  onPress={() => setBreakStartPickerOpen(true)}
                  style={{
                    flex: 1,
                    height: 44,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: isDark ? "#334155" : "#CBD5E1",
                    backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                    paddingHorizontal: 10,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Calendar size={15} color={isDark ? "#94A3B8" : "#475569"} />
                  <Text
                    variant="body"
                    style={{ marginLeft: 6, color: isDark ? "#F8FAFC" : "#0F172A" }}
                  >
                    {newBreakStart}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setBreakEndPickerOpen(true)}
                  style={{
                    flex: 1,
                    height: 44,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: isDark ? "#334155" : "#CBD5E1",
                    backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                    paddingHorizontal: 10,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Calendar size={15} color={isDark ? "#94A3B8" : "#475569"} />
                  <Text
                    variant="body"
                    style={{ marginLeft: 6, color: isDark ? "#F8FAFC" : "#0F172A" }}
                  >
                    {newBreakEnd}
                  </Text>
                </Pressable>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "flex-end", columnGap: 10 }}>
                <Pressable
                  onPress={() => setAddingBreak(false)}
                  style={{ paddingHorizontal: 12, paddingVertical: 8 }}
                >
                  <Text variant="label" style={{ color: isDark ? "#94A3B8" : "#475569" }}>
                    Cancel
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    const cleanName = newBreakLabel.trim() || "Semester break";
                    setBreaks((prev) => [
                      ...prev,
                      {
                        id: `brk-${Date.now()}`,
                        label: cleanName,
                        rangeLabel: `${newBreakStart} – ${newBreakEnd}`,
                      },
                    ]);
                    setAddingBreak(false);
                  }}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 8,
                    backgroundColor: "#4F46E5",
                  }}
                >
                  <Text variant="label" style={{ color: "#FFFFFF" }}>
                    Save break
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              onPress={() => setAddingBreak(true)}
              accessibilityRole="button"
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 8,
                paddingHorizontal: 12,
                alignSelf: "flex-start",
              }}
            >
              <Plus size={18} color={isDark ? "#818CF8" : "#475569"} strokeWidth={2.2} />
              <Text
                variant="label"
                style={{
                  color: isDark ? "#818CF8" : "#4F46E5",
                  marginLeft: 8,
                }}
              >
                Add a break
              </Text>
            </Pressable>
          )}
        </ScrollView>

        {/* Bottom Primary CTA */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
          <Pressable
            onPress={handleContinue}
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
              Continue
            </Text>
          </Pressable>
        </View>
      </View>

      <DatePickerModal
        isOpen={startsDateOpen}
        onClose={() => setStartsDateOpen(false)}
        value={startsLabel}
        title="Pick semester start date"
        onSelect={(formatted, isoDate) => {
          setStartsLabel(formatted);
          setStartsIso(isoDate);
        }}
      />

      <DatePickerModal
        isOpen={endsDateOpen}
        onClose={() => setEndsDateOpen(false)}
        value={endsLabel}
        title="Pick semester end date"
        onSelect={(formatted, isoDate) => {
          setEndsLabel(formatted);
          setEndsIso(isoDate);
        }}
      />

      <DatePickerModal
        isOpen={breakStartPickerOpen}
        onClose={() => setBreakStartPickerOpen(false)}
        value={newBreakStart}
        title="Pick break start date"
        onSelect={(formatted) => setNewBreakStart(formatted)}
      />

      <DatePickerModal
        isOpen={breakEndPickerOpen}
        onClose={() => setBreakEndPickerOpen(false)}
        value={newBreakEnd}
        title="Pick break end date"
        onSelect={(formatted) => setNewBreakEnd(formatted)}
      />
    </SafeAreaView>
  );
}
