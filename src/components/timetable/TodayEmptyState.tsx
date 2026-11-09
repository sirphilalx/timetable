import React from "react";
import { View } from "react-native";
import { Sun } from "lucide-react-native";
import { Text } from "@/components/ui/Text";
import { useTheme } from "@/theme";
import { ClassCard } from "./ClassCard";

export interface TodayEmptyStateProps {
  nextClassDate?: string;
  nextClassTime?: string;
  nextCourseCode?: string;
  nextCourseTitle?: string;
  nextVenue?: string;
  nextSource?: string;
}

export function TodayEmptyState({
  nextClassDate = "Mon 9 Nov",
  nextClassTime = "Mon 8:00 – 9:45",
  nextCourseCode = "MTH 301",
  nextCourseTitle = "Linear Algebra · Lecture",
  nextVenue = "LT1, Faculty of Science",
  nextSource = "From CSC 300L reps",
}: TodayEmptyStateProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <View className="py-6">
      {/* Calm Sun Illustration */}
      <View className="items-center justify-center my-6">
        <View
          className="w-20 h-20 rounded-full items-center justify-center mb-4"
          style={{ backgroundColor: isDark ? "#1E1B4B" : "#EEF2FF" }}
        >
          <Sun size={36} color={isDark ? "#818CF8" : "#4F46E5"} strokeWidth={2} />
        </View>
        <Text
          variant="title-page"
          style={{
            color: isDark ? "#F8FAFC" : "#0F172A",
            fontSize: 22,
            textAlign: "center",
            fontFamily: "Inter_700Bold",
            marginBottom: 8,
          }}
        >
          Nothing on today. Enjoy it.
        </Text>
        <Text
          variant="body"
          style={{
            color: isDark ? "#94A3B8" : "#64748B",
            textAlign: "center",
          }}
        >
          Your next class is {nextClassDate} at 8:00 am.
        </Text>
      </View>

      {/* Next Class Section */}
      <View className="mt-6">
        <View className="flex-row items-center mb-3">
          <Text
            variant="title-section"
            style={{
              color: isDark ? "#F8FAFC" : "#0F172A",
              fontSize: 18,
              fontFamily: "Inter_700Bold",
            }}
          >
            Next class
          </Text>
          <Text
            variant="title-section"
            style={{
              color: isDark ? "#94A3B8" : "#64748B",
              fontSize: 18,
              fontFamily: "Inter_400Regular",
              marginLeft: 8,
            }}
          >
            {nextClassDate}
          </Text>
        </View>

        <ClassCard
          courseCode={nextCourseCode}
          courseTitle={nextCourseTitle}
          courseColor="#8B5CF6"
          venue={nextVenue}
          time={nextClassTime}
          sourceAttribution={nextSource}
          status="upcoming"
        />
      </View>
    </View>
  );
}
