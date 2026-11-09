import React from "react";
import { Modal, View, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import { Text } from "./Text";
import { Button } from "./Button";
import { useTheme } from "@/theme";

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  confirmText: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  onConfirm: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
}

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  confirmText,
  cancelText = "Cancel",
  variant = "default",
  onConfirm,
  onCancel,
  isLoading = false,
}: DialogProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  };

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <Pressable
          onPress={onClose}
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(15, 23, 42, 0.5)",
            paddingHorizontal: 24,
          }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 380,
              borderRadius: 20,
              backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
              padding: 24,
              borderWidth: 1,
              borderColor: isDark ? "#334155" : "#E2E8F0",
              shadowColor: "#0F172A",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.2,
              shadowRadius: 20,
              elevation: 10,
            }}
          >
            <Text
              variant="title-section"
              style={{
                color: isDark ? "#F8FAFC" : "#0F172A",
                marginBottom: 8,
              }}
            >
              {title}
            </Text>

            <Text
              variant="body"
              style={{
                color: isDark ? "#CBD5E1" : "#475569",
                marginBottom: 24,
              }}
            >
              {description}
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 10,
              }}
            >
              {cancelText ? (
                <View style={{ flex: 1 }}>
                  <Button
                    variant="subtle"
                    size="default"
                    onPress={handleCancel}
                    disabled={isLoading}
                  >
                    {cancelText}
                  </Button>
                </View>
              ) : null}

              <View style={{ flex: 1 }}>
                <Button
                  variant={variant === "destructive" ? "destructive" : "primary"}
                  size="default"
                  isLoading={isLoading}
                  onPress={onConfirm}
                >
                  {confirmText}
                </Button>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
