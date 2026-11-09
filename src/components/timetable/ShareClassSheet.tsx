import React, { useState } from "react";
import { View, Pressable, Share } from "react-native";
import { useRouter } from "expo-router";
import { Copy, Check, MessageCircle, Download, Monitor, Link2 } from "lucide-react-native";
import { Sheet } from "@/components/ui/Sheet";
import { Text } from "@/components/ui/Text";
import { QrMatrix } from "./QrMatrix";
import { useTheme } from "@/theme";
import { copyToClipboard } from "@/lib/clipboard";
import { trackEvent } from "@/lib/analytics";

export interface ShareClassSheetProps {
  isOpen: boolean;
  onClose: () => void;
  classNameTitle?: string;
  shareCode?: string;
}

export function ShareClassSheet({
  isOpen,
  onClose,
  classNameTitle = "CSC 300L",
  shareCode = "CSC3X9",
}: ShareClassSheetProps) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyCode = () => {
    void copyToClipboard(shareCode);
    trackEvent("shared_class_link_copied", { share_code: shareCode, copy_type: "code" });
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    void copyToClipboard(`https://studenttimetable.app/join/${shareCode}`);
    trackEvent("shared_class_link_copied", { share_code: shareCode, copy_type: "url" });
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareWhatsApp = async () => {
    trackEvent("shared_class_whatsapp_shared", { share_code: shareCode, surface: "share_sheet" });
    try {
      await Share.share({
        message: `Follow ${classNameTitle} on TT (classes, venues & assignments): https://studenttimetable.app/join/${shareCode} or enter code ${shareCode}`,
      });
    } catch {
      // Ignore share cancellation
    }
  };

  const navigateAfterClose = (path: string) => {
    onClose();
    setTimeout(() => {
      router.push(path as any);
    }, 120);
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose}>
      <View style={{ paddingBottom: 8 }}>
        <Text
          variant="title-page"
          style={{
            color: isDark ? "#F8FAFC" : "#0F172A",
            fontSize: 22,
            lineHeight: 28,
            marginBottom: 8,
          }}
        >
          Share {classNameTitle}
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
          Classmates follow your timetable, assignments and exams. Changes you make reach them
          automatically.
        </Text>

        {/* QR Code + Share Code Row */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            columnGap: 14,
            marginBottom: 20,
          }}
        >
          <View
            style={{
              padding: 6,
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
            }}
          >
            <QrMatrix size={128} />
          </View>

          <Pressable
            onPress={handleCopyCode}
            accessibilityRole="button"
            accessibilityLabel={`Share code ${shareCode}, tap to copy`}
            style={{
              flex: 1,
              height: 140,
              backgroundColor: isDark ? "#1E293B" : "#F1F5F9",
              borderRadius: 16,
              padding: 16,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              variant="body"
              style={{
                color: isDark ? "#94A3B8" : "#475569",
                marginBottom: 8,
              }}
            >
              Share code
            </Text>

            <Text
              variant="display"
              style={{
                color: isDark ? "#F8FAFC" : "#0F172A",
                fontSize: 26,
                lineHeight: 32,
                letterSpacing: 3,
                fontFamily: "Inter_700Bold",
                marginBottom: 10,
              }}
            >
              {shareCode}
            </Text>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {copiedCode ? (
                <Check size={15} color="#16A34A" strokeWidth={2.2} />
              ) : (
                <Copy size={15} color={isDark ? "#818CF8" : "#4F46E5"} strokeWidth={2} />
              )}
              <Text
                variant="label"
                style={{
                  color: copiedCode ? "#16A34A" : isDark ? "#818CF8" : "#4F46E5",
                  marginLeft: 6,
                }}
              >
                {copiedCode ? "Copied" : "Tap to copy"}
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Send link on WhatsApp Primary Button */}
        <Pressable
          onPress={handleShareWhatsApp}
          accessibilityRole="button"
          style={{
            height: 52,
            borderRadius: 12,
            backgroundColor: "#4F46E5",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 12,
          }}
        >
          <MessageCircle size={18} color="#FFFFFF" strokeWidth={2.2} />
          <Text variant="label-lg" style={{ color: "#FFFFFF", marginLeft: 8 }}>
            Send link on WhatsApp
          </Text>
        </Pressable>

        {/* 3 Secondary Action Pills: Save card | Projector | Copy link */}
        <View
          style={{
            flexDirection: "row",
            columnGap: 8,
            marginBottom: 16,
          }}
        >
          <Pressable
            onPress={() => navigateAfterClose("/share/qr-card")}
            accessibilityRole="button"
            style={{
              flex: 1,
              height: 44,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: isDark ? "#334155" : "#CBD5E1",
              backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Download size={16} color={isDark ? "#F8FAFC" : "#0F172A"} strokeWidth={2} />
            <Text
              variant="label"
              style={{
                color: isDark ? "#F8FAFC" : "#0F172A",
                marginLeft: 6,
              }}
            >
              Save card
            </Text>
          </Pressable>

          <Pressable
            onPress={() => navigateAfterClose("/share/projector")}
            accessibilityRole="button"
            style={{
              flex: 1,
              height: 44,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: isDark ? "#334155" : "#CBD5E1",
              backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Monitor size={16} color={isDark ? "#F8FAFC" : "#0F172A"} strokeWidth={2} />
            <Text
              variant="label"
              style={{
                color: isDark ? "#F8FAFC" : "#0F172A",
                marginLeft: 6,
              }}
            >
              Projector
            </Text>
          </Pressable>

          <Pressable
            onPress={handleCopyLink}
            accessibilityRole="button"
            style={{
              flex: 1,
              height: 44,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: isDark ? "#334155" : "#CBD5E1",
              backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {copiedLink ? (
              <Check size={16} color="#16A34A" strokeWidth={2.2} />
            ) : (
              <Link2 size={16} color={isDark ? "#F8FAFC" : "#0F172A"} strokeWidth={2} />
            )}
            <Text
              variant="label"
              style={{
                color: copiedLink ? "#16A34A" : isDark ? "#F8FAFC" : "#0F172A",
                marginLeft: 6,
              }}
            >
              {copiedLink ? "Copied" : "Copy link"}
            </Text>
          </Pressable>
        </View>

        <Text
          variant="caption"
          style={{
            color: isDark ? "#94A3B8" : "#475569",
            lineHeight: 18,
          }}
        >
          Link works all semester. Regenerate it in class settings to stop new joins.
        </Text>
      </View>
    </Sheet>
  );
}
