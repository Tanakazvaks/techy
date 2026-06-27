"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-client";
import { buildSessionSet, Question, TOPIC_NAMES } from "@/lib/questions";
import Logo from "@/components/Logo";

type Stage = "question" | "evaluating" | "feedback" | "done";

interface AttemptResult {
  questionId: string;
  verdict: string;
  feedback: string;
}

// Topic pill styling
const TOPIC_STYLES: Record<string, string> = {
  networking: "bg-topic-networking text-topic-networkingText",
  common_attacks: "bg-topic-common_attacks text-topic-common_attacksText",
  log_analysis: "bg-topic-log_analysis text-topic-log_analysisText",
  incident_response: "bg-topic-incident_response text-topic-incident_responseText",
  endpoint_security: "bg-topic-endpoint_security text-topic-endpoint_securityText",
  web_security: "bg-topic-web_security text-topic-web_securityText",
  cloud_security: "bg-topic-cloud_security text-topic-cloud_securityText",
  threat_intel: "bg-topic-threat_intel text-topic-threat_intelText",
  splunk: "bg-topic-splunk text-topic-splunkText",
  behavioral: "bg-topic-behavioral text-topic-behavioralText",
  vulnerabilities: "bg-topic-vulnerabilities text-topic-vulnerabilitiesText",
};

const DIFFICULTY_STYLES: Record<string, string> = {
  Easy: "bg-difficulty-easyBg text-difficulty-easyText border-difficulty-easyBorder",
  Medium: "bg-difficulty-mediumBg text-difficulty-mediumText border-difficulty-mediumBorder",
  Hard: "bg-difficulty-hardBg text-difficulty-hardText border-difficulty-hardBorder",
};

const VERDICT_STYLES: Record<string, string> = {
  Strong: "bg-verdict-strongBg text-verdict-strongText",
  Solid: "bg-verdict-solidBg text-verdict-solidText",
  Partial: "bg-verdict-partialBg text-verdict-partialText",
  Weak: "bg-verdict-weakBg text-verdict-weakText",
  "Off-track": "bg-verdict-weakBg text-verdict-weakText",
};

