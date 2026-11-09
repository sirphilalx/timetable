import React, { useEffect, useState } from "react";
import { View, Image } from "react-native";
import { Redirect } from "expo-router";
import { Text } from "@/components/ui/Text";
import { useAuth } from "@/auth";

const splashLogo = require("../../logo/Logo-dark.png");

const SPLASH_DURATION_MS = 3000;

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function easeOutCubic(t: number): number {
  const clamped = clamp(t, 0, 1);
  return 1 - Math.pow(1 - clamped, 3);
}

function easeOutBack(t: number): number {
  const clamped = clamp(t, 0, 1);
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(clamped - 1, 3) + c1 * Math.pow(clamped - 1, 2);
}

export default function RootIndex() {
  const { isLoaded, isSignedIn, hasCompletedOnboarding } = useAuth();
  const [splashReady, setSplashReady] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    let rafId: number | null = null;
    let active = true;

    const tick = () => {
      if (!active) return;
      const now = Date.now() - startTime;
      setElapsedMs(now);
      if (now < SPLASH_DURATION_MS) {
        rafId = requestAnimationFrame(tick);
      } else {
        setSplashReady(true);
      }
    };

    rafId = requestAnimationFrame(tick);

    const fallbackTimer = setTimeout(() => {
      if (active) {
        setSplashReady(true);
      }
    }, SPLASH_DURATION_MS + 50);

    return () => {
      active = false;
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      clearTimeout(fallbackTimer);
    };
  }, []);

  if (!isLoaded || !splashReady) {
    // 1. Logo entrance (0 -> 560ms) with spring overshoot, then gentle breathing + float
    const entranceT = clamp(elapsedMs / 560, 0, 1);
    const entranceScale = 0.72 + 0.28 * easeOutBack(entranceT);
    const breathPhase = Math.max(0, elapsedMs - 560);
    const breathScale = elapsedMs > 560 ? 1 + 0.055 * Math.sin((breathPhase / 480) * Math.PI) : 1;
    const logoScale = entranceScale * breathScale;

    const entranceY = (1 - easeOutCubic(entranceT)) * 16;
    const floatY = elapsedMs > 560 ? -3.5 * Math.sin((breathPhase / 600) * Math.PI) : 0;
    const logoTranslateY = entranceY + floatY;

    const logoRotateDeg = elapsedMs > 560 ? 2.2 * Math.sin((breathPhase / 750) * Math.PI) : 0;
    const logoOpacity = clamp(0.35 + easeOutCubic(clamp(elapsedMs / 260, 0, 1)) * 0.65, 0.35, 1);

    // 2. Concentric expanding ripple halo rings
    const ring1Cycle = (elapsedMs % 1500) / 1500;
    const ring1Scale = 0.92 + easeOutCubic(ring1Cycle) * 0.95;
    const ring1Opacity = Math.sin(ring1Cycle * Math.PI) * (1 - ring1Cycle * 0.45) * 0.45;

    const ring2Cycle = ((elapsedMs + 750) % 1500) / 1500;
    const ring2Scale = 0.92 + easeOutCubic(ring2Cycle) * 0.95;
    const ring2Opacity = Math.sin(ring2Cycle * Math.PI) * (1 - ring2Cycle * 0.45) * 0.35;

    // 3. Diagonal glass shimmer sweep across the logo tile
    const shimmerWindow = elapsedMs % 1450;
    const shimmerT = clamp((shimmerWindow - 220) / 720, 0, 1);
    const shimmerTranslateX = -115 + easeOutCubic(shimmerT) * 230;
    const shimmerOpacity = shimmerT > 0 && shimmerT < 1 ? Math.sin(shimmerT * Math.PI) * 0.38 : 0;

    // 4. Staggered title, subtitle, and progress bar
    const titleT = easeOutCubic(clamp((elapsedMs - 140) / 420, 0, 1));
    const subtitleT = easeOutCubic(clamp((elapsedMs - 280) / 440, 0, 1));
    const progressPct = clamp((elapsedMs / (SPLASH_DURATION_MS - 120)) * 100, 4, 100);

    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#4F46E5",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 24,
        }}
      >
        {/* Logo + Concentric Ripple Rings Container */}
        <View
          style={{
            width: 148,
            height: 148,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 18,
          }}
        >
          {/* Soft Ambient Glow Disc */}
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              width: 112,
              height: 112,
              borderRadius: 32,
              backgroundColor: "rgba(199, 210, 254, 0.18)",
              transform: [{ scale: breathScale * 1.08 }],
            }}
          />

          {/* Ripple Halo Ring 1 */}
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              width: 100,
              height: 100,
              borderRadius: 28,
              borderWidth: 2,
              borderColor: "#C7D2FE",
              backgroundColor: "rgba(255, 255, 255, 0.06)",
              opacity: ring1Opacity,
              transform: [{ scale: ring1Scale }],
            }}
          />

          {/* Ripple Halo Ring 2 */}
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              width: 100,
              height: 100,
              borderRadius: 28,
              borderWidth: 1.5,
              borderColor: "#E0E7FF",
              backgroundColor: "rgba(255, 255, 255, 0.04)",
              opacity: ring2Opacity,
              transform: [{ scale: ring2Scale }],
            }}
          />

          {/* Outer Shadow & Transform Wrapper (kept separate from overflow:hidden for iOS) */}
          <View
            style={{
              width: 96,
              height: 96,
              borderRadius: 24,
              shadowColor: "#000000",
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.34,
              shadowRadius: 20,
              elevation: 10,
              opacity: logoOpacity,
              transform: [
                { translateY: logoTranslateY },
                { scale: logoScale },
                { rotate: `${logoRotateDeg.toFixed(2)}deg` },
              ],
            }}
          >
            {/* Inner Clipped Logo Tile */}
            <View
              style={{
                width: 96,
                height: 96,
                borderRadius: 24,
                backgroundColor: "#0F172A",
                overflow: "hidden",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1.5,
                borderColor: "rgba(255, 255, 255, 0.28)",
              }}
            >
              <Image
                source={splashLogo}
                style={{ width: 96, height: 96 }}
                resizeMode="contain"
                accessibilityLabel="TT: Student Timetable logo"
              />

              {/* Diagonal Glass Shimmer Sweep */}
              <View
                pointerEvents="none"
                style={{
                  position: "absolute",
                  top: -28,
                  bottom: -28,
                  width: 34,
                  backgroundColor: "#FFFFFF",
                  opacity: shimmerOpacity,
                  transform: [{ translateX: shimmerTranslateX }, { rotate: "22deg" }],
                }}
              />
            </View>
          </View>
        </View>

        {/* Staggered Title */}
        <View
          style={{
            opacity: titleT,
            transform: [{ translateY: (1 - titleT) * 10 }],
            marginBottom: 10,
          }}
        >
          <Text
            variant="display"
            style={{
              color: "#FFFFFF",
              fontSize: 24,
              lineHeight: 30,
              fontFamily: "Inter_700Bold",
              textAlign: "center",
            }}
          >
            TT: Student Timetable
          </Text>
        </View>

        {/* Staggered Subtitle */}
        <View
          style={{
            opacity: subtitleT,
            transform: [{ translateY: (1 - subtitleT) * 8 }],
          }}
        >
          <Text
            variant="body-lg"
            style={{
              color: "rgba(255, 255, 255, 0.9)",
              fontFamily: "Inter_400Regular",
              textAlign: "center",
              lineHeight: 22,
            }}
          >
            Your class, your timetable, on time.
          </Text>
        </View>

        {/* Smooth 3-Second Loading Pill */}
        <View
          style={{
            marginTop: 36,
            width: 120,
            height: 4,
            borderRadius: 2,
            backgroundColor: "rgba(255, 255, 255, 0.22)",
            overflow: "hidden",
            opacity: subtitleT,
          }}
        >
          <View
            style={{
              width: `${progressPct.toFixed(1)}%` as any,
              height: "100%",
              borderRadius: 2,
              backgroundColor: "#FFFFFF",
            }}
          />
        </View>
      </View>
    );
  }

  if (!isSignedIn || !hasCompletedOnboarding) {
    return <Redirect href="/setup/welcome" />;
  }

  return <Redirect href="/(tabs)" />;
}
