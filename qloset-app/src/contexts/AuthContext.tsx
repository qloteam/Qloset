// src/contexts/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  PropsWithChildren,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, hasSupabaseConfig } from "@/lib/supabaseClient";
type AuthState = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  notConfigured: boolean;
  loginWithPassword: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  sendMagicLink: (email: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthCtx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const notConfigured = !hasSupabaseConfig || !supabase;

  useEffect(() => {
    let mounted = true;

    // If Supabase isn’t configured, don’t call it
    if (notConfigured) {
      setLoading(false);
      setUser(null);
      setSession(null);
      return;
    }

    (async () => {
      const { data, error } = await supabase!.auth.getSession();
      if (!mounted) return;
      if (error) setError(error.message);
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      setLoading(false);
    })();

    const { data: listener } = supabase!.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
    });

    return () => {
      mounted = false;
      // unsubscribe safely
      listener?.subscription?.unsubscribe?.();
    };
  }, [notConfigured]);

  // ---- Actions ----
  async function loginWithPassword(email: string, password: string) {
    if (notConfigured) throw new Error("Authentication not configured");
    setError(null);
    const { error } = await supabase!.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  }

  async function loginWithGoogle() {
    if (notConfigured) throw new Error("Authentication not configured");
    setError(null);
    const { error } = await supabase!.auth.signInWithOAuth({ provider: "google" });
    if (error) throw new Error(error.message);
  }

  async function sendMagicLink(email: string) {
    if (notConfigured) throw new Error("Authentication not configured");
    setError(null);
    const { error } = await supabase!.auth.signInWithOtp({ email });
    if (error) throw new Error(error.message);
  }

  async function logout() {
    if (notConfigured) return;
    setError(null);
    const { error } = await supabase!.auth.signOut();
    if (error) throw new Error(error.message);
  }

  const value = useMemo<AuthState>(
    () => ({
      user,
      session,
      loading,
      error,
      notConfigured,
      loginWithPassword,
      loginWithGoogle,
      sendMagicLink,
      logout,
    }),
    [user, session, loading, error, notConfigured]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
