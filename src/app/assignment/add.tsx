import React, { useState } from "react";
import { View, ScrollView, Pressable, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft, Calendar, Check, X, Info, CheckCircle2, Plus } from "lucide-react-native";
import { Text } from "@/components/ui/Text";
import { DatePickerModal } from "@/components/ui/DateTimePickerModal";
import { useTheme } from "@/theme/ThemeProvider";
import { useCreateAssignment, useTimetable } from "@/hooks/useTimetable";
import { addDaysIso, formatShortDateLabel, getTodayIsoDate } from "@/lib/dateClock";

type AddAssignmentMode = "add" | "sent" | "rep-review";

export default function AddAssignmentScreen() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { data } = useTimetable();
  const createAssignment = useCreateAssignment();

  const availableCourses = data.courses;
  const [selectedCourseId, setSelectedCourseId] = useState<string>(availableCourses[0]?.id ?? "");
  const selectedCourse =
    availableCourses.find((c) => c.id === selectedCourseId) ?? availableCourses[0];

  const [mode, setMode] = useState<AddAssignmentMode>("add");
  const [title, setTitle] = useState("");
  const [defaultDueIso] = useState(() => addDaysIso(getTodayIsoDate(), 3));
  const [dueDate, setDueDate] = useState(() => formatShortDateLabel(defaultDueIso));
  const [dueDateIso, setDueDateIso] = useState(defaultDueIso);
  const [note, setNote] = useState("");
  const [assignmentScope, setAssignmentScope] = useState<"solo" | "group">("solo");
  const [groupCount, setGroupCount] = useState("10");
  const [maxPerGroup, setMaxPerGroup] = useState("6");
  const [joiningCloses, setJoiningCloses] = useState(() =>
    formatShortDateLabel(addDaysIso(getTodayIsoDate(), 2)),
  );
  const [dueDatePickerOpen, setDueDatePickerOpen] = useState(false);
  const [joiningPickerOpen, setJoiningPickerOpen] = useState(false);

  const [rawSuggestions, setSuggestions] = useState([
    {
      id: "sug-1",
      courseCode: "CSC 301",
      courseId: "course-csc-301",
      suggestedCount: 6,
      title: "Lab 3 write-up",
      dueIso: addDaysIso(getTodayIsoDate(), 5),
      subtitle: "Suggested from recent class check-ins",
    },
    {
      id: "sug-2",
      courseCode: "CSC 305",
      courseId: "course-csc-305",
      suggestedCount: 3,
      title: "SQL normalization exercise",
      dueIso: addDaysIso(getTodayIsoDate(), 4),
      subtitle: "Suggested from recent class check-ins",
    },
  ]);
  const suggestions = rawSuggestions.filter((sug) =>
    availableCourses.some(
      (c) => c.id === sug.courseId || c.code.toLowerCase() === sug.courseCode.toLowerCase(),
    ),
  );

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/assignments");
    }
  };

  const bg = isDark ? "#0F172A" : "#F8FAFC";
  const cardBg = isDark ? "#1E293B" : "#FFFFFF";
  const textPrimary = isDark ? "#F8FAFC" : "#0F172A";
  const textSecondary = isDark ? "#94A3B8" : "#475569";
  const borderCol = isDark ? "#334155" : "#E2E8F0";

  const handleSaveAssignment = () => {
    if (!selectedCourse) {
      router.push("/setup/add-course");
      return;
    }
    const cleanTitle =
      title.trim() ||
      (assignmentScope === "group"
        ? `${selectedCourse.code} group project`
        : `${selectedCourse.code} assignment`);

    createAssignment.mutate({
      courseId: selectedCourse.id,
      title: cleanTitle,
      description:
        note.trim() ||
        (assignmentScope === "group"
          ? `${groupCount} groups · Max ${maxPerGroup} per group · Joining closes ${joiningCloses}`
          : "Added to your timetable"),
      dueAt: `${dueDateIso}T22:59:00.000Z`,
      isGroupAssignment: assignmentScope === "group",
    });
    setMode("sent");
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
              if (mode === "rep-review" || mode === "sent") {
                setMode("add");
              } else {
                handleBack();
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
            {mode === "rep-review" ? "Classmate suggestions" : "Add assignment"}
          </Text>
        </View>

        {mode === "add" && suggestions.length > 0 ? (
          <Pressable
            onPress={() => setMode("rep-review")}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 999,
              backgroundColor: isDark ? "#312E81" : "#EEF2FF",
            }}
          >
            <Info size={15} color={isDark ? "#818CF8" : "#4F46E5"} />
            <Text
              variant="TT/Caption"
              style={{
                color: isDark ? "#818CF8" : "#4F46E5",
                fontWeight: "700",
              }}
            >
              Suggestions ({suggestions.length})
            </Text>
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {mode === "add" && (
          <View>
            {/* Interactive Course Selector */}
            <Text
              variant="TT/Subhead"
              style={{ color: textPrimary, fontWeight: "600", marginBottom: 8 }}
            >
              Course
            </Text>
            {availableCourses.length === 0 ? (
              <View
                style={{
                  backgroundColor: cardBg,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: borderCol,
                  padding: 16,
                  marginBottom: 18,
                  rowGap: 10,
                }}
              >
                <Text variant="TT/Body" style={{ color: textSecondary }}>
                  You haven&apos;t added any courses yet. Add a course first so TT can link this
                  assignment to your timetable.
                </Text>
                <Pressable
                  onPress={() => router.push("/setup/add-course")}
                  accessibilityRole="button"
                  style={{
                    alignSelf: "flex-start",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    paddingHorizontal: 14,
                    height: 40,
                    borderRadius: 10,
                    backgroundColor: "#4F46E5",
                  }}
                >
                  <Plus size={16} color="#FFFFFF" strokeWidth={2.4} />
                  <Text variant="TT/Subhead" style={{ color: "#FFFFFF", fontWeight: "600" }}>
                    Add a course
                  </Text>
                </Pressable>
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8, paddingBottom: 16 }}
              >
                {availableCourses.map((course) => {
                  const isSelected = course.id === selectedCourse?.id;
                  return (
                    <Pressable
                      key={course.id}
                      onPress={() => setSelectedCourseId(course.id)}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                        borderRadius: 12,
                        borderWidth: 1.5,
                        borderColor: isSelected ? "#4F46E5" : borderCol,
                        backgroundColor: isSelected ? (isDark ? "#312E81" : "#EEF2FF") : cardBg,
                      }}
                    >
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: course.color,
                        }}
                      />
                      <Text
                        variant="TT/Subhead"
                        style={{
                          color: isSelected ? (isDark ? "#818CF8" : "#4F46E5") : textPrimary,
                          fontWeight: isSelected ? "700" : "600",
                        }}
                      >
                        {course.code}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}

            <Text
              variant="TT/Subhead"
              style={{ color: textPrimary, fontWeight: "600", marginBottom: 8 }}
            >
              What is due?
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Lab 3 write-up or Database project"
              placeholderTextColor={textSecondary}
              style={{
                backgroundColor: cardBg,
                borderWidth: 1,
                borderColor: borderCol,
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 14,
                color: textPrimary,
                fontSize: 16,
                marginBottom: 18,
              }}
            />

            <Text
              variant="TT/Subhead"
              style={{ color: textPrimary, fontWeight: "600", marginBottom: 8 }}
            >
              Due date
            </Text>
            <Pressable
              onPress={() => setDueDatePickerOpen(true)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: cardBg,
                borderWidth: 1,
                borderColor: borderCol,
                borderRadius: 12,
                paddingHorizontal: 14,
                height: 52,
                gap: 10,
                marginBottom: 6,
              }}
            >
              <Calendar size={18} color={textSecondary} />
              <Text variant="TT/Body" style={{ flex: 1, color: textPrimary, fontSize: 16 }}>
                {dueDate}
              </Text>
            </Pressable>
            <Text variant="TT/Caption" style={{ color: textSecondary, marginBottom: 18 }}>
              No time set means due at 11:59 pm
            </Text>

            {/* Solo vs Group selector */}
            <Text
              variant="TT/Subhead"
              style={{ color: textPrimary, fontWeight: "600", marginBottom: 8 }}
            >
              Assignment type
            </Text>
            <View style={{ marginBottom: 14 }}>
              {[
                { id: "solo" as const, label: "Solo · individual work" },
                { id: "group" as const, label: "Group · students pick a group" },
              ].map((opt) => {
                const selected = assignmentScope === opt.id;
                return (
                  <Pressable
                    key={opt.id}
                    onPress={() => setAssignmentScope(opt.id)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                      paddingVertical: 10,
                    }}
                  >
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        borderWidth: 2,
                        borderColor: selected ? "#4F46E5" : borderCol,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {selected ? (
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
                    <Text variant="TT/Body" style={{ color: textPrimary, fontSize: 16 }}>
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {assignmentScope === "group" && (
              <View
                style={{
                  backgroundColor: isDark ? "#1E293B" : "#F1F5F9",
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 20,
                }}
              >
                <Text
                  variant="TT/H3"
                  style={{ color: textPrimary, fontSize: 17, marginBottom: 12 }}
                >
                  Groups
                </Text>

                <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
                  <View style={{ flex: 1 }}>
                    <Text variant="TT/Caption" style={{ color: textSecondary, marginBottom: 6 }}>
                      How many
                    </Text>
                    <TextInput
                      value={groupCount}
                      onChangeText={setGroupCount}
                      keyboardType="number-pad"
                      style={{
                        backgroundColor: cardBg,
                        borderWidth: 1,
                        borderColor: borderCol,
                        borderRadius: 12,
                        paddingHorizontal: 14,
                        height: 48,
                        color: textPrimary,
                        fontSize: 16,
                      }}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text variant="TT/Caption" style={{ color: textSecondary, marginBottom: 6 }}>
                      Max per group
                    </Text>
                    <TextInput
                      value={maxPerGroup}
                      onChangeText={setMaxPerGroup}
                      keyboardType="number-pad"
                      style={{
                        backgroundColor: cardBg,
                        borderWidth: 1,
                        borderColor: borderCol,
                        borderRadius: 12,
                        paddingHorizontal: 14,
                        height: 48,
                        color: textPrimary,
                        fontSize: 16,
                      }}
                    />
                  </View>
                </View>

                <Text variant="TT/Caption" style={{ color: textSecondary, marginBottom: 6 }}>
                  Joining closes
                </Text>
                <Pressable
                  onPress={() => setJoiningPickerOpen(true)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: cardBg,
                    borderWidth: 1,
                    borderColor: borderCol,
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    height: 48,
                    gap: 10,
                    marginBottom: 6,
                  }}
                >
                  <Calendar size={18} color={textSecondary} />
                  <Text variant="TT/Body" style={{ flex: 1, color: textPrimary, fontSize: 16 }}>
                    {joiningCloses}
                  </Text>
                </Pressable>
                <Text variant="TT/Caption" style={{ color: textSecondary }}>
                  Students can switch until then
                </Text>
              </View>
            )}

            <Text
              variant="TT/Subhead"
              style={{ color: textPrimary, fontWeight: "600", marginBottom: 8 }}
            >
              Details (optional)
            </Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Add instructions or submission details"
              placeholderTextColor={textSecondary}
              multiline
              style={{
                backgroundColor: cardBg,
                borderWidth: 1,
                borderColor: borderCol,
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 14,
                minHeight: 88,
                color: textPrimary,
                fontSize: 15,
                textAlignVertical: "top",
                marginBottom: 20,
              }}
            />

            {selectedCourse ? (
              <View
                style={{
                  backgroundColor: isDark ? "#1E293B" : "#EEF2FF",
                  borderRadius: 12,
                  padding: 14,
                  marginBottom: 24,
                }}
              >
                <Text variant="TT/Caption" style={{ color: textSecondary, lineHeight: 20 }}>
                  Saved to your timetable right away for {selectedCourse.code} (
                  {selectedCourse.title}).
                </Text>
              </View>
            ) : null}

            <Pressable
              onPress={handleSaveAssignment}
              style={{
                height: 52,
                borderRadius: 14,
                backgroundColor: "#4F46E5",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text variant="TT/Button" style={{ color: "#FFFFFF", fontWeight: "600" }}>
                {assignmentScope === "group" ? "Save and send group poll" : "Save assignment"}
              </Text>
            </Pressable>
          </View>
        )}

        {mode === "sent" && (
          <View
            style={{
              backgroundColor: cardBg,
              borderRadius: 20,
              padding: 24,
              borderWidth: 1,
              borderColor: borderCol,
              alignItems: "center",
              marginTop: 20,
            }}
          >
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: isDark ? "rgba(5, 150, 105, 0.2)" : "#ECFDF5",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <CheckCircle2 size={30} color="#059669" />
            </View>

            <Text
              variant="TT/H2"
              style={{
                color: textPrimary,
                fontSize: 22,
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              Saved to your assignments
            </Text>

            <Text
              variant="TT/Body"
              style={{
                color: textSecondary,
                textAlign: "center",
                lineHeight: 22,
                marginBottom: 24,
              }}
            >
              Added under {selectedCourse?.code ?? "CSC 301"} for {dueDate}. It is now visible in
              both your Assignments List and Calendar views.
            </Text>

            <Pressable
              onPress={handleBack}
              style={{
                width: "100%",
                height: 50,
                borderRadius: 12,
                backgroundColor: "#4F46E5",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text variant="TT/Button" style={{ color: "#FFFFFF", fontWeight: "600" }}>
                Done
              </Text>
            </Pressable>
          </View>
        )}

        {mode === "rep-review" && (
          <View>
            <Text
              variant="TT/Body"
              style={{ color: textSecondary, marginBottom: 18, lineHeight: 22 }}
            >
              Classmates added these after class. Add one for everyone or let them keep it as their
              own.
            </Text>

            {suggestions.map((sug) => (
              <View
                key={sug.id}
                style={{
                  backgroundColor: cardBg,
                  borderRadius: 18,
                  padding: 18,
                  borderWidth: 1,
                  borderColor: borderCol,
                  marginBottom: 14,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 12,
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
                        backgroundColor: "#2563EB",
                      }}
                    />
                    <Text variant="TT/Caption" style={{ color: textPrimary, fontWeight: "700" }}>
                      {sug.courseCode}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 5,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 999,
                      backgroundColor: isDark ? "#312E81" : "#EEF2FF",
                    }}
                  >
                    <Info size={13} color="#4F46E5" />
                    <Text
                      variant="TT/Caption"
                      style={{
                        color: isDark ? "#818CF8" : "#4F46E5",
                        fontWeight: "600",
                      }}
                    >
                      Suggested by {sug.suggestedCount}
                    </Text>
                  </View>
                </View>

                <Text variant="TT/H3" style={{ color: textPrimary, fontSize: 19, marginBottom: 6 }}>
                  {sug.title}
                </Text>

                <Text
                  variant="TT/Body"
                  style={{
                    color: textSecondary,
                    lineHeight: 22,
                    marginBottom: 16,
                  }}
                >
                  {sug.subtitle}
                </Text>

                <View style={{ flexDirection: "row", gap: 10 }}>
                  <Pressable
                    onPress={() => {
                      createAssignment.mutate({
                        courseId: sug.courseId,
                        title: sug.title,
                        description: sug.subtitle,
                        dueAt: `${sug.dueIso}T22:59:00.000Z`,
                      });
                      setSuggestions((prev) => prev.filter((item) => item.id !== sug.id));
                    }}
                    style={{
                      flex: 1,
                      height: 46,
                      borderRadius: 12,
                      backgroundColor: "#4F46E5",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    <Check size={16} color="#FFFFFF" />
                    <Text variant="TT/Subhead" style={{ color: "#FFFFFF", fontWeight: "600" }}>
                      Add for everyone
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() =>
                      setSuggestions((prev) => prev.filter((item) => item.id !== sug.id))
                    }
                    style={{
                      flex: 1,
                      height: 46,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: borderCol,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    <X size={16} color={textPrimary} />
                    <Text variant="TT/Subhead" style={{ color: textPrimary, fontWeight: "600" }}>
                      Not this one
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <DatePickerModal
        isOpen={dueDatePickerOpen}
        onClose={() => setDueDatePickerOpen(false)}
        value={dueDate}
        title="Pick due date"
        onSelect={(formatted, iso) => {
          setDueDate(formatted);
          if (iso) setDueDateIso(iso);
        }}
      />

      <DatePickerModal
        isOpen={joiningPickerOpen}
        onClose={() => setJoiningPickerOpen(false)}
        value={joiningCloses}
        title="Pick joining deadline"
        onSelect={(formatted) => setJoiningCloses(formatted)}
      />
    </SafeAreaView>
  );
}
