import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function JoinClassScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-surface-light dark:bg-surface-dark">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Class preview card */}
        <View className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-surface-cardDark">
          <View className="mb-4 inline-flex self-start rounded-full bg-indigo-50 px-3 py-1 dark:bg-indigo-950">
            <Text className="text-xs font-semibold text-primary">
              Share Code: {code || "UNKNOWN"}
            </Text>
          </View>
          <Text className="mb-1 text-2xl font-bold text-slate-900 dark:text-white">
            Computer Science 300L
          </Text>
          <Text className="mb-4 text-sm text-slate-500 dark:text-slate-400">
            University of Benin · 2026/2027 First Semester
          </Text>

          <View className="mb-6 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
            <View className="flex-row justify-between py-1.5 border-b border-slate-200 dark:border-slate-700">
              <Text className="text-sm text-slate-500 dark:text-slate-400">Owner</Text>
              <Text className="text-sm font-medium text-slate-900 dark:text-white">
                Chioma O. (Course Rep)
              </Text>
            </View>
            <View className="flex-row justify-between py-1.5 border-b border-slate-200 dark:border-slate-700">
              <Text className="text-sm text-slate-500 dark:text-slate-400">Class members</Text>
              <Text className="text-sm font-medium text-slate-900 dark:text-white">
                142 students
              </Text>
            </View>
            <View className="flex-row justify-between py-1.5">
              <Text className="text-sm text-slate-500 dark:text-slate-400">Registered courses</Text>
              <Text className="text-sm font-medium text-slate-900 dark:text-white">
                8 courses (14 lectures/week)
              </Text>
            </View>
          </View>

          {/* Follow action */}
          <Pressable
            className="mb-3 min-h-[48px] items-center justify-center rounded-xl bg-primary px-5 py-3 active:opacity-80"
            onPress={() => router.back()}
          >
            <Text className="text-center font-semibold text-white">
              Follow this Class Timetable
            </Text>
          </Pressable>

          {/* Close action */}
          <Pressable
            className="min-h-[48px] items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 active:opacity-80 dark:border-slate-700 dark:bg-slate-800"
            onPress={() => router.back()}
          >
            <Text className="text-center font-medium text-slate-700 dark:text-slate-200">
              Back to Today
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
