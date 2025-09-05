// src/db/cart.ts
import { supabase } from "../lib/supabaseClient";
import type { CartItem } from "../state/CartContext";

/** Fetch the user's saved cart items from Supabase. */
export async function fetchCart(userId: string): Promise<CartItem[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("carts")
    .select("items")
    .eq("user_id", userId)
    .single();
  if (error && (error as any).code !== "PGRST116") {
    console.warn("fetchCart error", error);
    return [];
  }
  return (data?.items ?? []) as CartItem[];
}

/** Upsert the user's cart into Supabase. */
/** Upsert the user's cart into Supabase. */
export async function saveCart(userId: string, items: CartItem[]): Promise<void> {
  if (!supabase) return;

  const payload = { user_id: userId, items };

  const { error } = await supabase
    .from("carts")
    .upsert(payload, { onConflict: "user_id" });

  if (error) {
    console.warn("saveCart error", error);
  }
}
