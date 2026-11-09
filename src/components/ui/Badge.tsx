import React from "react";
import { View, type ViewProps } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { Text } from "./Text";
import { cn } from "@/lib/utils";
import { useTheme } from "@/theme";

const badgeVariants = cva("flex-row items-center self-start rounded-full px-2.5 py-1", {
  variants: {
    variant: {
      success:
        "bg-status-successSubtle dark:bg-status-successSubtleDark border border-green-200 dark:border-green-900/40",
      warning:
        "bg-status-warningSubtle dark:bg-status-warningSubtleDark border border-amber-200 dark:border-amber-900/40",
      danger:
        "bg-status-dangerSubtle dark:bg-status-dangerSubtleDark border border-red-200 dark:border-red-900/40",
      info: "bg-status-infoSubtle dark:bg-status-infoSubtleDark border border-blue-200 dark:border-blue-900/40",
      neutral: "bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700",
    },
    size: {
      default: "px-2.5 py-1",
      sm: "px-2 py-0.5",
    },
  },
  defaultVariants: {
    variant: "neutral",
    size: "default",
  },
});

const textVariants = cva("font-semibold", {
  variants: {
    variant: {
      success: "text-status-success dark:text-status-successDark",
      warning: "text-status-warning dark:text-status-warningDark",
      danger: "text-status-danger dark:text-status-dangerDark",
      info: "text-status-info dark:text-status-infoDark",
      neutral: "text-slate-700 dark:text-slate-300",
    },
    size: {
      default: "label-sm",
      sm: "caption",
    },
  },
  defaultVariants: {
    variant: "neutral",
    size: "default",
  },
});

export interface BadgeProps extends ViewProps, VariantProps<typeof badgeVariants> {
  label: string;
  icon?: React.ReactNode;
  className?: string;
  textClassName?: string;
}

export function Badge({
  label,
  icon,
  variant = "neutral",
  size = "default",
  className,
  textClassName,
  style,
  ...props
}: BadgeProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const typographyVariant = size === "sm" ? "caption" : "label-sm";

  const surfaceColors = {
    success: {
      bg: isDark ? "#052E16" : "#DCFCE7",
      border: isDark ? "#14532D" : "#BBF7D0",
      text: isDark ? "#4ADE80" : "#15803D",
    },
    warning: {
      bg: isDark ? "#451A03" : "#FEF3C7",
      border: isDark ? "#78350F" : "#FDE68A",
      text: isDark ? "#FBBF24" : "#B45309",
    },
    danger: {
      bg: isDark ? "#450A0A" : "#FEE2E2",
      border: isDark ? "#7F1D1D" : "#FECACA",
      text: isDark ? "#F87171" : "#DC2626",
    },
    info: {
      bg: isDark ? "#172554" : "#DBEAFE",
      border: isDark ? "#1E3A8A" : "#BFDBFE",
      text: isDark ? "#60A5FA" : "#1D4ED8",
    },
    neutral: {
      bg: isDark ? "#1E293B" : "#F1F5F9",
      border: isDark ? "#334155" : "#E2E8F0",
      text: isDark ? "#CBD5E1" : "#334155",
    },
  }[variant ?? "neutral"];

  return (
    <View
      className={cn(badgeVariants({ variant, size }), className)}
      style={[
        {
          backgroundColor: surfaceColors.bg,
          borderColor: surfaceColors.border,
          borderWidth: 1,
        },
        style,
      ]}
      {...props}
    >
      {icon && <View className="mr-1.5">{icon}</View>}
      <Text
        variant={typographyVariant}
        className={cn(textVariants({ variant, size }), textClassName)}
        style={{ color: surfaceColors.text }}
      >
        {label}
      </Text>
    </View>
  );
}
