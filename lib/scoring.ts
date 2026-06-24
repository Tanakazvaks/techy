// Readiness score logic. Returns a 0-100 score derived from diagnostic + session + mock data.

const VERDICT_SCORES: Record<string, number> = {
  Strong: 100,
  Solid: 80,
  Partial: 55,
  Weak: 25,
  "Off-track": 0,
  Skipped: 0,
};

export function verdictToScore(verdict: string): number {
  return VERDICT_SCORES[verdict] ?? 0;
}

export function interpretScore(score: number): string {
  if (score >= 86) return "Interview-ready. You could compete for Tier 2 roles.";
  if (score >= 71) return "Strong. Likely to pass most entry-level SOC interviews.";
  if (score >= 51) return "Solid foundation. More reps will get you ready.";
  if (score >= 31) return "Beginner level. You have fundamentals — let's work on application.";
  return "Foundational gaps. We have real work to do, but you can get there.";
}

export function scoreLabel(score: number): string {
  if (score >= 86) return "Ready";
  if (score >= 71) return "Strong";
  if (score >= 51) return "Solid";
  if (score >= 31) return "Beginner";
  return "Foundation";
}
