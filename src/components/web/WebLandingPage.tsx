import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Image,
  ImageSourcePropType,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  TextInput,
  useWindowDimensions,
  View,
  ViewStyle,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowRight,
  BarChart2,
  Bell,
  CheckCircle2,
  Layers,
  Smartphone,
  Users,
} from "lucide-react-native";
import { Text } from "@/components/ui/Text";

const brandLogo = require("../../../logo/Logo-dark.png");

// Authentic 720x1600 (9:20) TT Product Screenshots from Screens/
const screenTodayR2 = require("../../../Screens/90 Today · Release 2.png");
const screenClassesWeek = require("../../../Screens/35 Classes.png");
const screenClassesMonth = require("../../../Screens/36 Classes · month.png");
const screenQrCard = require("../../../Screens/61 QR card · save or post.png");
const screenClassPreview = require("../../../Screens/03 Class preview.png");
const screenClassSwitcher = require("../../../Screens/34 Class switcher.png");
const screenMoveClass = require("../../../Screens/40 Cancel or move one class.png");
const screenClassCancelled = require("../../../Screens/41 Class cancelled.png");
const screenLockNotifications = require("../../../Screens/43 Lock screen notifications.png");
const screenTodayOffline = require("../../../Screens/31 Today · offline.png");
const screenWidgets = require("../../../Screens/100 Home-screen widgets.png");
const screenCheckIn = require("../../../Screens/44 Check-in.png");
const screenAssignments = require("../../../Screens/50 Assignments.png");
const screenGroupPoll = require("../../../Screens/55 Group poll.png");
const screenReports = require("../../../Screens/77 Reports.png");
const screenExams = require("../../../Screens/91 Exams.png");
const screenReading = require("../../../Screens/95 Reading.png");
const screenWeeklySummary = require("../../../Screens/99 Weekly summary.png");

const APP_STORE_URL = "https://apps.apple.com/app/tt-student-timetable/id6832754254";

function AppStoreBadgeButton({
  variant = "dark",
  size = "lg",
  fullWidth = false,
}: {
  variant?: "dark" | "indigo" | "light";
  size?: "sm" | "lg";
  fullWidth?: boolean;
}) {
  const isSm = size === "sm";
  const bg = variant === "indigo" ? "#4F46E5" : variant === "light" ? "#FFFFFF" : "#0F172A";
  const borderColor =
    variant === "indigo" ? "#6366F1" : variant === "light" ? "#CBD5E1" : "#334155";
  const subTextColor =
    variant === "indigo" ? "#E0E7FF" : variant === "light" ? "#475569" : "#CBD5E1";
  const mainTextColor = variant === "light" ? "#0F172A" : "#FFFFFF";

  return (
    <Pressable
      onPress={() => Linking.openURL(APP_STORE_URL)}
      accessibilityRole="link"
      accessibilityLabel="Download TT: Student Timetable on the iOS App Store"
      style={{
        width: fullWidth ? "100%" : "auto",
        paddingHorizontal: isSm ? 14 : 22,
        paddingVertical: isSm ? 8 : 12,
        borderRadius: isSm ? 10 : 14,
        backgroundColor: bg,
        borderWidth: 1.5,
        borderColor,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: isSm ? 8 : 12,
        shadowColor: variant === "indigo" ? "#4F46E5" : "#0F172A",
        shadowOffset: { width: 0, height: isSm ? 4 : 10 },
        shadowOpacity: variant === "light" ? 0.08 : 0.24,
        shadowRadius: isSm ? 10 : 20,
      }}
    >
      <Text
        style={{
          color: mainTextColor,
          fontSize: isSm ? 18 : 26,
          lineHeight: isSm ? 20 : 28,
          fontFamily: "Inter_700Bold",
        }}
      >
        
      </Text>
      <View style={{ alignItems: "flex-start" }}>
        <Text
          style={{
            color: subTextColor,
            fontSize: isSm ? 9 : 11,
            lineHeight: isSm ? 11 : 13,
            fontFamily: "Inter_500Medium",
            letterSpacing: 0.2,
          }}
        >
          Available on iOS · Download on the
        </Text>
        <Text
          style={{
            color: mainTextColor,
            fontSize: isSm ? 14 : 18,
            lineHeight: isSm ? 17 : 22,
            fontFamily: "Inter_700Bold",
            letterSpacing: -0.3,
          }}
        >
          App Store
        </Text>
      </View>
    </Pressable>
  );
}

type HeroTabKey = "today" | "sharing" | "calendar" | "assignments" | "exams" | "attendance";

interface HeroShowcaseConfig {
  key: HeroTabKey;
  label: string;
  tintBg: string;
  tintBorder: string;
  tintText: string;
  caption: string;
  left: {
    source: ImageSourcePropType;
    tag: string;
    title: string;
  };
  center: {
    source: ImageSourcePropType;
    tag: string;
    title: string;
  };
  right: {
    source: ImageSourcePropType;
    tag: string;
    title: string;
  };
}

const HERO_SHOWCASES: HeroShowcaseConfig[] = [
  {
    key: "today",
    label: "Today",
    tintBg: "#EEF2FF",
    tintBorder: "#C7D2FE",
    tintText: "#4F46E5",
    caption:
      "Your next lecture countdown, moved-venue alerts from your course rep, and upcoming CBT exams in one calm view.",
    left: {
      source: screenClassSwitcher,
      tag: "Main + carry-over classes",
      title: "Follow your level and carry-over courses together",
    },
    center: {
      source: screenTodayR2,
      tag: "Today view",
      title: "Next class in 19 min · moved venues highlighted",
    },
    right: {
      source: screenWeeklySummary,
      tag: "Weekly summary",
      title: "See classes attended, reading hours, and next week",
    },
  },
  {
    key: "sharing",
    label: "Course rep link",
    tintBg: "#EEF2FF",
    tintBorder: "#C7D2FE",
    tintText: "#4F46E5",
    caption:
      "One course rep sets up the timetable and shares code CSC3X9 or a QR card to WhatsApp. Every classmate follows in seconds.",
    left: {
      source: screenQrCard,
      tag: "Share to WhatsApp",
      title: "Scan QR card or enter 6-character code CSC3X9",
    },
    center: {
      source: screenClassPreview,
      tag: "No login needed to look",
      title: "Preview courses, weekly load, and rep details first",
    },
    right: {
      source: screenMoveClass,
      tag: "Instant rep broadcast",
      title: "Move one lecture to LT2 and notify 128 followers",
    },
  },
  {
    key: "calendar",
    label: "Classes & calendar",
    tintBg: "#EEF2FF",
    tintBorder: "#C7D2FE",
    tintText: "#4F46E5",
    caption:
      "Switch smoothly between card lists and day, week, or month calendars—with colour-coded stripes for every course.",
    left: {
      source: screenClassesWeek,
      tag: "Week strip",
      title: "Scan your day with Attended and Moved status pills",
    },
    center: {
      source: screenClassesMonth,
      tag: "Month calendar",
      title: "Spot busy weeks and lecture days across the semester",
    },
    right: {
      source: screenReading,
      tag: "Reading timetable",
      title: "Plan personal study sessions and keep a weekly streak",
    },
  },
  {
    key: "assignments",
    label: "Assignments & polls",
    tintBg: "#FEF3C7",
    tintBorder: "#FDE68A",
    tintText: "#92400E",
    caption:
      "Track solo and group work sorted by due date, suggest missing tasks to your rep, and join project groups without WhatsApp chaos.",
    left: {
      source: screenAssignments,
      tag: "Due soon & missing",
      title: "Solo and group deadlines organised by week",
    },
    center: {
      source: screenGroupPoll,
      tag: "Group sign-up poll",
      title: "Pick your project group with automatic member caps",
    },
    right: {
      source: screenCheckIn,
      tag: "Add from class",
      title: "Log new assignments right after a lecture ends",
    },
  },
  {
    key: "exams",
    label: "Exams & reading",
    tintBg: "#EDE9FE",
    tintBorder: "#DDD6FE",
    tintText: "#5B21B6",
    caption:
      "Count down to your first paper, keep CBT hall and seat numbers private on your phone, and balance revision hours.",
    left: {
      source: screenExams,
      tag: "Exam timetable",
      title: "Written & CBT dates, venues, and private seat numbers",
    },
    center: {
      source: screenReading,
      tag: "Personal reading",
      title: "Track weekly study goals and revision streaks",
    },
    right: {
      source: screenTodayR2,
      tag: "Exam countdowns",
      title: "Upcoming papers surface automatically on Today",
    },
  },
  {
    key: "attendance",
    label: "75% attendance",
    tintBg: "#DCFCE7",
    tintBorder: "#BBF7D0",
    tintText: "#166534",
    caption:
      "Answer a 1-tap check-in after class and always know where you stand against your university's 75% exam eligibility rule.",
    left: {
      source: screenCheckIn,
      tag: "Post-class check-in",
      title: "One tap 10 minutes after class: Attended or Missed",
    },
    center: {
      source: screenReports,
      tag: "75% target math",
      title: "Exact catch-up guidance before exams begin",
    },
    right: {
      source: screenWeeklySummary,
      tag: "Weekly recap",
      title: "Steady progress across classes, reading, and tasks",
    },
  },
];

type RevealDirection = "up" | "left" | "right" | "scale";

