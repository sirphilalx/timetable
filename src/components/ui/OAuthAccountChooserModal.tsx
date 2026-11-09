import React, { useState } from "react";
import { Modal, View, Pressable, TextInput, ScrollView } from "react-native";
import { UserPlus, X, Check } from "lucide-react-native";
import { Text } from "./Text";
import { StudentAvatar } from "./StudentAvatar";
import { useTheme } from "@/theme";
import { computeInitials } from "@/auth";

export interface OAuthChosenAccount {
  email: string;
  displayName: string;
  avatarUrl?: string | null;
}

export interface OAuthAccountChooserModalProps {
  visible: boolean;
  provider: "oauth_google" | "oauth_apple" | null;
  currentUser?: {
    displayName?: string;
    email?: string;
    avatarUrl?: string | null;
  };
  onClose: () => void;
  onSelectAccount: (account: OAuthChosenAccount) => void | Promise<void>;
}

const DEFAULT_DEVICE_ACCOUNTS: OAuthChosenAccount[] = [];

export function OAuthAccountChooserModal({
  visible,
  provider,
  currentUser,
  onClose,
  onSelectAccount,
}: OAuthAccountChooserModalProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [addingAnother, setAddingAnother] = useState(false);
  const [customEmail, setCustomEmail] = useState("");
  const [customName, setCustomName] = useState("");
  const [errorText, setErrorText] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!visible || !provider) {
    return null;
  }

  const isGoogle = provider === "oauth_google";
  const providerLabel = isGoogle ? "Google" : "Apple";

  const accounts: OAuthChosenAccount[] = [];
  if (
    currentUser?.email &&
    currentUser.displayName &&
    !DEFAULT_DEVICE_ACCOUNTS.some((a) => a.email.toLowerCase() === currentUser.email?.toLowerCase())
  ) {
    accounts.push({
      displayName: currentUser.displayName,
      email: currentUser.email,
      avatarUrl: currentUser.avatarUrl ?? null,
    });
  }
  accounts.push(...DEFAULT_DEVICE_ACCOUNTS);
  const showAddForm = addingAnother || accounts.length === 0;

  const handleClose = () => {
    setAddingAnother(false);
    setCustomEmail("");
    setCustomName("");
    setErrorText(null);
    onClose();
  };

  const handlePickAccount = async (acct: OAuthChosenAccount) => {
    setIsSubmitting(true);
    try {
      await onSelectAccount(acct);
      setAddingAnother(false);
      setCustomEmail("");
      setCustomName("");
      setErrorText(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitCustomAccount = async () => {
    const cleanEmail = customEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorText(`Enter a valid ${providerLabel} email address.`);
      return;
    }
    const derivedName =
      customName.trim() ||
      cleanEmail
        .split("@")[0]
        ?.split(/[._-]/)
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ") ||
      "Student";

    await handlePickAccount({
      email: cleanEmail,
      displayName: derivedName,
      avatarUrl: null,
    });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable
        onPress={handleClose}
        style={{
          flex: 1,
          backgroundColor: "rgba(15, 23, 42, 0.6)",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 20,
        }}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            width: "100%",
            maxWidth: 400,
            borderRadius: 24,
            backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
            borderWidth: 1,
            borderColor: isDark ? "#334155" : "#E2E8F0",
            overflow: "hidden",
            shadowColor: "#000000",
            shadowOpacity: 0.25,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 10 },
            elevation: 8,
          }}
        >
          {/* Provider Top Bar */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 20,
              paddingVertical: 14,
              borderBottomWidth: 1,
              borderBottomColor: isDark ? "#334155" : "#E2E8F0",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", columnGap: 10 }}>
              <View
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  backgroundColor: isGoogle ? "#FFFFFF" : isDark ? "#0F172A" : "#0F172A",
                  borderWidth: isGoogle ? 1 : 0,
                  borderColor: "#E2E8F0",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  variant="label"
                  style={{
                    color: isGoogle ? "#4285F4" : "#FFFFFF",
                    fontFamily: "Inter_700Bold",
                    fontSize: 14,
                  }}
                >
                  {isGoogle ? "G" : ""}
                </Text>
              </View>
              <Text
                variant="label"
                style={{
                  color: isDark ? "#CBD5E1" : "#475569",
                  fontFamily: "Inter_500Medium",
                }}
              >
                Sign in with {providerLabel}
              </Text>
            </View>

            <Pressable
              onPress={handleClose}
              accessibilityRole="button"
              accessibilityLabel="Close account chooser"
              hitSlop={10}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={18} color={isDark ? "#94A3B8" : "#64748B"} />
            </Pressable>
          </View>

          <ScrollView
            style={{ maxHeight: 460 }}
            contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 20 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Title */}
            <Text
              variant="title-section"
              style={{
                color: isDark ? "#F8FAFC" : "#0F172A",
                fontSize: 22,
                lineHeight: 28,
                fontFamily: "Inter_700Bold",
                textAlign: "center",
                marginBottom: 4,
              }}
            >
              {showAddForm ? `Sign in with ${providerLabel}` : "Choose an account"}
            </Text>
            <Text
              variant="body"
              style={{
                color: isDark ? "#94A3B8" : "#475569",
                textAlign: "center",
                marginBottom: 20,
              }}
            >
              to continue to{" "}
              <Text
                variant="label"
                style={{
                  color: isDark ? "#818CF8" : "#4F46E5",
                  fontFamily: "Inter_600SemiBold",
                }}
              >
                TT Student Timetable
              </Text>
            </Text>

            {!showAddForm ? (
              <View>
                {accounts.map((acct) => {
                  const isCurrent =
                    currentUser?.email &&
                    currentUser.email.toLowerCase() === acct.email.toLowerCase();
                  return (
                    <Pressable
                      key={acct.email}
                      disabled={isSubmitting}
                      onPress={() => void handlePickAccount(acct)}
                      accessibilityRole="button"
                      accessibilityLabel={`Continue as ${acct.displayName} (${acct.email})`}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingVertical: 12,
                        paddingHorizontal: 10,
                        borderRadius: 14,
                        borderBottomWidth: 1,
                        borderBottomColor: isDark ? "#334155" : "#F1F5F9",
                      }}
                    >
                      <StudentAvatar
                        avatarUrl={acct.avatarUrl}
                        initials={computeInitials(acct.displayName)}
                        size={40}
                      />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text
                          variant="label-lg"
                          style={{
                            color: isDark ? "#F8FAFC" : "#0F172A",
                            fontSize: 15,
                          }}
                        >
                          {acct.displayName}
                        </Text>
                        <Text
                          variant="body"
                          style={{
                            color: isDark ? "#94A3B8" : "#475569",
                            fontSize: 13,
                            marginTop: 1,
                          }}
                        >
                          {acct.email}
                        </Text>
                      </View>
                      {isCurrent ? (
                        <View
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 12,
                            backgroundColor: isDark ? "#312E81" : "#EEF2FF",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Check
                            size={14}
                            color={isDark ? "#818CF8" : "#4F46E5"}
                            strokeWidth={2.5}
                          />
                        </View>
                      ) : null}
                    </Pressable>
                  );
                })}

                {/* Use another account */}
                <Pressable
                  onPress={() => {
                    setErrorText(null);
                    setAddingAnother(true);
                  }}
                  accessibilityRole="button"
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 14,
                    paddingHorizontal: 10,
                    marginTop: 2,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: isDark ? "#0F172A" : "#F1F5F9",
                      borderWidth: 1,
                      borderColor: isDark ? "#334155" : "#CBD5E1",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <UserPlus size={18} color={isDark ? "#CBD5E1" : "#334155"} strokeWidth={2} />
                  </View>
                  <Text
                    variant="label-lg"
                    style={{
                      color: isDark ? "#F8FAFC" : "#0F172A",
                      fontSize: 15,
                      marginLeft: 12,
                    }}
                  >
                    Use another account
                  </Text>
                </Pressable>
              </View>
            ) : (
              <View style={{ rowGap: 14 }}>
                <View>
                  <Text
                    variant="label"
                    style={{
                      color: isDark ? "#CBD5E1" : "#334155",
                      marginBottom: 6,
                    }}
                  >
                    {providerLabel} email
                  </Text>
                  <TextInput
                    value={customEmail}
                    onChangeText={(val) => {
                      setCustomEmail(val);
                      setErrorText(null);
                    }}
                    placeholder={isGoogle ? "you@gmail.com or university.edu.ng" : "you@icloud.com"}
                    placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    style={{
                      height: 48,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: isDark ? "#334155" : "#CBD5E1",
                      backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                      paddingHorizontal: 14,
                      fontFamily: "Inter_400Regular",
                      fontSize: 15,
                      color: isDark ? "#F8FAFC" : "#0F172A",
                    }}
                  />
                </View>

                <View>
                  <Text
                    variant="label"
                    style={{
                      color: isDark ? "#CBD5E1" : "#334155",
                      marginBottom: 6,
                    }}
                  >
                    Full name
                  </Text>
                  <TextInput
                    value={customName}
                    onChangeText={(val) => {
                      setCustomName(val);
                      setErrorText(null);
                    }}
                    placeholder="e.g. Chioma Okafor"
                    placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                    style={{
                      height: 48,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: isDark ? "#334155" : "#CBD5E1",
                      backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                      paddingHorizontal: 14,
                      fontFamily: "Inter_400Regular",
                      fontSize: 15,
                      color: isDark ? "#F8FAFC" : "#0F172A",
                    }}
                  />
                </View>

                {errorText ? (
                  <Text variant="caption" style={{ color: isDark ? "#F87171" : "#DC2626" }}>
                    {errorText}
                  </Text>
                ) : null}

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: 6,
                    columnGap: 12,
                  }}
                >
                  {accounts.length > 0 ? (
                    <Pressable
                      onPress={() => {
                        setErrorText(null);
                        setAddingAnother(false);
                      }}
                      accessibilityRole="button"
                      style={{
                        height: 46,
                        paddingHorizontal: 16,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: isDark ? "#334155" : "#CBD5E1",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text variant="label" style={{ color: isDark ? "#CBD5E1" : "#334155" }}>
                        Back
                      </Text>
                    </Pressable>
                  ) : null}

                  <Pressable
                    disabled={isSubmitting}
                    onPress={() => void handleSubmitCustomAccount()}
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
                      Continue
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}

            <Text
              variant="caption"
              style={{
                color: isDark ? "#64748B" : "#64748B",
                textAlign: "center",
                marginTop: 18,
                lineHeight: 16,
              }}
            >
              To continue, {providerLabel} will share your name, email address, and profile picture
              with TT.
            </Text>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
