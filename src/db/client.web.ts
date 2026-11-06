// Web export fallback: expo-sqlite native drivers are excluded from web builds.
// Web routes (parent approval form, link redirects) communicate directly via Supabase.
export const db = null as any;
export type Database = null;
