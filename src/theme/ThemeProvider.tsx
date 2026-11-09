import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { Appearance, useColorScheme as useRNColorScheme } from "react-native";
import { useColorScheme as useNativeWindColorScheme } from "nativewind";
import { platformStorage } from "@/lib/storage";

export type ThemePreference = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "tt_theme_preference";

interface ThemeContextValue {
  theme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setTheme: (preference: ThemePreference) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function syncNativeColorScheme(preference: ThemePreference) {
  try {
    if (typeof Appearance?.setColorScheme === "function") {
      Appearance.setColorScheme(preference === "system" ? "unspecified" : preference);
    }
  } catch {
    // Web or unsupported platform fallback
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { colorScheme, setColorScheme } = useNativeWindColorScheme();
  const rnColorScheme = useRNColorScheme();
  const [theme, setThemeState] = useState<ThemePreference>("system");

  useEffect(() => {
    async function loadTheme() {
      try {
        const saved = await platformStorage.getItem(THEME_STORAGE_KEY);
        if (saved === "light" || saved === "dark" || saved === "system") {
          setThemeState(saved);
          setColorScheme(saved);
          syncNativeColorScheme(saved);
        } else {
          setColorScheme("system");
          syncNativeColorScheme("system");
        }
      } catch {
        setColorScheme("system");
        syncNativeColorScheme("system");
      }
    }

    loadTheme();
  }, [setColorScheme]);

  const setTheme = async (preference: ThemePreference) => {
    setThemeState(preference);
    setColorScheme(preference);
    syncNativeColorScheme(preference);
    try {
      await platformStorage.setItem(THEME_STORAGE_KEY, preference);
    } catch {
      // Best effort storage persistence
    }
  };

  const resolvedTheme: ResolvedTheme = useMemo(() => {
    if (theme === "system") {
      const systemScheme = rnColorScheme ?? colorScheme;
      return systemScheme === "dark" ? "dark" : "light";
    }
    return theme === "dark" ? "dark" : "light";
  }, [theme, colorScheme, rnColorScheme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
