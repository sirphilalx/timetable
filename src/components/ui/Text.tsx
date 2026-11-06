import React from "react";
import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from "react-native";
import { cn } from "@/lib/utils";

export type TextVariant =
  | "display"
  | "title-page"
  | "title-section"
  | "title-card"
  | "time"
  | "body-lg"
  | "body"
  | "label-lg"
  | "label"
  | "label-sm"
  | "caption"
  | "code";

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  className?: string;
}

const variantStyles: Record<TextVariant, TextStyle> = {
  display: {
    fontFamily: "Inter_700Bold",
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.6,
  },
  "title-page": {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.4,
  },
  "title-section": {
    fontFamily: "Inter_600SemiBold",
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: -0.2,
  },
  "title-card": {
    fontFamily: "Inter_600SemiBold",
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: -0.1,
  },
  time: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0,
    fontVariant: ["tabular-nums"],
  },
  "body-lg": {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
  },
  body: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
  },
  "label-lg": {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0,
  },
  label: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
  },
  "label-sm": {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.2,
  },
  caption: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0,
  },
  code: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: 4.0,
    fontVariant: ["tabular-nums"],
  },
};

export function Text({
  variant = "body",
  className,
  style,
  maxFontSizeMultiplier = 2.0,
  ...props
}: TextProps) {
  const baseStyle = variantStyles[variant];

  return (
    <RNText
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      className={cn("text-slate-900 dark:text-slate-100", className)}
      style={[baseStyle, style]}
      {...props}
    />
  );
}
