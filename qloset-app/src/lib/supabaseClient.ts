import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const hasSupabaseConfig = Boolean(url && key);

// Always create a client, even if config is missing.
// If config is missing, it points to a dummy URL/key.
// Your screens still check `hasSupabaseConfig` before using it.
const fallbackUrl = url || "https://example.invalid";
const fallbackKey = key || "anon.invalid";

export const supabase: SupabaseClient = createClient(fallbackUrl, fallbackKey);
