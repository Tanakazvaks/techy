"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-client";
import { buildMockInterviewSet, Question } from "@/lib/questions";

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
      // Generate report
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

  if (stage === "intro") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-2xl w-full">
          <h1 className="text-3xl font-bold mb-3">Mock interview</h1>
          <p className="text-techy-muted mb-6">
            This is a simulated SOC analyst interview. Set aside about 30 minutes of focused time.
          </p>

          <div className="bg-techy-surface border border-techy-border rounded-lg p-6 mb-6">
            <h2 className="font-medium mb-3">What to expect</h2>
            <ul className="space-y-2 text-sm text-techy-muted">
              <li>• {questions.length} questions across categories — scenarios, conceptual, tools, behavioral</li>
              <li>• <strong className="text-techy-text">No feedback between questions</strong> — that would break the simulation</li>
              <li>• Expect pushback like a real interviewer</li>
              <li>• Full report at the end with score, strengths, and gaps</li>
              <li>• Answer like you would in a real interview — full thoughts, not one-liners</li>
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
              className="px-6 py-3 bg-techy-accent text-white font-medium rounded-md hover:opacity-90 transition"
            >
              Begin interview
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (stage === "generating_report") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl mb-3">Generating your report...</div>
          <div className="text-techy-muted text-sm">Takes about a minute.</div>
        </div>
      </div>
    );
  }

  if (stage === "report" && report) {
    return (
      <div className="min-h-screen">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <div className="text-techy-muted text-sm mb-3">Mock interview complete</div>
            <div className="text-6xl font-bold text-techy-accent mb-2">
              {report.final_score}
              <span className="text-2xl text-techy-muted">/10</span>
            </div>
            <div className="text-xl mb-1">{report.final_verdict}</div>
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
              className="inline-block px-6 py-3 bg-techy-accent text-white font-medium rounded-md hover:opacity-90 transition"
            >
              Back to dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Interview stage
  const current = questions[currentIndex];
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-techy-border">
        <div className="max-w-3xl mx-auto px-6 py-3 flex justify-between items-center text-sm">
          <div className="text-techy-muted">Mock interview in progress</div>
          <div className="text-techy-muted">
            {currentIndex + 1} / {questions.length}
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12 w-full flex-1">
        <h1 className="text-xl font-medium mb-6 leading-relaxed">{current.question_text}</h1>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Take your time. Answer like you would in a real interview."
          className="w-full min-h-[240px] p-4 bg-techy-surface border border-techy-border rounded-md focus:outline-none focus:border-techy-accent resize-y"
          autoFocus
        />
        <div className="flex justify-end mt-6">
          <button
            onClick={submitAndContinue}
            disabled={!answer.trim()}
            className="px-6 py-2 bg-techy-accent text-white font-medium rounded-md hover:opacity-90 transition"
          >
            {currentIndex === questions.length - 1 ? "Finish interview" : "Next question"}
          </button>
        </div>
      </div>
    </div>
  );
}
