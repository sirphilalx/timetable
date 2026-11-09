import React from "react";
import { View, Platform } from "react-native";
import { Tabs } from "expo-router";
import { CalendarDays, GraduationCap, ClipboardCheck } from "lucide-react-native";
import { useTheme } from "@/theme";
import { Text } from "@/components/ui/Text";

export default function TabLayout() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const activeColor = isDark ? "#818CF8" : "#4F46E5";
  const inactiveColor = isDark ? "#94A3B8" : "#475569";
  const barBg = isDark ? "#0F172A" : "#FFFFFF";
  const borderColor = isDark ? "#1E293B" : "#E2E8F0";
  const activePillBg = isDark ? "#1E1B4B" : "#EEF2FF";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          display: "none",
          backgroundColor: barBg,
          borderTopColor: borderColor,
          borderTopWidth: 1,
          height: Platform.OS === "ios" ? 86 : 72,
          paddingBottom: Platform.OS === "ios" ? 22 : 10,
          paddingTop: 8,
          elevation: 0,
          shadowOpacity: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Today",
          tabBarLabel: ({ focused, color }) => (
            <Text
              variant="label-sm"
              style={{
                color,
                fontFamily: focused ? "Inter_600SemiBold" : "Inter_500Medium",
                marginTop: 4,
                textAlign: "center",
              }}
            >
              Today
            </Text>
          ),
          tabBarIcon: ({ focused, color }) => (
            <View
              style={{
                width: 56,
                height: 28,
                borderRadius: 9999,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: focused ? activePillBg : "transparent",
              }}
            >
              <CalendarDays size={20} color={color} strokeWidth={focused ? 2 : 1.75} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="classes"
        options={{
          title: "Classes",
          tabBarLabel: ({ focused, color }) => (
            <Text
              variant="label-sm"
              style={{
                color,
                fontFamily: focused ? "Inter_600SemiBold" : "Inter_500Medium",
                marginTop: 4,
                textAlign: "center",
              }}
            >
              Classes
            </Text>
          ),
          tabBarIcon: ({ focused, color }) => (
            <View
              style={{
                width: 56,
                height: 28,
                borderRadius: 9999,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: focused ? activePillBg : "transparent",
              }}
            >
              <GraduationCap size={20} color={color} strokeWidth={focused ? 2 : 1.75} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="assignments"
        options={{
          title: "Assignments",
          tabBarLabel: ({ focused, color }) => (
            <Text
              variant="label-sm"
              style={{
                color,
                fontFamily: focused ? "Inter_600SemiBold" : "Inter_500Medium",
                marginTop: 4,
                textAlign: "center",
              }}
            >
              Assignments
            </Text>
          ),
          tabBarIcon: ({ focused, color }) => (
            <View
              style={{
                width: 56,
                height: 28,
                borderRadius: 9999,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: focused ? activePillBg : "transparent",
              }}
            >
              <ClipboardCheck size={20} color={color} strokeWidth={focused ? 2 : 1.75} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
