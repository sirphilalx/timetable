import React from "react";
import { View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { X } from "lucide-react-native";
import { Text } from "@/components/ui/Text";
import { QrMatrix } from "@/components/timetable";
import { useTheme } from "@/theme";
import { useTimetable } from "@/hooks/useTimetable";

export default function ProjectorModeScreen() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { data } = useTimetable();

  const mainGroup = data.followedSubscriptions[0];
  const shareCode = mainGroup?.shareCode ?? "CSC3X9";
  const classPrefix =
    mainGroup?.title.split("·")[0]?.trim() ??
    `${data.courses[0]?.code.split(" ")[0] ?? "CSC"} 300L`;

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? "#0F172A" : "#FFFFFF" }}
      edges={["top", "left", "right", "bottom"]}
    >
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 24,
        }}
      >
        <Text
          variant="display"
          style={{
            color: isDark ? "#F8FAFC" : "#0F172A",
            fontSize: 28,
            lineHeight: 34,
            fontFamily: "Inter_700Bold",
            textAlign: "center",
            marginBottom: 40,
          }}
        >
          Join {classPrefix} on TT
        </Text>

        <View
          style={{
            marginBottom: 40,
            padding: 16,
            borderRadius: 20,
            backgroundColor: "#FFFFFF",
          }}
        >
          <QrMatrix size={256} color="#312E81" />
        </View>

        <Text
          variant="title-section"
          style={{
            color: isDark ? "#CBD5E1" : "#334155",
            fontSize: 20,
            lineHeight: 26,
            fontFamily: "Inter_600SemiBold",
            marginBottom: 28,
          }}
        >
          or enter code {shareCode}
        </Text>

        <Pressable
          onPress={handleClose}
          accessibilityRole="button"
          accessibilityLabel="Close projector mode"
          style={{
            height: 48,
            paddingHorizontal: 24,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: isDark ? "#334155" : "#CBD5E1",
            backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <X size={18} color={isDark ? "#F8FAFC" : "#0F172A"} strokeWidth={2.2} />
          <Text variant="label-lg" style={{ color: isDark ? "#F8FAFC" : "#0F172A", marginLeft: 8 }}>
            Close
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
