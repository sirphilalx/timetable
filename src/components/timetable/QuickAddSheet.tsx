import React from "react";
import { View, ScrollView, Pressable, Modal } from "react-native";
import { useRouter } from "expo-router";
import { Plus, BookOpen, Calendar, FileText, Sparkles, X, ChevronRight } from "lucide-react-native";
import { Text } from "@/components/ui/Text";
import { useTheme } from "@/theme";
import {
  useTimetable,
  useUpdateCalendarFilters,
  type CalendarCategory,
} from "@/hooks/useTimetable";

const CALENDAR_CHIPS: { id: CalendarCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "classes", label: "Classes" },
  { id: "assignments", label: "Assignments" },
  { id: "exams", label: "Exams" },
  { id: "others", label: "Study & Others" },
];

export function CalendarFilterBar({ onOpenQuickAdd }: { onOpenQuickAdd?: () => void }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { data } = useTimetable();
  const updateFilters = useUpdateCalendarFilters();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 14,
        columnGap: 8,
      }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ columnGap: 6, paddingRight: 4 }}
        style={{ flex: 1 }}
      >
        {CALENDAR_CHIPS.map((chip) => {
          const active = data.activeCalendarFilter === chip.id;
          return (
            <Pressable
              key={chip.id}
              onPress={() => updateFilters.mutate({ calendarFilter: chip.id })}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={{
                paddingHorizontal: 12,
                height: 34,
                borderRadius: 9999,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: active ? "#4F46E5" : isDark ? "#1E293B" : "#FFFFFF",
                borderWidth: 1,
                borderColor: active ? "#4F46E5" : isDark ? "#334155" : "#E2E8F0",
              }}
            >
              <Text
                variant="caption"
                style={{
                  color: active ? "#FFFFFF" : isDark ? "#CBD5E1" : "#475569",
                  fontFamily: active ? "Inter_600SemiBold" : "Inter_500Medium",
                }}
              >
                {chip.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {onOpenQuickAdd ? (
        <Pressable
          onPress={onOpenQuickAdd}
          accessibilityRole="button"
          accessibilityLabel="Quick add to timetable"
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            columnGap: 4,
            paddingHorizontal: 12,
            height: 34,
            borderRadius: 9999,
            backgroundColor: pressed
              ? isDark
                ? "#3730A3"
                : "#4338CA"
              : isDark
                ? "#312E81"
                : "#EEF2FF",
            borderWidth: 1,
            borderColor: isDark ? "#4F46E5" : "#C7D2FE",
          })}
        >
          <Plus size={14} color={isDark ? "#A5B4FC" : "#4F46E5"} strokeWidth={2.5} />
          <Text
            variant="caption"
            style={{
              color: isDark ? "#A5B4FC" : "#4F46E5",
              fontFamily: "Inter_600SemiBold",
            }}
          >
            Add
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function QuickAddSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const actions = [
    {
      id: "course",
      title: "Add a course",
      subtitle: "Register a course code, title, units & colour",
      href: "/setup/add-course",
      icon: BookOpen,
      accentBg: isDark ? "#1E1B4B" : "#EEF2FF",
      accentColor: isDark ? "#818CF8" : "#4F46E5",
    },
    {
      id: "class",
      title: "Add class time",
      subtitle: "Schedule a weekly lecture, tutorial, lab, or one-off class",
      href: "/setup/add-class",
      icon: Calendar,
      accentBg: isDark ? "rgba(37, 99, 235, 0.18)" : "#DBEAFE",
      accentColor: isDark ? "#60A5FA" : "#2563EB",
    },
    {
      id: "assignment",
      title: "Add assignment",
      subtitle: "Track a solo or group assignment deadline",
      href: "/assignment/add",
      icon: FileText,
      accentBg: isDark ? "rgba(217, 119, 6, 0.18)" : "#FEF3C7",
      accentColor: isDark ? "#FBBF24" : "#D97706",
    },
    {
      id: "event",
      title: "Add exam, study session, or personal event",
      subtitle: "Schedule an exam paper, reading block, gym, or church",
      href: "/events/add",
      icon: Sparkles,
      accentBg: isDark ? "#134E4A" : "#CCFBF1",
      accentColor: isDark ? "#2DD4BF" : "#0D9488",
    },
  ] as const;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: "rgba(15, 23, 42, 0.55)",
          justifyContent: "flex-end",
        }}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 28,
            rowGap: 14,
            borderTopWidth: 1,
            borderColor: isDark ? "#334155" : "#E2E8F0",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 2,
            }}
          >
            <View>
              <Text variant="title-section" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                Add to timetable
              </Text>
              <Text variant="caption" style={{ color: isDark ? "#94A3B8" : "#64748B" }}>
                Choose what you want to schedule
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={10}
              style={{
                width: 34,
                height: 34,
                borderRadius: 17,
                backgroundColor: isDark ? "#0F172A" : "#F1F5F9",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={18} color={isDark ? "#94A3B8" : "#64748B"} strokeWidth={2} />
            </Pressable>
          </View>

          <View style={{ rowGap: 10 }}>
            {actions.map((item) => {
              const IconComponent = item.icon;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => {
                    onClose();
                    router.push(item.href as any);
                  }}
                  accessibilityRole="button"
                  style={({ pressed }) => ({
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 14,
                    borderRadius: 14,
                    backgroundColor: pressed
                      ? isDark
                        ? "#334155"
                        : "#F1F5F9"
                      : isDark
                        ? "#0F172A"
                        : "#F8FAFC",
                    borderWidth: 1,
                    borderColor: isDark ? "#334155" : "#E2E8F0",
                    columnGap: 12,
                  })}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      backgroundColor: item.accentBg,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <IconComponent size={20} color={item.accentColor} strokeWidth={2} />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text variant="title-card" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                      {item.title}
                    </Text>
                    <Text
                      variant="caption"
                      style={{ color: isDark ? "#94A3B8" : "#475569", marginTop: 2 }}
                    >
                      {item.subtitle}
                    </Text>
                  </View>

                  <ChevronRight size={18} color={isDark ? "#64748B" : "#94A3B8"} strokeWidth={2} />
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
