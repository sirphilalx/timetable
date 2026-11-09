import React, { useState } from "react";
import { View, Image } from "react-native";
import Svg, { Circle, Path, Rect, G } from "react-native-svg";
import { Camera } from "lucide-react-native";
import { Text } from "./Text";
import { useTheme } from "@/theme";
import { STUDENT_AVATAR_PRESETS, type StudentAvatarPreset } from "@/lib/photoPicker";

export interface StudentAvatarProps {
  avatarUrl?: string | null;
  initials: string;
  size?: number;
  borderWidth?: number;
  borderColor?: string;
  showCameraBadge?: boolean;
}

function renderPortraitSvg(preset: StudentAvatarPreset, size: number) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* Background circle */}
      <Circle cx="50" cy="50" r="50" fill={preset.bg} />
      <Circle cx="50" cy="50" r="42" fill={preset.accent} opacity={0.35} />

      {/* Back Hair for Afro / Braids / Locs */}
      {preset.hairStyle === "afro" && <Circle cx="50" cy="38" r="26" fill={preset.hair} />}
      {preset.hairStyle === "braids" && (
        <G fill={preset.hair}>
          <Circle cx="50" cy="38" r="22" />
          <Rect x="27" y="38" width="8" height="32" rx="4" />
          <Rect x="65" y="38" width="8" height="32" rx="4" />
        </G>
      )}
      {preset.hairStyle === "locs" && (
        <G fill={preset.hair}>
          <Circle cx="50" cy="36" r="21" />
          <Rect x="29" y="36" width="6" height="26" rx="3" />
          <Rect x="65" y="36" width="6" height="26" rx="3" />
        </G>
      )}

      {/* Shoulders / Shirt */}
      <Path d="M18 100 C18 74 32 66 50 66 C68 66 82 74 82 100 Z" fill={preset.shirt} />
      {/* Shirt collar accent */}
      <Path d="M40 67 L50 78 L60 67 Z" fill="#FFFFFF" opacity={0.85} />

      {/* Neck */}
      <Rect x="43" y="54" width="14" height="16" rx="6" fill={preset.skin} />

      {/* Ears */}
      <Circle cx="31" cy="46" r="4.5" fill={preset.skin} />
      <Circle cx="69" cy="46" r="4.5" fill={preset.skin} />

      {/* Face */}
      <Rect x="32" y="26" width="36" height="36" rx="18" fill={preset.skin} />

      {/* Top Hair / Headwrap */}
      {preset.hairStyle === "fade" && (
        <Path
          d="M32 38 C32 25 40 21 50 21 C60 21 68 25 68 38 C63 33 37 33 32 38 Z"
          fill={preset.hair}
        />
      )}
      {preset.hairStyle === "curls" && (
        <G fill={preset.hair}>
          <Circle cx="38" cy="28" r="7" />
          <Circle cx="46" cy="25" r="8" />
          <Circle cx="55" cy="25" r="8" />
          <Circle cx="62" cy="28" r="7" />
        </G>
      )}
      {preset.hairStyle === "braids" && (
        <Path
          d="M32 40 C32 25 40 22 50 22 C60 22 68 25 68 40 C62 32 38 32 32 40 Z"
          fill={preset.hair}
        />
      )}
      {preset.hairStyle === "locs" && (
        <Path
          d="M32 39 C32 24 40 21 50 21 C60 21 68 24 68 39 C61 32 39 32 32 39 Z"
          fill={preset.hair}
        />
      )}
      {preset.hairStyle === "afro" && (
        <Path
          d="M31 39 C31 24 40 20 50 20 C60 20 69 24 69 39 C62 32 38 32 31 39 Z"
          fill={preset.hair}
        />
      )}
      {preset.hairStyle === "headwrap" && (
        <G>
          <Path
            d="M30 40 C30 22 40 17 50 17 C60 17 70 22 70 40 C62 32 38 32 30 40 Z"
            fill={preset.shirt}
          />
          <Circle cx="50" cy="21" r="6" fill={preset.accent} />
        </G>
      )}

      {/* Eyes */}
      <Circle cx="42" cy="44" r="2.3" fill="#0F172A" />
      <Circle cx="58" cy="44" r="2.3" fill="#0F172A" />

      {/* Optional Glasses */}
      {preset.glasses && (
        <G stroke="#FFFFFF" strokeWidth="1.8" fill="none">
          <Circle cx="42" cy="44" r="5.5" />
          <Circle cx="58" cy="44" r="5.5" />
          <Path d="M47.5 44 L52.5 44" />
        </G>
      )}

      {/* Warm Smile */}
      <Path
        d="M44 52 Q50 57 56 52"
        stroke="#FFFFFF"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

export function StudentAvatar({
  avatarUrl,
  initials,
  size = 44,
  borderWidth = 2,
  borderColor,
  showCameraBadge = false,
}: StudentAvatarProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [imageError, setImageError] = useState(false);

  const preset = avatarUrl?.startsWith("avatar:")
    ? STUDENT_AVATAR_PRESETS.find((p) => p.id === avatarUrl)
    : undefined;

  const hasValidImageUri = Boolean(
    avatarUrl &&
    !preset &&
    !imageError &&
    (avatarUrl.startsWith("data:image/") ||
      avatarUrl.startsWith("file://") ||
      avatarUrl.startsWith("content://") ||
      avatarUrl.startsWith("ph://") ||
      avatarUrl.startsWith("http://") ||
      avatarUrl.startsWith("https://") ||
      avatarUrl.startsWith("blob:")),
  );

  const resolvedBorderColor = borderColor ?? (isDark ? "#334155" : "#FFFFFF");
  const fontSize = size >= 72 ? 22 : size >= 46 ? 15 : 13;
  const badgeSize = Math.max(24, Math.round(size * 0.34));

  return (
    <View
      style={{
        width: size,
        height: size,
        position: "relative",
      }}
    >
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: isDark ? "#1E1B4B" : "#EEF2FF",
          borderWidth,
          borderColor: resolvedBorderColor,
        }}
      >
        {preset ? (
          renderPortraitSvg(preset, size)
        ) : hasValidImageUri && avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={{ width: size, height: size }}
            resizeMode="cover"
            onError={() => setImageError(true)}
            accessibilityLabel="Student profile photo"
          />
        ) : (
          <Text
            variant={size >= 72 ? "title-page" : "label"}
            style={{
              color: isDark ? "#818CF8" : "#4F46E5",
              fontFamily: "Inter_600SemiBold",
              fontSize,
            }}
          >
            {initials || "ST"}
          </Text>
        )}
      </View>

      {showCameraBadge && (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            right: -2,
            bottom: -2,
            width: badgeSize,
            height: badgeSize,
            borderRadius: badgeSize / 2,
            backgroundColor: "#4F46E5",
            borderWidth: 2,
            borderColor: isDark ? "#0F172A" : "#FFFFFF",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Camera size={Math.round(badgeSize * 0.52)} color="#FFFFFF" strokeWidth={2.2} />
        </View>
      )}
    </View>
  );
}
