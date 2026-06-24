"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { buildDiagnosticSet, Question } from "@/lib/questions";

interface Response {
  question_id: string;
  answer: string;
  time_spent_sec: number;
}

export default function DiagnosticPage() {
  const router = useRouter();
  const [questions] = useState<Question[]>(buildDiagnosticSet());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [responses, setResponses] = useState<Response[]>([]);
  const [startTime, setStartTime] = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      setIsAuthed(!!data.user);
      setAuthChecked(true);
    }
    checkAuth();
  }, []);

  const current = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const progress = ((currentIndex + 1) / questions.length) * 100;

  function handleNext() {
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    const newResponse: Response = {
      question_id: current.id,
      answer: currentAnswer || "[skipped]",
      time_spent_sec: timeSpent,
    };
    const updatedResponses = [...responses, newResponse];
    setResponses(updatedResponses);

    if (isLast) {
      // Check auth — if not signed in after question 2, redirect to signup
      if (!isAuthed) {
        // Save responses to sessionStorage so they can resume after signup
        sessionStorage.setItem("pending_diagnostic", JSON.stringify(updatedResponses));
        router.push("/auth/signup?from=diagnostic");
        return;
      }
      submitDiagnostic(updatedResponses);
    } else {
      // Mid-diagnostic auth gate — after question 2, prompt signup
      if (currentIndex === 1 && !isAuthed) {
        sessionStorage.setItem("pending_diagnostic", JSON.stringify(updatedResponses));
        sessionStorage.setItem("diagnostic_resume_index", "2");
        router.push("/auth/signup?from=diagnostic");
        return;
      }
      setCurrentIndex(currentIndex + 1);
      setCurrentAnswer("");
      setStartTime(Date.now());
    }
  }

  async function submitDiagnostic(allResponses: Response[]) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/diagnostic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responses: allResponses }),
      });
      if (!res.ok) throw new Error("Submission failed");
      const data = await res.json();
      router.push(`/diagnostic/results?id=${data.diagnostic_id}`);
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-techy-muted">Loading...</div>
      </div>
    );
  }

  if (submitting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-3">Analyzing your responses...</div>
          <div className="text-techy-muted">This takes about 30 seconds.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Progress bar */}
      <div className="h-1 bg-techy-border">
        <div
          className="h-full bg-techy-accent transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12 w-full flex-1 flex flex-col">
        <div className="text-techy-muted text-sm mb-8">
          Question {currentIndex + 1} of {questions.length}
        </div>

        <div className="flex-1">
          <div className="mb-3 flex gap-2">
            <span className="text-xs bg-techy-surface border border-techy-border rounded-full px-3 py-1">
              {current.category}
            </span>
            <span className="text-xs bg-techy-surface border border-techy-border rounded-full px-3 py-1">
              {current.difficulty}
            </span>
          </div>
          <h1 className="text-2xl font-medium mb-8 leading-relaxed">
            {current.question_text}
          </h1>

          <textarea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder="Type your answer... (or click 'I don't know' if you'd rather skip)"
            className="w-full min-h-[200px] p-4 bg-techy-surface border border-techy-border rounded-md focus:outline-none focus:border-techy-accent resize-y"
            autoFocus
          />
        </div>

        <div className="flex justify-between items-center mt-6 pb-6">
          <button
            onClick={() => {
              setCurrentAnswer("");
              handleNext();
            }}
            className="text-techy-muted hover:text-techy-text px-4 py-2 transition"
          >
            I don&apos;t know
          </button>

          <button
            onClick={handleNext}
            disabled={!currentAnswer.trim()}
            className="px-6 py-2 bg-techy-accent rounded-md text-white font-medium hover:opacity-90 transition"
          >
            {isLast ? "Submit" : "Next question"}
          </button>
        </div>
      </div>
    </div>
  );
}
