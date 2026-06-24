import questionsData from "@/data/questions.json";

export interface Question {
  id: string;
  category: "Conceptual" | "Scenario" | "Tools" | "Behavioral";
  difficulty: "Easy" | "Medium" | "Hard";
  topic: string;
  subtopics: string[];
  time_estimate_min: number;
  diagnostic_eligible: boolean;
  is_stretch: boolean;
  question_text: string;
  model_answer: string;
  rubric: string[];
  common_mistakes: string[];
  followups: string[];
}

export const ALL_QUESTIONS: Question[] = questionsData as Question[];

export function getQuestion(id: string): Question | undefined {
  return ALL_QUESTIONS.find((q) => q.id === id);
}

export function getQuestionsByTopic(topic: string): Question[] {
  return ALL_QUESTIONS.filter((q) => q.topic === topic);
}

// Build the diagnostic set: a balanced selection across topics and categories.
export function buildDiagnosticSet(): Question[] {
  const eligible = ALL_QUESTIONS.filter((q) => q.diagnostic_eligible && !q.is_stretch);

  // Try to get a balanced spread across topics
  const byTopic: Record<string, Question[]> = {};
  eligible.forEach((q) => {
    if (!byTopic[q.topic]) byTopic[q.topic] = [];
    byTopic[q.topic].push(q);
  });

  const selected: Question[] = [];
  const topics = Object.keys(byTopic);

  // Take up to 2 from each topic, prioritizing variety
  for (let i = 0; i < 3 && selected.length < 15; i++) {
    for (const topic of topics) {
      if (selected.length >= 15) break;
      if (byTopic[topic][i]) {
        selected.push(byTopic[topic][i]);
      }
    }
  }

  return selected.slice(0, 15);
}

// Build a session set based on topics
export function buildSessionSet(topics: string[], count: number = 3): Question[] {
  const matching = ALL_QUESTIONS.filter((q) => topics.includes(q.topic));
  // Shuffle
  const shuffled = [...matching].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// Build a mock interview set: 6 questions, weighted toward scenarios
export function buildMockInterviewSet(): Question[] {
  const scenarios = ALL_QUESTIONS.filter((q) => q.category === "Scenario" && !q.is_stretch);
  const conceptual = ALL_QUESTIONS.filter((q) => q.category === "Conceptual" && !q.is_stretch);
  const tools = ALL_QUESTIONS.filter((q) => q.category === "Tools" && !q.is_stretch);
  const behavioral = ALL_QUESTIONS.filter((q) => q.category === "Behavioral");

  const shuffle = (arr: Question[]) => [...arr].sort(() => Math.random() - 0.5);

  const set = [
    ...shuffle(scenarios).slice(0, 2),
    ...shuffle(conceptual).slice(0, 2),
    ...shuffle(tools).slice(0, 1),
    ...shuffle(behavioral).slice(0, 1),
  ];

  return set;
}

export const TOPIC_NAMES: Record<string, string> = {
  networking: "Networking",
  common_attacks: "Common attacks",
  log_analysis: "Log analysis & SIEM",
  incident_response: "Incident response",
  endpoint_security: "Endpoint security",
  web_security: "Web security",
  cloud_security: "Cloud security",
  threat_intel: "Threat intel & ATT&CK",
  splunk: "Splunk queries",
  behavioral: "Behavioral",
  vulnerabilities: "Vulnerabilities",
};
