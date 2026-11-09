import React from "react";
import { View, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft, Plus, Settings } from "lucide-react-native";
import { Text } from "@/components/ui/Text";
import { useTheme } from "@/theme";
import { useTimetable } from "@/hooks/useTimetable";

export default function SettingsCoursesScreen() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const { data } = useTimetable();

  const sharedCourses = data.courses.filter((c) => Boolean(c.sharedGroupId));
  const personalCourses = data.courses.filter((c) => !c.sharedGroupId);

  const getRuleCount = (courseId: string) =>
    data.classRules.filter((r) => r.courseId === courseId && r.isDeleted === 0).length +
    data.classOccurrences.filter((o) => !o.ruleId && o.courseId === courseId && o.isDeleted === 0)
      .length;

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
          {/* Header (Screen 81) */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              height: 48,
              marginBottom: 16,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
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
                My courses
              </Text>
            </View>

            <Pressable
              onPress={() => router.push("/setup/add-course")}
              accessibilityRole="button"
              accessibilityLabel="Add course"
              hitSlop={12}
              style={{
                flexDirection: "row",
                alignItems: "center",
                columnGap: 4,
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 8,
                backgroundColor: isDark ? "#312E81" : "#EEF2FF",
              }}
            >
              <Plus size={15} color={isDark ? "#818CF8" : "#4F46E5"} strokeWidth={2.4} />
              <Text variant="label" style={{ color: isDark ? "#818CF8" : "#4F46E5" }}>
                Add course
              </Text>
            </Pressable>
          </View>

          {/* Shared Class Courses Section (shown when user has joined a shared class) */}
          {sharedCourses.length > 0 ? (
            <>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                <Text variant="title-section" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                  From shared classes
                </Text>
                <Text
                  variant="title-section"
                  style={{
                    color: isDark ? "#94A3B8" : "#475569",
                    marginLeft: 8,
                    fontVariant: ["tabular-nums"],
                  }}
                >
                  {sharedCourses.length}
                </Text>
              </View>

              <View
                style={{
                  backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: isDark ? "#334155" : "#E2E8F0",
                  padding: 16,
                  rowGap: 18,
                  marginBottom: 24,
                }}
              >
                {sharedCourses.map((course) => {
                  const slotCount = getRuleCount(course.id);
                  return (
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
                            {course.lecturerName ? `${course.lecturerName} · ` : ""}
                            {slotCount} {slotCount === 1 ? "class" : "classes"} a week
                          </Text>
                        </View>
                      </View>

                      <Settings
                        size={18}
                        color={isDark ? "#94A3B8" : "#475569"}
                        strokeWidth={1.85}
                      />
                    </Pressable>
                  );
                })}
              </View>
            </>
          ) : null}

          {/* Added by you Section */}
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <Text variant="title-section" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
              Added by you
            </Text>
            <Text
              variant="title-section"
              style={{
                color: isDark ? "#94A3B8" : "#475569",
                marginLeft: 8,
                fontVariant: ["tabular-nums"],
              }}
            >
              {personalCourses.length}
            </Text>
          </View>

          <View
            style={{
              backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
              borderRadius: 16,
              borderWidth: 1,
              borderColor: isDark ? "#334155" : "#E2E8F0",
              padding: 16,
              rowGap: 18,
              marginBottom: 12,
            }}
          >
            {personalCourses.length === 0 ? (
              <View style={{ paddingVertical: 12, alignItems: "center", rowGap: 6 }}>
                <Text variant="title-card" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                  No personal courses yet
                </Text>
                <Text
                  variant="body"
                  style={{ color: isDark ? "#94A3B8" : "#475569", textAlign: "center" }}
                >
                  Tap &ldquo;Add a course&rdquo; below to create your own courses and class times.
                </Text>
              </View>
            ) : (
              personalCourses.map((course) => {
                const slotCount = getRuleCount(course.id);
                return (
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
                          {course.lecturerName ? ` · ${course.lecturerName}` : ""} · {slotCount}{" "}
                          {slotCount === 1 ? "slot" : "slots"}
                        </Text>
                      </View>
                    </View>

                    <Settings size={18} color={isDark ? "#94A3B8" : "#475569"} strokeWidth={1.85} />
                  </Pressable>
                );
              })
            )}
          </View>

          <Text
            variant="caption"
            style={{
              color: isDark ? "#94A3B8" : "#475569",
              lineHeight: 18,
            }}
          >
            Tap any course to open its detail page where you can edit details, manage class slots,
            or delete the course.
          </Text>
        </ScrollView>

        <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
          <Pressable
            onPress={() => router.push("/setup/add-course")}
            accessibilityRole="button"
            style={{
              height: 52,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: isDark ? "#334155" : "#CBD5E1",
              backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text variant="title-card" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
              Add a course
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
