import React from "react";
import { Check, X, Clock, Slash } from "lucide-react-native";
import { Badge, type BadgeProps } from "@/components/ui/Badge";
import { useTheme } from "@/theme";

export type AttendanceStatus = "attended" | "missed" | "pending" | "cancelled";

export interface AttendancePillProps {
  status: AttendanceStatus;
  size?: "default" | "sm";
  className?: string;
}

export function AttendancePill({ status, size = "default", className }: AttendancePillProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const iconSize = size === "sm" ? 12 : 14;

  const config: Record<
    AttendanceStatus,
    {
      label: string;
      variant: BadgeProps["variant"];
      icon: React.ReactNode;
    }
  > = {
    attended: {
      label: "Attended",
      variant: "success",
      icon: <Check size={iconSize} color={isDark ? "#4ADE80" : "#16A34A"} strokeWidth={2.5} />,
    },
    missed: {
      label: "Missed",
      variant: "danger",
      icon: <X size={iconSize} color={isDark ? "#F87171" : "#DC2626"} strokeWidth={2.5} />,
    },
    pending: {
      label: "Pending check in",
      variant: "warning",
      icon: <Clock size={iconSize} color={isDark ? "#FBBF24" : "#D97706"} strokeWidth={2.5} />,
    },
    cancelled: {
      label: "Class cancelled",
      variant: "neutral",
      icon: <Slash size={iconSize} color={isDark ? "#94A3B8" : "#64748B"} strokeWidth={2.5} />,
    },
  };

  const item = config[status];

  return (
    <Badge
      label={item.label}
      icon={item.icon}
      variant={item.variant}
      size={size}
      className={className}
    />
  );
}
