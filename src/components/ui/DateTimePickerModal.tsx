import React, { useState } from "react";
import { Modal, View, Pressable, ScrollView } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { Text } from "./Text";
import { useTheme } from "@/theme";
import { getTodayIsoDate } from "@/lib/dateClock";

export interface DatePickerProps {
  value: string;
  onSelect: (formattedDate: string, isoDate: string) => void;
  onClose: () => void;
  title?: string;
}

export interface DatePickerModalProps extends DatePickerProps {
  isOpen: boolean;
}

const CALENDAR_MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const CALENDAR_MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const WEEKDAY_SHORT_JS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface CalendarCell {
  day: number;
  weekdayShort: string;
  isoDate: string;
  formatted: string;
  outside?: boolean;
  year: number;
  monthIndex: number;
}

function parseInitialMonthYear(value: string): { year: number; monthIndex: number } {
  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return {
      year: Number(isoMatch[1]),
      monthIndex: Math.max(0, Math.min(11, Number(isoMatch[2]) - 1)),
    };
  }
  const lower = value.toLowerCase();
  for (let i = 0; i < CALENDAR_MONTH_SHORT.length; i++) {
    const shortName = CALENDAR_MONTH_SHORT[i]!.toLowerCase();
    if (lower.includes(shortName)) {
      const yearMatch = value.match(/\b(20\d{2})\b/);
      if (yearMatch) {
        return { year: Number(yearMatch[1]), monthIndex: i };
      }
      // Default to current device year if no year in string
      const nowYear = new Date().getFullYear();
      return { year: nowYear, monthIndex: i };
    }
  }
  const now = new Date();
  return { year: now.getFullYear(), monthIndex: now.getMonth() };
}

function buildMonthGrid(year: number, monthIndex: number): CalendarCell[][] {
  const firstOfMonth = new Date(year, monthIndex, 1);
  // Convert JS getDay() (0=Sun..6=Sat) to Monday-first index (0=Mon..6=Sun)
  const startOffset = (firstOfMonth.getDay() + 6) % 7;
  const startDate = new Date(year, monthIndex, 1 - startOffset);

  const weeks: CalendarCell[][] = [];
  for (let w = 0; w < 6; w++) {
    const row: CalendarCell[] = [];
    for (let d = 0; d < 7; d++) {
      const current = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate() + w * 7 + d,
      );
      const cellYear = current.getFullYear();
      const cellMonth = current.getMonth();
      const cellDay = current.getDate();
      const weekdayShort = WEEKDAY_SHORT_JS[current.getDay()] ?? "Mon";
      const monthShort = CALENDAR_MONTH_SHORT[cellMonth] ?? "Nov";
      const isoDate = `${cellYear}-${String(cellMonth + 1).padStart(2, "0")}-${String(cellDay).padStart(2, "0")}`;
      const formatted = `${weekdayShort} ${cellDay} ${monthShort}`;
      row.push({
        day: cellDay,
        weekdayShort,
        isoDate,
        formatted,
        outside: cellMonth !== monthIndex,
        year: cellYear,
        monthIndex: cellMonth,
      });
    }
    weeks.push(row);
  }
  return weeks;
}

