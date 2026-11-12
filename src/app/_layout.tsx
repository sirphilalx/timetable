import "../../global.css";
import React, { useEffect, useState } from "react";
import { Stack, usePathname, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { runMigrations } from "@/db";
import { ThemeProvider, useTheme } from "@/theme";
import { AuthProvider, useAuth } from "@/auth";
import { DynamicIslandBanner } from "@/components/timetable";
import { AppSidebarShell } from "@/components/navigation/AppSidebarShell";
import {
  configureNotificationChannels,
  subscribeToNotificationResponses,
} from "@/lib/notifications";
import { markNotificationRead } from "@/lib/reminders";
import { initAnalytics, trackScreen } from "@/lib/analytics";

// Prevent splash screen auto-hiding while initial assets and database verify
SplashScreen.preventAutoHideAsync().catch(() => {
  // Splash screen handling fallback
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
    },
  },
});

const ONBOARDING_ONLY_PATHS = new Set(["/setup/welcome"]);

function RootNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { isLoaded, isSignedIn, hasCompletedOnboarding } = useAuth();

  // Prevent back-navigation / swipe-back from walking an already onboarded student backward into setup/auth screens
  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn && hasCompletedOnboarding && ONBOARDING_ONLY_PATHS.has(pathname)) {
      if (typeof router.canDismiss === "function" && router.canDismiss()) {
        router.dismissAll();
      }
      router.replace("/(tabs)");
    }
  }, [hasCompletedOnboarding, isLoaded, isSignedIn, pathname, router]);

  useEffect(() => {
    void initAnalytics();
  }, []);

  useEffect(() => {
    if (!isLoaded || !pathname) return;
    trackScreen(pathname, {
      theme: resolvedTheme,
      is_signed_in: isSignedIn,
      has_completed_onboarding: hasCompletedOnboarding,
    });
  }, [hasCompletedOnboarding, isLoaded, isSignedIn, pathname, resolvedTheme]);

  useEffect(() => {
    void configureNotificationChannels();
    const unsub = subscribeToNotificationResponses((data) => {
      if (data.notificationId) {
        void markNotificationRead(data.notificationId);
      }
      const targetRoute =
        data.route ||
        (data.occurrenceId
          ? `/class/${data.occurrenceId}`
          : data.assignmentId
            ? `/assignment/${data.assignmentId}`
            : "/(tabs)");
      router.push(targetRoute as any);
    });
    return () => {
      unsub();
    };
  }, [router]);

  return (
    <AppSidebarShell>
      <StatusBar style={isDark ? "light" : "dark"} />
      <DynamicIslandBanner />
      <Stack
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
          headerStyle: { backgroundColor: isDark ? "#0F172A" : "#FFFFFF" },
          headerTintColor: isDark ? "#F8FAFC" : "#0F172A",
          headerTitleStyle: { fontFamily: "Inter_600SemiBold", fontWeight: "600" },
          contentStyle: { backgroundColor: isDark ? "#0F172A" : "#F8FAFC" },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="class/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="course/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="assignment/add" options={{ headerShown: false }} />
        <Stack.Screen name="assignment/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="reports/index" options={{ headerShown: false }} />
        <Stack.Screen name="check-ins/pending" options={{ headerShown: false }} />
        <Stack.Screen name="class-settings/index" options={{ headerShown: false }} />
        <Stack.Screen name="setup/welcome" options={{ headerShown: false }} />
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="oauth-native-callback" options={{ headerShown: false }} />
        <Stack.Screen name="setup/profile" options={{ headerShown: false }} />
        <Stack.Screen name="setup/semester" options={{ headerShown: false }} />
        <Stack.Screen name="setup/courses" options={{ headerShown: false }} />
        <Stack.Screen name="setup/add-course" options={{ headerShown: false }} />
        <Stack.Screen name="setup/add-class" options={{ headerShown: false }} />
        <Stack.Screen name="setup/complete" options={{ headerShown: false }} />
        <Stack.Screen name="events/add" options={{ headerShown: false }} />
        <Stack.Screen name="join/scan" options={{ headerShown: false }} />
        <Stack.Screen name="join/[code]" options={{ headerShown: false }} />
        <Stack.Screen name="share/create" options={{ headerShown: false }} />
        <Stack.Screen name="share/qr-card" options={{ headerShown: false }} />
        <Stack.Screen name="share/projector" options={{ headerShown: false }} />
        <Stack.Screen name="consent/[token]" options={{ headerShown: false }} />
        <Stack.Screen name="notifications" options={{ headerShown: false }} />
        <Stack.Screen name="settings/index" options={{ headerShown: false }} />
        <Stack.Screen name="settings/reminders" options={{ headerShown: false }} />
        <Stack.Screen name="settings/reminder-check" options={{ headerShown: false }} />
        <Stack.Screen name="settings/courses" options={{ headerShown: false }} />
        <Stack.Screen name="settings/check-ins" options={{ headerShown: false }} />
        <Stack.Screen name="settings/attendance-target" options={{ headerShown: false }} />
        <Stack.Screen name="settings/account" options={{ headerShown: false }} />
        <Stack.Screen name="privacy" options={{ headerShown: false }} />
        <Stack.Screen
          name="ui-showcase"
          options={{ title: "UI Foundation Showcase", headerShown: true }}
        />
      </Stack>
    </AppSidebarShell>
  );
}

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    async function initialize() {
      try {
        await runMigrations();
      } catch (error) {
        console.error("Failed to run local SQLite migrations:", error);
      } finally {
        setDbReady(true);
      }
    }

    initialize();
  }, []);

  useEffect(() => {
    if ((fontsLoaded || fontError) && dbReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError, dbReady]);

  if (!dbReady || (!fontsLoaded && !fontError)) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <RootNavigation />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