export default function SessionPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [stage, setStage] = useState<Stage>("question");
  const [feedback, setFeedback] = useState("");
  const [verdict, setVerdict] = useState("");
  const [attempts, setAttempts] = useState<AttemptResult[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [feedbackFlagged, setFeedbackFlagged] = useState(false);

  useEffect(() => {
    initSession();
  }, []);

  async function initSession() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/login");
      return;
    }

    const { data: diagnostic } = await supabase
      .from("diagnostics")
      .select("weak_areas")
      .eq("user_id", user.id)
      .not("completed_at", "is", null)
      .order("completed_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const topics = diagnostic?.weak_areas?.length
      ? diagnostic.weak_areas
      : ["networking", "common_attacks", "log_analysis"];

    const sessionQuestions = buildSessionSet(topics, 3);
    setQuestions(sessionQuestions);

    const { data: session } = await supabase
      .from("sessions")
      .insert({
        user_id: user.id,
        type: "study",
        topics_covered: topics,
      })
      .select()
      .single();

    if (session) setSessionId(session.id);
  }

  const current = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;

  async function submitAnswer() {
    if (!answer.trim() || !current || !sessionId) return;
    setStage("evaluating");

    try {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          question_id: current.id,
          answer: answer,
        }),
      });
      if (!res.ok) throw new Error("Evaluation failed");
      const data = await res.json();
      setFeedback(data.feedback);
      setVerdict(data.verdict);
      setAttempts([...attempts, { questionId: current.id, verdict: data.verdict, feedback: data.feedback }]);
      setStage("feedback");
    } catch (err) {
      console.error(err);
      alert("Something went wrong evaluating your answer.");
      setStage("question");
    }
  }

  async function flagFeedback() {
    if (feedbackFlagged || !sessionId) return;
    setFeedbackFlagged(true);
  }

  async function nextQuestion() {
    if (isLast) {
      const supabase = createClient();
      const correct = attempts.filter((a) => a.verdict === "Strong" || a.verdict === "Solid").length;
      await supabase
        .from("sessions")
        .update({
          completed_at: new Date().toISOString(),
          questions_attempted: questions.length,
          questions_correct: correct,
        })
        .eq("id", sessionId!);
      setStage("done");
    } else {
      setCurrentIndex(currentIndex + 1);
      setAnswer("");
      setFeedback("");
      setVerdict("");
      setFeedbackFlagged(false);
      setStage("question");
    }
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-techy-muted">Starting your session...</div>
      </div>
    );
  }

  if (stage === "done") {
    const correct = attempts.filter((a) => a.verdict === "Strong" || a.verdict === "Solid").length;
    return (
      <div className="min-h-screen flex flex-col">
        <header className="border-b border-techy-border bg-techy-surface/40 backdrop-blur">
          <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <Link href="/"><Logo /></Link>
            <div className="text-techy-muted uppercase text-xs tracking-wider">Session complete</div>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-lg w-full text-center">
            <div className="text-techy-muted text-sm mb-3">Session complete</div>
            <div className="text-3xl font-bold mb-4 tracking-tight">Nice work</div>
            <div className="bg-techy-surface border border-techy-border rounded-lg p-6 mb-6">
              <div className="text-techy-muted text-sm mb-1">You answered</div>
              <div className="text-2xl font-bold mb-3">
                {correct} of {questions.length} strongly
              </div>
              <div className="text-techy-muted text-sm">
                Questions you missed will resurface in your next session via spaced repetition.
              </div>
            </div>
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

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-techy-border bg-techy-surface/40 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/"><Logo /></Link>
          <div className="flex gap-6 items-center text-sm">
            <Link href="/dashboard" className="text-techy-muted hover:text-techy-text transition">
              ← Exit session
            </Link>
            <div className="text-techy-muted">
              Question {currentIndex + 1} of {questions.length}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8 w-full flex-1">
        <div className="mb-4 flex gap-2 items-center flex-wrap">
          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${TOPIC_STYLES[current.topic] || "bg-techy-bg text-techy-muted"}`}>
            {TOPIC_NAMES[current.topic] || current.topic}
          </span>
          <span className={`inline-block px-2 py-1 rounded text-xs font-medium border ${DIFFICULTY_STYLES[current.difficulty] || ""}`}>
            {current.difficulty}
          </span>
          <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-techy-surface border border-techy-border text-techy-muted">
            {current.category}
          </span>
        </div>
        <h1 className="text-2xl font-medium mb-8 leading-relaxed tracking-tight">{current.question_text}</h1>

        {stage === "question" && (
          <>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer..."
              className="w-full min-h-[200px] p-4 bg-techy-surface border border-techy-border rounded-md focus:outline-none focus:border-techy-accent resize-y transition"
              autoFocus
            />
            <div className="flex justify-end mt-6">
              <button
                onClick={submitAnswer}
                disabled={!answer.trim()}
                className="px-6 py-2 bg-techy-accent hover:bg-techy-accentHover text-white font-medium rounded-md transition disabled:opacity-50"
              >
                Submit answer
              </button>
            </div>
          </>
        )}

        {stage === "evaluating" && (
          <div className="bg-techy-surface border border-techy-border rounded-md p-8 text-center">
            <div className="text-techy-muted">Techy is thinking...</div>
          </div>
        )}

        {stage === "feedback" && (
          <>
            {verdict && (
              <div className="mb-4 flex items-center gap-3">
                <span className="text-techy-muted text-sm">Verdict:</span>
                <span className={`inline-block px-3 py-1 rounded text-sm font-semibold ${VERDICT_STYLES[verdict] || "bg-techy-surface text-techy-text"}`}>
                  {verdict}
                </span>
              </div>
            )}

            <div className="bg-techy-surface border border-techy-border rounded-md p-6 mb-4">
              <div className="text-sm text-techy-muted mb-1">Your answer</div>
              <p className="text-techy-muted italic">{answer}</p>
            </div>

            <div className="bg-techy-surface border border-techy-border rounded-md p-6 mb-6">
              <div className="text-sm text-techy-muted mb-3">Techy&apos;s feedback</div>
              <div
                className="feedback-content prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: markdownToHtml(feedback) }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-2 items-center text-sm">
                <span className="text-techy-muted">Was this feedback useful?</span>
                <button
                  onClick={flagFeedback}
                  disabled={feedbackFlagged}
                  className="text-techy-muted hover:text-techy-text px-2"
                >
                  {feedbackFlagged ? "Thanks for the feedback" : "👎"}
                </button>
              </div>
              <button
                onClick={nextQuestion}
                className="px-6 py-2 bg-techy-accent hover:bg-techy-accentHover text-white font-medium rounded-md transition"
              >
                {isLast ? "Finish session" : "Next question"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function markdownToHtml(md: string): string {
  return md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br/>")
    .replace(/^/, "<p>")
    .replace(/$/, "</p>");
}