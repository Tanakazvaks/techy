"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-client";
import { interpretScore, scoreLabel } from "@/lib/scoring";
import { TOPIC_NAMES } from "@/lib/questions";
import Logo from "@/components/Logo";

interface DiagnosticResult {
  overall_score: number;
  breakdown: Record<string, number>;
  weak_areas: string[];
}

function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const diagnosticId = searchParams.get("id");
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResult() {
      if (!diagnosticId) {
        router.push("/dashboard");
        return;
      }
      const supabase = createClient();
      const { data, error } = await supabase
        .from("diagnostics")
        .select("overall_score, breakdown, weak_areas")
        .eq("id", diagnosticId)
        .single();
      if (error || !data) {
        console.error(error);
        router.push("/dashboard");
        return;
      }
      setResult(data as DiagnosticResult);
      setLoading(false);
    }
    fetchResult();
  }, [diagnosticId, router]);

  if (loading || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-techy-muted">Loading your results...</div>
      </div>
    );
  }

  const breakdown = result.breakdown || {};
  const topics = Object.keys(breakdown);

  // Gauge math for the overall score
  const score = result.overall_score;
  const circumference = 2 * Math.PI * 52;
  const offset = circumference - (score / 100) * circumference;
  const gaugeColor =
    score >= 75 ? "#34d399" : score >= 50 ? "#60a5fa" : score >= 25 ? "#fbbf24" : "#f87171";

  return (
    <div className="min-h-screen">
      <header className="border-b border-techy-border bg-techy-surface/40 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/"><Logo /></Link>
          <div className="text-techy-muted uppercase text-xs tracking-wider">Diagnostic results</div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="text-techy-muted text-sm mb-4">Your readiness score</div>
          <div className="relative w-40 h-40 mx-auto mb-4">
            <svg viewBox="0 0 120 120" className="transform -rotate-90 w-full h-full">
              <circle cx="60" cy="60" r="52" fill="none" stroke="#1f2937" strokeWidth="8" />
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
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-4xl font-bold">{result.overall_score}</div>
              <div className="text-xs text-techy-muted">/ 100</div>
            </div>
          </div>
          <div className="text-xl text-techy-text mb-1 tracking-tight">{scoreLabel(result.overall_score)}</div>
          <p className="text-techy-muted max-w-md mx-auto">
            {interpretScore(result.overall_score)}
          </p>
        </div>

        <div className="bg-techy-surface border border-techy-border rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium mb-4">Breakdown by area</h2>
          <div className="space-y-3">
            {topics.map((topic) => (
              <div key={topic}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{TOPIC_NAMES[topic] || topic}</span>
                  <span className="text-techy-muted">{breakdown[topic]}/100</span>
                </div>
                <div className="h-2 bg-techy-bg rounded-full overflow-hidden">
                  <div
                    className="h-full bg-techy-accent rounded-full transition-all duration-500"
                    style={{ width: `${breakdown[topic]}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {result.weak_areas && result.weak_areas.length > 0 && (
          <div className="bg-techy-surface border border-techy-border rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium mb-4">Top 3 areas to focus on</h2>
            <ul className="space-y-2">
              {result.weak_areas.slice(0, 3).map((area, i) => (
                <li key={area} className="flex items-start gap-3">
                  <span className="text-techy-accent font-medium">{i + 1}.</span>
                  <span>{TOPIC_NAMES[area] || area}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="text-center mt-10">
          <button
            onClick={() => router.push("/dashboard")}
            className="px-8 py-3 bg-techy-accent hover:bg-techy-accentHover text-white font-medium rounded-md transition"
          >
            Go to your dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-techy-muted">Loading your results...</div>
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}