import React from "react";
import { View } from "react-native";
import { Check } from "lucide-react-native";
import { Text } from "@/components/ui/Text";

export interface QrMatrixProps {
  size?: number;
  color?: string;
}

// Deterministic 15x15 dot matrix pattern (excluding finder corners and center 5x5 emblem)
const DOT_ROWS: number[][] = [
  [0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0],
  [1, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0],
  [0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1],
  [1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1],
  [1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1],
  [0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0],
  [0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
  [0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0],
  [0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 0, 0, 1],
  [0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1],
  [0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1],
];

export function QrMatrix({ size = 148, color = "#312E81" }: QrMatrixProps) {
  const cellSize = size / 15;
  const finderSize = cellSize * 4.4;
  const finderInner = cellSize * 2.1;

  return (
    <View
      style={{
        width: size,
        height: size,
        position: "relative",
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
      }}
    >
      {/* Dots */}
      {DOT_ROWS.map((row, rIdx) =>
        row.map((val, cIdx) => {
          if (!val) return null;
          return (
            <View
              key={`${rIdx}-${cIdx}`}
              style={{
                position: "absolute",
                top: rIdx * cellSize + cellSize * 0.12,
                left: cIdx * cellSize + cellSize * 0.12,
                width: cellSize * 0.76,
                height: cellSize * 0.76,
                borderRadius: (cellSize * 0.76) / 2,
                backgroundColor: color,
              }}
            />
          );
        }),
      )}

      {/* Top-Left Finder Square */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: finderSize,
          height: finderSize,
          borderRadius: finderSize * 0.28,
          borderWidth: cellSize * 0.65,
          borderColor: color,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FFFFFF",
        }}
      >
        <View
          style={{
            width: finderInner,
            height: finderInner,
            borderRadius: finderInner * 0.25,
            backgroundColor: color,
          }}
        />
      </View>

      {/* Top-Right Finder Square */}
      <View
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: finderSize,
          height: finderSize,
          borderRadius: finderSize * 0.28,
          borderWidth: cellSize * 0.65,
          borderColor: color,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FFFFFF",
        }}
      >
        <View
          style={{
            width: finderInner,
            height: finderInner,
            borderRadius: finderInner * 0.25,
            backgroundColor: color,
          }}
        />
      </View>

      {/* Bottom-Left Finder Square */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: finderSize,
          height: finderSize,
          borderRadius: finderSize * 0.28,
          borderWidth: cellSize * 0.65,
          borderColor: color,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FFFFFF",
        }}
      >
        <View
          style={{
            width: finderInner,
            height: finderInner,
            borderRadius: finderInner * 0.25,
            backgroundColor: color,
          }}
        />
      </View>

      {/* Center TT Calendar Emblem */}
      <View
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: size * 0.28,
          height: size * 0.28,
          marginLeft: -(size * 0.14),
          marginTop: -(size * 0.14),
          borderRadius: size * 0.14,
          backgroundColor: "#F1F5F9",
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 2,
          borderColor: "#FFFFFF",
        }}
      >
        <View
          style={{
            width: size * 0.19,
            height: size * 0.19,
            borderRadius: 4,
            backgroundColor: "#FFFFFF",
            borderWidth: 1.5,
            borderColor: "#CBD5E1",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
          }}
        >
          <Text
            variant="caption"
            style={{
              fontFamily: "Inter_700Bold",
              fontSize: Math.max(9, Math.round(size * 0.065)),
              lineHeight: Math.max(11, Math.round(size * 0.08)),
              color: "#4F46E5",
            }}
          >
            T
          </Text>
          <Check size={Math.max(10, Math.round(size * 0.07))} color="#0F172A" strokeWidth={2.8} />
        </View>
      </View>
    </View>
  );
}
