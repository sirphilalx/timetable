import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from "react";
import {
  View,
  ScrollView,
  Pressable,
  useWindowDimensions,
  StyleSheet,
  BackHandler,
  Platform,
  type GestureResponderEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, usePathname } from "expo-router";
import { Menu, X, Sun, Moon, Settings } from "lucide-react-native";
import { Text } from "@/components/ui/Text";
import { StudentAvatar } from "@/components/ui/StudentAvatar";
import { ClerkAccountPopover } from "@/components/ui/ClerkAccountPopover";
import { useTheme } from "@/theme";
import { useAuth } from "@/auth";
import { useTimetable, useUpdateCalendarFilters } from "@/hooks/useTimetable";

interface SidebarContextValue {
  isOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextValue>({
  isOpen: false,
  openSidebar: () => {},
  closeSidebar: () => {},
  toggleSidebar: () => {},
});

export function useSidebar(): SidebarContextValue {
  return useContext(SidebarContext);
}

export function HamburgerButton({ tintColor }: { tintColor?: string }) {
  const { isOpen, toggleSidebar } = useSidebar();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const iconColor = tintColor ?? (isDark ? "#F8FAFC" : "#0F172A");

  return (
    <Pressable
      onPress={toggleSidebar}
      accessibilityRole="button"
      accessibilityLabel={isOpen ? "Close navigation sidebar" : "Open navigation sidebar"}
      hitSlop={18}
      style={({ pressed }) => ({
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
        borderWidth: 1,
        borderColor: isDark ? "#334155" : "#E2E8F0",
        opacity: pressed ? 0.7 : 1,
      })}
    >
      {isOpen ? (
        <X size={20} color={iconColor} strokeWidth={2.2} />
      ) : (
        <Menu size={20} color={iconColor} strokeWidth={2.2} />
      )}
    </Pressable>
  );
}

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

export function AppSidebarShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { user, isSignedIn, hasCompletedOnboarding } = useAuth();

  const { data } = useTimetable();
  const updateFilters = useUpdateCalendarFilters();

