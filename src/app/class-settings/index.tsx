import React, { useState } from "react";
import { View, ScrollView, Pressable, TextInput, Modal, Share } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ChevronLeft,
  ChevronRight,
  Share2,
  Users,
  ClipboardCheck,
  History,
  RefreshCw,
  Calendar,
  Pause,
  Search,
  UserPlus,
  MoreHorizontal,
  Shield,
  Crown,
  UserMinus,
  Edit2,
  Filter,
  Check,
  Clock,
  Archive,
  Download,
} from "lucide-react-native";
import { Text } from "@/components/ui/Text";
import { useTheme } from "@/theme/ThemeProvider";
import { ShareClassSheet } from "@/components/timetable/ShareClassSheet";
import { useAuth } from "@/auth";
import { useTimetable } from "@/hooks/useTimetable";

type ClassSettingsSubView =
  | "settings"
  | "members"
  | "changelog"
  | "editor-invite"
  | "ownership-transfer"
  | "rollover"
  | "archive";

const REPS_LIST = [
  {
    id: "r1",
    initials: "AE",
    name: "Ada Eze",
    sub: "Created the class · 28 Oct",
    role: "Owner" as const,
  },
  {
    id: "r2",
    initials: "TI",
    name: "Tunde Ibrahim",
    sub: "Editor since 30 Oct",
    role: "Editor" as const,
  },
  {
    id: "r3",
    initials: "NP",
    name: "Ngozi Peters",
    sub: "Editor since 2 Nov",
    role: "Editor" as const,
  },
];

const FOLLOWERS_LIST = [
  { id: "f1", initials: "BN", name: "Blessing N.", sub: "Joined 2 Nov" },
  { id: "f2", initials: "CO", name: "Chioma Okafor", sub: "Joined 2 Nov" },
  { id: "f3", initials: "DO", name: "Daniel Osagie", sub: "Joined 2 Nov" },
  { id: "f4", initials: "EO", name: "Efe Omoregie", sub: "Joined 2 Nov" },
];

const CHANGELOG_TODAY = [
  {
    id: "c1",
    title: "Ada moved MTH 301 (Fri 6 Nov) from LT1 to LT2",
    meta: "Today, 8:12 am · 128 followers notified",
  },
  {
    id: "c2",
    title: "Tunde posted CSC 305 assignment: ER diagram for a hostel system",
    meta: "Today, 7:40 am · due Thu 12 Nov",
  },
  {
    id: "c3",
    title: "Ngozi cancelled GST 301 (Fri 6 Nov)",
    meta: "Today, 6:55 am · lecturer away",
  },
];

const CHANGELOG_WEEK = [
  {
    id: "c4",
    title: "Ada made Ngozi Peters an editor",
    meta: "Tue 3 Nov, 4:20 pm",
  },
  {
    id: "c5",
    title: "Ada added STA 311 Probability, Mon 2–4 pm, LT3",
    meta: "Mon 2 Nov, 9:05 pm · 126 followers notified",
  },
  {
    id: "c6",
    title: "Tunde fixed the venue for CSC 307 to Physics Lab",
    meta: "Mon 2 Nov, 1:10 pm · correction",
  },
];

const ROLLOVER_COURSES = [
  { id: "rc1", label: "CSC 301 Operating Systems II", defaultChecked: true },
  { id: "rc2", label: "CSC 305 Database Systems II", defaultChecked: true },
  { id: "rc3", label: "MTH 301 Linear Algebra", defaultChecked: false },
  { id: "rc4", label: "GST 301 Entrepreneurship", defaultChecked: false },
  { id: "rc5", label: "CSC 307 Computer Networks", defaultChecked: true },
  { id: "rc6", label: "STA 311 Probability", defaultChecked: true },
];

const ARCHIVED_COURSES = [
  { code: "CSC 301", title: "Operating Systems", meta: "Attendance 92% · 24 classes" },
  { code: "CSC 305", title: "Database Systems", meta: "Attendance 88% · 26 classes" },
  { code: "MTH 301", title: "Linear Algebra", meta: "Attendance 71% · 28 classes" },
  { code: "GST 301", title: "Entrepreneurship", meta: "Attendance 95% · 12 classes" },
  { code: "CSC 307", title: "Computer Networks", meta: "Attendance 85% · 26 classes" },
  { code: "STA 311", title: "Probability", meta: "Attendance 90% · 20 classes" },
];

