"use client";

import { useState } from "react";
import Link from "next/link";
import { ALL_QUESTIONS, TOPIC_NAMES } from "@/lib/questions";

export default function LibraryPage() {
  const [topicFilter, setTopicFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");

  const topics = Array.from(new Set(ALL_QUESTIONS.map((q) => q.topic)));

  const filtered = ALL_QUESTIONS.filter((q) => {
    if (topicFilter !== "all" && q.topic !== topicFilter) return false;
    if (categoryFilter !== "all" && q.category !== categoryFilter) return false;
    if (difficultyFilter !== "all" && q.difficulty !== difficultyFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen">
      <header className="border-b border-techy-border">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-xl font-bold">Techy</div>
          <nav className="flex gap-6 text-sm">
            <Link href="/dashboard" className="text-techy-muted hover:text-techy-text">Dashboard</Link>
            <Link href="/library" className="text-techy-text">Library</Link>
            <Link href="/settings" className="text-techy-muted hover:text-techy-text">Settings</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-6">Question library</h1>

        <div className="bg-techy-surface border border-techy-border rounded-lg p-4 mb-6">
          <div className="grid md:grid-cols-3 gap-3">
            <select
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
              className="px-3 py-2 bg-techy-bg border border-techy-border rounded-md text-sm focus:outline-none focus:border-techy-accent"
            >
              <option value="all">All topics</option>
              {topics.map((t) => (
                <option key={t} value={t}>{TOPIC_NAMES[t] || t}</option>
              ))}
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-techy-bg border border-techy-border rounded-md text-sm focus:outline-none focus:border-techy-accent"
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
              className="px-3 py-2 bg-techy-bg border border-techy-border rounded-md text-sm focus:outline-none focus:border-techy-accent"
            >
              <option value="all">All difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>

        <div className="text-techy-muted text-sm mb-4">{filtered.length} questions</div>

        <div className="space-y-2">
          {filtered.map((q) => (
            <Link
              key={q.id}
              href={`/practice/${q.id}`}
              className="block bg-techy-surface border border-techy-border rounded-md p-4 hover:border-techy-accent transition cursor-pointer"
            >
              <div className="flex gap-2 mb-2 items-center text-xs">
                <span className="bg-techy-bg border border-techy-border rounded-full px-2 py-0.5">
                  {q.category}
                </span>
                <span className="bg-techy-bg border border-techy-border rounded-full px-2 py-0.5">
                  {q.difficulty}
                </span>
                <span className="text-techy-muted">{TOPIC_NAMES[q.topic] || q.topic}</span>
                <span className="text-techy-muted ml-auto">{q.id}</span>
              </div>
              <div className="text-sm">{q.question_text}</div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}