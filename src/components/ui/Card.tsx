import React from "react";
import { View, Pressable, type ViewProps } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { useTheme } from "@/theme";

const cardVariants = cva(
  "rounded-2xl border border-line-light dark:border-line-dark overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-white dark:bg-surface-cardDark shadow-sm",
        raised: "bg-white dark:bg-surface-raisedDark shadow-md",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface CardProps extends ViewProps, VariantProps<typeof cardVariants> {
  onPress?: () => void;
  className?: string;
  children: React.ReactNode;
}

export function Card({
  variant = "default",
  onPress,
  className,
  children,
  style,
  ...props
}: CardProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const cardClassName = cn(cardVariants({ variant }), className);
  const surfaceStyle = {
    backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
    borderColor: isDark ? "#334155" : "#E2E8F0",
    borderWidth: 1,
    borderRadius: 16,
  };

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        className={cn(cardClassName, "active:opacity-85")}
        style={[surfaceStyle, style]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View className={cardClassName} style={[surfaceStyle, style]} {...props}>
      {children}
    </View>
  );
}
