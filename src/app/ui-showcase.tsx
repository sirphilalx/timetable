import React, { useState } from "react";
import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Sun, Moon, Smartphone, Search, Calendar } from "lucide-react-native";
import {
  Text,
  Button,
  Input,
  Card,
  Badge,
  Sheet,
  Dialog,
  OfflineBanner,
  EmptyState,
} from "@/components/ui";
import { ClassCard, AttendancePill } from "@/components/timetable";
import { useTheme } from "@/theme";

export default function UIShowcaseScreen() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDestructiveDialogOpen, setIsDestructiveDialogOpen] = useState(false);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState("");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }}>
      {/* Offline banner toggle demonstration */}
      <OfflineBanner isOffline={showOfflineBanner} />

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header and Theme Controller */}
        <View className="mb-6">
          <Text variant="title-page" className="mb-1 font-bold">
            UI Foundation & Tokens
          </Text>
          <Text variant="body" className="text-slate-500 dark:text-slate-400 mb-4">
            Cadence Academy tokens, Inter typography ramp, and accessible primitives.
          </Text>

          {/* Theme Switcher Card */}
          <Card className="p-4">
            <Text variant="title-card" className="mb-3 font-semibold">
              Theme Mode ({theme.toUpperCase()} · Resolved: {resolvedTheme})
            </Text>
            <View className="flex-row gap-2">
              <Button
                variant={theme === "system" ? "primary" : "secondary"}
                size="sm"
                icon={<Smartphone size={16} color={theme === "system" ? "#FFFFFF" : "#64748B"} />}
                onPress={() => setTheme("system")}
                className="flex-1"
              >
                System
              </Button>
              <Button
                variant={theme === "light" ? "primary" : "secondary"}
                size="sm"
                icon={<Sun size={16} color={theme === "light" ? "#FFFFFF" : "#64748B"} />}
                onPress={() => setTheme("light")}
                className="flex-1"
              >
                Light
              </Button>
              <Button
                variant={theme === "dark" ? "primary" : "secondary"}
                size="sm"
                icon={<Moon size={16} color={theme === "dark" ? "#0F172A" : "#64748B"} />}
                onPress={() => setTheme("dark")}
                className="flex-1"
              >
                Dark
              </Button>
            </View>
          </Card>
        </View>

        {/* Section: Timetable Cards */}
        <View className="mb-8">
          <Text variant="title-section" className="mb-3 font-semibold">
            Timetable Cards & Attendance
          </Text>

          {/* Upcoming Class */}
          <View className="mb-3">
            <ClassCard
              courseCode="CSC 301"
              courseTitle="Data Structures and Algorithms"
              courseColor="#2563EB"
              time="10:00 AM – 12:00 PM"
              venue="Engineering Theatre Hall A"
              lecturer="Prof. O. Adebayo"
              status="upcoming"
            />
          </View>

          {/* Relocated Class */}
          <View className="mb-3">
            <ClassCard
              courseCode="MTH 312"
              courseTitle="Abstract Algebra & Ring Theory"
              courseColor="#7C3AED"
              time="02:00 PM – 04:00 PM"
              venue="Science Lecture Theatre 2 (Relocated)"
              lecturer="Dr. Mrs. Eke"
              status="moved"
            />
          </View>

          {/* Faded Ended / Past Class */}
          <View className="mb-4">
            <ClassCard
              courseCode="PHY 305"
              courseTitle="Electromagnetism & Waves"
              courseColor="#0D9488"
              time="08:00 AM – 10:00 AM"
              venue="Physics Lab 1"
              lecturer="Dr. Bello"
              status="ended"
              isPast
            />
          </View>

          {/* Attendance Pills */}
          <Text variant="title-card" className="mb-2 font-semibold">
            Attendance Status Indicators
          </Text>
          <View className="flex-row flex-wrap gap-2">
            <AttendancePill status="attended" />
            <AttendancePill status="missed" />
            <AttendancePill status="pending" />
            <AttendancePill status="cancelled" />
          </View>
        </View>

        {/* Section: Action Buttons */}
        <View className="mb-8">
          <Text variant="title-section" className="mb-3 font-semibold">
            Action Buttons
          </Text>
          <View className="gap-3">
            <Button variant="primary">Primary Action</Button>
            <Button variant="secondary">Secondary Action</Button>
            <Button variant="destructive">Destructive Action</Button>
            <Button variant="subtle">Subtle Action</Button>
            <View className="flex-row gap-2">
              <Button size="sm" variant="primary" className="flex-1">
                Small Primary
              </Button>
              <Button size="sm" variant="secondary" className="flex-1">
                Small Secondary
              </Button>
            </View>
            <Button variant="primary" isLoading>
              Loading Action
            </Button>
          </View>
        </View>

        {/* Section: Form Inputs */}
        <View className="mb-8">
          <Text variant="title-section" className="mb-3 font-semibold">
            Form Inputs
          </Text>
          <Input
            label="Course Search"
            placeholder="e.g. CSC 301, Engineering"
            value={inputValue}
            onChangeText={setInputValue}
            leftIcon={<Search size={18} color="#94A3B8" />}
            helperText="Search courses across all semesters"
          />

          <Input
            label="Validated Field"
            placeholder="Type 'error' to trigger validation state"
            value={inputError}
            onChangeText={(text) => {
              setInputError(text);
            }}
            error={
              inputError.toLowerCase() === "error"
                ? "This course code already exists in your timetable"
                : undefined
            }
            helperText="Validation dynamically activates"
          />
        </View>

        {/* Section: Status Badges */}
        <View className="mb-8">
          <Text variant="title-section" className="mb-3 font-semibold">
            Semantic Badges
          </Text>
          <View className="flex-row flex-wrap gap-2">
            <Badge variant="success" label="Active Semester" />
            <Badge variant="warning" label="72% Attendance Warning" />
            <Badge variant="danger" label="Schedule Clash" />
            <Badge variant="info" label="Shared Link" />
            <Badge variant="neutral" label="Archived" />
          </View>
        </View>

        {/* Section: Overlays and Feedback */}
        <View className="mb-8">
          <Text variant="title-section" className="mb-3 font-semibold">
            Overlays & Feedback
          </Text>
          <View className="gap-3">
            <Button variant="secondary" onPress={() => setIsSheetOpen(true)}>
              Open Bottom Sheet (24px Radius)
            </Button>
            <Button variant="secondary" onPress={() => setIsDialogOpen(true)}>
              Open Confirmation Dialog
            </Button>
            <Button variant="secondary" onPress={() => setIsDestructiveDialogOpen(true)}>
              Open Destructive Alert Dialog
            </Button>
            <Button variant="subtle" onPress={() => setShowOfflineBanner(!showOfflineBanner)}>
              Toggle Offline Banner ({showOfflineBanner ? "Visible" : "Hidden"})
            </Button>
          </View>
        </View>

        {/* Section: Empty State Primitive */}
        <View className="mb-8">
          <Text variant="title-section" className="mb-3 font-semibold">
            Empty State Primitive
          </Text>
          <Card>
            <EmptyState
              icon={<Calendar size={28} color="#4F46E5" />}
              title="No Classes Today"
              description="You have a lecture free day. Take time to read or review upcoming assignments."
              actionLabel="Add Personal Study"
              onAction={() => {}}
            />
          </Card>
        </View>

        {/* Section: Typography Ramp */}
        <View className="mb-8">
          <Text variant="title-section" className="mb-3 font-semibold">
            Typography Ramp (12 Variants)
          </Text>
          <Card className="p-4 gap-3">
            <View>
              <Text variant="caption" className="text-slate-400 mb-0.5">
                display · 32px bold
              </Text>
              <Text variant="display">75% Attendance</Text>
            </View>
            <View>
              <Text variant="caption" className="text-slate-400 mb-0.5">
                title-page · 24px bold
              </Text>
              <Text variant="title-page">Today Timetable</Text>
            </View>
            <View>
              <Text variant="caption" className="text-slate-400 mb-0.5">
                title-section · 20px semibold
              </Text>
              <Text variant="title-section">Upcoming Lectures</Text>
            </View>
            <View>
              <Text variant="caption" className="text-slate-400 mb-0.5">
                title-card · 17px semibold
              </Text>
              <Text variant="title-card">CSC 301 · Software Engineering</Text>
            </View>
            <View>
              <Text variant="caption" className="text-slate-400 mb-0.5">
                time · 18px tabular nums
              </Text>
              <Text variant="time">10:00 AM – 12:00 PM · LT2</Text>
            </View>
            <View>
              <Text variant="caption" className="text-slate-400 mb-0.5">
                body-lg · 16px regular
              </Text>
              <Text variant="body-lg">Form field label and primary reading body text.</Text>
            </View>
            <View>
              <Text variant="caption" className="text-slate-400 mb-0.5">
                body · 14px regular
              </Text>
              <Text variant="body">Supporting descriptions and secondary explanations.</Text>
            </View>
            <View>
              <Text variant="caption" className="text-slate-400 mb-0.5">
                label-lg · 16px semibold
              </Text>
              <Text variant="label-lg">Confirm and Submit</Text>
            </View>
            <View>
              <Text variant="caption" className="text-slate-400 mb-0.5">
                label · 14px medium
              </Text>
              <Text variant="label">Semester 1 Tab Chip</Text>
            </View>
            <View>
              <Text variant="caption" className="text-slate-400 mb-0.5">
                label-sm · 12px semibold
              </Text>
              <Text variant="label-sm">SCHEDULED</Text>
            </View>
            <View>
              <Text variant="caption" className="text-slate-400 mb-0.5">
                caption · 12px regular
              </Text>
              <Text variant="caption">Last updated 5 minutes ago</Text>
            </View>
            <View>
              <Text variant="caption" className="text-slate-400 mb-0.5">
                code · 28px bold tabular
              </Text>
              <Text variant="code">CSC3X9</Text>
            </View>
          </Card>
        </View>
      </ScrollView>

      {/* Sheet Modal */}
      <Sheet isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)} title="Class Options">
        <Text variant="body" className="mb-4 text-slate-600 dark:text-slate-300">
          This bottom sheet features a 24px top corner radius, backdrop tap dismiss, and safe area
          inset padding.
        </Text>
        <Button variant="primary" className="mb-2" onPress={() => setIsSheetOpen(false)}>
          Check In to Class
        </Button>
        <Button variant="secondary" onPress={() => setIsSheetOpen(false)}>
          Close Sheet
        </Button>
      </Sheet>

      {/* Confirmation Dialog */}
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Join Shared Class?"
        description="You will follow CSC 300L timetable updates managed by the course representative."
        confirmText="Join Class"
        onConfirm={() => setIsDialogOpen(false)}
      />

      {/* Destructive Alert Dialog */}
      <Dialog
        isOpen={isDestructiveDialogOpen}
        onClose={() => setIsDestructiveDialogOpen(false)}
        variant="destructive"
        title="Remove Course?"
        description="Removing this course will delete its weekly schedule and local reminder alarms."
        confirmText="Remove Course"
        onConfirm={() => setIsDestructiveDialogOpen(false)}
      />
    </SafeAreaView>
  );
}
