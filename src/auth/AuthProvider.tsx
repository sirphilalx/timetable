import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Platform } from "react-native";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import {
  ClerkProvider,
  useAuth as useClerkAuth,
  useUser as useClerkUser,
  useSignIn as useClerkSignIn,
  useSignUp as useClerkSignUp,
  useSSO as useClerkSSO,
  type TokenCache,
} from "@clerk/clerk-expo";
import { useQueryClient } from "@tanstack/react-query";
import { platformStorage } from "@/lib/storage";
import { registerClerkTokenProvider, supabase, isSupabaseConfigured } from "@/lib/supabase";
import { deriveAccountIds, memoryStore, SEED_SEMESTER_ID, SEED_STUDENT_ID } from "@/db/seed";
import { clearAnonymousTimetableStore, switchTimetableAccount } from "@/hooks/useTimetable";
import { db, students } from "@/db";
import { identifyStudent, resetAnalyticsIdentity, trackEvent } from "@/lib/analytics";

try {
  WebBrowser.maybeCompleteAuthSession();
} catch {
  // Safe on SSR / static web export
}

const CLERK_JWT_STORAGE_KEY = "__clerk_client_jwt";
const AUTH_SESSION_STORAGE_KEY = "tt_auth_session_v2";

const clerkTokenCache: TokenCache = {
  async getToken(key: string) {
    try {
      return await platformStorage.getItem(key);
    } catch {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await platformStorage.setItem(key, value);
    } catch {
      // Ignore storage write error
    }
  },
  async clearToken(key: string) {
    try {
      await platformStorage.removeItem(key);
    } catch {
      // Ignore storage remove error
    }
  },
};

export interface AuthUser {
  studentId: string;
  clerkUserId: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  email: string;
  institution: string;
  dateOfBirth: string;
  initials: string;
}

export interface AuthActionResult {
  ok: boolean;
  error?: string;
  needsVerification?: boolean;
  verificationMode?: "signin" | "signup";
  cancelled?: boolean;
  fallbackToChooser?: boolean;
  isNewUser?: boolean;
}

export interface AuthContextValue {
  user: AuthUser;
  isLoaded: boolean;
  isSignedIn: boolean;
  hasCompletedOnboarding: boolean;
  isClerkConfigured: boolean;
  getToken: () => Promise<string | null>;
  signInWithEmail: (email: string, password: string) => Promise<AuthActionResult>;
  signUpWithEmail: (input: {
    email: string;
    password: string;
    displayName?: string;
    username?: string;
    avatarUrl?: string | null;
  }) => Promise<AuthActionResult>;
  verifyEmailCode: (code: string, mode: "signin" | "signup") => Promise<AuthActionResult>;
  signInWithOAuth: (
    provider: "oauth_google" | "oauth_apple",
    account?: {
      intent?: "signin" | "signup";
      email?: string;
      displayName?: string;
      avatarUrl?: string | null;
      completeOnboarding?: boolean;
    },
  ) => Promise<AuthActionResult>;
  resetPassword: (email: string) => Promise<AuthActionResult>;
  completeOnboarding: () => Promise<void>;
  updateProfile: (input: {
    displayName?: string;
    username?: string;
    avatarUrl?: string | null;
    email?: string;
    institution?: string;
    dateOfBirth?: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
}

export function computeInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "ST";
  if (parts.length === 1) {
    return (parts[0]?.slice(0, 2) ?? "ST").toUpperCase();
  }
  const first = parts[0]?.[0] ?? "S";
  const last = parts[parts.length - 1]?.[0] ?? "T";
  return `${first}${last}`.toUpperCase();
}

export function normalizeUsername(raw: string): string {
  return raw
    .trim()
    .replace(/^@+/, "")
    .toLowerCase()
    .replace(/[^a-z0-9_.]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^[_.]+|[_.]+$/g, "")
    .slice(0, 24);
}

export function suggestUsernames(displayName: string, email?: string): string[] {
  const baseParts = displayName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);

  const emailLocal = normalizeUsername(email?.split("@")[0] ?? "");
  const first = baseParts[0] ?? (emailLocal || "student");
  const last = baseParts[1] ?? "";

  const candidates = [
    last ? `${first}_${last}` : `${first}_tt`,
    last ? `${first}.${last.slice(0, 3)}` : `${first}26`,
    emailLocal && emailLocal.length >= 3 ? emailLocal : `${first}_uniben`,
    last ? `${first}${last.charAt(0)}_26` : `${first}_csc`,
  ]
    .map((c) => normalizeUsername(c))
    .filter((c) => c.length >= 3);

  return Array.from(new Set(candidates)).slice(0, 3);
}

const DEFAULT_CLERK_PUBLISHABLE_KEY = "pk_live_Y2xlcmsuc3R1ZGVudHRpbWV0YWJsZS5hcHAk";

export function getClerkPublishableKey(): string {
  return process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || DEFAULT_CLERK_PUBLISHABLE_KEY;
}

export function isClerkKeyConfigured(): boolean {
  const key = getClerkPublishableKey();
  return Boolean(
    key &&
    key !== "pk_test_your-clerk-publishable-key" &&
    (key.startsWith("pk_test_") || key.startsWith("pk_live_")),
  );
}

function extractClerkErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object") {
    const maybeClerk = err as {
      errors?: { longMessage?: string; message?: string; code?: string }[];
      message?: string;
    };
    const first = maybeClerk.errors?.[0];
    if (first?.longMessage) return first.longMessage;
    if (first?.message) return first.message;
    if (typeof maybeClerk.message === "string" && maybeClerk.message.length > 0) {
      return maybeClerk.message;
    }
  }
  return fallback;
}

const DEFAULT_USER: AuthUser = {
  studentId: memoryStore.student.id,
  clerkUserId: memoryStore.student.clerkUserId ?? "",
  displayName: memoryStore.student.displayName,
  username: memoryStore.student.username ?? "",
  avatarUrl: memoryStore.student.avatarUrl ?? null,
  email: memoryStore.student.email ?? "",
  institution: memoryStore.student.institution ?? "",
  dateOfBirth: memoryStore.student.dateOfBirth ?? "",
  initials: computeInitials(memoryStore.student.displayName),
};

const AuthContext = createContext<AuthContextValue>({
  user: DEFAULT_USER,
  isLoaded: true,
  isSignedIn: false,
  hasCompletedOnboarding: false,
  isClerkConfigured: false,
  getToken: async () => null,
  signInWithEmail: async () => ({ ok: true }),
  signUpWithEmail: async () => ({ ok: true }),
  verifyEmailCode: async () => ({ ok: true }),
  signInWithOAuth: async () => ({ ok: true }),
  resetPassword: async () => ({ ok: true }),
  completeOnboarding: async () => {},
  updateProfile: async () => {},
  signOut: async () => {},
});

interface ClerkBridgeSdk {
  isLoaded: boolean;
  isSignedIn: boolean;
  clerkUser: {
    id: string;
    fullName: string | null;
    firstName: string | null;
    lastName: string | null;
    username: string | null;
    primaryEmailAddress: string | null;
    imageUrl: string | null;
  } | null;
  getToken: () => Promise<string | null>;
  signOut: () => Promise<void>;
  signIn: ReturnType<typeof useClerkSignIn>["signIn"];
  setSignInActive: ReturnType<typeof useClerkSignIn>["setActive"];
  signUp: ReturnType<typeof useClerkSignUp>["signUp"];
  setSignUpActive: ReturnType<typeof useClerkSignUp>["setActive"];
  startSSOFlow: ReturnType<typeof useClerkSSO>["startSSOFlow"] | null;
}

