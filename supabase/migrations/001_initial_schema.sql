-- ============================================================
-- ADMITMIND AI - INITIAL SUPABASE DATABASE SCHEMA
-- ============================================================

create extension if not exists pgcrypto;

-- ============================================================
-- UPDATED_AT HELPER
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- PROFILES
-- ============================================================

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  age integer,
  country text not null default '',
  education_level text not null default 'high_school',
  graduation_year integer,
  intended_university_country text not null default '',
  intended_major text not null default '',
  gpa numeric(5,2),
  test_scores jsonb not null default '{}'::jsonb,
  budget_usd numeric(12,2),
  preferred_size text not null default 'no_preference',
  preferred_location text not null default '',
  academic_interests text[] not null default '{}',
  career_interests text[] not null default '{}',
  interested_countries text[] not null default '{}',
  considering_universities text[] not null default '{}',
  desired_degree text not null default 'bachelor',
  enroll_term text not null default '',
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- USER SETTINGS
-- ============================================================

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  notifications_enabled boolean not null default true,
  deadline_reminders boolean not null default true,
  streak_reminders boolean not null default true,
  appearance text not null default 'system',
  ai_tone text not null default 'detailed',
  share_analytics boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- UNIVERSITIES
-- Global catalog - users can read, normal users cannot modify
-- ============================================================

create table if not exists public.universities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text not null,
  city text not null default '',
  size text not null default 'no_preference',
  programs text[] not null default '{}',
  tuition_usd_min numeric(12,2),
  tuition_usd_max numeric(12,2),
  acceptance_note text,
  deadlines jsonb not null default '[]'::jsonb,
  requirements text[] not null default '{}',
  scholarship_notes text,
  degree_levels text[] not null default '{}',
  official_url text,
  tags text[] not null default '{}',
  source_url text,
  source_name text,
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists universities_country_idx
  on public.universities(country);

create index if not exists universities_name_idx
  on public.universities(name);

-- ============================================================
-- SAVED UNIVERSITIES
-- ============================================================

create table if not exists public.saved_universities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  university_id uuid not null references public.universities(id) on delete cascade,
  notes text,
  created_at timestamptz not null default now(),
  unique(user_id, university_id)
);

create index if not exists saved_universities_user_idx
  on public.saved_universities(user_id);

-- ============================================================
-- APPLICATIONS
-- ============================================================

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  university_id uuid references public.universities(id) on delete set null,
  university_name text not null default '',
  program text not null default '',
  status text not null default 'planning',
  deadline timestamptz,
  submitted_at timestamptz,
  essay_status text not null default 'not_started',
  recommendation_status text not null default 'not_requested',
  test_requirements jsonb not null default '{}'::jsonb,
  scholarship_status text not null default 'not_started',
  notes text not null default '',
  documents jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists applications_user_idx
  on public.applications(user_id);

create index if not exists applications_deadline_idx
  on public.applications(deadline);

-- ============================================================
-- APPLICATION TASKS
-- ============================================================

