// src/state/WishlistContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../contexts/AuthContext";
import { confirmSequential } from "@/utils/promptQueue";

export type WLItem = {
  id: string;
  title: string;
  priceSale: number;
  images?: string[];
};

type WishlistContextType = {
  wishlist: WLItem[];
  addToWishlist: (p: WLItem) => void;
  removeFromWishlist: (id: string) => void;
  hydrated: boolean; // ✅ screens can wait until hydrated
};

const Ctx = createContext<WishlistContextType | null>(null);

// New keys
const GUEST_KEY = "guest_wishlist";
const keyForUser = (userId: string) => `wishlist:${userId}`;

// Legacy key (was causing ghosts)
const LEGACY_KEY = "wishlist";

// Merge helper (unique by id)
function mergeUnique(a: WLItem[], b: WLItem[]) {
  const seen = new Set(a.map((x) => x.id));
  return [...a, ...b.filter((x) => !seen.has(x.id))];
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<WLItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // One-time migration: move legacy key into correct store and delete it
  const migrateLegacyInto = async (targetKey: string) => {
    try {
      const legacyRaw = await AsyncStorage.getItem(LEGACY_KEY);
      if (!legacyRaw) return;
      const legacyList: WLItem[] = JSON.parse(legacyRaw) ?? [];
      const existingRaw = await AsyncStorage.getItem(targetKey);
      const existing: WLItem[] = existingRaw ? JSON.parse(existingRaw) : [];
      const merged = mergeUnique(existing, legacyList);
      await AsyncStorage.setItem(targetKey, JSON.stringify(merged));
      await AsyncStorage.removeItem(LEGACY_KEY); // 🔥 remove ghosts forever
    } catch {
      // ignore
    }
  };

  // Hydrate on auth change
  useEffect(() => {
    let cancelled = false;

    (async () => {
      setHydrated(false);

      if (user) {
        const userKey = keyForUser(user.id);

        // Migrate any legacy data into the signed-in store
        await migrateLegacyInto(userKey);

        // Load signed-in wishlist
        const rawUser = await AsyncStorage.getItem(userKey);
        const userList: WLItem[] = rawUser ? JSON.parse(rawUser) : [];

        // If guest has items, offer merge — queued so it won't clash with the cart prompt
        const rawGuest = await AsyncStorage.getItem(GUEST_KEY);
        const guestList: WLItem[] = rawGuest ? JSON.parse(rawGuest) : [];

        if (!cancelled && guestList.length > 0) {
          const accepted = await confirmSequential({
            title: "Keep your likes?",
            message: `You liked ${guestList.length} ${
              guestList.length === 1 ? "item" : "items"
            } before signing in. Add ${
              guestList.length === 1 ? "it" : "them"
            } to your account wishlist?`,
            confirmText: "Add",
            cancelText: "Not now",
          });

          if (cancelled) return;

          if (accepted) {
            const merged = mergeUnique(userList, guestList);
            await AsyncStorage.setItem(userKey, JSON.stringify(merged));
            await AsyncStorage.removeItem(GUEST_KEY);
            if (!cancelled) {
              setWishlist(merged);
              setHydrated(true);
            }
          } else {
            await AsyncStorage.removeItem(GUEST_KEY);
            if (!cancelled) {
              setWishlist(userList);
              setHydrated(true);
            }
          }
          return; // ✅ handled the prompt path
        }

        // No guest items to merge
        if (!cancelled) {
          setWishlist(userList);
          setHydrated(true);
        }
        return;
      }

      // Guest path: migrate legacy into guest key
      await migrateLegacyInto(GUEST_KEY);

      const rawGuestOnly = await AsyncStorage.getItem(GUEST_KEY);
      const guestOnly: WLItem[] = rawGuestOnly ? JSON.parse(rawGuestOnly) : [];
      if (!cancelled) {
        setWishlist(guestOnly);
        setHydrated(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  // Persist on changes
  useEffect(() => {
    if (!hydrated) return; // wait until hydrated to avoid clobbering during boot

    const t = setTimeout(async () => {
      try {
        if (user) {
          await AsyncStorage.setItem(keyForUser(user.id), JSON.stringify(wishlist));
        } else {
          await AsyncStorage.setItem(GUEST_KEY, JSON.stringify(wishlist));
        }
      } catch {
        // ignore
      }
    }, 150);

    return () => clearTimeout(t);
  }, [wishlist, user, hydrated]);

  // On sign-out: reflect empty UI (signed-out state shows empty until user picks likes again)
  useEffect(() => {
    if (!user) {
      setWishlist([]);
      // Note: we do not delete per-user wishlist; it remains saved under wishlist:<id>
    }
  }, [user]);

  const addToWishlist = (p: WLItem) =>
    setWishlist((prev) => (prev.some((x) => x.id === p.id) ? prev : [...prev, p]));

  const removeFromWishlist = (id: string) =>
    setWishlist((prev) => prev.filter((x) => x.id !== id));

  const value = useMemo(
    () => ({ wishlist, addToWishlist, removeFromWishlist, hydrated }),
    [wishlist, hydrated]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWishlist() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
}