function InnerAuthCore({
  children,
  clerkSdk,
}: {
  children: React.ReactNode;
  clerkSdk: ClerkBridgeSdk | null;
}) {
  const queryClient = useQueryClient();
  const [user, setUserState] = useState<AuthUser>(DEFAULT_USER);
  const latestUserRef = useRef<AuthUser>(DEFAULT_USER);
  const setUser = useCallback((nextUser: AuthUser) => {
    latestUserRef.current = nextUser;
    setUserState(nextUser);
  }, []);
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);
  const clerkConfigured = isClerkKeyConfigured();
  const lastSyncedClerkUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (Platform.OS !== "web") {
      void WebBrowser.warmUpAsync().catch(() => {});
      return () => {
        void WebBrowser.coolDownAsync().catch(() => {});
      };
    }
  }, []);

  const syncUserToLocalAndCloudStore = useCallback(
    async (nextUser: AuthUser) => {
      const now = new Date().toISOString();
      const { studentId: scopedStudentId, semesterId: scopedSemesterId } = deriveAccountIds(
        nextUser.clerkUserId,
        nextUser.email,
        nextUser.username,
      );
      await switchTimetableAccount(scopedStudentId, scopedSemesterId);

      memoryStore.student = {
        ...memoryStore.student,
        id: scopedStudentId,
        clerkUserId: nextUser.clerkUserId,
        displayName: nextUser.displayName,
        username: nextUser.username,
        avatarUrl: nextUser.avatarUrl,
        email: nextUser.email,
        institution: nextUser.institution,
        dateOfBirth: nextUser.dateOfBirth,
        updatedAt: now,
      };
      memoryStore.semester = {
        ...memoryStore.semester,
        id: scopedSemesterId,
        studentId: scopedStudentId,
        updatedAt: now,
      };

      if (db) {
        try {
          await db
            .insert(students)
            .values(memoryStore.student)
            .onConflictDoUpdate({
              target: students.id,
              set: {
                displayName: memoryStore.student.displayName,
                username: memoryStore.student.username,
                avatarUrl: memoryStore.student.avatarUrl,
                email: memoryStore.student.email,
                institution: memoryStore.student.institution,
                dateOfBirth: memoryStore.student.dateOfBirth,
                updatedAt: now,
              },
            });
        } catch {
          // Persisted in memoryStore + platformStorage
        }
      }

      if (isSupabaseConfigured()) {
        try {
          await supabase.from("students").upsert(
            {
              id: scopedStudentId,
              clerk_user_id: nextUser.clerkUserId,
              display_name: nextUser.displayName,
              username: nextUser.username || null,
              avatar_url: nextUser.avatarUrl,
              email: nextUser.email,
              institution: nextUser.institution,
              date_of_birth: nextUser.dateOfBirth,
              is_minor: memoryStore.student.isMinor,
              guardian_consent_status: memoryStore.student.guardianConsentStatus,
              updated_at: now,
            },
            { onConflict: "id" },
          );
        } catch {
          // Queued/offline safe
        }
      }

      void queryClient.invalidateQueries({ queryKey: ["timetable"] });
    },
    [queryClient],
  );

  const persistSession = useCallback(
    async (nextUser: AuthUser, signedIn: boolean, onboarded: boolean, jwt?: string) => {
      await platformStorage.setItem(
        AUTH_SESSION_STORAGE_KEY,
        JSON.stringify({
          user: nextUser,
          isSignedIn: signedIn,
          hasCompletedOnboarding: onboarded,
        }),
      );
      if (jwt) {
        await platformStorage.setItem(CLERK_JWT_STORAGE_KEY, jwt);
      }
      await syncUserToLocalAndCloudStore(nextUser);
      if (signedIn) {
        identifyStudent({
          id: nextUser.studentId || nextUser.clerkUserId,
          email: nextUser.email,
          displayName: nextUser.displayName,
          username: nextUser.username,
          isUnder18: Boolean(memoryStore.student.isMinor),
          parentConsentGranted: memoryStore.student.guardianConsentStatus === "approved",
          hasCompletedOnboarding: onboarded,
        });
      }
    },
    [syncUserToLocalAndCloudStore],
  );

  const getToken = useCallback(async (): Promise<string | null> => {
    if (clerkSdk?.isSignedIn) {
      try {
        const liveJwt = await clerkSdk.getToken();
        if (liveJwt) {
          await platformStorage.setItem(CLERK_JWT_STORAGE_KEY, liveJwt);
          return liveJwt;
        }
      } catch {
        // Fallback to cached JWT below
      }
    }
    const cachedJwt = await platformStorage.getItem(CLERK_JWT_STORAGE_KEY);
    if (cachedJwt) return cachedJwt;
    return null;
  }, [clerkSdk]);

  useEffect(() => {
    registerClerkTokenProvider(getToken);
    return () => registerClerkTokenProvider(null);
  }, [getToken]);

  // Hydrate persisted device session
  useEffect(() => {
    let mounted = true;
    async function hydrateAuth() {
      try {
        const raw = await platformStorage.getItem(AUTH_SESSION_STORAGE_KEY);
        if (raw && mounted) {
          const parsed = JSON.parse(raw) as {
            user?: Partial<AuthUser>;
            isSignedIn?: boolean;
            hasCompletedOnboarding?: boolean;
          };
          if (parsed.user) {
            const displayName = parsed.user.displayName ?? "";
            const email = parsed.user.email ?? "";
            const clerkUserId = parsed.user.clerkUserId ?? "";
            const hydratedUsername =
              parsed.user.username ||
              (displayName ? (suggestUsernames(displayName, email)[0] ?? "") : "");
            const { studentId: scopedStudentId } = deriveAccountIds(
              clerkUserId,
              email,
              hydratedUsername,
            );
            const hydratedUser: AuthUser = {
              studentId: scopedStudentId,
              clerkUserId,
              displayName,
              username: hydratedUsername,
              avatarUrl: parsed.user.avatarUrl ?? null,
              email,
              institution: parsed.user.institution ?? "",
              dateOfBirth: parsed.user.dateOfBirth ?? "",
              initials: computeInitials(displayName || hydratedUsername),
            };
            const signedIn = Boolean(parsed.isSignedIn);
            const onboarded = Boolean(parsed.hasCompletedOnboarding ?? signedIn);
            setUser(hydratedUser);
            setIsSignedIn(signedIn);
            setHasCompletedOnboarding(onboarded);
            if (signedIn) {
              await syncUserToLocalAndCloudStore(hydratedUser);
            }
          }
        }
      } catch {
        // Keep unauthenticated default for onboarding
      } finally {
        if (mounted) setIsHydrated(true);
      }
    }
    void hydrateAuth();
    return () => {
      mounted = false;
    };
  }, [syncUserToLocalAndCloudStore]);

  // Sync live Clerk SDK user into TT AuthUser whenever Clerk session becomes active
  useEffect(() => {
    if (!clerkSdk?.isLoaded || !clerkSdk.isSignedIn || !clerkSdk.clerkUser) {
      return;
    }
    const cu = clerkSdk.clerkUser;
    const syncSignature = `${cu.id}:${cu.primaryEmailAddress ?? ""}:${cu.fullName ?? ""}`;
    if (lastSyncedClerkUserIdRef.current === syncSignature && isSignedIn) {
      return;
    }
    lastSyncedClerkUserIdRef.current = syncSignature;

    const clerkEmail = cu.primaryEmailAddress || user.email;
    const { studentId: scopedStudentId } = deriveAccountIds(cu.id, clerkEmail);
    const isDifferentAccount =
      user.email.toLowerCase() !== clerkEmail.toLowerCase() && user.clerkUserId !== cu.id;
    const derivedName =
      cu.fullName?.trim() ||
      [cu.firstName, cu.lastName].filter(Boolean).join(" ").trim() ||
      (!isDifferentAccount ? user.displayName : "") ||
      clerkEmail
        .split("@")[0]
        ?.split(/[._-]/)
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ") ||
      "Student";
    const derivedUsername =
      cu.username ||
      (!isDifferentAccount ? user.username : "") ||
      (suggestUsernames(derivedName, clerkEmail)[0] ?? "student_tt");
    const derivedAvatar =
      !isDifferentAccount && user.avatarUrl && user.avatarUrl.startsWith("preset:")
        ? user.avatarUrl
        : cu.imageUrl || (!isDifferentAccount ? user.avatarUrl : null);

    const syncedUser: AuthUser = {
      ...user,
      studentId: scopedStudentId,
      clerkUserId: cu.id,
      email: clerkEmail,
      displayName: derivedName,
      username: derivedUsername,
      avatarUrl: derivedAvatar,
      initials: computeInitials(derivedName),
    };

    setUser(syncedUser);
    setIsSignedIn(true);
    void persistSession(syncedUser, true, hasCompletedOnboarding);
  }, [clerkSdk, hasCompletedOnboarding, isSignedIn, persistSession, user]);

  const signInWithEmail = useCallback(
    async (email: string, password: string): Promise<AuthActionResult> => {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes("@")) {
        return { ok: false, error: "Please enter a valid email address." };
      }
      if (!password || password.length < 4) {
        return { ok: false, error: "Please enter your password." };
      }

      // 1. Try real Clerk SDK sign-in first when configured
      if (clerkSdk?.signIn && clerkSdk.setSignInActive) {
        try {
          const attempt = await clerkSdk.signIn.create({
            identifier: cleanEmail,
            password,
          });

          if (attempt.status === "complete" && attempt.createdSessionId) {
            await clerkSdk.setSignInActive({ session: attempt.createdSessionId });
            const liveJwt = await clerkSdk.getToken();
            const localPart = cleanEmail.split("@")[0] ?? "Student";
            const derivedName =
              cleanEmail === user.email.toLowerCase()
                ? user.displayName
                : localPart
                    .split(/[._-]/)
                    .filter(Boolean)
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" ");
            const finalName = derivedName || user.displayName || "Student";
            const clerkUserId = attempt.id ?? `user_${cleanEmail.replace(/[^a-z0-9]/g, "_")}`;
            const { studentId: scopedStudentId } = deriveAccountIds(clerkUserId, cleanEmail);
            const isSameAccount = cleanEmail === user.email.toLowerCase();
            const finalUsername =
              (isSameAccount && user.username) ||
              (suggestUsernames(finalName, cleanEmail)[0] ?? "student_tt");

            const nextUser: AuthUser = {
              ...user,
              studentId: scopedStudentId,
              clerkUserId,
              email: cleanEmail,
              displayName: finalName,
              username: finalUsername,
              avatarUrl: isSameAccount ? user.avatarUrl : null,
              initials: computeInitials(finalName),
            };
            setUser(nextUser);
            setIsSignedIn(true);
            setHasCompletedOnboarding(true);
            await persistSession(nextUser, true, true, liveJwt ?? undefined);
            return { ok: true };
          }

          if (attempt.status === "needs_first_factor" || attempt.status === "needs_second_factor") {
            const emailFactor = attempt.supportedFirstFactors?.find(
              (f) => f.strategy === "email_code" && "emailAddressId" in f,
            ) as { emailAddressId?: string } | undefined;
            if (emailFactor?.emailAddressId) {
              await clerkSdk.signIn.prepareFirstFactor({
                strategy: "email_code",
                emailAddressId: emailFactor.emailAddressId,
              });
            }
            return {
              ok: false,
              needsVerification: true,
              verificationMode: "signin",
              error: "Enter the 6-digit verification code sent to your email.",
            };
          }
        } catch (err) {
          const msg = extractClerkErrorMessage(err, "Unable to sign in with Clerk.");
          // If it's a real Clerk validation error (wrong password / account doesn't exist), surface it!
          if (!msg.toLowerCase().includes("network") && !msg.toLowerCase().includes("fetch")) {
            return { ok: false, error: msg };
          }
        }
      }

      // 2. Offline / local fallback when Clerk network is unreachable
      const clerkUserId = `user_local_${cleanEmail.replace(/[^a-z0-9]/g, "_")}`;
      const { studentId: scopedStudentId } = deriveAccountIds(clerkUserId, cleanEmail);
      const isSameAccount = cleanEmail === user.email.toLowerCase();
      const localPart = cleanEmail.split("@")[0] ?? "Student";
      const displayName = !isSameAccount
        ? localPart
            .split(/[._-]/)
            .filter(Boolean)
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ")
        : user.displayName;
      const finalName = displayName || user.displayName;
      const finalUsername =
        (isSameAccount && user.username) ||
        (suggestUsernames(finalName, cleanEmail)[0] ?? "student_tt");

      const nextUser: AuthUser = {
        ...user,
        studentId: scopedStudentId,
        clerkUserId,
        email: cleanEmail,
        displayName: finalName,
        username: finalUsername,
        avatarUrl: isSameAccount ? user.avatarUrl : null,
        initials: computeInitials(finalName || finalUsername),
      };

      setUser(nextUser);
      setIsSignedIn(true);
      setHasCompletedOnboarding(true);
      await persistSession(nextUser, true, true, `clerk_jwt_${clerkUserId}`);
      return { ok: true };
    },
    [clerkSdk, persistSession, user],
  );

  const signUpWithEmail = useCallback(
    async (input: {
      email: string;
      password: string;
      displayName?: string;
      username?: string;
      avatarUrl?: string | null;
    }): Promise<AuthActionResult> => {
      const cleanEmail = input.email.trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes("@")) {
        return { ok: false, error: "Enter a valid university or personal email." };
      }
      if (!input.password || input.password.length < 8) {
        return { ok: false, error: "Password must be at least 8 characters." };
      }

      const derivedName =
        input.displayName?.trim() ||
        cleanEmail
          .split("@")[0]
          ?.split(/[._-]/)
          .filter(Boolean)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ") ||
        "Student";

      const derivedUsername =
        normalizeUsername(input.username ?? "") ||
        (suggestUsernames(derivedName, cleanEmail)[0] ?? "student_tt");

      // 1. Try real Clerk SDK sign-up
      if (clerkSdk?.signUp && clerkSdk.setSignUpActive) {
        try {
          const attempt = await clerkSdk.signUp.create({
            emailAddress: cleanEmail,
            password: input.password,
          });

          if (attempt.status === "complete" && attempt.createdSessionId) {
            await clerkSdk.setSignUpActive({ session: attempt.createdSessionId });
            const liveJwt = await clerkSdk.getToken();
            const clerkUserId =
              attempt.createdUserId ?? `user_${cleanEmail.replace(/[^a-z0-9]/g, "_")}`;
            const { studentId: scopedStudentId } = deriveAccountIds(clerkUserId, cleanEmail);
            const nextUser: AuthUser = {
              ...user,
              studentId: scopedStudentId,
              clerkUserId,
              email: cleanEmail,
              displayName: derivedName,
              username: derivedUsername,
              avatarUrl: input.avatarUrl !== undefined ? input.avatarUrl : null,
              institution: "",
              dateOfBirth: "",
              initials: computeInitials(derivedName),
            };
            setUser(nextUser);
            setIsSignedIn(true);
            await persistSession(nextUser, true, false, liveJwt ?? undefined);
            return { ok: true };
          }

          if (attempt.status === "missing_requirements") {
            await clerkSdk.signUp.prepareEmailAddressVerification({
              strategy: "email_code",
            });
            const { studentId: scopedStudentId } = deriveAccountIds(null, cleanEmail);
            const pendingUser: AuthUser = {
              ...user,
              studentId: scopedStudentId,
              email: cleanEmail,
              displayName: derivedName,
              username: derivedUsername,
              avatarUrl: input.avatarUrl !== undefined ? input.avatarUrl : null,
              institution: "",
              dateOfBirth: "",
              initials: computeInitials(derivedName),
            };
            setUser(pendingUser);
            return {
              ok: false,
              needsVerification: true,
              verificationMode: "signup",
              error: `We sent a 6-digit verification code to ${cleanEmail}.`,
            };
          }
        } catch (err) {
          const msg = extractClerkErrorMessage(err, "Unable to create account with Clerk.");
          if (!msg.toLowerCase().includes("network") && !msg.toLowerCase().includes("fetch")) {
            return { ok: false, error: msg };
          }
        }
      }

      // 2. Offline / local fallback
      const clerkUserId = `user_local_${cleanEmail.replace(/[^a-z0-9]/g, "_")}`;
      const { studentId: scopedStudentId } = deriveAccountIds(clerkUserId, cleanEmail);
      const nextUser: AuthUser = {
        ...user,
        studentId: scopedStudentId,
        clerkUserId,
        email: cleanEmail,
        displayName: derivedName,
        username: derivedUsername,
        avatarUrl: input.avatarUrl !== undefined ? input.avatarUrl : null,
        institution: "",
        dateOfBirth: "",
        initials: computeInitials(derivedName),
      };

      setUser(nextUser);
      setIsSignedIn(true);
      await persistSession(nextUser, true, false, `clerk_jwt_${clerkUserId}`);
      return { ok: true };
    },
    [clerkSdk, persistSession, user],
  );

  const verifyEmailCode = useCallback(
    async (code: string, mode: "signin" | "signup"): Promise<AuthActionResult> => {
      const cleanCode = code.trim();
      if (!cleanCode || cleanCode.length < 4) {
        return { ok: false, error: "Enter the 6-digit verification code from your email." };
      }

      try {
        if (mode === "signup" && clerkSdk?.signUp && clerkSdk.setSignUpActive) {
          const res = await clerkSdk.signUp.attemptEmailAddressVerification({
            code: cleanCode,
          });
          if (res.status === "complete" && res.createdSessionId) {
            await clerkSdk.setSignUpActive({ session: res.createdSessionId });
            const liveJwt = await clerkSdk.getToken();
            const clerkUserId = res.createdUserId ?? user.clerkUserId;
            const { studentId: scopedStudentId } = deriveAccountIds(clerkUserId, user.email);
            const nextUser: AuthUser = {
              ...user,
              studentId: scopedStudentId,
              clerkUserId,
            };
            setUser(nextUser);
            setIsSignedIn(true);
            await persistSession(nextUser, true, false, liveJwt ?? undefined);
            return { ok: true };
          }
          return { ok: false, error: "Verification incomplete. Check the code and try again." };
        }

        if (mode === "signin" && clerkSdk?.signIn && clerkSdk.setSignInActive) {
          const res = await clerkSdk.signIn.attemptFirstFactor({
            strategy: "email_code",
            code: cleanCode,
          });
          if (res.status === "complete" && res.createdSessionId) {
            await clerkSdk.setSignInActive({ session: res.createdSessionId });
            const liveJwt = await clerkSdk.getToken();
            setIsSignedIn(true);
            setHasCompletedOnboarding(true);
            await persistSession(user, true, true, liveJwt ?? undefined);
            return { ok: true };
          }
          return { ok: false, error: "Verification incomplete. Check the code and try again." };
        }
      } catch (err) {
        return {
          ok: false,
          error: extractClerkErrorMessage(err, "Invalid verification code."),
        };
      }

      return { ok: true };
    },
    [clerkSdk, persistSession, user],
  );

  const signInWithOAuth = useCallback(
    async (
      provider: "oauth_google" | "oauth_apple",
      account?: {
        intent?: "signin" | "signup";
        email?: string;
        displayName?: string;
        avatarUrl?: string | null;
        completeOnboarding?: boolean;
      },
    ): Promise<AuthActionResult> => {
      const hasManualAccount = Boolean(account?.email);

      // 1. If no manual account override was passed and Clerk SSO is available, launch real Clerk OAuth browser flow!
      if (!hasManualAccount && clerkSdk?.startSSOFlow && Platform.OS !== "web") {
        try {
          // Matches the exact whitelisted mobile OAuth redirect URI in Clerk Dashboard
          const redirectUrl = "tt://setup/welcome";
          const { createdSessionId, setActive, signIn, signUp, authSessionResult } =
            await clerkSdk.startSSOFlow({
              strategy: provider,
              redirectUrl,
            });

          if (authSessionResult?.type === "cancel" || authSessionResult?.type === "dismiss") {
            return { ok: false, cancelled: true };
          }

          let finalSessionId: string | null = createdSessionId ?? null;
          let isNewSignUp = account?.intent === "signup";
          let activeSignUp = signUp;
          let activeSignIn = signIn;

          // Step A: Handle transferable sign-in -> sign-up (new user tapped Google/Apple)
          if (
            !finalSessionId &&
            activeSignUp &&
            activeSignIn?.firstFactorVerification?.status === "transferable"
          ) {
            try {
              activeSignUp = await activeSignUp.create({ transfer: true });
              isNewSignUp = true;
              if (activeSignUp.status === "complete" && activeSignUp.createdSessionId) {
                finalSessionId = activeSignUp.createdSessionId;
              }
            } catch {
              // Continue to missing_requirements check below
            }
          }

          // Step B: Handle transferable sign-up -> sign-in (existing user tapped Google/Apple on Create Account)
          if (
            !finalSessionId &&
            activeSignIn &&
            activeSignUp?.verifications?.externalAccount?.status === "transferable"
          ) {
            try {
              activeSignIn = await activeSignIn.create({ transfer: true });
              if (account?.intent !== "signup") {
                isNewSignUp = false;
              }
              if (activeSignIn.status === "complete" && activeSignIn.createdSessionId) {
                finalSessionId = activeSignIn.createdSessionId;
              }
            } catch {
              // Continue to fallback check below
            }
          }

          // Step C: Fulfill any missing sign-up requirements (e.g. Clerk requires password, first_name, last_name, or username)
          if (
            !finalSessionId &&
            activeSignUp &&
            (activeSignUp.status === "missing_requirements" ||
              (activeSignUp.missingFields?.length ?? 0) > 0)
          ) {
            isNewSignUp = true;
            const missing = activeSignUp.missingFields ?? [];
            const candidateEmail =
              activeSignUp.emailAddress ||
              activeSignIn?.identifier ||
              user.email ||
              "student@tt.app";
            const candidateFirst = activeSignUp.firstName || "Student";
            const candidateLast = activeSignUp.lastName || "User";
            const candidateFullName =
              [activeSignUp.firstName, activeSignUp.lastName].filter(Boolean).join(" ").trim() ||
              "Student";
            const baseHandle =
              activeSignUp.username ||
              (suggestUsernames(candidateFullName, candidateEmail)[0] ?? "student_tt");
            const suffix = String(Math.floor(100 + Math.random() * 900));

            const updatePayload: Record<string, unknown> = {};
            if (missing.includes("password")) {
              // Clerk instance has password required (min_length: 15); generate a strong 24-char password for OAuth sign-ups
              const randA = Math.random().toString(36).slice(2, 10);
              const randB = Math.random().toString(36).slice(2, 10);
              updatePayload.password = `Tt!9_${randA}#${randB}_26A`;
            }
            if (missing.includes("username")) {
              updatePayload.username = normalizeUsername(`${baseHandle}_${suffix}`);
            }
            if (missing.includes("first_name") && !activeSignUp.firstName) {
              updatePayload.firstName = candidateFirst;
            }
            if (missing.includes("last_name") && !activeSignUp.lastName) {
              updatePayload.lastName = candidateLast;
            }
            if (missing.includes("legal_accepted")) {
              updatePayload.legalAccepted = true;
            }

            if (Object.keys(updatePayload).length > 0) {
              try {
                activeSignUp = await activeSignUp.update(updatePayload as any);
                if (activeSignUp.status === "complete" && activeSignUp.createdSessionId) {
                  finalSessionId = activeSignUp.createdSessionId;
                }
              } catch {
                if (missing.includes("username")) {
                  try {
                    activeSignUp = await activeSignUp.update({
                      ...updatePayload,
                      username: `tt_student_${Math.floor(10000 + Math.random() * 90000)}`,
                    } as any);
                    if (activeSignUp.status === "complete" && activeSignUp.createdSessionId) {
                      finalSessionId = activeSignUp.createdSessionId;
                    }
                  } catch {
                    // Handled below if finalSessionId remains null
                  }
                }
              }
            }
          }

          if (!finalSessionId) {
            finalSessionId =
              activeSignUp?.createdSessionId ?? activeSignIn?.createdSessionId ?? null;
          }
          if (activeSignUp?.createdUserId && !activeSignIn?.createdSessionId) {
            isNewSignUp = true;
          }

          if (finalSessionId && setActive) {
            await setActive({ session: finalSessionId });
            const liveJwt = await clerkSdk.getToken();
            const oauthEmail =
              activeSignUp?.emailAddress ||
              activeSignIn?.identifier ||
              clerkSdk.clerkUser?.primaryEmailAddress ||
              user.email ||
              "";
            const oauthName =
              [activeSignUp?.firstName, activeSignUp?.lastName].filter(Boolean).join(" ").trim() ||
              clerkSdk.clerkUser?.fullName?.trim() ||
              (oauthEmail
                ? oauthEmail
                    .split("@")[0]
                    ?.split(/[._-]/)
                    .filter(Boolean)
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" ")
                : "") ||
              user.displayName ||
              "Student";
            const oauthUsername =
              activeSignUp?.username ||
              clerkSdk.clerkUser?.username ||
              user.username ||
              (suggestUsernames(oauthName, oauthEmail)[0] ?? "student_tt");

            const clerkUserId =
              activeSignUp?.createdUserId ??
              clerkSdk.clerkUser?.id ??
              `user_${provider}_${finalSessionId}`;
            const { studentId: scopedStudentId } = deriveAccountIds(clerkUserId, oauthEmail);

            const nextUser: AuthUser = {
              ...user,
              studentId: scopedStudentId,
              clerkUserId,
              email: oauthEmail,
              displayName: oauthName,
              username: oauthUsername,
              avatarUrl: clerkSdk.clerkUser?.imageUrl ?? user.avatarUrl,
              initials: computeInitials(oauthName),
            };
            const nextOnboarding =
              account?.completeOnboarding !== undefined
                ? account.completeOnboarding
                : account?.intent === "signup"
                  ? false
                  : isNewSignUp
                    ? false
                    : true;
            setUser(nextUser);
            setIsSignedIn(true);
            setHasCompletedOnboarding(nextOnboarding);
            await persistSession(nextUser, true, nextOnboarding, liveJwt ?? undefined);
            return { ok: true, isNewUser: !nextOnboarding };
          }

          if (clerkConfigured) {
            return {
              ok: false,
              error:
                "Could not finish social sign-in. Please try again or continue with your email.",
            };
          }
          return { ok: false, fallbackToChooser: true };
        } catch (err) {
          const msg = extractClerkErrorMessage(
            err,
            "Unable to complete social sign-in. Please try again or use your email.",
          );
          if (clerkConfigured) {
            return { ok: false, error: msg };
          }
          return { ok: false, error: msg, fallbackToChooser: true };
        }
      }

      // 2. Direct account selection from the in-app OAuthAccountChooserModal
      const nextEmail =
        account?.email?.trim().toLowerCase() || user.email || "chioma.okafor@uniben.edu";
      const nextName = account?.displayName?.trim() || user.displayName || "Chioma Okafor";
      const sanitizedEmailSlug = nextEmail.replace(/[^a-z0-9]/g, "_");
      const clerkUserId =
        provider === "oauth_google"
          ? `user_google_${sanitizedEmailSlug}`
          : `user_apple_${sanitizedEmailSlug}`;
      const { studentId: scopedStudentId } = deriveAccountIds(clerkUserId, nextEmail);
      const sessionJwt = `clerk_jwt_${clerkUserId}`;
      const isSameAccount = nextEmail.toLowerCase() === user.email.toLowerCase();
      const nextUsername =
        (isSameAccount && user.username) ||
        (suggestUsernames(nextName, nextEmail)[0] ?? "chioma_okafor");
      const nextAvatarUrl =
        account?.avatarUrl !== undefined
          ? account.avatarUrl
          : isSameAccount
            ? user.avatarUrl
            : null;
      const shouldCompleteOnboarding = account?.completeOnboarding ?? true;

      const nextUser: AuthUser = {
        ...user,
        studentId: scopedStudentId,
        clerkUserId,
        email: nextEmail,
        displayName: nextName,
        username: nextUsername,
        avatarUrl: nextAvatarUrl,
        initials: computeInitials(nextName),
      };
      setUser(nextUser);
      setIsSignedIn(true);
      setHasCompletedOnboarding(shouldCompleteOnboarding);
      await persistSession(nextUser, true, shouldCompleteOnboarding, sessionJwt);
      return { ok: true };
    },
    [clerkSdk, hasCompletedOnboarding, persistSession, user],
  );

  const resetPassword = useCallback(
    async (email: string): Promise<AuthActionResult> => {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes("@")) {
        return { ok: false, error: "Enter the email on your account." };
      }
      if (clerkSdk?.signIn) {
        try {
          await clerkSdk.signIn.create({
            strategy: "reset_password_email_code",
            identifier: cleanEmail,
          });
          return { ok: true };
        } catch (err) {
          const msg = extractClerkErrorMessage(err, "Could not send password reset email.");
          if (!msg.toLowerCase().includes("network") && !msg.toLowerCase().includes("fetch")) {
            return { ok: false, error: msg };
          }
        }
      }
      return { ok: true };
    },
    [clerkSdk],
  );

  const completeOnboarding = useCallback(async () => {
    const activeUser = latestUserRef.current;
    setIsSignedIn(true);
    setHasCompletedOnboarding(true);
    await persistSession(activeUser, true, true);
    trackEvent("onboarding_completed", {
      institution: activeUser.institution || "unknown",
      is_minor: Boolean(memoryStore.student.isMinor),
    });
  }, [persistSession]);

  const updateProfile = useCallback(
    async (input: {
      displayName?: string;
      username?: string;
      avatarUrl?: string | null;
      email?: string;
      institution?: string;
      dateOfBirth?: string;
    }) => {
      const current = latestUserRef.current;
      const cleanName =
        input.displayName !== undefined
          ? input.displayName.trim() || current.displayName
          : current.displayName;
      const cleanEmail =
        input.email !== undefined ? input.email.trim() || current.email : current.email;
      const cleanUsername =
        input.username !== undefined
          ? normalizeUsername(input.username) || current.username
          : current.username || (suggestUsernames(cleanName, cleanEmail)[0] ?? "");
      const cleanAvatar = input.avatarUrl !== undefined ? input.avatarUrl : current.avatarUrl;
      const cleanInst =
        input.institution !== undefined
          ? input.institution.trim() || current.institution
          : current.institution;
      const cleanDob =
        input.dateOfBirth !== undefined
          ? input.dateOfBirth.trim() || current.dateOfBirth
          : current.dateOfBirth;
      const { studentId: scopedStudentId } = deriveAccountIds(
        current.clerkUserId,
        cleanEmail,
        cleanUsername,
      );

      const nextUser: AuthUser = {
        ...current,
        studentId: scopedStudentId,
        displayName: cleanName,
        username: cleanUsername,
        avatarUrl: cleanAvatar,
        email: cleanEmail,
        institution: cleanInst,
        dateOfBirth: cleanDob,
        initials: computeInitials(cleanName || cleanUsername),
      };
      setUser(nextUser);
      await persistSession(nextUser, isSignedIn, hasCompletedOnboarding);
    },
    [hasCompletedOnboarding, isSignedIn, persistSession, setUser],
  );

  const signOut = useCallback(async () => {
    trackEvent("auth_signed_out");
    resetAnalyticsIdentity();
    lastSyncedClerkUserIdRef.current = null;
    setIsSignedIn(false);
    setHasCompletedOnboarding(false);
    setUser(DEFAULT_USER);
    await clearAnonymousTimetableStore();
    void queryClient.invalidateQueries({ queryKey: ["timetable"] });

    if (clerkSdk?.signOut) {
      try {
        await clerkSdk.signOut();
      } catch {
        // Proceed with local sign out
      }
    }
    await platformStorage.removeItem(CLERK_JWT_STORAGE_KEY);
    await platformStorage.setItem(
      AUTH_SESSION_STORAGE_KEY,
      JSON.stringify({ user: DEFAULT_USER, isSignedIn: false, hasCompletedOnboarding: false }),
    );
  }, [clerkSdk, queryClient]);

  const isLoaded = isHydrated;

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoaded,
      isSignedIn,
      hasCompletedOnboarding,
      isClerkConfigured: clerkConfigured,
      getToken,
      signInWithEmail,
      signUpWithEmail,
      verifyEmailCode,
      signInWithOAuth,
      resetPassword,
      completeOnboarding,
      updateProfile,
      signOut,
    }),
    [
      clerkConfigured,
      completeOnboarding,
      getToken,
      hasCompletedOnboarding,
      isLoaded,
      isSignedIn,
      resetPassword,
      signInWithEmail,
      signInWithOAuth,
      signOut,
      signUpWithEmail,
      updateProfile,
      user,
      verifyEmailCode,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function ClerkHookConnector({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, getToken, signOut } = useClerkAuth();
  const { user: clerkUser } = useClerkUser();
  const { signIn, setActive: setSignInActive } = useClerkSignIn();
  const { signUp, setActive: setSignUpActive } = useClerkSignUp();
  const { startSSOFlow } = useClerkSSO();

  const sdk = useMemo<ClerkBridgeSdk>(
    () => ({
      isLoaded: Boolean(isLoaded),
      isSignedIn: Boolean(isSignedIn),
      clerkUser: clerkUser
        ? {
            id: clerkUser.id,
            fullName: clerkUser.fullName,
            firstName: clerkUser.firstName,
            lastName: clerkUser.lastName,
            username: clerkUser.username,
            primaryEmailAddress: clerkUser.primaryEmailAddress?.emailAddress ?? null,
            imageUrl: clerkUser.imageUrl ?? null,
          }
        : null,
      getToken: () => getToken(),
      signOut: () => signOut(),
      signIn,
      setSignInActive,
      signUp,
      setSignUpActive,
      startSSOFlow,
    }),
    [
      clerkUser,
      getToken,
      isLoaded,
      isSignedIn,
      setSignInActive,
      setSignUpActive,
      signIn,
      signOut,
      signUp,
      startSSOFlow,
    ],
  );

  return <InnerAuthCore clerkSdk={sdk}>{children}</InnerAuthCore>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const publishableKey = getClerkPublishableKey();
  if (isClerkKeyConfigured() && Platform.OS !== "web") {
    return (
      <ClerkProvider publishableKey={publishableKey} tokenCache={clerkTokenCache}>
        <ClerkHookConnector>{children}</ClerkHookConnector>
      </ClerkProvider>
    );
  }
  return <InnerAuthCore clerkSdk={null}>{children}</InnerAuthCore>;
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
