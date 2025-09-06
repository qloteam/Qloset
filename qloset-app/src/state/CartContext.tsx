// src/state/CartContext.tsx
import * as React from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../contexts/AuthContext";
import { fetchCart, saveCart } from "../db/cart";
import type { Product, Variant } from "../types";

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

const GUEST_KEY = "guest_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = React.useState<CartItem[]>([]);

  // Helper: dedupe by product+variant (sum qtys)
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

  // Load cart on mount / when auth changes
  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      // If signed in: fetch server cart
      if (user) {
        const serverItems = await fetchCart(user.id);
        const rawGuest = await AsyncStorage.getItem(GUEST_KEY);
        const guestItems: CartItem[] = rawGuest ? JSON.parse(rawGuest) : [];

        // If there are guest items, ask to merge into signed-in cart
        if (guestItems.length > 0) {
          Alert.alert(
            "Keep items in your cart?",
            `You added ${guestItems.length} ${guestItems.length === 1 ? "item" : "items"} before signing in. Do you want to add ${guestItems.length === 1 ? "it" : "them"} to your account cart?`,
            [
              {
                text: "No",
                style: "cancel",
                onPress: async () => {
                  await AsyncStorage.removeItem(GUEST_KEY);
                  if (!cancelled) setItems(serverItems ?? []);
                },
              },
              {
                text: "Yes",
                onPress: async () => {
                  const merged = mergeDedup(serverItems ?? [], guestItems);
                  await saveCart(user.id, merged);
                  await AsyncStorage.removeItem(GUEST_KEY);
                  if (!cancelled) setItems(merged);
                },
              },
            ]
          );
        } else {
          if (!cancelled) setItems(serverItems ?? []);
        }
        return;
      }

      // Not signed in: load guest cart
      const raw = await AsyncStorage.getItem(GUEST_KEY);
      const guestItems = raw ? JSON.parse(raw) : [];
      if (!cancelled) setItems(guestItems);
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  // Persist whenever items change
React.useEffect(() => {
  // ✅ RN-safe typing (instead of NodeJS.Timeout)
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

  // If user signs out, empty the in-memory cart and guest storage
  React.useEffect(() => {
    // when user becomes null after being logged in:
    if (!user) {
      (async () => {
        await AsyncStorage.removeItem(GUEST_KEY);
        setItems([]); // cart should be empty for signed-out state
      })();
    }
  }, [user]);

  // Mutators
  const add = (p: Product, v: Variant, qty = 1) => {
    setItems((prev) => {
      const key = `${p.id}:${v.id}`;
      const i = prev.findIndex((x) => `${x.productId}:${x.variantId}` === key);
      if (i >= 0) {
        const copy = [...prev];
        copy[i] = { ...copy[i], qty: copy[i].qty + qty };
        return copy;
      }
      return [
        ...prev,
        {
          productId: p.id,
          title: p.title,
          price: p.priceSale,
          variantId: v.id,
          size: v.size,
          qty,
        },
      ];
    });
  };

  const remove = (productId: string, variantId: string) =>
    setItems((prev) => prev.filter((x) => !(x.productId === productId && x.variantId === variantId)));

  const setQty = (productId: string, variantId: string, qty: number) =>
    setItems((prev) =>
      prev.map((x) => (x.productId === productId && x.variantId === variantId ? { ...x, qty } : x))
    );

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
