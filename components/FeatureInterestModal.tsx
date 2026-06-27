"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-client";

interface Props {
  featureName: string;
  title: string;
  description: string;
  onClose: () => void;
}

export default function FeatureInterestModal({ featureName, title, description, onClose }: Props) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Log the click on mount
  useEffect(() => {
    async function logClick() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from("feature_interest").insert({
        user_id: user.id,
        feature_name: featureName,
        action: "click",
      });
    }
    logClick();
  }, [featureName]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("You need to be logged in.");
      setSubmitting(false);
      return;
    }

    const { error: dbError } = await supabase.from("feature_interest").insert({
      user_id: user.id,
      feature_name: featureName,
      action: "email_signup",
      email: email.trim(),
    });

    if (dbError) {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
    setSubmitting(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-6"
      onClick={onClose}
    >
      <div
        className="bg-techy-surface border border-techy-border rounded-lg p-8 max-w-md w-full shadow-glow"
        onClick={(e) => e.stopPropagation()}
      >
        {!submitted ? (
          <>
            <div className="inline-block px-3 py-1 rounded-full bg-techy-accent/15 text-techy-accentHover text-xs font-medium uppercase tracking-wider mb-4">
              Coming soon
            </div>
            <h2 className="text-2xl font-bold mb-3 tracking-tight">{title}</h2>
            <p className="text-techy-muted text-sm mb-6 leading-relaxed">{description}</p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-3 py-2 bg-techy-bg border border-techy-border rounded-md focus:outline-none focus:border-techy-accent transition"
              />
              {error && <div className="text-techy-danger text-sm">{error}</div>}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-techy-muted hover:text-techy-text text-sm transition"
                >
                  No thanks
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-techy-accent hover:bg-techy-accentHover text-white font-medium rounded-md transition disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Notify me when it launches"}
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="text-center">
              <div className="text-4xl mb-3">✓</div>
              <h2 className="text-xl font-bold mb-2 tracking-tight">You&apos;re on the list</h2>
              <p className="text-techy-muted text-sm mb-6">
                I&apos;ll email you the moment {title.toLowerCase()} ships.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-techy-accent hover:bg-techy-accentHover text-white font-medium rounded-md transition"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}