/**
 * Scroll-triggered entrance animation wrapper.
 * Measures its real position relative to the viewport on scroll & mount,
 * and smoothly animates opacity, translation, and scale with configurable stagger delay.
 */
function ScrollReveal({
  children,
  scrollY,
  viewportHeight,
  delayMs = 0,
  direction = "up",
  distance = 96,
  immediate = false,
  style,
}: {
  children: React.ReactNode;
  scrollY: number;
  viewportHeight: number;
  delayMs?: number;
  direction?: RevealDirection;
  distance?: number;
  immediate?: boolean;
  style?: ViewStyle;
}) {
  const containerRef = useRef<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (immediate) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 36);
      return () => clearTimeout(timer);
    }
  }, [immediate]);

  useEffect(() => {
    if (immediate) return;
    const rafId = requestAnimationFrame(() => {
      const node = containerRef.current as any;
      if (!node) return;

      if (typeof node.getBoundingClientRect === "function") {
        const rect = node.getBoundingClientRect();
        if (!rect) return;
        if (rect.top <= viewportHeight * 0.88 && rect.bottom >= 40) {
          setIsVisible((prev) => (prev ? prev : true));
        } else if (rect.top > viewportHeight * 0.96) {
          setIsVisible((prev) => (prev ? false : prev));
        }
        return;
      }

      if (typeof node.measureInWindow === "function") {
        node.measureInWindow((_x: number, y: number) => {
          if (typeof y === "number") {
            if (y <= viewportHeight * 0.88) {
              setIsVisible((prev) => (prev ? prev : true));
            } else if (y > viewportHeight * 0.96) {
              setIsVisible((prev) => (prev ? false : prev));
            }
          }
        });
      }
    });
    return () => cancelAnimationFrame(rafId);
  }, [immediate, scrollY, viewportHeight]);

  const translateY =
    direction === "up"
      ? isVisible
        ? 0
        : distance
      : direction === "scale"
        ? isVisible
          ? 0
          : Math.round(distance * 0.65)
        : isVisible
          ? 0
          : 44;

  const translateX =
    direction === "left"
      ? isVisible
        ? 0
        : -distance
      : direction === "right"
        ? isVisible
          ? 0
          : distance
        : 0;

  const scale = direction === "scale" ? (isVisible ? 1 : 0.78) : isVisible ? 1 : 0.86;

  const rotate =
    direction === "left"
      ? isVisible
        ? "0deg"
        : "-6.5deg"
      : direction === "right"
        ? isVisible
          ? "0deg"
          : "6.5deg"
        : "0deg";

  return (
    <View
      ref={containerRef}
      style={[
        style,
        {
          opacity: isVisible ? 1 : 0,
          transform: [{ perspective: 1100 }, { translateY }, { translateX }, { scale }, { rotate }],
          filter: isVisible ? "blur(0px)" : "blur(10px)",
          transitionProperty: "opacity, transform, filter",
          transitionDuration: isVisible ? "920ms" : "380ms",
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          transitionDelay: isVisible ? `${delayMs}ms` : "0ms",
          willChange: "opacity, transform, filter",
        } as any,
      ]}
    >
      {children}
    </View>
  );
}

/**
 * Interactive hover lift card wrapper for desktop web + touch feedback.
 */
function HoverLiftCard({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Pressable
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      style={{ flex: style?.flex, minWidth: style?.minWidth }}
    >
      <View
        style={[
          style,
          {
            transform: [
              { perspective: 1000 },
              { translateY: isHovered ? -16 : 0 },
              { scale: isHovered ? 1.032 : 1 },
              { rotate: isHovered ? "-0.8deg" : "0deg" },
            ],
            borderColor: isHovered ? "#6366F1" : style?.borderColor,
            shadowColor: isHovered ? "#4F46E5" : "#0F172A",
            shadowOffset: { width: 0, height: isHovered ? 28 : 8 },
            shadowOpacity: isHovered ? 0.22 : 0.04,
            shadowRadius: isHovered ? 44 : 16,
            transitionProperty: "transform, box-shadow, border-color",
            transitionDuration: "420ms",
            transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          } as any,
        ]}
      >
        {children}
      </View>
    </Pressable>
  );
}

