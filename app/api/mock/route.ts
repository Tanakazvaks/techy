import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { complete } from "@/lib/anthropic";
import { buildMockReportPrompt } from "@/lib/prompt";

interface Body {
  session_id: string;
  answers: Array<{ question: string; answer: string }>;
  duration_sec: number;
  question_ids: string[];
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: Body = await req.json();

  // Generate report via Claude
  const prompt = buildMockReportPrompt(body.answers, body.duration_sec);
  let reportText: string;
  try {
    reportText = await complete(prompt, "Generate the report now. Return ONLY valid JSON, nothing else.", 1500);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Report generation failed" }, { status: 500 });
  }

  // Parse JSON (strip any markdown wrappers)
  const jsonMatch = reportText.match(/\{[\s\S]+\}/);
  if (!jsonMatch) {
    return NextResponse.json({ error: "Invalid report format" }, { status: 500 });
  }

  let report: any;
  try {
    report = JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.error("JSON parse error", e, reportText);
    return NextResponse.json({ error: "Invalid report format" }, { status: 500 });
  }

  // Save mock interview record
  await supabase.from("mock_interviews").insert({
    session_id: body.session_id,
    user_id: user.id,
    question_ids: body.question_ids,
    final_score: report.final_score,
    final_verdict: report.final_verdict,
    strengths: report.strengths,
    weaknesses: report.weaknesses,
    verbal_habits: report.verbal_habits,
    study_recommendations: report.study_recommendations,
    duration_sec: body.duration_sec,
  });

  // Mark session complete
  await supabase
    .from("sessions")
    .update({
      completed_at: new Date().toISOString(),
      duration_actual_sec: body.duration_sec,
      questions_attempted: body.answers.length,
    })
    .eq("id", body.session_id);

  // Update readiness — mock score is on 1-10 scale, convert to 0-100
  const mockScore100 = report.final_score * 10;
  const { data: recentScores } = await supabase
    .from("readiness_scores")
    .select("score")
    .eq("user_id", user.id)
    .order("calculated_at", { ascending: false })
    .limit(5);

  const currentAvg = recentScores?.length
    ? recentScores.reduce((sum, s) => sum + s.score, 0) / recentScores.length
    : mockScore100;
  const newScore = Math.round(0.7 * currentAvg + 0.3 * mockScore100);
  await supabase.from("readiness_scores").insert({
    user_id: user.id,
    score: newScore,
    trigger_event: "mock_interview",
  });

  return NextResponse.json({ report });
}
