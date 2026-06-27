"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-client";
import Logo from "@/components/Logo";

export default function SettingsPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [targetRole, setTargetRole] = useState("tier1");
  const [targetCompany, setTargetCompany] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setEmail(data?.email || user.email || "");
      setInterviewDate(data?.interview_date || "");
      setTargetRole(data?.target_role || "tier1");
      setTargetCompany(data?.target_company || "");
      setLoading(false);
    }
    load();
  }, [router]);

  async function save() {
    setSaving(true);
    setSavedMsg("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        interview_date: interviewDate || null,
        target_role: targetRole,
        target_company: targetCompany || null,
      })
      .eq("id", user.id);

    if (error) {
      setSavedMsg("Error saving");
    } else {
      setSavedMsg("Saved");
      setTimeout(() => setSavedMsg(""), 2000);
    }
    setSaving(false);
  }

  async function deleteAccount() {
    if (!confirm("Are you sure? This deletes all your data permanently.")) return;
    if (!confirm("Really sure? This cannot be undone.")) return;

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("profiles").delete().eq("id", user.id);
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-techy-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-techy-border bg-techy-surface/40 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Logo />
          <nav className="flex gap-6 text-sm">
            <Link href="/dashboard" className="text-techy-muted hover:text-techy-text transition">Dashboard</Link>
            <Link href="/library" className="text-techy-muted hover:text-techy-text transition">Library</Link>
            <Link href="/settings" className="text-techy-text">Settings</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Settings</h1>

        <div className="bg-techy-surface border border-techy-border rounded-lg p-6 mb-6">
          <h2 className="font-medium mb-4">Account</h2>
          <div className="text-sm">
            <div className="text-techy-muted mb-1">Email</div>
            <div>{email}</div>
          </div>
        </div>

        <div className="bg-techy-surface border border-techy-border rounded-lg p-6 mb-6">
          <h2 className="font-medium mb-4">Interview details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Interview date</label>
              <input
                type="date"
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                className="w-full px-3 py-2 bg-techy-bg border border-techy-border rounded-md focus:outline-none focus:border-techy-accent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Target role</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-3 py-2 bg-techy-bg border border-techy-border rounded-md focus:outline-none focus:border-techy-accent transition"
              >
                <option value="tier1">Tier 1 SOC Analyst</option>
                <option value="tier2">Tier 2 SOC Analyst</option>
                <option value="other">Other security role</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Target company (optional)</label>
              <input
                type="text"
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                placeholder="e.g., CrowdStrike"
                className="w-full px-3 py-2 bg-techy-bg border border-techy-border rounded-md focus:outline-none focus:border-techy-accent transition"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={save}
                disabled={saving}
                className="px-4 py-2 bg-techy-accent hover:bg-techy-accentHover text-white font-medium rounded-md transition disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
              {savedMsg && <span className="text-techy-success text-sm">{savedMsg}</span>}
            </div>
          </div>
        </div>

        <div className="bg-techy-surface border border-techy-border rounded-lg p-6 mb-6">
          <h2 className="font-medium mb-2">Danger zone</h2>
          <p className="text-techy-muted text-sm mb-4">
            Permanently delete your account and all your data.
          </p>
          <button
            onClick={deleteAccount}
            className="px-4 py-2 border border-techy-danger text-techy-danger rounded-md hover:bg-red-950/30 transition text-sm"
          >
            Delete my account
          </button>
        </div>
      </main>
    </div>
  );
}