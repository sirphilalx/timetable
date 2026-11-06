import React from "react";
import { View, Pressable, type ViewProps } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

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
  const cardClassName = cn(cardVariants({ variant }), className);

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        className={cn(cardClassName, "active:opacity-85")}
        style={style}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View className={cardClassName} style={style} {...props}>
      {children}
    </View>
  );
}
