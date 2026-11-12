import { createClient } from "@supabase/supabase-js";
import { platformStorage } from "./storage";

const DEFAULT_SUPABASE_URL = "https://ejkzzubuqyvtbhxocbff.supabase.co";
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_iffdrJiud5Rt2in-CvdZmg_vg9bD18W";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  DEFAULT_SUPABASE_PUBLISHABLE_KEY;

export function isSupabaseConfigured(): boolean {
  return (
    Boolean(supabaseUrl) &&
    supabaseUrl !== "https://your-project-id.supabase.co" &&
    supabaseUrl !== "https://placeholder-project.supabase.co" &&
    Boolean(supabaseAnonKey) &&
    supabaseAnonKey !== "your-anon-key-here" &&
    supabaseAnonKey !== "placeholder-anon-key"
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
