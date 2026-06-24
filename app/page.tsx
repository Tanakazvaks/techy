import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-techy-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-xl font-bold">Techy</div>
          <div className="flex gap-4">
            <Link
              href="/auth/login"
              className="text-techy-muted hover:text-techy-text transition"
            >
              Log in
            </Link>
            <Link
              href="/auth/signup"
              className="px-4 py-2 bg-techy-accent rounded-md text-white hover:opacity-90 transition"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-4xl mx-auto px-6 py-20 text-center">
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Get ready for your SOC analyst interview
          </h1>
          <p className="text-xl text-techy-muted mb-10 max-w-2xl mx-auto">
            AI-powered interview prep with real-time feedback, mock interviews
            that feel like the real thing, and a study plan personalized to your gaps.
          </p>
          <Link
            href="/diagnostic"
            className="inline-block px-8 py-4 bg-techy-accent text-white text-lg font-medium rounded-md hover:opacity-90 transition"
          >
            Take the diagnostic — it&apos;s free
          </Link>
          <p className="text-sm text-techy-muted mt-4">
            15 questions, ~15 minutes. No signup until you want to see your score.
          </p>
        </section>

        <section className="max-w-5xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-6">
          <div className="bg-techy-surface border border-techy-border rounded-lg p-6">
            <div className="text-techy-accent text-2xl mb-3">🎯</div>
            <h3 className="font-semibold mb-2">Real interview scenarios</h3>
            <p className="text-techy-muted text-sm">
              Scenario questions modeled on what actual SOC interviewers ask — brute force investigation, phishing triage, lateral movement, ransomware.
            </p>
          </div>
          <div className="bg-techy-surface border border-techy-border rounded-lg p-6">
            <div className="text-techy-accent text-2xl mb-3">💬</div>
            <h3 className="font-semibold mb-2">Senior-analyst feedback</h3>
            <p className="text-techy-muted text-sm">
              Sharp, specific feedback on every answer. Not &ldquo;great job&rdquo; — actually useful critique that points to what to fix.
            </p>
          </div>
          <div className="bg-techy-surface border border-techy-border rounded-lg p-6">
            <div className="text-techy-accent text-2xl mb-3">🎤</div>
            <h3 className="font-semibold mb-2">Mock interviews that feel real</h3>
            <p className="text-techy-muted text-sm">
              30-minute simulated interviews with follow-up pushback and a full report at the end.
            </p>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to start?</h2>
          <p className="text-techy-muted mb-8">
            Take the diagnostic first — see where you stand, then build a plan from there.
          </p>
          <Link
            href="/diagnostic"
            className="inline-block px-8 py-4 bg-techy-accent text-white text-lg font-medium rounded-md hover:opacity-90 transition"
          >
            Start your diagnostic
          </Link>
        </section>
      </main>

      <footer className="border-t border-techy-border py-6 text-center text-techy-muted text-sm">
        Techy is a personal interview prep tool. Not affiliated with CompTIA, MITRE, or any vendor mentioned.
      </footer>
    </div>
  );
}
