import React, { useState } from "react";
import { View, ScrollView, Pressable, TextInput, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Clock,
  User,
  Users,
  Bell,
  Check,
  Lock,
  Search,
  Trash2,
} from "lucide-react-native";
import { Text } from "@/components/ui/Text";
import { StudentAvatar } from "@/components/ui/StudentAvatar";
import { useTheme } from "@/theme/ThemeProvider";
import { useAuth } from "@/auth";
import { useTimetable, useUpdateAssignmentStatus, useDeleteAssignment } from "@/hooks/useTimetable";
import { formatShortDateLabel, getTodayIsoDate } from "@/lib/dateClock";

type AssignmentViewMode = "solo" | "group" | "poll" | "rep-groups" | "tag-group";

const GROUP_4_MEMBERS = [
  { initials: "C", name: "Chioma Okafor (you)" },
  { initials: "T", name: "Tunde Ibrahim" },
  { initials: "I", name: "Ifeoma Bello" },
  { initials: "K", name: "Kelechi Uba" },
  { initials: "S", name: "Sade Ajayi" },
  { initials: "M", name: "Musa Danjuma" },
];

const POLL_GROUPS = [
  { id: "g3", name: "Group 3", count: 4, max: 6, full: false },
  { id: "g4", name: "Group 4", count: 5, max: 6, full: false },
  { id: "g5", name: "Group 5", count: 6, max: 6, full: true },
];

const REP_GROUPS_LIST = [
  { id: "g1", name: "Group 1", subtitle: "6 of 6 · full" },
  { id: "g2", name: "Group 2", subtitle: "5 of 6" },
  { id: "g3", name: "Group 3", subtitle: "4 of 6" },
  { id: "g4", name: "Group 4", subtitle: "6 of 6 · full" },
  { id: "g5", name: "Group 5", subtitle: "6 of 6 · full" },
  { id: "g6", name: "Group 6", subtitle: "3 of 6" },
];

const TAG_CANDIDATES = [
  { id: "m1", initials: "IB", name: "Ifeoma Bello", currentStatus: "Not in a group" },
  { id: "m2", initials: "KA", name: "Kunle Adeyemi", currentStatus: "Not in a group" },
  { id: "m3", initials: "AE", name: "Amaka Eze", currentStatus: "Not in a group" },
  { id: "m4", initials: "BH", name: "Bola Hassan", currentStatus: "Not in a group" },
  { id: "m5", initials: "DO", name: "Daniel Osagie", currentStatus: "Group 2" },
];

