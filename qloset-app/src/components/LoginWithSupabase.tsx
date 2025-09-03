"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginWithSupabase() {
  const { loginWithPassword, loginWithGoogle, sendMagicLink, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [magicSent, setMagicSent] = useState(false);

  async function onPasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setLocalError(null);
    if (!email || !password) return setLocalError("Please enter email and password.");
    setBusy(true);
    try {
      await loginWithPassword(email.trim(), password);
      // Profile will auto-switch to logged-in view
    } catch (e: any) {
      setLocalError(e?.message ?? "Login failed.");
    } finally {
      setBusy(false);
    }
  }

  async function onGoogle() {
    try {
      setBusy(true);
      await loginWithGoogle();
      // redirect happens automatically
    } catch (e: any) {
      setLocalError(e?.message ?? "Google sign-in failed.");
      setBusy(false);
    }
  }

  async function onMagicLink() {
    if (!email) return setLocalError("Enter your email first.");
    setBusy(true);
    try {
      await sendMagicLink(email.trim());
      setMagicSent(true);
    } catch (e: any) {
      setLocalError(e?.message ?? "Could not send magic link.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-4 rounded-2xl border p-6 shadow-sm">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="text-sm text-gray-500">Use password, Google, or a magic link.</p>
      </div>

      {(localError || error) && (
        <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {localError || error}
        </div>
      )}

      <form onSubmit={onPasswordLogin} className="space-y-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Email</span>
          <input
            type="email"
            className="w-full rounded-xl border p-3 outline-none focus:ring"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Password</span>
          <input
            type="password"
            className="w-full rounded-xl border p-3 outline-none focus:ring"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </label>

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-black p-3 text-white disabled:opacity-60"
        >
          {busy ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className="flex items-center gap-3 text-xs text-gray-400">
        <div className="h-px flex-1 bg-gray-200" />
        OR
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <button
        onClick={onGoogle}
        disabled={busy}
        className="w-full rounded-xl border p-3 disabled:opacity-60"
      >
        Continue with Google
      </button>

      <button
        onClick={onMagicLink}
        disabled={busy}
        className="w-full rounded-xl border p-3 disabled:opacity-60"
      >
        Send me a magic link
      </button>

      {magicSent && (
        <p className="text-center text-sm text-green-700">
          Magic link sent! Check your email.
        </p>
      )}
    </div>
  );
}
