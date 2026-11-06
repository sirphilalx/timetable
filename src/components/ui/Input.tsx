import React, { useState } from "react";
import { View, TextInput, type TextInputProps, Pressable } from "react-native";
import { Text } from "./Text";
import { cn } from "@/lib/utils";

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
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const hasError = Boolean(error);

  return (
    <View className={cn("w-full mb-4", containerClassName)}>
      <Text
        variant="label"
        className={cn(
          "mb-1.5 font-medium",
          hasError
            ? "text-status-danger dark:text-status-dangerDark"
            : isFocused
              ? "text-primary dark:text-primary-dark"
              : "text-slate-700 dark:text-slate-300",
        )}
      >
        {label}
      </Text>

      <View
        className={cn(
          "flex-row items-center w-full min-h-[48px] px-3.5 py-2.5 rounded-xl border bg-white dark:bg-surface-cardDark",
          hasError
            ? "border-status-danger dark:border-status-dangerDark"
            : isFocused
              ? "border-primary dark:border-primary-dark shadow-sm"
              : "border-line-light dark:border-line-dark",
        )}
      >
        {leftIcon && <View className="mr-2.5">{leftIcon}</View>}

        <TextInput
          accessibilityLabel={label}
          maxFontSizeMultiplier={2.0}
          placeholderTextColor="#94A3B8"
          className={cn("flex-1 text-base text-slate-900 dark:text-white py-1", className)}
          style={{ fontFamily: "Inter_400Regular" }}
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
          className="mt-1 text-status-danger dark:text-status-dangerDark font-medium"
        >
          {error}
        </Text>
      ) : helperText ? (
        <Text variant="caption" className="mt-1 text-slate-500 dark:text-slate-400">
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}
