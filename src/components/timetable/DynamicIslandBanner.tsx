import React, { useState } from "react";
import { View, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePathname, useRouter } from "expo-router";
import { MapPin, Clock, ChevronRight } from "lucide-react-native";
import { Text } from "@/components/ui/Text";
import { useAuth } from "@/auth";
import { useLiveClassProgress } from "@/hooks/useLiveClassProgress";

export function DynamicIslandBanner() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const { isSignedIn, hasCompletedOnboarding } = useAuth();
  const [expanded, setExpanded] = useState(false);

  const {
    ongoingClass,
    progressRatio,
    currentTimeLabel,
    elapsedLabel,
    remainingLabel,
    compactRemaining,
  } = useLiveClassProgress();

  const isOnboardingRoute =
    pathname === "/" ||
    pathname.startsWith("/setup") ||
    pathname.startsWith("/join") ||
    pathname.startsWith("/consent");

  if (!isSignedIn || !hasCompletedOnboarding || isOnboardingRoute || !ongoingClass) {
    return null;
  }

  const pct = Math.min(100, Math.max(0, progressRatio * 100));
  const cleanTitle = ongoingClass.courseTitle.replace(/\s*·\s*(Lecture|Tutorial|Lab)$/i, "");

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        top: Math.max(6, insets.top > 20 ? insets.top - 4 : 8),
        left: 12,
        right: 12,
        zIndex: 999,
        alignItems: "center",
      }}
    >
      {!expanded ? (
        /* Compact iOS Dynamic Island Pill */
        <Pressable
          onPress={() => setExpanded(true)}
          accessibilityRole="button"
          accessibilityLabel="Expand ongoing class Dynamic Island"
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#000000",
            borderRadius: 9999,
            height: 36,
            paddingHorizontal: 13,
            columnGap: 10,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.14)",
            shadowColor: "#000000",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.35,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          {/* Left: Live Dot + Course Code */}
          <View style={{ flexDirection: "row", alignItems: "center", columnGap: 6 }}>
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: ongoingClass.courseColor,
              }}
            />
            <Text
              variant="label-sm"
              style={{
                color: "#FFFFFF",
                fontFamily: "Inter_700Bold",
                fontSize: 12,
              }}
            >
              {ongoingClass.courseCode}
            </Text>
          </View>

          {/* Middle: Mini progress bar (past greyed out before bar, remaining active after bar) */}
          <View
            style={{
              width: 72,
              height: 6,
              borderRadius: 3,
              backgroundColor: "#27272A",
              overflow: "hidden",
              flexDirection: "row",
              alignItems: "center",
              position: "relative",
            }}
          >
            {/* Past time before the bar (greyed out) */}
            <View
              style={{
                width: `${pct}%`,
                height: "100%",
                backgroundColor: "#52525B",
              }}
            />
            {/* Remaining time after the bar (active) */}
            <View
              style={{
                width: `${100 - pct}%`,
                height: "100%",
                backgroundColor: ongoingClass.courseColor,
              }}
            />
            {/* Moving second-by-second playhead bar */}
            <View
              style={{
                position: "absolute",
                left: `${pct}%`,
                marginLeft: -1,
                width: 2,
                height: 6,
                backgroundColor: "#FFFFFF",
              }}
            />
          </View>

          {/* Right: Second-by-second countdown */}
          <Text
            variant="label-sm"
            style={{
              color: "#4ADE80",
              fontFamily: "Inter_700Bold",
              fontSize: 12,
              fontVariant: ["tabular-nums"],
            }}
          >
            -{compactRemaining}
          </Text>
        </Pressable>
      ) : (
        /* Expanded iOS Dynamic Island Live Activity Widget */
        <Pressable
          onPress={() => setExpanded(false)}
          accessibilityRole="button"
          accessibilityLabel="Collapse Dynamic Island"
          style={{
            width: "100%",
            maxWidth: 380,
            backgroundColor: "#000000",
            borderRadius: 32,
            paddingHorizontal: 18,
            paddingVertical: 16,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.16)",
            shadowColor: "#000000",
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.45,
            shadowRadius: 20,
            elevation: 12,
          }}
        >
          {/* Row 1: Course Pill + Live Clock + Remaining */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", columnGap: 8 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#18181B",
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 6,
                }}
              >
                <View
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 3.5,
                    backgroundColor: ongoingClass.courseColor,
                    marginRight: 5,
                  }}
                />
                <Text
                  variant="label-sm"
                  style={{
                    color: "#FFFFFF",
                    fontFamily: "Inter_700Bold",
                    fontSize: 12,
                  }}
                >
                  {ongoingClass.courseCode}
                </Text>
              </View>
              <Text
                variant="caption"
                style={{
                  color: "#A1A1AA",
                  fontSize: 12,
                  fontVariant: ["tabular-nums"],
                }}
              >
                {ongoingClass.displayTime}
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "rgba(74, 222, 128, 0.16)",
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 9999,
              }}
            >
              <Clock size={11} color="#4ADE80" strokeWidth={2.2} />
              <Text
                variant="label-sm"
                style={{
                  color: "#4ADE80",
                  marginLeft: 4,
                  fontSize: 11,
                  fontVariant: ["tabular-nums"],
                }}
              >
                {currentTimeLabel}
              </Text>
            </View>
          </View>

          {/* Row 2: Course Title + Venue */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <Text
              variant="title-card"
              numberOfLines={1}
              style={{
                color: "#FFFFFF",
                fontSize: 16,
                fontFamily: "Inter_700Bold",
                flex: 1,
                marginRight: 8,
              }}
            >
              {cleanTitle}
            </Text>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MapPin size={13} color="#A1A1AA" strokeWidth={2} />
              <Text
                variant="caption"
                style={{
                  color: "#D4D4D8",
                  marginLeft: 4,
                  fontSize: 12,
                }}
              >
                {ongoingClass.shortVenue}
              </Text>
            </View>
          </View>

          {/* Row 3: Live Second-by-Second Moving Bar (Past greyed out, Remaining active) */}
          <View style={{ marginBottom: 10 }}>
            <View
              style={{
                height: 10,
                borderRadius: 5,
                overflow: "hidden",
                flexDirection: "row",
                alignItems: "center",
                position: "relative",
                backgroundColor: "#27272A",
              }}
            >
              {/* Past portion before the bar: Greyed out */}
              <View
                style={{
                  width: `${pct}%`,
                  height: "100%",
                  backgroundColor: "#3F3F46",
                }}
              />
              {/* Remaining portion after the bar: Active */}
              <View
                style={{
                  width: `${100 - pct}%`,
                  height: "100%",
                  backgroundColor: ongoingClass.courseColor,
                }}
              />
              {/* Moving playhead bar */}
              <View
                style={{
                  position: "absolute",
                  left: `${pct}%`,
                  marginLeft: -1.5,
                  width: 3,
                  height: 10,
                  backgroundColor: "#FFFFFF",
                }}
              />
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 6,
              }}
            >
              <Text
                variant="caption"
                style={{
                  color: "#71717A",
                  fontSize: 11,
                  fontVariant: ["tabular-nums"],
                }}
              >
                {elapsedLabel}
              </Text>
              <Text
                variant="caption"
                style={{
                  color: "#4ADE80",
                  fontSize: 11,
                  fontFamily: "Inter_600SemiBold",
                  fontVariant: ["tabular-nums"],
                }}
              >
                {remainingLabel}
              </Text>
            </View>
          </View>

          {/* Row 4: Action to open class detail */}
          <Pressable
            onPress={() => {
              setExpanded(false);
              router.push(`/class/${ongoingClass.id}`);
            }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#18181B",
              borderRadius: 12,
              paddingVertical: 8,
              gap: 4,
            }}
          >
            <Text
              variant="label-sm"
              style={{
                color: "#FFFFFF",
                fontSize: 12,
                fontFamily: "Inter_600SemiBold",
              }}
            >
              Open ongoing class
            </Text>
            <ChevronRight size={14} color="#A1A1AA" />
          </Pressable>
        </Pressable>
      )}
    </View>
  );
}
