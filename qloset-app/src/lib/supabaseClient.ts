import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Read from EXPO_PUBLIC_* first; fall back to app.config.js "extra"
const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  (Constants.expoConfig?.extra?.supabaseUrl as string) ||
  (Constants.manifest?.extra as any)?.supabaseUrl ||
  '';

const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  (Constants.expoConfig?.extra?.supabaseAnonKey as string) ||
  (Constants.manifest?.extra as any)?.supabaseAnonKey ||
  '';

export const hasSupabaseConfig = !!(SUPABASE_URL && SUPABASE_ANON_KEY);

// Only create the client when configured to avoid the crash you saw
export const supabase = hasSupabaseConfig
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: AsyncStorage,            // Persist session in RN
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,        // No URL handling in RN
      },
    })
  : null;
  