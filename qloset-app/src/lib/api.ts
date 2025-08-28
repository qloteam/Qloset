import { Platform } from 'react-native';

export const API_BASE ='http://192.168.0.6:3000';


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

