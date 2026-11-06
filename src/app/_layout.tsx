import "../../global.css";
import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as SplashScreen from "expo-splash-screen";

// Prevent splash screen auto-hiding while initial assets and database verify
SplashScreen.preventAutoHideAsync().catch(() => {
  // Splash screen handling fallback
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5
    }
  }
});

export default function RootLayout() {
  useEffect(() => {
    // Hide splash screen once mounted
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#0F172A" },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: { fontWeight: "600" },
          contentStyle: { backgroundColor: "#F8FAFC" }
        }}
      >
        <Stack.Screen name="index" options={{ title: "TT Today", headerShown: false }} />
        <Stack.Screen name="join/[code]" options={{ title: "Join Class", presentation: "modal" }} />
      </Stack>
    </QueryClientProvider>
  );
}
