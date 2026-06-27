"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-client";
import { scoreLabel } from "@/lib/scoring";

interface DashboardData {
  email: string;
  readinessScore: number | null;
  streak: number;
  sessionsCompleted: number;
  interviewDate: string | null;
  weakAreas: string[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      const [profile, score, sessions, diagnostic] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase
          .from("readiness_scores")
          .select("score")
          .eq("user_id", user.id)
          .order("calculated_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("sessions")
          .select("id")
          .eq("user_id", user.id)
          .not("completed_at", "is", null),
        supabase
          .from("diagnostics")
          .select("weak_areas")
          .eq("user_id", user.id)
          .not("completed_at", "is", null)
          .order("completed_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      setData({
        email: profile.data?.email || user.email || "",
        readinessScore: score.data?.score ?? null,
        streak: profile.data?.streak_count || 0,
        sessionsCompleted: sessions.data?.length || 0,
        interviewDate: profile.data?.interview_date || null,
        weakAreas: diagnostic.data?.weak_areas || [],
      });
      setLoading(false);
    }
    fetchData();
  }, [router]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-techy-muted">Loading dashboard...</div>
      </div>
    );
  }

  const mockUnlocked = data.sessionsCompleted >= 5;
  const daysUntilInterview = data.interviewDate
    ? Math.ceil(
        (new Date(data.interviewDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    : null;

  // Circular gauge math
  const score = data.readinessScore ?? 0;
  const circumference = 2 * Math.PI * 52;
  const offset = circumference - (score / 100) * circumference;

  // Gauge color based on score band
  const gaugeColor =
    score >= 75 ? "#34d399" : score >= 50 ? "#60a5fa" : score >= 25 ? "#fbbf24" : "#f87171";

  return (
    <div className="min-h-screen">
      <header className="border-b border-techy-border bg-techy-surface/40 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-xl font-bold tracking-tight">Techy</div>
          <nav className="flex gap-6 items-center text-sm">
            <Link href="/dashboard" className="text-techy-text">Dashboard</Link>
            <Link href="/library" className="text-techy-muted hover:text-techy-text transition">Library</Link>
            <Link href="/settings" className="text-techy-muted hover:text-techy-text transition">Settings</Link>
            <button onClick={handleLogout} className="text-techy-muted hover:text-techy-text transition">
              Log out
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-1">Welcome back</h1>
          <p className="text-techy-muted text-sm">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>

        {daysUntilInterview !== null && daysUntilInterview <= 14 && daysUntilInterview >= 0 && (
          <div className="bg-gradient-to-r from-amber-950/40 to-amber-900/20 border border-amber-800/50 rounded-lg p-4 mb-6 flex items-center gap-4">
            <div className="text-3xl">⏱</div>
            <div>
              <div className="font-medium mb-1">
                Your interview is in {daysUntilInterview} day{daysUntilInterview === 1 ? "" : "s"}
              </div>
              <div className="text-sm text-techy-muted">
                {daysUntilInterview <= 3
                  ? "Final prep mode: focus on mock interviews and reviewing weak areas."
                  : "Time to ramp up. Push through your study plan and start taking mock interviews."}
              </div>
            </div>
          </div>
        )}

        {/* Hero row: gauge + today's session */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {/* Readiness gauge */}
          <div className="bg-techy-surface border border-techy-border rounded-lg p-6 flex flex-col items-center justify-center">
            <div className="relative w-32 h-32 mb-3">
              <svg viewBox="0 0 120 120" className="transform -rotate-90 w-full h-full">
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="#1f2937"
                  strokeWidth="8"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke={gaugeColor}
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-3xl font-bold">
                  {data.readinessScore ?? "--"}
                </div>
                <div className="text-xs text-techy-muted">/ 100</div>
              </div>
            </div>
            <div className="text-sm text-techy-muted">Readiness score</div>
            <div className="text-xs text-techy-muted mt-1">
              {data.readinessScore !== null ? scoreLabel(data.readinessScore) : "Take diagnostic"}
            </div>
          </div>

          {/* Today's session (spans 2 cols) */}
          <div className="md:col-span-2 bg-gradient-to-br from-techy-accent/15 via-techy-surface to-techy-surface border border-techy-accent/30 rounded-lg p-6 shadow-glow">
            <div className="text-techy-accent text-xs uppercase tracking-wider mb-2 font-medium">Today&apos;s session</div>
            <div className="text-2xl font-bold mb-2 tracking-tight">
              20 minutes &middot; {data.weakAreas[0] ? data.weakAreas[0].replace("_", " ") : "SOC fundamentals"}
            </div>
            <p className="text-techy-muted text-sm mb-6">
              A lesson, 2-3 practice questions, and feedback.
            </p>
            <Link
              href="/session"
              className="inline-block px-6 py-3 bg-techy-accent hover:bg-techy-accentHover text-white font-medium rounded-md transition"
            >
              Start session →
            </Link>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="bg-techy-surface border border-techy-border rounded-lg p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-orange-500/15 flex items-center justify-center text-2xl">
              🔥
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold">{data.streak}</div>
              <div className="text-sm text-techy-muted">Day streak</div>
              <div className="text-xs text-techy-muted mt-0.5">
                {data.streak === 0 ? "Start one today" : "Keep it going"}
              </div>
            </div>
          </div>

          <div className="bg-techy-surface border border-techy-border rounded-lg p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-purple-500/15 flex items-center justify-center text-2xl">
              ✓
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold">{data.sessionsCompleted}</div>
              <div className="text-sm text-techy-muted">Sessions complete</div>
              <div className="text-xs text-techy-muted mt-0.5">
                {mockUnlocked ? "Mock interviews unlocked" : `${5 - data.sessionsCompleted} until mock unlocks`}
              </div>
            </div>
          </div>
        </div>

        {/* Secondary actions */}
        <div className="grid md:grid-cols-2 gap-4">
          <Link
            href="/library"
            className="group bg-techy-surface border border-techy-border rounded-lg p-5 hover:border-techy-accent hover:bg-techy-surfaceHover transition"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="text-xl">📚</div>
              <div className="font-medium group-hover:text-techy-accentHover transition">Browse questions</div>
            </div>
            <div className="text-techy-muted text-sm">
              Practice on your own. Pick by topic or difficulty.
            </div>
          </Link>
          <Link
            href={mockUnlocked ? "/mock" : "#"}
            className={`group bg-techy-surface border border-techy-border rounded-lg p-5 transition ${
              mockUnlocked ? "hover:border-techy-accent hover:bg-techy-surfaceHover" : "opacity-60 cursor-not-allowed"
            }`}
            onClick={(e) => {
              if (!mockUnlocked) e.preventDefault();
            }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="text-xl">{mockUnlocked ? "🎯" : "🔒"}</div>
              <div className={`font-medium transition ${mockUnlocked ? "group-hover:text-techy-accentHover" : ""}`}>
                Start a mock interview
              </div>
            </div>
            <div className="text-techy-muted text-sm">
              {mockUnlocked
                ? "30-minute simulated interview with end-of-session report."
                : `Complete ${5 - data.sessionsCompleted} more session${
                    5 - data.sessionsCompleted === 1 ? "" : "s"
                  } to unlock.`}
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}