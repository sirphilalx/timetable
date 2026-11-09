import React, { useEffect, useState } from "react";
import { View } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { WifiOff } from "lucide-react-native";
import { Text } from "./Text";
import { cn } from "@/lib/utils";
import { useTheme } from "@/theme";

export interface OfflineBannerProps {
  isOffline?: boolean;
  className?: string;
}

export function OfflineBanner({ isOffline: manualOffline, className }: OfflineBannerProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [isNetOffline, setIsNetOffline] = useState(false);

  useEffect(() => {
    if (manualOffline !== undefined) {
      return;
    }

    const unsubscribe = NetInfo.addEventListener((state) => {
      const offline = !state.isConnected || state.isInternetReachable === false;
      setIsNetOffline(offline);
    });

    return () => {
      unsubscribe();
    };
  }, [manualOffline]);

  const showBanner = manualOffline !== undefined ? manualOffline : isNetOffline;

  if (!showBanner) {
    return null;
  }

  return (
    <View
      accessibilityRole="alert"
      className={cn(
        "w-full min-h-[48px] px-4 py-2.5 flex-row items-center justify-center shadow-sm",
        className,
      )}
      style={{
        backgroundColor: isDark ? "#451A03" : "#FFFBEB",
        borderBottomWidth: 1,
        borderBottomColor: isDark ? "#78350F" : "#FDE68A",
      }}
    >
      <View className="mr-2.5">
        <WifiOff size={18} color={isDark ? "#FBBF24" : "#D97706"} />
      </View>
      <Text
        variant="caption"
        style={{
          flex: 1,
          fontFamily: "Inter_500Medium",
          color: isDark ? "#FDE68A" : "#78350F",
        }}
      >
        You are offline. Your timetable remains accessible and changes will sync once reconnected.
      </Text>
    </View>
  );
}
