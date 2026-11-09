import React from "react";
import { View, Pressable, type ViewProps } from "react-native";
import { MapPin, AlertCircle, Check, CornerUpRight } from "lucide-react-native";
import { Text } from "@/components/ui/Text";
import { Badge } from "@/components/ui/Badge";
import { useTheme } from "@/theme";

export type ClassStatus = "upcoming" | "ongoing" | "ended" | "moved" | "cancelled" | "attended";

export interface ClassCardProps extends ViewProps {
  courseCode: string;
  courseTitle: string;
  courseColor: string;
  venue: string;
  time: string;
  lecturer?: string;
  status?: ClassStatus;
  isPast?: boolean;
  attended?: boolean;
  moved?: boolean;
  sourceAttribution?: string;
  onPress?: () => void;
  className?: string;
}

export function ClassCard({
  courseCode,
  courseTitle,
  courseColor,
  venue,
  time,
  status = "upcoming",
  isPast = false,
  attended = false,
  moved = false,
  onPress,
  style,
  ...props
}: ClassCardProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const isAttended = attended || status === "attended";
  const isMoved = moved || status === "moved";
  const isEndedOrPast = isPast || status === "ended";

  const cardContent = (
    <View
      style={[
        {
          flexDirection: "row",
          overflow: "hidden",
          backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
          borderRadius: 14,
          borderWidth: 1,
          borderColor: isDark ? "#334155" : "#E2E8F0",
          opacity: isEndedOrPast ? 0.65 : 1,
        },
        style,
      ]}
      {...props}
    >
      {/* 4px Course Color Left Stripe */}
      <View style={{ width: 4, alignSelf: "stretch", backgroundColor: courseColor }} />

      <View
        style={{
          flex: 1,
          paddingVertical: 11,
          paddingHorizontal: 14,
          rowGap: 6,
        }}
      >
        {/* Hierarchy 1 (Top): Time + Optional Status Pill */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text
            variant="time"
            style={{
              fontSize: 16,
              lineHeight: 20,
              fontFamily: "Inter_700Bold",
              fontVariant: ["tabular-nums"],
              color: isDark ? "#F8FAFC" : "#0F172A",
              textDecorationLine: status === "cancelled" ? "line-through" : "none",
            }}
          >
            {time}
          </Text>

          {isAttended ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: isDark ? "#052E16" : "#ECFDF5",
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 9999,
              }}
            >
              <Check size={12} color={isDark ? "#4ADE80" : "#15803D"} strokeWidth={2.2} />
              <Text
                variant="label-sm"
                style={{
                  color: isDark ? "#4ADE80" : "#15803D",
                  marginLeft: 4,
                  fontSize: 11,
                }}
              >
                Attended
              </Text>
            </View>
          ) : isMoved ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: isDark ? "#451A03" : "#FFFBEB",
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 9999,
              }}
            >
              <CornerUpRight size={12} color={isDark ? "#FBBF24" : "#92400E"} strokeWidth={2.2} />
              <Text
                variant="label-sm"
                style={{
                  color: isDark ? "#FBBF24" : "#92400E",
                  marginLeft: 4,
                  fontSize: 11,
                }}
              >
                Moved
              </Text>
            </View>
          ) : status === "cancelled" ? (
            <Badge
              variant="danger"
              size="sm"
              label="Cancelled"
              icon={<AlertCircle size={12} color="#DC2626" />}
            />
          ) : status === "ongoing" ? (
            <Badge variant="success" size="sm" label="Now" />
          ) : null}
        </View>

        {/* Hierarchy 2 (Middle): Course Code Pill + Course Title */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            columnGap: 8,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: isDark ? "#334155" : "#F1F5F9",
              paddingHorizontal: 7,
              paddingVertical: 3,
              borderRadius: 6,
            }}
          >
            <View
              style={{
                width: 7,
                height: 7,
                borderRadius: 3.5,
                backgroundColor: courseColor,
                marginRight: 5,
              }}
            />
            <Text
              variant="label-sm"
              style={{
                fontSize: 12,
                lineHeight: 16,
                fontFamily: "Inter_600SemiBold",
                color: isDark ? "#F8FAFC" : "#0F172A",
              }}
            >
              {courseCode}
            </Text>
          </View>

          <Text
            variant="body"
            numberOfLines={1}
            style={{
              flex: 1,
              fontSize: 14,
              lineHeight: 18,
              fontFamily: "Inter_500Medium",
              color: isDark ? "#E2E8F0" : "#1E293B",
            }}
          >
            {courseTitle}
          </Text>
        </View>

        {/* Hierarchy 3 (Bottom): Venue Icon + Venue Name on the same line */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <MapPin
            size={14}
            color={isMoved ? (isDark ? "#FBBF24" : "#92400E") : isDark ? "#94A3B8" : "#64748B"}
            strokeWidth={1.85}
          />
          <Text
            variant="caption"
            numberOfLines={1}
            style={{
              marginLeft: 5,
              flex: 1,
              fontSize: 13,
              lineHeight: 17,
              fontFamily: "Inter_400Regular",
              color: isMoved ? (isDark ? "#FBBF24" : "#92400E") : isDark ? "#94A3B8" : "#64748B",
            }}
          >
            {venue}
          </Text>
        </View>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable accessibilityRole="button" onPress={onPress}>
        {cardContent}
      </Pressable>
    );
  }

  return cardContent;
}
