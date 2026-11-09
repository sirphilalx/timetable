import React from "react";
import { View } from "react-native";
import { Text } from "./Text";
import { Button } from "./Button";
import { cn } from "@/lib/utils";
import { useTheme } from "@/theme";

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <View className={cn("items-center justify-center py-12 px-6 text-center", className)}>
      <View
        className="mb-4 h-16 w-16 items-center justify-center rounded-full shadow-sm"
        style={{
          backgroundColor: isDark ? "#1E293B" : "#F1F5F9",
          borderColor: isDark ? "#334155" : "#E2E8F0",
          borderWidth: 1,
        }}
      >
        {icon}
      </View>

      <Text
        variant="title-section"
        style={{
          color: isDark ? "#F8FAFC" : "#0F172A",
          textAlign: "center",
          marginBottom: 8,
        }}
      >
        {title}
      </Text>

      <Text
        variant="body"
        style={{
          color: isDark ? "#94A3B8" : "#64748B",
          textAlign: "center",
          maxWidth: 320,
          marginBottom: 24,
        }}
      >
        {description}
      </Text>

      {actionLabel && onAction ? (
        <Button variant="primary" size="default" onPress={onAction} className="px-6">
          {actionLabel}
        </Button>
      ) : null}
    </View>
  );
}
