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

// ---- Checkout helper (handles 409 race conditions) ----
export type CheckoutItem = { variantId: string; qty: number; price: number };
export type OrderResponse = { id?: string; orderId?: string; subtotal?: number };

export async function checkoutOrder(input: {
  addressId: string;
  items: CheckoutItem[];
  tbyb?: boolean;
  token?: string; // optional: pass explicitly; otherwise we'll try Supabase session
}): Promise<OrderResponse> {
  // Build headers and attach auth if available
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  let jwt = input.token;
  try {
    if (!jwt && hasSupabaseConfig && supabase) {
      const { data } = await supabase.auth.getSession();
      jwt = data.session?.access_token ?? undefined;
    }
  } catch {
    /* ignore */
  }
  if (jwt) headers['Authorization'] = `Bearer ${jwt}`;

  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      addressId: input.addressId,
      items: input.items,
      tbyb: !!input.tbyb,
    }),
  });

  if (res.status === 409) {
    const text = await res.text().catch(() => '');
    const err = new Error('Out of stock') as any;
    err.status = 409;
    err.body = text;
    throw err;
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const err = new Error(`HTTP ${res.status} ${res.statusText}`) as any;
    err.status = res.status;
    err.body = text;
    throw err;
  }

  return (await res.json()) as OrderResponse;
}

