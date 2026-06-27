"use client";

import { useState } from "react";
import Link from "next/link";
import { ALL_QUESTIONS, TOPIC_NAMES } from "@/lib/questions";
import Logo from "@/components/Logo";

// Difficulty pill styling
const DIFFICULTY_STYLES: Record<string, string> = {
  Easy: "bg-difficulty-easyBg text-difficulty-easyText border-difficulty-easyBorder",
  Medium: "bg-difficulty-mediumBg text-difficulty-mediumText border-difficulty-mediumBorder",
  Hard: "bg-difficulty-hardBg text-difficulty-hardText border-difficulty-hardBorder",
};

// Topic pill styling — maps topic key to bg + text color classes
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

export default function LibraryPage() {
  const [topicFilter, setTopicFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");

  const topics = Array.from(new Set(ALL_QUESTIONS.map((q) => q.topic)));

  const filtered = ALL_QUESTIONS.filter((q) => {
    if (topicFilter !== "all" && q.topic !== topicFilter) return false;
    if (categoryFilter !== "all" && q.category !== categoryFilter) return false;
    if (difficultyFilter !== "all" && q.difficulty !== difficultyFilter) return false;
    if (search.trim() && !q.question_text.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen">
      <header className="border-b border-techy-border bg-techy-surface/40 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Logo />
          <nav className="flex gap-6 text-sm">
            <Link href="/dashboard" className="text-techy-muted hover:text-techy-text transition">Dashboard</Link>
            <Link href="/library" className="text-techy-text">Library</Link>
            <Link href="/settings" className="text-techy-muted hover:text-techy-text transition">Settings</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Question library</h1>
          <p className="text-techy-muted text-sm">
            {ALL_QUESTIONS.length} questions across 11 SOC topics. Click any question to practice with AI feedback.
          </p>
        </div>

        {/* Filters bar */}
        <div className="bg-techy-surface border border-techy-border rounded-lg p-4 mb-4">
          <div className="grid md:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Search questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-2 bg-techy-bg border border-techy-border rounded-md text-sm focus:outline-none focus:border-techy-accent transition"
            />
            <select
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
              className="px-3 py-2 bg-techy-bg border border-techy-border rounded-md text-sm focus:outline-none focus:border-techy-accent transition"
            >
              <option value="all">All topics</option>
              {topics.map((t) => (
                <option key={t} value={t}>{TOPIC_NAMES[t] || t}</option>
              ))}
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-techy-bg border border-techy-border rounded-md text-sm focus:outline-none focus:border-techy-accent transition"
            >
              <option value="all">All categories</option>
              <option value="Conceptual">Conceptual</option>
              <option value="Scenario">Scenario</option>
              <option value="Tools">Tools</option>
              <option value="Behavioral">Behavioral</option>
            </select>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="px-3 py-2 bg-techy-bg border border-techy-border rounded-md text-sm focus:outline-none focus:border-techy-accent transition"
            >
              <option value="all">All difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>

        <div className="text-techy-muted text-sm mb-4 flex justify-between items-center">
          <span>
            Showing <span className="text-techy-text font-medium">{filtered.length}</span> of {ALL_QUESTIONS.length} questions
          </span>
          {(topicFilter !== "all" || categoryFilter !== "all" || difficultyFilter !== "all" || search) && (
            <button
              onClick={() => {
                setTopicFilter("all");
                setCategoryFilter("all");
                setDifficultyFilter("all");
                setSearch("");
              }}
              className="text-techy-accent hover:text-techy-accentHover transition"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Table header */}
        <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2 text-xs uppercase tracking-wider text-techy-muted border-b border-techy-border">
          <div className="col-span-1">ID</div>
          <div className="col-span-6">Question</div>
          <div className="col-span-2">Topic</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-1 text-right">Difficulty</div>
        </div>

        {/* Question rows */}
        <div className="divide-y divide-techy-border/50">
          {filtered.map((q) => (
            <Link
              key={q.id}
              href={`/practice/${q.id}`}
              className="group grid grid-cols-1 md:grid-cols-12 gap-3 px-4 py-4 hover:bg-techy-surfaceHover transition cursor-pointer items-center"
            >
              <div className="col-span-1 font-mono text-xs text-techy-muted">
                {q.id}
              </div>
              <div className="col-span-6 text-sm group-hover:text-techy-accentHover transition">
                {q.question_text}
              </div>
              <div className="col-span-2">
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${TOPIC_STYLES[q.topic] || "bg-techy-bg text-techy-muted"}`}>
                  {TOPIC_NAMES[q.topic] || q.topic}
                </span>
              </div>
              <div className="col-span-2 text-xs text-techy-muted">
                {q.category}
              </div>
              <div className="col-span-1 text-right">
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium border ${DIFFICULTY_STYLES[q.difficulty] || ""}`}>
                  {q.difficulty}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-techy-muted">
            No questions match your filters.
          </div>
        )}
      </main>
    </div>
  );
}