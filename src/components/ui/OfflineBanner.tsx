import React, { useEffect, useState } from "react";
import { View } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { WifiOff } from "lucide-react-native";
import { Text } from "./Text";
import { cn } from "@/lib/utils";

export interface OfflineBannerProps {
  isOffline?: boolean;
  className?: string;
}

export function OfflineBanner({ isOffline: manualOffline, className }: OfflineBannerProps) {
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
        "w-full min-h-[48px] px-4 py-2.5 flex-row items-center justify-center bg-amber-50 dark:bg-amber-950/80 border-b border-amber-200 dark:border-amber-900/60 shadow-sm",
        className,
      )}
    >
      <View className="mr-2.5">
        <WifiOff size={18} color="#D97706" />
      </View>
      <Text variant="caption" className="flex-1 font-medium text-amber-900 dark:text-amber-200">
        You are offline. Your timetable remains accessible and changes will sync once reconnected.
      </Text>
    </View>
  );
}
