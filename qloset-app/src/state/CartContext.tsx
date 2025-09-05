import * as React from 'react';
import { useAuth } from "../contexts/AuthContext";
import { fetchCart, saveCart } from "../db/cart";
import type { Product, Variant } from '../types';

export type CartItem = { 
  productId: string; 
  title: string; 
  price: number; 
  variantId: string; 
  size: string; 
  qty: number; 
};

type CartState = {
  items: CartItem[];
  add: (p: Product, v: Variant, qty?: number) => void;
  remove: (productId: string, variantId: string) => void;
  setQty: (productId: string, variantId: string, qty: number) => void;
  clear: () => void;
  total: number;
  count: number;
};

const Ctx = React.createContext<CartState | null>(null);

// Merge helper
function mergeItems(a: CartItem[], b: CartItem[]): CartItem[] {
  const map = new Map<string, CartItem>();
  const apply = (list: CartItem[]) => {
    list.forEach(it => {
      const key = `${it.productId}:${it.variantId}`;
      const prev = map.get(key);
      if (prev) {
        map.set(key, { ...prev, qty: prev.qty + it.qty });
      } else {
        map.set(key, it);
      }
    });
  };
  apply(a); apply(b);
  return Array.from(map.values());
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = React.useState<CartItem[]>([]);
  const [loadedForUser, setLoadedForUser] = React.useState<string | null>(null);

  const add = (p: Product, v: Variant, qty = 1) => {
    setItems(prev => {
      const key = `${p.id}:${v.id}`;
      const i = prev.findIndex(x => `${x.productId}:${x.variantId}` === key);
      if (i >= 0) { 
        const copy = [...prev]; 
        copy[i] = { ...copy[i], qty: copy[i].qty + qty }; 
        return copy; 
      }
      return [...prev, { productId: p.id, title: p.title, price: p.priceSale, variantId: v.id, size: v.size, qty }];
    });
  };

  const remove = (productId: string, variantId: string) =>
    setItems(prev => prev.filter(x => !(x.productId === productId && x.variantId === variantId)));

  const setQty = (productId: string, variantId: string, qty: number) =>
    setItems(prev => prev.map(x => (x.productId === productId && x.variantId === variantId ? { ...x, qty } : x)));

  const clear = () => setItems([]);

  const total = items.reduce((s, it) => s + it.price * it.qty, 0);
  const count = items.reduce((s, it) => s + it.qty, 0);

  // Load + merge cart on sign-in
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user) { setLoadedForUser(null); return; }
      if (loadedForUser === user.id) return;

      const remote = await fetchCart(user.id);
      if (cancelled) return;

      setItems(local => {
        const merged = mergeItems(remote, local);
        saveCart(user.id, merged);
        return merged;
      });
      setLoadedForUser(user.id);
    })();
    return () => { cancelled = true; };
  }, [user, loadedForUser]);

  // Save whenever items change
  React.useEffect(() => {
    if (!user) return;
    const t = setTimeout(() => { saveCart(user.id, items); }, 400);
    return () => clearTimeout(t);
  }, [items, user]);

  const value: CartState = { items, add, remove, setQty, clear, total, count };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
