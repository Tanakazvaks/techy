# Deployment Guide

This guide walks you through getting Techy running on your own machine, then deploying it to the internet. Total time: ~60-90 minutes if it's your first time doing any of this.

Read it once start-to-finish before doing anything. Then go back and follow it step by step.

---

## Part 0: What you need before starting

- A computer with Node.js installed. Check by opening Terminal and running `node --version`. If it says v18 or higher, you're good. If not, install from [nodejs.org](https://nodejs.org) (LTS version).
- A code editor. [VS Code](https://code.visualstudio.com) is free and fine.
- A GitHub account ([github.com](https://github.com)).
- A credit card for the Anthropic API (Supabase and Vercel have free tiers that don't require payment to start).

---

## Part 1: Set up Supabase (the database)

Supabase gives you a Postgres database, user authentication, and APIs to access them — all wired together. Free tier is generous.

1. Go to [supabase.com](https://supabase.com) and sign up.
2. Click "New Project". 
   - Name: `techy`
   - Database password: generate a strong one and **save it somewhere safe** (you won't need it for the app, but you may want it later for direct DB access).
   - Region: pick whatever's closest to you.
   - Plan: Free.
3. Wait ~2 minutes for the project to provision.
4. Once it's ready, go to the **SQL Editor** (left sidebar).
5. Open the `supabase/schema.sql` file from this codebase. Copy the entire contents.
6. Paste it into the Supabase SQL Editor and click "Run". You should see "Success. No rows returned."
7. To verify: go to "Table Editor" in the left sidebar. You should see tables like `profiles`, `diagnostics`, `sessions`, etc.
8. Get your API credentials. Go to **Settings → API** (gear icon, then API tab). You'll need three values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon / public key** (a long string starting with `eyJ...`)
   - **service_role / secret key** (a different long string — keep this one secret)

Keep this tab open. You'll paste these into your env file in Part 3.

---

## Part 2: Get an Anthropic API key

This is what powers Techy's feedback.

1. Go to [console.anthropic.com](https://console.anthropic.com) and sign up.
2. Click "Get API Keys" and create a new key. **Copy it immediately** — Anthropic only shows it once.
3. Add a payment method (Settings → Billing). The MVP uses the Sonnet model, which costs roughly $3 per million input tokens and $15 per million output. For development you'll probably spend less than $5/month. For a few active users, maybe $20-50/month. Set a usage limit in the console to protect yourself.

---

## Part 3: Run Techy locally

Time to actually start the app on your computer.

1. Open Terminal. Navigate to where you've unzipped this codebase:
   ```bash
   cd path/to/techy
   ```

2. Install dependencies:
   ```bash
   npm install
   ```
   This downloads everything Techy needs (~2 minutes).

3. Create your environment file. Copy the template:
   ```bash
   cp .env.example .env.local
   ```

4. Open `.env.local` in your editor. Fill in the values you collected:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your anon key...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...your service role key...
   ANTHROPIC_API_KEY=sk-ant-...your anthropic key...
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```
   Save the file.

5. Start the dev server:
   ```bash
   npm run dev
   ```
   You should see "Ready in X seconds" and a URL like `http://localhost:3000`.

6. Open `http://localhost:3000` in your browser. You should see Techy's landing page.

7. **Test the full flow**:
   - Click "Take the diagnostic"
   - Answer 2 questions
   - Sign up when prompted (use a real email — Supabase will send a confirmation)
   - **Important**: Go to your Supabase project → Authentication → Users, find yourself, and click the three dots to confirm your email manually (or check your inbox).
   - Come back and finish the diagnostic
   - See your readiness report
   - Try a session

If everything works locally, great — time to deploy.

### Troubleshooting local issues

- **"npm install" fails**: Make sure Node version is 18+. Try `rm -rf node_modules package-lock.json && npm install`.
- **"Unauthorized" errors**: Your env vars are wrong. Double-check they match Supabase exactly. Restart the dev server (Ctrl+C, then `npm run dev`) after editing `.env.local`.
- **"Failed to evaluate"**: Your Anthropic key is wrong or out of credit. Check the console.
- **Pages load but nothing happens on click**: Open browser DevTools (F12), check the Console tab for errors. Most issues will be visible there.

---

## Part 4: Deploy to Vercel

Vercel hosts Next.js apps for free with one-click deployment from GitHub.

### 4a. Push your code to GitHub

1. Go to [github.com](https://github.com), create a new private repository called `techy`. Don't initialize it with anything.
2. In your Terminal, from the techy folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/techy.git
   git push -u origin main
   ```
   Replace `YOUR-USERNAME` with your actual GitHub username. You may need to enter a personal access token if it asks for a password — GitHub explains how at [docs.github.com/authentication](https://docs.github.com/en/authentication).

### 4b. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up with your GitHub account.
2. Click "Add New" → "Project".
3. Find your `techy` repository and click "Import".
4. **Framework Preset**: Vercel should auto-detect Next.js. Leave defaults.
5. **Environment Variables**: This is the important part. Add each of these (the same values from your `.env.local`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ANTHROPIC_API_KEY`
   - `NEXT_PUBLIC_APP_URL` — you don't know the URL yet, so put `https://techy.vercel.app` for now. You'll update it after deploy.
6. Click "Deploy". Wait ~2 minutes.
7. Vercel gives you a URL like `https://techy-abc123.vercel.app`. Click to open.
8. Update `NEXT_PUBLIC_APP_URL` in Vercel settings to match this URL. Redeploy (Vercel → Deployments → click the latest → Redeploy).

### 4c. Configure Supabase for your production URL

By default Supabase only allows auth callbacks from `localhost:3000`. You need to add your Vercel URL.

1. Go to Supabase → Authentication → URL Configuration
2. Add your Vercel URL to "Site URL" and "Redirect URLs"
3. Save

---

## Part 5: Day-to-day operations

### How to update code after deploying

Every time you push to GitHub's main branch, Vercel auto-redeploys. So your workflow is:

```bash
# Edit code locally
npm run dev          # Test it
git add .
git commit -m "Describe what changed"
git push             # Auto-deploys to Vercel
```

### How to view errors in production

- Vercel Dashboard → your project → Logs. Shows API route errors, deployment failures, runtime exceptions.
- Supabase Dashboard → Logs. Shows database queries, auth events, RLS denials.
- Anthropic Console → Usage. Shows API spend and any errors from Claude.

### How to view user data

Supabase → Table Editor lets you see every row. You can manually edit records here if a user reports their score is broken or whatever. Helpful for debugging.

### Cost monitoring

Check weekly:
- **Anthropic Console** → Usage. Set a monthly limit to cap spending.
- **Vercel** → Usage. Free tier is 100GB bandwidth/month — plenty for small audiences.
- **Supabase** → Project settings → Usage. Free tier is 500MB DB and 2GB bandwidth.

If costs grow because of users, that's a good problem — you'll have signal that you're providing value, and you can decide whether to add paid tiers.

### What to do when something breaks

1. Reproduce locally first if possible (run `npm run dev` and try the same flow).
2. Check Vercel logs for the error message.
3. Most common issues:
   - **Auth not working**: Check Supabase URL config and env vars.
   - **Feedback never arrives**: Anthropic API key issue or out of credit.
   - **Database errors**: Check RLS policies in Supabase. They're strict by design.

### Backups

Supabase auto-backs-up your database daily on the free tier (kept for 7 days). For paid tier you get longer retention. Your code is backed up via GitHub.

### Improving the product

Three places to focus when you want to make Techy better:

1. **`lib/prompt.ts`** — the Techy system prompt. Tweak how it evaluates answers, what tone it uses, how it pushes back. This is the highest-leverage file in the codebase.
2. **`data/questions.json`** — add more questions, refine rubrics. The starter bank has 30; you have 119 more from our conversation transcript to add.
3. **User feedback flags** — when users hit the thumbs-down button on feedback, currently the app just acknowledges. Build a `/api/flag` route that writes those flags to a database table, and review weekly to find prompt or rubric issues.

---

## Final notes

You are now responsible for the code, the data, and the costs. The buck stops with you — if a user's data leaks, that's on you; if the bill spikes, that's on you. None of that is reason to panic. It's reason to:

- Read your code before pushing it
- Set spending limits in Anthropic
- Make sure RLS is on for all tables (the schema does this — don't disable it)
- Don't share your `.env.local` file or service role key
- Don't paste credentials into chat tools (including this one)

Welcome to running software in production. It's mostly straightforward and occasionally annoying. You'll be fine.
