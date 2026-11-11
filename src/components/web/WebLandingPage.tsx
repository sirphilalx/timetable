import React, { useState } from "react";
import {
  View,
  ScrollView,
  Pressable,
  TextInput,
  Image,
  useWindowDimensions,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Sparkles,
  Bell,
  Users,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  MapPin,
  ShieldCheck,
  WifiOff,
  Scan,
  BarChart2,
  Layers,
  Smartphone,
  Check,
} from "lucide-react-native";
import { Text } from "@/components/ui/Text";
import { QrMatrix } from "@/components/timetable/QrMatrix";

const brandLogo = require("../../../logo/Logo-dark.png");

const APP_STORE_SEARCH_URL = "https://apps.apple.com/search?term=TT%20Student%20Timetable";

type HeroPreviewTab = "today" | "calendar" | "assignments" | "attendance";

export function WebLandingPage() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 960;
  const isTablet = width >= 680;

  const [shareCodeInput, setShareCodeInput] = useState("CSC3X9");
  const [heroTab, setHeroTab] = useState<HeroPreviewTab>("today");

  const handlePreviewCode = (customCode?: string) => {
    const clean = (customCode ?? shareCodeInput).trim().toUpperCase() || "CSC3X9";
    router.push(`/join/${clean}` as any);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#090D16" }}
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      {/* AMBIENT RADIAL GLOW BACKDROP */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -120,
          left: isDesktop ? "15%" : -80,
          width: isDesktop ? 640 : 380,
          height: isDesktop ? 640 : 380,
          borderRadius: 999,
          backgroundColor: "rgba(79, 70, 229, 0.22)",
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 160,
          right: isDesktop ? "10%" : -100,
          width: isDesktop ? 520 : 320,
          height: isDesktop ? 520 : 320,
          borderRadius: 999,
          backgroundColor: "rgba(124, 58, 237, 0.16)",
        }}
      />

      {/* 1. STICKY TOP NAVIGATION BAR */}
      <View
        style={{
          width: "100%",
          borderBottomWidth: 1,
          borderBottomColor: "rgba(255, 255, 255, 0.08)",
          backgroundColor: "rgba(9, 13, 22, 0.88)",
        }}
      >
        <View
          style={{
            maxWidth: 1200,
            width: "100%",
            alignSelf: "center",
            paddingHorizontal: isDesktop ? 32 : 16,
            height: 72,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Brand Logo + Title */}
          <Pressable
            onPress={() => router.push("/" as any)}
            accessibilityRole="button"
            style={{ flexDirection: "row", alignItems: "center", columnGap: 12 }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 11,
                backgroundColor: "#1E1B4B",
                borderWidth: 1,
                borderColor: "rgba(129, 140, 248, 0.4)",
                overflow: "hidden",
                alignItems: "center",
                justifyContent: "center",
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
                variant="title-card"
                style={{
                  color: "#FFFFFF",
                  fontFamily: "Inter_700Bold",
                  fontSize: 17,
                  lineHeight: 20,
                }}
              >
                TT: Student Timetable
              </Text>
              <Text variant="caption" style={{ color: "#94A3B8", fontSize: 11 }}>
                Classes · Reminders · Course Sharing
              </Text>
            </View>
          </Pressable>

          {/* Right Navigation Actions */}
          <View
            style={{ flexDirection: "row", alignItems: "center", columnGap: isTablet ? 14 : 8 }}
          >
            {isTablet ? (
              <Pressable
                onPress={() => router.push("/privacy" as any)}
                accessibilityRole="link"
                style={{ paddingHorizontal: 10, paddingVertical: 8 }}
              >
                <Text variant="label" style={{ color: "#CBD5E1" }}>
                  Privacy Policy
                </Text>
              </Pressable>
            ) : null}

            <Pressable
              onPress={() => router.push("/setup/welcome?mode=signin" as any)}
              accessibilityRole="button"
              style={{
                paddingHorizontal: 14,
                height: 40,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: "rgba(255, 255, 255, 0.16)",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text variant="label" style={{ color: "#F8FAFC" }}>
                Sign in
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push("/setup/welcome?mode=signup" as any)}
              accessibilityRole="button"
              style={{
                paddingHorizontal: 16,
                height: 40,
                borderRadius: 10,
                backgroundColor: "#4F46E5",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text variant="label" style={{ color: "#FFFFFF", fontFamily: "Inter_600SemiBold" }}>
                {isTablet ? "Get Started Free" : "Start"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* 2. HERO SECTION (UI-FIRST + PAIN-TO-PEACE HEADLINE + ZERO-LOGIN CLASS CODE PREVIEW) */}
      <View
        style={{
          maxWidth: 1200,
          width: "100%",
          alignSelf: "center",
          paddingHorizontal: isDesktop ? 32 : 18,
          paddingTop: isDesktop ? 64 : 36,
          paddingBottom: isDesktop ? 72 : 48,
          flexDirection: isDesktop ? "row" : "column",
          alignItems: "center",
          justifyContent: "space-between",
          columnGap: 48,
          rowGap: 44,
        }}
      >
        {/* Left Column: Editorial Copy + Interactive Share Code Bar + Store CTAs */}
        <View style={{ flex: isDesktop ? 1.08 : undefined, width: "100%" }}>
          {/* Category Badge */}
          <View
            style={{
              alignSelf: isDesktop ? "flex-start" : "center",
              flexDirection: "row",
              alignItems: "center",
              columnGap: 8,
              paddingHorizontal: 14,
              paddingVertical: 7,
              borderRadius: 999,
              backgroundColor: "rgba(79, 70, 229, 0.18)",
              borderWidth: 1,
              borderColor: "rgba(129, 140, 248, 0.36)",
              marginBottom: 20,
            }}
          >
            <Sparkles size={14} color="#818CF8" strokeWidth={2.2} />
            <Text
              variant="label-sm"
              style={{
                color: "#E0E7FF",
                fontFamily: "Inter_700Bold",
                letterSpacing: 0.6,
              }}
            >
              NOW LIVE ON iOS, iPAD & WEB · BUILT FOR UNIVERSITY LIFE
            </Text>
          </View>

          <Text
            variant="display"
            style={{
              color: "#FFFFFF",
              fontSize: isDesktop ? 54 : isTablet ? 44 : 34,
              lineHeight: isDesktop ? 60 : isTablet ? 50 : 40,
              fontFamily: "Inter_700Bold",
              textAlign: isDesktop ? "left" : "center",
              marginBottom: 18,
            }}
          >
            Your entire semester.{"\n"}
            <Text
              variant="display"
              style={{
                color: "#818CF8",
                fontSize: isDesktop ? 54 : isTablet ? 44 : 34,
                lineHeight: isDesktop ? 60 : isTablet ? 50 : 40,
                fontFamily: "Inter_700Bold",
              }}
            >
              Always on time.
            </Text>
          </Text>

          <Text
            variant="body-lg"
            style={{
              color: "#CBD5E1",
              fontSize: isDesktop ? 19 : 16,
              lineHeight: isDesktop ? 29 : 25,
              textAlign: isDesktop ? "left" : "center",
              marginBottom: 28,
            }}
          >
            Stop digging through WhatsApp group chats for blurry timetable photos and last-minute
            venue changes. Join your department&apos;s shared timetable in seconds with one
            6-character code—works 100% offline with wall-clock class alarms and 75% attendance
            tracking.
          </Text>

          {/* ZERO-LOGIN DISCOVERY: Interactive 6-Character Class Code Bar */}
          <View
            style={{
              backgroundColor: "#131C31",
              borderRadius: 18,
              borderWidth: 1,
              borderColor: "rgba(129, 140, 248, 0.32)",
              padding: 16,
              marginBottom: 20,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <Text
                variant="label"
                style={{ color: "#E0E7FF", fontFamily: "Inter_600SemiBold", fontSize: 13 }}
              >
                Have a class share code? Preview a live timetable right now:
              </Text>
              <Text variant="caption" style={{ color: "#818CF8", fontFamily: "Inter_600SemiBold" }}>
                No login required
              </Text>
            </View>

            <View
              style={{
                flexDirection: isTablet ? "row" : "column",
                alignItems: "stretch",
                columnGap: 10,
                rowGap: 10,
              }}
            >
              <View
                style={{
                  flex: 1,
                  height: 50,
                  borderRadius: 12,
                  backgroundColor: "#090D16",
                  borderWidth: 1,
                  borderColor: "#334155",
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 14,
                }}
              >
                <Scan size={18} color="#818CF8" strokeWidth={2} />
                <TextInput
                  value={shareCodeInput}
                  onChangeText={(t) => setShareCodeInput(t.toUpperCase())}
                  placeholder="CSC3X9"
                  placeholderTextColor="#64748B"
                  maxLength={10}
                  autoCapitalize="characters"
                  style={{
                    flex: 1,
                    marginLeft: 10,
                    color: "#FFFFFF",
                    fontFamily: "Inter_700Bold",
                    fontSize: 16,
                    letterSpacing: 2,
                  }}
                />
              </View>

              <Pressable
                onPress={() => handlePreviewCode()}
                accessibilityRole="button"
                style={{
                  height: 50,
                  paddingHorizontal: 22,
                  borderRadius: 12,
                  backgroundColor: "#4F46E5",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  columnGap: 8,
                }}
              >
                <Text variant="label-lg" style={{ color: "#FFFFFF", fontFamily: "Inter_700Bold" }}>
                  Preview Class
                </Text>
                <ArrowRight size={17} color="#FFFFFF" strokeWidth={2.4} />
              </Pressable>
            </View>

            {/* Quick Sample Class Pills */}
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 8,
                marginTop: 12,
              }}
            >
              <Text variant="caption" style={{ color: "#94A3B8" }}>
                Try sample codes:
              </Text>
              {[
                { code: "CSC3X9", label: "CSC3X9 · 300L Computer Science" },
                { code: "CSC200", label: "CSC200 · Carry-over" },
                { code: "ECO300", label: "ECO300 · Elective" },
              ].map((preset) => (
                <Pressable
                  key={preset.code}
                  onPress={() => {
                    setShareCodeInput(preset.code);
                    handlePreviewCode(preset.code);
                  }}
                  accessibilityRole="button"
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 999,
                    backgroundColor: "rgba(99, 102, 241, 0.16)",
                    borderWidth: 1,
                    borderColor: "rgba(129, 140, 248, 0.28)",
                  }}
                >
                  <Text
                    variant="caption"
                    style={{ color: "#C7D2FE", fontFamily: "Inter_600SemiBold" }}
                  >
                    {preset.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Primary Download & Web App Buttons */}
          <View
            style={{
              flexDirection: isTablet ? "row" : "column",
              alignItems: "center",
              columnGap: 12,
              rowGap: 12,
            }}
          >
            <Pressable
              onPress={() => void Linking.openURL(APP_STORE_SEARCH_URL)}
              accessibilityRole="button"
              style={{
                width: isTablet ? undefined : "100%",
                flex: isTablet ? 1 : undefined,
                height: 54,
                borderRadius: 14,
                backgroundColor: "#FFFFFF",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                columnGap: 10,
                paddingHorizontal: 20,
              }}
            >
              <Text style={{ fontSize: 20, color: "#090D16" }}></Text>
              <View>
                <Text variant="caption" style={{ color: "#475569", fontSize: 10, lineHeight: 12 }}>
                  Download on the
                </Text>
                <Text
                  variant="label-lg"
                  style={{ color: "#090D16", fontFamily: "Inter_700Bold", lineHeight: 18 }}
                >
                  App Store (iPhone & iPad)
                </Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => router.push("/setup/welcome" as any)}
              accessibilityRole="button"
              style={{
                width: isTablet ? undefined : "100%",
                flex: isTablet ? 1 : undefined,
                height: 54,
                borderRadius: 14,
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                borderWidth: 1,
                borderColor: "rgba(255, 255, 255, 0.2)",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                columnGap: 10,
                paddingHorizontal: 20,
              }}
            >
              <Smartphone size={18} color="#E0E7FF" strokeWidth={2.2} />
              <Text
                variant="label-lg"
                style={{ color: "#FFFFFF", fontFamily: "Inter_600SemiBold" }}
              >
                Open Web Companion
              </Text>
            </Pressable>
          </View>

          {/* Trust Micro-Pills */}
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: isDesktop ? "flex-start" : "center",
              gap: 16,
              marginTop: 22,
            }}
          >
            {[
              { icon: WifiOff, text: "Works 100% Offline" },
              { icon: Bell, text: "Exact Wall-Clock Alarms" },
              { icon: ShieldCheck, text: "NDPA 2023 Privacy Compliant" },
            ].map((item) => (
              <View
                key={item.text}
                style={{ flexDirection: "row", alignItems: "center", columnGap: 6 }}
              >
                <item.icon size={14} color="#34D399" strokeWidth={2.2} />
                <Text variant="caption" style={{ color: "#94A3B8", fontFamily: "Inter_500Medium" }}>
                  {item.text}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Right Column: Interactive Titanium iPhone Mockup with Live Screen Switcher */}
        <View style={{ flex: isDesktop ? 0.92 : undefined, width: "100%", alignItems: "center" }}>
          {/* Interactive Screen Switcher Pills above the phone */}
          <View
            style={{
              flexDirection: "row",
              backgroundColor: "#131C31",
              borderRadius: 999,
              padding: 4,
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.12)",
              marginBottom: 18,
              columnGap: 4,
            }}
          >
            {(
              [
                { id: "today", label: "Today" },
                { id: "calendar", label: "4-in-1 Calendar" },
                { id: "assignments", label: "Assignments" },
                { id: "attendance", label: "75% Target" },
              ] as const
            ).map((tab) => {
              const active = heroTab === tab.id;
              return (
                <Pressable
                  key={tab.id}
                  onPress={() => setHeroTab(tab.id)}
                  accessibilityRole="button"
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 7,
                    borderRadius: 999,
                    backgroundColor: active ? "#4F46E5" : "transparent",
                  }}
                >
                  <Text
                    variant="caption"
                    style={{
                      color: active ? "#FFFFFF" : "#94A3B8",
                      fontFamily: active ? "Inter_700Bold" : "Inter_500Medium",
                    }}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Titanium iPhone 16 Pro Frame */}
          <View
            style={{
              width: "100%",
              maxWidth: 380,
              borderRadius: 44,
              padding: 10,
              backgroundColor: "#1E293B",
              borderWidth: 2,
              borderColor: "rgba(255, 255, 255, 0.22)",
            }}
          >
            <View
              style={{
                borderRadius: 36,
                backgroundColor: "#F8FAFC",
                overflow: "hidden",
                paddingHorizontal: 16,
                paddingTop: 14,
                paddingBottom: 20,
                minHeight: 540,
              }}
            >
              {/* iOS Status Bar + Dynamic Island */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <Text variant="label-sm" style={{ color: "#0F172A", fontFamily: "Inter_700Bold" }}>
                  9:41
                </Text>
                <View
                  style={{
                    width: 88,
                    height: 22,
                    borderRadius: 999,
                    backgroundColor: "#090D16",
                  }}
                />
                <Text
                  variant="caption"
                  style={{ color: "#0F172A", fontFamily: "Inter_700Bold", fontSize: 11 }}
                >
                  5G · 100%
                </Text>
              </View>

              {/* Dynamic Screen Content based on Selected Preview Tab */}
              {heroTab === "today" ? (
                <View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 12,
                    }}
                  >
                    <View>
                      <Text
                        variant="title-section"
                        style={{ color: "#0F172A", fontFamily: "Inter_700Bold", fontSize: 22 }}
                      >
                        Today
                      </Text>
                      <Text variant="caption" style={{ color: "#64748B" }}>
                        CSC 300L · Computer Science
                      </Text>
                    </View>
                    <View
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 17,
                        backgroundColor: "#EEF2FF",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        variant="label-sm"
                        style={{ color: "#4F46E5", fontFamily: "Inter_700Bold" }}
                      >
                        AE
                      </Text>
                    </View>
                  </View>

                  {/* Hero Next Class Card */}
                  <View
                    style={{
                      borderRadius: 18,
                      backgroundColor: "#4F46E5",
                      padding: 16,
                      marginBottom: 14,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <View
                        style={{
                          paddingHorizontal: 10,
                          paddingVertical: 3,
                          borderRadius: 999,
                          backgroundColor: "rgba(255,255,255,0.2)",
                        }}
                      >
                        <Text
                          variant="caption"
                          style={{ color: "#FFFFFF", fontFamily: "Inter_700Bold" }}
                        >
                          NEXT CLASS · IN 25 MIN
                        </Text>
                      </View>
                      <Text variant="caption" style={{ color: "#E0E7FF" }}>
                        09:00 – 11:00
                      </Text>
                    </View>
                    <Text
                      variant="title-card"
                      style={{
                        color: "#FFFFFF",
                        fontFamily: "Inter_700Bold",
                        fontSize: 17,
                        marginBottom: 4,
                      }}
                    >
                      CSC 301 · Operating Systems
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center", columnGap: 6 }}>
                      <MapPin size={13} color="#C7D2FE" strokeWidth={2.2} />
                      <Text variant="caption" style={{ color: "#E0E7FF" }}>
                        LT1, Faculty of Science · Dr. Omoregie
                      </Text>
                    </View>
                  </View>

                  {/* Remaining Classes Today */}
                  <Text
                    variant="label"
                    style={{
                      color: "#0F172A",
                      fontFamily: "Inter_700Bold",
                      marginBottom: 8,
                    }}
                  >
                    Later Today (3)
                  </Text>
                  {[
                    {
                      time: "12:00 – 2:00 pm",
                      code: "CSC 305",
                      title: "Database Systems · Practical",
                      venue: "Hardware Lab, Computer Science",
                      color: "#0D9488",
                    },
                    {
                      time: "3:00 – 4:30 pm",
                      code: "MTH 201",
                      title: "Linear Algebra · Lecture",
                      venue: "500LT, Physical Sciences",
                      color: "#EA580C",
                    },
                    {
                      time: "7:00 – 9:00 pm",
                      code: "STUDY · CSC 301",
                      title: "Past Questions & Kernel Threads",
                      venue: "John Harris Library",
                      color: "#7C3AED",
                    },
                  ].map((item) => (
                    <View
                      key={item.code}
                      style={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: "#E2E8F0",
                        borderLeftWidth: 4,
                        borderLeftColor: item.color,
                        padding: 12,
                        marginBottom: 9,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 3,
                        }}
                      >
                        <Text
                          variant="label-sm"
                          style={{ color: item.color, fontFamily: "Inter_700Bold" }}
                        >
                          {item.code}
                        </Text>
                        <Text variant="caption" style={{ color: "#64748B" }}>
                          {item.time}
                        </Text>
                      </View>
                      <Text
                        variant="label"
                        style={{ color: "#0F172A", fontFamily: "Inter_600SemiBold" }}
                      >
                        {item.title}
                      </Text>
                      <Text variant="caption" style={{ color: "#64748B", marginTop: 2 }}>
                        {item.venue}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}

              {heroTab === "calendar" ? (
                <View>
                  <Text
                    variant="title-section"
                    style={{
                      color: "#0F172A",
                      fontFamily: "Inter_700Bold",
                      fontSize: 20,
                      marginBottom: 4,
                    }}
                  >
                    Classes & Calendar
                  </Text>
                  <Text variant="caption" style={{ color: "#64748B", marginBottom: 12 }}>
                    All 4 calendars · Main, Carry-over & Electives
                  </Text>

                  {/* Filter Pills */}
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: 6,
                      marginBottom: 14,
                    }}
                  >
                    {[
                      { label: "All", active: true },
                      { label: "Classes", active: false },
                      { label: "Assignments", active: false },
                      { label: "Exams", active: false },
                      { label: "Study", active: false },
                    ].map((f) => (
                      <View
                        key={f.label}
                        style={{
                          paddingHorizontal: 10,
                          paddingVertical: 5,
                          borderRadius: 999,
                          backgroundColor: f.active ? "#4F46E5" : "#EEF2FF",
                        }}
                      >
                        <Text
                          variant="caption"
                          style={{
                            color: f.active ? "#FFFFFF" : "#4F46E5",
                            fontFamily: "Inter_600SemiBold",
                          }}
                        >
                          {f.label}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Mini Week Strip */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      backgroundColor: "#FFFFFF",
                      borderRadius: 14,
                      padding: 10,
                      borderWidth: 1,
                      borderColor: "#E2E8F0",
                      marginBottom: 14,
                    }}
                  >
                    {[
                      { d: "Mon", n: "9", active: false },
                      { d: "Tue", n: "10", active: false },
                      { d: "Wed", n: "11", active: true },
                      { d: "Thu", n: "12", active: false },
                      { d: "Fri", n: "13", active: false },
                    ].map((day) => (
                      <View
                        key={day.d}
                        style={{
                          alignItems: "center",
                          paddingHorizontal: 10,
                          paddingVertical: 6,
                          borderRadius: 10,
                          backgroundColor: day.active ? "#4F46E5" : "transparent",
                        }}
                      >
                        <Text
                          variant="caption"
                          style={{ color: day.active ? "#E0E7FF" : "#64748B" }}
                        >
                          {day.d}
                        </Text>
                        <Text
                          variant="label"
                          style={{
                            color: day.active ? "#FFFFFF" : "#0F172A",
                            fontFamily: "Inter_700Bold",
                          }}
                        >
                          {day.n}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Multi-calendar cards */}
                  {[
                    {
                      badge: "MAIN · CSC 300L",
                      title: "CSC 301 · Operating Systems",
                      meta: "08:00 – 10:00 · LT1, Faculty of Science",
                      color: "#4F46E5",
                    },
                    {
                      badge: "CARRY-OVER · 200L",
                      title: "STA 211 · Probability II",
                      meta: "10:00 – 12:00 · LT2, Physical Sciences",
                      color: "#D97706",
                    },
                    {
                      badge: "ELECTIVE · ECO 300L",
                      title: "ECO 303 · Macroeconomic Theory",
                      meta: "1:00 – 3:00 pm · Social Sciences Hall B",
                      color: "#0D9488",
                    },
                    {
                      badge: "EXAM · CBT",
                      title: "CSC 301 Mid-Semester CBT",
                      meta: "Sat 10:00 am · ICT CBT Centre Hall B",
                      color: "#DC2626",
                    },
                  ].map((item) => (
                    <View
                      key={item.title}
                      style={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: "#E2E8F0",
                        borderLeftWidth: 4,
                        borderLeftColor: item.color,
                        padding: 11,
                        marginBottom: 8,
                      }}
                    >
                      <Text
                        variant="caption"
                        style={{
                          color: item.color,
                          fontFamily: "Inter_700Bold",
                          fontSize: 10,
                        }}
                      >
                        {item.badge}
                      </Text>
                      <Text
                        variant="label"
                        style={{ color: "#0F172A", fontFamily: "Inter_600SemiBold" }}
                      >
                        {item.title}
                      </Text>
                      <Text variant="caption" style={{ color: "#64748B" }}>
                        {item.meta}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}

              {heroTab === "assignments" ? (
                <View>
                  <Text
                    variant="title-section"
                    style={{
                      color: "#0F172A",
                      fontFamily: "Inter_700Bold",
                      fontSize: 20,
                      marginBottom: 4,
                    }}
                  >
                    Assignments & Polls
                  </Text>
                  <Text variant="caption" style={{ color: "#64748B", marginBottom: 14 }}>
                    7:00 PM evening-before & 3-hour deadline alerts
                  </Text>

                  {[
                    {
                      course: "CSC 301",
                      title: "Process Scheduling & Deadlock Lab Report",
                      due: "Due Today · 5:00 pm",
                      tag: "Solo · In progress",
                      color: "#4F46E5",
                    },
                    {
                      course: "CSC 305",
                      title: "Hospital ER Relational Schema (Group 4)",
                      due: "Due Tomorrow · 11:59 pm",
                      tag: "Group Poll · 6/6 members",
                      color: "#0D9488",
                    },
                    {
                      course: "MTH 201",
                      title: "Eigenvalues & Cayley-Hamilton Problem Set",
                      due: "Completed · Ahead of deadline",
                      tag: "Done ✓",
                      color: "#16A34A",
                    },
                  ].map((asg) => (
                    <View
                      key={asg.title}
                      style={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: "#E2E8F0",
                        borderLeftWidth: 4,
                        borderLeftColor: asg.color,
                        padding: 13,
                        marginBottom: 10,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          marginBottom: 4,
                        }}
                      >
                        <Text
                          variant="label-sm"
                          style={{ color: asg.color, fontFamily: "Inter_700Bold" }}
                        >
                          {asg.course}
                        </Text>
                        <Text
                          variant="caption"
                          style={{ color: "#475569", fontFamily: "Inter_600SemiBold" }}
                        >
                          {asg.tag}
                        </Text>
                      </View>
                      <Text
                        variant="label"
                        style={{
                          color: "#0F172A",
                          fontFamily: "Inter_600SemiBold",
                          marginBottom: 3,
                        }}
                      >
                        {asg.title}
                      </Text>
                      <Text variant="caption" style={{ color: "#64748B" }}>
                        {asg.due}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}

              {heroTab === "attendance" ? (
                <View>
                  <Text
                    variant="title-section"
                    style={{
                      color: "#0F172A",
                      fontFamily: "Inter_700Bold",
                      fontSize: 20,
                      marginBottom: 4,
                    }}
                  >
                    Attendance & Reports
                  </Text>
                  <Text variant="caption" style={{ color: "#64748B", marginBottom: 14 }}>
                    75% university exam eligibility tracker
                  </Text>

                  <View
                    style={{
                      flexDirection: "row",
                      columnGap: 10,
                      marginBottom: 14,
                    }}
                  >
                    <View
                      style={{
                        flex: 1,
                        backgroundColor: "#FFFFFF",
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: "#E2E8F0",
                        padding: 12,
                      }}
                    >
                      <Text variant="caption" style={{ color: "#64748B" }}>
                        Overall Attendance
                      </Text>
                      <Text
                        variant="display"
                        style={{
                          color: "#16A34A",
                          fontSize: 28,
                          lineHeight: 34,
                          fontFamily: "Inter_700Bold",
                        }}
                      >
                        94%
                      </Text>
                      <Text variant="caption" style={{ color: "#16A34A" }}>
                        +19% above 75% target
                      </Text>
                    </View>
                    <View
                      style={{
                        flex: 1,
                        backgroundColor: "#FFFFFF",
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: "#E2E8F0",
                        padding: 12,
                      }}
                    >
                      <Text variant="caption" style={{ color: "#64748B" }}>
                        Study Logged
                      </Text>
                      <Text
                        variant="display"
                        style={{
                          color: "#4F46E5",
                          fontSize: 28,
                          lineHeight: 34,
                          fontFamily: "Inter_700Bold",
                        }}
                      >
                        24 h
                      </Text>
                      <Text variant="caption" style={{ color: "#64748B" }}>
                        Across 4 courses
                      </Text>
                    </View>
                  </View>

                  {[
                    { code: "CSC 301 · Operating Systems", pct: "100%", color: "#4F46E5" },
                    { code: "CSC 305 · Database Systems", pct: "92%", color: "#0D9488" },
                    { code: "MTH 201 · Linear Algebra", pct: "88%", color: "#EA580C" },
                    { code: "GST 311 · Entrepreneurship", pct: "95%", color: "#7C3AED" },
                  ].map((c) => (
                    <View
                      key={c.code}
                      style={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: "#E2E8F0",
                        padding: 11,
                        marginBottom: 8,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          marginBottom: 6,
                        }}
                      >
                        <Text
                          variant="label-sm"
                          style={{ color: "#0F172A", fontFamily: "Inter_600SemiBold" }}
                        >
                          {c.code}
                        </Text>
                        <Text
                          variant="label-sm"
                          style={{ color: c.color, fontFamily: "Inter_700Bold" }}
                        >
                          {c.pct}
                        </Text>
                      </View>
                      <View
                        style={{
                          height: 6,
                          borderRadius: 999,
                          backgroundColor: "#E2E8F0",
                          overflow: "hidden",
                        }}
                      >
                        <View
                          style={{
                            width: c.pct as any,
                            height: "100%",
                            backgroundColor: c.color,
                          }}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          </View>
        </View>
      </View>

      {/* 3. BEFORE vs. WITH TT CONTRAST SECTION (STRUCTURED / NOTION CALENDAR PHILOSOPHY) */}
      <View
        style={{
          backgroundColor: "#0D1322",
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderColor: "rgba(255, 255, 255, 0.07)",
          paddingVertical: isDesktop ? 72 : 48,
        }}
      >
        <View
          style={{
            maxWidth: 1200,
            width: "100%",
            alignSelf: "center",
            paddingHorizontal: isDesktop ? 32 : 18,
          }}
        >
          <View style={{ alignItems: "center", marginBottom: 40 }}>
            <Text
              variant="label-sm"
              style={{
                color: "#818CF8",
                fontFamily: "Inter_700Bold",
                letterSpacing: 1,
                marginBottom: 8,
              }}
            >
              FROM WHATSAPP CHAOS TO CALM CLARITY
            </Text>
            <Text
              variant="title-page"
              style={{
                color: "#FFFFFF",
                fontSize: isDesktop ? 36 : 26,
                lineHeight: isDesktop ? 44 : 32,
                fontFamily: "Inter_700Bold",
                textAlign: "center",
              }}
            >
              Why university students are switching to TT
            </Text>
          </View>

          <View
            style={{
              flexDirection: isDesktop ? "row" : "column",
              columnGap: 24,
              rowGap: 20,
            }}
          >
            {/* Card A: The Old Way */}
            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(239, 68, 68, 0.06)",
                borderRadius: 22,
                borderWidth: 1,
                borderColor: "rgba(239, 68, 68, 0.24)",
                padding: 24,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  columnGap: 10,
                  marginBottom: 18,
                }}
              >
                <AlertCircle size={22} color="#F87171" strokeWidth={2.2} />
                <Text
                  variant="title-card"
                  style={{ color: "#FCA5A5", fontFamily: "Inter_700Bold", fontSize: 18 }}
                >
                  Without TT: Semester Stress
                </Text>
              </View>

              {[
                "Scrolling through 400+ unread WhatsApp messages just to find a blurry PDF of the department timetable.",
                "Walking all the way to LT1 at 8:00 AM only to find out the lecture moved to 500LT or was cancelled.",
                "Forgetting carry-over or elective lectures from other departments because they live on separate sheets.",
                "Guessing whether your attendance is above the 75% exam eligibility requirement until exam week.",
              ].map((point) => (
                <View
                  key={point}
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    columnGap: 10,
                    marginBottom: 14,
                  }}
                >
                  <Text style={{ color: "#F87171", fontSize: 16, lineHeight: 22 }}>✕</Text>
                  <Text variant="body" style={{ color: "#CBD5E1", flex: 1, lineHeight: 22 }}>
                    {point}
                  </Text>
                </View>
              ))}
            </View>

            {/* Card B: With TT */}
            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(79, 70, 229, 0.12)",
                borderRadius: 22,
                borderWidth: 1,
                borderColor: "rgba(129, 140, 248, 0.4)",
                padding: 24,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  columnGap: 10,
                  marginBottom: 18,
                }}
              >
                <CheckCircle2 size={22} color="#34D399" strokeWidth={2.2} />
                <Text
                  variant="title-card"
                  style={{ color: "#FFFFFF", fontFamily: "Inter_700Bold", fontSize: 18 }}
                >
                  With TT: Calm, Automatic Control
                </Text>
              </View>

              {[
                "Your Course Rep sets up the timetable once and shares a 6-character code (like CSC3X9). Everyone joins in 2 taps.",
                "When a lecturer moves or cancels a class, your rep broadcasts the update and every classmate gets an instant alert.",
                "Combine your Main Class, Carry-Over Courses, and Electives into one unified 4-in-1 Multi-Calendar.",
                "1-tap post-class check-ins track your exact attendance percentage per course against your 75% target.",
              ].map((point) => (
                <View
                  key={point}
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    columnGap: 10,
                    marginBottom: 14,
                  }}
                >
                  <Check size={18} color="#34D399" strokeWidth={2.5} style={{ marginTop: 2 }} />
                  <Text variant="body" style={{ color: "#F8FAFC", flex: 1, lineHeight: 22 }}>
                    {point}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* 4. BENTO GRID FEATURE SHOWCASE */}
      <View
        style={{
          maxWidth: 1200,
          width: "100%",
          alignSelf: "center",
          paddingHorizontal: isDesktop ? 32 : 18,
          paddingVertical: isDesktop ? 80 : 52,
        }}
      >
        <View style={{ alignItems: "center", marginBottom: 44 }}>
          <Text
            variant="label-sm"
            style={{
              color: "#818CF8",
              fontFamily: "Inter_700Bold",
              letterSpacing: 1,
              marginBottom: 8,
            }}
          >
            DESIGNED FOR STUDENTS & COURSE REPS
          </Text>
          <Text
            variant="title-page"
            style={{
              color: "#FFFFFF",
              fontSize: isDesktop ? 38 : 28,
              lineHeight: isDesktop ? 46 : 34,
              fontFamily: "Inter_700Bold",
              textAlign: "center",
              maxWidth: 680,
            }}
          >
            Everything you need from first lecture to final exams
          </Text>
        </View>

        {/* Bento Row 1 */}
        <View
          style={{
            flexDirection: isDesktop ? "row" : "column",
            columnGap: 24,
            rowGap: 24,
            marginBottom: 24,
          }}
        >
          {/* Bento Card 1: One-Code Class Sharing */}
          <View
            style={{
              flex: 1.15,
              backgroundColor: "#131C31",
              borderRadius: 24,
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.1)",
              padding: 28,
              justifyContent: "space-between",
            }}
          >
            <View>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: "rgba(99, 102, 241, 0.2)",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <Users size={22} color="#818CF8" strokeWidth={2.2} />
              </View>
              <Text
                variant="title-section"
                style={{
                  color: "#FFFFFF",
                  fontFamily: "Inter_700Bold",
                  fontSize: 22,
                  marginBottom: 10,
                }}
              >
                One Code Sets Up the Entire Class
              </Text>
              <Text variant="body" style={{ color: "#94A3B8", lineHeight: 23, marginBottom: 22 }}>
                Course reps publish the semester schedule once and share a 6-character code or
                WhatsApp QR card. Classmates subscribe inMain, Carry-over, or Elective mode and
                receive live room changes automatically.
              </Text>
            </View>

            <View
              style={{
                flexDirection: isTablet ? "row" : "column",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#1E1B4B",
                borderRadius: 18,
                padding: 18,
                borderWidth: 1,
                borderColor: "rgba(129, 140, 248, 0.35)",
                rowGap: 14,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  variant="caption"
                  style={{ color: "#A5B4FC", fontFamily: "Inter_700Bold", marginBottom: 4 }}
                >
                  SAMPLE SHARED CLASS
                </Text>
                <Text
                  variant="title-card"
                  style={{ color: "#FFFFFF", fontFamily: "Inter_700Bold", fontSize: 18 }}
                >
                  CSC 300L · UNIBEN
                </Text>
                <Text variant="caption" style={{ color: "#C7D2FE", marginBottom: 12 }}>
                  Share Code: CSC3X9 · 128 classmates following
                </Text>
                <Pressable
                  onPress={() => handlePreviewCode("CSC3X9")}
                  accessibilityRole="button"
                  style={{
                    alignSelf: "flex-start",
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 10,
                    backgroundColor: "#4F46E5",
                  }}
                >
                  <Text
                    variant="label-sm"
                    style={{ color: "#FFFFFF", fontFamily: "Inter_700Bold" }}
                  >
                    Open CSC3X9 Preview →
                  </Text>
                </Pressable>
              </View>

              <View
                style={{
                  padding: 10,
                  borderRadius: 14,
                  backgroundColor: "#FFFFFF",
                }}
              >
                <QrMatrix size={96} />
              </View>
            </View>
          </View>

          {/* Bento Card 2: 4-in-1 Multi-Calendar */}
          <View
            style={{
              flex: 0.85,
              backgroundColor: "#131C31",
              borderRadius: 24,
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.1)",
              padding: 28,
              justifyContent: "space-between",
            }}
          >
            <View>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: "rgba(13, 148, 136, 0.2)",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <Layers size={22} color="#2DD4BF" strokeWidth={2.2} />
              </View>
              <Text
                variant="title-section"
                style={{
                  color: "#FFFFFF",
                  fontFamily: "Inter_700Bold",
                  fontSize: 22,
                  marginBottom: 10,
                }}
              >
                4-in-1 Multi-Calendar
              </Text>
              <Text variant="body" style={{ color: "#94A3B8", lineHeight: 23, marginBottom: 20 }}>
                Keep Lectures, Assignments, Semester Exams, and Personal Reading/Campus Life in one
                harmonious view—with 100% parity between Card List and Calendar Grid.
              </Text>
            </View>

            <View style={{ rowGap: 10 }}>
              {[
                { label: "Classes & Labs", desc: "Main, Carry-over & Electives", color: "#4F46E5" },
                {
                  label: "Assignments & Polls",
                  desc: "Solo & group project deadlines",
                  color: "#EA580C",
                },
                {
                  label: "Semester Exams",
                  desc: "Written, CBT & Practical venues",
                  color: "#DC2626",
                },
                {
                  label: "Reading & Campus Life",
                  desc: "Personal study, Gym, Fellowship",
                  color: "#0D9488",
                },
              ].map((cal) => (
                <View
                  key={cal.label}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    backgroundColor: "#090D16",
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 11,
                    borderLeftWidth: 4,
                    borderLeftColor: cal.color,
                  }}
                >
                  <Text
                    variant="label"
                    style={{ color: "#F8FAFC", fontFamily: "Inter_600SemiBold" }}
                  >
                    {cal.label}
                  </Text>
                  <Text variant="caption" style={{ color: "#94A3B8" }}>
                    {cal.desc}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Bento Row 2 */}
        <View
          style={{
            flexDirection: isDesktop ? "row" : "column",
            columnGap: 24,
            rowGap: 24,
          }}
        >
          {/* Bento Card 3: Offline Wall-Clock Alarms */}
          <View
            style={{
              flex: 1,
              backgroundColor: "#131C31",
              borderRadius: 24,
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.1)",
              padding: 28,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: "rgba(234, 88, 12, 0.2)",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <Bell size={22} color="#FB923C" strokeWidth={2.2} />
            </View>
            <Text
              variant="title-section"
              style={{
                color: "#FFFFFF",
                fontFamily: "Inter_700Bold",
                fontSize: 22,
                marginBottom: 10,
              }}
            >
              Offline-First Wall-Clock Alarms
            </Text>
            <Text variant="body" style={{ color: "#94A3B8", lineHeight: 23 }}>
              Campus network down? Your entire schedule lives in on-device SQLite and fires exact
              local alarms: 7:00 AM daily morning summaries, 30-min or 1-hr pre-class reminders, and
              7:00 PM evening-before assignment alerts.
            </Text>
          </View>

          {/* Bento Card 4: 75% Attendance & Exam Eligibility */}
          <View
            style={{
              flex: 1,
              backgroundColor: "#131C31",
              borderRadius: 24,
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.1)",
              padding: 28,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: "rgba(16, 185, 129, 0.2)",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <BarChart2 size={22} color="#34D399" strokeWidth={2.2} />
            </View>
            <Text
              variant="title-section"
              style={{
                color: "#FFFFFF",
                fontFamily: "Inter_700Bold",
                fontSize: 22,
                marginBottom: 10,
              }}
            >
              Stay Above Your 75% Attendance Target
            </Text>
            <Text variant="body" style={{ color: "#94A3B8", lineHeight: 23 }}>
              Ten minutes after each lecture ends, TT prompts a gentle 1-tap check-in
              (&quot;Attended&quot; or &quot;Missed&quot;). Track your live attendance percentage
              per course so you never get barred from semester exams.
            </Text>
          </View>
        </View>
      </View>

      {/* 5. BOTTOM CALL TO ACTION BANNER */}
      <View
        style={{
          maxWidth: 1200,
          width: "100%",
          alignSelf: "center",
          paddingHorizontal: isDesktop ? 32 : 18,
          marginBottom: 64,
        }}
      >
        <View
          style={{
            backgroundColor: "#1E1B4B",
            borderRadius: 28,
            borderWidth: 1,
            borderColor: "rgba(129, 140, 248, 0.4)",
            paddingVertical: isDesktop ? 52 : 36,
            paddingHorizontal: isDesktop ? 48 : 24,
            alignItems: "center",
          }}
        >
          <Text
            variant="title-page"
            style={{
              color: "#FFFFFF",
              fontSize: isDesktop ? 36 : 26,
              lineHeight: isDesktop ? 44 : 32,
              fontFamily: "Inter_700Bold",
              textAlign: "center",
              marginBottom: 12,
            }}
          >
            Ready for a calmer semester?
          </Text>
          <Text
            variant="body-lg"
            style={{
              color: "#C7D2FE",
              textAlign: "center",
              maxWidth: 580,
              marginBottom: 28,
            }}
          >
            Download TT on the App Store, join your class with a 6-character code, or set up your
            department&apos;s shared timetable in minutes.
          </Text>

          <View
            style={{
              flexDirection: isTablet ? "row" : "column",
              alignItems: "center",
              gap: 14,
            }}
          >
            <Pressable
              onPress={() => void Linking.openURL(APP_STORE_SEARCH_URL)}
              accessibilityRole="button"
              style={{
                height: 52,
                paddingHorizontal: 24,
                borderRadius: 12,
                backgroundColor: "#FFFFFF",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                columnGap: 8,
              }}
            >
              <Text style={{ fontSize: 18, color: "#0F172A" }}></Text>
              <Text variant="label-lg" style={{ color: "#0F172A", fontFamily: "Inter_700Bold" }}>
                Download on App Store
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push("/setup/welcome?mode=signup" as any)}
              accessibilityRole="button"
              style={{
                height: 52,
                paddingHorizontal: 24,
                borderRadius: 12,
                backgroundColor: "#4F46E5",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text variant="label-lg" style={{ color: "#FFFFFF", fontFamily: "Inter_700Bold" }}>
                Create Student Account
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* 6. FOOTER (GOOGLE OAUTH HOMEPAGE VERIFICATION & LEGAL LINKS) */}
      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: "rgba(255, 255, 255, 0.08)",
          backgroundColor: "#060911",
          paddingVertical: 36,
        }}
      >
        <View
          style={{
            maxWidth: 1200,
            width: "100%",
            alignSelf: "center",
            paddingHorizontal: isDesktop ? 32 : 18,
            flexDirection: isTablet ? "row" : "column",
            alignItems: isTablet ? "center" : "flex-start",
            justifyContent: "space-between",
            rowGap: 20,
          }}
        >
          <View>
            <Text
              variant="label"
              style={{ color: "#F8FAFC", fontFamily: "Inter_700Bold", marginBottom: 4 }}
            >
              TT: Student Timetable (studenttimetable.app)
            </Text>
            <Text variant="caption" style={{ color: "#64748B" }}>
              © 2026 Philemon Okpokpa · Built for university students and course reps.
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 20,
            }}
          >
            <Pressable onPress={() => router.push("/privacy" as any)} accessibilityRole="link">
              <Text
                variant="label"
                style={{
                  color: "#818CF8",
                  fontFamily: "Inter_600SemiBold",
                  textDecorationLine: "underline",
                }}
              >
                Privacy Policy & Account Deletion
              </Text>
            </Pressable>

            <Pressable onPress={() => router.push("/join/CSC3X9" as any)} accessibilityRole="link">
              <Text variant="label" style={{ color: "#94A3B8" }}>
                Sample Class (CSC3X9)
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push("/setup/welcome?mode=signin" as any)}
              accessibilityRole="link"
            >
              <Text variant="label" style={{ color: "#94A3B8" }}>
                Student Sign In
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
