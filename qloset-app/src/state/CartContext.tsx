import * as React from 'react';
import type { Product, Variant } from '../types';

export type CartItem = { productId: string; title: string; price: number; variantId: string; size: string; qty: number; };
type CartState = { items: CartItem[]; add: (p: Product, v: Variant, qty?: number) => void; clear: () => void; total: number; count: number; };

const Ctx = React.createContext<CartState | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>([]);
  const add = (p: Product, v: Variant, qty = 1) => {
    setItems(prev => {
      const key = `${p.id}:${v.id}`;
      const i = prev.findIndex(x => `${x.productId}:${x.variantId}` === key);
      if (i >= 0) { const copy = [...prev]; copy[i] = { ...copy[i], qty: copy[i].qty + qty }; return copy; }
      return [...prev, { productId: p.id, title: p.title, price: p.priceSale, variantId: v.id, size: v.size, qty }];
    });
  };
  const clear = () => setItems([]);
  const total = items.reduce((s, it) => s + it.price * it.qty, 0);
  const count = items.reduce((s, it) => s + it.qty, 0);
  return <Ctx.Provider value={{ items, add, clear, total, count }}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
