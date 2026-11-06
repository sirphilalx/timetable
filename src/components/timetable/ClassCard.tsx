import React from "react";
import { View, Pressable, type ViewProps } from "react-native";
import { Clock, MapPin, User, AlertCircle } from "lucide-react-native";
import { Text } from "@/components/ui/Text";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export type ClassStatus = "upcoming" | "ongoing" | "ended" | "moved" | "cancelled";

export interface ClassCardProps extends ViewProps {
  courseCode: string;
  courseTitle: string;
  courseColor: string; // hex or course color token
  venue: string;
  time: string;
  lecturer?: string;
  status?: ClassStatus;
  isPast?: boolean;
  onPress?: () => void;
  className?: string;
}

const statusBadgeConfig: Record<
  ClassStatus,
  { label: string; variant: "success" | "warning" | "danger" | "info" | "neutral" }
> = {
  upcoming: { label: "Upcoming", variant: "info" },
  ongoing: { label: "Now", variant: "success" },
  ended: { label: "Ended", variant: "neutral" },
  moved: { label: "Relocated", variant: "warning" },
  cancelled: { label: "Cancelled", variant: "danger" },
};

export function ClassCard({
  courseCode,
  courseTitle,
  courseColor,
  venue,
  time,
  lecturer,
  status = "upcoming",
  isPast = false,
  onPress,
  className,
  style,
  ...props
}: ClassCardProps) {
  const isEndedOrPast = isPast || status === "ended";
  const badgeConfig = statusBadgeConfig[status];

  const cardContent = (
    <View
      className={cn(
        "flex-row rounded-2xl bg-white dark:bg-surface-cardDark border border-line-light dark:border-line-dark shadow-sm overflow-hidden",
        isEndedOrPast && "opacity-60",
        className,
      )}
      style={style}
      {...props}
    >
      {/* 4px Course Color Left Stripe */}
      <View style={{ backgroundColor: courseColor, width: 4 }} className="self-stretch" />

      <View className="flex-1 p-4">
        {/* Top Header: Course Code + Status Badge */}
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            <View
              style={{ backgroundColor: `${courseColor}18` }}
              className="px-2.5 py-0.5 rounded-md border border-slate-200/50 dark:border-slate-700/50 mr-2"
            >
              <Text variant="label-sm" style={{ color: courseColor }} className="font-bold">
                {courseCode}
              </Text>
            </View>
          </View>

          {badgeConfig && (
            <Badge
              variant={badgeConfig.variant}
              size="sm"
              label={badgeConfig.label}
              icon={
                status === "cancelled" || status === "moved" ? (
                  <AlertCircle size={12} color="#DC2626" />
                ) : undefined
              }
            />
          )}
        </View>

        {/* Course Title */}
        <Text
          variant="title-card"
          className="mb-2 text-slate-900 dark:text-white font-semibold"
          numberOfLines={2}
        >
          {courseTitle}
        </Text>

        {/* Time and Venue: Prominent 18px */}
        <View className="flex-row flex-wrap items-center gap-x-4 gap-y-1 mb-2">
          <View className="flex-row items-center">
            <Clock size={16} color="#64748B" />
            <Text variant="time" className="ml-1.5 text-slate-800 dark:text-slate-200">
              {time}
            </Text>
          </View>

          <View className="flex-row items-center">
            <MapPin size={16} color="#64748B" />
            <Text variant="time" className="ml-1.5 text-slate-800 dark:text-slate-200">
              {venue}
            </Text>
          </View>
        </View>

        {/* Optional Lecturer Info */}
        {lecturer ? (
          <View className="flex-row items-center pt-2 mt-1 border-t border-line-light/60 dark:border-line-dark/60">
            <User size={14} color="#94A3B8" />
            <Text variant="caption" className="ml-1.5 text-slate-500 dark:text-slate-400">
              {lecturer}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable accessibilityRole="button" onPress={onPress} className="active:opacity-85">
        {cardContent}
      </Pressable>
    );
  }

  return cardContent;
}
