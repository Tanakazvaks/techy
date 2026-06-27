"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-client";
import { buildMockInterviewSet, Question } from "@/lib/questions";
import Logo from "@/components/Logo";

type Stage = "intro" | "interview" | "generating_report" | "report";

interface MockReport {
  final_score: number;
  final_verdict: string;
  verdict_rationale: string;
  strengths: string[];
  weaknesses: string[];
  verbal_habits: string[];
  study_recommendations: string[];
}

export default function MockInterviewPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("intro");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState<Array<{ question: string; answer: string }>>([]);
  const [report, setReport] = useState<MockReport | null>(null);
  const [startTime, setStartTime] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    setQuestions(buildMockInterviewSet());
  }, []);

  async function beginInterview() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/login");
      return;
    }

    const { data: session } = await supabase
      .from("sessions")
      .insert({ user_id: user.id, type: "mock_interview" })
      .select()
      .single();
    if (session) setSessionId(session.id);

    setStartTime(Date.now());
    setStage("interview");
  }

  async function submitAndContinue() {
    if (!answer.trim()) return;
    const newAnswer = { question: questions[currentIndex].question_text, answer };
    const updated = [...answers, newAnswer];
    setAnswers(updated);

    if (currentIndex === questions.length - 1) {
      setStage("generating_report");
      try {
        const durationSec = Math.round((Date.now() - startTime) / 1000);
        const res = await fetch("/api/mock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionId,
            answers: updated,
            duration_sec: durationSec,
            question_ids: questions.map((q) => q.id),
          }),
        });
        if (!res.ok) throw new Error("Report generation failed");
        const data = await res.json();
        setReport(data.report);
        setStage("report");
      } catch (e) {
        console.error(e);
        alert("Couldn't generate report. Returning to dashboard.");
        router.push("/dashboard");
      }
    } else {
      setCurrentIndex(currentIndex + 1);
      setAnswer("");
    }
  }

  const PageHeader = ({ subtitle }: { subtitle: string }) => (
    <header className="border-b border-techy-border bg-techy-surface/40 backdrop-blur">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/"><Logo /></Link>
        <div className="text-techy-muted uppercase text-xs tracking-wider">{subtitle}</div>
      </div>
    </header>
  );

  if (stage === "intro") {
    return (
      <div className="min-h-screen flex flex-col">
        <PageHeader subtitle="Mock interview" />
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="max-w-2xl w-full">
            <h1 className="text-3xl font-bold mb-3 tracking-tight">Mock interview</h1>
            <p className="text-techy-muted mb-6">
              This is a simulated SOC analyst interview. Set aside about 30 minutes of focused time.
            </p>

            <div className="bg-techy-surface border border-techy-border rounded-lg p-6 mb-6">
              <h2 className="font-medium mb-3">What to expect</h2>
              <ul className="space-y-2 text-sm text-techy-muted">
                <li>• {questions.length} questions across categories. Scenarios, conceptual, tools, behavioral</li>
                <li>• <strong className="text-techy-text">No feedback between questions.</strong> That would break the simulation</li>
                <li>• Expect pushback like a real interviewer</li>
                <li>• Full report at the end with score, strengths, and gaps</li>
                <li>• Answer like you would in a real interview. Full thoughts, not one-liners</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Link
                href="/dashboard"
                className="px-6 py-3 border border-techy-border rounded-md text-techy-muted hover:text-techy-text transition"
              >
                Not yet
              </Link>
              <button
                onClick={beginInterview}
                className="px-6 py-3 bg-techy-accent hover:bg-techy-accentHover text-white font-medium rounded-md transition"
              >
                Begin interview
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (stage === "generating_report") {
    return (
      <div className="min-h-screen flex flex-col">
        <PageHeader subtitle="Generating report" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-xl mb-3 tracking-tight">Generating your report...</div>
            <div className="text-techy-muted text-sm">Takes about a minute.</div>
          </div>
        </div>
      </div>
    );
  }

  if (stage === "report" && report) {
    const score = report.final_score * 10; // convert /10 to /100 for gauge
    const circumference = 2 * Math.PI * 52;
    const offset = circumference - (score / 100) * circumference;
    const gaugeColor =
      score >= 75 ? "#34d399" : score >= 50 ? "#60a5fa" : score >= 25 ? "#fbbf24" : "#f87171";

    return (
      <div className="min-h-screen">
        <PageHeader subtitle="Mock interview report" />
        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <div className="text-techy-muted text-sm mb-4">Mock interview complete</div>
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
                <div className="text-4xl font-bold">{report.final_score}</div>
                <div className="text-xs text-techy-muted">/ 10</div>
              </div>
            </div>
            <div className="text-xl mb-1 tracking-tight">{report.final_verdict}</div>
            <p className="text-techy-muted max-w-md mx-auto">{report.verdict_rationale}</p>
          </div>

          <div className="bg-techy-surface border border-techy-border rounded-lg p-6 mb-4">
            <h2 className="font-medium mb-3">Strengths</h2>
            <ul className="space-y-2 text-sm">
              {report.strengths.map((s, i) => (
                <li key={i} className="text-techy-muted">• {s}</li>
              ))}
            </ul>
          </div>

          <div className="bg-techy-surface border border-techy-border rounded-lg p-6 mb-4">
            <h2 className="font-medium mb-3">Weaknesses</h2>
            <ul className="space-y-2 text-sm">
              {report.weaknesses.map((w, i) => (
                <li key={i} className="text-techy-muted">• {w}</li>
              ))}
            </ul>
          </div>

          {report.verbal_habits && report.verbal_habits.length > 0 && (
            <div className="bg-techy-surface border border-techy-border rounded-lg p-6 mb-4">
              <h2 className="font-medium mb-3">Verbal habits to fix</h2>
              <ul className="space-y-2 text-sm">
                {report.verbal_habits.map((h, i) => (
                  <li key={i} className="text-techy-muted">• {h}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-techy-surface border border-techy-border rounded-lg p-6 mb-8">
            <h2 className="font-medium mb-3">What to study next</h2>
            <ul className="space-y-2 text-sm">
              {report.study_recommendations.map((r, i) => (
                <li key={i} className="text-techy-muted">• {r}</li>
              ))}
            </ul>
          </div>

          <div className="text-center">
            <Link
              href="/dashboard"
              className="inline-block px-6 py-3 bg-techy-accent hover:bg-techy-accentHover text-white font-medium rounded-md transition"
            >
              Back to dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const current = questions[currentIndex];
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-techy-border bg-techy-surface/40 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/"><Logo /></Link>
          <div className="flex gap-6 items-center text-sm">
            <div className="text-techy-muted uppercase text-xs tracking-wider">Mock interview</div>
            <div className="text-techy-muted">
              {currentIndex + 1} / {questions.length}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12 w-full flex-1">
        <h1 className="text-xl font-medium mb-6 leading-relaxed tracking-tight">{current.question_text}</h1>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Take your time. Answer like you would in a real interview."
          className="w-full min-h-[240px] p-4 bg-techy-surface border border-techy-border rounded-md focus:outline-none focus:border-techy-accent resize-y transition"
          autoFocus
        />
        <div className="flex justify-end mt-6">
          <button
            onClick={submitAndContinue}
            disabled={!answer.trim()}
            className="px-6 py-2 bg-techy-accent hover:bg-techy-accentHover text-white font-medium rounded-md transition disabled:opacity-50"
          >
            {currentIndex === questions.length - 1 ? "Finish interview" : "Next question"}
          </button>
        </div>
      </div>
    </div>
  );
}