create table if not exists public.application_tasks (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  title text not null,
  done boolean not null default false,
  due_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists application_tasks_application_idx
  on public.application_tasks(application_id);

-- ============================================================
-- ESSAYS
-- ============================================================

create table if not exists public.essays (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '',
  type text not null default 'other',
  body text not null default '',
  university_name text,
  saved_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists essays_user_idx
  on public.essays(user_id);

-- ============================================================
-- ESSAY REVIEWS
-- ============================================================

create table if not exists public.essay_reviews (
  id uuid primary key default gen_random_uuid(),
  essay_id uuid not null references public.essays(id) on delete cascade,
  created_at timestamptz not null default now(),
  source text not null default 'local_heuristic',
  structure numeric,
  clarity numeric,
  grammar numeric,
  storytelling numeric,
  specificity numeric,
  authenticity numeric,
  strengths text[] not null default '{}',
  weaknesses text[] not null default '{}',
  suggestions text[] not null default '{}',
  scores jsonb not null default '{}'::jsonb
);

create index if not exists essay_reviews_essay_idx
  on public.essay_reviews(essay_id);

-- ============================================================
-- ESSAY REVISIONS
-- ============================================================

create table if not exists public.essay_revisions (
  id uuid primary key default gen_random_uuid(),
  essay_id uuid not null references public.essays(id) on delete cascade,
  body text not null default '',
  saved_at timestamptz not null default now(),
  note text
);

create index if not exists essay_revisions_essay_idx
  on public.essay_revisions(essay_id);

-- ============================================================
-- SCHOLARSHIPS
-- ============================================================

create table if not exists public.scholarships (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text not null,
  university text,
  field text not null default '',
  degree_level text not null default 'bachelor',
  eligibility text not null default '',
  deadline timestamptz,
  funding_amount numeric(14,2),
  description text not null default '',
  official_url text,
  source_url text,
  source_name text,
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists scholarships_country_idx
  on public.scholarships(country);

create index if not exists scholarships_deadline_idx
  on public.scholarships(deadline);

-- ============================================================
-- SAVED SCHOLARSHIPS
-- ============================================================

create table if not exists public.saved_scholarships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scholarship_id uuid not null references public.scholarships(id) on delete cascade,
  status text not null default 'saved',
  created_at timestamptz not null default now(),
  unique(user_id, scholarship_id)
);

create index if not exists saved_scholarships_user_idx
  on public.saved_scholarships(user_id);

-- ============================================================
-- RECOMMENDATIONS
-- ============================================================

create table if not exists public.recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recommender_name text not null default '',
  institution text not null default '',
  email text,
  requested_at timestamptz,
  deadline timestamptz,
  status text not null default 'not_requested',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists recommendations_user_idx
  on public.recommendations(user_id);

-- ============================================================
-- DEADLINES
-- ============================================================

create table if not exists public.deadlines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  kind text not null default 'personal',
  due_at timestamptz not null,
  related_id uuid,
  reminder_hours_before integer not null default 24,
  completed boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists deadlines_user_idx
  on public.deadlines(user_id);

create index if not exists deadlines_due_idx
  on public.deadlines(due_at);

-- ============================================================
-- INTERVIEW SESSIONS
-- ============================================================

create table if not exists public.interview_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  university_name text not null default '',
  program text not null default '',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists interview_sessions_user_idx
  on public.interview_sessions(user_id);

-- ============================================================
-- INTERVIEW QUESTIONS
-- ============================================================

create table if not exists public.interview_questions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.interview_sessions(id) on delete cascade,
  prompt text not null,
  answer text,
  feedback jsonb,
  question_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists interview_questions_session_idx
  on public.interview_questions(session_id);

-- ============================================================
-- FLASHCARD DECKS
-- ============================================================

create table if not exists public.flashcard_decks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  subject text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists flashcard_decks_user_idx
  on public.flashcard_decks(user_id);

-- ============================================================
-- FLASHCARDS
-- ============================================================

create table if not exists public.flashcards (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid not null references public.flashcard_decks(id) on delete cascade,
  front text not null,
  back text not null,
  difficulty text not null default 'medium',
  next_review_at timestamptz,
  interval_days numeric not null default 0,
  ease numeric not null default 2.5,
  reviews integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists flashcards_deck_idx
  on public.flashcards(deck_id);

create index if not exists flashcards_review_idx
  on public.flashcards(next_review_at);

-- ============================================================
-- MEMORY PALACES
-- ============================================================

create table if not exists public.memory_palaces (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists memory_palaces_user_idx
  on public.memory_palaces(user_id);

-- ============================================================
-- MEMORY PALACE LOCATIONS
-- ============================================================

create table if not exists public.memory_palace_locations (
  id uuid primary key default gen_random_uuid(),
  palace_id uuid not null references public.memory_palaces(id) on delete cascade,
  name text not null,
  concept text not null default '',
  notes text not null default '',
  icon text not null default '',
  location_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists memory_palace_locations_palace_idx
  on public.memory_palace_locations(palace_id);

-- ============================================================
-- STUDY PLANS
-- ============================================================

create table if not exists public.study_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null default '',
  exam_date timestamptz,
  current_knowledge text not null default '',
  hours_per_week numeric not null default 0,
  target_grade text not null default '',
  topics text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists study_plans_user_idx
  on public.study_plans(user_id);

-- ============================================================
-- STUDY PLAN TASKS
-- ============================================================

create table if not exists public.study_plan_tasks (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.study_plans(id) on delete cascade,
  task_date date not null,
  title text not null,
  kind text not null default 'study',
  minutes integer not null default 0,
  done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists study_plan_tasks_plan_idx
  on public.study_plan_tasks(plan_id);

create index if not exists study_plan_tasks_date_idx
  on public.study_plan_tasks(task_date);

-- ============================================================
-- STUDY SESSIONS
-- ============================================================

create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date timestamptz not null default now(),
  minutes integer not null default 0,
  subject text not null default '',
  source text not null default 'manual',
  created_at timestamptz not null default now()
);

create index if not exists study_sessions_user_idx
  on public.study_sessions(user_id);

create index if not exists study_sessions_date_idx
  on public.study_sessions(date);

-- ============================================================
-- QUIZZES
-- ============================================================

create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  subject text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists quizzes_user_idx
  on public.quizzes(user_id);

-- ============================================================
-- QUIZ QUESTIONS
-- ============================================================

create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  type text not null default 'multiple_choice',
  prompt text not null,
  options text[] not null default '{}',
  answer text not null default '',
  topic text not null default '',
  question_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists quiz_questions_quiz_idx
  on public.quiz_questions(quiz_id);

-- ============================================================
-- QUIZ ATTEMPTS
-- ============================================================

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  score numeric(6,2) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists quiz_attempts_user_idx
  on public.quiz_attempts(user_id);

create index if not exists quiz_attempts_quiz_idx
  on public.quiz_attempts(quiz_id);

-- ============================================================
-- QUIZ ANSWERS
-- ============================================================

create table if not exists public.quiz_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.quiz_attempts(id) on delete cascade,
  question_id uuid not null references public.quiz_questions(id) on delete cascade,
  response text not null default '',
  correct boolean not null default false,
  created_at timestamptz not null default now(),
  unique(attempt_id, question_id)
);

create index if not exists quiz_answers_attempt_idx
  on public.quiz_answers(attempt_id);

-- ============================================================
-- EXAMS
-- ============================================================

create table if not exists public.exams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exam_name text not null,
  exam_date timestamptz,
  subject text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists exams_user_idx
  on public.exams(user_id);

-- ============================================================
-- CONVERSATIONS
-- ============================================================

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null default '',
  difficulty text not null default 'standard',
  title text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists conversations_user_idx
  on public.conversations(user_id);

-- ============================================================
-- MESSAGES
-- ============================================================

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role text not null,
  content text not null,
  created_at timestamptz not null default now(),
  meta jsonb
);

create index if not exists messages_conversation_idx
  on public.messages(conversation_id);

create index if not exists messages_created_idx
  on public.messages(created_at);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text not null,
  created_at timestamptz not null default now(),
  read boolean not null default false,
  href text
);

create index if not exists notifications_user_idx
  on public.notifications(user_id);

create index if not exists notifications_unread_idx
  on public.notifications(user_id, read);

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================

create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'free',
  status text not null default 'inactive',
  current_period_end timestamptz,
  provider text not null default 'none',
  provider_customer_id text,
  provider_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- GAMIFICATION
-- ============================================================

create table if not exists public.gamification (
  user_id uuid primary key references auth.users(id) on delete cascade,
  xp integer not null default 0,
  level integer not null default 1,
  streak integer not null default 0,
  last_study_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- ACHIEVEMENTS
-- ============================================================

create table if not exists public.achievements (
  id text primary key,
  title text not null,
  description text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.user_achievements (
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_id text not null references public.achievements(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  primary key(user_id, achievement_id)
);

create index if not exists user_achievements_user_idx
  on public.user_achievements(user_id);

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists user_settings_updated_at on public.user_settings;
create trigger user_settings_updated_at
before update on public.user_settings
for each row execute function public.set_updated_at();

drop trigger if exists universities_updated_at on public.universities;
create trigger universities_updated_at
before update on public.universities
for each row execute function public.set_updated_at();

drop trigger if exists applications_updated_at on public.applications;
create trigger applications_updated_at
before update on public.applications
for each row execute function public.set_updated_at();

drop trigger if exists application_tasks_updated_at on public.application_tasks;
create trigger application_tasks_updated_at
before update on public.application_tasks
for each row execute function public.set_updated_at();

drop trigger if exists essays_updated_at on public.essays;
create trigger essays_updated_at
before update on public.essays
for each row execute function public.set_updated_at();

drop trigger if exists essay_revisions_updated_at on public.essay_revisions;
create trigger essay_revisions_updated_at
before update on public.essay_revisions
for each row execute function public.set_updated_at();

drop trigger if exists scholarships_updated_at on public.scholarships;
create trigger scholarships_updated_at
before update on public.scholarships
for each row execute function public.set_updated_at();

drop trigger if exists recommendations_updated_at on public.recommendations;
create trigger recommendations_updated_at
before update on public.recommendations
for each row execute function public.set_updated_at();

drop trigger if exists deadlines_updated_at on public.deadlines;
create trigger deadlines_updated_at
before update on public.deadlines
for each row execute function public.set_updated_at();

drop trigger if exists flashcard_decks_updated_at on public.flashcard_decks;
create trigger flashcard_decks_updated_at
before update on public.flashcard_decks
for each row execute function public.set_updated_at();

drop trigger if exists flashcards_updated_at on public.flashcards;
create trigger flashcards_updated_at
before update on public.flashcards
for each row execute function public.set_updated_at();

drop trigger if exists memory_palaces_updated_at on public.memory_palaces;
create trigger memory_palaces_updated_at
before update on public.memory_palaces
for each row execute function public.set_updated_at();

drop trigger if exists memory_palace_locations_updated_at on public.memory_palace_locations;
create trigger memory_palace_locations_updated_at
before update on public.memory_palace_locations
for each row execute function public.set_updated_at();

drop trigger if exists study_plans_updated_at on public.study_plans;
create trigger study_plans_updated_at
before update on public.study_plans
for each row execute function public.set_updated_at();

drop trigger if exists study_plan_tasks_updated_at on public.study_plan_tasks;
create trigger study_plan_tasks_updated_at
before update on public.study_plan_tasks
for each row execute function public.set_updated_at();

drop trigger if exists quizzes_updated_at on public.quizzes;
create trigger quizzes_updated_at
before update on public.quizzes
for each row execute function public.set_updated_at();

drop trigger if exists exams_updated_at on public.exams;
create trigger exams_updated_at
before update on public.exams
for each row execute function public.set_updated_at();

drop trigger if exists conversations_updated_at on public.conversations;
create trigger conversations_updated_at
before update on public.conversations
for each row execute function public.set_updated_at();

drop trigger if exists subscriptions_updated_at on public.subscriptions;
create trigger subscriptions_updated_at
before update on public.subscriptions
for each row execute function public.set_updated_at();

drop trigger if exists gamification_updated_at on public.gamification;
create trigger gamification_updated_at
before update on public.gamification
for each row execute function public.set_updated_at();

-- ============================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.universities enable row level security;
alter table public.saved_universities enable row level security;
alter table public.applications enable row level security;
alter table public.application_tasks enable row level security;
alter table public.essays enable row level security;
alter table public.essay_reviews enable row level security;
alter table public.essay_revisions enable row level security;
alter table public.scholarships enable row level security;
alter table public.saved_scholarships enable row level security;
alter table public.recommendations enable row level security;
alter table public.deadlines enable row level security;
alter table public.interview_sessions enable row level security;
alter table public.interview_questions enable row level security;
alter table public.flashcard_decks enable row level security;
alter table public.flashcards enable row level security;
alter table public.memory_palaces enable row level security;
alter table public.memory_palace_locations enable row level security;
alter table public.study_plans enable row level security;
alter table public.study_plan_tasks enable row level security;
alter table public.study_sessions enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.quiz_answers enable row level security;
alter table public.exams enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.subscriptions enable row level security;
alter table public.gamification enable row level security;
alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;

-- ============================================================
-- PROFILE POLICIES
-- ============================================================

create policy "Users can view own profile"
on public.profiles for select
using (user_id = auth.uid());

create policy "Users can create own profile"
on public.profiles for insert
with check (user_id = auth.uid());

create policy "Users can update own profile"
on public.profiles for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Users can delete own profile"
on public.profiles for delete
using (user_id = auth.uid());

-- ============================================================
-- SETTINGS POLICIES
-- ============================================================

create policy "Users can view own settings"
on public.user_settings for select
using (user_id = auth.uid());

create policy "Users can create own settings"
on public.user_settings for insert
with check (user_id = auth.uid());

create policy "Users can update own settings"
on public.user_settings for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Users can delete own settings"
on public.user_settings for delete
using (user_id = auth.uid());

-- ============================================================
-- UNIVERSITY POLICIES
-- ============================================================

create policy "Authenticated users can view universities"
on public.universities for select
to authenticated
using (true);

-- ============================================================
-- SAVED UNIVERSITY POLICIES
-- ============================================================

create policy "Users can view own saved universities"
on public.saved_universities for select
using (user_id = auth.uid());

create policy "Users can save universities"
on public.saved_universities for insert
with check (user_id = auth.uid());

create policy "Users can remove saved universities"
on public.saved_universities for delete
using (user_id = auth.uid());

-- ============================================================
-- APPLICATION POLICIES
-- ============================================================

create policy "Users can view own applications"
on public.applications for select
using (user_id = auth.uid());

create policy "Users can create own applications"
on public.applications for insert
with check (user_id = auth.uid());

create policy "Users can update own applications"
on public.applications for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Users can delete own applications"
on public.applications for delete
using (user_id = auth.uid());

-- ============================================================
-- APPLICATION TASK POLICIES
-- ============================================================

create policy "Users can view own application tasks"
on public.application_tasks for select
using (
  exists (
    select 1
    from public.applications a
    where a.id = application_tasks.application_id
      and a.user_id = auth.uid()
  )
);

create policy "Users can create own application tasks"
on public.application_tasks for insert
with check (
  exists (
    select 1
    from public.applications a
    where a.id = application_tasks.application_id
      and a.user_id = auth.uid()
  )
);

create policy "Users can update own application tasks"
on public.application_tasks for update
using (
  exists (
    select 1
    from public.applications a
    where a.id = application_tasks.application_id
      and a.user_id = auth.uid()
  )
);

create policy "Users can delete own application tasks"
on public.application_tasks for delete
using (
  exists (
    select 1
    from public.applications a
    where a.id = application_tasks.application_id
      and a.user_id = auth.uid()
  )
);

-- ============================================================
-- ESSAY POLICIES
-- ============================================================

create policy "Users can view own essays"
on public.essays for select
using (user_id = auth.uid());

create policy "Users can create own essays"
on public.essays for insert
with check (user_id = auth.uid());

create policy "Users can update own essays"
on public.essays for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Users can delete own essays"
on public.essays for delete
using (user_id = auth.uid());

-- ============================================================
-- ESSAY REVIEW POLICIES
-- ============================================================

create policy "Users can view own essay reviews"
on public.essay_reviews for select
using (
  exists (
    select 1
    from public.essays e
    where e.id = essay_reviews.essay_id
      and e.user_id = auth.uid()
  )
);

create policy "Users can create own essay reviews"
on public.essay_reviews for insert
with check (
  exists (
    select 1
    from public.essays e
    where e.id = essay_reviews.essay_id
      and e.user_id = auth.uid()
  )
);

create policy "Users can delete own essay reviews"
on public.essay_reviews for delete
using (
  exists (
    select 1
    from public.essays e
    where e.id = essay_reviews.essay_id
      and e.user_id = auth.uid()
  )
);

-- ============================================================
-- ESSAY REVISION POLICIES
-- ============================================================

create policy "Users can manage own essay revisions"
on public.essay_revisions for all
using (
  exists (
    select 1
    from public.essays e
    where e.id = essay_revisions.essay_id
      and e.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.essays e
    where e.id = essay_revisions.essay_id
      and e.user_id = auth.uid()
  )
);

-- ============================================================
-- SCHOLARSHIP POLICIES
-- ============================================================

create policy "Authenticated users can view scholarships"
on public.scholarships for select
to authenticated
using (true);

-- ============================================================
-- SAVED SCHOLARSHIP POLICIES
-- ============================================================

create policy "Users can view own saved scholarships"
on public.saved_scholarships for select
using (user_id = auth.uid());

create policy "Users can save scholarships"
on public.saved_scholarships for insert
with check (user_id = auth.uid());

create policy "Users can update own saved scholarships"
on public.saved_scholarships for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Users can delete saved scholarships"
on public.saved_scholarships for delete
using (user_id = auth.uid());

-- ============================================================
-- RECOMMENDATION POLICIES
-- ============================================================

create policy "Users can manage own recommendations"
on public.recommendations for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- ============================================================
-- DEADLINE POLICIES
-- ============================================================

create policy "Users can manage own deadlines"
on public.deadlines for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- ============================================================
-- INTERVIEW POLICIES
-- ============================================================

create policy "Users can manage own interviews"
on public.interview_sessions for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Users can manage own interview questions"
on public.interview_questions for all
using (
  exists (
    select 1
    from public.interview_sessions s
    where s.id = interview_questions.session_id
      and s.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.interview_sessions s
    where s.id = interview_questions.session_id
      and s.user_id = auth.uid()
  )
);

-- ============================================================
-- FLASHCARD POLICIES
-- ============================================================

create policy "Users can manage own flashcard decks"
on public.flashcard_decks for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Users can manage own flashcards"
on public.flashcards for all
using (
  exists (
    select 1
    from public.flashcard_decks d
    where d.id = flashcards.deck_id
      and d.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.flashcard_decks d
    where d.id = flashcards.deck_id
      and d.user_id = auth.uid()
  )
);

-- ============================================================
-- MEMORY PALACE POLICIES
-- ============================================================

create policy "Users can manage own memory palaces"
on public.memory_palaces for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Users can manage own palace locations"
on public.memory_palace_locations for all
using (
  exists (
    select 1
    from public.memory_palaces p
    where p.id = memory_palace_locations.palace_id
      and p.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.memory_palaces p
    where p.id = memory_palace_locations.palace_id
      and p.user_id = auth.uid()
  )
);

-- ============================================================
-- STUDY PLAN POLICIES
-- ============================================================

create policy "Users can manage own study plans"
on public.study_plans for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Users can manage own study plan tasks"
on public.study_plan_tasks for all
using (
  exists (
    select 1
    from public.study_plans p
    where p.id = study_plan_tasks.plan_id
      and p.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.study_plans p
    where p.id = study_plan_tasks.plan_id
      and p.user_id = auth.uid()
  )
);

-- ============================================================
-- STUDY SESSION POLICIES
-- ============================================================

create policy "Users can manage own study sessions"
on public.study_sessions for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- ============================================================
-- QUIZ POLICIES
-- ============================================================

create policy "Users can manage own quizzes"
on public.quizzes for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Users can manage own quiz questions"
on public.quiz_questions for all
using (
  exists (
    select 1
    from public.quizzes q
    where q.id = quiz_questions.quiz_id
      and q.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.quizzes q
    where q.id = quiz_questions.quiz_id
      and q.user_id = auth.uid()
  )
);

create policy "Users can manage own quiz attempts"
on public.quiz_attempts for all
using (user_id = auth.uid())
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.quizzes q
    where q.id = quiz_attempts.quiz_id
      and q.user_id = auth.uid()
  )
);

create policy "Users can manage own quiz answers"
on public.quiz_answers for all
using (
  exists (
    select 1
    from public.quiz_attempts a
    where a.id = quiz_answers.attempt_id
      and a.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.quiz_attempts a
    where a.id = quiz_answers.attempt_id
      and a.user_id = auth.uid()
  )
);

-- ============================================================
-- EXAM POLICIES
-- ============================================================

create policy "Users can manage own exams"
on public.exams for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- ============================================================
-- CONVERSATION POLICIES
-- ============================================================

create policy "Users can manage own conversations"
on public.conversations for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Users can manage own messages"
on public.messages for all
using (
  exists (
    select 1
    from public.conversations c
    where c.id = messages.conversation_id
      and c.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.conversations c
    where c.id = messages.conversation_id
      and c.user_id = auth.uid()
  )
);

-- ============================================================
-- NOTIFICATION POLICIES
-- ============================================================

create policy "Users can manage own notifications"
on public.notifications for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- ============================================================
-- SUBSCRIPTION POLICIES
-- ============================================================

create policy "Users can view own subscription"
on public.subscriptions for select
using (user_id = auth.uid());

-- ============================================================
-- GAMIFICATION POLICIES
-- ============================================================

create policy "Users can view own gamification"
on public.gamification for select
using (user_id = auth.uid());

create policy "Users can create own gamification"
on public.gamification for insert
with check (user_id = auth.uid());

create policy "Users can update own gamification"
on public.gamification for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- ============================================================
-- ACHIEVEMENT POLICIES
-- ============================================================

create policy "Authenticated users can view achievements"
on public.achievements for select
to authenticated
using (true);

create policy "Users can view own achievements"
on public.user_achievements for select
using (user_id = auth.uid());

create policy "Users can unlock own achievements"
on public.user_achievements for insert
with check (user_id = auth.uid());

-- ============================================================
-- DEFAULT ACHIEVEMENTS
-- ============================================================

insert into public.achievements (id, title, description)
values
  ('streak3', 'Three-day focus', 'Studied three days in a row.'),
  ('xp500', 'First 500 XP', 'Built a real study rhythm.')
on conflict (id) do nothing;

-- ============================================================
-- AUTO-CREATE USER DATA AFTER SIGNUP
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin

  insert into public.profiles (
    user_id,
    full_name
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (user_id) do nothing;

  insert into public.user_settings (
    user_id
  )
  values (
    new.id
  )
  on conflict (user_id) do nothing;

  insert into public.subscriptions (
    user_id
  )
  values (
    new.id
  )
  on conflict (user_id) do nothing;

  insert into public.gamification (
    user_id
  )
  values (
    new.id
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- ============================================================
-- FINISHED
-- ============================================================