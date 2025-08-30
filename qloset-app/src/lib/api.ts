import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
export const API_BASE ='https://qloset.onrender.com';


export type Variant = { id: string; size: string; sku: string; stockQty: number };
export type Product = {
  id: string;
  title: string;
  priceSale: number;
  images: string[];
  variants: Variant[];
};

export async function fetchProducts() {
  const url = `${API_BASE}/products`;
  console.log('Fetching:', url);          // ← helps confirm the URL in the Metro logs
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
export async function requestOtp(phone: string) {
  const res = await fetch(`${API_BASE}/auth/otp/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
export async function fetchProduct(id: string) {
  const res = await fetch(`${API_BASE}/products/${id}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function verifyOtp(phone: string, code: string) {
  const res = await fetch(`${API_BASE}/auth/otp/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, code })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json(); // { token: 'fake-jwt', user: { phone } } when code === '123456'
}
export async function api(path: string, init: RequestInit = {}) {
  const token = await AsyncStorage.getItem('token');
  const headers = { ...(init.headers || {}), 'Content-Type': 'application/json' } as any;
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
}
