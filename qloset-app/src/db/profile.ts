import { supabase } from "../lib/supabaseClient";

export type Profile = {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
};

export async function fetchProfile(userId: string): Promise<Profile | null> {
  if (!supabase) return null; // ← guard

  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, phone, email")
    .eq("id", userId)
    .single();

  if (error && (error as any).code !== "PGRST116") {
    console.warn("fetchProfile error", error);
    return null;
  }
  return (data as Profile) ?? null;
}

export async function saveProfile(
  userId: string,
  values: Partial<Profile>
): Promise<void> {
  if (!supabase) return; // ← guard

  const payload = { id: userId, ...values };
  const { error } = await supabase
    .from("profiles")
    .upsert(payload, { onConflict: "id" });

  if (error) console.warn("saveProfile error", error);
}
