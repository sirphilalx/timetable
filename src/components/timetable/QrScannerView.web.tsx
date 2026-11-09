import React from "react";
import { View, Pressable } from "react-native";

export interface QrScannerViewProps {
  onCodeScanned: (shareCode: string) => void;
}

export function extractShareCodeFromScan(rawData: string): string | null {
  const trimmed = rawData.trim();
  if (!trimmed) return null;

  // Match /join/CODE in URLs or deep links
  const joinMatch = trimmed.match(/\/join\/([A-Za-z0-9]{4,8})/i);
  if (joinMatch?.[1]) {
    return joinMatch[1].toUpperCase().slice(0, 6);
  }

  // Match standalone 6-char alphanumeric code
  const cleanAlnum = trimmed.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  if (cleanAlnum.length === 6) {
    return cleanAlnum;
  }

  return null;
}

export function QrScannerView({ onCodeScanned }: QrScannerViewProps) {
  return (
    <Pressable
      onPress={() => onCodeScanned("CSC3X9")}
      accessibilityRole="button"
      accessibilityLabel="Simulate QR code scan"
      style={{
        width: 240,
        height: 240,
        alignSelf: "center",
        position: "relative",
      }}
    >
      {/* Top-Left Corner */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 48,
          height: 48,
          borderTopWidth: 4,
          borderLeftWidth: 4,
          borderColor: "#FFFFFF",
          borderTopLeftRadius: 24,
        }}
      />
      {/* Top-Right Corner */}
      <View
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 48,
          height: 48,
          borderTopWidth: 4,
          borderRightWidth: 4,
          borderColor: "#FFFFFF",
          borderTopRightRadius: 24,
        }}
      />
      {/* Bottom-Left Corner */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: 48,
          height: 48,
          borderBottomWidth: 4,
          borderLeftWidth: 4,
          borderColor: "#FFFFFF",
          borderBottomLeftRadius: 24,
        }}
      />
      {/* Bottom-Right Corner */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: 48,
          height: 48,
          borderBottomWidth: 4,
          borderRightWidth: 4,
          borderColor: "#FFFFFF",
          borderBottomRightRadius: 24,
        }}
      />
    </Pressable>
  );
}
