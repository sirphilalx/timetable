import { createClient } from "@supabase/supabase-js";
import { platformStorage } from "./storage";

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "placeholder-anon-key";

export function isSupabaseConfigured(): boolean {
  const activeKey =
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.EXPO_PUBLIC_SUPABASE_KEY ||
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return (
    Boolean(process.env.EXPO_PUBLIC_SUPABASE_URL) &&
    process.env.EXPO_PUBLIC_SUPABASE_URL !== "https://your-project-id.supabase.co" &&
    process.env.EXPO_PUBLIC_SUPABASE_URL !== "https://placeholder-project.supabase.co" &&
    Boolean(activeKey) &&
    activeKey !== "your-anon-key-here" &&
    activeKey !== "placeholder-anon-key"
  );
}

type ClerkTokenProvider = () => Promise<string | null>;

let activeClerkTokenProvider: ClerkTokenProvider | null = null;

export function registerClerkTokenProvider(provider: ClerkTokenProvider | null): void {
  activeClerkTokenProvider = provider;
}

export async function getActiveClerkToken(): Promise<string | null> {
  if (!activeClerkTokenProvider) return null;
  try {
    return await activeClerkTokenProvider();
  } catch {
    return null;
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: platformStorage,
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
  accessToken: async () => {
    return await getActiveClerkToken();
  },
});
