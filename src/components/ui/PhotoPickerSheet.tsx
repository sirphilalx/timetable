import React, { useState } from "react";
import { View, Pressable, TextInput } from "react-native";
import { Camera, Image as ImageIcon, Trash2, Check, Link2 } from "lucide-react-native";
import { Sheet } from "./Sheet";
import { Text } from "./Text";
import { StudentAvatar } from "./StudentAvatar";
import { SelfieCameraView } from "./SelfieCameraView";
import { useTheme } from "@/theme";
import { pickPhotoFromLibrary, STUDENT_AVATAR_PRESETS } from "@/lib/photoPicker";

export interface PhotoPickerSheetProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatarUrl: string | null;
  initials: string;
  onSelectAvatar: (avatarUrl: string | null) => void;
}

export function PhotoPickerSheet({
  isOpen,
  onClose,
  currentAvatarUrl,
  initials,
  onSelectAvatar,
}: PhotoPickerSheetProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [mode, setMode] = useState<"menu" | "camera" | "url">("menu");
  const [customUrl, setCustomUrl] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleClose = () => {
    setMode("menu");
    setStatusMessage(null);
    onClose();
  };

  const handlePickLibrary = async () => {
    setStatusMessage(null);
    const res = await pickPhotoFromLibrary(false);
    if (res.ok && res.uri) {
      onSelectAvatar(res.uri);
      handleClose();
      return;
    }
    if (res.cancelled) {
      return;
    }
    setStatusMessage(
      "Device photo gallery is unavailable in this simulator — pick a portrait below or take a camera photo.",
    );
  };

  return (
    <Sheet isOpen={isOpen} onClose={handleClose} title="Profile photo">
      {mode === "camera" ? (
        <View style={{ paddingVertical: 8 }}>
          <SelfieCameraView
            onCancel={() => setMode("menu")}
            onPhotoCaptured={(uri) => {
              onSelectAvatar(uri);
              handleClose();
            }}
          />
        </View>
      ) : mode === "url" ? (
        <View style={{ paddingVertical: 8 }}>
          <Text variant="label" style={{ color: isDark ? "#CBD5E1" : "#334155", marginBottom: 6 }}>
            Image URL
          </Text>
          <TextInput
            value={customUrl}
            onChangeText={setCustomUrl}
            placeholder="https://example.com/photo.jpg"
            placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
            autoCapitalize="none"
            autoCorrect={false}
            style={{
              height: 48,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: isDark ? "#334155" : "#CBD5E1",
              backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
              paddingHorizontal: 14,
              fontFamily: "Inter_400Regular",
              fontSize: 15,
              color: isDark ? "#F8FAFC" : "#0F172A",
              marginBottom: 14,
            }}
          />
          <View style={{ flexDirection: "row", columnGap: 10 }}>
            <Pressable
              onPress={() => setMode("menu")}
              accessibilityRole="button"
              style={{
                flex: 1,
                height: 48,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: isDark ? "#334155" : "#CBD5E1",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text variant="label" style={{ color: isDark ? "#CBD5E1" : "#334155" }}>
                Back
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                const trimmed = customUrl.trim();
                if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
                  onSelectAvatar(trimmed);
                  handleClose();
                }
              }}
              accessibilityRole="button"
              style={{
                flex: 1,
                height: 48,
                borderRadius: 12,
                backgroundColor: "#4F46E5",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text variant="label-lg" style={{ color: "#FFFFFF" }}>
                Use photo
              </Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={{ paddingBottom: 8 }}>
          {/* Device Upload & Camera Actions */}
          <View style={{ flexDirection: "row", columnGap: 10, marginBottom: 16 }}>
            <Pressable
              onPress={() => {
                void handlePickLibrary();
              }}
              accessibilityRole="button"
              style={{
                flex: 1,
                minHeight: 54,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: isDark ? "#334155" : "#CBD5E1",
                backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                paddingHorizontal: 12,
                paddingVertical: 10,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ImageIcon size={18} color={isDark ? "#818CF8" : "#4F46E5"} strokeWidth={2} />
              <Text
                variant="label"
                style={{ color: isDark ? "#F8FAFC" : "#0F172A", marginLeft: 8 }}
              >
                Upload photo
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setMode("camera")}
              accessibilityRole="button"
              style={{
                flex: 1,
                minHeight: 54,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: isDark ? "#334155" : "#CBD5E1",
                backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                paddingHorizontal: 12,
                paddingVertical: 10,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Camera size={18} color={isDark ? "#818CF8" : "#4F46E5"} strokeWidth={2} />
              <Text
                variant="label"
                style={{ color: isDark ? "#F8FAFC" : "#0F172A", marginLeft: 8 }}
              >
                Take photo
              </Text>
            </Pressable>
          </View>

          {statusMessage ? (
            <View
              style={{
                backgroundColor: isDark ? "#1E1B4B" : "#EEF2FF",
                borderRadius: 12,
                padding: 12,
                marginBottom: 14,
              }}
            >
              <Text
                variant="caption"
                style={{ color: isDark ? "#C7D2FE" : "#4338CA", lineHeight: 18 }}
              >
                {statusMessage}
              </Text>
            </View>
          ) : null}

          {/* Student Portrait Gallery */}
          <Text variant="label" style={{ color: isDark ? "#94A3B8" : "#475569", marginBottom: 10 }}>
            Or choose a student avatar
          </Text>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
              rowGap: 12,
              marginBottom: 16,
            }}
          >
            {STUDENT_AVATAR_PRESETS.map((preset) => {
              const isSelected = currentAvatarUrl === preset.id;
              return (
                <Pressable
                  key={preset.id}
                  onPress={() => {
                    onSelectAvatar(preset.id);
                    handleClose();
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${preset.label} student avatar`}
                  style={{
                    width: "31%",
                    borderRadius: 16,
                    borderWidth: isSelected ? 2 : 1,
                    borderColor: isSelected ? "#4F46E5" : isDark ? "#334155" : "#E2E8F0",
                    backgroundColor: isSelected
                      ? isDark
                        ? "#1E1B4B"
                        : "#EEF2FF"
                      : isDark
                        ? "#0F172A"
                        : "#FFFFFF",
                    paddingVertical: 12,
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  <StudentAvatar
                    avatarUrl={preset.id}
                    initials={initials}
                    size={54}
                    borderWidth={2}
                    borderColor={isSelected ? "#4F46E5" : "#FFFFFF"}
                  />
                  <Text
                    variant="caption"
                    style={{
                      color: isDark ? "#E2E8F0" : "#334155",
                      fontFamily: isSelected ? "Inter_600SemiBold" : "Inter_400Regular",
                      marginTop: 6,
                    }}
                  >
                    {preset.label}
                  </Text>
                  {isSelected && (
                    <View
                      style={{
                        position: "absolute",
                        top: 6,
                        right: 6,
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        backgroundColor: "#4F46E5",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Check size={12} color="#FFFFFF" strokeWidth={2.5} />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>

          {/* Bottom Secondary Actions: Paste Link & Remove Photo */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: 8,
              borderTopWidth: 1,
              borderTopColor: isDark ? "#334155" : "#E2E8F0",
            }}
          >
            <Pressable
              onPress={() => setMode("url")}
              accessibilityRole="button"
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 8,
              }}
            >
              <Link2 size={16} color={isDark ? "#818CF8" : "#4F46E5"} strokeWidth={2} />
              <Text
                variant="label"
                style={{ color: isDark ? "#818CF8" : "#4F46E5", marginLeft: 6 }}
              >
                Paste image link
              </Text>
            </Pressable>

            {currentAvatarUrl ? (
              <Pressable
                onPress={() => {
                  onSelectAvatar(null);
                  handleClose();
                }}
                accessibilityRole="button"
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 8,
                }}
              >
                <Trash2 size={16} color={isDark ? "#F87171" : "#DC2626"} strokeWidth={2} />
                <Text
                  variant="label"
                  style={{ color: isDark ? "#F87171" : "#DC2626", marginLeft: 6 }}
                >
                  Use initials ({initials || "ST"})
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      )}
    </Sheet>
  );
}
