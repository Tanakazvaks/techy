# Techy — SOC Analyst Interview Prep

AI-powered interview preparation for entry-level SOC Analyst roles. Built with Next.js, Supabase, and Anthropic's Claude API.

## What's in this codebase

```
techy/
├── app/                      # Next.js pages and API routes
│   ├── api/
│   │   ├── diagnostic/      # Evaluates the 15-question diagnostic
│   │   ├── session/         # Evaluates a single practice answer
│   │   └── mock/            # Generates mock interview report
│   ├── auth/                # Signup and login pages
│   ├── diagnostic/          # Diagnostic flow + results
│   ├── dashboard/           # Main app dashboard
│   ├── session/             # Daily study session
│   ├── mock/                # Mock interview flow
│   ├── library/             # Browse all questions
│   ├── settings/            # Account settings
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Landing page
│   └── globals.css          # Global styles
├── lib/                      # Shared utilities
│   ├── anthropic.ts         # Claude API client
│   ├── prompt.ts            # The Techy v2.2 system prompt
│   ├── questions.ts         # Question loading and selection
│   ├── scoring.ts           # Readiness score calculation
│   ├── supabase-client.ts   # Browser-side Supabase client
│   └── supabase-server.ts   # Server-side Supabase client
├── data/
│   └── questions.json       # The SOC question bank
├── supabase/
│   └── schema.sql           # Database schema (run in Supabase SQL editor)
└── ...config files
```

## The core flow

1. User lands on `/` → clicks "Take the diagnostic"
2. Answers 15 questions at `/diagnostic`
3. After question 2, prompted to sign up at `/auth/signup`
4. After question 15, responses are sent to `/api/diagnostic`, which evaluates each one with Claude and computes a readiness score
5. User sees `/diagnostic/results` (their readiness report)
6. User lands on `/dashboard`, which shows their next session
7. Clicking "Start session" goes to `/session`, where they answer questions one at a time and get immediate feedback via `/api/session`
8. After 5 sessions, mock interviews unlock at `/mock`
9. Mock interview ends with a Claude-generated report

## The brain

The Techy persona lives in `lib/prompt.ts`. It's the v2.2 system prompt — refined through testing — that defines how Claude evaluates answers, gives feedback, and behaves across modes.

The question bank in `data/questions.json` is the second half of the brain. Each question has a model answer and a rubric that gets passed into the prompt at evaluation time, so Claude has ground truth to evaluate against.

To improve the product, focus on these two files first.

## Adding more questions

The starter bank has 30 questions. Add more by appending to `data/questions.json` in the same format. The diagnostic, sessions, and mock interviews automatically pick from the available questions.

When adding questions, set:
- `diagnostic_eligible: true` for questions appropriate for the diagnostic (clear, foundational, well-defined rubric)
- `is_stretch: true` for harder questions you don't want surfaced too early

## Running locally

See `DEPLOY.md` for full setup instructions.

Quick version:
1. `npm install`
2. Copy `.env.example` to `.env.local`, fill in your Supabase and Anthropic credentials
3. Run the SQL in `supabase/schema.sql` in your Supabase project
4. `npm run dev`

## Deploying

Recommended: Vercel (free tier).

```bash
# Push to GitHub, then connect the repo to Vercel
# Add your environment variables in Vercel's dashboard
# Deploy
```

See `DEPLOY.md` for step-by-step.

## Costs to expect

- **Vercel**: Free for personal projects
- **Supabase**: Free up to 500MB database (plenty for thousands of users)
- **Anthropic API**: Pay-per-use. With the current setup, expect roughly:
  - $0.005-0.01 per practice question evaluation
  - $0.10-0.20 per full diagnostic (15 evaluations)
  - $0.15-0.30 per mock interview report
  
  For a single user doing daily sessions, that's maybe $5-15/month in API costs. Watch your usage in the Anthropic console.

## What's missing (intentionally)

This MVP doesn't include:
- Voice input/output (text only for v1)
- Payment/subscription billing (you said 30 days free for everyone)
- Email notifications
- Mobile app (web is responsive enough)
- Spaced repetition surfacing (the queue is built, but the dashboard doesn't yet pull from it — easy to add)
- Lesson content (questions only for v1; users can ask Techy to explain concepts inline)

These are reasonable v2 additions once you have real users and signal.

## Modifying the system prompt

Edit `lib/prompt.ts` and the changes take effect immediately. Test changes in `/session` with real questions before deploying to all users. Keep the prompt versioned in git so you can roll back.

## Modifying scoring

The readiness score logic is in `lib/scoring.ts` and the calculation happens in API routes. The current formula is a rolling weighted average:
- New score = 0.9 × current average + 0.1 × latest session score (for practice)
- New score = 0.7 × current average + 0.3 × mock score (for mock interviews)

You can tune these weights as you see how scores behave with real users.

## Quality improvement loop

Users can flag bad feedback via the thumbs-down button in study sessions. Right now this just acknowledges client-side. Add an API route (`/api/flag`) that writes to a `feedback_flags` table — review these weekly to improve the prompt and question rubrics.

## Questions?

Everything in this codebase is designed to be readable. Start with `app/page.tsx` and follow the user flow. The complex parts (LLM integration, scoring) are isolated in `lib/` so you can reason about them separately.
