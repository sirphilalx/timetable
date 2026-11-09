import React, { useState } from "react";
import { View, ScrollView, Pressable, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Check } from "lucide-react-native";
import { Text } from "@/components/ui/Text";
import { useTheme } from "@/theme";
import { useAuth } from "@/auth";
import { useCreateCourse } from "@/hooks/useTimetable";

const COURSE_COLORS = [
  { id: "blue", name: "Blue", light: "#2563EB" },
  { id: "teal", name: "Teal", light: "#0D9488" },
  { id: "violet", name: "Violet", light: "#7C3AED" },
  { id: "pink", name: "Pink", light: "#DB2777" },
  { id: "orange", name: "Orange", light: "#EA580C" },
  { id: "cyan", name: "Cyan", light: "#0891B2" },
  { id: "ochre", name: "Ochre", light: "#A16207" },
  { id: "slate", name: "Slate", light: "#475569" },
] as const;

export default function AddCourseScreen() {
  const router = useRouter();
  const { origin } = useLocalSearchParams<{ origin?: string }>();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { hasCompletedOnboarding } = useAuth();

  const createCourseMutation = useCreateCourse();

  const [code, setCode] = useState("");
  const [units, setUnits] = useState("3");
  const [title, setTitle] = useState("");
  const [lecturer, setLecturer] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState<string>("#0891B2");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSaveCourse = (andAddClass = false) => {
    if (!code.trim() || !title.trim()) {
      setErrorMessage("Please enter both a course code and course title.");
      return;
    }
    setErrorMessage(null);
    createCourseMutation.mutate(
      {
        code: code.trim(),
        title: title.trim(),
        units: parseInt(units, 10) || 3,
        color: selectedColor,
        lecturerName: lecturer.trim() || undefined,
      },
      {
        onSuccess: (created) => {
          if (andAddClass) {
            const isSetup = !hasCompletedOnboarding || origin === "setup";
            router.replace(
              `/setup/add-class?courseId=${created.id}${isSetup ? "&origin=setup" : ""}` as any,
            );
          } else if (router.canGoBack()) {
            router.back();
          } else {
            router.replace(
              !hasCompletedOnboarding || origin === "setup" ? "/setup/courses" : "/(tabs)/classes",
            );
          }
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
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace(
                    !hasCompletedOnboarding || origin === "setup"
                      ? "/setup/courses"
                      : "/(tabs)/classes",
                  );
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
              Add course
            </Text>
          </View>

          {/* Course Code & Units Row */}
          <View
            style={{
              flexDirection: "row",
              columnGap: 12,
              marginBottom: 20,
            }}
          >
            <View style={{ flex: 2.3 }}>
              <Text
                variant="label"
                style={{ color: isDark ? "#CBD5E1" : "#334155", marginBottom: 6 }}
              >
                Course code
              </Text>
              <TextInput
                value={code}
                onChangeText={setCode}
                placeholder="e.g. CSC 301"
                placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                autoCapitalize="characters"
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
            </View>

            <View style={{ flex: 1 }}>
              <Text
                variant="label"
                style={{ color: isDark ? "#CBD5E1" : "#334155", marginBottom: 6 }}
              >
                Units
              </Text>
              <TextInput
                value={units}
                onChangeText={setUnits}
                keyboardType="number-pad"
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
            </View>
          </View>

          {/* Course Title (with active indigo border matching Screen 24) */}
          <View style={{ marginBottom: 20 }}>
            <Text
              variant="label"
              style={{ color: isDark ? "#CBD5E1" : "#334155", marginBottom: 6 }}
            >
              Course title
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Course title"
              placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
              style={{
                height: 48,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: "#4F46E5",
                backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                paddingHorizontal: 14,
                fontFamily: "Inter_400Regular",
                fontSize: 15,
                color: isDark ? "#F8FAFC" : "#0F172A",
              }}
            />
          </View>

          {/* Lecturer */}
          <View style={{ marginBottom: 20 }}>
            <Text
              variant="label"
              style={{ color: isDark ? "#CBD5E1" : "#334155", marginBottom: 6 }}
            >
              Lecturer
            </Text>
            <TextInput
              value={lecturer}
              onChangeText={setLecturer}
              placeholder="Dr. ..."
              placeholderTextColor={isDark ? "#64748B" : "#64748B"}
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

          {/* Description */}
          <View style={{ marginBottom: 20 }}>
            <Text
              variant="label"
              style={{ color: isDark ? "#CBD5E1" : "#334155", marginBottom: 6 }}
            >
              Description
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Notes about the course"
              placeholderTextColor={isDark ? "#64748B" : "#64748B"}
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

          {/* 8 Course Colour Swatches matching Screen 24 */}
          <View>
            <Text
              variant="label"
              style={{ color: isDark ? "#CBD5E1" : "#334155", marginBottom: 12 }}
            >
              Colour
            </Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              {COURSE_COLORS.map((swatch) => {
                const isSelected = selectedColor === swatch.light;
                return (
                  <Pressable
                    key={swatch.id}
                    onPress={() => setSelectedColor(swatch.light)}
                    accessibilityRole="button"
                    accessibilityLabel={`Select ${swatch.name} colour`}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: swatch.light,
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: isSelected ? 3 : 0,
                      borderColor: "#FFFFFF",
                      shadowColor: "#0F172A",
                      shadowOffset: { width: 0, height: isSelected ? 2 : 0 },
                      shadowOpacity: isSelected ? 0.18 : 0,
                      shadowRadius: 4,
                      elevation: isSelected ? 3 : 0,
                    }}
                  >
                    {isSelected ? <Check size={18} color="#FFFFFF" strokeWidth={2.5} /> : null}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </ScrollView>

        {/* Save Course CTA */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 16, gap: 10 }}>
          {errorMessage ? (
            <Text
              variant="caption"
              style={{
                color: isDark ? "#F87171" : "#DC2626",
                textAlign: "center",
              }}
            >
              {errorMessage}
            </Text>
          ) : null}

          <Pressable
            onPress={() => handleSaveCourse(false)}
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
              Save course
            </Text>
          </Pressable>

          <Pressable
            onPress={() => handleSaveCourse(true)}
            accessibilityRole="button"
            style={{
              height: 46,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: isDark ? "#334155" : "#CBD5E1",
              backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text variant="label" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
              Save & add class time
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
