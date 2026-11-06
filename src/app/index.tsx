import React from "react";
import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { Sparkles, CheckCircle2, Layers } from "lucide-react-native";
import { Text, Button, Card, Badge } from "@/components/ui";
import { ClassCard, AttendancePill } from "@/components/timetable";

export default function TodayScreen() {
  return (
    <SafeAreaView className="flex-1 bg-surface-light dark:bg-surface-dark">
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {/* Header */}
        <View className="mb-6 flex-row items-center justify-between">
          <View>
            <Text variant="title-page" className="font-bold">
              TT Timetable
            </Text>
            <Text variant="body" className="text-slate-500 dark:text-slate-400">
              Today · Semester 1
            </Text>
          </View>
          <View className="h-10 w-10 items-center justify-center rounded-full bg-primary">
            <Text variant="label" className="font-semibold text-white">
              PO
            </Text>
          </View>
        </View>

        {/* Showcase Launch Card */}
        <Card className="mb-6 p-5 border-primary/30 bg-indigo-50/50 dark:bg-indigo-950/20">
          <View className="mb-2 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Sparkles size={18} color="#4F46E5" />
              <Text
                variant="title-card"
                className="ml-2 font-bold text-primary dark:text-primary-dark"
              >
                UI Foundation Ready
              </Text>
            </View>
            <Badge variant="success" size="sm" label="Live" />
          </View>
          <Text variant="body" className="mb-4 text-slate-600 dark:text-slate-300">
            Cadence Academy tokens, Inter typography, dark and light theme pipeline, and accessible
            primitives.
          </Text>
          <Link href="/ui-showcase" asChild>
            <Button variant="primary" icon={<Layers size={18} color="#FFFFFF" />}>
              Open UI Foundation Showcase
            </Button>
          </Link>
        </Card>

        {/* Stack Status Card */}
        <Card className="mb-6 p-5">
          <View className="mb-3 flex-row items-center justify-between">
            <Text variant="title-card" className="font-semibold text-slate-900 dark:text-white">
              Architecture Scaffold
            </Text>
            <Badge
              variant="success"
              size="sm"
              label="Verified"
              icon={<CheckCircle2 size={12} color="#16A34A" />}
            />
          </View>
          <Text variant="body" className="mb-4 text-slate-600 dark:text-slate-300">
            React Native Expo SDK 52, Expo Router v4, SQLite Drizzle ORM, Supabase client, and
            NativeWind v4 tokens.
          </Text>

          {/* Layer badges */}
          <View className="flex-row flex-wrap gap-2">
            <Badge variant="neutral" size="sm" label="Hermes Engine" />
            <Badge variant="neutral" size="sm" label="NativeWind v4" />
            <Badge variant="neutral" size="sm" label="Inter Typography" />
            <Badge variant="neutral" size="sm" label="SQLite + Drizzle" />
            <Badge variant="neutral" size="sm" label="WCAG AA Contrast" />
          </View>
        </Card>

        {/* Class Card Primitive Example */}
        <View className="mb-6">
          <Text variant="title-section" className="mb-3 font-semibold">
            Next Lecture
          </Text>
          <ClassCard
            courseCode="MTH 301"
            courseTitle="Abstract Algebra & Vector Spaces"
            courseColor="#2563EB"
            time="10:00 AM – 12:00 PM"
            venue="Lecture Hall 2 (LT2)"
            lecturer="Prof. Adebayo"
            status="upcoming"
          />
        </View>

        {/* Attendance Pill Example */}
        <Card className="mb-6 p-4">
          <Text variant="label" className="mb-2 text-slate-500 dark:text-slate-400">
            Quick Check In Status
          </Text>
          <View className="flex-row flex-wrap gap-2">
            <AttendancePill status="attended" />
            <AttendancePill status="pending" />
          </View>
        </Card>

        {/* Navigation test button */}
        <Link href="/join/CSC3X9" asChild>
          <Button variant="secondary" className="w-full">
            Preview Shared Class (CSC 300L)
          </Button>
        </Link>
      </ScrollView>
    </SafeAreaView>
  );
}
