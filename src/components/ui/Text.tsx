import React from "react";
import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from "react-native";
import { useTheme } from "@/theme";

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
  | "code"
  | "TT/H1"
  | "TT/H2"
  | "TT/H3"
  | "TT/Subhead"
  | "TT/Body"
  | "TT/Caption"
  | "TT/Button";

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
  "TT/H1": {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  "TT/H2": {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  "TT/H3": {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  "TT/Subhead": {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0,
  },
  "TT/Body": {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: 0,
  },
  "TT/Caption": {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0,
  },
  "TT/Button": {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0,
  },
};

type MutableTextStyle = {
  -readonly [K in keyof TextStyle]: TextStyle[K];
};

function resolveClassNameTextStyle(className: string | undefined, isDark: boolean): TextStyle {
  if (!className) return {};
  const tokens = className.trim().split(/\s+/);
  const resolved: MutableTextStyle = {};

  for (const token of tokens) {
    if (token.startsWith("dark:")) {
      if (!isDark) continue;
      const darkToken = token.slice(5);
      applyColorOrUtilityToken(darkToken, resolved, isDark, true);
    } else {
      applyColorOrUtilityToken(token, resolved, isDark, false);
    }
  }
  return resolved;
}

function applyColorOrUtilityToken(
  token: string,
  target: MutableTextStyle,
  isDark: boolean,
  fromDarkPrefix: boolean,
) {
  switch (token) {
    case "text-center":
      target.textAlign = "center";
      break;
    case "text-right":
      target.textAlign = "right";
      break;
    case "text-left":
      target.textAlign = "left";
      break;
    case "font-bold":
      target.fontFamily = "Inter_700Bold";
      break;
    case "font-semibold":
      target.fontFamily = "Inter_600SemiBold";
      break;
    case "font-medium":
      target.fontFamily = "Inter_500Medium";
      break;
    case "font-normal":
      target.fontFamily = "Inter_400Regular";
      break;
    case "uppercase":
      target.textTransform = "uppercase";
      break;
    case "flex-1":
      target.flex = 1;
      break;
    case "mb-0.5":
      target.marginBottom = 2;
      break;
    case "mb-1":
      target.marginBottom = 4;
      break;
    case "mb-1.5":
      target.marginBottom = 6;
      break;
    case "mb-2":
      target.marginBottom = 8;
      break;
    case "mb-3":
      target.marginBottom = 12;
      break;
    case "mb-4":
      target.marginBottom = 16;
      break;
    case "mb-6":
      target.marginBottom = 24;
      break;
    case "mt-0.5":
      target.marginTop = 2;
      break;
    case "mt-1":
      target.marginTop = 4;
      break;
    case "mt-1.5":
      target.marginTop = 6;
      break;
    case "mt-2":
      target.marginTop = 8;
      break;
    case "ml-2":
      target.marginLeft = 8;
      break;
    case "mr-2":
      target.marginRight = 8;
      break;
    case "max-w-xs":
      target.maxWidth = 320;
      break;
    case "text-[18px]":
      target.fontSize = 18;
      break;
    case "text-[22px]":
      target.fontSize = 22;
      break;
    case "text-white":
      target.color = "#FFFFFF";
      break;
    case "text-slate-900":
    case "text-slate-800":
      target.color = fromDarkPrefix ? "#0F172A" : isDark ? "#F8FAFC" : "#0F172A";
      break;
    case "text-slate-700":
    case "text-slate-600":
      target.color = fromDarkPrefix ? "#334155" : isDark ? "#CBD5E1" : "#334155";
      break;
    case "text-slate-500":
    case "text-slate-400":
      target.color = fromDarkPrefix ? "#94A3B8" : isDark ? "#94A3B8" : "#64748B";
      break;
    case "text-slate-300":
    case "text-slate-200":
    case "text-slate-100":
      target.color = "#F1F5F9";
      break;
    case "text-primary":
      target.color = isDark ? "#818CF8" : "#4F46E5";
      break;
    case "text-primary-dark":
      target.color = "#818CF8";
      break;
    case "text-status-success":
      target.color = isDark ? "#4ADE80" : "#15803D";
      break;
    case "text-status-successDark":
      target.color = "#4ADE80";
      break;
    case "text-status-warning":
      target.color = isDark ? "#FBBF24" : "#B45309";
      break;
    case "text-status-warningDark":
      target.color = "#FBBF24";
      break;
    case "text-status-danger":
      target.color = isDark ? "#F87171" : "#DC2626";
      break;
    case "text-status-dangerDark":
      target.color = "#F87171";
      break;
    case "text-status-info":
      target.color = isDark ? "#60A5FA" : "#1D4ED8";
      break;
    case "text-status-infoDark":
      target.color = "#60A5FA";
      break;
    case "text-amber-900":
      target.color = isDark ? "#FDE68A" : "#78350F";
      break;
    case "text-amber-200":
      target.color = "#FDE68A";
      break;
    default:
      break;
  }
}

export function Text({
  variant = "body",
  className,
  style,
  maxFontSizeMultiplier = 2.0,
  ...props
}: TextProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const baseStyle = variantStyles[variant];
  const classNameStyle = resolveClassNameTextStyle(className, isDark);

  return (
    <RNText
      {...({ cssInterop: false } as any)}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      style={[baseStyle, { color: isDark ? "#F8FAFC" : "#0F172A" }, classNameStyle, style]}
      {...props}
    />
  );
}
