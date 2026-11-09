import React, { useEffect, useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft, Clock, Info, Plus } from "lucide-react-native";
import { Text } from "@/components/ui/Text";
import { useTheme } from "@/theme";
import { useTimetable } from "@/hooks/useTimetable";
import { loadReminderPreferences, saveReminderPreferences } from "@/lib/reminders";

export default function SettingsCheckInsScreen() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { data } = useTimetable();

  const [delayMinutes, setDelayMinutes] = useState<10 | 30>(10);
  const [repeat8pm, setRepeat8pm] = useState(true);
  const [courseCheckInsEnabled, setCourseCheckInsEnabled] = useState<Record<string, boolean>>({});

  useEffect(() => {
    void loadReminderPreferences().then((prefs) => {
      setDelayMinutes(prefs.checkInsDelayMinutes);
      setRepeat8pm(prefs.checkInsRepeat8pm);
      setCourseCheckInsEnabled(prefs.courseCheckInsEnabled);
    });
  }, []);

  const toggleDelayMinutes = () => {
    const next: 10 | 30 = delayMinutes === 10 ? 30 : 10;
    setDelayMinutes(next);
    void saveReminderPreferences({ checkInsDelayMinutes: next });
  };

  const toggleRepeat8pm = () => {
    const next = !repeat8pm;
    setRepeat8pm(next);
    void saveReminderPreferences({ checkInsRepeat8pm: next });
  };

  const toggleCourse = (courseId: string) => {
    const currentlyOn = courseCheckInsEnabled[courseId] !== false;
    const next = { ...courseCheckInsEnabled, [courseId]: !currentlyOn };
    setCourseCheckInsEnabled(next);
    void saveReminderPreferences({ courseCheckInsEnabled: next });
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }}
      edges={["top", "left", "right"]}
    >
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 36 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header (Screen 84) */}
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
            Check-ins
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
          After a class ends, TT asks if you attended. Your answers build your attendance report.
          Only you see them.
        </Text>

        {/* Timing Card */}
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
          <Pressable
            onPress={toggleDelayMinutes}
            accessibilityRole="button"
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
              <View style={{ width: 32, alignItems: "flex-start" }}>
                <Clock size={20} color={isDark ? "#94A3B8" : "#475569"} strokeWidth={1.85} />
              </View>
              <Text variant="body-lg" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                Ask me
              </Text>
            </View>
            <Text variant="body-lg" style={{ color: isDark ? "#818CF8" : "#4F46E5" }}>
              {delayMinutes} min after class
            </Text>
          </Pressable>

          <Pressable
            onPress={toggleRepeat8pm}
            accessibilityRole="button"
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
              <View style={{ width: 32, alignItems: "flex-start" }}>
                <Info size={20} color={isDark ? "#94A3B8" : "#475569"} strokeWidth={1.85} />
              </View>
              <Text variant="body-lg" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                If I do not{"\n"}answer
              </Text>
            </View>
            <Text variant="body-lg" style={{ color: isDark ? "#818CF8" : "#4F46E5" }}>
              {repeat8pm ? "Ask again at 8 pm" : "Don't ask again"}
            </Text>
          </Pressable>
        </View>

        <Text
          variant="title-section"
          style={{
            color: isDark ? "#F8FAFC" : "#0F172A",
            marginBottom: 12,
          }}
        >
          Courses
        </Text>

        {/* Per-Course Toggle List */}
        {data.courses.length === 0 ? (
          <View
            style={{
              backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
              borderRadius: 16,
              borderWidth: 1,
              borderColor: isDark ? "#334155" : "#E2E8F0",
              padding: 20,
              alignItems: "center",
            }}
          >
            <Text
              variant="body-lg"
              style={{
                color: isDark ? "#94A3B8" : "#475569",
                textAlign: "center",
                marginBottom: 14,
              }}
            >
              No courses added yet. Add your courses to configure per-course attendance check-ins.
            </Text>
            <Pressable
              onPress={() => router.push("/setup/add-course" as any)}
              accessibilityRole="button"
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                paddingHorizontal: 14,
                height: 40,
                borderRadius: 10,
                backgroundColor: isDark ? "#312E81" : "#EEF2FF",
              }}
            >
              <Plus size={16} color={isDark ? "#818CF8" : "#4F46E5"} strokeWidth={2.2} />
              <Text variant="label" style={{ color: isDark ? "#818CF8" : "#4F46E5" }}>
                Add course
              </Text>
            </Pressable>
          </View>
        ) : (
          <View
            style={{
              backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
              borderRadius: 16,
              borderWidth: 1,
              borderColor: isDark ? "#334155" : "#E2E8F0",
              padding: 16,
              rowGap: 20,
            }}
          >
            {data.courses.map((course) => {
              const isOn = courseCheckInsEnabled[course.id] !== false;
              return (
                <View
                  key={course.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <Text variant="body-lg" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                      {course.code} {course.title}
                    </Text>
                    {!isOn ? (
                      <Text
                        variant="body"
                        style={{ color: isDark ? "#94A3B8" : "#475569", marginTop: 2 }}
                      >
                        Off: attendance not tracked
                      </Text>
                    ) : null}
                  </View>

                  <Pressable
                    onPress={() => toggleCourse(course.id)}
                    accessibilityRole="switch"
                    accessibilityState={{ checked: isOn }}
                    style={{
                      width: 52,
                      height: 30,
                      borderRadius: 15,
                      backgroundColor: isOn ? "#4F46E5" : isDark ? "#334155" : "#E2E8F0",
                      padding: 3,
                      justifyContent: "center",
                      alignItems: isOn ? "flex-end" : "flex-start",
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
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
