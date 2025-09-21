// src/state/CartContext.tsx
import * as React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../contexts/AuthContext";
import { fetchCart, saveCart } from "../db/cart";
import { confirmSequential } from "@/utils/promptQueue"; 
import type { Product, Variant } from "../types";

export type CartItem = {
  productId: string;
  title: string;
  price: number;
  variantId: string;
  size: string;
  qty: number;
  images?: string[];   // 👈 added
  /** snapshot of available stock at the time of add (used to clamp setQty/increment) */
  variantStock?: number;
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

const GUEST_KEY = "guest_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = React.useState<CartItem[]>([]);

  const mergeDedup = (a: CartItem[], b: CartItem[]) => {
    const map = new Map<string, CartItem>();
    const push = (list: CartItem[]) => {
      list.forEach((it) => {
        const key = `${it.productId}:${it.variantId}`;
        const prev = map.get(key);
        if (prev) map.set(key, { ...prev, qty: prev.qty + it.qty });
        else map.set(key, it);
      });
    };
    push(a);
    push(b);
    return Array.from(map.values());
  };

  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      if (user) {
        const serverItems = await fetchCart(user.id);
        const rawGuest = await AsyncStorage.getItem(GUEST_KEY);
        const guestItems: CartItem[] = rawGuest ? JSON.parse(rawGuest) : [];

        if (!cancelled && guestItems.length > 0) {
          const accepted = await confirmSequential({
            title: "Keep items in your cart?",
            message: `You added ${guestItems.length} ${
              guestItems.length === 1 ? "item" : "items"
            } before signing in. Add ${
              guestItems.length === 1 ? "it" : "them"
            } to your account cart?`,
            confirmText: "Add",
            cancelText: "Not now",
          });

          if (cancelled) return;

          if (accepted) {
            const merged = mergeDedup(serverItems ?? [], guestItems);
            await saveCart(user.id, merged);
            await AsyncStorage.removeItem(GUEST_KEY);
            if (!cancelled) setItems(merged);
          } else {
            await AsyncStorage.removeItem(GUEST_KEY);
            if (!cancelled) setItems(serverItems ?? []);
          }
        } else {
          if (!cancelled) setItems(serverItems ?? []);
        }
        return;
      }

      const raw = await AsyncStorage.getItem(GUEST_KEY);
      const guestItems = raw ? JSON.parse(raw) : [];
      if (!cancelled) setItems(guestItems);
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  React.useEffect(() => {
    let t: ReturnType<typeof setTimeout> | null = null;

    const persist = async () => {
      if (user) {
        await saveCart(user.id, items);
      } else {
        await AsyncStorage.setItem(GUEST_KEY, JSON.stringify(items));
      }
    };

    t = setTimeout(persist, 250);
    return () => {
      if (t) clearTimeout(t);
    };
  }, [items, user]);

  React.useEffect(() => {
    if (!user) {
      (async () => {
        await AsyncStorage.removeItem(GUEST_KEY);
        setItems([]);
      })();
    }
  }, [user]);

  // --- Mutators with stock clamps ---
  const add = (p: Product, v: Variant, qty = 1) => {
    setItems((prev) => {
      const available = Number.isFinite((v as any)?.stockQty)
        ? Math.max(0, Number((v as any).stockQty))
        : Number.POSITIVE_INFINITY;

      const key = `${p.id}:${v.id}`;
      const i = prev.findIndex((x) => `${x.productId}:${x.variantId}` === key);

      if (i >= 0) {
        const nextQty = Math.min(prev[i].qty + qty, available);
        if (nextQty === prev[i].qty) return prev;
        const copy = [...prev];
        copy[i] = { ...copy[i], qty: nextQty, variantStock: available };
        return copy;
      }

      const startQty = Math.min(qty, available);
      if (startQty <= 0) return prev;

      return [
        ...prev,
        {
          productId: p.id,
          title: p.title,
          price:
            (p as any).priceSale ??
            (p as any).priceMrp ??
            (p as any).price ??
            0,
          variantId: v.id,
          size: (v as any).size ?? "",
          qty: startQty,
          images: (p as any).images ?? [],  // 👈 save product images here
          variantStock: available,
        },
      ];
    });
  };

  const remove = (productId: string, variantId: string) =>
    setItems((prev) =>
      prev.filter((x) => !(x.productId === productId && x.variantId === variantId))
    );

  const setQty = (productId: string, variantId: string, qty: number) =>
    setItems((prev) => {
      const copy = [...prev];
      const i = copy.findIndex((x) => x.productId === productId && x.variantId === variantId);
      if (i < 0) return prev;

      const available = Number.isFinite(copy[i].variantStock)
        ? Math.max(0, Number(copy[i].variantStock))
        : Number.POSITIVE_INFINITY;

      const clamped = Math.max(1, Math.min(Number(qty) || 1, available));
      if (clamped === copy[i].qty) return prev;

      copy[i] = { ...copy[i], qty: clamped };
      return copy;
    });

  const clear = () => setItems([]);

  const total = items.reduce((s, x) => s + x.price * x.qty, 0);
  const count = items.reduce((s, x) => s + x.qty, 0);

  const value: CartState = { items, add, remove, setQty, clear, total, count };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
