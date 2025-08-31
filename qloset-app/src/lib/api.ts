// qloset-app/src/lib/api.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE =
  (typeof process !== 'undefined' &&
    (process.env.EXPO_PUBLIC_API_BASE as string)) ||
  'https://qloset.onrender.com'; // update to your backend URL

// helper to attach JWT
async function withAuth(init: RequestInit = {}) {
  const token = await AsyncStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return { ...init, headers };
}

// ------------------- AUTH -------------------

export async function requestOtp(phone: string) {
  const res = await fetch(`${API_BASE}/auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  });
  if (!res.ok) throw new Error(`OTP request failed: ${res.status}`);
  return res.json();
}

export async function verifyOtp(phone: string, code: string) {
  const res = await fetch(`${API_BASE}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, code }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Verify failed: ${res.status}`);

  if (data.token) {
    await AsyncStorage.setItem('token', data.token);
  }
  return data;
}

// ------------------- PRODUCTS -------------------

export type Product = {
  id: string;
  title: string;
  priceMrp: number;
  priceSale: number;
  images: string[];
};

export async function listProducts(): Promise<Product[]> {
  const res = await fetch(`${API_BASE}/products`, await withAuth());
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Products error ${res.status}`);
  return data as Product[];
}

export async function getProduct(id: string): Promise<Product> {
  const res = await fetch(`${API_BASE}/products/${id}`, await withAuth());
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Product error ${res.status}`);
  return data as Product;
}
