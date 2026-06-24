import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { complete } from "@/lib/anthropic";
import { buildEvaluationPrompt } from "@/lib/prompt";
import { getQuestion } from "@/lib/questions";
import { verdictToScore } from "@/lib/scoring";

interface Body {
  session_id: string;
  question_id: string;
  answer: string;
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: Body = await req.json();
  const question = getQuestion(body.question_id);
  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 400 });
  }

  // Build evaluation prompt
  const evalPrompt = buildEvaluationPrompt(
    question.question_text,
    question.model_answer,
    question.rubric,
    question.common_mistakes,
    question.followups,
    question.category
  );

  let feedback: string;
  try {
    feedback = await complete(
      evalPrompt,
      `The candidate's answer:\n\n"${body.answer}"\n\nProvide your full evaluation now. Start with "**Verdict**: <verdict>" on the first line.`,
      1200
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Evaluation failed" }, { status: 500 });
  }

  // Extract verdict
  const verdictMatch = feedback.match(/Verdict[*:]+\s*(Strong|Solid|Partial|Weak|Off-track)/i);
  const verdict = verdictMatch ? verdictMatch[1] : "Partial";

  // Save attempt
  await supabase.from("session_attempts").insert({
    session_id: body.session_id,
    question_id: body.question_id,
    user_answer: body.answer,
    verdict,
    techy_feedback: feedback,
  });

  // Update readiness score (simple: rolling average)
  const score = verdictToScore(verdict);
  const { data: recentScores } = await supabase
    .from("readiness_scores")
    .select("score")
    .eq("user_id", user.id)
    .order("calculated_at", { ascending: false })
    .limit(10);

  const currentAvg = recentScores?.length
    ? recentScores.reduce((sum, s) => sum + s.score, 0) / recentScores.length
    : score;

  const newScore = Math.round(0.9 * currentAvg + 0.1 * score);
  await supabase.from("readiness_scores").insert({
    user_id: user.id,
    score: newScore,
    trigger_event: "session_attempt",
  });

  // Add to spaced rep queue if weak verdict
  if (verdict === "Weak" || verdict === "Off-track" || verdict === "Partial") {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 1);
    await supabase.from("spaced_rep_queue").upsert(
      {
        user_id: user.id,
        question_id: body.question_id,
        next_due_date: dueDate.toISOString().split("T")[0],
        interval_days: 1,
        last_attempt_verdict: verdict,
        last_attempted_at: new Date().toISOString(),
      },
      { onConflict: "user_id,question_id" }
    );
  }

  return NextResponse.json({ verdict, feedback });
}
