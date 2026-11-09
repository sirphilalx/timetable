import React, { useState } from "react";
import { View, Pressable, type ViewProps } from "react-native";
import { Clock, MapPin } from "lucide-react-native";
import { Text } from "@/components/ui/Text";
import { useTheme } from "@/theme";

export interface TodayHeroCardProps extends ViewProps {
  courseCode: string;
  courseTitle: string;
  courseColor?: string;
  time: string;
  venue: string;
  countdown: string;
  currentTimeLabel?: string;
  isOngoing?: boolean;
  progressRatio?: number;
  elapsedLabel?: string;
  remainingLabel?: string;
  typeAndFaculty?: string;
  onPress?: () => void;
  className?: string;
}

interface HeroCardBodyProps {
  courseCode: string;
  courseTitle: string;
  courseColor: string;
  time: string;
  venue: string;
  countdown: string;
  isOngoing: boolean;
  elapsedLabel?: string;
  remainingLabel?: string;
  typeAndFaculty?: string;
  isDark: boolean;
  mutedCurtain: boolean;
}

function HeroCardBody({
  courseCode,
  courseTitle,
  courseColor,
  time,
  venue,
  countdown,
  isOngoing,
  elapsedLabel,
  remainingLabel,
  typeAndFaculty,
  isDark,
  mutedCurtain,
}: HeroCardBodyProps) {
  const stripeColor = mutedCurtain ? (isDark ? "#475569" : "#CBD5E1") : courseColor;
  const primaryTextColor = mutedCurtain
    ? isDark
      ? "#64748B"
      : "#94A3B8"
    : isDark
      ? "#F8FAFC"
      : "#0F172A";
  const secondaryTextColor = mutedCurtain
    ? isDark
      ? "#475569"
      : "#94A3B8"
    : isDark
      ? "#CBD5E1"
      : "#334155";
  const captionTextColor = mutedCurtain
    ? isDark
      ? "#475569"
      : "#CBD5E1"
    : isDark
      ? "#94A3B8"
      : "#64748B";
  const statusLabelColor = mutedCurtain
    ? isDark
      ? "#64748B"
      : "#94A3B8"
    : isOngoing
      ? isDark
        ? "#4ADE80"
        : "#15803D"
      : isDark
        ? "#818CF8"
        : "#4F46E5";
  const pillBgColor = mutedCurtain
    ? isDark
      ? "#1E293B"
      : "#E2E8F0"
    : isOngoing
      ? isDark
        ? "#052E16"
        : "#ECFDF5"
      : isDark
        ? "#451A03"
        : "#FFFBEB";
  const pillTextColor = mutedCurtain
    ? isDark
      ? "#64748B"
      : "#94A3B8"
    : isOngoing
      ? isDark
        ? "#4ADE80"
        : "#15803D"
      : isDark
        ? "#FBBF24"
        : "#92400E";
  const coursePillBg = mutedCurtain
    ? isDark
      ? "#1E293B"
      : "#E2E8F0"
    : isDark
      ? "#334155"
      : "#F1F5F9";

  return (
    <View style={{ flexDirection: "row", flex: 1 }}>
      {/* 6px Left Course Stripe */}
      <View style={{ width: 6, alignSelf: "stretch", backgroundColor: stripeColor }} />

      <View style={{ flex: 1, padding: 20, rowGap: 12 }}>
        {/* Row 1: Ongoing / Next class label + Countdown / Live pill */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text
            variant="label"
            style={{
              color: statusLabelColor,
              fontFamily: "Inter_700Bold",
              fontSize: 13,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {isOngoing ? "Ongoing class" : "Next class"}
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: pillBgColor,
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 9999,
            }}
          >
            <Clock size={14} color={pillTextColor} strokeWidth={2} />
            <Text
              variant="label-sm"
              style={{
                color: pillTextColor,
                marginLeft: 5,
                fontVariant: ["tabular-nums"],
              }}
            >
              {countdown}
            </Text>
          </View>
        </View>

        {/* Row 2: Big Time Range */}
        <Text
          variant="title-page"
          style={{
            color: primaryTextColor,
            fontSize: 24,
            lineHeight: 30,
            fontFamily: "Inter_700Bold",
            fontVariant: ["tabular-nums"],
          }}
        >
          {time}
        </Text>

        {/* Row 3: Course Pill + Course Title */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            flexWrap: "wrap",
            columnGap: 10,
            rowGap: 6,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: coursePillBg,
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 8,
            }}
          >
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: stripeColor,
                marginRight: 6,
              }}
            />
            <Text
              variant="label"
              style={{
                color: primaryTextColor,
                fontFamily: "Inter_700Bold",
              }}
            >
              {courseCode}
            </Text>
          </View>

          <Text
            variant="title-section"
            style={{
              color: primaryTextColor,
              fontSize: 19,
              lineHeight: 24,
              fontFamily: "Inter_600SemiBold",
              flexShrink: 1,
            }}
          >
            {courseTitle}
          </Text>
        </View>

        {/* Row 4: Venue */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <MapPin size={18} color={secondaryTextColor} strokeWidth={2} />
          <Text
            variant="body-lg"
            style={{
              color: secondaryTextColor,
              marginLeft: 6,
              fontFamily: "Inter_500Medium",
            }}
          >
            {venue}
          </Text>
        </View>

        {/* Row 5: Elapsed vs Remaining Footer */}
        {isOngoing && (elapsedLabel || remainingLabel) ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 2,
            }}
          >
            <Text
              variant="caption"
              style={{
                color: captionTextColor,
                fontSize: 12,
                fontVariant: ["tabular-nums"],
              }}
            >
              {elapsedLabel}
            </Text>
            <Text
              variant="caption"
              style={{
                color: mutedCurtain ? captionTextColor : isDark ? "#818CF8" : "#4F46E5",
                fontSize: 12,
                fontFamily: "Inter_600SemiBold",
                fontVariant: ["tabular-nums"],
              }}
            >
              {remainingLabel}
            </Text>
          </View>
        ) : null}

        {/* Row 6: Lecture type, faculty, lecturer */}
        {typeAndFaculty ? (
          <Text variant="caption" style={{ color: captionTextColor }}>
            {typeAndFaculty}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export function TodayHeroCard({
  courseCode,
  courseTitle,
  courseColor = "#2563EB",
  time,
  venue,
  countdown,
  currentTimeLabel,
  isOngoing = false,
  progressRatio = 0,
  elapsedLabel,
  remainingLabel,
  typeAndFaculty,
  onPress,
  style,
  ...props
}: TodayHeroCardProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [cardHeight, setCardHeight] = useState(0);

  const clampedRatio = Math.min(1, Math.max(0, progressRatio));
  const pct = clampedRatio * 100;
  const curtainHeight = cardHeight > 0 ? cardHeight * clampedRatio : 0;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      onLayout={(e) => setCardHeight(e.nativeEvent.layout.height)}
      style={[
        {
          overflow: "hidden",
          backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
          borderRadius: 20,
          borderWidth: 1.5,
          borderColor: isDark ? "#334155" : "#E0E7FF",
          shadowColor: "#0F172A",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: isDark ? 0 : 0.08,
          shadowRadius: 16,
          elevation: 4,
          position: "relative",
        },
        style,
      ]}
      {...props}
    >
      {/* Layer 1 (Active Remaining Side below the horizontal bar): Full vibrant card */}
      <HeroCardBody
        courseCode={courseCode}
        courseTitle={courseTitle}
        courseColor={courseColor}
        time={time}
        venue={venue}
        countdown={countdown}
        isOngoing={isOngoing}
        elapsedLabel={elapsedLabel}
        remainingLabel={remainingLabel}
        typeAndFaculty={typeAndFaculty}
        isDark={isDark}
        mutedCurtain={false}
      />

      {/* Layer 2 (Passed Curtain Side above the horizontal bar):
          Clips at curtainHeight and greys out ALL texts, pills, icons, and backgrounds above the line */}
      {isOngoing && cardHeight > 0 ? (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: curtainHeight,
            overflow: "hidden",
            backgroundColor: isDark ? "#0F172A" : "#F1F5F9",
            zIndex: 10,
          }}
        >
          <View style={{ height: cardHeight, width: "100%" }}>
            <HeroCardBody
              courseCode={courseCode}
              courseTitle={courseTitle}
              courseColor={courseColor}
              time={time}
              venue={venue}
              countdown={countdown}
              isOngoing={isOngoing}
              elapsedLabel={elapsedLabel}
              remainingLabel={remainingLabel}
              typeAndFaculty={typeAndFaculty}
              isDark={isDark}
              mutedCurtain={true}
            />
          </View>
        </View>
      ) : null}

      {/* Layer 3: Horizontal Bar traveling down the card by the second */}
      {isOngoing ? (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: `${pct}%`,
            left: 0,
            right: 0,
            marginTop: -1.5,
            height: 3,
            backgroundColor: isDark ? "#818CF8" : "#4F46E5",
            zIndex: 20,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          {/* Left glowing dot on the horizontal curtain line */}
          <View
            style={{
              position: "absolute",
              left: 6,
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: isDark ? "#818CF8" : "#4F46E5",
            }}
          />

          {/* Right live second-by-second clock pill riding on the horizontal curtain line */}
          {currentTimeLabel ? (
            <View
              style={{
                backgroundColor: isDark ? "#312E81" : "#4F46E5",
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 9999,
                marginRight: 12,
                borderWidth: 1,
                borderColor: isDark ? "#818CF8" : "#FFFFFF",
              }}
            >
              <Text
                variant="label-sm"
                style={{
                  fontSize: 10,
                  lineHeight: 13,
                  color: "#FFFFFF",
                  fontFamily: "Inter_700Bold",
                  fontVariant: ["tabular-nums"],
                }}
              >
                {currentTimeLabel}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </Pressable>
  );
}
