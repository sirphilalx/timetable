import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";

export default function TodayScreen() {
  return (
    <SafeAreaView className="flex-1 bg-surface-light dark:bg-surface-dark">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Header */}
        <View className="mb-6 flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-slate-900 dark:text-white">TT Timetable</Text>
            <Text className="text-sm text-slate-500 dark:text-slate-400">Today · Semester 1</Text>
          </View>
          <View className="h-10 w-10 items-center justify-center rounded-full bg-primary">
            <Text className="text-sm font-semibold text-white">PO</Text>
          </View>
        </View>

        {/* Stack Status Card */}
        <View className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-surface-cardDark">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-base font-semibold text-slate-900 dark:text-white">
              Architecture Scaffold
            </Text>
            <View className="rounded-full bg-green-100 px-3 py-1 dark:bg-green-950">
              <Text className="text-xs font-semibold text-green-700 dark:text-green-300">
                Live & Verified
              </Text>
            </View>
          </View>
          <Text className="mb-4 text-sm text-slate-600 dark:text-slate-300">
            React Native with Expo SDK 52, Expo Router v4, Drizzle ORM on SQLite, and Supabase
            client.
          </Text>

          {/* Layer badges */}
          <View className="flex-row flex-wrap gap-2">
            <View className="rounded-md bg-slate-100 px-2.5 py-1 dark:bg-slate-800">
              <Text className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Hermes Engine
              </Text>
            </View>
            <View className="rounded-md bg-slate-100 px-2.5 py-1 dark:bg-slate-800">
              <Text className="text-xs font-medium text-slate-700 dark:text-slate-300">
                NativeWind v4
              </Text>
            </View>
            <View className="rounded-md bg-slate-100 px-2.5 py-1 dark:bg-slate-800">
              <Text className="text-xs font-medium text-slate-700 dark:text-slate-300">
                SQLite + Drizzle
              </Text>
            </View>
            <View className="rounded-md bg-slate-100 px-2.5 py-1 dark:bg-slate-800">
              <Text className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Offline Outbox
              </Text>
            </View>
          </View>
        </View>

        {/* Sample upcoming class card */}
        <View className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-surface-cardDark">
          <View className="flex-row">
            <View className="w-1.5 bg-course-blue" />
            <View className="flex-1 p-5">
              <View className="mb-2 flex-row items-center justify-between">
                <View className="rounded bg-blue-100 px-2 py-0.5 dark:bg-blue-950">
                  <Text className="text-xs font-semibold text-course-blue">MTH 301</Text>
                </View>
                <Text className="text-xs font-medium text-status-soon">In 35 mins</Text>
              </View>
              <Text className="mb-1 text-lg font-bold text-slate-900 dark:text-white">
                Abstract Algebra
              </Text>
              <Text className="text-sm text-slate-500 dark:text-slate-400">
                10:00 AM – 12:00 PM · Lecture Hall 2 (LT2)
              </Text>
            </View>
          </View>
        </View>

        {/* Navigation test button */}
        <Link href="/join/CSC3X9" asChild>
          <Pressable className="min-h-[48px] items-center justify-center rounded-xl bg-primary px-5 py-3 active:opacity-80">
            <Text className="text-center font-semibold text-white">
              Preview Shared Class (CSC 300L)
            </Text>
          </Pressable>
        </Link>
      </ScrollView>
    </SafeAreaView>
  );
}
