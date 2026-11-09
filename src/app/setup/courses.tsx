import React from "react";
import { View, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react-native";
import { Text } from "@/components/ui/Text";
import { useTheme } from "@/theme";
import { useTimetable } from "@/hooks/useTimetable";

export default function SetupCoursesScreen() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const { data } = useTimetable();
  const displayedCourses = data.courses;

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
                  router.replace("/setup/semester");
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
              Set up your timetable
            </Text>
          </View>

          {/* 4-Step Progress Indicator (Step 2 active) */}
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
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: "#4F46E5",
              }}
            />
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
          </View>

          <Text
            variant="title-page"
            style={{
              color: isDark ? "#F8FAFC" : "#0F172A",
              marginBottom: 8,
            }}
          >
            Your courses
          </Text>

          <Text
            variant="body-lg"
            style={{
              color: isDark ? "#94A3B8" : "#334155",
              fontFamily: "Inter_400Regular",
              lineHeight: 22,
              marginBottom: 16,
            }}
          >
            Add each course you&apos;re registered for this semester. Tap any course to open its
            detail page to manage or delete it.
          </Text>

          {/* Registered Courses Card */}
          <View
            style={{
              backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
              borderRadius: 16,
              padding: 16,
              rowGap: 18,
              marginBottom: 16,
            }}
          >
            {displayedCourses.length === 0 ? (
              <Text
                variant="body"
                style={{
                  color: isDark ? "#94A3B8" : "#64748B",
                  textAlign: "center",
                  paddingVertical: 12,
                }}
              >
                No courses added yet. Tap &ldquo;Add course&rdquo; below to add your first course.
              </Text>
            ) : null}
            {displayedCourses.map((course) => (
              <Pressable
                key={course.id}
                onPress={() => router.push(`/course/${course.id}`)}
                accessibilityRole="button"
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: isDark ? "#0F172A" : "#F1F5F9",
                      borderRadius: 6,
                      paddingHorizontal: 8,
                      paddingVertical: 5,
                      minWidth: 88,
                    }}
                  >
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: course.color,
                        marginRight: 6,
                      }}
                    />
                    <Text variant="label" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                      {course.code}
                    </Text>
                  </View>

                  <View style={{ flex: 1, marginLeft: 12, marginRight: 8 }}>
                    <Text
                      variant="title-card"
                      numberOfLines={1}
                      style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}
                    >
                      {course.title}
                    </Text>
                    <Text
                      variant="caption"
                      numberOfLines={1}
                      style={{ color: isDark ? "#94A3B8" : "#475569", marginTop: 2 }}
                    >
                      {course.units} units
                      {course.lecturerName ? ` · ${course.lecturerName}` : ""}
                    </Text>
                  </View>
                </View>

                <ChevronRight size={18} color={isDark ? "#94A3B8" : "#475569"} strokeWidth={2} />
              </Pressable>
            ))}
          </View>

          {/* + Add course Outlined Button */}
          <Pressable
            onPress={() => router.push("/setup/add-course?origin=setup" as any)}
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
            <Plus size={18} color={isDark ? "#94A3B8" : "#475569"} strokeWidth={2.2} />
            <Text
              variant="title-card"
              style={{
                color: isDark ? "#F8FAFC" : "#0F172A",
                marginLeft: 8,
              }}
            >
              Add course
            </Text>
          </Pressable>
        </ScrollView>

        {/* Bottom Primary CTA */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
          <Pressable
            onPress={() => {
              if (displayedCourses.length === 0) {
                router.push("/setup/add-course?origin=setup" as any);
              } else {
                router.push("/setup/add-class?origin=setup" as any);
              }
            }}
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
              {displayedCourses.length === 0
                ? "Add your first course"
                : "Continue · Schedule classes"}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
