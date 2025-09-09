// qloset-admin/src/lib/api.ts

// Clean base from env (quotes/spaces removed, no trailing slash)
const RAW = (process.env.NEXT_PUBLIC_API_BASE ?? '').trim();
export const API_BASE = RAW.replace(/^['"]|['"]$/g, '').replace(/\/+$/, '');

/** Resolve the base URL safely */
function resolveBase() {
  if (API_BASE) return API_BASE;
  if (typeof window !== 'undefined') return window.location.origin; // client fallback for dev
  throw new Error(
    'API base URL is not set. Add NEXT_PUBLIC_API_BASE in qloset-admin/.env.local (e.g. http://localhost:3001).'
  );
}

/** Join path with base; allow absolute paths/URLs to pass through */
function joinUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path; // already absolute URL
  const p = path.startsWith('/') ? path : `/${path}`;
  return new URL(p, resolveBase() + '/').toString();
}

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const url = joinUrl(path);
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    cache: 'no-store',
    credentials: 'include',
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText} for ${url} :: ${text}`); // helpful error on server
  }
  if (res.status === 204) return undefined as any;
  return (await res.json()) as T;
}

/* ===================== Types ===================== */
export type Variant = { id: string; size: string; sku: string; stockQty: number };
export type Product = {
  id: string;
  title: string;
  slug?: string;
  description?: string | null;
  brand?: string | null;
  color?: string | null;
  priceMrp: number;
  priceSale: number;
  images?: string[];
  active?: boolean;
  createdAt?: string;
  stock?: number; // NEW column
  variants?: Variant[];
};

/* ===================== Products API ===================== */

export async function listProducts(): Promise<Product[]> {
  return http<Product[]>('/admin/products');
}

export async function getProduct(id: string): Promise<Product> {
  return http<Product>(`/admin/products/${id}`);
}

export async function createProduct(data: Omit<Product, 'id'>) {
  return http<Product>('/admin/products', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateProduct(id: string, data: any) {
  return http(`/admin/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}


export async function deleteProduct(id: string) {
  return http<{ ok: true }>(`/admin/products/${id}`, { method: 'DELETE' });
}

/* ===== Generic helpers some UI files expect (keeps existing imports working) ===== */

export const put = async <T = any>(path: string, data: unknown) => {
  try {
    // first try PATCH (partial update)
    return await http<T>(path, { method: 'PATCH', body: JSON.stringify(data) });
  } catch (e: any) {
    // retry with PUT if server doesn't allow PATCH
    return await http<T>(path, { method: 'PUT', body: JSON.stringify(data) });
  }
};

export const del = <T = any>(path: string) =>
  http<T>(path, { method: 'DELETE' });

/* ===== Optional: stock-specific helpers (used by Stock UI if you add it) ===== */

export const setProductStock = (id: string, stock: number) =>
  updateProduct(id, { stock });

export const adjustProductStock = async (id: string, delta: number) => {
  const p = await getProduct(id);
  const next = Math.max(0, (p.stock ?? 0) + delta);
  return updateProduct(id, { stock: next });
};
