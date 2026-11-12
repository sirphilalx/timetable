import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { Text } from "@/components/ui/Text";
import { useAuth } from "@/auth";
import { useTheme } from "@/theme";

try {
  WebBrowser.maybeCompleteAuthSession();
} catch {
  // Safe on SSR / static export
}

/**
 * Handles `tt://setup/welcome` deep links where the OS URL parser treats
 * `setup` as the URL host and `/welcome` as the pathname.
 */
export default function WelcomeDeepLinkCallbackScreen() {
  const router = useRouter();
  const { isLoaded, isSignedIn, hasCompletedOnboarding } = useAuth();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    if (!isLoaded) return;

    const timer = setTimeout(() => {
      if (isSignedIn) {
        if (hasCompletedOnboarding) {
          router.replace("/(tabs)");
        } else {
          router.replace("/setup/profile");
        }
      } else {
        router.replace("/setup/welcome");
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [hasCompletedOnboarding, isLoaded, isSignedIn, router]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
        rowGap: 14,
      }}
    >
      <ActivityIndicator size="large" color="#4F46E5" />
      <Text
        variant="body-lg"
        style={{
          color: isDark ? "#CBD5E1" : "#334155",
          textAlign: "center",
        }}
      >
        Completing sign in...
      </Text>
    </View>
  );
}