export default function ClassSettingsScreen() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { user } = useAuth();
  const { data } = useTimetable();

  const mainGroup = data.followedSubscriptions[0];
  const classTitle =
    mainGroup?.title ?? `${data.courses[0]?.code.split(" ")[0] ?? "CSC"} 300L · Computer Science`;
  const instStr = data.student.institution ?? "University of Benin (UNIBEN)";
  const institutionShort = instStr.match(/\(([^)]+)\)/)?.[1] ?? instStr.split(" ")[0] ?? "UNIBEN";
  const classSubtitle = `${institutionShort} · ${data.semester.name} · ends ${data.semester.endDate}`;
  const repsList = [
    {
      id: "r1",
      initials: user.initials || "AE",
      name: user.displayName || "Ada Eze",
      sub: "Created the class · Owner",
      role: "Owner" as const,
    },
    ...REPS_LIST.slice(1),
  ];
  const dynamicRolloverCourses =
    data.courses.length > 0
      ? data.courses.map((c, idx) => ({
          id: c.id,
          label: `${c.code} ${c.title}`,
          defaultChecked: idx < 4,
        }))
      : ROLLOVER_COURSES;
  const dynamicArchivedCourses =
    data.courses.length > 0
      ? data.courses.map((c) => ({
          code: c.code,
          title: c.title,
          meta: `${c.units} units · ${c.lecturerName}`,
        }))
      : ARCHIVED_COURSES;

  const [subView, setSubView] = useState<ClassSettingsSubView>("settings");
  const [shareSheetOpen, setShareSheetOpen] = useState(false);
  const [pauseSheetOpen, setPauseSheetOpen] = useState(false);
  const [pauseOption, setPauseOption] = useState("until-resumed");
  const [pauseReason, setPauseReason] = useState("ASUU strike");
  const [isClassPaused, setIsClassPaused] = useState(false);

  const [memberSearch, setMemberSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState<{
    initials: string;
    name: string;
    sub: string;
  } | null>(null);

  const [rolloverChecked, setRolloverChecked] = useState<string[]>(() =>
    dynamicRolloverCourses.filter((c) => c.defaultChecked).map((c) => c.id),
  );

  const bg = isDark ? "#0F172A" : "#F8FAFC";
  const cardBg = isDark ? "#1E293B" : "#FFFFFF";
  const textPrimary = isDark ? "#F8FAFC" : "#0F172A";
  const textSecondary = isDark ? "#94A3B8" : "#475569";
  const borderCol = isDark ? "#334155" : "#E2E8F0";

  const toggleRolloverCourse = (id: string) => {
    setRolloverChecked((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }} edges={["top"]}>
      {/* Top Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Pressable
            onPress={() => {
              if (subView !== "settings") {
                setSubView("settings");
              } else if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/(tabs)");
              }
            }}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ChevronLeft size={24} color={textPrimary} />
          </Pressable>
          <Text variant="TT/H2" style={{ color: textPrimary, fontSize: 20 }}>
            {subView === "members"
              ? "Members · 128"
              : subView === "changelog"
                ? "Change log"
                : subView === "editor-invite"
                  ? "Editor invite"
                  : subView === "ownership-transfer"
                    ? "Ownership transfer"
                    : subView === "rollover"
                      ? "Second semester"
                      : subView === "archive"
                        ? "First semester 2026/27"
                        : "Class settings"}
          </Text>
        </View>

        {subView === "settings" ? (
          <Pressable
            onPress={() => setShareSheetOpen(true)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Share2 size={20} color={textPrimary} />
          </Pressable>
        ) : subView === "members" ? (
          <Pressable
            onPress={() => setSubView("editor-invite")}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <UserPlus size={20} color={textPrimary} />
          </Pressable>
        ) : subView === "changelog" ? (
          <Pressable
            onPress={() => setMemberSearch((prev) => (prev ? "" : "moved"))}
            accessibilityRole="button"
            accessibilityLabel="Filter change log"
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Filter size={20} color={textPrimary} />
          </Pressable>
        ) : subView === "archive" ? (
          <Pressable
            onPress={() => {
              void Share.share({
                message: `${classTitle} (${classSubtitle}) Archive:\n${dynamicArchivedCourses.map((c) => `• ${c.code} ${c.title} (${c.meta})`).join("\n")}`,
              });
            }}
            accessibilityRole="button"
            accessibilityLabel="Export semester archive"
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Download size={20} color={textPrimary} />
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {subView === "settings" && (
          /* Screen 63: Class settings · owner */
          <View>
            {/* Hero banner card */}
            <View
              style={{
                backgroundColor: isDark ? "#1E1B4B" : "#EEF2FF",
                borderRadius: 20,
                padding: 20,
                marginBottom: 18,
              }}
            >
              <Text variant="TT/H2" style={{ color: textPrimary, fontSize: 21, marginBottom: 6 }}>
                {classTitle}
              </Text>
              <Text variant="TT/Body" style={{ color: textSecondary, marginBottom: 14 }}>
                {classSubtitle}
              </Text>

              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <View style={{ flexDirection: "row" }}>
                  {["A", "T", "C"].map((av, idx) => (
                    <View
                      key={av}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor: cardBg,
                        marginLeft: idx === 0 ? 0 : -6,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        variant="TT/Caption"
                        style={{
                          fontSize: 11,
                          color: "#4F46E5",
                          fontWeight: "700",
                        }}
                      >
                        {av}
                      </Text>
                    </View>
                  ))}
                </View>
                <Text variant="TT/Subhead" style={{ color: textPrimary, fontWeight: "600" }}>
                  128 members
                </Text>
                {isClassPaused ? (
                  <View
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 3,
                      borderRadius: 999,
                      backgroundColor: isDark ? "#451A03" : "#FEF3C7",
                    }}
                  >
                    <Text
                      variant="TT/Caption"
                      style={{ color: isDark ? "#FDE68A" : "#92400E", fontWeight: "700" }}
                    >
                      Paused ({pauseReason})
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>

            {/* Group 1: Members, Suggestions, Change log */}
            <View
              style={{
                backgroundColor: cardBg,
                borderRadius: 18,
                paddingHorizontal: 16,
                borderWidth: 1,
                borderColor: borderCol,
                marginBottom: 22,
              }}
            >
              <Pressable
                onPress={() => setSubView("members")}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingVertical: 16,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                  <Users size={22} color={textSecondary} />
                  <View>
                    <Text variant="TT/Subhead" style={{ color: textPrimary, fontWeight: "600" }}>
                      Members
                    </Text>
                    <Text variant="TT/Caption" style={{ color: textSecondary }}>
                      128 members · 2 editors
                    </Text>
                  </View>
                </View>
                <ChevronRight size={18} color={textSecondary} />
              </Pressable>

              <Pressable
                onPress={() => router.push("/assignment/add")}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingVertical: 16,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                  <ClipboardCheck size={22} color={textSecondary} />
                  <View>
                    <Text variant="TT/Subhead" style={{ color: textPrimary, fontWeight: "600" }}>
                      Suggestions
                    </Text>
                    <Text variant="TT/Caption" style={{ color: textSecondary }}>
                      2 waiting for review
                    </Text>
                  </View>
                </View>
                <ChevronRight size={18} color={textSecondary} />
              </Pressable>

              <Pressable
                onPress={() => setSubView("changelog")}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingVertical: 16,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                  <History size={22} color={textSecondary} />
                  <View>
                    <Text variant="TT/Subhead" style={{ color: textPrimary, fontWeight: "600" }}>
                      Change log
                    </Text>
                    <Text variant="TT/Caption" style={{ color: textSecondary }}>
                      Who changed what
                    </Text>
                  </View>
                </View>
                <ChevronRight size={18} color={textSecondary} />
              </Pressable>
            </View>

            {/* Section: Link and code */}
            <Text variant="TT/Subhead" style={{ color: textSecondary, marginBottom: 10 }}>
              Link and code
            </Text>

            <View
              style={{
                backgroundColor: cardBg,
                borderRadius: 18,
                paddingHorizontal: 16,
                borderWidth: 1,
                borderColor: borderCol,
                marginBottom: 22,
              }}
            >
              <Pressable
                onPress={() => setShareSheetOpen(true)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingVertical: 16,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                  <Share2 size={22} color={textSecondary} />
                  <View>
                    <Text variant="TT/Subhead" style={{ color: textPrimary, fontWeight: "600" }}>
                      Share class
                    </Text>
                    <Text variant="TT/Caption" style={{ color: textSecondary }}>
                      Link, code CSC3X9 and QR
                    </Text>
                  </View>
                </View>
                <ChevronRight size={18} color={textSecondary} />
              </Pressable>

              <Pressable
                onPress={() => setShareSheetOpen(true)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingVertical: 16,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                  <RefreshCw size={22} color={textSecondary} />
                  <View>
                    <Text variant="TT/Subhead" style={{ color: textPrimary, fontWeight: "600" }}>
                      Regenerate link
                    </Text>
                    <Text variant="TT/Caption" style={{ color: textSecondary }}>
                      Old link and code stop working
                    </Text>
                  </View>
                </View>
                <ChevronRight size={18} color={textSecondary} />
              </Pressable>
            </View>

            {/* Section: Semester */}
            <Text variant="TT/Subhead" style={{ color: textSecondary, marginBottom: 10 }}>
              Semester
            </Text>

            <View
              style={{
                backgroundColor: cardBg,
                borderRadius: 18,
                paddingHorizontal: 16,
                borderWidth: 1,
                borderColor: borderCol,
              }}
            >
              <Pressable
                onPress={() => setSubView("rollover")}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingVertical: 16,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 14,
                    flex: 1,
                  }}
                >
                  <Calendar size={22} color={textSecondary} />
                  <View style={{ flex: 1 }}>
                    <Text variant="TT/Subhead" style={{ color: textPrimary, fontWeight: "600" }}>
                      Semester ends
                    </Text>
                    <Text variant="TT/Caption" style={{ color: textSecondary }}>
                      Classes and reminders follow this date
                    </Text>
                  </View>
                </View>
                <Text variant="TT/Subhead" style={{ color: textPrimary, fontWeight: "600" }}>
                  12 Feb
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setPauseSheetOpen(true)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingVertical: 16,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 14,
                    flex: 1,
                  }}
                >
                  <Pause size={22} color={textSecondary} />
                  <View style={{ flex: 1 }}>
                    <Text variant="TT/Subhead" style={{ color: textPrimary, fontWeight: "600" }}>
                      {isClassPaused ? "Resume class" : "Pause class"}
                    </Text>
                    <Text variant="TT/Caption" style={{ color: textSecondary }}>
                      For strikes or long breaks. Stops reminders.
                    </Text>
                  </View>
                </View>
                <ChevronRight size={18} color={textSecondary} />
              </Pressable>

              <Pressable
                onPress={() => setSubView("archive")}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingVertical: 16,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 14,
                    flex: 1,
                  }}
                >
                  <Archive size={22} color={textSecondary} />
                  <View style={{ flex: 1 }}>
                    <Text variant="TT/Subhead" style={{ color: textPrimary, fontWeight: "600" }}>
                      Archived semesters
                    </Text>
                    <Text variant="TT/Caption" style={{ color: textSecondary }}>
                      View past semesters and attendance summaries
                    </Text>
                  </View>
                </View>
                <ChevronRight size={18} color={textSecondary} />
              </Pressable>
            </View>
          </View>
        )}

        {subView === "members" && (
          /* Screen 64: Members · 128 */
          <View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: isDark ? "#1E293B" : "#F1F5F9",
                borderRadius: 14,
                paddingHorizontal: 14,
                height: 48,
                gap: 10,
                marginBottom: 18,
              }}
            >
              <Search size={18} color={textSecondary} />
              <TextInput
                value={memberSearch}
                onChangeText={setMemberSearch}
                placeholder="Search members"
                placeholderTextColor={textSecondary}
                style={{ flex: 1, color: textPrimary, fontSize: 15 }}
              />
            </View>

            <Text variant="TT/Subhead" style={{ color: textSecondary, marginBottom: 10 }}>
              Reps
            </Text>

            <View
              style={{
                backgroundColor: cardBg,
                borderRadius: 16,
                paddingHorizontal: 16,
                borderWidth: 1,
                borderColor: borderCol,
                marginBottom: 20,
              }}
            >
              {repsList.map((rep) => (
                <View
                  key={rep.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: 14,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                      flex: 1,
                    }}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: isDark ? "#312E81" : "#EEF2FF",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text variant="TT/Subhead" style={{ color: "#4F46E5", fontWeight: "700" }}>
                        {rep.initials}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text variant="TT/Subhead" style={{ color: textPrimary, fontWeight: "700" }}>
                        {rep.name}
                      </Text>
                      <Text variant="TT/Caption" style={{ color: textSecondary }}>
                        {rep.sub}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 5,
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        borderRadius: 999,
                        backgroundColor: isDark ? "#312E81" : "#EEF2FF",
                      }}
                    >
                      {rep.role === "Owner" ? (
                        <Crown size={13} color="#4F46E5" />
                      ) : (
                        <Shield size={13} color="#4F46E5" />
                      )}
                      <Text variant="TT/Caption" style={{ color: "#4F46E5", fontWeight: "700" }}>
                        {rep.role}
                      </Text>
                    </View>
                    <MoreHorizontal size={18} color={textSecondary} />
                  </View>
                </View>
              ))}
            </View>

            <Text variant="TT/Subhead" style={{ color: textSecondary, marginBottom: 10 }}>
              Followers · 125
            </Text>

            <View
              style={{
                backgroundColor: cardBg,
                borderRadius: 16,
                paddingHorizontal: 16,
                borderWidth: 1,
                borderColor: borderCol,
              }}
            >
              {FOLLOWERS_LIST.filter((f) =>
                f.name.toLowerCase().includes(memberSearch.toLowerCase()),
              ).map((follower) => (
                <Pressable
                  key={follower.id}
                  onPress={() => setSelectedMember(follower)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: 14,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: isDark ? "#312E81" : "#EEF2FF",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text variant="TT/Subhead" style={{ color: "#4F46E5", fontWeight: "700" }}>
                        {follower.initials}
                      </Text>
                    </View>
                    <View>
                      <Text variant="TT/Subhead" style={{ color: textPrimary, fontWeight: "700" }}>
                        {follower.name}
                      </Text>
                      <Text variant="TT/Caption" style={{ color: textSecondary }}>
                        {follower.sub}
                      </Text>
                    </View>
                  </View>

                  <MoreHorizontal size={18} color={textSecondary} />
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {subView === "changelog" && (
          /* Screen 68: Change log */
          <View>
            <Text variant="TT/H3" style={{ color: textPrimary, fontSize: 20, marginBottom: 10 }}>
              Today
            </Text>

            <View
              style={{
                backgroundColor: cardBg,
                borderRadius: 16,
                paddingHorizontal: 16,
                borderWidth: 1,
                borderColor: borderCol,
                marginBottom: 24,
              }}
            >
              {CHANGELOG_TODAY.map((entry) => (
                <View
                  key={entry.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    gap: 12,
                    paddingVertical: 14,
                  }}
                >
                  <Edit2 size={18} color={textSecondary} style={{ marginTop: 2 }} />
                  <View style={{ flex: 1 }}>
                    <Text
                      variant="TT/Body"
                      style={{
                        color: textPrimary,
                        fontWeight: "500",
                        lineHeight: 22,
                        marginBottom: 4,
                      }}
                    >
                      {entry.title}
                    </Text>
                    <Text variant="TT/Caption" style={{ color: textSecondary }}>
                      {entry.meta}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <Text variant="TT/H3" style={{ color: textPrimary, fontSize: 20, marginBottom: 10 }}>
              This week
            </Text>

            <View
              style={{
                backgroundColor: cardBg,
                borderRadius: 16,
                paddingHorizontal: 16,
                borderWidth: 1,
                borderColor: borderCol,
                marginBottom: 16,
              }}
            >
              {CHANGELOG_WEEK.map((entry) => (
                <View
                  key={entry.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    gap: 12,
                    paddingVertical: 14,
                  }}
                >
                  <Edit2 size={18} color={textSecondary} style={{ marginTop: 2 }} />
                  <View style={{ flex: 1 }}>
                    <Text
                      variant="TT/Body"
                      style={{
                        color: textPrimary,
                        fontWeight: "500",
                        lineHeight: 22,
                        marginBottom: 4,
                      }}
                    >
                      {entry.title}
                    </Text>
                    <Text variant="TT/Caption" style={{ color: textSecondary }}>
                      {entry.meta}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <Text variant="TT/Caption" style={{ color: textSecondary }}>
              Changes older than the semester are kept with the archive.
            </Text>
          </View>
        )}

        {subView === "editor-invite" && (
          /* Screen 69: Accept editor invite */
          <View>
            <View
              style={{
                backgroundColor: cardBg,
                borderRadius: 20,
                padding: 20,
                borderWidth: 1,
                borderColor: borderCol,
                marginBottom: 24,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: isDark ? "#312E81" : "#EEF2FF",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text variant="TT/Subhead" style={{ color: "#4F46E5", fontWeight: "700" }}>
                    AE
                  </Text>
                </View>
                <View>
                  <Text variant="TT/Subhead" style={{ color: textPrimary, fontWeight: "700" }}>
                    Ada Eze
                  </Text>
                  <Text variant="TT/Caption" style={{ color: textSecondary }}>
                    Owner of CSC 300L
                  </Text>
                </View>
              </View>

              <Text variant="TT/H2" style={{ color: textPrimary, fontSize: 21, lineHeight: 28 }}>
                Ada wants you to help run CSC 300L as an editor.
              </Text>
            </View>

            <Text variant="TT/Subhead" style={{ color: textSecondary, marginBottom: 14 }}>
              As an editor you can
            </Text>

            {[
              "Add, move and cancel classes for all 128 members",
              "Post assignments and run group polls",
              "Review suggestions from classmates",
              "Send a correction when something is wrong",
            ].map((item) => (
              <View
                key={item}
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  gap: 12,
                  marginBottom: 14,
                }}
              >
                <Check size={18} color="#4F46E5" style={{ marginTop: 2 }} />
                <Text variant="TT/Body" style={{ color: textPrimary, flex: 1, lineHeight: 22 }}>
                  {item}
                </Text>
              </View>
            ))}

            <Text
              variant="TT/Caption"
              style={{
                color: textSecondary,
                lineHeight: 20,
                marginTop: 8,
                marginBottom: 32,
              }}
            >
              You cannot remove the owner or delete the class. You can step down any time in Class
              settings.
            </Text>

            <Pressable
              onPress={() => setSubView("settings")}
              style={{
                height: 52,
                borderRadius: 14,
                backgroundColor: "#4F46E5",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                marginBottom: 14,
              }}
            >
              <Shield size={18} color="#FFFFFF" />
              <Text variant="TT/Button" style={{ color: "#FFFFFF", fontWeight: "600" }}>
                Accept and become editor
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setSubView("settings")}
              style={{
                height: 44,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text variant="TT/Button" style={{ color: "#4F46E5", fontWeight: "600" }}>
                Not now
              </Text>
            </Pressable>
          </View>
        )}

        {subView === "ownership-transfer" && (
          /* Screen 70: Accept ownership transfer */
          <View>
            <View
              style={{
                backgroundColor: isDark ? "#1E1B4B" : "#EEF2FF",
                borderRadius: 20,
                padding: 20,
                marginBottom: 24,
              }}
            >
              <Crown size={28} color="#4F46E5" style={{ marginBottom: 14 }} />
              <Text
                variant="TT/H2"
                style={{
                  color: textPrimary,
                  fontSize: 22,
                  lineHeight: 28,
                  marginBottom: 8,
                }}
              >
                Ada Eze wants to hand CSC 300L over to you
              </Text>
              <Text
                variant="TT/Body"
                style={{
                  color: textSecondary,
                  lineHeight: 22,
                  marginBottom: 14,
                }}
              >
                She is graduating early and picked you to take over as owner.
              </Text>

              <View
                style={{
                  alignSelf: "flex-start",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 999,
                  backgroundColor: isDark ? "#451A03" : "#FEF3C7",
                }}
              >
                <Clock size={14} color={isDark ? "#FDE68A" : "#92400E"} />
                <Text
                  variant="TT/Caption"
                  style={{ color: isDark ? "#FDE68A" : "#92400E", fontWeight: "700" }}
                >
                  Expires in 6 days
                </Text>
              </View>
            </View>

            <Text variant="TT/Subhead" style={{ color: textSecondary, marginBottom: 14 }}>
              What changes
            </Text>

            {[
              "You become the owner and can choose up to 2 editors",
              "Ada becomes an editor until she leaves or you remove her",
              "All 128 members keep following without doing anything",
              "Only one person can own a class at a time",
            ].map((item) => (
              <View
                key={item}
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  gap: 12,
                  marginBottom: 14,
                }}
              >
                <Check size={18} color="#4F46E5" style={{ marginTop: 2 }} />
                <Text variant="TT/Body" style={{ color: textPrimary, flex: 1, lineHeight: 22 }}>
                  {item}
                </Text>
              </View>
            ))}

            <Pressable
              onPress={() => setSubView("settings")}
              style={{
                height: 52,
                borderRadius: 14,
                backgroundColor: "#4F46E5",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                marginTop: 24,
                marginBottom: 12,
              }}
            >
              <Crown size={18} color="#FFFFFF" />
              <Text variant="TT/Button" style={{ color: "#FFFFFF", fontWeight: "600" }}>
                Accept ownership
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setSubView("settings")}
              style={{
                height: 50,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: borderCol,
                backgroundColor: cardBg,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text variant="TT/Button" style={{ color: textPrimary, fontWeight: "600" }}>
                Decline
              </Text>
            </Pressable>
          </View>
        )}

        {subView === "rollover" && (
          /* Screen 74: Start next semester */
          <View>
            {/* Progress pills */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 16,
              }}
            >
              <View
                style={{
                  width: 28,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "#4F46E5",
                }}
              />
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: borderCol,
                }}
              />
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: borderCol,
                }}
              />
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: borderCol,
                }}
              />
            </View>

            <Text
              variant="TT/Body"
              style={{ color: textSecondary, lineHeight: 22, marginBottom: 20 }}
            >
              Set the dates and pick the courses that carry over. Everything else starts empty.
            </Text>

            <Text variant="TT/Subhead" style={{ color: textSecondary, marginBottom: 8 }}>
              Session
            </Text>
            <View
              style={{
                backgroundColor: cardBg,
                borderWidth: 1,
                borderColor: borderCol,
                borderRadius: 12,
                paddingHorizontal: 14,
                height: 52,
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <Text variant="TT/Body" style={{ color: textPrimary, fontSize: 16 }}>
                2026/2027 · Second semester
              </Text>
            </View>

            <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
              <View style={{ flex: 1 }}>
                <Text variant="TT/Subhead" style={{ color: textSecondary, marginBottom: 8 }}>
                  Starts
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: cardBg,
                    borderWidth: 1,
                    borderColor: borderCol,
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    height: 52,
                    gap: 10,
                  }}
                >
                  <Calendar size={18} color={textSecondary} />
                  <Text variant="TT/Body" style={{ color: textPrimary }}>
                    Mon 1 Mar
                  </Text>
                </View>
              </View>

              <View style={{ flex: 1 }}>
                <Text variant="TT/Subhead" style={{ color: textSecondary, marginBottom: 8 }}>
                  Ends
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: cardBg,
                    borderWidth: 1,
                    borderColor: borderCol,
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    height: 52,
                    gap: 10,
                  }}
                >
                  <Calendar size={18} color={textSecondary} />
                  <Text variant="TT/Body" style={{ color: textPrimary }}>
                    Fri 2 Jul
                  </Text>
                </View>
              </View>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 14,
              }}
            >
              <Text variant="TT/H3" style={{ color: textPrimary, fontSize: 20 }}>
                Carry over
              </Text>
              <Text variant="TT/H3" style={{ color: textSecondary, fontSize: 20 }}>
                {rolloverChecked.length} of {dynamicRolloverCourses.length}
              </Text>
            </View>

            {dynamicRolloverCourses.map((rc) => {
              const checked = rolloverChecked.includes(rc.id);
              return (
                <Pressable
                  key={rc.id}
                  onPress={() => toggleRolloverCourse(rc.id)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    paddingVertical: 12,
                  }}
                >
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 6,
                      backgroundColor: checked ? "#4F46E5" : cardBg,
                      borderWidth: checked ? 0 : 1.5,
                      borderColor: borderCol,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {checked ? <Check size={16} color="#FFFFFF" /> : null}
                  </View>
                  <Text variant="TT/Body" style={{ color: textPrimary, fontSize: 16 }}>
                    {rc.label}
                  </Text>
                </Pressable>
              );
            })}

            <Text
              variant="TT/Caption"
              style={{
                color: textSecondary,
                marginTop: 12,
                marginBottom: 24,
                lineHeight: 20,
              }}
            >
              Followers are not moved automatically. They get an invite and choose to follow.
            </Text>

            <Pressable
              onPress={() => setSubView("archive")}
              style={{
                height: 52,
                borderRadius: 14,
                backgroundColor: "#4F46E5",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text variant="TT/Button" style={{ color: "#FFFFFF", fontWeight: "600" }}>
                Next: times and venues
              </Text>
            </Pressable>
          </View>
        )}

        {subView === "archive" && (
          /* Screen 76: Archived semester */
          <View>
            <View
              style={{
                backgroundColor: isDark ? "#1E293B" : "#F1F5F9",
                borderRadius: 16,
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                marginBottom: 24,
              }}
            >
              <Archive size={20} color={textSecondary} />
              <Text variant="TT/Body" style={{ color: textSecondary, flex: 1, lineHeight: 22 }}>
                Archived 12 Feb. You can read it, but nothing here changes or sends reminders.
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <Text variant="TT/H3" style={{ color: textPrimary, fontSize: 20 }}>
                Courses
              </Text>
              <Text variant="TT/H3" style={{ color: textSecondary, fontSize: 20 }}>
                {dynamicArchivedCourses.length}
              </Text>
            </View>

            {dynamicArchivedCourses.map((ac) => (
              <Pressable
                key={ac.code}
                onPress={() => router.push("/reports")}
                style={{
                  backgroundColor: cardBg,
                  borderRadius: 14,
                  padding: 16,
                  marginBottom: 10,
                  borderWidth: 1,
                  borderColor: borderCol,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View>
                  <Text
                    variant="TT/Subhead"
                    style={{
                      color: textPrimary,
                      fontWeight: "600",
                      marginBottom: 2,
                    }}
                  >
                    {ac.code} {ac.title}
                  </Text>
                  <Text variant="TT/Caption" style={{ color: textSecondary }}>
                    {ac.meta}
                  </Text>
                </View>
                <ChevronRight size={18} color={textSecondary} />
              </Pressable>
            ))}

            <Text
              variant="TT/H3"
              style={{
                color: textPrimary,
                fontSize: 20,
                marginTop: 14,
                marginBottom: 12,
              }}
            >
              Also kept
            </Text>

            <Pressable
              onPress={() => router.push("/(tabs)/assignments")}
              style={{
                backgroundColor: cardBg,
                borderRadius: 14,
                padding: 16,
                borderWidth: 1,
                borderColor: borderCol,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <Check size={20} color={textSecondary} />
                <View>
                  <Text variant="TT/Subhead" style={{ color: textPrimary, fontWeight: "600" }}>
                    Assignments
                  </Text>
                  <Text variant="TT/Caption" style={{ color: textSecondary }}>
                    31 posted · 29 submitted
                  </Text>
                </View>
              </View>
              <ChevronRight size={18} color={textSecondary} />
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* Screen 65: Member Actions Bottom Sheet */}
      <Modal
        visible={Boolean(selectedMember)}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedMember(null)}
      >
        <Pressable
          onPress={() => setSelectedMember(null)}
          style={{
            flex: 1,
            backgroundColor: "rgba(15, 23, 42, 0.45)",
            justifyContent: "flex-end",
          }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: cardBg,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingHorizontal: 20,
              paddingTop: 12,
              paddingBottom: 32,
            }}
          >
            <View
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: isDark ? "#475569" : "#CBD5E1",
                alignSelf: "center",
                marginBottom: 16,
              }}
            />

            {selectedMember ? (
              <>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 20,
                  }}
                >
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: isDark ? "#312E81" : "#EEF2FF",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text variant="TT/Subhead" style={{ color: "#4F46E5", fontWeight: "700" }}>
                      {selectedMember.initials}
                    </Text>
                  </View>
                  <View>
                    <Text variant="TT/H3" style={{ color: textPrimary, fontSize: 18 }}>
                      {selectedMember.name}
                    </Text>
                    <Text variant="TT/Caption" style={{ color: textSecondary }}>
                      Follower · {selectedMember.sub.toLowerCase()}
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 14,
                    paddingVertical: 14,
                    opacity: 0.5,
                  }}
                >
                  <Shield size={22} color={textSecondary} />
                  <View>
                    <Text variant="TT/Subhead" style={{ color: textPrimary, fontWeight: "600" }}>
                      Make editor
                    </Text>
                    <Text variant="TT/Caption" style={{ color: textSecondary }}>
                      A class can have up to 2 editors
                    </Text>
                  </View>
                </View>

                <Pressable
                  onPress={() => {
                    setSelectedMember(null);
                    setSubView("ownership-transfer");
                  }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: 14,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 14,
                    }}
                  >
                    <Crown size={22} color={textPrimary} />
                    <View>
                      <Text variant="TT/Subhead" style={{ color: textPrimary, fontWeight: "600" }}>
                        Transfer ownership to {selectedMember.name.split(" ")[0]}
                      </Text>
                      <Text variant="TT/Caption" style={{ color: textSecondary }}>
                        They must accept within 7 days
                      </Text>
                    </View>
                  </View>
                  <ChevronRight size={18} color={textSecondary} />
                </Pressable>

                <Pressable
                  onPress={() => setSelectedMember(null)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: 14,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 14,
                    }}
                  >
                    <UserMinus size={22} color={textPrimary} />
                    <View>
                      <Text variant="TT/Subhead" style={{ color: textPrimary, fontWeight: "600" }}>
                        Remove from class
                      </Text>
                      <Text variant="TT/Caption" style={{ color: textSecondary }}>
                        They stop getting updates
                      </Text>
                    </View>
                  </View>
                  <ChevronRight size={18} color={textSecondary} />
                </Pressable>
              </>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Screen 72: Pause Class Bottom Sheet */}
      <Modal
        visible={pauseSheetOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setPauseSheetOpen(false)}
      >
        <Pressable
          onPress={() => setPauseSheetOpen(false)}
          style={{
            flex: 1,
            backgroundColor: "rgba(15, 23, 42, 0.45)",
            justifyContent: "flex-end",
          }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: cardBg,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingHorizontal: 20,
              paddingTop: 12,
              paddingBottom: 32,
            }}
          >
            <View
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: isDark ? "#475569" : "#CBD5E1",
                alignSelf: "center",
                marginBottom: 16,
              }}
            />

            <Text variant="TT/H2" style={{ color: textPrimary, fontSize: 22, marginBottom: 8 }}>
              Pause CSC 300L
            </Text>
            <Text
              variant="TT/Body"
              style={{ color: textSecondary, lineHeight: 22, marginBottom: 16 }}
            >
              Reminders and check-ins stop for all 128 members. Classes stay on the timetable and
              everyone sees a banner saying the class is paused.
            </Text>

            {[
              { id: "until-resumed", label: "Until I resume it" },
              { id: "1-week", label: "1 week, until Fri 13 Nov" },
              { id: "2-weeks", label: "2 weeks, until Fri 20 Nov" },
              { id: "pick-date", label: "Pick a date" },
            ].map((opt) => {
              const selected = pauseOption === opt.id;
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => setPauseOption(opt.id)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    paddingVertical: 10,
                  }}
                >
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: selected ? "#4F46E5" : borderCol,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {selected ? (
                      <View
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: 6,
                          backgroundColor: "#4F46E5",
                        }}
                      />
                    ) : null}
                  </View>
                  <Text variant="TT/Body" style={{ color: textPrimary, fontSize: 16 }}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}

            <Text
              variant="TT/Subhead"
              style={{
                color: textPrimary,
                fontWeight: "600",
                marginTop: 14,
                marginBottom: 8,
              }}
            >
              Reason members will see (optional)
            </Text>

            <TextInput
              value={pauseReason}
              onChangeText={setPauseReason}
              placeholder="ASUU strike"
              placeholderTextColor={textSecondary}
              style={{
                backgroundColor: cardBg,
                borderWidth: 1,
                borderColor: borderCol,
                borderRadius: 12,
                paddingHorizontal: 14,
                height: 50,
                color: textPrimary,
                fontSize: 16,
                marginBottom: 20,
              }}
            />

            <Pressable
              onPress={() => {
                setIsClassPaused((prev) => !prev);
                setPauseSheetOpen(false);
              }}
              style={{
                height: 52,
                borderRadius: 14,
                backgroundColor: "#4F46E5",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <Pause size={18} color="#FFFFFF" />
              <Text variant="TT/Button" style={{ color: "#FFFFFF", fontWeight: "600" }}>
                {isClassPaused ? "Resume class" : "Pause class"}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setPauseSheetOpen(false)}
              style={{
                height: 44,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text variant="TT/Button" style={{ color: "#4F46E5", fontWeight: "600" }}>
                Cancel
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <ShareClassSheet isOpen={shareSheetOpen} onClose={() => setShareSheetOpen(false)} />
    </SafeAreaView>
  );
}
