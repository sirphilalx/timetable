import React from "react";
import { Pressable, type PressableProps, ActivityIndicator, View, Platform } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { Text } from "./Text";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "flex-row items-center justify-center min-w-[44px] min-h-[44px] active:opacity-80",
  {
    variants: {
      variant: {
        primary: "bg-primary dark:bg-primary-dark rounded-xl shadow-sm",
        secondary:
          "bg-white dark:bg-surface-cardDark border border-line-light dark:border-line-dark rounded-xl shadow-sm",
        subtle: "bg-transparent rounded-xl",
        destructive: "bg-status-danger dark:bg-status-dangerDark rounded-xl shadow-sm",
      },
      size: {
        default: "min-h-[48px] px-5 py-3",
        sm: "min-h-[40px] px-3.5 py-2 rounded-lg",
      },
      disabled: {
        true: "opacity-50",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      disabled: false,
    },
  },
);

const textVariants = cva("text-center", {
  variants: {
    variant: {
      primary: "text-white dark:text-slate-900",
      secondary: "text-slate-800 dark:text-slate-100",
      subtle: "text-slate-700 dark:text-slate-300",
      destructive: "text-white",
    },
    size: {
      default: "label-lg",
      sm: "label",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "default",
  },
});

export interface ButtonProps
  extends Omit<PressableProps, "disabled">, VariantProps<typeof buttonVariants> {
  children?: React.ReactNode;
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  className?: string;
  textClassName?: string;
}

export function Button({
  children,
  variant = "primary",
  size = "default",
  disabled = false,
  isLoading = false,
  icon,
  iconPosition = "left",
  className,
  textClassName,
  ...props
}: ButtonProps) {
  const isInteractiveDisabled = Boolean(disabled || isLoading);
  const typographyVariant = size === "sm" ? "label" : "label-lg";

  const contentColor =
    variant === "primary" ? "#FFFFFF" : variant === "destructive" ? "#FFFFFF" : "#4F46E5";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isInteractiveDisabled, busy: isLoading }}
      disabled={isInteractiveDisabled}
      android_ripple={
        Platform.OS === "android"
          ? {
              color: "rgba(0, 0, 0, 0.12)",
              borderless: false,
            }
          : undefined
      }
      className={cn(buttonVariants({ variant, size, disabled: isInteractiveDisabled }), className)}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={contentColor} size="small" />
      ) : (
        <View className="flex-row items-center justify-center">
          {icon && iconPosition === "left" && <View className="mr-2">{icon}</View>}
          {typeof children === "string" ? (
            <Text
              variant={typographyVariant}
              className={cn(textVariants({ variant, size }), textClassName)}
            >
              {children}
            </Text>
          ) : (
            children
          )}
          {icon && iconPosition === "right" && <View className="ml-2">{icon}</View>}
        </View>
      )}
    </Pressable>
  );
}
