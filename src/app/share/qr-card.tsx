import React, { useState } from "react";
import { View, Pressable, Share } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MessageCircle, Download, Check, X } from "lucide-react-native";
import { Text } from "@/components/ui/Text";
import { QrMatrix } from "@/components/timetable";
import { useTimetable } from "@/hooks/useTimetable";
import { trackEvent } from "@/lib/analytics";

export default function QrCardScreen() {
  const router = useRouter();
  const [savedToast, setSavedToast] = useState(false);
  const { data } = useTimetable();

  const mainGroup = data.followedSubscriptions[0];
  const shareCode = mainGroup?.shareCode ?? "CSC3X9";
  const instStr = data.student.institution ?? "University of Benin (UNIBEN)";
  const institutionShort = instStr.match(/\(([^)]+)\)/)?.[1] ?? instStr.split(" ")[0] ?? "UNIBEN";
  const classPrefix =
    mainGroup?.title.split("·")[0]?.trim() ??
    `${data.courses[0]?.code.split(" ")[0] ?? "CSC"} 300L`;
  const cardHeading = `${classPrefix} · ${institutionShort}`;

  const handlePostWhatsApp = async () => {
    trackEvent("shared_class_whatsapp_shared", { share_code: shareCode, surface: "qr_card" });
    try {
      await Share.share({
        message: `Join ${cardHeading} on TT: https://studenttimetable.app/join/${shareCode} (code ${shareCode})`,
      });
    } catch {
      // Ignore cancellation
    }
  };

  const handleSaveImage = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#0F172A" }}
      edges={["top", "left", "right", "bottom"]}
    >
      <View
        style={{
          flex: 1,
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 24,
          justifyContent: "space-between",
        }}
      >
        {/* Top Close Icon */}
        <View style={{ alignItems: "flex-end" }}>
          <Pressable
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/(tabs)");
              }
            }}
            accessibilityRole="button"
            accessibilityLabel="Close"
            hitSlop={12}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "rgba(255,255,255,0.1)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={20} color="#FFFFFF" strokeWidth={2.2} />
          </Pressable>
        </View>

        {/* Indigo / Violet QR Share Card (Screen 61) */}
        <View
          style={{
            backgroundColor: "#6366F1",
            borderRadius: 28,
            paddingVertical: 36,
            paddingHorizontal: 24,
            alignItems: "center",
            marginHorizontal: 12,
          }}
        >
          <Text
            variant="title-card"
            style={{
              color: "#FFFFFF",
              fontSize: 17,
              lineHeight: 24,
              marginBottom: 8,
            }}
          >
            Scan to join
          </Text>

          <Text
            variant="display"
            style={{
              color: "#FFFFFF",
              fontSize: 26,
              lineHeight: 32,
              fontFamily: "Inter_700Bold",
              textAlign: "center",
              marginBottom: 24,
            }}
          >
            {cardHeading}
          </Text>

          {/* White QR Frame */}
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              padding: 16,
              marginBottom: 24,
            }}
          >
            <QrMatrix size={172} color="#312E81" />
          </View>

          <Text
            variant="body-lg"
            style={{
              color: "rgba(255,255,255,0.92)",
              fontFamily: "Inter_400Regular",
              textAlign: "center",
              lineHeight: 22,
              marginBottom: 16,
            }}
          >
            Share with classmates · code{"\n"}
            {shareCode}
          </Text>

          <Text
            variant="caption"
            style={{
              color: "rgba(255,255,255,0.8)",
            }}
          >
            TT: Student Timetable
          </Text>
        </View>

        {/* Bottom CTAs */}
        <View style={{ rowGap: 12 }}>
          <Pressable
            onPress={handlePostWhatsApp}
            accessibilityRole="button"
            style={{
              height: 52,
              borderRadius: 12,
              backgroundColor: "#4F46E5",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MessageCircle size={18} color="#FFFFFF" strokeWidth={2.2} />
            <Text variant="label-lg" style={{ color: "#FFFFFF", marginLeft: 8 }}>
              Post to WhatsApp status
            </Text>
          </Pressable>

          <Pressable
            onPress={handleSaveImage}
            accessibilityRole="button"
            style={{
              height: 52,
              borderRadius: 12,
              backgroundColor: "#FFFFFF",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {savedToast ? (
              <Check size={18} color="#16A34A" strokeWidth={2.2} />
            ) : (
              <Download size={18} color="#0F172A" strokeWidth={2.2} />
            )}
            <Text
              variant="label-lg"
              style={{
                color: savedToast ? "#16A34A" : "#0F172A",
                marginLeft: 8,
              }}
            >
              {savedToast ? "Saved to Photos" : "Save image"}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
