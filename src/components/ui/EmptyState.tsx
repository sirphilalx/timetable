import React from "react";
import { View } from "react-native";
import { Text } from "./Text";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

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
  return (
    <View className={cn("items-center justify-center py-12 px-6 text-center", className)}>
      <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 border border-line-light dark:border-line-dark shadow-sm">
        {icon}
      </View>

      <Text variant="title-section" className="mb-2 text-center text-slate-900 dark:text-white">
        {title}
      </Text>

      <Text variant="body" className="mb-6 max-w-xs text-center text-slate-500 dark:text-slate-400">
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
