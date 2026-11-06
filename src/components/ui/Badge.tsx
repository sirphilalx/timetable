import React from "react";
import { View, type ViewProps } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { Text } from "./Text";
import { cn } from "@/lib/utils";

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
  ...props
}: BadgeProps) {
  const typographyVariant = size === "sm" ? "caption" : "label-sm";

  return (
    <View className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {icon && <View className="mr-1.5">{icon}</View>}
      <Text
        variant={typographyVariant}
        className={cn(textVariants({ variant, size }), textClassName)}
      >
        {label}
      </Text>
    </View>
  );
}
