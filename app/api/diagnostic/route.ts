import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { complete } from "@/lib/anthropic";
import { buildEvaluationPrompt, TECHY_SYSTEM_PROMPT } from "@/lib/prompt";
import { getQuestion, TOPIC_NAMES } from "@/lib/questions";
import { verdictToScore } from "@/lib/scoring";

interface SubmitBody {
  responses: Array<{
    question_id: string;
    answer: string;
    time_spent_sec: number;
  }>;
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: SubmitBody = await req.json();

  // Create diagnostic record
  const { data: diagnostic, error: createError } = await supabase
    .from("diagnostics")
    .insert({ user_id: user.id })
    .select()
    .single();

  if (createError || !diagnostic) {
    console.error(createError);
    return NextResponse.json({ error: "Failed to create diagnostic" }, { status: 500 });
  }

  // Evaluate each response with Claude
  const evaluated = await Promise.all(
    body.responses.map(async (r) => {
      const question = getQuestion(r.question_id);
      if (!question) {
        return { ...r, verdict: "Skipped", score: 0 };
      }

      if (r.answer === "[skipped]" || !r.answer.trim()) {
        return { ...r, verdict: "Skipped", score: 0 };
      }

      try {
        const evalPrompt = buildEvaluationPrompt(
          question.question_text,
          question.model_answer,
          question.rubric,
          question.common_mistakes,
          question.followups,
          question.category
        );

        const responseText = await complete(
          evalPrompt,
          `The candidate answered: "${r.answer}"\n\nProvide your evaluation. Return ONLY the verdict word at the very start (Strong, Solid, Partial, Weak, or Off-track) on its own line, then your full evaluation. Example:\n\nVerdict: Partial\n\nThen the rest of your feedback...`,
          800
        );

        // Extract verdict from response
        const verdictMatch = responseText.match(/Verdict:\s*(Strong|Solid|Partial|Weak|Off-track)/i);
        const verdict = verdictMatch ? verdictMatch[1] : "Partial";

        return {
          ...r,
          verdict,
          score: verdictToScore(verdict),
        };
      } catch (e) {
        console.error("Eval error for", r.question_id, e);
        return { ...r, verdict: "Skipped", score: 0 };
      }
    })
  );

  // Save responses
  const responseRows = evaluated.map((r) => ({
    diagnostic_id: diagnostic.id,
    question_id: r.question_id,
    user_answer: r.answer,
    verdict: r.verdict,
    score: r.score,
    time_spent_sec: r.time_spent_sec,
  }));

  await supabase.from("diagnostic_responses").insert(responseRows);

  // Compute breakdown by topic
  const breakdown: Record<string, { total: number; count: number }> = {};
  for (const r of evaluated) {
    const q = getQuestion(r.question_id);
    if (!q) continue;
    if (!breakdown[q.topic]) breakdown[q.topic] = { total: 0, count: 0 };
    breakdown[q.topic].total += r.score;
    breakdown[q.topic].count += 1;
  }

  const topicScores: Record<string, number> = {};
  for (const [topic, { total, count }] of Object.entries(breakdown)) {
    topicScores[topic] = Math.round(total / count);
  }

  const overallScore = Math.round(
    Object.values(topicScores).reduce((a, b) => a + b, 0) /
      Math.max(Object.values(topicScores).length, 1)
  );

  // Identify weak areas (bottom 3 by score)
  const weakAreas = Object.entries(topicScores)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 3)
    .map(([topic]) => topic);

  // Update diagnostic with results
  await supabase
    .from("diagnostics")
    .update({
      completed_at: new Date().toISOString(),
      overall_score: overallScore,
      breakdown: topicScores,
      weak_areas: weakAreas,
    })
    .eq("id", diagnostic.id);

  // Create initial readiness score
  await supabase.from("readiness_scores").insert({
    user_id: user.id,
    score: overallScore,
    trigger_event: "diagnostic",
  });

  // Create study plan
  await supabase.from("study_plans").insert({
    user_id: user.id,
    target_weeks: 4,
    daily_topics: weakAreas,
  });

  return NextResponse.json({ diagnostic_id: diagnostic.id });
}
