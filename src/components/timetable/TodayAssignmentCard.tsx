import React from "react";
import { View, Pressable, type ViewProps } from "react-native";
import { Clock, Users, User, AlertTriangle, Info } from "lucide-react-native";
import { Text } from "@/components/ui/Text";
import { useTheme } from "@/theme";

export interface TodayAssignmentCardProps extends ViewProps {
  courseCode: string;
  courseColor?: string;
  assignmentType?: "Solo" | "Group";
  title: string;
  dueText: string;
  dueTimeText: string;
  urgencyVariant?: "warning" | "danger" | "info";
  groupMeta?: string;
  onPress?: () => void;
  className?: string;
}

export function TodayAssignmentCard({
  courseCode,
  courseColor = "#0D9488",
  assignmentType = "Solo",
  title,
  dueText,
  dueTimeText,
  urgencyVariant = "warning",
  groupMeta,
  onPress,
  style,
  ...props
}: TodayAssignmentCardProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const badgeColors =
    urgencyVariant === "danger"
      ? {
          bg: isDark ? "#450A0A" : "#FEE2E2",
          fg: isDark ? "#FCA5A5" : "#B91C1C",
        }
      : urgencyVariant === "info"
        ? {
            bg: isDark ? "#1E1B4B" : "#EEF2FF",
            fg: isDark ? "#818CF8" : "#4338CA",
          }
        : {
            bg: isDark ? "#451A03" : "#FFFBEB",
            fg: isDark ? "#FBBF24" : "#92400E",
          };

  const CollaboratorIcon = assignmentType === "Group" ? Users : User;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={[
        {
          flexDirection: "row",
          overflow: "hidden",
          backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
          borderRadius: 14,
          borderWidth: 1,
          borderColor: isDark ? "#334155" : "#E2E8F0",
        },
        style,
      ]}
      {...props}
    >
      {/* 4px Left Course Stripe */}
      <View style={{ width: 4, alignSelf: "stretch", backgroundColor: courseColor }} />

      <View style={{ flex: 1, paddingVertical: 11, paddingHorizontal: 14, rowGap: 6 }}>
        {/* Row 1: Due Time + Urgency Pill */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Clock size={13} color={isDark ? "#94A3B8" : "#475569"} strokeWidth={2} />
            <Text
              variant="label"
              style={{
                marginLeft: 5,
                fontSize: 14,
                fontFamily: "Inter_600SemiBold",
                color: isDark ? "#F8FAFC" : "#0F172A",
              }}
            >
              {dueTimeText}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: badgeColors.bg,
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 9999,
            }}
          >
            {urgencyVariant === "danger" ? (
              <AlertTriangle size={12} color={badgeColors.fg} strokeWidth={2} />
            ) : urgencyVariant === "info" ? (
              <Info size={12} color={badgeColors.fg} strokeWidth={2} />
            ) : (
              <Clock size={12} color={badgeColors.fg} strokeWidth={2} />
            )}
            <Text variant="label-sm" style={{ marginLeft: 4, fontSize: 11, color: badgeColors.fg }}>
              {dueText}
            </Text>
          </View>
        </View>

        {/* Row 2: Course Pill + Assignment Title */}
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
            style={{
              flex: 1,
              fontSize: 14,
              lineHeight: 18,
              fontFamily: "Inter_500Medium",
              color: isDark ? "#E2E8F0" : "#1E293B",
            }}
            numberOfLines={1}
          >
            {title}
          </Text>
        </View>

        {/* Row 3: Solo / Group meta */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <CollaboratorIcon size={13} color={isDark ? "#94A3B8" : "#64748B"} strokeWidth={1.85} />
          <Text
            variant="caption"
            numberOfLines={1}
            style={{
              marginLeft: 5,
              fontSize: 12,
              color: isDark ? "#94A3B8" : "#64748B",
            }}
          >
            {groupMeta ? `${assignmentType} · ${groupMeta}` : `${assignmentType} assignment`}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
