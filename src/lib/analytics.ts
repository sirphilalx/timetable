import PostHog from "posthog-react-native";
import { Platform } from "react-native";
import { platformStorage } from "./storage";

const ANALYTICS_OPT_OUT_KEY = "tt_analytics_opt_out_v1";
const DEFAULT_POSTHOG_EU_HOST = "https://eu.i.posthog.com";

export type AnalyticsEventName =
  | "auth_signed_in"
  | "auth_signed_up"
  | "auth_signed_out"
  | "onboarding_step_completed"
  | "onboarding_completed"
  | "course_created"
  | "course_updated"
  | "course_deleted"
  | "class_rule_created"
  | "class_occurrence_updated"
  | "event_created"
  | "shared_class_created"
  | "shared_class_joined"
  | "shared_class_link_copied"
  | "shared_class_whatsapp_shared"
  | "attendance_checked_in"
  | "assignment_created"
  | "assignment_status_toggled"
  | "assignment_deleted"
  | "theme_changed"
  | "analytics_opt_out_changed";

export type AnalyticsProperties = Record<string, string | number | boolean | null>;

export interface AnalyticsStudentIdentity {
  id: string;
  email?: string;
  displayName?: string;
  username?: string;
  isUnder18?: boolean;
  parentConsentGranted?: boolean;
  hasCompletedOnboarding?: boolean;
  authProvider?: string;
}

let posthogClient: PostHog | null = null;
let isOptedOutMemory = false;
let initializedPromise: Promise<void> | null = null;

function sanitizeStorageKey(rawKey: string): string {
  const cleaned = rawKey.replace(/[^a-zA-Z0-9._-]/g, "_");
  return cleaned.length > 0 ? `ph_${cleaned}` : "ph_default";
}

const safePostHogStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await platformStorage.getItem(sanitizeStorageKey(key));
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await platformStorage.setItem(sanitizeStorageKey(key), value);
    } catch {
      // Ignore storage write errors on constrained devices
    }
  },
};

export function getPostHogApiKey(): string {
  return (process.env.EXPO_PUBLIC_POSTHOG_API_KEY ?? "").trim();
}

export function getPostHogHost(): string {
  return (
    (process.env.EXPO_PUBLIC_POSTHOG_HOST ?? DEFAULT_POSTHOG_EU_HOST).trim() ||
    DEFAULT_POSTHOG_EU_HOST
  );
}

export function isAnalyticsConfigured(): boolean {
  const key = getPostHogApiKey();
  return key.length > 0 && key !== "your-posthog-api-key" && key.startsWith("phc_");
}

function ensureClient(): PostHog | null {
  if (posthogClient) return posthogClient;
  if (!isAnalyticsConfigured()) return null;
  if (Platform.OS === "web" && typeof window === "undefined") {
    // Skip during static SSR pre-rendering (`npx expo export -p web`)
    return null;
  }

  try {
    posthogClient = new PostHog(getPostHogApiKey(), {
      host: getPostHogHost(),
      customStorage: safePostHogStorage,
      captureAppLifecycleEvents: true,
      enableSessionReplay: false,
      flushAt: 10,
      flushInterval: 10000,
    });
    return posthogClient;
  } catch {
    return null;
  }
}

export async function initAnalytics(): Promise<void> {
  if (initializedPromise) return initializedPromise;
  initializedPromise = (async () => {
    try {
      const storedOptOut = await platformStorage.getItem(ANALYTICS_OPT_OUT_KEY);
      isOptedOutMemory = storedOptOut === "true";
      const client = ensureClient();
      if (!client) return;
      if (isOptedOutMemory) {
        await client.optOut();
      } else {
        await client.optIn();
      }
    } catch {
      // Non-blocking initialization
    }
  })();
  return initializedPromise;
}

export async function getAnalyticsOptOut(): Promise<boolean> {
  try {
    const stored = await platformStorage.getItem(ANALYTICS_OPT_OUT_KEY);
    if (stored !== null) {
      isOptedOutMemory = stored === "true";
    }
    return isOptedOutMemory;
  } catch {
    return isOptedOutMemory;
  }
}

export async function setAnalyticsOptOut(optOut: boolean): Promise<void> {
  isOptedOutMemory = optOut;
  try {
    await platformStorage.setItem(ANALYTICS_OPT_OUT_KEY, optOut ? "true" : "false");
    const client = ensureClient();
    if (!client) return;
    if (optOut) {
      client.capture("analytics_opt_out_changed", { opted_out: true });
      await client.flush();
      await client.optOut();
    } else {
      await client.optIn();
      client.capture("analytics_opt_out_changed", { opted_out: false });
    }
  } catch {
    // Ignore storage/network errors
  }
}

export function normalizeRoutePath(pathname: string): string {
  if (!pathname || pathname === "/") return "/(tabs)";
  if (pathname.startsWith("/class/")) return "/class/[id]";
  if (pathname.startsWith("/course/")) return "/course/[id]";
  if (pathname.startsWith("/assignment/") && pathname !== "/assignment/add") {
    return "/assignment/[id]";
  }
  if (pathname.startsWith("/join/") && pathname !== "/join/scan") {
    return "/join/[code]";
  }
  if (pathname.startsWith("/consent/")) return "/consent/[token]";
  return pathname;
}

export function trackScreen(pathname: string, properties?: AnalyticsProperties): void {
  if (isOptedOutMemory) return;
  const client = ensureClient();
  if (!client) return;

  const normalized = normalizeRoutePath(pathname);
  try {
    void client.screen(normalized, {
      raw_path: pathname,
      route_template: normalized,
      platform: Platform.OS,
      ...properties,
    });
  } catch {
    // Non-blocking telemetry
  }
}

export function trackEvent(event: AnalyticsEventName, properties?: AnalyticsProperties): void {
  if (isOptedOutMemory) return;
  const client = ensureClient();
  if (!client) return;

  try {
    client.capture(event, {
      platform: Platform.OS,
      ...properties,
    });
  } catch {
    // Non-blocking telemetry
  }
}

export function identifyStudent(student: AnalyticsStudentIdentity): void {
  if (isOptedOutMemory || !student.id) return;
  const client = ensureClient();
  if (!client) return;

  const isUnapprovedMinor = Boolean(student.isUnder18 && !student.parentConsentGranted);

  try {
    // NDPA 2023 Compliance: Never transmit personal traits (email, name, username)
    // for under-18 students who have not yet received verified parental consent.
    const safeProperties: Record<string, string | boolean> = {
      is_under_18: Boolean(student.isUnder18),
      parent_consent_granted: Boolean(student.parentConsentGranted ?? !student.isUnder18),
      has_completed_onboarding: Boolean(student.hasCompletedOnboarding),
      auth_provider: student.authProvider ?? "email",
    };

    if (!isUnapprovedMinor) {
      if (student.email) safeProperties.email = student.email;
      if (student.displayName) safeProperties.name = student.displayName;
      if (student.username) safeProperties.username = student.username;
    }

    client.identify(student.id, safeProperties);
  } catch {
    // Non-blocking telemetry
  }
}

export function resetAnalyticsIdentity(): void {
  const client = ensureClient();
  if (!client) return;

  try {
    client.reset();
  } catch {
    // Non-blocking telemetry
  }
}
