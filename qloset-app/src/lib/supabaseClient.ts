// src/lib/supabaseClient.ts
import 'react-native-url-polyfill/auto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const hasSupabaseConfig = Boolean(url && key);

// NOTE: on React Native you MUST tell Supabase how to store the session.
export const supabase: SupabaseClient = createClient(
  url || 'https://example.invalid',
  key || 'anon.invalid',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      // RN/Expo does not have URL sessions – this avoids a warning:
      detectSessionInUrl: false,
      // Use AsyncStorage to persist the session
      storage: {
        getItem: (k) => AsyncStorage.getItem(k),
        setItem: (k, v) => AsyncStorage.setItem(k, v),
        removeItem: (k) => AsyncStorage.removeItem(k),
      },
    },
  }
);
