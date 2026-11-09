import React, { useState } from "react";
import { View, Pressable, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { X, ChevronLeft } from "lucide-react-native";
import { Text } from "@/components/ui/Text";
import { QrScannerView } from "@/components/timetable/QrScannerView";
import { useTheme } from "@/theme";

export default function JoinScanScreen() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [mode, setMode] = useState<"scan" | "code">("scan");
  const [codeValue, setCodeValue] = useState("");

  const chars = [0, 1, 2, 3, 4, 5].map((i) => codeValue[i] ?? "");

  const handleFindClass = () => {
    const cleanCode = codeValue.trim().toUpperCase() || "CSC3X9";
    router.push(`/join/${cleanCode}` as any);
  };

  if (mode === "code") {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }}
        edges={["top", "left", "right", "bottom"]}
      >
        <View
          style={{
            flex: 1,
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 24,
            justifyContent: "space-between",
          }}
        >
          <View>
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
                onPress={() => setMode("scan")}
                accessibilityRole="button"
                accessibilityLabel="Back to scanner"
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
                Join a class
              </Text>
            </View>

            <Text
              variant="title-page"
              style={{
                color: isDark ? "#F8FAFC" : "#0F172A",
                marginBottom: 10,
              }}
            >
              Enter the share code
            </Text>

            <Text
              variant="body-lg"
              style={{
                color: isDark ? "#94A3B8" : "#334155",
                fontFamily: "Inter_400Regular",
                lineHeight: 22,
                marginBottom: 20,
              }}
            >
              Your rep can find it under Share. It&apos;s also printed under the class QR.
            </Text>

            {/* Hidden master input + 6 visual character boxes matching Screen 21 */}
            <View style={{ position: "relative", marginBottom: 8 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  columnGap: 8,
                }}
              >
                {chars.map((char, idx) => (
                  <View
                    key={idx}
                    style={{
                      flex: 1,
                      height: 56,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: isDark ? "#334155" : "#CBD5E1",
                      backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      variant="title-section"
                      style={{
                        color: isDark ? "#F8FAFC" : "#0F172A",
                        fontSize: 20,
                        fontFamily: "Inter_700Bold",
                      }}
                    >
                      {char}
                    </Text>
                  </View>
                ))}
              </View>

              <TextInput
                value={codeValue}
                onChangeText={(txt) =>
                  setCodeValue(
                    txt
                      .replace(/[^a-zA-Z0-9]/g, "")
                      .toUpperCase()
                      .slice(0, 6),
                  )
                }
                maxLength={6}
                autoCapitalize="characters"
                autoCorrect={false}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  opacity: 0.02,
                }}
              />
            </View>

            <Text variant="caption" style={{ color: isDark ? "#94A3B8" : "#475569" }}>
              6 letters and numbers, from your rep
            </Text>

            {codeValue.length === 0 ? (
              <Pressable
                onPress={() => setCodeValue("CSC3X9")}
                accessibilityRole="button"
                style={{ marginTop: 12, alignSelf: "flex-start" }}
              >
                <Text
                  variant="caption"
                  style={{
                    color: isDark ? "#818CF8" : "#4F46E5",
                    fontFamily: "Inter_600SemiBold",
                  }}
                >
                  No code yet? Try sample code CSC3X9
                </Text>
              </Pressable>
            ) : null}
          </View>

          <Pressable
            onPress={handleFindClass}
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
              Find class
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0F172A" }} edges={["top", "left", "right"]}>
      <View style={{ flex: 1, justifyContent: "space-between" }}>
        {/* Camera Viewfinder Area (Screen 19) */}
        <View
          style={{
            flex: 1,
            backgroundColor: "#1E293B",
            paddingHorizontal: 20,
            paddingTop: 12,
            justifyContent: "space-between",
            paddingBottom: 40,
          }}
        >
          {/* Close Button */}
          <Pressable
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/(tabs)");
              }
            }}
            accessibilityRole="button"
            accessibilityLabel="Close scanner"
            hitSlop={12}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: "rgba(15, 23, 42, 0.75)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={20} color="#FFFFFF" strokeWidth={2.2} />
          </Pressable>

          {/* Live QR Camera Scanner + 4 White Corner Viewfinder Brackets */}
          <QrScannerView
            onCodeScanned={(scannedCode) => {
              router.push(`/join/${scannedCode}` as any);
            }}
          />

          <Text
            variant="body-lg"
            style={{
              color: "#F8FAFC",
              fontFamily: "Inter_400Regular",
              textAlign: "center",
              lineHeight: 22,
            }}
          >
            Point at the QR code on your rep&apos;s phone{"\n"}or the projector
          </Text>
        </View>

        {/* Bottom Sheet: Or type the share code */}
        <View
          style={{
            backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingHorizontal: 20,
            paddingTop: 24,
            paddingBottom: 36,
          }}
        >
          <Text
            variant="title-section"
            style={{
              color: isDark ? "#F8FAFC" : "#0F172A",
              marginBottom: 14,
            }}
          >
            Or type the share code
          </Text>

          <Pressable
            onPress={() => setMode("code")}
            accessibilityRole="button"
            accessibilityLabel="Type the 6 character share code"
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              columnGap: 8,
              marginBottom: 8,
            }}
          >
            {[0, 1, 2, 3, 4, 5].map((idx) => (
              <View
                key={idx}
                style={{
                  flex: 1,
                  height: 54,
                  borderRadius: 12,
                  borderWidth: idx === 0 ? 2 : 1,
                  borderColor: idx === 0 ? "#4F46E5" : isDark ? "#334155" : "#CBD5E1",
                  backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
                }}
              />
            ))}
          </Pressable>

          <Text variant="caption" style={{ color: isDark ? "#94A3B8" : "#475569" }}>
            6 letters and numbers, from your rep
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
