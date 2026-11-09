import React, { useRef, useState } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { RefreshCw, Camera } from "lucide-react-native";
import { Text } from "./Text";
import { STUDENT_AVATAR_PRESETS } from "@/lib/photoPicker";
import type { SelfieCameraViewProps } from "./SelfieCameraView.web";

export type { SelfieCameraViewProps };

export function SelfieCameraView({ onPhotoCaptured, onCancel }: SelfieCameraViewProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<"front" | "back">("front");
  const [isCapturing, setIsCapturing] = useState(false);
  const cameraRef = useRef<CameraView | null>(null);

  const handleShutter = async () => {
    if (isCapturing) return;
    setIsCapturing(true);
    try {
      if (cameraRef.current && permission?.granted) {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.75,
        });
        if (photo?.uri) {
          onPhotoCaptured(photo.uri);
          return;
        }
      }
      // Simulator fallback when hardware camera stream is unavailable
      onPhotoCaptured(STUDENT_AVATAR_PRESETS[0]?.id ?? "avatar:student-1");
    } catch {
      onPhotoCaptured(STUDENT_AVATAR_PRESETS[0]?.id ?? "avatar:student-1");
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <View style={{ alignItems: "center" }}>
      <View
        style={{
          width: 220,
          height: 220,
          borderRadius: 110,
          overflow: "hidden",
          backgroundColor: "#0F172A",
          borderWidth: 3,
          borderColor: "#4F46E5",
          marginBottom: 16,
          position: "relative",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {permission?.granted ? (
          <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={facing} />
        ) : (
          <Pressable
            onPress={() => {
              if (permission?.canAskAgain !== false) {
                void requestPermission();
              } else {
                onPhotoCaptured(STUDENT_AVATAR_PRESETS[0]?.id ?? "avatar:student-1");
              }
            }}
            accessibilityRole="button"
            style={[
              StyleSheet.absoluteFill,
              {
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 20,
              },
            ]}
          >
            <Camera size={32} color="#818CF8" strokeWidth={1.85} />
            <Text
              variant="caption"
              style={{ color: "#E2E8F0", textAlign: "center", marginTop: 8, marginBottom: 10 }}
            >
              Allow camera access to take a profile photo
            </Text>
            <View
              style={{
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 999,
                backgroundColor: "#4F46E5",
              }}
            >
              <Text variant="label" style={{ color: "#FFFFFF", fontSize: 12 }}>
                Enable Camera
              </Text>
            </View>
          </Pressable>
        )}
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", columnGap: 14 }}>
        <Pressable
          onPress={onCancel}
          accessibilityRole="button"
          style={{
            height: 44,
            paddingHorizontal: 16,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#CBD5E1",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text variant="label" style={{ color: "#475569" }}>
            Cancel
          </Text>
        </Pressable>

        <Pressable
          onPress={() => {
            void handleShutter();
          }}
          accessibilityRole="button"
          accessibilityLabel="Take photo"
          style={{
            height: 48,
            paddingHorizontal: 22,
            borderRadius: 24,
            backgroundColor: "#4F46E5",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Camera size={18} color="#FFFFFF" strokeWidth={2.2} />
          <Text variant="label-lg" style={{ color: "#FFFFFF", marginLeft: 8 }}>
            {isCapturing ? "Saving..." : "Snap photo"}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setFacing((prev) => (prev === "front" ? "back" : "front"))}
          accessibilityRole="button"
          accessibilityLabel="Flip camera"
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            borderWidth: 1,
            borderColor: "#CBD5E1",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <RefreshCw size={18} color="#475569" strokeWidth={2} />
        </Pressable>
      </View>
    </View>
  );
}
