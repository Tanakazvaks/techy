"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-client";
import Logo from "@/components/Logo";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [interviewTimeline, setInterviewTimeline] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user && interviewTimeline) {
      const date = computeInterviewDate(interviewTimeline);
      await supabase
        .from("profiles")
        .update({ interview_date: date })
        .eq("id", data.user.id);
    }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-techy-border bg-techy-surface/40 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/"><Logo /></Link>
          <Link href="/auth/login" className="text-sm text-techy-muted hover:text-techy-text transition">
            Log in
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="bg-techy-surface border border-techy-border rounded-lg p-8">
            <h1 className="text-2xl font-bold mb-2 tracking-tight">Create your account</h1>
            <p className="text-techy-muted text-sm mb-6">
              Save your progress and unlock your readiness report.
            </p>

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
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-techy-bg border border-techy-border rounded-md focus:outline-none focus:border-techy-accent transition"
                />
                <p className="text-xs text-techy-muted mt-1">At least 8 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  When&apos;s your interview? <span className="text-techy-muted">(optional)</span>
                </label>
                <select
                  value={interviewTimeline}
                  onChange={(e) => setInterviewTimeline(e.target.value)}
                  className="w-full px-3 py-2 bg-techy-bg border border-techy-border rounded-md focus:outline-none focus:border-techy-accent transition"
                >
                  <option value="">Not sure yet</option>
                  <option value="this_week">This week</option>
                  <option value="this_month">This month</option>
                  <option value="1_3_months">1-3 months</option>
                  <option value="no_timeline">No specific timeline</option>
                </select>
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
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>

            <p className="text-techy-muted text-sm mt-6 text-center">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-techy-accent hover:text-techy-accentHover transition">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function computeInterviewDate(timeline: string): string | null {
  const today = new Date();
  switch (timeline) {
    case "this_week":
      today.setDate(today.getDate() + 5);
      return today.toISOString().split("T")[0];
    case "this_month":
      today.setDate(today.getDate() + 21);
      return today.toISOString().split("T")[0];
    case "1_3_months":
      today.setDate(today.getDate() + 60);
      return today.toISOString().split("T")[0];
    default:
      return null;
  }
}