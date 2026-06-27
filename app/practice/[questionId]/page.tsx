"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-client";
import { getQuestion, Question, TOPIC_NAMES } from "@/lib/questions";
import Logo from "@/components/Logo";

type Stage = "question" | "evaluating" | "feedback";

// Difficulty pill styling
const DIFFICULTY_STYLES: Record<string, string> = {
  Easy: "bg-difficulty-easyBg text-difficulty-easyText border-difficulty-easyBorder",
  Medium: "bg-difficulty-mediumBg text-difficulty-mediumText border-difficulty-mediumBorder",
  Hard: "bg-difficulty-hardBg text-difficulty-hardText border-difficulty-hardBorder",
};

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

// Verdict badge styling
const VERDICT_STYLES: Record<string, string> = {
  Strong: "bg-verdict-strongBg text-verdict-strongText",
  Solid: "bg-verdict-solidBg text-verdict-solidText",
  Partial: "bg-verdict-partialBg text-verdict-partialText",
  Weak: "bg-verdict-weakBg text-verdict-weakText",
  "Off-track": "bg-verdict-weakBg text-verdict-weakText",
};

export default function PracticePage() {
  const router = useRouter();
  const params = useParams();
  const questionId = params.questionId as string;

  const [question, setQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState("");
  const [stage, setStage] = useState<Stage>("question");
  const [feedback, setFeedback] = useState("");
  const [verdict, setVerdict] = useState("");
  const [modelAnswer, setModelAnswer] = useState("");
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    checkAuthAndLoad();
  }, [questionId]);

  async function checkAuthAndLoad() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/login");
      return;
    }
    const q = getQuestion(questionId);
    if (!q) {
      router.push("/library");
      return;
    }
    setQuestion(q);
    setAuthChecked(true);
  }

  async function submitAnswer() {
    if (!answer.trim() || !question) return;
    setStage("evaluating");

    try {
      const res = await fetch("/api/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_id: question.id,
          answer: answer,
        }),
      });
      if (!res.ok) throw new Error("Evaluation failed");
      const data = await res.json();
      setFeedback(data.feedback);
      setVerdict(data.verdict);
      setModelAnswer(data.model_answer);
      setStage("feedback");
    } catch (err) {
      console.error(err);
      alert("Something went wrong evaluating your answer.");
      setStage("question");
    }
  }

  if (!authChecked || !question) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-techy-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-techy-border bg-techy-surface/40 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Logo />
          <div className="flex gap-6 items-center text-sm">
            <Link href="/library" className="text-techy-muted hover:text-techy-text transition">
              ← Back to library
            </Link>
            <div className="text-techy-muted uppercase text-xs tracking-wider">Practice mode</div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8 w-full flex-1">
        <div className="mb-4 flex gap-2 items-center flex-wrap">
          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${TOPIC_STYLES[question.topic] || "bg-techy-bg text-techy-muted"}`}>
            {TOPIC_NAMES[question.topic] || question.topic}
          </span>
          <span className={`inline-block px-2 py-1 rounded text-xs font-medium border ${DIFFICULTY_STYLES[question.difficulty] || ""}`}>
            {question.difficulty}
          </span>
          <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-techy-surface border border-techy-border text-techy-muted">
            {question.category}
          </span>
          <span className="font-mono text-xs text-techy-muted ml-auto">{question.id}</span>
        </div>
        <h1 className="text-2xl font-medium mb-8 leading-relaxed tracking-tight">{question.question_text}</h1>

        {stage === "question" && (
          <>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer..."
              className="w-full min-h-[200px] p-4 bg-techy-surface border border-techy-border rounded-md focus:outline-none focus:border-techy-accent resize-y transition"
              autoFocus
            />
            <div className="flex justify-between items-center mt-6">
              <div className="text-xs text-techy-muted">
                Practice mode &middot; doesn&apos;t count toward your daily session
              </div>
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

            <div className="bg-techy-surface border border-techy-border rounded-md p-6 mb-4">
              <div className="text-sm text-techy-muted mb-3">Techy&apos;s feedback</div>
              <div
                className="feedback-content prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: markdownToHtml(feedback) }}
              />
            </div>

            <div className="bg-techy-surface border border-techy-border rounded-md p-6 mb-6">
              <div className="text-sm text-techy-muted mb-3">Model answer</div>
              <div className="text-sm leading-relaxed">{modelAnswer}</div>
            </div>

            <div className="flex justify-between items-center">
              <Link
                href="/library"
                className="text-techy-muted hover:text-techy-text text-sm transition"
              >
                ← Back to library
              </Link>
              <Link
                href="/library"
                className="px-6 py-2 bg-techy-accent hover:bg-techy-accentHover text-white font-medium rounded-md transition"
              >
                Try another
              </Link>
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