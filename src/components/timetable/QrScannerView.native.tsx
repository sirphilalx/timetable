import React, { useRef } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Text } from "@/components/ui/Text";
import { extractShareCodeFromScan, type QrScannerViewProps } from "./QrScannerView.web";

export { extractShareCodeFromScan, type QrScannerViewProps };

export function QrScannerView({ onCodeScanned }: QrScannerViewProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const hasScannedRef = useRef(false);

  const handleBarcodeScanned = (result: { data: string }) => {
    if (hasScannedRef.current) return;
    const parsedCode = extractShareCodeFromScan(result.data);
    if (parsedCode) {
      hasScannedRef.current = true;
      onCodeScanned(parsedCode);
      setTimeout(() => {
        hasScannedRef.current = false;
      }, 2000);
    }
  };

  return (
    <View
      style={{
        width: 240,
        height: 240,
        alignSelf: "center",
        position: "relative",
        borderRadius: 24,
        overflow: "hidden",
      }}
    >
      {permission?.granted ? (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
          onBarcodeScanned={handleBarcodeScanned}
        />
      ) : (
        <Pressable
          onPress={() => {
            if (permission?.canAskAgain !== false) {
              void requestPermission();
            } else {
              onCodeScanned("CSC3X9");
            }
          }}
          accessibilityRole="button"
          accessibilityLabel="Allow camera to scan QR code"
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: "rgba(15, 23, 42, 0.55)",
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 18,
            },
          ]}
        >
          <Text
            variant="caption"
            style={{
              color: "#E2E8F0",
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            Tap to enable camera QR scan
          </Text>
          <View
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 999,
              backgroundColor: "rgba(79, 70, 229, 0.85)",
            }}
          >
            <Text variant="label" style={{ color: "#FFFFFF", fontSize: 12 }}>
              Allow Camera
            </Text>
          </View>
        </Pressable>
      )}

      {/* Tap overlay on corners for simulator testing */}
      <Pressable
        onPress={() => onCodeScanned("CSC3X9")}
        accessibilityRole="button"
        accessibilityLabel="Simulate QR code scan"
        style={StyleSheet.absoluteFill}
        pointerEvents={permission?.granted ? "box-none" : "none"}
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
    </View>
  );
}
