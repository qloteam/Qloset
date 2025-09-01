const RAW = (process.env.NEXT_PUBLIC_API_BASE ?? '').trim();
export const API_BASE = RAW.replace(/^['"]|['"]$/g, '').replace(/\/+$/,'');


function joinUrl(base: string, path: string) {
  const p = path.startsWith('/') ? path : `/${path}`;
  // URL(base + '/') ensures correct joining even if base has no trailing slash
  return new URL(p, `${base}/`).toString();
}

async function http<T>(path: string, init?: RequestInit): Promise<T> {
    const url = joinUrl(API_BASE, path);
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    cache: 'no-store',
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export type Variant = { id?: string; size: string; sku: string; stockQty: number };
export type Product = {
  id: string; title: string; slug: string; description?: string;
  brand?: string; color?: string; priceMrp: number; priceSale: number;
  images: string[]; active: boolean; variants: Variant[];
};

export async function listProducts(): Promise<Product[]> {
  return http<Product[]>('/products');
}

export async function getProduct(id: string): Promise<Product> {
  return http<Product>(`/admin/products/${id}`);
}

export async function createProduct(data: Omit<Product, 'id'>) {
  return http<Product>('/admin/products', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateProduct(id: string, data: Omit<Product, 'id'>) {
  return http<Product>(`/admin/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function deleteProduct(id: string) {
  return http<{ ok: true }>(`/admin/products/${id}`, { method: 'DELETE' });
}
