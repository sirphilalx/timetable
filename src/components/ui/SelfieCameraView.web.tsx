import React from "react";
import { View, Pressable } from "react-native";
import { Camera } from "lucide-react-native";
import { Text } from "./Text";
import { pickPhotoFromLibrary } from "@/lib/photoPicker";

export interface SelfieCameraViewProps {
  onPhotoCaptured: (uri: string) => void;
  onCancel: () => void;
}

export function SelfieCameraView({ onPhotoCaptured, onCancel }: SelfieCameraViewProps) {
  return (
    <View
      style={{
        borderRadius: 20,
        backgroundColor: "#0F172A",
        padding: 24,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Camera size={40} color="#818CF8" strokeWidth={1.85} />
      <Text variant="title-card" style={{ color: "#FFFFFF", marginTop: 12, textAlign: "center" }}>
        Capture or upload a photo
      </Text>
      <Text
        variant="body"
        style={{
          color: "#94A3B8",
          marginTop: 6,
          marginBottom: 18,
          textAlign: "center",
        }}
      >
        Select an image from your device camera or photo library.
      </Text>
      <View style={{ flexDirection: "row", columnGap: 12 }}>
        <Pressable
          onPress={onCancel}
          accessibilityRole="button"
          style={{
            height: 44,
            paddingHorizontal: 18,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#334155",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text variant="label" style={{ color: "#CBD5E1" }}>
            Back
          </Text>
        </Pressable>
        <Pressable
          onPress={async () => {
            const res = await pickPhotoFromLibrary(true);
            if (res.ok && res.uri) {
              onPhotoCaptured(res.uri);
            }
          }}
          accessibilityRole="button"
          style={{
            height: 44,
            paddingHorizontal: 20,
            borderRadius: 12,
            backgroundColor: "#4F46E5",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text variant="label" style={{ color: "#FFFFFF" }}>
            Open Camera / Files
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
