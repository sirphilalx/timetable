import React, { useState } from "react";
import { View, TextInput, type TextInputProps, Pressable } from "react-native";
import { Text } from "./Text";
import { cn } from "@/lib/utils";
import { useTheme } from "@/theme";

export interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerClassName?: string;
}

export function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerClassName,
  className,
  onFocus,
  onBlur,
  style,
  ...props
}: InputProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [isFocused, setIsFocused] = useState(false);

  const hasError = Boolean(error);

  const labelColor = hasError
    ? isDark
      ? "#F87171"
      : "#DC2626"
    : isFocused
      ? isDark
        ? "#818CF8"
        : "#4F46E5"
      : isDark
        ? "#CBD5E1"
        : "#334155";

  const borderColor = hasError
    ? isDark
      ? "#F87171"
      : "#DC2626"
    : isFocused
      ? isDark
        ? "#818CF8"
        : "#4F46E5"
      : isDark
        ? "#334155"
        : "#CBD5E1";

  return (
    <View className={cn("w-full mb-4", containerClassName)}>
      <Text variant="label" style={{ color: labelColor, marginBottom: 6 }}>
        {label}
      </Text>

      <View
        className="flex-row items-center w-full min-h-[48px] px-3.5 py-2.5 rounded-xl border"
        style={{
          backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
          borderColor,
          borderWidth: 1,
          borderRadius: 12,
        }}
      >
        {leftIcon && <View className="mr-2.5">{leftIcon}</View>}

        <TextInput
          accessibilityLabel={label}
          maxFontSizeMultiplier={2.0}
          placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
          className={cn("flex-1 text-base py-1", className)}
          style={[
            {
              fontFamily: "Inter_400Regular",
              color: isDark ? "#F8FAFC" : "#0F172A",
              flex: 1,
            },
            style,
          ]}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...props}
        />

        {rightIcon && (
          <Pressable
            disabled={!onRightIconPress}
            onPress={onRightIconPress}
            accessibilityRole={onRightIconPress ? "button" : undefined}
            className="ml-2.5 min-w-[32px] min-h-[32px] items-center justify-center"
          >
            {rightIcon}
          </Pressable>
        )}
      </View>

      {hasError ? (
        <Text
          variant="caption"
          style={{
            color: isDark ? "#F87171" : "#DC2626",
            marginTop: 4,
            fontFamily: "Inter_500Medium",
          }}
        >
          {error}
        </Text>
      ) : helperText ? (
        <Text
          variant="caption"
          style={{
            color: isDark ? "#94A3B8" : "#64748B",
            marginTop: 4,
          }}
        >
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}
