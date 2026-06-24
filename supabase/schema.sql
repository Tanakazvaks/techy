-- Techy database schema
-- Run this in Supabase SQL Editor after creating your project.

-- =====================================================
-- USERS PROFILE TABLE
-- (Supabase manages auth.users separately; this stores app-specific fields)
-- =====================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  interview_date date,
  target_role text default 'tier1',
  target_company text,
  streak_count int default 0,
  last_session_date date,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- =====================================================
-- DIAGNOSTICS
-- =====================================================
create table public.diagnostics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  started_at timestamp with time zone default now(),
  completed_at timestamp with time zone,
  overall_score int,
  breakdown jsonb,
  weak_areas text[]
);

create table public.diagnostic_responses (
  id uuid primary key default gen_random_uuid(),
  diagnostic_id uuid not null references public.diagnostics(id) on delete cascade,
  question_id text not null,
  user_answer text,
  verdict text,
  score int,
  rubric_hits jsonb,
  time_spent_sec int,
  answered_at timestamp with time zone default now()
);

-- =====================================================
-- STUDY PLANS
-- =====================================================
create table public.study_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  generated_at timestamp with time zone default now(),
  target_weeks int default 4,
  status text default 'active',
  daily_topics jsonb
);

-- =====================================================
-- SESSIONS
-- =====================================================
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  study_plan_id uuid references public.study_plans(id) on delete set null,
  type text not null default 'study',
  scheduled_for date default current_date,
  started_at timestamp with time zone default now(),
  completed_at timestamp with time zone,
  duration_actual_sec int,
  topics_covered text[],
  questions_attempted int default 0,
  questions_correct int default 0,
  session_summary jsonb
);

create table public.session_attempts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  question_id text not null,
  attempt_number int default 1,
  user_answer text,
  verdict text,
  techy_feedback text,
  rubric_hits jsonb,
  time_spent_sec int,
  flagged_bad_feedback boolean default false,
  flag_reason text,
  answered_at timestamp with time zone default now()
);

-- =====================================================
-- MOCK INTERVIEWS
-- =====================================================
create table public.mock_interviews (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  question_ids text[],
  final_score int,
  final_verdict text,
  strengths text[],
  weaknesses text[],
  verbal_habits text[],
  study_recommendations text[],
  duration_sec int,
  created_at timestamp with time zone default now()
);

-- =====================================================
-- READINESS SCORES (history)
-- =====================================================
create table public.readiness_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  score int not null,
  calculated_at timestamp with time zone default now(),
  trigger_event text
);

-- =====================================================
-- SPACED REPETITION QUEUE
-- =====================================================
create table public.spaced_rep_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  question_id text not null,
  next_due_date date not null,
  interval_days int default 1,
  last_attempt_verdict text,
  last_attempted_at timestamp with time zone,
  unique(user_id, question_id)
);

-- =====================================================
-- INDEXES for query performance
-- =====================================================
create index idx_diagnostics_user on public.diagnostics(user_id);
create index idx_sessions_user_date on public.sessions(user_id, scheduled_for);
create index idx_session_attempts_session on public.session_attempts(session_id);
create index idx_readiness_user_time on public.readiness_scores(user_id, calculated_at desc);
create index idx_spaced_rep_due on public.spaced_rep_queue(user_id, next_due_date);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- Critical: this ensures users can only see their own data.
-- =====================================================
alter table public.profiles enable row level security;
alter table public.diagnostics enable row level security;
alter table public.diagnostic_responses enable row level security;
alter table public.study_plans enable row level security;
alter table public.sessions enable row level security;
alter table public.session_attempts enable row level security;
alter table public.mock_interviews enable row level security;
alter table public.readiness_scores enable row level security;
alter table public.spaced_rep_queue enable row level security;

-- Profiles: users can read/update their own
create policy "Users see own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users update own profile" on public.profiles
  for update using (auth.uid() = id);
create policy "Users insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Diagnostics
create policy "Users see own diagnostics" on public.diagnostics
  for all using (auth.uid() = user_id);

create policy "Users see own diagnostic responses" on public.diagnostic_responses
  for all using (
    exists (
      select 1 from public.diagnostics
      where diagnostics.id = diagnostic_responses.diagnostic_id
      and diagnostics.user_id = auth.uid()
    )
  );

-- Study plans
create policy "Users see own study plans" on public.study_plans
  for all using (auth.uid() = user_id);

-- Sessions
create policy "Users see own sessions" on public.sessions
  for all using (auth.uid() = user_id);

create policy "Users see own session attempts" on public.session_attempts
  for all using (
    exists (
      select 1 from public.sessions
      where sessions.id = session_attempts.session_id
      and sessions.user_id = auth.uid()
    )
  );

-- Mock interviews
create policy "Users see own mock interviews" on public.mock_interviews
  for all using (auth.uid() = user_id);

-- Readiness scores
create policy "Users see own readiness" on public.readiness_scores
  for all using (auth.uid() = user_id);

-- Spaced repetition
create policy "Users see own spaced rep" on public.spaced_rep_queue
  for all using (auth.uid() = user_id);

-- =====================================================
-- TRIGGER: auto-create profile when user signs up
-- =====================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
