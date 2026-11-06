import React from "react";
import {
  Modal,
  View,
  Pressable,
  TouchableWithoutFeedback,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import { Text } from "./Text";
import { cn } from "@/lib/utils";

export interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Sheet({ isOpen, onClose, title, children, className }: SheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <View className="flex-1 justify-end bg-black/60">
          {/* Backdrop dismiss */}
          <TouchableWithoutFeedback onPress={onClose}>
            <View className="flex-1" />
          </TouchableWithoutFeedback>

          {/* Bottom Sheet Content */}
          <View
            className={cn(
              "w-full max-h-[90%] rounded-t-[24px] bg-white dark:bg-surface-cardDark shadow-xl border-t border-line-light dark:border-line-dark",
              className,
            )}
            style={{ paddingBottom: Math.max(insets.bottom, 20) }}
          >
            {/* Drag Handle */}
            <View className="items-center pt-3 pb-2">
              <View className="h-1.5 w-12 rounded-full bg-slate-300 dark:bg-slate-700" />
            </View>

            {/* Header if title provided */}
            {title ? (
              <View className="flex-row items-center justify-between px-5 py-3 border-b border-line-light dark:border-line-dark">
                <Text
                  variant="title-section"
                  className="font-semibold text-slate-900 dark:text-white"
                >
                  {title}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Close sheet"
                  onPress={onClose}
                  className="min-w-[44px] min-h-[44px] items-center justify-center rounded-full active:bg-slate-100 dark:active:bg-slate-800"
                >
                  <X size={20} color="#64748B" />
                </Pressable>
              </View>
            ) : null}

            <ScrollView
              contentContainerStyle={{ padding: 20 }}
              bounces={false}
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
