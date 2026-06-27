import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { complete } from "@/lib/anthropic";
import { buildEvaluationPrompt } from "@/lib/prompt";
import { getQuestion } from "@/lib/questions";

interface Body {
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

  const verdictMatch = feedback.match(/Verdict[*:]+\s*(Strong|Solid|Partial|Weak|Off-track)/i);
  const verdict = verdictMatch ? verdictMatch[1] : "Partial";

  return NextResponse.json({
    verdict,
    feedback,
    model_answer: question.model_answer,
  });
}