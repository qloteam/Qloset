// src/contexts/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  PropsWithChildren,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, hasSupabaseConfig } from '@/lib/supabaseClient';

type AuthState = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  notConfigured: boolean;
  // Auth actions
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

  const notConfigured = !hasSupabaseConfig;

  useEffect(() => {
    let isMounted = true;

    async function boot() {
      if (notConfigured) {
        // Don’t call Supabase if config is missing
        setLoading(false);
        return;
      }

      // 1) Hydrate any stored session
      const { data, error } = await supabase.auth.getSession();
      if (!isMounted) return;

      if (error) {
        setError(error.message);
      } else {
        setSession(data.session ?? null);
        setUser(data.session?.user ?? null);
      }

      setLoading(false);

      // 2) Keep in sync on any auth change (login/logout/token refresh)
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, newSession) => {
        setSession(newSession ?? null);
        setUser(newSession?.user ?? null);
      });

      return () => subscription.unsubscribe();
    }

    boot();
    return () => {
      isMounted = false;
    };
  }, [notConfigured]);

  // --- Actions ---
  const loginWithPassword = async (email: string, password: string) => {
    setError(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    setSession(data.session ?? null);
    setUser(data.user ?? null);
  };

  const loginWithGoogle = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) throw error;
  };

  const sendMagicLink = async (email: string) => {
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) throw error;
  };

  const logout = async () => {
    setError(null);
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
  };

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
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
