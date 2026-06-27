import Link from "next/link";
import Logo from "@/components/Logo";

// Difficulty pill styling
const DIFFICULTY_STYLES: Record<string, string> = {
  Easy: "bg-difficulty-easyBg text-difficulty-easyText border-difficulty-easyBorder",
  Medium: "bg-difficulty-mediumBg text-difficulty-mediumText border-difficulty-mediumBorder",
  Hard: "bg-difficulty-hardBg text-difficulty-hardText border-difficulty-hardBorder",
};

// All 11 topics for the question bank preview
const ALL_TOPICS = [
  { name: "Networking", cls: "bg-topic-networking text-topic-networkingText" },
  { name: "Common attacks", cls: "bg-topic-common_attacks text-topic-common_attacksText" },
  { name: "Log analysis", cls: "bg-topic-log_analysis text-topic-log_analysisText" },
  { name: "Incident response", cls: "bg-topic-incident_response text-topic-incident_responseText" },
  { name: "Endpoint security", cls: "bg-topic-endpoint_security text-topic-endpoint_securityText" },
  { name: "Web security", cls: "bg-topic-web_security text-topic-web_securityText" },
  { name: "Cloud security", cls: "bg-topic-cloud_security text-topic-cloud_securityText" },
  { name: "Threat intel", cls: "bg-topic-threat_intel text-topic-threat_intelText" },
  { name: "Splunk", cls: "bg-topic-splunk text-topic-splunkText" },
  { name: "Behavioral", cls: "bg-topic-behavioral text-topic-behavioralText" },
  { name: "Vulnerabilities", cls: "bg-topic-vulnerabilities text-topic-vulnerabilitiesText" },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Hex grid background pattern */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='52' viewBox='0 0 60 52'><path d='M30 1 L58 17 L58 35 L30 51 L2 35 L2 17 Z M30 1 L30 51 M2 17 L58 17 M2 35 L58 35' stroke='%2360a5fa' stroke-width='0.8' fill='none'/></svg>")`,
          backgroundSize: "60px 52px",
        }}
      />

      <header className="border-b border-techy-border bg-techy-surface/40 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Logo />
          <div className="flex gap-4 items-center text-sm">
            <Link href="/auth/login" className="text-techy-muted hover:text-techy-text transition">
              Log in
            </Link>
            <Link
              href="/auth/signup"
              className="px-4 py-2 bg-techy-accent hover:bg-techy-accentHover rounded-md text-white font-medium transition"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 relative z-10">
        {/* Hero with stacked question cards */}
        <section className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-5 gap-10 items-center">
          <div className="md:col-span-3 text-center md:text-left">
            <div className="inline-block px-3 py-1 rounded-full bg-techy-accent/15 text-techy-accentHover text-xs font-medium uppercase tracking-wider mb-6">
              SOC analyst interview prep
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight tracking-tight">
              Get ready for your <span className="bg-gradient-to-r from-techy-accent to-purple-400 bg-clip-text text-transparent">SOC analyst</span> interview
            </h1>
            <p className="text-xl text-techy-muted mb-10 max-w-2xl mx-auto md:mx-0">
              AI-powered interview prep with real-time feedback, mock interviews
              that feel like the real thing, and a study plan personalized to your gaps.
            </p>
            <Link
              href="/diagnostic"
              className="inline-block px-8 py-4 bg-techy-accent hover:bg-techy-accentHover text-white text-lg font-medium rounded-md transition shadow-glow"
            >
              Take the diagnostic. It&apos;s free
            </Link>
            <p className="text-sm text-techy-muted mt-4">
              15 questions, ~15 minutes. No signup until you want to see your score.
            </p>
          </div>

          {/* Stacked question card preview */}
          <div className="md:col-span-2 relative h-[340px]">
            {/* Card 3 back */}
            <div className="absolute top-0 right-0 w-full bg-techy-surface border border-techy-border rounded-lg p-4 opacity-50 transform rotate-2 translate-x-4">
              <div className="flex gap-2 items-center mb-2">
                <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-topic-splunk text-topic-splunkText">
                  Splunk
                </span>
                <span className="inline-block px-2 py-1 rounded text-xs font-medium border bg-difficulty-easyBg text-difficulty-easyText border-difficulty-easyBorder">
                  Easy
                </span>
              </div>
              <div className="text-sm text-techy-muted truncate">
                Write a basic Splunk search for failed Windows logins...
              </div>
            </div>
            {/* Card 2 middle */}
            <div className="absolute top-12 right-0 w-full bg-techy-surface border border-techy-border rounded-lg p-4 opacity-75 transform -rotate-1 translate-x-2">
              <div className="flex gap-2 items-center mb-2">
                <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-topic-common_attacks text-topic-common_attacksText">
                  Common attacks
                </span>
                <span className="inline-block px-2 py-1 rounded text-xs font-medium border bg-difficulty-hardBg text-difficulty-hardText border-difficulty-hardBorder">
                  Hard
                </span>
              </div>
              <div className="text-sm text-techy-muted truncate">
                You see a phishing email reach 200 users. Walk me through...
              </div>
            </div>
            {/* Card 1 front, full content */}
            <div className="absolute top-24 right-0 w-full bg-techy-surface border border-techy-border rounded-lg p-5 shadow-glow">
              <div className="flex gap-2 items-center flex-wrap mb-3">
                <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-topic-networking text-topic-networkingText">
                  Networking
                </span>
                <span className="inline-block px-2 py-1 rounded text-xs font-medium border bg-difficulty-mediumBg text-difficulty-mediumText border-difficulty-mediumBorder">
                  Medium
                </span>
                <span className="font-mono text-xs text-techy-muted ml-auto">NET_003</span>
              </div>
              <div className="text-sm leading-relaxed mb-4 text-techy-text">
                Your SIEM alerts on a host making 247 outbound DNS queries in 60 seconds, all to subdomains of a single domain. What&apos;s happening and what do you do?
              </div>
              <div className="border-t border-techy-border pt-3 mt-3 flex items-center gap-2">
                <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-verdict-strongBg text-verdict-strongText">
                  Strong
                </span>
                <span className="text-xs text-techy-muted">rubric-aligned, interview-ready</span>
              </div>
            </div>
          </div>
        </section>

        {/* Feature cards */}
        <section className="max-w-5xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-6">
          <div className="bg-techy-surface border border-techy-border rounded-lg p-6 hover:border-techy-accent transition">
            <div className="w-12 h-12 rounded-lg bg-techy-accent/15 flex items-center justify-center text-2xl mb-4">
              🎯
            </div>
            <h3 className="font-semibold mb-2 text-lg">Real interview scenarios</h3>
            <p className="text-techy-muted text-sm">
              Scenario questions modeled on what actual SOC interviewers ask: brute force investigation, phishing triage, lateral movement, ransomware.
            </p>
          </div>
          <div className="bg-techy-surface border border-techy-border rounded-lg p-6 hover:border-techy-accent transition">
            <div className="w-12 h-12 rounded-lg bg-purple-500/15 flex items-center justify-center text-2xl mb-4">
              💬
            </div>
            <h3 className="font-semibold mb-2 text-lg">Senior-analyst feedback</h3>
            <p className="text-techy-muted text-sm">
              Sharp, specific feedback on every answer. Not &ldquo;great job&rdquo;. Actually useful critique that points to what to fix.
            </p>
          </div>
          <div className="bg-techy-surface border border-techy-border rounded-lg p-6 hover:border-techy-accent transition">
            <div className="w-12 h-12 rounded-lg bg-orange-500/15 flex items-center justify-center text-2xl mb-4">
              🎤
            </div>
            <h3 className="font-semibold mb-2 text-lg">Mock interviews that feel real</h3>
            <p className="text-techy-muted text-sm">
              30-minute simulated interviews with follow-up pushback and a full report at the end.
            </p>
          </div>
        </section>

        {/* Question bank preview all 11 topics */}
        <section className="max-w-5xl mx-auto px-6 py-16">
          <div className="bg-gradient-to-br from-techy-surface via-techy-surface to-techy-accent/5 border border-techy-border rounded-2xl p-10 text-center">
            <h2 className="text-3xl font-bold mb-2 tracking-tight">157 questions across 11 SOC topics</h2>
            <p className="text-techy-muted text-sm mb-8 max-w-xl mx-auto">
              Conceptual, scenario, tools, and behavioral questions. Filterable by topic and difficulty in the question library.
            </p>
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {ALL_TOPICS.map((t) => (
                <span
                  key={t.name}
                  className={`inline-block px-3 py-1.5 rounded text-xs font-medium ${t.cls}`}
                >
                  {t.name}
                </span>
              ))}
            </div>
            <div className="flex gap-2 justify-center">
              {(["Easy", "Medium", "Hard"] as const).map((d) => (
                <span
                  key={d}
                  className={`inline-block px-3 py-1.5 rounded text-xs font-medium border ${DIFFICULTY_STYLES[d]}`}
                >
                  {d}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="max-w-3xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Ready to start?</h2>
          <p className="text-techy-muted text-lg mb-8">
            Take the diagnostic first to see where you stand, then build a plan from there.
          </p>
          <Link
            href="/diagnostic"
            className="inline-block px-8 py-4 bg-techy-accent hover:bg-techy-accentHover text-white text-lg font-medium rounded-md transition shadow-glow"
          >
            Start your diagnostic
          </Link>
        </section>
      </main>

      <footer className="border-t border-techy-border py-6 text-center text-techy-muted text-sm relative z-10">
        Techy is a personal interview prep tool. Not affiliated with CompTIA, MITRE, or any vendor mentioned.
      </footer>
    </div>
  );
}