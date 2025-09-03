// src/lib/api.ts
import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from "axios";
import Constants from "expo-constants";
import { supabase, hasSupabaseConfig } from "@/lib/supabaseClient";

/**
 * Resolve API base for Expo:
 * - EXPO_PUBLIC_API_BASE from .env
 * - app.config.js -> extra.apiBase
 * - NEXT_PUBLIC_API_BASE (web fallback)
 * - app.json/manifest extra.apiBase (older Expo)
 * - final fallback to your Render URL
 */
export const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE ||
  (Constants.expoConfig?.extra?.apiBase as string) ||
  process.env.NEXT_PUBLIC_API_BASE ||
  (Constants.manifest?.extra as any)?.apiBase ||
  "https://qloset.onrender.com";


// Axios instance for your backend
export const api = axios.create({ baseURL: API_BASE });

// Attach Supabase JWT (no TS errors)
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  if (hasSupabaseConfig && supabase) {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (token) {
      config.headers = config.headers ?? new AxiosHeaders();
      (config.headers as AxiosHeaders).set("Authorization", `Bearer ${token}`);
    }
  }
  return config;
});

/** ---- Minimal fetch helpers (shape-agnostic) ---- */

export type Product = Record<string, any>;

export async function listProducts(): Promise<Product[]> {
  const res = await fetch(`${API_BASE}/products`);
  const text = await res.text();
  if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
  try { return JSON.parse(text) as Product[]; } catch { return [] as Product[]; }
}

export async function getProduct(id: string): Promise<Product> {
  const res = await fetch(`${API_BASE}/products/${id}`);
  const text = await res.text();
  if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
  try { return JSON.parse(text) as Product; } catch { return {} as Product; }
}