export default function AssignmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { user } = useAuth();
  const { data } = useTimetable();
  const updateStatus = useUpdateAssignmentStatus();
  const deleteAssignmentMutation = useDeleteAssignment();
  const [optionsSheetOpen, setOptionsSheetOpen] = useState(false);

  const matched = data.assignments.find((a) => a.id === id);
  const matchedCourse =
    data.courses.find((c) => c.id === matched?.courseId) ??
    data.allCatalogCourses.find((c) => c.id === matched?.courseId);
  const [todayIso] = useState(() => getTodayIsoDate());
  const dueDateIso = matched?.dueAt ? matched.dueAt.slice(0, 10) : todayIso;
  const dueDateFormatted = formatShortDateLabel(dueDateIso);
  const dueBadgeLabel = dueDateIso === todayIso ? "Due today" : `Due ${dueDateFormatted}`;

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/assignments");
    }
  };
  const isGroupDefault =
    matched?.type === "group" || matched?.title.toLowerCase().includes("database");

  const storedProgress = matched ? data.assignmentProgress?.[matched.id] : undefined;
  const initialProgress: "not-started" | "in-progress" | "submitted" =
    storedProgress === "done"
      ? "submitted"
      : storedProgress === "not_started"
        ? "not-started"
        : "in-progress";

  const [viewMode, setViewMode] = useState<AssignmentViewMode>(isGroupDefault ? "group" : "solo");
  const [progress, setProgress] = useState<"not-started" | "in-progress" | "submitted">(
    initialProgress,
  );
  const [note, setNote] = useState("");
  const [selectedPollGroup, setSelectedPollGroup] = useState("g4");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(["m1", "m2"]);
  const [searchQuery, setSearchQuery] = useState("");
  const [groupsLocked, setGroupsLocked] = useState(false);

  const bg = isDark ? "#0F172A" : "#F8FAFC";
  const cardBg = isDark ? "#1E293B" : "#FFFFFF";
  const textPrimary = isDark ? "#F8FAFC" : "#0F172A";
  const textSecondary = isDark ? "#94A3B8" : "#475569";
  const borderCol = isDark ? "#334155" : "#E2E8F0";

  const toggleCandidate = (memberId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(memberId) ? prev.filter((x) => x !== memberId) : [...prev, memberId],
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
              if (viewMode === "tag-group") {
                setViewMode("rep-groups");
              } else if (viewMode === "poll" || viewMode === "rep-groups") {
                setViewMode("group");
              } else {
                handleBack();
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
            {viewMode === "poll"
              ? "Database design project"
              : viewMode === "rep-groups"
                ? "Groups · CSC 305"
                : viewMode === "tag-group"
                  ? "Add to Group 6"
                  : "Assignment"}
          </Text>
        </View>

        {viewMode === "rep-groups" ? (
          <Pressable
            onPress={() => setGroupsLocked((prev) => !prev)}
            accessibilityRole="button"
            accessibilityLabel={groupsLocked ? "Unlock groups" : "Lock groups"}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: groupsLocked ? (isDark ? "#312E81" : "#EEF2FF") : "transparent",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Lock size={20} color={groupsLocked ? "#4F46E5" : textPrimary} />
          </Pressable>
        ) : (
          <Pressable
            onPress={() => setOptionsSheetOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Assignment options"
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MoreHorizontal size={22} color={textPrimary} />
          </Pressable>
        )}
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {viewMode === "solo" && (
          /* Screen 52: Assignment detail · solo */
          <View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 6,
                  backgroundColor: isDark ? "#1E293B" : "#F1F5F9",
                }}
              >
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: matchedCourse?.color ?? "#2563EB",
                  }}
                />
                <Text variant="TT/Caption" style={{ color: textPrimary, fontWeight: "700" }}>
                  {matchedCourse?.code ?? "CSC 301"}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 999,
                  backgroundColor: isDark ? "rgba(217, 119, 6, 0.2)" : "#FEF3C7",
                }}
              >
                <Clock size={12} color="#B45309" />
                <Text variant="TT/Caption" style={{ color: "#B45309", fontWeight: "700" }}>
                  {dueBadgeLabel}
                </Text>
              </View>
            </View>

            <Text variant="TT/H1" style={{ color: textPrimary, fontSize: 28, marginBottom: 10 }}>
              {matched?.title ?? "Scheduling report"}
            </Text>

            <Text
              variant="TT/Body"
              style={{ color: textSecondary, lineHeight: 24, marginBottom: 20 }}
            >
              {matched?.description ??
                "Compare FCFS, SJF and Round Robin on the 5-process example from the lecture. 2 pages max. Submit in class."}
            </Text>

            {/* Metadata card */}
            <View
              style={{
                backgroundColor: cardBg,
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: borderCol,
                marginBottom: 24,
                gap: 16,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <Clock size={20} color={textSecondary} />
                <View style={{ flex: 1 }}>
                  <Text variant="TT/Subhead" style={{ color: textPrimary, fontWeight: "600" }}>
                    {dueBadgeLabel}, 11:59 pm
                  </Text>
                  <Text variant="TT/Caption" style={{ color: textSecondary }}>
                    {matchedCourse
                      ? `${matchedCourse.code} · ${matchedCourse.title}`
                      : "Saved to your timetable"}
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <User size={20} color={textSecondary} />
                <View style={{ flex: 1 }}>
                  <Text variant="TT/Subhead" style={{ color: textPrimary, fontWeight: "600" }}>
                    Solo
                  </Text>
                  <Text variant="TT/Caption" style={{ color: textSecondary }}>
                    Your own work
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={() => router.push("/settings/reminders")}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
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
                  <Bell size={20} color={textSecondary} />
                  <View style={{ flex: 1 }}>
                    <Text variant="TT/Subhead" style={{ color: textPrimary, fontWeight: "600" }}>
                      Reminders
                    </Text>
                    <Text variant="TT/Caption" style={{ color: textSecondary }}>
                      1 day before and the morning it&apos;s due
                    </Text>
                  </View>
                </View>
                <ChevronRight size={18} color={textSecondary} />
              </Pressable>
            </View>

            {/* Your progress */}
            <Text
              variant="TT/Subhead"
              style={{ color: textPrimary, fontWeight: "600", marginBottom: 10 }}
            >
              Your progress
            </Text>

            <View style={{ flexDirection: "row", gap: 8, marginBottom: 24 }}>
              {[
                { id: "not-started" as const, label: "Not started" },
                { id: "in-progress" as const, label: "In progress" },
                { id: "submitted" as const, label: "Submitted" },
              ].map((pill) => {
                const active = progress === pill.id;
                return (
                  <Pressable
                    key={pill.id}
                    onPress={() => {
                      setProgress(pill.id);
                      if (matched) {
                        updateStatus.mutate({
                          id: matched.id,
                          progress:
                            pill.id === "submitted"
                              ? "done"
                              : pill.id === "not-started"
                                ? "not_started"
                                : "in_progress",
                        });
                      }
                    }}
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      borderRadius: 999,
                      borderWidth: 1.5,
                      borderColor: active ? "#4F46E5" : borderCol,
                      backgroundColor: active ? (isDark ? "#312E81" : "#EEF2FF") : cardBg,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      variant="TT/Subhead"
                      style={{
                        color: active ? (isDark ? "#818CF8" : "#4F46E5") : textPrimary,
                        fontWeight: "600",
                      }}
                    >
                      {pill.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Your note */}
            <Text
              variant="TT/Subhead"
              style={{ color: textPrimary, fontWeight: "600", marginBottom: 8 }}
            >
              Your note
            </Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Add a note"
              placeholderTextColor={textSecondary}
              style={{
                backgroundColor: cardBg,
                borderWidth: 1,
                borderColor: borderCol,
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 14,
                color: textPrimary,
                fontSize: 15,
                marginBottom: 6,
              }}
            />
            <Text variant="TT/Caption" style={{ color: textSecondary, marginBottom: 28 }}>
              Only you see this
            </Text>

            <Pressable
              onPress={() => {
                setProgress("submitted");
                if (matched) {
                  updateStatus.mutate({ id: matched.id, isCompleted: 1, progress: "done" });
                }
                handleBack();
              }}
              style={{
                height: 52,
                borderRadius: 14,
                backgroundColor: "#4F46E5",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Check size={18} color="#FFFFFF" />
              <Text variant="TT/Button" style={{ color: "#FFFFFF", fontWeight: "600" }}>
                Mark as submitted
              </Text>
            </Pressable>
          </View>
        )}

        {viewMode === "group" && (
          /* Screen 53: Assignment detail · group */
          <View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 6,
                  backgroundColor: isDark ? "#1E293B" : "#F1F5F9",
                }}
              >
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "#059669",
                  }}
                />
                <Text variant="TT/Caption" style={{ color: textPrimary, fontWeight: "700" }}>
                  CSC 305
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 999,
                  backgroundColor: isDark ? "rgba(217, 119, 6, 0.2)" : "#FEF3C7",
                }}
              >
                <Clock size={12} color="#B45309" />
                <Text variant="TT/Caption" style={{ color: "#B45309", fontWeight: "700" }}>
                  Due Friday
                </Text>
              </View>
            </View>

            <Text variant="TT/H1" style={{ color: textPrimary, fontSize: 28, marginBottom: 10 }}>
              Database design project
            </Text>

            <Text
              variant="TT/Body"
              style={{ color: textSecondary, lineHeight: 24, marginBottom: 20 }}
            >
              Design and normalise a database for the faculty library. ER diagram, schema and 10
              sample queries.
            </Text>

            {/* Your group card */}
            <Pressable
              onPress={() => setViewMode("rep-groups")}
              style={{
                backgroundColor: cardBg,
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: borderCol,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 24,
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
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: isDark ? "#312E81" : "#EEF2FF",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Users size={20} color="#4F46E5" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="TT/Subhead" style={{ color: textPrimary, fontWeight: "700" }}>
                    Your group: Group 4
                  </Text>
                  <Text variant="TT/Caption" style={{ color: textSecondary }}>
                    6 of 6 · full · joined Thu 5 Nov
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <View style={{ flexDirection: "row" }}>
                  {["C", "T", "I", "+3"].map((av, idx) => (
                    <View
                      key={av}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor: isDark ? "#312E81" : "#EEF2FF",
                        borderWidth: 2,
                        borderColor: cardBg,
                        marginLeft: idx === 0 ? 0 : -8,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        variant="TT/Caption"
                        style={{
                          fontSize: 11,
                          color: isDark ? "#818CF8" : "#4F46E5",
                          fontWeight: "700",
                        }}
                      >
                        {av}
                      </Text>
                    </View>
                  ))}
                </View>
                <ChevronRight size={18} color={textSecondary} />
              </View>
            </Pressable>

            {/* Members 6 */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <Text variant="TT/H3" style={{ color: textPrimary, fontSize: 20 }}>
                Members
              </Text>
              <Text variant="TT/H3" style={{ color: textSecondary, fontSize: 20 }}>
                6
              </Text>
            </View>

            <View
              style={{
                backgroundColor: cardBg,
                borderRadius: 16,
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderWidth: 1,
                borderColor: borderCol,
                marginBottom: 20,
              }}
            >
              {GROUP_4_MEMBERS.map((member, index) => {
                const isSelf = index === 0;
                const displayMemberName = isSelf
                  ? `${user.displayName || "Chioma Okafor"}${user.username ? ` · @${user.username}` : ""} (you)`
                  : member.name;
                return (
                  <View
                    key={member.name}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                      paddingVertical: 10,
                    }}
                  >
                    {isSelf ? (
                      <StudentAvatar
                        avatarUrl={user.avatarUrl}
                        initials={user.initials}
                        size={32}
                        borderWidth={1.5}
                        borderColor="#FFFFFF"
                      />
                    ) : (
                      <View
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          backgroundColor: isDark ? "#312E81" : "#EEF2FF",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          variant="TT/Caption"
                          style={{
                            color: isDark ? "#818CF8" : "#4F46E5",
                            fontWeight: "700",
                          }}
                        >
                          {member.initials}
                        </Text>
                      </View>
                    )}
                    <Text variant="TT/Body" style={{ color: textPrimary, fontWeight: "500" }}>
                      {displayMemberName}
                    </Text>
                  </View>
                );
              })}
            </View>

            <Pressable
              onPress={() => setViewMode("poll")}
              style={{
                height: 50,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: borderCol,
                backgroundColor: cardBg,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 10,
              }}
            >
              <Text variant="TT/Button" style={{ color: textPrimary, fontWeight: "600" }}>
                Switch group
              </Text>
            </Pressable>

            <Text variant="TT/Caption" style={{ color: textSecondary, marginBottom: 20 }}>
              You can switch until Mon 9 Nov, when joining closes.
            </Text>

            <Pressable
              onPress={() => {
                setProgress("submitted");
                if (matched) {
                  updateStatus.mutate({ id: matched.id, isCompleted: 1, progress: "done" });
                }
                handleBack();
              }}
              style={{
                height: 52,
                borderRadius: 14,
                backgroundColor: "#4F46E5",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Check size={18} color="#FFFFFF" />
              <Text variant="TT/Button" style={{ color: "#FFFFFF", fontWeight: "600" }}>
                Mark group project submitted
              </Text>
            </Pressable>
          </View>
        )}

        {viewMode === "poll" && (
          /* Screen 55: Group poll */
          <View>
            <Text variant="TT/Body" style={{ color: textSecondary, marginBottom: 16 }}>
              Group work · due Fri 13 Nov, 11:59 pm · posted by Ada (rep)
            </Text>

            <View
              style={{
                backgroundColor: cardBg,
                borderRadius: 20,
                padding: 20,
                borderWidth: 1,
                borderColor: borderCol,
                marginBottom: 28,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 6,
                    backgroundColor: isDark ? "#0F172A" : "#F1F5F9",
                  }}
                >
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: "#059669",
                    }}
                  />
                  <Text variant="TT/Caption" style={{ color: textPrimary, fontWeight: "700" }}>
                    CSC 305
                  </Text>
                </View>
                <Text variant="TT/Body" style={{ color: textSecondary }}>
                  Database design project
                </Text>
              </View>

              <Text variant="TT/H2" style={{ color: textPrimary, fontSize: 22, marginBottom: 6 }}>
                Which group are you in?
              </Text>
              <Text
                variant="TT/Body"
                style={{ color: textSecondary, marginBottom: 18, lineHeight: 22 }}
              >
                Max 6 per group · joining closes Mon 9 Nov · you can switch until then
              </Text>

              {POLL_GROUPS.map((grp) => {
                const selected = selectedPollGroup === grp.id;
                return (
                  <Pressable
                    key={grp.id}
                    disabled={grp.full}
                    onPress={() => setSelectedPollGroup(grp.id)}
                    style={{
                      borderWidth: selected ? 2 : 1,
                      borderColor: selected ? "#4F46E5" : borderCol,
                      backgroundColor: selected
                        ? isDark
                          ? "rgba(79, 70, 229, 0.15)"
                          : "#EEF2FF"
                        : grp.full
                          ? isDark
                            ? "#0F172A"
                            : "#F1F5F9"
                          : cardBg,
                      borderRadius: 14,
                      padding: 16,
                      marginBottom: 12,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
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
                          width: 22,
                          height: 22,
                          borderRadius: 11,
                          borderWidth: 2,
                          borderColor: selected ? "#4F46E5" : "#94A3B8",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {selected ? (
                          <View
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: 5,
                              backgroundColor: "#4F46E5",
                            }}
                          />
                        ) : null}
                      </View>
                      <View>
                        <Text
                          variant="TT/Subhead"
                          style={{
                            color: grp.full ? textSecondary : textPrimary,
                            fontWeight: "700",
                          }}
                        >
                          {grp.name}
                        </Text>
                        <Text
                          variant="TT/Caption"
                          style={{
                            color: selected ? "#4F46E5" : textSecondary,
                          }}
                        >
                          {grp.full
                            ? "Full (6/6)"
                            : selected
                              ? `${grp.count} of ${grp.max} · you're in`
                              : `${grp.count} of ${grp.max}`}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <View style={{ flexDirection: "row" }}>
                        {["C", "T", "I"].map((av, idx) => (
                          <View
                            key={av}
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 14,
                              backgroundColor: isDark ? "#312E81" : "#E0E7FF",
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
                      {grp.full ? <Lock size={16} color={textSecondary} /> : null}
                    </View>
                  </Pressable>
                );
              })}

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 6,
                }}
              >
                <Users size={16} color={textSecondary} />
                <Text variant="TT/Caption" style={{ color: textSecondary }}>
                  98 of 128 have joined a group · 30 not yet
                </Text>
              </View>
            </View>

            <Pressable
              onPress={() => setViewMode("group")}
              style={{
                height: 52,
                borderRadius: 14,
                backgroundColor: "#4F46E5",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text variant="TT/Button" style={{ color: "#FFFFFF", fontWeight: "600" }}>
                Done
              </Text>
            </Pressable>
          </View>
        )}

        {viewMode === "rep-groups" && (
          /* Screen 56: Groups · rep view */
          <View>
            <Text variant="TT/H2" style={{ color: textPrimary, fontSize: 20, marginBottom: 4 }}>
              98 of 128 have joined a group
            </Text>
            <Text variant="TT/Caption" style={{ color: textSecondary, marginBottom: 18 }}>
              Joining closes Mon 9 Nov. Lock groups early from the top-right.
            </Text>

            {/* Not in a group row */}
            <Pressable
              onPress={() => setViewMode("tag-group")}
              style={{
                backgroundColor: cardBg,
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: borderCol,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: isDark ? "rgba(217, 119, 6, 0.2)" : "#FEF3C7",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Users size={20} color="#B45309" />
                </View>
                <View>
                  <Text variant="TT/Subhead" style={{ color: textPrimary, fontWeight: "700" }}>
                    Not in a group
                  </Text>
                  <Text variant="TT/Caption" style={{ color: "#B45309", fontWeight: "600" }}>
                    30 members · tag them in
                  </Text>
                </View>
              </View>
              <ChevronRight size={18} color={textSecondary} />
            </Pressable>

            {REP_GROUPS_LIST.map((grp) => (
              <Pressable
                key={grp.id}
                onPress={() => setViewMode("tag-group")}
                style={{
                  backgroundColor: cardBg,
                  borderRadius: 16,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: borderCol,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
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
                    <Users size={20} color="#4F46E5" />
                  </View>
                  <View>
                    <Text variant="TT/Subhead" style={{ color: textPrimary, fontWeight: "700" }}>
                      {grp.name}
                    </Text>
                    <Text variant="TT/Caption" style={{ color: textSecondary }}>
                      {grp.subtitle}
                    </Text>
                  </View>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <View style={{ flexDirection: "row" }}>
                    {["C", "T", "I", "+3"].map((av, idx) => (
                      <View
                        key={av}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 14,
                          backgroundColor: isDark ? "#312E81" : "#EEF2FF",
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
                  <ChevronRight size={18} color={textSecondary} />
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {viewMode === "tag-group" && (
          /* Screen 57: Tag into Group 6 */
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
                marginBottom: 16,
              }}
            >
              <Search size={18} color={textSecondary} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search members"
                placeholderTextColor={textSecondary}
                style={{ flex: 1, color: textPrimary, fontSize: 15 }}
              />
            </View>

            <Text variant="TT/Subhead" style={{ color: textSecondary, marginBottom: 10 }}>
              Not in a group · 30
            </Text>

            {TAG_CANDIDATES.filter((m) =>
              m.name.toLowerCase().includes(searchQuery.toLowerCase()),
            ).map((member) => {
              const checked = selectedTagIds.includes(member.id);
              return (
                <Pressable
                  key={member.id}
                  onPress={() => toggleCandidate(member.id)}
                  style={{
                    backgroundColor: cardBg,
                    borderRadius: 12,
                    paddingVertical: 14,
                    paddingHorizontal: 14,
                    marginBottom: 8,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
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
                        width: 24,
                        height: 24,
                        borderRadius: 6,
                        backgroundColor: checked ? "#4F46E5" : "transparent",
                        borderWidth: checked ? 0 : 1.5,
                        borderColor: borderCol,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {checked ? <Check size={16} color="#FFFFFF" /> : null}
                    </View>

                    <View
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 17,
                        backgroundColor: isDark ? "#312E81" : "#EEF2FF",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text variant="TT/Caption" style={{ color: "#4F46E5", fontWeight: "700" }}>
                        {member.initials}
                      </Text>
                    </View>

                    <Text variant="TT/Body" style={{ color: textPrimary, fontWeight: "500" }}>
                      {member.name}
                    </Text>
                  </View>

                  <Text
                    variant="TT/Caption"
                    style={{
                      color: checked ? "#4F46E5" : textSecondary,
                      fontWeight: checked ? "600" : "400",
                    }}
                  >
                    {checked ? "→ Group 6" : member.currentStatus}
                  </Text>
                </Pressable>
              );
            })}

            <Pressable
              onPress={() => setViewMode("rep-groups")}
              style={{
                height: 52,
                borderRadius: 14,
                backgroundColor: "#4F46E5",
                alignItems: "center",
                justifyContent: "center",
                marginTop: 24,
                marginBottom: 10,
              }}
            >
              <Text variant="TT/Button" style={{ color: "#FFFFFF", fontWeight: "600" }}>
                Add {selectedTagIds.length} to Group 6
              </Text>
            </Pressable>

            <Text variant="TT/Caption" style={{ color: textSecondary }}>
              Moving someone from another group updates both counts and tells them.
            </Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={optionsSheetOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setOptionsSheetOpen(false)}
      >
        <Pressable
          onPress={() => setOptionsSheetOpen(false)}
          style={{
            flex: 1,
            backgroundColor: "rgba(15, 23, 42, 0.52)",
            justifyContent: "flex-end",
          }}
        >
          <Pressable
            onPress={() => undefined}
            style={{
              backgroundColor: cardBg,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingHorizontal: 20,
              paddingTop: 14,
              paddingBottom: 32,
              rowGap: 10,
            }}
          >
            <View
              style={{
                width: 36,
                height: 4,
                borderRadius: 2,
                backgroundColor: borderCol,
                alignSelf: "center",
                marginBottom: 8,
              }}
            />
            <Text variant="title-section" style={{ color: textPrimary, marginBottom: 4 }}>
              Assignment options
            </Text>

            <Pressable
              onPress={() => {
                const next = progress === "submitted" ? "in-progress" : "submitted";
                setProgress(next);
                if (matched) {
                  updateStatus.mutate({
                    id: matched.id,
                    progress: next === "submitted" ? "done" : "in_progress",
                  });
                }
                setOptionsSheetOpen(false);
              }}
              style={{
                height: 48,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: borderCol,
                paddingHorizontal: 14,
                flexDirection: "row",
                alignItems: "center",
                columnGap: 10,
              }}
            >
              <Check size={18} color="#4F46E5" />
              <Text variant="label-lg" style={{ color: textPrimary }}>
                {progress === "submitted" ? "Mark as in progress" : "Mark as submitted"}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setViewMode((prev) => (prev === "solo" ? "group" : "solo"));
                setOptionsSheetOpen(false);
              }}
              style={{
                height: 48,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: borderCol,
                paddingHorizontal: 14,
                flexDirection: "row",
                alignItems: "center",
                columnGap: 10,
              }}
            >
              <Users size={18} color={textSecondary} />
              <Text variant="label-lg" style={{ color: textPrimary }}>
                {viewMode === "solo" ? "View group project options" : "View solo assignment layout"}
              </Text>
            </Pressable>

            {matched ? (
              <Pressable
                onPress={async () => {
                  setOptionsSheetOpen(false);
                  await deleteAssignmentMutation.mutateAsync(matched.id);
                  if (router.canGoBack()) {
                    router.back();
                  } else {
                    router.replace("/(tabs)/assignments");
                  }
                }}
                style={{
                  height: 48,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: isDark ? "#7F1D1D" : "#FECACA",
                  backgroundColor: isDark ? "rgba(127, 29, 29, 0.2)" : "#FEF2F2",
                  paddingHorizontal: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  columnGap: 10,
                }}
              >
                <Trash2 size={18} color="#EF4444" />
                <Text variant="label-lg" style={{ color: "#EF4444" }}>
                  Delete assignment
                </Text>
              </Pressable>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
