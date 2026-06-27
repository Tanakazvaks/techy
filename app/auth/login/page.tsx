"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-client";
import Logo from "@/components/Logo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-techy-border bg-techy-surface/40 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/"><Logo /></Link>
          <Link href="/auth/signup" className="text-sm text-techy-muted hover:text-techy-text transition">
            Sign up
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="bg-techy-surface border border-techy-border rounded-lg p-8">
            <h1 className="text-2xl font-bold mb-6 tracking-tight">Log in</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-techy-bg border border-techy-border rounded-md focus:outline-none focus:border-techy-accent transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-techy-bg border border-techy-border rounded-md focus:outline-none focus:border-techy-accent transition"
                />
              </div>
              {error && (
                <div className="text-techy-danger text-sm bg-red-950/30 border border-red-900 rounded-md p-3">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-techy-accent hover:bg-techy-accentHover rounded-md text-white font-medium transition disabled:opacity-50"
              >
                {loading ? "Logging in..." : "Log in"}
              </button>
            </form>
            <p className="text-techy-muted text-sm mt-6 text-center">
              Don&apos;t have an account?{" "}
              <Link href="/auth/signup" className="text-techy-accent hover:text-techy-accentHover transition">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}