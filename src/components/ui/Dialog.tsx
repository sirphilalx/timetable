import React from "react";
import {
  Modal,
  View,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Text } from "./Text";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

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
  className,
}: DialogProps) {
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
        className="flex-1"
      >
        <View className="flex-1 items-center justify-center bg-black/60 px-6">
          {/* Backdrop dismiss */}
          <TouchableWithoutFeedback onPress={onClose}>
            <View className="absolute inset-0" />
          </TouchableWithoutFeedback>

          {/* Dialog Container */}
          <View
            className={cn(
              "w-full max-w-sm rounded-2xl bg-white dark:bg-surface-cardDark p-6 shadow-2xl border border-line-light dark:border-line-dark",
              className,
            )}
          >
            <Text variant="title-section" className="mb-2 text-slate-900 dark:text-white">
              {title}
            </Text>

            <Text variant="body" className="mb-6 text-slate-600 dark:text-slate-300">
              {description}
            </Text>

            <View className="flex-row items-center justify-end space-x-3">
              {cancelText ? (
                <Button
                  variant="subtle"
                  size="default"
                  onPress={handleCancel}
                  disabled={isLoading}
                  className="flex-1 mr-2"
                >
                  {cancelText}
                </Button>
              ) : null}

              <Button
                variant={variant === "destructive" ? "destructive" : "primary"}
                size="default"
                isLoading={isLoading}
                onPress={onConfirm}
                className="flex-1"
              >
                {confirmText}
              </Button>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
