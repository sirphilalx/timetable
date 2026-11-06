import "../../global.css";
import React, { useEffect, useState } from "react";
import { Stack } from "expo-router";
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

function RootNavigation() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: isDark ? "#0F172A" : "#FFFFFF" },
          headerTintColor: isDark ? "#F8FAFC" : "#0F172A",
          headerTitleStyle: { fontFamily: "Inter_600SemiBold", fontWeight: "600" },
          contentStyle: { backgroundColor: isDark ? "#0F172A" : "#F8FAFC" },
        }}
      >
        <Stack.Screen name="index" options={{ title: "TT Today", headerShown: false }} />
        <Stack.Screen
          name="ui-showcase"
          options={{ title: "UI Foundation Showcase", headerShown: true }}
        />
        <Stack.Screen name="join/[code]" options={{ title: "Join Class", presentation: "modal" }} />
      </Stack>
    </>
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
      <ThemeProvider>
        <RootNavigation />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