export function InlineDatePicker({
  value,
  onSelect,
  onClose,
  title = "Pick a date",
}: DatePickerProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [todayIso] = useState(() => getTodayIsoDate());

  const initial = parseInitialMonthYear(value);
  const [viewYear, setViewYear] = useState<number>(initial.year);
  const [viewMonth, setViewMonth] = useState<number>(initial.monthIndex);

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const weeks = buildMonthGrid(viewYear, viewMonth);
  const monthLabel = `${CALENDAR_MONTH_NAMES[viewMonth] ?? "November"} ${viewYear}`;

  const cardBg = isDark ? "#0F172A" : "#F8FAFC";
  const textPrimary = isDark ? "#F8FAFC" : "#0F172A";
  const textSecondary = isDark ? "#94A3B8" : "#475569";
  const borderCol = isDark ? "#334155" : "#CBD5E1";

  return (
    <View
      style={{
        width: "100%",
        backgroundColor: cardBg,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: borderCol,
        marginBottom: 16,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text variant="TT/Caption" style={{ color: textSecondary, marginBottom: 2 }}>
            {title}
          </Text>
          <Text variant="TT/Subhead" style={{ color: textPrimary, fontWeight: "700" }}>
            {monthLabel}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Pressable
            onPress={goPrevMonth}
            accessibilityRole="button"
            accessibilityLabel="Previous month"
            hitSlop={10}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: borderCol,
              backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ChevronLeft size={18} color={textPrimary} />
          </Pressable>
          <Pressable
            onPress={goNextMonth}
            accessibilityRole="button"
            accessibilityLabel="Next month"
            hitSlop={10}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: borderCol,
              backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ChevronRight size={18} color={textPrimary} />
          </Pressable>
        </View>
      </View>

      {/* Weekday Labels */}
      <View style={{ flexDirection: "row", marginBottom: 6 }}>
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <View key={i} style={{ flex: 1, alignItems: "center" }}>
            <Text variant="TT/Caption" style={{ color: textSecondary }}>
              {d}
            </Text>
          </View>
        ))}
      </View>

      {/* Days Grid */}
      {weeks.map((week, wIdx) => (
        <View key={wIdx} style={{ flexDirection: "row", marginVertical: 2 }}>
          {week.map((cell, cIdx) => {
            const isSelected = cell.formatted === value || cell.isoDate === value;
            const isToday = cell.isoDate === todayIso;
            return (
              <Pressable
                key={cIdx}
                onPress={() => {
                  onSelect(cell.formatted, cell.isoDate);
                  onClose();
                }}
                accessibilityRole="button"
                accessibilityLabel={cell.formatted}
                style={{
                  flex: 1,
                  height: 36,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 17,
                    backgroundColor: isSelected ? "#4F46E5" : "transparent",
                    borderWidth: isToday && !isSelected ? 1.5 : 0,
                    borderColor: "#4F46E5",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    variant="TT/Subhead"
                    style={{
                      color: isSelected ? "#FFFFFF" : cell.outside ? "#94A3B8" : textPrimary,
                      fontWeight: isSelected || isToday ? "700" : "500",
                    }}
                  >
                    {cell.day}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

export function DatePickerModal({
  isOpen,
  onClose,
  value,
  onSelect,
  title = "Pick a date",
}: DatePickerModalProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: "rgba(15, 23, 42, 0.5)",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 20,
        }}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            width: "100%",
            maxWidth: 360,
            backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
            borderRadius: 24,
            padding: 16,
          }}
        >
          <InlineDatePicker value={value} onSelect={onSelect} onClose={onClose} title={title} />
          <Pressable
            onPress={onClose}
            style={{
              height: 44,
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: isDark ? "#0F172A" : "#F1F5F9",
            }}
          >
            <Text
              variant="TT/Subhead"
              style={{
                color: isDark ? "#F8FAFC" : "#0F172A",
                fontWeight: "600",
              }}
            >
              Close
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export interface TimePickerProps {
  value: string;
  onSelect: (formattedTime: string, time24: string) => void;
  onClose: () => void;
  title?: string;
}

export interface TimePickerModalProps extends TimePickerProps {
  isOpen: boolean;
}

const HOURS = [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6];
const MINUTES = ["00", "15", "30", "45"];

export function InlineTimePicker({
  value,
  onSelect,
  onClose,
  title = "Pick a time",
}: TimePickerProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const parsedMatch = value.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
  const [selectedHour, setSelectedHour] = useState<number>(
    parsedMatch ? Number(parsedMatch[1]) : 11,
  );
  const [selectedMin, setSelectedMin] = useState<string>(
    parsedMatch ? (parsedMatch[2] ?? "00") : "00",
  );
  const [selectedPeriod, setSelectedPeriod] = useState<"am" | "pm">(
    parsedMatch && parsedMatch[3]?.toLowerCase() === "pm" ? "pm" : "am",
  );

  const cardBg = isDark ? "#0F172A" : "#F8FAFC";
  const textPrimary = isDark ? "#F8FAFC" : "#0F172A";
  const textSecondary = isDark ? "#94A3B8" : "#475569";
  const borderCol = isDark ? "#334155" : "#CBD5E1";

  const applySelection = (hr: number, min: string, period: "am" | "pm") => {
    const formatted = `${hr}:${min} ${period}`;
    let hour24 = hr % 12;
    if (period === "pm") hour24 += 12;
    const time24 = `${String(hour24).padStart(2, "0")}:${min}`;
    onSelect(formatted, time24);
  };

  return (
    <View
      style={{
        width: "100%",
        backgroundColor: cardBg,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: borderCol,
        marginBottom: 16,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <Text variant="TT/Subhead" style={{ color: textPrimary, fontWeight: "700" }}>
          {title}
        </Text>
        <Text variant="TT/Subhead" style={{ color: "#4F46E5", fontWeight: "700" }}>
          {selectedHour}:{selectedMin} {selectedPeriod}
        </Text>
      </View>

      <Text variant="TT/Caption" style={{ color: textSecondary, marginBottom: 6 }}>
        Hour
      </Text>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 6,
          marginBottom: 12,
        }}
      >
        {HOURS.map((hr) => {
          const active = selectedHour === hr;
          return (
            <Pressable
              key={hr}
              onPress={() => {
                setSelectedHour(hr);
                applySelection(hr, selectedMin, selectedPeriod);
              }}
              style={{
                width: 44,
                height: 36,
                borderRadius: 8,
                backgroundColor: active ? "#4F46E5" : isDark ? "#1E293B" : "#E2E8F0",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                variant="TT/Subhead"
                style={{
                  color: active ? "#FFFFFF" : textPrimary,
                  fontWeight: "600",
                }}
              >
                {hr}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View
        style={{
          flexDirection: "row",
          gap: 10,
          marginBottom: 12,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text variant="TT/Caption" style={{ color: textSecondary, marginBottom: 6 }}>
            Minute
          </Text>
          <View style={{ flexDirection: "row", gap: 6 }}>
            {MINUTES.map((min) => {
              const active = selectedMin === min;
              return (
                <Pressable
                  key={min}
                  onPress={() => {
                    setSelectedMin(min);
                    applySelection(selectedHour, min, selectedPeriod);
                  }}
                  style={{
                    flex: 1,
                    height: 36,
                    borderRadius: 8,
                    backgroundColor: active ? "#4F46E5" : isDark ? "#1E293B" : "#E2E8F0",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    variant="TT/Subhead"
                    style={{
                      color: active ? "#FFFFFF" : textPrimary,
                      fontWeight: "600",
                    }}
                  >
                    :{min}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={{ width: 96 }}>
          <Text variant="TT/Caption" style={{ color: textSecondary, marginBottom: 6 }}>
            AM / PM
          </Text>
          <View style={{ flexDirection: "row", gap: 6 }}>
            {(["am", "pm"] as const).map((p) => {
              const active = selectedPeriod === p;
              return (
                <Pressable
                  key={p}
                  onPress={() => {
                    setSelectedPeriod(p);
                    applySelection(selectedHour, selectedMin, p);
                  }}
                  style={{
                    flex: 1,
                    height: 36,
                    borderRadius: 8,
                    backgroundColor: active ? "#4F46E5" : isDark ? "#1E293B" : "#E2E8F0",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    variant="TT/Subhead"
                    style={{
                      color: active ? "#FFFFFF" : textPrimary,
                      fontWeight: "600",
                    }}
                  >
                    {p}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      <Pressable
        onPress={onClose}
        style={{
          height: 40,
          borderRadius: 10,
          backgroundColor: "#4F46E5",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text variant="TT/Subhead" style={{ color: "#FFFFFF", fontWeight: "600" }}>
          Done
        </Text>
      </Pressable>
    </View>
  );
}

export function TimePickerModal({
  isOpen,
  onClose,
  value,
  onSelect,
  title = "Pick a time",
}: TimePickerModalProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: "rgba(15, 23, 42, 0.5)",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 20,
        }}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            width: "100%",
            maxWidth: 360,
            backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
            borderRadius: 24,
            padding: 16,
          }}
        >
          <InlineTimePicker value={value} onSelect={onSelect} onClose={onClose} title={title} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export interface BirthDatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  day: number;
  monthIndex: number;
  year: number;
  onSelect: (result: {
    day: number;
    monthIndex: number;
    year: number;
    formatted: string;
    isoDate: string;
    isUnder18: boolean;
  }) => void;
}

const MONTH_NAMES_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const BIRTH_YEARS = Array.from({ length: 24 }, (_, idx) => 2012 - idx); // 2012 down to 1989

function getDaysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export function BirthDatePickerModal({
  isOpen,
  onClose,
  day: initialDay,
  monthIndex: initialMonthIndex,
  year: initialYear,
  onSelect,
}: BirthDatePickerModalProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [todayIso] = useState(() => getTodayIsoDate());

  const [selectedYear, setSelectedYear] = useState<number>(initialYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(initialMonthIndex);
  const maxDays = getDaysInMonth(selectedYear, selectedMonth);
  const [selectedDay, setSelectedDay] = useState<number>(Math.min(initialDay, maxDays));

  const daysArray = Array.from({ length: maxDays }, (_, idx) => idx + 1);

  const handleConfirm = () => {
    const clampedDay = Math.min(selectedDay, getDaysInMonth(selectedYear, selectedMonth));
    const monthLabel = MONTH_NAMES_SHORT[selectedMonth] ?? "Mar";
    const formatted = `${clampedDay} ${monthLabel} ${selectedYear}`;
    const mm = String(selectedMonth + 1).padStart(2, "0");
    const dd = String(clampedDay).padStart(2, "0");
    const isoDate = `${selectedYear}-${mm}-${dd}`;

    const [rY = 2026, rM = 11, rD = 8] = todayIso.split("-").map(Number);
    const refYear = rY;
    const refMonth = rM - 1;
    const refDay = rD;
    let age = refYear - selectedYear;
    if (selectedMonth > refMonth || (selectedMonth === refMonth && clampedDay > refDay)) {
      age -= 1;
    }

    onSelect({
      day: clampedDay,
      monthIndex: selectedMonth,
      year: selectedYear,
      formatted,
      isoDate,
      isUnder18: age < 18,
    });
    onClose();
  };

  const textPrimary = isDark ? "#F8FAFC" : "#0F172A";
  const textSecondary = isDark ? "#94A3B8" : "#475569";

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: "rgba(15, 23, 42, 0.55)",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 20,
        }}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            width: "100%",
            maxWidth: 372,
            backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
            borderRadius: 24,
            padding: 20,
            borderWidth: 1,
            borderColor: isDark ? "#334155" : "#E2E8F0",
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <Text variant="title-card" style={{ color: textPrimary }}>
              Select date of birth
            </Text>
            <View
              style={{
                backgroundColor: isDark ? "#1E1B4B" : "#EEF2FF",
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 999,
              }}
            >
              <Text variant="label" style={{ color: isDark ? "#818CF8" : "#4F46E5" }}>
                {Math.min(selectedDay, maxDays)} {MONTH_NAMES_SHORT[selectedMonth]} {selectedYear}
              </Text>
            </View>
          </View>

          {/* Year Picker */}
          <Text variant="caption" style={{ color: textSecondary, marginBottom: 6 }}>
            Year
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ columnGap: 8, paddingBottom: 4 }}
            style={{ marginBottom: 14 }}
          >
            {BIRTH_YEARS.map((yr) => {
              const active = yr === selectedYear;
              return (
                <Pressable
                  key={yr}
                  onPress={() => setSelectedYear(yr)}
                  accessibilityRole="button"
                  style={{
                    paddingHorizontal: 14,
                    height: 38,
                    borderRadius: 10,
                    backgroundColor: active ? "#4F46E5" : isDark ? "#0F172A" : "#F1F5F9",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    variant="label"
                    style={{
                      color: active ? "#FFFFFF" : textPrimary,
                      fontFamily: active ? "Inter_700Bold" : "Inter_500Medium",
                    }}
                  >
                    {yr}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Month Grid */}
          <Text variant="caption" style={{ color: textSecondary, marginBottom: 6 }}>
            Month
          </Text>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 6,
              marginBottom: 14,
            }}
          >
            {MONTH_NAMES_SHORT.map((mName, mIdx) => {
              const active = mIdx === selectedMonth;
              return (
                <Pressable
                  key={mName}
                  onPress={() => setSelectedMonth(mIdx)}
                  accessibilityRole="button"
                  style={{
                    width: "23%",
                    height: 36,
                    borderRadius: 8,
                    backgroundColor: active ? "#4F46E5" : isDark ? "#0F172A" : "#F1F5F9",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    variant="label"
                    style={{
                      color: active ? "#FFFFFF" : textPrimary,
                      fontFamily: active ? "Inter_700Bold" : "Inter_500Medium",
                    }}
                  >
                    {mName}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Day Grid */}
          <Text variant="caption" style={{ color: textSecondary, marginBottom: 6 }}>
            Day
          </Text>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 6,
              marginBottom: 20,
            }}
          >
            {daysArray.map((d) => {
              const active = d === Math.min(selectedDay, maxDays);
              return (
                <Pressable
                  key={d}
                  onPress={() => setSelectedDay(d)}
                  accessibilityRole="button"
                  style={{
                    width: 38,
                    height: 36,
                    borderRadius: 8,
                    backgroundColor: active ? "#4F46E5" : isDark ? "#0F172A" : "#F1F5F9",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    variant="label"
                    style={{
                      color: active ? "#FFFFFF" : textPrimary,
                      fontFamily: active ? "Inter_700Bold" : "Inter_500Medium",
                    }}
                  >
                    {d}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Action Buttons */}
          <View style={{ flexDirection: "row", columnGap: 10 }}>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              style={{
                flex: 1,
                height: 46,
                borderRadius: 12,
                backgroundColor: isDark ? "#0F172A" : "#F1F5F9",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text variant="label-lg" style={{ color: textPrimary }}>
                Cancel
              </Text>
            </Pressable>

            <Pressable
              onPress={handleConfirm}
              accessibilityRole="button"
              style={{
                flex: 1,
                height: 46,
                borderRadius: 12,
                backgroundColor: "#4F46E5",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text variant="label-lg" style={{ color: "#FFFFFF" }}>
                Done
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