function PhoneScreenshotFrame({
  source,
  width,
  tag,
  title,
  subtitle,
  elevated = false,
  darkSurface = false,
  accentColor = "#4F46E5",
  accentBg = "#EEF2FF",
}: {
  source: ImageSourcePropType;
  width: number;
  tag?: string;
  title?: string;
  subtitle?: string;
  elevated?: boolean;
  darkSurface?: boolean;
  accentColor?: string;
  accentBg?: string;
}) {
  // Exact 9:20 ratio for 720x1600 PNGs
  const screenHeight = Math.round((width * 20) / 9);
  const bezelPadding = Math.max(8, Math.round(width * 0.036));
  const outerWidth = width + bezelPadding * 2;
  const outerRadius = Math.round(width * 0.13);
  const innerRadius = Math.round(width * 0.1);

  return (
    <View style={{ width: outerWidth, alignItems: "center" }}>
      {tag ? (
        <View
          style={{
            marginBottom: 12,
            paddingHorizontal: 12,
            paddingVertical: 5,
            borderRadius: 999,
            backgroundColor: darkSurface ? "rgba(79, 70, 229, 0.22)" : accentBg,
            borderWidth: 1,
            borderColor: darkSurface ? "rgba(129, 140, 248, 0.35)" : "rgba(79, 70, 229, 0.16)",
          }}
        >
          <Text
            style={{
              color: darkSurface ? "#C7D2FE" : accentColor,
              fontSize: 12,
              lineHeight: 16,
              fontFamily: "Inter_600SemiBold",
            }}
          >
            {tag}
          </Text>
        </View>
      ) : null}

      {/* Titanium Hardware Frame */}
      <View
        style={{
          width: outerWidth,
          padding: bezelPadding,
          borderRadius: outerRadius,
          backgroundColor: "#0F172A",
          borderWidth: elevated ? 2 : 1.5,
          borderColor: elevated ? "#4F46E5" : darkSurface ? "rgba(255, 255, 255, 0.18)" : "#CBD5E1",
          shadowColor: "#0F172A",
          shadowOffset: { width: 0, height: elevated ? 24 : 14 },
          shadowOpacity: elevated ? 0.22 : 0.12,
          shadowRadius: elevated ? 36 : 22,
          elevation: elevated ? 16 : 8,
        }}
      >
        <View
          style={{
            width,
            height: screenHeight,
            borderRadius: innerRadius,
            overflow: "hidden",
            backgroundColor: "#F8FAFC",
          }}
        >
          <Image
            source={source}
            style={{ width, height: screenHeight }}
            resizeMode="cover"
            accessibilityLabel={title ?? "TT app screen"}
          />
        </View>
      </View>

      {title ? (
        <View style={{ marginTop: 14, paddingHorizontal: 4, alignItems: "center" }}>
          <Text
            style={{
              color: darkSurface ? "#F8FAFC" : "#0F172A",
              fontSize: 15,
              lineHeight: 22,
              fontFamily: "Inter_600SemiBold",
              textAlign: "center",
            }}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={{
                marginTop: 4,
                color: darkSurface ? "#94A3B8" : "#475569",
                fontSize: 13,
                lineHeight: 19,
                fontFamily: "Inter_400Regular",
                textAlign: "center",
              }}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

export function WebLandingPage() {
  const router = useRouter();
  const { width, height: viewportHeight } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 720;

  const [activeHeroTab, setActiveHeroTab] = useState<HeroTabKey>("today");
  const [heroTabEntering, setHeroTabEntering] = useState(true);
  const [shareCodeInput, setShareCodeInput] = useState("CSC3X9");
  const [scrollY, setScrollY] = useState(0);
  const [contentHeight, setContentHeight] = useState(4000);

  const handleSelectHeroTab = (nextTab: HeroTabKey) => {
    if (nextTab === activeHeroTab) return;
    setHeroTabEntering(false);
    setActiveHeroTab(nextTab);
    setTimeout(() => {
      setHeroTabEntering(true);
    }, 24);
  };

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextY = event.nativeEvent.contentOffset.y;
    const totalH = event.nativeEvent.contentSize.height;
    setScrollY(nextY);
    if (totalH > 0) {
      setContentHeight(totalH);
    }
  }, []);

  const currentHero =
    HERO_SHOWCASES.find((item) => item.key === activeHeroTab) ?? HERO_SHOWCASES[0]!;

  const handlePreviewCode = (customCode?: string) => {
    const clean = (customCode ?? shareCodeInput).trim().toUpperCase() || "CSC3X9";
    router.push(`/join/${clean}` as any);
  };

  // Continuous scroll-linked values
  const maxScroll = Math.max(1, contentHeight - viewportHeight);
  const scrollProgressPct = Math.min(100, Math.max(0, (scrollY / maxScroll) * 100));
  const isHeaderElevated = scrollY > 12;

  // Dramatic Hero 3-Phone Deck-to-Fan Choreography (0 -> 1 over first 560px of scroll)
  // At scrollY=0, side phones sit tucked inward & tilted (-8.5deg / +8.5deg);
  // as you scroll, they sweep wide apart, rise, and un-tilt while the center phone zooms forward!
  const heroParallax = Math.min(1, Math.max(0, scrollY / 560));
  const leftPhoneTranslateX = 44 - heroParallax * 86;
  const leftPhoneTranslateY = 36 - heroParallax * 28;
  const leftPhoneRotate = `${(-8.5 + heroParallax * 6.5).toFixed(2)}deg`;
  const leftPhoneScale = 0.9 + heroParallax * 0.1;

  const centerPhoneTranslateY = -heroParallax * 34;
  const centerPhoneScale = 1 + heroParallax * 0.085;

  const rightPhoneTranslateX = -44 + heroParallax * 86;
  const rightPhoneTranslateY = 36 - heroParallax * 28;
  const rightPhoneRotate = `${(8.5 - heroParallax * 6.5).toFixed(2)}deg`;
  const rightPhoneScale = 0.9 + heroParallax * 0.1;

  // Dramatic Tab switch swoop values
  const heroTabOpacity = heroTabEntering ? 1 : 0;
  const heroTabTranslateY = heroTabEntering ? 0 : 56;
  const heroTabScale = heroTabEntering ? 1 : 0.85;

  // Responsive phone widths so screenshots are large, crisp, and legible on every viewport
  const heroCenterWidth = isDesktop
    ? 288
    : isTablet
      ? 261
      : Math.min(279, Math.max(234, width - 72));
  const heroSideWidth = isDesktop ? 252 : 225;
  const chapterThreeUpWidth = isDesktop
    ? 261
    : isTablet
      ? 225
      : Math.min(270, Math.max(234, width - 80));
  const bentoPhoneWidth = isDesktop
    ? 252
    : isTablet
      ? 234
      : Math.min(261, Math.max(225, width - 88));

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      {/* ===================================================================== */}
      {/* 1. PINNED STICKY HEADER + LIVE SCROLL PROGRESS BAR                    */}
      {/* ===================================================================== */}
      <View
        style={{
          width: "100%",
          backgroundColor: isHeaderElevated
            ? "rgba(255, 255, 255, 0.96)"
            : "rgba(255, 255, 255, 0.90)",
          borderBottomWidth: 1,
          borderBottomColor: isHeaderElevated ? "#CBD5E1" : "#E2E8F0",
          shadowColor: "#0F172A",
          shadowOffset: { width: 0, height: isHeaderElevated ? 8 : 0 },
          shadowOpacity: isHeaderElevated ? 0.06 : 0,
          shadowRadius: isHeaderElevated ? 16 : 0,
          zIndex: 50,
        }}
      >
        {/* Top Live Scroll Progress Indicator */}
        <View
          style={{
            width: "100%",
            height: 3,
            backgroundColor: "rgba(79, 70, 229, 0.08)",
          }}
        >
          <View
            style={{
              width: `${scrollProgressPct.toFixed(1)}%` as any,
              height: "100%",
              backgroundColor: "#4F46E5",
            }}
          />
        </View>

        {/* Top "Available on iOS" Call-to-Action Banner Bar */}
        <Pressable
          onPress={() => Linking.openURL(APP_STORE_URL)}
          style={{
            width: "100%",
            backgroundColor: "#0F172A",
            paddingHorizontal: 16,
            paddingVertical: 8,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 999,
              backgroundColor: "#4F46E5",
            }}
          >
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 11,
                lineHeight: 15,
                fontFamily: "Inter_700Bold",
              }}
            >
               Available on iOS
            </Text>
          </View>
          <Text
            style={{
              color: "#F8FAFC",
              fontSize: 13,
              lineHeight: 18,
              fontFamily: "Inter_500Medium",
              textAlign: "center",
            }}
          >
            TT: Student Timetable is live on the Apple App Store for iPhone & iPad.
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Text
              style={{
                color: "#A5B4FC",
                fontSize: 13,
                lineHeight: 18,
                fontFamily: "Inter_700Bold",
              }}
            >
              Download free on the App Store
            </Text>
            <ArrowRight size={14} color="#A5B4FC" />
          </View>
        </Pressable>

        <View
          style={{
            width: "100%",
            maxWidth: 1200,
            alignSelf: "center",
            paddingHorizontal: isDesktop ? 32 : 20,
            paddingVertical: 14,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          {/* Brand Lockup */}
          <Pressable
            onPress={() => router.push("/" as any)}
            style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
          >
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                backgroundColor: "#0F172A",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                borderWidth: 1,
                borderColor: "#E2E8F0",
              }}
            >
              <Image
                source={brandLogo}
                style={{ width: 38, height: 38 }}
                resizeMode="contain"
                accessibilityLabel="TT: Student Timetable logo"
              />
            </View>
            <View>
              <Text
                style={{
                  color: "#0F172A",
                  fontSize: 16,
                  lineHeight: 20,
                  fontFamily: "Inter_700Bold",
                }}
              >
                TT: Student Timetable
              </Text>
              <Text
                style={{
                  color: "#475569",
                  fontSize: 12,
                  lineHeight: 16,
                  fontFamily: "Inter_400Regular",
                }}
              >
                Your class, your timetable, on time.
              </Text>
            </View>
          </Pressable>

          {/* Right Navigation Actions */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: isTablet ? 10 : 8 }}>
            {isDesktop ? (
              <Pressable
                onPress={() => handlePreviewCode("CSC3X9")}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    color: "#334155",
                    fontSize: 14,
                    lineHeight: 20,
                    fontFamily: "Inter_500Medium",
                  }}
                >
                  Live demo class
                </Text>
              </Pressable>
            ) : null}

            <Pressable
              onPress={() => router.push("/privacy" as any)}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 8,
                borderRadius: 8,
              }}
            >
              <Text
                style={{
                  color: "#334155",
                  fontSize: 14,
                  lineHeight: 20,
                  fontFamily: "Inter_500Medium",
                }}
              >
                Privacy
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push("/setup/welcome?mode=signin" as any)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 9,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: "#CBD5E1",
                backgroundColor: "#FFFFFF",
              }}
            >
              <Text
                style={{
                  color: "#0F172A",
                  fontSize: 14,
                  lineHeight: 20,
                  fontFamily: "Inter_600SemiBold",
                }}
              >
                Sign in
              </Text>
            </Pressable>

            <Pressable
              onPress={() => Linking.openURL(APP_STORE_URL)}
              style={{
                paddingHorizontal: 15,
                paddingVertical: 9,
                borderRadius: 10,
                backgroundColor: "#4F46E5",
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 14,
                  lineHeight: 20,
                  fontFamily: "Inter_600SemiBold",
                }}
              >
                 Get iOS App
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* ===================================================================== */}
      {/* SCROLLABLE MARKETING CANVAS                                           */}
      {/* ===================================================================== */}
      <ScrollView
        style={{ flex: 1, backgroundColor: "#F8FAFC" }}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* =================================================================== */}
        {/* 2. NOTION CALENDAR–STYLE EDITORIAL HERO + PARALLAX 3-SCREEN STAGE   */}
        {/* =================================================================== */}
        <View
          style={{
            width: "100%",
            backgroundColor: "#FFFFFF",
            borderBottomWidth: 1,
            borderBottomColor: "#E2E8F0",
          }}
        >
          <View
            style={{
              width: "100%",
              maxWidth: 1200,
              alignSelf: "center",
              paddingHorizontal: isDesktop ? 32 : 20,
              paddingTop: isDesktop ? 64 : 40,
              paddingBottom: isDesktop ? 72 : 48,
              alignItems: "center",
            }}
          >
            {/* Staggered Entrance 1: Pill Badge */}
            <ScrollReveal
              scrollY={scrollY}
              viewportHeight={viewportHeight}
              immediate
              delayMs={0}
              distance={20}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: 999,
                  backgroundColor: "#EEF2FF",
                  borderWidth: 1,
                  borderColor: "#C7D2FE",
                  marginBottom: 20,
                }}
              >
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 999,
                    backgroundColor: "#4F46E5",
                  }}
                />
                <Text
                  style={{
                    color: "#4338CA",
                    fontSize: 13,
                    lineHeight: 18,
                    fontFamily: "Inter_600SemiBold",
                  }}
                >
                  Built for university students & course reps · iOS, Android & Web
                </Text>
              </View>
            </ScrollReveal>

            {/* Staggered Entrance 2: Editorial Display Headline */}
            <ScrollReveal
              scrollY={scrollY}
              viewportHeight={viewportHeight}
              immediate
              delayMs={80}
              distance={26}
            >
              <Text
                style={{
                  color: "#0F172A",
                  fontSize: isDesktop ? 56 : isTablet ? 44 : 34,
                  lineHeight: isDesktop ? 64 : isTablet ? 52 : 40,
                  fontFamily: "Inter_700Bold",
                  textAlign: "center",
                  maxWidth: 860,
                  letterSpacing: -1,
                }}
              >
                Your class, your timetable, on time.
              </Text>
            </ScrollReveal>

            {/* Staggered Entrance 3: Supporting Lead Copy */}
            <ScrollReveal
              scrollY={scrollY}
              viewportHeight={viewportHeight}
              immediate
              delayMs={160}
              distance={26}
            >
              <Text
                style={{
                  marginTop: 18,
                  color: "#334155",
                  fontSize: isDesktop ? 20 : 17,
                  lineHeight: isDesktop ? 30 : 26,
                  fontFamily: "Inter_400Regular",
                  textAlign: "center",
                  maxWidth: 720,
                }}
              >
                One shared link from your course rep puts every lecture, venue change, assignment,
                CBT exam, and reading session on your phone—with reminders that work even when data
                is off.
              </Text>
            </ScrollReveal>

            {/* Staggered Entrance 4: Hero Primary CTAs */}
            <ScrollReveal
              scrollY={scrollY}
              viewportHeight={viewportHeight}
              immediate
              delayMs={240}
              distance={24}
              style={{ width: isTablet ? "auto" : "100%" }}
            >
              <View
                style={{
                  marginTop: 28,
                  flexDirection: isTablet ? "row" : "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  width: isTablet ? "auto" : "100%",
                }}
              >
                <AppStoreBadgeButton variant="indigo" size="lg" fullWidth={!isTablet} />

                <Pressable
                  onPress={() => router.push("/setup/welcome?mode=signup" as any)}
                  style={{
                    width: isTablet ? "auto" : "100%",
                    paddingHorizontal: 22,
                    paddingVertical: 15,
                    borderRadius: 14,
                    backgroundColor: "#0F172A",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 16,
                      lineHeight: 20,
                      fontFamily: "Inter_600SemiBold",
                    }}
                  >
                    Open web companion
                  </Text>
                  <ArrowRight size={17} color="#FFFFFF" />
                </Pressable>

                <Pressable
                  onPress={() => handlePreviewCode("CSC3X9")}
                  style={{
                    width: isTablet ? "auto" : "100%",
                    paddingHorizontal: 20,
                    paddingVertical: 15,
                    borderRadius: 14,
                    backgroundColor: "#F8FAFC",
                    borderWidth: 1,
                    borderColor: "#CBD5E1",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <Text
                    style={{
                      color: "#0F172A",
                      fontSize: 15,
                      lineHeight: 20,
                      fontFamily: "Inter_600SemiBold",
                    }}
                  >
                    Preview class CSC3X9
                  </Text>
                </Pressable>
              </View>
            </ScrollReveal>

            {/* Staggered Entrance 5: Interactive Feature Switcher Tabs */}
            <ScrollReveal
              scrollY={scrollY}
              viewportHeight={viewportHeight}
              immediate
              delayMs={320}
              distance={22}
              style={{ alignItems: "center" }}
            >
              <View
                style={{
                  marginTop: 40,
                  flexDirection: "row",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: 6,
                  borderRadius: 16,
                  backgroundColor: "#F1F5F9",
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                }}
              >
                {HERO_SHOWCASES.map((tab) => {
                  const active = tab.key === activeHeroTab;
                  return (
                    <Pressable
                      key={tab.key}
                      onPress={() => handleSelectHeroTab(tab.key)}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 9,
                        borderRadius: 12,
                        backgroundColor: active ? "#FFFFFF" : "transparent",
                        borderWidth: 1,
                        borderColor: active ? "#CBD5E1" : "transparent",
                        shadowColor: "#0F172A",
                        shadowOffset: { width: 0, height: active ? 2 : 0 },
                        shadowOpacity: active ? 0.06 : 0,
                        shadowRadius: 6,
                      }}
                    >
                      <Text
                        style={{
                          color: active ? "#4F46E5" : "#475569",
                          fontSize: 14,
                          lineHeight: 20,
                          fontFamily: active ? "Inter_600SemiBold" : "Inter_500Medium",
                        }}
                      >
                        {tab.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Active Feature Caption */}
              <Text
                style={{
                  marginTop: 16,
                  color: "#475569",
                  fontSize: 15,
                  lineHeight: 22,
                  fontFamily: "Inter_400Regular",
                  textAlign: "center",
                  maxWidth: 680,
                }}
              >
                {currentHero.caption}
              </Text>
            </ScrollReveal>

            {/* Staggered Entrance 6: Giant 3-Screen Showcase Stage with Scroll Parallax */}
            <ScrollReveal
              scrollY={scrollY}
              viewportHeight={viewportHeight}
              immediate
              delayMs={400}
              direction="scale"
              style={{ width: "100%" }}
            >
              <View
                style={
                  {
                    marginTop: 28,
                    width: "100%",
                    paddingVertical: isDesktop ? 36 : 24,
                    paddingHorizontal: isDesktop ? 32 : 16,
                    borderRadius: 28,
                    backgroundColor: "#F8FAFC",
                    borderWidth: 1,
                    borderColor: "#E2E8F0",
                    alignItems: "center",
                    opacity: heroTabOpacity,
                    transform: [{ translateY: heroTabTranslateY }, { scale: heroTabScale }],
                    filter: heroTabEntering ? "blur(0px)" : "blur(8px)",
                    transitionProperty: "opacity, transform, filter",
                    transitionDuration: "640ms",
                    transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                  } as any
                }
              >
                <View
                  style={{
                    flexDirection: isDesktop ? "row" : "column",
                    alignItems: isDesktop ? "flex-end" : "center",
                    justifyContent: "center",
                    gap: isDesktop ? 28 : 32,
                  }}
                >
                  {/* Left Companion Screen with Dramatic Deck-to-Fan Scroll Parallax */}
                  {isDesktop ? (
                    <View
                      style={
                        {
                          transform: [
                            { perspective: 1200 },
                            { translateX: leftPhoneTranslateX },
                            { translateY: leftPhoneTranslateY },
                            { scale: leftPhoneScale },
                            { rotate: leftPhoneRotate },
                          ],
                          transitionProperty: "transform",
                          transitionDuration: "120ms",
                          transitionTimingFunction: " ease-out",
                        } as any
                      }
                    >
                      <PhoneScreenshotFrame
                        source={currentHero.left.source}
                        width={heroSideWidth}
                        tag={currentHero.left.tag}
                        title={currentHero.left.title}
                        accentColor={currentHero.tintText}
                        accentBg={currentHero.tintBg}
                      />
                    </View>
                  ) : null}

                  {/* Center Primary Screen with Forward Zoom Scroll Parallax */}
                  <View
                    style={
                      {
                        zIndex: 10,
                        transform: [
                          { perspective: 1200 },
                          { translateY: centerPhoneTranslateY },
                          { scale: centerPhoneScale },
                        ],
                        transitionProperty: "transform",
                        transitionDuration: "120ms",
                        transitionTimingFunction: "ease-out",
                      } as any
                    }
                  >
                    <PhoneScreenshotFrame
                      source={currentHero.center.source}
                      width={heroCenterWidth}
                      tag={currentHero.center.tag}
                      title={currentHero.center.title}
                      elevated
                      accentColor={currentHero.tintText}
                      accentBg={currentHero.tintBg}
                    />
                  </View>

                  {/* Right Companion Screen with Dramatic Deck-to-Fan Scroll Parallax */}
                  {isDesktop ? (
                    <View
                      style={
                        {
                          transform: [
                            { perspective: 1200 },
                            { translateX: rightPhoneTranslateX },
                            { translateY: rightPhoneTranslateY },
                            { scale: rightPhoneScale },
                            { rotate: rightPhoneRotate },
                          ],
                          transitionProperty: "transform",
                          transitionDuration: "120ms",
                          transitionTimingFunction: "ease-out",
                        } as any
                      }
                    >
                      <PhoneScreenshotFrame
                        source={currentHero.right.source}
                        width={heroSideWidth}
                        tag={currentHero.right.tag}
                        title={currentHero.right.title}
                        accentColor={currentHero.tintText}
                        accentBg={currentHero.tintBg}
                      />
                    </View>
                  ) : null}

                  {/* On Mobile/Tablet, show the 2 companion screens side-by-side below the main screen */}
                  {!isDesktop ? (
                    <View
                      style={{
                        flexDirection: isTablet ? "row" : "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 24,
                      }}
                    >
                      <PhoneScreenshotFrame
                        source={currentHero.left.source}
                        width={isTablet ? 225 : heroCenterWidth}
                        tag={currentHero.left.tag}
                        title={currentHero.left.title}
                        accentColor={currentHero.tintText}
                        accentBg={currentHero.tintBg}
                      />
                      <PhoneScreenshotFrame
                        source={currentHero.right.source}
                        width={isTablet ? 225 : heroCenterWidth}
                        tag={currentHero.right.tag}
                        title={currentHero.right.title}
                        accentColor={currentHero.tintText}
                        accentBg={currentHero.tintBg}
                      />
                    </View>
                  ) : null}
                </View>
              </View>
            </ScrollReveal>

            {/* Quick Trust & Capability Strip */}
            <ScrollReveal
              scrollY={scrollY}
              viewportHeight={viewportHeight}
              delayMs={100}
              distance={20}
            >
              <View
                style={{
                  marginTop: 28,
                  flexDirection: "row",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: isDesktop ? 32 : 16,
                }}
              >
                {[
                  "No account needed to preview a class link",
                  "Works offline on campus with local SQLite",
                  "Supports main class, carry-overs & electives",
                  "Light and dark mode built in",
                ].map((point) => (
                  <View key={point} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <CheckCircle2 size={16} color="#16A34A" />
                    <Text
                      style={{
                        color: "#334155",
                        fontSize: 14,
                        lineHeight: 20,
                        fontFamily: "Inter_500Medium",
                      }}
                    >
                      {point}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollReveal>
          </View>
        </View>

        {/* =================================================================== */}
        {/* 3. CHAPTER 1: COURSE REP SHARING & LIVE VENUE BROADCASTS            */}
        {/* =================================================================== */}
        <View
          style={{
            width: "100%",
            maxWidth: 1200,
            alignSelf: "center",
            paddingHorizontal: isDesktop ? 32 : 20,
            paddingVertical: isDesktop ? 88 : 56,
          }}
        >
          <ScrollReveal scrollY={scrollY} viewportHeight={viewportHeight} distance={32}>
            <View style={{ maxWidth: 740 }}>
              <View
                style={{
                  alignSelf: "flex-start",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 5,
                  borderRadius: 999,
                  backgroundColor: "#EEF2FF",
                  marginBottom: 14,
                }}
              >
                <Users size={14} color="#4F46E5" />
                <Text
                  style={{
                    color: "#4F46E5",
                    fontSize: 12,
                    lineHeight: 16,
                    fontFamily: "Inter_600SemiBold",
                  }}
                >
                  Shared classes · Course rep broadcasts
                </Text>
              </View>

              <Text
                style={{
                  color: "#0F172A",
                  fontSize: isDesktop ? 40 : 30,
                  lineHeight: isDesktop ? 48 : 38,
                  fontFamily: "Inter_700Bold",
                  letterSpacing: -0.6,
                }}
              >
                One link from your course rep. Everyone is on the same timetable.
              </Text>

              <Text
                style={{
                  marginTop: 14,
                  color: "#334155",
                  fontSize: isDesktop ? 18 : 16,
                  lineHeight: isDesktop ? 28 : 24,
                  fontFamily: "Inter_400Regular",
                }}
              >
                Stop digging through 300 WhatsApp messages for a blurred PDF timetable. When your
                course rep moves CSC 301 from LT1 to LT2 or cancels a morning lecture, every
                follower gets an instant change notice and an updated reminder.
              </Text>
            </View>
          </ScrollReveal>

          {/* 3-Up Screenshot Story Card Grid with Staggered Scroll Reveals */}
          <View
            style={{
              marginTop: 40,
              flexDirection: isDesktop ? "row" : "column",
              alignItems: "stretch",
              justifyContent: "space-between",
              gap: 24,
            }}
          >
            {/* Step 1 Card */}
            <ScrollReveal
              scrollY={scrollY}
              viewportHeight={viewportHeight}
              delayMs={0}
              direction={isDesktop ? "left" : "up"}
              distance={110}
              style={{ flex: 1 }}
            >
              <HoverLiftCard
                style={{
                  flex: 1,
                  backgroundColor: "#FFFFFF",
                  borderRadius: 24,
                  padding: 24,
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                  alignItems: "center",
                }}
              >
                <PhoneScreenshotFrame
                  source={screenQrCard}
                  width={chapterThreeUpWidth}
                  tag="1 · Share in one tap"
                  title="Post QR card to WhatsApp status or projector"
                  subtitle="Classmates scan the QR card or enter the 6-character share code CSC3X9."
                />
              </HoverLiftCard>
            </ScrollReveal>

            {/* Step 2 Card */}
            <ScrollReveal
              scrollY={scrollY}
              viewportHeight={viewportHeight}
              delayMs={160}
              direction="scale"
              distance={115}
              style={{ flex: 1 }}
            >
              <HoverLiftCard
                style={{
                  flex: 1,
                  backgroundColor: "#FFFFFF",
                  borderRadius: 24,
                  padding: 24,
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                  alignItems: "center",
                }}
              >
                <PhoneScreenshotFrame
                  source={screenMoveClass}
                  width={chapterThreeUpWidth}
                  tag="2 · Rep moves one class"
                  title="Change Fri 6 Nov only without breaking the week"
                  subtitle="Reps move a single lecture to LT2 or cancel it in seconds. All 128 followers are notified."
                  accentColor="#B45309"
                  accentBg="#FEF3C7"
                />
              </HoverLiftCard>
            </ScrollReveal>

            {/* Step 3 Card */}
            <ScrollReveal
              scrollY={scrollY}
              viewportHeight={viewportHeight}
              delayMs={320}
              direction={isDesktop ? "right" : "up"}
              distance={110}
              style={{ flex: 1 }}
            >
              <HoverLiftCard
                style={{
                  flex: 1,
                  backgroundColor: "#FFFFFF",
                  borderRadius: 24,
                  padding: 24,
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                  alignItems: "center",
                }}
              >
                <PhoneScreenshotFrame
                  source={screenClassCancelled}
                  width={chapterThreeUpWidth}
                  tag="3 · Followers see it right away"
                  title="Cancelled & moved lectures stand out clearly"
                  subtitle="Earlier reminders are corrected automatically so nobody walks to an empty hall."
                  accentColor="#166534"
                  accentBg="#DCFCE7"
                />
              </HoverLiftCard>
            </ScrollReveal>
          </View>
        </View>

        {/* =================================================================== */}
        {/* 4. CHAPTER 2: 4-IN-1 STUDENT TIMETABLE (BENTO SCREENSHOT GRID)      */}
        {/* =================================================================== */}
        <View
          style={{
            width: "100%",
            backgroundColor: "#FFFFFF",
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: "#E2E8F0",
          }}
        >
          <View
            style={{
              width: "100%",
              maxWidth: 1200,
              alignSelf: "center",
              paddingHorizontal: isDesktop ? 32 : 20,
              paddingVertical: isDesktop ? 88 : 56,
            }}
          >
            <ScrollReveal scrollY={scrollY} viewportHeight={viewportHeight} distance={32}>
              <View style={{ maxWidth: 760 }}>
                <View
                  style={{
                    alignSelf: "flex-start",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 5,
                    borderRadius: 999,
                    backgroundColor: "#EDE9FE",
                    marginBottom: 14,
                  }}
                >
                  <Layers size={14} color="#5B21B6" />
                  <Text
                    style={{
                      color: "#5B21B6",
                      fontSize: 12,
                      lineHeight: 16,
                      fontFamily: "Inter_600SemiBold",
                    }}
                  >
                    Multi-calendar student life
                  </Text>
                </View>

                <Text
                  style={{
                    color: "#0F172A",
                    fontSize: isDesktop ? 40 : 30,
                    lineHeight: isDesktop ? 48 : 38,
                    fontFamily: "Inter_700Bold",
                    letterSpacing: -0.6,
                  }}
                >
                  Lectures, CBT exams, personal reading, and carry-overs in one calm view.
                </Text>

                <Text
                  style={{
                    marginTop: 14,
                    color: "#334155",
                    fontSize: isDesktop ? 18 : 16,
                    lineHeight: isDesktop ? 28 : 24,
                    fontFamily: "Inter_400Regular",
                  }}
                >
                  University life is more than a static weekly lecture grid. TT brings your
                  department timetable, carry-over courses from other levels, exam seat numbers, and
                  personal study blocks together.
                </Text>
              </View>
            </ScrollReveal>

            {/* 2x2 Notion-Style Feature Bento Grid with Directional Scroll Reveals */}
            <View
              style={{
                marginTop: 40,
                flexDirection: isDesktop ? "row" : "column",
                flexWrap: "wrap",
                gap: 24,
              }}
            >
              {/* Bento Card 1: Classes & Calendar */}
              <ScrollReveal
                scrollY={scrollY}
                viewportHeight={viewportHeight}
                delayMs={0}
                direction={isDesktop ? "left" : "up"}
                distance={115}
                style={{ flex: 1, minWidth: isDesktop ? 520 : "100%" }}
              >
                <HoverLiftCard
                  style={{
                    flex: 1,
                    backgroundColor: "#F8FAFC",
                    borderRadius: 24,
                    padding: isDesktop ? 32 : 24,
                    borderWidth: 1,
                    borderColor: "#E2E8F0",
                    flexDirection: isTablet ? "row" : "column",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 24,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        alignSelf: "flex-start",
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 6,
                        backgroundColor: "#EEF2FF",
                        marginBottom: 12,
                      }}
                    >
                      <Text
                        style={{
                          color: "#4F46E5",
                          fontSize: 12,
                          lineHeight: 16,
                          fontFamily: "Inter_600SemiBold",
                        }}
                      >
                        Classes · List, Day, Week & Month
                      </Text>
                    </View>
                    <Text
                      style={{
                        color: "#0F172A",
                        fontSize: 22,
                        lineHeight: 30,
                        fontFamily: "Inter_700Bold",
                      }}
                    >
                      See your whole semester at a glance
                    </Text>
                    <Text
                      style={{
                        marginTop: 10,
                        color: "#475569",
                        fontSize: 15,
                        lineHeight: 23,
                        fontFamily: "Inter_400Regular",
                      }}
                    >
                      Flip between a clean daily card list and a full month grid. Busy-day dots and
                      4px course colour stripes make every lecture easy to scan in sunlight.
                    </Text>
                  </View>
                  <PhoneScreenshotFrame source={screenClassesMonth} width={bentoPhoneWidth} />
                </HoverLiftCard>
              </ScrollReveal>

              {/* Bento Card 2: Exams */}
              <ScrollReveal
                scrollY={scrollY}
                viewportHeight={viewportHeight}
                delayMs={150}
                direction={isDesktop ? "right" : "up"}
                distance={115}
                style={{ flex: 1, minWidth: isDesktop ? 520 : "100%" }}
              >
                <HoverLiftCard
                  style={{
                    flex: 1,
                    backgroundColor: "#F8FAFC",
                    borderRadius: 24,
                    padding: isDesktop ? 32 : 24,
                    borderWidth: 1,
                    borderColor: "#E2E8F0",
                    flexDirection: isTablet ? "row" : "column",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 24,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        alignSelf: "flex-start",
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 6,
                        backgroundColor: "#EDE9FE",
                        marginBottom: 12,
                      }}
                    >
                      <Text
                        style={{
                          color: "#5B21B6",
                          fontSize: 12,
                          lineHeight: 16,
                          fontFamily: "Inter_600SemiBold",
                        }}
                      >
                        Exams · Written & CBT
                      </Text>
                    </View>
                    <Text
                      style={{
                        color: "#0F172A",
                        fontSize: 22,
                        lineHeight: 30,
                        fontFamily: "Inter_700Bold",
                      }}
                    >
                      Count down to every paper with seat numbers
                    </Text>
                    <Text
                      style={{
                        marginTop: 10,
                        color: "#475569",
                        fontSize: 15,
                        lineHeight: 23,
                        fontFamily: "Inter_400Regular",
                      }}
                    >
                      See how many days remain until your first paper, track moved CBT times, and
                      store your private seat number where only you can see it.
                    </Text>
                  </View>
                  <PhoneScreenshotFrame source={screenExams} width={bentoPhoneWidth} />
                </HoverLiftCard>
              </ScrollReveal>

              {/* Bento Card 3: Reading Timetable */}
              <ScrollReveal
                scrollY={scrollY}
                viewportHeight={viewportHeight}
                delayMs={100}
                direction={isDesktop ? "left" : "up"}
                distance={115}
                style={{ flex: 1, minWidth: isDesktop ? 520 : "100%" }}
              >
                <HoverLiftCard
                  style={{
                    flex: 1,
                    backgroundColor: "#F8FAFC",
                    borderRadius: 24,
                    padding: isDesktop ? 32 : 24,
                    borderWidth: 1,
                    borderColor: "#E2E8F0",
                    flexDirection: isTablet ? "row" : "column",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 24,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        alignSelf: "flex-start",
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 6,
                        backgroundColor: "#CCFBF1",
                        marginBottom: 12,
                      }}
                    >
                      <Text
                        style={{
                          color: "#0F766E",
                          fontSize: 12,
                          lineHeight: 16,
                          fontFamily: "Inter_600SemiBold",
                        }}
                      >
                        Reading · Personal study blocks
                      </Text>
                    </View>
                    <Text
                      style={{
                        color: "#0F172A",
                        fontSize: 22,
                        lineHeight: 30,
                        fontFamily: "Inter_700Bold",
                      }}
                    >
                      Build a personal reading habit that sticks
                    </Text>
                    <Text
                      style={{
                        marginTop: 10,
                        color: "#475569",
                        fontSize: 15,
                        lineHeight: 23,
                        fontFamily: "Inter_400Regular",
                      }}
                    >
                      Schedule quiet library or hostel study sessions around your lectures, check
                      off past questions, and keep your weekly reading streak alive.
                    </Text>
                  </View>
                  <PhoneScreenshotFrame source={screenReading} width={bentoPhoneWidth} />
                </HoverLiftCard>
              </ScrollReveal>

              {/* Bento Card 4: Carry-over & Class Switcher */}
              <ScrollReveal
                scrollY={scrollY}
                viewportHeight={viewportHeight}
                delayMs={240}
                direction={isDesktop ? "right" : "up"}
                distance={115}
                style={{ flex: 1, minWidth: isDesktop ? 520 : "100%" }}
              >
                <HoverLiftCard
                  style={{
                    flex: 1,
                    backgroundColor: "#F8FAFC",
                    borderRadius: 24,
                    padding: isDesktop ? 32 : 24,
                    borderWidth: 1,
                    borderColor: "#E2E8F0",
                    flexDirection: isTablet ? "row" : "column",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 24,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        alignSelf: "flex-start",
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 6,
                        backgroundColor: "#FCE7F3",
                        marginBottom: 12,
                      }}
                    >
                      <Text
                        style={{
                          color: "#9D174D",
                          fontSize: 12,
                          lineHeight: 16,
                          fontFamily: "Inter_600SemiBold",
                        }}
                      >
                        Class switcher · Carry-overs & electives
                      </Text>
                    </View>
                    <Text
                      style={{
                        color: "#0F172A",
                        fontSize: 22,
                        lineHeight: 30,
                        fontFamily: "Inter_700Bold",
                      }}
                    >
                      Follow carry-over courses from other levels
                    </Text>
                    <Text
                      style={{
                        marginTop: 10,
                        color: "#475569",
                        fontSize: 15,
                        lineHeight: 23,
                        fontFamily: "Inter_400Regular",
                      }}
                    >
                      Taking STA 211 with 200L while in 300L? Subscribe to just that course from
                      their class link and TT warns you immediately if a lecture clashes.
                    </Text>
                  </View>
                  <PhoneScreenshotFrame source={screenClassSwitcher} width={bentoPhoneWidth} />
                </HoverLiftCard>
              </ScrollReveal>
            </View>
          </View>
        </View>

        {/* =================================================================== */}
        {/* 5. CHAPTER 3: DARK MODE CONTRAST — REMINDERS, WIDGETS & OFFLINE     */}
        {/* =================================================================== */}
        <View
          style={{
            width: "100%",
            backgroundColor: "#0F172A",
          }}
        >
          <View
            style={{
              width: "100%",
              maxWidth: 1200,
              alignSelf: "center",
              paddingHorizontal: isDesktop ? 32 : 20,
              paddingVertical: isDesktop ? 88 : 56,
            }}
          >
            <ScrollReveal scrollY={scrollY} viewportHeight={viewportHeight} distance={32}>
              <View style={{ maxWidth: 740 }}>
                <View
                  style={{
                    alignSelf: "flex-start",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 5,
                    borderRadius: 999,
                    backgroundColor: "rgba(79, 70, 229, 0.25)",
                    borderWidth: 1,
                    borderColor: "rgba(129, 140, 248, 0.35)",
                    marginBottom: 14,
                  }}
                >
                  <Bell size={14} color="#A5B4FC" />
                  <Text
                    style={{
                      color: "#C7D2FE",
                      fontSize: 12,
                      lineHeight: 16,
                      fontFamily: "Inter_600SemiBold",
                    }}
                  >
                    Wall-clock reminders · Offline-first · Home-screen widgets
                  </Text>
                </View>

                <Text
                  style={{
                    color: "#F8FAFC",
                    fontSize: isDesktop ? 40 : 30,
                    lineHeight: isDesktop ? 48 : 38,
                    fontFamily: "Inter_700Bold",
                    letterSpacing: -0.6,
                  }}
                >
                  Reminders that tell you what and where—even when campus Wi-Fi drops.
                </Text>

                <Text
                  style={{
                    marginTop: 14,
                    color: "#CBD5E1",
                    fontSize: isDesktop ? 18 : 16,
                    lineHeight: isDesktop ? 28 : 24,
                    fontFamily: "Inter_400Regular",
                  }}
                >
                  No vague &ldquo;You have a class coming up!&rdquo; popups. TT schedules local
                  alarms on your phone with the course code, minutes left, and lecture theatre—and
                  updates them the moment your rep moves or cancels a class.
                </Text>
              </View>
            </ScrollReveal>

            <View
              style={{
                marginTop: 40,
                flexDirection: isDesktop ? "row" : "column",
                alignItems: "stretch",
                justifyContent: "space-between",
                gap: 24,
              }}
            >
              {/* Dark Card 1: Lock screen notifications */}
              <ScrollReveal
                scrollY={scrollY}
                viewportHeight={viewportHeight}
                delayMs={0}
                direction={isDesktop ? "left" : "up"}
                distance={110}
                style={{ flex: 1 }}
              >
                <HoverLiftCard
                  style={{
                    flex: 1,
                    backgroundColor: "#1E293B",
                    borderRadius: 24,
                    padding: 24,
                    borderWidth: 1,
                    borderColor: "rgba(255, 255, 255, 0.1)",
                    alignItems: "center",
                  }}
                >
                  <PhoneScreenshotFrame
                    source={screenLockNotifications}
                    width={chapterThreeUpWidth}
                    darkSurface
                    tag="Lock-screen notices"
                    title="Plain, specific alerts you can read at a glance"
                    subtitle="“CSC 301 in 30 min, LT1” · “MTH 301 moved to LT2, 10am” · “Cancelled: CSC 301 at 10am”."
                  />
                </HoverLiftCard>
              </ScrollReveal>

              {/* Dark Card 2: Home-screen widgets */}
              <ScrollReveal
                scrollY={scrollY}
                viewportHeight={viewportHeight}
                delayMs={160}
                direction="scale"
                distance={115}
                style={{ flex: 1 }}
              >
                <HoverLiftCard
                  style={{
                    flex: 1,
                    backgroundColor: "#1E293B",
                    borderRadius: 24,
                    padding: 24,
                    borderWidth: 1,
                    borderColor: "rgba(255, 255, 255, 0.1)",
                    alignItems: "center",
                  }}
                >
                  <PhoneScreenshotFrame
                    source={screenWidgets}
                    width={chapterThreeUpWidth}
                    darkSurface
                    tag="Home-screen widgets"
                    title="Next class and due work right on your home screen"
                    subtitle="Widgets read directly from your phone’s local database, so they work offline and update when a class moves."
                  />
                </HoverLiftCard>
              </ScrollReveal>

              {/* Dark Card 3: Offline mode */}
              <ScrollReveal
                scrollY={scrollY}
                viewportHeight={viewportHeight}
                delayMs={320}
                direction={isDesktop ? "right" : "up"}
                distance={110}
                style={{ flex: 1 }}
              >
                <HoverLiftCard
                  style={{
                    flex: 1,
                    backgroundColor: "#1E293B",
                    borderRadius: 24,
                    padding: 24,
                    borderWidth: 1,
                    borderColor: "rgba(255, 255, 255, 0.1)",
                    alignItems: "center",
                  }}
                >
                  <PhoneScreenshotFrame
                    source={screenTodayOffline}
                    width={chapterThreeUpWidth}
                    darkSurface
                    tag="100% offline ready"
                    title="Never blanks out when you have zero bars"
                    subtitle="Your timetable, check-ins, and changes are stored on-device and sync automatically when you reconnect."
                  />
                </HoverLiftCard>
              </ScrollReveal>
            </View>
          </View>
        </View>

        {/* =================================================================== */}
        {/* 6. CHAPTER 4: 75% ATTENDANCE TARGET & GROUP ASSIGNMENT POLLS        */}
        {/* =================================================================== */}
        <View
          style={{
            width: "100%",
            maxWidth: 1200,
            alignSelf: "center",
            paddingHorizontal: isDesktop ? 32 : 20,
            paddingVertical: isDesktop ? 88 : 56,
          }}
        >
          <ScrollReveal scrollY={scrollY} viewportHeight={viewportHeight} distance={32}>
            <View style={{ maxWidth: 760 }}>
              <View
                style={{
                  alignSelf: "flex-start",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 5,
                  borderRadius: 999,
                  backgroundColor: "#DCFCE7",
                  marginBottom: 14,
                }}
              >
                <BarChart2 size={14} color="#166534" />
                <Text
                  style={{
                    color: "#166534",
                    fontSize: 12,
                    lineHeight: 16,
                    fontFamily: "Inter_600SemiBold",
                  }}
                >
                  75% attendance protection · Group work without chaos
                </Text>
              </View>

              <Text
                style={{
                  color: "#0F172A",
                  fontSize: isDesktop ? 40 : 30,
                  lineHeight: isDesktop ? 48 : 38,
                  fontFamily: "Inter_700Bold",
                  letterSpacing: -0.6,
                }}
              >
                Protect your exam eligibility and sort out group projects in seconds.
              </Text>

              <Text
                style={{
                  marginTop: 14,
                  color: "#334155",
                  fontSize: isDesktop ? 18 : 16,
                  lineHeight: isDesktop ? 28 : 24,
                  fontFamily: "Inter_400Regular",
                }}
              >
                Most students only discover they are below 75% attendance when the exam eligibility
                list is pasted on the department noticeboard. TT checks in after each lecture and
                tells you exactly how many classes you need to make the cut.
              </Text>
            </View>
          </ScrollReveal>

          <View
            style={{
              marginTop: 40,
              flexDirection: isDesktop ? "row" : "column",
              alignItems: "stretch",
              justifyContent: "space-between",
              gap: 24,
            }}
          >
            {/* Attendance Check-in */}
            <ScrollReveal
              scrollY={scrollY}
              viewportHeight={viewportHeight}
              delayMs={0}
              direction={isDesktop ? "left" : "up"}
              distance={110}
              style={{ flex: 1 }}
            >
              <HoverLiftCard
                style={{
                  flex: 1,
                  backgroundColor: "#FFFFFF",
                  borderRadius: 24,
                  padding: 24,
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                  alignItems: "center",
                }}
              >
                <PhoneScreenshotFrame
                  source={screenCheckIn}
                  width={chapterThreeUpWidth}
                  tag="Post-class prompt"
                  title="“Did you attend Operating Systems?”"
                  subtitle="10 minutes after lecture ends, tap Attended or Missed—or add an assignment announced in class."
                />
              </HoverLiftCard>
            </ScrollReveal>

            {/* Semester Reports & 75% Math */}
            <ScrollReveal
              scrollY={scrollY}
              viewportHeight={viewportHeight}
              delayMs={160}
              direction="scale"
              distance={115}
              style={{ flex: 1 }}
            >
              <HoverLiftCard
                style={{
                  flex: 1,
                  backgroundColor: "#FFFFFF",
                  borderRadius: 24,
                  padding: 24,
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                  alignItems: "center",
                }}
              >
                <PhoneScreenshotFrame
                  source={screenReports}
                  width={chapterThreeUpWidth}
                  tag="Semester reports"
                  title="“Attend 5 of the remaining 6 classes to finish at 75%”"
                  subtitle="Course-by-course attendance bars flag danger early so you can recover before exams."
                  accentColor="#B91C1C"
                  accentBg="#FEE2E2"
                />
              </HoverLiftCard>
            </ScrollReveal>

            {/* Group Assignment Poll */}
            <ScrollReveal
              scrollY={scrollY}
              viewportHeight={viewportHeight}
              delayMs={320}
              direction={isDesktop ? "right" : "up"}
              distance={110}
              style={{ flex: 1 }}
            >
              <HoverLiftCard
                style={{
                  flex: 1,
                  backgroundColor: "#FFFFFF",
                  borderRadius: 24,
                  padding: 24,
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                  alignItems: "center",
                }}
              >
                <PhoneScreenshotFrame
                  source={screenGroupPoll}
                  width={chapterThreeUpWidth}
                  tag="Group assignment polls"
                  title="“Which group are you in?”"
                  subtitle="Students join open groups up to the member cap (e.g. 6 of 6) without flooding the class group chat."
                  accentColor="#4F46E5"
                  accentBg="#EEF2FF"
                />
              </HoverLiftCard>
            </ScrollReveal>
          </View>
        </View>

        {/* =================================================================== */}
        {/* 7. AVAILABLE ON iOS — APP STORE DOWNLOAD CALL TO ACTION BANNER      */}
        {/* =================================================================== */}
        <View
          style={{
            width: "100%",
            paddingHorizontal: isDesktop ? 32 : 20,
            paddingBottom: isDesktop ? 56 : 40,
          }}
        >
          <ScrollReveal
            scrollY={scrollY}
            viewportHeight={viewportHeight}
            direction="scale"
            distance={48}
          >
            <View
              style={{
                width: "100%",
                maxWidth: 1136,
                alignSelf: "center",
                borderRadius: 28,
                backgroundColor: "#0F172A",
                borderWidth: 1.5,
                borderColor: "rgba(99, 102, 241, 0.45)",
                paddingHorizontal: isDesktop ? 56 : 24,
                paddingVertical: isDesktop ? 56 : 36,
                flexDirection: isDesktop ? "row" : "column",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 36,
                shadowColor: "#4F46E5",
                shadowOffset: { width: 0, height: 20 },
                shadowOpacity: 0.18,
                shadowRadius: 36,
              }}
            >
              {/* Left Column: App Store Call to Action Copy & Buttons */}
              <View style={{ flex: 1, maxWidth: 580 }}>
                <View
                  style={{
                    alignSelf: "flex-start",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    paddingHorizontal: 14,
                    paddingVertical: 6,
                    borderRadius: 999,
                    backgroundColor: "rgba(79, 70, 229, 0.28)",
                    borderWidth: 1,
                    borderColor: "rgba(129, 140, 248, 0.45)",
                    marginBottom: 16,
                  }}
                >
                  <Smartphone size={14} color="#A5B4FC" />
                  <Text
                    style={{
                      color: "#E0E7FF",
                      fontSize: 12,
                      lineHeight: 16,
                      fontFamily: "Inter_600SemiBold",
                    }}
                  >
                    Available now on iOS · iPhone & iPad
                  </Text>
                </View>

                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: isDesktop ? 38 : 28,
                    lineHeight: isDesktop ? 46 : 36,
                    fontFamily: "Inter_700Bold",
                    letterSpacing: -0.6,
                  }}
                >
                  Carry your class timetable in your pocket. Download TT on the App Store.
                </Text>

                <Text
                  style={{
                    marginTop: 14,
                    color: "#CBD5E1",
                    fontSize: 16,
                    lineHeight: 25,
                    fontFamily: "Inter_400Regular",
                  }}
                >
                  Get local wall-clock lecture alarms, home-screen widgets, offline SQLite access,
                  and instant course rep venue broadcasts on your iPhone or iPad. Free with zero
                  ads.
                </Text>

                <View
                  style={{
                    marginTop: 24,
                    flexDirection: isTablet ? "row" : "column",
                    alignItems: isTablet ? "center" : "stretch",
                    gap: 14,
                  }}
                >
                  <AppStoreBadgeButton variant="indigo" size="lg" fullWidth={!isTablet} />

                  <Pressable
                    onPress={() => router.push("/setup/welcome?mode=signup" as any)}
                    style={{
                      paddingHorizontal: 22,
                      paddingVertical: 15,
                      borderRadius: 14,
                      backgroundColor: "rgba(255, 255, 255, 0.08)",
                      borderWidth: 1,
                      borderColor: "rgba(255, 255, 255, 0.2)",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <Text
                      style={{
                        color: "#FFFFFF",
                        fontSize: 15,
                        lineHeight: 20,
                        fontFamily: "Inter_600SemiBold",
                      }}
                    >
                      Use web companion
                    </Text>
                    <ArrowRight size={16} color="#FFFFFF" />
                  </Pressable>
                </View>

                <View
                  style={{
                    marginTop: 22,
                    flexDirection: "row",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: 16,
                  }}
                >
                  {[
                    "Free on the App Store",
                    "Works 100% offline",
                    "Home & Lock screen widgets",
                    "iOS 16.4+",
                  ].map((item) => (
                    <View key={item} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <CheckCircle2 size={15} color="#4ADE80" />
                      <Text
                        style={{
                          color: "#CBD5E1",
                          fontSize: 13,
                          lineHeight: 18,
                          fontFamily: "Inter_500Medium",
                        }}
                      >
                        {item}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Right Column: Dual iPhone Preview Showcase */}
              <Pressable
                onPress={() => Linking.openURL(APP_STORE_URL)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: isTablet ? 18 : 12,
                }}
              >
                <PhoneScreenshotFrame
                  source={screenTodayR2}
                  width={isDesktop ? 200 : 165}
                  darkSurface
                  elevated
                  tag="iOS App"
                />
                {isTablet ? (
                  <PhoneScreenshotFrame
                    source={screenWidgets}
                    width={isDesktop ? 185 : 155}
                    darkSurface
                    tag="iOS Widgets"
                  />
                ) : null}
              </Pressable>
            </View>
          </ScrollReveal>
        </View>

        {/* =================================================================== */}
        {/* 8. INTERACTIVE CLASS PREVIEW BANNER                                 */}
        {/* =================================================================== */}
        <View
          style={{
            width: "100%",
            paddingHorizontal: isDesktop ? 32 : 20,
            paddingBottom: isDesktop ? 80 : 56,
          }}
        >
          <ScrollReveal
            scrollY={scrollY}
            viewportHeight={viewportHeight}
            direction="scale"
            distance={32}
          >
            <View
              style={{
                width: "100%",
                maxWidth: 1136,
                alignSelf: "center",
                borderRadius: 28,
                backgroundColor: "#4F46E5",
                paddingHorizontal: isDesktop ? 56 : 24,
                paddingVertical: isDesktop ? 56 : 36,
                flexDirection: isDesktop ? "row" : "column",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 32,
              }}
            >
              <View style={{ flex: 1, maxWidth: 580 }}>
                <Text
                  style={{
                    color: "#E0E7FF",
                    fontSize: 13,
                    lineHeight: 18,
                    fontFamily: "Inter_600SemiBold",
                    marginBottom: 8,
                  }}
                >
                  Try it right now · No account needed to look
                </Text>
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: isDesktop ? 34 : 26,
                    lineHeight: isDesktop ? 42 : 34,
                    fontFamily: "Inter_700Bold",
                  }}
                >
                  Have a 6-character class code from your course rep?
                </Text>
                <Text
                  style={{
                    marginTop: 10,
                    color: "#E0E7FF",
                    fontSize: 16,
                    lineHeight: 24,
                    fontFamily: "Inter_400Regular",
                  }}
                >
                  Enter a share code below to preview the live class timetable in your browser, or
                  create your free student account in under a minute.
                </Text>

                {/* Sample Class Code Chips */}
                <View
                  style={{
                    marginTop: 18,
                    flexDirection: "row",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Text
                    style={{
                      color: "#C7D2FE",
                      fontSize: 13,
                      lineHeight: 18,
                      fontFamily: "Inter_500Medium",
                    }}
                  >
                    Sample classes:
                  </Text>
                  {["CSC3X9", "CSC200", "ECO300"].map((sampleCode) => (
                    <Pressable
                      key={sampleCode}
                      onPress={() => {
                        setShareCodeInput(sampleCode);
                        handlePreviewCode(sampleCode);
                      }}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 5,
                        borderRadius: 999,
                        backgroundColor: "rgba(255, 255, 255, 0.16)",
                        borderWidth: 1,
                        borderColor: "rgba(255, 255, 255, 0.28)",
                      }}
                    >
                      <Text
                        style={{
                          color: "#FFFFFF",
                          fontSize: 13,
                          lineHeight: 18,
                          fontFamily: "Inter_700Bold",
                          letterSpacing: 1,
                        }}
                      >
                        {sampleCode}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Code Input Card */}
              <View
                style={{
                  width: isDesktop ? 380 : "100%",
                  backgroundColor: "#FFFFFF",
                  borderRadius: 20,
                  padding: 20,
                  shadowColor: "#0F172A",
                  shadowOffset: { width: 0, height: 16 },
                  shadowOpacity: 0.2,
                  shadowRadius: 28,
                }}
              >
                <Text
                  style={{
                    color: "#0F172A",
                    fontSize: 14,
                    lineHeight: 20,
                    fontFamily: "Inter_600SemiBold",
                    marginBottom: 8,
                  }}
                >
                  Enter class share code
                </Text>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <TextInput
                    value={shareCodeInput}
                    onChangeText={(text) => setShareCodeInput(text.toUpperCase())}
                    placeholder="CSC3X9"
                    placeholderTextColor="#94A3B8"
                    maxLength={8}
                    autoCapitalize="characters"
                    style={{
                      flex: 1,
                      height: 48,
                      borderRadius: 12,
                      borderWidth: 1.5,
                      borderColor: "#CBD5E1",
                      backgroundColor: "#F8FAFC",
                      paddingHorizontal: 14,
                      color: "#0F172A",
                      fontSize: 18,
                      fontFamily: "Inter_700Bold",
                      letterSpacing: 2,
                    }}
                  />
                  <Pressable
                    onPress={() => handlePreviewCode()}
                    style={{
                      height: 48,
                      paddingHorizontal: 18,
                      borderRadius: 12,
                      backgroundColor: "#0F172A",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "#FFFFFF",
                        fontSize: 14,
                        lineHeight: 20,
                        fontFamily: "Inter_600SemiBold",
                      }}
                    >
                      Preview
                    </Text>
                  </Pressable>
                </View>

                <View
                  style={{
                    height: 1,
                    backgroundColor: "#E2E8F0",
                    marginVertical: 16,
                  }}
                />

                <Pressable
                  onPress={() => router.push("/setup/welcome?mode=signup" as any)}
                  style={{
                    width: "100%",
                    paddingVertical: 12,
                    borderRadius: 12,
                    backgroundColor: "#EEF2FF",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#4F46E5",
                      fontSize: 14,
                      lineHeight: 20,
                      fontFamily: "Inter_600SemiBold",
                    }}
                  >
                    Or create a new shared class for your level →
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollReveal>
        </View>

        {/* =================================================================== */}
        {/* 9. COMPLIANT PRODUCT FOOTER (GOOGLE OAUTH & APP STORE VERIFIED)     */}
        {/* =================================================================== */}
        <View
          style={{
            width: "100%",
            backgroundColor: "#FFFFFF",
            borderTopWidth: 1,
            borderTopColor: "#E2E8F0",
          }}
        >
          <View
            style={{
              width: "100%",
              maxWidth: 1200,
              alignSelf: "center",
              paddingHorizontal: isDesktop ? 32 : 20,
              paddingVertical: 40,
              flexDirection: isTablet ? "row" : "column",
              alignItems: isTablet ? "center" : "flex-start",
              justifyContent: "space-between",
              gap: 24,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 9,
                  backgroundColor: "#0F172A",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                <Image
                  source={brandLogo}
                  style={{ width: 34, height: 34 }}
                  resizeMode="contain"
                  accessibilityLabel="TT: Student Timetable logo"
                />
              </View>
              <View>
                <Text
                  style={{
                    color: "#0F172A",
                    fontSize: 15,
                    lineHeight: 20,
                    fontFamily: "Inter_700Bold",
                  }}
                >
                  TT: Student Timetable
                </Text>
                <Text
                  style={{
                    color: "#64748B",
                    fontSize: 12,
                    lineHeight: 16,
                    fontFamily: "Inter_400Regular",
                  }}
                >
                  © {new Date().getFullYear()} EasyPass Software Solutions · NDPA 2023 compliant
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 20 }}>
              <Pressable onPress={() => Linking.openURL(APP_STORE_URL)}>
                <Text
                  style={{
                    color: "#4F46E5",
                    fontSize: 14,
                    lineHeight: 20,
                    fontFamily: "Inter_600SemiBold",
                  }}
                >
                   Download on the App Store
                </Text>
              </Pressable>

              <Pressable onPress={() => handlePreviewCode("CSC3X9")}>
                <Text
                  style={{
                    color: "#334155",
                    fontSize: 14,
                    lineHeight: 20,
                    fontFamily: "Inter_500Medium",
                  }}
                >
                  Preview Class (CSC3X9)
                </Text>
              </Pressable>

              <Pressable onPress={() => router.push("/setup/welcome?mode=signin" as any)}>
                <Text
                  style={{
                    color: "#334155",
                    fontSize: 14,
                    lineHeight: 20,
                    fontFamily: "Inter_500Medium",
                  }}
                >
                  Sign in
                </Text>
              </Pressable>

              <Pressable onPress={() => router.push("/setup/welcome?mode=signup" as any)}>
                <Text
                  style={{
                    color: "#334155",
                    fontSize: 14,
                    lineHeight: 20,
                    fontFamily: "Inter_500Medium",
                  }}
                >
                  Create account
                </Text>
              </Pressable>

              <Pressable onPress={() => router.push("/privacy" as any)}>
                <Text
                  style={{
                    color: "#4F46E5",
                    fontSize: 14,
                    lineHeight: 20,
                    fontFamily: "Inter_600SemiBold",
                  }}
                >
                  Privacy Policy
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
