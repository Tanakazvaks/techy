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

  return (
    <div className="min-h-screen">
      <header className="border-b border-techy-border">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-xl font-bold">Techy</div>
          <nav className="flex gap-6 items-center text-sm">
            <Link href="/dashboard" className="text-techy-text">Dashboard</Link>
            <Link href="/library" className="text-techy-muted hover:text-techy-text">Library</Link>
            <Link href="/settings" className="text-techy-muted hover:text-techy-text">Settings</Link>
            <button onClick={handleLogout} className="text-techy-muted hover:text-techy-text">
              Log out
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-1">
          Welcome back
        </h1>
        <p className="text-techy-muted text-sm mb-8">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>

        {daysUntilInterview !== null && daysUntilInterview <= 14 && daysUntilInterview >= 0 && (
          <div className="bg-amber-950/30 border border-amber-900 rounded-lg p-4 mb-6">
            <div className="font-medium mb-1">
              Your interview is in {daysUntilInterview} day{daysUntilInterview === 1 ? "" : "s"}
            </div>
            <div className="text-sm text-techy-muted">
              {daysUntilInterview <= 3
                ? "Final prep mode: focus on mock interviews and reviewing weak areas."
                : "Time to ramp up — push through your study plan and start taking mock interviews."}
            </div>
          </div>
        )}

        {/* Today's session card */}
        <div className="bg-techy-surface border border-techy-border rounded-lg p-6 mb-6">
          <div className="text-techy-muted text-sm mb-2">Today&apos;s session</div>
          <div className="text-xl font-medium mb-1">
            20 minutes — {data.weakAreas[0] ? data.weakAreas[0].replace("_", " ") : "SOC fundamentals"}
          </div>
          <p className="text-techy-muted text-sm mb-4">
            A lesson, 2-3 practice questions, and feedback.
          </p>
          <Link
            href="/session"
            className="inline-block px-6 py-2 bg-techy-accent text-white font-medium rounded-md hover:opacity-90 transition"
          >
            Start session
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-techy-surface border border-techy-border rounded-lg p-4">
            <div className="text-techy-muted text-sm mb-1">Readiness score</div>
            <div className="text-2xl font-bold">
              {data.readinessScore ?? "—"}
              {data.readinessScore !== null && (
                <span className="text-sm font-normal text-techy-muted ml-1">/100</span>
              )}
            </div>
            <div className="text-techy-muted text-xs mt-1">
              {data.readinessScore !== null ? scoreLabel(data.readinessScore) : "Take diagnostic"}
            </div>
          </div>

          <div className="bg-techy-surface border border-techy-border rounded-lg p-4">
            <div className="text-techy-muted text-sm mb-1">Day streak</div>
            <div className="text-2xl font-bold">{data.streak}</div>
            <div className="text-techy-muted text-xs mt-1">
              {data.streak === 0 ? "Start one today" : "Keep it going"}
            </div>
          </div>

          <div className="bg-techy-surface border border-techy-border rounded-lg p-4">
            <div className="text-techy-muted text-sm mb-1">Sessions complete</div>
            <div className="text-2xl font-bold">{data.sessionsCompleted}</div>
            <div className="text-techy-muted text-xs mt-1">
              {mockUnlocked ? "Mock interviews unlocked" : `${5 - data.sessionsCompleted} until mock unlocks`}
            </div>
          </div>
        </div>

        {/* Secondary actions */}
        <div className="grid md:grid-cols-2 gap-4">
          <Link
            href="/library"
            className="bg-techy-surface border border-techy-border rounded-lg p-4 hover:border-techy-accent transition"
          >
            <div className="font-medium mb-1">Browse questions</div>
            <div className="text-techy-muted text-sm">
              Practice on your own — pick by topic or difficulty.
            </div>
          </Link>
          <Link
            href={mockUnlocked ? "/mock" : "#"}
            className={`bg-techy-surface border border-techy-border rounded-lg p-4 ${
              mockUnlocked ? "hover:border-techy-accent" : "opacity-50 cursor-not-allowed"
            } transition`}
            onClick={(e) => {
              if (!mockUnlocked) e.preventDefault();
            }}
          >
            <div className="font-medium mb-1">
              Start a mock interview {mockUnlocked ? "" : "🔒"}
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