  const [isOpen, setIsOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [accountPopoverOpen, setAccountPopoverOpen] = useState(false);

  const isOpenRef = useRef(false);
  const progressRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const touchStartRef = useRef({
    x: 0,
    y: 0,
    time: 0,
    wasOpen: false,
    isHorizontalSwipe: false,
  });

  const cancelAnimation = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      cancelAnimation();
    };
  }, [cancelAnimation]);

  const animateTo = useCallback(
    (targetOpen: boolean) => {
      cancelAnimation();
      isOpenRef.current = targetOpen;
      setIsOpen(targetOpen);

      const from = progressRef.current;
      const to = targetOpen ? 1 : 0;

      if (Math.abs(to - from) < 0.005) {
        progressRef.current = to;
        setProgress(to);
        return;
      }

      const duration = 260;
      const startTime = Date.now();

      const step = () => {
        const elapsed = Date.now() - startTime;
        const rawT = Math.min(1, elapsed / duration);
        const eased = easeOutQuart(rawT);
        const nextVal = from + (to - from) * eased;

        progressRef.current = nextVal;
        setProgress(nextVal);

        if (rawT < 1) {
          rafRef.current = requestAnimationFrame(step);
        } else {
          progressRef.current = to;
          setProgress(to);
          rafRef.current = null;
        }
      };

      rafRef.current = requestAnimationFrame(step);
    },
    [cancelAnimation],
  );

  const openSidebar = useCallback(() => {
    animateTo(true);
  }, [animateTo]);

  const closeSidebar = useCallback(() => {
    animateTo(false);
  }, [animateTo]);

  const toggleSidebar = useCallback(() => {
    animateTo(!isOpenRef.current);
  }, [animateTo]);

  // Swipe left-to-right anywhere on screen to reveal the sidebar,
  // or swipe right-to-left when open to close the sidebar and maximize the active screen.
  const isOnboardingRoute =
    pathname === "/" || pathname.startsWith("/setup") || pathname.startsWith("/consent");

  const isTopLevelHubRoute =
    pathname === "/(tabs)" ||
    pathname === "/classes" ||
    pathname === "/(tabs)/classes" ||
    pathname === "/assignments" ||
    pathname === "/(tabs)/assignments" ||
    pathname === "/reports" ||
    pathname === "/settings/courses";

  // Intercept Android hardware back / web browser back & trackpad swipe so swiping back reveals the sidebar instead of walking backward into onboarding
  useEffect(() => {
    if (isOnboardingRoute) return;

    const backSub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (isOpenRef.current) {
        animateTo(false);
        return true;
      }
      if (isTopLevelHubRoute) {
        animateTo(true);
        return true;
      }
      return false;
    });

    if (Platform.OS === "web" && typeof window !== "undefined") {
      if (isTopLevelHubRoute && isSignedIn && hasCompletedOnboarding) {
        try {
          window.history.pushState({ ttSidebarGuard: true }, "", window.location.href);
        } catch {
          // Ignore history error
        }
      }

      const handlePopState = () => {
        if (isSignedIn && hasCompletedOnboarding && isTopLevelHubRoute) {
          try {
            window.history.pushState({ ttSidebarGuard: true }, "", window.location.href);
          } catch {
            // Ignore history error
          }
          animateTo(!isOpenRef.current);
        }
      };

      const handleWheel = (e: WheelEvent) => {
        const isHorizontalTrackpadSwipe =
          Math.abs(e.deltaX) > 28 && Math.abs(e.deltaX) > Math.abs(e.deltaY) * 1.4;
        if (!isHorizontalTrackpadSwipe) return;

        if (e.deltaX < -28 && !isOpenRef.current) {
          e.preventDefault();
          animateTo(true);
        } else if (e.deltaX > 28 && isOpenRef.current) {
          e.preventDefault();
          animateTo(false);
        }
      };

      window.addEventListener("popstate", handlePopState);
      window.addEventListener("wheel", handleWheel, { passive: false });

      return () => {
        backSub.remove();
        window.removeEventListener("popstate", handlePopState);
        window.removeEventListener("wheel", handleWheel);
      };
    }

    return () => {
      backSub.remove();
    };
  }, [animateTo, hasCompletedOnboarding, isOnboardingRoute, isSignedIn, isTopLevelHubRoute]);

  const handleTouchStartCapture = useCallback((e: GestureResponderEvent) => {
    touchStartRef.current = {
      x: e.nativeEvent.pageX,
      y: e.nativeEvent.pageY,
      time: Date.now(),
      wasOpen: isOpenRef.current,
      isHorizontalSwipe: false,
    };
  }, []);

  const handleTouchMove = useCallback(
    (e: GestureResponderEvent) => {
      if (isOnboardingRoute) return;
      const start = touchStartRef.current;
      const dx = e.nativeEvent.pageX - start.x;
      const dy = e.nativeEvent.pageY - start.y;

      if (!start.isHorizontalSwipe) {
        const isHorizontal = Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.2;
        if (!isHorizontal) return;
        if (!start.wasOpen && dx > 12) {
          start.isHorizontalSwipe = true;
          cancelAnimation();
        } else if (start.wasOpen && dx < -12) {
          start.isHorizontalSwipe = true;
          cancelAnimation();
        } else {
          return;
        }
      }

      const swipeSpan = 170;
      if (!start.wasOpen) {
        const next = Math.min(1, Math.max(0, dx / swipeSpan));
        progressRef.current = next;
        setProgress(next);
      } else {
        const next = Math.min(1, Math.max(0, 1 + dx / swipeSpan));
        progressRef.current = next;
        setProgress(next);
      }
    },
    [cancelAnimation, isOnboardingRoute],
  );

  const finishSwipeGesture = useCallback(
    (e: GestureResponderEvent) => {
      const start = touchStartRef.current;
      if (!start.isHorizontalSwipe) return;
      start.isHorizontalSwipe = false;

      const dx = e.nativeEvent.pageX - start.x;
      const dt = Math.max(1, Date.now() - start.time);
      const vx = dx / dt;

      if (!start.wasOpen) {
        if (dx > 32 || vx > 0.2 || progressRef.current > 0.22) {
          animateTo(true);
        } else {
          animateTo(false);
        }
      } else {
        if (dx < -30 || vx < -0.2 || progressRef.current < 0.78) {
          animateTo(false);
        } else {
          animateTo(true);
        }
      }
    },
    [animateTo],
  );

  const handleMoveShouldSetResponderCapture = useCallback(
    (e: GestureResponderEvent) => {
      if (isOnboardingRoute) return false;
      const dx = e.nativeEvent.pageX - touchStartRef.current.x;
      const dy = e.nativeEvent.pageY - touchStartRef.current.y;
      const isHorizontal = Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.2;
      if (!isHorizontal) return false;
      if (!touchStartRef.current.wasOpen && dx > 12) {
        return true;
      }
      if (touchStartRef.current.wasOpen && dx < -12) {
        return true;
      }
      return false;
    },
    [isOnboardingRoute],
  );

  const handleResponderGrant = useCallback(() => {
    touchStartRef.current.isHorizontalSwipe = true;
    cancelAnimation();
  }, [cancelAnimation]);

  const handleResponderMove = useCallback(
    (e: GestureResponderEvent) => {
      handleTouchMove(e);
    },
    [handleTouchMove],
  );

  const handleResponderRelease = useCallback(
    (e: GestureResponderEvent) => {
      finishSwipeGesture(e);
    },
    [finishSwipeGesture],
  );

  const handleResponderTerminate = useCallback(
    (e: GestureResponderEvent) => {
      finishSwipeGesture(e);
    },
    [finishSwipeGesture],
  );

  // Narrower sidebar + smaller active screen card so plenty of the minimized screen remains visible
  const sidebarWidth = Math.min(210, Math.round(windowWidth * 0.54));
  const shiftRightDistance = Math.min(186, Math.round(windowWidth * 0.49));

  // Pure horizontal-axis Parallax values computed from `progress` (0..1):
  // All layers start from (scale: 1, translateX: 0, translateY: 0) so there is zero diagonal sag or wobble.
  const p = progress;
  const isSidebarInteractive = isOpen || p > 0.02;

  // Layer 3 (Foreground Active Screen Card)
  const mainScale = 1 - 0.3 * p; // 1.00 -> 0.70
  const mainTranslateX = shiftRightDistance * p;
  const mainBorderRadius = 28 * p;

  // Layer 2 (Middle Parallax Ghost Card — trails smoothly on the horizontal axis)
  const ghost1Scale = 1 - 0.36 * p; // 1.00 -> 0.64
  const ghost1TranslateX = (shiftRightDistance - 18) * p;
  const ghost1Opacity = 0.44 * p;

  // Layer 1 (Deep Parallax Ghost Card — deepest trailing card on the horizontal axis)
  const ghost2Scale = 1 - 0.42 * p; // 1.00 -> 0.58
  const ghost2TranslateX = (shiftRightDistance - 34) * p;
  const ghost2Opacity = 0.22 * p;

  // Sidebar Parallax Entrance (glides horizontally from -32px with subtle scale)
  const sidebarTranslateX = -32 * (1 - p);
  const sidebarScale = 0.96 + 0.04 * p;
  const sidebarOpacity = p;

  const handleNavigate = useCallback(
    (href: string) => {
      closeSidebar();
      router.push(href as any);
    },
    [closeSidebar, router],
  );

  const handleSelectSubscription = useCallback(
    (subId: string) => {
      updateFilters.mutate({ subscriptionFilter: subId });
      closeSidebar();
      if (pathname !== "/" && pathname !== "/classes" && pathname !== "/(tabs)") {
        router.push("/(tabs)");
      }
    },
    [closeSidebar, pathname, router, updateFilters],
  );

  const contextValue = useMemo(
    () => ({ isOpen, openSidebar, closeSidebar, toggleSidebar }),
    [isOpen, openSidebar, closeSidebar, toggleSidebar],
  );

  // Memoize the streamlined HCD sidebar inner tree (~7 core destinations)
  const sidebarInnerContent = useMemo(
    () => (
      <>
        {/* Student Profile Header + X Close Button */}
        <View style={styles.profileHeader}>
          <Pressable
            onPress={() => {
              closeSidebar();
              setAccountPopoverOpen(true);
            }}
            accessibilityRole="button"
            accessibilityLabel="Open account & session menu"
            style={{ flexDirection: "row", alignItems: "center", flex: 1, marginRight: 8 }}
          >
            <View style={{ marginRight: 10 }}>
              <StudentAvatar
                avatarUrl={user.avatarUrl ?? data.student.avatarUrl}
                initials={user.initials}
                size={40}
                borderWidth={1.5}
                borderColor="#A5B4FC"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                variant="title-card"
                numberOfLines={1}
                style={{ color: "#FFFFFF", fontFamily: "Inter_700Bold", fontSize: 16 }}
              >
                {user.displayName || data.student.displayName || "Student"}
              </Text>
              <Text variant="caption" numberOfLines={1} style={{ color: "#A5B4FC", marginTop: 2 }}>
                {user.username || data.student.username
                  ? `@${user.username || data.student.username}`
                  : "Account & sign out"}
              </Text>
            </View>
          </Pressable>
          <Pressable
            onPress={closeSidebar}
            accessibilityRole="button"
            accessibilityLabel="Close sidebar"
            hitSlop={20}
            style={({ pressed }) => [
              styles.closeBtn,
              {
                opacity: pressed ? 0.65 : 1,
                backgroundColor: pressed
                  ? "rgba(255, 255, 255, 0.28)"
                  : "rgba(255, 255, 255, 0.16)",
              },
            ]}
          >
            <X size={18} color="#FFFFFF" strokeWidth={2.4} />
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 6,
            paddingBottom: 48,
            rowGap: 30,
          }}
        >
          {/* SECTION 1: CORE NAVIGATION (5 primary screens) */}
          <View>
            <Text variant="caption" style={styles.sectionTitle}>
              NAVIGATION
            </Text>
            <View style={styles.sectionList}>
              {[
                {
                  label: "Today",
                  href: "/(tabs)",
                  active: pathname === "/" || pathname === "/(tabs)",
                },
                {
                  label: "Classes & Calendar",
                  href: "/(tabs)/classes",
                  active: pathname.includes("/classes"),
                },
                {
                  label: "Assignments",
                  href: "/(tabs)/assignments",
                  active: pathname.includes("/assignments"),
                },
                {
                  label: `My courses (${data.courses.length})`,
                  href: "/settings/courses",
                  active: pathname.includes("/settings/courses") || pathname.includes("/course/"),
                },
                {
                  label: "Attendance & reports",
                  href: "/reports",
                  active: pathname.includes("/reports") || pathname.includes("/check-ins"),
                },
              ].map((item) => (
                <Pressable
                  key={item.href}
                  onPress={() => handleNavigate(item.href)}
                  style={({ pressed }) => [
                    styles.menuRow,
                    item.active && { backgroundColor: "rgba(99, 102, 241, 0.34)" },
                    pressed && { backgroundColor: "rgba(255, 255, 255, 0.14)" },
                  ]}
                >
                  <View style={styles.menuRowInner}>
                    <Text
                      variant="label"
                      numberOfLines={1}
                      style={[
                        styles.menuLabel,
                        {
                          fontFamily: item.active ? "Inter_700Bold" : "Inter_500Medium",
                          color: item.active ? "#FFFFFF" : "#E0E7FF",
                        },
                      ]}
                    >
                      {item.label}
                    </Text>
                    {item.active ? <View style={styles.activeDot} /> : null}
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          {/* SECTION 2: CLASS TIMETABLES & SHARING */}
          <View>
            <Text variant="caption" style={styles.sectionTitle}>
              CLASS TIMETABLES
            </Text>
            <View style={styles.sectionList}>
              {data.followedSubscriptions.length > 0 ? (
                <>
                  <Pressable
                    onPress={() => handleSelectSubscription("all")}
                    style={({ pressed }) => [
                      styles.menuRow,
                      data.activeSubscriptionFilter === "all" && {
                        backgroundColor: "rgba(99, 102, 241, 0.34)",
                      },
                      pressed && { backgroundColor: "rgba(255, 255, 255, 0.14)" },
                    ]}
                  >
                    <View style={styles.menuRowInner}>
                      <Text
                        variant="label"
                        numberOfLines={1}
                        style={[
                          styles.menuLabel,
                          {
                            fontFamily:
                              data.activeSubscriptionFilter === "all"
                                ? "Inter_700Bold"
                                : "Inter_500Medium",
                            color: data.activeSubscriptionFilter === "all" ? "#FFFFFF" : "#E0E7FF",
                          },
                        ]}
                      >
                        All classes
                      </Text>
                      {data.activeSubscriptionFilter === "all" ? (
                        <View style={styles.activeDot} />
                      ) : null}
                    </View>
                  </Pressable>

                  {data.followedSubscriptions.map((sub) => {
                    const active = data.activeSubscriptionFilter === sub.id;
                    return (
                      <Pressable
                        key={sub.id}
                        onPress={() => handleSelectSubscription(sub.id)}
                        style={({ pressed }) => [
                          styles.menuRow,
                          active && { backgroundColor: "rgba(99, 102, 241, 0.34)" },
                          pressed && { backgroundColor: "rgba(255, 255, 255, 0.14)" },
                        ]}
                      >
                        <View style={styles.menuRowInner}>
                          <Text
                            variant="label"
                            numberOfLines={1}
                            style={[
                              styles.menuLabel,
                              {
                                fontFamily: active ? "Inter_700Bold" : "Inter_500Medium",
                                color: active ? "#FFFFFF" : "#E0E7FF",
                              },
                            ]}
                          >
                            {sub.title}
                          </Text>
                          {active ? <View style={styles.activeDot} /> : null}
                        </View>
                      </Pressable>
                    );
                  })}
                </>
              ) : null}

              {[
                {
                  label: "Join a class",
                  href: "/join/scan",
                  active: pathname.startsWith("/join"),
                },
                {
                  label: "Share timetable",
                  href: "/share/create",
                  active: pathname.startsWith("/share"),
                },
                ...(data.followedSubscriptions.length > 0
                  ? [
                      {
                        label: "Class settings",
                        href: "/class-settings",
                        active: pathname.startsWith("/class-settings"),
                      },
                    ]
                  : []),
              ].map((item) => (
                <Pressable
                  key={item.label}
                  onPress={() => handleNavigate(item.href)}
                  style={({ pressed }) => [
                    styles.menuRow,
                    item.active && { backgroundColor: "rgba(99, 102, 241, 0.34)" },
                    pressed && { backgroundColor: "rgba(255, 255, 255, 0.14)" },
                  ]}
                >
                  <View style={styles.menuRowInner}>
                    <Text
                      variant="label"
                      numberOfLines={1}
                      style={[
                        styles.menuLabel,
                        {
                          fontFamily: item.active ? "Inter_700Bold" : "Inter_500Medium",
                          color: item.active ? "#FFFFFF" : "#E0E7FF",
                        },
                      ]}
                    >
                      {item.label}
                    </Text>
                    {item.active ? <View style={styles.activeDot} /> : null}
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          {/* SECTION 3: PREFERENCES FOOTER */}
          <View
            style={{
              paddingTop: 14,
              borderTopWidth: 1,
              borderTopColor: "rgba(255, 255, 255, 0.12)",
              rowGap: 10,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", columnGap: 8 }}>
              <Pressable
                onPress={() => handleNavigate("/settings")}
                style={({ pressed }) => [
                  styles.menuRow,
                  { flex: 1 },
                  pathname === "/settings" && { backgroundColor: "rgba(99, 102, 241, 0.34)" },
                  pressed && { backgroundColor: "rgba(255, 255, 255, 0.14)" },
                ]}
              >
                <View style={{ flexDirection: "row", alignItems: "center", columnGap: 8 }}>
                  <Settings size={16} color="#E0E7FF" strokeWidth={2} />
                  <Text variant="label" numberOfLines={1} style={styles.menuLabel}>
                    Settings
                  </Text>
                </View>
              </Pressable>

              <Pressable
                onPress={() => void setTheme(isDark ? "light" : "dark")}
                accessibilityRole="button"
                accessibilityLabel={isDark ? "Switch to light mode" : "Switch to dark mode"}
                style={({ pressed }) => ({
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: pressed
                    ? "rgba(255, 255, 255, 0.24)"
                    : "rgba(255, 255, 255, 0.12)",
                })}
              >
                {isDark ? (
                  <Sun size={18} color="#FDE047" strokeWidth={2} />
                ) : (
                  <Moon size={18} color="#E0E7FF" strokeWidth={2} />
                )}
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </>
    ),
    [
      closeSidebar,
      data.activeSubscriptionFilter,
      data.courses.length,
      data.followedSubscriptions,
      data.student.avatarUrl,
      data.student.displayName,
      data.student.username,
      handleNavigate,
      handleSelectSubscription,
      isDark,
      pathname,
      setTheme,
      user.avatarUrl,
      user.displayName,
      user.initials,
      user.username,
    ],
  );

  // Distinct sidebar background color so the minimized screen card stands out clearly
  const sidebarBg = "#1E1B4B";
  // The active screen keeps its own theme background color
  const mainScreenBg = isDark ? "#0F172A" : "#F8FAFC";

  return (
    <SidebarContext.Provider value={contextValue}>
      <View
        onTouchStartCapture={handleTouchStartCapture}
        onTouchMove={handleTouchMove}
        onTouchEnd={finishSwipeGesture}
        onTouchCancel={finishSwipeGesture}
        onMoveShouldSetResponderCapture={handleMoveShouldSetResponderCapture}
        onResponderTerminationRequest={() => false}
        onResponderGrant={handleResponderGrant}
        onResponderMove={handleResponderMove}
        onResponderRelease={handleResponderRelease}
        onResponderTerminate={handleResponderTerminate}
        style={[styles.root, { backgroundColor: sidebarBg }]}
      >
        {/* Left-edge swipe detector strip when sidebar is closed so edge swipes never get swallowed by ScrollViews */}
        {!isSidebarInteractive && !isOnboardingRoute ? (
          <View
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => true}
            onResponderTerminationRequest={() => false}
            onResponderGrant={handleResponderGrant}
            onResponderMove={handleResponderMove}
            onResponderRelease={handleResponderRelease}
            onResponderTerminate={handleResponderTerminate}
            style={{
              position: "absolute",
              left: 0,
              top: 96,
              bottom: 0,
              width: 22,
              zIndex: 25,
            }}
          />
        ) : null}
        {/* Deep Parallax Card 2 — Always mounted so there is zero mount stutter during animation */}
        <View
          pointerEvents="none"
          style={[
            styles.parallaxGhostCard,
            {
              width: windowWidth,
              height: windowHeight,
              backgroundColor: mainScreenBg,
              opacity: ghost2Opacity,
              borderRadius: mainBorderRadius,
              transform: [{ translateX: ghost2TranslateX }, { scale: ghost2Scale }],
            },
          ]}
        />

        {/* Middle Parallax Card 1 — Always mounted so there is zero mount stutter during animation */}
        <View
          pointerEvents="none"
          style={[
            styles.parallaxGhostCard,
            {
              width: windowWidth,
              height: windowHeight,
              backgroundColor: mainScreenBg,
              opacity: ghost1Opacity,
              borderRadius: mainBorderRadius,
              transform: [{ translateX: ghost1TranslateX }, { scale: ghost1Scale }],
            },
          ]}
        />

        {/* Active Main Screen Container — Pure horizontal-axis glide + scale without borderWidth layout jumps */}
        <View
          pointerEvents={isSidebarInteractive ? "none" : "auto"}
          style={[
            styles.mainScreenCard,
            {
              backgroundColor: mainScreenBg,
              borderRadius: mainBorderRadius,
              transform: [{ translateX: mainTranslateX }, { scale: mainScale }],
            },
          ]}
        >
          <View
            style={[
              styles.mainInnerClip,
              {
                borderRadius: mainBorderRadius,
              },
            ]}
          >
            {children}
          </View>
        </View>

        {/* Left Sidebar Menu — Always mounted (memoized) so opening/closing is 60fps with zero mount stutter */}
        <View
          pointerEvents={isSidebarInteractive ? "auto" : "none"}
          style={[
            styles.sidebarContainer,
            {
              width: sidebarWidth,
              zIndex: isSidebarInteractive ? 20 : 0,
              paddingTop: Math.max(insets.top + 14, 32),
              paddingBottom: Math.max(insets.bottom + 16, 24),
              opacity: sidebarOpacity,
              transform: [{ translateX: sidebarTranslateX }, { scale: sidebarScale }],
            },
          ]}
        >
          {sidebarInnerContent}
        </View>

        {/* Touching anywhere away from the sidebar (over the minimized active screen region) closes the sidebar and maximizes the screen */}
        {isSidebarInteractive ? (
          <Pressable
            onPress={closeSidebar}
            accessibilityRole="button"
            accessibilityLabel="Restore minimized screen"
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              left: sidebarWidth,
              zIndex: 30,
            }}
          />
        ) : null}

        <ClerkAccountPopover
          visible={accountPopoverOpen}
          onClose={() => setAccountPopoverOpen(false)}
        />
      </View>
    </SidebarContext.Provider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: "hidden",
  },
  parallaxGhostCard: {
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 1,
  },
  mainScreenCard: {
    flex: 1,
    zIndex: 5,
    shadowColor: "#000000",
    shadowOffset: { width: -16, height: 22 },
    shadowOpacity: 0.45,
    shadowRadius: 34,
    elevation: 24,
  },
  mainInnerClip: {
    flex: 1,
    overflow: "hidden",
  },
  sidebarContainer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 22,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.12)",
    columnGap: 10,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    color: "#818CF8",
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    letterSpacing: 1.4,
    marginBottom: 14,
    paddingHorizontal: 14,
  },
  sectionList: {
    rowGap: 12,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 48,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  menuRowInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    flex: 1,
    columnGap: 10,
  },
  menuLabel: {
    color: "#E0E7FF",
    fontSize: 15,
    lineHeight: 22,
    flexShrink: 1,
  },
  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#4ADE80",
    flexShrink: 0,
    marginLeft: "auto",
  },
});
